package pageconfig

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Handler struct {
	svc     *Service
	history *HistoryService
}

func NewHandler(db *pgxpool.Pool) *Handler {
	return &Handler{svc: NewService(db), history: NewHistoryService(db)}
}

func (h *Handler) List(c *gin.Context) {
	tenantID := c.GetString("tenant_id")

	items, err := h.svc.List(c.Request.Context(), tenantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if items == nil {
		items = []PageConfig{}
	}
	c.JSON(http.StatusOK, gin.H{"data": items})
}

func (h *Handler) GetBySlug(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	slug := c.Param("slug")

	pc, err := h.svc.GetBySlug(c.Request.Context(), tenantID, slug)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, pc)
}

func (h *Handler) Upsert(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	userID := c.GetString("user_id")

	var input UpsertInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	input.TenantID = tenantID
	input.UserID = userID

	existing, _ := h.svc.GetBySlug(c.Request.Context(), tenantID, input.PageSlug)

	pc, err := h.svc.Upsert(c.Request.Context(), input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if existing != nil {
		_ = h.history.SaveSnapshot(c.Request.Context(), existing)
	}

	c.JSON(http.StatusOK, pc)
}

func (h *Handler) ListVersions(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	slug := c.Param("slug")

	versions, err := h.history.ListVersions(c.Request.Context(), tenantID, slug)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if versions == nil {
		versions = []VersionEntry{}
	}
	c.JSON(http.StatusOK, gin.H{"data": versions})
}

func (h *Handler) RestoreVersion(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	userID := c.GetString("user_id")
	slug := c.Param("slug")

	var body struct {
		Version int `json:"version" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	v, err := h.history.GetVersion(c.Request.Context(), tenantID, slug, body.Version)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	existing, _ := h.svc.GetBySlug(c.Request.Context(), tenantID, slug)
	if existing != nil {
		_ = h.history.SaveSnapshot(c.Request.Context(), existing)
	}

	pc, err := h.svc.Upsert(c.Request.Context(), UpsertInput{
		TenantID: tenantID,
		UserID:   userID,
		PageSlug: slug,
		Sections: v.Sections,
		Status:   v.Status,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, pc)
}

func (h *Handler) Duplicate(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	userID := c.GetString("user_id")

	var body struct {
		FromSlug string `json:"from_slug" binding:"required"`
		ToSlug   string `json:"to_slug" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	source, err := h.svc.GetBySlug(c.Request.Context(), tenantID, body.FromSlug)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "source page not found"})
		return
	}

	pc, err := h.svc.Upsert(c.Request.Context(), UpsertInput{
		TenantID: tenantID,
		UserID:   userID,
		PageSlug: body.ToSlug,
		Sections: source.Sections,
		Status:   "draft",
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, pc)
}

func (h *Handler) Delete(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	slug := c.Param("slug")

	if err := h.svc.Delete(c.Request.Context(), tenantID, slug); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

func (h *Handler) GetPublic(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	slug := c.Param("slug")

	pc, err := h.svc.GetPublished(c.Request.Context(), tenantID, slug)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"sections": []Section{}})
		return
	}
	c.JSON(http.StatusOK, gin.H{"sections": pc.Sections, "version": pc.Version})
}
