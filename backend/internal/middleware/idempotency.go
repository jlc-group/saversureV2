package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

type cachedResponse struct {
	Status int             `json:"status"`
	Body   json.RawMessage `json:"body"`
}

// Idempotency enforces idempotent requests using the Idempotency-Key header.
// Results are cached in Redis for the specified TTL.
func Idempotency(rdb *redis.Client, ttl time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		key := c.GetHeader("Idempotency-Key")
		if key == "" {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
				"error":   "missing_idempotency_key",
				"message": "Idempotency-Key header is required for this endpoint",
			})
			return
		}

		cacheKey := "idem:" + c.GetString("tenant_id") + ":" + c.GetString("user_id") + ":" + key
		ctx := context.Background()

		cached, err := rdb.Get(ctx, cacheKey).Bytes()
		if err == nil {
			var resp cachedResponse
			if json.Unmarshal(cached, &resp) == nil {
				c.Data(resp.Status, "application/json", resp.Body)
				c.Abort()
				return
			}
		}

		// Use a custom response writer to capture the response
		writer := &idempotencyWriter{ResponseWriter: c.Writer}
		c.Writer = writer

		c.Next()

		if c.Writer.Status() >= 200 && c.Writer.Status() < 300 {
			resp := cachedResponse{
				Status: c.Writer.Status(),
				Body:   writer.body,
			}
			if data, err := json.Marshal(resp); err == nil {
				rdb.Set(ctx, cacheKey, data, ttl)
			}
		}
	}
}

type idempotencyWriter struct {
	gin.ResponseWriter
	body []byte
}

func (w *idempotencyWriter) Write(data []byte) (int, error) {
	w.body = append(w.body, data...)
	return w.ResponseWriter.Write(data)
}
