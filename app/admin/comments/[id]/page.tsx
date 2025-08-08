// app/admin/comments/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MessageSquare,
  User,
  Calendar,
  BookOpen,
  Check,
  X,
  Flag,
  Eye,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface CommentDetails {
  _id: string;
  content: string;
  commentType: string;
  isResolved: boolean;
  createdAt: string;
  authorId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  storyId: {
    _id: string;
    title: string;
    storyNumber: number;
    child: {
      firstName: string;
      lastName: string;
    };
  };
  replies?: Array<{
    _id: string;
    content: string;
    authorId: {
      firstName: string;
      lastName: string;
      role: string;
    };
    createdAt: string;
  }>;
}

export default function ViewComment() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const commentId = params.id as string;

 const [comment, setComment] = useState<CommentDetails | null>(null);
 const [loading, setLoading] = useState(true);
 const [updating, setUpdating] = useState(false);

 useEffect(() => {
   if (status === 'loading') return;
   if (!session || session.user?.role !== 'admin') {
     router.push('/admin/login');
     return;
   }
   fetchComment();
 }, [session, status, router, commentId]);

 const fetchComment = async () => {
   try {
     const response = await fetch(`/api/admin/comments/${commentId}`);
     const data = await response.json();
     
     if (data.success) {
       setComment(data.comment);
     } else {
       router.push('/admin/comments');
     }
   } catch (error) {
     console.error('Error fetching comment:', error);
     router.push('/admin/comments');
   } finally {
     setLoading(false);
   }
 };

 const updateCommentStatus = async (isResolved: boolean) => {
   try {
     setUpdating(true);
     const response = await fetch(`/api/admin/comments/${commentId}`, {
       method: 'PATCH',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({ isResolved }),
     });

     const data = await response.json();

     if (data.success) {
       setComment(prev => prev ? { ...prev, isResolved } : null);
       alert(`Comment marked as ${isResolved ? 'resolved' : 'unresolved'}`);
     } else {
       alert('Failed to update comment status');
     }
   } catch (error) {
     console.error('Error updating comment:', error);
     alert('Failed to update comment status');
   } finally {
     setUpdating(false);
   }
 };

 const deleteComment = async () => {
   if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
     return;
   }

   try {
     const response = await fetch(`/api/admin/comments/${commentId}`, {
       method: 'DELETE',
     });

     const data = await response.json();

     if (data.success) {
       alert('Comment deleted successfully');
       router.push('/admin/comments');
     } else {
       alert('Failed to delete comment: ' + data.error);
     }
   } catch (error) {
     console.error('Error deleting comment:', error);
     alert('Failed to delete comment');
   }
 };

 if (loading) {
   return (
     <div className="flex items-center justify-center h-64">
       <div className="text-xl text-gray-400">Loading comment details...</div>
     </div>
   );
 }

 if (!comment) {
   return (
     <div className="flex items-center justify-center h-64">
       <div className="text-xl text-gray-400">Comment not found</div>
     </div>
   );
 }

 const getCommentTypeColor = (type: string) => {
   switch (type) {
     case 'praise': return 'bg-green-100 text-green-800';
     case 'suggestion': return 'bg-blue-100 text-blue-800';
     case 'correction': return 'bg-orange-100 text-orange-800';
     case 'question': return 'bg-purple-100 text-purple-800';
     default: return 'bg-gray-100 text-gray-800';
   }
 };

 const getRoleColor = (role: string) => {
   switch (role) {
     case 'admin': return 'bg-red-100 text-red-800';
     case 'mentor': return 'bg-purple-100 text-purple-800';
     case 'child': return 'bg-green-100 text-green-800';
     default: return 'bg-gray-100 text-gray-800';
   }
 };

 return (
   <div className="space-y-6 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-4 sm:py-6 md:py-8">
     {/* Header */}
     <div className="flex items-center justify-between">
       <div className="flex items-center space-x-4">
         <Link href="/admin/comments">
           <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
             <ArrowLeft size={20} />
           </button>
         </Link>
         <div>
           <h1 className="text-2xl sm:text-3xl font-bold text-white">
             Comment Details
           </h1>
           <p className="text-gray-400">Review and moderate comment</p>
         </div>
       </div>
       
       <div className="flex items-center space-x-2">
         {!comment.isResolved ? (
           <button
             onClick={() => updateCommentStatus(true)}
             disabled={updating}
             className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
           >
             <Check size={16} className="mr-2" />
             {updating ? 'Resolving...' : 'Mark Resolved'}
           </button>
         ) : (
           <button
             onClick={() => updateCommentStatus(false)}
             disabled={updating}
             className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center disabled:opacity-50"
           >
             <X size={16} className="mr-2" />
             {updating ? 'Unresolving...' : 'Mark Unresolved'}
           </button>
         )}
         <button
           onClick={deleteComment}
           className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
         >
           <Flag size={16} className="mr-2" />
           Delete
         </button>
       </div>
     </div>

     {/* Comment Info Card */}
     <div className="bg-gray-800 rounded-xl p-6">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="flex items-center space-x-3">
           <div className="bg-blue-600 p-3 rounded-lg">
             <User size={24} className="text-white" />
           </div>
           <div>
             <p className="text-sm text-gray-400">Author</p>
             <Link href={`/admin/users/${comment.authorId._id}`}>
               <p className="text-white font-medium hover:text-blue-400 cursor-pointer">
                 {comment.authorId.firstName} {comment.authorId.lastName}
               </p>
             </Link>
           </div>
         </div>
         
         <div className="flex items-center space-x-3">
           <div className="bg-purple-600 p-3 rounded-lg">
             <BookOpen size={24} className="text-white" />
           </div>
           <div>
             <p className="text-sm text-gray-400">Story</p>
             <Link href={`/admin/stories/${comment.storyId._id}`}>
               <p className="text-white font-medium hover:text-blue-400 cursor-pointer">
                 {comment.storyId.title}
               </p>
             </Link>
           </div>
         </div>
         
         <div className="flex items-center space-x-3">
           <div className="bg-green-600 p-3 rounded-lg">
             <Calendar size={24} className="text-white" />
           </div>
           <div>
             <p className="text-sm text-gray-400">Created</p>
             <p className="text-white font-medium">
               {new Date(comment.createdAt).toLocaleDateString()}
             </p>
           </div>
         </div>
         
         <div className="flex items-center space-x-3">
           <div className="bg-orange-600 p-3 rounded-lg">
             <MessageSquare size={24} className="text-white" />
           </div>
           <div>
             <p className="text-sm text-gray-400">Status</p>
             <p className={`font-medium ${comment.isResolved ? 'text-green-400' : 'text-red-400'}`}>
               {comment.isResolved ? 'Resolved' : 'Unresolved'}
             </p>
           </div>
         </div>
       </div>
     </div>

     {/* Comment Content */}
     <div className="bg-gray-800 rounded-xl p-6">
       <div className="flex items-start justify-between mb-4">
         <div className="flex items-center space-x-3">
           <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
             <span className="text-sm font-medium text-white">
               {comment.authorId.firstName[0]}{comment.authorId.lastName[0]}
             </span>
           </div>
           <div>
             <div className="flex items-center space-x-2">
               <h3 className="text-white font-medium">
                 {comment.authorId.firstName} {comment.authorId.lastName}
               </h3>
               <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(comment.authorId.role)}`}>
                 {comment.authorId.role}
               </span>
               <span className={`px-2 py-1 text-xs rounded-full ${getCommentTypeColor(comment.commentType)}`}>
                 {comment.commentType}
               </span>
             </div>
             <p className="text-gray-400 text-sm">{comment.authorId.email}</p>
           </div>
         </div>
         <div className="text-right">
           <p className="text-gray-400 text-sm">
             {new Date(comment.createdAt).toLocaleString()}
           </p>
           <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
             comment.isResolved 
               ? 'bg-green-100 text-green-800' 
               : 'bg-red-100 text-red-800'
           }`}>
             {comment.isResolved ? 'Resolved' : 'Unresolved'}
           </span>
         </div>
       </div>
       
       <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
         <p className="text-white whitespace-pre-wrap">{comment.content}</p>
       </div>

       {/* Story Context */}
       <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-700">
         <h4 className="text-white font-medium mb-2">Story Context</h4>
         <div className="flex items-center justify-between">
           <div>
             <p className="text-white">"{comment.storyId.title}" by {comment.storyId.child.firstName} {comment.storyId.child.lastName}</p>
             <p className="text-gray-400 text-sm">Story #{comment.storyId.storyNumber}</p>
           </div>
           <Link href={`/admin/stories/${comment.storyId._id}`}>
             <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm">
               <Eye size={14} className="mr-1" />
               View Story
             </button>
           </Link>
         </div>
       </div>
     </div>

     {/* Replies Section */}
     {comment.replies && comment.replies.length > 0 && (
       <div className="bg-gray-800 rounded-xl p-6">
         <h3 className="text-lg font-semibold text-white mb-4">Replies ({comment.replies.length})</h3>
         <div className="space-y-4">
           {comment.replies.map((reply) => (
             <motion.div
               key={reply._id}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="bg-gray-700/50 rounded-lg p-4 ml-6"
             >
               <div className="flex items-start justify-between mb-3">
                 <div className="flex items-center space-x-3">
                   <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                     <span className="text-xs font-medium text-white">
                       {reply.authorId.firstName[0]}{reply.authorId.lastName[0]}
                     </span>
                   </div>
                   <div>
                     <div className="flex items-center space-x-2">
                       <h4 className="text-white font-medium text-sm">
                         {reply.authorId.firstName} {reply.authorId.lastName}
                       </h4>
                       <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(reply.authorId.role)}`}>
                         {reply.authorId.role}
                       </span>
                     </div>
                   </div>
                 </div>
                 <span className="text-gray-400 text-sm">
                   {new Date(reply.createdAt).toLocaleString()}
                 </span>
               </div>
               <p className="text-gray-300 text-sm pl-11">{reply.content}</p>
             </motion.div>
           ))}
         </div>
       </div>
     )}

     {/* Actions Summary */}
     <div className="bg-gray-800 rounded-xl p-6">
       <h3 className="text-lg font-semibold text-white mb-4">Admin Actions</h3>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="text-center">
           <div className="bg-green-600 p-3 rounded-lg mb-2 w-12 h-12 mx-auto flex items-center justify-center">
             <Check size={24} className="text-white" />
           </div>
           <p className="text-sm text-gray-400">Mark as resolved when addressed</p>
         </div>
         <div className="text-center">
           <div className="bg-blue-600 p-3 rounded-lg mb-2 w-12 h-12 mx-auto flex items-center justify-center">
             <Eye size={24} className="text-white" />
           </div>
           <p className="text-sm text-gray-400">View related story for context</p>
         </div>
         <div className="text-center">
           <div className="bg-red-600 p-3 rounded-lg mb-2 w-12 h-12 mx-auto flex items-center justify-center">
             <Flag size={24} className="text-white" />
           </div>
           <p className="text-sm text-gray-400">Delete if inappropriate content</p>
         </div>
       </div>
     </div>
   </div>
 );
}