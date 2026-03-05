package batch

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"saversure/pkg/codegen"
)

type Handler struct {
	svc *Service
	db  *pgxpool.Pool
}

func NewHandler(svc *Service, db *pgxpool.Pool) *Handler {
	return &Handler{svc: svc, db: db}
}

func (h *Handler) Create(c *gin.Context) {
	var input CreateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_error", "message": err.Error()})
		return
	}

	batch, err := h.svc.Create(c.Request.Context(), c.GetString("tenant_id"), c.GetString("user_id"), input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, batch)
}

func (h *Handler) List(c *gin.Context) {
	batches, err := h.svc.List(c.Request.Context(), c.GetString("tenant_id"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": batches})
}

func (h *Handler) UpdateStatus(c *gin.Context) {
	var input struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_error", "message": err.Error()})
		return
	}

	batch, err := h.svc.UpdateStatus(c.Request.Context(), c.GetString("tenant_id"), c.Param("id"), input.Status)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_transition", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, batch)
}

func (h *Handler) Recall(c *gin.Context) {
	var input struct {
		Reason string `json:"reason" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_error", "message": err.Error()})
		return
	}

	batch, err := h.svc.Recall(c.Request.Context(), c.GetString("tenant_id"), c.Param("id"), input.Reason, c.GetString("user_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "recall_failed", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, batch)
}

// Export generates CSV/JSON export for batch (for printer)
func (h *Handler) Export(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	batchID := c.Param("id")
	format := c.DefaultQuery("format", "csv")

	batch, err := h.svc.GetByID(c.Request.Context(), tenantID, batchID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "batch_not_found"})
		return
	}

	tenantSettings := h.fetchTenantSettings(c, tenantID)
	campaignSettings := h.fetchCampaignSettings(c, batch.CampaignID, tenantID)
	cfg := codegen.ConfigFromTenantSettings(tenantSettings).MergeWith(codegen.ConfigFromCampaignSettings(campaignSettings))

	lotSize := cfg.LotSize
	if lotSize <= 0 {
		lotSize = 10000
	}

	if v := c.Query("lot_size"); v != "" {
		n, parseErr := strconv.ParseInt(v, 10, 64)
		if parseErr != nil || n <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "validation_error", "message": "lot_size must be positive integer"})
			return
		}
		lotSize = n
	}

	startSerial := int64(0)
	endSerial := int64(0)
	if v := c.Query("start_serial"); v != "" {
		n, parseErr := strconv.ParseInt(v, 10, 64)
		if parseErr != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "validation_error", "message": "start_serial must be integer"})
			return
		}
		startSerial = n
	}
	if v := c.Query("end_serial"); v != "" {
		n, parseErr := strconv.ParseInt(v, 10, 64)
		if parseErr != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "validation_error", "message": "end_serial must be integer"})
			return
		}
		endSerial = n
	}

	// roll has priority over explicit start/end
	roll := int64(0)
	if v := c.Query("roll"); v != "" {
		n, parseErr := strconv.ParseInt(v, 10, 64)
		if parseErr != nil || n <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "validation_error", "message": "roll must be positive integer"})
			return
		}
		roll = n
		startSerial = batch.SerialStart + (roll-1)*lotSize
		endSerial = startSerial + lotSize - 1
		if startSerial > batch.SerialEnd {
			c.JSON(http.StatusBadRequest, gin.H{"error": "validation_error", "message": "roll is out of range for this batch"})
			return
		}
		if endSerial > batch.SerialEnd {
			endSerial = batch.SerialEnd
		}
	}
	if startSerial == 0 {
		startSerial = batch.SerialStart
	}
	if endSerial == 0 {
		endSerial = batch.SerialEnd
	}

	records, err := h.svc.ExportCodes(c.Request.Context(), tenantID, batchID, tenantSettings, campaignSettings, ExportOptions{
		StartSerial: startSerial,
		EndSerial:   endSerial,
		LotSize:     lotSize,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "export_failed", "message": err.Error()})
		return
	}

	switch format {
	case "json":
		c.JSON(http.StatusOK, gin.H{
			"data":  records,
			"total": len(records),
			"meta": gin.H{
				"lot_size":     lotSize,
				"roll":         roll,
				"start_serial": startSerial,
				"end_serial":   endSerial,
			},
		})
	case "csv":
		c.Header("Content-Type", "text/csv; charset=utf-8")
		fileName := "batch_export.csv"
		if roll > 0 {
			fileName = "batch_roll_" + strconv.FormatInt(roll, 10) + ".csv"
		}
		c.Header("Content-Disposition", "attachment; filename="+fileName)
		c.String(http.StatusOK, codegen.RecordsToCSV(records))
	default:
		c.JSON(http.StatusOK, gin.H{"data": records, "total": len(records)})
	}
}

func (h *Handler) fetchTenantSettings(c *gin.Context, tenantID string) map[string]any {
	var raw []byte
	err := h.db.QueryRow(c.Request.Context(), `SELECT COALESCE(settings, '{}'::jsonb)::text FROM tenants WHERE id = $1`, tenantID).Scan(&raw)
	if err != nil {
		return nil
	}
	var settings map[string]any
	_ = json.Unmarshal(raw, &settings)
	return settings
}

func (h *Handler) fetchCampaignSettings(c *gin.Context, campaignID, tenantID string) map[string]any {
	var raw []byte
	err := h.db.QueryRow(c.Request.Context(), `SELECT COALESCE(settings, '{}'::jsonb)::text FROM campaigns WHERE id = $1 AND tenant_id = $2`, campaignID, tenantID).Scan(&raw)
	if err != nil {
		return nil
	}
	var settings map[string]any
	_ = json.Unmarshal(raw, &settings)
	return settings
}
