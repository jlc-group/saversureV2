package redemption

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"saversure/internal/inventory"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) Redeem(c *gin.Context) {
	var input RedeemInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_error", "message": err.Error()})
		return
	}

	idempotencyKey := c.GetHeader("Idempotency-Key")

	reservation, err := h.svc.Reserve(
		c.Request.Context(),
		c.GetString("tenant_id"),
		c.GetString("user_id"),
		input,
		idempotencyKey,
	)
	if err != nil {
		if errors.Is(err, inventory.ErrOutOfStock) {
			c.JSON(http.StatusConflict, gin.H{
				"error":   "out_of_stock",
				"message": "This reward is no longer available",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "redemption_failed", "message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, reservation)
}

func (h *Handler) Confirm(c *gin.Context) {
	reservation, err := h.svc.Confirm(
		c.Request.Context(),
		c.GetString("tenant_id"),
		c.GetString("user_id"),
		c.Param("id"),
	)
	if err != nil {
		if errors.Is(err, ErrReservationNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "not_found"})
			return
		}
		if errors.Is(err, ErrReservationExpired) {
			c.JSON(http.StatusGone, gin.H{"error": "reservation_expired", "message": "Your reservation has expired. Please try again."})
			return
		}
		if errors.Is(err, ErrAlreadyConfirmed) {
			c.JSON(http.StatusConflict, gin.H{"error": "already_confirmed"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "confirm_failed", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, reservation)
}
