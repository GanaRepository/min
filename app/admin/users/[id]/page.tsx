'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  BookOpen,
  MessageSquare,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface UserDetails {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isVerified: boolean;
  subscriptionTier: string;
  createdAt: string;
  lastLoginAt?: string;
  totalStories: number;
  completedStories: number;
  activeStories: number;
  totalComments: number;
  stories: Array<{
    _id: string;
    title: string;
    status: string;
    createdAt: string;
    totalWords: number;
  }>;
}

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }

    fetchUserDetails();
  }, [session, status, router, params.id]);

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`/api/admin/users/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to fetch user details',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch user details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (isVerified: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified }),
      });

      const data = await response.json();

      if (data.success) {
        setUser((prev) => (prev ? { ...prev, isVerified } : null));
        toast({
          title: 'Success',
          description: `User ${isVerified ? 'verified' : 'unverified'} successfully`,
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update user status',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'mentor':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'child':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'active':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'paused':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Loading user details...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-400 mb-2">
          User not found
        </h3>
        <p className="text-gray-500">
          The user you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/admin/users">
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Back to Users
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/admin/users">
          <button className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">User Details</h1>
          <p className="text-gray-400">
            Manage user information and activities
          </p>
        </div>
      </div>

      {/* User Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-xl p-6"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {user.firstName[0]}
                {user.lastName[0]}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-400">{user.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs border ${getRoleBadgeColor(user.role)}`}
                >
                  {user.role}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs border ${user.isVerified ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}
                >
                  {user.isVerified ? 'Verified' : 'Unverified'}
                </span>
                <span className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {user.subscriptionTier || 'Free'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            {user.role === 'child' && (
              <Link href={`/admin/users/${user._id}/assign-mentor`}>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                  <UserPlus className="w-4 h-4" />
                  <span>Assign Mentor</span>
                </button>
              </Link>
            )}

            <button
              onClick={() => updateUserStatus(!user.isVerified)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                user.isVerified
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {user.isVerified ? (
                <XCircle className="w-4 h-4" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>{user.isVerified ? 'Unverify' : 'Verify'}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Stories</p>
              <p className="text-2xl font-bold text-white">
                {user.totalStories}
              </p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-white">
                {user.completedStories}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Stories</p>
              <p className="text-2xl font-bold text-white">
                {user.activeStories}
              </p>
            </div>
            <Edit className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Comments</p>
              <p className="text-2xl font-bold text-white">
                {user.totalComments}
              </p>
            </div>
            <MessageSquare className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* User Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <h3 className="text-lg font-medium text-white mb-4">
            Account Information
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-white">{user.email}</p>
                <p className="text-gray-400 text-sm">Email Address</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-white">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
                <p className="text-gray-400 text-sm">Member Since</p>
              </div>
            </div>
            {user.lastLoginAt && (
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-white">
                    {new Date(user.lastLoginAt).toLocaleDateString()}
                  </p>
                  <p className="text-gray-400 text-sm">Last Login</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Stories section - Fix the View All link */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
  className="bg-gray-800 rounded-xl p-6"
>
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-medium text-white">Recent Stories</h3>
    {/* FIX: Add the user ID as a query parameter */}
    <Link href={`/admin/stories?author=${user._id}`}>
      <button className="text-blue-400 hover:text-blue-300 text-sm">View All</button>
    </Link>
  </div>
  <div className="space-y-3">
    {user.stories.slice(0, 5).map((story) => (
      <div key={story._id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
        <div>
          <p className="text-white text-sm font-medium">{story.title}</p>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(story.status)}`}>
              {story.status}
            </span>
            <span className="text-gray-400 text-xs">{story.totalWords} words</span>
          </div>
        </div>
        <Link href={`/admin/stories/${story._id}`}>
          <button className="text-blue-400 hover:text-blue-300 p-1">
            <BookOpen className="w-4 h-4" />
          </button>
        </Link>
      </div>
    ))}
    {user.stories.length === 0 && (
      <p className="text-gray-400 text-sm text-center py-4">No stories created yet</p>
    )}
  </div>
</motion.div>
      </div>
    </div>
  );
}
