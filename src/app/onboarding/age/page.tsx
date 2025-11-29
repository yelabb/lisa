'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const AGE_OPTIONS = [
  { age: 5, label: '5', emoji: '🐣', color: 'from-yellow-400 to-orange-400' },
  { age: 6, label: '6', emoji: '🦋', color: 'from-pink-400 to-purple-400' },
  { age: 7, label: '7', emoji: '🌈', color: 'from-purple-400 to-blue-400' },
  { age: 8, label: '8', emoji: '⭐', color: 'from-blue-400 to-cyan-400' },
  { age: 9, label: '9', emoji: '🚀', color: 'from-cyan-400 to-teal-400' },
  { age: 10, label: '10', emoji: '🎯', color: 'from-teal-400 to-green-400' },
  { age: 11, label: '11', emoji: '🏆', color: 'from-green-400 to-emerald-400' },
  { age: 12, label: '12', emoji: '👑', color: 'from-emerald-400 to-lime-400' },
];

export default function AgePage() {
  const router = useRouter();
  const [selectedAge, setSelectedAge] = useState<number | null>(null);
  const [hoveredAge, setHoveredAge] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleContinue = () => {
    if (selectedAge === null) return;
    setIsAnimating(true);
    sessionStorage.setItem('onboarding-age', selectedAge.toString());
    setTimeout(() => {
      router.push('/onboarding/themes');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-6 flex flex-col">
      {/* Progress Bar */}
      <div className="max-w-4xl w-full mx-auto mb-8">
        <div className="bg-white/50 backdrop-blur-sm rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: '50%' }}
            animate={{ width: '75%' }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2 text-center">Step 3 of 4</p>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-block mb-4"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          >
            <span className="text-7xl">🎂</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            How old are you?
          </h1>
          <p className="text-lg text-gray-700">
            This helps me create the perfect stories for you! 🎈
          </p>
        </motion.div>

        {/* Age Selection Grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {AGE_OPTIONS.map((option, index) => {
            const isSelected = selectedAge === option.age;
            const isHovered = hoveredAge === option.age;
            
            return (
              <motion.button
                key={option.age}
                onClick={() => setSelectedAge(option.age)}
                onMouseEnter={() => setHoveredAge(option.age)}
                onMouseLeave={() => setHoveredAge(null)}
                className={`
                  relative overflow-hidden rounded-3xl p-8
                  bg-white/70 backdrop-blur-sm border-4
                  transition-all duration-200 shadow-lg
                  hover:shadow-2xl
                  ${isSelected 
                    ? 'border-purple-500 ring-4 ring-purple-200 scale-105' 
                    : 'border-transparent hover:border-gray-200'
                  }
                `}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  delay: index * 0.05, 
                  duration: 0.4,
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Gradient Background on Select/Hover */}
                {(isSelected || isHovered) && (
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-20`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.2 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}

                <div className="relative z-10">
                  {/* Emoji */}
                  <motion.div
                    className="text-6xl mb-3"
                    animate={isSelected ? {
                      scale: [1, 1.3, 1],
                      rotate: [0, 360],
                    } : isHovered ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, -10, 10, 0],
                    } : {}}
                    transition={{ duration: 0.6 }}
                  >
                    {option.emoji}
                  </motion.div>
                  
                  {/* Age Number */}
                  <div className={`
                    text-4xl font-black
                    ${isSelected 
                      ? 'text-purple-700' 
                      : 'text-gray-700'
                    }
                  `}>
                    {option.label}
                  </div>
                  
                  {/* Years Old Label */}
                  <p className={`
                    text-sm font-semibold mt-1
                    ${isSelected ? 'text-purple-600' : 'text-gray-500'}
                  `}>
                    years old
                  </p>
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <motion.div
                    className="absolute top-3 right-3 w-7 h-7 bg-purple-500 rounded-full flex items-center justify-center"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <span className="text-white text-base">✓</span>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Fun Fact */}
        {selectedAge !== null && (
          <motion.div
            className="text-center mb-8 p-6 bg-white/60 backdrop-blur-sm rounded-3xl border-2 border-purple-200"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="text-3xl mb-2 block">✨</span>
            <p className="text-gray-700 font-medium">
              {selectedAge === 5 && "You're starting an amazing reading adventure!"}
              {selectedAge === 6 && "First grade readers are super learners!"}
              {selectedAge === 7 && "You're growing your reading superpowers!"}
              {selectedAge === 8 && "Third grade = Story master in training!"}
              {selectedAge === 9 && "You're becoming a reading champion!"}
              {selectedAge === 10 && "Double digits! Your vocabulary is growing fast!"}
              {selectedAge === 11 && "Almost a teenager and reading like a pro!"}
              {selectedAge === 12 && "Middle school reader with serious skills!"}
            </p>
          </motion.div>
        )}

        {/* Continue Button */}
        <motion.div
          className="mt-auto pt-8 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <motion.button
            onClick={handleContinue}
            disabled={selectedAge === null || isAnimating}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg
              shadow-xl transition-all duration-200
              ${selectedAge !== null
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-2xl hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
            whileHover={selectedAge !== null ? { scale: 1.05 } : {}}
            whileTap={selectedAge !== null ? { scale: 0.95 } : {}}
          >
            {selectedAge !== null ? (
              <>
                Got it! One More Step
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <ArrowRight size={24} />
                </motion.div>
              </>
            ) : (
              'Pick your age!'
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
