package handlers

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"path/filepath"
	"time"

	"github.com/aistudio/go-backend/internal/models"
	"github.com/aistudio/go-backend/internal/services"
	"github.com/aistudio/go-backend/pkg/websocket"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

// ─── Handler ───────────────────────────────────────────────

type TTSHandler struct {
	pythonClient *services.PythonClient
	fileService  *services.FileService
	wsManager    *websocket.Manager
	redis        *redis.Client
}

func NewTTSHandler(
	pc *services.PythonClient,
	fs *services.FileService,
	wm *websocket.Manager,
	rdb *redis.Client,
) *TTSHandler {
	return &TTSHandler{
		pythonClient: pc,
		fileService:  fs,
		wsManager:    wm,
		redis:        rdb,
	}
}

// ─── Request DTOs ──────────────────────────────────────────

type TTSRequest struct {
	Text  string  `json:"text" binding:"required,min=1,max=10000"`
	Voice string  `json:"voice"`
	Speed float64 `json:"speed"`
	Pitch float64 `json:"pitch"`
}

type BatchTTSRequest struct {
	Segments []models.Segment `json:"segments" binding:"required,min=1"`
	Speed    float64          `json:"speed"`
}

const (
	defaultVoice = "km-KH-SreymomNeural"
	defaultSpeed = 1.0
	defaultPitch = 1.0
	maxBatchSize = 100
)

// ─── Generate ──────────────────────────────────────────────

func (h *TTSHandler) Generate(c *gin.Context) {
	var req TTSRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Text is required (1-10000 chars)"})
		return
	}

	if req.Voice == "" {
		req.Voice = defaultVoice
	}
	if req.Speed <= 0 || req.Speed > 4 {
		req.Speed = defaultSpeed
	}
	if req.Pitch <= 0 || req.Pitch > 2 {
		req.Pitch = defaultPitch
	}

	taskID := uuid.New().String()
	task := map[string]interface{}{
		"id":         taskID,
		"type":       "tts",
		"status":     "pending",
		"progress":   0,
		"voice":      req.Voice,
		"text_len":   len(req.Text),
		"created_at": time.Now().UTC().Format(time.RFC3339),
	}
	if err := h.redis.HSet(c.Request.Context(), "task:"+taskID, task).Err(); err != nil {
		log.Printf("[tts] Redis error: %v", err)
	}

	go h.runGenerate(taskID, req)

	c.JSON(http.StatusAccepted, gin.H{
		"task_id": taskID,
		"status":  "processing",
		"message": "Speech generation started",
	})
}

func (h *TTSHandler) runGenerate(taskID string, req TTSRequest) {
	ctx := context.Background()
	h.pythonClient.GenerateSpeech(req.Text, req.Voice, req.Speed, req.Pitch, taskID, func(progress int, message string) {
		h.redis.HSet(ctx, "task:"+taskID, "progress", progress, "message", message, "status", "processing")
		h.wsManager.BroadcastToTask(taskID, websocket.Message{
			Type:    "progress",
			TaskID:  taskID,
			Payload: map[string]interface{}{"progress": progress, "message": message},
		})
	})
}

// ─── Batch Generate ────────────────────────────────────────

func (h *TTSHandler) BatchGenerate(c *gin.Context) {
	var req BatchTTSRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Segments array required"})
		return
	}

	if len(req.Segments) > maxBatchSize {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":    fmt.Sprintf("Maximum %d segments per batch", maxBatchSize),
			"received": len(req.Segments),
		})
		return
	}

	if req.Speed <= 0 || req.Speed > 4 {
		req.Speed = defaultSpeed
	}

	taskID := uuid.New().String()
	task := map[string]interface{}{
		"id":         taskID,
		"type":       "tts_batch",
		"status":     "pending",
		"progress":   0,
		"segments":   len(req.Segments),
		"created_at": time.Now().UTC().Format(time.RFC3339),
	}
	if err := h.redis.HSet(c.Request.Context(), "task:"+taskID, task).Err(); err != nil {
		log.Printf("[tts] Redis error: %v", err)
	}

	go h.runBatchGenerate(taskID, req.Segments, req.Speed)

	c.JSON(http.StatusAccepted, gin.H{
		"task_id":  taskID,
		"status":   "processing",
		"segments": len(req.Segments),
	})
}

func (h *TTSHandler) runBatchGenerate(taskID string, segments []models.Segment, speed float64) {
	ctx := context.Background()
	h.pythonClient.BatchGenerateSpeech(segments, speed, taskID, func(progress int, message string) {
		h.redis.HSet(ctx, "task:"+taskID, "progress", progress, "message", message, "status", "processing")
		h.wsManager.BroadcastToTask(taskID, websocket.Message{
			Type:    "progress",
			TaskID:  taskID,
			Payload: map[string]interface{}{"progress": progress, "message": message},
		})
	})
}

// ─── Status / Download ─────────────────────────────────────

func (h *TTSHandler) GetStatus(c *gin.Context) {
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

func (h *TTSHandler) DownloadAudio(c *gin.Context) {
	taskID := c.Param("taskId")
	if taskID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "taskId required"})
		return
	}

	audioPath, err := h.redis.HGet(c.Request.Context(), "task:"+taskID, "result").Result()
	if err != nil || audioPath == "" {
		c.JSON(http.StatusNotFound, gin.H{"error": "Audio not ready"})
		return
	}

	if !h.fileService.FileExists(audioPath) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Audio file no longer exists"})
		return
	}

	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", filepath.Base(audioPath)))
	c.File(audioPath)
}

// ─── Voices ────────────────────────────────────────────────

func (h *TTSHandler) ListVoices(c *gin.Context) {
	c.JSON(http.StatusOK, []map[string]string{
		{"id": "km-KH-SreymomNeural", "name": "Sreymom", "language": "km", "gender": "female"},
		{"id": "km-KH-ThearithNeural", "name": "Thearith", "language": "km", "gender": "male"},
		{"id": "en-US-JennyNeural", "name": "Jenny", "language": "en-US", "gender": "female"},
		{"id": "en-US-GuyNeural", "name": "Guy", "language": "en-US", "gender": "male"},
		{"id": "en-GB-SoniaNeural", "name": "Sonia", "language": "en-GB", "gender": "female"},
		{"id": "en-GB-RyanNeural", "name": "Ryan", "language": "en-GB", "gender": "male"},
		{"id": "zh-CN-XiaoxiaoNeural", "name": "Xiaoxiao", "language": "zh-CN", "gender": "female"},
		{"id": "zh-CN-YunxiNeural", "name": "Yunxi", "language": "zh-CN", "gender": "male"},
		{"id": "ja-JP-NanamiNeural", "name": "Nanami", "language": "ja-JP", "gender": "female"},
		{"id": "ja-JP-KeitaNeural", "name": "Keita", "language": "ja-JP", "gender": "male"},
		{"id": "ko-KR-SunHiNeural", "name": "SunHi", "language": "ko-KR", "gender": "female"},
		{"id": "ko-KR-InJoonNeural", "name": "InJoon", "language": "ko-KR", "gender": "male"},
		{"id": "th-TH-PremwadeeNeural", "name": "Premwadee", "language": "th-TH", "gender": "female"},
		{"id": "th-TH-NiwatNeural", "name": "Niwat", "language": "th-TH", "gender": "male"},
		{"id": "vi-VN-HoaiMyNeural", "name": "HoaiMy", "language": "vi-VN", "gender": "female"},
		{"id": "vi-VN-NamMinhNeural", "name": "NamMinh", "language": "vi-VN", "gender": "male"},
	})
}
