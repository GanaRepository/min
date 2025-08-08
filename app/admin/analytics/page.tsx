// app/admin/analytics/page.tsx
'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Users,
  BookOpen,
  MessageSquare,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalyticsData {
  users: {
    total: number;
    thisMonth: number;
    active: number;
    verified: number;
    growth: number;
  };
  stories: {
    total: number;
    thisMonth: number;
    completed: number;
    published: number;
    growth: number;
  };
  comments: {
    total: number;
    thisMonth: number;
    unresolved: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    growth: number;
  };
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchAnalytics();
  }, [session, status, router]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics');
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics/export?timeRange=30');
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting analytics:', error);
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
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Failed to load analytics</div>
      </div>
    );
  }

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? TrendingUp : TrendingDown;
  };

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Platform Analytics
          </h1>
          <p className="text-gray-400">
            Comprehensive insights into your platform performance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportAnalytics}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Download size={16} className="mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Users size={24} className="text-white" />
            </div>
            <div className="flex items-center">
              {React.createElement(getGrowthIcon(analytics.users.growth), {
                size: 20,
                className: getGrowthColor(analytics.users.growth)
              })}
              <span className={`ml-1 font-medium ${getGrowthColor(analytics.users.growth)}`}>
                {analytics.users.growth >= 0 ? '+' : ''}{analytics.users.growth.toFixed(1)}%
              </span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">
            {analytics.users.total.toLocaleString()}
          </h3>
          <p className="text-gray-400 text-sm">Total Users</p>
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">This Month:</span>
              <span className="text-white font-medium">{analytics.users.thisMonth}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-400">Active:</span>
              <span className="text-white font-medium">{analytics.users.active}</span>
            </div>
          </div>
        </motion.div>

        {/* Stories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-600 p-3 rounded-lg">
              <BookOpen size={24} className="text-white" />
            </div>
            <div className="flex items-center">
              {React.createElement(getGrowthIcon(analytics.stories.growth), {
                size: 20,
                className: getGrowthColor(analytics.stories.growth)
              })}
              <span className={`ml-1 font-medium ${getGrowthColor(analytics.stories.growth)}`}>
                {analytics.stories.growth >= 0 ? '+' : ''}{analytics.stories.growth.toFixed(1)}%
              </span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">
            {analytics.stories.total.toLocaleString()}
          </h3>
          <p className="text-gray-400 text-sm">Total Stories</p>
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">This Month:</span>
              <span className="text-white font-medium">{analytics.stories.thisMonth}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-400">Completed:</span>
              <span className="text-white font-medium">{analytics.stories.completed}</span>
            </div>
          </div>
        </motion.div>

        {/* Comments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-600 p-3 rounded-lg">
              <MessageSquare size={24} className="text-white" />
            </div>
            <div className="flex items-center">
              <span className="text-gray-400 text-sm">Engagement</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">
            {analytics.comments.total.toLocaleString()}
          </h3>
          <p className="text-gray-400 text-sm">Total Comments</p>
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">This Month:</span>
              <span className="text-white font-medium">{analytics.comments.thisMonth}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-400">Unresolved:</span>
              <span className="text-red-400 font-medium">{analytics.comments.unresolved}</span>
            </div>
          </div>
        </motion.div>

        {/* Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-600 p-3 rounded-lg">
              <DollarSign size={24} className="text-white" />
            </div>
            <div className="flex items-center">
              {React.createElement(getGrowthIcon(analytics.revenue.growth), {
                size: 20,
                className: getGrowthColor(analytics.revenue.growth)
              })}
              <span className={`ml-1 font-medium ${getGrowthColor(analytics.revenue.growth)}`}>
                {analytics.revenue.growth >= 0 ? '+' : ''}{analytics.revenue.growth.toFixed(1)}%
              </span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">
            ${analytics.revenue.total.toLocaleString()}
          </h3>
          <p className="text-gray-400 text-sm">Total Revenue</p>
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">This Month:</span>
              <span className="text-emerald-400 font-medium">
                ${analytics.revenue.thisMonth.toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Detailed Analytics</h3>
          <div className="space-y-3">
            <button 
              onClick={() => router.push('/admin/analytics/users')}
              className="w-full text-left p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">User Analytics</span>
                <Users size={16} className="text-blue-400" />
              </div>
              <p className="text-gray-400 text-sm mt-1">Registration trends, activity patterns</p>
            </button>
            
            <button 
              onClick={() => router.push('/admin/analytics/stories')}
              className="w-full text-left p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Story Analytics</span>
                <BookOpen size={16} className="text-green-400" />
              </div>
              <p className="text-gray-400 text-sm mt-1">Creation trends, popular elements</p>
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Platform Health</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-400">User Verification Rate</span>
              <span className="text-white font-medium">
                {analytics.users.total > 0 
                  ? Math.round((analytics.users.verified / analytics.users.total) * 100)
                  : 0}%
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-400">Story Completion Rate</span>
              <span className="text-white font-medium">
                {analytics.stories.total > 0 
                  ? Math.round((analytics.stories.completed / analytics.stories.total) * 100)
                  : 0}%
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-400">Comment Resolution Rate</span>
              <span className="text-white font-medium">
                {analytics.comments.total > 0 
                  ? Math.round(((analytics.comments.total - analytics.comments.unresolved) / analytics.comments.total) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => router.push('/admin/revenue')}
              className="w-full bg-emerald-600 text-white p-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              View Revenue Details
            </button>
            
            <button 
              onClick={() => router.push('/admin/comments?resolved=false')}
              className="w-full bg-orange-600 text-white p-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Review Unresolved Comments
            </button>
            
            <button 
              onClick={exportAnalytics}
              className="w-full bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center"
            >
              <Download size={16} className="mr-2" />
              Export Full Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}