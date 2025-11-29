'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Type, Sun, Moon, Coffee, Eye, Ruler } from 'lucide-react';
import type { ReadingSettings } from '@/types/reading';

interface ReadingControlsProps {
  settings: ReadingSettings;
  onSettingsChange: (settings: ReadingSettings) => void;
}

export function ReadingControls({ settings, onSettingsChange }: ReadingControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateSetting = <K extends keyof ReadingSettings>(
    key: K,
    value: ReadingSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Expanded Controls */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="mb-4 bg-white rounded-2xl shadow-2xl p-6 border-2 border-purple-200 w-80"
        >
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Eye size={20} />
            Reading Settings
          </h3>

          {/* Font Size */}
          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Font Size
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['small', 'medium', 'large', 'xl'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => updateSetting('fontSize', size)}
                  className={`
                    px-3 py-2 rounded-lg font-medium text-sm transition-all
                    ${settings.fontSize === size
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {size === 'xl' ? 'XL' : size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Font Family */}
          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Font Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['default', 'dyslexic', 'serif'] as const).map((font) => (
                <button
                  key={font}
                  onClick={() => updateSetting('fontFamily', font)}
                  className={`
                    px-3 py-2 rounded-lg font-medium text-sm transition-all
                    ${settings.fontFamily === font
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {font === 'dyslexic' ? 'Dyslexic' : font.charAt(0).toUpperCase() + font.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => updateSetting('theme', 'light')}
                className={`
                  px-3 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2
                  ${settings.theme === 'light'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <Sun size={16} />
                Light
              </button>
              <button
                onClick={() => updateSetting('theme', 'dark')}
                className={`
                  px-3 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2
                  ${settings.theme === 'dark'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <Moon size={16} />
                Dark
              </button>
              <button
                onClick={() => updateSetting('theme', 'sepia')}
                className={`
                  px-3 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2
                  ${settings.theme === 'sepia'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <Coffee size={16} />
                Sepia
              </button>
            </div>
          </div>

          {/* Line Spacing */}
          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Line Spacing
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['normal', 'relaxed', 'loose'] as const).map((spacing) => (
                <button
                  key={spacing}
                  onClick={() => updateSetting('lineSpacing', spacing)}
                  className={`
                    px-3 py-2 rounded-lg font-medium text-sm transition-all
                    ${settings.lineSpacing === spacing
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {spacing.charAt(0).toUpperCase() + spacing.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Ruler size={16} />
                Reading Ruler
              </span>
              <input
                type="checkbox"
                checked={settings.showRuler}
                onChange={(e) => updateSetting('showRuler', e.target.checked)}
                className="w-5 h-5"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-gray-700">
                Highlight Line
              </span>
              <input
                type="checkbox"
                checked={settings.highlightCurrentLine}
                onChange={(e) => updateSetting('highlightCurrentLine', e.target.checked)}
                className="w-5 h-5"
              />
            </label>
          </div>
        </motion.div>
      )}

      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-3xl"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Type size={24} />
      </motion.button>
    </div>
  );
}

// Apply reading settings to content
export function getReadingStyles(settings: ReadingSettings) {
  const fontSizes = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl',
    xl: 'text-3xl',
  };

  const fontFamilies = {
    default: 'font-sans',
    dyslexic: 'font-mono', // Would use OpenDyslexic font if installed
    serif: 'font-serif',
  };

  const themes = {
    light: 'bg-white text-gray-900',
    dark: 'bg-gray-900 text-gray-100',
    sepia: 'bg-amber-50 text-amber-950',
  };

  const lineSpacings = {
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose',
  };

  return {
    fontSize: fontSizes[settings.fontSize],
    fontFamily: fontFamilies[settings.fontFamily],
    theme: themes[settings.theme],
    lineSpacing: lineSpacings[settings.lineSpacing],
  };
}
