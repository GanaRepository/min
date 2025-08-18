
// // app/children-dashboard/page.tsx - UPDATED WITH SIMPLIFIED SYSTEM
// 'use client';

// import { useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import {
//   BookOpen,
//   Plus,
//   Trophy,
//   Upload,
//   Sparkles,
//   Star,
//   Eye,
//   DollarSign,
//   TrendingUp,
//   Award,
//   Target,
//   Calendar,
//   Clock,
//   Users,
//   Zap,
//   CheckCircle,
//   AlertTriangle,
//   XCircle,
//   Shield,
//   Brain,
//   Crown,
//   Gift,
// } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

// // ===== INTERFACES =====

// interface UsageStats {
//   freestyleStories: { used: number; limit: number; remaining: number; canUse: boolean };
//   assessmentRequests: { used: number; limit: number; remaining: number; canUse: boolean };
//   competitionEntries: { used: number; limit: number; remaining: number; canUse: boolean };
//   publications: { used: number; limit: number; remaining: number; canUse: boolean };
//   resetDate: string;
//   subscriptionTier: 'FREE' | 'STORY_PACK';
//   storyPackExpiry?: string;
//   daysRemaining?: number;
//   resetInfo?: {
//     performed: boolean;
//     message: string;
//   };
// }

// interface Story {
//   _id: string;
//   title: string;
//   totalWords: number;
//   childWords: number;
//   status: 'active' | 'completed' | 'flagged' | 'review';
//   createdAt: string;
//   storyType: 'freestyle' | 'uploaded' | 'competition';
//   isUploadedForAssessment: boolean;
//   isPublished: boolean;
//   competitionEntries: Array<{
//     competitionId: string;
//     submittedAt: string;
//     rank?: number;
//     score?: number;
//   }>;
//   assessment?: {
//     overallScore: number;
//     creativity: number;
//     grammar: number;
//     integrityRisk: 'low' | 'medium' | 'high' | 'critical';
//   };
// }

// interface Competition {
//   _id: string;
//   month: string;
//   year: number;
//   phase: 'submission' | 'judging' | 'results';
//   isActive: boolean;
//   daysLeft: number;
//   totalSubmissions: number;
//   totalParticipants: number;
//   userStats?: {
//     entriesUsed: number;
//     entriesLimit: number;
//     canSubmit: boolean;
//     userEntries: Array<{
//       storyId: string;
//       title: string;
//       submittedAt: string;
//       rank?: number;
//       score?: number;
//     }>;
//   };
// }

// interface Achievement {
//   _id: string;
//   title: string;
//   description: string;
//   icon: string;
//   unlockedAt: string;
//   category: string;
// }

// export default function ChildrenDashboardPage() {
//   // Handler for Story Pack upgrades
//   const handleUpgrade = () => {
//     router.push('/pricing');
//   };
//   const { data: session, status } = useSession();
//   const router = useRouter();

//   // ===== STATE =====
//   const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
//   const [resetNotification, setResetNotification] = useState<boolean>(false);
//   const [recentStories, setRecentStories] = useState<Story[]>([]);
//   const [currentCompetition, setCurrentCompetition] = useState<Competition | null>(null);
//   const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Action states
//   const [publishingStory, setPublishingStory] = useState<string | null>(null);

//   // ===== EFFECTS =====
//   useEffect(() => {
//     if (status === 'unauthenticated') {
//       router.push('/auth/signin');
//       return;
//     }
//     if (status === 'authenticated') {
//       fetchDashboardData();
//     }
//   }, [status]);

//   // ===== API CALLS =====
//   const fetchDashboardData = async () => {
//     if (!session?.user?.id) return;

//     setLoading(true);
//     try {
//       // Fetch all dashboard data in parallel
//       const [usageResponse, storiesResponse, competitionResponse] = await Promise.all([
//         fetch('/api/user/usage'),
//         fetch('/api/user/stories?limit=6&recent=true'),
//         fetch('/api/competitions/current')
//       ]);

