package export

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	svc     *Service
	apiBase string
}

func NewHandler(svc *Service, apiBase string) *Handler {
	return &Handler{svc: svc, apiBase: apiBase}
}

func (h *Handler) Create(c *gin.Context) {
	var input CreateExportInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_error", "message": err.Error()})
		return
	}

	tenantID := c.GetString("tenant_id")
	actorID := c.GetString("user_id")

	result, err := h.svc.CreateExport(c.Request.Context(), tenantID, actorID, h.apiBase, input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "export_failed", "message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, result)
}

func (h *Handler) Download(c *gin.Context) {
	token := c.Param("token")

	reader, fileName, contentType, err := h.svc.Download(c.Request.Context(), token)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not_found", "message": err.Error()})
		return
	}
	defer reader.Close()

	c.Header("Content-Type", contentType)
	c.Header("Content-Disposition", "attachment; filename="+fileName)
	c.Status(http.StatusOK)

	buf := make([]byte, 32*1024)
	for {
		n, readErr := reader.Read(buf)
		if n > 0 {
			c.Writer.Write(buf[:n])
		}
		if readErr != nil {
			break
		}
	}
}

func (h *Handler) SampleCodes(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	rollID := c.Param("id")
	count, _ := strconv.Atoi(c.DefaultQuery("count", "5"))

	codes, err := h.svc.SampleCodes(c.Request.Context(), tenantID, rollID, count)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "sample_failed", "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"codes": codes})
}

func (h *Handler) List(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	batchID := c.Query("batch_id")
	factoryID := c.Query("factory_id")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	logs, total, err := h.svc.List(c.Request.Context(), tenantID, batchID, factoryID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": logs, "total": total})
}
