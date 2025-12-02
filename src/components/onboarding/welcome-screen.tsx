'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
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
      className="min-h-screen bg-linear-to-b from-purple-50 to-white flex flex-col items-center justify-center p-6"
    >
      {/* Animated Lisa mascot */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 1, bounce: 0.5 }}
        className="relative mb-8"
      >
        <motion.div
          className="w-32 h-32 bg-linear-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-2xl"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-6xl">📚</span>
        </motion.div>
        
        {/* Sparkles around */}
        <motion.div
          className="absolute -top-2 -right-2 text-yellow-400"
          animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Sparkles size={24} fill="currentColor" />
        </motion.div>
        <motion.div
          className="absolute -bottom-1 -left-3 text-purple-400"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        >
          <Sparkles size={20} fill="currentColor" />
        </motion.div>
      </motion.div>

      {/* Welcome text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-light text-gray-800 mb-4">
          {t('greeting')} 👋
        </h1>
        <p className="text-xl text-gray-600 font-light">
          {t('iAmLisa')} <span className="text-purple-600 font-medium">Lisa</span>
        </p>
      </motion.div>

      {/* Friendly message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="max-w-md text-center mb-12"
      >
        <p className="text-lg text-gray-600 font-light leading-relaxed">
          {t('helpMessage')}
          <br />
          <span className="text-purple-500">{t('learnTogether')} 💜</span>
        </p>
      </motion.div>

      {/* Big friendly button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onContinue}
        className="px-12 py-5 bg-linear-to-r from-purple-500 to-pink-500 text-white text-xl font-medium rounded-full shadow-lg hover:shadow-xl transition-shadow"
      >
        {t('startButton')} ✨
      </motion.button>
    </motion.div>
  );
}
