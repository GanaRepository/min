// app/children-dashboard/page.tsx - REVAMPED COLOR PALETTE VERSION
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TerminalLoader from '@/components/TerminalLoader';
import {
  BookOpen,
  Trophy,
  FileText,
  Crown,
  ArrowRight,
  Sparkles,
  Star,
  Award,
  Calendar,
  Clock,
  TrendingUp,
  Target,
  CheckCircle,
  Activity,
  Zap,
  Heart,
  Gift,
  Medal,
} from 'lucide-react';
import { motion } from 'framer-motion';
import UsageStatsCard from '@/components/dashboard/UsageStatsCard';

interface UsageStats {
  freestyleStories: {
    used: number;
    limit: number;
    remaining: number;
    canUse: boolean;
  };
  assessmentRequests: {
    used: number;
    limit: number;
    remaining: number;
    canUse: boolean;
  };
  competitionEntries: {
    used: number;
    limit: number;
    remaining: number;
    canUse: boolean;
  };
  publications: {
    used: number;
    limit: number;
    remaining: number;
    canUse: boolean;
  };
  resetDate: string;
  subscriptionTier: 'FREE' | 'STORY_PACK';
  storyPackExpiry?: string;
  daysRemaining?: number;
  resetInfo?: {
    performed: boolean;
    message: string;
  };
}

