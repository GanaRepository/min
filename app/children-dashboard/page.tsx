'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  Sparkles,
  Target,
  BarChart3,
  PenTool,
  Trophy,
  Plus,
  Eye,
  Edit,
  PlayCircle,
} from 'lucide-react';

interface DashboardData {
  overview: {
    totalStoriesCreated: number;
    totalWordsWritten: number;
    averageWordsPerStory: number;
    writingStreak: number;
    completionRate: number;
    isActiveToday: boolean;
  };
  monthly: {
    storiesCreated: number;
    wordsWritten: number;
    apiCallsUsed: number;
  };
  sessions: {
    total: number;
    completed: number;
    active: number;
    completionRate: number;
  };
  achievements: string[];
  weeklyProgress: Array<{ date: string; stories: number; words: number }>;
  recentStories: any[];
  recentActivity: any[];
}

export default function ChildrenDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'child') {
      router.push('/login/child');
      return;
    }

    fetchDashboardData();
    fetchSubscriptionInfo();
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/user/analytics');
      const data = await response.json();

      if (data.success) {
        setDashboardData(data.analytics);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // FIXED: Added subscription info fetching
  const fetchSubscriptionInfo = async () => {
    try {
      const response = await fetch('/api/user/subscription-limits');
      const data = await response.json();
      if (data.success) {
        setSubscriptionInfo(data);
      }
    } catch (error) {
      console.error('Error fetching subscription info:', error);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'child' || !dashboardData) {
    return null;
  }

  const { overview, monthly, sessions, achievements, weeklyProgress } =
    dashboardData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white">
      {/* FIXED: Header with proper spacing and responsive container */}
      <div className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-600/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mt-16"
          >
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold">
                Welcome back, {session.user.firstName}! 🌟
              </h1>
              <p className="text-gray-300 mt-2 text-lg">
                {overview.isActiveToday
                  ? "You're on a writing streak!"
                  : 'Ready to write your next amazing story?'}
              </p>

              {/* FIXED: Subscription info display */}
              {subscriptionInfo && (
                <div className="mt-3 flex items-center space-x-4 text-sm">
                  <span className="bg-blue-500/20 px-3 py-1 rounded-full text-blue-300">
                    {subscriptionInfo.currentTier} Plan
                  </span>
                  <span className="text-gray-400">
                    {subscriptionInfo.storiesRemaining} stories remaining this
                    month
                  </span>
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/create-stories')}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-8 py-4 rounded-xl font-semibold text-lg flex items-center space-x-3 shadow-xl"
            >
              <Sparkles className="w-6 h-6" />
              <span>Create New Story</span>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* FIXED: Main Content with proper container and spacing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Main Stats Area */}
          <div className="xl:col-span-8">
            {/* FIXED: Stats Cards with proper responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Stories Created */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <BookOpen className="w-10 h-10 text-blue-400" />
                  <span className="text-blue-300 text-sm font-medium">
                    Stories
                  </span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {overview.totalStoriesCreated}
                </div>
                <div className="text-blue-300 text-sm">
                  +{monthly.storiesCreated} this month
                </div>
              </motion.div>

              {/* Words Written */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <PenTool className="w-10 h-10 text-green-400" />
                  <span className="text-green-300 text-sm font-medium">
                    Words
                  </span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {overview.totalWordsWritten.toLocaleString()}
                </div>
                <div className="text-green-300 text-sm">
                  +{monthly.wordsWritten.toLocaleString()} this month
                </div>
              </motion.div>

              {/* Writing Streak */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <Target className="w-10 h-10 text-orange-400" />
                  <span className="text-orange-300 text-sm font-medium">
                    Streak
                  </span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {overview.writingStreak}
                </div>
                <div className="text-orange-300 text-sm">
                  {overview.writingStreak === 1 ? 'day' : 'days'} in a row
                </div>
              </motion.div>

              {/* Completion Rate */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <Trophy className="w-10 h-10 text-purple-400" />
                  <span className="text-purple-300 text-sm font-medium">
                    Success
                  </span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {overview.completionRate}%
                </div>
                <div className="text-purple-300 text-sm">completion rate</div>
              </motion.div>
            </div>

            {/* FIXED: Weekly Progress Chart with better responsive design */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-800/50 border border-gray-600/50 rounded-2xl p-8 mb-8"
            >
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <BarChart3 className="w-6 h-6 mr-3 text-blue-400" />
                Weekly Writing Activity
              </h3>

              <div className="grid grid-cols-7 gap-2 sm:gap-4 mb-6">
                {weeklyProgress.map((day, index) => {
                  const maxWords = Math.max(
                    ...weeklyProgress.map((d) => d.words)
                  );
                  const height =
                    maxWords > 0 ? (day.words / maxWords) * 100 : 0;
                  const storiesHeight = Math.max(day.stories * 20, 8);

                  return (
                    <div key={day.date} className="text-center">
                      <div className="h-32 flex items-end justify-center mb-3 space-y-1">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: 0.1 * index }}
                          className="w-4 sm:w-6 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t min-h-[4px]"
                          title={`${day.words} words, ${day.stories} stories`}
                        />
                      </div>
                      <div className="text-xs text-gray-400 mb-1">
                        {new Date(day.date).toLocaleDateString('en', {
                          weekday: 'short',
                        })}
                      </div>
                      <div className="text-xs">
                        <div className="text-blue-300">{day.words}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gradient-to-t from-blue-500 to-blue-400 rounded mr-2"></div>
                  <span className="text-gray-300 text-sm">Words Written</span>
                </div>
              </div>
            </motion.div>

            {/* FIXED: Recent Activity with improved layout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-800/50 border border-gray-600/50 rounded-2xl p-8"
            >
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <Clock className="w-6 h-6 mr-3 text-green-400" />
                Recent Writing Activity
              </h3>

              <div className="space-y-4">
                {dashboardData.recentActivity.length > 0 ? (
                  dashboardData.recentActivity
                    .slice(0, 5)
                    .map((activity: any) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <PenTool className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              {activity.sessionTitle}
                            </div>
                            <div className="text-sm text-gray-400">
                              Turn {activity.turnNumber} • {activity.wordCount}{' '}
                              words
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <PenTool className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">
                      Start writing to see your activity here!
                    </p>
                    <button
                      onClick={() => router.push('/create-stories')}
                      className="mt-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-6 py-3 rounded-xl font-semibold transition-colors"
                    >
                      Create Your First Story
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* FIXED: Sidebar with proper responsive spacing */}
          <div className="xl:col-span-4 space-y-8">
            {/* Active Stories */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800/50 border border-gray-600/50 rounded-2xl p-8"
            >
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <Sparkles className="w-6 h-6 mr-3 text-yellow-400" />
                Continue Writing
              </h3>

              {sessions.active > 0 ? (
                <div>
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {sessions.active}
                  </div>
                  <p className="text-gray-300 text-lg mb-6">
                    {sessions.active === 1
                      ? 'story waiting'
                      : 'stories waiting'}{' '}
                    for you to continue
                  </p>
                  <button
                    onClick={() =>
                      router.push(
                        '/children-dashboard/my-stories?filter=active'
                      )
                    }
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 px-6 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <Edit className="w-5 h-5" />
                    <span>Continue Stories</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-6 text-lg">
                    No stories in progress
                  </p>
                  <button
                    onClick={() => router.push('/create-stories')}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-6 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Start New Story</span>
                  </button>
                </div>
              )}
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800/50 border border-gray-600/50 rounded-2xl p-8"
            >
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <Award className="w-6 h-6 mr-3 text-purple-400" />
                Achievements
              </h3>

              <div className="space-y-3">
                {achievements.slice(0, 5).map((achievement, index) => (
                  <motion.div
                    key={achievement}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center space-x-3 p-3 bg-purple-500/20 rounded-xl"
                  >
                    <Trophy className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    <span className="text-purple-200 font-medium">
                      {achievement}
                    </span>
                  </motion.div>
                ))}

                {achievements.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Complete stories to earn achievements!</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-800/50 border border-gray-600/50 rounded-2xl p-8"
            >
              <h3 className="text-xl font-semibold mb-6">Quick Actions</h3>

              <div className="space-y-4">
                <button
                  onClick={() => router.push('/create-stories')}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-6 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-3"
                >
                  <PenTool className="w-5 h-5" />
                  <span>Write New Story</span>
                </button>

                <button
                  onClick={() => router.push('/children-dashboard/my-stories')}
                  className="w-full bg-gray-700 hover:bg-gray-600 px-6 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-3"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>View My Stories</span>
                </button>

                <button
                  onClick={() => router.push('/children-dashboard/progress')}
                  className="w-full bg-gray-700 hover:bg-gray-600 px-6 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-3"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>View Progress</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
