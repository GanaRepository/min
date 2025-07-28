'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  BookOpen,
  MessageSquare,
  TrendingUp,
  UserPlus,
  FileText,
  Star,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardStats {
  totalUsers: number;
  totalChildren: number;
  totalMentors: number;
  totalStories: number;
  activeStories: number;
  completedStories: number;
  monthlyStats: {
    newUsers: number;
    storiesCreated: number;
    assessmentsCompleted: number;
  };
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  userId?: string;
  storyId?: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }

    fetchDashboardData();
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        fetch('/api/admin/dashboard-stats'),
        fetch('/api/admin/recent-activity'),
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.stats);
        }
      }

      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        if (activityData.success) {
          setRecentActivity(activityData.activities);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      href: '/admin/users',
    },
    {
      title: 'Children Writers',
      value: stats?.totalChildren || 0,
      icon: UserPlus,
      color: 'from-green-500 to-green-600',
      href: '/admin/users?role=child',
    },
    {
      title: 'Active Mentors',
      value: stats?.totalMentors || 0,
      icon: Star,
      color: 'from-purple-500 to-purple-600',
      href: '/admin/mentors',
    },
    {
      title: 'Total Stories',
      value: stats?.totalStories || 0,
      icon: BookOpen,
      color: 'from-orange-500 to-orange-600',
      href: '/admin/stories',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {session?.user.firstName}!
        </h1>
        <p className="text-gray-300">
          Here&apos;s what&apos;s happening with Mintoons today.
        </p>
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
                <div className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">
                        {card.title}
                      </p>
                      <p className="text-3xl font-bold text-white mt-2">
                        {card.value.toLocaleString()}
                      </p>
                    </div>
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${card.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">This Month</h3>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">New Users</span>
              <span className="text-white font-medium">
                {stats?.monthlyStats.newUsers || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Stories Created</span>
              <span className="text-white font-medium">
                {stats?.monthlyStats.storiesCreated || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Assessments</span>
              <span className="text-white font-medium">
                {stats?.monthlyStats.assessmentsCompleted || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Story Status */}
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Story Status</h3>
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Active Stories</span>
              <span className="text-blue-400 font-medium">
                {stats?.activeStories || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Completed</span>
              <span className="text-green-400 font-medium">
                {stats?.completedStories || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total</span>
              <span className="text-white font-medium">
                {stats?.totalStories || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link href="/admin/create-mentor">
              <button className="mb-4 w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200">
                Create Mentor
              </button>
            </Link>
            <Link href="/admin/stories?status=pending">
              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200">
                Review Stories
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
        </div>

        {recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.slice(0, 6).map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center space-x-4 p-4 bg-gray-700/50 rounded-lg"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}
                >
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.description}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No recent activity to display</p>
          </div>
        )}
      </div>
    </div>
  );
}

function getActivityColor(type: string) {
  switch (type) {
    case 'user_registered':
      return 'bg-green-500';
    case 'story_completed':
      return 'bg-blue-500';
    case 'mentor_assigned':
      return 'bg-purple-500';
    case 'comment_added':
      return 'bg-yellow-500';
    case 'assessment_completed':
      return 'bg-orange-500';
    default:
      return 'bg-gray-500';
  }
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'user_registered':
      return '👤';
    case 'story_completed':
      return '📚';
    case 'mentor_assigned':
      return '👨‍🏫';
    case 'comment_added':
      return '💬';
    case 'assessment_completed':
      return '✅';
    default:
      return '📊';
  }
}
