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

func (h *Handler) Lookup(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_error", "message": "code query parameter is required"})
		return
	}
	result, err := h.svc.Lookup(c.Request.Context(), c.GetString("tenant_id"), code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "lookup_failed", "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, result)
}

func (h *Handler) ResolveRef1(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_error", "message": "code query parameter is required"})
		return
	}
	tenantID := c.GetString("tenant_id")
	if tenantID == "" {
		tenantID = c.GetHeader("X-Tenant-ID")
	}
	if tenantID == "" {
		tid, err := h.svc.ResolveTenantFromCode(c.Request.Context(), code)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "not_found", "message": "Code not found"})
			return
		}
		tenantID = tid
	}
	result, err := h.svc.ResolveRef1(c.Request.Context(), tenantID, code)
	if err != nil {
		if errors.Is(err, ErrInvalidCode) || errors.Is(err, ErrBatchNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "not_found", "message": "Code not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "resolve_failed", "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, result)
}

func (h *Handler) Scan(c *gin.Context) {
	var input ScanInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_error", "message": err.Error()})
		return
	}
	if input.Code == "" && input.Ref1 == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_error", "message": "Either code or ref1 is required"})
		return
	}
	if input.Code != "" && input.Ref1 != "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_error", "message": "Provide either code or ref1, not both"})
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
		case errors.Is(err, ErrDailyQuotaExceeded):
			c.JSON(http.StatusTooManyRequests, gin.H{"error": "quota_exceeded", "message": "Daily scan quota exceeded"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "scan_failed"})
		}
		return
	}

	c.JSON(http.StatusOK, result)
}
