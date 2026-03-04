import React, { useState, useRef } from 'react';
import {
  Mic,
  FileText,
  Upload,
  Download,
  Copy,
  Trash2,
  Play,
  Pause,
  Volume2,
  Settings,
  Languages,
  Clock,
  User,
  Check,
  X,
  AlertCircle,
  Loader,
  Search,
  Filter,
  Edit2,
  Save,
  RefreshCw,
  Globe,
  Hash,
  Zap,
  Sparkles,
  FileAudio,
  Headphones,
  AudioWaveform,
  Captions
} from 'lucide-react';
import FileUpload from '../components/common/FileUpload';
import ProgressBar from '../components/common/ProgressBar';
import StatusBadge from '../components/common/StatusBadge';
import TranscriptionDisplay from '../components/audio/TranscriptionDisplay';
import AudioPlayer from '../components/audio/AudioPlayer';
import Button from '../components/ui/Button';
import Card, {
  CardHeader,
  CardTitle,
  CardContent
} from '../components/ui/Card';
import Tabs, {
  TabsList,
  TabsTrigger,
  TabsContent
} from '../components/ui/Tabs';
import { useAudio } from '../hooks/useAudio';
import { useToast } from '../hooks/useToast';

const SpeechToText = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcription, setTranscription] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('auto');
  const [model, setModel] = useState('base');
  const [task, setTask] = useState('transcribe');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [diarize, setDiarize] = useState(true);
  const [wordTimestamps, setWordTimestamps] = useState(true);
  const [filterProfanity, setFilterProfanity] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedSegment, setSelectedSegment] = useState(null);

  const fileInputRef = useRef(null);
  const { success, error: showError } = useToast();
  const audio = useAudio(audioUrl);

  // Mock transcription result
  const mockTranscription = {
    segments: [
      {
        id: 1,
        start: 0.0,
        end: 2.5,
        text: 'Welcome to this speech to text demonstration.',
        confidence: 0.98,
        speaker: 'Speaker 1'
      },
      {
        id: 2,
        start: 2.5,
        end: 5.0,
        text: 'This technology can convert spoken words into written text with high accuracy.',
        confidence: 0.95,
        speaker: 'Speaker 1'
      },
      {
        id: 3,
        start: 5.0,
        end: 8.2,
        text: 'It supports multiple languages and can even identify different speakers.',
        confidence: 0.92,
        speaker: 'Speaker 2'
      },
      {
        id: 4,
        start: 8.2,
        end: 11.5,
        text: 'Perfect for creating subtitles, transcribing meetings, or analyzing audio content.',
        confidence: 0.94,
        speaker: 'Speaker 2'
      }
    ],
    full_text:
      'Welcome to this speech to text demonstration. This technology can convert spoken words into written text with high accuracy. It supports multiple languages and can even identify different speakers. Perfect for creating subtitles, transcribing meetings, or analyzing audio content.',
    language: 'en',
    duration: 11.5,
    processing_time: 3.2
  };

  // Languages
  const languages = [
    { code: 'auto', name: 'Auto Detect' },
    { code: 'en', name: 'English' },
    { code: 'km', name: 'Khmer' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'th', name: 'Thai' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'es', name: 'Spanish' },
    { code: 'ru', name: 'Russian' }
  ];

  // Models
  const models = [
    { id: 'tiny', name: 'Tiny', size: '75 MB', speed: 'Fast', accuracy: 'Low' },
    {
      id: 'base',
      name: 'Base',
      size: '142 MB',
      speed: 'Fast',
      accuracy: 'Medium'
    },
    {
      id: 'small',
      name: 'Small',
      size: '466 MB',
      speed: 'Medium',
      accuracy: 'Good'
    },
    {
      id: 'medium',
      name: 'Medium',
      size: '1.5 GB',
      speed: 'Slow',
      accuracy: 'Better'
    },
    {
      id: 'large',
      name: 'Large',
      size: '2.9 GB',
      speed: 'Very Slow',
      accuracy: 'Best'
    }
  ];

  // Handle file select
  const handleFileSelect = (file) => {
    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setTranscription(null);
    setError(null);
    success('Audio file loaded successfully');
  };

  // Handle file remove
  const handleFileRemove = () => {
    setAudioFile(null);
    setAudioUrl(null);
    setTranscription(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  };

  // Handle transcription
  const handleTranscribe = async () => {
    if (!audioFile) {
      showError('Please select an audio file first');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setStatus('Starting transcription...');

    // Simulate progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setProgress(i);

      if (i === 20) setStatus('Loading model...');
      if (i === 40) setStatus('Processing audio...');
      if (i === 60) setStatus('Transcribing...');
      if (i === 80) setStatus('Generating segments...');
      if (i === 90) setStatus('Finalizing...');
    }

    // Set mock result
    setTranscription(mockTranscription);
    setStatus('Transcription complete');
    setIsProcessing(false);
    success('Transcription completed successfully');

    // Add to history
    setHistory((prev) =>
      [
        {
          id: Date.now(),
          filename: audioFile.name,
          date: new Date().toLocaleString(),
          duration: mockTranscription.duration,
          language: mockTranscription.language
        },
        ...prev
      ].slice(0, 10)
    );
  };

  // Handle export
  const handleExport = (format) => {
    if (!transcription) return;

    let content = '';
    let filename = '';

    switch (format) {
      case 'txt':
        content = transcription.full_text;
        filename = 'transcription.txt';
        break;
      case 'srt':
        content = transcription.segments
          .map(
            (seg, i) =>
              `${i + 1}\n${formatTimeSRT(seg.start)} --> ${formatTimeSRT(seg.end)}\n${seg.text}\n`
          )
          .join('\n');
        filename = 'subtitles.srt';
        break;
      case 'vtt':
        content =
          'WEBVTT\n\n' +
          transcription.segments
            .map(
              (seg) =>
                `${formatTimeVTT(seg.start)} --> ${formatTimeVTT(seg.end)}\n${seg.text}\n`
            )
            .join('\n');
        filename = 'subtitles.vtt';
        break;
      case 'json':
        content = JSON.stringify(transcription, null, 2);
        filename = 'transcription.json';
        break;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    success(`Exported as ${format.toUpperCase()}`);
  };

  // Format time for SRT
  const formatTimeSRT = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  };

  // Format time for VTT
  const formatTimeVTT = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Speech to Text
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Convert audio and video files to text with high accuracy
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Transcribed
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  1,247
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Hours Processed
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  892
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Languages
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  15
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Accuracy
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  98.5%
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Audio</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                accept=".mp3,.wav,.m4a,.flac,.ogg,.mp4"
                maxSize={500 * 1024 * 1024}
                showPreview
              />
            </CardContent>
          </Card>

          {/* Audio Player */}
          {audioUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Audio Player</CardTitle>
              </CardHeader>
              <CardContent>
                <AudioPlayer
                  src={audioUrl}
                  title={audioFile?.name}
                  artist="Uploaded File"
                  onPlay={() => {}}
                  onPause={() => {}}
                  onTimeUpdate={(time) => audio.seek(time)}
                  showWaveform
                  showTranscript={false}
                />
              </CardContent>
            </Card>
          )}

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Transcription Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Language */}
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Model */}
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} - {m.speed}
                    </option>
                  ))}
                </select>
              </div>

              {/* Task */}
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Task
                </label>
                <select
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                >
                  <option value="transcribe">Transcribe</option>
                  <option value="translate">Translate to English</option>
                </select>
              </div>

              {/* Advanced Toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <Settings className="w-4 h-4" />
                <span>Advanced Options</span>
              </button>

              {/* Advanced Options */}
              {showAdvanced && (
                <div className="space-y-3 pt-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={diarize}
                      onChange={(e) => setDiarize(e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-700"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Speaker diarization
                    </span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={wordTimestamps}
                      onChange={(e) => setWordTimestamps(e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-700"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Word-level timestamps
                    </span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filterProfanity}
                      onChange={(e) => setFilterProfanity(e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-700"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Filter profanity
                    </span>
                  </label>
                </div>
              )}

              {/* Transcribe Button */}
              <Button
                variant="primary"
                className="w-full mt-4"
                onClick={handleTranscribe}
                disabled={!audioFile || isProcessing}
                loading={isProcessing}
                icon={Mic}
              >
                {isProcessing ? 'Transcribing...' : 'Start Transcription'}
              </Button>

              {/* Progress */}
              {isProcessing && (
                <div className="mt-4">
                  <ProgressBar
                    progress={progress}
                    status={status}
                    showPercentage
                  />
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2 text-red-700 dark:text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Results */}
        <div className="lg:col-span-2">
          {transcription ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Transcription Results</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('txt')}
                      icon={FileText}
                    >
                      TXT
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('srt')}
                      icon={Captions}
                    >
                      SRT
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('vtt')}
                      icon={Captions}
                    >
                      VTT
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('json')}
                      icon={FileText}
                    >
                      JSON
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <TranscriptionDisplay
                  segments={transcription.segments}
                  currentTime={audio.currentTime}
                  onSegmentClick={(time) => audio.seek(time)}
                  onSegmentEdit={(segment, newText) => {
                    const updatedSegments = transcription.segments.map((s) =>
                      s.id === segment.id ? { ...s, text: newText } : s
                    );
                    setTranscription({
                      ...transcription,
                      segments: updatedSegments,
                      full_text: updatedSegments.map((s) => s.text).join(' ')
                    });
                    success('Segment updated');
                  }}
                  language={transcription.language}
                  speakerCount={2}
                  showSpeaker
                  showTimestamps
                  highlightCurrent
                  editable
                />

                {/* Stats */}
                <div className="mt-4 grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {Math.floor(transcription.duration / 60)}:
                      {(transcription.duration % 60)
                        .toString()
                        .padStart(2, '0')}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Segments</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {transcription.segments.length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Words</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {transcription.full_text.split(' ').length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Processing</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {transcription.processing_time}s
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Mic className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No transcription yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Upload an audio file and click "Start Transcription" to
                  convert speech to text
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Transcriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.filename}
                      </p>
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span>{item.date}</span>
                        <span>
                          {Math.floor(item.duration / 60)}:
                          {(item.duration % 60).toString().padStart(2, '0')}
                        </span>
                        <span>{item.language.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Load history item
                      loadHistoryItem(item);
                    }}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SpeechToText;
