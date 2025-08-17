// // app/children-dashboard/my-stories/page.tsx - COMPLETE UPDATE FOR MINTOONS REQUIREMENTS
// 'use client';

// import { useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { motion } from 'framer-motion';
// import {
//   BookOpen,
//   Sparkles,
//   Upload,
//   Trophy,
//   Star,
//   ArrowLeft,
//   Search,
//   Grid3X3,
//   List,
//   CheckCircle,
//   AlertTriangle,
//   XCircle,
//   Plus,
//   Eye,
//   DollarSign,
//   Award,
//   FileText,
//   Zap,
//   Filter,
//   Calendar,
//   BarChart3,
//   Clock,
//   Brain,
//   Target,
//   Shield,
//   Heart,
//   Crown,
//   Download,
//   Share2,
//   Edit,
//   Trash2,
//   RefreshCw,
// } from 'lucide-react';

// // ===== INTERFACES =====
// interface Story {
//   _id: string;
//   title: string;
//   status: 'active' | 'completed' | 'flagged' | 'review';
//   storyType: 'freestyle' | 'uploaded' | 'competition';
//   createdAt: string;
//   updatedAt: string;
//   completedAt?: string;
//   totalWords: number;
//   childWords: number;
//   currentTurn: number;
//   maxTurns: number;
//   apiCallsUsed: number;
  
//   // Publication & Competition
//   isPublished: boolean;
//   competitionEligible: boolean;
//   competitionEntries?: Array<{
//     competitionId: string;
//     submittedAt: string;
//     rank?: number;
//     score?: number;
//   }>;
  
//   // Assessment
//   isUploadedForAssessment: boolean;
//   assessmentAttempts: number;
//   assessment?: {
//     overallScore: number;
//     grammarScore: number;
//     creativityScore: number;
//     vocabularyScore: number;
//     structureScore: number;
//     characterDevelopmentScore: number;
//     plotDevelopmentScore: number;
//     readingLevel: string;
//     feedback: string;
//     strengths: string[];
//     improvements: string[];
//     integrityAnalysis?: {
//       plagiarismResult?: {
//         overallScore: number;
//         riskLevel: string;
//       };
//       aiDetectionResult?: {
//         likelihood: string;
//         confidence: number;
//       };
//       integrityRisk?: 'low' | 'medium' | 'high' | 'critical';
//     };
//     integrityStatus: {
//       status: 'PASS' | 'WARNING' | 'FAIL';
//       message: string;
//     };
//   };
  
//   // Story Elements
//   elements?: {
//     genre?: string;
//     character?: string;
//     setting?: string;
//     theme?: string;
//     mood?: string;
//     tone?: string;
//   };
// }

// interface StoryFilters {
//   status: 'all' | 'active' | 'completed' | 'flagged' | 'review';
//   type: 'all' | 'freestyle' | 'uploaded' | 'competition';
//   published: 'all' | 'published' | 'unpublished';
//   search: string;
// }

// interface StorySummary {
//   total: number;
//   completed: number;
//   active: number;
//   flagged: number;
//   review: number;
//   published: number;
//   freestyle: number;
//   uploaded: number;
//   competition: number;
//   totalWords: number;
//   totalChildWords: number;
//   averageScore: number | null;
// }

// export default function MyStoriesPage() {
//   const { data: session, status } = useSession();
//   const router = useRouter();

//   // ===== STATE =====
//   const [loading, setLoading] = useState(true);
//   const [stories, setStories] = useState<Story[]>([]);
//   const [filteredStories, setFilteredStories] = useState<Story[]>([]);
//   const [summary, setSummary] = useState<StorySummary | null>(null);
//   const [filters, setFilters] = useState<StoryFilters>({
//     status: 'all',
//     type: 'all',
//     published: 'all',
//     search: ''
//   });
//   const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
//   const [selectedStories, setSelectedStories] = useState<Set<string>>(new Set());
//   const [showFilters, setShowFilters] = useState(false);
//   const [error, setError] = useState<string | null>(null);
  
//   // Action states
//   const [publishingStory, setPublishingStory] = useState<string | null>(null);
//   const [deletingStory, setDeletingStory] = useState<string | null>(null);
//   const [reassessingStory, setReassessingStory] = useState<string | null>(null);

//   // ===== EFFECTS =====
//   useEffect(() => {
//     if (status === 'loading') return;
//     if (!session || session.user?.role !== 'child') {
//       router.push('/login/child');
//       return;
//     }
//     fetchStories();
//   }, [session, status, router]);

//   useEffect(() => {
//     applyFilters();
//   }, [stories, filters]);

//   // ===== DATA FETCHING =====
//   const fetchStories = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       console.log('📚 Fetching all user stories...');

//       const response = await fetch('/api/user/stories?limit=100');
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch stories');
//       }

//       const data = await response.json();
      
//       if (data.success) {
//         setStories(data.stories || []);
//         setSummary(data.summary);
//         console.log(`✅ Loaded ${data.stories?.length || 0} stories`);
//       } else {
//         throw new Error(data.error || 'Failed to load stories');
//       }

//     } catch (error) {
//       console.error('❌ Error fetching stories:', error);
//       setError(error instanceof Error ? error.message : 'Failed to load stories');
//       setStories([]);
//       setSummary(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ===== FILTERING =====
//   const applyFilters = () => {
//     let filtered = [...stories];

//     // Search filter
//     if (filters.search.trim()) {
//       const searchTerm = filters.search.toLowerCase();
//       filtered = filtered.filter(story =>
//         story.title.toLowerCase().includes(searchTerm) ||
//         story.assessment?.feedback?.toLowerCase().includes(searchTerm)
//       );
//     }

