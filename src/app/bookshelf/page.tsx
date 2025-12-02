'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { BookOpen, Clock, Star, ChevronDown, Filter, Search } from 'lucide-react';
import { useUserProgressStore, getThemeStyles } from '@/stores';
import { useReadingSettingsStore } from '@/stores';

type SortOption = 'recent' | 'oldest' | 'title' | 'accuracy';
type FilterOption = 'all' | 'thisWeek' | 'thisMonth';

export default function BookshelfPage() {
  const tBookshelf = useTranslations('bookshelf');
  
  const { progress } = useUserProgressStore();
  const { theme: readingTheme } = useReadingSettingsStore();
  const themeStyles = getThemeStyles(readingTheme);

  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedStory, setExpandedStory] = useState<string | null>(null);

  // Get completed stories
  const completedStories = progress?.completedStories || [];

  // Filter and sort stories
  const filteredStories = completedStories
    .filter((story) => {
      // Search filter
      if (searchQuery && !story.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Time filter
      if (filterBy !== 'all') {
        const storyDate = new Date(story.completedAt);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - storyDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (filterBy === 'thisWeek' && daysDiff > 7) return false;
        if (filterBy === 'thisMonth' && daysDiff > 30) return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
        case 'oldest':
          return new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'accuracy':
          return (b.accuracy || 0) - (a.accuracy || 0);
        default:
          return 0;
      }
    });

  const getAccuracyBadge = (accuracy: number) => {
    if (accuracy >= 0.8) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
    if (accuracy >= 0.5) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
  };

  return (
    <div className={`min-h-screen ${themeStyles.backgroundGradient} py-8 px-4`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="text-center space-y-2">
            <h1 className={`text-3xl font-bold ${themeStyles.text}`}>
              {tBookshelf('title')}
            </h1>
            <p className={themeStyles.textSecondary}>
              {tBookshelf('subtitle', { count: filteredStories.length })}
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={20} className={`absolute left-3 top-1/2 -translate-y-1/2 ${themeStyles.textMuted}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={tBookshelf('search')}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${themeStyles.border} ${themeStyles.cardBg} ${themeStyles.text} placeholder:${themeStyles.textMuted} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                className={`appearance-none pl-10 pr-10 py-3 rounded-xl border ${themeStyles.border} ${themeStyles.cardBg} ${themeStyles.text} focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer`}
              >
                <option value="all">{tBookshelf('filterAll')}</option>
                <option value="thisWeek">{tBookshelf('filterWeek')}</option>
                <option value="thisMonth">{tBookshelf('filterMonth')}</option>
              </select>
              <Filter size={20} className={`absolute left-3 top-1/2 -translate-y-1/2 ${themeStyles.textMuted}`} />
              <ChevronDown size={20} className={`absolute right-3 top-1/2 -translate-y-1/2 ${themeStyles.textMuted}`} />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className={`appearance-none px-4 pr-10 py-3 rounded-xl border ${themeStyles.border} ${themeStyles.cardBg} ${themeStyles.text} focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer`}
              >
                <option value="recent">{tBookshelf('sortRecent')}</option>
                <option value="oldest">{tBookshelf('sortOldest')}</option>
                <option value="title">{tBookshelf('sortTitle')}</option>
                <option value="accuracy">{tBookshelf('sortAccuracy')}</option>
              </select>
              <ChevronDown size={20} className={`absolute right-3 top-1/2 -translate-y-1/2 ${themeStyles.textMuted}`} />
            </div>
          </div>
        </motion.div>

        {/* Empty State */}
        {filteredStories.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${themeStyles.cardBg} rounded-2xl p-12 border ${themeStyles.border} text-center`}
          >
            <BookOpen size={64} className="mx-auto text-purple-400 mb-4" />
            <h2 className={`text-xl font-semibold ${themeStyles.text} mb-2`}>
              {searchQuery ? tBookshelf('noResults') : tBookshelf('emptyShelf')}
            </h2>
            <p className={themeStyles.textSecondary}>
              {searchQuery ? tBookshelf('trySearch') : tBookshelf('startReading')}
            </p>
          </motion.div>
        )}

        {/* Stories Grid - Kobo style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStories.map((story, index) => {
            const isExpanded = expandedStory === story.id;
            
            return (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`${themeStyles.cardBg} rounded-2xl border ${themeStyles.border} overflow-hidden ${themeStyles.hoverBg} transition-all`}
              >
                <button
                  onClick={() => setExpandedStory(isExpanded ? null : story.id)}
                  className="w-full text-left"
                >
                  {/* Book Cover */}
                  <div className="relative h-48 bg-linear-to-br from-purple-500 via-purple-600 to-purple-700 p-6 flex flex-col justify-between">
                    {/* Accuracy Badge */}
                    <div className="flex justify-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getAccuracyBadge(story.accuracy || 0)}`}>
                        {Math.round((story.accuracy || 0) * 100)}%
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="text-white font-bold text-lg line-clamp-2 mb-2">
                        {story.title}
                      </h3>
                      <div className="flex items-center gap-3 text-white/80 text-sm">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {Math.round(story.readingTime / 60)}m
                        </span>
                        <span className="flex items-center gap-1">
                          <Star size={14} />
                          {story.questionsCorrect}/{story.questionsAttempted}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${themeStyles.textMuted}`}>
                        {new Date(story.completedAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                      <ChevronDown
                        size={20}
                        className={`${themeStyles.textMuted} transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700"
                        >
                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className={`${themeStyles.overlayBg} rounded-lg p-3`}>
                              <p className={`text-xs ${themeStyles.textMuted} mb-1`}>
                                {tBookshelf('questions')}
                              </p>
                              <p className={`font-semibold ${themeStyles.text}`}>
                                {story.questionsCorrect}/{story.questionsAttempted}
                              </p>
                            </div>
                            <div className={`${themeStyles.overlayBg} rounded-lg p-3`}>
                              <p className={`text-xs ${themeStyles.textMuted} mb-1`}>
                                {tBookshelf('time')}
                              </p>
                              <p className={`font-semibold ${themeStyles.text}`}>
                                {Math.round(story.readingTime / 60)} min
                              </p>
                            </div>
                          </div>

                          {/* Themes */}
                          {story.themes && story.themes.length > 0 && (
                            <div>
                              <p className={`text-xs ${themeStyles.textMuted} mb-2`}>
                                {tBookshelf('themes')}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {story.themes.map((theme) => (
                                  <span
                                    key={theme}
                                    className={`px-2 py-1 rounded-full text-xs ${themeStyles.overlayBg} ${themeStyles.textSecondary}`}
                                  >
                                    {theme}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
