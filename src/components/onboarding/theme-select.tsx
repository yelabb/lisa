'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ThemeSelectProps {
  language: string;
  onContinue: (themes: string[]) => void;
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

export function ThemeSelect({ language, onContinue }: ThemeSelectProps) {
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const t = useTranslations('onboarding');
  const canContinue = selectedThemes.length >= 1;

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
      className="min-h-screen bg-white flex flex-col items-center p-4 pb-40"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-6 mb-4 sticky top-0 bg-white/90 backdrop-blur-sm z-10 w-full"
      >
        <h2 className="text-2xl sm:text-3xl font-light text-gray-900 tracking-tight mb-1">
          {t('themesTitle')}
        </h2>
        <p className="text-gray-500 text-sm font-light">
          {t('themesSubtitle')}
        </p>
      </motion.div>

      {/* Categories */}
      <div className="w-full max-w-2xl space-y-3">
        {THEME_CATEGORIES.map((category, categoryIndex) => {
          const isExpanded = expandedCategories.includes(category.id);
          const selectedCount = getSelectedCountInCategory(category);
          
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.05 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Category Header */}
              <button
                onClick={() => handleToggleCategory(category.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.emoji}</span>
                  <span className="font-medium text-gray-800">
                    {language === 'en' ? category.en : category.fr}
                  </span>
                  {selectedCount > 0 && (
                    <span className="px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full font-medium">
                      {selectedCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="text-xs">
                    {category.themes.length} thèmes
                  </span>
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
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
                    <div className="p-4 pt-0 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {category.themes.map((theme, themeIndex) => {
                        const isSelected = selectedThemes.includes(theme.id);
                        return (
                          <motion.button
                            key={theme.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: themeIndex * 0.02 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleToggleTheme(theme.id)}
                            className={`relative flex items-center gap-2 p-3 rounded-xl border transition-all text-left ${
                              isSelected
                                ? 'border-purple-400 bg-purple-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <span className="text-lg flex-shrink-0">{theme.emoji}</span>
                            <span className={`text-xs font-medium leading-tight ${
                              isSelected ? 'text-purple-700' : 'text-gray-600'
                            }`}>
                              {language === 'en' ? theme.en : theme.fr}
                            </span>
                            
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center"
                              >
                                <Check size={10} className="text-white" strokeWidth={3} />
                              </motion.div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Fixed bottom bar - très visible */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-[100]">
        <div className="max-w-2xl mx-auto">
          {/* Progress indicator */}
          <div className="flex justify-center mb-4">
            <div className="flex gap-1.5">
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
              <div className="w-8 h-1 bg-purple-500 rounded-full" />
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              {selectedThemes.length === 0 ? (
                <span>{t('themesMinSelect')}</span>
              ) : (
                <span className="flex items-center gap-2">
                  <Check size={16} className="text-purple-500" />
                  <span className="font-medium text-gray-700">{selectedThemes.length}</span> {t('themesSelected')}
                </span>
              )}
            </div>
            <button
              onClick={handleContinue}
              disabled={!canContinue}
              className={`flex items-center gap-2 px-8 py-3 rounded-full text-base font-medium transition-all ${
                canContinue
                  ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-500/25 active:scale-95'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {t('themesButton')}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
