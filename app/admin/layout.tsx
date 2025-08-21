'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
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
  User,
} from 'lucide-react';
import TerminalLoader from '../../components/TerminalLoader';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Single unified useEffect for all authentication and redirect logic
  useEffect(() => {
    // Wait for session to load
    if (status === 'loading') return;

    const isLoginPage = pathname === '/admin/login';
    const isAuthenticatedAdmin = session && session.user?.role === 'admin';

    // If on login page and authenticated as admin, redirect to dashboard
    if (isLoginPage && isAuthenticatedAdmin) {
      router.replace('/admin');
      return;
    }

    // If not on login page and not authenticated admin, redirect to login
    if (!isLoginPage && !isAuthenticatedAdmin) {
      router.replace('/admin/login');
      return;
    }
  }, [session, status, router, pathname]);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Crown },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Mentors', href: '/admin/mentors', icon: UserCheck },
    { name: 'Assign Mentor', href: '/admin/mentors/assign', icon: UserPlus },
    { name: 'Stories', href: '/admin/stories', icon: BookOpen },
    { name: 'Comments', href: '/admin/comments', icon: MessageSquare },
    { name: 'Competitions', href: '/admin/competitions', icon: Award },
    { name: 'Revenue', href: '/admin/revenue', icon: DollarSign },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin' || pathname === '/admin/';
    }
    return pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      // Navigate to your custom logout page instead of using NextAuth signOut directly
      router.push('/logout');
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback - use NextAuth signOut with home page redirect
      await signOut({
        callbackUrl: '/',
        redirect: true,
      });
    }
  };

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <TerminalLoader title="Admin" loadingText="Loading..." size="lg" />
      </div>
    );
  }

  // For login page, only render children if not authenticated
  if (pathname === '/admin/login') {
    if (session && session.user?.role === 'admin') {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <TerminalLoader
            title="Dashboard"
            loadingText="Redirecting to dashboard..."
            size="lg"
          />
        </div>
      );
    }
    // Not authenticated, show login page
    return <>{children}</>;
  }

  // Check if user is authenticated and is admin
  if (!session || session.user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <TerminalLoader
          title="Dashboard"
          loadingText="Loading Admin Dashboard..."
          size="lg"
        />
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
          className="bg-gray-800 p-2  text-white hover:bg-gray-700 transition-colors"
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
        <div
          className={`w-64 bg-gray-800 border-r border-gray-700 flex-shrink-0 ${
            sidebarOpen
              ? 'fixed inset-y-0 left-0 z-40 lg:relative lg:translate-x-0'
              : 'hidden lg:block'
          } transition-all duration-300 ease-in-out`}
        >
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <Crown className="w-8 h-8 text-yellow-500" />
              <h1 className="text-xl  text-white">Admin Panel</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-3 px-4 py-3  transition-colors ${
                        isActive(item.href)
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-blue-600  flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm  text-white">
                  {session?.user?.firstName} {session?.user?.lastName}
                </p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white  transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl  text-white">
                  {navigation.find((item) => isActive(item.href))?.name ||
                    'Dashboard'}
                </h2>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">
                  Welcome back, {session?.user?.firstName}
                </span>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-auto bg-gray-900 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