//     // Status filter
//     if (filters.status !== 'all') {
//       filtered = filtered.filter(story => story.status === filters.status);
//     }

//     // Type filter
//     if (filters.type !== 'all') {
//       filtered = filtered.filter(story => story.storyType === filters.type);
//     }

//     // Published filter
//     if (filters.published !== 'all') {
//       filtered = filtered.filter(story => 
//         filters.published === 'published' ? story.isPublished : !story.isPublished
//       );
//     }

//     // Sort by most recent
//     filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

//     setFilteredStories(filtered);
//   };

//   // ===== HELPER FUNCTIONS =====
//   const getStoryTypeInfo = (story: Story) => {
//     switch (story.storyType) {
//       case 'competition':
//         return {
//           label: 'COMPETITION ENTRY',
//           icon: Trophy,
//           color: 'text-purple-400',
//           bgColor: 'bg-purple-500/20',
//           borderColor: 'border-purple-500/30'
//         };
//       case 'uploaded':
//         return {
//           label: 'UPLOADED FOR ASSESSMENT',
//           icon: Upload,
//           color: 'text-blue-400',
//           bgColor: 'bg-blue-500/20',
//           borderColor: 'border-blue-500/30'
//         };
//       default:
//         return {
//           label: 'FREESTYLE STORY',
//           icon: Sparkles,
//           color: 'text-green-400',
//           bgColor: 'bg-green-500/20',
//           borderColor: 'border-green-500/30'
//         };
//     }
//   };

//   const getStatusInfo = (status: string) => {
//     switch (status) {
//       case 'completed':
//         return { icon: CheckCircle, color: 'text-green-400', label: 'Completed' };
//       case 'active':
//         return { icon: Clock, color: 'text-blue-400', label: 'In Progress' };
//       case 'flagged':
//         return { icon: XCircle, color: 'text-red-400', label: 'Flagged' };
//       case 'review':
//         return { icon: AlertTriangle, color: 'text-yellow-400', label: 'Under Review' };
//       default:
//         return { icon: FileText, color: 'text-gray-400', label: 'Unknown' };
//     }
//   };

//   const getIntegrityIcon = (integrityRisk?: string) => {
//     switch (integrityRisk) {
//       case 'low':
//         return <CheckCircle className="w-4 h-4 text-green-400" />;
//       case 'medium':
//         return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
//       case 'high':
//         return <AlertTriangle className="w-4 h-4 text-orange-400" />;
//       case 'critical':
//         return <XCircle className="w-4 h-4 text-red-400" />;
//       default:
//         return <Shield className="w-4 h-4 text-gray-400" />;
//     }
//   };

//   const getScoreColor = (score: number) => {
//     if (score >= 90) return 'text-green-400';
//     if (score >= 80) return 'text-blue-400';
//     if (score >= 70) return 'text-yellow-400';
//     return 'text-orange-400';
//   };

//   // ===== STORY ACTIONS =====
//   const handlePublishStory = async (storyId: string) => {
//     if (!session?.user?.id) return;
    
//     setPublishingStory(storyId);
    
//     try {
//       const response = await fetch('/api/stories/publish', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ sessionId: storyId })
//       });

//       const data = await response.json();
      
//       if (data.success) {
//         alert('🎉 Story published to community showcase!');
//         fetchStories(); // Refresh data
//       } else {
//         throw new Error(data.error || 'Failed to publish story');
//       }
//     } catch (error) {
//       console.error('❌ Publication error:', error);
//       alert('Failed to publish story. Please try again.');
//     } finally {
//       setPublishingStory(null);
//     }
//   };

//   const handlePurchaseStory = async (storyId: string) => {
//     if (!session?.user?.id) return;
    
//     try {
//       const response = await fetch('/api/stripe/checkout', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           productType: 'story_purchase',
//           storyId: storyId,
//           userId: session.user.id
//         })
//       });

//       const data = await response.json();
      
//       if (data.success && data.checkoutUrl) {
//         window.location.href = data.checkoutUrl;
//       } else {
//         throw new Error(data.error || 'Failed to create checkout session');
//       }
//     } catch (error) {
//       console.error('❌ Purchase error:', error);
//       alert('Failed to start purchase process. Please try again.');
//     }
//   };

//   const handleDeleteStory = async (storyId: string, title: string) => {
//     if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
//       return;
//     }

//     setDeletingStory(storyId);
    
//     try {
//       const response = await fetch('/api/user/stories', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           action: 'delete_story',
//           storyId: storyId
//         })
//       });

//       const data = await response.json();
      
//       if (data.success) {
//         alert('Story deleted successfully');
//         fetchStories(); // Refresh data
//       } else {
//         throw new Error(data.error || 'Failed to delete story');
//       }
//     } catch (error) {
//       console.error('❌ Delete error:', error);
//       alert('Failed to delete story. Please try again.');
//     } finally {
//       setDeletingStory(null);
//     }
//   };

//   const handleReassessStory = async (storyId: string) => {
//     setReassessingStory(storyId);
    
//     try {
//       const response = await fetch('/api/user/stories', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           action: 'request_reassessment',
//           storyId: storyId
//         })
//       });

//       const data = await response.json();
      
//       if (data.success) {
//         alert('Reassessment requested! Your story will be re-evaluated.');
//         fetchStories(); // Refresh data
//       } else {
//         throw new Error(data.error || 'Failed to request reassessment');
//       }
//     } catch (error) {
//       console.error('❌ Reassessment error:', error);
//       alert('Failed to request reassessment. Please try again.');
//     } finally {
//       setReassessingStory(null);
//     }
//   };

//   // ===== LOADING STATE =====
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
//         <div className="text-white text-xl flex items-center gap-3">
//           <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
//           Loading your story collection...
//         </div>
//       </div>
//     );
//   }

