package reward

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"saversure/internal/apperror"
)

type Handler struct {
	svc *Service
}

func NewHandler(db *pgxpool.Pool) *Handler {
	return &Handler{svc: NewService(db)}
}

// GetDetail returns full reward detail (public consumer route).
// GET /:id
func (h *Handler) GetDetail(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	rewardID := c.Param("id")

	detail, err := h.svc.GetDetail(c.Request.Context(), tenantID, rewardID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, detail)
}

// ListPublic returns rewards available to consumers (public consumer route).
// GET with query params: tier_id, limit, offset
func (h *Handler) ListPublic(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	var tierID *string
	if t := c.Query("tier_id"); t != "" {
		tierID = &t
	}

	items, total, err := h.svc.ListPublic(c.Request.Context(), tenantID, tierID, limit, offset)
	if err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": items, "total": total})
}
