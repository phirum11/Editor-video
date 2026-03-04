package utils

import (
	"net/url"
	"regexp"
	"strings"
	"unicode/utf8"
)

// ─── Pre-compiled Patterns ───────────────────────────────────────────────────

var (
	emailRe    = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	youtubeRe  = regexp.MustCompile(`(?:youtube\.com/(?:watch\?v=|embed/|v/|live/|shorts/)|youtu\.be/)([a-zA-Z0-9_-]{11})`)
	videoIDRe  = regexp.MustCompile(`^[a-zA-Z0-9_-]{11}$`)
	hexColorRe = regexp.MustCompile(`^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$`)
)

// ─── URL Validation ──────────────────────────────────────────────────────────

// IsValidURL reports whether str is a well-formed absolute URL.
func IsValidURL(str string) bool {
	u, err := url.Parse(str)
	if err != nil {
		return false
	}
	return (u.Scheme == "http" || u.Scheme == "https") && u.Host != ""
}

// IsValidYouTubeURL checks that url points to a YouTube video.
func IsValidYouTubeURL(rawURL string) bool {
	return youtubeRe.MatchString(rawURL)
}

// ExtractVideoID pulls the 11-char video ID from a YouTube URL.
func ExtractVideoID(rawURL string) string {
	m := youtubeRe.FindStringSubmatch(rawURL)
	if len(m) < 2 {
		return ""
	}
	return m[1]
}

// IsValidVideoID checks a standalone 11-character YouTube video ID.
func IsValidVideoID(id string) bool {
	return videoIDRe.MatchString(id)
}

// ─── Email ───────────────────────────────────────────────────────────────────

// IsValidEmail performs a basic RFC-ish email syntax check.
func IsValidEmail(email string) bool {
	if len(email) > 254 {
		return false
	}
	return emailRe.MatchString(email)
}

// ─── String Validators ───────────────────────────────────────────────────────

// IsNonEmpty returns true if s contains at least one non-whitespace character.
func IsNonEmpty(s string) bool {
	return strings.TrimSpace(s) != ""
}

// IsValidLength checks that s has between min and max UTF-8 characters.
func IsValidLength(s string, min, max int) bool {
	n := utf8.RuneCountInString(s)
	return n >= min && n <= max
}

// IsHexColor validates CSS hex colour strings (#abc or #aabbcc).
func IsHexColor(s string) bool {
	return hexColorRe.MatchString(s)
}

// ─── Numeric Helpers ─────────────────────────────────────────────────────────

// ClampInt constrains v to [lo, hi].
func ClampInt(v, lo, hi int) int {
	if v < lo {
		return lo
	}
	if v > hi {
		return hi
	}
	return v
}

// ClampFloat64 constrains v to [lo, hi].
func ClampFloat64(v, lo, hi float64) float64 {
	if v < lo {
		return lo
	}
	if v > hi {
		return hi
	}
	return v
}

// ─── Slice Helpers ───────────────────────────────────────────────────────────

// ContainsString reports whether slice contains s.
func ContainsString(slice []string, s string) bool {
	for _, v := range slice {
		if v == s {
			return true
		}
	}
	return false
}
