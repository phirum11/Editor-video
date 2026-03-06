package api

import (
	"encoding/json"
	"log"
	"net/http"
	"runtime"
	"sync"
	"time"

	"github.com/aistudio/go-backend/internal/api/handlers"
	"github.com/aistudio/go-backend/internal/services"
	"github.com/aistudio/go-backend/pkg/websocket"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

// ─── Middleware ─────────────────────────────────────────────

// requestID injects a unique X-Request-ID header into every request.
func requestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.GetHeader("X-Request-ID")
		if id == "" {
			id = uuid.New().String()
		}
		c.Set("requestID", id)
		c.Header("X-Request-ID", id)
		c.Next()
	}
}

// securityHeaders adds basic security headers.
func securityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Next()
	}
}

// recoveryWithLog provides structured panic recovery.
func recoveryWithLog() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if r := recover(); r != nil {
				buf := make([]byte, 4096)
				n := runtime.Stack(buf, false)
				log.Printf("[PANIC] %v\n%s", r, buf[:n])
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"error":     "Internal server error",
					"requestId": c.GetString("requestID"),
				})
			}
		}()
		c.Next()
	}
}

// simpleRateLimiter is a per-IP token bucket rate limiter.
type simpleRateLimiter struct {
	mu      sync.Mutex
	clients map[string]*rateBucket
	rate    int           // tokens per interval
	window  time.Duration // refill interval
}

type rateBucket struct {
	tokens   int
	lastFill time.Time
}

func newRateLimiter(rate int, window time.Duration) *simpleRateLimiter {
	rl := &simpleRateLimiter{
		clients: make(map[string]*rateBucket),
		rate:    rate,
		window:  window,
	}
	// Cleanup stale entries periodically
	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			rl.mu.Lock()
			cutoff := time.Now().Add(-10 * time.Minute)
			for ip, b := range rl.clients {
				if b.lastFill.Before(cutoff) {
					delete(rl.clients, ip)
				}
			}
			rl.mu.Unlock()
		}
	}()
	return rl
}

func (rl *simpleRateLimiter) middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		rl.mu.Lock()
		b, exists := rl.clients[ip]
		now := time.Now()
		if !exists {
			b = &rateBucket{tokens: rl.rate, lastFill: now}
			rl.clients[ip] = b
		}
		// Refill tokens
		elapsed := now.Sub(b.lastFill)
		if elapsed >= rl.window {
			refills := int(elapsed / rl.window)
			b.tokens = min(rl.rate, b.tokens+refills*rl.rate)
			b.lastFill = now
		}
		if b.tokens <= 0 {
			rl.mu.Unlock()
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error":      "Rate limit exceeded",
				"retryAfter": rl.window.String(),
			})
			return
		}
		b.tokens--
		rl.mu.Unlock()
		c.Next()
	}
}

// ─── Route Setup ───────────────────────────────────────────

