// app/my-stories/page.tsx - COMPLETE VERSION WITH CLEAR LABELS
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Sparkles,
  Upload,
  Trophy,
  Star,
  ArrowLeft,
  Search,
  Grid3X3,
  List,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Plus,
  Eye,
} from 'lucide-react';

interface Story {
  _id: string;
  title: string;
  status: 'active' | 'completed';
  createdAt: string;
  totalWords: number;
  childWords: number;
  isPublished: boolean;
  submittedToCompetition: boolean;
  storyNumber: number;
  isUploadedForAssessment: boolean;
  assessment?: {
    overallScore: number;
    grammarScore: number;
    creativityScore: number;
    integrityAnalysis?: {
      integrityRisk?: 'low' | 'medium' | 'high' | 'critical';
    };
  };
}

type FilterType = 'all' | 'active' | 'completed' | 'uploaded' | 'published';
type ViewType = 'grid' | 'list';

export default function MyStories() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'child') {
      router.push('/login/child');
      return;
    }
    fetchStories();
  }, [session, status, router]);

  useEffect(() => {
    filterStories();
  }, [stories, searchTerm, activeFilter]);

  const fetchStories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/user/stories');
      if (response.ok) {
        const data = await response.json();
        setStories(data.stories || []);
      } else {
        console.error('Failed to fetch stories:', response.status);
        setError('Failed to load stories');
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
      setError('Failed to load stories');
    } finally {
      setLoading(false);
    }
  };

  const filterStories = () => {
    let filtered = stories;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(story =>
        story.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    switch (activeFilter) {
      case 'active':
        filtered = filtered.filter(story => story.status === 'active');
        break;
      case 'completed':
        filtered = filtered.filter(story => story.status === 'completed');
        break;
      case 'uploaded':
        filtered = filtered.filter(story => story.isUploadedForAssessment);
        break;
      case 'published':
        filtered = filtered.filter(story => story.isPublished);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    setFilteredStories(filtered);
  };

  const getIntegrityIcon = (integrityRisk?: string) => {
    switch (integrityRisk) {
      case 'low':
        return <CheckCircle className="text-green-400" size={16} />;
      case 'medium':
        return <AlertTriangle className="text-yellow-400" size={16} />;
      case 'high':
      case 'critical':
        return <XCircle className="text-red-400" size={16} />;
      default:
        return <CheckCircle className="text-gray-400" size={16} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filters: { type: FilterType; label: string; icon: any }[] = [
    { type: 'all', label: 'All', icon: BookOpen },
    { type: 'active', label: 'Active', icon: Star },
    { type: 'completed', label: 'Completed', icon: CheckCircle },
    { type: 'uploaded', label: 'Uploaded', icon: Upload },
    { type: 'published', label: 'Published', icon: Trophy },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-border-green-400 mx-auto mb-4"></div>
         <p className="text-gray-300">Loading your stories...</p>
       </div>
     </div>
   );
 }

 return (
   <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900">
 
     {/* Main Content */}
     <div className="relative z-10 p-6 max-w-7xl mx-auto">
       {/* Header */}
       <div className="flex items-center justify-between mb-8">
         <div className="flex items-center space-x-4">
           <Link href="/children-dashboard">
             <motion.button
               whileHover={{ x: -2 }}
               className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
             >
               <ArrowLeft size={20} />
             
             </motion.button>
           </Link>
           <div>
             <h1 className="text-3xl lg:text-4xl font-bold text-white flex items-center">
               <BookOpen className="mr-3" size={32} />
               My Stories
             </h1>
             <p className="text-gray-300 mt-1">
               {stories.length} stories in your collection
             </p>
           </div>
         </div>

         <div className="flex items-center space-x-4">
           <Link href="/create-stories/#freestyle">
             <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
               <Plus size={20} />
               <span>Create New Story</span>
             </button>
           </Link>
           <Link href="/create-stories/#assessment">
             <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
               <Upload size={20} />
               <span>Upload Assessment</span>
             </button>
           </Link>
         </div>
       </div>

       {/* Search and Filters */}
       <div className="bg-gray-800/50 border border-gray-600/40 rounded-xl p-6 mb-6">
         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
           {/* Search */}
           <div className="relative flex-1 max-w-md">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
             <input
               type="text"
               placeholder="Search stories by title..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
             />
           </div>

           {/* Filters */}
           <div className="flex items-center space-x-2">
             {filters.map((filter) => {
               const Icon = filter.icon;
               return (
                 <button
                   key={filter.type}
                   onClick={() => setActiveFilter(filter.type)}
                   className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                     activeFilter === filter.type
                       ? 'bg-green-600 text-white'
                       : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                   }`}
                 >
                   <Icon size={16} />
                   <span className="hidden sm:inline">{filter.label}</span>
                 </button>
               );
             })}
           </div>

           {/* View Toggle */}
           <div className="flex items-center bg-gray-700 rounded-lg p-1">
             <button
               onClick={() => setViewType('grid')}
               className={`p-2 rounded ${
                 viewType === 'grid' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
               }`}
             >
               <Grid3X3 size={16} />
             </button>
             <button
               onClick={() => setViewType('list')}
               className={`p-2 rounded ${
                 viewType === 'list' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
               }`}
             >
               <List size={16} />
             </button>
           </div>
         </div>
       </div>

       {/* Stories Display */}
       {error ? (
         <div className="text-center py-12">
           <XCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
           <h3 className="text-lg font-medium text-white mb-2">Error Loading Stories</h3>
           <p className="text-gray-400 mb-6">{error}</p>
           <button
             onClick={fetchStories}
             className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
           >
             Try Again
           </button>
         </div>
       ) : filteredStories.length === 0 ? (
         <div className="text-center py-12">
           <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
           <h3 className="text-lg font-medium text-white mb-2">
             {searchTerm || activeFilter !== 'all' ? 'No Matching Stories' : 'No Stories Yet'}
           </h3>
           <p className="text-gray-400 mb-6">
             {searchTerm || activeFilter !== 'all'
               ? 'Try adjusting your search or filter criteria.'
               : 'Start your writing journey by creating your first story!'}
           </p>
           {searchTerm || activeFilter !== 'all' ? (
             <button
               onClick={() => {
                 setSearchTerm('');
                 setActiveFilter('all');
               }}
               className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors mr-4"
             >
               Clear Filters
             </button>
           ) : null}
           <Link href="/create-stories">
             <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
               <Plus className="w-4 h-4 inline mr-2" />
               Create Story
             </button>
           </Link>
         </div>
       ) : (
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className={
             viewType === 'grid'
               ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
               : 'space-y-4'
           }
         >
           {filteredStories.map((story, index) => (
             <motion.div
               key={story._id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: index * 0.1 }}
               whileHover={{ scale: viewType === 'grid' ? 1.02 : 1.01 }}
               className={`bg-gray-800/50 border border-gray-600/40 rounded-xl p-6 hover:border-gray-500/60 transition-all duration-200 ${
                 story.isUploadedForAssessment 
                   ? 'border-l-4 border-l-blue-500' 
                   : 'border-l-4 border-l-green-500'
               } ${viewType === 'list' ? 'flex items-center space-x-6' : ''}`}
             >
               <div className={viewType === 'list' ? 'flex-1' : ''}>
                 {/* ✅ CLEAR STORY TYPE HEADER */}
                 <div className="mb-4">
                   {story.isUploadedForAssessment ? (
                     <div className="flex items-center bg-blue-500/20 px-4 py-2 rounded-lg border border-blue-500/30">
                       <Upload className="text-blue-400 mr-3" size={20} />
                       <div>
                         <span className="text-blue-400 text-base font-bold block">UPLOADED STORY</span>
                         <span className="text-blue-300 text-xs">Submitted for AI Assessment</span>
                       </div>
                     </div>
                   ) : (
                     <div className="flex items-center bg-green-500/20 px-4 py-2 rounded-lg border border-green-500/30">
                       <Sparkles className="text-green-400 mr-3" size={20} />
                       <div>
                         <span className="text-green-400 text-base font-bold block">FREESTYLE STORY</span>
                         <span className="text-green-300 text-xs">Created with AI Assistance</span>
                       </div>
                     </div>
                   )}
                 </div>

                 {/* Story Header */}
                 <div className="flex items-start justify-between mb-4">
                   <div className="flex-1">
                     <h3 className="text-xl font-semibold text-white mb-2">
                       {story.title || `Story #${story.storyNumber}`}
                     </h3>
                   </div>

                   <div className="flex items-center space-x-2 ml-4">
                     {story.isPublished && (
                       <Star className="text-yellow-400" size={16} />
                     )}
                     {story.submittedToCompetition && (
                       <Trophy className="text-purple-400" size={16} />
                     )}
                     {story.assessment?.integrityAnalysis && 
                       getIntegrityIcon(story.assessment.integrityAnalysis.integrityRisk)
                     }
                   </div>
                 </div>

                 {/* Story Stats */}
                 <div className="grid grid-cols-2 gap-4 mb-4">
                   <div>
                     <p className="text-gray-400 text-sm">Words</p>
                     <p className="text-white font-medium">
                       {story.totalWords || story.childWords || 0}
                     </p>
                   </div>
                   <div>
                     <p className="text-gray-400 text-sm">Created</p>
                     <p className="text-white font-medium">
                       {formatDate(story.createdAt)}
                     </p>
                   </div>
                 </div>

                 {/* Assessment Score */}
                 {story.assessment && (
                   <div className="mb-4">
                     <div className="flex items-center justify-between text-sm mb-2">
                       <span className="text-gray-400">Assessment Score</span>
                       <span className="text-green-400 font-medium">
                         {story.assessment.overallScore}%
                       </span>
                     </div>
                     <div className="w-full bg-gray-600 rounded-full h-2">
                       <div
                         className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                         style={{ width: `${story.assessment.overallScore}%` }}
                       ></div>
                     </div>
                   </div>
                 )}

                 {/* Status and Actions */}
                 <div className="flex items-center justify-between">
                   <span
                     className={`px-3 py-1 rounded-full text-sm font-medium ${
                       story.status === 'completed'
                         ? 'bg-green-500/20 text-green-400'
                         : 'bg-blue-500/20 text-blue-400'
                     }`}
                   >
                     {story.status === 'completed' ? 'Completed' : 'In Progress'}
                   </span>

                   <div className="flex items-center space-x-2">
                     <Link href={`/children-dashboard/my-stories/${story._id}`}>
                       <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm transition-colors flex items-center space-x-1">
                         <Eye size={14} />
                         <span>View</span>
                       </button>
                     </Link>
                   </div>
                 </div>
               </div>
             </motion.div>
           ))}
         </motion.div>
       )}
     </div>
   </div>
 );
}