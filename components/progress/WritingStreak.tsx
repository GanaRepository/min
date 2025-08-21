// components/progress/WritingStreak.tsx
'use client';

import { motion } from 'framer-motion';
import { Calendar, Flame } from 'lucide-react';

interface WritingStreakProps {
  currentStreak: number;
  className?: string;
}

export default function WritingStreak({
  currentStreak,
  className,
}: WritingStreakProps) {
  // Generate streak calendar for the last 30 days
  const generateStreakData = () => {
    const days = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Simulate streak data - in real app this would come from API
      const hasWritten = i < currentStreak;

      days.push({
        date: date.getDate(),
        hasWritten,
        isToday: i === 0,
      });
    }

    return days;
  };

  const streakData = generateStreakData();
  const bestStreak = 14; // This would come from API

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className={`bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6 ${className}`}
    >
      <h3 className="text-white  text-lg mb-6 flex items-center">
        🔥 Writing Streak
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Streak */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.8 }}
            className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3"
          >
            <Flame className="w-10 h-10 text-white" />
          </motion.div>
          <div className="text-3xl  text-orange-400 mb-1">{currentStreak}</div>
          <div className="text-gray-400 text-sm">Current Streak</div>
        </div>

        {/* Best Streak */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.9 }}
            className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3"
          >
            <span className="text-2xl">🏆</span>
          </motion.div>
          <div className="text-3xl  text-yellow-400 mb-1">{bestStreak}</div>
          <div className="text-gray-400 text-sm">Best Streak</div>
        </div>

        {/* Next Goal */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 1.0 }}
            className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3"
          >
            <span className="text-2xl">🎯</span>
          </motion.div>
          <div className="text-3xl  text-green-400 mb-1">30</div>
          <div className="text-gray-400 text-sm">Next Goal</div>
        </div>
      </div>

      {/* Streak Calendar */}
      <div className="mt-6">
        <h4 className="text-white  mb-3 flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          Last 30 Days
        </h4>
        <div className="grid grid-cols-10 gap-1">
          {streakData.map((day, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1 + index * 0.02 }}
              className={`w-6 h-6 rounded text-xs flex items-center justify-center  ${
                day.hasWritten
                  ? 'bg-green-500 text-white'
                  : day.isToday
                    ? 'bg-yellow-500 text-gray-900'
                    : 'bg-gray-700 text-gray-400'
              }`}
              title={day.hasWritten ? 'Wrote this day' : 'No writing'}
            >
              {day.date}
            </motion.div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </div>

      {/* Motivation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="mt-6 p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg"
      >
        <p className="text-orange-300 text-sm text-center">
          {currentStreak === 0
            ? 'Start your writing streak today! Every great writer begins with a single word.'
            : currentStreak < 7
              ? `Amazing start! Keep going to reach a 7-day streak! 🌟`
              : currentStreak < 30
                ? `Incredible ${currentStreak}-day streak! You're on fire! 🔥`
                : `Legendary ${currentStreak}-day streak! You're a writing champion! 👑`}
        </p>
      </motion.div>
    </motion.div>
  );
}
