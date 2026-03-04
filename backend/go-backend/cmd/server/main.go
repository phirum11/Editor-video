package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"syscall"
	"time"

	"github.com/aistudio/go-backend/internal/api"
	"github.com/aistudio/go-backend/internal/services"
	"github.com/aistudio/go-backend/pkg/websocket"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

// Config holds server configuration with env-var overrides.
type Config struct {
	Port           string
	RedisAddr      string
	RedisPassword  string
	RedisDB        int
	PythonServices string
	GinMode        string
}

func loadConfig() Config {
	cfg := Config{
		Port:           envOrDefault("PORT", "8080"),
		RedisAddr:      envOrDefault("REDIS_ADDR", "localhost:6379"),
		RedisPassword:  envOrDefault("REDIS_PASSWORD", ""),
		RedisDB:        0,
		PythonServices: envOrDefault("PYTHON_SERVICES_URL", "http://python-services:8000"),
		GinMode:        envOrDefault("GIN_MODE", "debug"),
	}
	return cfg
}

func envOrDefault(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func repeatChar(ch rune, count int) string {
	s := make([]rune, count)
	for i := range s {
		s[i] = ch
	}
	return string(s)
}

func main() {
	cfg := loadConfig()

	// Set Gin mode
	gin.SetMode(cfg.GinMode)

	// Initialize Redis with timeouts and pool
	rdb := redis.NewClient(&redis.Options{
		Addr:         cfg.RedisAddr,
		Password:     cfg.RedisPassword,
		DB:           cfg.RedisDB,
		DialTimeout:  5 * time.Second,
		ReadTimeout:  3 * time.Second,
		WriteTimeout: 3 * time.Second,
		PoolSize:     10 * runtime.GOMAXPROCS(0),
		MinIdleConns: 5,
	})

	// Verify Redis connectivity
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Printf("⚠️  Redis unavailable at %s: %v (continuing without cache)", cfg.RedisAddr, err)
	} else {
		log.Printf("✅ Redis connected at %s", cfg.RedisAddr)
	}

	// Initialize services
	pythonClient := services.NewPythonClient(cfg.PythonServices)
	downloadService := services.NewDownloadService()
	fileService := services.NewFileService()
	wsManager := websocket.NewManager()

	// Start WebSocket manager
	go wsManager.Run()

	// Create temp directories
	fileService.EnsureDirs()

	// Setup router
	router := gin.Default()
	api.SetupRoutes(router, pythonClient, downloadService, fileService, wsManager, rdb)

	// Configure HTTP server with hardened timeouts
	srv := &http.Server{
		Addr:              fmt.Sprintf(":%s", cfg.Port),
		Handler:           router,
		ReadHeaderTimeout: 10 * time.Second,
		ReadTimeout:       30 * time.Second,
		WriteTimeout:      60 * time.Second,
		IdleTimeout:       120 * time.Second,
		MaxHeaderBytes:    1 << 20, // 1 MB
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server start failed: %v", err)
		}
	}()

	// Print startup banner
	lines := []struct{ label, value string }{
		{"Local:", fmt.Sprintf("http://localhost:%s", cfg.Port)},
		{"API:", fmt.Sprintf("http://localhost:%s/api/v1", cfg.Port)},
		{"Health:", fmt.Sprintf("http://localhost:%s/health", cfg.Port)},
		{"WS:", fmt.Sprintf("ws://localhost:%s/ws", cfg.Port)},
		{"Mode:", cfg.GinMode},
		{"Redis:", cfg.RedisAddr},
	}
	svcLines := []struct{ label, value string }{
		{"Frontend:", "http://localhost:3000"},
		{"Video Proc:", "http://localhost:8001"},
		{"Speech-to-Text:", "http://localhost:8002"},
		{"Text-to-Speech:", "http://localhost:8003"},
	}

	w := 55 // inner width
	border := fmt.Sprintf("  ╔%s╗", repeatChar('═', w))
	mid := fmt.Sprintf("  ╠%s╣", repeatChar('═', w))
	bottom := fmt.Sprintf("  ╚%s╝", repeatChar('═', w))

	fmt.Println()
	fmt.Println(border)
	fmt.Printf("  ║%-*s║\n", w, "       🚀 AI Studio Backend is running!")
	fmt.Println(mid)
	for _, l := range lines {
		content := fmt.Sprintf("   %-10s %s", l.label, l.value)
		fmt.Printf("  ║%-*s║\n", w, content)
	}
	fmt.Println(mid)
	fmt.Printf("  ║%-*s║\n", w, "   Services:")
	for _, s := range svcLines {
		content := fmt.Sprintf("   %-17s %s", s.label, s.value)
		fmt.Printf("  ║%-*s║\n", w, content)
	}
	fmt.Println(bottom)
	fmt.Println()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	sig := <-quit
	log.Printf("Received signal %v, shutting down...", sig)

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("Server forced shutdown: %v", err)
	}

	// Close Redis connection
	if err := rdb.Close(); err != nil {
		log.Printf("Redis close error: %v", err)
	}

	log.Println("Server exited cleanly")
}