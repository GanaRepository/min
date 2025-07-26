// components/dashboard/DashboardSidebar.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Sparkles,
  BookOpen,
  TrendingUp,
  User,
  PenTool,
  Trophy,
  Clock,
} from 'lucide-react';

interface User {
  firstName: string;
  lastName: string;
  age?: number;
}

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/children-dashboard',
    icon: Home,
    description: 'Your creative home',
  },
  {
    name: 'Create Stories',
    href: '/create-stories',
    icon: Sparkles,
    description: 'Start new adventure',
  },
  {
    name: 'My Stories',
    href: '/children-dashboard/my-stories',
    icon: BookOpen,
    description: 'View your stories',
  },
  {
    name: 'Progress',
    href: '/children-dashboard/progress',
    icon: TrendingUp,
    description: 'Track your growth',
  },
  {
    name: 'Profile',
    href: '/children-dashboard/profile',
    icon: User,
    description: 'Manage your account',
  },
];

export default function DashboardSidebar({
  isOpen,
  onClose,
  user,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: -320 }}
        animate={{ x: isOpen ? 0 : -320 }}
        exit={{ x: -320 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 h-full w-64 bg-gray-800/95 backdrop-blur-xl border-r border-gray-600/40 z-50 lg:translate-x-0 lg:static lg:z-auto"
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-gray-600/40">
            <Link href="/children-dashboard" onClick={onClose}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-teal-500 rounded-xl flex items-center justify-center">
                  <PenTool className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg">Mintoons</h1>
                  <p className="text-gray-400 text-xs">Creative Writing</p>
                </div>
              </div>
            </Link>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-600/40">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {user.firstName.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-white font-medium">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-gray-400 text-sm">
                  {user.age ? `Age ${user.age}` : 'Young Writer'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href} onClick={onClose}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs opacity-75">{item.description}</p>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Quick Stats */}
          <div className="p-4 border-t border-gray-600/40">
            <div className="bg-gray-700/50 rounded-xl p-4">
              <h3 className="text-white font-medium mb-3 flex items-center">
                <Trophy className="w-4 h-4 mr-2 text-yellow-400" />
                Quick Stats
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Stories:</span>
                  <span className="text-green-400 font-medium">12</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Words:</span>
                  <span className="text-blue-400 font-medium">5,234</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Streak:</span>
                  <span className="text-orange-400 font-medium">7 days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Story */}
          <div className="p-4">
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4">
              <h3 className="text-white font-medium mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-purple-400" />
                Continue Writing
              </h3>
              <p className="text-gray-300 text-sm mb-3">&quot;Magic Forest Quest&quot;</p>
              <p className="text-xs text-gray-400 mb-3">Turn 3/6 • 245 words</p>
              <Link href="/children-dashboard/story/current">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Continue Story
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
