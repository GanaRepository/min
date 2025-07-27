'use client';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Loading comments...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">My Comments & Reviews</h1>
          <p className="text-gray-400">Manage your feedback and guidance to students</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="text-sm text-gray-400">
            Total Comments: {comments.length} | Unresolved: {comments.filter(c => !c.isResolved).length}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Comments</p>
              <p className="text-2xl font-bold text-white">{comments.length}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Suggestions</p>
              <p className="text-2xl font-bold text-white">
                {comments.filter(c => c.commentType === 'suggestion').length}
              </p>
            </div>
            <Plus className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Resolved</p>
              <p className="text-2xl font-bold text-white">
                {comments.filter(c => c.isResolved).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-white">
                {comments.filter(c => !c.isResolved).length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search comments, stories, or students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="false">Unresolved</option>
            <option value="true">Resolved</option>
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
                  <span className={`px-2 py-1 rounded-full text-xs border ${getCommentTypeColor(comment.commentType)}`}>
                    {comment.commentType}
                  </span>
                  <div className="flex items-center space-x-1">
                    {comment.isResolved ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-orange-400" />
                    )}
                    <span className={`text-sm ${comment.isResolved ? 'text-green-400' : 'text-orange-400'}`}>
                      {comment.isResolved ? 'Resolved' : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Story Info */}
                <div className="mb-3 p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm text-gray-300">
                    <BookOpen className="w-4 h-4" />
                    <span>
                      Story: "{comment.storyId.title}" by {comment.storyId.childId.firstName} {comment.storyId.childId.lastName}
                    </span>
                  </div>
                </div>

                {/* Comment Content */}
                <div className="mb-4">
                  <p className="text-gray-300 leading-relaxed">{comment.comment}</p>
                </div>

                {/* Comment Footer */}
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    {comment.responses && comment.responses > 0 && (
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{comment.responses} responses</span>
                      </div>
                    )}
                  </div>

                  {comment.resolvedAt && (
                    <div className="text-green-400 text-xs">
                      Resolved: {new Date(comment.resolvedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 ml-4">
                <Link href={`/mentor-dashboard/stories/${comment.storyId._id}`}>
                  <button className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-gray-700 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </Link>
                <button className="text-gray-400 hover:text-gray-300 p-2 rounded-lg hover:bg-gray-700 transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredComments.length === 0 && !loading && (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-400 mb-2">No comments found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search criteria.' : 'You haven\'t made any comments yet.'}
          </p>
        </div>
      )}
    </div>
  );
}