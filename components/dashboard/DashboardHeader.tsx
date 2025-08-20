// components/dashboard/DashboardHeader.tsx
'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  Menu,
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  Trophy,
  Sparkles,
} from 'lucide-react';

interface User {
  firstName: string;
  lastName: string;
  age?: number;
}

interface DashboardHeaderProps {
  user: User;
  onMenuClick: () => void;
}

export default function DashboardHeader({
  user,
  onMenuClick,
}: DashboardHeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <header className="sticky top-0 z-30 bg-gray-800/80 backdrop-blur-xl border-b border-gray-600/40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Welcome message */}
            <div className="hidden sm:block">
              <h1 className="text-white  text-lg">
                Welcome back, {user.firstName}!
              </h1>
              <p className="text-gray-400 text-sm">
                Ready for another adventure?
              </p>
            </div>
          </div>

          {/* Center - Search (hidden on mobile) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search your stories..."
                className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Today's stats */}
            <div className="hidden sm:flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-300">
                <Sparkles className="w-4 h-4 text-green-400" />
                <span>Today: 156 words</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span>Streak: 7 days</span>
              </div>
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white  text-sm">
                    {user.firstName.charAt(0)}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className=" text-sm">{user.firstName}</p>
                  <p className="text-xs opacity-75">
                    {user.age ? `Age ${user.age}` : 'Writer'}
                  </p>
                </div>
              </button>

              {/* Dropdown menu */}
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-xl"
                >
                  <div className="p-2">
                    <button
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full flex items-center space-x-3 p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors text-left"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile Settings</span>
                    </button>
                    <button
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full flex items-center space-x-3 p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors text-left"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Preferences</span>
                    </button>
                    <hr className="my-2 border-gray-600" />
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-3 p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
