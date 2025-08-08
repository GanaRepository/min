// app/admin/stories/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  User,
  Calendar,
  BookOpen,
  MessageSquare,
  Award,
  Download,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface StoryDetails {
  _id: string;
  title: string;
  status: 'active' | 'completed' | 'paused';
  storyNumber: number;
  totalWords: number;
  childWords: number;
  apiCallsUsed: number;
  maxApiCalls: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  isPublished: boolean;
  submittedToCompetition: boolean;
  competitionScore?: number;
  competitionRank?: number;
  child: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  turns: Array<{
    turnNumber: number;
    type: 'child' | 'ai';
    content: string;
    createdAt: string;
  }>;
  comments: Array<{
    _id: string;
    content: string;
    type: string;
    authorId: {
      firstName: string;
      lastName: string;
      role: string;
    };
    createdAt: string;
    isResolved: boolean;
  }>;
}

export default function ViewStory() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const storyId = params.id as string;

  const [story, setStory] = useState<StoryDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'comments' | 'details'>('content');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchStory();
  }, [session, status, router, storyId]);

  const fetchStory = async () => {
   try {
     const response = await fetch(`/api/admin/stories/${storyId}`);
     const data = await response.json();
     
     if (data.success) {
       setStory(data.story);
     } else {
       router.push('/admin/stories');
     }
   } catch (error) {
     console.error('Error fetching story:', error);
     router.push('/admin/stories');
   } finally {
     setLoading(false);
   }
 };

 const deleteStory = async () => {
   if (!confirm(`Are you sure you want to delete "${story?.title}"? This action cannot be undone.`)) {
     return;
   }

   try {
     setDeleting(true);
     const response = await fetch(`/api/admin/stories/${storyId}`, {
       method: 'DELETE',
     });

     const data = await response.json();

     if (data.success) {
       alert('Story deleted successfully');
       router.push('/admin/stories');
     } else {
       alert('Failed to delete story: ' + data.error);
     }
   } catch (error) {
     console.error('Error deleting story:', error);
     alert('Failed to delete story');
   } finally {
     setDeleting(false);
   }
 };

 const exportStory = async () => {
   try {
     const response = await fetch(`/api/stories/export/${storyId}/txt`);
     const blob = await response.blob();
     
     const url = window.URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `${story?.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'story'}.txt`;
     document.body.appendChild(a);
     a.click();
     window.URL.revokeObjectURL(url);
     document.body.removeChild(a);
   } catch (error) {
     console.error('Error exporting story:', error);
     alert('Failed to export story');
   }
 };

 if (loading) {
   return (
     <div className="flex items-center justify-center h-64">
       <div className="text-xl text-gray-400">Loading story details...</div>
     </div>
   );
 }

 if (!story) {
   return (
     <div className="flex items-center justify-center h-64">
       <div className="text-xl text-gray-400">Story not found</div>
     </div>
   );
 }

 const getStatusColor = (status: string) => {
   switch (status) {
     case 'completed': return 'bg-green-100 text-green-800';
     case 'active': return 'bg-blue-100 text-blue-800';
     case 'paused': return 'bg-yellow-100 text-yellow-800';
     default: return 'bg-gray-100 text-gray-800';
   }
 };

 return (
   <div className="space-y-6 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-4 sm:py-6 md:py-8">
     {/* Header */}
     <div className="flex items-center justify-between">
       <div className="flex items-center space-x-4">
         <Link href="/admin/stories">
           <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
             <ArrowLeft size={20} />
           </button>
         </Link>
         <div>
           <h1 className="text-2xl sm:text-3xl font-bold text-white">
             {story.title}
           </h1>
           <p className="text-gray-400">Story #{story.storyNumber} Details</p>
         </div>
       </div>
       
       <div className="flex items-center space-x-2">
         <button
           onClick={exportStory}
           className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
         >
           <Download size={16} className="mr-2" />
           Export
         </button>
         <Link href={`/admin/stories/${storyId}/edit`}>
           <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
             <Edit size={16} className="mr-2" />
             Edit
           </button>
         </Link>
         <button
           onClick={deleteStory}
           disabled={deleting}
           className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
         >
           <Trash2 size={16} className="mr-2" />
           {deleting ? 'Deleting...' : 'Delete'}
         </button>
       </div>
     </div>

     {/* Story Info Card */}
     <div className="bg-gray-800 rounded-xl p-6">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="flex items-center space-x-3">
           <div className="bg-blue-600 p-3 rounded-lg">
             <User size={24} className="text-white" />
           </div>
           <div>
             <p className="text-sm text-gray-400">Author</p>
             <Link href={`/admin/users/${story.child._id}`}>
               <p className="text-white font-medium hover:text-blue-400 cursor-pointer">
                 {story.child.firstName} {story.child.lastName}
               </p>
             </Link>
           </div>
         </div>
         
         <div className="flex items-center space-x-3">
           <div className="bg-green-600 p-3 rounded-lg">
             <BookOpen size={24} className="text-white" />
           </div>
           <div>
             <p className="text-sm text-gray-400">Word Count</p>
             <p className="text-white font-medium">{story.totalWords} words</p>
           </div>
         </div>
         
         <div className="flex items-center space-x-3">
           <div className="bg-purple-600 p-3 rounded-lg">
             <Calendar size={24} className="text-white" />
           </div>
           <div>
             <p className="text-sm text-gray-400">Created</p>
             <p className="text-white font-medium">
               {new Date(story.createdAt).toLocaleDateString()}
             </p>
           </div>
         </div>
         
         <div className="flex items-center space-x-3">
           <div className="bg-orange-600 p-3 rounded-lg">
             <MessageSquare size={24} className="text-white" />
           </div>
           <div>
             <p className="text-sm text-gray-400">Comments</p>
             <p className="text-white font-medium">{story.comments.length}</p>
           </div>
         </div>
       </div>
     </div>

     {/* Status and Flags */}
     <div className="bg-gray-800 rounded-xl p-6">
       <h3 className="text-lg font-semibold text-white mb-4">Story Status</h3>
       <div className="flex flex-wrap gap-3">
         <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(story.status)}`}>
           {story.status}
         </span>
         {story.isPublished && (
           <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
             Published
           </span>
         )}
         {story.submittedToCompetition && (
           <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
             Competition Entry
           </span>
         )}
         {story.competitionScore && (
           <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
             Score: {story.competitionScore}
           </span>
         )}
         {story.competitionRank && (
           <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
             Rank: #{story.competitionRank}
           </span>
         )}
       </div>
     </div>

     {/* Tab Navigation */}
     <div className="bg-gray-800 rounded-xl">
       <div className="border-b border-gray-700">
         <nav className="flex space-x-8 px-6">
           {['content', 'comments', 'details'].map((tab) => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab as any)}
               className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                 activeTab === tab
                   ? 'border-blue-500 text-blue-400'
                   : 'border-transparent text-gray-400 hover:text-gray-300'
               }`}
             >
               {tab.charAt(0).toUpperCase() + tab.slice(1)}
               {tab === 'comments' && story.comments.length > 0 && (
                 <span className="ml-2 bg-gray-700 text-xs px-2 py-1 rounded-full">
                   {story.comments.length}
                 </span>
               )}
             </button>
           ))}
         </nav>
       </div>

       <div className="p-6">
         {/* Content Tab */}
         {activeTab === 'content' && (
           <div className="space-y-4">
             {story.turns && story.turns.length > 0 ? (
               story.turns.map((turn, index) => (
                 <motion.div
                   key={index}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: index * 0.1 }}
                   className={`p-4 rounded-lg ${
                     turn.type === 'child' 
                       ? 'bg-blue-900/20 border border-blue-500/20' 
                       : 'bg-purple-900/20 border border-purple-500/20'
                   }`}
                 >
                   <div className="flex items-center justify-between mb-3">
                     <div className="flex items-center space-x-2">
                       <span className={`px-2 py-1 text-xs rounded-full ${
                         turn.type === 'child' 
                           ? 'bg-blue-100 text-blue-800' 
                           : 'bg-purple-100 text-purple-800'
                       }`}>
                         {turn.type === 'child' ? 'Student' : 'AI'}
                       </span>
                       <span className="text-gray-400 text-sm">Turn #{turn.turnNumber}</span>
                     </div>
                     <span className="text-gray-400 text-sm">
                       {new Date(turn.createdAt).toLocaleString()}
                     </span>
                   </div>
                   <div className="text-white whitespace-pre-wrap">{turn.content}</div>
                 </motion.div>
               ))
             ) : (
               <div className="text-center py-8">
                 <BookOpen size={48} className="text-gray-600 mx-auto mb-4" />
                 <p className="text-gray-400">No content available</p>
               </div>
             )}
           </div>
         )}

         {/* Comments Tab */}
         {activeTab === 'comments' && (
           <div className="space-y-4">
             {story.comments && story.comments.length > 0 ? (
               story.comments.map((comment) => (
                 <div key={comment._id} className="bg-gray-700/50 rounded-lg p-4">
                   <div className="flex items-start justify-between">
                     <div className="flex-1">
                       <div className="flex items-center space-x-2 mb-2">
                         <span className="text-white font-medium">
                           {comment.authorId.firstName} {comment.authorId.lastName}
                         </span>
                         <span className={`px-2 py-1 text-xs rounded-full ${
                           comment.authorId.role === 'mentor' 
                             ? 'bg-purple-100 text-purple-800'
                             : comment.authorId.role === 'admin'
                             ? 'bg-red-100 text-red-800'
                             : 'bg-blue-100 text-blue-800'
                         }`}>
                           {comment.authorId.role}
                         </span>
                         <span className={`px-2 py-1 text-xs rounded-full ${
                           comment.type === 'praise' 
                             ? 'bg-green-100 text-green-800'
                             : 'bg-yellow-100 text-yellow-800'
                         }`}>
                           {comment.type}
                         </span>
                       </div>
                       <p className="text-gray-300">{comment.content}</p>
                       <div className="flex items-center justify-between mt-2">
                         <span className="text-gray-400 text-sm">
                           {new Date(comment.createdAt).toLocaleDateString()}
                         </span>
                         <span className={`px-2 py-1 text-xs rounded-full ${
                           comment.isResolved 
                             ? 'bg-green-100 text-green-800'
                             : 'bg-red-100 text-red-800'
                         }`}>
                           {comment.isResolved ? 'Resolved' : 'Unresolved'}
                         </span>
                       </div>
                     </div>
                   </div>
                 </div>
               ))
             ) : (
               <div className="text-center py-8">
                 <MessageSquare size={48} className="text-gray-600 mx-auto mb-4" />
                 <p className="text-gray-400">No comments yet</p>
               </div>
             )}
           </div>
         )}

         {/* Details Tab */}
         {activeTab === 'details' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-4">
               <h4 className="text-lg font-semibold text-white">Story Statistics</h4>
               <div className="space-y-3">
                 <div className="flex justify-between">
                   <span className="text-gray-400">Total Words:</span>
                   <span className="text-white font-medium">{story.totalWords}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-400">Child Words:</span>
                   <span className="text-white font-medium">{story.childWords}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-400">AI Calls Used:</span>
                   <span className="text-white font-medium">{story.apiCallsUsed}/{story.maxApiCalls}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-400">Turn Count:</span>
                   <span className="text-white font-medium">{story.turns?.length || 0}</span>
                 </div>
               </div>
             </div>

             <div className="space-y-4">
               <h4 className="text-lg font-semibold text-white">Timeline</h4>
               <div className="space-y-3">
                 <div className="flex justify-between">
                   <span className="text-gray-400">Created:</span>
                   <span className="text-white font-medium">
                     {new Date(story.createdAt).toLocaleDateString()}
                   </span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-400">Last Updated:</span>
                   <span className="text-white font-medium">
                     {new Date(story.updatedAt).toLocaleDateString()}
                   </span>
                 </div>
                 {story.completedAt && (
                   <div className="flex justify-between">
                     <span className="text-gray-400">Completed:</span>
                     <span className="text-white font-medium">
                       {new Date(story.completedAt).toLocaleDateString()}
                     </span>
                   </div>
                 )}
               </div>
             </div>
           </div>
         )}
       </div>
     </div>
   </div>
 );
}