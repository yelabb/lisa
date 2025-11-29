'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { Question } from '@/types/reading';

interface MultipleChoiceProps {
  question: Question;
  onAnswer: (answer: string, isCorrect: boolean) => void;
}

export function MultipleChoiceQuestion({ question, onAnswer }: MultipleChoiceProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleSelect = (option: string) => {
    if (hasAnswered) return;
    
    setSelectedOption(option);
    setHasAnswered(true);
    const isCorrect = option === question.correctAnswer;
    
    setTimeout(() => {
      onAnswer(option, isCorrect);
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-purple-200">
        {/* Question */}
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {question.question}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {question.options?.map((option, index) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === question.correctAnswer;
            const showFeedback = hasAnswered && isSelected;

            return (
              <motion.button
                key={index}
                onClick={() => handleSelect(option)}
                disabled={hasAnswered}
                className={`
                  w-full p-5 rounded-2xl text-left font-medium text-lg transition-all
                  ${!hasAnswered
                    ? 'bg-gray-100 hover:bg-purple-100 hover:border-purple-300 border-2 border-transparent'
                    : isSelected && isCorrect
                    ? 'bg-green-100 border-2 border-green-500'
                    : isSelected && !isCorrect
                    ? 'bg-red-100 border-2 border-red-500'
                    : 'bg-gray-100 opacity-50'
                  }
                  ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
                whileHover={!hasAnswered ? { scale: 1.02 } : {}}
                whileTap={!hasAnswered ? { scale: 0.98 } : {}}
                animate={showFeedback ? {
                  scale: [1, 1.05, 1],
                } : {}}
              >
                <div className="flex items-center justify-between">
                  <span className="flex-1">{option}</span>
                  {showFeedback && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    >
                      {isCorrect ? (
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <Check size={20} className="text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                          <X size={20} className="text-white" />
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
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

        {/* Explanation */}
        {hasAnswered && question.explanation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 p-4 rounded-xl border-2 ${
              selectedOption === question.correctAnswer
                ? 'bg-green-50 border-green-200'
                : 'bg-purple-50 border-purple-200'
            }`}
          >
            <p className="text-sm text-gray-700">
              <span className="font-bold">📚 Explanation:</span> {question.explanation}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
