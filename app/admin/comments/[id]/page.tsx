'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MessageSquare,
  User,
  Calendar,
  BookOpen,
  Check,
  X,
  Edit,
  Save,
  XCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import TerminalLoader from '@/components/TerminalLoader';
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from '@/components/ui/toast';

interface CommentDetails {
  _id: string;
  comment: string;
  commentType: string;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
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
    storyNumber: number;
    childId: {
      firstName: string;
      lastName: string;
    };
  };
  replies?: Array<{
    _id: string;
    comment: string;
    authorId: {
      firstName: string;
      lastName: string;
      role: string;
    };
    createdAt: string;
  }>;
}

interface PaginationInfo {
  current: string;
  prev: string | null;
  next: string | null;
  total: number;
}

export default function ViewComment() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const commentId = params.id as string;

  const [comment, setComment] = useState<CommentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit functionality states
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  // Pagination states
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loadingPagination, setLoadingPagination] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchComment();
  }, [session, status, router, commentId]);

  const fetchComment = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/comments/${commentId}`);
      const data = await response.json();

      if (data.success) {
        setComment(data.comment);
        setPagination(data.pagination || null);
      } else {
        router.push('/admin/comments');
      }
    } catch (error) {
      console.error('Error fetching comment:', error);
      router.push('/admin/comments');
    } finally {
      setLoading(false);
    }
  };

  const updateCommentStatus = async (isResolved: boolean) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isResolved }),
      });

      const data = await response.json();

      if (data.success) {
        setComment((prev) => (prev ? { ...prev, isResolved } : null));
        setToastMessage(
          `Comment marked as ${isResolved ? 'resolved' : 'unresolved'}`
        );
      } else {
        setToastMessage('Failed to update comment status');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      setToastMessage('Failed to update comment status');
    } finally {
      setUpdating(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditValue(comment?.comment || '');
  };

  const handleEditSave = async () => {
    if (!editValue.trim()) {
      setToastMessage('Comment cannot be empty');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: editValue.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setComment((prev) =>
          prev
            ? {
                ...prev,
                comment: editValue.trim(),
                updatedAt: new Date().toISOString(),
              }
            : null
        );
        setIsEditing(false);
        setToastMessage('Comment updated successfully');
      } else {
        setToastMessage('Failed to update comment: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      setToastMessage('Failed to update comment');
    } finally {
      setSaving(false);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditValue('');
  };

  const deleteComment = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this comment? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setToastMessage('Comment deleted successfully');
        router.push('/admin/comments');
      } else {
        setToastMessage('Failed to delete comment: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      setToastMessage('Failed to delete comment');
    } finally {
      setDeleting(false);
    }
  };

  const navigateToComment = async (direction: 'prev' | 'next') => {
    if (!pagination) return;

    const targetId = direction === 'prev' ? pagination.prev : pagination.next;
    if (!targetId) return;

    setLoadingPagination(true);
    router.push(`/admin/comments/${targetId}`);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'mentor':
        return 'bg-purple-100 text-purple-800';
      case 'child':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <TerminalLoader loadingText="Loading comment details......" />
      </div>
    );
  }

  if (!comment) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Comment not found</div>
      </div>
    );
  }

  const canEdit = comment.authorId._id === session?.user?.id;

  return (
    <ToastProvider>
      <div className="space-y-6 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-4 sm:py-6 md:py-8">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/comments">
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700  transition-colors">
                <ArrowLeft size={20} />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl  text-white">
                Comment Details
              </h1>
              <p className="text-gray-400">Manage and moderate comment</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Pagination Navigation */}
            {pagination && (
              <div className="flex items-center space-x-2 mr-4">
                <button
                  onClick={() => navigateToComment('prev')}
                  disabled={!pagination.prev || loadingPagination}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700  transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous comment"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-gray-400 text-sm">
                  Comment {pagination.current} of {pagination.total}
                </span>
                <button
                  onClick={() => navigateToComment('next')}
                  disabled={!pagination.next || loadingPagination}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700  transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next comment"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <button
              onClick={() => updateCommentStatus(!comment.isResolved)}
              disabled={updating}
              className={`px-4 py-2  transition-colors flex items-center disabled:opacity-50 ${
                comment.isResolved
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {comment.isResolved ? (
                <X size={16} className="mr-2" />
              ) : (
                <Check size={16} className="mr-2" />
              )}
              {updating
                ? 'Updating...'
                : comment.isResolved
                  ? 'Mark Unresolved'
                  : 'Mark Resolved'}
            </button>

            <button
              onClick={deleteComment}
              disabled={deleting}
              className="bg-red-600 text-white px-4 py-2  hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
            >
              <Trash2 size={16} className="mr-2" />
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        {/* Comment Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800  p-4"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-3 ">
                <User size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Author</p>
                <p className="text-white ">
                  {comment.authorId.firstName} {comment.authorId.lastName}
                </p>
                <span
                  className={`inline-flex items-center px-2 py-1 text-xs  ${getRoleColor(comment.authorId.role)}`}
                >
                  {comment.authorId.role}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800  p-4"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-purple-600 p-3 ">
                <MessageSquare size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Type</p>
                <span
                  className={`inline-flex items-center px-2 py-1 text-xs  ${getCommentTypeColor(comment.commentType)}`}
                >
                  {comment.commentType}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800  p-4"
          >
            <div className="flex items-center space-x-3">
              <div
                className={`p-3  ${comment.isResolved ? 'bg-green-600' : 'bg-red-600'}`}
              >
                {comment.isResolved ? (
                  <Check size={20} className="text-white" />
                ) : (
                  <X size={20} className="text-white" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <p
                  className={` ${comment.isResolved ? 'text-green-400' : 'text-red-400'}`}
                >
                  {comment.isResolved ? 'Resolved' : 'Unresolved'}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800  p-4"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-orange-600 p-3 ">
                <Calendar size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Created</p>
                <p className="text-white ">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Comment Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800  p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gray-600 p-3 ">
                <BookOpen size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-white ">Story Context</h3>
                <Link
                  href={`/admin/stories/${comment.storyId._id}`}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {comment.storyId.title} (Story #{comment.storyId.storyNumber})
                </Link>
                <p className="text-gray-400 text-sm">
                  by {comment.storyId.childId.firstName}{' '}
                  {comment.storyId.childId.lastName}
                </p>
              </div>
            </div>

            {canEdit && !isEditing && (
              <button
                onClick={handleEditClick}
                className="text-yellow-400 hover:text-yellow-300 p-2 hover:bg-gray-700  transition-colors"
                title="Edit comment"
              >
                <Edit size={16} />
              </button>
            )}
          </div>

          <div className="bg-gray-700/50  p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white ">Comment Content</h4>
              {comment.updatedAt !== comment.createdAt && (
                <span className="text-gray-400 text-xs">
                  (edited {new Date(comment.updatedAt).toLocaleDateString()})
                </span>
              )}
            </div>

            {/* Conditional rendering for edit mode */}
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full p-3 bg-gray-600 border border-gray-500  text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={6}
                  placeholder="Edit your comment..."
                />
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleEditSave}
                    disabled={!editValue.trim() || saving}
                    className="bg-green-600 text-white px-4 py-2  hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Save size={16} className="mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleEditCancel}
                    disabled={saving}
                    className="bg-gray-600 text-white px-4 py-2  hover:bg-gray-700 transition-colors flex items-center"
                  >
                    <XCircle size={16} className="mr-2" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-200 whitespace-pre-wrap">
                {comment.comment}
              </div>
            )}
          </div>
        </motion.div>

        {/* Replies Section */}
        {comment.replies && comment.replies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800  p-6"
          >
            <h3 className="text-white  mb-4">
              Replies ({comment.replies.length})
            </h3>
            <div className="space-y-4">
              {comment.replies.map((reply, index) => (
                <div key={reply._id} className="bg-gray-700/30  p-4 ml-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-white ">
                      {reply.authorId.firstName} {reply.authorId.lastName}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs  ${getRoleColor(reply.authorId.role)}`}
                    >
                      {reply.authorId.role}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {new Date(reply.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-200">{reply.comment}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {toastMessage && (
          <Toast>
            <ToastTitle>
              {toastMessage.includes('cannot be empty')
                ? 'Warning'
                : toastMessage.includes('successfully')
                  ? 'Success'
                  : 'Error'}
            </ToastTitle>
            <ToastDescription>{toastMessage}</ToastDescription>
            <ToastClose onClick={() => setToastMessage(null)} />
          </Toast>
        )}
        <ToastViewport />
      </div>
    </ToastProvider>
  );
}
