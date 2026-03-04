package handlers

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/aistudio/go-backend/internal/services"
	"github.com/aistudio/go-backend/internal/utils"
	"github.com/aistudio/go-backend/pkg/websocket"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

// ─── Handler ───────────────────────────────────────────────

type DownloadHandler struct {
	downloadService *services.DownloadService
	fileService     *services.FileService
	wsManager       *websocket.Manager
	redis           *redis.Client
}

func NewDownloadHandler(
	ds *services.DownloadService,
	fs *services.FileService,
	wm *websocket.Manager,
	rdb *redis.Client,
) *DownloadHandler {
	return &DownloadHandler{
		downloadService: ds,
		fileService:     fs,
		wsManager:       wm,
		redis:           rdb,
	}
}

// ─── Request DTOs ──────────────────────────────────────────

type DownloadRequest struct {
	URL          string `json:"url" binding:"required"`
	Format       string `json:"format"`
	Quality      string `json:"quality"`
	AudioFormat  string `json:"audio_format"`
	AudioQuality string `json:"audio_quality"`
	ExtractAudio bool   `json:"extract_audio"`
}

// ─── Start Download ────────────────────────────────────────

func (h *DownloadHandler) StartDownload(c *gin.Context) {
	var req DownloadRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "URL is required"})
		return
	}

	// Validate URL
	if !utils.IsValidURL(req.URL) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid URL"})
		return
	}

	taskID := uuid.New().String()
	task := map[string]interface{}{
		"id":         taskID,
		"type":       "download",
		"status":     "pending",
		"progress":   0,
		"url":        req.URL,
		"created_at": time.Now().UTC().Format(time.RFC3339),
	}
	if err := h.redis.HSet(c.Request.Context(), "task:"+taskID, task).Err(); err != nil {
		log.Printf("[download] Redis error: %v", err)
	}

	opts := services.DownloadOptions{
		Format:       req.Format,
		Quality:      req.Quality,
		AudioFormat:  req.AudioFormat,
		AudioQuality: req.AudioQuality,
		ExtractAudio: req.ExtractAudio,
	}

	go h.runDownload(taskID, req.URL, opts)

	c.JSON(http.StatusAccepted, gin.H{
		"task_id": taskID,
		"status":  "downloading",
		"message": "Download started",
	})
}

func (h *DownloadHandler) runDownload(taskID, url string, opts services.DownloadOptions) {
	ctx := context.Background()

	h.downloadService.StartDownload(url, taskID, opts, func(progress int, speed string, message string) {
		status := "downloading"
		if progress >= 100 {
			status = "completed"
		}

		h.redis.HSet(ctx, "task:"+taskID,
			"progress", progress,
			"speed", speed,
			"message", message,
			"status", status,
		)
		h.wsManager.BroadcastToTask(taskID, websocket.Message{
			Type:    "progress",
			TaskID:  taskID,
			Payload: map[string]interface{}{
				"progress": progress,
				"speed":    speed,
				"message":  message,
				"status":   status,
			},
		})
	})
}

// ─── Info / Progress / Formats / Cancel ────────────────────

func (h *DownloadHandler) GetInfo(c *gin.Context) {
	url := c.Query("url")
	if url == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "url query parameter required"})
		return
	}
	if !utils.IsValidURL(url) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid URL"})
		return
	}
	info, err := h.downloadService.GetInfo(url)
	if err != nil {
		log.Printf("[download] GetInfo error for %s: %v", url, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch info"})
		return
	}
	c.JSON(http.StatusOK, info)
}

func (h *DownloadHandler) GetProgress(c *gin.Context) {
	taskID := c.Param("taskId")
	if taskID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "taskId required"})
		return
	}
	task, err := h.redis.HGetAll(c.Request.Context(), "task:"+taskID).Result()
	if err != nil || len(task) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}
	c.JSON(http.StatusOK, task)
}

func (h *DownloadHandler) GetFormats(c *gin.Context) {
	url := c.Query("url")
	if url == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "url query parameter required"})
		return
	}
	formats, err := h.downloadService.GetFormats(url)
	if err != nil {
		log.Printf("[download] GetFormats error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch formats"})
		return
	}
	c.JSON(http.StatusOK, formats)
}

func (h *DownloadHandler) CancelDownload(c *gin.Context) {
	taskID := c.Param("taskId")
	if taskID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "taskId required"})
		return
	}

	// Verify task exists
	exists, err := h.redis.Exists(c.Request.Context(), "task:"+taskID).Result()
	if err != nil || exists == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	h.redis.HSet(c.Request.Context(), "task:"+taskID,
		"status", "cancelled",
		"cancelled_at", time.Now().UTC().Format(time.RFC3339),
	)

	h.wsManager.BroadcastToTask(taskID, websocket.Message{
		Type:    "cancelled",
		TaskID:  taskID,
		Payload: map[string]interface{}{"status": "cancelled"},
	})

	c.JSON(http.StatusOK, gin.H{
		"task_id": taskID,
		"status":  "cancelled",
	})
}
