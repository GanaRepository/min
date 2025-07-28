'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  BookOpen,
  MessageSquare,
  TrendingUp,
  UserCheck,
  FileText,
  Star,
  AlertCircle,
  Calendar,
  Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface MentorStats {
  assignedStudents: number;
  totalStories: number;
  totalComments: number;
  pendingReviews: number;
  monthlyStats: {
    newStories: number;
    commentsGiven: number;
    assessmentsCompleted: number;
  };
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  studentName?: string;
  storyTitle?: string;
}

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  totalStories: number;
  completedStories: number;
  lastActiveAt: string;
}

export default function MentorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<MentorStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [topStudents, setTopStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsResponse, activityResponse, studentsResponse] =
        await Promise.all([
          fetch('/api/mentor/dashboard-stats'),
          fetch('/api/mentor/recent-activity'),
          fetch('/api/mentor/students?limit=3'),
        ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.stats);
        }
      }

      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        if (activityData.success) {
          setRecentActivity(activityData.activities);
        }
      }

      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        if (studentsData.success) {
          setTopStudents(studentsData.students);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'mentor') {
      router.push('/login/mentor');
      return;
    }

    fetchDashboardData();
  }, [session, status, router, fetchDashboardData]);

  const statCards = [
    {
      title: 'Assigned Students',
      value: stats?.assignedStudents || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      href: '/mentor-dashboard/students',
    },
    {
      title: 'Student Stories',
      value: stats?.totalStories || 0,
      icon: BookOpen,
      color: 'from-green-500 to-green-600',
      href: '/mentor-dashboard/stories',
    },
    {
      title: 'Comments Given',
      value: stats?.totalComments || 0,
      icon: MessageSquare,
      color: 'from-purple-500 to-purple-600',
      href: '/mentor-dashboard/comments',
    },
    {
      title: 'Pending Reviews',
      value: stats?.pendingReviews || 0,
      icon: AlertCircle,
      color: 'from-orange-500 to-orange-600',
      href: '/mentor-dashboard/stories?filter=pending',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {session?.user.firstName}!
        </h1>
        <p className="text-gray-300">
          Ready to inspire young writers today? Check your student&apos;s progress
          below.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={card.href}>
                <div className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">
                        {card.title}
                      </p>
                      <p className="text-3xl font-bold text-white mt-2">
                        {card.value.toLocaleString()}
                      </p>
                    </div>
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${card.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Monthly Stats & Top Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance */}
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">This Month</h3>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">New Stories</span>
              <span className="text-white font-medium">
                {stats?.monthlyStats.newStories || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Comments Given</span>
              <span className="text-white font-medium">
                {stats?.monthlyStats.commentsGiven || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Assessments</span>
              <span className="text-white font-medium">
                {stats?.monthlyStats.assessmentsCompleted || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Top Students */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Active Students
          </h3>
          <div className="space-y-4">
            {topStudents.map((student, index) => (
              <div key={student._id} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {student.firstName[0]}
                    {student.lastName[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {student.totalStories} stories • {student.completedStories}{' '}
                    completed
                  </p>
                </div>
                <Link href={`/mentor-dashboard/students/${student._id}`}>
                  <button className="text-blue-400 hover:text-blue-300 text-sm">
                    View
                  </button>
                </Link>
              </div>
            ))}
          </div>
          <Link href="/mentor-dashboard/students">
            <button className="w-full mt-4 text-center text-blue-400 hover:text-blue-300 text-sm">
              View All Students →
            </button>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
          <Link
            href="/mentor-dashboard/activity"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            View All
          </Link>
        </div>

        {recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.slice(0, 5).map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center space-x-4 p-4 bg-gray-700/50 rounded-lg"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}
                >
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.description}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-400 text-xs">
                      {new Date(activity.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No recent activity to display</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/mentor-dashboard/stories?filter=pending">
            <button className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 px-4 rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200 flex items-center justify-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Review Pending Stories</span>
            </button>
          </Link>

          <Link href="/mentor-dashboard/students">
            <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Manage Students</span>
            </button>
          </Link>

          <Link href="/mentor-dashboard/assessments">
            <button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center space-x-2">
              <Star className="w-4 h-4" />
              <span>Create Assessment</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function getActivityColor(type: string) {
  switch (type) {
    case 'story_reviewed':
      return 'bg-blue-500';
    case 'comment_added':
      return 'bg-green-500';
    case 'assessment_completed':
      return 'bg-purple-500';
    case 'student_assigned':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'story_reviewed':
      return '📖';
    case 'comment_added':
      return '💬';
    case 'assessment_completed':
      return '⭐';
    case 'student_assigned':
      return '👤';
    default:
      return '📊';
  }
}
