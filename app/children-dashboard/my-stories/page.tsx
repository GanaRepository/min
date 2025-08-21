// app/children-dashboard/my-stories/page.tsx - FINAL VERSION
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trophy,
  Upload,
  Star,
  Eye,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Shield,
  Clock,
  Award,
  FileText,
  Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TerminalLoader from '@/components/TerminalLoader';

// ===== INTERFACES =====
interface Story {
  _id: string;
  title: string;
  totalWords: number;
  childWords: number;
  aiWords: number;
  status: 'active' | 'completed' | 'flagged' | 'review';
  createdAt: string;
  updatedAt: string;
  storyType: 'freestyle' | 'uploaded' | 'competition';
  isUploadedForAssessment: boolean;
  isPublished: boolean;
  competitionEligible: boolean;
  competitionEntries: Array<{
    competitionId: string;
    submittedAt: string;
    rank?: number;
    score?: number;
  }>;
  assessment?: {
    overallScore: number;
    creativity: number;
    grammar: number;
    vocabulary: number;
    integrityRisk: 'low' | 'medium' | 'high' | 'critical';
  };
  assessmentAttempts: number;
  maxAssessmentAttempts: number;
  physicalAnthology?: {
    purchased: boolean;
    purchaseDate?: string;
    stripeSessionId?: string;
    amount?: number;
  };
}

