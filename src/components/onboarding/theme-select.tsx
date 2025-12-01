'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ThemeSelectProps {
  language: string;
  onContinue: (themes: string[]) => void;
}

const THEMES = [
  { id: 'adventure', emoji: '🗺️', fr: 'Aventure', en: 'Adventure' },
  { id: 'animals', emoji: '🦁', fr: 'Animaux', en: 'Animals' },
  { id: 'space', emoji: '🚀', fr: 'Espace', en: 'Space' },
  { id: 'magic', emoji: '✨', fr: 'Magie', en: 'Magic' },
  { id: 'nature', emoji: '🌳', fr: 'Nature', en: 'Nature' },
  { id: 'friendship', emoji: '🤝', fr: 'Amitié', en: 'Friendship' },
  { id: 'superheroes', emoji: '🦸', fr: 'Super-héros', en: 'Superheroes' },
  { id: 'dinosaurs', emoji: '🦕', fr: 'Dinosaures', en: 'Dinosaurs' },
  { id: 'pirates', emoji: '🏴‍☠️', fr: 'Pirates', en: 'Pirates' },
  { id: 'dragons', emoji: '🐉', fr: 'Dragons', en: 'Dragons' },
  { id: 'sports', emoji: '⚽', fr: 'Sports', en: 'Sports' },
  { id: 'underwater', emoji: '🌊', fr: 'Sous l\'eau', en: 'Underwater' },
];

const TEXTS = {
  fr: {
    title: 'Qu\'est-ce que tu aimes?',
    subtitle: 'Choisis ce qui te plaît (tu peux en choisir plusieurs!)',
    continue: 'Super! On y va! 🎉',
    minSelect: 'Choisis au moins 1 thème',
  },
  en: {
    title: 'What do you like?',
    subtitle: 'Pick what you enjoy (you can choose many!)',
    continue: 'Awesome! Let\'s go! 🎉',
    minSelect: 'Pick at least 1 theme',
  },
};

export function ThemeSelect({ language, onContinue }: ThemeSelectProps) {
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const t = TEXTS[language as keyof typeof TEXTS] || TEXTS.fr;
  const canContinue = selectedThemes.length >= 1;

  const handleToggle = (themeId: string) => {
    setSelectedThemes(prev => 
      prev.includes(themeId)
        ? prev.filter(id => id !== themeId)
        : [...prev, themeId]
    );
  };

  const handleContinue = () => {
    if (canContinue) {
      onContinue(selectedThemes);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-linear-to-b from-yellow-50 to-white flex flex-col items-center p-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8 mb-4"
      >
        <div className="text-5xl mb-4">💭</div>
        <h2 className="text-2xl font-light text-gray-800 mb-2">
          {t.title}
        </h2>
        <p className="text-gray-500 font-light">
          {t.subtitle}
        </p>
      </motion.div>

      {/* Theme grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 sm:grid-cols-4 gap-3 w-full max-w-lg mb-8"
      >
        {THEMES.map((theme, index) => {
          const isSelected = selectedThemes.includes(theme.id);
          return (
            <motion.button
              key={theme.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.03 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleToggle(theme.id)}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                isSelected
                  ? 'border-purple-400 bg-purple-100 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <span className="text-3xl">{theme.emoji}</span>
              <span className={`text-xs font-medium ${isSelected ? 'text-purple-700' : 'text-gray-600'}`}>
                {language === 'en' ? theme.en : theme.fr}
              </span>
              
              {/* Checkmark */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center"
                >
                  <Check size={12} className="text-white" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Selected count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-gray-400 mb-6"
      >
        {selectedThemes.length === 0 
          ? t.minSelect
          : `${selectedThemes.length} ${language === 'fr' ? 'choisi(s)' : 'selected'} ✓`
        }
      </motion.div>

      {/* Continue button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={canContinue ? { scale: 1.05 } : {}}
        whileTap={canContinue ? { scale: 0.95 } : {}}
        onClick={handleContinue}
        disabled={!canContinue}
        className={`px-10 py-4 rounded-full text-lg font-medium transition-all ${
          canContinue
            ? 'bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl cursor-pointer'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {t.continue}
      </motion.button>
    </motion.div>
  );
}
