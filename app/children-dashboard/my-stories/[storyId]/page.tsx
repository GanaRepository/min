// app/children-dashboard/my-stories/[storyId]/page.tsx - FINAL VERSION
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Trophy,
  Upload,
  Sparkles,
  Star,
  DollarSign,
  Eye,
  Brain,
  MessageSquare,
  Calendar,
  Clock,
  User,
  FileText,
  Award,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Crown,
  Shield,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TerminalLoader from '@/components/TerminalLoader';
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from '@/components/ui/toast';

interface Story {
  _id: string;
  title: string;
  content?: string;
  aiOpening?: string;
  totalWords: number;
  childWords: number;
  aiWords: number;
  status: 'active' | 'completed' | 'flagged' | 'review';
  storyType: 'freestyle' | 'uploaded' | 'competition';
  isUploadedForAssessment: boolean;
  isPublished: boolean;
  publishedAt?: string;
  competitionEligible: boolean;
  competitionEntries: Array<{
    competitionId: string;
    submittedAt: string;
    rank?: number;
    score?: number;
    isWinner?: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
  assessment?: {
    overallScore: number;
    creativity: number;
    grammar: number;
    vocabulary: number;
    structure: number;
    integrityRisk: 'low' | 'medium' | 'high' | 'critical';
    feedback: string;
    recommendations: {
      strengths: string[];
      improvements: string[];
    };
  };
  assessmentAttempts: number;
  turns?: Array<{
    turnNumber: number;
    childInput: string;
    aiResponse: string;
    timestamp: string;
  }>;
  comments?: Array<{
    _id: string;
    content: string;
    authorId: {
      _id: string;
      firstName: string;
      lastName: string;
      role: string;
    } | null;
    createdAt: string;
    rating?: number;
  }>;
}

export default function StoryDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const storyId = params.storyId as string;

  // ===== STATE =====
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'assessment' | 'content' | 'comments'
  >('content');

  // Action states
  const [publishingStory, setPublishingStory] = useState(false);

  // Comment states
  const [newComment, setNewComment] = useState('');
  const [commentRating, setCommentRating] = useState(0);
  const [addingComment, setAddingComment] = useState(false);

  // ===== HELPER FUNCTIONS =====
  const isCompetitionNonWinner = useCallback(() => {
    return (
      story?.competitionEntries?.some(
        (entry) => entry.rank && entry.rank > 3
      ) || false
    );
  }, [story]);

  const shouldShowOverview = useCallback(() => {
    return story?.isPublished || story?.assessment || false;
  }, [story]);

  // ===== API CALLS =====
  const fetchStoryDetails = useCallback(async () => {
    if (!session?.user?.id || !storyId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/user/stories/${storyId}`);
      const data = await response.json();

      if (data.success) {
        setStory(data.story);
        setError(null);
      } else {
        throw new Error(data.error || 'Failed to fetch story');
      }
    } catch (error) {
      console.error('❌ Error fetching story:', error);
      setError('Failed to load story details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, storyId]);

  // ===== EFFECTS =====
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    if (status === 'authenticated' && storyId) {
      fetchStoryDetails();
    }
  }, [status, storyId, router, fetchStoryDetails]);

  // Add useEffect to set correct default tab after story loads
  useEffect(() => {
    if (story) {
      if (isCompetitionNonWinner()) {
        setActiveTab('content');
      } else if (shouldShowOverview()) {
        setActiveTab('overview');
      } else {
        setActiveTab('content');
      }
    }
  }, [story, isCompetitionNonWinner, shouldShowOverview]);

  // ===== STORY ACTIONS =====
  const handlePublishStory = async () => {
    if (!story || publishingStory) return;
    setPublishingStory(true);
    try {
      const response = await fetch('/api/stories/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: story._id }),
      });

      const data = await response.json();

      if (data.success) {
        setToastMessage('🎉 Story published to community showcase!');
        fetchStoryDetails(); // Refresh data
      } else {
        // Handle API errors properly
        const errorMessage = data.error || 'Failed to publish story';
        if (
          errorMessage.includes('3 stories per month') ||
          errorMessage.includes('publish 3 stories')
        ) {
          setToastMessage(
            `📚 Monthly Publication Limit Reached!\n\nYou can only publish 3 stories per month for free.\n\nYour limit will reset on the 1st of next month.`
          );
        } else if (errorMessage.includes('already published')) {
          setToastMessage(
            '📚 This story is already published to the community.'
          );
        } else {
          setToastMessage(`❌ Publication Failed\n\n${errorMessage}`);
        }
      }
    } catch (error) {
      // Only catch actual network/connection errors
      console.error('❌ Network error:', error);
      setToastMessage(
        '❌ Connection Error\n\nPlease check your internet connection and try again.'
      );
    } finally {
      setPublishingStory(false);
    }
  };

  const handlePurchaseStory = async () => {
    if (!story || !session?.user?.id) return;

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: 'story_purchase',
          storyId: story._id,
          userId: session.user.id,
        }),
      });

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('❌ Purchase error:', error);
      setToastMessage('Failed to start purchase process. Please try again.');
    }
  };

  const handleContinueWriting = () => {
    if (!story) return;
    router.push(`/children-dashboard/story/${story._id}`);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setAddingComment(true);

      const response = await fetch(`/api/stories/${story?._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment.trim(),
          rating: commentRating || undefined,
        }),
      });

