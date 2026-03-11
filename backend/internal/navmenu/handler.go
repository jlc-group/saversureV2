package navmenu

import (
	"net/http"

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
	menus, err := h.svc.List(c.Request.Context(), tenantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if menus == nil {
		menus = []NavMenu{}
	}
	c.JSON(http.StatusOK, gin.H{"data": menus})
}

func (h *Handler) GetByType(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	menuType := c.Param("type")
	m, err := h.svc.GetByType(c.Request.Context(), tenantID, menuType)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"items": []MenuItem{}})
		return
	}
	c.JSON(http.StatusOK, m)
}

func (h *Handler) Upsert(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	var input UpsertInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	input.TenantID = tenantID
	m, err := h.svc.Upsert(c.Request.Context(), input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, m)
}

func (h *Handler) Delete(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	menuType := c.Param("type")
	if err := h.svc.Delete(c.Request.Context(), tenantID, menuType); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

func (h *Handler) GetPublic(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	menuType := c.Param("type")
	m, err := h.svc.GetByType(c.Request.Context(), tenantID, menuType)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"items": []MenuItem{}})
		return
	}
	c.JSON(http.StatusOK, gin.H{"items": m.Items})
}
