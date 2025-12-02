'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';

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
      // Countdown terminé
      setTimeout(() => onComplete(), 200);
    }
  }, [countdown, isOpen, isPaused, onComplete]);

  // Reset countdown when reopening
  useEffect(() => {
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

  const getReadyText = () => {
    return language === 'fr' ? "C'est parti" : "Let's go";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Design minimaliste - juste le countdown */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative"
          >
            {/* Cercle de countdown - épuré */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40">
              {/* SVG minimaliste */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                {/* Progress circle */}
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  className="text-white/20"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (countdown / 3)}`}
                  style={{
                    transition: 'stroke-dashoffset 1s linear',
                  }}
                />
              </svg>

              {/* Countdown number - très épuré */}
              <div className="absolute inset-0 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={countdown}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.2, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-7xl sm:text-8xl font-light text-white tabular-nums"
                  >
                    {countdown}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Bouton CTA minimaliste - en dessous */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={onComplete}
              className="absolute -bottom-20 left-1/2 -translate-x-1/2 whitespace-nowrap
                group flex items-center gap-2 px-6 py-2.5 
                bg-white/10 hover:bg-white/20 backdrop-blur-sm
                border border-white/20 hover:border-white/30
                rounded-full text-white font-medium text-sm
                transition-all duration-200"
            >
              <Play size={14} className="group-hover:translate-x-0.5 transition-transform" />
              <span>{getReadyText()}</span>
            </motion.button>

            {/* Hint subtil */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-32 left-1/2 -translate-x-1/2 text-xs text-white/40 whitespace-nowrap"
            >
              {language === 'fr' ? 'ou appuie sur Espace' : 'or press Space'}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
