//app/admin/analytics/users/page.tsx
// app/admin/analytics/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Calendar,
  Award,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface UserAnalytics {
  registrationTrends: Array<{
    _id: { year: number; month: number };
    count: number;
    children: number;
    mentors: number;
  }>;
  activityAnalysis: {
    totalUsers: number;
    activeUsers: number;
    highUsageUsers: number;
    paidUsers: number;
  };
  topUsers: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    totalStoriesCreated: number;
    totalWordsWritten: number;
    createdAt: string;
  }>;
}

export default function UserAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchUserAnalytics();
  }, [session, status, router]);

  const fetchUserAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics/users');
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.userAnalytics);
      }
    } catch (error) {
      console.error('Error fetching user analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Loading user analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Failed to load user analytics</div>
      </div>
    );
  }

  const getMonthName = (month: number) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[month - 1];
  };

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/admin/analytics">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            User Analytics
          </h1>
          <p className="text-gray-400">Detailed user behavior and growth analysis</p>
        </div>
      </div>

      {/* Activity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Total Users</h3>
            <Users size={20} className="text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {analytics.activityAnalysis.totalUsers?.toLocaleString() || 0}
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Active Users</h3>
            <TrendingUp size={20} className="text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {analytics.activityAnalysis.activeUsers?.toLocaleString() || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {analytics.activityAnalysis.totalUsers > 0 
              ? Math.round((analytics.activityAnalysis.activeUsers / analytics.activityAnalysis.totalUsers) * 100)
              : 0}% of total
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">High Usage</h3>
            <Award size={20} className="text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {analytics.activityAnalysis.highUsageUsers?.toLocaleString() || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">10+ stories</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Paid Users</h3>
            <Users size={20} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {analytics.activityAnalysis.paidUsers?.toLocaleString() || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {analytics.activityAnalysis.totalUsers > 0 
              ? Math.round((analytics.activityAnalysis.paidUsers / analytics.activityAnalysis.totalUsers) * 100)
              : 0}% conversion
          </p>
        </div>
      </div>

      {/* Registration Trends */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Calendar size={20} className="mr-2" />
          Registration Trends (Last 12 Months)
        </h3>
        
        {analytics.registrationTrends.length > 0 ? (
          <div className="space-y-3">
            {analytics.registrationTrends.slice(-6).map((trend, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-white font-medium">
                    {getMonthName(trend._id.month)} {trend._id.year}
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="text-blue-400">
                    {trend.children} children
                  </div>
                  <div className="text-purple-400">
                    {trend.mentors} mentors
                  </div>
                  <div className="text-white font-medium">
                    {trend.count} total
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No registration data available</p>
          </div>
        )}
      </div>

      {/* Top Users */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Award size={20} className="mr-2" />
          Top Users by Engagement
        </h3>
        
        {analytics.topUsers.length > 0 ? (
          <div className="space-y-3">
            {analytics.topUsers.map((user, index) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    #{index + 1}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">
                      {user.firstName} {user.lastName}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">
                    {user.totalStoriesCreated} stories
                  </div>
                  <div className="text-gray-400 text-sm">
                    {user.totalWordsWritten.toLocaleString()} words
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Award size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No user data available</p>
          </div>
        )}
      </div>
    </div>
  );
}