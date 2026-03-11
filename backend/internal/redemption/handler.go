package redemption

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"saversure/internal/coupon"
	"saversure/internal/inventory"
	"saversure/internal/ledger"
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

	result, err := h.svc.RedeemNow(
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
		if errors.Is(err, coupon.ErrNoCouponAvailable) {
			c.JSON(http.StatusConflict, gin.H{
				"error":   "no_coupon_available",
				"message": "Coupon code is not available for this reward",
			})
			return
		}
		if errors.Is(err, ErrDefaultAddressRequired) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "default_address_required",
				"message": "Please set a default shipping address before redeeming this reward",
			})
			return
		}
		if errors.Is(err, ErrAddressNotFound) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "address_not_found",
				"message": "Selected shipping address was not found",
			})
			return
		}
		if errors.Is(err, ledger.ErrInsufficientBalance) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "insufficient_balance",
				"message": err.Error(),
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "redemption_failed", "message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, result)
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
