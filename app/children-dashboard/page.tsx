// app/children-dashboard/page.tsx - COMPLETE VERSION WITH CLEAR LABELS
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Sparkles,
  Upload,
  Trophy,
  Star,
  Zap,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Plus,
  Award,
  TrendingUp,
} from 'lucide-react';

// Fixed interface to match API response
interface UsageStats {
  storiesRemaining: number;
  assessmentsRemaining: number;
  competitionEntriesRemaining: number;
  storiesCreated: number;
  storyLimit: number;
  assessmentUploads: number;
  assessmentLimit: number;
  competitionEntries: number;
  competitionLimit: number;
  totalAssessmentAttempts: number;
  maxAssessmentAttempts: number;
  hasStoryPackThisMonth: boolean;
  monthlySpent: number;
  lastReset?: string;
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
}

export default function ChildrenDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [recentStories, setRecentStories] = useState<Story[]>([]);
  const [currentCompetition, setCurrentCompetition] = useState<Competition | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'child') {
      router.push('/login/child');
      return;
    }
    fetchDashboardData();
  }, [session, status, router]);

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
      }

      // Fetch recent stories
      const storiesResponse = await fetch('/api/user/stories?limit=6');
      if (storiesResponse.ok) {
        const storiesData = await storiesResponse.json();
        console.log('Stories API response:', storiesData);
        console.log('Stories array:', storiesData.stories);
        console.log('Stories count:', storiesData.stories?.length);
        setRecentStories(storiesData.stories || []);
      } else {
        console.error('Failed to fetch stories:', storiesResponse.status);
        try {
          const errorData = await storiesResponse.json();
          console.error('Stories API error:', errorData);
        } catch (e) {
          console.error('Could not parse stories error response');
        }
      }

      // Fetch current competition
      const competitionResponse = await fetch('/api/competitions/current');
      if (competitionResponse.ok) {
        const competitionData = await competitionResponse.json();
        console.log('Competition API response:', competitionData);
        setCurrentCompetition(competitionData.competition);
      } else {
        console.error('Failed to fetch competition:', competitionResponse.status);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const getIntegrityIcon = (integrityRisk?: string) => {
    switch (integrityRisk) {
      case 'low':
        return <CheckCircle className="text-green-400" size={16} />;
      case 'medium':
        return <AlertTriangle className="text-yellow-400" size={16} />;
      case 'high':
      case 'critical':
        return <XCircle className="text-red-400" size={16} />;
      default:
        return <CheckCircle className="text-gray-400" size={16} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
            Welcome back, Writer!
          </h1>
          <p className="text-gray-300">
            Ready for your next creative writing adventure?
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="xl:col-span-3 space-y-6">
            {/* Usage Stats Cards */}
            {usageStats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4"
              >
                {/* Stories Left */}
                <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Sparkles className="text-blue-400" size={20} />
                    <span className="text-2xl font-bold text-blue-400">
                      {usageStats.storiesRemaining || 0}
                    </span>
                  </div>
                  <p className="text-white text-sm font-medium">Stories Left</p>
                  <p className="text-blue-200 text-xs">
                    {usageStats.storiesCreated || 0}/{usageStats.storyLimit || 3} used
                  </p>
                </div>

                {/* Assessments */}
                <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Upload className="text-green-400" size={20} />
                    <span className="text-2xl font-bold text-green-400">
                      {usageStats.assessmentsRemaining || 0}
                    </span>
                  </div>
                  <p className="text-white text-sm font-medium">Assessments Left</p>
                  <p className="text-green-200 text-xs">
                    {usageStats.assessmentUploads || 0}/{usageStats.assessmentLimit || 3} used
                  </p>
                </div>

                {/* Competition Entries */}
                <div className="bg-purple-600/20 border border-purple-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Trophy className="text-purple-400" size={20} />
                    <span className="text-2xl font-bold text-purple-400">
                      {usageStats.competitionEntriesRemaining || 0}
                    </span>
                  </div>
                  <p className="text-white text-sm font-medium">Competition Entries Left</p>
                  <p className="text-purple-200 text-xs">
                    {usageStats.competitionEntries || 0}/{usageStats.competitionLimit || 3} used
                  </p>
                </div>

                {/* Stories Total Created */}
                <div className="bg-orange-600/20 border border-orange-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <BookOpen className="text-orange-400" size={20} />
                    <span className="text-2xl font-bold text-orange-400">
                      {usageStats.storiesCreated || 0}
                    </span>
                  </div>
                  <p className="text-white text-sm font-medium">Stories</p>
                  <p className="text-orange-200 text-xs">Total created</p>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Create New Story */}
              <Link href="/create-stories/#freestyle">
                <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-6 hover:bg-green-600/30 transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-500 rounded-lg p-3 mr-4">
                      <Sparkles className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Create New Story</h3>
                      <p className="text-green-200 text-sm">Start your next creative adventure</p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Upload for Assessment */}
              <Link href="/create-stories/#assessment">
                <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-6 hover:bg-blue-600/30 transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-500 rounded-lg p-3 mr-4">
                      <Upload className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Upload for Assessment</h3>
                      <p className="text-blue-200 text-sm">Get AI feedback on your story</p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Recent Stories with Clear Labels */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800/50 border border-gray-600/40 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <BookOpen className="mr-2" size={24} />
                  Recent Stories
                </h2>
                <Link href="/children-dashboard/my-stories">
                  <span className="text-blue-400 hover:text-blue-300 text-sm cursor-pointer">
                    View All →
                  </span>
                </Link>
              </div>

              {recentStories.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No Stories Yet</h3>
                  <p className="text-gray-400 mb-6">Start your writing journey today!</p>
                  <Link href="/create-stories">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                      <Plus className="w-4 h-4 inline mr-2" />
                      Create Your First Story
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentStories.map((story) => (
                    <motion.div
                      key={story._id}
                      whileHover={{ scale: 1.02 }}
                      className={`bg-gray-700/50 border border-gray-600/40 rounded-lg p-4 hover:border-gray-500/60 transition-all duration-200 ${
                        story.isUploadedForAssessment 
                          ? 'border-l-4 border-l-blue-500' 
                          : 'border-l-4 border-l-green-500'
                      }`}
                    >
                      {/* ✅ CLEAR STORY TYPE HEADER */}
                      <div className="flex items-center justify-between mb-3">
                        {story.isUploadedForAssessment ? (
                          <div className="flex items-center bg-blue-500/20 px-3 py-1.5 rounded-lg border border-blue-500/30">
                            <Upload className="text-blue-400 mr-2" size={16} />
                            <span className="text-blue-400 text-sm font-bold">UPLOADED STORY</span>
                          </div>
                        ) : (
                          <div className="flex items-center bg-green-500/20 px-3 py-1.5 rounded-lg border border-green-500/30">
                            <Sparkles className="text-green-400 mr-2" size={16} />
                            <span className="text-green-400 text-sm font-bold">FREESTYLE STORY</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-1">
                          {story.isPublished && (
                            <Star className="text-yellow-400" size={14} />
                          )}
                          {story.submittedToCompetition && (
                            <Trophy className="text-purple-400" size={14} />
                          )}
                          {story.assessment?.integrityAnalysis && 
                            getIntegrityIcon(story.assessment.integrityAnalysis.integrityRisk)
                          }
                        </div>
                      </div>

                      {/* Story Title */}
                      <div className="mb-3">
                        <h3 className="text-white font-medium text-lg">
                          {story.title || `Story #${story.storyNumber}`}
                        </h3>
                      </div>

                      {/* Story Details */}
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                        <span>{story.totalWords || story.childWords || 0} words</span>
                        <span>{formatDate(story.createdAt)}</span>
                      </div>

                      {story.assessment && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-400">Score</span>
                            <span className="text-green-400 font-medium">
                              {story.assessment.overallScore}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                              style={{ width: `${story.assessment.overallScore}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            story.status === 'completed'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {story.status === 'completed' ? 'Completed' : 'In Progress'}
                        </span>
                        <Link href={`children-dashboard/my-stories/${story._id}`}>
                          <button className="text-blue-400 hover:text-blue-300 text-xs">
                            View →
                          </button>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Current Competition Widget */}
            {currentCompetition && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-xl p-6"
              >
                <div className="flex items-center mb-4">
                  <Award className="text-purple-400 mr-2" size={20} />
                  <h3 className="text-white font-semibold">
                    {currentCompetition.month} Competition
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Phase:</span>
                    <span className="text-purple-400 capitalize font-medium">
                      {currentCompetition.phase}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Days Left:</span>
                    <span className="text-white font-medium">
                      {currentCompetition.daysLeft} days
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Submissions:</span>
                    <span className="text-green-400 font-medium">
                      {currentCompetition.totalSubmissions}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Your Entries:</span>
                    <span className="text-blue-400 font-medium">
                      {usageStats?.competitionEntries || 0}/3
                    </span>
                  </div>
                </div>

                <Link href="/children-dashboard/competitions">
                  <button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                    <Trophy className="w-4 h-4 inline mr-2" />
                    Submit Stories
                  </button>
                </Link>
              </motion.div>
            )}

            {/* Usage Summary */}
            {usageStats && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-800/50 border border-gray-600/40 rounded-xl p-6"
              >
                <h3 className="text-white font-semibold mb-4 flex items-center">
                  <TrendingUp className="mr-2" size={18} />
                  Monthly Usage
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Stories:</span>
                    <span className="text-white">
                      {usageStats.storiesCreated}/{usageStats.storyLimit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Assessments:</span>
                    <span className="text-white">
                      {usageStats.assessmentUploads}/{usageStats.assessmentLimit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Competition:</span>
                    <span className="text-white">
                      {usageStats.competitionEntries}/{usageStats.competitionLimit}
                    </span>
                  </div>

                  {usageStats.hasStoryPackThisMonth && (
                    <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 mt-4">
                      <div className="flex items-center">
                        <CheckCircle className="text-green-400 mr-2" size={16} />
                        <span className="text-green-400 text-sm font-medium">
                          Story Pack Active
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {!usageStats.hasStoryPackThisMonth && (
                  <Link href="/pricing">
                    <button className="w-full mt-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200">
                      <Zap className="w-4 h-4 inline mr-2" />
                      Upgrade to Story Pack
                    </button>
                  </Link>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}