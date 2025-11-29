'use client';

import { AppShell } from '@/components/layout/app-shell';
import { useUserProfile } from '@/store/user-profile';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { BookOpen, Zap, Target, Trophy, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const profile = useUserProfile((state) => state.profile);

  if (!profile) return null;

  const accuracy = profile.totalQuestionsAnswered > 0
    ? Math.round((profile.correctAnswers / profile.totalQuestionsAnswered) * 100)
    : 0;

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome back, {profile.name}! 🎉
          </h1>
          <p className="text-lg text-gray-600">
            Ready for your next reading adventure?
          </p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<BookOpen className="text-purple-600" />}
            label="Stories Read"
            value={profile.totalStoriesRead}
            delay={0.1}
          />
          <StatCard
            icon={<Target className="text-pink-600" />}
            label="Accuracy"
            value={`${accuracy}%`}
            delay={0.2}
          />
          <StatCard
            icon={<Zap className="text-orange-600" />}
            label="Day Streak"
            value={profile.currentStreak}
            delay={0.3}
          />
          <StatCard
            icon={<Trophy className="text-blue-600" />}
            label="Level"
            value={profile.currentLevel}
            delay={0.4}
          />
        </div>

        {/* Continue Reading / Start New Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Card className="p-8 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 text-white border-0">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Start Reading! 📖</h2>
                <p className="text-purple-100 text-lg">
                  Choose a story that matches your interests and level
                </p>
              </div>
              <Link href="/stories">
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-purple-50 shadow-xl text-lg px-8 py-6"
                >
                  Browse Stories
                  <ArrowRight className="ml-2" />
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity / Skills Overview */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Skills Progress */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Your Skills 🌟</h3>
              <div className="space-y-4">
                <SkillBar label="Comprehension" value={profile.comprehensionScore} color="purple" />
                <SkillBar label="Vocabulary" value={profile.vocabularyScore} color="pink" />
                <SkillBar label="Inference" value={profile.inferenceScore} color="blue" />
                <SkillBar label="Summarization" value={profile.summarizationScore} color="green" />
              </div>
            </Card>
          </motion.div>

          {/* Reading Level Progress */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Level Progress 📈</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-lg px-4 py-1">
                    {profile.currentLevel}
                  </Badge>
                  <span className="text-2xl font-bold text-purple-600">
                    {profile.levelScore}/100
                  </span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${profile.levelScore}%` }}
                    transition={{ delay: 0.8, duration: 1 }}
                  />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  {100 - profile.levelScore} points to next level!
                </p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Achievements Preview */}
        {profile.currentStreak > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Card className="p-6 bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-300">
              <div className="flex items-center gap-4">
                <div className="text-5xl">🔥</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {profile.currentStreak} Day Streak!
                  </h3>
                  <p className="text-gray-700">
                    Keep it up! You're doing amazing! 
                    {profile.currentStreak === profile.longestStreak && ' (Personal Record 🎉)'}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}

function StatCard({ icon, label, value, delay }: { icon: React.ReactNode; label: string; value: string | number; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Card className="p-6 text-center hover:shadow-lg transition-shadow">
        <div className="flex justify-center mb-3">{icon}</div>
        <div className="text-3xl font-bold text-gray-800 mb-1">{value}</div>
        <div className="text-sm text-gray-600">{label}</div>
      </Card>
    </motion.div>
  );
}

function SkillBar({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses = {
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
  };

  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-800">{value}/100</span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay: 0.2 }}
        />
      </div>
    </div>
  );
}
