package roll

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

func (h *Handler) List(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	rolls, total, err := h.svc.List(c.Request.Context(), tenantID, ListFilter{
		Status:    c.Query("status"),
		BatchID:   c.Query("batch_id"),
		ProductID: c.Query("product_id"),
		Limit:     limit,
		Offset:    offset,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": rolls, "total": total})
}

func (h *Handler) GetByID(c *gin.Context) {
	r, err := h.svc.GetByID(c.Request.Context(), c.GetString("tenant_id"), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not_found"})
		return
	}
	c.JSON(http.StatusOK, r)
}

func (h *Handler) GetStats(c *gin.Context) {
	stats, err := h.svc.GetStats(c.Request.Context(), c.GetString("tenant_id"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_error", "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, stats)
}

func (h *Handler) MapProduct(c *gin.Context) {
	var input MapInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_error", "message": err.Error()})
		return
	}

	r, err := h.svc.MapProduct(c.Request.Context(), c.GetString("tenant_id"), c.Param("id"), c.GetString("user_id"), input)
	if err != nil {
		status := http.StatusBadRequest
		if err == ErrRollNotFound {
			status = http.StatusNotFound
		}
		c.JSON(status, gin.H{"error": "map_failed", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, r)
}

func (h *Handler) Unmap(c *gin.Context) {
	r, err := h.svc.Unmap(c.Request.Context(), c.GetString("tenant_id"), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "unmap_failed", "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, r)
}

func (h *Handler) QCReview(c *gin.Context) {
	var input QCInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_error", "message": err.Error()})
		return
	}

	r, err := h.svc.QCReview(c.Request.Context(), c.GetString("tenant_id"), c.Param("id"), c.GetString("user_id"), input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "qc_failed", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, r)
}

func (h *Handler) UpdateStatus(c *gin.Context) {
	var input struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_error", "message": err.Error()})
		return
	}

	r, err := h.svc.UpdateStatus(c.Request.Context(), c.GetString("tenant_id"), c.Param("id"), input.Status)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "status_failed", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, r)
}

func (h *Handler) BulkMap(c *gin.Context) {
	var input struct {
		RollIDs   []string `json:"roll_ids" binding:"required"`
		ProductID string   `json:"product_id" binding:"required"`
		FactoryID string   `json:"factory_id"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_error", "message": err.Error()})
		return
	}

	count, err := h.svc.BulkMap(c.Request.Context(), c.GetString("tenant_id"), c.GetString("user_id"),
		input.RollIDs, MapInput{ProductID: input.ProductID, FactoryID: input.FactoryID})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "bulk_map_failed", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"updated": count})
}

func (h *Handler) BulkUpdateStatus(c *gin.Context) {
	var input struct {
		RollIDs []string `json:"roll_ids" binding:"required"`
		Status  string   `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_error", "message": err.Error()})
		return
	}

	count, err := h.svc.BulkUpdateStatus(c.Request.Context(), c.GetString("tenant_id"), input.RollIDs, input.Status)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "bulk_status_failed", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"updated": count})
}