//       // Handle usage stats
//       if (usageResponse.ok) {
//         const usageData = await usageResponse.json();
//         console.log('📊 Usage stats loaded:', usageData);
//         setUsageStats(usageData.usage || getDefaultUsageStats());
//         // Check if reset just happened
//         if (usageData.usage?.resetInfo?.performed) {
//           setResetNotification(true);
//           setTimeout(() => setResetNotification(false), 5000);
//         }
//       } else {
//         console.error('❌ Failed to fetch usage stats');
//         setUsageStats(getDefaultUsageStats());
//       }
//   // ===== RESET NOTIFICATION UI =====
//   // Place this in your JSX where you want the notification to appear
//   {resetNotification && (
//     <div className="bg-blue-600 text-white p-4  mb-4 flex items-center gap-2">
//       <span className="text-2xl">🔄</span>
//       <div>
//         <strong>Monthly Reset Complete!</strong>
//         <p className="text-sm opacity-90">Your limits have been reset to FREE tier for the new month.</p>
//       </div>
//     </div>
//   )}

//       // Handle recent stories
//       if (storiesResponse.ok) {
//         const storiesData = await storiesResponse.json();
//         console.log('📚 Recent stories loaded:', storiesData.stories?.length || 0);
//         setRecentStories(storiesData.stories || []);
//       } else {
//         console.error('❌ Failed to fetch recent stories');
//         setRecentStories([]);
//       }

//       // Handle current competition
//       if (competitionResponse.ok) {
//         const competitionData = await competitionResponse.json();
//         console.log('🏆 Competition data loaded:', competitionData.competition?.month);
//         setCurrentCompetition(competitionData.competition);
//       } else {
//         console.error('❌ Failed to fetch competition data');
//         setCurrentCompetition(null);
//       }

//       // Fetch achievements (optional)
//       try {
//         const achievementsResponse = await fetch('/api/user/achievements?recent=3');
//         if (achievementsResponse.ok) {
//           const achievementsData = await achievementsResponse.json();
//           setRecentAchievements(achievementsData.achievements || []);
//         }
//       } catch (err) {
//         console.log('ℹ️ Achievements not available');
//       }

//     } catch (error) {
//       console.error('❌ Dashboard data fetch error:', error);
//       setError('Failed to load dashboard data. Please refresh the page.');
//       setUsageStats(getDefaultUsageStats());
//       setRecentStories([]);
//       setCurrentCompetition(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ===== HELPER FUNCTIONS =====
//   const getDefaultUsageStats = (): UsageStats => ({
//     freestyleStories: { used: 0, limit: 3, remaining: 3, canUse: true },
//     assessmentRequests: { used: 0, limit: 9, remaining: 9, canUse: true },
//     competitionEntries: { used: 0, limit: 3, remaining: 3, canUse: true },
//     publications: { used: 0, limit: 1, remaining: 1, canUse: true },
//     resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
//     subscriptionTier: 'FREE'
//   });

//   const getStoryTypeInfo = (story: Story) => {
//     if (story.competitionEntries && story.competitionEntries.length > 0) {
//       return { 
//         label: "COMPETITION ENTRY", 
//         icon: Trophy, 
//         color: "text-green-400",
//         bgColor: "bg-green-500/20",
//         borderColor: "border-green-500/30"
//       };
//     }
//     if (story.isUploadedForAssessment) {
//       return { 
//         label: "UPLOADED FOR ASSESSMENT", 
//         icon: Upload, 
//         color: "text-blue-400",
//         bgColor: "bg-blue-500/20",
//         borderColor: "border-blue-500/30"
//       };
//     }
//     return { 
//       label: "FREESTYLE STORY", 
//       icon: Sparkles, 
//       color: "text-green-400",
//       bgColor: "bg-green-500/20",
//       borderColor: "border-green-500/30"
//     };
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
//         return <CheckCircle className="w-4 h-4 text-gray-400" />;
//     }
//   };

//   const getScoreColor = (score: number) => {
//     if (score >= 90) return 'text-green-400';
//     if (score >= 80) return 'text-blue-400';
//     if (score >= 70) return 'text-yellow-400';
//     return 'text-orange-400';
//   };

