package middleware

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

func RateLimit(rdb *redis.Client, prefix string, maxRequests int, window time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Rate limit by user ID if authenticated, otherwise by IP
		identifier := c.GetString("user_id")
		if identifier == "" {
			identifier = c.ClientIP()
		}

		key := fmt.Sprintf("rl:%s:%s", prefix, identifier)
		ctx := context.Background()

		count, err := rdb.Incr(ctx, key).Result()
		if err != nil {
			c.Next()
			return
		}

		if count == 1 {
			rdb.Expire(ctx, key, window)
		}

		c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", maxRequests))
		c.Header("X-RateLimit-Remaining", fmt.Sprintf("%d", max(0, int64(maxRequests)-count)))

		if count > int64(maxRequests) {
			ttl, _ := rdb.TTL(ctx, key).Result()
			c.Header("Retry-After", fmt.Sprintf("%d", int(ttl.Seconds())))
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error":   "rate_limit_exceeded",
				"message": "Too many requests. Please wait and try again.",
			})
			return
		}

		c.Next()
	}
}
