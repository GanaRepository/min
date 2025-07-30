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
  BadgeCheck,
  CircleAlert,
  Clock,
  BookOpen,
  Edit2,
  Trash2,
  X,
  Save,
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // Edit comment handler
  const handleEditClick = (comment: Comment) => {
    setEditingId(comment._id);
    setEditValue(comment.comment);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleEditSave = async (comment: Comment) => {
    try {
      const response = await fetch(`/api/admin/comments/${comment._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: editValue }),
      });
      const data = await response.json();
      if (data.success) {
        setComments((prev) =>
          prev.map((c) => (c._id === comment._id ? { ...c, comment: editValue } : c))
        );
        setEditingId(null);
        setEditValue('');
      }
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  // Delete comment handler
  const handleDeleteClick = (comment: Comment) => {
    setDeletingId(comment._id);
  };

  const handleDeleteConfirm = async (comment: Comment) => {
    try {
      const response = await fetch(`/api/admin/comments/${comment._id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setComments((prev) => prev.filter((c) => c._id !== comment._id));
        setDeletingId(null);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingId(null);
  };
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchComments = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
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
  }, [typeFilter, resolvedFilter, page, searchParams]);

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
    <div className="space-y-6 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Comments & Reviews
          </h1>
          <p className="text-gray-400">
            Monitor and manage all comments across stories
          </p>
        </div>
        
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
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
          </select>
        </div>
      </div>

      {/* Comments List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredComments.map((comment, index) => (
          <motion.div
            key={comment._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gray-800 rounded-xl p-4 sm:p-6 hover:bg-gray-750 transition-colors h-full flex flex-col"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {/* Comment Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {comment.authorId.firstName[0]}
                        {comment.authorId.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium leading-tight">
                        {comment.authorId.firstName} {comment.authorId.lastName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
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
                <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm text-gray-300">
                    <BookOpen className="w-4 h-4" />
<span>
  Story: &quot;{comment.storyId?.title}&quot; by{' '}
  {comment.storyId?.childId?.firstName ? comment.storyId.childId.firstName + ' ' : ''}
  {comment.storyId?.childId?.lastName || ''}
</span>
                  </div>
                </div>

                {/* Comment Content */}
                <div className="mb-4 mt-2">
                  {editingId === comment._id ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        className="w-full rounded bg-gray-700 text-gray-100 p-2 text-sm sm:text-base"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          onClick={() => handleEditSave(comment)}
                        >
                          <Save className="w-4 h-4" /> Save
                        </button>
                        <button
                          className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                          onClick={handleEditCancel}
                        >
                          <X className="w-4 h-4" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-300 leading-relaxed">
                      {comment.comment}
                    </p>
                  )}
                </div>

                {/* Comment Footer */}
                <div className="flex flex-wrap items-center justify-between text-sm text-gray-400 mt-2 gap-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {comment.position && (
                      <span>Position: {comment.position}</span>
                    )}
                  </div>
    

                  <div className="flex items-center gap-3">
                    {comment.isResolved ? (
                      <div className="flex items-center space-x-1 text-green-400">
                        <BadgeCheck className="w-4 h-4" />
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
                        <CircleAlert className="w-4 h-4" />
                        <span>Unresolved</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 ml-4 mt-1">
                <Link href={`/admin/stories/${comment.storyId._id}`}>
                  <button className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-gray-700 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </Link>
                <button
                  onClick={() => toggleResolveComment(comment._id, comment.isResolved)}
                  className={`p-2 rounded-lg transition-colors ${
                    comment.isResolved
                      ? 'text-orange-400 hover:text-orange-300 hover:bg-gray-700'
                      : 'text-green-400 hover:text-green-300 hover:bg-gray-700'
                  }`}
                >
                  {comment.isResolved ? (
                    <CircleAlert className="w-4 h-4" />
                  ) : (
                    <BadgeCheck className="w-4 h-4" />
                  )}
                </button>
                <button
                  className="text-yellow-400 hover:text-yellow-300 p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  onClick={() => handleEditClick(comment)}
                  disabled={editingId !== null && editingId !== comment._id}
                  title="Edit Comment"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  onClick={() => handleDeleteClick(comment)}
                  disabled={editingId !== null}
                  title="Delete Comment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {/* Delete confirmation dialog */}
              {deletingId === comment._id && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col items-center">
                    <p className="text-white mb-4">Are you sure you want to delete this comment?</p>
                    <div className="flex gap-4">
                      <button
                        className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        onClick={() => handleDeleteConfirm(comment)}
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                      <button
                        className="flex items-center gap-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        onClick={handleDeleteCancel}
                      >
                        <X className="w-4 h-4" /> Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gray-800 rounded-xl px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
          <div className="text-gray-400 text-xs sm:text-sm">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-2 sm:px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors text-xs sm:text-sm"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="px-2 sm:px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors text-xs sm:text-sm"
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
