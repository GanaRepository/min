// components/dashboard/StatsCards.tsx
'use client';

import { motion } from 'framer-motion';
import { BookOpen, PenTool, Award, TrendingUp } from 'lucide-react';

const stats = [
  {
    label: 'Words Today',
    value: '156',
    change: '+23',
    icon: PenTool,
    color: 'from-green-500 to-emerald-600'
  },
  {
    label: 'Stories Done',
    value: '2',
    change: '+1',
    icon: BookOpen,
    color: 'from-blue-500 to-cyan-600'
  },
  {
    label: 'Writing Streak',
    value: '7 days',
    change: '🔥',
    icon: TrendingUp,
    color: 'from-orange-500 to-red-600'
  },
  {
    label: 'Best Score',
    value: '92%',
    change: '⭐',
    icon: Award,
    color: 'from-purple-500 to-pink-600'
  }
];

export default function StatsCards() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mb-8"
    >
      <h2 className="text-xl font-bold text-white mb-4 flex items-center">
        📊 Your Writing Stats Today
      </h2>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-green-400 text-sm font-medium">
                {stat.change}
              </span>
            </div>
            
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
              {stat.value}
            </div>
            
            <p className="text-gray-400 text-sm">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}