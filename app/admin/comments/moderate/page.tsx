// app/admin/comments/moderate/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MessageSquare,
  Check,
  X,
  Trash2,
  Filter,
  Search,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from '@/components/ui/toast';

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

export default function ModerationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedComments, setSelectedComments] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [filters, setFilters] = useState({
    resolved: 'false',
    type: 'all',
    search: '',
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchComments();
  }, [session, status, router, filters]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        resolved: filters.resolved,
        type: filters.type,
        limit: '100',
      });

      const response = await fetch(`/api/admin/comments?${params}`);
      const data = await response.json();

      if (data.success) {
        let filteredComments = data.comments;

        // Apply search filter
        if (filters.search) {
          filteredComments = filteredComments.filter(
            (comment: Comment) =>
              comment.content
                .toLowerCase()
                .includes(filters.search.toLowerCase()) ||
              comment.authorId.firstName
                .toLowerCase()
                .includes(filters.search.toLowerCase()) ||
              comment.authorId.lastName
                .toLowerCase()
                .includes(filters.search.toLowerCase()) ||
              comment.storyId.title
                .toLowerCase()
                .includes(filters.search.toLowerCase())
          );
        }

        setComments(filteredComments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const bulkModerate = async (action: 'resolve' | 'unresolve' | 'delete') => {
    if (selectedComments.size === 0) {
      setToastMessage('Please select comments to moderate');
      return;
    }

    const actionText = action === 'delete' ? 'delete' : `mark as ${action}d`;
    if (
      !confirm(
        `Are you sure you want to ${actionText} ${selectedComments.size} comment(s)?`
      )
    ) {
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch('/api/admin/comments/bulk-moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentIds: Array.from(selectedComments),
          action,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        setSelectedComments(new Set());
        fetchComments(); // Refresh data
      } else {
        setToastMessage('Failed to moderate comments: ' + data.error);
      }
    } catch (error) {
      console.error('Error moderating comments:', error);
      setToastMessage('Failed to moderate comments');
    } finally {
      setProcessing(false);
    }
  };

  const toggleCommentSelection = (commentId: string) => {
    const newSelected = new Set(selectedComments);
    if (newSelected.has(commentId)) {
      newSelected.delete(commentId);
    } else {
      newSelected.add(commentId);
    }
    setSelectedComments(newSelected);
  };

  const selectAll = () => {
    if (selectedComments.size === comments.length) {
      setSelectedComments(new Set());
    } else {
      setSelectedComments(new Set(comments.map((c) => c._id)));
    }
  };

  const getCommentTypeColor = (type: string) => {
    switch (type) {
      case 'praise':
        return 'bg-green-100 text-green-800';
      case 'suggestion':
        return 'bg-blue-100 text-blue-800';
      case 'correction':
        return 'bg-orange-100 text-orange-800';
      case 'question':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ToastProvider>
      <div className="space-y-6 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/admin/comments">
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700  transition-colors">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl  text-white">
              Bulk Comment Moderation
            </h1>
            <p className="text-gray-400">
              Review and moderate multiple comments at once
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-800  p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search
                  size={20}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search comments, authors, or stories..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600  text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Resolution Filter */}
            <div>
              <select
                value={filters.resolved}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, resolved: e.target.value }))
                }
                className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600  text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="false">Unresolved</option>
                <option value="true">Resolved</option>
                <option value="all">All Comments</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, type: e.target.value }))
                }
                className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600  text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="praise">Praise</option>
                <option value="suggestion">Suggestion</option>
                <option value="correction">Correction</option>
                <option value="question">Question</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedComments.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-900/20 border border-blue-500/30  p-4"
          >
            <div className="flex items-center justify-between">
              <div className="text-blue-300">
                {selectedComments.size} comment(s) selected
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => bulkModerate('resolve')}
                  disabled={processing}
                  className="bg-green-600 text-white px-4 py-2  hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                >
                  <Check size={16} className="mr-2" />
                  Mark Resolved
                </button>
                <button
                  onClick={() => bulkModerate('unresolve')}
                  disabled={processing}
                  className="bg-orange-600 text-white px-4 py-2  hover:bg-orange-700 transition-colors flex items-center disabled:opacity-50"
                >
                  <X size={16} className="mr-2" />
                  Mark Unresolved
                </button>
                <button
                  onClick={() => bulkModerate('delete')}
                  disabled={processing}
                  className="bg-red-600 text-white px-4 py-2  hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Comments List */}
        <div className="bg-gray-800  p-6">
          {/* Select All Header */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={
                  comments.length > 0 &&
                  selectedComments.size === comments.length
                }
                onChange={selectAll}
                className="mr-3 "
              />
              <span className="text-white ">
                Select All ({comments.length} comments)
              </span>
            </label>

            <div className="text-gray-400 text-sm">
              Click comments to select for bulk actions
            </div>
          </div>

          {/* Comments */}
          {loading ? (
            <div className="text-center py-8">
              <div className="text-xl text-gray-400">Loading comments...</div>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <motion.div
                  key={comment._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4  border-2 cursor-pointer transition-all ${
                    selectedComments.has(comment._id)
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-700 bg-gray-700/30 hover:border-gray-600'
                  }`}
                  onClick={() => toggleCommentSelection(comment._id)}
                >
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedComments.has(comment._id)}
                      onChange={() => toggleCommentSelection(comment._id)}
                      className="mt-1"
                      onClick={(e) => e.stopPropagation()}
                    />

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-white ">
                            {comment.authorId.firstName}{' '}
                            {comment.authorId.lastName}
                          </h4>
                          <span className="text-xs text-gray-400">
                            ({comment.authorId.role})
                          </span>
                          <span
                            className={`px-2 py-1 text-xs  ${getCommentTypeColor(comment.commentType)}`}
                          >
                            {comment.commentType}
                          </span>
                        </div>

                        <span
                          className={`px-2 py-1 text-xs  ${
                            comment.isResolved
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {comment.isResolved ? 'Resolved' : 'Unresolved'}
                        </span>
                      </div>

                      <p className="text-gray-300 mb-2">{comment.content}</p>

                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <div>
                          Story:{' '}
                          <Link href={`/admin/stories/${comment.storyId._id}`}>
                            <span className="text-blue-400 hover:underline cursor-pointer">
                              &quot;{comment.storyId.title}&quot;
                            </span>
                          </Link>
                        </div>
                        <div>
                          {new Date(comment.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare size={48} className="text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl  text-gray-400 mb-2">No comments found</h3>
              <p className="text-gray-500">
                Try adjusting your filters or search terms
              </p>
            </div>
          )}
        </div>

        {toastMessage && (
          <Toast>
            <ToastTitle>
              {toastMessage.includes('select')
                ? 'Warning'
                : toastMessage.includes('Failed')
                  ? 'Error'
                  : 'Success'}
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
