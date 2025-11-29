'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface FillInBlankProps {
  sentence: string;
  blanks: { position: number; correctAnswer: string; options: string[] }[];
  onAnswer: (answers: string[], isCorrect: boolean) => void;
}

export function FillInBlankQuestion({ sentence, blanks, onAnswer }: FillInBlankProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<(string | null)[]>(
    blanks.map(() => null)
  );
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleSelect = (blankIndex: number, answer: string) => {
    if (hasAnswered) return;
    
    const newAnswers = [...selectedAnswers];
    newAnswers[blankIndex] = answer;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (selectedAnswers.some(a => a === null)) return;
    
    setHasAnswered(true);
    const isCorrect = selectedAnswers.every((answer, idx) => 
      answer === blanks[idx].correctAnswer
    );
    
    setTimeout(() => {
      onAnswer(selectedAnswers as string[], isCorrect);
    }, 2000);
  };

  // Split sentence into parts with blanks
  const renderSentence = () => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    blanks.forEach((blank, blankIdx) => {
      parts.push(
        <span key={`text-${blankIdx}`}>
          {sentence.slice(lastIndex, blank.position)}
        </span>
      );

      const selected = selectedAnswers[blankIdx];
      const isCorrect = selected === blank.correctAnswer;
      
      parts.push(
        <span
          key={`blank-${blankIdx}`}
          className={`
            inline-flex items-center px-4 py-1 mx-1 rounded-lg font-bold border-2
            ${!selected
              ? 'bg-yellow-100 border-yellow-400 border-dashed'
              : hasAnswered && isCorrect
              ? 'bg-green-100 border-green-500'
              : hasAnswered && !isCorrect
              ? 'bg-red-100 border-red-500'
              : 'bg-purple-100 border-purple-400'
            }
          `}
        >
          {selected || '____'}
          {hasAnswered && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-2"
            >
              {isCorrect ? (
                <Check size={16} className="text-green-600" />
              ) : (
                <X size={16} className="text-red-600" />
              )}
            </motion.span>
          )}
        </span>
      );

      lastIndex = blank.position;
    });

    parts.push(<span key="end">{sentence.slice(lastIndex)}</span>);
    return parts;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-purple-200">
        <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
          Fill in the blanks to complete the sentence! 📝
        </h3>

        {/* Sentence with blanks */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-6 text-xl leading-relaxed">
          {renderSentence()}
        </div>

        {/* Word Options */}
        {blanks.map((blank, blankIdx) => (
          <div key={blankIdx} className="mb-6">
            <p className="text-sm font-semibold text-gray-600 mb-2">
              Choose word for blank #{blankIdx + 1}:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {blank.options.map((option) => {
                const isSelected = selectedAnswers[blankIdx] === option;
                const isCorrect = option === blank.correctAnswer;
                const showFeedback = hasAnswered && isSelected;

                return (
                  <motion.button
                    key={option}
                    onClick={() => handleSelect(blankIdx, option)}
                    disabled={hasAnswered}
                    className={`
                      p-4 rounded-xl font-medium text-lg transition-all
                      ${isSelected && !hasAnswered
                        ? 'bg-purple-500 text-white'
                        : showFeedback && isCorrect
                        ? 'bg-green-500 text-white'
                        : showFeedback && !isCorrect
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                      ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    whileHover={!hasAnswered ? { scale: 1.05 } : {}}
                    whileTap={!hasAnswered ? { scale: 0.95 } : {}}
                  >
                    {option}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Submit Button */}
        {!hasAnswered && (
          <motion.button
            onClick={handleSubmit}
            disabled={selectedAnswers.some(a => a === null)}
            className={`
              w-full mt-6 px-6 py-4 font-bold text-lg rounded-xl shadow-lg
              ${selectedAnswers.some(a => a === null)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-xl'
              }
            `}
            whileHover={selectedAnswers.every(a => a !== null) ? { scale: 1.02 } : {}}
            whileTap={selectedAnswers.every(a => a !== null) ? { scale: 0.98 } : {}}
          >
            Check My Answer
          </motion.button>
        )}

        {/* Result */}
        {hasAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 p-6 rounded-xl ${
              selectedAnswers.every((answer, idx) => answer === blanks[idx].correctAnswer)
                ? 'bg-green-100 border-2 border-green-500'
                : 'bg-red-100 border-2 border-red-500'
            }`}
          >
            <h4 className="text-xl font-bold mb-2">
              {selectedAnswers.every((answer, idx) => answer === blanks[idx].correctAnswer)
                ? 'Perfect! 🎉'
                : 'Not quite! 💪'}
            </h4>
            <p className="text-gray-700">
              {selectedAnswers.every((answer, idx) => answer === blanks[idx].correctAnswer)
                ? 'You filled in all the blanks correctly!'
                : 'Review the story and try to remember the right words!'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