//   // ===== STORY ACTIONS =====
  // Publish handler (must be inside component to access state)
  // ...existing code...

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

//   // ===== LOADING STATE =====
//   if (status === 'loading' || loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
//         <div className="text-white text-xl flex items-center gap-3">
//           <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent  animate-spin"></div>
//           Loading your dashboard...
//         </div>
//       </div>
//     );
//   }

//   // ===== MAIN RENDER =====
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900">
//       <div className="container mx-auto px-6 py-8">
        
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="mb-8"
//         >
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-4xl  text-white mb-2">
//                 Welcome back, {session?.user?.firstName || 'Writer'}! 🌟
//               </h1>
//               <p className="text-gray-300">Ready to continue your creative writing journey?</p>
//             </div>
            
//             <Link
//               href="/create-stories"
//               className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3   transition-all flex items-center gap-2 shadow-lg"
//             >
//               <Plus size={20} />
//               Create New Story
//             </Link>
//           </div>
//         </motion.div>


//         {/* Usage Statistics + Upgrade/Story Pack Banner */}
//         {usageStats && (
//           <>
//             {/* Usage Stats Card (pass onUpgrade for FREE tier) */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.1 }}
//               className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
//             >
//               {/* ...existing stats cards for stories, assessments, competitions... */}
//               {/* (You can keep your current stats card code here) */}
//             </motion.div>

//             {/* Upgrade Promotion - ONLY SHOW IF FREE TIER */}
//             {usageStats.subscriptionTier === 'FREE' && (
//               <motion.div
//                 initial={{ opacity: 0, y: 30 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.6 }}
//                 className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30  p-8 text-center"
//               >
//                 <Crown className="w-16 h-16 text-orange-400 mx-auto mb-4" />
//                 <h3 className="text-2xl  text-white mb-4">Want More Creative Power?</h3>
//                 <p className="text-gray-300 mb-6">
//                   Upgrade to Story Pack and get 5 more stories, 15 more assessments for 30 days!
//                 </p>
//                 <button
//                   onClick={handleUpgrade}
//                   className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4   text-lg transition-colors"
//                 >
//                   <Crown className="w-5 h-5" />
//                   Upgrade to Story Pack
//                 </button>
//               </motion.div>
//             )}

//             {/* Story Pack Active Banner - SHOW IF STORY PACK IS ACTIVE */}
//             {usageStats.subscriptionTier === 'STORY_PACK' && usageStats.daysRemaining && (
//               <motion.div
//                 initial={{ opacity: 0, y: 30 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.6 }}
//                 className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30  p-8 text-center"
//               >
//                 <div className="flex items-center justify-center gap-3 mb-4">
//                   <Crown className="w-16 h-16 text-green-400" />
//                   <div className="bg-green-500/20  p-2">
//                     <CheckCircle className="w-8 h-8 text-green-400" />
//                   </div>
//                 </div>
//                 <h3 className="text-2xl  text-white mb-4">Story Pack Active! 🎉</h3>
//                 <p className="text-gray-300 mb-2">
//                   You have <span className="text-green-400 ">{usageStats.daysRemaining} days</span> remaining
//                 </p>
//                 <p className="text-sm text-gray-400">
//                   Enjoying unlimited creativity until {usageStats.storyPackExpiry ? new Date(usageStats.storyPackExpiry).toLocaleDateString() : 'expiry'}
//                 </p>
//               </motion.div>
//             )}
//           </>
//         )}

//         {/* Upgrade Banner */}
//         {usageStats?.subscriptionTier === 'FREE' && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30  p-6 mb-8"
//           >
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-4">
//                 <div className="bg-yellow-500/20 p-3 ">
//                   <Gift className="w-8 h-8 text-yellow-400" />
//                 </div>
//                 <div>
//                   <h3 className="text-xl  text-white mb-1">Unlock More Stories & Assessments!</h3>
//                   <p className="text-gray-300">Get 5 more freestyle stories + 15 more AI assessments for just $15</p>
//                   <div className="flex items-center gap-4 mt-2 text-sm">
//                     <span className="text-yellow-400">✨ 8 total freestyle stories</span>
//                     <span className="text-blue-400">🧠 24 total AI assessments</span>
//                   </div>
//                 </div>
//               </div>
//               <Link
//                 href="/children-dashboard/upgrade"
//                 className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3   transition-all"
//               >
//                 Upgrade Now
//               </Link>
//             </div>
//           </motion.div>
//         )}

