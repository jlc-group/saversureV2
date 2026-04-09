package customer

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

func (h *Handler) List(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	search := c.Query("search")

	customers, total, err := h.svc.List(c.Request.Context(), tenantID, ListFilter{
		Search: search,
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": customers, "total": total})
}

func (h *Handler) GetByID(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	id := c.Param("id")

	cust, err := h.svc.GetByID(c.Request.Context(), tenantID, id)
	if err != nil {
		apperror.RespondNotFound(c, "not_found")
		return
	}
	c.JSON(http.StatusOK, cust)
}

func (h *Handler) GetDetail(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	customerID := c.Param("id")

	detail, err := h.svc.GetDetail(c.Request.Context(), tenantID, customerID)
	if err != nil {
		apperror.RespondNotFound(c, "not_found")
		return
	}
	c.JSON(http.StatusOK, detail)
}

func (h *Handler) Update(c *gin.Context) {
	tenantID := c.GetString("tenant_id")
	id := c.Param("id")

	var input UpdateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		apperror.RespondValidation(c, err.Error())
		return
	}

	cust, err := h.svc.Update(c.Request.Context(), tenantID, id, input)
	if err != nil {
		apperror.Respond(c, err)
		return
	}
	c.JSON(http.StatusOK, cust)
}
