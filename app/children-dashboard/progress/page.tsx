// app/children-dashboard/progress/page.tsx
'use client';

import { useState, useEffect } from 'react';
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
  LineChart,
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

export default function ProgressPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    'week' | 'month' | 'year'
  >('month');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'child') {
      router.push('/login/child');
      return;
    }

    fetchProgressData();
  }, [session, status, router]);

  const fetchProgressData = async () => {
    try {
      const response = await fetch('/api/user/progress');
      const data = await response.json();

      if (data.success) {
        setProgressData(data.progress);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white">
      {/* Header with proper spacing */}
      <div className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-600/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mt-16"
          >
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold flex items-center ">
                <TrendingUp className="w-8 h-8 mr-4 text-blue-400" />
                Your Writing Progress
              </h1>
              <p className="text-gray-300 mt-2 text-lg">
                Track your amazing writing journey and see how much you've
                grown! 🚀
              </p>
            </div>

            {/* Timeframe Selector */}
            <div className="flex bg-gray-800/50 border border-gray-600/50 rounded-xl overflow-hidden">
              {[
                { key: 'week', label: 'This Week' },
                { key: 'month', label: 'This Month' },
                { key: 'year', label: 'This Year' },
              ].map((timeframe) => (
                <button
                  key={timeframe.key}
                  onClick={() => setSelectedTimeframe(timeframe.key as any)}
                  className={`px-6 py-3 font-medium transition-all ${
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

      {/* Main Content with proper container and spacing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats with proper spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Stories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="w-12 h-12 text-blue-400" />
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {overview.totalStoriesCreated}
                </div>
                <div className="text-blue-300 text-sm">Stories Written</div>
              </div>
            </div>
            <div className="text-blue-300 text-sm">
              +{monthly.storiesCreated} this month
            </div>
          </motion.div>

          {/* Total Words */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <PenTool className="w-12 h-12 text-green-400" />
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {overview.totalWordsWritten.toLocaleString()}
                </div>
                <div className="text-green-300 text-sm">Words Written</div>
              </div>
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
              <Zap className="w-12 h-12 text-orange-400" />
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {overview.writingStreak}
                </div>
                <div className="text-orange-300 text-sm">Day Streak</div>
              </div>
            </div>
            <div className="text-orange-300 text-sm">
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
            <div className="flex items-center justify-between mb-4">
              <Trophy className="w-12 h-12 text-purple-400" />
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {overview.bestScore}%
                </div>
                <div className="text-purple-300 text-sm">Best Score</div>
              </div>
            </div>
            <div className="text-purple-300 text-sm">
              Average: {overview.averageScore}%
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left Column - Charts and Analytics */}
          <div className="xl:col-span-8 space-y-8">
            {/* Writing Progress Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-800/50 border border-gray-600/50 rounded-2xl p-8"
            >
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <BarChart3 className="w-6 h-6 mr-3 text-blue-400" />
                Weekly Writing Activity
              </h3>

              <div className="grid grid-cols-7 gap-4 mb-6">
                {weekly.map((day, index) => {
                  const maxWords = Math.max(...weekly.map((d) => d.words));
                  const wordsHeight =
                    maxWords > 0 ? (day.words / maxWords) * 100 : 0;
                  const storiesHeight = Math.max(day.stories * 20, 8); // Minimum height for visibility

                  return (
                    <div key={day.date} className="text-center">
                      <div className="h-32 flex flex-col items-center justify-end mb-3 space-y-1">
                        {/* Words Bar */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${wordsHeight}%` }}
                          transition={{ delay: 0.1 * index }}
                          className="w-6 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t min-h-[4px]"
                          title={`${day.words} words`}
                        />
                        {/* Stories Bar */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${storiesHeight}%` }}
                          transition={{ delay: 0.1 * index + 0.1 }}
                          className="w-6 bg-gradient-to-t from-green-500 to-green-400 rounded-t min-h-[4px]"
                          title={`${day.stories} stories`}
                        />
                      </div>
                      <div className="text-xs text-gray-400 mb-1">
                        {new Date(day.date).toLocaleDateString('en', {
                          weekday: 'short',
                        })}
                      </div>
                      <div className="text-xs">
                        <div className="text-blue-300">{day.words}w</div>
                        <div className="text-green-300">{day.stories}s</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center space-x-6 text-sm">
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

            {/* Skills Development */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-800/50 border border-gray-600/50 rounded-2xl p-8"
            >
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <Target className="w-6 h-6 mr-3 text-green-400" />
                Skill Development
              </h3>

              <div className="space-y-6">
                {Object.entries(skills).map(([skill, data]) => (
                  <div key={skill}>
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
                        transition={{ duration: 1, delay: 0.2 }}
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Goals and Achievements */}
          <div className="xl:col-span-4 space-y-8">
            {/* Current Goals */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800/50 border border-gray-600/50 rounded-2xl p-8"
            >
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <Target className="w-6 h-6 mr-3 text-yellow-400" />
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
              className="bg-gray-800/50 border border-gray-600/50 rounded-2xl p-8"
            >
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <Award className="w-6 h-6 mr-3 text-purple-400" />
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
                  <div className="text-center py-8 text-gray-400">
                    <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
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
              className="bg-gray-800/50 border border-gray-600/50 rounded-2xl p-8"
            >
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <Calendar className="w-6 h-6 mr-3 text-blue-400" />
                This Month's Summary
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-500/20 rounded-xl">
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 text-blue-400 mr-2" />
                    <span className="text-white text-sm">
                      Stories Completed
                    </span>
                  </div>
                  <span className="text-blue-400 font-semibold">
                    {monthly.storiesCreated}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-xl">
                  <div className="flex items-center">
                    <PenTool className="w-5 h-5 text-green-400 mr-2" />
                    <span className="text-white text-sm">Words Written</span>
                  </div>
                  <span className="text-green-400 font-semibold">
                    {monthly.wordsWritten.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-500/20 rounded-xl">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-purple-400 mr-2" />
                    <span className="text-white text-sm">Average Score</span>
                  </div>
                  <span className="text-purple-400 font-semibold">
                    {monthly.averageScore}%
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-500/20 rounded-xl">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-orange-400 mr-2" />
                    <span className="text-white text-sm">Days Active</span>
                  </div>
                  <span className="text-orange-400 font-semibold">
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
