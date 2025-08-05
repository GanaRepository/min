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
  Search,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Pause,
  FileText,
} from 'lucide-react';
import { motion } from 'framer-motion';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';

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

export default function AdminStories() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [stories, setStories] = useState<Story[]>([]);
  const [stats, setStats] = useState<StoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [authorFilter, setAuthorFilter] = useState(searchParams.get('author') || '');
  const [authorName, setAuthorName] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchStories = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(authorFilter && { author: authorFilter }),
        page: page.toString(),
        limit: limit.toString(),
      });
      const response = await fetch(`/api/admin/stories?${params}`);
      const data = await response.json();
      if (data.success) {
        setStories(data.stories);
        if (data.stats) {
          setStats(data.stats);
        }
        if (authorFilter && data.stories.length > 0) {
          const firstStory = data.stories[0];
          setAuthorName(`${firstStory.child.firstName} ${firstStory.child.lastName}`);
        }
        setTotalPages(data.pagination.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, authorFilter, page]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchStories();
  }, [session, status, router, fetchStories]);

  const clearAuthorFilter = () => {
    setAuthorFilter('');
    setAuthorName('');
    router.push('/admin/stories');
  };

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

  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'premium':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'basic':
        return 'bg-blue-500/20 text-blue-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
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
    <div className="space-y-6 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Stories Management</h1>
          <p className="text-gray-400">
            {authorFilter 
              ? `Stories by ${authorName || 'Selected User'}` 
              : 'Monitor all stories in the platform'}
          </p>
        </div>
        {authorFilter && (
          <button
            onClick={clearAuthorFilter}
            className="mt-4 sm:mt-0 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Clear Filter</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      {stats && !authorFilter && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Stories</p>
                <p className="text-2xl font-bold text-white">{stats.totalStories}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Stories</p>
                <p className="text-2xl font-bold text-white">{stats.activeStories}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-2xl font-bold text-white">{stats.completedStories}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Need Attention</p>
                <p className="text-2xl font-bold text-white">{stats.storiesWithUnresolvedComments}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
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
        </div>
      </div>

      {/* Stories Table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="text-left p-4 text-gray-300 font-medium">Story</th>
                <th className="text-left p-4 text-gray-300 font-medium">Author</th>
                <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                <th className="text-left p-4 text-gray-300 font-medium">Progress</th>
                <th className="text-left p-4 text-gray-300 font-medium">Comments</th>
                <th className="text-left p-4 text-gray-300 font-medium">Created</th>
                <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
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
                      <p className="text-gray-400 text-sm">Story #{story.storyNumber}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {story.child && story.child.firstName ? story.child.firstName[0] : ''}
                          {story.child && story.child.lastName ? story.child.lastName[0] : ''}
                        </span>
                      </div>
                      <div>
                        <p className="text-white text-sm">
                          {story.child && story.child.firstName ? story.child.firstName : ''} {story.child && story.child.lastName ? story.child.lastName : ''}
                        </p>
                        <div className="flex items-center space-x-2">
                          <p className="text-gray-400 text-xs">{story.child && story.child.email ? story.child.email : ''}</p>
                          {story.child && story.child.subscriptionTier && story.child.subscriptionTier !== 'FREE' && (
                            <span className={`px-1 py-0.5 rounded text-xs ${getTierColor(story.child.subscriptionTier)}`}>
                              {story.child.subscriptionTier}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(story.status)}`}>
                      {getStatusIcon(story.status)}
                      <span className="capitalize">{story.status}</span>
                    </span>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="text-white text-sm">{story.totalWords} words</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-16 bg-gray-700 rounded-full h-1">
                          <div
                            className="bg-gradient-to-r from-blue-400 to-blue-500 h-1 rounded-full"
                            style={{
                              width: `${Math.min((story.apiCallsUsed / story.maxApiCalls) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-gray-400 text-xs">
                          {story.apiCallsUsed}/{story.maxApiCalls}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span className="text-white text-sm">{story.commentCount}</span>
                      {story.unresolvedComments > 0 && (
                        <span className="bg-red-500/20 text-red-300 text-xs px-2 py-1 rounded-full border border-red-500/30">
                          {story.unresolvedComments} unresolved
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-1 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {new Date(story.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Link href={`/admin/stories/${story._id}`}>
                        <button className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-gray-700 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </Link>
                      <Link href={`/admin/users/${story.child && story.child._id ? story.child._id : ''}`}>
                        <button className="text-green-400 hover:text-green-300 p-2 rounded-lg hover:bg-gray-700 transition-colors">
                          <FileText className="w-4 h-4" />
                        </button>
                      </Link>
                      {story.unresolvedComments > 0 && (
                        <Link href={`/admin/stories/${story._id}#comments`}>
                          <button className="text-orange-400 hover:text-orange-300 p-2 rounded-lg hover:bg-gray-700 transition-colors">
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </Link>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={e => {
                    e.preventDefault();
                    setPage(p => Math.max(p - 1, 1));
                  }}
                  href="#"
                  aria-disabled={page === 1}
                  tabIndex={page === 1 ? -1 : 0}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={page === i + 1}
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      setPage(i + 1);
                    }}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={e => {
                    e.preventDefault();
                    setPage(p => Math.min(p + 1, totalPages));
                  }}
                  href="#"
                  aria-disabled={page === totalPages}
                  tabIndex={page === totalPages ? -1 : 0}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {filteredStories.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-400 mb-2">No stories found</h3>
          <p className="text-gray-500">
            {authorFilter 
              ? `${authorName || 'This user'} hasn't created any stories yet.`
              : searchTerm 
                ? 'Try adjusting your search criteria.'
                : 'No stories have been created yet.'
            }
          </p>
          {authorFilter && (
            <button
              onClick={clearAuthorFilter}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Stories
            </button>
          )}
        </div>
      )}
    </div>
  );
}
