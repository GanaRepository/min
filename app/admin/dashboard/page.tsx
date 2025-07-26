// 'use client';

// import { useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';

// interface DashboardStats {
//   totalUsers: number;
//   totalChildren: number;
//   totalMentors: number;
//   totalStories: number;
//   activeStories: number;
//   completedStories: number;
//   monthlyStats: {
//     newUsers: number;
//     storiesCreated: number;
//     assessmentsCompleted: number;
//   };
// }

// export default function AdminDashboard() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const [stats, setStats] = useState<DashboardStats | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (status === 'loading') return;

//     if (!session || session.user.role !== 'admin') {
//       router.push('/admin/login');
//       return;
//     }

//     fetchDashboardStats();
//   }, [session, status, router]);

//   const fetchDashboardStats = async () => {
//     try {
//       const response = await fetch('/api/admin/dashboard-stats');
//       const data = await response.json();

//       if (data.success) {
//         setStats(data.stats);
//       }
//     } catch (error) {
//       console.error('Error fetching dashboard stats:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   function StatCard({
//     title,
//     value,
//     icon,
//     color,
//   }: {
//     title: string;
//     value: number;
//     icon?: string;
//     color?: string;
//   }) {
//     return (
//       <div className="bg-white overflow-hidden shadow rounded-lg">
//         <div className="p-5">
//           <div className="flex items-center">
//             <div className="flex-shrink-0">
//               <div
//                 className={`w-8 h-8 ${color || 'bg-indigo-500'} rounded-md flex items-center justify-center`}
//               >
//                 <span className="text-white text-sm">{icon || '📊'}</span>
//               </div>
//             </div>
//             <div className="ml-5 w-0 flex-1">
//               <dl>
//                 <dt className="text-sm font-medium text-gray-500 truncate">
//                   {title}
//                 </dt>
//                 <dd className="text-lg font-medium text-gray-900">
//                   {value.toLocaleString()}
//                 </dd>
//               </dl>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   function RecentActivity() {
//     const [activities, setActivities] = useState([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//       fetchRecentActivity();
//     }, []);

//     const fetchRecentActivity = async () => {
//       try {
//         const response = await fetch('/api/admin/recent-activity');
//         const data = await response.json();
//         if (data.success) {
//           setActivities(data.activities);
//         }
//       } catch (error) {
//         console.error('Error fetching recent activity:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     return (
//       <div className="bg-white shadow rounded-lg mb-8">
//         <div className="px-4 py-5 sm:p-6">
//           <h3 className="text-lg leading-6 font-medium text-gray-900">
//             Recent Activity
//           </h3>
//           <div className="mt-6 flow-root">
//             <ul className="-mb-8">
//               {activities.map((activity: any, activityIdx: number) => (
//                 <li key={activity.id}>
//                   <div className="relative pb-8">
//                     {activityIdx !== activities.length - 1 ? (
//                       <span
//                         className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
//                         aria-hidden="true"
//                       />
//                     ) : null}
//                     <div className="relative flex space-x-3">
//                       <div>
//                         <span
//                           className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getActivityColor(activity.type)}`}
//                         >
//                           {getActivityIcon(activity.type)}
//                         </span>
//                       </div>
//                       <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
//                         <div>
//                           <p className="text-sm text-gray-500">
//                             {activity.description}
//                           </p>
//                         </div>
//                         <div className="text-right text-sm whitespace-nowrap text-gray-500">
//                           {new Date(activity.createdAt).toLocaleDateString()}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   function getActivityColor(type: string) {
//     switch (type) {
//       case 'user_registered':
//         return 'bg-green-500';
//       case 'story_completed':
//         return 'bg-blue-500';
//       case 'mentor_assigned':
//         return 'bg-purple-500';
//       case 'comment_added':
//         return 'bg-yellow-500';
//       default:
//         return 'bg-gray-500';
//     }
//   }

//   function getActivityIcon(type: string) {
//     switch (type) {
//       case 'user_registered':
//         return '👤';
//       case 'story_completed':
//         return '📚';
//       case 'mentor_assigned':
//         return '👨‍🏫';
//       case 'comment_added':
//         return '💬';
//       default:
//         return '📊';
//     }
//   }

//   function QuickActions() {
//     const router = useRouter();

//     return (
//       <div className="bg-white shadow rounded-lg">
//         <div className="px-4 py-5 sm:p-6">
//           <h3 className="text-lg leading-6 font-medium text-gray-900">
//             Quick Actions
//           </h3>
//           <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
//             <button
//               onClick={() => router.push('/admin-dashboard/create-mentor')}
//               className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 border border-gray-300 rounded-lg hover:bg-gray-50"
//             >
//               <div>
//                 <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
//                   <svg
//                     className="h-6 w-6"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M12 6v6m0 0v6m0-6h6m-6 0H6"
//                     />
//                   </svg>
//                 </span>
//               </div>
//               <div className="mt-8">
//                 <h3 className="text-lg font-medium">
//                   <span className="absolute inset-0" aria-hidden="true" />
//                   Create Mentor
//                 </h3>
//                 <p className="mt-2 text-sm text-gray-500">
//                   Add a new mentor and assign students
//                 </p>
//               </div>
//             </button>

