package transaction

import (
	"encoding/csv"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Handler struct {
	svc *Service
}

func NewHandler(db *pgxpool.Pool) *Handler {
	return &Handler{svc: NewService(db)}
}

func (h *Handler) List(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	status := c.Query("status")

	txns, total, err := h.svc.List(c.Request.Context(), tenantID, ListFilter{
		Status: status,
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": txns, "total": total})
}

func (h *Handler) ListMine(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	userID := c.GetString("user_id")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	status := c.Query("status")

	txns, total, err := h.svc.ListMine(c.Request.Context(), tenantID, userID, ListFilter{
		Status: status,
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": txns, "total": total})
}

func (h *Handler) UpdateStatus(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	id := c.Param("id")

	var input struct {
		Status   string `json:"status" binding:"required"`
		Tracking string `json:"tracking"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	txn, err := h.svc.UpdateStatus(c.Request.Context(), tenantID, id, input.Status, input.Tracking)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, txn)
}

func (h *Handler) ExportCSV(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	status := c.Query("status")

	// Fetch all transactions (no pagination for export)
	txns, _, err := h.svc.List(c.Request.Context(), tenantID, ListFilter{Status: status, Limit: 10000, Offset: 0})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Write CSV
	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", `attachment; filename="transactions.csv"`)

	writer := csv.NewWriter(c.Writer)
	writer.Write([]string{"ID", "User ID", "Reward ID", "Reward Name", "Status", "Tracking", "Delivery Type", "Coupon Code", "Expires At", "Created At"})
	for _, t := range txns {
		rewardName := ""
		if t.RewardName != nil {
			rewardName = *t.RewardName
		}
		tracking := ""
		if t.Tracking != nil {
			tracking = *t.Tracking
		}
		deliveryType := ""
		if t.DeliveryType != nil {
			deliveryType = *t.DeliveryType
		}
		couponCode := ""
		if t.CouponCode != nil {
			couponCode = *t.CouponCode
		}
		writer.Write([]string{t.ID, t.UserID, t.RewardID, rewardName, t.Status, tracking, deliveryType, couponCode, t.ExpiresAt, t.CreatedAt})
	}
	writer.Flush()
}
