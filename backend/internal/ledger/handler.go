package ledger

import (
	"net/http"
	"strconv"

	"saversure/internal/apperror"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) GetBalance(c *gin.Context) {
	balance, err := h.svc.GetBalance(c.Request.Context(), c.GetString("tenant_id"), c.GetString("user_id"))
	if err != nil {
		apperror.Respond(c, err)
		return
	}

	c.JSON(http.StatusOK, balance)
}

func (h *Handler) GetHistory(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	entries, err := h.svc.GetHistory(c.Request.Context(), c.GetString("tenant_id"), c.GetString("user_id"), limit, offset)
	if err != nil {
		apperror.Respond(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": entries})
}

func (h *Handler) RefundPoints(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	adminUserID := c.GetString("user_id")

	var input struct {
		UserID string `json:"user_id" binding:"required"`
		Amount int    `json:"amount" binding:"required,min=1"`
		Reason string `json:"reason" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		apperror.Respond(c, err)
		return
	}

	entry, err := h.svc.RefundPoints(c.Request.Context(), tenantID, input.UserID, input.Amount, input.Reason, adminUserID)
	if err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusOK, entry)
}
