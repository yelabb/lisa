'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/store/user-profile';

export default function Home() {
  const router = useRouter();
  const profile = useUserProfile((state) => state.profile);
  const loadProfile = useUserProfile((state) => state.loadProfile);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    // Redirect to onboarding if not completed
    if (profile !== null && !profile.hasCompletedOnboarding) {
      router.push('/onboarding');
    } else if (profile === null) {
      router.push('/onboarding');
    }
  }, [profile, router]);

  if (!profile || !profile.hasCompletedOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">📚</div>
          <p className="text-gray-600">Loading your reading journey...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-20">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome back, {profile.name}! 🎉
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            Your reading adventure continues...
          </p>
          
          {/* Profile Summary */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl mb-8 border-2 border-purple-200">
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <div className="text-4xl mb-2">📖</div>
                <div className="text-3xl font-bold text-purple-600">{profile.totalStoriesRead}</div>
                <div className="text-sm text-gray-600">Stories Read</div>
              </div>
              <div>
                <div className="text-4xl mb-2">🎯</div>
                <div className="text-3xl font-bold text-pink-600">
                  {profile.totalQuestionsAnswered > 0 
                    ? Math.round((profile.correctAnswers / profile.totalQuestionsAnswered) * 100)
                    : 0}%
                </div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div>
                <div className="text-4xl mb-2">🔥</div>
                <div className="text-3xl font-bold text-orange-600">{profile.currentStreak}</div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </div>
              <div>
                <div className="text-4xl mb-2">⭐</div>
                <div className="text-3xl font-bold text-blue-600">{profile.currentLevel}</div>
                <div className="text-sm text-gray-600">Reading Level</div>
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-100">
            <p className="text-gray-700 text-lg">
              🚧 <strong>Coming Soon:</strong> Story library, reading sessions, progress tracking, and more! 🚧
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Your onboarding is complete! The next steps in development will bring stories to life.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
