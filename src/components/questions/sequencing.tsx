'use client';

import { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { GripVertical, Check } from 'lucide-react';

interface SequencingQuestionProps {
  question: string;
  items: string[];
  correctOrder: string[];
  onAnswer: (answer: string[], isCorrect: boolean) => void;
}

export function SequencingQuestion({ question, items, correctOrder, onAnswer }: SequencingQuestionProps) {
  const [orderedItems, setOrderedItems] = useState(items);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = () => {
    setHasAnswered(true);
    setShowResult(true);
    const isCorrect = JSON.stringify(orderedItems) === JSON.stringify(correctOrder);
    
    setTimeout(() => {
      onAnswer(orderedItems, isCorrect);
    }, 2000);
  };

  const isCorrectOrder = JSON.stringify(orderedItems) === JSON.stringify(correctOrder);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-purple-200">
        {/* Question */}
        <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          {question}
        </h3>
        <p className="text-center text-gray-600 mb-6">
          Drag to reorder the events ↕️
        </p>

        {/* Reorderable List */}
        <Reorder.Group
          axis="y"
          values={orderedItems}
          onReorder={setOrderedItems}
          className="space-y-3"
        >
          {orderedItems.map((item, index) => {
            const correctIndex = correctOrder.indexOf(item);
            const isInCorrectPosition = showResult && index === correctIndex;
            
            return (
              <Reorder.Item
                key={item}
                value={item}
                className={`
                  p-4 rounded-xl border-2 cursor-grab active:cursor-grabbing transition-all
                  ${hasAnswered ? 'cursor-not-allowed' : ''}
                  ${showResult && isInCorrectPosition
                    ? 'bg-green-100 border-green-500'
                    : showResult && !isInCorrectPosition
                    ? 'bg-red-100 border-red-500'
                    : 'bg-gray-50 border-gray-300 hover:border-purple-300'
                  }
                `}
                drag={!hasAnswered}
                whileDrag={{ scale: 1.05, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
              >
                <div className="flex items-center gap-3">
                  {!hasAnswered && (
                    <GripVertical size={20} className="text-gray-400" />
                  )}
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-500 text-white rounded-full font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="flex-1 font-medium text-gray-800">{item}</span>
                  {showResult && isInCorrectPosition && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                    >
                      <Check size={24} className="text-green-600" />
                    </motion.div>
                  )}
                </div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>

        {/* Submit Button */}
        {!hasAnswered && (
          <motion.button
            onClick={handleSubmit}
            className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Check My Answer
          </motion.button>
        )}

        {/* Result */}
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 p-6 rounded-xl ${
              isCorrectOrder
                ? 'bg-green-100 border-2 border-green-500'
                : 'bg-red-100 border-2 border-red-500'
            }`}
          >
            <h4 className={`text-xl font-bold mb-2 ${
              isCorrectOrder ? 'text-green-700' : 'text-red-700'
            }`}>
              {isCorrectOrder ? 'Perfect Order! 🎉' : 'Not quite right! 💪'}
            </h4>
            <p className="text-gray-700">
              {isCorrectOrder
                ? 'You got the sequence exactly right!'
                : 'Try to remember the order of events in the story!'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
