// ===== API Constants =====
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080'

// ===== App Constants =====
export const APP_NAME = 'AI Studio Pro'
export const APP_VERSION = '1.0.0'
export const APP_DESCRIPTION = 'Professional AI-powered audio and video processing suite'

// ===== Storage Keys =====
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
  SETTINGS: 'settings',
  HISTORY: 'history',
  FAVORITES: 'favorites',
  DOWNLOADS: 'downloads',
  RECENT_PROJECTS: 'recentProjects'
}

// ===== Route Paths =====
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  
  // Features
  VIDEO_EDITOR: '/video-editor',
  SPEECH_TO_TEXT: '/speech-to-text',
  TEXT_TO_SPEECH: '/text-to-speech',
  DOWNLOADER: '/downloader',
  
  // Admin
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_STATS: '/admin/stats',
  
  // Error
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/401',
  SERVER_ERROR: '/500'
}

// ===== File Types =====
export const FILE_TYPES = {
  VIDEO: ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv', 'm4v'],
  AUDIO: ['mp3', 'wav', 'm4a', 'flac', 'ogg', 'aac', 'wma', 'opus'],
  IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
  DOCUMENT: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'],
  SUBTITLE: ['srt', 'vtt', 'ass', 'ssa'],
  ARCHIVE: ['zip', 'rar', '7z', 'tar', 'gz']
}

// ===== MIME Types =====
export const MIME_TYPES = {
  // Video
  'mp4': 'video/mp4',
  'avi': 'video/x-msvideo',
  'mov': 'video/quicktime',
  'mkv': 'video/x-matroska',
  'webm': 'video/webm',
  'flv': 'video/x-flv',
  
  // Audio
  'mp3': 'audio/mpeg',
  'wav': 'audio/wav',
  'm4a': 'audio/mp4',
  'flac': 'audio/flac',
  'ogg': 'audio/ogg',
  'aac': 'audio/aac',
  
  // Image
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'webp': 'image/webp',
  'svg': 'image/svg+xml',
  
  // Document
  'pdf': 'application/pdf',
  'doc': 'application/msword',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'txt': 'text/plain',
  
  // Subtitle
  'srt': 'application/x-subrip',
  'vtt': 'text/vtt',
  
  // Archive
  'zip': 'application/zip',
  'rar': 'application/x-rar-compressed'
}

// ===== Video Qualities =====
export const VIDEO_QUALITIES = [
  { value: 'auto', label: 'Auto', resolution: null },
  { value: '2160p', label: '4K', resolution: 2160 },
  { value: '1440p', label: '2K', resolution: 1440 },
  { value: '1080p', label: '1080p', resolution: 1080 },
  { value: '720p', label: '720p', resolution: 720 },
  { value: '480p', label: '480p', resolution: 480 },
  { value: '360p', label: '360p', resolution: 360 },
  { value: '240p', label: '240p', resolution: 240 }
]

// ===== Audio Formats =====
export const AUDIO_FORMATS = [
  { value: 'mp3', label: 'MP3', bitrates: [128, 192, 256, 320] },
  { value: 'm4a', label: 'M4A', bitrates: [128, 192, 256, 320] },
  { value: 'wav', label: 'WAV', bitrates: null },
  { value: 'flac', label: 'FLAC', bitrates: null },
  { value: 'ogg', label: 'OGG', bitrates: [128, 192, 256, 320] },
  { value: 'opus', label: 'OPUS', bitrates: [64, 96, 128, 160, 192] }
]

