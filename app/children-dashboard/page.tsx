// app/children-dashboard/page.tsx
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
  CreditCard,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

interface UsageStats {
  storiesRemaining: number;
  assessmentsRemaining: number;
  hasStoryPackThisMonth: boolean;
}

interface Story {
  _id: string;
  title: string;
  status: 'active' | 'completed';
  createdAt: string;
  wordCount: number;
  isPublished: boolean;
  assessment?: {
    overallScore: number;
    integrityAnalysis?: {
      originalityScore: number;
      plagiarismScore: number;
      aiDetectionScore: number;
      integrityRisk: 'low' | 'medium' | 'high' | 'critical';
    };
  };
}

interface Competition {
  _id: string;
  month: string;
  year: number;
  phase: 'submission' | 'judging' | 'results';
  daysLeft: number;
  userEntries: number;
  maxEntries: number;
  totalParticipants: number;
  winners?: Array<{
    position: number;
    childName: string;
    title: string;
    score: number;
  }>;
}

export default function ChildrenDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [recentStories, setRecentStories] = useState<Story[]>([]);
  const [currentCompetition, setCurrentCompetition] =
    useState<Competition | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login/child');
      return;
    }
    fetchDashboardData();
  }, [session, status]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch usage statistics
      const usageResponse = await fetch('/api/user/usage');
      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        setUsageStats(usageData);
      }

      // Fetch recent stories
      const storiesResponse = await fetch('/api/user/stories?limit=6');
      if (storiesResponse.ok) {
        const storiesData = await storiesResponse.json();
        setRecentStories(storiesData.stories || []);
      }

      // Fetch current competition
      const competitionResponse = await fetch('/api/competitions/current');
      if (competitionResponse.ok) {
        const competitionData = await competitionResponse.json();
        setCurrentCompetition(competitionData.competition);
      }

      // Fetch purchase history
      const purchasesResponse = await fetch(
        '/api/user/purchase-history?limit=3'
      );
      if (purchasesResponse.ok) {
        const purchasesData = await purchasesResponse.json();
        setPurchaseHistory(purchasesData.purchases || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading your creative space...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome back, {session?.user?.name?.split(' ')[0] || 'Writer'}!
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
                    {usageStats.storiesRemaining}
                  </span>
                </div>
                <p className="text-white text-sm font-medium">Stories Left</p>
                <p className="text-blue-200 text-xs">
                  0/
                  {usageStats.storiesRemaining +
                    (3 - usageStats.storiesRemaining)}{' '}
                  used
                </p>
              </div>

              {/* Assessments */}
              <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Upload className="text-green-400" size={20} />
                  <span className="text-2xl font-bold text-green-400">
                    {usageStats.assessmentsRemaining}
                  </span>
                </div>
                <p className="text-white text-sm font-medium">Assessments</p>
                <p className="text-green-200 text-xs">
                  0/
                  {usageStats.assessmentsRemaining +
                    (3 - usageStats.assessmentsRemaining)}{' '}
                  used
                </p>
              </div>

              {/* Competition Entries */}
              <div className="bg-purple-600/20 border border-purple-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Trophy className="text-purple-400" size={20} />
                  <span className="text-2xl font-bold text-purple-400">
                    {currentCompetition?.userEntries || 0}
                  </span>
                </div>
                <p className="text-white text-sm font-medium">Comp. Entries</p>
                <p className="text-purple-200 text-xs">
                  0/{currentCompetition?.maxEntries || 3} used
                </p>
              </div>

              {/* Attempts/Stories Created */}
              <div className="bg-orange-600/20 border border-orange-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <BookOpen className="text-orange-400" size={20} />
                  <span className="text-2xl font-bold text-orange-400">
                    {recentStories.length}
                  </span>
                </div>
                <p className="text-white text-sm font-medium">Attempts</p>
                <p className="text-orange-200 text-xs">0/9 used</p>
              </div>
            </motion.div>
          )}

          {/* Action Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Create New Story */}
            <Link
              href="/create-stories"
              className="group bg-green-600/10 hover:bg-green-600/20 border border-green-500/30 hover:border-green-500/50 rounded-xl p-6 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="bg-green-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                  <Sparkles className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    Create New Story
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Start your next creative adventure
                  </p>
                </div>
              </div>
            </Link>

            {/* Upload for Assessment */}
            <Link
              href="/children-dashboard/upload-assessment"
              className="group bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 hover:border-blue-500/50 rounded-xl p-6 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                  <Upload className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    Upload for Assessment
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Get AI feedback on your story
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Recent Stories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BookOpen className="text-blue-400" size={20} />
                <h2 className="text-xl font-bold text-white">Recent Stories</h2>
              </div>
              <Link
                href="/children-dashboard/my-stories"
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
              >
                View All →
              </Link>
            </div>

            {recentStories.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">
                  No Stories Yet
                </h3>
                <p className="text-gray-400 mb-6">
                  Start your writing journey today!
                </p>
                <Link
                  href="/create-stories"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors"
                >
                  <Sparkles size={16} />
                  Create Your First Story
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentStories.slice(0, 6).map((story) => (
                  <Link
                    key={story._id}
                    href={`/children-dashboard/my-stories/${story._id}`}
                    className="group bg-gray-700/50 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 rounded-lg p-4 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-white font-medium line-clamp-1 group-hover:text-blue-300">
                        {story.title}
                      </h3>
                      {story.assessment?.integrityAnalysis &&
                        getIntegrityIcon(
                          story.assessment.integrityAnalysis.integrityRisk
                        )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status</span>
                        <span
                          className={`font-medium ${
                            story.status === 'completed'
                              ? 'text-green-400'
                              : 'text-yellow-400'
                          }`}
                        >
                          {story.status === 'completed'
                            ? 'Complete'
                            : 'In Progress'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Words</span>
                        <span className="text-white">{story.wordCount}</span>
                      </div>
                      {story.assessment && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Score</span>
                          <span className="text-blue-400 font-medium">
                            {story.assessment.overallScore}%
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Competition Card */}
          {currentCompetition && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="text-purple-400" size={20} />
                <h3 className="text-white font-bold">
                  {currentCompetition.month} Competition
                </h3>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Phase:</span>
                  <span className="text-purple-400 font-medium capitalize">
                    {currentCompetition.phase}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Your Entries:</span>
                  <span className="text-white">
                    {currentCompetition.userEntries}/
                    {currentCompetition.maxEntries}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Participants:</span>
                  <span className="text-white">
                    {currentCompetition.totalParticipants}
                  </span>
                </div>
                {currentCompetition.daysLeft > 0 && (
                  <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-3">
                    <div className="text-yellow-400 text-sm font-medium text-center">
                      🎯 {currentCompetition.daysLeft} days left to submit!
                    </div>
                    <div className="text-yellow-200 text-xs text-center mt-1">
                      Publish your stories to make them competition eligible
                    </div>
                  </div>
                )}

                {currentCompetition.phase === 'results' &&
                  currentCompetition.winners && (
                    <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-3">
                      <div className="text-green-400 text-sm font-medium mb-2">
                        🏆 Winners:
                      </div>
                      {currentCompetition.winners.slice(0, 3).map((winner) => (
                        <div
                          key={winner.position}
                          className="text-xs text-green-200 mb-1"
                        >
                          {winner.position === 1
                            ? '🥇'
                            : winner.position === 2
                              ? '🥈'
                              : '🥉'}
                          {winner.childName} - "{winner.title}" ({winner.score}
                          %)
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              <Link
                href="/children-dashboard/competitions"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 mt-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Trophy size={16} />
                View Competition
              </Link>
            </motion.div>
          )}

          {/* Upgrade Prompt */}
          {usageStats &&
            !usageStats.hasStoryPackThisMonth &&
            (usageStats.storiesRemaining <= 1 ||
              usageStats.assessmentsRemaining <= 1) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl p-6"
              >
                <div className="text-center">
                  <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">
                    Running Low!
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Get 5 more stories + 5 more assessments this month
                  </p>
                  <Link
                    href="/pricing"
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 text-sm font-medium transition-colors"
                  >
                    <Star size={16} />
                    Story Pack - $15
                  </Link>
                </div>
              </motion.div>
            )}

          {/* Recent Purchases */}
          {purchaseHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="text-green-400" size={20} />
                <h2 className="text-lg font-bold text-white">
                  Recent Purchases
                </h2>
              </div>

              <div className="space-y-3">
                {purchaseHistory.slice(0, 3).map((purchase, index) => (
                  <div
                    key={purchase.id || index}
                    className="flex items-center justify-between p-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                  >
                    <div>
                      <div className="text-white text-sm font-medium">
                        {purchase.type === 'story_pack'
                          ? 'Story Pack'
                          : 'Story Publication'}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {new Date(purchase.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-green-400 text-sm font-medium">
                      ${purchase.amount}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