func SetupRoutes(
	r *gin.Engine,
	pythonClient *services.PythonClient,
	downloadService *services.DownloadService,
	fileService *services.FileService,
	wsManager *websocket.Manager,
	rdb *redis.Client,
) {
	// Global middleware
	r.Use(recoveryWithLog())
	r.Use(requestID())
	r.Use(securityHeaders())

	// CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept", "X-Requested-With", "X-Request-ID"},
		ExposeHeaders:    []string{"Content-Length", "Content-Disposition", "X-Request-ID"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Rate limiter: 100 requests per second per IP
	limiter := newRateLimiter(100, time.Second)
	r.Use(limiter.middleware())

	// ─── Root endpoint ─────────────────────────────────────
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"service":     "AI Studio Go Backend",
			"version":     "2.0.0",
			"status":      "running",
			"docs":        "/api/*",
			"health":      "/health",
			"websocket":   "/ws",
			"timestamp":   time.Now().UTC().Format(time.RFC3339),
			"message":     "API server is running. Use /health for status or /api/* for endpoints.",
		})
	})

	// ─── Auth endpoints ────────────────────────────────────
	auth := r.Group("/api/auth")
	{
		auth.POST("/login", func(c *gin.Context) {
			var req struct {
				Email    string `json:"email" binding:"required,email"`
				Password string `json:"password" binding:"required,min=1"`
			}
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email or password format"})
				return
			}
			c.JSON(http.StatusOK, gin.H{
				"token": "dev-jwt-token-" + req.Email,
				"user": gin.H{
					"id":    "user-1",
					"email": req.Email,
					"name":  "Dev User",
					"role":  "admin",
				},
			})
		})

		auth.POST("/register", func(c *gin.Context) {
			var req struct {
				Name     string `json:"name" binding:"required,min=1,max=100"`
				Email    string `json:"email" binding:"required,email"`
				Password string `json:"password" binding:"required,min=8"`
			}
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Name, valid email, and password (8+ chars) required"})
				return
			}
			c.JSON(http.StatusCreated, gin.H{
				"token": "dev-jwt-token-" + req.Email,
				"user": gin.H{
					"id":    "user-1",
					"email": req.Email,
					"name":  req.Name,
					"role":  "user",
				},
			})
		})

		auth.POST("/google", func(c *gin.Context) {
			var req struct {
				Token string `json:"token" binding:"required"`
			}
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Token required"})
				return
			}
			c.JSON(http.StatusOK, gin.H{
				"token": "dev-jwt-google-token",
				"user": gin.H{
					"id":       "google-user-1",
					"email":    "user@gmail.com",
					"name":     "Google User",
					"role":     "user",
					"provider": "google",
				},
			})
		})

		auth.GET("/me", func(c *gin.Context) {
			authHeader := c.GetHeader("Authorization")
			if authHeader == "" {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
				return
			}
			c.JSON(http.StatusOK, gin.H{
				"id":    "user-1",
				"email": "user@example.com",
				"name":  "Dev User",
				"role":  "admin",
			})
		})

		auth.POST("/logout", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
		})
	}

	// ─── API v1 routes ─────────────────────────────────────
	v1 := r.Group("/api/v1")
	{
		// Video
		videoHandler := handlers.NewVideoHandler(pythonClient, fileService, wsManager, rdb)
		videos := v1.Group("/video")
		{
			videos.POST("/upload", videoHandler.UploadVideo)
			videos.POST("/process/:videoId", videoHandler.ProcessVideo)
			videos.GET("/status/:taskId", videoHandler.GetStatus)
			videos.GET("/download/:taskId", videoHandler.DownloadVideo)
			videos.GET("/info/:videoId", videoHandler.GetVideoInfo)
		}

		// STT
		sttHandler := handlers.NewSTTHandler(pythonClient, fileService, wsManager, rdb)
		stt := v1.Group("/stt")
		{
			stt.POST("/transcribe", sttHandler.Transcribe)
			stt.GET("/result/:taskId", sttHandler.GetResult)
			stt.GET("/status/:taskId", sttHandler.GetStatus)
			stt.GET("/languages", sttHandler.ListLanguages)
			stt.GET("/models", sttHandler.ListModels)
		}

		// TTS
		ttsHandler := handlers.NewTTSHandler(pythonClient, fileService, wsManager, rdb)
		tts := v1.Group("/tts")
		{
			tts.POST("/generate", ttsHandler.Generate)
			tts.POST("/batch", ttsHandler.BatchGenerate)
			tts.GET("/voices", ttsHandler.ListVoices)
			tts.GET("/status/:taskId", ttsHandler.GetStatus)
			tts.GET("/download/:taskId", ttsHandler.DownloadAudio)
		}

		// Download
		downloadHandler := handlers.NewDownloadHandler(downloadService, fileService, wsManager, rdb)
		download := v1.Group("/download")
		{
			download.POST("/start", downloadHandler.StartDownload)
			download.GET("/info", downloadHandler.GetInfo)
			download.GET("/progress/:taskId", downloadHandler.GetProgress)
			download.GET("/formats", downloadHandler.GetFormats)
			download.POST("/cancel/:taskId", downloadHandler.CancelDownload)
		}
	}

	// ─── WebSocket ─────────────────────────────────────────
	r.GET("/ws", func(c *gin.Context) {
		wsManager.HandleWebSocket(c.Writer, c.Request)
	})

	// ─── Health ────────────────────────────────────────────
	r.GET("/health", func(c *gin.Context) {
		redisStatus := "connected"
		if err := rdb.Ping(c.Request.Context()).Err(); err != nil {
			redisStatus = "disconnected"
		}
		c.JSON(http.StatusOK, gin.H{
			"status":    "healthy",
			"timestamp": time.Now().UTC().Format(time.RFC3339),
			"redis":     redisStatus,
			"version":   "2.0.0",
			"uptime":    time.Since(startTime).String(),
		})
	})

	// ─── Static files ──────────────────────────────────────
	r.Static("/files/downloads", "./temp/downloads")
	r.Static("/files/processed", "./temp/processed")
}

var startTime = time.Now()

// StructToMap converts a struct to map for Redis HSet.
func StructToMap(v interface{}) map[string]interface{} {
	data, _ := json.Marshal(v)
	var result map[string]interface{}
	_ = json.Unmarshal(data, &result)
	return result
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
