// app/children-dashboard/my-stories/[storyId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Edit,
  Star,
  Clock,
  BookOpen,
  MessageSquare,
  TrendingUp,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface StoryData {
  _id: string;
  title: string;
  content: string;
  totalWords: number;
  grammarScore: number;
  creativityScore: number;
  overallScore: number;
  aifeedback: string;
  publishedAt: string;
  elements: {
    genre: string;
    character: string;
    setting: string;
    theme: string;
    mood: string;
    tone: string;
  };
}

export default function StoryViewPage({ params }: { params: { storyId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const { storyId } = params;

  const [story, setStory] = useState<StoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState<'pdf' | 'word' | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'child') {
      router.push('/login/child');
      return;
    }

    fetchStory();
  }, [session, status, storyId]);

  const fetchStory = async () => {
    try {
      const response = await fetch(`/api/stories/published/${storyId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch story');
      }

      setStory(data.story);
    } catch (error) {
      console.error('Error fetching story:', error);
      toast({
        title: "❌ Error",
        description: "Failed to load story. Please try again.",
        variant: "destructive",
      });
      router.push('/children-dashboard/my-stories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (format: 'pdf' | 'word') => {
    if (!story) return;
    
    setIsDownloading(format);
    
    try {
      const response = await fetch(`/api/stories/export/${story._id}/${format}`);
      
      if (!response.ok) {
        throw new Error('Failed to export story');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${story.title}.${format === 'pdf' ? 'pdf' : 'docx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "📄 Download Ready!",
        description: `Your story has been exported as ${format.toUpperCase()}`,
      });

    } catch (error) {
      console.error('Error downloading story:', error);
      toast({
        title: "❌ Download Failed",
        description: "Failed to download story. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(null);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading your story...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'child' || !story) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/children-dashboard/my-stories">
            <motion.button
              whileHover={{ x: -2 }}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to My Stories</span>
            </motion.button>
          </Link>
             <Link href="/children-dashboard/progress">
            <motion.button
              whileHover={{ x: -2 }}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to My Progress</span>
              <span>Back to My Stories</span>
            </motion.button>
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        
           <div className="flex-1">
             <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
               {story.title}
             </h1>
             <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
               <span>Published on {new Date(story.publishedAt).toLocaleDateString()}</span>
               <span>•</span>
               <span>{story.totalWords} words</span>
               <span>•</span>
               <span>Reading Level: Grade 3-4</span>
             </div>

             {/* Story Elements */}
             <div className="flex flex-wrap gap-2">
               {Object.entries(story.elements).map(([type, value]) => (
                 <span
                   key={type}
                   className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-sm text-white"
                 >
                   {value}
                 </span>
               ))}
             </div>
           </div>

           {/* Actions */}
           <div className="flex flex-col sm:flex-row gap-3 lg:flex-col">
             <motion.button
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               onClick={() => handleDownload('pdf')}
               disabled={isDownloading === 'pdf'}
               className="flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl font-medium transition-all disabled:opacity-50"
             >
               {isDownloading === 'pdf' ? (
                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
               ) : (
                 <Download className="w-4 h-4" />
               )}
               <span>Download PDF</span>
             </motion.button>

             <motion.button
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               onClick={() => handleDownload('word')}
               disabled={isDownloading === 'word'}
               className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-xl font-medium transition-all disabled:opacity-50"
             >
               {isDownloading === 'word' ? (
                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
               ) : (
                 <Download className="w-4 h-4" />
               )}
               <span>Download Word</span>
             </motion.button>

             <motion.button
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-xl font-medium transition-all"
             >
               <Share2 className="w-4 h-4" />
               <span>Share Story</span>
             </motion.button>
           </div>
         </div>
       </motion.div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Story Content */}
         <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.2 }}
           className="lg:col-span-2"
         >
           <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6 sm:p-8">
             <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
               <BookOpen className="w-6 h-6 mr-3 text-green-400" />
               {story.title}
             </h2>
             
             <div className="prose prose-lg prose-invert max-w-none">
               <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                 {story.content}
               </div>
             </div>
           </div>
         </motion.div>

         {/* Sidebar */}
         <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.4 }}
           className="space-y-6"
         >
           {/* Assessment Scores */}
           <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6">
             <h3 className="text-white font-semibold mb-4 flex items-center">
               📊 Assessment Scores
             </h3>
             <div className="space-y-4">
               {[
                 { label: 'Grammar', score: story.grammarScore, color: 'green' },
                 { label: 'Creativity', score: story.creativityScore, color: 'blue' },
                 { label: 'Overall', score: story.overallScore, color: 'purple' },
               ].map((item) => (
                 <div key={item.label}>
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-gray-300 text-sm">{item.label}</span>
                     <span className={`font-bold ${
                       item.color === 'green' ? 'text-green-400' :
                       item.color === 'blue' ? 'text-blue-400' : 'text-purple-400'
                     }`}>
                       {item.score}%
                     </span>
                   </div>
                   <div className="w-full bg-gray-700 rounded-full h-2">
                     <motion.div
                       initial={{ width: 0 }}
                       animate={{ width: `${item.score}%` }}
                       transition={{ duration: 1, delay: 0.5 }}
                       className={`h-2 rounded-full ${
                         item.color === 'green' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                         item.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                         'bg-gradient-to-r from-purple-500 to-pink-500'
                       }`}
                     />
                   </div>
                 </div>
               ))}
             </div>
           </div>

           {/* AI Feedback */}
           <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6">
             <h3 className="text-white font-semibold mb-4 flex items-center">
               🤖 AI Feedback
             </h3>
             <p className="text-gray-300 text-sm leading-relaxed">
               {story.aifeedback}
             </p>
           </div>

           {/* Mentor Comments */}
           <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6">
             <h3 className="text-white font-semibold mb-4 flex items-center">
               💬 Mentor Comments (2)
             </h3>
             <div className="space-y-4">
               <div className="border-l-4 border-green-500 pl-4">
                 <div className="flex items-center space-x-2 mb-1">
                   <span className="text-green-400 font-medium text-sm">Ms. Johnson</span>
                   <span className="text-gray-500 text-xs">2 days ago</span>
                 </div>
                 <p className="text-gray-300 text-sm">
                   "Great use of dialogue! Your characters feel real and engaging."
                 </p>
               </div>
               
               <div className="border-l-4 border-blue-500 pl-4">
                 <div className="flex items-center space-x-2 mb-1">
                   <span className="text-blue-400 font-medium text-sm">Mr. Smith</span>
                   <span className="text-gray-500 text-xs">1 day ago</span>
                 </div>
                 <p className="text-gray-300 text-sm">
                   "I love how you described the magical forest. Very vivid!"
                 </p>
               </div>
             </div>
           </div>

           {/* Story Stats */}
           <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6">
             <h3 className="text-white font-semibold mb-4 flex items-center">
               📈 Story Stats
             </h3>
             <div className="grid grid-cols-2 gap-4 text-center">
               <div>
                 <div className="text-green-400 font-bold text-lg">{story.totalWords}</div>
                 <div className="text-gray-400 text-xs">Words</div>
               </div>
               <div>
                 <div className="text-blue-400 font-bold text-lg">6</div>
                 <div className="text-gray-400 text-xs">Turns</div>
               </div>
               <div>
                 <div className="text-purple-400 font-bold text-lg">Grade 3-4</div>
                 <div className="text-gray-400 text-xs">Reading Level</div>
               </div>
               <div>
                 <div className="text-orange-400 font-bold text-lg">42 min</div>
                 <div className="text-gray-400 text-xs">Writing Time</div>
               </div>
             </div>
           </div>
         </motion.div>
       </div>

       {/* AI Suggestions */}
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.6 }}
         className="mt-8 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl p-6"
       >
         <h3 className="text-white font-semibold mb-4 flex items-center">
           🎯 AI Suggestions for Your Next Story
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="text-center">
             <div className="text-green-400 font-medium mb-1">Try New Genre</div>
             <div className="text-gray-300 text-sm">Explore Mystery or Comedy for variety!</div>
           </div>
           <div className="text-center">
             <div className="text-blue-400 font-medium mb-1">Add More Dialogue</div>
             <div className="text-gray-300 text-sm">Make characters talk more in your next story</div>
           </div>
           <div className="text-center">
             <div className="text-purple-400 font-medium mb-1">Sensory Details</div>
             <div className="text-gray-300 text-sm">Use more sounds, smells, and textures</div>
           </div>
         </div>
       </motion.div>
     </div>
   </div>
 );
}