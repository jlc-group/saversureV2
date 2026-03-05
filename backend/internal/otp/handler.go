package otp

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

func (h *Handler) Request(c *gin.Context) {
	var body struct {
		Phone string `json:"phone" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "phone is required"})
		return
	}

	otpID, refCode, err := h.svc.RequestOTP(c.Request.Context(), body.Phone)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"otp_id":      otpID,
		"ref_code":    refCode,
		"expires_in":  300,
	})
}

func (h *Handler) Verify(c *gin.Context) {
	var body struct {
		OTPID   string `json:"otp_id" binding:"required"`
		OTPCode string `json:"otp_code" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "otp_id and otp_code are required"})
		return
	}

	ok, err := h.svc.VerifyOTP(c.Request.Context(), body.OTPID, body.OTPCode)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": ok})
}
