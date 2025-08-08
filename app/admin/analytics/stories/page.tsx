//app/admin/analytics/stories/page.tsx
// app/admin/analytics/stories/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  TrendingUp,
  Target,
  Award,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface StoryAnalytics {
  trends: Array<{
    _id: { year: number; month: number };
    total: number;
    completed: number;
    active: number;
  }>;
  wordAnalysis: {
    avgWords: number;
    minWords: number;
    maxWords: number;
    totalWords: number;
  };
  popularElements: Array<{
    _id: { type: string; value: string };
    count: number;
  }>;
  topStories: Array<{
    _id: string;
    title: string;
    totalWords: number;
    childId: { firstName: string; lastName: string };
    createdAt: string;
    isPublished: boolean;
  }>;
}

export default function StoryAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [analytics, setAnalytics] = useState<StoryAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchStoryAnalytics();
  }, [session, status, router]);

  const fetchStoryAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics/stories');
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.storyAnalytics);
      }
    } catch (error) {
      console.error('Error fetching story analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Loading story analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Failed to load story analytics</div>
      </div>
    );
  }

  const getMonthName = (month: number) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[month - 1];
  };

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/admin/analytics">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Story Analytics
          </h1>
          <p className="text-gray-400">Content creation patterns and popular elements</p>
        </div>
      </div>

      {/* Word Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Average Words</h3>
            <Target size={20} className="text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {Math.round(analytics.wordAnalysis.avgWords || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
         <div className="flex items-center justify-between mb-2">
           <h3 className="text-sm font-medium text-gray-400">Total Words</h3>
           <BookOpen size={20} className="text-green-400" />
         </div>
         <p className="text-2xl font-bold text-white">
           {(analytics.wordAnalysis.totalWords || 0).toLocaleString()}
         </p>
       </div>
       
       <div className="bg-gray-800 rounded-xl p-6">
         <div className="flex items-center justify-between mb-2">
           <h3 className="text-sm font-medium text-gray-400">Longest Story</h3>
           <Award size={20} className="text-purple-400" />
         </div>
         <p className="text-2xl font-bold text-white">
           {(analytics.wordAnalysis.maxWords || 0).toLocaleString()}
         </p>
         <p className="text-xs text-gray-500 mt-1">words</p>
       </div>
       
       <div className="bg-gray-800 rounded-xl p-6">
         <div className="flex items-center justify-between mb-2">
           <h3 className="text-sm font-medium text-gray-400">Shortest Story</h3>
           <Target size={20} className="text-orange-400" />
         </div>
         <p className="text-2xl font-bold text-white">
           {(analytics.wordAnalysis.minWords || 0).toLocaleString()}
         </p>
         <p className="text-xs text-gray-500 mt-1">words</p>
       </div>
     </div>

     {/* Creation Trends */}
     <div className="bg-gray-800 rounded-xl p-6">
       <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
         <TrendingUp size={20} className="mr-2" />
         Story Creation Trends (Last 12 Months)
       </h3>
       
       {analytics.trends.length > 0 ? (
         <div className="space-y-3">
           {analytics.trends.slice(-6).map((trend, index) => (
             <motion.div
               key={index}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: index * 0.1 }}
               className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
             >
               <div className="flex items-center space-x-3">
                 <div className="text-white font-medium">
                   {getMonthName(trend._id.month)} {trend._id.year}
                 </div>
               </div>
               <div className="flex items-center space-x-4 text-sm">
                 <div className="text-green-400">
                   {trend.completed} completed
                 </div>
                 <div className="text-blue-400">
                   {trend.active} active
                 </div>
                 <div className="text-white font-medium">
                   {trend.total} total
                 </div>
               </div>
             </motion.div>
           ))}
         </div>
       ) : (
         <div className="text-center py-8">
           <TrendingUp size={48} className="text-gray-600 mx-auto mb-4" />
           <p className="text-gray-400">No trend data available</p>
         </div>
       )}
     </div>

     {/* Popular Elements */}
     <div className="bg-gray-800 rounded-xl p-6">
       <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
         <Award size={20} className="mr-2" />
         Popular Story Elements
       </h3>
       
       {analytics.popularElements.length > 0 ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {analytics.popularElements.slice(0, 9).map((element, index) => (
             <motion.div
               key={index}
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: index * 0.1 }}
               className="bg-gray-700/50 rounded-lg p-4"
             >
               <div className="flex items-center justify-between">
                 <div>
                   <h4 className="text-white font-medium capitalize">
                     {element._id.value}
                   </h4>
                   <p className="text-gray-400 text-sm capitalize">
                     {element._id.type}
                   </p>
                 </div>
                 <div className="text-right">
                   <div className="text-white font-bold">{element.count}</div>
                   <div className="text-gray-400 text-xs">uses</div>
                 </div>
               </div>
             </motion.div>
           ))}
         </div>
       ) : (
         <div className="text-center py-8">
           <Award size={48} className="text-gray-600 mx-auto mb-4" />
           <p className="text-gray-400">No element data available</p>
         </div>
       )}
     </div>

     {/* Top Stories */}
     <div className="bg-gray-800 rounded-xl p-6">
       <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
         <BookOpen size={20} className="mr-2" />
         Top Stories by Word Count
       </h3>
       
       {analytics.topStories.length > 0 ? (
         <div className="space-y-3">
           {analytics.topStories.map((story, index) => (
             <motion.div
               key={story._id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: index * 0.1 }}
               className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg"
             >
               <div className="flex items-center space-x-4">
                 <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                   #{index + 1}
                 </div>
                 <div>
                   <Link href={`/admin/stories/${story._id}`}>
                     <h4 className="text-white font-medium hover:text-blue-400 cursor-pointer">
                       {story.title}
                     </h4>
                   </Link>
                   <p className="text-gray-400 text-sm">
                     by {story.childId.firstName} {story.childId.lastName}
                   </p>
                 </div>
                 {story.isPublished && (
                   <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                     Published
                   </span>
                 )}
               </div>
               <div className="text-right">
                 <div className="text-white font-bold">
                   {story.totalWords.toLocaleString()} words
                 </div>
                 <div className="text-gray-400 text-sm">
                   {new Date(story.createdAt).toLocaleDateString()}
                 </div>
               </div>
             </motion.div>
           ))}
         </div>
       ) : (
         <div className="text-center py-8">
           <BookOpen size={48} className="text-gray-600 mx-auto mb-4" />
           <p className="text-gray-400">No story data available</p>
         </div>
       )}
     </div>
   </div>
 );
}