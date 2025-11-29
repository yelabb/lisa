'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { Question } from '@/types/reading';

interface TrueFalseProps {
  question: Question;
  onAnswer: (answer: string, isCorrect: boolean) => void;
}

export function TrueFalseQuestion({ question, onAnswer }: TrueFalseProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<'true' | 'false' | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleSelect = (answer: 'true' | 'false') => {
    if (hasAnswered) return;
    
    setSelectedAnswer(answer);
    setIsFlipped(true);
    setHasAnswered(true);
    
    const isCorrect = answer === question.correctAnswer;
    
    setTimeout(() => {
      onAnswer(answer, isCorrect);
    }, 2000);
  };

  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Question Card */}
      <motion.div
        className="relative"
        style={{ perspective: 1000 }}
      >
        <motion.div
          className="relative w-full"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front of Card */}
          <div
            className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border-2 border-purple-200"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
              {question.question}
            </h3>

            {/* True/False Buttons */}
            <div className="grid grid-cols-2 gap-6">
              <motion.button
                onClick={() => handleSelect('true')}
                disabled={hasAnswered}
                className={`
                  p-8 rounded-2xl font-bold text-2xl transition-all
                  ${selectedAnswer === 'true' && !isFlipped
                    ? 'bg-blue-500 text-white scale-105'
                    : 'bg-green-100 text-green-700 hover:bg-green-200 hover:scale-105'
                  }
                  ${hasAnswered ? 'cursor-not-allowed' : ''}
                `}
                whileHover={!hasAnswered ? { scale: 1.05 } : {}}
                whileTap={!hasAnswered ? { scale: 0.95 } : {}}
              >
                <div className="text-5xl mb-2">✓</div>
                TRUE
              </motion.button>

              <motion.button
                onClick={() => handleSelect('false')}
                disabled={hasAnswered}
                className={`
                  p-8 rounded-2xl font-bold text-2xl transition-all
                  ${selectedAnswer === 'false' && !isFlipped
                    ? 'bg-blue-500 text-white scale-105'
                    : 'bg-red-100 text-red-700 hover:bg-red-200 hover:scale-105'
                  }
                  ${hasAnswered ? 'cursor-not-allowed' : ''}
                `}
                whileHover={!hasAnswered ? { scale: 1.05 } : {}}
                whileTap={!hasAnswered ? { scale: 0.95 } : {}}
              >
                <div className="text-5xl mb-2">✗</div>
                FALSE
              </motion.button>
            </div>

            {/* Hint */}
            {question.hint && !hasAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200"
              >
                <p className="text-sm text-blue-800">
                  <span className="font-bold">💡 Hint:</span> {question.hint}
                </p>
              </motion.div>
            )}
          </div>

          {/* Back of Card (Result) */}
          <div
            className="absolute inset-0 bg-white rounded-3xl shadow-xl p-8 md:p-12 border-2 border-purple-200"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="flex flex-col items-center justify-center h-full text-center">
              {/* Result Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 ${
                  isCorrect ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                {isCorrect ? (
                  <Check size={64} className="text-white" />
                ) : (
                  <X size={64} className="text-white" />
                )}
              </motion.div>

              {/* Result Text */}
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`text-3xl font-bold mb-4 ${
                  isCorrect ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {isCorrect ? 'Correct! 🎉' : 'Not quite! 💪'}
              </motion.h3>

              {/* Explanation */}
              {question.explanation && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-lg text-gray-700 max-w-md"
                >
                  {question.explanation}
                </motion.p>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
