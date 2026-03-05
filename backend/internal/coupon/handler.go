package coupon

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

type ImportInput struct {
	RewardID string   `json:"reward_id" binding:"required"`
	Codes    []string `json:"codes" binding:"required"`
}

// Import POST - bulk import coupon codes. Admin only.
func (h *Handler) Import(c *gin.Context) {
	var input ImportInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_error", "message": err.Error()})
		return
	}

	tenantID := c.GetString("tenant_id")
	if tenantID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized", "message": "tenant_id required"})
		return
	}

	imported, err := h.svc.BulkImport(c.Request.Context(), tenantID, input.RewardID, input.Codes)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"imported": imported,
		"total":    len(input.Codes),
	})
}

// List GET - list coupon codes for a reward. Query params: reward_id, limit, offset. Admin only.
func (h *Handler) List(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	if tenantID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized", "message": "tenant_id required"})
		return
	}

	rewardID := c.Query("reward_id")
	if rewardID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_error", "message": "reward_id is required"})
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	coupons, err := h.svc.ListByReward(c.Request.Context(), tenantID, rewardID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": coupons})
}

// CountAvailable GET /:rewardId/available - count unclaimed codes. Admin only.
func (h *Handler) CountAvailable(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	if tenantID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized", "message": "tenant_id required"})
		return
	}

	rewardID := c.Param("rewardId")
	if rewardID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_error", "message": "reward_id is required"})
		return
	}

	count, err := h.svc.CountAvailable(c.Request.Context(), tenantID, rewardID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"available": count})
}

// DeleteUnclaimed DELETE /:rewardId/unclaimed - delete all unclaimed codes. Admin only.
func (h *Handler) DeleteUnclaimed(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	if tenantID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized", "message": "tenant_id required"})
		return
	}

	rewardID := c.Param("rewardId")
	if rewardID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_error", "message": "reward_id is required"})
		return
	}

	deleted, err := h.svc.DeleteUnclaimed(c.Request.Context(), tenantID, rewardID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"deleted": deleted})
}
