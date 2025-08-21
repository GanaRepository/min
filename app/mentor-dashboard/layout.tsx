'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  BookOpen,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  GraduationCap,
  UserCheck,
  FileText,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TerminalLoader from '@/components/TerminalLoader';

interface MentorLayoutProps {
  children: React.ReactNode;
}

export default function MentorLayout({ children }: MentorLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (pathname === '/login/mentor') return;
    if (!session || session.user?.role !== 'mentor') {
      router.push('/login/mentor');
      return;
    }
  }, [session, status, router, pathname]);

  const navigation = [
    { name: 'Dashboard', href: '/mentor-dashboard', icon: BarChart3 },
    { name: 'My Students', href: '/mentor-dashboard/students', icon: Users },
    {
      name: 'Student Stories',
      href: '/mentor-dashboard/stories',
      icon: BookOpen,
    },
    {
      name: 'Comments & Reviews',
      href: '/mentor-dashboard/comments',
      icon: MessageSquare,
    },
  ];

  const isActive = (path: string) => {
    if (path === '/mentor-dashboard') {
      return (
        pathname === '/mentor-dashboard' || pathname === '/mentor-dashboard/'
      );
    }
    return pathname.startsWith(path);
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <TerminalLoader
          title="Accessing Mentor Dashboard"
          loadingText="Verifying mentor access..."
          size="md"
        />
      </div>
    );
  }

  if (!session || session.user?.role !== 'mentor') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex items-center justify-center h-64">
          <TerminalLoader
            title="Dashboard"
            loadingText="Redirecting to login..."
            size="md"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-gray-800 p-2 text-white hover:bg-gray-700 transition-colors"
        >
          {sidebarOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Layout Container */}
      <div className="flex h-screen">
        {/* Changed from flex-col lg:flex-row to flex and h-screen */}
        {/* Sidebar */}
        <div
          className={`w-60 sm:w-64 bg-gray-800 border-r border-gray-700 flex-shrink-0 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 lg:z-auto`}
        >
          <div className="flex flex-col h-full">
            {/* Mentor Header */}
            <div className="p-4 sm:p-6 border-b border-gray-700 flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl text-white">
                    Mentor Portal
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Mintoons Teaching Hub
                  </p>
                </div>
              </div>
            </div>

            {/* Mentor Info */}
            <div className="p-3 sm:p-4 border-b border-gray-700 flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-600 flex items-center justify-center">
                  <span className="text-xs sm:text-sm">
                    {session.user.firstName?.[0]}
                    {session.user.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-white">
                    {session.user.firstName} {session.user.lastName}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-400">
                    Writing Mentor
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="p-3 sm:p-4 space-y-1 sm:space-y-2 flex-1 overflow-y-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 transition-all duration-200 text-xs sm:text-base ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-green-600/20 to-green-500/20 border border-green-500/30 text-green-300'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-3 sm:p-4 border-t border-gray-700 flex-shrink-0">
              <Link
                href="/api/auth/signout"
                className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 text-xs sm:text-base"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Logout</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">
          {/* Top bar */}
          <div className="bg-gray-800 border-b border-gray-700 p-3 sm:p-4 lg:p-6 lg:hidden">
            <div className="flex items-center justify-between">
              <div className="lg:hidden w-8 sm:w-10" />
              <div className="flex-1 lg:flex-none lg:ml-0 ml-8 sm:ml-12">
                <h2 className="text-lg sm:text-xl text-white">
                  {navigation.find((item) => isActive(item.href))?.name ||
                    'Mentor Dashboard'}
                </h2>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-xs sm:text-sm text-gray-400">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
