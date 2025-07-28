'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  CreditCard,
  Users,
  Search,
  Crown,
  Star,
  Zap,
  TrendingUp,
  Calendar,
  Eye,
  Edit,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SubscriptionUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  subscriptionTier: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  totalStories: number;
  apiCallsUsed: number;
  createdAt: string;
}

interface SubscriptionStats {
  total: number;
  free: number;
  basic: number;
  premium: number;
  revenue: {
    monthly: number;
    total: number;
  };
}

export default function SubscriptionManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [users, setUsers] = useState<SubscriptionUser[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all');

  const fetchData = useCallback(async () => {
    try {
      const [usersResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/subscriptions/users'),
        fetch('/api/admin/subscriptions/stats'),
      ]);

      const usersData = await usersResponse.json();
      const statsData = await statsResponse.json();

      if (usersData.success) {
        setUsers(usersData.users);
      }

      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch subscription data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }

    fetchData();
  }, [session, status, router, fetchData]);

  const updateSubscription = async (userId: string, newTier: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionTier: newTier }),
      });

      const data = await response.json();

      if (data.success) {
        setUsers((prev) =>
          prev.map((user) =>
            user._id === userId ? { ...user, subscriptionTier: newTier } : user
          )
        );
        toast({
          title: 'Success',
          description: 'Subscription updated successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update subscription',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update subscription',
        variant: 'destructive',
      });
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'premium':
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 'basic':
        return <Star className="w-5 h-5 text-blue-400" />;
      default:
        return <Zap className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'premium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'basic':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTier =
      tierFilter === 'all' ||
      (user.subscriptionTier || 'free').toLowerCase() ===
        tierFilter.toLowerCase();

    return matchesSearch && matchesTier;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">
          Loading subscription data...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Subscription Management
          </h1>
          <p className="text-gray-400">Monitor and manage user subscriptions</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Free Users</p>
                <p className="text-2xl font-bold text-white">{stats.free}</p>
              </div>
              <Zap className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Basic Users</p>
                <p className="text-2xl font-bold text-white">{stats.basic}</p>
              </div>
              <Star className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Premium Users</p>
                <p className="text-2xl font-bold text-white">{stats.premium}</p>
              </div>
              <Crown className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Monthly Revenue</p>
                <p className="text-2xl font-bold text-white">
                  ${stats.revenue.monthly}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Tiers</option>
            <option value="free">Free</option>
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="text-left p-4 text-gray-300 font-medium">
                  User
                </th>
                <th className="text-left p-4 text-gray-300 font-medium">
                  Subscription
                </th>
                <th className="text-left p-4 text-gray-300 font-medium">
                  Usage
                </th>
                <th className="text-left p-4 text-gray-300 font-medium">
                  Duration
                </th>
                <th className="text-left p-4 text-gray-300 font-medium">
                  Joined
                </th>
                <th className="text-left p-4 text-gray-300 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-700/30 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-medium">
                          {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {getTierIcon(user.subscriptionTier || 'free')}
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs border ${getTierColor(user.subscriptionTier || 'free')}`}
                      >
                        {(user.subscriptionTier || 'free').toUpperCase()}
                      </span>
                    </div>
                  </td>

                  <td className="p-4">
                    <div>
                      <p className="text-white text-sm">
                        {user.totalStories} stories
                      </p>
                      <p className="text-gray-400 text-xs">
                        {user.apiCallsUsed} API calls used
                      </p>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="text-sm">
                      {user.subscriptionStartDate ? (
                        <>
                          <p className="text-white">
                            Since:{' '}
                            {new Date(
                              user.subscriptionStartDate
                            ).toLocaleDateString()}
                          </p>
                          {user.subscriptionEndDate && (
                            <p className="text-gray-400">
                              Until:{' '}
                              {new Date(
                                user.subscriptionEndDate
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-400">No subscription</p>
                      )}
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center space-x-1 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <select
                        value={user.subscriptionTier || 'free'}
                        onChange={(e) =>
                          updateSubscription(user._id, e.target.value)
                        }
                        className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="free">Free</option>
                        <option value="basic">Basic</option>
                        <option value="premium">Premium</option>
                      </select>

                      <button
                        onClick={() => router.push(`/admin/users/${user._id}`)}
                        className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-gray-700"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && !loading && (
        <div className="text-center py-12">
          <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-400 mb-2">
            No users found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
}
