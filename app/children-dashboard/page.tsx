// app/children-dashboard/page.tsx - FIXED VERSION WITH ERROR HANDLING
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Sparkles,
  Trophy,
  Star,
  Upload,
  TrendingUp,
  Award,
  Clock,
  Users,
  Calendar,
  Eye,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Zap,
  FileText,
  BarChart3,
} from 'lucide-react';

interface UsageStats {
  stories: {
    used: number;
    limit: number;
  };
  assessments: {
    used: number;
    limit: number;
  };
  competitions: {
    used: number;
    limit: number;
  };
  currentPeriod: string;
}

interface Story {
  _id: string;
  title: string;
  status: 'active' | 'completed';
  createdAt: string;
  totalWords: number;
  childWords: number;
  isPublished: boolean;
  submittedToCompetition: boolean;
  storyNumber: number;
  isUploadedForAssessment: boolean;
  competitionEntries?: Array<{
    competitionId: string;
    submittedAt: string;
    rank?: number;
    score?: number;
  }>;
  assessment?: {
    overallScore: number;
    grammarScore: number;
    creativityScore: number;
    integrityAnalysis?: {
      plagiarismResult?: {
        score: number;
        riskLevel: string;
      };
      aiDetectionResult?: {
        score: number;
        likelihood: string;
      };
      integrityRisk?: 'low' | 'medium' | 'high' | 'critical';
    };
  };
}

interface Competition {
  _id: string;
  month: string;
  year: number;
  phase: 'submission' | 'judging' | 'results';
  daysLeft: number;
  totalSubmissions: number;
  totalParticipants: number;
  submissionDeadline: string;
  userStats?: {
    entriesUsed: number;
    entriesLimit: number;
    canSubmit: boolean;
    userEntries: Array<{
      storyId: string;
      title: string;
      submittedAt: string;
      rank?: number;
      score?: number;
    }>;
  };
}

