package services

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/aistudio/go-backend/internal/models"
)

// ─── Types ─────────────────────────────────────────────────

type PythonClient struct {
	baseURL string
	client  *http.Client
}

type ProgressCallback func(progress int, message string)

type pythonResponse struct {
	Status   string `json:"status"`
	Progress int    `json:"progress"`
	Message  string `json:"message"`
	Result   string `json:"result"`
	Error    string `json:"error"`
}

func NewPythonClient(baseURL string) *PythonClient {
	return &PythonClient{
		baseURL: baseURL,
		client: &http.Client{
			Timeout: 30 * time.Minute, // generous timeout for large media
			Transport: &http.Transport{
				MaxIdleConns:        20,
				MaxIdleConnsPerHost: 10,
				IdleConnTimeout:     90 * time.Second,
			},
		},
	}
}

// ─── HTTP Helpers ──────────────────────────────────────────

func (p *PythonClient) postJSON(endpoint string, body interface{}) (*http.Response, error) {
	jsonData, err := json.Marshal(body)
	if err != nil {
		return nil, fmt.Errorf("marshal: %w", err)
	}

	req, err := http.NewRequest("POST", p.baseURL+endpoint, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("new request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	resp, err := p.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request to %s failed: %w", endpoint, err)
	}
	return resp, nil
}

// postJSONWithRetry retries transient failures up to maxRetries times.
func (p *PythonClient) postJSONWithRetry(endpoint string, body interface{}, maxRetries int) (*http.Response, error) {
	var lastErr error
	for attempt := 0; attempt <= maxRetries; attempt++ {
		resp, err := p.postJSON(endpoint, body)
		if err == nil {
			return resp, nil
		}
		lastErr = err
		if attempt < maxRetries {
			backoff := time.Duration(attempt+1) * 2 * time.Second
			log.Printf("[python] Retry %d/%d for %s after %v: %v", attempt+1, maxRetries, endpoint, backoff, err)
			time.Sleep(backoff)
		}
	}
	return nil, fmt.Errorf("all %d retries failed for %s: %w", maxRetries, endpoint, lastErr)
}

// readStreamedProgress reads newline-delimited JSON progress from the response body.
func (p *PythonClient) readStreamedProgress(resp *http.Response, callback ProgressCallback) error {
	scanner := bufio.NewScanner(resp.Body)
	scanner.Buffer(make([]byte, 64*1024), 256*1024)

	gotProgress := false
	for scanner.Scan() {
		line := scanner.Bytes()
		if len(line) == 0 {
			continue
		}
		var pr pythonResponse
		if err := json.Unmarshal(line, &pr); err != nil {
			continue // skip non-JSON lines
		}
		gotProgress = true
		if pr.Error != "" {
			callback(pr.Progress, fmt.Sprintf("Error: %s", pr.Error))
			return fmt.Errorf("python error: %s", pr.Error)
		}
		callback(pr.Progress, pr.Message)
	}
	if !gotProgress {
		return nil // not streamed
	}
	return scanner.Err()
}

func (p *PythonClient) readSingleResponse(resp *http.Response) (*pythonResponse, error) {
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read body: %w", err)
	}
	var pr pythonResponse
	if err := json.Unmarshal(body, &pr); err != nil {
		return nil, fmt.Errorf("unmarshal: %w (body=%s)", err, string(body[:min(len(body), 200)]))
	}
	return &pr, nil
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// ─── Service Methods ───────────────────────────────────────

func (p *PythonClient) ProcessVideo(videoPath, taskID string, operations []models.Operation, callback ProgressCallback) {
	reqBody := map[string]interface{}{
		"video_path": videoPath,
		"task_id":    taskID,
		"operations": operations,
	}

	callback(0, "Sending to video processor...")

	resp, err := p.postJSONWithRetry("/process_video", reqBody, 2)
	if err != nil {
		callback(0, fmt.Sprintf("Cannot reach video service: %v", err))
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		callback(0, fmt.Sprintf("Video service error (status %d): %s", resp.StatusCode, string(body[:min(len(body), 200)])))
		return
	}

	if err := p.readStreamedProgress(resp, callback); err != nil {
		callback(0, fmt.Sprintf("Processing error: %v", err))
		return
	}
	callback(100, "Video processing complete")
}

func (p *PythonClient) TranscribeAudio(filePath, taskID, language, model string, callback ProgressCallback) {
	reqBody := map[string]interface{}{
		"file_path": filePath,
		"task_id":   taskID,
		"language":  language,
		"model":     model,
	}

	callback(0, "Sending to transcription service...")

	resp, err := p.postJSONWithRetry("/transcribe", reqBody, 2)
	if err != nil {
		callback(0, fmt.Sprintf("Cannot reach STT service: %v", err))
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		callback(0, fmt.Sprintf("STT error (status %d): %s", resp.StatusCode, string(body[:min(len(body), 200)])))
		return
	}

	if err := p.readStreamedProgress(resp, callback); err != nil {
		callback(0, fmt.Sprintf("Transcription error: %v", err))
		return
	}
	callback(100, "Transcription complete")
}

func (p *PythonClient) GenerateSpeech(text, voice string, speed, pitch float64, taskID string, callback ProgressCallback) {
	reqBody := map[string]interface{}{
		"text":    text,
		"voice":   voice,
		"speed":   speed,
		"pitch":   pitch,
		"task_id": taskID,
	}

	callback(0, "Generating speech...")

	resp, err := p.postJSONWithRetry("/generate_speech", reqBody, 1)
	if err != nil {
		callback(0, fmt.Sprintf("Cannot reach TTS service: %v", err))
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		callback(0, fmt.Sprintf("TTS error (status %d): %s", resp.StatusCode, string(body[:min(len(body), 200)])))
		return
	}

	pr, err := p.readSingleResponse(resp)
	if err != nil {
		callback(0, fmt.Sprintf("Response parse error: %v", err))
		return
	}
	if pr.Error != "" {
		callback(0, fmt.Sprintf("TTS error: %s", pr.Error))
		return
	}
	callback(100, "Speech generated")
}

func (p *PythonClient) BatchGenerateSpeech(segments []models.Segment, speed float64, taskID string, callback ProgressCallback) {
	reqBody := map[string]interface{}{
		"segments": segments,
		"speed":    speed,
		"task_id":  taskID,
	}

	callback(0, "Starting batch generation...")

	resp, err := p.postJSONWithRetry("/batch_generate", reqBody, 1)
	if err != nil {
		callback(0, fmt.Sprintf("Cannot reach TTS service: %v", err))
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		callback(0, fmt.Sprintf("TTS batch error (status %d): %s", resp.StatusCode, string(body[:min(len(body), 200)])))
		return
	}

	if err := p.readStreamedProgress(resp, callback); err != nil {
		callback(0, fmt.Sprintf("Batch error: %v", err))
		return
	}
	callback(100, "Batch generation complete")
}
