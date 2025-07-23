// components/dashboard/QuickActions.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, BookOpen, Target, ArrowRight } from 'lucide-react';

const quickActions = [
  {
    title: 'Start New Story',
    description: 'Create a magical adventure',
    href: '/create-stories',
    icon: Sparkles,
    gradient: 'from-green-500 to-emerald-600',
    bgGradient: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-500/30',
  },
  {
    title: 'Continue Story',
    description: '"Magic Forest Quest" - Turn 3/6',
    href: '/children-dashboard/story/current',
    icon: BookOpen,
    gradient: 'from-purple-500 to-pink-600',
    bgGradient: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/30',
  },
  {
    title: 'Practice Grammar',
    description: 'Fun writing exercises',
    href: '/children-dashboard/practice',
    icon: Target,
    gradient: 'from-blue-500 to-cyan-600',
    bgGradient: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/30',
  },
];

export default function QuickActions() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="mb-8"
    >
      <h2 className="text-xl font-bold text-white mb-4 flex items-center">
        🚀 Quick Actions
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
          >
            <Link href={action.href}>
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`bg-gradient-to-br ${action.bgGradient} backdrop-blur-xl border ${action.borderColor} rounded-xl p-6 cursor-pointer group`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${action.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
                  >
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
                </div>

                <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-green-300 transition-colors">
                  {action.title}
                </h3>

                <p className="text-gray-300 text-sm">{action.description}</p>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
