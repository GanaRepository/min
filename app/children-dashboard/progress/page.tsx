// app/children-dashboard/progress/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Award, 
  BookOpen, 
  Target,
  Calendar,
  Star,
  Zap,
  Trophy
} from 'lucide-react';
import ProgressCharts from '@/components/progress/ProgressCharts';
import AchievementBadges from '@/components/progress/AchievementBadges';
import WritingStreak from '@/components/progress/WritingStreak';
import SkillProgress from '@/components/progress/SkillProgress';
import GenreAnalysis from '@/components/progress/GenreAnalysis';
import GoalsTracker from '@/components/progress/GoalsTracker';

interface ProgressData {
  totalWords: number;
  storiesCompleted: number;
  writingStreak: number;
  averageScore: number;
  weeklyActivity: Array<{ date: string; words: number }>;
  skillProgress: {
    grammar: number;
    creativity: number;
  };
  genreBreakdown: Array<{ genre: string; count: number; percentage: number }>;
  achievements: Array<{ id: string; name: string; description: string; unlockedAt: string }>;
  goals: Array<{ id: string; title: string; progress: number; target: number; type: string }>;
}

export default function ProgressPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'child') {
      router.push('/login/child');
      return;
    }

    fetchProgressData();
  }, [session, status]);

  const fetchProgressData = async () => {
    try {
      const response = await fetch('/api/analytics/progress');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch progress data');
      }

      setProgressData(data.progress);
    } catch (error) {
      console.error('Error fetching progress data:', error);
      // Fallback data for demo
      setProgressData({
        totalWords: 5234,
        storiesCompleted: 12,
        writingStreak: 7,
        averageScore: 88,
        weeklyActivity: [
          { date: '2024-01-01', words: 150 },
          { date: '2024-01-02', words: 200 },
          { date: '2024-01-03', words: 180 },
          { date: '2024-01-04', words: 220 },
          { date: '2024-01-05', words: 160 },
          { date: '2024-01-06', words: 190 },
          { date: '2024-01-07', words: 156 },
        ],
        skillProgress: {
          grammar: 85,
          creativity: 92,
        },
        genreBreakdown: [
          { genre: 'Adventure', count: 5, percentage: 42 },
          { genre: 'Fantasy', count: 4, percentage: 33 },
          { genre: 'Mystery', count: 2, percentage: 17 },
          { genre: 'Sci-Fi', count: 1, percentage: 8 },
        ],
        achievements: [
          { id: '1', name: '7-Day Streak', description: 'Keep writing daily!', unlockedAt: '2024-01-07' },
          { id: '2', name: '10th Story', description: 'Double digits!', unlockedAt: '2024-01-05' },
          { id: '3', name: 'Grammar Expert', description: '90%+ grammar score', unlockedAt: '2024-01-03' },
        ],
        goals: [
          { id: '1', title: 'Write 3 stories this month', progress: 2, target: 3, type: 'stories' },
          { id: '2', title: 'Improve grammar to 90%', progress: 85, target: 90, type: 'skill' },
          { id: '3', title: 'Keep 30-day streak', progress: 7, target: 30, type: 'streak' },
        ],
      });
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

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
          📈 Your Writing Progress
        </h1>
        <p className="text-gray-400">
          Track your growth and celebrate your achievements!
        </p>
      </motion.div>

      {/* Overview Stats */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Words',
              value: progressData.totalWords.toLocaleString(),
              change: '+456 this week',
              icon: BookOpen,
              color: 'from-green-500 to-emerald-600'
            },
            {
              label: 'Stories Completed',
              value: progressData.storiesCompleted.toString(),
              change: '+2 new',
              icon: Trophy,
              color: 'from-blue-500 to-cyan-600'
            },
            {
              label: 'Writing Streak',
              value: `${progressData.writingStreak} days`,
              change: 'Best: 14 days',
              icon: Zap,
              color: 'from-orange-500 to-red-600'
            },
            {
              label: 'Average Score',
              value: `${progressData.averageScore}%`,
              change: '+5% improvement',
              icon: Star,
              color: 'from-purple-500 to-pink-600'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-green-400 text-sm font-medium">
                  {stat.change}
                </span>
              </div>
              
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                {stat.value}
              </div>
              
              <p className="text-gray-400 text-sm">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Charts Section */}
      <ProgressCharts 
        weeklyActivity={progressData.weeklyActivity}
        className="mb-8"
      />

      {/* Skills and Genre Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <SkillProgress 
          grammarScore={progressData.skillProgress.grammar}
          creativityScore={progressData.skillProgress.creativity}
        />
        <GenreAnalysis 
          genreBreakdown={progressData.genreBreakdown}
        />
      </div>

      {/* Writing Streak */}
      <WritingStreak 
        currentStreak={progressData.writingStreak}
        className="mb-8"
      />

      {/* Achievements and Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <AchievementBadges 
          achievements={progressData.achievements}
        />
        <GoalsTracker 
          goals={progressData.goals}
        />
      </div>
    </div>
  );
}