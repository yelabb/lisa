'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { TrendingUp, BookOpen, Target, Award, Flame, Calendar, Clock, Star } from 'lucide-react';
import { useUserProgressStore, getThemeStyles } from '@/stores';
import { useReadingSettingsStore } from '@/stores';

export default function StatsPage() {
  const tCommon = useTranslations('common');
  const tStats = useTranslations('stats');
  
  const { progress } = useUserProgressStore();
  const { theme: readingTheme } = useReadingSettingsStore();
  const themeStyles = getThemeStyles(readingTheme);

  // Calculate stats
  const totalStories = progress?.completedStories?.length || 0;
  const totalWords = progress?.totalWordsRead || 0;
  const avgAccuracy = progress?.completedStories?.length 
    ? (progress.completedStories.reduce((sum, s) => sum + (s.accuracy || 0), 0) / progress.completedStories.length * 100)
    : 0;
  const totalMinutes = Math.floor((progress?.totalReadingTime || 0) / 60);
  const currentStreak = progress?.currentStreak || 0;
  const bestStreak = progress?.longestStreak || 0;

  // Weekly activity
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
      stories: 0, // TODO: implement daily tracking
    };
  });

  const stats = [
    {
      icon: BookOpen,
      label: tStats('storiesRead'),
      value: totalStories.toString(),
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      icon: Star,
      label: tStats('wordsRead'),
      value: totalWords.toLocaleString(),
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    },
    {
      icon: Target,
      label: tStats('accuracy'),
      value: `${Math.round(avgAccuracy)}%`,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      icon: Clock,
      label: tStats('readingTime'),
      value: `${totalMinutes} min`,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
  ];

  return (
    <div className={`min-h-screen ${themeStyles.backgroundGradient} py-8 px-4`}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className={`text-3xl font-bold ${themeStyles.text}`}>
            {tStats('title')}
          </h1>
          <p className={themeStyles.textSecondary}>
            {tStats('subtitle')}
          </p>
        </motion.div>

        {/* Empty State - Show when no stories completed */}
        {totalStories === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${themeStyles.cardBg} rounded-2xl p-12 border ${themeStyles.border} text-center space-y-4`}
          >
            <div className="text-6xl mb-4">📚</div>
            <h2 className={`text-xl font-semibold ${themeStyles.text}`}>
              {tStats('noStatsYet')}
            </h2>
            <p className={themeStyles.textSecondary}>
              {tStats('startReadingToSeeStats')}
            </p>
            <a
              href="/learn"
              className="inline-block mt-4 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              {tStats('startReading')}
            </a>
          </motion.div>
        )}

        {/* Stats - Only show if user has completed stories */}
        {totalStories > 0 && (
          <>
        {/* Streaks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Current Streak */}
          <div className={`${themeStyles.cardBg} rounded-2xl p-6 border ${themeStyles.border}`}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Flame size={32} className="text-white" />
              </div>
              <div>
                <p className={`text-sm ${themeStyles.textMuted}`}>
                  {tStats('currentStreak')}
                </p>
                <p className={`text-3xl font-bold ${themeStyles.text}`}>
                  {currentStreak} {tCommon('days')}
                </p>
              </div>
            </div>
          </div>

          {/* Best Streak */}
          <div className={`${themeStyles.cardBg} rounded-2xl p-6 border ${themeStyles.border}`}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Award size={32} className="text-white" />
              </div>
              <div>
                <p className={`text-sm ${themeStyles.textMuted}`}>
                  {tStats('bestStreak')}
                </p>
                <p className={`text-3xl font-bold ${themeStyles.text}`}>
                  {bestStreak} {tCommon('days')}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={`${themeStyles.cardBg} rounded-2xl p-6 border ${themeStyles.border} text-center space-y-3`}
            >
              <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon size={24} className="text-white" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${themeStyles.text}`}>
                  {stat.value}
                </p>
                <p className={`text-sm ${themeStyles.textMuted}`}>
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Weekly Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`${themeStyles.cardBg} rounded-2xl p-6 border ${themeStyles.border}`}
        >
          <div className="flex items-center gap-2 mb-6">
            <Calendar size={24} className="text-purple-500" />
            <h2 className={`text-xl font-semibold ${themeStyles.text}`}>
              {tStats('weeklyActivity')}
            </h2>
          </div>
          
          <div className="flex justify-between items-end gap-2 h-40">
            {last7Days.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="flex-1 w-full flex items-end justify-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(20, day.stories * 30)}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                    className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg min-h-[8px]"
                  />
                </div>
                <p className={`text-xs ${themeStyles.textMuted}`}>
                  {day.day}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Level Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`${themeStyles.cardBg} rounded-2xl p-6 border ${themeStyles.border}`}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={24} className="text-purple-500" />
            <h2 className={`text-xl font-semibold ${themeStyles.text}`}>
              {tStats('levelProgress')}
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={themeStyles.textSecondary}>
                {tStats('level')} {Math.floor((progress?.difficultyMultiplier || 1) * 2)}
              </span>
              <span className={`font-semibold ${themeStyles.text}`}>
                {Math.round(((progress?.difficultyMultiplier || 1) % 1) * 100)}%
              </span>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((progress?.difficultyMultiplier || 1) % 1) * 100}%` }}
                transition={{ delay: 0.6, duration: 1 }}
                className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
              />
            </div>
            <p className={`text-sm ${themeStyles.textMuted}`}>
              {tStats('levelHint')}
            </p>
          </div>
        </motion.div>
        </>
        )}
      </div>
    </div>
  );
}