      if (response.ok) {
        setNewComment('');
        setCommentRating(0);
        fetchStoryDetails(); // Refresh story data to show new comment
      } else {
        throw new Error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      setToastMessage('Failed to add comment. Please try again.');
    } finally {
      setAddingComment(false);
    }
  };

  // ===== HELPER FUNCTIONS =====
  const getStoryTypeInfo = (story: Story) => {
    if (story.competitionEntries && story.competitionEntries.length > 0) {
      return {
        label: 'Competition Entry',
        icon: Trophy,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/20',
        borderColor: 'border-purple-500/30',
      };
    }
    if (story.isUploadedForAssessment) {
      return {
        label: 'Uploaded for Assessment',
        icon: Upload,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500/30',
      };
    }
    return {
      label: 'Freestyle Story',
      icon: Sparkles,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getIntegrityIcon = (integrityRisk?: string) => {
    switch (integrityRisk) {
      case 'low':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  // Check if user should see assessment tab based on competition status
  const shouldShowAssessment = () => {
    if (!story) return false;

    // For competition stories, only show assessment if they're a winner
    if (story.competitionEntries && story.competitionEntries.length > 0) {
      return story.competitionEntries.some(
        (entry) => entry.isWinner || (entry.rank && entry.rank <= 3)
      );
    }

    // For non-competition stories, show if assessment exists
    return !!story.assessment;
  };

  // Get available tabs based on story type and status
  const getAvailableTabs = () => {
    if (isCompetitionNonWinner()) {
      // Competition non-winners: only show content and comments
      return [
        { id: 'content', label: 'Content', icon: BookOpen },
        { id: 'comments', label: 'Comments', icon: MessageSquare },
      ];
    }

    // Winners and non-competition stories: show tabs as appropriate
    const baseTabs = [];

    if (shouldShowOverview()) {
      baseTabs.push({ id: 'overview', label: 'Overview', icon: Eye });
    }

    if (shouldShowAssessment()) {
      baseTabs.push({ id: 'assessment', label: 'Assessment', icon: Brain });
    }

    baseTabs.push(
      { id: 'content', label: 'Content', icon: BookOpen },
      { id: 'comments', label: 'Comments', icon: MessageSquare }
    );

    return baseTabs;
  };

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <TerminalLoader loadingText="Loading story details..." />
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (error || !story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl  text-white mb-2">Story Not Found</h2>
          <p className="text-gray-300 mb-6">
            {error ||
              "The story you're looking for doesn't exist or you don't have access to it."}
          </p>
          <Link
            href="/children-dashboard/my-stories"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3  transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to My Stories
          </Link>
        </div>
      </div>
    );
  }

  const typeInfo = getStoryTypeInfo(story);

  // ===== MAIN RENDER =====
  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <Link
                href="/children-dashboard/my-stories"
                className="bg-gray-700 hover:bg-gray-600 text-white p-2  transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
              <div className="flex-1">
                <h1 className="text-3xl  text-white mb-1">{story.title}</h1>
                <div className="flex items-center gap-3">
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1  text-sm  ${typeInfo.bgColor} ${typeInfo.color} ${typeInfo.borderColor} border`}
                  >
                    <typeInfo.icon size={14} />
                    {typeInfo.label}
                  </div>
                  <span className="text-gray-400 text-sm">
                    {story.totalWords} words • Created{' '}
                    {new Date(story.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Story Stats & Status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-4">
                <div className="text-lg  text-white">{story.totalWords}</div>
                <div className="text-gray-300 text-sm">Total Words</div>
              </div>
              <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-4">
                <div className="text-lg  text-green-400">
                  {story.childWords}
                </div>
                <div className="text-gray-300 text-sm">Your Words</div>
              </div>
              <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-4">
                <div className="text-lg  text-blue-400">{story.aiWords}</div>
                <div className="text-gray-300 text-sm">AI Words</div>
              </div>
              <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-4">
                <div
                  className={`text-lg  ${story.assessment ? getScoreColor(story.assessment.overallScore) : 'text-gray-400'}`}
                >
                  {story.assessment
                    ? `${story.assessment.overallScore}%`
                    : 'Not Assessed'}
                </div>
                <div className="text-gray-300 text-sm">Overall Score</div>
              </div>
            </div>

            {/* Status Badges & Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {story.isPublished && (
                  <span className="bg-green-500/20 text-green-300 px-3 py-1  text-sm  border border-green-500/30 flex items-center gap-2">
                    <Star size={14} />
                    Published
                    {story.publishedAt && (
                      <span className="text-xs opacity-75">
                        {new Date(story.publishedAt).toLocaleDateString()}
                      </span>
                    )}
                  </span>
                )}

                {story.competitionEntries &&
                  story.competitionEntries.length > 0 && (
                    <div className="flex gap-2">
                      {story.competitionEntries.map((entry, index) => (
                        <span
                          key={index}
                          className="bg-purple-500/20 text-purple-300 px-3 py-1  text-sm  border border-purple-500/30 flex items-center gap-2"
                        >
                          <Trophy size={14} />
                          Competition Entry
                          {entry.rank && entry.rank <= 3 && (
                            <Crown size={14} className="text-yellow-400" />
                          )}
                          {entry.rank && (
                            <span className="text-xs bg-purple-600/40 px-2 py-0.5 rounded">
                              Rank #{entry.rank}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}

                {story.status === 'flagged' && (
                  <span className="bg-red-500/20 text-red-400 px-3 py-1  text-sm  border border-red-500/30">
                    Flagged for Review
                  </span>
                )}

                {story.status === 'review' && (
                  <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1  text-sm  border border-yellow-500/30">
                    Under Review
                  </span>
                )}

                {story.status === 'active' && (
                  <span className="bg-blue-500/20 text-blue-400 px-3 py-1  text-sm  border border-blue-500/30">
                    In Progress
                  </span>
                )}
              </div>

              {/* Action Buttons - NO REASSESS, NO DELETE */}
              <div className="flex flex-wrap gap-3">
                {story.status === 'active' && (
                  <button
                    onClick={handleContinueWriting}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3   transition-all flex items-center gap-2"
                  >
                    <BookOpen size={18} />
                    Continue Writing
                  </button>
                )}

                {/* Publish Button - Show for ALL completed stories (including flagged) */}
                {story.status === 'completed' && !story.isPublished && (
                  <button
                    onClick={handlePublishStory}
                    disabled={publishingStory}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3   transition-all flex items-center gap-2"
                  >
                    {publishingStory ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent  animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Star size={18} />
                        Publish Free
                      </>
                    )}
                  </button>
                )}

                {/* Purchase Button - Show for ALL completed stories */}
                {story.status === 'completed' && (
                  <button
                    onClick={handlePurchaseStory}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3   transition-all flex items-center gap-2"
                  >
                    <DollarSign size={18} />
                    Purchase $10
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Competition Entry Details */}
          {story.competitionEntries && story.competitionEntries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <div className="bg-purple-500/10 border border-purple-500/20  p-6">
                <h3 className="text-lg  text-white mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-purple-400" />
                  Competition Details
                </h3>

                <div className="space-y-4">
                  {story.competitionEntries.map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-purple-500/5  p-4"
                    >
                      <div>
                        <div className="text-white ">
                          Submitted on{' '}
                          {new Date(entry.submittedAt).toLocaleDateString()}
                        </div>
                        <div className="text-purple-300 text-sm">
                          Competition Entry #{index + 1}
                        </div>
                      </div>
                      <div className="text-right">
                        {entry.rank && entry.rank <= 3 && (
                          <div className="flex items-center gap-2 text-yellow-400 ">
                            <Crown size={16} />
                            Winner - Rank #{entry.rank}
                          </div>
                        )}
                        {entry.rank && entry.rank > 3 && (
                          <div className="text-purple-300">
                            Rank #{entry.rank}
                          </div>
                        )}
                        {entry.score && (
                          <div className="text-purple-400 text-sm">
                            Score: {entry.score.toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ===== TAB NAVIGATION ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex justify-center">
              <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-2 flex gap-2">
                {getAvailableTabs().map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-3  transition-all flex items-center gap-2  ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ===== TAB CONTENT ===== */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-8">
                <h2 className="text-2xl  text-white mb-6">Story Overview</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg  text-white mb-3">
                        Writing Statistics
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Total Words:</span>
                          <span className="text-white ">
                            {story.totalWords}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">
                            Your Contribution:
                          </span>
                          <span className="text-green-400 ">
                            {story.childWords} words
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">AI Assistance:</span>
                          <span className="text-blue-400 ">
                            {story.aiWords} words
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">
                            Your Contribution:
                          </span>
                          <span className="text-yellow-400 ">
                            {story.totalWords > 0
                              ? Math.round(
                                  (story.childWords / story.totalWords) * 100
                                )
                              : 0}
                            %
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg  text-white mb-3">
                        Story Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Created:</span>
                          <span className="text-white">
                            {new Date(story.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Last Updated:</span>
                          <span className="text-white">
                            {new Date(story.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Status:</span>
                          <span
                            className={` capitalize ${
                              story.status === 'completed'
                                ? 'text-green-400'
                                : story.status === 'active'
                                  ? 'text-blue-400'
                                  : story.status === 'flagged'
                                    ? 'text-red-400'
                                    : 'text-yellow-400'
                            }`}
                          >
                            {story.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Type:</span>
                          <span className="text-white capitalize">
                            {story.storyType}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Assessment Overview - Only show if assessment should be visible */}
                    {shouldShowAssessment() && story.assessment && (
                      <div>
                        <h3 className="text-lg  text-white mb-3 flex items-center gap-2">
                          <Brain className="w-5 h-5 text-blue-400" />
                          Assessment Summary
                        </h3>
                        <div className="bg-gray-700/30  p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">
                              Overall Score:
                            </span>
                            <div className="flex items-center gap-2">
                              {getIntegrityIcon(story.assessment.integrityRisk)}
                              <span
                                className={`text-xl  ${getScoreColor(story.assessment.overallScore)}`}
                              >
                                {story.assessment.overallScore}%
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Grammar:</span>
                              <span
                                className={getScoreColor(
                                  story.assessment.grammar
                                )}
                              >
                                {story.assessment.grammar}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Creativity:</span>
                              <span
                                className={getScoreColor(
                                  story.assessment.creativity
                                )}
                              >
                                {story.assessment.creativity}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Vocabulary:</span>
                              <span
                                className={getScoreColor(
                                  story.assessment.vocabulary
                                )}
                              >
                                {story.assessment.vocabulary}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Structure:</span>
                              <span
                                className={getScoreColor(
                                  story.assessment.structure || 0
                                )}
                              >
                                {story.assessment.structure || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Competition Status */}
                    {story.competitionEntries &&
                      story.competitionEntries.length > 0 && (
                        <div>
                          <h3 className="text-lg  text-white mb-3 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-purple-400" />
                            Competition Status
                          </h3>
                          <div className="bg-purple-500/10  p-4 space-y-3">
                            {story.competitionEntries.map((entry, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between"
                              >
                                <div>
                                  <div className="text-white ">
                                    Entry #{index + 1}
                                  </div>
                                  <div className="text-purple-300 text-sm">
                                    {new Date(
                                      entry.submittedAt
                                    ).toLocaleDateString()}
                                  </div>
                                </div>
                                <div className="text-right">
                                  {entry.rank && entry.rank <= 3 ? (
                                    <div className="flex items-center gap-2 text-yellow-400 ">
                                      <Crown size={16} />
                                      Winner!
                                    </div>
                                  ) : entry.rank ? (
                                    <div className="text-purple-300">
                                      Rank #{entry.rank}
                                    </div>
                                  ) : (
                                    <div className="text-gray-400">
                                      Results Pending
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Publication Status */}
                    {story.isPublished && (
                      <div>
                        <h3 className="text-lg  text-white mb-3 flex items-center gap-2">
                          <Star className="w-5 h-5 text-green-400" />
                          Publication Status
                        </h3>
                        <div className="bg-green-500/10  p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">Published:</span>
                            <span className="text-green-400 ">
                              {story.publishedAt
                                ? new Date(
                                    story.publishedAt
                                  ).toLocaleDateString()
                                : 'Yes'}
                            </span>
                          </div>
                          <div className="mt-2">
                            <Link
                              href="/children-dashboard/community"
                              className="text-green-400 hover:text-green-300 text-sm underline"
                            >
                              View in Community Showcase →
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'assessment' &&
              shouldShowAssessment() &&
              story.assessment && (
                <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-8">
                  <div className="text-center">
                    <Brain className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    <h2 className="text-2xl  text-white mb-4">
                      Assessment Results Available
                    </h2>
                    <p className="text-gray-300 mb-6">
                      Your story has been assessed! View the detailed results including scores, feedback, and recommendations.
                    </p>
                    <Link
                      href={`/children-dashboard/my-stories/${story._id}/assessment`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg transition-colors inline-flex items-center gap-2 text-lg font-medium"
                    >
                      <Brain size={20} />
                      View Detailed Assessment
                    </Link>
                  </div>
                </div>
              )}

            {activeTab === 'content' && (
              <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-8">
                <h2 className="text-2xl  text-white mb-6 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-green-400" />
                  Story Content
                </h2>

                <div className="space-y-6">
                  {/* Story Content Display */}
                  {story.isUploadedForAssessment && story.aiOpening ? (
                    // Uploaded story content
                    <div className="bg-gray-700/30  p-6">
                      <h3 className="text-lg  text-white mb-4">
                        Uploaded Story
                      </h3>
                      <div className="prose prose-invert max-w-none">
                        <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {story.aiOpening}
                        </div>
                      </div>
                    </div>
                  ) : story.turns && story.turns.length > 0 ? (
                    // Collaborative story with turns
                    <div className="space-y-4">
                      <h3 className="text-lg  text-white mb-4">
                        Collaborative Story
                      </h3>
                      {story.turns.map((turn, index) => (
                        <div key={index} className="space-y-3">
                          {turn.childInput && (
                            <div className="bg-green-500/10 border-l-4 border-green-500 rounded-r-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <User className="w-4 h-4 text-green-400" />
                                <span className="text-green-400  text-sm">
                                  Your Turn {turn.turnNumber}
                                </span>
                              </div>
                              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {turn.childInput}
                              </div>
                            </div>
                          )}

                          {turn.aiResponse && (
                            <div className="bg-blue-500/10 border-l-4 border-blue-500 rounded-r-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Brain className="w-4 h-4 text-blue-400" />
                                <span className="text-blue-400  text-sm">
                                  AI Response
                                </span>
                              </div>
                              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {turn.aiResponse}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : story.content ? (
                    // Simple content field
                    <div className="bg-gray-700/30  p-6">
                      <div className="prose prose-invert max-w-none">
                        <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {story.content}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">
                        No content available to display.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-8">
                <h2 className="text-2xl  text-white mb-6 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-blue-400" />
                  Comments & Discussion
                </h2>

                {/* Comments List */}
                <div className="space-y-4 mb-6">
                  {story.comments && story.comments.length > 0 ? (
                    story.comments.map((comment) => (
                      <div key={comment._id} className="bg-gray-700/30  p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600  flex items-center justify-center">
                              <span className="text-white text-xs ">
                                {comment.authorId?.firstName?.[0]}
                                {comment.authorId?.lastName?.[0]}
                              </span>
                            </div>
                            <div>
                              <div className="text-white  text-sm">
                                {comment.authorId?.firstName}{' '}
                                {comment.authorId?.lastName}
                                <span
                                  className={`ml-2 px-2 py-1  text-xs ${
                                    comment.authorId?.role === 'admin'
                                      ? 'bg-red-500/20 text-red-400'
                                      : comment.authorId?.role === 'mentor'
                                        ? 'bg-blue-500/20 text-blue-400'
                                        : 'bg-green-500/20 text-green-400'
                                  }`}
                                >
                                  {comment.authorId?.role}
                                </span>
                              </div>
                              <div className="text-gray-400 text-xs">
                                {new Date(
                                  comment.createdAt
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-gray-300 leading-relaxed">
                          {comment.content}
                        </div>
                        {comment.rating && (
                          <div className="flex items-center gap-1 mt-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < comment.rating!
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-600'
                                }`}
                              />
                            ))}
                            <span className="text-sm text-gray-400 ml-1">
                              ({comment.rating}/5)
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <h3 className="text-lg  text-gray-400 mb-2">
                        No Comments Yet
                      </h3>
                      <p className="text-gray-500">
                        This story hasn&apos;t received any comments from
                        mentors or admins yet.
                      </p>
                    </div>
                  )}
                </div>

                {/* Comment Form (only for mentors/admins) */}
                {session?.user?.role === 'mentor' ||
                session?.user?.role === 'admin' ? (
                  <div className="border-t border-gray-600/30 pt-6">
                    <form onSubmit={handleAddComment} className="space-y-4">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add your feedback or comment..."
                        className="w-full p-3 bg-gray-700/50 border border-gray-600/30  text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm">Rating:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setCommentRating(star)}
                                className={`p-1 ${
                                  star <= commentRating
                                    ? 'text-yellow-400'
                                    : 'text-gray-600'
                                }`}
                              >
                                <Star
                                  className="w-5 h-5"
                                  fill={
                                    star <= commentRating
                                      ? 'currentColor'
                                      : 'none'
                                  }
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={!newComment.trim() || addingComment}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2   transition-colors"
                        >
                          {addingComment ? 'Adding...' : 'Add Comment'}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="border-t border-gray-600/30 pt-6 text-center">
                    <p className="text-gray-400">
                      Only mentors and admins can add comments.
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
      {toastMessage && (
        <Toast>
          <ToastTitle>
            {toastMessage.includes('🎉')
              ? 'Success!'
              : toastMessage.includes('📚')
                ? 'Info'
                : 'Error'}
          </ToastTitle>
          <ToastDescription>{toastMessage}</ToastDescription>
          <ToastClose onClick={() => setToastMessage(null)} />
        </Toast>
      )}
      <ToastViewport />
    </ToastProvider>
  );
}
