// app/admin/comments/page.tsx - FIXED VERSION WITH CARD LAYOUT
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MessageSquare,
  Filter,
  Eye,
  Check,
  X,
  User,
  Calendar,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Comment {
  _id: string;
  content: string;
  commentType: string;
  isResolved: boolean;
  createdAt: string;
  authorId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  storyId: {
    _id: string;
    title: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function CommentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [comments, setComments] = useState<Comment[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolvedFilter, setResolvedFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);

  // ✅ FIXED: Correct comment type options matching the model
  const commentTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'general', label: 'General' },
    { value: 'grammar', label: 'Grammar' },
    { value: 'creativity', label: 'Creativity' },
    { value: 'structure', label: 'Structure' },
    { value: 'suggestion', label: 'Suggestion' },
    { value: 'admin_feedback', label: 'Admin Feedback' },
  ];

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchComments();
  }, [session, status, router, page, resolvedFilter, typeFilter]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '9', // ✅ FIXED: 9 comments per page (3x3 grid)
      });

      if (resolvedFilter !== 'all') {
        params.append('resolved', resolvedFilter);
      }
      if (typeFilter !== 'all') {
        params.append('type', typeFilter);
      }

      const response = await fetch(`/api/admin/comments?${params}`);
      const data = await response.json();

      if (data.success) {
        setComments(data.comments);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCommentStatus = async (
    commentId: string,
    isResolved: boolean
  ) => {
    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isResolved }),
      });

      const data = await response.json();

      if (data.success) {
        setComments(
          comments.map((comment) =>
            comment._id === commentId
              ? { ...comment, isResolved }
              : comment
          )
        );
      } else {
        alert('Failed to update comment status');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Failed to update comment status');
    }
  };

  // ✅ FIXED: Proper comment type colors matching the model
  const getCommentTypeColor = (type: string) => {
    switch (type) {
      case 'admin_feedback':
        return 'bg-red-100 text-red-800';
      case 'grammar':
        return 'bg-yellow-100 text-yellow-800';
      case 'creativity':
        return 'bg-purple-100 text-purple-800';
      case 'structure':
        return 'bg-blue-100 text-blue-800';
      case 'suggestion':
        return 'bg-green-100 text-green-800';
      case 'general':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'mentor':
        return 'bg-purple-100 text-purple-800';
      case 'child':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && comments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Loading comments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl  text-white mb-2">
            Comments Moderation
          </h1>
          <p className="text-gray-400">
            Review and moderate all platform comments
          </p>
        </div>
        <Link href="/admin/comments/moderate">
          <button className="bg-blue-600 text-white px-4 py-2  hover:bg-blue-700 transition-colors">
            Bulk Moderate
          </button>
        </Link>
      </div>

      {/* ✅ FIXED: Proper Filters */}
      <div className="bg-gray-800  p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Resolution Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <span className="text-gray-400 text-sm">Status:</span>
            <div className="flex bg-gray-700  p-1">
              {[
                { value: 'all', label: 'All' },
                { value: 'false', label: 'Unresolved' },
                { value: 'true', label: 'Resolved' },
              ].map((status) => (
                <button
                  key={status.value}
                  onClick={() => {
                    setResolvedFilter(status.value);
                    setPage(1); // Reset to first page
                  }}
                  className={`px-3 py-1.5 text-sm  -md transition-colors ${
                    resolvedFilter === status.value
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Comment Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Type:</span>
            <div className="flex bg-gray-700  p-1 flex-wrap">
              {commentTypeOptions.map((type) => (
                <button
                  key={type.value}
                  onClick={() => {
                    setTypeFilter(type.value);
                    setPage(1); // Reset to first page
                  }}
                  className={`px-3 py-1.5 text-sm  -md transition-colors ${
                    typeFilter === type.value
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        {pagination && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>
                Showing {comments.length} of {pagination.total} comments
              </span>
              <span>
                Page {pagination.page} of {pagination.pages}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ✅ FIXED: Card Grid Layout (3 cards per row, max 9 per page) */}
      {comments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comments.map((comment, index) => (
            <motion.div
              key={comment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800  p-6 hover:bg-gray-750 transition-colors"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-600  flex items-center justify-center">
                    <span className="text-sm  text-white">
                      {comment.authorId.firstName[0]}{comment.authorId.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-white  text-sm">
                      {comment.authorId.firstName} {comment.authorId.lastName}
                    </p>
                    <span className={`inline-block px-2 py-1 text-xs  ${getRoleColor(comment.authorId.role)}`}>
                      {comment.authorId.role}
                    </span>
                  </div>
                </div>
                
                {/* Resolution Status */}
                <div className="flex items-center">
                  {comment.isResolved ? (
                    <div className="flex items-center text-green-400">
                      <Check size={16} />
                      <span className="text-xs ml-1">Resolved</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-400">
                      <X size={16} />
                      <span className="text-xs ml-1">Unresolved</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Comment Type */}
              <div className="mb-3">
                <span className={`inline-block px-2 py-1 text-xs  ${getCommentTypeColor(comment.commentType)}`}>
                  {comment.commentType.replace('_', ' ')}
                </span>
              </div>

              {/* Comment Content */}
              <div className="mb-4">
                <p className="text-gray-300 text-sm line-clamp-3">
                  {comment.content}
                </p>
              </div>

              {/* Story Info */}
              <div className="mb-4 p-3 bg-gray-700/50 ">
                <div className="flex items-center space-x-2 text-sm">
                  <BookOpen size={14} className="text-gray-400" />
                  <span className="text-gray-400">Story:</span>
                  <span className="text-white  truncate">
                    {comment.storyId.title}
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <Calendar size={12} />
                  <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Toggle Resolution */}
                  <button
                    onClick={() => updateCommentStatus(comment._id, !comment.isResolved)}
                    className={`px-3 py-1 text-xs -md transition-colors ${
                      comment.isResolved
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {comment.isResolved ? 'Unresolve' : 'Resolve'}
                  </button>
                  
                  {/* View Details */}
                  <Link href={`/admin/comments/${comment._id}`}>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-600  transition-colors">
                      <Eye size={14} />
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl text-gray-400 mb-2">No comments found</h3>
          <p className="text-gray-500">
            No comments match your current filters.
          </p>
        </div>
      )}

      {/* ✅ FIXED: Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700  transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex space-x-1">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-3 py-2 text-sm  transition-colors ${
                  page === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === pagination.pages}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700  transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}