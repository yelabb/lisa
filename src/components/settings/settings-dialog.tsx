'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { useUserProgressStore } from '@/stores';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: (preferencesChanged?: boolean) => void;
}

interface ThemeCategory {
  id: string;
  emoji: string;
  fr: string;
  en: string;
  themes: Theme[];
}

interface Theme {
  id: string;
  emoji: string;
  fr: string;
  en: string;
}

const LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

const THEME_CATEGORIES: ThemeCategory[] = [
  {
    id: 'manga-anime',
    emoji: '🎌',
    fr: 'Manga & Anime',
    en: 'Manga & Anime',
    themes: [
      { id: 'shonen', emoji: '⚔️', fr: 'Shonen (action/combat)', en: 'Shonen (action/battle)' },
      { id: 'ninja', emoji: '🥷', fr: 'Ninjas & Arts martiaux', en: 'Ninjas & Martial Arts' },
      { id: 'pokemon-style', emoji: '🔮', fr: 'Créatures à capturer', en: 'Creature collecting' },
      { id: 'isekai', emoji: '🌀', fr: 'Isekai (autre monde)', en: 'Isekai (other world)' },
      { id: 'mecha', emoji: '🤖', fr: 'Robots géants', en: 'Giant robots' },
      { id: 'magical-girl', emoji: '💫', fr: 'Magical Girl', en: 'Magical Girl' },
      { id: 'sports-anime', emoji: '🏀', fr: 'Sport intense', en: 'Sports anime' },
      { id: 'detective-manga', emoji: '🔍', fr: 'Détective & Mystère', en: 'Detective & Mystery' },
    ]
  },
  {
    id: 'gaming',
    emoji: '🎮',
    fr: 'Jeux vidéo & Gaming',
    en: 'Video Games & Gaming',
    themes: [
      { id: 'survival-game', emoji: '🏝️', fr: 'Survie & Craft', en: 'Survival & Craft' },
      { id: 'battle-royale', emoji: '🎯', fr: 'Battle Royale', en: 'Battle Royale' },
      { id: 'sandbox', emoji: '🧱', fr: 'Construction & Sandbox', en: 'Building & Sandbox' },
      { id: 'speedrun', emoji: '⏱️', fr: 'Speedrun & Défis', en: 'Speedrun & Challenges' },
      { id: 'rpg', emoji: '⚔️', fr: 'RPG & Quêtes', en: 'RPG & Quests' },
      { id: 'esport', emoji: '🏆', fr: 'Esport & Compétition', en: 'Esport & Competition' },
      { id: 'streaming', emoji: '📺', fr: 'Streamers & YouTube', en: 'Streamers & YouTube' },
    ]
  },
  {
    id: 'superheroes-comics',
    emoji: '🦸',
    fr: 'Super-héros & Comics',
    en: 'Superheroes & Comics',
    themes: [
      { id: 'marvel', emoji: '🕷️', fr: 'Style Marvel', en: 'Marvel style' },
      { id: 'dc', emoji: '🦇', fr: 'Style DC Comics', en: 'DC Comics style' },
      { id: 'villain', emoji: '😈', fr: 'Super-vilains', en: 'Supervillains' },
      { id: 'origin-story', emoji: '⚡', fr: 'Origines de héros', en: 'Hero origins' },
      { id: 'team-hero', emoji: '🤝', fr: 'Équipe de héros', en: 'Hero team' },
      { id: 'antihero', emoji: '🖤', fr: 'Anti-héros', en: 'Antihero' },
    ]
  },
  {
    id: 'scifi-tech',
    emoji: '🚀',
    fr: 'Sci-Fi & Technologie',
    en: 'Sci-Fi & Technology',
    themes: [
      { id: 'space-exploration', emoji: '🌌', fr: 'Exploration spatiale', en: 'Space exploration' },
      { id: 'ai-robots', emoji: '🤖', fr: 'IA & Robots', en: 'AI & Robots' },
      { id: 'time-travel', emoji: '⏰', fr: 'Voyage temporel', en: 'Time travel' },
      { id: 'cyberpunk', emoji: '🌃', fr: 'Cyberpunk & Futur', en: 'Cyberpunk & Future' },
      { id: 'aliens', emoji: '👽', fr: 'Extraterrestres', en: 'Aliens' },
      { id: 'virtual-reality', emoji: '🥽', fr: 'Réalité virtuelle', en: 'Virtual reality' },
      { id: 'hacking', emoji: '💻', fr: 'Hackers & Code', en: 'Hackers & Code' },
    ]
  },
  {
    id: 'fantasy-magic',
    emoji: '✨',
    fr: 'Fantasy & Magie',
    en: 'Fantasy & Magic',
    themes: [
      { id: 'wizards', emoji: '🧙', fr: 'Sorciers & Magie', en: 'Wizards & Magic' },
      { id: 'dragons', emoji: '🐉', fr: 'Dragons', en: 'Dragons' },
      { id: 'elves-fantasy', emoji: '🧝', fr: 'Elfes & Créatures', en: 'Elves & Creatures' },
      { id: 'dark-fantasy', emoji: '🌑', fr: 'Dark Fantasy', en: 'Dark Fantasy' },
      { id: 'mythology', emoji: '⚡', fr: 'Mythologie grecque/nordique', en: 'Greek/Norse mythology' },
      { id: 'fairy-tale', emoji: '🏰', fr: 'Contes revisités', en: 'Reimagined fairy tales' },
      { id: 'dungeon', emoji: '🗝️', fr: 'Donjons & Trésors', en: 'Dungeons & Treasures' },
    ]
  },
  {
    id: 'horror-mystery',
    emoji: '👻',
    fr: 'Frissons & Mystères',
    en: 'Thrills & Mysteries',
    themes: [
      { id: 'ghost-stories', emoji: '👻', fr: 'Histoires de fantômes', en: 'Ghost stories' },
      { id: 'monsters', emoji: '🧟', fr: 'Monstres & Créatures', en: 'Monsters & Creatures' },
      { id: 'detective', emoji: '🔎', fr: 'Enquêtes & Détective', en: 'Detective stories' },
      { id: 'escape-room', emoji: '🚪', fr: 'Escape & Énigmes', en: 'Escape & Puzzles' },
      { id: 'urban-legends', emoji: '🌙', fr: 'Légendes urbaines', en: 'Urban legends' },
      { id: 'haunted', emoji: '🏚️', fr: 'Lieux hantés', en: 'Haunted places' },
      { id: 'conspiracy', emoji: '🕵️', fr: 'Complots & Secrets', en: 'Conspiracies & Secrets' },
    ]
  },
  {
    id: 'adventure-action',
    emoji: '🗺️',
    fr: 'Aventure & Action',
    en: 'Adventure & Action',
    themes: [
      { id: 'treasure-hunt', emoji: '💎', fr: 'Chasse au trésor', en: 'Treasure hunt' },
      { id: 'survival', emoji: '🏕️', fr: 'Survie extrême', en: 'Extreme survival' },
      { id: 'pirates', emoji: '🏴‍☠️', fr: 'Pirates & Océans', en: 'Pirates & Oceans' },
      { id: 'explorers', emoji: '🧭', fr: 'Explorateurs', en: 'Explorers' },
      { id: 'parkour', emoji: '🏃', fr: 'Parkour & Cascade', en: 'Parkour & Stunts' },
      { id: 'spy', emoji: '🕶️', fr: 'Espionnage', en: 'Spy stories' },
      { id: 'apocalypse', emoji: '🌋', fr: 'Fin du monde', en: 'Apocalypse' },
    ]
  },
  {
    id: 'sports-competition',
    emoji: '⚽',
    fr: 'Sports & Compétition',
    en: 'Sports & Competition',
    themes: [
      { id: 'football', emoji: '⚽', fr: 'Football', en: 'Soccer/Football' },
      { id: 'basketball', emoji: '🏀', fr: 'Basketball', en: 'Basketball' },
      { id: 'skateboard', emoji: '🛹', fr: 'Skate & Sports urbains', en: 'Skate & Urban sports' },
      { id: 'martial-arts', emoji: '🥋', fr: 'Arts martiaux', en: 'Martial arts' },
      { id: 'racing', emoji: '🏎️', fr: 'Course & Vitesse', en: 'Racing & Speed' },
      { id: 'extreme-sports', emoji: '🏂', fr: 'Sports extrêmes', en: 'Extreme sports' },
      { id: 'olympics', emoji: '🏅', fr: 'Compétitions olympiques', en: 'Olympic competitions' },
    ]
  },
  {
    id: 'social-life',
    emoji: '💬',
    fr: 'Vie quotidienne & Social',
    en: 'Daily Life & Social',
    themes: [
      { id: 'school-life', emoji: '🎒', fr: 'Vie au collège/lycée', en: 'School life' },
      { id: 'friendship-drama', emoji: '💔', fr: 'Amitiés & Drama', en: 'Friendships & Drama' },
      { id: 'family', emoji: '👨‍👩‍👧', fr: 'Famille & Relations', en: 'Family & Relationships' },
      { id: 'social-media', emoji: '📱', fr: 'Réseaux sociaux', en: 'Social media' },
      { id: 'music-band', emoji: '🎸', fr: 'Musique & Groupe', en: 'Music & Band' },
      { id: 'fashion', emoji: '👗', fr: 'Mode & Style', en: 'Fashion & Style' },
      { id: 'cooking', emoji: '👨‍🍳', fr: 'Cuisine & Food', en: 'Cooking & Food' },
    ]
  },
  {
    id: 'animals-creatures',
    emoji: '🐾',
    fr: 'Animaux & Créatures',
    en: 'Animals & Creatures',
    themes: [
      { id: 'pets', emoji: '🐕', fr: 'Animaux de compagnie', en: 'Pets' },
      { id: 'wild-animals', emoji: '🦁', fr: 'Animaux sauvages', en: 'Wild animals' },
      { id: 'dinosaurs', emoji: '🦖', fr: 'Dinosaures', en: 'Dinosaurs' },
      { id: 'ocean-life', emoji: '🦈', fr: 'Vie sous-marine', en: 'Ocean life' },
      { id: 'mythical-creatures', emoji: '🦄', fr: 'Créatures mythiques', en: 'Mythical creatures' },
      { id: 'talking-animals', emoji: '🗣️', fr: 'Animaux qui parlent', en: 'Talking animals' },
    ]
  },
  {
    id: 'creativity-art',
    emoji: '🎨',
    fr: 'Créativité & Arts',
    en: 'Creativity & Arts',
    themes: [
      { id: 'drawing-manga', emoji: '✏️', fr: 'Dessin & Manga', en: 'Drawing & Manga' },
      { id: 'music-creation', emoji: '🎵', fr: 'Création musicale', en: 'Music creation' },
      { id: 'dance', emoji: '💃', fr: 'Danse', en: 'Dance' },
      { id: 'cinema', emoji: '🎬', fr: 'Cinéma & Films', en: 'Cinema & Movies' },
      { id: 'theater', emoji: '🎭', fr: 'Théâtre & Comédie', en: 'Theater & Comedy' },
      { id: 'photography', emoji: '📸', fr: 'Photo & Vidéo', en: 'Photo & Video' },
    ]
  },
  {
    id: 'science-discovery',
    emoji: '🔬',
    fr: 'Science & Découvertes',
    en: 'Science & Discovery',
    themes: [
      { id: 'inventions', emoji: '💡', fr: 'Inventions', en: 'Inventions' },
      { id: 'experiments', emoji: '🧪', fr: 'Expériences folles', en: 'Crazy experiments' },
      { id: 'nature-science', emoji: '🌿', fr: 'Nature & Écologie', en: 'Nature & Ecology' },
      { id: 'archaeology', emoji: '🏛️', fr: 'Archéologie', en: 'Archaeology' },
      { id: 'medicine', emoji: '🏥', fr: 'Médecine & Corps humain', en: 'Medicine & Human body' },
      { id: 'astronomy', emoji: '🔭', fr: 'Astronomie', en: 'Astronomy' },
    ]
  },
];

