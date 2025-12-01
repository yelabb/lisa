'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Settings } from 'lucide-react';
import { useUserProgressStore } from '@/stores';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

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
    title: 'Paramètres',
    language: 'Langue',
    themes: 'Thèmes préférés',
    themesHint: 'Choisis au moins 1 thème',
    save: 'Enregistrer',
    cancel: 'Annuler',
  },
  en: {
    title: 'Settings',
    language: 'Language',
    themes: 'Favorite themes',
    themesHint: 'Pick at least 1 theme',
    save: 'Save',
    cancel: 'Cancel',
  },
};

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { language, progress, setLanguage, setPreferences } = useUserProgressStore();
  
  const [selectedLanguage, setSelectedLanguage] = useState(language || 'fr');
  const [selectedThemes, setSelectedThemes] = useState<string[]>(
    progress?.preferredThemes || []
  );

  const t = TEXTS[selectedLanguage as keyof typeof TEXTS] || TEXTS.fr;

  // Sync with store when dialog opens
  useEffect(() => {
    if (isOpen) {
      queueMicrotask(() => {
        setSelectedLanguage(language || 'fr');
        setSelectedThemes(progress?.preferredThemes || []);
      });
    }
  }, [isOpen, language, progress?.preferredThemes]);

  const handleToggleTheme = (themeId: string) => {
    setSelectedThemes(prev => 
      prev.includes(themeId)
        ? prev.filter(id => id !== themeId)
        : [...prev, themeId]
    );
  };

  const handleSave = () => {
    setLanguage(selectedLanguage);
    setPreferences(selectedThemes, progress?.interests || []);
    onClose();
  };

  const canSave = selectedThemes.length >= 1;

  if (!isOpen) return null;

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
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />
          
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-white rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Settings size={18} className="text-gray-400" />
                <h2 className="text-lg font-medium text-gray-800">{t.title}</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Language selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t.language}
                </label>
                <div className="flex gap-3">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang.code)}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        selectedLanguage === lang.code
                          ? 'border-purple-400 bg-purple-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <span className={`text-sm font-medium ${
                        selectedLanguage === lang.code ? 'text-purple-700' : 'text-gray-600'
                      }`}>
                        {lang.label}
                      </span>
                      {selectedLanguage === lang.code && (
                        <Check size={16} className="text-purple-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.themes}
                </label>
                <p className="text-xs text-gray-400 mb-3">{t.themesHint}</p>
                <div className="grid grid-cols-4 gap-2">
                  {THEMES.map((theme) => {
                    const isSelected = selectedThemes.includes(theme.id);
                    return (
                      <button
                        key={theme.id}
                        onClick={() => handleToggleTheme(theme.id)}
                        className={`relative flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-purple-400 bg-purple-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <span className="text-2xl">{theme.emoji}</span>
                        <span className={`text-xs font-medium text-center leading-tight ${
                          isSelected ? 'text-purple-700' : 'text-gray-500'
                        }`}>
                          {selectedLanguage === 'en' ? theme.en : theme.fr}
                        </span>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center"
                          >
                            <Check size={10} className="text-white" />
                          </motion.div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-100 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSave}
                disabled={!canSave}
                className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  canSave
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {t.save}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
