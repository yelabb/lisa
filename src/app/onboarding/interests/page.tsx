'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';

const INTERESTS = [
  { id: 'animals', label: 'Animals', emoji: '🦁', color: 'from-orange-400 to-yellow-400' },
  { id: 'space', label: 'Space', emoji: '🚀', color: 'from-blue-500 to-purple-500' },
  { id: 'dinosaurs', label: 'Dinosaurs', emoji: '🦕', color: 'from-green-500 to-teal-500' },
  { id: 'ocean', label: 'Ocean', emoji: '🌊', color: 'from-cyan-400 to-blue-500' },
  { id: 'magic', label: 'Magic', emoji: '✨', color: 'from-purple-400 to-pink-500' },
  { id: 'sports', label: 'Sports', emoji: '⚽', color: 'from-green-400 to-emerald-500' },
  { id: 'adventure', label: 'Adventure', emoji: '🗺️', color: 'from-amber-400 to-orange-500' },
  { id: 'science', label: 'Science', emoji: '🔬', color: 'from-blue-400 to-indigo-500' },
  { id: 'mystery', label: 'Mystery', emoji: '🔍', color: 'from-gray-600 to-purple-600' },
  { id: 'friends', label: 'Friends', emoji: '👫', color: 'from-pink-400 to-rose-400' },
  { id: 'robots', label: 'Robots', emoji: '🤖', color: 'from-gray-400 to-blue-400' },
  { id: 'nature', label: 'Nature', emoji: '🌳', color: 'from-green-400 to-lime-500' },
];

export default function InterestsPage() {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleInterest = (interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleContinue = () => {
    if (selectedInterests.length === 0) return;
    setIsAnimating(true);
    // Store interests in sessionStorage for now (will wire up to Zustand later)
    sessionStorage.setItem('onboarding-interests', JSON.stringify(selectedInterests));
    setTimeout(() => {
      router.push('/onboarding/reading-level');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-6 flex flex-col">
      {/* Progress Bar */}
      <div className="max-w-4xl w-full mx-auto mb-8">
        <div className="bg-white/50 backdrop-blur-sm rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: '0%' }}
            animate={{ width: '25%' }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2 text-center">Step 1 of 4</p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col">
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
              rotate: [0, 10, -10, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          >
            <span className="text-6xl">🎨</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            What do you love?
          </h1>
          <p className="text-lg text-gray-700">
            Pick all the things that make you excited! ✨
          </p>
          <p className="text-sm text-gray-600 mt-2">
            (Choose at least 1, but you can pick as many as you want!)
          </p>
        </motion.div>

        {/* Interest Bubbles Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {INTERESTS.map((interest, index) => {
            const isSelected = selectedInterests.includes(interest.id);
            return (
              <motion.button
                key={interest.id}
                onClick={() => toggleInterest(interest.id)}
                className={`
                  relative overflow-hidden rounded-3xl p-6 
                  bg-white/70 backdrop-blur-sm border-4
                  transition-all duration-200 shadow-lg
                  hover:shadow-2xl hover:scale-105
                  ${isSelected 
                    ? 'border-purple-500 ring-4 ring-purple-200' 
                    : 'border-transparent hover:border-gray-200'
                  }
                `}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Selection Checkmark */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      className="absolute top-2 right-2 bg-purple-500 rounded-full p-1"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <Check size={16} className="text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Gradient Background on Select */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${interest.color} opacity-20`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.2 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>

                <div className="relative z-10">
                  <motion.div
                    className="text-5xl mb-2"
                    animate={isSelected ? {
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                    } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {interest.emoji}
                  </motion.div>
                  <p className={`font-bold text-lg ${isSelected ? 'text-purple-700' : 'text-gray-700'}`}>
                    {interest.label}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Continue Button */}
        <motion.div
          className="mt-auto pt-8 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <motion.button
            onClick={handleContinue}
            disabled={selectedInterests.length === 0 || isAnimating}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg
              shadow-xl transition-all duration-200
              ${selectedInterests.length > 0
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-2xl hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
            whileHover={selectedInterests.length > 0 ? { scale: 1.05 } : {}}
            whileTap={selectedInterests.length > 0 ? { scale: 0.95 } : {}}
          >
            {selectedInterests.length > 0 ? (
              <>
                Awesome! Let's Continue
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <ArrowRight size={24} />
                </motion.div>
              </>
            ) : (
              'Pick at least one thing!'
            )}
          </motion.button>
        </motion.div>

        {/* Selected Count Indicator */}
        <AnimatePresence>
          {selectedInterests.length > 0 && (
            <motion.div
              className="text-center mt-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <p className="text-sm text-gray-600">
                You picked <span className="font-bold text-purple-600">{selectedInterests.length}</span> thing{selectedInterests.length > 1 ? 's' : ''}! 🎉
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