const TEXTS = {
  fr: {
    title: 'Paramètres',
    language: 'Langue',
    difficulty: 'Difficulté',
    difficultyHint: 'Ajuste la complexité des histoires',
    difficultyLevels: ['Très facile', 'Facile', 'Normal', 'Difficile', 'Expert'],
    themes: 'Thèmes préférés',
    themesHint: 'Choisis au moins 1 thème',
    save: 'Enregistrer',
    cancel: 'Annuler',
    selected: 'sélectionné(s)',
  },
  en: {
    title: 'Settings',
    language: 'Language',
    difficulty: 'Difficulty',
    difficultyHint: 'Adjust story complexity',
    difficultyLevels: ['Very easy', 'Easy', 'Normal', 'Hard', 'Expert'],
    themes: 'Favorite themes',
    themesHint: 'Pick at least 1 theme',
    save: 'Save',
    cancel: 'Cancel',
    selected: 'selected',
  },
};

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { language, progress, setLanguage, setPreferences, setDifficulty } = useUserProgressStore();
  
  const [selectedLanguage, setSelectedLanguage] = useState(language || 'fr');
  const [selectedThemes, setSelectedThemes] = useState<string[]>(
    progress?.preferredThemes || []
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState(
    progress?.difficultyMultiplier || 1.0
  );
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const t = TEXTS[selectedLanguage as keyof typeof TEXTS] || TEXTS.fr;

  // Sync with store when dialog opens
  useEffect(() => {
    if (isOpen) {
      queueMicrotask(() => {
        setSelectedLanguage(language || 'fr');
        setSelectedThemes(progress?.preferredThemes || []);
        setSelectedDifficulty(progress?.difficultyMultiplier || 1.0);
        setExpandedCategories([]);
      });
    }
  }, [isOpen, language, progress?.preferredThemes, progress?.difficultyMultiplier]);

  const handleToggleTheme = (themeId: string) => {
    setSelectedThemes(prev => 
      prev.includes(themeId)
        ? prev.filter(id => id !== themeId)
        : [...prev, themeId]
    );
  };

  const handleToggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getSelectedCountInCategory = (category: ThemeCategory) => {
    return category.themes.filter(theme => selectedThemes.includes(theme.id)).length;
  };

  const handleSave = () => {
    // Vérifier si les thèmes ou la difficulté ont changé
    const originalThemes = progress?.preferredThemes || [];
    const originalDifficulty = progress?.difficultyMultiplier || 1.0;
    
    const themesChanged = 
      selectedThemes.length !== originalThemes.length ||
      selectedThemes.some(theme => !originalThemes.includes(theme));
    
    const difficultyChanged = selectedDifficulty !== originalDifficulty;
    
    setLanguage(selectedLanguage);
    setPreferences(selectedThemes, progress?.interests || []);
    setDifficulty(selectedDifficulty);
    onClose(themesChanged || difficultyChanged);
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
            onClick={() => onClose(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />
          
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto bg-white rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Settings size={18} className="text-gray-400" />
                <h2 className="text-lg font-medium text-gray-800">{t.title}</h2>
              </div>
              <div className="flex items-center gap-3">
                {selectedThemes.length > 0 && (
                  <span className="text-xs text-purple-600 font-medium">
                    {selectedThemes.length} {t.selected}
                  </span>
                )}
                <button
                  onClick={() => onClose(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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

              {/* Difficulty slider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.difficulty}
                </label>
                <p className="text-xs text-gray-400 mb-3">{t.difficultyHint}</p>
                
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  {/* Difficulty level indicator */}
                  <div className="flex justify-between mb-3">
                    {t.difficultyLevels.map((level, index) => {
                      // Map index to difficulty: 0=0.5, 1=0.75, 2=1.0, 3=1.5, 4=2.0
                      const difficultyValues = [0.5, 0.75, 1.0, 1.5, 2.0];
                      const isActive = Math.abs(selectedDifficulty - difficultyValues[index]) < 0.13;
                      return (
                        <button
                          key={level}
                          onClick={() => setSelectedDifficulty(difficultyValues[index])}
                          className={`text-xs font-medium px-2 py-1 rounded-full transition-all ${
                            isActive
                              ? 'bg-purple-500 text-white'
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Slider */}
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.05"
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  
                  {/* Emoji indicators */}
                  <div className="flex justify-between mt-2 text-xl">
                    <span>🐣</span>
                    <span>🎓</span>
                  </div>
                </div>
              </div>

              {/* Theme selection by categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.themes}
                </label>
                <p className="text-xs text-gray-400 mb-3">{t.themesHint}</p>
                
                <div className="space-y-2">
                  {THEME_CATEGORIES.map((category) => {
                    const isExpanded = expandedCategories.includes(category.id);
                    const selectedCount = getSelectedCountInCategory(category);
                    
                    return (
                      <div
                        key={category.id}
                        className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100"
                      >
                        {/* Category Header */}
                        <button
                          onClick={() => handleToggleCategory(category.id)}
                          className="w-full flex items-center justify-between p-3 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{category.emoji}</span>
                            <span className="text-sm font-medium text-gray-700">
                              {selectedLanguage === 'en' ? category.en : category.fr}
                            </span>
                            {selectedCount > 0 && (
                              <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                                {selectedCount}
                              </span>
                            )}
                          </div>
                          <div className="text-gray-400">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </button>

                        {/* Themes Grid */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="p-3 pt-0 grid grid-cols-2 gap-1.5">
                                {category.themes.map((theme) => {
                                  const isSelected = selectedThemes.includes(theme.id);
                                  return (
                                    <button
                                      key={theme.id}
                                      onClick={() => handleToggleTheme(theme.id)}
                                      className={`relative flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                                        isSelected
                                          ? 'border-purple-400 bg-purple-50'
                                          : 'border-gray-200 bg-white hover:border-gray-300'
                                      }`}
                                    >
                                      <span className="text-base shrink-0">{theme.emoji}</span>
                                      <span className={`text-xs font-medium leading-tight ${
                                        isSelected ? 'text-purple-700' : 'text-gray-600'
                                      }`}>
                                        {selectedLanguage === 'en' ? theme.en : theme.fr}
                                      </span>
                                      {isSelected && (
                                        <motion.div
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-purple-500 rounded-full flex items-center justify-center"
                                        >
                                          <Check size={8} className="text-white" />
                                        </motion.div>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => onClose(false)}
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
