package campaign

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

	campaign, err := h.svc.Create(c.Request.Context(), c.GetString("tenant_id"), c.GetString("user_id"), input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, campaign)
}

func (h *Handler) List(c *gin.Context) {
	campaigns, err := h.svc.List(c.Request.Context(), c.GetString("tenant_id"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_error", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": campaigns})
}

func (h *Handler) GetByID(c *gin.Context) {
	campaign, err := h.svc.GetByID(c.Request.Context(), c.GetString("tenant_id"), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not_found"})
		return
	}

	c.JSON(http.StatusOK, campaign)
}

func (h *Handler) Update(c *gin.Context) {
	var input UpdateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_error", "message": err.Error()})
		return
	}

	campaign, err := h.svc.Update(c.Request.Context(), c.GetString("tenant_id"), c.Param("id"), input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, campaign)
}

func (h *Handler) Publish(c *gin.Context) {
	campaign, err := h.svc.Publish(c.Request.Context(), c.GetString("tenant_id"), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot_publish", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, campaign)
}
