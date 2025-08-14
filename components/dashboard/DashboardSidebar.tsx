// components/dashboard/DashboardSidebar.tsx - COMPLETE IMPLEMENTATION
'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  BookOpen,
  Trophy,
  Upload,
  Star,
  Settings,
  LogOut,
  X,
  User,
  Crown,
  Sparkles,
  Target,
  Award,
  Brain,
} from 'lucide-react';

interface DashboardSidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function DashboardSidebar({ open, setOpen }: DashboardSidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/children-dashboard',
      icon: Home,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
    },
    {
      name: 'My Stories',
      href: '/children-dashboard/my-stories',
      icon: BookOpen,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
    {
      name: 'Create Stories',
      href: '/children-dashboard/create-stories',
      icon: Sparkles,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
    },
    {
      name: 'Competitions',
      href: '/children-dashboard/competitions',
      icon: Trophy,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
    },
    {
      name: 'Upload Story',
      href: '/children-dashboard/upload-story',
      icon: Upload,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
    },
  ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login/child' });
  };

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setOpen(false)}
          >
            <div className="absolute inset-0 bg-gray-600/75 backdrop-blur-sm" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-full w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-full flex-col bg-gray-800/95 backdrop-blur-xl border-r border-gray-600/40">
          {/* Logo/Header */}
          <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-gray-600/40">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Mintoons</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* User Profile */}
          <div className="px-6 py-4 border-b border-gray-600/40">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {session?.user?.firstName} {session?.user?.lastName}
                </p>
                <p className="text-xs text-gray-400">Young Writer</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.name} href={item.href}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className={`
                      group flex items-center space-x-3 px-3 py-3 text-sm font-medium rounded-lg transition-all
                      ${isActive 
                        ? `${item.bgColor} ${item.color} border border-current/20` 
                        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                      }
                    `}
                    onClick={() => setOpen(false)}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? item.color : 'text-gray-400 group-hover:text-white'}`} />
                    <span>{item.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-2 h-2 rounded-full bg-current"
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Subscription Status */}
          <div className="px-3 py-4 border-t border-gray-600/40">
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Crown className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-400">
                  {session?.user?.subscriptionTier || 'FREE'} TIER
                </span>
              </div>
              <p className="text-xs text-gray-300 mb-3">
                Unlock more stories and features with Story Pack!
              </p>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs py-2 rounded-lg transition-colors">
                Upgrade Now
              </button>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="px-3 py-4 border-t border-gray-600/40 space-y-2">
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}