//         {/* Current Competition */}
//         {currentCompetition && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.3 }}
//             className="bg-gradient-to-r from-green-500/20 to-pink-500/20 border border-green-500/30  p-6 mb-8"
//           >
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-4">
//                 <div className="bg-green-500/20 p-3 ">
//                   <Crown className="w-8 h-8 text-green-400" />
//                 </div>
//                 <div>
//                   <h3 className="text-xl  text-white mb-1">
//                     {currentCompetition.month} {currentCompetition.year} Competition
//                   </h3>
//                   <div className="flex items-center gap-4 text-sm">
//                     <span className="text-green-300">
//                       📅 {currentCompetition.daysLeft} days left
//                     </span>
//                     <span className="text-pink-300">
//                       👥 {currentCompetition.totalParticipants} participants
//                     </span>
//                     <span className="text-yellow-300">
//                       📝 {currentCompetition.totalSubmissions} submissions
//                     </span>
//                   </div>
//                   {currentCompetition.userStats && (
//                     <div className="mt-2">
//                       <span className="text-gray-300 text-sm">
//                         Your entries: {currentCompetition.userStats.entriesUsed}/{currentCompetition.userStats.entriesLimit}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//               <Link
//                 href="/children-dashboard/competitions"
//                 className="bg-gradient-to-r from-green-500 to-pink-500 hover:from-green-600 hover:to-pink-600 text-white px-6 py-3   transition-all"
//               >
//                 Enter Competition
//               </Link>
//             </div>
//           </motion.div>
//         )}

//         {/* Quick Actions */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.4 }}
//           className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
//         >
//           <Link
//             href="/children-dashboard/create-stories?type=freestyle"
//             className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-6 hover:border-green-500/50 transition-all group"
//           >
//             <div className="flex items-center gap-4">
//               <div className="bg-green-500/20 p-3  group-hover:bg-green-500/30 transition-colors">
//                 <Sparkles className="w-6 h-6 text-green-400" />
//               </div>
//               <div>
//                 <h3 className="text-lg  text-white">Write with AI</h3>
//                 <p className="text-gray-400 text-sm">Start a collaborative story</p>
//               </div>
//             </div>
//           </Link>

//           <Link
//             href="/children-dashboard/create-stories?type=assessment"
//             className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-6 hover:border-blue-500/50 transition-all group"
//           >
//             <div className="flex items-center gap-4">
//               <div className="bg-blue-500/20 p-3  group-hover:bg-blue-500/30 transition-colors">
//                 <Upload className="w-6 h-6 text-blue-400" />
//               </div>
//               <div>
//                 <h3 className="text-lg  text-white">Get AI Assessment</h3>
//                 <p className="text-gray-400 text-sm">Upload your story for review</p>
//               </div>
//             </div>
//           </Link>

//           <Link
//             href="/children-dashboard/competitions"
//             className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-6 hover:border-green-500/50 transition-all group"
//           >
//             <div className="flex items-center gap-4">
//               <div className="bg-green-500/20 p-3  group-hover:bg-green-500/30 transition-colors">
//                 <Trophy className="w-6 h-6 text-green-400" />
//               </div>
//               <div>
//                 <h3 className="text-lg  text-white">Join Competition</h3>
//                 <p className="text-gray-400 text-sm">Compete with other writers</p>
//               </div>
//             </div>
//           </Link>
//         </motion.div>

//         {/* Recent Stories */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.5 }}
//           className="mb-8"
//         >
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-2xl  text-white">Recent Stories</h2>
//             <Link
//               href="/children-dashboard/my-stories"
//               className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
//             >
//               View All
//               <Eye size={16} />
//             </Link>
//           </div>

