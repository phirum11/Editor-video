package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/aistudio/go-backend/internal/models"
	"github.com/aistudio/go-backend/internal/services"
	"github.com/aistudio/go-backend/pkg/websocket"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

// ─── Constants ─────────────────────────────────────────────

const (
	maxVideoSize = 2 << 30 // 2 GB
)

var allowedVideoExts = map[string]bool{
	".mp4": true, ".avi": true, ".mov": true,
	".mkv": true, ".webm": true, ".flv": true,
	".wmv": true, ".m4v": true,
}

// ─── Handler ───────────────────────────────────────────────

type VideoHandler struct {
	pythonClient *services.PythonClient
	fileService  *services.FileService
	wsManager    *websocket.Manager
	redis        *redis.Client
}

func NewVideoHandler(
	pc *services.PythonClient,
	fs *services.FileService,
	wm *websocket.Manager,
	rdb *redis.Client,
) *VideoHandler {
	return &VideoHandler{
		pythonClient: pc,
		fileService:  fs,
		wsManager:    wm,
		redis:        rdb,
	}
}

// structToMap converts a struct to flat map for Redis HSet.
func structToMap(v interface{}) map[string]interface{} {
	data, _ := json.Marshal(v)
	var result map[string]interface{}
	_ = json.Unmarshal(data, &result)
	return result
}

// ─── Upload ────────────────────────────────────────────────

type UploadResponse struct {
	VideoID  string `json:"video_id"`
	Filename string `json:"filename"`
	Size     int64  `json:"size"`
	Format   string `json:"format"`
}

func (h *VideoHandler) UploadVideo(c *gin.Context) {
	file, err := c.FormFile("video")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No video file provided"})
		return
	}

	// Size check
	if file.Size > maxVideoSize {
		c.JSON(http.StatusRequestEntityTooLarge, gin.H{
			"error":   "File too large",
			"maxSize": "2 GB",
		})
		return
	}

	// Extension check
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if !allowedVideoExts[ext] {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Unsupported file type",
			"allowed": "mp4, avi, mov, mkv, webm, flv, wmv, m4v",
		})
		return
	}

	videoID := uuid.New().String()
	safeFilename := fmt.Sprintf("%s%s", videoID, ext)
	filePath := filepath.Join("temp", "uploads", safeFilename)

	if err := c.SaveUploadedFile(file, filePath); err != nil {
		log.Printf("[video] Failed to save upload %s: %v", file.Filename, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	videoInfo := map[string]interface{}{
		"id":        videoID,
		"path":      filePath,
		"filename":  file.Filename,
		"size":      file.Size,
		"format":    ext[1:],
		"uploaded":  time.Now().UTC().Format(time.RFC3339),
	}
	if err := h.redis.HSet(c.Request.Context(), "video:"+videoID, videoInfo).Err(); err != nil {
		log.Printf("[video] Redis HSet failed for %s: %v", videoID, err)
	}

	c.JSON(http.StatusOK, UploadResponse{
		VideoID:  videoID,
		Filename: file.Filename,
		Size:     file.Size,
		Format:   ext[1:],
	})
}

// ─── Process ───────────────────────────────────────────────

type ProcessRequest struct {
	Operations []models.Operation `json:"operations" binding:"required,min=1"`
}

func (h *VideoHandler) ProcessVideo(c *gin.Context) {
	videoID := c.Param("videoId")
	if videoID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "videoId required"})
		return
	}

	var req ProcessRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "At least one operation required"})
		return
	}

	// Verify video exists
	exists, err := h.redis.Exists(c.Request.Context(), "video:"+videoID).Result()
	if err != nil || exists == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Video not found"})
		return
	}

	taskID := uuid.New().String()
	task := map[string]interface{}{
		"id":         taskID,
		"type":       "video_processing",
		"status":     "pending",
		"progress":   0,
		"video_id":   videoID,
		"operations": len(req.Operations),
		"created_at": time.Now().UTC().Format(time.RFC3339),
	}
	h.redis.HSet(c.Request.Context(), "task:"+taskID, task)

	go h.processVideoAsync(taskID, videoID, req.Operations)

	c.JSON(http.StatusAccepted, gin.H{
		"task_id": taskID,
		"status":  "processing",
		"message": "Video processing started",
	})
}

func (h *VideoHandler) processVideoAsync(taskID, videoID string, operations []models.Operation) {
	ctx := context.Background()

	videoPath, err := h.redis.HGet(ctx, "video:"+videoID, "path").Result()
	if err != nil {
		h.failTask(ctx, taskID, "Video not found in store")
		return
	}

	if !h.fileService.FileExists(videoPath) {
		h.failTask(ctx, taskID, "Video file missing from disk")
		return
	}

	h.redis.HSet(ctx, "task:"+taskID, "status", "processing")

	h.pythonClient.ProcessVideo(videoPath, taskID, operations, func(progress int, message string) {
		h.redis.HSet(ctx, "task:"+taskID, "progress", progress, "message", message)
		h.wsManager.BroadcastToTask(taskID, websocket.Message{
			Type:    "progress",
			TaskID:  taskID,
			Payload: map[string]interface{}{"progress": progress, "message": message},
		})
	})

	h.redis.HSet(ctx, "task:"+taskID,
		"status", "completed",
		"progress", 100,
		"completed_at", time.Now().UTC().Format(time.RFC3339),
	)
	h.wsManager.BroadcastToTask(taskID, websocket.Message{
		Type:    "completed",
		TaskID:  taskID,
		Payload: map[string]interface{}{"progress": 100, "status": "completed"},
	})
}

func (h *VideoHandler) failTask(ctx context.Context, taskID, reason string) {
	log.Printf("[video] Task %s failed: %s", taskID, reason)
	h.redis.HSet(ctx, "task:"+taskID, "status", "failed", "error", reason, "failed_at", time.Now().UTC().Format(time.RFC3339))
	h.wsManager.BroadcastToTask(taskID, websocket.Message{
		Type:    "error",
		TaskID:  taskID,
		Payload: map[string]interface{}{"error": reason},
	})
}

// ─── Status / Download / Info ──────────────────────────────

func (h *VideoHandler) GetStatus(c *gin.Context) {
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

func (h *VideoHandler) DownloadVideo(c *gin.Context) {
	taskID := c.Param("taskId")
	if taskID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "taskId required"})
		return
	}

	result, err := h.redis.HGet(c.Request.Context(), "task:"+taskID, "result").Result()
	if err != nil || result == "" {
		c.JSON(http.StatusNotFound, gin.H{"error": "Result not available"})
		return
	}
	if !h.fileService.FileExists(result) {
		c.JSON(http.StatusNotFound, gin.H{"error": "File no longer exists"})
		return
	}
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", filepath.Base(result)))
	c.File(result)
}

func (h *VideoHandler) GetVideoInfo(c *gin.Context) {
	videoID := c.Param("videoId")
	if videoID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "videoId required"})
		return
	}
	info, err := h.redis.HGetAll(c.Request.Context(), "video:"+videoID).Result()
	if err != nil || len(info) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Video not found"})
		return
	}
	c.JSON(http.StatusOK, info)
}
