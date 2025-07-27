'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  MessageSquare,
  User,
  Calendar,
  Filter,
  Search,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Pause,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Story {
  _id: string;
  title: string;
  status: 'active' | 'completed' | 'paused';
  storyNumber: number;
  totalWords: number;
  childWords: number;
  apiCallsUsed: number;
  maxApiCalls: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  child: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    subscriptionTier?: string;
  };
  commentCount: number;
  unresolvedComments: number;
  hasAdminComments: boolean;
  hasMentorComments: boolean;
  recentCommentDate?: string;
}

interface StoryStats {
  totalStories: number;
  completedStories: number;
  activeStories: number;
  pausedStories: number;
  storiesWithComments: number;
  storiesWithUnresolvedComments: number;
  totalComments: number;
  totalUnresolvedComments: number;
}

export default function StoriesManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [stories, setStories] = useState<Story[]>([]);
  const [stats, setStats] = useState<StoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get('status') || 'all'
  );
  const [roleFilter, setRoleFilter] = useState(
    searchParams.get('role') || 'all'
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get('sortBy') || 'updatedAt'
  );
  const [sortOrder, setSortOrder] = useState(
    searchParams.get('sortOrder') || 'desc'
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchStories = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(roleFilter !== 'all' && { role: roleFilter }),
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/admin/stories?${params}`);
      const data = await response.json();

      if (data.success) {
        setStories(data.stories);
        setStats(data.stats);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, roleFilter, sortBy, sortOrder, currentPage]);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }

    fetchStories();
  }, [session, status, router, fetchStories]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'active':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
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

  const filteredStories = stories.filter(
    (story) =>
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${story.child.firstName} ${story.child.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      story.child.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Loading stories...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Stories Management
          </h1>
          <p className="text-gray-400">
            Monitor and manage all stories in the platform
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/admin/stories/create">
            <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200">
              Create Story
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Stories</p>
                <p className="text-2xl font-bold text-white">
                  {stats.totalStories}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Stories</p>
                <p className="text-2xl font-bold text-white">
                  {stats.activeStories}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-2xl font-bold text-white">
                  {stats.completedStories}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Need Attention</p>
                <p className="text-2xl font-bold text-white">
                  {stats.storiesWithUnresolvedComments}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search stories, authors, or emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Users</option>
            <option value="child">Children</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}_${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('_');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="updatedAt_desc">Recently Updated</option>
            <option value="createdAt_desc">Recently Created</option>
            <option value="title_asc">Title A-Z</option>
            <option value="childName_asc">Author A-Z</option>
            <option value="totalWords_desc">Most Words</option>
          </select>
        </div>
      </div>

      {/* Stories Table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="text-left p-4 text-gray-300 font-medium">
                  Story
                </th>
                <th className="text-left p-4 text-gray-300 font-medium">
                  Author
                </th>
                <th className="text-left p-4 text-gray-300 font-medium">
                  Status
                </th>
                <th className="text-left p-4 text-gray-300 font-medium">
                  Progress
                </th>
                <th className="text-left p-4 text-gray-300 font-medium">
                  Comments
                </th>
                <th className="text-left p-4 text-gray-300 font-medium">
                  Updated
                </th>
                <th className="text-left p-4 text-gray-300 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {filteredStories.map((story, index) => (
                <motion.tr
                  key={story._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-700/30 transition-colors"
                >
                  <td className="p-4">
                    <div>
                      <h3 className="text-white font-medium">{story.title}</h3>
                      <p className="text-gray-400 text-sm">
                        Story #{story.storyNumber}
                      </p>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {story.child.firstName[0]}
                          {story.child.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-white text-sm">
                          {story.child.firstName} {story.child.lastName}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {story.child.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(story.status)}`}
                    >
                      {getStatusIcon(story.status)}
                      <span className="capitalize">{story.status}</span>
                    </span>
                  </td>

                  <td className="p-4">
                    <div>
                      <p className="text-white text-sm">
                        {story.totalWords} words
                      </p>
                      <p className="text-gray-400 text-xs">
                        API: {story.apiCallsUsed}/{story.maxApiCalls}
                      </p>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span className="text-white text-sm">
                        {story.commentCount}
                      </span>
                      {story.unresolvedComments > 0 && (
                        <span className="bg-red-500/20 text-red-300 text-xs px-2 py-1 rounded-full">
                          {story.unresolvedComments} unresolved
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-4">
                    <p className="text-gray-400 text-sm">
                      {new Date(story.updatedAt).toLocaleDateString()}
                    </p>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Link href={`/admin/stories/${story._id}`}>
                        <button className="text-blue-400 hover:text-blue-300 p-1">
                          <Eye className="w-4 h-4" />
                        </button>
                      </Link>
                      <Link href={`/admin/stories/${story._id}/comments`}>
                        <button className="text-green-400 hover:text-green-300 p-1">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </Link>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-700/30 px-6 py-4 flex items-center justify-between">
            <div className="text-gray-400 text-sm">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {filteredStories.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-400 mb-2">
            No stories found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
}
