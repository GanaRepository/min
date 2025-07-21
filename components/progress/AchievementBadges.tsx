// components/progress/AchievementBadges.tsx
'use client';

import { motion } from 'framer-motion';
import { Award, Lock } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: string;
}

interface AchievementBadgesProps {
  achievements: Achievement[];
}

const allAchievements = [
  { id: '1', name: '7-Day Streak', description: 'Keep writing daily!', icon: '🔥', unlocked: true },
  { id: '2', name: '10th Story', description: 'Double digits!', icon: '📚', unlocked: true },
  { id: '3', name: 'Grammar Expert', description: '90%+ grammar score', icon: '⭐', unlocked: true },
  { id: '4', name: 'Bookworm', description: 'Read 50 stories', icon: '📖', unlocked: false, progress: 47, target: 50 },
  { id: '5', name: 'Marathon Writer', description: 'Write 10,000 words', icon: '🏃', unlocked: false, progress: 8234, target: 10000 },
  { id: '6', name: 'Perfectionist', description: 'Get 95%+ score', icon: '🎯', unlocked: false, progress: 92, target: 95 },
];

export default function AchievementBadges({ achievements }: AchievementBadgesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6"
    >
      <h3 className="text-white font-semibold text-lg mb-6 flex items-center">
        🏆 Achievements & Badges
      </h3>

      <div className="space-y-4">
        {/* Earned Achievements */}
        <div>
          <h4 className="text-green-400 font-medium mb-3">
            Earned ({achievements.length}):
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {allAchievements.filter(a => a.unlocked).map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-3 text-center cursor-pointer group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  {achievement.icon}
                </div>
                <h5 className="text-white font-medium text-sm mb-1">
                  {achievement.name}
                </h5>
                <p className="text-gray-400 text-xs">
                  {achievement.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Working On */}
        <div>
          <h4 className="text-blue-400 font-medium mb-3">
            Working On ({allAchievements.filter(a => !a.unlocked).length}):
          </h4>
          <div className="space-y-3">
            {allAchievements.filter(a => !a.unlocked).map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="bg-gray-700/30 border border-gray-600/50 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="text-xl opacity-50">{achievement.icon}</div>
                    <div>
                      <h5 className="text-gray-300 font-medium text-sm">
                        {achievement.name}
                      </h5>
                      <p className="text-gray-500 text-xs">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                  <Lock className="w-4 h-4 text-gray-500" />
                </div>
                
                {achievement.progress !== undefined && achievement.target && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{achievement.progress}/{achievement.target}</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                        transition={{ duration: 1, delay: 0.9 + index * 0.1 }}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}