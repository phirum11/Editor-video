package utils

import (
	"crypto/sha256"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// ─── Extension Helpers ───────────────────────────────────────────────────────

// GetFileExtension returns the lower-cased extension including the dot.
func GetFileExtension(filename string) string {
	return strings.ToLower(filepath.Ext(filename))
}

var videoExts = map[string]bool{
	".mp4": true, ".avi": true, ".mov": true,
	".mkv": true, ".webm": true, ".flv": true,
	".wmv": true, ".m4v": true, ".mpg": true,
	".mpeg": true, ".3gp": true, ".ts": true,
	".mts": true, ".vob": true,
}

var audioExts = map[string]bool{
	".mp3": true, ".wav": true, ".m4a": true,
	".flac": true, ".ogg": true, ".aac": true,
	".wma": true, ".opus": true, ".aiff": true,
	".amr": true,
}

var imageExts = map[string]bool{
	".jpg": true, ".jpeg": true, ".png": true,
	".gif": true, ".bmp": true, ".webp": true,
	".svg": true, ".tiff": true,
}

// IsVideoFile returns true if the filename has a recognised video extension.
func IsVideoFile(filename string) bool {
	return videoExts[GetFileExtension(filename)]
}

// IsAudioFile returns true if the filename has a recognised audio extension.
func IsAudioFile(filename string) bool {
	return audioExts[GetFileExtension(filename)]
}

// IsImageFile returns true if the filename has a recognised image extension.
func IsImageFile(filename string) bool {
	return imageExts[GetFileExtension(filename)]
}

// IsMediaFile returns true for any supported media file.
func IsMediaFile(filename string) bool {
	return IsVideoFile(filename) || IsAudioFile(filename) || IsImageFile(filename)
}

// ─── Filename Sanitisation ───────────────────────────────────────────────────

// SanitizeFilename strips or replaces characters that are unsafe in file paths.
func SanitizeFilename(filename string) string {
	invalid := []string{"/", "\\", ":", "*", "?", "\"", "<", ">", "|", "\x00"}
	result := filename
	for _, ch := range invalid {
		result = strings.ReplaceAll(result, ch, "_")
	}
	// Collapse consecutive underscores
	for strings.Contains(result, "__") {
		result = strings.ReplaceAll(result, "__", "_")
	}
	result = strings.Trim(result, "._")
	if result == "" {
		result = "unnamed"
	}
	return result
}

// ─── Directory Helpers ───────────────────────────────────────────────────────

// EnsureDir creates a directory tree if it does not exist.
func EnsureDir(path string) error {
	return os.MkdirAll(path, 0755)
}

// EnsureDirs creates multiple directory trees.
func EnsureDirs(paths ...string) error {
	for _, p := range paths {
		if err := EnsureDir(p); err != nil {
			return fmt.Errorf("ensure dir %s: %w", p, err)
		}
	}
	return nil
}

// FileExists returns true when the path exists and is a regular file.
func FileExists(path string) bool {
	info, err := os.Stat(path)
	return err == nil && !info.IsDir()
}

// DirExists returns true when the path exists and is a directory.
func DirExists(path string) bool {
	info, err := os.Stat(path)
	return err == nil && info.IsDir()
}

// ─── Checksum ────────────────────────────────────────────────────────────────

// FileChecksum computes the SHA-256 hex digest of a file.
func FileChecksum(path string) (string, error) {
	f, err := os.Open(path)
	if err != nil {
		return "", fmt.Errorf("open file: %w", err)
	}
	defer f.Close()

	h := sha256.New()
	if _, err := io.Copy(h, f); err != nil {
		return "", fmt.Errorf("hash file: %w", err)
	}
	return fmt.Sprintf("%x", h.Sum(nil)), nil
}

// ─── File Size Formatting ────────────────────────────────────────────────────

// FormatBytes returns a human-readable byte string (e.g. "12.3 MB").
func FormatBytes(bytes int64) string {
	const unit = 1024
	if bytes < unit {
		return fmt.Sprintf("%d B", bytes)
	}
	div, exp := int64(unit), 0
	for n := bytes / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %cB", float64(bytes)/float64(div), "KMGTPE"[exp])
}

// ─── Cleanup ─────────────────────────────────────────────────────────────────

// CleanupOldFiles removes files in dir older than maxAge.
func CleanupOldFiles(dir string, maxAge time.Duration) (int, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return 0, fmt.Errorf("read dir: %w", err)
	}

	cutoff := time.Now().Add(-maxAge)
	removed := 0
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		info, err := entry.Info()
		if err != nil {
			continue
		}
		if info.ModTime().Before(cutoff) {
			_ = os.Remove(filepath.Join(dir, entry.Name()))
			removed++
		}
	}
	return removed, nil
}

// DirSize returns the total size (bytes) of all files in a directory tree.
func DirSize(path string) (int64, error) {
	var size int64
	err := filepath.Walk(path, func(_ string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() {
			size += info.Size()
		}
		return nil
	})
	return size, err
}
