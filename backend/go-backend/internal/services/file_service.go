package services

import (
	"crypto/sha256"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"time"
)

// ─── File Service ──────────────────────────────────────────

type FileService struct{}

func NewFileService() *FileService {
	return &FileService{}
}

// EnsureDirs creates all required temp directories.
func (s *FileService) EnsureDirs() {
	dirs := []string{
		"temp/uploads",
		"temp/processed",
		"temp/downloads",
	}
	for _, dir := range dirs {
		if err := os.MkdirAll(dir, 0755); err != nil {
			log.Printf("[file] Failed to create directory %s: %v", dir, err)
		}
	}
}

// SaveFile writes data from a reader to the given path, creating directories as needed.
func (s *FileService) SaveFile(data io.Reader, filePath string) error {
	dir := filepath.Dir(filePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("mkdir %s: %w", dir, err)
	}

	file, err := os.Create(filePath)
	if err != nil {
		return fmt.Errorf("create %s: %w", filePath, err)
	}
	defer file.Close()

	if _, err := io.Copy(file, data); err != nil {
		return fmt.Errorf("write %s: %w", filePath, err)
	}
	return nil
}

// DeleteFile removes a file at the given path.
func (s *FileService) DeleteFile(filePath string) error {
	if err := os.Remove(filePath); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("delete %s: %w", filePath, err)
	}
	return nil
}

// FileExists checks if a file exists and is not a directory.
func (s *FileService) FileExists(filePath string) bool {
	info, err := os.Stat(filePath)
	return err == nil && !info.IsDir()
}

// GetFileSize returns the file size in bytes.
func (s *FileService) GetFileSize(filePath string) (int64, error) {
	info, err := os.Stat(filePath)
	if err != nil {
		return 0, fmt.Errorf("stat %s: %w", filePath, err)
	}
	return info.Size(), nil
}

// GetFileChecksum returns the SHA-256 hex digest of a file.
func (s *FileService) GetFileChecksum(filePath string) (string, error) {
	f, err := os.Open(filePath)
	if err != nil {
		return "", fmt.Errorf("open %s: %w", filePath, err)
	}
	defer f.Close()

	h := sha256.New()
	if _, err := io.Copy(h, f); err != nil {
		return "", fmt.Errorf("hash %s: %w", filePath, err)
	}
	return fmt.Sprintf("%x", h.Sum(nil)), nil
}

// CleanupOldFiles removes files older than maxAge from the given directory.
func (s *FileService) CleanupOldFiles(dir string, maxAge time.Duration) (int, error) {
	removed := 0
	cutoff := time.Now().Add(-maxAge)

	entries, err := os.ReadDir(dir)
	if err != nil {
		return 0, fmt.Errorf("readdir %s: %w", dir, err)
	}

	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		info, err := entry.Info()
		if err != nil {
			continue
		}
		if info.ModTime().Before(cutoff) {
			path := filepath.Join(dir, entry.Name())
			if err := os.Remove(path); err == nil {
				removed++
			}
		}
	}
	return removed, nil
}

// GetDiskUsage returns total bytes used in a directory (non-recursive).
func (s *FileService) GetDiskUsage(dir string) (int64, error) {
	var total int64
	entries, err := os.ReadDir(dir)
	if err != nil {
		return 0, fmt.Errorf("readdir %s: %w", dir, err)
	}
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		info, err := entry.Info()
		if err != nil {
			continue
		}
		total += info.Size()
	}
	return total, nil
}
