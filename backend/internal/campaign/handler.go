package campaign

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"

	"saversure/internal/apperror"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) Create(c *gin.Context) {
	var input CreateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		apperror.RespondValidation(c, err.Error())
		return
	}

	campaign, err := h.svc.Create(c.Request.Context(), c.GetString("tenant_id"), c.GetString("user_id"), input)
	if err != nil {
		apperror.Respond(c, err)
		return
	}

	c.JSON(http.StatusCreated, campaign)
}

func (h *Handler) List(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	campaigns, total, err := h.svc.List(c.Request.Context(), c.GetString("tenant_id"), limit, offset)
	if err != nil {
		apperror.Respond(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": campaigns, "total": total})
}

func (h *Handler) GetByID(c *gin.Context) {
	campaign, err := h.svc.GetByID(c.Request.Context(), c.GetString("tenant_id"), c.Param("id"))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			apperror.RespondNotFound(c, "campaign_not_found")
			return
		}
		apperror.Respond(c, err)
		return
	}

	c.JSON(http.StatusOK, campaign)
}

func (h *Handler) Update(c *gin.Context) {
	var input UpdateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		apperror.RespondValidation(c, err.Error())
		return
	}

	campaign, err := h.svc.Update(c.Request.Context(), c.GetString("tenant_id"), c.Param("id"), input)
	if err != nil {
		apperror.Respond(c, err)
		return
	}

	c.JSON(http.StatusOK, campaign)
}

func (h *Handler) Publish(c *gin.Context) {
	campaign, err := h.svc.Publish(c.Request.Context(), c.GetString("tenant_id"), c.Param("id"))
	if err != nil {
		apperror.Respond(c, err)
		return
	}

	c.JSON(http.StatusOK, campaign)
}
