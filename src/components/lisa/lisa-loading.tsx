'use client';

import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Wand2 } from 'lucide-react';

interface LisaLoadingProps {
  message?: string;
  type?: 'story' | 'question' | 'general';
}

const LOADING_MESSAGES = {
  story: [
    "Creating a magical story just for you...",
    "Picking the perfect words...",
    "Adding some adventure...",
    "Making it exciting...",
  ],
  question: [
    "Thinking of fun questions...",
    "Testing your knowledge...",
    "Getting everything ready...",
  ],
  general: [
    "Working on it...",
    "Just a moment...",
    "Almost ready...",
  ],
};

export function LisaLoading({ message, type = 'general' }: LisaLoadingProps) {
  const messages = LOADING_MESSAGES[type];
  const displayMessage = message || messages[Math.floor(Math.random() * messages.length)];

  return (
    <div className="flex flex-col items-center justify-center p-12">
      {/* Main Lisa Character */}
      <div className="relative mb-8">
        {/* Pulsing Glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Character Circle */}
        <motion.div
          className="relative w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-2xl"
          animate={{
            rotate: [0, 5, -5, 5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <motion.span
            className="text-6xl"
            animate={{
              rotate: [-10, 10, -10],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            🤔
          </motion.span>
        </motion.div>

        {/* Floating Icons */}
        <motion.div
          className="absolute -top-4 -right-4 text-yellow-400"
          animate={{
            y: [0, -10, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <Sparkles size={28} fill="currentColor" />
        </motion.div>

        {type === 'story' && (
          <motion.div
            className="absolute -bottom-2 -left-2 text-blue-400"
            animate={{
              y: [0, -8, 0],
              rotate: [0, -10, 10, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: 0.5,
            }}
          >
            <BookOpen size={24} />
          </motion.div>
        )}

        {type === 'question' && (
          <motion.div
            className="absolute -bottom-2 -left-2 text-purple-400"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Wand2 size={24} />
          </motion.div>
        )}

        {/* Thinking Dots */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-purple-500 rounded-full"
              animate={{
                y: [0, -12, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>

      {/* Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <p className="text-xl font-semibold text-gray-700 mb-2">
          {displayMessage}
        </p>
        <motion.p
          className="text-sm text-gray-500"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          This will just take a moment ✨
        </motion.p>
      </motion.div>

      {/* Progress Bar */}
      <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mt-6">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
}

// Skeleton loader for story/content
export function LisaContentSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 rounded-lg w-3/4" />
      <div className="h-6 bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 rounded-lg w-full" />
      <div className="h-6 bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 rounded-lg w-5/6" />
      <div className="h-6 bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 rounded-lg w-2/3" />
    </div>
  );
}

// Mini loading indicator for inline use
export function LisaMiniLoader() {
  return (
    <div className="inline-flex items-center gap-2">
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="text-xl"
      >
        📚
      </motion.span>
      <span className="text-sm text-gray-600">Lisa is thinking...</span>
    </div>
  );
}
