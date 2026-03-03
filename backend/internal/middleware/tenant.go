package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// TenantIsolation extracts tenant_id from the JWT claims (set by auth middleware)
// and makes it available to downstream handlers. All DB queries should filter by this.
func TenantIsolation() gin.HandlerFunc {
	return func(c *gin.Context) {
		tenantID := c.GetString("tenant_id")
		if tenantID == "" {
			// Also check header for API clients
			tenantID = c.GetHeader("X-Tenant-ID")
		}

		if tenantID == "" {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
				"error":   "missing_tenant",
				"message": "Tenant context is required",
			})
			return
		}

		c.Set("tenant_id", tenantID)
		c.Next()
	}
}
