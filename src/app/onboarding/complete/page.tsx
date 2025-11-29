'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { useUserProfile } from '@/store/user-profile';
import { ReadingLevel } from '@/generated/prisma';
import type { CustomTheme } from '@/types/profile';
import { LisaWithHints } from '@/components/lisa/lisa-hints';

type OnboardingData = {
  interests: string[];
  readingLevel: number;
  age: number;
  themes: string[];
  customThemes: CustomTheme[];
};

const READING_LEVEL_MAP: Record<number, ReadingLevel> = {
  1: 'BEGINNER',
  2: 'EARLY',
  3: 'DEVELOPING',
  4: 'INTERMEDIATE',
  5: 'ADVANCED',
};

export default function CompletePage() {
  const router = useRouter();
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [isSaving, setIsSaving] = useState(true);
  const createProfile = useUserProfile((state) => state.createProfile);

  useEffect(() => {
    // Retrieve all onboarding data from sessionStorage
    const interests = JSON.parse(sessionStorage.getItem('onboarding-interests') || '[]');
    const readingLevel = parseInt(sessionStorage.getItem('onboarding-readingLevel') || '1');
    const age = parseInt(sessionStorage.getItem('onboarding-age') || '7');
    const themes = JSON.parse(sessionStorage.getItem('onboarding-themes') || '[]');
    const customThemes = JSON.parse(sessionStorage.getItem('onboarding-customThemes') || '[]');

    setOnboardingData({
      interests,
      readingLevel,
      age,
      themes,
      customThemes,
    });

    // Save to Zustand store
    const mappedLevel = READING_LEVEL_MAP[readingLevel] || 'BEGINNER';
    
    createProfile({
      name: 'Explorer', // Default name, can be customized later
      age,
      avatarEmoji: '📚',
      interests,
      preferredThemes: themes,
      customThemes,
      initialReadingLevel: mappedLevel,
    });

    // Clear session storage after saving
    setTimeout(() => {
      sessionStorage.removeItem('onboarding-interests');
      sessionStorage.removeItem('onboarding-readingLevel');
      sessionStorage.removeItem('onboarding-age');
      sessionStorage.removeItem('onboarding-themes');
      sessionStorage.removeItem('onboarding-customThemes');
      setIsSaving(false);
    }, 2000);
  }, [createProfile]);

  const handleStartReading = () => {
    router.push('/');
  };

  if (isSaving || !onboardingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-6"
          >
            <Loader2 size={64} className="text-purple-500" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Creating your Explorer Pass...
          </h2>
          <p className="text-gray-600">
            Lisa is getting everything ready! ✨
          </p>
        </motion.div>
      </div>
    );
  }

  const readingLevelLabels = ['Just Starting', 'Getting There', 'Building Up', 'Getting Good', 'Super Reader'];
  const readingLevelEmojis = ['🌱', '🌿', '🌳', '🦋', '🚀'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-6 flex items-center justify-center">
      {/* Lisa Companion */}
      <LisaWithHints context="onboarding" step="complete" />
      
      <div className="max-w-2xl w-full">
        {/* Success Animation */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.2
            }}
            className="inline-block mb-4"
          >
            <div className="relative">
              <CheckCircle2 size={80} className="text-green-500" fill="currentColor" />
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <Sparkles size={32} className="text-yellow-400" fill="currentColor" />
              </motion.div>
            </div>
          </motion.div>
          
          <motion.h1
            className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Your Pass is Ready!
          </motion.h1>
          <motion.p
            className="text-xl text-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Welcome to your reading adventure! 🎉
          </motion.p>
        </motion.div>

        {/* Explorer Pass Card */}
        <motion.div
          className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8 border-4 border-purple-200"
          initial={{ opacity: 0, y: 20, rotateX: 20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ delay: 0.8, duration: 0.6, type: "spring" }}
        >
          {/* Pass Header */}
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 p-6 text-white relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-white/20"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2,
              }}
              style={{ width: '50%' }}
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">Explorer Pass 🎫</h2>
                <span className="text-sm bg-white/30 px-3 py-1 rounded-full">
                  Level {onboardingData.readingLevel}
                </span>
              </div>
              <p className="text-sm text-purple-100">Your Personal Reading Journey</p>
            </div>
          </div>

          {/* Pass Body */}
          <div className="p-6 space-y-4">
            {/* Reading Level */}
            <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-2xl">
              <div className="text-4xl">{readingLevelEmojis[onboardingData.readingLevel - 1]}</div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Reading Level</h3>
                <p className="text-purple-600 font-semibold">
                  {readingLevelLabels[onboardingData.readingLevel - 1]}
                </p>
              </div>
            </div>

            {/* Age */}
            <div className="flex items-start gap-4 p-4 bg-pink-50 rounded-2xl">
              <div className="text-4xl">🎂</div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Age</h3>
                <p className="text-pink-600 font-semibold">{onboardingData.age} years old</p>
              </div>
            </div>

            {/* Interests */}
            <div className="p-4 bg-blue-50 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">💖</span>
                <h3 className="font-bold text-gray-800">Your Interests</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {onboardingData.interests.slice(0, 5).map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {interest}
                  </span>
                ))}
                {onboardingData.interests.length > 5 && (
                  <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm font-medium">
                    +{onboardingData.interests.length - 5} more
                  </span>
                )}
              </div>
            </div>

            {/* Favorite Themes */}
            <div className="p-4 bg-green-50 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📚</span>
                <h3 className="font-bold text-gray-800">Story Themes</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {onboardingData.themes.slice(0, 6).map((theme, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium"
                  >
                    {theme}
                  </span>
                ))}
                {onboardingData.themes.length > 6 && (
                  <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium">
                    +{onboardingData.themes.length - 6} more
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Pass Footer */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-t-2 border-purple-100">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>🌟 Ready to Level Up!</span>
              <span className="font-mono">ID: EXPLORER-{Date.now().toString().slice(-6)}</span>
            </div>
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <motion.button
            onClick={handleStartReading}
            className="px-12 py-5 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white text-xl font-bold rounded-full shadow-2xl hover:shadow-3xl transform transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="flex items-center gap-3">
              Start Reading! 🚀
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                →
              </motion.span>
            </span>
          </motion.button>
          
          <p className="text-sm text-gray-500 mt-4">
            Your first story is waiting for you!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
