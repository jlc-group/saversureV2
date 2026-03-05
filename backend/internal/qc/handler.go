package qc

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"saversure/pkg/codegen"
)

type Handler struct {
	db *pgxpool.Pool
}

func NewHandler(db *pgxpool.Pool) *Handler {
	return &Handler{db: db}
}

// Verify validates ref2 (13-digit running number QC code) and returns batch-product info
func (h *Handler) Verify(c *gin.Context) {
	ref2 := c.Query("ref2")
	if ref2 == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ref2_required", "message": "ref2 query parameter is required"})
		return
	}

	if !codegen.ValidateRef2Checksum(ref2) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_ref2", "message": "Invalid ref2 checksum"})
		return
	}

	tenantID := c.GetString("tenant_id")
	result, err := h.resolveRef2(c.Request.Context(), tenantID, ref2)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not_found", "message": "No batch found for this ref2"})
		return
	}

	c.JSON(http.StatusOK, result)
}
