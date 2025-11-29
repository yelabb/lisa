'use client';

import { motion } from 'framer-motion';
import { Flower, TreeDeciduous, Sprout, Award } from 'lucide-react';

interface SkillData {
  name: string;
  score: number;
  icon: 'flower' | 'tree' | 'sprout';
  color: string;
}

interface SkillGardenProps {
  skills: SkillData[];
  streak: number;
  badges: { id: string; name: string; emoji: string }[];
}

export function SkillGarden({ skills, streak, badges }: SkillGardenProps) {
  const getIcon = (icon: string, size: number) => {
    switch (icon) {
      case 'flower':
        return <Flower size={size} />;
      case 'tree':
        return <TreeDeciduous size={size} />;
      case 'sprout':
        return <Sprout size={size} />;
      default:
        return <Flower size={size} />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Skill Plants */}
      <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl p-8 border-2 border-green-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Sprout size={28} className="text-green-600" />
          Your Skill Garden
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skills.map((skill, idx) => {
            const height = Math.max(20, (skill.score / 100) * 200);
            
            return (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                {/* Plant Visual */}
                <div className="relative flex items-end justify-center h-48 mb-4">
                  <motion.div
                    className={`flex items-center justify-center ${skill.color}`}
                    initial={{ height: 0 }}
                    animate={{ height }}
                    transition={{ duration: 1, delay: idx * 0.2, type: 'spring' }}
                  >
                    {getIcon(skill.icon, 48)}
                  </motion.div>
                  
                  {/* Score Badge */}
                  <motion.div
                    className="absolute -top-2 -right-2 w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: idx * 0.2 + 0.5 }}
                  >
                    {skill.score}
                  </motion.div>
                </div>

                {/* Skill Name */}
                <h3 className="font-bold text-gray-800 text-center mb-2">
                  {skill.name}
                </h3>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.score}%` }}
                    transition={{ duration: 1, delay: idx * 0.2 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Streak Calendar */}
      <div className="bg-gradient-to-br from-orange-100 to-yellow-100 rounded-3xl p-8 border-2 border-orange-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          🔥 Reading Streak
        </h2>

        <div className="flex items-center justify-center gap-8 mb-6">
          <div className="text-center">
            <motion.div
              className="text-6xl font-black text-orange-600"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {streak}
            </motion.div>
            <p className="text-sm text-gray-600 font-semibold">Days in a row!</p>
          </div>

          <motion.div
            animate={{
              rotate: [0, 10, -10, 10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-8xl"
          >
            🔥
          </motion.div>
        </div>

        {/* Mini Calendar */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`aspect-square rounded-lg flex items-center justify-center text-2xl ${
                i < streak
                  ? 'bg-orange-500'
                  : 'bg-gray-200'
              }`}
            >
              {i < streak ? '✓' : '·'}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Badge Collection */}
      <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-8 border-2 border-purple-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Award size={28} className="text-purple-600" />
          Badge Collection
        </h2>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {badges.map((badge, idx) => (
            <motion.div
              key={badge.id}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: idx * 0.05, type: 'spring' }}
              className="bg-white rounded-2xl p-4 shadow-lg flex flex-col items-center gap-2"
            >
              <span className="text-5xl">{badge.emoji}</span>
              <p className="text-xs font-semibold text-gray-700 text-center">
                {badge.name}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