interface StorySummary {
  total: number;
  completed: number;
  active: number;
  flagged: number;
  review: number;
  published: number;
  freestyle: number;
  uploaded: number;
  competition: number;
  totalWords: number;
  totalChildWords: number;
  averageScore: number | null;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function MyStoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ===== STATE =====
  const [stories, setStories] = useState<Story[]>([]);
  const [summary, setSummary] = useState<StorySummary | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('search') || ''
  );
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get('status') || 'all'
  );
  const [typeFilter, setTypeFilter] = useState<string>(
    searchParams.get('type') || 'all'
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  // Action states
  const [publishingStory, setPublishingStory] = useState<string | null>(null);

  // ===== EFFECTS =====
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    if (status === 'authenticated') {
      fetchStories();
    }
  }, [status, currentPage, searchTerm, statusFilter, typeFilter]);

  // ===== API CALLS =====
  const fetchStories = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
      });

      const response = await fetch(`/api/user/stories?${params}`);
      const data = await response.json();

      if (data.success) {
        setStories(data.stories || []);
        setSummary(data.summary);
        setPagination(data.pagination);
        setError(null);
      } else {
        throw new Error(data.error || 'Failed to fetch stories');
      }
    } catch (error) {
      console.error('❌ Error fetching stories:', error);
      setError('Failed to load stories. Please try again.');
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  // ===== STORY ACTIONS =====
  const handlePublishStory = async (storyId: string) => {
    if (!session?.user?.id) return;
    setPublishingStory(storyId);
    try {
      const response = await fetch('/api/stories/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: storyId }),
      });

      const data = await response.json();

      if (data.success) {
        alert('🎉 Story published to community showcase!');
        fetchStories(); // Refresh data
      } else {
        // Handle API errors properly
        const errorMessage = data.error || 'Failed to publish story';
        if (
          errorMessage.includes('3 stories per month') ||
          errorMessage.includes('publish 3 stories')
        ) {
          alert(
            `📚 Monthly Publication Limit Reached!\n\nYou can only publish 3 stories per month for free.\n\nYour limit will reset on the 1st of next month.`
          );
        } else if (errorMessage.includes('already published')) {
          alert('ℹ️ This story is already published to the community.');
        } else {
          alert(`❌ Publication Failed\n\n${errorMessage}`);
        }
      }
    } catch (error) {
      // Only catch actual network/connection errors
      console.error('❌ Network error:', error);
      alert(
        '❌ Connection Error\n\nPlease check your internet connection and try again.'
      );
    } finally {
      setPublishingStory(null);
    }
  };

  const handlePurchaseStory = async (storyId: string) => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: 'story_purchase',
          storyId: storyId,
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
      alert('Failed to start purchase process. Please try again.');
    }
  };

  // ===== HELPER FUNCTIONS =====
  const getStoryTypeInfo = (story: Story) => {
    if (story.competitionEntries && story.competitionEntries.length > 0) {
      return {
        label: 'COMPETITION ENTRY',
        icon: Trophy,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/20',
        borderColor: 'border-purple-500/30',
      };
    }
    if (story.isUploadedForAssessment) {
      return {
        label: 'UPLOADED FOR ASSESSMENT',
        icon: Upload,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500/30',
      };
    }
    return {
      label: 'FREESTYLE STORY',
      icon: Sparkles,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
    };
  };

  const getIntegrityIcon = (integrityRisk?: string) => {
    switch (integrityRisk) {
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getStoryDisplayInfo = (story: Story) => {
    const isCompetitionEntry =
      story.competitionEntries && story.competitionEntries.length > 0;
    const isWinner =
      isCompetitionEntry &&
      story.competitionEntries.some(
        (entry: any) => entry.isWinner || (entry.rank && entry.rank <= 3)
      );

    if (isCompetitionEntry && !isWinner) {
      return {
        showScores: false,
        badge: 'Competition Entry',
        badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      };
    }

    return {
      showScores: true,
      overallScore: story.assessment?.overallScore || 0,
      grammar: story.assessment?.grammar || 0,
      creativity: story.assessment?.creativity || 0,
    };
  };

  // ===== LOADING STATE =====
 
   if (status === 'loading' || loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
          <TerminalLoader loadingText="Loading your stories..." />
        </div>
      );
    }

  // ===== MAIN RENDER =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl  text-white mb-2">My Stories</h1>
              <p className="text-gray-300">
                Manage and track your creative writing journey
              </p>
            </div>
            <Link
              href="/create-stories"
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3   transition-all flex items-center gap-2 shadow-lg"
            >
              <Plus size={20} />
              Create New Story
            </Link>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto mt-6 md:mt-0">
              <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-4 flex flex-col items-center">
                <div className="text-2xl  text-purple-400">
                  {summary?.published ?? 0}
                </div>
                <div className="text-gray-300 text-sm">Published</div>
              </div>
              <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-4 flex flex-col items-center">
                <div className="text-2xl  text-blue-400">
                  {summary?.totalChildWords
                    ? summary.totalChildWords.toLocaleString()
                    : '0'}
                </div>
                <div className="text-gray-300 text-sm">Words Written</div>
              </div>

              <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-4 flex flex-col items-center">
                <div
                  className={`text-2xl  ${summary?.averageScore ? getScoreColor(summary.averageScore) : 'text-gray-400'}`}
                >
                  {summary?.averageScore ? `${summary.averageScore}%` : 'N/A'}
                </div>
                <div className="text-gray-300 text-sm">Avg Score</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600  text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter dropdown and other controls remain here as before */}

            {/* View Mode */}
            <div className="flex bg-gray-700/50 border border-gray-600 ">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 py-3 px-4  transition-colors flex items-center justify-center gap-2 ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Grid size={16} />
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 py-3 px-4  transition-colors flex items-center justify-center gap-2 ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <List size={16} />
                List
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stories Grid/List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {error ? (
            <div className="text-center py-12">
              <div className="text-red-400 text-lg mb-4">❌ {error}</div>
              <button
                onClick={fetchStories}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3  transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-24 h-24 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl  text-white mb-4">No Stories Yet</h3>
              <p className="text-gray-300 mb-6">
                Start your creative writing journey today!
              </p>
              <Link
                href="/create-stories"
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-4   transition-all inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Create Your First Story
              </Link>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {stories.map((story) => (
                    <StoryCard
                      key={story._id}
                      story={story}
                      onPublish={() => handlePublishStory(story._id)}
                      onPurchase={() => handlePurchaseStory(story._id)}
                      publishingStory={publishingStory}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {stories.map((story) => (
                    <StoryListItem
                      key={story._id}
                      story={story}
                      onPublish={() => handlePublishStory(story._id)}
                      onPurchase={() => handlePurchaseStory(story._id)}
                      publishingStory={publishingStory}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex justify-center items-center gap-4"
          >
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={!pagination.hasPrev}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 text-white  transition-colors"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10  transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(pagination.pages, prev + 1))
              }
              disabled={!pagination.hasNext}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 text-white  transition-colors"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ===== STORY CARD COMPONENT =====
interface StoryCardProps {
  story: Story;
  onPublish: () => void;
  onPurchase: () => void;
  publishingStory: string | null;
}

function StoryCard({
  story,
  onPublish,
  onPurchase,
  publishingStory,
}: StoryCardProps) {
  // Helper functions in scope
  const getStoryTypeInfo = (story: Story) => {
    if (story.competitionEntries && story.competitionEntries.length > 0) {
      return {
        label: 'COMPETITION',
        icon: Trophy,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/20',
        borderColor: 'border-purple-500/30',
      };
    }
    if (story.isUploadedForAssessment) {
      return {
        label: 'ASSESSMENT',
        icon: Upload,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500/30',
      };
    }
    return {
      label: 'FREESTYLE',
      icon: Sparkles,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
    };
  };

  const getStoryDisplayInfo = (story: Story) => {
    const isCompetitionEntry =
      story.competitionEntries && story.competitionEntries.length > 0;
    const isWinner =
      isCompetitionEntry &&
      story.competitionEntries.some(
        (entry: any) => entry.isWinner || (entry.rank && entry.rank <= 3)
      );

    if (isCompetitionEntry && !isWinner) {
      return {
        showScores: false,
        badge: 'Competition Entry',
        badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      };
    }

    return {
      showScores: true,
      overallScore: story.assessment?.overallScore || 0,
      grammar: story.assessment?.grammar || 0,
      creativity: story.assessment?.creativity || 0,
    };
  };
  const getIntegrityIcon = (integrityRisk?: string) => {
    switch (integrityRisk) {
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };
  const typeInfo = getStoryTypeInfo(story);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-6 hover:border-gray-500/50 transition-all group relative"
    >
      {/* Story Type Badge */}
      <div
        className={`inline-flex items-center gap-1 px-2 py-1  text-xs  mb-4 ${typeInfo.bgColor} ${typeInfo.color} ${typeInfo.borderColor} border`}
      >
        <typeInfo.icon size={12} />
        {typeInfo.label}
      </div>

      {/* Title & Metadata */}
      <h3 className="text-lg  text-white mb-2 line-clamp-2">{story.title}</h3>
      <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
        <span>{story.totalWords} words</span>
        <span>•</span>
        <span>{new Date(story.createdAt).toLocaleDateString()}</span>
      </div>

      {/* Assessment Score (if available) */}
      {(() => {
        const displayInfo = getStoryDisplayInfo(story);

        if (!displayInfo.showScores) {
          return (
            <div className="text-center mb-4">
              <div
                className={`inline-block px-3 py-1 rounded-full text-xs  border ${displayInfo.badgeColor}`}
              >
                {displayInfo.badge}
              </div>
            </div>
          );
        }

        if (!story.assessment) return null;

        return (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Overall Score</span>
              <div className="flex items-center gap-2">
                {getIntegrityIcon(story.assessment.integrityRisk)}
                <span
                  className={` ${getScoreColor(story.assessment.overallScore)}`}
                >
                  {story.assessment.overallScore}%
                </span>
              </div>
            </div>
            <div className="flex gap-4 text-xs text-gray-400">
              <span>Grammar: {story.assessment.grammar}%</span>
              <span>Creativity: {story.assessment.creativity}%</span>
            </div>
          </div>
        );
      })()}

      {/* Status Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {story.isPublished && (
          <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs  border border-green-500/30 flex items-center gap-1">
            <CheckCircle size={12} />
            Published to Community
          </span>
        )}
        {story.physicalAnthology?.purchased && (
          <span className="bg-yellow-800/60 border border-yellow-600/40 text-yellow-300 px-2 py-1 rounded text-xs  flex items-center gap-1">
            <CheckCircle size={12} />
            Spot Reserved in Physical Book
            {story.physicalAnthology.purchaseDate && (
              <span className="text-xs ml-2">
                (
                {new Date(
                  story.physicalAnthology.purchaseDate
                ).toLocaleDateString()}
                )
              </span>
            )}
          </span>
        )}
        {story.competitionEntries && story.competitionEntries.length > 0 && (
          <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs  border border-purple-500/30 flex items-center gap-1">
            <Trophy size={10} />
            Competition
          </span>
        )}
        {story.status === 'flagged' && (
          <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs  border border-red-500/30">
            Flagged
          </span>
        )}
        {story.status === 'review' && (
          <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs  border border-yellow-500/30">
            Review
          </span>
        )}
      </div>

      {/* Action Buttons - Stacked Vertically */}
      <div className="space-y-2">
        <Link
          href={`/children-dashboard/my-stories/${story._id}`}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2  text-sm  transition-colors flex items-center justify-center gap-2"
        >
          <Eye size={16} />
          View Story
        </Link>

        <div className="space-y-2">
          {/* Publish Button */}
          {!story.isPublished ? (
            <button
              onClick={onPublish}
              disabled={publishingStory === story._id}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2  text-xs  transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
            >
              {publishingStory === story._id ? (
                <>
                  <div className="w-3 h-3 border border-white border-t-transparent  animate-spin"></div>
                  Publishing...
                </>
              ) : (
                <>
                  <Star size={12} />
                  Publish To Community - Free
                </>
              )}
            </button>
          ) : null}

          {/* Purchase Button */}
          {!story.physicalAnthology?.purchased ? (
            <button
              onClick={onPurchase}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2  text-xs  transition-colors flex items-center justify-center gap-1"
            >
              <DollarSign size={12} />
              Reserve Spot in Physical Book - $10
            </button>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

// ===== STORY LIST ITEM COMPONENT =====
function StoryListItem({
  story,
  onPublish,
  onPurchase,
  publishingStory,
}: StoryCardProps) {
  const getStoryTypeInfo = (story: Story) => {
    if (story.competitionEntries && story.competitionEntries.length > 0) {
      return {
        label: 'COMPETITION ENTRY',
        icon: Trophy,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/20',
        borderColor: 'border-purple-500/30',
      };
    }
    if (story.isUploadedForAssessment) {
      return {
        label: 'UPLOADED FOR ASSESSMENT',
        icon: Upload,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500/30',
      };
    }
    return {
      label: 'FREESTYLE STORY',
      icon: Sparkles,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
    };
  };

  const getIntegrityIcon = (integrityRisk?: string) => {
    switch (integrityRisk) {
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getStoryDisplayInfo = (story: Story) => {
    const isCompetitionEntry =
      story.competitionEntries && story.competitionEntries.length > 0;
    const isWinner =
      isCompetitionEntry &&
      story.competitionEntries.some(
        (entry: any) => entry.isWinner || (entry.rank && entry.rank <= 3)
      );

    if (isCompetitionEntry && !isWinner) {
      return {
        showScores: false,
        badge: 'Competition Entry',
        badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      };
    }

    return {
      showScores: true,
      overallScore: story.assessment?.overallScore || 0,
      grammar: story.assessment?.grammar || 0,
      creativity: story.assessment?.creativity || 0,
    };
  };

  const typeInfo = getStoryTypeInfo(story);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-6 hover:border-gray-500/50 transition-all"
    >
      <div className="flex items-center justify-between">
        {/* Left Side - Story Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <typeInfo.icon className={`w-5 h-5 ${typeInfo.color}`} />
            <h3 className="text-lg  text-white">{story.title}</h3>

            {/* Status Badges */}
            <div className="flex gap-2">
              {story.isPublished && (
                <span className="bg-green-500/20 text-green-300 px-3 py-1  text-xs  border border-green-500/30 flex items-center gap-1">
                  <Star size={12} />
                  Published
                </span>
              )}
              {story.competitionEntries &&
                story.competitionEntries.length > 0 && (
                  <span className="bg-purple-500/20 text-purple-300 px-3 py-1  text-xs  border border-purple-500/30 flex items-center gap-1">
                    <Trophy size={12} />
                    In Competition
                  </span>
                )}
              {story.status === 'flagged' && (
                <span className="bg-red-500/20 text-red-400 px-3 py-1  text-xs  border border-red-500/30">
                  Flagged
                </span>
              )}
              {story.status === 'review' && (
                <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1  text-xs  border border-yellow-500/30">
                  Under Review
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-400">
            <span>{story.totalWords} words total</span>
            <span>{story.childWords} your words</span>
            <span>{new Date(story.createdAt).toLocaleDateString()}</span>

            {/* Assessment Score */}
            {(() => {
              const displayInfo = getStoryDisplayInfo(story);

              if (!displayInfo.showScores) {
                return (
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs  ${displayInfo.badgeColor}`}
                    >
                      {displayInfo.badge}
                    </span>
                  </div>
                );
              }

              if (!story.assessment) return null;

              return (
                <div className="flex items-center gap-2">
                  {getIntegrityIcon(story.assessment.integrityRisk)}
                  <span
                    className={` ${getScoreColor(story.assessment.overallScore)}`}
                  >
                    {story.assessment.overallScore}% Score
                  </span>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-2 ml-6">
          <Link
            href={`/children-dashboard/my-stories/${story._id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2  text-sm  transition-colors flex items-center gap-2"
          >
            <Eye size={16} />
            View
          </Link>

          {/* Publish Button - Show for ALL stories with content (unpublished) */}
          {!story.isPublished && (
            <button
              onClick={onPublish}
              disabled={publishingStory === story._id}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2  text-sm  transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {publishingStory === story._id ? (
                <>
                  <div className="w-4 h-4 border border-white border-t-transparent  animate-spin"></div>
                  Publishing...
                </>
              ) : (
                <>
                  <Star size={16} />
                  Publish Free
                </>
              )}
            </button>
          )}

          {/* Purchase Button - Show for ALL stories */}
          <button
            onClick={onPurchase}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2  text-sm  transition-colors flex items-center gap-2"
          >
            <DollarSign size={16} />
            Purchase $10
          </button>

          {/* More Actions Dropdown - NO ACTIONS */}
          <div className="relative group">
            <button className="bg-gray-700 hover:bg-gray-600 text-white p-2  transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-600  shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              {/* NO ACTIONS - No reassess, no delete */}
              <div className="px-4 py-2 text-gray-400 text-sm text-center">
                No actions available
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
