

// app/children-dashboard/page.tsx - COMPLETE FIXED VERSION
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Award,
  Target,
  Calendar,
  BookOpen,
  PenTool,
  Trophy,
  Zap,
  Clock,
  Star,
  BarChart3,
  Plus,
  Eye,
} from 'lucide-react';

interface ProgressData {
  overview: {
    totalStoriesCreated: number;
    totalWordsWritten: number;
    averageWordsPerStory: number;
    writingStreak: number;
    completionRate: number;
    bestScore: number;
    averageScore: number;
  };
  monthly: {
    storiesCreated: number;
    wordsWritten: number;
    averageScore: number;
    daysActive: number;
  };
  weekly: Array<{
    date: string;
    stories: number;
    words: number;
    score: number;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    earnedAt: string;
    category: 'writing' | 'creativity' | 'consistency' | 'quality';
  }>;
  skills: {
    grammar: { current: number; improvement: number };
    creativity: { current: number; improvement: number };
    vocabulary: { current: number; improvement: number };
    storytelling: { current: number; improvement: number };
  };
  goals: Array<{
    id: string;
    title: string;
    target: number;
    current: number;
    type: 'stories' | 'words' | 'streak' | 'score';
  }>;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    'week' | 'month' | 'year'
  >('month');

  // FIXED: Memoized fetchProgressData function to prevent infinite loops
  const fetchProgressData = useCallback(async () => {
    try {
      console.log(
        '🔄 Fetching progress data for timeframe:',
        selectedTimeframe
      );

      // FIXED: Use the new progress API endpoint
      const response = await fetch(
        `/api/user/progress?timeframe=${selectedTimeframe}`
      );
      const data = await response.json();

      if (data.success) {
        console.log('✅ Progress data received:', data.progress);
        setProgressData(data.progress);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('❌ Error fetching progress data:', error);
      // You can add a toast notification here if you have one
    } finally {
      setIsLoading(false);
    }
  }, [selectedTimeframe]);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'child') {
      router.push('/login/child');
      return;
    }

