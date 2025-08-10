'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Home,
  Sparkles,
  BookOpen,
  Upload,
  Trophy,
  X,
  LogOut,
} from 'lucide-react';

interface User {
  firstName?: string;
  lastName?: string;
  name?: string;
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
    name: 'Create Stories Freestyle',
    href: '/create-stories/#freestyle',
    icon: Sparkles,
    description: 'Freestyle story writing',
  },
  {
    name: 'Upload Stories For Assessment',
    href: '/create-stories/#assessment',
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
];

export default function DashboardSidebar({
  isOpen,
  onClose,
  user,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const userName = user.firstName || user.name || 'Writer';

  return (
    <>
      {/* Desktop Sidebar - Always Visible */}
      <div className="hidden lg:flex fixed left-0 top-20 h-[calc(100vh-5rem)] w-64 bg-gray-900/95 backdrop-blur-xl border-r border-gray-700/50 z-30 flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div>
            <h2 className="text-xl font-bold text-white">Hi, {userName}! 👋</h2>
            {user.age && (
              <p className="text-sm text-gray-400">Age {user.age} Writer</p>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item, index) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/children-dashboard' &&
                pathname.startsWith(item.href));

            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <item.icon size={20} />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-400">
                      {item.description}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700/50">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-gray-300 hover:text-white hover:bg-red-600/20 rounded-xl transition-all group"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar - Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 h-full w-64 bg-gray-900/95 backdrop-blur-xl border-r border-gray-700/50 z-50 flex flex-col"
            >
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                <div>
                  <h2 className="text-xl font-bold text-white">Hi, {userName}! 👋</h2>
                  {user.age && (
                    <p className="text-sm text-gray-400">Age {user.age} Writer</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navigationItems.map((item, index) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/children-dashboard' &&
                      pathname.startsWith(item.href));

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
                            ? 'bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 text-white'
                            : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                        }`}
                      >
                        <item.icon size={20} />
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-gray-400">
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Mobile Logout Button */}
              <div className="p-4 border-t border-gray-700/50">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3 w-full text-gray-300 hover:text-white hover:bg-red-600/20 rounded-xl transition-all group"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}