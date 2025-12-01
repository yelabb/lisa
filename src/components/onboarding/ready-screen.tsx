'use client';

import { motion } from 'framer-motion';

interface ReadyScreenProps {
  onStart: () => void;
  language: string;
}

const TEXTS = {
  fr: {
    ready: 'Tout est prêt!',
    message: 'Je vais te montrer une histoire courte.',
    tip1: '📖 Lis à ton rythme',
    tip2: '👆 Clique sur n\'importe quel mot pour une explication rigolote!',
    tip3: '❓ Réponds aux petites questions',
    tip4: '🌟 Amuse-toi!',
    start: 'Lire ma première histoire!',
  },
  en: {
    ready: 'All set!',
    message: 'I\'ll show you a short story.',
    tip1: '📖 Read at your own pace',
    tip2: '👆 Click any word for a fun explanation!',
    tip3: '❓ Answer small questions',
    tip4: '🌟 Have fun!',
    start: 'Read my first story!',
  },
};

export function ReadyScreen({ onStart, language }: ReadyScreenProps) {
  const t = TEXTS[language as keyof typeof TEXTS] || TEXTS.fr;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-linear-to-b from-green-50 to-white flex flex-col items-center justify-center p-6"
    >
      {/* Celebration emoji */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="text-7xl mb-8"
      >
        🎉
      </motion.div>

      {/* Ready message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl font-light text-gray-800 mb-3">
          {t.ready}
        </h2>
        <p className="text-lg text-gray-600 font-light">
          {t.message}
        </p>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-3xl shadow-lg p-6 mb-10 max-w-sm w-full"
      >
        <div className="space-y-4">
          {[t.tip1, t.tip2, t.tip3, t.tip4].map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="text-gray-700 font-light text-lg"
            >
              {tip}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Start button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
        className="px-10 py-5 bg-linear-to-r from-green-500 to-emerald-500 text-white text-xl font-medium rounded-full shadow-lg hover:shadow-xl transition-shadow"
      >
        {t.start} →
      </motion.button>
    </motion.div>
  );
}
