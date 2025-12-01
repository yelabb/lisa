'use client';

import { useState, useEffect, useRef } from 'react';
import type { LisaState, LisaMessage } from '@/types/lisa';

interface UseLisaHintsOptions {
  context: 'onboarding' | 'reading' | 'questions' | 'results';
  step?: string;
  correctAnswers?: number;
  totalQuestions?: number;
  timeSpent?: number;
  isLoading?: boolean;
}

interface LisaHint {
  state: LisaState;
  message: LisaMessage;
  trigger: 'immediate' | 'delay' | 'conditional';
  delay?: number;
}

export function useLisaHints(options: UseLisaHintsOptions) {
  const [currentHint, setCurrentHint] = useState<LisaHint | null>(null);
  const hasShownHintRef = useRef(false);
  const prevContextRef = useRef(options.context);

  useEffect(() => {
    // Reset hint when context changes
    if (prevContextRef.current !== options.context) {
      hasShownHintRef.current = false;
      prevContextRef.current = options.context;
      queueMicrotask(() => {
        setCurrentHint(null);
      });
    }

    const hint = getHintForContext(options);
    if (!hint) return;

    if (hint.trigger === 'immediate') {
      queueMicrotask(() => {
        setCurrentHint(hint);
        hasShownHintRef.current = true;
      });
    } else if (hint.trigger === 'delay' && hint.delay) {
      const timer = setTimeout(() => {
        if (!hasShownHintRef.current) {
          setCurrentHint(hint);
          hasShownHintRef.current = true;
        }
      }, hint.delay);
      return () => clearTimeout(timer);
    }
  }, [options.context, options.step, options.isLoading, options]);

  // Update hint based on performance
  useEffect(() => {
    if (options.context === 'questions' && options.correctAnswers !== undefined && options.totalQuestions !== undefined) {
      const accuracy = options.correctAnswers / options.totalQuestions;
      
      if (accuracy === 1 && options.totalQuestions >= 3) {
        queueMicrotask(() => {
          setCurrentHint({
            state: 'celebration',
            message: {
              text: "Perfect score! You're crushing it! 🎉",
            },
            trigger: 'immediate',
          });
        });
      } else if (accuracy < 0.5 && options.totalQuestions >= 3) {
        queueMicrotask(() => {
          setCurrentHint({
            state: 'encouraging',
            message: {
              text: "Don't worry! Every mistake helps you learn. You've got this! 💪",
            },
            trigger: 'immediate',
          });
        });
      }
    }
  }, [options.correctAnswers, options.totalQuestions, options.context]);

  return {
    state: currentHint?.state || 'idle',
    message: currentHint?.message,
    showMessage: currentHint !== null,
    dismissHint: () => setCurrentHint(null),
  };
}

function getHintForContext(options: UseLisaHintsOptions): LisaHint | null {
  const { context, step, isLoading } = options;

  // Loading state
  if (isLoading) {
    return {
      state: 'thinking',
      message: {
        text: "Just a moment! I'm working on something special for you... ✨",
      },
      trigger: 'immediate',
    };
  }

  // Onboarding hints
  if (context === 'onboarding') {
    switch (step) {
      case 'welcome':
        return {
          state: 'encouraging',
          message: {
            text: "Hi! I'm Lisa, your reading buddy! Let's create your Explorer Pass together! 🎫",
          },
          trigger: 'delay',
          delay: 1000,
        };
      case 'interests':
        return {
          state: 'idle',
          message: {
            text: "Pick what makes you excited! I'll use this to create awesome stories just for you! 🌟",
          },
          trigger: 'delay',
          delay: 2000,
        };
      case 'reading-level':
        return {
          state: 'reading',
          message: {
            text: "No wrong answer here! This helps me find stories that feel just right for you. 📖",
          },
          trigger: 'delay',
          delay: 2000,
        };
      case 'age':
        return {
          state: 'idle',
          message: {
            text: "This helps me choose the perfect stories and words for you! 🎂",
          },
          trigger: 'delay',
          delay: 1500,
        };
      case 'themes':
        return {
          state: 'encouraging',
          message: {
            text: "Almost done! Pick your favorite story types. You can even create your own! 🎨",
          },
          trigger: 'delay',
          delay: 2000,
        };
      case 'complete':
        return {
          state: 'celebration',
          message: {
            text: "Your Explorer Pass is ready! Time to start your reading adventure! 🚀",
          },
          trigger: 'immediate',
        };
    }
  }

  // Reading session hints
  if (context === 'reading') {
    return {
      state: 'reading',
      message: {
        text: "Take your time and enjoy the story! I'm here if you need help with any words. 📚",
      },
      trigger: 'delay',
      delay: 3000,
    };
  }

  // Question hints
  if (context === 'questions') {
    return {
      state: 'encouraging',
      message: {
        text: "Think about what you just read. You can do this! 🧠",
      },
      trigger: 'delay',
      delay: 5000,
    };
  }

  return null;
}


