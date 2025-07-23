// components/dashboard/MobileNavigation.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sparkles, BookOpen, TrendingUp, User } from 'lucide-react';

interface MobileNavigationProps {
  className?: string;
}

const mobileNavItems = [
  { name: 'Home', href: '/children-dashboard', icon: Home },
  { name: 'Create', href: '/create-stories', icon: Sparkles },
  { name: 'Stories', href: '/children-dashboard/my-stories', icon: BookOpen },
  { name: 'Progress', href: '/children-dashboard/progress', icon: TrendingUp },
  { name: 'Profile', href: '/children-dashboard/profile', icon: User },
];

export default function MobileNavigation({ className }: MobileNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur-xl border-t border-gray-600/40 ${className}`}
    >
      <div className="flex items-center justify-around py-2">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center py-2 px-3 min-w-0 flex-1 ${
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