//   // ===== ERROR STATE =====
//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
//         <div className="text-center max-w-md mx-auto px-6">
//           <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
//           <h2 className="text-xl font-semibold text-white mb-2">Failed to load stories</h2>
//           <p className="text-gray-300 mb-6">{error}</p>
//           <button
//             onClick={fetchStories}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // ===== MAIN RENDER =====
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 py-20">
//       <div className="max-w-7xl mx-auto px-6">
        
//         {/* ===== HEADER ===== */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="mb-8"
//         >
//           <button
//             onClick={() => router.push('/children-dashboard')}
//             className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
//           >
//             <ArrowLeft size={20} />
//             Back to Dashboard
//           </button>

//           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
//             <div>
//               <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
//                 <BookOpen size={40} className="text-blue-400" />
//                 My Stories
//               </h1>
//               <p className="text-gray-300">
//                 Manage your creative writing collection and track your progress
//               </p>
//             </div>

//             <div className="flex items-center gap-3">
//               <Link
//                 href="/create-stories"
//                 className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all font-medium"
//               >
//                 <Plus size={20} />
//                 Create New Story
//               </Link>
//             </div>
//           </div>
//         </motion.div>

//         {/* ===== SUMMARY STATS ===== */}
//         {summary && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8"
//           >
//             <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 text-center">
//               <div className="text-2xl font-bold text-blue-400">{summary.total}</div>
//               <div className="text-sm text-blue-300">Total Stories</div>
//             </div>
            
//             <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
//               <div className="text-2xl font-bold text-green-400">{summary.completed}</div>
//               <div className="text-sm text-green-300">Completed</div>
//             </div>
            
//             <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 text-center">
//               <div className="text-2xl font-bold text-yellow-400">{summary.active}</div>
//               <div className="text-sm text-yellow-300">In Progress</div>
//             </div>
            
//             <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 text-center">
//               <div className="text-2xl font-bold text-purple-400">{summary.published}</div>
//               <div className="text-sm text-purple-300">Published</div>
//             </div>
            
//             <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4 text-center">
//               <div className="text-2xl font-bold text-orange-400">
//                 {summary.totalChildWords.toLocaleString()}
//               </div>
//               <div className="text-sm text-orange-300">Words Written</div>
//             </div>
            
//             <div className="bg-pink-500/20 border border-pink-500/30 rounded-lg p-4 text-center">
//               <div className="text-2xl font-bold text-pink-400">
//                 {summary.averageScore ? `${summary.averageScore}%` : 'N/A'}
//               </div>
//               <div className="text-sm text-pink-300">Avg Score</div>
//             </div>
//           </motion.div>
//         )}

//         {/* ===== FILTERS AND CONTROLS ===== */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//           className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6 mb-8"
//         >
//           <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            
//             {/* Search */}
//             <div className="flex-1 max-w-md relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//               <input
//                 type="text"
//                 placeholder="Search stories..."
//                 value={filters.search}
//                 onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
//                 className="w-full bg-gray-700/50 border border-gray-600/40 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             {/* Filter Controls */}
//             <div className="flex items-center gap-3 flex-wrap">
//               <button
//                 onClick={() => setShowFilters(!showFilters)}
//                 className="bg-gray-700/50 hover:bg-gray-600/50 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
//               >
//                 <Filter size={16} />
//                 Filters
//               </button>

//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => setViewType('grid')}
//                   className={`p-2 rounded-lg transition-colors ${
//                     viewType === 'grid' 
//                       ? 'bg-blue-600 text-white' 
//                       : 'bg-gray-700/50 text-gray-400 hover:text-white'
//                   }`}
//                 >
//                   <Grid3X3 size={16} />
//                 </button>
//                 <button
//                   onClick={() => setViewType('list')}
//                   className={`p-2 rounded-lg transition-colors ${
//                     viewType === 'list' 
//                       ? 'bg-blue-600 text-white' 
//                       : 'bg-gray-700/50 text-gray-400 hover:text-white'
//                   }`}
//                 >
//                   <List size={16} />
//                 </button>
//               </div>

//               <button
//                 onClick={fetchStories}
//                 className="bg-gray-700/50 hover:bg-gray-600/50 text-white p-2 rounded-lg transition-colors"
//                 title="Refresh stories"
//               >
//                 <RefreshCw size={16} />
//               </button>
//             </div>
//           </div>

//           {/* Expanded Filters */}
//           {showFilters && (
//             <div className="mt-6 pt-6 border-t border-gray-600/40">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
//                 {/* Status Filter */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
//                   <select
//                     value={filters.status}
//                     onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
//                     className="w-full bg-gray-700/50 border border-gray-600/40 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="all">All Status</option>
//                     <option value="completed">Completed</option>
//                     <option value="active">In Progress</option>
//                     <option value="flagged">Flagged</option>
//                     <option value="review">Under Review</option>
//                   </select>
//                 </div>

//                 {/* Type Filter */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">Story Type</label>
//                   <select
//                     value={filters.type}
//                     onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
//                     className="w-full bg-gray-700/50 border border-gray-600/40 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="all">All Types</option>
//                     <option value="freestyle">Freestyle</option>
//                     <option value="uploaded">Uploaded</option>
//                     <option value="competition">Competition</option>
//                   </select>
//                 </div>

//                 {/* Published Filter */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">Publication</label>
//                   <select
//                     value={filters.published}
//                     onChange={(e) => setFilters(prev => ({ ...prev, published: e.target.value as any }))}
//                     className="w-full bg-gray-700/50 border border-gray-600/40 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="all">All Stories</option>
//                     <option value="published">Published Only</option>
//                     <option value="unpublished">Unpublished Only</option>
//                   </select>
//                 </div>
//               </div>
//             </div>
//           )}
//         </motion.div>

