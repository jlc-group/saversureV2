package transaction

import (
	"encoding/csv"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"saversure/internal/apperror"
)

type Handler struct {
	svc *Service
}

func NewHandler(db *pgxpool.Pool) *Handler {
	return &Handler{svc: NewService(db)}
}

func parseFilter(c *gin.Context) ListFilter {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	return ListFilter{
		Status:       c.Query("status"),
		Search:       c.Query("search"),
		DateFrom:     c.Query("date_from"),
		DateTo:       c.Query("date_to"),
		DeliveryType: c.Query("delivery_type"),
		RewardID:     c.Query("reward_id"),
		SortBy:       c.Query("sort_by"),
		SortDir:      c.Query("sort_dir"),
		Limit:        limit,
		Offset:       offset,
	}
}

func (h *Handler) List(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	f := parseFilter(c)

	txns, total, err := h.svc.List(c.Request.Context(), tenantID, f)
	if err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": txns, "total": total})
}

func (h *Handler) Summary(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	f := parseFilter(c)

	counts, err := h.svc.Summary(c.Request.Context(), tenantID, f)
	if err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": counts})
}

func (h *Handler) ListMine(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	userID := c.GetString("user_id")
	f := parseFilter(c)

	txns, total, err := h.svc.ListMine(c.Request.Context(), tenantID, userID, f)
	if err != nil {
		apperror.Respond(c, err)
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
		apperror.RespondValidation(c, err.Error())
		return
	}

	txn, err := h.svc.UpdateStatus(c.Request.Context(), tenantID, id, input.Status, input.Tracking)
	if err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusOK, txn)
}

func ptrStr(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

func (h *Handler) ExportCSV(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	f := parseFilter(c)
	f.Limit = 10000
	f.Offset = 0

	txns, _, err := h.svc.List(c.Request.Context(), tenantID, f)
	if err != nil {
		apperror.Respond(c, err)
		return
	}

	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", `attachment; filename="transactions.csv"`)

	writer := csv.NewWriter(c.Writer)
	writer.Write([]string{
		"ID", "User ID", "User Name", "User Phone", "Reward ID", "Reward Name", "Reward Image URL",
		"Status", "Tracking", "Delivery Type", "Coupon Code",
		"Recipient Name", "Recipient Phone",
		"Address Line 1", "Address Line 2", "District", "Sub District", "Province", "Postal Code",
		"Expires At", "Created At",
	})
	for _, t := range txns {
		writer.Write([]string{
			t.ID, t.UserID, ptrStr(t.UserName), ptrStr(t.UserPhone),
			t.RewardID, ptrStr(t.RewardName), ptrStr(t.RewardImageURL),
			t.Status, ptrStr(t.Tracking), ptrStr(t.DeliveryType), ptrStr(t.CouponCode),
			ptrStr(t.RecipientName), ptrStr(t.RecipientPhone),
			ptrStr(t.AddressLine1), ptrStr(t.AddressLine2),
			ptrStr(t.District), ptrStr(t.SubDistrict), ptrStr(t.Province), ptrStr(t.PostalCode),
			t.ExpiresAt, t.CreatedAt,
		})
	}
	writer.Flush()
}