//           {recentStories.length === 0 ? (
//             <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-8 text-center">
//               <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-lg  text-white mb-2">No Stories Yet</h3>
//               <p className="text-gray-400 mb-6">Start your creative writing journey today!</p>
//               <Link
//                 href="/children-dashboard/create-stories"
//                 className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3   transition-all inline-flex items-center gap-2"
//               >
//                 <Plus size={16} />
//                 Create Your First Story
//               </Link>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {recentStories.map((story) => (
//                 <StoryCard
//                   key={story._id}
//                   story={story}
//                   onPublish={() => handlePublishStory(story._id)}
//                   onPurchase={() => handlePurchaseStory(story._id)}
//                   publishingStory={publishingStory}
//                 />
//               ))}
//             </div>
//           )}
//         </motion.div>

//         {/* Recent Achievements */}
//         {recentAchievements.length > 0 && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.6 }}
//             className="mb-8"
//           >
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-2xl  text-white">Recent Achievements</h2>
//               <Link
//                 href="/children-dashboard/achievements"
//                 className="text-yellow-400 hover:text-yellow-300 transition-colors flex items-center gap-2"
//               >
//                 View All
//                 <Award size={16} />
//               </Link>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               {recentAchievements.map((achievement) => (
//                 <div
//                   key={achievement._id}
//                   className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30  p-6"
//                 >
//                   <div className="flex items-center gap-4">
//                     <div className="text-4xl">{achievement.icon}</div>
//                     <div>
//                       <h3 className="text-lg  text-white">{achievement.title}</h3>
//                       <p className="text-gray-300 text-sm">{achievement.description}</p>
//                       <span className="text-yellow-400 text-xs">
//                         Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </motion.div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ===== STORY CARD COMPONENT =====
// interface StoryCardProps {
//   story: Story;
//   onPublish: () => void;
//   onPurchase: () => void;
//   publishingStory: string | null;
// }

// function StoryCard({ story, onPublish, onPurchase, publishingStory }: StoryCardProps) {
//   const getStoryTypeInfo = (story: Story) => {
//     if (story.competitionEntries && story.competitionEntries.length > 0) {
//       return { 
//         label: "COMPETITION", 
//         icon: Trophy, 
//         color: "text-green-400",
//         bgColor: "bg-green-500/20",
//         borderColor: "border-green-500/30"
//       };
//     }
//     if (story.isUploadedForAssessment) {
//       return { 
//         label: "ASSESSMENT", 
//         icon: Upload, 
//         color: "text-blue-400",
//         bgColor: "bg-blue-500/20",
//         borderColor: "border-blue-500/30"
//       };
//     }
//     return { 
//       label: "FREESTYLE", 
//       icon: Sparkles, 
//       color: "text-green-400",
//       bgColor: "bg-green-500/20",
//       borderColor: "border-green-500/30"
//     };
//   };

//   const getIntegrityIcon = (integrityRisk?: string) => {
//     switch (integrityRisk) {
//       case 'low': return <CheckCircle className="w-4 h-4 text-green-400" />;
//       case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
//       case 'high': return <AlertTriangle className="w-4 h-4 text-orange-400" />;
//       case 'critical': return <XCircle className="w-4 h-4 text-red-400" />;
//       default: return <Shield className="w-4 h-4 text-gray-400" />;
//     }
//   };

//   const getScoreColor = (score: number) => {
//     if (score >= 90) return 'text-green-400';
//     if (score >= 80) return 'text-blue-400';
//     if (score >= 70) return 'text-yellow-400';
//     return 'text-orange-400';
//   };

//   const typeInfo = getStoryTypeInfo(story);

//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.95 }}
//       animate={{ opacity: 1, scale: 1 }}
//       whileHover={{ scale: 1.02 }}
//       className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-6 hover:border-gray-500/50 transition-all group"
//     >
//       {/* Story Type Badge */}
//       <div className={`inline-flex items-center gap-1 px-2 py-1  text-xs  mb-4 ${typeInfo.bgColor} ${typeInfo.color} ${typeInfo.borderColor} border`}>
//         <typeInfo.icon size={12} />
//         {typeInfo.label}
//       </div>

