package inventory

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"saversure/internal/apperror"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) CreateReward(c *gin.Context) {
	var input CreateRewardInput
	if err := c.ShouldBindJSON(&input); err != nil {
		apperror.RespondValidation(c, err.Error())
		return
	}

	reward, err := h.svc.CreateReward(c.Request.Context(), c.GetString("tenant_id"), input)
	if err != nil {
		apperror.Respond(c, err)
		return
	}

	c.JSON(http.StatusCreated, reward)
}

func (h *Handler) List(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	rewards, total, err := h.svc.List(c.Request.Context(), c.GetString("tenant_id"), limit, offset)
	if err != nil {
		apperror.Respond(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": rewards, "total": total})
}

func (h *Handler) GetByID(c *gin.Context) {
	reward, err := h.svc.GetByID(c.Request.Context(), c.GetString("tenant_id"), c.Param("id"))
	if err != nil {
		apperror.RespondNotFound(c, "not_found")
		return
	}
	c.JSON(http.StatusOK, reward)
}

func (h *Handler) UpdateReward(c *gin.Context) {
	var input UpdateRewardInput
	if err := c.ShouldBindJSON(&input); err != nil {
		apperror.RespondValidation(c, err.Error())
		return
	}

	reward, err := h.svc.UpdateReward(c.Request.Context(), c.GetString("tenant_id"), c.Param("id"), input)
	if err != nil {
		apperror.Respond(c, err)
		return
	}

	c.JSON(http.StatusOK, reward)
}

func (h *Handler) UpdateInventory(c *gin.Context) {
	var input UpdateInventoryInput
	if err := c.ShouldBindJSON(&input); err != nil {
		apperror.RespondValidation(c, err.Error())
		return
	}

	reward, err := h.svc.UpdateInventory(c.Request.Context(), c.GetString("tenant_id"), c.Param("id"), input)
	if err != nil {
		apperror.Respond(c, err)
		return
	}

	c.JSON(http.StatusOK, reward)
}
