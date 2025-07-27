'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Crown,
  UserCheck,
  BookOpen,
  UserPlus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (pathname === '/admin/login') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
  }, [session, status, router, pathname]);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'All Users', href: '/admin/users', icon: Users },
    { name: 'All Stories', href: '/admin/stories', icon: BookOpen },
    {
      name: 'Comments & Reviews',
      href: '/admin/comments',
      icon: MessageSquare,
    },
    { name: 'Create Mentor', href: '/admin/create-mentor', icon: UserPlus },
    { name: 'Mentor Details', href: '/admin/mentors', icon: UserCheck },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Subscriptions', href: '/admin/subscriptions', icon: BarChart3 },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin' || pathname === '/admin/';
    }
    return pathname.startsWith(path);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Verifying admin access...</div>
      </div>
    );
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!session || session.user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-gray-800 p-2 rounded-lg text-white hover:bg-gray-700 transition-colors"
        >
          {sidebarOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Layout Container */}
      <div className="flex">
        {/* Sidebar - STATIC POSITION, NOT FIXED */}
        <div
          className={`w-64 bg-gray-800 border-r border-gray-700 flex-shrink-0 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 lg:z-auto`}
        >
          <div className="flex flex-col h-full">
            {/* Admin Header */}
            <div className="p-6 border-b border-gray-700 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Admin Portal</h1>
                  <p className="text-sm text-gray-400">
                    Mintoons Control Center
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Info */}
            <div className="p-4 border-b border-gray-700 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {session.user.firstName?.[0]}
                    {session.user.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {session.user.firstName} {session.user.lastName}
                  </p>
                  <p className="text-xs text-gray-400">Administrator</p>
                </div>
              </div>
            </div>

            {/* Navigation - SCROLLABLE */}
            <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-red-600/20 to-red-500/20 border border-red-500/30 text-red-300'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Logout - FIXED AT BOTTOM */}
            <div className="p-4 border-t border-gray-700 flex-shrink-0">
              <Link
                href="/api/auth/signout"
                className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
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
        <div className="flex-1 min-h-screen lg:ml-0">
          {/* Top bar */}
          <div className="bg-gray-800 border-b border-gray-700 p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="lg:hidden w-10" />
              <div className="flex-1 lg:flex-none lg:ml-0 ml-12">
                <h2 className="text-xl font-semibold text-white">
                  {navigation.find((item) => isActive(item.href))?.name ||
                    'Admin Dashboard'}
                </h2>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className='p-10'>{children}</main>
        </div>
      </div>
    </div>
  );
}
