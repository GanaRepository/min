// app/admin/layout.tsx (Fixed)
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
  DollarSign,
  LogOut,
  Menu,
  X,
  Crown,
  UserCheck,
  BookOpen,
  UserPlus,
  Award,
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

  // Unified redirect logic
  useEffect(() => {
    if (status === 'loading') return;

    // If on login page and authenticated as admin, redirect to dashboard
    if (pathname === '/admin/login' && session && session.user?.role === 'admin') {
      router.replace('/admin');
      return;
    }

    // If not authenticated or not admin, redirect to login (except on login page)
    if ((pathname.startsWith('/admin') && pathname !== '/admin/login') && (!session || session.user?.role !== 'admin')) {
      router.replace('/admin/login');
      return;
    }
  }, [session, status, router, pathname]);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Crown },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Mentors', href: '/admin/mentors', icon: UserCheck },
    { name: 'Stories', href: '/admin/stories', icon: BookOpen },
    { name: 'Comments', href: '/admin/comments', icon: MessageSquare },
    { name: 'Competitions', href: '/admin/competitions', icon: Award },
    { name: 'Revenue', href: '/admin/revenue', icon: DollarSign },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin' || pathname === '/admin/';
    }
    return pathname.startsWith(path);
  };

  const handleLogout = () => {
    router.push('/api/auth/signout');
  };

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Redirect authenticated admin away from /admin/login using useEffect
  useEffect(() => {
    if (pathname === '/admin/login' && session && session.user?.role === 'admin') {
      router.replace('/admin');
    }
  }, [pathname, session, router]);

  // For login page, only render children if not authenticated
  if (pathname === '/admin/login') {
    if (session && session.user?.role === 'admin') {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white text-xl">Redirecting to dashboard...</div>
        </div>
      );
    }
    // Not authenticated, show login page
    return <>{children}</>;
  }

  // Check if user is authenticated and is admin
  if (!session || session.user?.role !== 'admin') {
    console.log('User not authenticated or not admin, showing unauthorized');
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Unauthorized access. Redirecting...</div>
      </div>
    );
  }

  // User is authenticated admin, show full layout
  return (
    <div className="bg-gray-900 text-white min-h-screen">
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
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar */}
        <div className={`w-64 bg-gray-800 border-r border-gray-700 flex-shrink-0 ${
          sidebarOpen ? 'block' : 'hidden'
        } lg:block fixed lg:static inset-y-0 left-0 z-40 lg:z-auto`}>
          <div className="flex flex-col h-full">
            {/* Admin Header */}
            <div className="p-6 border-b border-gray-700 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Admin Portal</h1>
                  <p className="text-sm text-gray-400">Mintoons Control Center</p>
                </div>
              </div>
            </div>

            {/* Admin Info */}
            <div className="p-4 border-b border-gray-700 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {session.user.firstName?.[0] || 'A'}
                    {session.user.lastName?.[0] || 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {session.user.firstName || 'Admin'} {session.user.lastName || 'User'}
                  </p>
                  <p className="text-xs text-gray-400">Administrator</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
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
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-700 flex-shrink-0">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 w-full"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1">
          <main className="min-h-screen">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}