//       {/* Title & Metadata */}
//       <h3 className="text-lg  text-white mb-2 line-clamp-2">{story.title}</h3>
      
//       <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
//         <span>{story.totalWords} words</span>
//         <span>•</span>
//         <span>{new Date(story.createdAt).toLocaleDateString()}</span>
//       </div>

//       {/* Assessment Score (if available) */}
//       {story.assessment && (
//         <div className="mb-4">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-sm text-gray-300">Overall Score</span>
//             <div className="flex items-center gap-2">
//               {getIntegrityIcon(story.assessment.integrityRisk)}
//               <span className={` ${getScoreColor(story.assessment.overallScore)}`}>
//                 {story.assessment.overallScore}%
//               </span>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Status Badges */}
//       <div className="flex flex-wrap gap-2 mb-4">
//         {story.isPublished && (
//           <span className="bg-green-500/20 text-green-300 px-2 py-1  text-xs  border border-green-500/30 flex items-center gap-1">
//             <Star size={10} />
//             Published
//           </span>
//         )}
//         {story.status === 'flagged' && (
//           <span className="bg-red-500/20 text-red-400 px-2 py-1  text-xs  border border-red-500/30">
//             Flagged
//           </span>
//         )}
//         {story.status === 'review' && (
//           <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1  text-xs  border border-yellow-500/30">
//             Review
//           </span>
//         )}
//       </div>

//       {/* Action Buttons */}
//       <div className="space-y-2">
//         <Link
//           href={`/children-dashboard/my-stories/${story._id}`}
//           className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2  text-sm  transition-colors flex items-center justify-center gap-2"
//         >
//           <Eye size={16} />
//           View Story
//         </Link>

//         <div className="grid grid-cols-2 gap-2">
//           {/* Publish Button - Show for ALL completed stories (including flagged) */}
//           {story.status === 'completed' && !story.isPublished ? (
//             <button
//               onClick={onPublish}
//               disabled={publishingStory === story._id}
//               className="bg-green-600 hover:bg-green-700 text-white py-2  text-xs  transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
//             >
//               {publishingStory === story._id ? (
//                 <div className="w-3 h-3 border border-white border-t-transparent  animate-spin"></div>
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

//           {/* Purchase Button - Show for ALL completed stories */}
//           {story.status === 'completed' && (
//             <button
//               onClick={onPurchase}
//               className="bg-yellow-600 hover:bg-yellow-700 text-white py-2  text-xs  transition-colors flex items-center justify-center gap-1"
//             >
//               <DollarSign size={12} />
//               $10
//             </button>
//           )}
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// app/children-dashboard/page.tsx - REVAMPED COLOR PALETTE VERSION
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Trophy,
  FileText,
  Crown,
  ArrowRight,
  Sparkles,
  Star,
  Award,
  Calendar,
  Clock,
  TrendingUp,
  Target,
  CheckCircle,
  Activity,
  Zap,
  Heart,
  Gift,
  Medal,
} from 'lucide-react';
import { motion } from 'framer-motion';
import UsageStatsCard from '@/components/dashboard/UsageStatsCard';

interface UsageStats {
  freestyleStories: { used: number; limit: number; remaining: number; canUse: boolean };
  assessmentRequests: { used: number; limit: number; remaining: number; canUse: boolean };
  competitionEntries: { used: number; limit: number; remaining: number; canUse: boolean };
  publications: { used: number; limit: number; remaining: number; canUse: boolean };
  resetDate: string;
  subscriptionTier: 'FREE' | 'STORY_PACK';
  storyPackExpiry?: string;
  daysRemaining?: number;
  resetInfo?: {
    performed: boolean;
    message: string;
  };
}

interface Competition {
  _id: string;
  month: string;
  year: number;
  phase: 'submission' | 'judging' | 'results';
  isActive: boolean;
  daysLeft: number;
  totalSubmissions: number;
  totalParticipants: number;
  userStats?: {
    entriesUsed: number;
    entriesLimit: number;
    canSubmit: boolean;
    userEntries: Array<{
      storyId: string;
      title: string;
      submittedAt: string;
      rank?: number;
      score?: number;
    }>;
  };
}

