package services

import (
	"bufio"
	"encoding/json"
	"fmt"
	"log"
	"os/exec"
	"regexp"
	"strconv"
	"strings"
)

// ─── Types ─────────────────────────────────────────────────

type DownloadService struct{}

func NewDownloadService() *DownloadService {
	return &DownloadService{}
}

type DownloadCallback func(progress int, speed string, message string)

// DownloadOptions holds typed download configuration.
type DownloadOptions struct {
	Format       string
	Quality      string
	AudioFormat  string
	AudioQuality string
	ExtractAudio bool
}

// progress regex: matches lines like "[download]  45.2% of ~   5.23MiB at  1.02MiB/s"
var dlProgressRe = regexp.MustCompile(`\[download\]\s+(\d+(?:\.\d+)?)%.*?at\s+(\S+)`)

// ─── Start Download ────────────────────────────────────────

func (s *DownloadService) StartDownload(url, taskID string, opts DownloadOptions, callback DownloadCallback) {
	callback(0, "Starting", "Preparing download...")

	args := s.buildArgs(url, opts)
	cmd := exec.Command("yt-dlp", args...)

	// Pipe stdout for real-time progress
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		callback(0, "0 KB/s", fmt.Sprintf("Error: %v", err))
		return
	}
	cmd.Stderr = cmd.Stdout // merge stderr into stdout

	if err := cmd.Start(); err != nil {
		callback(0, "0 KB/s", fmt.Sprintf("Failed to start yt-dlp: %v", err))
		return
	}

	scanner := bufio.NewScanner(stdout)
	for scanner.Scan() {
		line := scanner.Text()
		if matches := dlProgressRe.FindStringSubmatch(line); len(matches) >= 3 {
			pctF, _ := strconv.ParseFloat(matches[1], 64)
			pct := int(pctF)
			speed := matches[2]
			callback(pct, speed, fmt.Sprintf("Downloading: %d%%", pct))
		} else if strings.Contains(line, "[download] 100%") || strings.Contains(line, "has already been downloaded") {
			callback(100, "Complete", "Download completed")
		} else if strings.Contains(line, "ERROR") || strings.Contains(line, "error") {
			callback(0, "0 KB/s", line)
		}
	}

	if err := cmd.Wait(); err != nil {
		log.Printf("[download] yt-dlp exited with error: %v", err)
		callback(0, "0 KB/s", fmt.Sprintf("Download error: %v", err))
		return
	}

	callback(100, "Complete", "Download completed successfully")
}

func (s *DownloadService) buildArgs(url string, opts DownloadOptions) []string {
	args := []string{"--newline", "--no-warnings"}

	if opts.ExtractAudio || opts.Format == "audio" {
		audioFmt := opts.AudioFormat
		if audioFmt == "" {
			audioFmt = "mp3"
		}
		audioQuality := opts.AudioQuality
		if audioQuality == "" {
			audioQuality = "192"
		}
		args = append(args, "-f", "bestaudio", "--extract-audio",
			"--audio-format", audioFmt,
			"--audio-quality", audioQuality)
	} else {
		quality := opts.Quality
		if quality == "" || quality == "best" {
			quality = "bestvideo+bestaudio/best"
		}
		args = append(args, "-f", quality, "--merge-output-format", "mp4")
	}

	args = append(args, "-o", "temp/downloads/%(title)s.%(ext)s", url)
	return args
}

// ─── Info ──────────────────────────────────────────────────

func (s *DownloadService) GetInfo(url string) (map[string]interface{}, error) {
	cmd := exec.Command("yt-dlp", "--dump-json", "--no-download", "--no-warnings", url)
	output, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("yt-dlp info failed: %w", err)
	}

	var info map[string]interface{}
	if err := json.Unmarshal(output, &info); err != nil {
		return nil, fmt.Errorf("parse error: %w", err)
	}

	return map[string]interface{}{
		"title":       info["title"],
		"description": info["description"],
		"duration":    info["duration"],
		"thumbnail":   info["thumbnail"],
		"uploader":    info["uploader"],
		"view_count":  info["view_count"],
		"upload_date": info["upload_date"],
		"like_count":  info["like_count"],
		"url":         url,
	}, nil
}

// ─── Formats ───────────────────────────────────────────────

func (s *DownloadService) GetFormats(url string) ([]map[string]interface{}, error) {
	cmd := exec.Command("yt-dlp", "--dump-json", "--no-download", "--no-warnings", url)
	output, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("yt-dlp formats failed: %w", err)
	}

	var info map[string]interface{}
	if err := json.Unmarshal(output, &info); err != nil {
		return nil, fmt.Errorf("parse error: %w", err)
	}

	var formats []map[string]interface{}
	if rawFormats, ok := info["formats"].([]interface{}); ok {
		for _, f := range rawFormats {
			fm, ok := f.(map[string]interface{})
			if !ok {
				continue
			}
			ext, _ := fm["ext"].(string)
			if ext == "mp4" || ext == "webm" || ext == "m4a" || ext == "mp3" || ext == "opus" {
				formats = append(formats, map[string]interface{}{
					"format_id":    fm["format_id"],
					"ext":          ext,
					"resolution":   fm["resolution"],
					"filesize":     fm["filesize"],
					"vcodec":       fm["vcodec"],
					"acodec":       fm["acodec"],
					"format_note":  fm["format_note"],
					"fps":          fm["fps"],
					"tbr":          fm["tbr"],
				})
			}
		}
	}

	// Fallback: parse text output
	if len(formats) == 0 {
		cmd2 := exec.Command("yt-dlp", "-F", "--no-warnings", url)
		output2, _ := cmd2.Output()
		for _, line := range strings.Split(string(output2), "\n") {
			trimmed := strings.TrimSpace(line)
			if strings.Contains(trimmed, "mp4") || strings.Contains(trimmed, "webm") {
				formats = append(formats, map[string]interface{}{"format": trimmed})
			}
		}
	}

	return formats, nil
}