    fetchProgressData();
  }, [session, status, router, fetchProgressData]);

  // FIXED: Separate useEffect for timeframe changes
  useEffect(() => {
    if (session && session.user.role === 'child') {
      fetchProgressData();
    }
  }, [selectedTimeframe, session, fetchProgressData]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'child' || !progressData) {
    return null;
  }

  const { overview, monthly, weekly, achievements, skills, goals } =
    progressData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white pt-12">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-600/40">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 sm:gap-6 mt-8 sm:mt-12 lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold flex items-center">
                <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 mr-3 sm:mr-4 text-blue-400" />
                Your Writing Progress
              </h1>
              <p className="text-gray-300 mt-2 text-base sm:text-lg">
                Track your amazing writing journey and see how much you&apos;ve
                grown! 🚀
              </p>
            </div>

            {/* FIXED: Quick Actions Buttons */}
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/create-stories')}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold flex items-center space-x-2 shadow-lg text-sm sm:text-base"
              >
                <Plus className="w-5 h-5" />
                <span>Write New Story</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/children-dashboard/my-stories')}
                className="bg-gray-700 hover:bg-gray-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold flex items-center space-x-2 text-sm sm:text-base"
              >
                <Eye className="w-5 h-5" />
                <span>View My Stories</span>
              </motion.button>
            </div>
          </motion.div>

          {/* FIXED: Timeframe Selector */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 sm:mt-8 flex justify-center"
          >
            <div className="flex bg-gray-800/50 border border-gray-600/50 rounded-xl overflow-hidden">
              {[
                { key: 'week', label: 'This Week' },
                { key: 'month', label: 'This Month' },
                { key: 'year', label: 'This Year' },
              ].map((timeframe) => (
                <button
                  key={timeframe.key}
                  onClick={() => {
                    console.log('🔄 Switching timeframe to:', timeframe.key);
                    setSelectedTimeframe(timeframe.key as any);
                  }}
                  className={`px-4 sm:px-6 py-2.5 sm:py-3 font-medium transition-all text-sm sm:text-base ${
                    selectedTimeframe === timeframe.key
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  {timeframe.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Total Stories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <BookOpen className="w-8 h-8 sm:w-12 sm:h-12 text-blue-400" />
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-bold text-white">
                  {overview.totalStoriesCreated}
                </div>
                <div className="text-blue-300 text-xs sm:text-sm">Stories Written</div>
              </div>
            </div>
            <div className="text-blue-300 text-xs sm:text-sm">
              +{monthly.storiesCreated} this {selectedTimeframe}
            </div>
          </motion.div>

          {/* Total Words */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <PenTool className="w-8 h-8 sm:w-12 sm:h-12 text-green-400" />
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-bold text-white">
                  {overview.totalWordsWritten.toLocaleString()}
                </div>
                <div className="text-green-300 text-xs sm:text-sm">Words Written</div>
              </div>
            </div>
            <div className="text-green-300 text-xs sm:text-sm">
              +{monthly.wordsWritten.toLocaleString()} this {selectedTimeframe}
            </div>
          </motion.div>

          {/* Writing Streak */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Zap className="w-8 h-8 sm:w-12 sm:h-12 text-orange-400" />
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-bold text-white">
                  {overview.writingStreak}
                </div>
                <div className="text-orange-300 text-xs sm:text-sm">Day Streak</div>
              </div>
            </div>
            <div className="text-orange-300 text-xs sm:text-sm">
              {overview.writingStreak === 1
                ? 'Keep it going!'
                : 'Amazing consistency!'}
            </div>
          </motion.div>

          {/* Best Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Trophy className="w-8 h-8 sm:w-12 sm:h-12 text-purple-400" />
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-bold text-white">
                  {overview.bestScore}%
                </div>
                <div className="text-purple-300 text-xs sm:text-sm">Best Score</div>
              </div>
            </div>
            <div className="text-purple-300 text-xs sm:text-sm">
              Average: {overview.averageScore}%
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:gap-8">
          {/* Left Column - Charts and Analytics */}
          <div className="xl:col-span-8 space-y-6 sm:space-y-8">
            {/* Weekly Activity Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-800/50 border border-gray-600/50 rounded-2xl p-4 sm:p-8"
            >
              <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-400" />
                Weekly Writing Activity
              </h3>

              <div className="grid grid-cols-7 gap-2 sm:gap-4 mb-4 sm:mb-6">
                {weekly.map((day, index) => {
                  const maxWords = Math.max(...weekly.map((d) => d.words), 1);
                  const wordsHeight =
                    maxWords > 0
                      ? Math.max(
                          (day.words / maxWords) * 80,
                          day.words > 0 ? 8 : 0
                        )
                      : 0;
                  const storiesHeight = Math.max(
                    day.stories * 20,
                    day.stories > 0 ? 8 : 0
                  );

                  return (
                    <div key={day.date} className="text-center">
                      <div className="h-20 sm:h-32 flex flex-col items-center justify-end mb-2 sm:mb-3 space-y-1">
                        {/* Words Bar */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${wordsHeight}px` }}
                          transition={{ delay: 0.1 * index, duration: 0.6 }}
                          className="w-6 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                          title={`${day.words} words`}
                          style={{ minHeight: day.words > 0 ? '8px' : '0px' }}
                        />
                        {/* Stories Bar */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${storiesHeight}px` }}
                          transition={{
                            delay: 0.1 * index + 0.1,
                            duration: 0.6,
                          }}
                          className="w-6 bg-gradient-to-t from-green-500 to-green-400 rounded-t"
                          title={`${day.stories} stories`}
                          style={{ minHeight: day.stories > 0 ? '8px' : '0px' }}
                        />
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-400 mb-1">
                        {new Date(day.date).toLocaleDateString('en', {
                          weekday: 'short',
                        })}
                      </div>
                      <div className="text-[10px] sm:text-xs">
                        <div className="text-blue-300">{day.words}w</div>
                        <div className="text-green-300">{day.stories}s</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center space-x-3 sm:space-x-6 text-xs sm:text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gradient-to-t from-blue-500 to-blue-400 rounded mr-2"></div>
                  <span className="text-gray-300">Words</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gradient-to-t from-green-500 to-green-400 rounded mr-2"></div>
                  <span className="text-gray-300">Stories</span>
                </div>
              </div>
            </motion.div>

            {/* FIXED: Skills Development */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-800/50 border border-gray-600/50 rounded-2xl p-4 sm:p-8"
            >
              <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-green-400" />
                Skill Development
              </h3>

              <div className="space-y-6">
                {Object.entries(skills).map(([skill, data], index) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium capitalize">
                        {skill}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">
                          {data.current}%
                        </span>
                        {data.improvement > 0 && (
                          <span className="text-green-400 text-sm flex items-center">
                            +{data.improvement}%
                            <TrendingUp className="w-3 h-3 ml-1" />
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${data.current}%` }}
                        transition={{ duration: 1.5, delay: 0.2 + 0.1 * index }}
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Goals and Achievements */}
          <div className="xl:col-span-4 space-y-6 sm:space-y-8 mt-6 xl:mt-0">
            {/* Current Goals */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800/50 border border-gray-600/50 rounded-2xl p-4 sm:p-8"
            >
              <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-yellow-400" />
                Current Goals
              </h3>

              <div className="space-y-6">
                {goals.map((goal, index) => {
                  const progress = (goal.current / goal.target) * 100;

                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium text-sm">
                          {goal.title}
                        </span>
                        <span className="text-yellow-400 text-sm">
                          {goal.current}/{goal.target}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(progress, 100)}%` }}
                          transition={{ duration: 0.8, delay: 0.1 * index }}
                          className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                        />
                      </div>
                      {progress >= 100 && (
                        <div className="text-green-400 text-xs mt-1 flex items-center">
                          <Trophy className="w-3 h-3 mr-1" />
                          Goal achieved!
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Recent Achievements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800/50 border border-gray-600/50 rounded-2xl p-4 sm:p-8"
            >
              <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-purple-400" />
                Recent Achievements
              </h3>

              <div className="space-y-4">
                {achievements.slice(0, 6).map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center space-x-3 p-4 bg-purple-500/20 border border-purple-500/30 rounded-xl"
                  >
                    <Trophy className="w-8 h-8 text-purple-400 flex-shrink-0" />
                    <div>
                      <div className="text-purple-200 font-medium text-sm">
                        {achievement.title}
                      </div>
                      <div className="text-purple-300 text-xs mt-1">
                        {achievement.description}
                      </div>
                      <div className="text-purple-400 text-xs mt-1">
                        {new Date(achievement.earnedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {achievements.length === 0 && (
                  <div className="text-center py-6 sm:py-8 text-gray-400">
                    <Award className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-50" />
                    <p>Complete stories to earn achievements!</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Monthly Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-800/50 border border-gray-600/50 rounded-2xl p-4 sm:p-8"
            >
              <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-400" />
                This{' '}
                {selectedTimeframe.charAt(0).toUpperCase() +
                  selectedTimeframe.slice(1)}
                &apos;s Summary
              </h3>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between p-2 sm:p-3 bg-blue-500/20 rounded-xl">
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mr-1 sm:mr-2" />
                    <span className="text-white text-xs sm:text-sm">
                      Stories Completed
                    </span>
                  </div>
                  <span className="text-blue-400 font-semibold text-xs sm:text-base">
                    {monthly.storiesCreated}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 sm:p-3 bg-green-500/20 rounded-xl">
                  <div className="flex items-center">
                    <PenTool className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mr-1 sm:mr-2" />
                    <span className="text-white text-xs sm:text-sm">Words Written</span>
                  </div>
                  <span className="text-green-400 font-semibold text-xs sm:text-base">
                    {monthly.wordsWritten.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 sm:p-3 bg-purple-500/20 rounded-xl">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 mr-1 sm:mr-2" />
                    <span className="text-white text-xs sm:text-sm">Average Score</span>
                  </div>
                  <span className="text-purple-400 font-semibold text-xs sm:text-base">
                    {monthly.averageScore}%
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 sm:p-3 bg-orange-500/20 rounded-xl">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 mr-1 sm:mr-2" />
                    <span className="text-white text-xs sm:text-sm">Days Active</span>
                  </div>
                  <span className="text-orange-400 font-semibold text-xs sm:text-base">
                    {monthly.daysActive}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
