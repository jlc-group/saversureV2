package batch

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) Create(c *gin.Context) {
	var input CreateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_error", "message": err.Error()})
		return
	}

	batch, err := h.svc.Create(c.Request.Context(), c.GetString("tenant_id"), c.GetString("user_id"), input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, batch)
}

func (h *Handler) List(c *gin.Context) {
	batches, err := h.svc.List(c.Request.Context(), c.GetString("tenant_id"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": batches})
}

func (h *Handler) UpdateStatus(c *gin.Context) {
	var input struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_error", "message": err.Error()})
		return
	}

	batch, err := h.svc.UpdateStatus(c.Request.Context(), c.GetString("tenant_id"), c.Param("id"), input.Status)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_transition", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, batch)
}

func (h *Handler) Recall(c *gin.Context) {
	var input struct {
		Reason string `json:"reason" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_error", "message": err.Error()})
		return
	}

	batch, err := h.svc.Recall(c.Request.Context(), c.GetString("tenant_id"), c.Param("id"), input.Reason, c.GetString("user_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "recall_failed", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, batch)
}
