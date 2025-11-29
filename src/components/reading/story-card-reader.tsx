'use client';

import { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import type { StoryCard, VocabularyWord } from '@/types/reading';

interface StoryCardReaderProps {
  cards: StoryCard[];
  onComplete?: () => void;
  onCardChange?: (cardIndex: number) => void;
}

export function StoryCardReader({ cards, onComplete, onCardChange }: StoryCardReaderProps) {
  const [currentCard, setCurrentCard] = useState(0);
  const [direction, setDirection] = useState(0);
  const [selectedWord, setSelectedWord] = useState<VocabularyWord | null>(null);

  const handleNext = () => {
    if (currentCard < cards.length - 1) {
      setDirection(1);
      setCurrentCard(currentCard + 1);
      onCardChange?.(currentCard + 1);
    } else {
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (currentCard > 0) {
      setDirection(-1);
      setCurrentCard(currentCard - 1);
      onCardChange?.(currentCard - 1);
    }
  };

  const handleDragEnd = (e: any, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x > swipeThreshold && currentCard > 0) {
      handlePrevious();
    } else if (info.offset.x < -swipeThreshold && currentCard < cards.length - 1) {
      handleNext();
    }
  };

  const card = cards[currentCard];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Card {currentCard + 1} of {cards.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(((currentCard + 1) / cards.length) * 100)}% complete
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentCard + 1) / cards.length) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Story Card */}
      <div className="relative min-h-[400px] flex items-center justify-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentCard}
            custom={direction}
            variants={{
              enter: (direction: number) => ({
                x: direction > 0 ? 300 : -300,
                opacity: 0,
                scale: 0.95,
              }),
              center: {
                x: 0,
                opacity: 1,
                scale: 1,
              },
              exit: (direction: number) => ({
                x: direction > 0 ? -300 : 300,
                opacity: 0,
                scale: 0.95,
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.3 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            className="absolute w-full"
          >
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border-2 border-purple-200 cursor-grab active:cursor-grabbing">
              {/* Card Icon */}
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <BookOpen size={32} className="text-white" />
                </div>
              </div>

              {/* Story Content */}
              <div className="prose prose-lg max-w-none">
                <p className="text-xl md:text-2xl leading-relaxed text-gray-800 text-center">
                  {highlightVocabulary(card.content, card.vocabularyWords, setSelectedWord)}
                </p>
              </div>

              {/* Swipe Hint */}
              {currentCard === 0 && (
                <motion.p
                  className="text-center text-sm text-gray-500 mt-8"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  👆 Swipe or tap arrows to navigate
                </motion.p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8">
        <motion.button
          onClick={handlePrevious}
          disabled={currentCard === 0}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-full font-semibold shadow-lg transition-all
            ${currentCard === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white text-purple-600 hover:bg-purple-50 hover:shadow-xl'
            }
          `}
          whileHover={currentCard > 0 ? { scale: 1.05 } : {}}
          whileTap={currentCard > 0 ? { scale: 0.95 } : {}}
        >
          <ChevronLeft size={20} />
          Previous
        </motion.button>

        <motion.button
          onClick={handleNext}
          className="flex items-center gap-2 px-8 py-3 rounded-full font-semibold shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {currentCard === cards.length - 1 ? 'Finish Reading' : 'Next'}
          {currentCard < cards.length - 1 && <ChevronRight size={20} />}
        </motion.button>
      </div>

      {/* Vocabulary Tooltip */}
      <AnimatePresence>
        {selectedWord && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-purple-300 max-w-sm">
              <div className="flex items-start gap-3">
                {selectedWord.emoji && (
                  <span className="text-4xl">{selectedWord.emoji}</span>
                )}
                <div>
                  <h4 className="font-bold text-lg text-purple-700 mb-2">
                    {selectedWord.word}
                  </h4>
                  <p className="text-gray-700">{selectedWord.definition}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedWord(null)}
                className="mt-4 w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200"
              >
                Got it!
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper to highlight vocabulary words
function highlightVocabulary(
  text: string,
  words: VocabularyWord[] | undefined,
  onWordClick: (word: VocabularyWord) => void
) {
  if (!words || words.length === 0) return text;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  words.forEach((word, idx) => {
    parts.push(text.slice(lastIndex, word.position.start));
    parts.push(
      <button
        key={idx}
        onClick={() => onWordClick(word)}
        className="relative font-bold text-purple-600 underline decoration-wavy decoration-purple-400 hover:text-purple-800 transition-colors cursor-help"
      >
        {text.slice(word.position.start, word.position.end)}
      </button>
    );
    lastIndex = word.position.end;
  });

  parts.push(text.slice(lastIndex));
  return parts;
}
