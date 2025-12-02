'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, 
  Moon, 
  BookOpen, 
  Type, 
  Minus, 
  Plus,
  AlignJustify,
  RotateCcw,
  X,
  Sparkles
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { 
  useReadingSettingsStore, 
  getThemeStyles, 
  type ReadingTheme, 
  type FontFamily 
} from '@/stores';

interface ReadingControlsProps {
  isOpen: boolean;
  onClose: () => void;
  language?: string;
}

const FONTS: { id: FontFamily; label: string; preview: string }[] = [
  { id: 'literata', label: 'Literata', preview: 'Aa' },
  { id: 'merriweather', label: 'Merriweather', preview: 'Aa' },
  { id: 'system', label: 'Sans-serif', preview: 'Aa' },
];

export function ReadingControls({ isOpen, onClose, language = 'fr' }: ReadingControlsProps) {
  const t = useTranslations('settings');
  const tCommon = useTranslations('common');
  
  const THEMES: { id: ReadingTheme; icon: React.ReactNode; label: string }[] = [
    { 
      id: 'light', 
      icon: <Sun size={18} />, 
      label: t('light')
    },
    { 
      id: 'sepia', 
      icon: <BookOpen size={18} />, 
      label: t('sepia')
    },
    { 
      id: 'dark', 
      icon: <Moon size={18} />, 
      label: t('dark')
    },
  ];
  
  const {
    theme,
    fontFamily,
    fontSize,
    lineHeight,
    setTheme,
    setFontFamily,
    setFontSize,
    setLineHeight,
    resetToDefaults,
  } = useReadingSettingsStore();

  const themeStyles = getThemeStyles(theme);

  const getFontFamilyStyle = (font: FontFamily) => {
    switch (font) {
      case 'literata':
        return { fontFamily: 'var(--font-literata), Georgia, serif' };
      case 'merriweather':
        return { fontFamily: 'var(--font-merriweather), Georgia, serif' };
      case 'system':
        return { fontFamily: 'system-ui, sans-serif' };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
          />
          
          {/* Panel - Slide from bottom on mobile, from right on desktop */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`fixed bottom-0 left-0 right-0 sm:bottom-auto sm:top-0 sm:right-0 sm:left-auto sm:w-80 
              ${themeStyles.cardBg} rounded-t-3xl sm:rounded-none sm:rounded-l-3xl shadow-2xl z-50 
              max-h-[85vh] sm:max-h-screen sm:h-screen overflow-hidden flex flex-col`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b ${themeStyles.border}`}>
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-purple-500" />
                <h3 className={`font-medium ${themeStyles.text}`}>{t('readingComfort')}</h3>
              </div>
              <button
                onClick={onClose}
                className={`w-8 h-8 rounded-full ${themeStyles.hoverBg} flex items-center justify-center transition-colors`}
              >
                <X size={18} className={themeStyles.textMuted} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Theme selection */}
              <div>
                <label className={`block text-sm font-medium mb-3 ${themeStyles.textSecondary}`}>
                  {t('theme')}
                </label>
                <div className="flex gap-2">
                  {THEMES.map((themeOption) => (
                    <button
                      key={themeOption.id}
                      onClick={() => setTheme(themeOption.id)}
                      className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        theme === themeOption.id
                          ? 'border-purple-400 bg-purple-50'
                          : `${themeStyles.border} ${themeStyles.cardBg} ${themeStyles.hoverBg}`
                      }`}
                    >
                      <span className={theme === themeOption.id ? 'text-purple-600' : themeStyles.textSecondary}>
                        {themeOption.icon}
                      </span>
                      <span className={`text-xs font-medium ${
                        theme === themeOption.id ? 'text-purple-700' : themeStyles.textSecondary
                      }`}>
                        {themeOption.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font selection */}
              <div>
                <label className={`block text-sm font-medium mb-3 ${themeStyles.textSecondary}`}>
                  {t('font')}
                </label>
                <div className="flex gap-2">
                  {FONTS.map((fontOption) => (
                    <button
                      key={fontOption.id}
                      onClick={() => setFontFamily(fontOption.id)}
                      style={getFontFamilyStyle(fontOption.id)}
                      className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                        fontFamily === fontOption.id
                          ? 'border-purple-400 bg-purple-50'
                          : `${themeStyles.border} ${themeStyles.cardBg} ${themeStyles.hoverBg}`
                      }`}
                    >
                      <span className={`text-2xl ${
                        fontFamily === fontOption.id ? 'text-purple-700' : themeStyles.text
                      }`}>
                        {fontOption.preview}
                      </span>
                      <span className={`text-[10px] font-medium ${
                        fontFamily === fontOption.id ? 'text-purple-600' : themeStyles.textMuted
                      }`}>
                        {fontOption.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font size */}
              <div>
                <label className={`flex items-center gap-2 text-sm font-medium mb-3 ${themeStyles.textSecondary}`}>
                  <Type size={14} />
                  {t('fontSize')}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setFontSize(fontSize - 0.125)}
                    disabled={fontSize <= 1.25}
                    className={`w-10 h-10 rounded-full border ${themeStyles.border} ${themeStyles.cardBg} 
                      flex items-center justify-center transition-all
                      ${fontSize <= 1.25 ? 'opacity-40 cursor-not-allowed' : themeStyles.hoverBg}`}
                  >
                    <Minus size={16} className={themeStyles.textSecondary} />
                  </button>
                  
                  <div className="flex-1 relative h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="absolute left-0 top-0 bottom-0 bg-purple-400 rounded-full"
                      initial={false}
                      animate={{ width: `${((fontSize - 1.25) / (3 - 1.25)) * 100}%` }}
                    />
                  </div>
                  
                  <button
                    onClick={() => setFontSize(fontSize + 0.125)}
                    disabled={fontSize >= 3}
                    className={`w-10 h-10 rounded-full border ${themeStyles.border} ${themeStyles.cardBg} 
                      flex items-center justify-center transition-all
                      ${fontSize >= 3 ? 'opacity-40 cursor-not-allowed' : themeStyles.hoverBg}`}
                  >
                    <Plus size={16} className={themeStyles.textSecondary} />
                  </button>
                </div>
              </div>

              {/* Line height */}
              <div>
                <label className={`flex items-center gap-2 text-sm font-medium mb-3 ${themeStyles.textSecondary}`}>
                  <AlignJustify size={14} />
                  {t('lineHeight')}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setLineHeight(lineHeight - 0.1)}
                    disabled={lineHeight <= 1.4}
                    className={`w-10 h-10 rounded-full border ${themeStyles.border} ${themeStyles.cardBg} 
                      flex items-center justify-center transition-all
                      ${lineHeight <= 1.4 ? 'opacity-40 cursor-not-allowed' : themeStyles.hoverBg}`}
                  >
                    <Minus size={16} className={themeStyles.textSecondary} />
                  </button>
                  
                  <div className="flex-1 relative h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="absolute left-0 top-0 bottom-0 bg-purple-400 rounded-full"
                      initial={false}
                      animate={{ width: `${((lineHeight - 1.4) / (2.5 - 1.4)) * 100}%` }}
                    />
                  </div>
                  
                  <button
                    onClick={() => setLineHeight(lineHeight + 0.1)}
                    disabled={lineHeight >= 2.5}
                    className={`w-10 h-10 rounded-full border ${themeStyles.border} ${themeStyles.cardBg} 
                      flex items-center justify-center transition-all
                      ${lineHeight >= 2.5 ? 'opacity-40 cursor-not-allowed' : themeStyles.hoverBg}`}
                  >
                    <Plus size={16} className={themeStyles.textSecondary} />
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className={`block text-sm font-medium mb-3 ${themeStyles.textSecondary}`}>
                  {t('preview')}
                </label>
                <div 
                  className={`p-4 rounded-xl border ${themeStyles.border} ${themeStyles.background}`}
                  style={getFontFamilyStyle(fontFamily)}
                >
                  <p 
                    className={themeStyles.text}
                    style={{ 
                      fontSize: `${fontSize}rem`, 
                      lineHeight: lineHeight,
                    }}
                  >
                    {language === 'fr' 
                      ? 'Le petit chat dort paisiblement au soleil.'
                      : 'The little cat sleeps peacefully in the sun.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer - Reset button */}
            <div className={`p-4 border-t ${themeStyles.border}`}>
              <button
                onClick={resetToDefaults}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl 
                  border ${themeStyles.border} ${themeStyles.cardBg} ${themeStyles.hoverBg} 
                  transition-colors ${themeStyles.textSecondary}`}
              >
                <RotateCcw size={16} />
                <span className="text-sm font-medium">{t('reset')}</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
