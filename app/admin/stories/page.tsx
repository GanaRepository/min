// app/admin/stories/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  MessageSquare,
  User,
  Calendar,
  BarChart3,
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
  childId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  commentCount: number;
  unresolvedComments: number;
  isPublished?: boolean;
  submittedToCompetition?: boolean;
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

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function StoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [stories, setStories] = useState<Story[]>([]);
  const [stats, setStats] = useState<StoryStats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get('status') || 'all'
  );
  const [authorFilter, setAuthorFilter] = useState(
    searchParams.get('author') || ''
  );
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (authorFilter.trim()) {
        params.append('author', authorFilter.trim());
      }

      const response = await fetch(`/api/admin/stories?${params}`);
      const data = await response.json();

      if (data.success) {
        setStories(data.stories);
        setStats(data.stats);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, authorFilter]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchStories();
  }, [session, status, router, fetchStories]);

  const deleteStory = async (storyId: string, title: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/stories/${storyId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setStories(stories.filter((story) => story._id !== storyId));
        alert('Story deleted successfully');
      } else {
        alert('Failed to delete story: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('Failed to delete story');
    }
  };

  const exportStories = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (authorFilter) params.append('author', authorFilter);

      const response = await fetch(`/api/admin/stories/export?${params}`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stories-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting stories:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && stories.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Loading stories...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl  text-white mb-2">
            Stories Management
          </h1>
          <p className="text-gray-400">
            Manage all user stories and their content
          </p>
        </div>
        <button
          onClick={exportStories}
          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2.5  hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center"
        >
          <Download size={20} className="mr-2" />
          Export Stories
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-800  p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm  text-gray-400">
                Total Stories
              </h3>
              <BookOpen size={20} className="text-blue-400" />
            </div>
            <p className="text-2xl  text-white">
              {stats.totalStories}
            </p>
          </div>

          <div className="bg-gray-800  p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm  text-gray-400">Completed</h3>
              <BarChart3 size={20} className="text-green-400" />
            </div>
            <p className="text-2xl  text-white">
              {stats.completedStories}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalStories > 0
                ? Math.round(
                    (stats.completedStories / stats.totalStories) * 100
                  )
                : 0}
              % completion rate
            </p>
          </div>

          <div className="bg-gray-800  p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm  text-gray-400">Active</h3>
              <BookOpen size={20} className="text-blue-400" />
            </div>
            <p className="text-2xl  text-white">
              {stats.activeStories}
            </p>
          </div>

          <div className="bg-gray-800  p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm  text-gray-400">Comments</h3>
              <MessageSquare size={20} className="text-purple-400" />
            </div>
            <p className="text-2xl  text-white">
              {stats.totalComments}
            </p>
            {stats.totalUnresolvedComments > 0 && (
              <p className="text-xs text-red-400 mt-1">
                {stats.totalUnresolvedComments} unresolved
              </p>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-800  p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <div className="flex bg-gray-700  p-1">
              {['all', 'active', 'completed', 'paused'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 text-sm   transition-colors ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status === 'all' ? ' Stories' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Author Filter */}
          <div className="flex-1">
            <div className="relative">
              <User size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Filter by author email..."
                value={authorFilter}
                onChange={(e) => setAuthorFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600  text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stories Table */}
      <div className="bg-gray-800  overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left py-3 px-4 text-sm  text-gray-300">
                  Story
                </th>
                <th className="text-left py-3 px-4 text-sm  text-gray-300">
                  Author
                </th>
                <th className="text-left py-3 px-4 text-sm  text-gray-300">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm  text-gray-300">
                  Progress
                </th>
                <th className="text-left py-3 px-4 text-sm  text-gray-300">
                  Comments
                </th>
                <th className="text-left py-3 px-4 text-sm  text-gray-300">
                  Created
                </th>
                <th className="text-left py-3 px-4 text-sm  text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {stories.map((story) => (
                <tr
                  key={story._id}
                  className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors"
                >
                  {/* Story Title */}
                  <td className="py-3 px-4">
                    <div>
                      <Link href={`/admin/stories/${story._id}`}>
                        <h4 className="text-white  hover:text-blue-400 cursor-pointer">
                          {story.title}
                        </h4>
                      </Link>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-xs text-gray-400">
                          #{story.storyNumber}
                        </p>
                        {story.isPublished && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 ">
                            Published
                          </span>
                        )}
                        {story.submittedToCompetition && (
                          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 ">
                            Competition
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Author */}
                  <td className="py-3 px-4">
                    <div>
                      <Link href={`/admin/users/${story.childId._id}`}>
                        <p className="text-white  hover:text-blue-400 cursor-pointer">
                          {story.childId.firstName} {story.childId.lastName}
                        </p>
                      </Link>
                      <p className="text-xs text-gray-400">
                        {story.childId.email}
                      </p>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 text-xs   ${getStatusColor(story.status)}`}
                    >
                      {story.status}
                    </span>
                  </td>

                  {/* Progress */}
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Words:</span>
                        <span className="text-white">{story.totalWords}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">AI Calls:</span>
                        <span className="text-white">
                          {story.apiCallsUsed}/{story.maxApiCalls}
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="w-full bg-gray-600  h-1">
                        <div
                          className="bg-blue-500 h-1 "
                          style={{
                            width: `${Math.min((story.apiCallsUsed / story.maxApiCalls) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  {/* Comments */}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-white">{story.commentCount}</span>
                      {story.unresolvedComments > 0 && (
                        <span className="px-1 py-0.5 text-xs bg-red-100 text-red-800 ">
                          {story.unresolvedComments} unresolved
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Created */}
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-white text-sm">
                        {new Date(story.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(story.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Link href={`/admin/stories/${story._id}`}>
                        <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700  transition-colors">
                          <Eye size={16} />
                        </button>
                      </Link>
                      <Link href={`/admin/stories/${story._id}/edit`}>
                        <button className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-700  transition-colors">
                          <Edit size={16} />
                        </button>
                      </Link>
                      <button
                        onClick={() => deleteStory(story._id, story.title)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700  transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {stories.length === 0 && !loading && (
          <div className="text-center py-12">
            <BookOpen size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl  text-gray-400 mb-2">
              No stories found
            </h3>
            <p className="text-gray-500">
              {statusFilter !== 'all' || authorFilter
                ? 'Try adjusting your filters'
                : 'Stories will appear here as users create them'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-700 text-white  hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex items-center space-x-2">
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const pageNum =
                Math.max(1, Math.min(pagination.pages - 4, page - 2)) + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-2  transition-colors ${
                    page === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage(Math.min(pagination.pages, page + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 bg-gray-700 text-white  hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Summary */}
      {pagination && (
        <div className="text-center text-gray-400 text-sm">
          Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
          {pagination.total} stories
        </div>
      )}
    </div>
  );
}