//         {/* ===== STORIES DISPLAY ===== */}
//         {filteredStories.length === 0 ? (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.3 }}
//             className="text-center py-16"
//           >
//             <BookOpen className="w-20 h-20 text-gray-500 mx-auto mb-6" />
//             <h3 className="text-2xl font-semibold text-gray-400 mb-4">
//               {stories.length === 0 ? 'No stories yet' : 'No stories match your filters'}
//             </h3>
//             <p className="text-gray-500 mb-8 max-w-md mx-auto">
//               {stories.length === 0 
//                 ? 'Start your creative writing journey by creating your first story!'
//                 : 'Try adjusting your filters or search terms to find your stories.'
//               }
//             </p>
//             {stories.length === 0 && (
//               <Link
//                 href="/create-stories"
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors inline-flex items-center gap-2 font-medium"
//               >
//                 <Plus size={20} />
//                 Create Your First Story
//               </Link>
//             )}
//           </motion.div>
//         ) : (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.3 }}
//             className={
//               viewType === 'grid'
//                 ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
//                 : 'space-y-4'
//             }
//           >
//             {filteredStories.map((story, index) => (
//               <StoryCard
//                 key={story._id}
//                 story={story}
//                 viewType={viewType}
//                 index={index}
//                 onPublish={() => handlePublishStory(story._id)}
//                 onPurchase={() => handlePurchaseStory(story._id)}
//                 onDelete={() => handleDeleteStory(story._id, story.title)}
//                 onReassess={() => handleReassessStory(story._id)}
//                 publishingStory={publishingStory}
//                 deletingStory={deletingStory}
//                 reassessingStory={reassessingStory}
//                 getStoryTypeInfo={getStoryTypeInfo}
//                 getStatusInfo={getStatusInfo}
//                 getIntegrityIcon={getIntegrityIcon}
//                 getScoreColor={getScoreColor}
//               />
//             ))}
//           </motion.div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ===== STORY CARD COMPONENT =====
// interface StoryCardProps {
//   story: Story;
//   viewType: 'grid' | 'list';
//   index: number;
//   onPublish: () => void;
//   onPurchase: () => void;
//   onDelete: () => void;
//   onReassess: () => void;
//   publishingStory: string | null;
//   deletingStory: string | null;
//   reassessingStory: string | null;
//   getStoryTypeInfo: (story: Story) => any;
//   getStatusInfo: (status: string) => any;
//   getIntegrityIcon: (risk?: string) => JSX.Element;
//   getScoreColor: (score: number) => string;
// }

// function StoryCard({
//   story,
//   viewType,
//   index,
//   onPublish,
//   onPurchase,
//   onDelete,
//   onReassess,
//   publishingStory,
//   deletingStory,
//   reassessingStory,
//   getStoryTypeInfo,
//   getStatusInfo,
//   getIntegrityIcon,
//   getScoreColor
// }: StoryCardProps) {
//   const typeInfo = getStoryTypeInfo(story);
//   const statusInfo = getStatusInfo(story.status);

//   if (viewType === 'list') {
//     return (
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: index * 0.05 }}
//         className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6 hover:border-gray-500/60 transition-all"
//       >
//         <div className="flex items-start justify-between">
//           <div className="flex-1 min-w-0">
//             {/* Header */}
//             <div className="flex items-center gap-3 mb-3">
//               <typeInfo.icon className={`w-5 h-5 ${typeInfo.color}`} />
//               <span className={`text-xs font-medium ${typeInfo.color} uppercase tracking-wide`}>
//                 {typeInfo.label}
//               </span>
//               <statusInfo.icon className={`w-4 h-4 ${statusInfo.color}`} />
//               <span className={`text-sm ${statusInfo.color}`}>
//                 {statusInfo.label}
//               </span>
//             </div>

//             {/* Title and Basic Info */}
//             <div className="flex items-start justify-between mb-4">
//               <div>
//                 <h3 className="text-xl font-semibold text-white mb-2">{story.title}</h3>
//                 <div className="flex items-center gap-4 text-sm text-gray-400">
//                   <span className="flex items-center gap-1">
//                     <FileText size={14} />
//                     {story.totalWords} words
//                   </span>
//                   <span className="flex items-center gap-1">
//                     <Calendar size={14} />
//                     {new Date(story.createdAt).toLocaleDateString()}
//                   </span>
//                   {story.storyType === 'freestyle' && (
//                     <span className="flex items-center gap-1">
//                       <Clock size={14} />
//                       Turn {story.currentTurn}/{story.maxTurns}
//                     </span>
//                   )}
//                 </div>
//               </div>

//               {/* Assessment Score */}
//               {story.assessment && (
//                 <div className="text-right">
//                   <div className={`text-2xl font-bold ${getScoreColor(story.assessment.overallScore)}`}>
//                     {story.assessment.overallScore}%
//                   </div>
//                   <div className="text-sm text-gray-400">Overall Score</div>
//                 </div>
//               )}
//             </div>

