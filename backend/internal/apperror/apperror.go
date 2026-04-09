package apperror

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
)

// AppError is a structured error that is safe to return to API clients.
type AppError struct {
	HTTPStatus int    `json:"-"`
	Code       string `json:"error"`
	Message    string `json:"message,omitempty"`
}

func (e *AppError) Error() string {
	if e.Message != "" {
		return e.Message
	}
	return e.Code
}

// --- Constructors ---

func BadRequest(code, message string) *AppError {
	return &AppError{HTTPStatus: http.StatusBadRequest, Code: code, Message: message}
}

func NotFound(code, message string) *AppError {
	return &AppError{HTTPStatus: http.StatusNotFound, Code: code, Message: message}
}

func Conflict(code, message string) *AppError {
	return &AppError{HTTPStatus: http.StatusConflict, Code: code, Message: message}
}

func Internal(code string) *AppError {
	return &AppError{HTTPStatus: http.StatusInternalServerError, Code: code, Message: "An internal error occurred"}
}

func Forbidden(code, message string) *AppError {
	return &AppError{HTTPStatus: http.StatusForbidden, Code: code, Message: message}
}

func Unauthorized(code, message string) *AppError {
	return &AppError{HTTPStatus: http.StatusUnauthorized, Code: code, Message: message}
}

// --- Response helpers ---

// Respond writes an error response to the client.
// If err is an *AppError, its code/message/status are used.
// Otherwise a generic 500 is returned and the real error is logged.
func Respond(c *gin.Context, err error) {
	var appErr *AppError
	if errors.As(err, &appErr) {
		c.JSON(appErr.HTTPStatus, gin.H{
			"error":   appErr.Code,
			"message": appErr.Message,
		})
		return
	}

	// Unknown error — log it, return generic message
	slog.Error("unhandled error",
		"path", c.Request.URL.Path,
		"method", c.Request.Method,
		"error", err.Error(),
	)
	c.JSON(http.StatusInternalServerError, gin.H{
		"error":   "internal_error",
		"message": "An internal error occurred",
	})
}

// RespondValidation writes a 400 validation error.
// Safe to include user-facing gin binding messages.
func RespondValidation(c *gin.Context, message string) {
	c.JSON(http.StatusBadRequest, gin.H{
		"error":   "validation_error",
		"message": message,
	})
}

// RespondNotFound writes a 404 response.
func RespondNotFound(c *gin.Context, code string) {
	c.JSON(http.StatusNotFound, gin.H{
		"error":   code,
		"message": "Resource not found",
	})
}

// RespondOK writes a 200 response with data.
func RespondOK(c *gin.Context, data any) {
	c.JSON(http.StatusOK, data)
}

// RespondCreated writes a 201 response with data.
func RespondCreated(c *gin.Context, data any) {
	c.JSON(http.StatusCreated, data)
}

// RespondList writes a 200 response with list data and metadata.
func RespondList(c *gin.Context, data any, total int64) {
	c.JSON(http.StatusOK, gin.H{
		"data":  data,
		"total": total,
	})
}
