'use client';

import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserProfile } from '@/store/user-profile';
import { motion } from 'framer-motion';
import { Trophy, Target, Book, Flame, TrendingUp, Calendar } from 'lucide-react';

export default function ProgressPage() {
  const profile = useUserProfile((state) => state.profile);

  if (!profile) return null;

  const accuracy = profile.totalQuestionsAnswered > 0
    ? Math.round((profile.correctAnswers / profile.totalQuestionsAnswered) * 100)
    : 0;

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Your Progress 📊
          </h1>
          <p className="text-lg text-gray-600">
            See how amazing you're doing!
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ProgressStatCard
            icon={<Book className="text-purple-600" />}
            label="Stories Completed"
            value={profile.totalStoriesRead}
            color="purple"
          />
          <ProgressStatCard
            icon={<Target className="text-pink-600" />}
            label="Accuracy Rate"
            value={`${accuracy}%`}
            color="pink"
          />
          <ProgressStatCard
            icon={<Flame className="text-orange-600" />}
            label="Current Streak"
            value={`${profile.currentStreak} days`}
            color="orange"
          />
          <ProgressStatCard
            icon={<Trophy className="text-blue-600" />}
            label="Longest Streak"
            value={`${profile.longestStreak} days`}
            color="blue"
          />
        </div>

        {/* Detailed Progress */}
        <Tabs defaultValue="skills" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="level">Level</TabsTrigger>
            <TabsTrigger value="streak">Streak</TabsTrigger>
          </TabsList>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6 mt-6">
            <Card className="p-6">
              <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <TrendingUp className="text-purple-600" />
                Reading Skills
              </h3>
              <div className="space-y-6">
                <SkillProgress
                  label="Comprehension"
                  description="Understanding what you read"
                  value={profile.comprehensionScore}
                  emoji="🧠"
                  color="purple"
                />
                <SkillProgress
                  label="Vocabulary"
                  description="Learning new words"
                  value={profile.vocabularyScore}
                  emoji="📝"
                  color="pink"
                />
                <SkillProgress
                  label="Inference"
                  description="Reading between the lines"
                  value={profile.inferenceScore}
                  emoji="🔍"
                  color="blue"
                />
                <SkillProgress
                  label="Summarization"
                  description="Retelling stories in your own words"
                  value={profile.summarizationScore}
                  emoji="✨"
                  color="green"
                />
              </div>
            </Card>
          </TabsContent>

          {/* Level Tab */}
          <TabsContent value="level" className="mt-6">
            <Card className="p-8">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">⭐</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Level: {profile.currentLevel}
                </h2>
                <p className="text-gray-600">
                  You're doing amazing! Keep reading to level up!
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-700">Progress to Next Level</span>
                  <span className="text-2xl font-bold text-purple-600">{profile.levelScore}/100</span>
                </div>
                <Progress value={profile.levelScore} className="h-6" />
                <p className="text-center text-sm text-gray-600">
                  {100 - profile.levelScore} more points until you level up! 🚀
                </p>
              </div>

              <div className="mt-8 p-6 bg-purple-50 rounded-2xl border-2 border-purple-200">
                <h4 className="font-bold text-gray-800 mb-2">How to Level Up:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span>✅</span>
                    <span>Complete stories and answer questions correctly (+5 points each)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>🎯</span>
                    <span>Get perfect scores for bonus points (+10 points)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>🔥</span>
                    <span>Maintain your daily streak (+3 points per day)</span>
                  </li>
                </ul>
              </div>
            </Card>
          </TabsContent>

          {/* Streak Tab */}
          <TabsContent value="streak" className="mt-6">
            <Card className="p-8">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🔥</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {profile.currentStreak} Day Streak!
                </h2>
                <p className="text-gray-600">
                  {profile.currentStreak === profile.longestStreak 
                    ? "You're at your personal record! 🎉"
                    : `Your best is ${profile.longestStreak} days. Keep going!`
                  }
                </p>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-8">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-lg flex items-center justify-center text-2xl ${
                      i < profile.currentStreak % 7
                        ? 'bg-gradient-to-br from-orange-400 to-red-400'
                        : 'bg-gray-200'
                    }`}
                  >
                    {i < profile.currentStreak % 7 ? '🔥' : ''}
                  </div>
                ))}
              </div>

              <div className="p-6 bg-orange-50 rounded-2xl border-2 border-orange-200">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="text-orange-600" size={24} />
                  <h4 className="font-bold text-gray-800">Streak Tips:</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>📖 Read at least one story per day</li>
                  <li>⏰ Set a daily reminder to practice</li>
                  <li>🎯 Answer questions to keep your streak</li>
                  <li>🌟 Longer streaks = more bonus points!</li>
                </ul>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

function ProgressStatCard({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number; 
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
    >
      <Card className="p-6 text-center">
        <div className="flex justify-center mb-3">{icon}</div>
        <div className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">{value}</div>
        <div className="text-xs md:text-sm text-gray-600">{label}</div>
      </Card>
    </motion.div>
  );
}

function SkillProgress({
  label,
  description,
  value,
  emoji,
  color,
}: {
  label: string;
  description: string;
  value: number;
  emoji: string;
  color: string;
}) {
  const colorClasses = {
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
  };

  return (
    <div>
      <div className="flex items-start gap-3 mb-3">
        <span className="text-3xl">{emoji}</span>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <h4 className="font-bold text-gray-800">{label}</h4>
            <span className="text-lg font-bold text-gray-800">{value}/100</span>
          </div>
          <p className="text-sm text-gray-600 mb-2">{description}</p>
          <Progress value={value} className="h-3" />
        </div>
      </div>
    </div>
  );
}
