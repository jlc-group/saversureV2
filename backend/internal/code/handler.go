package code

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) Scan(c *gin.Context) {
	var input ScanInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_error", "message": err.Error()})
		return
	}

	result, err := h.svc.Scan(c.Request.Context(), c.GetString("tenant_id"), c.GetString("user_id"), input)
	if err != nil {
		switch {
		case errors.Is(err, ErrInvalidCode):
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_code", "message": "This QR code is not valid"})
		case errors.Is(err, ErrCodeUsed):
			c.JSON(http.StatusConflict, gin.H{"error": "code_used", "message": "This code has already been used"})
		case errors.Is(err, ErrBatchRecalled):
			c.JSON(http.StatusGone, gin.H{"error": "batch_recalled", "message": "This code is no longer valid"})
		case errors.Is(err, ErrBatchNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": "code_not_found", "message": "Code does not belong to any active campaign"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "scan_failed"})
		}
		return
	}

	c.JSON(http.StatusOK, result)
}
