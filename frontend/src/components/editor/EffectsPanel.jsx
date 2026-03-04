import React, { useState } from 'react'
import {
  Sparkles,
  Sliders,
  Palette,
  Brush,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  Settings,
  Sun,
  Moon,
  Droplet,
  Contrast,
  Target,
  Zap,
  Wind,
  Cloud,
  Umbrella,
  Star,
  Heart,
  Smile,
  Frown,
  Meh,
  Volume2,
  VolumeX,
  Music,
  Mic,
  MicOff,
  Radio,
  Headphones,
  Speaker,
  Waves,
  Disc,
  Plus,
  Minus,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  Move,
  ZoomIn,
  ZoomOut,
  Grid,
  Ruler,
  Layers,
  Blend
} from 'lucide-react'

const EffectsPanel = ({
  effects = [],
  selectedClip = null,
  onEffectAdd,
  onEffectRemove,
  onEffectUpdate,
  onEffectToggle,
  onEffectCopy,
  onEffectPreset,
  onParameterChange,
  className = ''
}) => {
  const [expandedEffect, setExpandedEffect] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('all')
  const [showPresets, setShowPresets] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState(null)

  // Effect categories
  const categories = [
    { id: 'all', name: 'All', icon: Sparkles },
    { id: 'video', name: 'Video', icon: Layers },
    { id: 'audio', name: 'Audio', icon: Volume2 },
    { id: 'color', name: 'Color', icon: Palette },
    { id: 'transform', name: 'Transform', icon: Move },
    { id: 'filter', name: 'Filters', icon: Brush }
  ]

  // Available effects
  const availableEffects = [
    // Video effects
    { id: 'brightness', name: 'Brightness', category: 'color', icon: Sun, type: 'slider', min: -100, max: 100, default: 0 },
    { id: 'contrast', name: 'Contrast', category: 'color', icon: Contrast, type: 'slider', min: -100, max: 100, default: 0 },
    { id: 'saturation', name: 'Saturation', category: 'color', icon: Droplet, type: 'slider', min: -100, max: 100, default: 0 },
    { id: 'hue', name: 'Hue', category: 'color', icon: Palette, type: 'slider', min: -180, max: 180, default: 0 },
    { id: 'temperature', name: 'Temperature', category: 'color', icon: Sun, type: 'slider', min: -100, max: 100, default: 0 },
    
    // Transform effects
    { id: 'position', name: 'Position', category: 'transform', icon: Move, type: 'vector2', x: 0, y: 0 },
    { id: 'scale', name: 'Scale', category: 'transform', icon: ZoomIn, type: 'slider', min: 0, max: 200, default: 100 },
    { id: 'rotation', name: 'Rotation', category: 'transform', icon: RotateCw, type: 'slider', min: -180, max: 180, default: 0 },
    { id: 'opacity', name: 'Opacity', category: 'transform', icon: Eye, type: 'slider', min: 0, max: 100, default: 100 },
    
    // Filters
    { id: 'blur', name: 'Blur', category: 'filter', icon: Brush, type: 'slider', min: 0, max: 100, default: 0 },
    { id: 'sharpen', name: 'Sharpen', category: 'filter', icon: Target, type: 'slider', min: 0, max: 100, default: 0 },
    { id: 'noise', name: 'Noise', category: 'filter', icon: Zap, type: 'slider', min: 0, max: 100, default: 0 },
    { id: 'pixelate', name: 'Pixelate', category: 'filter', icon: Grid, type: 'slider', min: 0, max: 50, default: 0 },
    
    // Audio effects
    { id: 'volume', name: 'Volume', category: 'audio', icon: Volume2, type: 'slider', min: 0, max: 200, default: 100 },
    { id: 'fadeIn', name: 'Fade In', category: 'audio', icon: Waves, type: 'slider', min: 0, max: 10, default: 0 },
    { id: 'fadeOut', name: 'Fade Out', category: 'audio', icon: Waves, type: 'slider', min: 0, max: 10, default: 0 },
    { id: 'reverb', name: 'Reverb', category: 'audio', icon: Radio, type: 'slider', min: 0, max: 100, default: 0 },
    { id: 'echo', name: 'Echo', category: 'audio', icon: Disc, type: 'slider', min: 0, max: 100, default: 0 }
  ]

  // Presets
  const presets = {
    warm: [
      { id: 'temperature', value: 30 },
      { id: 'saturation', value: 20 },
      { id: 'contrast', value: 10 }
    ],
    cool: [
      { id: 'temperature', value: -30 },
      { id: 'saturation', value: -10 },
      { id: 'contrast', value: 5 }
    ],
    vintage: [
      { id: 'saturation', value: -30 },
      { id: 'contrast', value: 20 },
      { id: 'noise', value: 15 }
    ],
    cinematic: [
      { id: 'contrast', value: 30 },
      { id: 'saturation', value: 10 },
      { id: 'temperature', value: -10 }
    ]
  }

  // Filter effects by category and search
  const filteredEffects = availableEffects.filter(effect => {
    if (category !== 'all' && effect.category !== category) return false
    if (searchTerm && !effect.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  // Get active effects for current clip
  const activeEffects = effects.filter(e => e.clipId === selectedClip?.id)

  // Render effect control based on type
  const renderEffectControl = (effect, value) => {
    switch (effect.type) {
      case 'slider':
        return (
          <div className="space-y-2">
            <input
              type="range"
              min={effect.min}
              max={effect.max}
              value={value || effect.default}
              onChange={(e) => onParameterChange?.(effect.id, parseInt(e.target.value))}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{effect.min}</span>
              <span>{value || effect.default}</span>
              <span>{effect.max}</span>
            </div>
          </div>
        )

      case 'vector2':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 w-6">X:</span>
              <input
                type="range"
                min="-1000"
                max="1000"
                value={value?.x || 0}
                onChange={(e) => onParameterChange?.(effect.id, { ...value, x: parseInt(e.target.value) })}
                className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 w-6">Y:</span>
              <input
                type="range"
                min="-1000"
                max="1000"
                value={value?.y || 0}
                onChange={(e) => onParameterChange?.(effect.id, { ...value, y: parseInt(e.target.value) })}
                className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={`bg-gray-900 rounded-xl shadow-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Effects</h2>
          </div>
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition"
          >
            Presets
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search effects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map(cat => {
            const Icon = cat.icon
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-2 rounded-lg text-sm transition flex items-center space-x-1 ${
                  category === cat.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Presets panel */}
      {showPresets && (
        <div className="bg-gray-800 p-4 border-b border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Quick Presets</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(presets).map(([name, presetEffects]) => (
              <button
                key={name}
                onClick={() => onEffectPreset?.(name, presetEffects)}
                className={`p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition ${
                  selectedPreset === name ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                <span className="text-sm text-white capitalize">{name}</span>
                <div className="flex mt-1 space-x-1">
                  {presetEffects.map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-purple-500 rounded-full" />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Available effects */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Available Effects</h3>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {filteredEffects.map((effect) => {
            const Icon = effect.icon
            const isActive = activeEffects.some(e => e.id === effect.id)
            
            return (
              <button
                key={effect.id}
                onClick={() => onEffectAdd?.(effect)}
                className={`p-3 rounded-lg transition flex items-center space-x-2 ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{effect.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Active effects */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Active Effects</h3>
        {activeEffects.length > 0 ? (
          <div className="space-y-3">
            {activeEffects.map((effect) => {
              const effectDef = availableEffects.find(e => e.id === effect.id)
              const Icon = effectDef?.icon
              const isExpanded = expandedEffect === effect.id

              return (
                <div
                  key={effect.id}
                  className="bg-gray-800 rounded-lg overflow-hidden"
                >
                  {/* Effect header */}
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-white">{effectDef?.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onEffectToggle?.(effect.id)}
                        className="p-1 hover:bg-gray-700 rounded transition"
                      >
                        {effect.enabled ? (
                          <Eye className="w-4 h-4 text-gray-400" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                      <button
                        onClick={() => onEffectCopy?.(effect.id)}
                        className="p-1 hover:bg-gray-700 rounded transition"
                      >
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => onEffectRemove?.(effect.id)}
                        className="p-1 hover:bg-gray-700 rounded transition"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                      <button
                        onClick={() => setExpandedEffect(isExpanded ? null : effect.id)}
                        className="p-1 hover:bg-gray-700 rounded transition"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Effect parameters */}
                  {isExpanded && effectDef && (
                    <div className="p-3 pt-0 border-t border-gray-700">
                      {renderEffectControl(effectDef, effect.value)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-800 rounded-lg">
            <Sparkles className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No active effects</p>
            <p className="text-xs text-gray-600 mt-1">
              Click an effect above to add it
            </p>
          </div>
        )}
      </div>

      {/* Blend mode */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Blend Mode</h3>
        <select className="w-full px-3 py-2 bg-gray-700 text-white text-sm rounded-lg border border-gray-600">
          <option>Normal</option>
          <option>Multiply</option>
          <option>Screen</option>
          <option>Overlay</option>
          <option>Darken</option>
          <option>Lighten</option>
          <option>Color Dodge</option>
          <option>Color Burn</option>
          <option>Hard Light</option>
          <option>Soft Light</option>
          <option>Difference</option>
          <option>Exclusion</option>
          <option>Hue</option>
          <option>Saturation</option>
          <option>Color</option>
          <option>Luminosity</option>
        </select>
      </div>
    </div>
  )
}

export default EffectsPanel