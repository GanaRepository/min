// app/admin/page.tsx - Admin Dashboard (NOT LOGIN)
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  BookOpen,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Award,
  Activity,
  Calendar,
  Eye,
  ArrowUpRight,
  BarChart3,
} from 'lucide-react';
import { motion } from 'framer-motion';
import TerminalLoader from '@/components/TerminalLoader';

interface DashboardStats {
  users: {
    total: number;
    activeToday: number;
    newThisWeek: number;
    newThisMonth: number;
    children: number;
    mentors: number;
  };
  stories: {
    total: number;
    thisMonth: number;
    thisWeek: number;
    completed: number;
    averageWordsPerStory: number;
  };
  comments: {
    total: number;
    thisWeek: number;
    unresolved: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    growth: number;
  };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchDashboardStats();
  }, [session, status, router]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard-stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users.total || 0,
      change: `+${stats?.users.newThisMonth || 0} this month`,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      href: '/admin/users',
    },
    {
      title: 'Stories Created',
      value: stats?.stories.total || 0,
      change: `+${stats?.stories.thisMonth || 0} this month`,
      icon: BookOpen,
      color: 'from-green-500 to-green-600',
      href: '/admin/stories',
    },
    {
      title: 'Total Comments',
      value: stats?.comments.total || 0,
      change: `${stats?.comments.unresolved || 0} pending`,
      icon: MessageSquare,
      color: 'from-purple-500 to-purple-600',
      href: '/admin/comments',
    },
    {
      title: 'Revenue',
      value: `$${(stats?.revenue.total || 0).toLocaleString()}`,
      change: `${(stats?.revenue.growth ?? 0) >= 0 ? '+' : ''}${(stats?.revenue.growth ?? 0).toFixed(1)}%`,
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
      href: '/admin/revenue',
    },
  ];

  const quickActions = [
    {
      title: 'Create User',
      description: 'Add new child or mentor account',
      icon: Users,
      href: '/admin/users/create',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      title: 'View Revenue',
      description: 'Detailed platform revenue',
      icon: BarChart3,
      href: '/admin/revenue',
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      title: 'Manage Competition',
      description: 'Current competition status',
      icon: Award,
      href: '/admin/competitions',
      color: 'bg-orange-600 hover:bg-orange-700',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-green-900 flex items-center justify-center">
        <TerminalLoader
          title="Dashboard Details"
          loadingText="Loading Dashboard..."
          size="lg"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600  p-6 text-white">
        <h1 className="text-2xl sm:text-3xl  mb-2">
          Welcome back, {session?.user?.firstName}!
        </h1>
        <p className="text-blue-100">
          Here&apos;s what&apos;s happening with Mintoons today
        </p>
        <div className="mt-4 flex items-center text-blue-100">
          <Calendar className="w-4 h-4 mr-2" />
          <span className="text-sm">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={card.href}>
                <div className="bg-gray-800  p-6 hover:bg-gray-750 transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${card.color}  flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm ">{card.title}</p>
                    <p className="text-2xl  text-white mt-1">{card.value}</p>
                    <p className="text-gray-500 text-xs mt-2">{card.change}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Activity Overview & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-gray-800  p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg  text-white">Platform Activity</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-700/50 ">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600  flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white ">Active Users Today</p>
                  <p className="text-gray-400 text-sm">
                    {stats?.users.activeToday || 0} users online
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white ">{stats?.users.activeToday || 0}</p>
                <p className="text-green-400 text-xs">+12% vs yesterday</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/50 ">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-600  flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white ">Stories This Week</p>
                  <p className="text-gray-400 text-sm">
                    {stats?.stories.thisWeek || 0} new stories
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white ">{stats?.stories.thisWeek || 0}</p>
                <p className="text-green-400 text-xs">+8% vs last week</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/50 ">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600  flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white ">Pending Comments</p>
                  <p className="text-gray-400 text-sm">Need admin review</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white ">{stats?.comments.unresolved || 0}</p>
                {(stats?.comments.unresolved || 0) > 0 && (
                  <p className="text-orange-400 text-xs">Requires attention</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800  p-6">
          <h3 className="text-lg  text-white mb-6">Quick Actions</h3>

          <div className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.title} href={action.href}>
                  <div
                    className={`${action.color} p-4 m-2  transition-colors duration-200`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 text-white" />
                      <div>
                        <p className="text-white  text-sm">{action.title}</p>
                        <p className="text-white/80 text-xs">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* System Status */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h4 className="text-white  mb-3">System Status</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Server Status</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 "></div>
                  <span className="text-green-400 text-xs">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Database</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 "></div>
                  <span className="text-green-400 text-xs">Connected</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">API Health</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 "></div>
                  <span className="text-green-400 text-xs">Healthy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
