package promotion

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"saversure/internal/apperror"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) List(c *gin.Context) {
	promos, err := h.svc.List(c.Request.Context(), c.GetString("tenant_id"))
	if err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": promos})
}

func (h *Handler) GetByID(c *gin.Context) {
	p, err := h.svc.GetByID(c.Request.Context(), c.GetString("tenant_id"), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not_found"})
		return
	}
	c.JSON(http.StatusOK, p)
}

func (h *Handler) Create(c *gin.Context) {
	var input CreateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		apperror.RespondValidation(c, err.Error())
		return
	}

	p, err := h.svc.Create(c.Request.Context(), c.GetString("tenant_id"), c.GetString("user_id"), input)
	if err != nil {
		apperror.Respond(c, err)
		return
	}

	c.JSON(http.StatusCreated, p)
}

func (h *Handler) Update(c *gin.Context) {
	var input UpdateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		apperror.RespondValidation(c, err.Error())
		return
	}

	p, err := h.svc.Update(c.Request.Context(), c.GetString("tenant_id"), c.Param("id"), input)
	if err != nil {
		apperror.Respond(c, err)
		return
	}

	c.JSON(http.StatusOK, p)
}

func (h *Handler) Delete(c *gin.Context) {
	if err := h.svc.Delete(c.Request.Context(), c.GetString("tenant_id"), c.Param("id")); err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

// --- Approval Workflow ---

func (h *Handler) Submit(c *gin.Context) {
	p, err := h.svc.Submit(c.Request.Context(), c.GetString("tenant_id"), c.Param("id"))
	if err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusOK, p)
}

func (h *Handler) Approve(c *gin.Context) {
	p, err := h.svc.Approve(c.Request.Context(), c.GetString("tenant_id"), c.Param("id"), c.GetString("user_id"))
	if err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusOK, p)
}

func (h *Handler) Reject(c *gin.Context) {
	var body struct {
		Note string `json:"note" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_error", "message": "rejection note is required"})
		return
	}

	p, err := h.svc.Reject(c.Request.Context(), c.GetString("tenant_id"), c.Param("id"), c.GetString("user_id"), body.Note)
	if err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusOK, p)
}

func (h *Handler) Deactivate(c *gin.Context) {
	p, err := h.svc.Deactivate(c.Request.Context(), c.GetString("tenant_id"), c.Param("id"))
	if err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusOK, p)
}

func (h *Handler) Reactivate(c *gin.Context) {
	p, err := h.svc.Reactivate(c.Request.Context(), c.GetString("tenant_id"), c.Param("id"))
	if err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusOK, p)
}