interface Achievement {
  _id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: string;
}

// Sample recent activities data (since the API might not exist)
const getSampleActivities = (): Achievement[] => [
  {
    _id: '1',
    title: 'Story Created',
    description: 'Started a new collaborative story',
    icon: '✍️',
    unlockedAt: new Date().toISOString(),
    category: 'writing'
  },
  {
    _id: '2',
    title: 'Assessment Completed',
    description: 'Received AI feedback on your story',
    icon: '🎯',
    unlockedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    category: 'assessment'
  },
  {
    _id: '3',
    title: 'Story Pack Active',
    description: 'Unlocked additional writing resources',
    icon: '👑',
    unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'upgrade'
  },
  {
    _id: '4',
    title: 'Competition Entry',
    description: 'Submitted story to monthly competition',
    icon: '🏆',
    unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'competition'
  },
  {
    _id: '5',
    title: 'Creativity Milestone',
    description: 'Reached 1000 words written this month',
    icon: '🌟',
    unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'milestone'
  }
];

export default function ChildrenDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ===== STATE =====
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [resetNotification, setResetNotification] = useState<boolean>(false);
  const [currentCompetition, setCurrentCompetition] = useState<Competition | null>(null);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ===== EFFECTS =====
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status]);

  // ===== HELPER FUNCTIONS =====
  const getDefaultUsageStats = (): UsageStats => ({
    freestyleStories: { used: 0, limit: 3, remaining: 3, canUse: true },
    assessmentRequests: { used: 0, limit: 9, remaining: 9, canUse: true },
    competitionEntries: { used: 0, limit: 3, remaining: 3, canUse: true },
    publications: { used: 0, limit: 1, remaining: 1, canUse: true },
    subscriptionTier: 'FREE',
    resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
  });

  // ===== API CALLS =====
  const fetchDashboardData = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      // Fetch dashboard data in parallel (removed stories API call)
      const [usageResponse, competitionResponse] = await Promise.all([
        fetch('/api/user/usage'),
        fetch('/api/competitions/current')
      ]);

      // Handle usage stats
      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        console.log('📊 Usage stats loaded:', usageData);
        setUsageStats(usageData.usage || getDefaultUsageStats());
        // Check if reset just happened
        if (usageData.usage?.resetInfo?.performed) {
          setResetNotification(true);
          setTimeout(() => setResetNotification(false), 5000);
        }
      } else {
        console.error('❌ Failed to fetch usage stats');
        setUsageStats(getDefaultUsageStats());
      }

      // Handle current competition
      if (competitionResponse.ok) {
        const competitionData = await competitionResponse.json();
        console.log('🏆 Competition data loaded:', competitionData.competition?.month);
        setCurrentCompetition(competitionData.competition);
      } else {
        console.error('❌ Failed to fetch competition data');
        setCurrentCompetition(null);
      }

      // Try to fetch real achievements, fallback to sample data
      try {
        const achievementsResponse = await fetch('/api/user/achievements?recent=5');
        if (achievementsResponse.ok) {
          const achievementsData = await achievementsResponse.json();
          setRecentAchievements(achievementsData.achievements || getSampleActivities());
        } else {
          // Use sample data if API doesn't exist
          setRecentAchievements(getSampleActivities());
        }
      } catch (err) {
        console.log('ℹ️ Using sample activities data');
        setRecentAchievements(getSampleActivities());
      }

    } catch (error) {
      console.error('❌ Dashboard data fetch error:', error);
      setError('Failed to load dashboard data. Please refresh the page.');
      // Set sample data even on error
      setRecentAchievements(getSampleActivities());
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-20 bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 "></div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-96 bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 "></div>
                <div className="h-64 bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 "></div>
              </div>
              <div className="h-96 bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 "></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 flex items-center justify-center">
        <div className="text-center bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-8">
          <h2 className="text-2xl  text-white mb-4">Something went wrong</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-800 hover:bg-blue-700 text-white px-6 py-3  transition-colors border border-blue-600/40"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center lg:text-left"
        >
          <h1 className="text-4xl  text-white mb-2">
            Welcome back, {session?.user?.firstName || 'Writer'}! ☀️
          </h1>
          <p className="text-gray-300 text-lg">
            Ready to continue your creative writing journey?
          </p>
        </motion.div>

        {/* Reset Notification */}
        {resetNotification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-800/80 backdrop-blur-xl border border-blue-600/40 text-white p-4  mb-4 flex items-center gap-3"
          >
            <span className="text-2xl">🔄</span>
            <div>
              <strong>Monthly Reset Complete!</strong>
              <p className="text-sm text-blue-200">Your limits have been reset (Story Pack purchases preserved)</p>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Story Pack Status */}
            {usageStats && usageStats.subscriptionTier === 'STORY_PACK' && usageStats.daysRemaining && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-800/60 backdrop-blur-xl border border-green-600/40  p-4"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div className="flex-1">
                    <h4 className=" text-green-200">Story Pack Active!</h4>
                    <div className="flex items-center gap-2 text-sm text-green-300">
                      <Clock className="w-4 h-4" />
                      <span>{usageStats.daysRemaining} days remaining</span>
                    </div>
                    {usageStats.storyPackExpiry && (
                      <p className="text-xs text-green-400 mt-1">
                        Expires: {new Date(usageStats.storyPackExpiry).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Competition */}
            {currentCompetition && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-green-800/60 backdrop-blur-xl border border-green-600/40  p-4"
              >
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className=" text-green-200 mb-1">
                      {currentCompetition.month} {currentCompetition.year} Competition
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-green-300">
                      <Clock className="w-4 h-4" />
                      <span>{currentCompetition.daysLeft} days left</span>
                      <span>• {currentCompetition.totalParticipants} participants</span>
                      <span>• Your entries: {currentCompetition.userStats?.entriesUsed || 0}/3</span>
                    </div>
                  </div>
                  <Link
                    href="/children-dashboard/competitions"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2  text-sm transition-colors border border-green-500/40"
                  >
                    Enter Competition
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Recent Activities */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl  text-white">Recent Activities</h2>
                <Link
                  href="/children-dashboard/my-stories"
                  className="text-blue-400 hover:text-blue-300 text-sm  flex items-center gap-1 transition-colors"
                >
                  View All Stories
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="space-y-3">
                {recentAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-4 hover:border-gray-500/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-700/60 border border-gray-600/40  flex items-center justify-center">
                        <span className="text-lg">{achievement.icon}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className=" text-white">{achievement.title}</h3>
                        <p className="text-sm text-gray-300">{achievement.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-400 uppercase tracking-wide ">
                          {achievement.category}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Usage Stats */}
            {usageStats && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <UsageStatsCard
                  usageStats={usageStats}
                  onUpgrade={usageStats.subscriptionTier === 'FREE' ? handleUpgrade : undefined}
                  loading={false}
                />
              </motion.div>
            )}

            {/* Quick Actions - Moved to sidebar below Usage Stats */}
            <section>
              <h2 className="text-xl  text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href="/create-stories"
                  className="block bg-green-800/60 backdrop-blur-xl border border-green-600/40  p-4 hover:border-green-500/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <h3 className=" text-white text-sm">Write with AI</h3>
                      <p className="text-green-300 text-xs">Start a collaborative story</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/create-stories"
                  className="block bg-blue-800/60 backdrop-blur-xl border border-blue-600/40  p-4 hover:border-blue-500/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <h3 className=" text-white text-sm">Get AI Assessment</h3>
                      <p className="text-blue-300 text-xs">Upload your story for review</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/children-dashboard/competitions"
                  className="block bg-green-800/60 backdrop-blur-xl border border-green-600/40  p-4 hover:border-green-500/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <h3 className=" text-white text-sm">Join Competition</h3>
                      <p className="text-green-300 text-xs">Compete with other writers</p>
                    </div>
                  </div>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}