'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { MessageSquare, User, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Comment {
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
  resolvedAt?: string;
  position?: {
    paragraph: number;
    sentence: number;
  };
}

interface StoryCommentsProps {
  storyId: string;
  isOwnStory: boolean;
}

export default function StoryComments({ storyId, isOwnStory }: StoryCommentsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unresolved'>('all');

  useEffect(() => {
    fetchComments();
  }, [storyId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/stories/${storyId}/comments`);
      const data = await response.json();

      if (data.success) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredComments = comments.filter(comment => {
    if (filter === 'unresolved') {
      return !comment.isResolved;
    }
    return true;
  });

  const getCommentTypeColor = (type: string) => {
    switch (type) {
      case 'grammar': return 'from-red-500/20 to-red-600/20 border-red-500/30';
      case 'creativity': return 'from-purple-500/20 to-purple-600/20 border-purple-500/30';
      case 'structure': return 'from-blue-500/20 to-blue-600/20 border-blue-500/30';
      case 'suggestion': return 'from-green-500/20 to-green-600/20 border-green-500/30';
      default: return 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
    }
  };

  const getCommentTypeIcon = (type: string) => {
    switch (type) {
      case 'grammar': return '📝';
      case 'creativity': return '🎨';
      case 'structure': return '🏗️';
      case 'suggestion': return '💡';
      default: return '💬';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isOwnStory && session?.user.role === 'child') {
    return null; // Children can only see comments on their own stories
  }

  return (
    <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <MessageSquare className="w-6 h-6 mr-2 text-blue-400" />
          Teacher Feedback ({comments.length})
        </h3>

        {comments.length > 0 && (
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All ({comments.length})
            </button>
            <button
              onClick={() => setFilter('unresolved')}
              className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                filter === 'unresolved' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Needs Action ({comments.filter(c => !c.isResolved).length})
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {filteredComments.length > 0 ? (
          <div className="space-y-4">
            {filteredComments.map((comment, index) => (
              <motion.div
                key={comment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-r ${getCommentTypeColor(comment.commentType)} border rounded-xl p-4`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-300" />
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {comment.authorId.firstName} {comment.authorId.lastName}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <span className="capitalize">{comment.authorId.role}</span>
                        <span>•</span>
                        <span>{getCommentTypeIcon(comment.commentType)} {comment.commentType}</span>
                        <span>•</span>
                        <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {comment.isResolved ? (
                      <div className="flex items-center space-x-1 bg-green-500/20 border border-green-500/30 rounded-full px-2 py-1">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span className="text-green-400 text-xs">Resolved</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 bg-orange-500/20 border border-orange-500/30 rounded-full px-2 py-1">
                        <Clock className="w-3 h-3 text-orange-400" />
                        <span className="text-orange-400 text-xs">Open</span>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-gray-200 leading-relaxed">{comment.comment}</p>

                {comment.position && (
                  <div className="mt-2 text-xs text-gray-400">
                    📍 Paragraph {comment.position.paragraph}, Sentence {comment.position.sentence}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              {filter === 'unresolved' 
                ? 'No pending feedback! You\'re all caught up! 🎉' 
                : 'No teacher feedback yet. Keep writing great stories!'
              }
            </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}