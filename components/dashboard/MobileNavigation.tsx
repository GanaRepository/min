// components/dashboard/MobileNavigation.tsx - FIXED TYPESCRIPT ERRORS
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dispatch, SetStateAction } from 'react';
import {
  Home,
  Sparkles,
  BookOpen,
  Trophy,
  Upload,
  Menu,
} from 'lucide-react';

interface MobileNavigationProps {
  setSidebarOpen?: Dispatch<SetStateAction<boolean>>;
  className?: string;
}

const mobileNavItems = [
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

export default function MobileNavigation({ setSidebarOpen, className }: MobileNavigationProps) {
  const pathname = usePathname();

  // If we have setSidebarOpen prop, render the mobile header instead
  if (setSidebarOpen) {
    return (
      <div className="bg-gray-800/95 backdrop-blur-xl border-b border-gray-600/40 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="text-gray-300 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open sidebar</span>
          </button>
          
          <div className="text-white font-semibold">
            Mintoons Dashboard
          </div>
          
          <div className="w-6" /> {/* Spacer for centering */}
        </div>
      </div>
    );
  }

  // Regular bottom navigation
  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur-xl border-t border-gray-600/40 z-30 ${className || ''}`}
    >
      <div className="flex items-center justify-around py-2">
        {mobileNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/children-dashboard' &&
              pathname?.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center py-2 px-2 min-w-0 flex-1 transition-colors ${
                isActive
                  ? 'text-green-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium truncate">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}