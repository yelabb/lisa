'use client';

import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, MousePointer, HelpCircle, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ReadyScreenProps {
  onStart: () => void;
  language: string;
}

const TIPS_ICONS = [
  BookOpen,
  MousePointer,
  HelpCircle,
  Sparkles,
];

export function ReadyScreen({ onStart }: ReadyScreenProps) {
  const t = useTranslations('onboarding');

  const tips = [t('tip1'), t('tip2'), t('tip3'), t('tip4')];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white flex flex-col items-center justify-center p-6"
    >
      {/* Ready message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className="text-2xl sm:text-3xl font-light text-gray-900 tracking-tight mb-2">
          {t('allSet')}
        </h2>
        <p className="text-gray-500 font-light">
          {t('shortStory')}
        </p>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-sm mb-12 space-y-3"
      >
        {tips.map((tip, index) => {
          const Icon = TIPS_ICONS[index];
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-purple-500/20">
                <Icon size={18} className="text-white" strokeWidth={1.5} />
              </div>
              <span className="text-gray-700 font-light">
                {tip}
              </span>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Start button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onStart}
        className="group flex items-center gap-3 px-8 py-4 bg-purple-600 text-white text-lg font-medium rounded-full hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/25"
      >
        {t('readFirstStory')}
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </motion.button>

      {/* Progress indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex gap-1.5">
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
          <div className="w-8 h-1 bg-purple-500 rounded-full" />
        </div>
      </motion.div>
    </motion.div>
  );
}
