// components/dashboard/DashboardLayout.tsx - FIXED TYPESCRIPT ERRORS
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import DashboardSidebar from './DashboardSidebar';
import MobileNavigation from './MobileNavigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login/child');
      return;
    }

    if (session.user.role !== 'child') {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading your creative space...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'child') {
    return null;
  }

  const isStoryWritingPage = pathname?.includes('/story/');

  if (isStoryWritingPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900">
        <header className="sticky top-0 z-30 bg-gray-800/80 backdrop-blur-xl border-b border-gray-600/40">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link href="/children-dashboard">
                  <motion.button
                    whileHover={{ x: -2 }}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="hidden sm:block">Back to Dashboard</span>
                  </motion.button>
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-white font-medium">
                  {session.user.firstName} {session.user.lastName}
                </span>
              </div>
            </div>
          </div>
        </header>
        
        <main className="relative">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900">
      <DashboardSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className="lg:pl-64">
        <div className="sticky top-0 z-30 lg:hidden">
          <MobileNavigation setSidebarOpen={setSidebarOpen} />
        </div>
        
        <main className="py-4 lg:py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}