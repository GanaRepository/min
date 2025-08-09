// app/admin/comments/[id]/page.tsx - COMPLETE FIXED VERSION
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
  Flag,
  Eye,
  Trash2,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface CommentDetails {
  _id: string;
  comment: string;
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
    storyNumber: number;
    childId: {  // FIXED: Changed from 'child' to 'childId'
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

export default function ViewComment() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const commentId = params.id as string;

  const [comment, setComment] = useState<CommentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
      const response = await fetch(`/api/admin/comments/${commentId}`);
      const data = await response.json();
      
      if (data.success) {
        setComment(data.comment);
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
        setComment(prev => prev ? { ...prev, isResolved } : null);
        alert(`Comment marked as ${isResolved ? 'resolved' : 'unresolved'}`);
      } else {
        alert('Failed to update comment status');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Failed to update comment status');
    } finally {
      setUpdating(false);
    }
  };

  const deleteComment = async () => {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Comment deleted successfully');
        router.push('/admin/comments');
      } else {
        alert('Failed to delete comment: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    } finally {
      setDeleting(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'mentor': return 'bg-purple-100 text-purple-800';
      case 'child': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCommentTypeColor = (type: string) => {
    switch (type) {
      case 'admin_feedback': return 'bg-red-100 text-red-800';
      case 'grammar': return 'bg-yellow-100 text-yellow-800';
      case 'creativity': return 'bg-purple-100 text-purple-800';
      case 'structure': return 'bg-blue-100 text-blue-800';
      case 'suggestion': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Loading comment details...</div>
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

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/comments">
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Comment Details
            </h1>
            <p className="text-gray-400">Manage and moderate comment</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => updateCommentStatus(!comment.isResolved)}
            disabled={updating}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50 ${
              comment.isResolved
                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {comment.isResolved ? <X size={16} className="mr-2" /> : <Check size={16} className="mr-2" />}
            {updating ? 'Updating...' : comment.isResolved ? 'Mark Unresolved' : 'Mark Resolved'}
          </button>
          <button
            onClick={deleteComment}
            disabled={deleting}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
          >
            <Trash2 size={16} className="mr-2" />
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Comment Info Card */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-3 rounded-lg">
              <User size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Author</p>
              <p className="text-white font-medium">
                {comment.authorId.firstName} {comment.authorId.lastName}
              </p>
              <p className="text-xs text-gray-400">{comment.authorId.email}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-purple-600 p-3 rounded-lg">
              <MessageSquare size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Type</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCommentTypeColor(comment.commentType)}`}>
                {comment.commentType}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${comment.isResolved ? 'bg-green-600' : 'bg-red-600'}`}>
              {comment.isResolved ? <Check size={24} className="text-white" /> : <X size={24} className="text-white" />}
            </div>
            <div>
              <p className="text-sm text-gray-400">Status</p>
              <p className={`font-medium ${comment.isResolved ? 'text-green-400' : 'text-red-400'}`}>
                {comment.isResolved ? 'Resolved' : 'Unresolved'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-600 p-3 rounded-lg">
              <Calendar size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Created</p>
              <p className="text-white font-medium">
                {new Date(comment.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Comment Content */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {comment.authorId.firstName[0]}{comment.authorId.lastName[0]}
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-white font-medium">
                  {comment.authorId.firstName} {comment.authorId.lastName}
                </h3>
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
          <div className="text-right">
            <p className="text-gray-400 text-sm">
              {new Date(comment.createdAt).toLocaleString()}
            </p>
            <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
              comment.isResolved 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {comment.isResolved ? 'Resolved' : 'Unresolved'}
            </span>
          </div>
        </div>
        
        <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
          <p className="text-white whitespace-pre-wrap">{comment.comment}</p>
        </div>

        {/* Story Context */}
        <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-700">
          <h4 className="text-white font-medium mb-2">Story Context</h4>
          <div className="flex items-center justify-between">
            <div>
              {/* FIXED: Changed from comment.storyId.child to comment.storyId.childId */}
              <p className="text-white">"{comment.storyId.title}" by {comment.storyId.childId.firstName} {comment.storyId.childId.lastName}</p>
              <p className="text-gray-400 text-sm">Story #{comment.storyId.storyNumber}</p>
            </div>
            <Link href={`/admin/stories/${comment.storyId._id}`}>
              <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm">
                <Eye size={14} className="mr-1" />
                View Story
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Replies Section */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Replies ({comment.replies.length})</h3>
          <div className="space-y-4">
            {comment.replies.map((reply) => (
              <motion.div
                key={reply._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-700/50 rounded-lg p-4 ml-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-white">
                        {reply.authorId.firstName[0]}{reply.authorId.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-white font-medium text-sm">
                          {reply.authorId.firstName} {reply.authorId.lastName}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(reply.authorId.role)}`}>
                          {reply.authorId.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {new Date(reply.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-300 whitespace-pre-wrap">{reply.comment}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}