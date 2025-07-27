'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  MessageSquare,
  User,
  Calendar,
  Filter,
  Search,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  BookOpen,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Comment {
  _id: string;
  comment: string;
  commentType: 'general' | 'suggestion' | 'correction' | 'praise';
  isResolved: boolean;
  position?: number;
  createdAt: string;
  resolvedAt?: string;
  authorId: {
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  storyId: {
    _id: string;
    title: string;
    storyNumber: number;
    childId: {
      firstName: string;
      lastName: string;
    };
  };
  resolvedBy?: {
    firstName: string;
    lastName: string;
  };
}

export default function CommentsManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Filters
  const [typeFilter, setTypeFilter] = useState(
    searchParams.get('commentType') || 'all'
  );
  const [resolvedFilter, setResolvedFilter] = useState(
    searchParams.get('isResolved') || 'all'
  );
  const [authorFilter, setAuthorFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const fetchComments = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(typeFilter !== 'all' && { commentType: typeFilter }),
        ...(resolvedFilter !== 'all' && { isResolved: resolvedFilter }),
        ...(searchParams.get('unresolved') === 'true' && {
          unresolved: 'true',
        }),
      });

      const response = await fetch(`/api/admin/comments?${params}`);
      const data = await response.json();

      if (data.success) {
        setComments(data.comments);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, resolvedFilter, currentPage, searchParams]);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'admin') {
      router.push('/admin/login');
      return;
    }

    fetchComments();
  }, [session, status, router, fetchComments]);

  const toggleResolveComment = async (
    commentId: string,
    isResolved: boolean
  ) => {
    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isResolved: !isResolved,
        }),
      });

      if (response.ok) {
        fetchComments(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-300';
      case 'mentor':
        return 'bg-purple-500/20 text-purple-300';
      case 'child':
        return 'bg-green-500/20 text-green-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  const filteredComments = comments.filter((comment) => {
    const matchesSearch =
      comment.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${comment.authorId.firstName} ${comment.authorId.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      comment.storyId.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAuthor =
      authorFilter === 'all' || comment.authorId.role === authorFilter;

    return matchesSearch && matchesAuthor;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Loading comments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Comments & Reviews
          </h1>
          <p className="text-gray-400">
            Monitor and manage all comments across stories
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link href="/admin/comments?unresolved=true">
            <button className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-4 py-2 rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200">
              Show Unresolved
            </button>
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search comments, authors, or stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Comment Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="general">General</option>
            <option value="suggestion">Suggestion</option>
            <option value="correction">Correction</option>
            <option value="praise">Praise</option>
          </select>

          {/* Resolved Filter */}
          <select
            value={resolvedFilter}
            onChange={(e) => setResolvedFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="false">Unresolved</option>
            <option value="true">Resolved</option>
          </select>

          {/* Author Role Filter */}
          <select
            value={authorFilter}
            onChange={(e) => setAuthorFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Authors</option>
            <option value="admin">Admins</option>
            <option value="mentor">Mentors</option>
            <option value="child">Children</option>
          </select>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.map((comment, index) => (
          <motion.div
            key={comment._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Comment Header */}
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {comment.authorId.firstName[0]}
                        {comment.authorId.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">
                        {comment.authorId.firstName} {comment.authorId.lastName}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getRoleColor(comment.authorId.role)}`}
                        >
                          {comment.authorId.role}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs border ${getCommentTypeColor(comment.commentType)}`}
                        >
                          {comment.commentType}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Story Info */}
                <div className="mb-3 p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm text-gray-300">
                    <BookOpen className="w-4 h-4" />
                    <span>
                      Story: &quot;{comment.storyId.title}&quot; by{' '}
                      {comment.storyId.childId.firstName}{' '}
                      {comment.storyId.childId.lastName}
                    </span>
                  </div>
                </div>

                {/* Comment Content */}
                <div className="mb-4">
                  <p className="text-gray-300 leading-relaxed">
                    {comment.comment}
                  </p>
                </div>

                {/* Comment Footer */}
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {comment.position && (
                      <span>Position: {comment.position}</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    {comment.isResolved ? (
                      <div className="flex items-center space-x-1 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span>Resolved</span>
                        {comment.resolvedBy && (
                          <span className="text-gray-400">
                            by {comment.resolvedBy.firstName}{' '}
                            {comment.resolvedBy.lastName}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-orange-400">
                        <Clock className="w-4 h-4" />
                        <span>Unresolved</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 ml-4">
                <Link href={`/admin/stories/${comment.storyId._id}`}>
                  <button className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-gray-700 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </Link>
                <button
                  onClick={() =>
                    toggleResolveComment(comment._id, comment.isResolved)
                  }
                  className={`p-2 rounded-lg transition-colors ${
                    comment.isResolved
                      ? 'text-orange-400 hover:text-orange-300 hover:bg-gray-700'
                      : 'text-green-400 hover:text-green-300 hover:bg-gray-700'
                  }`}
                >
                  {comment.isResolved ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gray-800 rounded-xl px-6 py-4 flex items-center justify-between">
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

      {filteredComments.length === 0 && !loading && (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-400 mb-2">
            No comments found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
}