//             <button
//               onClick={() => router.push('/admin-dashboard/bulk-actions')}
//               className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 border border-gray-300 rounded-lg hover:bg-gray-50"
//             >
//               <div>
//                 <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
//                   <svg
//                     className="h-6 w-6"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
//                     />
//                   </svg>
//                 </span>
//               </div>
//               <div className="mt-8">
//                 <h3 className="text-lg font-medium">Bulk Actions</h3>
//                 <p className="mt-2 text-sm text-gray-500">
//                   Manage multiple users at once
//                 </p>
//               </div>
//             </button>

//             <button
//               onClick={() => router.push('/admin-dashboard/analytics')}
//               className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 border border-gray-300 rounded-lg hover:bg-gray-50"
//             >
//               <div>
//                 <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
//                   <svg
//                     className="h-6 w-6"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
//                     />
//                   </svg>
//                 </span>
//               </div>
//               <div className="mt-8">
//                 <h3 className="text-lg font-medium">View Analytics</h3>
//                 <p className="mt-2 text-sm text-gray-500">
//                   Platform usage and performance metrics
//                 </p>
//               </div>
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Header */}
//       <div className="bg-white shadow">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-6">
//             <h1 className="text-3xl font-bold text-gray-900">
//               Admin Dashboard
//             </h1>
//             <div className="flex space-x-4">
//               <button
//                 onClick={() => router.push('/admin-dashboard/users')}
//                 className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
//               >
//                 Manage Users
//               </button>
//               <button
//                 onClick={() => router.push('/admin-dashboard/mentors')}
//                 className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
//               >
//                 Manage Mentors
//               </button>
//               <button
//                 onClick={() => router.push('/admin-dashboard/stories')}
//                 className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
//               >
//                 All Stories
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Stats Grid */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           <StatCard title="Total Users" value={stats?.totalUsers || 0} />
//           <StatCard title="Children" value={stats?.totalChildren || 0} />
//           <StatCard title="Mentors" value={stats?.totalMentors || 0} />
//           <StatCard title="Stories Created" value={stats?.totalStories || 0} />
//         </div>

//         {/* Recent Activity */}
//         <RecentActivity />

//         {/* Quick Actions */}
//         <QuickActions />
//       </div>
//     </div>
//   );
// }

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  BookOpen,
  MessageSquare,
  TrendingUp,
  UserPlus,
  FileText,
  Star,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardStats {
  totalUsers: number;
  totalChildren: number;
  totalMentors: number;
  totalStories: number;
  activeStories: number;
  completedStories: number;
  monthlyStats: {
    newUsers: number;
    storiesCreated: number;
    assessmentsCompleted: number;
  };
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  userId?: string;
  storyId?: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Don't do anything while session is loading
    if (status === 'loading') return;

    // If not authenticated or not admin, redirect to login
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }

    // Only fetch data if user is authenticated admin
    fetchDashboardData();
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        fetch('/api/admin/dashboard-stats'),
        fetch('/api/admin/recent-activity'),
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
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Verifying access...</div>
      </div>
    );
  }

  // If not authenticated or not admin, don't render dashboard
  if (!session || session.user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Redirecting to login...</div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      href: '/admin/users',
    },
    {
      title: 'Children Writers',
      value: stats?.totalChildren || 0,
      icon: UserPlus,
      color: 'from-green-500 to-green-600',
      href: '/admin/users?role=child',
    },
    {
      title: 'Active Mentors',
      value: stats?.totalMentors || 0,
      icon: Star,
      color: 'from-purple-500 to-purple-600',
      href: '/admin/mentors',
    },
    {
      title: 'Total Stories',
      value: stats?.totalStories || 0,
      icon: BookOpen,
      color: 'from-orange-500 to-orange-600',
      href: '/admin/stories',
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
    <div className="space-y-6 p-12">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {session?.user.firstName}!
        </h1>
        <p className="text-gray-300">
          Here&apos;s what&apos;s happening with Mintoons today.
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

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">This Month</h3>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">New Users</span>
              <span className="text-white font-medium">
                {stats?.monthlyStats.newUsers || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Stories Created</span>
              <span className="text-white font-medium">
                {stats?.monthlyStats.storiesCreated || 0}
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

        {/* Story Status */}
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Story Status</h3>
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Active Stories</span>
              <span className="text-blue-400 font-medium">
                {stats?.activeStories || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Completed</span>
              <span className="text-green-400 font-medium">
                {stats?.completedStories || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total</span>
              <span className="text-white font-medium">
                {stats?.totalStories || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link href="/admin/mentors/create">
              <button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200">
                Create Mentor
              </button>
            </Link>
            <Link href="/admin/stories?status=pending">
              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200">
                Review Stories
              </button>
            </Link>
            <Link href="/admin/comments?unresolved=true">
              <button className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-2 px-4 rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200">
                Check Comments
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
          <Link
            href="/admin/activity"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            View All
          </Link>
        </div>

        {recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.slice(0, 6).map((activity, index) => (
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
                  <p className="text-gray-400 text-xs mt-1">
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
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
    </div>
  );
}

function getActivityColor(type: string) {
  switch (type) {
    case 'user_registered':
      return 'bg-green-500';
    case 'story_completed':
      return 'bg-blue-500';
    case 'mentor_assigned':
      return 'bg-purple-500';
    case 'comment_added':
      return 'bg-yellow-500';
    case 'assessment_completed':
      return 'bg-orange-500';
    default:
      return 'bg-gray-500';
  }
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'user_registered':
      return '👤';
    case 'story_completed':
      return '📚';
    case 'mentor_assigned':
      return '👨‍🏫';
    case 'comment_added':
      return '💬';
    case 'assessment_completed':
      return '✅';
    default:
      return '📊';
  }
}
