'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Star } from 'lucide-react';

export function WelcomeScreen() {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleStart = () => {
    setIsAnimating(true);
    setTimeout(() => {
      router.push('/onboarding/interests');
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 text-yellow-300 opacity-40"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Star size={48} fill="currentColor" />
        </motion.div>
        <motion.div
          className="absolute top-40 right-20 text-pink-300 opacity-40"
          animate={{
            y: [0, 20, 0],
            rotate: [0, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        >
          <Sparkles size={40} />
        </motion.div>
        <motion.div
          className="absolute bottom-32 left-20 text-blue-300 opacity-40"
          animate={{
            y: [0, -15, 0],
            rotate: [0, 15, 0],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        >
          <BookOpen size={44} />
        </motion.div>
      </div>

      <motion.div
        className="max-w-2xl w-full text-center z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Lisa Character */}
        <motion.div
          className="mb-8 flex justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2
          }}
        >
          <div className="relative">
            <motion.div
              className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-2xl"
              animate={{
                boxShadow: [
                  "0 20px 60px rgba(168, 85, 247, 0.4)",
                  "0 20px 80px rgba(236, 72, 153, 0.5)",
                  "0 20px 60px rgba(168, 85, 247, 0.4)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <span className="text-6xl">📚</span>
            </motion.div>
            {/* Sparkle effect */}
            <motion.div
              className="absolute -top-2 -right-2 text-yellow-400"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles size={24} fill="currentColor" />
            </motion.div>
          </div>
        </motion.div>

        {/* Welcome Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent">
            Hi! I'm Lisa
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-2">
            Your Reading Adventure Guide! 🌟
          </p>
          <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
            I'll help you become an amazing reader by creating magical stories just for you!
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          className="grid md:grid-cols-3 gap-4 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-purple-200">
            <div className="text-4xl mb-3">📖</div>
            <h3 className="font-bold text-gray-800 mb-2">Fun Stories</h3>
            <p className="text-sm text-gray-600">Made just for you!</p>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-pink-200">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="font-bold text-gray-800 mb-2">Cool Challenges</h3>
            <p className="text-sm text-gray-600">Test what you learned!</p>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-blue-200">
            <div className="text-4xl mb-3">⭐</div>
            <h3 className="font-bold text-gray-800 mb-2">Level Up</h3>
            <p className="text-sm text-gray-600">Grow your skills!</p>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          <motion.button
            onClick={handleStart}
            disabled={isAnimating}
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white text-xl font-bold py-5 px-12 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isAnimating ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  ⭐
                </motion.span>
                Let's Go!
              </span>
            ) : (
              "Create My Explorer Pass! 🎫"
            )}
          </motion.button>
          <p className="text-sm text-gray-500 mt-4">
            It only takes 2 minutes!
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
