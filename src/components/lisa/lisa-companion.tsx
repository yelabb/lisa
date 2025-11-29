'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { LisaState, LisaMessage } from '@/types/lisa';

interface LisaCompanionProps {
  state?: LisaState;
  message?: LisaMessage;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'small' | 'medium' | 'large';
  showMessage?: boolean;
}

const LISA_EMOJIS: Record<LisaState, string> = {
  idle: '📚',
  thinking: '🤔',
  success: '🎉',
  celebration: '🥳',
  struggle: '💪',
  encouraging: '😊',
  reading: '📖',
  surprised: '😮',
};

const LISA_COLORS: Record<LisaState, string> = {
  idle: 'from-purple-400 to-pink-400',
  thinking: 'from-blue-400 to-purple-400',
  success: 'from-green-400 to-emerald-400',
  celebration: 'from-yellow-400 to-orange-400',
  struggle: 'from-orange-400 to-red-400',
  encouraging: 'from-pink-400 to-rose-400',
  reading: 'from-indigo-400 to-blue-400',
  surprised: 'from-purple-400 to-fuchsia-400',
};

const POSITION_CLASSES = {
  'bottom-right': 'bottom-6 right-6',
  'bottom-left': 'bottom-6 left-6',
  'top-right': 'top-6 right-6',
  'top-left': 'top-6 left-6',
};

const SIZE_CONFIG = {
  small: { container: 'w-16 h-16', emoji: 'text-3xl', bubble: 'max-w-[200px]' },
  medium: { container: 'w-20 h-20', emoji: 'text-4xl', bubble: 'max-w-[280px]' },
  large: { container: 'w-28 h-28', emoji: 'text-6xl', bubble: 'max-w-[320px]' },
};

export function LisaCompanion({
  state = 'idle',
  message,
  position = 'bottom-right',
  size = 'medium',
  showMessage = true,
}: LisaCompanionProps) {
  const sizeConfig = SIZE_CONFIG[size];
  const positionClass = POSITION_CLASSES[position];

  // Determine if message should be on left or right based on position
  const messageOnLeft = position.includes('right');

  return (
    <div className={`fixed ${positionClass} z-50 flex items-end gap-3 ${messageOnLeft ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Lisa Character */}
      <motion.div
        className="relative cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Glow Effect */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${LISA_COLORS[state]} rounded-full blur-xl opacity-60`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Main Circle */}
        <motion.div
          className={`relative ${sizeConfig.container} bg-gradient-to-br ${LISA_COLORS[state]} rounded-full flex items-center justify-center shadow-2xl`}
          animate={getAnimationForState(state)}
          transition={{
            duration: state === 'thinking' ? 1 : 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Emoji */}
          <motion.span
            className={sizeConfig.emoji}
            animate={getEmojiAnimationForState(state)}
            transition={{
              duration: state === 'thinking' ? 0.5 : 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {LISA_EMOJIS[state]}
          </motion.span>
        </motion.div>

        {/* Sparkle Effect for Success States */}
        {(state === 'success' || state === 'celebration') && (
          <motion.div
            className="absolute -top-2 -right-2 text-yellow-400"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <Sparkles size={size === 'small' ? 16 : size === 'medium' ? 20 : 24} fill="currentColor" />
          </motion.div>
        )}

        {/* Thinking Dots */}
        {state === 'thinking' && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-purple-500 rounded-full"
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Message Bubble */}
      <AnimatePresence>
        {showMessage && message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`${sizeConfig.bubble} mb-2`}
          >
            <div className="bg-white rounded-2xl shadow-lg p-4 border-2 border-purple-200">
              {/* Message Text */}
              <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                {message.text}
              </p>

              {/* Action Button */}
              {message.action && (
                <motion.button
                  onClick={message.action.onClick}
                  className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-shadow"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {message.action.label}
                </motion.button>
              )}

              {/* Speech Bubble Triangle */}
              <div
                className={`absolute bottom-3 ${
                  messageOnLeft ? 'right-[-8px]' : 'left-[-8px]'
                } w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ${
                  messageOnLeft 
                    ? 'border-l-[8px] border-l-white' 
                    : 'border-r-[8px] border-r-white'
                }`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Animation configurations for different states
function getAnimationForState(state: LisaState) {
  switch (state) {
    case 'thinking':
      return {
        rotate: [0, 5, -5, 0],
        scale: [1, 1.05, 1],
      };
    case 'success':
    case 'celebration':
      return {
        scale: [1, 1.1, 1],
        rotate: [0, 10, -10, 0],
      };
    case 'struggle':
      return {
        x: [0, -3, 3, 0],
      };
    case 'encouraging':
      return {
        y: [0, -5, 0],
      };
    case 'reading':
      return {
        rotate: [0, -2, 2, 0],
      };
    case 'surprised':
      return {
        scale: [1, 1.15, 1],
      };
    case 'idle':
    default:
      return {
        y: [0, -5, 0],
      };
  }
}

function getEmojiAnimationForState(state: LisaState) {
  switch (state) {
    case 'thinking':
      return {
        rotate: [-10, 10, -10],
      };
    case 'celebration':
      return {
        rotate: [0, 360],
      };
    default:
      return {};
  }
}
