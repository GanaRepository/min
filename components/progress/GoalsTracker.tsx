// components/progress/GoalsTracker.tsx
'use client';

import { motion } from 'framer-motion';
import { Target, CheckCircle, Clock } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  progress: number;
  target: number;
  type: string;
}

interface GoalsTrackerProps {
  goals: Goal[];
}

export default function GoalsTracker({ goals }: GoalsTrackerProps) {
  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'stories': return '📚';
      case 'skill': return '📈';
      case 'streak': return '🔥';
      default: return '🎯';
    }
  };

  const getProgressColor = (progress: number, target: number) => {
    const percentage = (progress / target) * 100;
    if (percentage >= 100) return 'from-green-500 to-emerald-500';
    if (percentage >= 75) return 'from-blue-500 to-cyan-500';
    if (percentage >= 50) return 'from-yellow-500 to-orange-500';
    return 'from-gray-500 to-gray-600';
  };

  const challenges = [
    { name: 'Use 10 new adjectives', progress: 7, target: 10, reward: '🌟' },
    { name: 'Add dialogue to every story', progress: 2, target: 3, reward: '💬' },
    { name: 'Try a new genre', progress: 1, target: 1, reward: '📚' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6"
    >
      <h3 className="text-white font-semibold text-lg mb-6 flex items-center">
        🎯 Goals & Challenges
      </h3>

      <div className="space-y-6">
        {/* Current Goals */}
        <div>
          <h4 className="text-green-400 font-medium mb-4">Current Goals:</h4>
          <div className="space-y-4">
            {goals.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="bg-gray-700/30 border border-gray-600/50 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{getGoalIcon(goal.type)}</span>
                    <h5 className="text-white font-medium">{goal.title}</h5>
                  </div>
                  <div className="flex items-center space-x-2">
                    {goal.progress >= goal.target ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-400" />
                    )}
                    <span className="text-white font-medium">
                      {goal.progress}/{goal.target}
                    </span>
                  </div>
                </div>
                
                <div className="w-full bg-gray-600 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((goal.progress / goal.target) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: 1.0 + index * 0.1 }}
                    className={`bg-gradient-to-r ${getProgressColor(goal.progress, goal.target)} h-3 rounded-full`}
                  />
                </div>
                
                <div className="mt-2 text-xs text-gray-400">
                  {Math.round((goal.progress / goal.target) * 100)}% complete
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Weekly Challenges */}
        <div>
          <h4 className="text-purple-400 font-medium mb-4">Weekly Challenges:</h4>
          <div className="space-y-3">
            {challenges.map((challenge, index) => (
              <motion.div
                key={challenge.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + index * 0.1 }}
                className="flex items-center justify-between bg-purple-500/10 border border-purple-500/30 rounded-lg p-3"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{challenge.reward}</span>
                  <span className="text-gray-300 text-sm">{challenge.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-purple-400 text-sm font-medium">
                    {challenge.progress}/{challenge.target}
                  </span>
                  {challenge.progress >= challenge.target && (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}