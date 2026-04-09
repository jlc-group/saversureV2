package middleware

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func CORS(allowedOrigins []string) gin.HandlerFunc {
	cfg := cors.Config{
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "X-Request-ID", "Idempotency-Key", "X-Tenant-ID"},
		ExposeHeaders:    []string{"X-Request-ID"},
		AllowCredentials: false,
		MaxAge:           86400,
	}

	if len(allowedOrigins) > 0 {
		cfg.AllowOrigins = allowedOrigins
	} else {
		// Fallback to allow all in development; set CORS_ORIGINS in production
		cfg.AllowAllOrigins = true
	}

	return cors.New(cfg)
}
