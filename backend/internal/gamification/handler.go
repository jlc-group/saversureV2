package gamification

import (
	"net/http"
	"strconv"

	"saversure/internal/apperror"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Handler struct {
	svc *Service
}

func NewHandler(db *pgxpool.Pool) *Handler {
	return &Handler{svc: NewService(db)}
}

func (h *Handler) ListMissions(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	items, err := h.svc.ListMissions(c.Request.Context(), tenantID, false)
	if err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": items})
}

func (h *Handler) ListActiveMissions(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	items, err := h.svc.ListMissions(c.Request.Context(), tenantID, true)
	if err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": items})
}

func (h *Handler) GetMission(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	id := c.Param("id")

	m, err := h.svc.GetMissionByID(c.Request.Context(), tenantID, id)
	if err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusOK, m)
}

func (h *Handler) CreateMission(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	var input CreateMissionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		apperror.Respond(c, err)
		return
	}
	input.TenantID = tenantID

	m, err := h.svc.CreateMission(c.Request.Context(), input)
	if err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusCreated, m)
}

func (h *Handler) UpdateMission(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	id := c.Param("id")

	var body struct {
		Active *bool `json:"active"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		apperror.Respond(c, err)
		return
	}

	if err := h.svc.UpdateMission(c.Request.Context(), tenantID, id, body.Active); err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "updated"})
}

func (h *Handler) DeleteMission(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	id := c.Param("id")

	if err := h.svc.DeleteMission(c.Request.Context(), tenantID, id); err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

func (h *Handler) GetUserMissions(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	userID := c.GetString("user_id")

	items, err := h.svc.GetUserMissions(c.Request.Context(), tenantID, userID)
	if err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": items})
}

func (h *Handler) ListBadges(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	items, err := h.svc.ListBadges(c.Request.Context(), tenantID)
	if err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": items})
}

func (h *Handler) CreateBadge(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	var input CreateBadgeInput
	if err := c.ShouldBindJSON(&input); err != nil {
		apperror.Respond(c, err)
		return
	}
	input.TenantID = tenantID

	b, err := h.svc.CreateBadge(c.Request.Context(), input)
	if err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusCreated, b)
}

func (h *Handler) DeleteBadge(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	id := c.Param("id")

	if err := h.svc.DeleteBadge(c.Request.Context(), tenantID, id); err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

func (h *Handler) GetUserBadges(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	userID := c.GetString("user_id")

	items, err := h.svc.GetUserBadges(c.Request.Context(), tenantID, userID)
	if err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": items})
}

func (h *Handler) GetLeaderboard(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	period := c.DefaultQuery("period", "monthly")
	periodKey := c.DefaultQuery("period_key", "")
	category := c.DefaultQuery("category", "scans")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	items, err := h.svc.GetLeaderboard(c.Request.Context(), tenantID, period, periodKey, category, limit)
	if err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": items})
}
