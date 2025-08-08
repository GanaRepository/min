//app/admin/comments/page.tsx
// app/admin/comments/page.tsx - List All Comments for Moderation
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
        limit: '20',
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

  const updateCommentStatus = async (commentId: string, isResolved: boolean) => {
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
        setComments(comments.map(comment => 
          comment._id === commentId ? { ...comment, isResolved } : comment
        ));
      } else {
        alert('Failed to update comment status');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Failed to update comment status');
    }
  };

  const getCommentTypeColor = (type: string) => {
    switch (type) {
      case 'praise': return 'bg-green-100 text-green-800';
      case 'suggestion': return 'bg-blue-100 text-blue-800';
      case 'correction': return 'bg-orange-100 text-orange-800';
      case 'question': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'mentor': return 'bg-purple-100 text-purple-800';
      case 'child': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Comments Moderation
        </h1>
        <p className="text-gray-400">
          Review and moderate all platform comments
        </p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Resolution Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <div className="flex bg-gray-700 rounded-lg p-1">
              {['all', 'false', 'true'].map((status) => (
                <button
                  key={status}
                  onClick={() => setResolvedFilter(status)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    resolvedFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {status === 'all' ? 'All' : status === 'true' ? 'Resolved' : 'Unresolved'}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-700 rounded-lg p-1">
              {['all', 'praise', 'suggestion', 'correction', 'question'].map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    typeFilter === type
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <motion.div
            key={comment._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <div className="flex items-start justify-between">
              {/* Comment Content */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {comment.authorId.firstName[0]}{comment.authorId.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-white font-medium">
                        {comment.authorId.firstName} {comment.authorId.lastName}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(comment.authorId.role)}`}>
                        {comment.authorId.role}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getCommentTypeColor(comment.commentType)}`}>
                        {comment.commentType}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{comment.authorId.email}</p>
                  </div>
                </div>
                
                <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                  <p className="text-white">{comment.content}</p>
                </div>

                {/* Story Context */}
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center">
                    <BookOpen size={16} className="mr-1" />
                    <Link href={`/admin/stories/${comment.storyId._id}`}>
                      <span className="hover:text-blue-400 cursor-pointer">
                        "{comment.storyId.title}"
                      </span>
                    </Link>
                  </div>
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-1" />
                    {new Date(comment.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-end space-y-2 ml-6">
                <span className={`px-3 py-1 text-sm rounded-full ${
                  comment.isResolved 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {comment.isResolved ? 'Resolved' : 'Unresolved'}
                </span>
                
                <div className="flex items-center space-x-2">
                  <Link href={`/admin/comments/${comment._id}`}>
                    <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors">
                      <Eye size={16} />
                    </button>
                  </Link>
                  
                  {!comment.isResolved ? (
                    <button
                      onClick={() => updateCommentStatus(comment._id, true)}
                      className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Mark as Resolved"
                    >
                      <Check size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => updateCommentStatus(comment._id, false)}
                      className="p-2 text-gray-400 hover:text-orange-400 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Mark as Unresolved"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {comments.length === 0 && !loading && (
        <div className="text-center py-12">
          <MessageSquare size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-400 mb-2">No comments found</h3>
          <p className="text-gray-500">
            {resolvedFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Comments will appear here as users and mentors interact'
            }
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <div className="flex items-center space-x-2">
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(pagination.pages - 4, page - 2)) + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
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
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}