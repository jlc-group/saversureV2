package inventory

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

func (h *Handler) CreateReward(c *gin.Context) {
	var input CreateRewardInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_error", "message": err.Error()})
		return
	}

	reward, err := h.svc.CreateReward(c.Request.Context(), c.GetString("tenant_id"), input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, reward)
}

func (h *Handler) List(c *gin.Context) {
	rewards, err := h.svc.List(c.Request.Context(), c.GetString("tenant_id"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": rewards})
}

func (h *Handler) UpdateInventory(c *gin.Context) {
	var input UpdateInventoryInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_error", "message": err.Error()})
		return
	}

	reward, err := h.svc.UpdateInventory(c.Request.Context(), c.GetString("tenant_id"), c.Param("id"), input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, reward)
}
