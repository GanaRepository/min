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
  Plus,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
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
  child: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  commentCount: number;
  mentorCommentCount: number;
  unresolvedComments: number;
  needsReview: boolean;
  lastMentorComment?: string;
}

export default function MentorStories() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get('filter') || 'all'
  );
  const [studentFilter, setStudentFilter] = useState(
    searchParams.get('student') || 'all'
  );

  const fetchStories = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(studentFilter !== 'all' && { student: studentFilter }),
      });

      const response = await fetch(`/api/mentor/stories?${params}`);
      const data = await response.json();

      if (data.success) {
        setStories(data.stories);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, studentFilter]);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'mentor') {
      router.push('/login/mentor');
      return;
    }

    fetchStories();
  }, [session, status, router, fetchStories]);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'active':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'paused':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredStories = stories.filter(
    (story) =>
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${story.child.firstName} ${story.child.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const pendingReviewCount = stories.filter(
    (s) => s.needsReview || s.unresolvedComments > 0
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Loading stories...</div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
            Student Stories
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Review and guide your student&apos;s creative writing
          </p>
        </div>
        <div className="mt-2 sm:mt-0 flex items-center gap-2 sm:gap-4">
          {pendingReviewCount > 0 && (
            <div className="bg-orange-500/20 text-orange-300 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
              {pendingReviewCount} need review
            </div>
          )}
          <div className="text-gray-400 text-xs sm:text-sm">
            Total Stories: {stories.length}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Stories</p>
              <p className="text-2xl font-bold text-white">{stories.length}</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Stories</p>
              <p className="text-2xl font-bold text-white">
                {stories.filter((s) => s.status === 'active').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-white">
                {stories.filter((s) => s.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Need Review</p>
              <p className="text-2xl font-bold text-white">
                {pendingReviewCount}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-3 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search stories or students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
            <option value="pending">Need Review</option>
          </select>

          <select
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Students</option>
            {/* This would be populated with actual student data */}
          </select>
        </div>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
        {filteredStories.map((story, index) => (
          <motion.div
            key={story._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-xl p-3 sm:p-6 hover:bg-gray-750 transition-all duration-200"
          >
            {/* Story Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
              <div className="flex-1">
                <h3 className="text-white font-medium text-base sm:text-lg mb-0.5 sm:mb-1">
                  {story.title}
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Story #{story.storyNumber}
                </p>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-0">
                {(story.needsReview || story.unresolvedComments > 0) && (
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-orange-400 rounded-full"></div>
                )}
                <span
                  className={`inline-flex items-center gap-0.5 sm:gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(story.status)}`}
                >
                  {getStatusIcon(story.status)}
                  <span className="capitalize">{story.status}</span>
                </span>
              </div>
            </div>

            {/* Student Info */}
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-700/50 rounded-lg">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-medium">
                  {story.child.firstName[0]}
                  {story.child.lastName[0]}
                </span>
              </div>
              <div>
                <p className="text-white text-xs sm:text-sm font-medium">
                  {story.child.firstName} {story.child.lastName}
                </p>
                <p className="text-gray-400 text-[10px] sm:text-xs">{story.child.email}</p>
              </div>
            </div>

            {/* Story Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4">
              <div className="text-center">
                <div className="text-base sm:text-lg font-bold text-white">
                  {story.totalWords}
                </div>
                <div className="text-gray-400 text-[10px] sm:text-xs">Total Words</div>
              </div>
              <div className="text-center">
                <div className="text-base sm:text-lg font-bold text-blue-400">
                  {story.mentorCommentCount}
                </div>
                <div className="text-gray-400 text-[10px] sm:text-xs">My Comments</div>
              </div>
              <div className="text-center">
                <div className="text-base sm:text-lg font-bold text-orange-400">
                  {story.unresolvedComments}
                </div>
                <div className="text-gray-400 text-[10px] sm:text-xs">Unresolved</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3 sm:mb-4">
              <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400 mb-0.5 sm:mb-1">
                <span>API Calls Used</span>
                <span>
                  {story.apiCallsUsed}/{story.maxApiCalls}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5 sm:h-2">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-500 h-1.5 sm:h-2 rounded-full"
                  style={{
                    width: `${Math.min((story.apiCallsUsed / story.maxApiCalls) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Metadata */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs sm:text-sm text-gray-400 mb-2 sm:mb-4 gap-1 sm:gap-0">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  Updated: {new Date(story.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1 sm:mt-0">
                <MessageSquare className="w-4 h-4" />
                <span>{story.commentCount} comments</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Link
                href={`/mentor-dashboard/stories/${story._id}`}
                className="flex-1"
              >
                <button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-base">
                  <Eye className="w-4 h-4" />
                  <span>Review Story</span>
                </button>
              </Link>
            </div>

            {/* Last Comment Preview */}
            {story.lastMentorComment && (
              <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-gray-700/30 rounded-lg">
                <p className="text-gray-400 text-[10px] sm:text-xs mb-0.5 sm:mb-1">Your last comment:</p>
                <p className="text-gray-300 text-xs sm:text-sm truncate">
                  {story.lastMentorComment}
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {filteredStories.length === 0 && !loading && (
        <div className="text-center py-8 sm:py-12">
          <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-2 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-medium text-gray-400 mb-1 sm:mb-2">
            No stories found
          </h3>
          <p className="text-gray-500 text-xs sm:text-base">
            {searchTerm
              ? 'Try adjusting your search criteria.'
              : 'No stories have been created by your students yet.'}
          </p>
        </div>
      )}
    </div>
  );
}
