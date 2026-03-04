package models

import (
	"fmt"
	"time"
)

// ─── Task Status Constants ───────────────────────────────────────────────────

const (
	TaskStatusPending    = "pending"
	TaskStatusRunning    = "running"
	TaskStatusCompleted  = "completed"
	TaskStatusFailed     = "failed"
	TaskStatusCancelled  = "cancelled"
)

// ─── Task Type Constants ─────────────────────────────────────────────────────

const (
	TaskTypeDownload      = "download"
	TaskTypeVideoProcess  = "video_process"
	TaskTypeTranscription = "transcription"
	TaskTypeTTS           = "tts"
	TaskTypeBatchTTS      = "batch_tts"
)

// ─── Task ────────────────────────────────────────────────────────────────────

// Task represents a long-running background job.
type Task struct {
	ID         string    `json:"id"`
	Type       string    `json:"type"`
	Status     string    `json:"status"`
	Progress   int       `json:"progress"`
	Message    string    `json:"message"`
	VideoID    string    `json:"video_id,omitempty"`
	Result     string    `json:"result,omitempty"`
	Error      string    `json:"error,omitempty"`
	OutputPath string    `json:"output_path,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
	StartedAt  time.Time `json:"started_at,omitempty"`
	Duration   float64   `json:"duration_secs,omitempty"` // elapsed seconds
}

// IsDone returns true when the task is in a terminal state.
func (t *Task) IsDone() bool {
	switch t.Status {
	case TaskStatusCompleted, TaskStatusFailed, TaskStatusCancelled:
		return true
	}
	return false
}

// Fail sets the task to a failed state with an error message.
func (t *Task) Fail(err string) {
	t.Status = TaskStatusFailed
	t.Error = err
	t.Progress = 0
	t.UpdatedAt = time.Now()
	if !t.StartedAt.IsZero() {
		t.Duration = time.Since(t.StartedAt).Seconds()
	}
}

// Complete marks the task as successfully finished.
func (t *Task) Complete(result string) {
	t.Status = TaskStatusCompleted
	t.Progress = 100
	t.Result = result
	t.Error = ""
	t.UpdatedAt = time.Now()
	if !t.StartedAt.IsZero() {
		t.Duration = time.Since(t.StartedAt).Seconds()
	}
}

// Start marks the task as running.
func (t *Task) Start() {
	t.Status = TaskStatusRunning
	t.StartedAt = time.Now()
	t.UpdatedAt = time.Now()
}

// SetProgress updates the percentage and optional message.
func (t *Task) SetProgress(pct int, msg string) {
	if pct < 0 {
		pct = 0
	} else if pct > 100 {
		pct = 100
	}
	t.Progress = pct
	if msg != "" {
		t.Message = msg
	}
	t.UpdatedAt = time.Now()
}

// ToMap converts the task to a map suitable for Redis HSet.
func (t *Task) ToMap() map[string]interface{} {
	return map[string]interface{}{
		"id":          t.ID,
		"type":        t.Type,
		"status":      t.Status,
		"progress":    t.Progress,
		"message":     t.Message,
		"video_id":    t.VideoID,
		"result":      t.Result,
		"error":       t.Error,
		"output_path": t.OutputPath,
		"created_at":  t.CreatedAt.Format(time.RFC3339),
		"updated_at":  t.UpdatedAt.Format(time.RFC3339),
		"started_at":  t.StartedAt.Format(time.RFC3339),
		"duration":    fmt.Sprintf("%.2f", t.Duration),
	}
}

// NewTask constructs a task in the pending state.
func NewTask(id, taskType string) *Task {
	now := time.Now()
	return &Task{
		ID:        id,
		Type:      taskType,
		Status:    TaskStatusPending,
		Progress:  0,
		CreatedAt: now,
		UpdatedAt: now,
	}
}

// ─── Segment ─────────────────────────────────────────────────────────────────

// Segment represents one block of transcribed speech.
type Segment struct {
	Start     float64 `json:"start"`
	End       float64 `json:"end"`
	Timestamp string  `json:"timestamp"`
	Text      string  `json:"text"`
	Language  string  `json:"language,omitempty"`
	Gender    string  `json:"gender,omitempty"`
	Speaker   string  `json:"speaker,omitempty"`
	Speed     float64 `json:"speed,omitempty"`
}

// DurationSecs returns the segment length.
func (s *Segment) DurationSecs() float64 {
	return s.End - s.Start
}