// ===== Supported Languages =====
export const LANGUAGES = [
  { code: 'auto', name: 'Auto Detect', nativeName: 'Auto' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'km', name: 'Khmer', nativeName: 'ភាសាខ្មែរ' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' }
]

// ===== TTS Voices =====
export const TTS_VOICES = [
  // Khmer
  { id: 'km-KH-SreymomNeural', name: 'Sreymom', language: 'km', gender: 'female', locale: 'km-KH' },
  { id: 'km-KH-ThearithNeural', name: 'Thearith', language: 'km', gender: 'male', locale: 'km-KH' },
  
  // English
  { id: 'en-US-JennyNeural', name: 'Jenny', language: 'en', gender: 'female', locale: 'en-US' },
  { id: 'en-US-GuyNeural', name: 'Guy', language: 'en', gender: 'male', locale: 'en-US' },
  { id: 'en-GB-SoniaNeural', name: 'Sonia', language: 'en', gender: 'female', locale: 'en-GB' },
  { id: 'en-GB-RyanNeural', name: 'Ryan', language: 'en', gender: 'male', locale: 'en-GB' },
  
  // Chinese
  { id: 'zh-CN-XiaoxiaoNeural', name: 'Xiaoxiao', language: 'zh', gender: 'female', locale: 'zh-CN' },
  { id: 'zh-CN-YunxiNeural', name: 'Yunxi', language: 'zh', gender: 'male', locale: 'zh-CN' },
  
  // Japanese
  { id: 'ja-JP-NanamiNeural', name: 'Nanami', language: 'ja', gender: 'female', locale: 'ja-JP' },
  { id: 'ja-JP-KeitaNeural', name: 'Keita', language: 'ja', gender: 'male', locale: 'ja-JP' },
  
  // Korean
  { id: 'ko-KR-SunHiNeural', name: 'SunHi', language: 'ko', gender: 'female', locale: 'ko-KR' },
  { id: 'ko-KR-InJoonNeural', name: 'InJoon', language: 'ko', gender: 'male', locale: 'ko-KR' }
]

// ===== Video Editor Effects =====
export const VIDEO_EFFECTS = {
  COLOR: [
    { id: 'brightness', name: 'Brightness', type: 'slider', min: -100, max: 100, default: 0 },
    { id: 'contrast', name: 'Contrast', type: 'slider', min: -100, max: 100, default: 0 },
    { id: 'saturation', name: 'Saturation', type: 'slider', min: -100, max: 100, default: 0 },
    { id: 'hue', name: 'Hue', type: 'slider', min: -180, max: 180, default: 0 },
    { id: 'temperature', name: 'Temperature', type: 'slider', min: -100, max: 100, default: 0 }
  ],
  FILTERS: [
    { id: 'blur', name: 'Blur', type: 'slider', min: 0, max: 100, default: 0 },
    { id: 'sharpen', name: 'Sharpen', type: 'slider', min: 0, max: 100, default: 0 },
    { id: 'noise', name: 'Noise', type: 'slider', min: 0, max: 100, default: 0 },
    { id: 'pixelate', name: 'Pixelate', type: 'slider', min: 0, max: 50, default: 0 }
  ],
  TRANSFORM: [
    { id: 'position', name: 'Position', type: 'vector2', x: 0, y: 0 },
    { id: 'scale', name: 'Scale', type: 'slider', min: 0, max: 200, default: 100 },
    { id: 'rotation', name: 'Rotation', type: 'slider', min: -180, max: 180, default: 0 },
    { id: 'opacity', name: 'Opacity', type: 'slider', min: 0, max: 100, default: 100 }
  ],
  AUDIO: [
    { id: 'volume', name: 'Volume', type: 'slider', min: 0, max: 200, default: 100 },
    { id: 'fadeIn', name: 'Fade In', type: 'slider', min: 0, max: 10, default: 0 },
    { id: 'fadeOut', name: 'Fade Out', type: 'slider', min: 0, max: 10, default: 0 },
    { id: 'reverb', name: 'Reverb', type: 'slider', min: 0, max: 100, default: 0 }
  ]
}

// ===== Download Platforms =====
export const DOWNLOAD_PLATFORMS = [
  { name: 'YouTube', domains: ['youtube.com', 'youtu.be'], icon: '📺', color: '#FF0000' },
  { name: 'Vimeo', domains: ['vimeo.com'], icon: '🎥', color: '#1AB7EA' },
  { name: 'Dailymotion', domains: ['dailymotion.com'], icon: '🎬', color: '#0066DC' },
  { name: 'SoundCloud', domains: ['soundcloud.com'], icon: '🎵', color: '#FF7700' },
  { name: 'Facebook', domains: ['facebook.com'], icon: '📘', color: '#1877F2' },
  { name: 'Instagram', domains: ['instagram.com'], icon: '📷', color: '#E4405F' },
  { name: 'Twitter', domains: ['twitter.com', 'x.com'], icon: '🐦', color: '#1DA1F2' },
  { name: 'TikTok', domains: ['tiktok.com'], icon: '🎵', color: '#000000' }
]

// ===== Theme Options =====
export const THEMES = [
  { id: 'light', name: 'Light', icon: '☀️' },
  { id: 'dark', name: 'Dark', icon: '🌙' },
  { id: 'sepia', name: 'Sepia', icon: '📜' },
  { id: 'forest', name: 'Forest', icon: '🌲' },
  { id: 'ocean', name: 'Ocean', icon: '🌊' }
]

// ===== Animation Presets =====
export const ANIMATIONS = {
  FADE_IN: 'animate-fade-in',
  FADE_IN_UP: 'animate-fade-in-up',
  FADE_IN_DOWN: 'animate-fade-in-down',
  FADE_IN_LEFT: 'animate-fade-in-left',
  FADE_IN_RIGHT: 'animate-fade-in-right',
  SCALE_IN: 'animate-scale-in',
  SLIDE_IN_UP: 'animate-slide-in-up',
  SLIDE_IN_DOWN: 'animate-slide-in-down',
  BOUNCE: 'animate-bounce',
  PULSE: 'animate-pulse',
  SPIN: 'animate-spin'
}

// ===== Toast Types =====
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

// ===== Toast Positions =====
export const TOAST_POSITIONS = {
  TOP_LEFT: 'top-left',
  TOP_RIGHT: 'top-right',
  TOP_CENTER: 'top-center',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_CENTER: 'bottom-center'
}

// ===== HTTP Status Codes =====
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
}

