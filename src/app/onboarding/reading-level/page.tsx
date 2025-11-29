'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';
import { LisaWithHints } from '@/components/lisa/lisa-hints';

const READING_SAMPLES = [
  {
    level: 1,
    label: 'Just Starting',
    emoji: '🌱',
    sample: 'The cat sat. The cat is big.',
    description: 'Simple words and short sentences'
  },
  {
    level: 2,
    label: 'Getting There',
    emoji: '🌿',
    sample: 'The big cat sat on a mat. It was a red mat.',
    description: 'Basic sentences with simple words'
  },
  {
    level: 3,
    label: 'Building Up',
    emoji: '🌳',
    sample: 'The large cat rested on the comfortable mat in the sunny room.',
    description: 'Longer sentences with descriptive words'
  },
  {
    level: 4,
    label: 'Getting Good',
    emoji: '🦋',
    sample: 'The magnificent feline lounged peacefully on the plush mat, enjoying the warm afternoon sunlight.',
    description: 'Complex sentences and varied vocabulary'
  },
  {
    level: 5,
    label: 'Super Reader',
    emoji: '🚀',
    sample: 'The distinguished cat, with its luxurious fur gleaming in the golden rays, reclined elegantly upon the velvet mat, savoring the tranquility of the moment.',
    description: 'Advanced vocabulary and sentence structures'
  },
];

export default function ReadingLevelPage() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleContinue = () => {
    if (selectedLevel === null) return;
    setIsAnimating(true);
    sessionStorage.setItem('onboarding-readingLevel', selectedLevel.toString());
    setTimeout(() => {
      router.push('/onboarding/age');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-6 flex flex-col">
      {/* Lisa Companion */}
      <LisaWithHints context="onboarding" step="reading-level" />
      
      {/* Progress Bar */}
      <div className="max-w-4xl w-full mx-auto mb-8">
        <div className="bg-white/50 backdrop-blur-sm rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: '25%' }}
            animate={{ width: '50%' }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2 text-center">Step 2 of 4</p>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl w-full mx-auto flex-1 flex flex-col">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-block mb-4"
            animate={{
              rotate: [0, -10, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          >
            <BookOpen size={64} className="text-purple-500" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            What feels just right?
          </h1>
          <p className="text-lg text-gray-700">
            Read these sentences and pick the one that's perfect for you! 📖
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Don't worry - I'll help you grow no matter what you choose!
          </p>
        </motion.div>

        {/* Reading Level Cards */}
        <div className="space-y-4 mb-8 flex-1">
          {READING_SAMPLES.map((sample, index) => {
            const isSelected = selectedLevel === sample.level;
            const isHovered = hoveredLevel === sample.level;
            
            return (
              <motion.button
                key={sample.level}
                onClick={() => setSelectedLevel(sample.level)}
                onMouseEnter={() => setHoveredLevel(sample.level)}
                onMouseLeave={() => setHoveredLevel(null)}
                className={`
                  w-full text-left p-6 rounded-3xl border-4 transition-all duration-200
                  bg-white/70 backdrop-blur-sm shadow-lg
                  ${isSelected 
                    ? 'border-purple-500 ring-4 ring-purple-200 shadow-2xl' 
                    : 'border-transparent hover:border-gray-200 hover:shadow-xl'
                  }
                `}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-4">
                  {/* Level Emoji & Number */}
                  <div className="flex flex-col items-center">
                    <motion.div
                      className="text-5xl mb-2"
                      animate={isSelected || isHovered ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0],
                      } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      {sample.emoji}
                    </motion.div>
                    <div className={`
                      text-xs font-bold px-3 py-1 rounded-full
                      ${isSelected 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                      }
                    `}>
                      Level {sample.level}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className={`
                      text-xl font-bold mb-2
                      ${isSelected ? 'text-purple-700' : 'text-gray-800'}
                    `}>
                      {sample.label}
                    </h3>
                    <p className={`
                      text-sm mb-2 italic
                      ${isSelected ? 'text-gray-600' : 'text-gray-500'}
                    `}>
                      {sample.description}
                    </p>
                    
                    {/* Reading Sample Box */}
                    <div className={`
                      mt-3 p-4 rounded-2xl border-2
                      ${isSelected 
                        ? 'bg-purple-50 border-purple-300' 
                        : 'bg-gray-50 border-gray-200'
                      }
                    `}>
                      <p className={`
                        leading-relaxed
                        ${sample.level === 1 ? 'text-xl' : ''}
                        ${sample.level === 2 ? 'text-lg' : ''}
                        ${sample.level >= 3 ? 'text-base' : ''}
                        ${isSelected ? 'text-gray-900' : 'text-gray-700'}
                      `}>
                        {sample.sample}
                      </p>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <motion.div
                      className="flex items-center justify-center w-8 h-8 bg-purple-500 rounded-full"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <span className="text-white text-lg">✓</span>
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Continue Button */}
        <motion.div
          className="mt-auto pt-8 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <motion.button
            onClick={handleContinue}
            disabled={selectedLevel === null || isAnimating}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg
              shadow-xl transition-all duration-200
              ${selectedLevel !== null
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-2xl hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
            whileHover={selectedLevel !== null ? { scale: 1.05 } : {}}
            whileTap={selectedLevel !== null ? { scale: 0.95 } : {}}
          >
            {selectedLevel !== null ? (
              <>
                Perfect Choice! Next Step
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <ArrowRight size={24} />
                </motion.div>
              </>
            ) : (
              'Pick a reading level first!'
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
