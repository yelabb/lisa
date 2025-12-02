'use client';

import { motion } from 'framer-motion';
import { BookOpen, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface WelcomeScreenProps {
  onContinue: () => void;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const t = useTranslations('onboarding');
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white flex flex-col items-center justify-center p-6"
    >
      {/* Minimal logo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
          <BookOpen size={36} className="text-white" strokeWidth={1.5} />
        </div>
      </motion.div>

      {/* Brand name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-center mb-6"
      >
        <h1 className="text-5xl sm:text-6xl font-light tracking-tight text-gray-900">
          Lisa
        </h1>
      </motion.div>

      {/* Tagline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="max-w-md text-center mb-16"
      >
        <p className="text-xl sm:text-2xl text-gray-600 font-light leading-relaxed tracking-tight">
          {t('helpMessage')}
        </p>
      </motion.div>

      {/* CTA Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onContinue}
        className="group flex items-center gap-3 px-8 py-4 bg-purple-600 text-white text-lg font-medium rounded-full hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/25"
      >
        {t('startButton')}
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </motion.button>

      {/* Subtle decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex gap-1.5">
          <div className="w-8 h-1 bg-purple-500 rounded-full" />
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
        </div>
      </motion.div>
    </motion.div>
  );
}
