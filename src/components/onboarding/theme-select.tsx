'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

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

const TEXTS = {
  fr: {
    title: 'Thèmes préférés',
    subtitle: 'Choisis ce qui te passionne (au moins 1)',
    continue: 'C\'est parti! 🚀',
    minSelect: 'Choisis au moins 1 thème',
    selected: 'sélectionné(s)',
    expandCategory: 'Voir les thèmes',
    collapseCategory: 'Réduire',
  },
  en: {
    title: 'Favorite themes',
    subtitle: 'Pick what you\'re passionate about (at least 1)',
    continue: 'Let\'s go! 🚀',
    minSelect: 'Pick at least 1 theme',
    selected: 'selected',
    expandCategory: 'See themes',
    collapseCategory: 'Collapse',
  },
};

export function ThemeSelect({ language, onContinue }: ThemeSelectProps) {
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const t = TEXTS[language as keyof typeof TEXTS] || TEXTS.fr;
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
      className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-white flex flex-col items-center p-4 pb-32"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-6 mb-4 sticky top-0 bg-gradient-to-b from-indigo-50 to-transparent z-10 w-full"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-1">
          {t.title}
        </h2>
        <p className="text-gray-500 text-sm">
          {t.subtitle}
        </p>
        {selectedThemes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
          >
            <Check size={14} />
            {selectedThemes.length} {t.selected}
          </motion.div>
        )}
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
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
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
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
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
                            className={`relative flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                              isSelected
                                ? 'border-purple-400 bg-purple-50'
                                : 'border-gray-100 bg-gray-50 hover:border-gray-200'
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
                                <Check size={10} className="text-white" />
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

      {/* Fixed bottom bar */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent"
      >
        <div className="max-w-2xl mx-auto">
          {selectedThemes.length === 0 && (
            <p className="text-center text-gray-400 text-sm mb-3">
              {t.minSelect}
            </p>
          )}
          <motion.button
            whileHover={canContinue ? { scale: 1.02 } : {}}
            whileTap={canContinue ? { scale: 0.98 } : {}}
            onClick={handleContinue}
            disabled={!canContinue}
            className={`w-full py-4 rounded-2xl text-lg font-medium transition-all ${
              canContinue
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {t.continue}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
