package models

import (
	"math"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// ─── Standard Responses ──────────────────────────────────────────────────────

// ErrorResponse is returned for any 4xx/5xx error.
type ErrorResponse struct {
	Error     string `json:"error"`
	Code      string `json:"code,omitempty"`
	RequestID string `json:"request_id,omitempty"`
}

// SuccessResponse is a generic success envelope.
type SuccessResponse struct {
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// TaskResponse is the short acknowledgement when a task is created.
type TaskResponse struct {
	TaskID  string `json:"task_id"`
	Status  string `json:"status"`
	Message string `json:"message"`
}

// PaginatedResponse wraps list endpoints.
type PaginatedResponse struct {
	Data       interface{} `json:"data"`
	Total      int64       `json:"total"`
	Page       int         `json:"page"`
	PageSize   int         `json:"page_size"`
	TotalPages int         `json:"total_pages"`
	HasNext    bool        `json:"has_next"`
	HasPrev    bool        `json:"has_prev"`
}

// NewPaginatedResponse constructs a paginated response with computed fields.
func NewPaginatedResponse(data interface{}, total int64, page, pageSize int) PaginatedResponse {
	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))
	return PaginatedResponse{
		Data:       data,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
		HasNext:    page < totalPages,
		HasPrev:    page > 1,
	}
}

// ─── WebSocket Responses ─────────────────────────────────────────────────────

// WSMessage is the standard envelope for WebSocket pushes.
type WSMessage struct {
	Type    string      `json:"type"`
	TaskID  string      `json:"taskId,omitempty"`
	Payload interface{} `json:"payload,omitempty"`
}

// ProgressPayload carries real-time progress data.
type ProgressPayload struct {
	Progress int     `json:"progress"`
	Message  string  `json:"message,omitempty"`
	Speed    string  `json:"speed,omitempty"`
	ETA      float64 `json:"eta,omitempty"`
}

// ─── Health ──────────────────────────────────────────────────────────────────

// HealthResponse describes the system health check output.
type HealthResponse struct {
	Status    string        `json:"status"`
	Version   string        `json:"version"`
	Uptime    string        `json:"uptime"`
	Timestamp time.Time     `json:"timestamp"`
	Services  ServiceHealth `json:"services,omitempty"`
}

// ServiceHealth lists dependency statuses.
type ServiceHealth struct {
	Redis  string `json:"redis"`
	Python string `json:"python,omitempty"`
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// RespondError writes a JSON error at the given status code.
func RespondError(c *gin.Context, status int, msg string) {
	reqID, _ := c.Get("requestID")
	c.JSON(status, ErrorResponse{
		Error:     msg,
		RequestID: reqIDString(reqID),
	})
}

// RespondSuccess writes a 200 success response.
func RespondSuccess(c *gin.Context, msg string, data interface{}) {
	c.JSON(http.StatusOK, SuccessResponse{Message: msg, Data: data})
}

// RespondCreated writes a 201 with a task response.
func RespondCreated(c *gin.Context, taskID, msg string) {
	c.JSON(http.StatusCreated, TaskResponse{
		TaskID:  taskID,
		Status:  TaskStatusPending,
		Message: msg,
	})
}

func reqIDString(v interface{}) string {
	if s, ok := v.(string); ok {
		return s
	}
	return ""
}
