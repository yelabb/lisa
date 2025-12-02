'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, Zap } from 'lucide-react';

interface ReadingCountdownProps {
  isOpen: boolean;
  onComplete: () => void;
  language: string;
}

export function ReadingCountdown({ isOpen, onComplete, language }: ReadingCountdownProps) {
  const [countdown, setCountdown] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (!isOpen || isPaused) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Countdown terminé, on démarre avec une petite pause pour l'effet visuel
      setTimeout(() => onComplete(), 300);
    }
  }, [countdown, isOpen, isPaused, onComplete]);

  // Reset countdown when reopening
  useEffect(() => {
    // Si le modal vient de s'ouvrir (transition de false à true)
    if (isOpen && !wasOpenRef.current) {
      queueMicrotask(() => {
        setCountdown(3);
        setIsPaused(false);
      });
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  // Support du raccourci clavier Espace
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        onComplete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  const getMessage = () => {
    if (countdown === 0) {
      return language === 'fr' ? "C'est parti ! 🚀" : "Let's go! 🚀";
    }
    return language === 'fr' ? "Prépare-toi..." : "Get ready...";
  };

  const getReadyText = () => {
    return language === 'fr' ? "Commencer maintenant" : "Start now";
  };

  const getPauseText = () => {
    return language === 'fr' ? "Pause" : "Pause";
  };

  const getResumeText = () => {
    return language === 'fr' ? "Reprendre" : "Resume";
  };

  // Calcul du pourcentage de progression
  const progress = ((3 - countdown) / 3) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ pointerEvents: 'all' }}
        >
          {/* Compact countdown overlay - coins arrondis, style moderne */}
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative"
          >
            {/* Card principale avec glassmorphism */}
            <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-8 sm:p-10 min-w-[280px] sm:min-w-[320px]">
              
              {/* Cercle de countdown central */}
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto mb-6">
                {/* SVG Progress circle */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="50%"
                    cy="50%"
                    r="42%"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-purple-100 dark:text-purple-900/30"
                  />
                  {/* Animated progress circle */}
                  <motion.circle
                    cx="50%"
                    cy="50%"
                    r="42%"
                    stroke="url(#gradient)"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42} ${2 * Math.PI * 42}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                    animate={{ 
                      strokeDashoffset: 2 * Math.PI * 42 * (1 - progress / 100),
                    }}
                    transition={{ 
                      duration: isPaused ? 0 : 1,
                      ease: 'linear'
                    }}
                  />
                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Countdown number ou emoji au centre */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <AnimatePresence mode="wait">
                    {countdown > 0 ? (
                      <motion.div
                        key={countdown}
                        initial={{ scale: 0.5, opacity: 0, rotateY: -90 }}
                        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                        exit={{ scale: 1.5, opacity: 0, rotateY: 90 }}
                        transition={{ 
                          type: 'spring',
                          stiffness: 200,
                          damping: 15
                        }}
                      >
                        <div className="text-7xl sm:text-8xl font-black bg-linear-to-br from-purple-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                          {countdown}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="rocket"
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: 0,
                        }}
                        transition={{
                          duration: 0.5,
                          scale: {
                            repeat: Infinity,
                            duration: 0.8,
                          }
                        }}
                        className="text-6xl"
                      >
                        🚀
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Message */}
              <motion.div
                animate={{ 
                  opacity: countdown === 0 ? [1, 0.7, 1] : 1 
                }}
                transition={{ 
                  duration: 0.5, 
                  repeat: countdown === 0 ? Infinity : 0 
                }}
                className="text-center mb-6"
              >
                <p className="text-xl sm:text-2xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {getMessage()}
                </p>
              </motion.div>

              {/* Action buttons - Layout horizontal compact */}
              <div className="flex items-center justify-center gap-2">
                {/* Pause/Resume button - petit et discret */}
                <motion.button
                  onClick={() => setIsPaused(!isPaused)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center justify-center text-gray-600 dark:text-gray-300 shadow-sm"
                  aria-label={isPaused ? getResumeText() : getPauseText()}
                >
                  {isPaused ? <Play size={18} strokeWidth={2.5} /> : <Pause size={18} strokeWidth={2.5} />}
                </motion.button>

                {/* Ready button - CTA principal avec icône */}
                <motion.button
                  onClick={onComplete}
                  whileHover={{ scale: 1.03, boxShadow: '0 10px 30px -5px rgba(139, 92, 246, 0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-6 py-3 sm:px-8 sm:py-3.5 rounded-2xl bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  <Zap size={18} className="animate-pulse" />
                  <span>{getReadyText()}</span>
                </motion.button>
              </div>

              {/* Petite indication visuelle en bas */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.5 }}
                className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400"
              >
                {language === 'fr' ? 'Tapez Espace pour commencer' : 'Press Space to start'}
              </motion.div>
            </div>

            {/* Effet de lueur autour */}
            <motion.div
              className="absolute inset-0 -z-10 rounded-3xl bg-linear-to-r from-purple-400 to-pink-400 blur-2xl"
              animate={{
                opacity: [0.1, 0.2, 0.1],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
