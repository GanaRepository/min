import TerminalLoader from '../../../components/TerminalLoader';
('use client');

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MessageSquare,
  BookOpen,
  Calendar,
  Search,
  Eye,
  Plus,
  Filter,
  CheckCircle,
  Clock,
  Edit,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Comment {
  _id: string;
  comment: string;
  commentType: 'general' | 'suggestion' | 'correction' | 'praise';
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
  storyId: {
    _id: string;
    title: string;
    childId: {
      firstName: string;
      lastName: string;
    };
  };
  responses?: number;
}

export default function MentorComments() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [typeFilter, setTypeFilter] = useState('all');
  const [resolvedFilter, setResolvedFilter] = useState('all');

  const fetchComments = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        ...(typeFilter !== 'all' && { commentType: typeFilter }),
        ...(resolvedFilter !== 'all' && { isResolved: resolvedFilter }),
      });

      const response = await fetch(`/api/mentor/comments?${params}`);
      const data = await response.json();

      if (data.success) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, resolvedFilter]);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'mentor') {
      router.push('/login/mentor');
      return;
    }

    fetchComments();
  }, [session, status, router, fetchComments]);

  const getCommentTypeColor = (type: string) => {
    switch (type) {
      case 'general':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'suggestion':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'correction':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'praise':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const filteredComments = comments.filter((comment) => {
    const matchesSearch =
      comment.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.storyId.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${comment.storyId.childId.firstName} ${comment.storyId.childId.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredComments.length / itemsPerPage);
  const paginatedComments = filteredComments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page if search/filter changes and currentPage is out of range
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [searchTerm, comments, totalPages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <TerminalLoader
          title="Comments"
          loadingText="Loading comments..."
          size="md"
        />
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl text-white mb-1 sm:mb-2">
            My Comments & Reviews
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Manage your feedback and guidance to students
          </p>
        </div>
        <div className="mt-2 sm:mt-0">
          <div className="text-xs sm:text-sm text-gray-400">
            Total Comments: {comments.length} | Unresolved:{' '}
            {comments.filter((c) => !c.isResolved).length}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-gray-800 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Comments</p>
              <p className="text-2xl text-white">{comments.length}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Suggestions</p>
              <p className="text-2xl text-white">
                {comments.filter((c) => c.commentType === 'suggestion').length}
              </p>
            </div>
            <Plus className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Resolved</p>
              <p className="text-2xl text-white">
                {comments.filter((c) => c.isResolved).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl text-white">
                {comments.filter((c) => !c.isResolved).length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 p-3 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search comments, stories, or students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Types</option>
            <option value="general">General</option>
            <option value="suggestion">Suggestion</option>
            <option value="correction">Correction</option>
            <option value="praise">Praise</option>
          </select>

          <select
            value={resolvedFilter}
            onChange={(e) => setResolvedFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="false">Unresolved</option>
            <option value="true">Resolved</option>
          </select>
        </div>
      </div>

      {/* Comments List - 3 columns on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {paginatedComments.map((comment, index) => (
          <motion.div
            key={comment._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gray-800 p-4 sm:p-6 hover:bg-gray-750 transition-colors flex flex-col justify-between"
          >
            <div>
              {/* Comment Header */}
              <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
                <span
                  className={`px-2 py-1 text-xs border ${getCommentTypeColor(comment.commentType)}`}
                >
                  {comment.commentType}
                </span>
                <div className="flex items-center gap-1">
                  {comment.isResolved ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-orange-400" />
                  )}
                  <span
                    className={`text-xs sm:text-sm ${comment.isResolved ? 'text-green-400' : 'text-orange-400'}`}
                  >
                    {comment.isResolved ? 'Resolved' : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Story Info */}
              <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-gray-700/50">
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-300">
                  <BookOpen className="w-4 h-4" />
                  <span>
                    Story: &quot;{comment.storyId.title}&quot; by{' '}
                    {comment.storyId.childId.firstName}{' '}
                    {comment.storyId.childId.lastName}
                  </span>
                </div>
              </div>

              {/* Comment Content */}
              <div className="mb-2 sm:mb-4">
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                  {comment.comment}
                </p>
              </div>
            </div>

            {/* Comment Footer & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-400 mt-2 sm:mt-4 gap-2 sm:gap-0">
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {comment.responses && comment.responses > 0 && (
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{comment.responses} responses</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                {!comment.isResolved && (
                  <button
                    className="text-green-400 hover:text-green-300 p-1.5 sm:p-2 hover:bg-gray-700 transition-colors border border-green-600 text-xs sm:text-sm"
                    onClick={async () => {
                      try {
                        const res = await fetch(
                          `/api/mentor/comments/${comment._id}`,
                          {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ isResolved: true }),
                          }
                        );
                        const data = await res.json();
                        if (data.success) {
                          setComments((prev) =>
                            prev.map((c) =>
                              c._id === comment._id
                                ? {
                                    ...c,
                                    isResolved: true,
                                    resolvedAt: new Date().toISOString(),
                                  }
                                : c
                            )
                          );
                        }
                      } catch (e) {}
                    }}
                    title="Mark as Resolved"
                  >
                    Mark as Resolved
                  </button>
                )}
                <Link href={`/mentor-dashboard/stories/${comment.storyId._id}`}>
                  <button
                    className="text-blue-400 hover:text-blue-300 p-1.5 sm:p-2 hover:bg-gray-700 transition-colors"
                    title="View Story"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </Link>
                <button
                  className="text-gray-400 hover:text-gray-300 p-1.5 sm:p-2 hover:bg-gray-700 transition-colors"
                  title="Edit (coming soon)"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
            {comment.resolvedAt && (
              <div className="text-green-400 text-[10px] sm:text-xs mt-1 sm:mt-2">
                Resolved: {new Date(comment.resolvedAt).toLocaleDateString()}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-700 text-white disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-700 text-white disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {filteredComments.length === 0 && !loading && (
        <div className="text-center py-8 sm:py-12">
          <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-2 sm:mb-4" />
          <h3 className="text-lg sm:text-xl text-gray-400 mb-1 sm:mb-2">
            No comments found
          </h3>
          <p className="text-gray-500 text-xs sm:text-base">
            {searchTerm
              ? 'Try adjusting your search criteria.'
              : "You haven't made any comments yet."}
          </p>
        </div>
      )}
    </div>
  );
}
