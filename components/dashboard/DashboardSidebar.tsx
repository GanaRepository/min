// components/dashboard/DashboardSidebar.tsx - SIMPLE WORKING VERSION
'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  BookOpen,
  Trophy,
  Upload,
  Settings,
  LogOut,
  X,
  User,
  Sparkles,
} from 'lucide-react';

interface DashboardSidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function DashboardSidebar({
  open,
  setOpen,
}: DashboardSidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/children-dashboard',
      icon: Home,
    },
    {
      name: 'My Stories',
      href: '/children-dashboard/my-stories',
      icon: BookOpen,
    },
    {
      name: 'Create Stories',
      href: '/create-stories',
      icon: Sparkles,
    },
    {
      name: 'Competitions',
      href: '/children-dashboard/competitions',
      icon: Trophy,
    },
    {
      name: 'Community',
      href: '/children-dashboard/community',
      icon: Upload,
    },
  ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/logout' });
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-gray-800 border-r border-gray-700
        transform transition-transform duration-200 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500  flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl  text-white">Mintoons</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Profile */}
        <div className="px-6 py-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500  flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm  text-white">
                {session?.user?.firstName} {session?.user?.lastName}
              </p>
              <p className="text-xs text-gray-400">Young Writer</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`
                  flex items-center space-x-3 px-3 py-3 text-sm  
                  ${
                    isActive
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-3 border-t border-gray-700">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-3 py-3 text-sm   text-gray-300 hover:text-white hover:bg-red-600/20 mt-1"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}
