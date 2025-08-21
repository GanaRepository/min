// components/dashboard/DashboardLayout.tsx - SIMPLE WORKING VERSION
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import DashboardSidebar from './DashboardSidebar';
import MobileNavigation from './MobileNavigation';
import TerminalLoader from '../TerminalLoader';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <TerminalLoader title="Dashboard" loadingText="Loading..." size="md" />
      </div>
    );
  }

  if (!session || session.user.role !== 'child') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900">
      {/* Sidebar */}
      <DashboardSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main content with proper margin for sidebar */}
      <div className="lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden">
          <MobileNavigation setSidebarOpen={setSidebarOpen} />
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