interface Competition {
  _id: string;
  month: string;
  year: number;
  phase: 'submission' | 'judging' | 'results';
  isActive: boolean;
  daysLeft: number;
  totalSubmissions: number;
  totalParticipants: number;
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

interface Achievement {
  _id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: string;
}

// Sample recent activities data (since the API might not exist)
const getSampleActivities = (): Achievement[] => [
  {
    _id: '1',
    title: 'Story Created',
    description: 'Started a new collaborative story',
    icon: '✍️',
    unlockedAt: new Date().toISOString(),
    category: 'writing',
  },
  {
    _id: '2',
    title: 'Assessment Completed',
    description: 'Received AI feedback on your story',
    icon: '🎯',
    unlockedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    category: 'assessment',
  },
  {
    _id: '3',
    title: 'Story Pack Active',
    description: 'Unlocked additional writing resources',
    icon: '👑',
    unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'upgrade',
  },
  {
    _id: '4',
    title: 'Competition Entry',
    description: 'Submitted story to monthly competition',
    icon: '🏆',
    unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'competition',
  },
  {
    _id: '5',
    title: 'Creativity Milestone',
    description: 'Reached 1000 words written this month',
    icon: '🌟',
    unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'milestone',
  },
];

export default function ChildrenDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ===== STATE =====
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [resetNotification, setResetNotification] = useState<boolean>(false);
  const [currentCompetition, setCurrentCompetition] =
    useState<Competition | null>(null);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ===== HELPER FUNCTIONS =====
  const getDefaultUsageStats = (): UsageStats => ({
    freestyleStories: { used: 0, limit: 3, remaining: 3, canUse: true },
    assessmentRequests: { used: 0, limit: 9, remaining: 9, canUse: true },
    competitionEntries: { used: 0, limit: 3, remaining: 3, canUse: true },
    publications: { used: 0, limit: 1, remaining: 1, canUse: true },
    subscriptionTier: 'FREE',
    resetDate: new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      1
    ).toISOString(),
  });

  // ===== API CALLS =====
  const fetchDashboardData = useCallback(async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      // Force fresh data by adding timestamp to prevent caching
      const timestamp = new Date().getTime();
      
      // Fetch dashboard data in parallel
      const [usageResponse, competitionResponse] = await Promise.all([
        fetch(`/api/user/usage?t=${timestamp}`, { 
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }),
        fetch(`/api/competitions/current?t=${timestamp}`, { 
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }),
      ]);

      // Handle usage stats
      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        console.log('📊 Usage stats loaded:', usageData);
        setUsageStats(usageData.usage || getDefaultUsageStats());
        // Check if reset just happened
        if (usageData.usage?.resetInfo?.performed) {
          setResetNotification(true);
          setTimeout(() => setResetNotification(false), 5000);
        }
      } else {
        console.error('❌ Failed to fetch usage stats');
        setUsageStats(getDefaultUsageStats());
      }

      // Handle current competition
      if (competitionResponse.ok) {
        const competitionData = await competitionResponse.json();
        console.log(
          '🏆 Competition data loaded:',
          competitionData.competition?.month
        );
        setCurrentCompetition(competitionData.competition);
      } else {
        console.error('❌ Failed to fetch competition data');
        setCurrentCompetition(null);
      }

      // Try to fetch real achievements, fallback to sample data
      try {
        const achievementsResponse = await fetch(
          '/api/user/achievements?recent=5'
        );
        if (achievementsResponse.ok) {
          const achievementsData = await achievementsResponse.json();
          setRecentAchievements(
            achievementsData.achievements || getSampleActivities()
          );
        } else {
          // Use sample data if API doesn't exist
          setRecentAchievements(getSampleActivities());
        }
      } catch (err) {
        console.log('ℹ️ Using sample activities data');
        setRecentAchievements(getSampleActivities());
      }
    } catch (error) {
      console.error('❌ Dashboard data fetch error:', error);
      setError('Failed to load dashboard data. Please refresh the page.');
      // Set sample data even on error
      setRecentAchievements(getSampleActivities());
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // ===== EFFECTS =====
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status, fetchDashboardData, router]);

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <TerminalLoader
          title="Dashboard"
          loadingText="Loading your dashboard..."
          size="md"
        />
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 flex items-center justify-center">
        <div className="text-center bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-8">
          <h2 className="text-2xl  text-white mb-4">Something went wrong</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-800 hover:bg-blue-700 text-white px-6 py-3  transition-colors border border-blue-600/40"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center lg:text-left"
        >
          <h1 className="text-4xl  text-white mb-2">
            Welcome back, {session?.user?.firstName || 'Writer'}! ☀️
          </h1>
          <p className="text-gray-300 text-lg">
            Ready to continue your creative writing journey?
          </p>
        </motion.div>

        {/* Reset Notification */}
        {resetNotification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-800/80 backdrop-blur-xl border border-blue-600/40 text-white p-4  mb-4 flex items-center gap-3"
          >
            <span className="text-2xl">🔄</span>
            <div>
              <strong>Monthly Reset Complete!</strong>
              <p className="text-sm text-blue-200">
                Your limits have been reset (Story Pack purchases preserved)
              </p>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Story Pack Status */}
            {usageStats &&
              usageStats.subscriptionTier === 'STORY_PACK' &&
              usageStats.daysRemaining && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-800/60 backdrop-blur-xl border border-green-600/40  p-4"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div className="flex-1">
                      <h4 className=" text-green-200">Story Pack Active!</h4>
                      <div className="flex items-center gap-2 text-sm text-green-300">
                        <Clock className="w-4 h-4" />
                        <span>{usageStats.daysRemaining} days remaining</span>
                      </div>
                      {usageStats.storyPackExpiry && (
                        <p className="text-xs text-green-400 mt-1">
                          Expires:{' '}
                          {new Date(
                            usageStats.storyPackExpiry
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

            {/* Competition */}
            {currentCompetition && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-green-800/60 backdrop-blur-xl border border-green-600/40  p-4"
              >
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className=" text-green-200 mb-1">
                      {currentCompetition.month} {currentCompetition.year}{' '}
                      Competition
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-green-300">
                      <Clock className="w-4 h-4" />
                      <span>{currentCompetition.daysLeft} days left</span>
                      <span>
                        • {currentCompetition.totalParticipants} participants
                      </span>
                      <span>
                        • Your entries:{' '}
                        {currentCompetition.userStats?.entriesUsed || 0}/3
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/children-dashboard/competitions"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2  text-sm transition-colors border border-green-500/40"
                  >
                    Enter Competition
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Recent Activities */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl  text-white">Recent Activities</h2>
                <Link
                  href="/children-dashboard/my-stories"
                  className="text-blue-400 hover:text-blue-300 text-sm  flex items-center gap-1 transition-colors"
                >
                  View All Stories
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-3">
                {recentAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-4 hover:border-gray-500/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-700/60 border border-gray-600/40  flex items-center justify-center">
                        <span className="text-lg">{achievement.icon}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className=" text-white">{achievement.title}</h3>
                        <p className="text-sm text-gray-300">
                          {achievement.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(
                            achievement.unlockedAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-400 uppercase tracking-wide ">
                          {achievement.category}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Usage Stats */}
            {usageStats && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <UsageStatsCard
                  usageStats={usageStats}
                  onUpgrade={
                    usageStats.subscriptionTier === 'FREE'
                      ? handleUpgrade
                      : undefined
                  }
                  loading={false}
                />
              </motion.div>
            )}

            {/* Quick Actions - Moved to sidebar below Usage Stats */}
            <section>
              <h2 className="text-xl  text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href="/create-stories"
                  className="block bg-green-800/60 backdrop-blur-xl border border-green-600/40  p-4 hover:border-green-500/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <h3 className=" text-white text-sm">Write with AI</h3>
                      <p className="text-green-300 text-xs">
                        Start a collaborative story
                      </p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/create-stories"
                  className="block bg-blue-800/60 backdrop-blur-xl border border-blue-600/40  p-4 hover:border-blue-500/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <h3 className=" text-white text-sm">Get AI Assessment</h3>
                      <p className="text-blue-300 text-xs">
                        Upload your story for review
                      </p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/children-dashboard/competitions"
                  className="block bg-green-800/60 backdrop-blur-xl border border-green-600/40  p-4 hover:border-green-500/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <h3 className=" text-white text-sm">Join Competition</h3>
                      <p className="text-green-300 text-xs">
                        Compete with other writers
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
