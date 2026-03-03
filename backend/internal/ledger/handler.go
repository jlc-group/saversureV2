package ledger

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

func (h *Handler) GetBalance(c *gin.Context) {
	balance, err := h.svc.GetBalance(c.Request.Context(), c.GetString("tenant_id"), c.GetString("user_id"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_error"})
		return
	}

	c.JSON(http.StatusOK, balance)
}

func (h *Handler) GetHistory(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	entries, err := h.svc.GetHistory(c.Request.Context(), c.GetString("tenant_id"), c.GetString("user_id"), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": entries})
}