//             {/* Assessment Details */}
//             {story.assessment && (
//               <div className="grid grid-cols-3 gap-4 mb-4">
//                 <div className="text-center">
//                   <div className={`text-lg font-semibold ${getScoreColor(story.assessment.grammarScore)}`}>
//                     {story.assessment.grammarScore}%
//                   </div>
//                   <div className="text-xs text-gray-400">Grammar</div>
//                 </div>
//                 <div className="text-center">
//                   <div className={`text-lg font-semibold ${getScoreColor(story.assessment.creativityScore)}`}>
//                     {story.assessment.creativityScore}%
//                   </div>
//                   <div className="text-xs text-gray-400">Creativity</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="flex items-center justify-center gap-1">
//                     {getIntegrityIcon(story.assessment.integrityAnalysis?.integrityRisk)}
//                     <span className="text-xs text-gray-400">Integrity</span>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Status Badges */}
//             <div className="flex items-center gap-2 mb-4">
//               {story.isPublished && (
//                 <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-medium border border-green-500/30 flex items-center gap-1">
//                   <Star size={12} />
//                   Published
//                 </span>
//               )}
//               {story.competitionEntries && story.competitionEntries.length > 0 && (
//                 <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-medium border border-purple-500/30 flex items-center gap-1">
//                   <Trophy size={12} />
//                   In Competition
//                 </span>
//               )}
//               {story.status === 'flagged' && (
//                 <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-medium border border-red-500/30">
//                   Flagged
//                 </span>
//               )}
//               {story.status === 'review' && (
//                 <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-medium border border-yellow-500/30">
//                   Under Review
//                 </span>
//               )}
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex items-center gap-2 ml-6">
//             <Link
//               href={`/children-dashboard/my-stories/${story._id}`}
//               className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
//             >
//               <Eye size={16} />
//               View
//             </Link>

//             {/* Publish Button */}
//             {story.status === 'completed' && !story.isPublished && (
//               <button
//                 onClick={onPublish}
//                 disabled={publishingStory === story._id}
//                 className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
//               >
//                 {publishingStory === story._id ? (
//                   <>
//                     <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
//                     Publishing...
//                   </>
//                 ) : (
//                   <>
//                     <Star size={16} />
//                     Publish Free
//                   </>
//                 )}
//               </button>
//             )}

//             {/* Purchase Button */}
//             {story.status === 'completed' && (
//               <button
//                 onClick={onPurchase}
//                 className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
//               >
//                 <DollarSign size={16} />
//                 Purchase $10
//               </button>
//             )}

//             {/* More Actions Dropdown */}
//             <div className="relative group">
//               <button className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors">
//                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                   <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
//                 </svg>
//               </button>
              
//               <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
//                 {story.assessment && story.assessmentAttempts < 5 && (
//                   <button
//                     onClick={onReassess}
//                     disabled={reassessingStory === story._id}
//                     className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors flex items-center gap-2"
//                   >
//                     {reassessingStory === story._id ? (
//                       <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
//                     ) : (
//                       <RefreshCw size={16} />
//                     )}
//                     Reassess Story
//                   </button>
//                 )}
                
//                 {!story.isPublished && !story.competitionEntries?.length && (
//                   <button
//                     onClick={onDelete}
//                     disabled={deletingStory === story._id}
//                     className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 transition-colors flex items-center gap-2"
//                   >
//                     {deletingStory === story._id ? (
//                       <div className="w-4 h-4 border border-red-400 border-t-transparent rounded-full animate-spin"></div>
//                     ) : (
//                       <Trash2 size={16} />
//                     )}
//                     Delete Story
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </motion.div>
//     );
//   }

//   // Grid View
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: index * 0.05 }}
//       className={`${typeInfo.bgColor} border ${typeInfo.borderColor} rounded-xl p-6 hover:bg-opacity-40 transition-all group relative`}
//     >
//       {/* Story Type Badge */}
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center gap-2">
//           <typeInfo.icon className={`w-5 h-5 ${typeInfo.color}`} />
//           <span className={`text-xs font-medium ${typeInfo.color} uppercase tracking-wide`}>
//             {typeInfo.label}
//           </span>
//         </div>
        
//         <div className="flex items-center gap-2">
//           <statusInfo.icon className={`w-4 h-4 ${statusInfo.color}`} />
//         </div>
//       </div>

//       {/* Title */}
//       <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2">{story.title}</h3>

//       {/* Story Stats */}
//       <div className="space-y-2 mb-4">
//         <div className="flex items-center justify-between text-sm">
//           <span className="text-gray-400">Words:</span>
//           <span className="text-white font-medium">{story.totalWords}</span>
//         </div>
        
//         {story.storyType === 'freestyle' && (
//           <div className="flex items-center justify-between text-sm">
//             <span className="text-gray-400">Progress:</span>
//             <span className="text-white font-medium">{story.currentTurn}/{story.maxTurns} turns</span>
//           </div>
//         )}
        
//         <div className="flex items-center justify-between text-sm">
//           <span className="text-gray-400">Created:</span>
//           <span className="text-white font-medium">
//             {new Date(story.createdAt).toLocaleDateString()}
//           </span>
//         </div>
//       </div>

//       {/* Assessment Score */}
//       {story.assessment && (
//         <div className="bg-gray-700/50 rounded-lg p-3 mb-4">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-sm text-gray-400">Overall Score</span>
//             <span className={`text-xl font-bold ${getScoreColor(story.assessment.overallScore)}`}>
//               {story.assessment.overallScore}%
//             </span>
//           </div>
          
//           <div className="grid grid-cols-3 gap-2 text-xs">
//             <div className="text-center">
//               <div className={`font-semibold ${getScoreColor(story.assessment.grammarScore)}`}>
//                 {story.assessment.grammarScore}%
//               </div>
//               <div className="text-gray-400">Grammar</div>
//             </div>
//             <div className="text-center">
//               <div className={`font-semibold ${getScoreColor(story.assessment.creativityScore)}`}>
//                 {story.assessment.creativityScore}%
//               </div>
//               <div className="text-gray-400">Creativity</div>
//             </div>
//             <div className="text-center">
//               <div className="flex justify-center">
//                 {getIntegrityIcon(story.assessment.integrityAnalysis?.integrityRisk)}
//               </div>
//               <div className="text-gray-400">Integrity</div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Status Badges */}
//       <div className="flex flex-wrap gap-2 mb-4">
//         {story.isPublished && (
//           <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs font-medium border border-green-500/30 flex items-center gap-1">
//             <Star size={10} />
//             Published
//           </span>
//         )}
//         {story.competitionEntries && story.competitionEntries.length > 0 && (
//           <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs font-medium border border-purple-500/30 flex items-center gap-1">
//             <Trophy size={10} />
//             Competition
//           </span>
//         )}
//         {story.status === 'flagged' && (
//           <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-medium border border-red-500/30">
//             Flagged
//           </span>
//         )}
//         {story.status === 'review' && (
//           <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-medium border border-yellow-500/30">
//             Review
//           </span>
//         )}
//       </div>

