package scanhistory

import (
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

func (h *Handler) List(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	legacyQRCodeID, _ := strconv.ParseInt(c.Query("legacy_qr_code_id"), 10, 64)
	status := c.Query("status")
	scanType := c.Query("scan_type") // success, duplicate_self, duplicate_other
	batchID := c.Query("batch_id")
	codeID := c.Query("code_id")   // by-code view: all scan attempts for one code
	legacySerial := c.Query("legacy_serial")
	sortBy := c.Query("sort_by")   // column key (see allowedSortColumns)
	sortDir := c.Query("sort_dir") // asc | desc

	if codeID != "" {
		entries, err := h.svc.ListByCodeID(c.Request.Context(), tenantID, codeID)
		if err != nil {
			apperror.Respond(c, err)
			return
		}
		c.JSON(http.StatusOK, gin.H{"data": entries, "total": len(entries)})
		return
	}

	entries, total, err := h.svc.List(c.Request.Context(), tenantID, ListFilter{
		Status:   status,
		ScanType: scanType,
		BatchID:  batchID,
		CodeID:   codeID,
		LegacySerial: legacySerial,
		LegacyQRCodeID: legacyQRCodeID,
		SortBy:   sortBy,
		SortDir:  sortDir,
		Limit:    limit,
		Offset:   offset,
	})
	if err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": entries, "total": total})
}

// GetAlerts returns codes with duplicate scans (suspicious / for monitoring).
func (h *Handler) GetAlerts(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	list, err := h.svc.ListSuspicious(c.Request.Context(), tenantID, limit)
	if err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": list})
}

// GetMyScans returns the authenticated consumer's own scan history with product info.
func (h *Handler) GetMyScans(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	entries, total, err := h.svc.ListByUser(c.Request.Context(), tenantID, userID, limit, offset)
	if err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": entries, "total": total})
}

func (h *Handler) GetByID(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	id := c.Param("id")

	entry, err := h.svc.GetByID(c.Request.Context(), tenantID, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, entry)
}
