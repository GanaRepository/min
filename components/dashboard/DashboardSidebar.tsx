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
  Upload,
  Trophy,
  X,
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
    description: 'Freestyle story writing',
  },
  {
    name: 'Upload Assessment',
    href: '/children-dashboard/upload-assessment',
    icon: Upload,
    description: 'Submit for AI feedback',
  },
  {
    name: 'My Stories',
    href: '/children-dashboard/my-stories',
    icon: BookOpen,
    description: 'View your stories',
  },
  {
    name: 'Competitions',
    href: '/children-dashboard/competitions',
    icon: Trophy,
    description: 'Monthly contests',
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
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-80 bg-gray-900/95 backdrop-blur-xl border-r border-gray-700/50 z-50 lg:relative lg:w-64"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Hi, {user.firstName}! 👋
                </h2>
                {user.age && (
                  <p className="text-sm text-gray-400">Age {user.age} Writer</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-2">
              {navigationItems.map((item, index) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/children-dashboard' && pathname.startsWith(item.href));
                
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all group ${
                        isActive
                          ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                      }`}
                    >
                      <item.icon
                        size={20}
                        className={`${
                          isActive ? 'text-green-400' : 'group-hover:text-white'
                        } transition-colors`}
                      />
                      <div className="flex-1">
                        <div className={`font-medium ${isActive ? 'text-green-400' : ''}`}>
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-500 group-hover:text-gray-400">
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-xl p-4">
                <div className="text-center">
                  <Clock className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <div className="text-sm text-white font-medium">Keep Writing!</div>
                  <div className="text-xs text-gray-400">Your stories matter</div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}