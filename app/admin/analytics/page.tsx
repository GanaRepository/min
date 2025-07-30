'use client';

import { useState, useEffect, useCallback } from 'react';
import { SUBSCRIPTION_TIERS } from '@/config/tiers';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  MessageSquare,
  Calendar,
  Download,
  Filter,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalStories: number;
    totalComments: number;
    totalMentors: number;
    growthMetrics: {
      usersGrowth: number;
      storiesGrowth: number;
      commentsGrowth: number;
    };
  };
  userMetrics: {
    newUsersThisMonth: number;
    activeUsers: number;
    usersByTier: Array<{
      tier: string;
      count: number;
    }>;
  };
  storyMetrics: {
    storiesCreatedThisMonth: number;
    averageWordsPerStory: number;
    completionRate: number;
    storiesByStatus: Array<{
      status: string;
      count: number;
    }>;
  };
  engagementMetrics: {
    commentsThisMonth: number;
    averageCommentsPerStory: number;
    mentorEngagement: number;
    responseRate: number;
  };
  timeSeriesData: Array<{
    date: string;
    users: number;
    stories: number;
    comments: number;
  }>;
}

export default function AnalyticsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/admin/analytics?timeRange=${timeRange}`
      );
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'admin') {
      router.push('/admin/login');
      return;
    }

    fetchAnalytics();
  }, [session, status, router, fetchAnalytics]);

  const exportData = async () => {
    try {
      const response = await fetch(
        `/api/admin/analytics/export?timeRange=${timeRange}`
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mintoons-analytics-${timeRange}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-400 mb-2">
          Analytics Unavailable
        </h3>
        <p className="text-gray-500">
          Unable to load analytics data at this time.
        </p>
      </div>
    );
  }

  // Use config tiers for canonical tier list and display names
  const tierKeys = Object.keys(SUBSCRIPTION_TIERS);
  const normalizedTiers: Record<string, number> = {};
  if (analytics && analytics.userMetrics && analytics.userMetrics.usersByTier) {
    analytics.userMetrics.usersByTier.forEach((t) => {
      let key = (t.tier || '').trim().toUpperCase();
      if (!tierKeys.includes(key)) key = 'FREE';
      normalizedTiers[key] = (normalizedTiers[key] || 0) + t.count;
    });
  }

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-400">
            Platform insights and performance metrics
          </p>
        </div>
      <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={exportData}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-4 sm:p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Total Users</p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {analytics.overview.totalUsers}
              </p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp
                  className={`w-3 h-3 ${analytics.overview.growthMetrics.usersGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}
                />
                <span
                  className={`text-xs ${analytics.overview.growthMetrics.usersGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}
                >
                  {analytics.overview.growthMetrics.usersGrowth >= 0 ? '+' : ''}
                  {analytics.overview.growthMetrics.usersGrowth}%
                </span>
              </div>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-4 sm:p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Total Stories</p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {analytics.overview.totalStories}
              </p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp
                  className={`w-3 h-3 ${analytics.overview.growthMetrics.storiesGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}
                />
                <span
                  className={`text-xs ${analytics.overview.growthMetrics.storiesGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}
                >
                  {analytics.overview.growthMetrics.storiesGrowth >= 0
                    ? '+'
                    : ''}
                  {analytics.overview.growthMetrics.storiesGrowth}%
                </span>
              </div>
            </div>
            <BookOpen className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-xl p-4 sm:p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Total Comments</p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {analytics.overview.totalComments}
              </p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp
                  className={`w-3 h-3 ${analytics.overview.growthMetrics.commentsGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}
                />
                <span
                  className={`text-xs ${analytics.overview.growthMetrics.commentsGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}
                >
                  {analytics.overview.growthMetrics.commentsGrowth >= 0
                    ? '+'
                    : ''}
                  {analytics.overview.growthMetrics.commentsGrowth}%
                </span>
              </div>
            </div>
            <MessageSquare className="w-8 h-8 text-purple-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-xl p-4 sm:p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Active Mentors</p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {analytics.overview.totalMentors}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Engagement: {analytics.engagementMetrics.mentorEngagement}%
              </p>
            </div>
            <Users className="w-8 h-8 text-orange-400" />
          </div>
        </motion.div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* User Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800 rounded-xl p-4 sm:p-6"
        >
          <h3 className="text-lg font-medium text-white mb-6">User Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">New Users This Month</span>
              <span className="text-white font-medium">
                {analytics.userMetrics.newUsersThisMonth}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Active Users</span>
              <span className="text-white font-medium">
                {analytics.userMetrics.activeUsers}
              </span>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-400 mb-3">
                Users by Subscription Tier
              </h4>
              <div className="space-y-2">
                {tierKeys.map((tierKey) => (
                  <div key={tierKey} className="flex items-center justify-between">
                    <span className="text-gray-300 capitalize">{SUBSCRIPTION_TIERS[tierKey].name}</span>
                    <span className="text-white">{normalizedTiers[tierKey] || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Story Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800 rounded-xl p-4 sm:p-6"
        >
          <h3 className="text-lg font-medium text-white mb-6">Story Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Stories Created This Month</span>
              <span className="text-white font-medium">
                {analytics.storyMetrics.storiesCreatedThisMonth}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Average Words per Story</span>
              <span className="text-white font-medium">
                {analytics.storyMetrics.averageWordsPerStory}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Completion Rate</span>
              <span className="text-white font-medium">
                {analytics.storyMetrics.completionRate}%
              </span>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-400 mb-3">
                Stories by Status
              </h4>
              <div className="space-y-2">
                {analytics.storyMetrics.storiesByStatus.map((status) => (
                  <div
                    key={status.status}
                    className="flex items-center justify-between"
                  >
                    <span className="text-gray-300 capitalize">
                      {status.status}
                    </span>
                    <span className="text-white">{status.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Engagement Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gray-800 rounded-xl p-4 sm:p-6"
      >
        <h3 className="text-lg font-medium text-white mb-6">
          Engagement Metrics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-white mb-1">
              {analytics.engagementMetrics.commentsThisMonth}
            </div>
            <div className="text-gray-400 text-xs sm:text-sm">Comments This Month</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-white mb-1">
              {analytics.engagementMetrics.averageCommentsPerStory}
            </div>
            <div className="text-gray-400 text-xs sm:text-sm">Avg Comments/Story</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-white mb-1">
              {analytics.engagementMetrics.mentorEngagement}%
            </div>
            <div className="text-gray-400 text-xs sm:text-sm">Mentor Engagement</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-white mb-1">
              {analytics.engagementMetrics.responseRate}%
            </div>
            <div className="text-gray-400 text-xs sm:text-sm">Response Rate</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
