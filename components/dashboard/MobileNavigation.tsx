// components/dashboard/MobileNavigation.tsx - SIMPLE WORKING VERSION
'use client';

import { useSession } from 'next-auth/react';
import { Menu, Sparkles, User } from 'lucide-react';

interface MobileNavigationProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function MobileNavigation({
  setSidebarOpen,
}: MobileNavigationProps) {
  const { data: session } = useSession();

  return (
    <div className="bg-gray-800 border-b border-gray-700">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-700"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg  text-white">Mintoons</span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm  text-white hidden sm:block">
              {session?.user?.firstName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