//       {/* Action Buttons */}
//       <div className="space-y-2">
//         <Link
//           href={`/children-dashboard/my-stories/${story._id}`}
//           className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
//         >
//           <Eye size={16} />
//           View Story
//         </Link>

//         <div className="grid grid-cols-2 gap-2">
//           {/* Publish Button */}
//           {story.status === 'completed' && !story.isPublished ? (
//             <button
//               onClick={onPublish}
//               disabled={publishingStory === story._id}
//               className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
//             >
//               {publishingStory === story._id ? (
//                 <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
//               ) : (
//                 <>
//                   <Star size={12} />
//                   Publish
//                 </>
//               )}
//             </button>
//           ) : (
//             <div></div>
//           )}

//           {/* Purchase Button */}
//           {story.status === 'completed' && (
//             <button
//               onClick={onPurchase}
//               className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
//             >
//               <DollarSign size={12} />
//               $10
//             </button>
//           )}
//         </div>
//       </div>

//       {/* More Actions - Absolute positioned */}
//       <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
//         <div className="relative group/menu">
//           <button className="bg-gray-800/80 hover:bg-gray-700/80 text-white p-1.5 rounded-lg transition-colors">
//             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//               <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
//             </svg>
//           </button>
          
//           <div className="absolute right-0 top-full mt-1 w-40 bg-gray-800 border border-gray-600 rounded-lg shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20">
//             {story.assessment && story.assessmentAttempts < 5 && (
//               <button
//                 onClick={onReassess}
//                 disabled={reassessingStory === story._id}
//                 className="w-full text-left px-3 py-2 text-white hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm"
//               >
//                 {reassessingStory === story._id ? (
//                   <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
//                 ) : (
//                   <RefreshCw size={14} />
//                 )}
//                 Reassess
//               </button>
//             )}
            
//             {!story.isPublished && !story.competitionEntries?.length && (
//               <button
//                 onClick={onDelete}
//                 disabled={deletingStory === story._id}
//                 className="w-full text-left px-3 py-2 text-red-400 hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm"
//               >
//                 {deletingStory === story._id ? (
//                   <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin"></div>
//                 ) : (
//                   <Trash2 size={14} />
//                 )}
//                 Delete
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// }


// app/children-dashboard/my-stories/page.tsx - FINAL VERSION
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trophy,
  Upload,
  Star,
  Eye,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Shield,
  Clock,
  Award,
  FileText,
  Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ===== INTERFACES =====
interface Story {
  _id: string;
  title: string;
  totalWords: number;
  childWords: number;
  aiWords: number;
  status: 'active' | 'completed' | 'flagged' | 'review';
  createdAt: string;
  updatedAt: string;
  storyType: 'freestyle' | 'uploaded' | 'competition';
  isUploadedForAssessment: boolean;
  isPublished: boolean;
  competitionEligible: boolean;
  competitionEntries: Array<{
    competitionId: string;
    submittedAt: string;
    rank?: number;
    score?: number;
  }>;
  assessment?: {
    overallScore: number;
    creativity: number;
    grammar: number;
    vocabulary: number;
    integrityRisk: 'low' | 'medium' | 'high' | 'critical';
  };
  assessmentAttempts: number;
  maxAssessmentAttempts: number;
}

