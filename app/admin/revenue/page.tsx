// app/admin/revenue/page.tsx (Fixed)
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  FileText,
  Calendar,
} from 'lucide-react';
import { motion } from 'framer-motion';
import TerminalLoader from '@/components/TerminalLoader';

interface RevenueData {
  totalRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  storyPacksSold: number;
  publicationsSold: number;
  growth: number;
  topPayingUsers: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    totalSpent: number;
    purchaseCount: number;
  }>;
}

export default function RevenuePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchRevenueData();
  }, [session, status, router]);

  const fetchRevenueData = async () => {
    try {
      const response = await fetch('/api/admin/revenue');
      const data = await response.json();

      if (data.success) {
        setRevenueData(data.revenue);
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-green-900 flex items-center justify-center">
        <TerminalLoader
          title="Revenue"
          loadingText="   Loading revenue data..."
          size="lg"
        />
      </div>
    );
  }

  if (!revenueData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-green-900 flex items-center justify-center">
        <TerminalLoader
          title="Revenue"
          loadingText="Failed to load revenue data"
          size="lg"
        />
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
      <div>
        <h1 className="text-2xl sm:text-3xl  text-white mb-2">
          Revenue Dashboard
        </h1>
        <p className="text-gray-400">
          Monitor income streams and customer spending patterns
        </p>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800  p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-600 p-3 ">
              <DollarSign size={24} className="text-white" />
            </div>
            <div className="flex items-center">
              {React.createElement(getGrowthIcon(revenueData.growth), {
                size: 20,
                className: getGrowthColor(revenueData.growth),
              })}
              <span className={`ml-1  ${getGrowthColor(revenueData.growth)}`}>
                {revenueData.growth >= 0 ? '+' : ''}
                {revenueData.growth.toFixed(1)}%
              </span>
            </div>
          </div>
          <h3 className="text-2xl  text-white mb-1">
            ${revenueData.totalRevenue.toLocaleString()}
          </h3>
          <p className="text-gray-400 text-sm">Total Revenue</p>
        </motion.div>

        {/* This Month Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800  p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-600 p-3 ">
              <Calendar size={24} className="text-white" />
            </div>
          </div>
          <h3 className="text-2xl  text-white mb-1">
            ${revenueData.thisMonthRevenue.toLocaleString()}
          </h3>
          <p className="text-gray-400 text-sm">This Month</p>
          <div className="mt-2 text-xs text-gray-500">
            Last month: ${revenueData.lastMonthRevenue.toLocaleString()}
          </div>
        </motion.div>

        {/* Story Packs Sold */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800  p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-600 p-3 ">
              <CreditCard size={24} className="text-white" />
            </div>
          </div>
          <h3 className="text-2xl  text-white mb-1">
            {revenueData.storyPacksSold}
          </h3>
          <p className="text-gray-400 text-sm">Story Packs Sold</p>
        </motion.div>

        {/* Publications Sold */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800  p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-600 p-3 ">
              <FileText size={24} className="text-white" />
            </div>
          </div>
          <h3 className="text-2xl  text-white mb-1">
            {revenueData.publicationsSold}
          </h3>
          <p className="text-gray-400 text-sm">Publications Sold</p>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800  p-6">
          <h3 className="text-lg  text-white mb-4">Revenue Management</h3>
          <div className="space-y-3">
            <Link href="/admin/revenue/transactions">
              <button className="w-full text-left p-3 bg-gray-700/50  hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-white ">Transaction History</span>
                  <FileText size={16} className="text-blue-400" />
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  View all customer transactions
                </p>
              </button>
            </Link>

            <Link href="/admin/revenue/refunds">
              <button className="w-full text-left p-3 bg-gray-700/50  hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-white ">Refund Management</span>
                  <CreditCard size={16} className="text-orange-400" />
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  Process refund requests
                </p>
              </button>
            </Link>
          </div>
        </div>

        <div className="bg-gray-800  p-6">
          <h3 className="text-lg  text-white mb-4">Revenue Analytics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-700/50 ">
              <span className="text-gray-400">Average Order Value</span>
              <span className="text-white ">
                $
                {revenueData.totalRevenue > 0 &&
                revenueData.storyPacksSold + revenueData.publicationsSold > 0
                  ? (
                      revenueData.totalRevenue /
                      (revenueData.storyPacksSold +
                        revenueData.publicationsSold)
                    ).toFixed(2)
                  : '0.00'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-700/50 ">
              <span className="text-gray-400">Revenue Growth</span>
              <span className={` ${getGrowthColor(revenueData.growth)}`}>
                {revenueData.growth >= 0 ? '+' : ''}
                {revenueData.growth.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800  p-6">
          <h3 className="text-lg  text-white mb-4">Top Paying Users</h3>
          <div className="space-y-3">
            {revenueData.topPayingUsers.slice(0, 3).map((user, index) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-3 bg-gray-700/50 "
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-600  flex items-center justify-center text-white  text-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="text-white  text-sm">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {user.purchaseCount} purchases
                    </p>
                  </div>
                </div>
                <div className="text-emerald-400 ">
                  ${user.totalSpent.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {revenueData.topPayingUsers.length > 3 && (
            <Link href="/admin/users?sort=revenue">
              <button className="w-full mt-3 text-center py-2 text-blue-400 hover:text-blue-300 text-sm">
                View All Top Users
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
