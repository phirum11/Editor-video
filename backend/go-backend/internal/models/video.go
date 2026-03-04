package models

import "time"

// ─── Operation ───────────────────────────────────────────────────────────────

// Operation describes a single editing action to apply to a video.
type Operation struct {
	Type   string                 `json:"type"`
	Params map[string]interface{} `json:"params"`
}

// Validate performs a basic sanity check on the operation.
func (o *Operation) Validate() bool {
	return o.Type != "" && o.Params != nil
}

// ─── VideoInfo ───────────────────────────────────────────────────────────────

// VideoInfo holds technical details returned by analysis of a file.
type VideoInfo struct {
	Duration   float64 `json:"duration"`
	Width      int     `json:"width"`
	Height     int     `json:"height"`
	FPS        float64 `json:"fps"`
	Bitrate    int64   `json:"bitrate,omitempty"`
	Codec      string  `json:"codec,omitempty"`
	AudioCodec string  `json:"audio_codec,omitempty"`
	HasAudio   bool    `json:"has_audio"`
	FileSize   int64   `json:"file_size,omitempty"`
	Format     string  `json:"format,omitempty"`
}

// ResolutionLabel returns a human-readable label like "1080p".
func (v *VideoInfo) ResolutionLabel() string {
	switch {
	case v.Height >= 2160:
		return "4K"
	case v.Height >= 1440:
		return "1440p"
	case v.Height >= 1080:
		return "1080p"
	case v.Height >= 720:
		return "720p"
	case v.Height >= 480:
		return "480p"
	default:
		return "SD"
	}
}

// ─── VideoMetadata ───────────────────────────────────────────────────────────

// VideoMetadata is the stored record for an uploaded video.
type VideoMetadata struct {
	ID         string    `json:"id"`
	Path       string    `json:"path"`
	Filename   string    `json:"filename"`
	Size       int64     `json:"size"`
	Duration   float64   `json:"duration"`
	Width      int       `json:"width"`
	Height     int       `json:"height"`
	FPS        float64   `json:"fps,omitempty"`
	Codec      string    `json:"codec,omitempty"`
	MimeType   string    `json:"mime_type,omitempty"`
	Checksum   string    `json:"checksum,omitempty"`
	Uploaded   time.Time `json:"uploaded"`
	ProcessedAt time.Time `json:"processed_at,omitempty"`
}

// SizeMB returns the size in megabytes.
func (v *VideoMetadata) SizeMB() float64 {
	return float64(v.Size) / (1024 * 1024)
}

// ─── Download Models ─────────────────────────────────────────────────────────

// DownloadRequest represents a user's download request.
type DownloadRequest struct {
	URL      string `json:"url" binding:"required"`
	Format   string `json:"format,omitempty"`
	Quality  string `json:"quality,omitempty"`
	AudioOnly bool  `json:"audio_only,omitempty"`
}

// DownloadInfo holds metadata about a remote video/audio source.
type DownloadInfo struct {
	Title       string  `json:"title"`
	Duration    float64 `json:"duration"`
	Thumbnail   string  `json:"thumbnail"`
	Description string  `json:"description,omitempty"`
	Uploader    string  `json:"uploader,omitempty"`
	UploadDate  string  `json:"upload_date,omitempty"`
	ViewCount   int64   `json:"view_count,omitempty"`
	LikeCount   int64   `json:"like_count,omitempty"`
	Formats     []FormatOption `json:"formats,omitempty"`
}

// FormatOption describes an available format/quality combination.
type FormatOption struct {
	FormatID   string `json:"format_id"`
	Ext        string `json:"ext"`
	Resolution string `json:"resolution,omitempty"`
	FileSize   int64  `json:"file_size,omitempty"`
	Note       string `json:"note,omitempty"`
}

// ─── Export Models ───────────────────────────────────────────────────────────

// ExportRequest describes the desired output from the video editor.
type ExportRequest struct {
	VideoID    string      `json:"video_id" binding:"required"`
	Format     string      `json:"format"`
	Resolution string      `json:"resolution"`
	Quality    string      `json:"quality"`
	Codec      string      `json:"codec"`
	FPS        int         `json:"fps"`
	Operations []Operation `json:"operations,omitempty"`
}
