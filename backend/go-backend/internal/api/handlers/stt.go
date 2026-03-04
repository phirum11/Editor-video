package handlers

import (
	"context"
	"log"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/aistudio/go-backend/internal/services"
	"github.com/aistudio/go-backend/pkg/websocket"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

// ─── Constants ─────────────────────────────────────────────

const maxAudioSize = 500 << 20 // 500 MB

var allowedAudioExts = map[string]bool{
	".mp3": true, ".wav": true, ".m4a": true,
	".flac": true, ".ogg": true, ".aac": true,
	".wma": true, ".opus": true,
}

// ─── Handler ───────────────────────────────────────────────

type STTHandler struct {
	pythonClient *services.PythonClient
	fileService  *services.FileService
	wsManager    *websocket.Manager
	redis        *redis.Client
}

func NewSTTHandler(
	pc *services.PythonClient,
	fs *services.FileService,
	wm *websocket.Manager,
	rdb *redis.Client,
) *STTHandler {
	return &STTHandler{
		pythonClient: pc,
		fileService:  fs,
		wsManager:    wm,
		redis:        rdb,
	}
}

// ─── Transcribe ────────────────────────────────────────────

func (h *STTHandler) Transcribe(c *gin.Context) {
	file, err := c.FormFile("audio")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No audio file uploaded"})
		return
	}

	if file.Size > maxAudioSize {
		c.JSON(http.StatusRequestEntityTooLarge, gin.H{
			"error":   "Audio file too large",
			"maxSize": "500 MB",
		})
		return
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	if !allowedAudioExts[ext] {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Unsupported audio format",
			"allowed": "mp3, wav, m4a, flac, ogg, aac, wma, opus",
		})
		return
	}

	language := c.DefaultQuery("language", "auto")
	model := c.DefaultQuery("model", "base")

	// Validate model
	validModels := map[string]bool{"tiny": true, "base": true, "small": true, "medium": true, "large": true}
	if !validModels[model] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid model. Use: tiny, base, small, medium, large"})
		return
	}

	taskID := uuid.New().String()
	safeFilename := taskID + ext
	filePath := filepath.Join("temp", "uploads", safeFilename)

	if err := c.SaveUploadedFile(file, filePath); err != nil {
		log.Printf("[stt] Failed to save %s: %v", file.Filename, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	task := map[string]interface{}{
		"id":         taskID,
		"type":       "transcription",
		"status":     "pending",
		"progress":   0,
		"language":   language,
		"model":      model,
		"filename":   file.Filename,
		"created_at": time.Now().UTC().Format(time.RFC3339),
	}
	if err := h.redis.HSet(c.Request.Context(), "task:"+taskID, task).Err(); err != nil {
		log.Printf("[stt] Redis error: %v", err)
	}

	go h.runTranscription(taskID, filePath, language, model)

	c.JSON(http.StatusAccepted, gin.H{
		"task_id": taskID,
		"status":  "processing",
		"message": "Transcription started",
	})
}

func (h *STTHandler) runTranscription(taskID, filePath, language, model string) {
	ctx := context.Background()

	h.pythonClient.TranscribeAudio(filePath, taskID, language, model, func(progress int, message string) {
		h.redis.HSet(ctx, "task:"+taskID, "progress", progress, "message", message, "status", "processing")
		h.wsManager.BroadcastToTask(taskID, websocket.Message{
			Type:    "progress",
			TaskID:  taskID,
			Payload: map[string]interface{}{"progress": progress, "message": message},
		})
	})
}

// ─── Result / Status ───────────────────────────────────────

func (h *STTHandler) GetResult(c *gin.Context) {
	taskID := c.Param("taskId")
	if taskID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "taskId required"})
		return
	}

	result, err := h.redis.HGet(c.Request.Context(), "task:"+taskID, "result").Result()
	if err != nil || result == "" {
		c.JSON(http.StatusNotFound, gin.H{"error": "Result not ready"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"task_id": taskID,
		"result":  result,
	})
}

func (h *STTHandler) GetStatus(c *gin.Context) {
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

// ─── Languages / Models ────────────────────────────────────

func (h *STTHandler) ListLanguages(c *gin.Context) {
	c.JSON(http.StatusOK, []map[string]string{
		{"code": "auto", "name": "Auto Detect"},
		{"code": "en", "name": "English"},
		{"code": "km", "name": "Khmer"},
		{"code": "zh", "name": "Chinese"},
		{"code": "ja", "name": "Japanese"},
		{"code": "ko", "name": "Korean"},
		{"code": "es", "name": "Spanish"},
		{"code": "fr", "name": "French"},
		{"code": "de", "name": "German"},
		{"code": "th", "name": "Thai"},
		{"code": "vi", "name": "Vietnamese"},
		{"code": "pt", "name": "Portuguese"},
		{"code": "it", "name": "Italian"},
		{"code": "ru", "name": "Russian"},
		{"code": "ar", "name": "Arabic"},
		{"code": "hi", "name": "Hindi"},
	})
}

func (h *STTHandler) ListModels(c *gin.Context) {
	c.JSON(http.StatusOK, []map[string]interface{}{
		{"id": "tiny", "name": "Tiny", "size": "75 MB", "speed": "Fast", "accuracy": "Low"},
		{"id": "base", "name": "Base", "size": "142 MB", "speed": "Fast", "accuracy": "Medium"},
		{"id": "small", "name": "Small", "size": "466 MB", "speed": "Medium", "accuracy": "Good"},
		{"id": "medium", "name": "Medium", "size": "1.5 GB", "speed": "Slow", "accuracy": "Better"},
		{"id": "large", "name": "Large", "size": "2.9 GB", "speed": "Very Slow", "accuracy": "Best"},
	})
}
