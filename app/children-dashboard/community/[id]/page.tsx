// app/children-dashboard/community/[id]/page.tsx - FIXED INDIVIDUAL STORY VIEW
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
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
  // ...existing code...
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
        console.error('Failed to fetch story:', await response.text());
        router.push('/children-dashboard/community');
      }
    } catch (error) {
      console.error('Error fetching story:', error);
      router.push('/children-dashboard/community');
    } finally {
      setLoading(false);
    }
  };

  // Removed like and bookmark handlers

  const submitComment = async () => {
    if (!newComment.trim() || submittingComment) return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    try {
      setSubmittingComment(true);

      const response = await fetch(
        `/api/community/stories/${storyId}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: newComment.trim() }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStory((prev) =>
          prev
            ? {
                ...prev,
                comments: [data.comment, ...prev.comments],
                stats: {
                  ...prev.stats,
                  comments: prev.stats.comments + 1,
                },
              }
            : null
        );
        setNewComment('');
      } else {
        console.error('Failed to submit comment:', await response.text());
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitComment();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600  animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl  text-white mb-2">Story Not Found</h3>
        <p className="text-gray-400 mb-4">
          The story you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/children-dashboard/community">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white  transition-colors">
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
          <button className="p-2 bg-gray-800 hover:bg-gray-700 text-white  transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl  text-white">{story.title}</h1>
          <p className="text-gray-400">Published story from the community</p>
        </div>
      </div>

      {/* Story Header Card */}
      <div className="bg-gray-800  p-6">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-4">
          {story.isFeatured && (
            <div className="inline-flex items-center gap-1 px-3 py-1  text-sm  bg-yellow-500/20 text-yellow-400">
              <Star className="w-4 h-4" />
              FEATURED STORY
            </div>
          )}
          {story.competitionWinner && (
            <div className="inline-flex items-center gap-1 px-3 py-1  text-sm  bg-orange-500/20 text-orange-400">
              <Crown className="w-4 h-4" />
              {story.competitionWinner.position === 1
                ? '🥇 1st Place'
                : story.competitionWinner.position === 2
                  ? '🥈 2nd Place'
                  : '🥉 3rd Place'}
            </div>
          )}
          <div className="inline-flex items-center gap-1 px-3 py-1  text-sm  bg-blue-500/20 text-blue-400">
            {story.storyType === 'competition'
              ? 'Competition Entry'
              : story.storyType === 'uploaded'
                ? 'Uploaded Story'
                : 'Freestyle Story'}
          </div>
        </div>

        {/* Author Info */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600  flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg  text-white">
              {story.author.firstName} {story.author.lastName}
            </h3>
            <p className="text-gray-400 text-sm">
              Age Group: {story.author.ageGroup} • Genre: {story.genre}
            </p>
          </div>
        </div>

        {/* Story Stats */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-xl  text-blue-400">{story.stats.views}</div>
            <div className="text-sm text-gray-400">Views</div>
          </div>
          <div className="text-center">
            <div className="text-xl  text-red-400">{story.stats.likes}</div>
            <div className="text-sm text-gray-400">Likes</div>
          </div>
          <div className="text-center">
            <div className="text-xl  text-green-400">
              {story.stats.comments}
            </div>
            <div className="text-sm text-gray-400">Comments</div>
          </div>
          <div className="text-center">
            <div className="text-xl  text-purple-400">{story.wordCount}</div>
            <div className="text-sm text-gray-400">Words</div>
          </div>
        </div>

        {/* Assessment Scores */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl  text-blue-400">
              {story.assessment.overallScore}
            </div>
            <div className="text-xs text-gray-400">Overall</div>
          </div>
          <div className="text-center">
            <div className="text-2xl  text-purple-400">
              {story.assessment.creativity}
            </div>
            <div className="text-xs text-gray-400">Creativity</div>
          </div>
          <div className="text-center">
            <div className="text-2xl  text-green-400">
              {story.assessment.grammar}
            </div>
            <div className="text-xs text-gray-400">Grammar</div>
          </div>
          <div className="text-center">
            <div className="text-2xl  text-yellow-400">
              {story.assessment.vocabulary}
            </div>
            <div className="text-xs text-gray-400">Vocabulary</div>
          </div>
          <div className="text-center">
            <div className="text-2xl  text-orange-400">
              {story.assessment.structure}
            </div>
            <div className="text-xs text-gray-400">Structure</div>
          </div>
          <div className="text-center">
            <div className="text-2xl  text-pink-400">
              {story.assessment.characterDevelopment}
            </div>
            <div className="text-xs text-gray-400">Character</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Like and Bookmark buttons removed */}

            <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white  text-sm  transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>

          <div className="text-sm text-gray-400">
            Published {new Date(story.publishedAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Story Content */}
      <div className="bg-gray-800  p-6">
        <h2 className="text-xl  text-white mb-4">Story</h2>
        <div className="prose prose-gray max-w-none">
          {story.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-gray-300 leading-relaxed mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-gray-800  p-6">
        <h2 className="text-xl  text-white mb-4">
          Comments ({story.stats.comments})
        </h2>

        {/* Add Comment */}
        {session ? (
          <div className="mb-6">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600  flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share your thoughts about this story..."
                  className="w-full p-3 bg-gray-700 border border-gray-600  text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
                  rows={3}
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="text-sm text-gray-400">
                    Press Enter to submit, Shift+Enter for new line
                  </div>
                  <button
                    onClick={submitComment}
                    disabled={!newComment.trim() || submittingComment}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white  text-sm  transition-colors"
                  >
                    {submittingComment ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white  animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-gray-700  text-center">
            <p className="text-gray-400 mb-3">
              Sign in to join the conversation!
            </p>
            <Link href="/auth/signin">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white  transition-colors">
                Sign In
              </button>
            </Link>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {story.comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-400">
                No comments yet. Be the first to share your thoughts!
              </p>
            </div>
          ) : (
            story.comments.map((comment) => (
              <motion.div
                key={comment._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 p-4 bg-gray-700/50 "
              >
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600  flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className=" text-white">{comment.authorName}</span>
                    <span className="text-sm text-gray-400">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    {comment.content}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-400 transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      {comment.likes}
                    </button>
                    <button className="text-sm text-gray-400 hover:text-white transition-colors">
                      Reply
                    </button>
                    <button className="text-sm text-gray-400 hover:text-yellow-400 transition-colors">
                      <Flag className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