// ===== Pagination =====
export const DEFAULT_PAGE_SIZE = 20
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

// ===== Date Formats =====
export const DATE_FORMATS = {
  SHORT: 'MM/DD/YYYY',
  MEDIUM: 'MMM DD, YYYY',
  LONG: 'MMMM DD, YYYY',
  FULL: 'dddd, MMMM DD, YYYY',
  TIME: 'HH:mm:ss',
  DATETIME: 'MMM DD, YYYY HH:mm',
  ISO: 'YYYY-MM-DD',
  ISO_DATETIME: 'YYYY-MM-DDTHH:mm:ss'
}

// ===== Time Units =====
export const TIME_UNITS = {
  MILLISECOND: 1,
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000
}

// ===== File Size Units =====
export const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB']

// ===== Regex Patterns =====
export const REGEX = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  YOUTUBE_URL: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/)?([a-zA-Z0-9_-]{11})(\S*)?$/,
  PHONE: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  NUMERIC: /^\d+$/,
  HEX_COLOR: /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/
}

// ===== Error Messages =====
export const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PASSWORD: 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
  INVALID_URL: 'Please enter a valid URL',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_USERNAME: 'Username must be 3-20 characters and contain only letters, numbers, and underscores',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed',
  INVALID_FILE_TYPE: 'File type not supported',
  NETWORK_ERROR: 'Network error. Please check your connection',
  SERVER_ERROR: 'Server error. Please try again later',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Resource not found',
  RATE_LIMITED: 'Too many requests. Please try again later'
}

// ===== Success Messages =====
export const SUCCESS_MESSAGES = {
  LOGIN: 'Logged in successfully',
  LOGOUT: 'Logged out successfully',
  REGISTER: 'Account created successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  EMAIL_VERIFIED: 'Email verified successfully',
  PASSWORD_RESET: 'Password reset successfully',
  DOWNLOAD_STARTED: 'Download started',
  DOWNLOAD_COMPLETE: 'Download complete',
  UPLOAD_COMPLETE: 'Upload complete',
  PROCESSING_COMPLETE: 'Processing complete',
  FILE_SAVED: 'File saved successfully',
  SETTINGS_SAVED: 'Settings saved successfully'
}

// ===== Loading Messages =====
export const LOADING_MESSAGES = {
  LOADING: 'Loading...',
  UPLOADING: 'Uploading...',
  DOWNLOADING: 'Downloading...',
  PROCESSING: 'Processing...',
  TRANSCRIBING: 'Transcribing...',
  GENERATING: 'Generating...',
  SAVING: 'Saving...',
  VERIFYING: 'Verifying...'
}

// ===== Keyboard Shortcuts =====
export const KEYBOARD_SHORTCUTS = {
  // Global
  TOGGLE_SIDEBAR: { key: 'b', ctrl: true, description: 'Toggle sidebar' },
  TOGGLE_THEME: { key: 't', ctrl: true, description: 'Toggle theme' },
  SEARCH: { key: 'k', ctrl: true, description: 'Open search' },
  
  // Video Editor
  PLAY_PAUSE: { key: ' ', description: 'Play/Pause' },
  SEEK_FORWARD: { key: 'ArrowRight', description: 'Seek forward 5s' },
  SEEK_BACKWARD: { key: 'ArrowLeft', description: 'Seek backward 5s' },
  SPLIT: { key: 's', description: 'Split clip' },
  DELETE: { key: 'Delete', description: 'Delete selected' },
  
  // Navigation
  GO_TO_DASHBOARD: { key: '1', ctrl: true, description: 'Go to dashboard' },
  GO_TO_VIDEO_EDITOR: { key: '2', ctrl: true, description: 'Go to video editor' },
  GO_TO_STT: { key: '3', ctrl: true, description: 'Go to speech to text' },
  GO_TO_TTS: { key: '4', ctrl: true, description: 'Go to text to speech' },
  GO_TO_DOWNLOADER: { key: '5', ctrl: true, description: 'Go to downloader' },
  GO_TO_SETTINGS: { key: '6', ctrl: true, description: 'Go to settings' }
}