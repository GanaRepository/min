// app/children-dashboard/community/[id]/page.tsx - INDIVIDUAL STORY VIEW
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Heart,
  Bookmark,
  Share2,
  MessageCircle,
  Eye,
  Calendar,
  Star,
  Trophy,
  User,
  Award,
  Crown,
  Send,
  ThumbsUp,
  Flag,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface StoryDetails {
  _id: string;
  title: string;
  content: string;
  wordCount: number;
  storyType: 'freestyle' | 'uploaded' | 'competition';
  publishedAt: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    ageGroup: string;
    totalStories: number;
  };
  assessment: {
    overallScore: number;
    creativity: number;
    grammar: number;
    vocabulary: number;
    structure: number;
    characterDevelopment: number;
    plotDevelopment: number;
  };
  stats: {
    views: number;
    likes: number;
    comments: number;
    bookmarks: number;
  };
  tags: string[];
  genre: string;
  isFeatured: boolean;
  competitionWinner?: {
    position: number;
    competitionName: string;
    month: string;
  };
  isLikedByUser: boolean;
  isBookmarkedByUser: boolean;
  comments: Array<{
    _id: string;
    authorId: string;
    authorName: string;
    content: string;
    createdAt: string;
    likes: number;
    isLikedByUser: boolean;
  }>;
}

export default function CommunityStoryView() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const storyId = params.id as string;

  const [story, setStory] = useState<StoryDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchStoryDetails();
  }, [storyId]);

  const fetchStoryDetails = async () => {
    try {
      const response = await fetch(`/api/community/stories/${storyId}`);
      if (response.ok) {
        const data = await response.json();
        setStory(data.story);
        
        // Track view
        await fetch(`/api/community/stories/${storyId}/view`, {
          method: 'POST',
        });
      } else {
        router.push('/children-dashboard/community');
      }
    } catch (error) {
      console.error('Error fetching story:', error);
      router.push('/children-dashboard/community');
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async () => {
    if (!story) return;
    
    try {
      const response = await fetch(`/api/community/stories/${storyId}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setStory(prev => prev ? {
          ...prev,
          isLikedByUser: data.isLiked,
          stats: {
            ...prev.stats,
            likes: data.totalLikes
          }
        } : null);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const toggleBookmark = async () => {
    if (!story) return;
    
    try {
      const response = await fetch(`/api/community/stories/${storyId}/bookmark`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setStory(prev => prev ? {
          ...prev,
          isBookmarkedByUser: data.isBookmarked,
          stats: {
            ...prev.stats,
            bookmarks: data.totalBookmarks
          }
        } : null);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const submitComment = async () => {
    if (!newComment.trim() || submittingComment) return;

    try {
      setSubmittingComment(true);
      
      const response = await fetch(`/api/community/stories/${storyId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setStory(prev => prev ? {
          ...prev,
          comments: [data.comment, ...prev.comments],
          stats: {
            ...prev.stats,
            comments: prev.stats.comments + 1
          }
        } : null);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-white mb-2">Story Not Found</h3>
        <p className="text-gray-400 mb-4">The story you're looking for doesn't exist or has been removed.</p>
        <Link href="/children-dashboard/community">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            Back to Community
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/children-dashboard/community">
          <button className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{story.title}</h1>
          <p className="text-gray-400">Published story from the community</p>
        </div>
      </div>

      {/* Story Header Card */}
      <div className="bg-gray-800 rounded-xl p-6">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-4">
          {story.isFeatured && (
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-400">
              <Star className="w-4 h-4" />
              FEATURED STORY
            </div>
          )}
          {story.competitionWinner && (
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-orange-500/20 text-orange-400">
              <Crown className="w-4 h-4" />
              {story.competitionWinner.position === 1 ? '🥇 1st Place' : 
               story.competitionWinner.position === 2 ? '🥈 2nd Place' : '🥉 3rd Place'}
              <span className="ml-1">{story.competitionWinner.competitionName}</span>
            </div>
          )}
        </div>

        {/* Author Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-medium">
                {story.author.firstName[0]}{story.author.lastName[0]}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                {story.author.firstName} {story.author.lastName}
              </h3>
              <div className="text-gray-400 text-sm">
                {story.author.ageGroup} • {story.author.totalStories} stories published
              </div>
              <div className="text-gray-500 text-sm">
                Published on {new Date(story.publishedAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                story.isLikedByUser
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-gray-700 text-gray-400 hover:bg-red-500/20 hover:text-red-400'
              }`}
            >
              <Heart className={`w-5 h-5 ${story.isLikedByUser ? 'fill-current' : ''}`} />
              {story.stats.likes}
            </button>

            <button
              onClick={toggleBookmark}
              className={`p-2 rounded-lg transition-colors ${
                story.isBookmarkedByUser
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-gray-700 text-gray-400 hover:bg-yellow-500/20 hover:text-yellow-400'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${story.isBookmarkedByUser ? 'fill-current' : ''}`} />
            </button>

            <button className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white rounded-lg transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Story Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{story.wordCount.toLocaleString()}</div>
            <div className="text-gray-400 text-sm">Words</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{story.assessment.overallScore.toFixed(1)}/10</div>
            <div className="text-gray-400 text-sm">Overall Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{story.stats.views.toLocaleString()}</div>
            <div className="text-gray-400 text-sm">Views</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{story.stats.comments}</div>
            <div className="text-gray-400 text-sm">Comments</div>
          </div>
        </div>

        {/* Assessment Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">{story.assessment.creativity.toFixed(1)}</div>
            <div className="text-gray-400 text-sm">Creativity</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-400">{story.assessment.grammar.toFixed(1)}</div>
            <div className="text-gray-400 text-sm">Grammar</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-400">{story.assessment.vocabulary.toFixed(1)}</div>
            <div className="text-gray-400 text-sm">Vocabulary</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-400">{story.assessment.structure.toFixed(1)}</div>
            <div className="text-gray-400 text-sm">Structure</div>
          </div>
        </div>

        {/* Tags */}
        {story.tags.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-gray-400 text-sm">Tags:</span>
              {story.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Story Content */}
      <div className="bg-gray-800 rounded-xl p-8">
        <div className="prose prose-invert max-w-none">
          <div className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
            {story.content}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <MessageCircle className="w-6 h-6" />
          Comments ({story.stats.comments})
        </h3>

        {/* Add Comment */}
        {session && (
          <div className="mb-6">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {session.user.firstName?.[0]}{session.user.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="text-gray-400 text-sm">
                    {newComment.length}/500 characters
                  </div>
                  <button
                    onClick={submitComment}
                    disabled={!newComment.trim() || submittingComment}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {story.comments.map((comment, index) => (
            <motion.div
              key={comment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex gap-3 p-4 bg-gray-700 rounded-lg"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {comment.authorName.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white font-medium">{comment.authorName}</span>
                  <span className="text-gray-400 text-sm">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-300 mb-3">{comment.content}</p>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors">
                    <Heart className="w-4 h-4" />
                    {comment.likes}
                  </button>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    Reply
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {story.comments.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              No comments yet. Be the first to share your thoughts!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}