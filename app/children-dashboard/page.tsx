// app/children-dashboard/page.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Sparkles, 
  BookOpen, 
  Target, 
  TrendingUp,
  Award,
  Clock,
  Star,
  PenTool,
  Heart,
  Zap
} from 'lucide-react';
import StatsCards from '@/components/dashboard/StatsCards';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentActivity from '@/components/dashboard/RecentActivity';
import WelcomeSection from '@/components/dashboard/WelcomeSection';

export default function ChildrenDashboard() {
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
      {/* Welcome Section */}
      <WelcomeSection />

      {/* Stats Cards */}
      <StatsCards />

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Activity */}
      <RecentActivity />

      {/* Recent Achievements */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Award className="w-6 h-6 mr-3 text-yellow-400" />
          Recent Achievements
        </h2>
        <div className="flex flex-wrap gap-3">
          {[
            { icon: '🔥', name: '7-Day Streak', description: 'Keep writing daily!' },
            { icon: '📚', name: '10th Story', description: 'Double digits!' },
            { icon: '⭐', name: 'Grammar Expert', description: '90%+ grammar score' },
          ].map((achievement, index) => (
            <motion.div
              key={achievement.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
              className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4 min-w-0 flex-1"
            >
              <div className="text-2xl mb-2">{achievement.icon}</div>
              <h3 className="text-white font-semibold text-sm mb-1">{achievement.name}</h3>
              <p className="text-gray-400 text-xs">{achievement.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}