interface StorySummary {
  total: number;
  completed: number;
  active: number;
  flagged: number;
  review: number;
  published: number;
  freestyle: number;
  uploaded: number;
  competition: number;
  totalWords: number;
  totalChildWords: number;
  averageScore: number | null;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function MyStoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ===== STATE =====
  const [stories, setStories] = useState<Story[]>([]);
  const [summary, setSummary] = useState<StorySummary | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'all');
  const [typeFilter, setTypeFilter] = useState<string>(searchParams.get('type') || 'all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  // Action states
  const [publishingStory, setPublishingStory] = useState<string | null>(null);

  // ===== EFFECTS =====
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    if (status === 'authenticated') {
      fetchStories();
    }
  }, [status, currentPage, searchTerm, statusFilter, typeFilter]);

  // ===== API CALLS =====
  const fetchStories = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
      });

      const response = await fetch(`/api/user/stories?${params}`);
      const data = await response.json();

      if (data.success) {
        setStories(data.stories || []);
        setSummary(data.summary);
        setPagination(data.pagination);
        setError(null);
      } else {
        throw new Error(data.error || 'Failed to fetch stories');
      }
    } catch (error) {
      console.error('❌ Error fetching stories:', error);
      setError('Failed to load stories. Please try again.');
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  // ===== STORY ACTIONS =====
  const handlePublishStory = async (storyId: string) => {
    if (!session?.user?.id) return;
    
    setPublishingStory(storyId);
    
    try {
      const response = await fetch('/api/stories/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: storyId })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('🎉 Story published to community showcase!');
        fetchStories(); // Refresh data
      } else {
        throw new Error(data.error || 'Failed to publish story');
      }
    } catch (error) {
      console.error('❌ Publication error:', error);
      alert('Failed to publish story. Please try again.');
    } finally {
      setPublishingStory(null);
    }
  };

  const handlePurchaseStory = async (storyId: string) => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: 'story_purchase',
          storyId: storyId,
          userId: session.user.id
        })
      });

      const data = await response.json();
      
      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('❌ Purchase error:', error);
      alert('Failed to start purchase process. Please try again.');
    }
  };

  // ===== HELPER FUNCTIONS =====
  const getStoryTypeInfo = (story: Story) => {
    if (story.competitionEntries && story.competitionEntries.length > 0) {
      return { 
        label: "COMPETITION ENTRY", 
        icon: Trophy, 
        color: "text-purple-400",
        bgColor: "bg-purple-500/20",
        borderColor: "border-purple-500/30"
      };
    }
    if (story.isUploadedForAssessment) {
      return { 
        label: "UPLOADED FOR ASSESSMENT", 
        icon: Upload, 
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
        borderColor: "border-blue-500/30"
      };
    }
    return { 
      label: "FREESTYLE STORY", 
      icon: Sparkles, 
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      borderColor: "border-green-500/30"
    };
  };

  const getIntegrityIcon = (integrityRisk?: string) => {
    switch (integrityRisk) {
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  // ===== LOADING STATE =====
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          Loading your stories...
        </div>
      </div>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900">
      <div className="container mx-auto px-6 py-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">My Stories</h1>
              <p className="text-gray-300">Manage and track your creative writing journey</p>
            </div>
            
            <Link
              href="/create-stories"
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg"
            >
              <Plus size={20} />
              Create New Story
            </Link>
          </div>
        </motion.div>

        {/* Summary Stats */}
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8"
          >
            <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{summary.total}</div>
              <div className="text-gray-300 text-sm">Total Stories</div>
            </div>
            <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-400">{summary.completed}</div>
              <div className="text-gray-300 text-sm">Completed</div>
            </div>
            <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-400">{summary.published}</div>
              <div className="text-gray-300 text-sm">Published</div>
            </div>
            <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-400">{summary.totalChildWords.toLocaleString()}</div>
              <div className="text-gray-300 text-sm">Words Written</div>
            </div>
            <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-4">
              <div className="text-2xl font-bold text-yellow-400">{summary.competition}</div>
              <div className="text-gray-300 text-sm">Competitions</div>
            </div>
            <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-4">
              <div className={`text-2xl font-bold ${summary.averageScore ? getScoreColor(summary.averageScore) : 'text-gray-400'}`}>
                {summary.averageScore ? `${summary.averageScore}%` : 'N/A'}
              </div>
              <div className="text-gray-300 text-sm">Avg Score</div>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="flagged">Flagged</option>
              <option value="review">Under Review</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="freestyle">Freestyle</option>
              <option value="uploaded">Uploaded</option>
              <option value="competition">Competition</option>
            </select>

            {/* View Mode */}
            <div className="flex bg-gray-700/50 border border-gray-600 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                <Grid size={16} />
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                <List size={16} />
                List
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stories Grid/List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {error ? (
            <div className="text-center py-12">
              <div className="text-red-400 text-lg mb-4">❌ {error}</div>
              <button
                onClick={fetchStories}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-24 h-24 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-white mb-4">No Stories Yet</h3>
              <p className="text-gray-300 mb-6">Start your creative writing journey today!</p>
              <Link
                href="/create-stories"
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-4 rounded-xl font-semibold transition-all inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Create Your First Story
              </Link>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {stories.map((story) => (
                    <StoryCard
                      key={story._id}
                      story={story}
                      onPublish={() => handlePublishStory(story._id)}
                      onPurchase={() => handlePurchaseStory(story._id)}
                      publishingStory={publishingStory}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {stories.map((story) => (
                    <StoryListItem
                      key={story._id}
                      story={story}
                      onPublish={() => handlePublishStory(story._id)}
                      onPurchase={() => handlePurchaseStory(story._id)}
                      publishingStory={publishingStory}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex justify-center items-center gap-4"
          >
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={!pagination.hasPrev}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
              disabled={!pagination.hasNext}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ===== STORY CARD COMPONENT =====
interface StoryCardProps {
  story: Story;
  onPublish: () => void;
  onPurchase: () => void;
  publishingStory: string | null;
}

function StoryCard({ story, onPublish, onPurchase, publishingStory }: StoryCardProps) {
  const getStoryTypeInfo = (story: Story) => {
    if (story.competitionEntries && story.competitionEntries.length > 0) {
      return { 
        label: "COMPETITION", 
        icon: Trophy, 
        color: "text-purple-400",
        bgColor: "bg-purple-500/20",
        borderColor: "border-purple-500/30"
      };
    }
    if (story.isUploadedForAssessment) {
      return { 
        label: "ASSESSMENT", 
        icon: Upload, 
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
        borderColor: "border-blue-500/30"
      };
    }
    return { 
      label: "FREESTYLE", 
      icon: Sparkles, 
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      borderColor: "border-green-500/30"
    };
  };

  const getIntegrityIcon = (integrityRisk?: string) => {
    switch (integrityRisk) {
      case 'low': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'critical': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const typeInfo = getStoryTypeInfo(story);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6 hover:border-gray-500/50 transition-all group relative"
    >
      {/* Story Type Badge */}
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mb-4 ${typeInfo.bgColor} ${typeInfo.color} ${typeInfo.borderColor} border`}>
        <typeInfo.icon size={12} />
        {typeInfo.label}
      </div>

      {/* Title & Metadata */}
      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{story.title}</h3>
      
      <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
        <span>{story.totalWords} words</span>
        <span>•</span>
        <span>{new Date(story.createdAt).toLocaleDateString()}</span>
      </div>

      {/* Assessment Score (if available) */}
      {story.assessment && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Overall Score</span>
            <div className="flex items-center gap-2">
              {getIntegrityIcon(story.assessment.integrityRisk)}
              <span className={`font-semibold ${getScoreColor(story.assessment.overallScore)}`}>
                {story.assessment.overallScore}%
              </span>
            </div>
          </div>
          <div className="flex gap-4 text-xs text-gray-400">
            <span>Grammar: {story.assessment.grammar}%</span>
            <span>Creativity: {story.assessment.creativity}%</span>
          </div>
        </div>
      )}

      {/* Status Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {story.isPublished && (
          <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs font-medium border border-green-500/30 flex items-center gap-1">
            <Star size={10} />
            Published
          </span>
        )}
        {story.competitionEntries && story.competitionEntries.length > 0 && (
          <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs font-medium border border-purple-500/30 flex items-center gap-1">
            <Trophy size={10} />
            Competition
          </span>
        )}
        {story.status === 'flagged' && (
          <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-medium border border-red-500/30">
            Flagged
          </span>
        )}
        {story.status === 'review' && (
          <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-medium border border-yellow-500/30">
            Review
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Link
          href={`/children-dashboard/my-stories/${story._id}`}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Eye size={16} />
          View Story
        </Link>

        <div className="grid grid-cols-2 gap-2">
          {/* Publish Button - Show for ALL completed stories (including flagged) */}
          {story.status === 'completed' && !story.isPublished ? (
            <button
              onClick={onPublish}
              disabled={publishingStory === story._id}
              className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
            >
              {publishingStory === story._id ? (
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                 # Publish To Community - Free
                </>
              )}
            </button>
          ) : (
            <div></div>
          )}

          {/* Purchase Button - Show for ALL completed stories */}
          {story.status === 'completed' && (
            <button
              onClick={onPurchase}
              className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
            >
              $10 - Reserve In Physical Story Book
            </button>
          )}
        </div>
      </div>

      {/* More Actions - NO ACTIONS AVAILABLE */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="relative group/menu">
          <button className="bg-gray-800/80 hover:bg-gray-700/80 text-white p-1.5 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          
          <div className="absolute right-0 top-full mt-1 w-40 bg-gray-800 border border-gray-600 rounded-lg shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20">
            {/* NO ACTIONS - No reassess, no delete */}
            <div className="px-3 py-2 text-gray-400 text-sm text-center">
              No actions available
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ===== STORY LIST ITEM COMPONENT =====
function StoryListItem({ story, onPublish, onPurchase, publishingStory }: StoryCardProps) {
  const getStoryTypeInfo = (story: Story) => {
    if (story.competitionEntries && story.competitionEntries.length > 0) {
      return { 
        label: "COMPETITION ENTRY", 
        icon: Trophy, 
        color: "text-purple-400",
        bgColor: "bg-purple-500/20",
        borderColor: "border-purple-500/30"
      };
    }
    if (story.isUploadedForAssessment) {
      return { 
        label: "UPLOADED FOR ASSESSMENT", 
        icon: Upload, 
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
        borderColor: "border-blue-500/30"
      };
    }
    return { 
      label: "FREESTYLE STORY", 
      icon: Sparkles, 
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      borderColor: "border-green-500/30"
    };
  };

  const getIntegrityIcon = (integrityRisk?: string) => {
    switch (integrityRisk) {
      case 'low': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'critical': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const typeInfo = getStoryTypeInfo(story);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6 hover:border-gray-500/50 transition-all"
    >
      <div className="flex items-center justify-between">
        {/* Left Side - Story Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <typeInfo.icon className={`w-5 h-5 ${typeInfo.color}`} />
            <h3 className="text-lg font-semibold text-white">{story.title}</h3>
            
            {/* Status Badges */}
            <div className="flex gap-2">
              {story.isPublished && (
                <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-medium border border-green-500/30 flex items-center gap-1">
                  <Star size={12} />
                  Published
                </span>
              )}
              {story.competitionEntries && story.competitionEntries.length > 0 && (
                <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-medium border border-purple-500/30 flex items-center gap-1">
                  <Trophy size={12} />
                  In Competition
                </span>
              )}
              {story.status === 'flagged' && (
                <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-medium border border-red-500/30">
                  Flagged
                </span>
              )}
              {story.status === 'review' && (
                <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-medium border border-yellow-500/30">
                  Under Review
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-400">
            <span>{story.totalWords} words total</span>
            <span>{story.childWords} your words</span>
            <span>{new Date(story.createdAt).toLocaleDateString()}</span>
            
            {/* Assessment Score */}
            {story.assessment && (
              <div className="flex items-center gap-2">
                {getIntegrityIcon(story.assessment.integrityRisk)}
                <span className={`font-semibold ${getScoreColor(story.assessment.overallScore)}`}>
                  {story.assessment.overallScore}% Score
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-2 ml-6">
          <Link
            href={`/children-dashboard/my-stories/${story._id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Eye size={16} />
            View
          </Link>

          {/* Publish Button - Show for ALL completed stories (including flagged) */}
          {story.status === 'completed' && !story.isPublished && (
            <button
              onClick={onPublish}
              disabled={publishingStory === story._id}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {publishingStory === story._id ? (
                <>
                  <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
                  Publishing...
                </>
              ) : (
                <>
                  <Star size={16} />
                  Publish Free
                </>
              )}
            </button>
          )}

          {/* Purchase Button - Show for ALL completed stories */}
          {story.status === 'completed' && (
            <button
              onClick={onPurchase}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <DollarSign size={16} />
              Purchase $10
            </button>
          )}

          {/* More Actions Dropdown - NO ACTIONS */}
          <div className="relative group">
            <button className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            
            <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              {/* NO ACTIONS - No reassess, no delete */}
              <div className="px-4 py-2 text-gray-400 text-sm text-center">
                No actions available
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}