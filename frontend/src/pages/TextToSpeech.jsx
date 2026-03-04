import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Mic,
  Play,
  Pause,
  Download,
  Copy,
  Trash2,
  Settings,
  Globe,
  User,
  Clock,
  Hash,
  Sparkles,
  FileText,
  Headphones,
  AudioWaveform,
  Plus,
  Edit2,
  Save,
  X,
  Check,
  AlertCircle,
  Loader,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Heart,
  Star,
  Music,
  Type,
  Languages
} from 'lucide-react';
import VoiceSelector from '../components/audio/VoiceSelector';
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

const TextToSpeech = () => {
  const [text, setText] = useState('');
  const [segments, setSegments] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState({
    id: 'km-KH-SreymomNeural',
    name: 'Sreymom',
    language: 'km',
    gender: 'female'
  });
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [volume, setVolume] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState(null);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('single');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [batchSettings, setBatchSettings] = useState({
    speed: 1.0,
    workers: 4,
    crossfade: 50,
    padding: 2.0
  });
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const { success, error: showError } = useToast();
  const audio = useAudio(generatedAudioUrl);

  // Mock voices
  const mockVoices = [
    // Khmer
    {
      id: 'km-KH-SreymomNeural',
      name: 'Sreymom',
      language: 'km',
      gender: 'female',
      languageName: 'Khmer',
      isNew: true,
      popularity: 95
    },
    {
      id: 'km-KH-ThearithNeural',
      name: 'Thearith',
      language: 'km',
      gender: 'male',
      languageName: 'Khmer',
      popularity: 88
    },

    // English
    {
      id: 'en-US-JennyNeural',
      name: 'Jenny',
      language: 'en',
      gender: 'female',
      languageName: 'English (US)',
      popularity: 99
    },
    {
      id: 'en-US-GuyNeural',
      name: 'Guy',
      language: 'en',
      gender: 'male',
      languageName: 'English (US)',
      popularity: 92
    },
    {
      id: 'en-GB-SoniaNeural',
      name: 'Sonia',
      language: 'en',
      gender: 'female',
      languageName: 'English (UK)',
      popularity: 94
    },
    {
      id: 'en-GB-RyanNeural',
      name: 'Ryan',
      language: 'en',
      gender: 'male',
      languageName: 'English (UK)',
      popularity: 89
    },

    // Chinese
    {
      id: 'zh-CN-XiaoxiaoNeural',
      name: 'Xiaoxiao',
      language: 'zh',
      gender: 'female',
      languageName: 'Chinese',
      popularity: 96
    },
    {
      id: 'zh-CN-YunxiNeural',
      name: 'Yunxi',
      language: 'zh',
      gender: 'male',
      languageName: 'Chinese',
      popularity: 90
    },

    // Japanese
    {
      id: 'ja-JP-NanamiNeural',
      name: 'Nanami',
      language: 'ja',
      gender: 'female',
      languageName: 'Japanese',
      popularity: 93
    },
    {
      id: 'ja-JP-KeitaNeural',
      name: 'Keita',
      language: 'ja',
      gender: 'male',
      languageName: 'Japanese',
      popularity: 87
    },

    // Korean
    {
      id: 'ko-KR-SunHiNeural',
      name: 'SunHi',
      language: 'ko',
      gender: 'female',
      languageName: 'Korean',
      popularity: 91
    },
    {
      id: 'ko-KR-InJoonNeural',
      name: 'InJoon',
      language: 'ko',
      gender: 'male',
      languageName: 'Korean',
      popularity: 85
    },

    // Thai
    {
      id: 'th-TH-PremwadeeNeural',
      name: 'Premwadee',
      language: 'th',
      gender: 'female',
      languageName: 'Thai',
      popularity: 89
    },
    {
      id: 'th-TH-NiwatNeural',
      name: 'Niwat',
      language: 'th',
      gender: 'male',
      languageName: 'Thai',
      popularity: 83
    },

    // Vietnamese
    {
      id: 'vi-VN-HoaiMyNeural',
      name: 'HoaiMy',
      language: 'vi',
      gender: 'female',
      languageName: 'Vietnamese',
      popularity: 88
    },
    {
      id: 'vi-VN-NamMinhNeural',
      name: 'NamMinh',
      language: 'vi',
      gender: 'male',
      languageName: 'Vietnamese',
      popularity: 82
    }
  ];

  // Mock segments for batch processing
  const mockSegments = [
    {
      timestamp: '[00:00]',
      text: 'Welcome to our presentation.',
      language: 'en',
      gender: 'female'
    },
    {
      timestamp: '[00:05]',
      text: 'Today we will discuss text to speech technology.',
      language: 'en',
      gender: 'female'
    },
    {
      timestamp: '[00:15]',
      text: 'This technology has many applications.',
      language: 'en',
      gender: 'female'
    },
    {
      timestamp: '[00:25]',
      text: 'Let me demonstrate with a different voice.',
      language: 'en',
      gender: 'male'
    },
    {
      timestamp: '[00:35]',
      text: 'រឿងនេះជាភាសាខ្មែរ',
      language: 'km',
      gender: 'female'
    },
    {
      timestamp: '[00:45]',
      text: '这是中文示例',
      language: 'zh',
      gender: 'female'
    }
  ];

  // Handle generate
  const handleGenerate = async () => {
    if (!text.trim()) {
      showError('Please enter some text');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgress(0);
    setStatus('Starting generation...');

    // Simulate progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setProgress(i);

      if (i === 30) setStatus('Loading voice model...');
      if (i === 50) setStatus('Generating speech...');
      if (i === 70) setStatus('Processing audio...');
      if (i === 90) setStatus('Finalizing...');
    }

    // Mock generated audio URL
    const mockAudioUrl = 'https://example.com/audio.mp3';
    setGeneratedAudioUrl(mockAudioUrl);
    setGeneratedAudio({
      text,
      voice: selectedVoice,
      speed,
      pitch,
      duration: text.length / 15, // Rough estimate
      size: 2.5 // MB
    });

    setStatus('Generation complete');
    setIsGenerating(false);
    success('Audio generated successfully');

    // Add to history
    setHistory((prev) =>
      [
        {
          id: Date.now(),
          text: text.slice(0, 50) + (text.length > 50 ? '...' : ''),
          voice: selectedVoice.name,
          date: new Date().toLocaleString(),
          duration: text.length / 15
        },
        ...prev
      ].slice(0, 20)
    );
  };

  // Handle batch generate
  const handleBatchGenerate = async () => {
    if (segments.length === 0) {
      showError('Please add segments first');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setStatus(`Generating ${segments.length} segments...`);

    for (let i = 0; i <= 100; i += 5) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setProgress(i);
    }

    setIsGenerating(false);
    success(`Generated ${segments.length} segments successfully`);
  };

  // Handle add segment
  const handleAddSegment = () => {
    const newSegment = {
      id: Date.now(),
      timestamp: `[${Math.floor(segments.length * 5)}:00]`,
      text: 'New segment',
      language: 'en',
      gender: 'female',
      speed: 1.0
    };
    setSegments([...segments, newSegment]);
  };

  // Handle update segment
  const handleUpdateSegment = (id, updates) => {
    setSegments(segments.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  // Handle remove segment
  const handleRemoveSegment = (id) => {
    setSegments(segments.filter((s) => s.id !== id));
  };

  // Handle download
  const handleDownload = () => {
    // In real implementation, this would download the actual audio file
    success('Download started');
  };

  // Handle copy text
  const handleCopyText = () => {
    navigator.clipboard.writeText(text);
    success('Text copied to clipboard');
  };

  // Handle toggle favorite voice
  const toggleFavoriteVoice = (voiceId) => {
    setFavorites((prev) =>
      prev.includes(voiceId)
        ? prev.filter((id) => id !== voiceId)
        : [...prev, voiceId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Text to Speech
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Convert text to natural-sounding speech in multiple languages
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Voice Selection */}
        <div className="lg:col-span-1">
          <VoiceSelector
            voices={mockVoices}
            selectedVoice={selectedVoice}
            onSelect={setSelectedVoice}
            onPreview={(voice) => {
              // Preview voice
              success(`Previewing ${voice.name}`);
            }}
            language="all"
            showFavoritesOnly={false}
            showRecentOnly={false}
          />
        </div>

        {/* Right Panel - Text Input & Controls */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 w-64">
              <TabsTrigger value="single">Single Text</TabsTrigger>
              <TabsTrigger value="batch">Batch Processing</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="space-y-6 pt-6">
              {/* Text Input */}
              <Card>
                <CardHeader>
                  <CardTitle>Enter Text</CardTitle>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {text.length} / 3000
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyText}
                      icon={Copy}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter the text you want to convert to speech..."
                    className="w-full h-48 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    maxLength={3000}
                  />
                </CardContent>
              </Card>

              {/* Voice Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Voice Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Speed */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm text-gray-700 dark:text-gray-300">
                        Speed
                      </label>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {speed.toFixed(1)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={speed}
                      onChange={(e) => setSpeed(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* Pitch */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm text-gray-700 dark:text-gray-300">
                        Pitch
                      </label>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {pitch > 0 ? '+' : ''}
                        {pitch}Hz
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      step="1"
                      value={pitch}
                      onChange={(e) => setPitch(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* Volume */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm text-gray-700 dark:text-gray-300">
                        Volume
                      </label>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {volume > 0 ? '+' : ''}
                        {volume}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      step="1"
                      value={volume}
                      onChange={(e) => setVolume(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Generate Button */}
              <Button
                variant="primary"
                className="w-full"
                size="lg"
                onClick={handleGenerate}
                disabled={!text.trim() || isGenerating}
                loading={isGenerating}
                icon={Volume2}
              >
                {isGenerating ? 'Generating...' : 'Generate Speech'}
              </Button>

              {/* Progress */}
              {isGenerating && (
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {status}
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {progress}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Error */}
              {error && (
                <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2 text-red-700 dark:text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </TabsContent>

            <TabsContent value="batch" className="space-y-6 pt-6">
              {/* Batch Controls */}
              <Card>
                <CardHeader>
                  <CardTitle>Batch Processing</CardTitle>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddSegment}
                    icon={Plus}
                  >
                    Add Segment
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {segments.length > 0 ? (
                      segments.map((segment, index) => (
                        <div
                          key={segment.id || index}
                          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <input
                                type="text"
                                value={segment.timestamp}
                                onChange={(e) =>
                                  handleUpdateSegment(segment.id, {
                                    timestamp: e.target.value
                                  })
                                }
                                className="w-20 px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm"
                              />
                            </div>
                            <button
                              onClick={() => handleRemoveSegment(segment.id)}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                          <textarea
                            value={segment.text}
                            onChange={(e) =>
                              handleUpdateSegment(segment.id, {
                                text: e.target.value
                              })
                            }
                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                            rows="2"
                            placeholder="Enter text..."
                          />
                          <div className="flex items-center space-x-2">
                            <select
                              value={segment.language}
                              onChange={(e) =>
                                handleUpdateSegment(segment.id, {
                                  language: e.target.value
                                })
                              }
                              className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm"
                            >
                              <option value="en">English</option>
                              <option value="km">Khmer</option>
                              <option value="zh">Chinese</option>
                              <option value="ja">Japanese</option>
                              <option value="ko">Korean</option>
                            </select>
                            <select
                              value={segment.gender}
                              onChange={(e) =>
                                handleUpdateSegment(segment.id, {
                                  gender: e.target.value
                                })
                              }
                              className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm"
                            >
                              <option value="female">Female</option>
                              <option value="male">Male</option>
                            </select>
                            <select
                              value={segment.speed}
                              onChange={(e) =>
                                handleUpdateSegment(segment.id, {
                                  speed: parseFloat(e.target.value)
                                })
                              }
                              className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm"
                            >
                              <option value="0.5">0.5x</option>
                              <option value="0.75">0.75x</option>
                              <option value="1.0">1.0x</option>
                              <option value="1.25">1.25x</option>
                              <option value="1.5">1.5x</option>
                              <option value="2.0">2.0x</option>
                            </select>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-500">No segments added yet</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAddSegment}
                          className="mt-4"
                        >
                          Add Your First Segment
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Batch Settings */}
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                        Default Speed
                      </label>
                      <select
                        value={batchSettings.speed}
                        onChange={(e) =>
                          setBatchSettings({
                            ...batchSettings,
                            speed: parseFloat(e.target.value)
                          })
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                      >
                        <option value="0.5">0.5x</option>
                        <option value="0.75">0.75x</option>
                        <option value="1.0">1.0x</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2.0">2.0x</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                        Parallel Workers
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        value={batchSettings.workers}
                        onChange={(e) =>
                          setBatchSettings({
                            ...batchSettings,
                            workers: parseInt(e.target.value)
                          })
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                        Crossfade (ms)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="500"
                        value={batchSettings.crossfade}
                        onChange={(e) =>
                          setBatchSettings({
                            ...batchSettings,
                            crossfade: parseInt(e.target.value)
                          })
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                        End Padding (s)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.5"
                        value={batchSettings.padding}
                        onChange={(e) =>
                          setBatchSettings({
                            ...batchSettings,
                            padding: parseFloat(e.target.value)
                          })
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Batch Generate Button */}
                  <Button
                    variant="primary"
                    className="w-full mt-6"
                    size="lg"
                    onClick={handleBatchGenerate}
                    disabled={segments.length === 0 || isGenerating}
                    loading={isGenerating}
                    icon={Volume2}
                  >
                    {isGenerating
                      ? 'Generating...'
                      : `Generate ${segments.length} Segments`}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Audio Player */}
          {generatedAudioUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Audio</CardTitle>
              </CardHeader>
              <CardContent>
                <AudioPlayer
                  src={generatedAudioUrl}
                  title={
                    generatedAudio?.text.slice(0, 50) +
                    (generatedAudio?.text.length > 50 ? '...' : '')
                  }
                  artist={`${selectedVoice.name} • ${selectedVoice.languageName}`}
                  onPlay={() => {}}
                  onPause={() => {}}
                  showWaveform
                  showTranscript={false}
                />

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>
                      Duration: {Math.floor(generatedAudio?.duration / 60)}:
                      {(generatedAudio?.duration % 60)
                        .toString()
                        .padStart(2, '0')}
                    </span>
                    <span>Size: {generatedAudio?.size} MB</span>
                    <span>Format: MP3</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      icon={Download}
                    >
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedAudioUrl);
                        success('URL copied to clipboard');
                      }}
                      icon={Copy}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Generations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded">
                      <Volume2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.text}
                      </p>
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span>{item.voice}</span>
                        <span>{item.date}</span>
                        <span>
                          {Math.floor(item.duration / 60)}:
                          {(item.duration % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Load
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

export default TextToSpeech;
