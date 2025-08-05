'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  BookOpen,
  User,
  Calendar,
  MessageSquare,
  Eye,
  Edit,
  Plus,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface StoryDetails {
  _id: string;
  title: string;
  status: string;
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
  };
  comments: Array<{
    _id: string;
    comment: string;
    commentType: string;
    isResolved: boolean;
    createdAt: string;
    authorId: {
      firstName: string;
      lastName: string;
      role: string;
    };
  }>;
  content: string;
}

export default function StoryDetailPage({
  params,
}: {
  params: { storyId: string };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [story, setStory] = useState<StoryDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState('general');
  const [addingComment, setAddingComment] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }

    fetchStoryDetails();
  }, [session, status, router, params.storyId]);

  const fetchStoryDetails = async () => {
    try {
      const response = await fetch(`/api/admin/stories/${params.storyId}`);

      const data = await response.json();

      if (data.success) {
        setStory(data.story);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to fetch story details',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching story details:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch story details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a comment',
        variant: 'destructive',
      });
      return;
    }

    setAddingComment(true);
    try {
      const response = await fetch(`/api/stories/${params.storyId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId: params.storyId,
          comment: newComment,
          commentType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Comment added successfully',
        });
        setNewComment('');
        fetchStoryDetails(); // Refresh to show new comment
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to add comment',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    } finally {
      setAddingComment(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Loading story details...</div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-400 mb-2">
          Story not found
        </h3>
        <p className="text-gray-500">
          The story you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/admin/stories">
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Back to Stories
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <Link href="/admin/stories">
          <button className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Story Details</h1>
          <p className="text-gray-400">Review and manage story content</p>
        </div>
      </div>

      {/* Story Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-xl p-4 sm:p-6"
      >
        <div className="flex flex-col md:flex-row items-start justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">{story.title}</h2>
            <p className="text-gray-400">Story #{story.storyNumber}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span
                className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(story.status)}`}
              >
                {story.status}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">
              API Usage: {story.apiCallsUsed}/{story.maxApiCalls}
            </div>
            <div className="w-32 bg-gray-700 rounded-full h-2 mt-1">
              <div
                className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full"
                style={{
                  width: `${Math.min((story.apiCallsUsed / story.maxApiCalls) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Author Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-6 p-3 sm:p-4 bg-gray-700/50 rounded-lg">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {story.child && story.child.firstName ? story.child.firstName[0] : ''}
              {story.child && story.child.lastName ? story.child.lastName[0] : ''}
            </span>
          </div>
          <div>
            <h3 className="text-white font-medium">
              {story.child && story.child.firstName ? story.child.firstName : ''} {story.child && story.child.lastName ? story.child.lastName : ''}
            </h3>
            <p className="text-gray-400">{story.child && story.child.email ? story.child.email : ''}</p>
          </div>
            <Link href={`/admin/users/${story.child && story.child._id ? story.child._id : ''}`}>
            <button className="ml-auto text-blue-400 hover:text-blue-300 text-sm">
              View Profile
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {story.totalWords}
            </div>
            <div className="text-gray-400 text-sm">Total Words</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {story.childWords}
            </div>
            <div className="text-gray-400 text-sm">Child Words</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {story.comments.length}
            </div>
            <div className="text-gray-400 text-sm">Comments</div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-700">
          <div className="flex items-center space-x-1 text-gray-400">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">
              Created: {new Date(story.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center space-x-1 text-gray-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm">
              Updated: {new Date(story.updatedAt).toLocaleDateString()}
            </span>
          </div>
          {story.completedAt && (
            <div className="flex items-center space-x-1 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">
                Completed: {new Date(story.completedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Story Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800 rounded-xl p-4 sm:p-6"
      >
        <h3 className="text-lg font-medium text-white mb-4">Story Content</h3>
        <div className="bg-gray-700/50 rounded-lg p-4 max-h-96 overflow-y-auto">
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {story.content || 'No content available'}
          </p>
        </div>
      </motion.div>

      {/* Comments Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Existing Comments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-4 sm:p-6"
        >
          <h3 className="text-lg font-medium text-white mb-4">
            Comments ({story.comments.length})
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {story.comments.map((comment) => (
              <div key={comment._id} className="p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-white text-sm font-medium">
                      {comment.authorId.firstName} {comment.authorId.lastName}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs border ${getCommentTypeColor(comment.commentType)}`}
                    >
                      {comment.commentType}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {comment.isResolved ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-orange-400" />
                    )}
                  </div>
                </div>
                <p className="text-gray-300 text-sm">{comment.comment}</p>
                <p className="text-gray-400 text-xs mt-2">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
            {story.comments.length === 0 && (
              <p className="text-gray-400 text-center py-8">No comments yet</p>
            )}
          </div>
        </motion.div>

        {/* Add Comment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-xl p-4 sm:p-6"
        >
          <h3 className="text-lg font-medium text-white mb-4">Add Comment</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Comment Type
              </label>
              <select
                value={commentType}
                onChange={(e) => setCommentType(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">General</option>
                <option value="suggestion">Suggestion</option>
                <option value="correction">Correction</option>
                <option value="praise">Praise</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Comment
              </label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your comment..."
              />
            </div>

            <button
              onClick={addComment}
              disabled={!newComment.trim() || addingComment}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addingComment ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add Comment</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
