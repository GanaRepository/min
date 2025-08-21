// app/admin/users/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Mail,
  Calendar,
  BookOpen,
  Target,
  Trophy,
  DollarSign,
  Star,
  Activity,
} from 'lucide-react';
import { motion } from 'framer-motion';
import TerminalLoader from '@/components/TerminalLoader';

interface UserDetails {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
  lastActiveDate?: string;
  isActive: boolean;
  isVerified: boolean;
  storiesCreatedThisMonth: number;
  assessmentUploadsThisMonth: number;
  competitionEntriesThisMonth: number;
  totalStoriesCreated: number;
  totalWordsWritten: number;
  purchaseHistory: Array<{
    type: string;
    amount: number;
    purchaseDate: string;
    metadata?: any;
  }>;
  assignedMentor?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  recentStories: Array<{
    _id: string;
    title: string;
    status: string;
    createdAt: string;
    totalWords: number;
  }>;
}

export default function ViewUser() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchUser();
  }, [session, status, router, userId]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
      } else {
        router.push('/admin/users');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      router.push('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async () => {
    if (
      !confirm(
        `Are you sure you want to delete ${user?.firstName} ${user?.lastName}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('User deleted successfully');
        router.push('/admin/users');
      } else {
        alert('Failed to delete user: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-green-900 flex items-center justify-center">
        <TerminalLoader
          title="User Edit Details"
          loadingText="Loading user details..."
          size="lg"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-green-900 flex items-center justify-center">
        <TerminalLoader
          title="User Details"
          loadingText="User details Not Found..."
          size="lg"
        />
      </div>
    );
  }

  const totalRevenue = user.purchaseHistory.reduce(
    (sum, purchase) => sum + purchase.amount,
    0
  );

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/users">
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700  transition-colors">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl  text-white">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-gray-400">User Details & Activity</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link href={`/admin/users/${userId}/edit`}>
            <button className="bg-blue-600 text-white px-4 py-2  hover:bg-blue-700 transition-colors flex items-center">
              <Edit size={16} className="mr-2" />
              Edit
            </button>
          </Link>
          {user.role !== 'admin' && (
            <button
              onClick={deleteUser}
              disabled={deleting}
              className="bg-red-600 text-white px-4 py-2  hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
            >
              <Trash2 size={16} className="mr-2" />
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>
      </div>

      {/* User Info Card */}
      <div className="bg-gray-800  p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-3 ">
              <User size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Role</p>
              <p className="text-white  capitalize">{user.role}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-green-600 p-3 ">
              <Mail size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p className="text-white ">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-purple-600 p-3 ">
              <Calendar size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Joined</p>
              <p className="text-white ">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div
              className={`${user.isActive ? 'bg-green-600' : 'bg-red-600'} p-3 `}
            >
              <Activity size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Status</p>
              <p className="text-white ">
                {user.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Child Only */}
      {user.role === 'child' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Monthly Usage */}
          <div className="bg-gray-800  p-6">
            <h3 className="text-lg  text-white mb-4">Monthly Usage</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Stories:</span>
                <span className="text-blue-400 ">
                  {user.storiesCreatedThisMonth}/3
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Assessments:</span>
                <span className="text-green-400 ">
                  {user.assessmentUploadsThisMonth}/3
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Competitions:</span>
                <span className="text-yellow-400 ">
                  {user.competitionEntriesThisMonth}/3
                </span>
              </div>
            </div>
          </div>

          {/* Total Stats */}
          <div className="bg-gray-800  p-6">
            <h3 className="text-lg  text-white mb-4">Total Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BookOpen size={16} className="text-blue-400 mr-2" />
                  <span className="text-gray-400">Stories:</span>
                </div>
                <span className="text-white ">{user.totalStoriesCreated}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Target size={16} className="text-green-400 mr-2" />
                  <span className="text-gray-400">Words:</span>
                </div>
                <span className="text-white ">
                  {user.totalWordsWritten.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Revenue Generated */}
          {totalRevenue > 0 && (
            <div className="bg-gray-800  p-6">
              <h3 className="text-lg  text-white mb-4">Revenue Generated</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign size={16} className="text-emerald-400 mr-2" />
                    <span className="text-gray-400">Total:</span>
                  </div>
                  <span className="text-emerald-400  text-xl">
                    ${totalRevenue.toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {user.purchaseHistory.length} purchase
                  {user.purchaseHistory.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          )}

          {/* Assigned Mentor */}
          {user.assignedMentor && (
            <div className="bg-gray-800  p-6">
              <h3 className="text-lg  text-white mb-4">Assigned Mentor</h3>
              <div className="flex items-center space-x-3">
                <div className="bg-purple-600 p-2 ">
                  <Star size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white ">
                    {user.assignedMentor.firstName}{' '}
                    {user.assignedMentor.lastName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {user.assignedMentor.email}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Purchase History */}
      {user.role === 'child' && user.purchaseHistory.length > 0 && (
        <div className="bg-gray-800  p-6">
          <h3 className="text-lg  text-white mb-4">Purchase History</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 text-sm  text-gray-300">
                    Type
                  </th>
                  <th className="text-left py-2 text-sm  text-gray-300">
                    Amount
                  </th>
                  <th className="text-left py-2 text-sm  text-gray-300">
                    Date
                  </th>
                  <th className="text-left py-2 text-sm  text-gray-300">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {user.purchaseHistory.map((purchase, index) => (
                  <tr key={index} className="border-b border-gray-700/50">
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 text-xs  ${
                          purchase.type === 'story_pack'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {purchase.type === 'story_pack'
                          ? 'Story Pack'
                          : 'Publication'}
                      </span>
                    </td>
                    <td className="py-3 text-emerald-400 ">
                      ${purchase.amount.toFixed(2)}
                    </td>
                    <td className="py-3 text-gray-300">
                      {new Date(purchase.purchaseDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-xs text-gray-400">
                      {purchase.type === 'story_pack' && purchase.metadata && (
                        <span>
                          +{purchase.metadata.storiesAdded} stories, +
                          {purchase.metadata.assessmentsAdded} assessments
                        </span>
                      )}
                      {purchase.type === 'story_publication' &&
                        purchase.metadata?.storyTitle && (
                          <span>"{purchase.metadata.storyTitle}"</span>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Stories */}
      {user.role === 'child' &&
        user.recentStories &&
        user.recentStories.length > 0 && (
          <div className="bg-gray-800  p-6">
            <h3 className="text-lg  text-white mb-4">Recent Stories</h3>
            <div className="space-y-3">
              {user.recentStories.slice(0, 5).map((story) => (
                <div
                  key={story._id}
                  className="flex items-center justify-between p-3 bg-gray-700/50 "
                >
                  <div className="flex-1">
                    <Link href={`/admin/stories/${story._id}`}>
                      <h4 className="text-white  hover:text-blue-400 cursor-pointer">
                        {story.title}
                      </h4>
                    </Link>
                    <p className="text-xs text-gray-400 mt-1">
                      {story.totalWords} words •{' '}
                      {new Date(story.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs  ${
                      story.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : story.status === 'active'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {story.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