export default function ChildrenDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [recentStories, setRecentStories] = useState<Story[]>([]);
  const [currentCompetition, setCurrentCompetition] = useState<Competition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [publishingStory, setPublishingStory] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'child') {
      router.push('/login/child');
      return;
    }
    fetchDashboardData();
    
    // Check for purchase success
    const purchaseStatus = searchParams.get('purchase');
    if (purchaseStatus === 'success') {
      // Show success message and refresh data
      setTimeout(() => {
        fetchDashboardData();
      }, 1000);
    }
  }, [session, status, router, searchParams]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching dashboard data...');

      // Fetch usage statistics
      const usageResponse = await fetch('/api/user/usage');
      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        console.log('Usage API response:', usageData);
        setUsageStats(usageData);
      } else {
        console.error('Failed to fetch usage stats:', usageResponse.status);
        // Set default usage stats if API fails
        setUsageStats({
          stories: { used: 0, limit: 3 },
          assessments: { used: 0, limit: 3 },
          competitions: { used: 0, limit: 3 },
          currentPeriod: new Date().toLocaleDateString()
        });
      }

      // Fetch recent stories
      const storiesResponse = await fetch('/api/user/stories?limit=6');
      if (storiesResponse.ok) {
        const storiesData = await storiesResponse.json();
        console.log('Stories API response:', storiesData);
        setRecentStories(storiesData.stories || []);
      } else {
        console.error('Failed to fetch stories:', storiesResponse.status);
        setRecentStories([]);
      }

      // Fetch current competition
      const competitionResponse = await fetch('/api/competitions/current');
      if (competitionResponse.ok) {
        const competitionData = await competitionResponse.json();
        console.log('Competition API response:', competitionData);
        setCurrentCompetition(competitionData.competition);
      } else {
        console.error('Failed to fetch competition:', competitionResponse.status);
        setCurrentCompetition(null);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      // Set default values on error
      setUsageStats({
        stories: { used: 0, limit: 3 },
        assessments: { used: 0, limit: 3 },
        competitions: { used: 0, limit: 3 },
        currentPeriod: new Date().toLocaleDateString()
      });
      setRecentStories([]);
      setCurrentCompetition(null);
    } finally {
      setLoading(false);
    }
  };

  const getStoryTypeInfo = (story: Story) => {
    if (story.competitionEntries && story.competitionEntries.length > 0) {
      return { 
        label: "COMPETITION STORY", 
        icon: Trophy, 
        color: "text-purple-400",
        bgColor: "bg-purple-500/20",
        borderColor: "border-purple-500/30"
      };
    }
    if (story.isUploadedForAssessment) {
      return { 
        label: "UPLOADED STORY", 
        icon: Upload, 
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
        borderColor: "border-blue-500/30"
      };
    }
    return { 
      label: "FREESTYLE STORY", 
      icon: Sparkles, 
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      borderColor: "border-green-500/30"
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
        return <CheckCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const handlePublishStory = async (storyId: string, storyTitle: string) => {
    if (!session?.user?.id) return;
    
    setPublishingStory(storyId);
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productType: 'story_publication',
          storyId: storyId,
          userId: session.user.id
        })
      });

      const data = await response.json();
      
      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error initiating publication:', error);
      alert('Failed to start publication process. Please try again.');
    } finally {
      setPublishingStory(null);
    }
  };

  // Safe access to usage stats with fallbacks and optional chaining
  const safeUsageStats = {
    stories: {
      used: usageStats?.stories?.used ?? 0,
      limit: usageStats?.stories?.limit ?? 3,
    },
    assessments: {
      used: usageStats?.assessments?.used ?? 0,
      limit: usageStats?.assessments?.limit ?? 3,
    },
    competitions: {
      used: usageStats?.competitions?.used ?? 0,
      limit: usageStats?.competitions?.limit ?? 3,
    },
    currentPeriod: usageStats?.currentPeriod ?? new Date().toLocaleDateString(),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome back, {session?.user?.firstName || session?.user?.name || 'Writer'}! 👋
          </h1>
          <p className="text-xl text-gray-300">
            Continue your creative writing journey and track your progress
          </p>
        </motion.div>

        {/* Purchase Success Message */}
        {searchParams.get('purchase') === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-8 text-center"
          >
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <h3 className="text-green-300 font-bold text-lg">Payment Successful!</h3>
            <p className="text-green-200">Your story has been published successfully.</p>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-8 text-center"
          >
            <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <h3 className="text-red-300 font-bold text-lg">Error Loading Data</h3>
            <p className="text-red-200 mb-3">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Usage Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-300">Stories Created</h3>
              <Sparkles className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-white">
                {safeUsageStats.stories.used}
              </span>
              <span className="text-blue-300">/ {safeUsageStats.stories.limit}</span>
            </div>
            <div className="w-full bg-blue-800/30 rounded-full h-2 mt-3">
              <div
                className="bg-blue-400 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((safeUsageStats.stories.used / safeUsageStats.stories.limit) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-300">Assessments Used</h3>
              <Award className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-white">
                {safeUsageStats.assessments.used}
              </span>
              <span className="text-green-300">/ {safeUsageStats.assessments.limit}</span>
            </div>
            <div className="w-full bg-green-800/30 rounded-full h-2 mt-3">
              <div
                className="bg-green-400 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((safeUsageStats.assessments.used / safeUsageStats.assessments.limit) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-purple-300">Competition Entries</h3>
              <Trophy className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-white">
                {safeUsageStats.competitions.used}
              </span>
              <span className="text-purple-300">/ {safeUsageStats.competitions.limit}</span>
            </div>
            <div className="w-full bg-purple-800/30 rounded-full h-2 mt-3">
              <div
                className="bg-purple-400 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((safeUsageStats.competitions.used / safeUsageStats.competitions.limit) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <Link
            href="/create-stories/#freestyle"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-6 rounded-xl transition-all shadow-lg group"
          >
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-8 h-8 group-hover:animate-pulse" />
              <h3 className="text-xl font-bold">Create Story</h3>
            </div>
            <p className="text-blue-100">Start a new creative writing adventure</p>
          </Link>

          <Link
            href="/create-stories/#assessment"
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white p-6 rounded-xl transition-all shadow-lg group"
          >
            <div className="flex items-center gap-3 mb-3">
              <Upload className="w-8 h-8 group-hover:animate-bounce" />
              <h3 className="text-xl font-bold">Upload Story</h3>
            </div>
            <p className="text-green-100">Submit your story for AI assessment</p>
          </Link>

          <Link
            href="/children-dashboard/my-stories"
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white p-6 rounded-xl transition-all shadow-lg group"
          >
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="w-8 h-8 group-hover:animate-pulse" />
              <h3 className="text-xl font-bold">My Stories</h3>
            </div>
            <p className="text-orange-100">View and manage your stories</p>
          </Link>

          <Link
            href="/children-dashboard/competitions"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-6 rounded-xl transition-all shadow-lg group"
          >
            <div className="flex items-center gap-3 mb-3">
              <Trophy className="w-8 h-8 group-hover:animate-bounce" />
              <h3 className="text-xl font-bold">Competitions</h3>
            </div>
            <p className="text-purple-100">Enter monthly writing contests</p>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Stories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-gray-800/50 border border-gray-700/50 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <BookOpen className="text-blue-400" />
                Recent Stories
              </h2>
              <Link
                href="/children-dashboard/my-stories"
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                View All →
              </Link>
            </div>

            {recentStories.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen size={48} className="mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-300 mb-2">No stories yet</h3>
                <p className="text-gray-400 mb-4">Start your creative writing journey!</p>
                <Link
                  href="/create-stories"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors"
                >
                  <Sparkles size={20} />
                  Create Your First Story
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentStories.map((story) => {
                  const storyType = getStoryTypeInfo(story ?? {});
                  const TypeIcon = storyType.icon;
                  return (
                    <div
                      key={story?._id ?? Math.random()}
                      className="bg-gray-700/30 border border-gray-600/30 rounded-lg p-4 hover:border-gray-500/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          {/* Story Type Badge */}
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-2 ${storyType.bgColor} ${storyType.borderColor} border`}>
                            <TypeIcon size={12} className={storyType.color} />
                            <span className={storyType.color}>{storyType.label}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-white mb-1">
                            {story?.title ?? 'Untitled'}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                            <span className="flex items-center gap-1">
                              <FileText size={14} />
                              {story?.childWords ?? 0} words
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {story?.createdAt ? new Date(story.createdAt).toLocaleDateString() : 'N/A'}
                            </span>
                            <span className={`capitalize ${
                              story?.status === 'completed' ? 'text-green-400' :
                              story?.status === 'active' ? 'text-blue-400' : 'text-gray-400'
                            }`}>
                              {story?.status ?? 'unknown'}
                            </span>
                          </div>
                          {/* Assessment Score */}
                          {story?.assessment && (
                            <div className="flex items-center gap-2 mb-2">
                              <Star className="w-4 h-4 text-yellow-400" />
                              <span className={`font-medium ${getScoreColor(story?.assessment?.overallScore ?? 0)}`}>
                                {(story?.assessment?.overallScore ?? 0)}% Overall
                              </span>
                              {story?.assessment?.integrityAnalysis && (
                                <div className="flex items-center gap-1">
                                  {getIntegrityIcon(story?.assessment?.integrityAnalysis?.integrityRisk)}
                                </div>
                              )}
                            </div>
                          )}
                          {/* Status Badges */}
                          <div className="flex items-center gap-2">
                            {story?.isPublished && (
                              <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs font-medium border border-green-500/30">
                                📚 Published
                              </span>
                            )}
                            {story?.competitionEntries && story.competitionEntries.length > 0 && (
                              <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs font-medium border border-purple-500/30">
                                🏆 In Competition
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 ml-4">
                          <Link
                            href={`/children-dashboard/my-stories/${story?._id ?? ''}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                          >
                            <Eye size={14} />
                            View
                          </Link>
                          {!story?.isPublished && story?.status === 'completed' && (
                            <button
                              onClick={() => handlePublishStory(story?._id ?? '', story?.title ?? '')}
                              disabled={publishingStory === story?._id}
                              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                            >
                              {publishingStory === story?._id ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  <span className="text-xs">Publishing...</span>
                                </>
                              ) : (
                                <>
                                  <DollarSign size={14} />
                                  <span className="text-xs">Publish $10</span>
                                </>
                              )}
                            </button>
                          )}
                          {story?.status === 'active' && (
                            <Link
                              href={`/children-dashboard/story/${story?._id ?? ''}`}
                              className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                            >
                              <Zap size={14} />
                              Continue
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Competition Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Trophy className="text-purple-400" />
              Competition
            </h2>

            {currentCompetition ? (
              <div>
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-bold text-white mb-2">
                    {currentCompetition.month} {currentCompetition.year}
                  </h3>
                  <div className="text-sm text-purple-300 mb-2">
                    Phase: {currentCompetition.phase === 'submission' ? '📝 Submissions Open' :
                           currentCompetition.phase === 'judging' ? '⚖️ AI Judging' : '🏆 Results Available'}
                  </div>
                  <div className="text-sm text-purple-300">
                    {currentCompetition.daysLeft} days left
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Participants</span>
                    <span className="text-white font-bold">{currentCompetition.totalParticipants}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Submissions</span>
                    <span className="text-white font-bold">{currentCompetition.totalSubmissions}</span>
                  </div>
                  {currentCompetition.userStats && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Your Entries</span>
                      <span className="text-white font-bold">
                        {currentCompetition.userStats.entriesUsed}/{currentCompetition.userStats.entriesLimit}
                      </span>
                    </div>
                  )}
                </div>

                <Link
                  href="/children-dashboard/competitions"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors text-center block"
                >
                  View Competition Details
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <Trophy size={48} className="mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400">No active competition</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Call to Action */}
        {recentStories.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-8"
          >
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Writing?</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Choose your writing style: create stories collaboratively with AI, upload your own work for assessment, 
              or join our monthly competitions to showcase your talent!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/create-stories"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles size={24} />
                Start Writing
              </Link>
              <Link
                href="/children-dashboard/upload-story"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
              >
                <Upload size={24} />
                Upload Story
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}