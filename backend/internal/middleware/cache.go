package middleware

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

// CacheResponse caches GET responses in Redis
func CacheResponse(rdb *redis.Client, prefix string, ttl time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.Method != "GET" {
			c.Next()
			return
		}

		key := prefix + ":" + c.Request.URL.RequestURI()
		tenantID := c.GetString("tenant_id")
		if tenantID != "" {
			key = prefix + ":" + tenantID + ":" + c.Request.URL.RequestURI()
		}

		// Check cache
		cached, err := rdb.Get(context.Background(), key).Bytes()
		if err == nil {
			c.Data(http.StatusOK, "application/json", cached)
			c.Abort()
			return
		}

		// Use a response writer wrapper to capture the response
		writer := &responseCapture{ResponseWriter: c.Writer, body: []byte{}}
		c.Writer = writer

		c.Next()

		// Cache only successful responses
		if c.Writer.Status() == http.StatusOK && len(writer.body) > 0 {
			rdb.Set(context.Background(), key, writer.body, ttl)
		}
	}
}

type responseCapture struct {
	gin.ResponseWriter
	body []byte
}

func (w *responseCapture) Write(b []byte) (int, error) {
	w.body = append(w.body, b...)
	return w.ResponseWriter.Write(b)
}

// InvalidateCache removes cached entries by prefix pattern
func InvalidateCache(rdb *redis.Client, pattern string) {
	ctx := context.Background()
	iter := rdb.Scan(ctx, 0, pattern+"*", 100).Iterator()
	for iter.Next(ctx) {
		rdb.Del(ctx, iter.Val())
	}
}
