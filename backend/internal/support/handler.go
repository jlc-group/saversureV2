package support

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

// GetCategories returns the canonical list of support categories.
// Used by consumer ticket form (fetches from API, no hardcode).
func (h *Handler) GetCategories(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"data": SupportCategories})
}

func (h *Handler) ListCases(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	cases, total, err := h.svc.ListCases(c.Request.Context(), tenantID, CaseListFilter{
		Status:   c.Query("status"),
		Category: c.Query("category"),
		Priority: c.Query("priority"),
		Limit:    limit,
		Offset:   offset,
	})
	if err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": cases, "total": total})
}

func (h *Handler) ListUserCases(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	userID := c.GetString("user_id")

	cases, err := h.svc.ListUserCases(c.Request.Context(), tenantID, userID)
	if err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": cases})
}

func (h *Handler) GetCase(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	caseID := c.Param("id")

	sc, messages, err := h.svc.GetCaseWithMessages(c.Request.Context(), tenantID, caseID)
	if err != nil {
		apperror.RespondNotFound(c, "not_found")
		return
	}
	c.JSON(http.StatusOK, gin.H{"case": sc, "messages": messages})
}

func (h *Handler) CreateCase(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	userID := c.GetString("user_id")

	var input CreateCaseInput
	if err := c.ShouldBindJSON(&input); err != nil {
		apperror.RespondValidation(c, err.Error())
		return
	}
	input.TenantID = tenantID
	input.UserID = userID

	sc, err := h.svc.CreateCase(c.Request.Context(), input)
	if err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusCreated, sc)
}

func (h *Handler) Reply(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	caseID := c.Param("id")
	userID := c.GetString("user_id")
	role := c.GetString("role")

	var input ReplyInput
	if err := c.ShouldBindJSON(&input); err != nil {
		apperror.RespondValidation(c, err.Error())
		return
	}
	input.SenderID = userID
	if role == "super_admin" || role == "brand_admin" || role == "brand_staff" {
		input.SenderRole = "admin"
	} else {
		input.SenderRole = "customer"
	}

	msg, err := h.svc.Reply(c.Request.Context(), tenantID, caseID, input)
	if err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusCreated, msg)
}

func (h *Handler) UpdateCase(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	caseID := c.Param("id")

	var input UpdateCaseInput
	if err := c.ShouldBindJSON(&input); err != nil {
		apperror.RespondValidation(c, err.Error())
		return
	}

	sc, err := h.svc.UpdateCase(c.Request.Context(), tenantID, caseID, input)
	if err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusOK, sc)
}
