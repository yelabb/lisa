'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Plus, X } from 'lucide-react';
import { DEFAULT_STORY_THEMES, TRENDING_THEMES } from '@/lib/constants';

type Theme = {
  value: string;
  label: string;
  emoji: string;
  isDefault: boolean;
  isCustom?: boolean;
};

export default function ThemesPage() {
  const router = useRouter();
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [customThemes, setCustomThemes] = useState<Theme[]>([]);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customThemeName, setCustomThemeName] = useState('');
  const [customThemeEmoji, setCustomThemeEmoji] = useState('🎨');
  const [isAnimating, setIsAnimating] = useState(false);

  const allThemes: Theme[] = [
    ...DEFAULT_STORY_THEMES.map(t => ({ ...t, isDefault: true })),
    ...TRENDING_THEMES.map(t => ({ ...t, isDefault: false })),
    ...customThemes,
  ];

  const toggleTheme = (themeValue: string) => {
    setSelectedThemes((prev) =>
      prev.includes(themeValue)
        ? prev.filter((v) => v !== themeValue)
        : [...prev, themeValue]
    );
  };

  const addCustomTheme = () => {
    if (!customThemeName.trim()) return;
    
    const newTheme: Theme = {
      value: `custom-${Date.now()}`,
      label: customThemeName.trim(),
      emoji: customThemeEmoji,
      isDefault: false,
      isCustom: true,
    };
    
    setCustomThemes([...customThemes, newTheme]);
    setSelectedThemes([...selectedThemes, newTheme.value]);
    setCustomThemeName('');
    setCustomThemeEmoji('🎨');
    setIsAddingCustom(false);
  };

  const removeCustomTheme = (themeValue: string) => {
    setCustomThemes(customThemes.filter(t => t.value !== themeValue));
    setSelectedThemes(selectedThemes.filter(v => v !== themeValue));
  };

  const handleContinue = () => {
    if (selectedThemes.length === 0) return;
    setIsAnimating(true);
    sessionStorage.setItem('onboarding-themes', JSON.stringify(selectedThemes));
    sessionStorage.setItem('onboarding-customThemes', JSON.stringify(customThemes));
    setTimeout(() => {
      router.push('/onboarding/complete');
    }, 600);
  };

  const EMOJI_OPTIONS = ['🎨', '🎭', '🎪', '🎸', '🎮', '🎲', '🧩', '🎯', '🎨', '🌟', '💎', '🔥', '⚡', '🌈', '🎈'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-6 flex flex-col">
      {/* Progress Bar */}
      <div className="max-w-4xl w-full mx-auto mb-8">
        <div className="bg-white/50 backdrop-blur-sm rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: '75%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2 text-center">Step 4 of 4</p>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl w-full mx-auto flex-1 flex flex-col">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-block mb-4"
            animate={{
              rotate: [0, 10, -10, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          >
            <span className="text-7xl">🎨</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Pick Your Story Styles!
          </h1>
          <p className="text-lg text-gray-700">
            Choose the types of stories you want to read! 📚
          </p>
          <p className="text-sm text-gray-600 mt-2">
            You can always change these later!
          </p>
        </motion.div>

        {/* Theme Categories */}
        <div className="space-y-6 mb-8">
          {/* Classic Themes */}
          <div>
            <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span>⭐</span> Classic Favorites
            </h3>
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {DEFAULT_STORY_THEMES.map((theme, index) => {
                const isSelected = selectedThemes.includes(theme.value);
                return (
                  <ThemeCard
                    key={theme.value}
                    theme={theme}
                    isSelected={isSelected}
                    onToggle={() => toggleTheme(theme.value)}
                    index={index}
                  />
                );
              })}
            </motion.div>
          </div>

          {/* Trending Themes */}
          <div>
            <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span>🔥</span> Trending Now
            </h3>
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {TRENDING_THEMES.map((theme, index) => {
                const isSelected = selectedThemes.includes(theme.value);
                return (
                  <ThemeCard
                    key={theme.value}
                    theme={theme}
                    isSelected={isSelected}
                    onToggle={() => toggleTheme(theme.value)}
                    index={index + 10}
                  />
                );
              })}
            </motion.div>
          </div>

          {/* Custom Themes */}
          {(customThemes.length > 0 || isAddingCustom) && (
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                <span>✨</span> Your Own Ideas
              </h3>
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {customThemes.map((theme, index) => {
                  const isSelected = selectedThemes.includes(theme.value);
                  return (
                    <ThemeCard
                      key={theme.value}
                      theme={theme}
                      isSelected={isSelected}
                      onToggle={() => toggleTheme(theme.value)}
                      onRemove={() => removeCustomTheme(theme.value)}
                      index={index + 20}
                      isCustom
                    />
                  );
                })}
              </motion.div>
            </div>
          )}
        </div>

        {/* Add Custom Theme Button/Form */}
        <div className="mb-8">
          {!isAddingCustom ? (
            <motion.button
              onClick={() => setIsAddingCustom(true)}
              className="w-full p-4 rounded-2xl border-2 border-dashed border-purple-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 hover:border-purple-400 transition-all duration-200 flex items-center justify-center gap-2 text-purple-600 font-semibold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={20} />
              Create Your Own Theme!
            </motion.button>
          ) : (
            <motion.div
              className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border-2 border-purple-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h4 className="font-bold text-gray-700 mb-4">Create Your Theme</h4>
              
              {/* Emoji Selector */}
              <div className="mb-4">
                <label className="text-sm text-gray-600 mb-2 block">Pick an emoji:</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setCustomThemeEmoji(emoji)}
                      className={`text-3xl p-2 rounded-lg transition-all ${
                        customThemeEmoji === emoji
                          ? 'bg-purple-200 scale-110'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Name Input */}
              <div className="mb-4">
                <label className="text-sm text-gray-600 mb-2 block">Theme name:</label>
                <input
                  type="text"
                  value={customThemeName}
                  onChange={(e) => setCustomThemeName(e.target.value)}
                  placeholder="e.g., Unicorns, Ninjas, Baking..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-purple-500 focus:outline-none bg-white"
                  maxLength={20}
                  autoFocus
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={addCustomTheme}
                  disabled={!customThemeName.trim()}
                  className="flex-1 px-4 py-2 rounded-xl bg-purple-500 text-white font-semibold hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Add Theme
                </button>
                <button
                  onClick={() => {
                    setIsAddingCustom(false);
                    setCustomThemeName('');
                    setCustomThemeEmoji('🎨');
                  }}
                  className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Continue Button */}
        <motion.div
          className="mt-auto pt-8 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <motion.button
            onClick={handleContinue}
            disabled={selectedThemes.length === 0 || isAnimating}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg
              shadow-xl transition-all duration-200
              ${selectedThemes.length > 0
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-2xl hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
            whileHover={selectedThemes.length > 0 ? { scale: 1.05 } : {}}
            whileTap={selectedThemes.length > 0 ? { scale: 0.95 } : {}}
          >
            {selectedThemes.length > 0 ? (
              <>
                Let's Create My Pass! 🎫
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <ArrowRight size={24} />
                </motion.div>
              </>
            ) : (
              'Pick at least one theme!'
            )}
          </motion.button>
        </motion.div>

        {/* Selected Count */}
        <AnimatePresence>
          {selectedThemes.length > 0 && (
            <motion.div
              className="text-center mt-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <p className="text-sm text-gray-600">
                You picked <span className="font-bold text-purple-600">{selectedThemes.length}</span> theme{selectedThemes.length > 1 ? 's' : ''}! 🎉
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Theme Card Component
function ThemeCard({
  theme,
  isSelected,
  onToggle,
  onRemove,
  index,
  isCustom = false,
}: {
  theme: Theme;
  isSelected: boolean;
  onToggle: () => void;
  onRemove?: () => void;
  index: number;
  isCustom?: boolean;
}) {
  return (
    <motion.button
      onClick={onToggle}
      className={`
        relative overflow-hidden rounded-2xl p-4
        bg-white/70 backdrop-blur-sm border-3
        transition-all duration-200 shadow-md
        hover:shadow-lg hover:scale-105
        ${isSelected 
          ? 'border-purple-500 ring-2 ring-purple-200' 
          : 'border-transparent hover:border-gray-200'
        }
      `}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Remove Button for Custom Themes */}
      {isCustom && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
        >
          <X size={12} className="text-white" />
        </button>
      )}

      {/* Selection Indicator */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            className="absolute top-2 right-2 bg-purple-500 rounded-full p-1"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <span className="text-white text-xs">✓</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background gradient on select */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      <div className="relative z-10">
        <motion.div
          className="text-4xl mb-2"
          animate={isSelected ? {
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
          } : {}}
          transition={{ duration: 0.5 }}
        >
          {theme.emoji}
        </motion.div>
        <p className={`font-semibold text-sm ${isSelected ? 'text-purple-700' : 'text-gray-700'}`}>
          {theme.label}
        </p>
      </div>
    </motion.button>
  );
}
