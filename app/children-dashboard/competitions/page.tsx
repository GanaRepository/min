// // app/children-dashboard/competitions/page.tsx - COMPLETE UPDATED VERSION
// 'use client';

// import { useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { motion } from 'framer-motion';
// import {
//   Trophy,
//   Upload,
//   ArrowLeft,
//   Calendar,
//   Users,
//   FileText,
//   Star,
//   Award,
//   Clock,
//   CheckCircle,
//   DollarSign,
//   Sparkles,
//   AlertTriangle,
//   Eye,
//   BookOpen,
// } from 'lucide-react';

// interface Competition {
//   _id: string;
//   month: string;
//   year: number;
//   phase: 'submission' | 'judging' | 'results';
//   daysLeft: number;
//   totalSubmissions: number;
//   totalParticipants: number;
//   submissionDeadline: string;
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

// interface EligibleStory {
//   _id: string;
//   title: string;
//   wordCount: number;
//   createdAt: string;
//   isPublished: boolean;
//   competitionEligible: boolean;
//   assessment?: {
//     overallScore: number;
//     integrityAnalysis?: {
//       integrityRisk: 'low' | 'medium' | 'high' | 'critical';
//     };
//   };
// }

// export default function CompetitionsPage() {
//   const { data: session } = useSession();
//   const router = useRouter();
  
//   const [loading, setLoading] = useState(true);
//   const [currentCompetition, setCurrentCompetition] = useState<Competition | null>(null);
//   const [eligibleStories, setEligibleStories] = useState<EligibleStory[]>([]);
//   const [submitting, setSubmitting] = useState<string | null>(null);
//   const [publishingStory, setPublishingStory] = useState<string | null>(null);

//   useEffect(() => {
//     if (!session) {
//       router.push('/login/child');
//       return;
//     }
//     fetchCompetitionData();
//   }, [session]);

//   const fetchCompetitionData = async () => {
//     try {
//       setLoading(true);
      
//       // Fetch current competition
//       const competitionResponse = await fetch('/api/competitions/current');
//       if (competitionResponse.ok) {
//         const competitionData = await competitionResponse.json();
//         setCurrentCompetition(competitionData.competition);
//       }

//       // Fetch eligible stories
//       const storiesResponse = await fetch('/api/stories/eligible-for-competition');
//       if (storiesResponse.ok) {
//         const storiesData = await storiesResponse.json();
//         setEligibleStories(storiesData.stories || []);
//       }
//     } catch (error) {
//       console.error('Error fetching competition data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const submitToCompetition = async (storyId: string) => {
//     setSubmitting(storyId);
//     try {
//       const response = await fetch('/api/competitions/submit', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ storyId }),
//       });

//       if (response.ok) {
//         alert('Story submitted to competition successfully!');
//         fetchCompetitionData(); // Refresh data
//       } else {
//         const error = await response.json();
//         alert(error.error || 'Failed to submit story');
//       }
//     } catch (error) {
//       alert('Failed to submit story');
//     } finally {
//       setSubmitting(null);
//     }
//   };

//   const handlePublishStory = async (storyId: string, storyTitle: string) => {
//     if (!session?.user?.id) return;
    
//     setPublishingStory(storyId);
    
//     try {
//       const response = await fetch('/api/stripe/checkout', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           productType: 'story_publication',
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
//       console.error('Error initiating publication:', error);
//       alert('Failed to start publication process. Please try again.');
//     } finally {
//       setPublishingStory(null);
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
//         return <AlertTriangle className="w-4 h-4 text-red-400" />;
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

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 p-6">
//         <div className="max-w-6xl mx-auto">
//           <div className="flex items-center justify-center h-64">
//             <div className="text-lg text-white">Loading competitions...</div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 py-20">
//       <div className="max-w-6xl mx-auto px-6">
//         {/* Header */}
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

//           <div className="text-center">
//             <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
//               <Trophy size={40} className="text-purple-400" />
//               Writing Competitions
//             </h1>
//             <p className="text-gray-300 text-lg">
//               Showcase your stories and compete with young writers worldwide!
//             </p>
//           </div>
//         </motion.div>

//         {/* Competition Info Cards */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.1 }}
//           className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
//         >
//           <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-6 text-center">
//             <FileText className="w-8 h-8 text-blue-400 mx-auto mb-3" />
//             <h3 className="text-lg font-bold text-white mb-2">Free Entry</h3>
//             <p className="text-blue-300 text-sm">
//               Submit up to 3 stories per month for FREE! Competition participation is completely free.
//             </p>
//           </div>

//           <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-6 text-center">
//             <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-3" />
//             <h3 className="text-lg font-bold text-white mb-2">Publishing Fee</h3>
//             <p className="text-green-300 text-sm">
//               Optional $10 fee to publish your story in our Physical Book Anthology Collections.
//             </p>
//           </div>

//           <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-6 text-center">
//             <Award className="w-8 h-8 text-purple-400 mx-auto mb-3" />
//             <h3 className="text-lg font-bold text-white mb-2">AI Judging</h3>
//             <p className="text-purple-300 text-sm">
//               Fair and consistent evaluation across 16+ categories by advanced AI.
//             </p>
//           </div>
//         </motion.div>

//         {/* Current Competition */}
//         {currentCompetition && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-8 mb-8"
//           >
//             <div className="flex items-center justify-between mb-6">
//               <div>
//                 <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
//                   <Trophy className="text-yellow-400" />
//                   {currentCompetition.month} {currentCompetition.year} Competition
//                 </h2>
//                 <div className="flex items-center gap-6 text-gray-300">
//                   <span className="flex items-center gap-2">
//                     <Clock size={16} />
//                     {currentCompetition.daysLeft} days left
//                   </span>
//                   <span className="flex items-center gap-2">
//                     <Users size={16} />
//                     {currentCompetition.totalParticipants} participants
//                   </span>
//                   <span className="flex items-center gap-2">
//                     <FileText size={16} />
//                     {currentCompetition.totalSubmissions} submissions
//                   </span>
//                 </div>
//               </div>
              
//               <div className="text-center">
//                 <div className={`px-6 py-3 rounded-full text-lg font-bold ${
//                   currentCompetition.phase === 'submission' 
//                     ? 'bg-green-500/20 text-green-300 border border-green-500/30'
//                     : currentCompetition.phase === 'judging'
//                       ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
//                       : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
//                 }`}>
//                   {currentCompetition.phase === 'submission' ? '📝 Submissions Open' :
//                    currentCompetition.phase === 'judging' ? '⚖️ AI Judging' : '🏆 Results Available'}
//                 </div>
//               </div>
//             </div>

//             {/* User Stats */}
//             {currentCompetition.userStats && (
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//                 <div className="bg-gray-800/50 rounded-lg p-4 text-center">
//                   <div className="text-2xl font-bold text-white">
//                     {currentCompetition.userStats.entriesUsed}/{currentCompetition.userStats.entriesLimit}
//                   </div>
//                   <div className="text-sm text-gray-300">Your Entries This Month</div>
//                   <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
//                     <div
//                       className="bg-purple-400 h-2 rounded-full transition-all"
//                       style={{ width: `${(currentCompetition.userStats.entriesUsed / currentCompetition.userStats.entriesLimit) * 100}%` }}
//                     ></div>
//                   </div>
//                 </div>
                
//                 <div className="bg-gray-800/50 rounded-lg p-4 text-center">
//                   <div className="text-2xl font-bold text-white">
//                     {currentCompetition.userStats.entriesLimit - currentCompetition.userStats.entriesUsed}
//                   </div>
//                   <div className="text-sm text-gray-300">Entries Remaining</div>
//                 </div>
                
//                 <div className="bg-gray-800/50 rounded-lg p-4 text-center">
//                   <div className={`text-2xl font-bold ${currentCompetition.userStats.canSubmit ? 'text-green-400' : 'text-red-400'}`}>
//                     {currentCompetition.userStats.canSubmit ? '✓' : '✗'}
//                   </div>
//                   <div className="text-sm text-gray-300">
//                     {currentCompetition.userStats.canSubmit ? 'Can Submit' : 'Limit Reached'}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Phase-specific Content */}
//             {currentCompetition.phase === 'submission' && currentCompetition.userStats?.canSubmit && (
//               <div className="bg-gray-800/50 rounded-xl p-6">
//                 <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
//                   <Upload size={20} />
//                   Submit Your Stories
//                 </h3>
                
//                 {eligibleStories.length > 0 ? (
//                   <div className="grid gap-4">
//                     {eligibleStories.map((story) => (
//                       <div key={story._id} className="bg-gray-700/30 border border-gray-600/30 rounded-lg p-4">
//                         <div className="flex items-center justify-between">
//                           <div className="flex-1">
//                             <div className="flex items-center gap-3 mb-2">
//                               <h4 className="text-lg font-semibold text-white">{story.title}</h4>
//                               {story.assessment?.integrityAnalysis && (
//                                 <div className="flex items-center gap-1">
//                                   {getIntegrityIcon(story.assessment.integrityAnalysis.integrityRisk)}
//                                 </div>
//                               )}
//                             </div>
                            
//                             <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
//                               <span className="flex items-center gap-1">
//                                 <FileText size={14} />
//                                 {story.wordCount} words
//                               </span>
//                               <span className="flex items-center gap-1">
//                                 <Calendar size={14} />
//                                 {new Date(story.createdAt).toLocaleDateString()}
//                               </span>
//                               {story.assessment && (
//                                 <span className={`flex items-center gap-1 font-medium ${getScoreColor(story.assessment.overallScore)}`}>
//                                   <Star size={14} />
//                                   {story.assessment.overallScore}%
//                                 </span>
//                               )}
//                             </div>

//                             <div className="flex items-center gap-2">
//                               {story.isPublished ? (
//                                 <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-medium border border-green-500/30">
//                                   ✓ Published & Eligible
//                                 </span>
//                               ) : (
//                                 <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-xs font-medium border border-yellow-500/30">
//                                   ⚠ Needs Publishing
//                                 </span>
//                               )}
//                             </div>
//                           </div>

//                           <div className="flex flex-col gap-2 ml-4">
//                             {story.isPublished ? (
//                               <button
//                                 onClick={() => submitToCompetition(story._id)}
//                                 disabled={submitting === story._id}
//                                 className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
//                               >
//                                 {submitting === story._id ? (
//                                   <>
//                                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                                     Submitting...
//                                   </>
//                                 ) : (
//                                   <>
//                                     <Upload size={16} />
//                                     Submit
//                                   </>
//                                 )}
//                               </button>
//                             ) : (
//                               <button
//                                 onClick={() => handlePublishStory(story._id, story.title)}
//                                 disabled={publishingStory === story._id}
//                                 className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
//                               >
//                                 {publishingStory === story._id ? (
//                                   <>
//                                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                                     Publishing...
//                                   </>
//                                 ) : (
//                                   <>
//                                     <DollarSign size={16} />
//                                     Publish $10
//                                   </>
//                                 )}
//                               </button>
//                             )}

//                             <Link
//                               href={`/children-dashboard/my-stories/${story._id}`}
//                               className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
//                             >
//                               <Eye size={16} />
//                               View
//                             </Link>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="text-center py-8">
//                     <BookOpen size={48} className="mx-auto text-gray-500 mb-4" />
//                     <h4 className="text-lg font-semibold text-gray-300 mb-2">No eligible stories found</h4>
//                     <p className="text-sm text-gray-400 mb-4">
//                       You need completed stories to participate in competitions.
//                     </p>
//                     <Link 
//                       href="/create-stories"
//                       className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
//                     >
//                       <Sparkles size={20} />
//                       Create New Story
//                     </Link>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* User's Current Entries */}
//             {currentCompetition.userStats?.userEntries && currentCompetition.userStats.userEntries.length > 0 && (
//               <div className="bg-gray-800/50 rounded-xl p-6 mt-6">
//                 <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
//                   <Trophy size={20} />
//                   Your Submitted Stories
//                 </h3>
//                 <div className="space-y-3">
//                   {currentCompetition.userStats.userEntries.map((entry) => (
//                     <div key={entry.storyId} className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
//                       <div className="flex items-center justify-between">
//                         <div>
//                           <h4 className="text-lg font-semibold text-white">{entry.title}</h4>
//                           <p className="text-sm text-purple-300">
//                             Submitted: {new Date(entry.submittedAt).toLocaleDateString()}
//                           </p>
//                         </div>
//                         <div className="text-right">
//                           {entry.score && (
//                             <div className="text-xl font-bold text-purple-300">
//                               {entry.score}%
//                             </div>
//                           )}
//                           {entry.rank && (
//                             <div className="text-sm text-purple-300">
//                               Rank: #{entry.rank}
//                             </div>
//                           )}
//                           {!entry.score && !entry.rank && (
//                             <div className="text-sm text-gray-400">
//                               {currentCompetition.phase === 'judging' ? 'Being judged...' : 'Submitted'}
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Phase-specific Messages */}
//             {currentCompetition.phase === 'submission' && !currentCompetition.userStats?.canSubmit && (
//               <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
//                 <div className="flex items-center gap-2 text-yellow-300">
//                   <AlertTriangle size={20} />
//                   <span className="font-medium">Monthly limit reached</span>
//                 </div>
//                 <p className="text-yellow-200 mt-2">
//                   You've used all 3 entries for this month. Come back next month for more competition opportunities!
//                 </p>
//               </div>
//             )}

//             {currentCompetition.phase === 'judging' && (
//               <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
//                 <div className="flex items-center gap-2 text-blue-300">
//                   <Clock size={20} />
//                   <span className="font-medium">AI Judging in Progress</span>
//                 </div>
//                 <p className="text-blue-200 mt-2">
//                   Our advanced AI is evaluating all submissions. Results will be announced soon!
//                 </p>
//               </div>
//             )}

//             {currentCompetition.phase === 'results' && (
//               <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
//                 <div className="flex items-center gap-2 text-green-300">
//                   <Award size={20} />
//                   <span className="font-medium">Results Available!</span>
//                 </div>
//                 <p className="text-green-200 mt-2">
//                   Competition results are now available. Check your submitted stories for rankings and scores.
//                 </p>
//               </div>
//             )}
//           </motion.div>
//         )}

//         {/* How It Works */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.3 }}
//           className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8"
//         >
//           <h2 className="text-2xl font-bold text-white mb-6 text-center">How Competitions Work</h2>
          
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             <div className="text-center">
//               <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <span className="text-white font-bold text-2xl">1</span>
//               </div>
//               <h3 className="text-xl font-bold text-white mb-2">Submission Phase</h3>
//               <p className="text-green-300 text-sm mb-3">Days 1-25 of the month</p>
//               <ul className="text-gray-300 text-sm space-y-1">
//                 <li>• Submit up to 3 stories per month</li>
//                 <li>• Stories must be 350-2000 words</li>
//                 <li>• Optional $10 publication fee for anthology</li>
//                 <li>• All genres and themes welcome</li>
//               </ul>
//             </div>

//             <div className="text-center">
//               <div className="bg-yellow-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <span className="text-white font-bold text-2xl">2</span>
//               </div>
//               <h3 className="text-xl font-bold text-white mb-2">AI Judging</h3>
//               <p className="text-yellow-300 text-sm mb-3">Days 26-30 of the month</p>
//               <ul className="text-gray-300 text-sm space-y-1">
//                 <li>• Advanced AI evaluates all submissions</li>
//                 <li>• 16+ evaluation categories</li>
//                 <li>• Creativity & originality focus</li>
//                 <li>• Fair & consistent scoring</li>
//               </ul>
//             </div>

//             <div className="text-center">
//               <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <span className="text-white font-bold text-2xl">3</span>
//               </div>
//               <h3 className="text-xl font-bold text-white mb-2">Results</h3>
//               <p className="text-purple-300 text-sm mb-3">Last day of the month</p>
//               <ul className="text-gray-300 text-sm space-y-1">
//                 <li>• Top 3 winners announced</li>
//                 <li>• Digital certificates awarded</li>
//                 <li>• Annual anthology eligibility</li>
//                 <li>• Recognition on leaderboards</li>
//               </ul>
//             </div>
//           </div>
//         </motion.div>

//         {/* Call to Action */}
//         {(!currentCompetition || currentCompetition.phase !== 'submission' || !currentCompetition.userStats?.canSubmit) && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.4 }}
//             className="text-center mt-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-8"
//           >
//             <h3 className="text-2xl font-bold text-white mb-4">Ready to Compete?</h3>
//             <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
//               Create amazing stories and showcase your writing talent. Join thousands of young writers in our monthly competitions!
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <Link
//                 href="/create-stories"
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
//               >
//                 <Sparkles size={24} />
//                 Create Story
//               </Link>
//               <Link
//                 href="/children-dashboard/upload-story"
//                 className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
//               >
//                 <Upload size={24} />
//                 Upload Story
//               </Link>
//             </div>
//           </motion.div>
//         )}
//       </div>
//     </div>
//   );
// }

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Trophy, Upload, Clock, Star, Medal, Download, ArrowLeft, FileText, Plus, X } from 'lucide-react';
import Link from 'next/link';

interface Competition {
  _id: string;
  month: string;
  year: number;
  phase: 'submission' | 'judging' | 'results';
  daysLeft: number;
  totalSubmissions: number;
  totalParticipants: number;
  winners?: Array<{
    position: number;
    childId: string;
    childName: string;
    title: string;
    score: number;
  }>;
  userStats?: {
    entriesUsed: number;
    entriesLimit: number;
    canSubmit: boolean;
    userEntries: Array<{
      storyId: string;
      title: string;
      submittedAt: string;
      score?: number;
      rank?: number;
    }>;
  };
}

interface EligibleStory {
  _id: string;
  title: string;
  wordCount: number;
  createdAt: string;
  isEligible: boolean;
}

export default function CompetitionsPage() {
  const { data: session } = useSession();
  const [currentCompetition, setCurrentCompetition] = useState<Competition | null>(null);
  const [pastCompetitions, setPastCompetitions] = useState<Competition[]>([]);
  const [eligibleStories, setEligibleStories] = useState<EligibleStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  
  // File upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadContent, setUploadContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    fetchCompetitionData();
  }, []);

  const fetchCompetitionData = async () => {
    try {
      const currentResponse = await fetch('/api/competitions/current');
      const currentData = await currentResponse.json();
      setCurrentCompetition(currentData.competition);

      const pastResponse = await fetch('/api/competitions/past');
      const pastData = await pastResponse.json();
      setPastCompetitions(pastData.competitions || []);

      if (currentData.competition?.phase === 'submission') {
        const storiesResponse = await fetch('/api/stories/eligible-for-competition');
        const storiesData = await storiesResponse.json();
        setEligibleStories(storiesData.stories || []);
      }
    } catch (error) {
      console.error('Error fetching competition data:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitToCompetition = async (storyId: string) => {
    setSubmitting(storyId);
    try {
      const response = await fetch('/api/competitions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId })
      });

      if (response.ok) {
        alert('Story submitted successfully!');
        fetchCompetitionData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit story');
      }
    } catch (error) {
      alert('Failed to submit story');
    } finally {
      setSubmitting(null);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadTitle.trim()) {
      setUploadError('Please enter a story title');
      return;
    }

    if (!uploadContent.trim() && !uploadFile) {
      setUploadError('Please provide story content');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('title', uploadTitle.trim());
      
      if (uploadFile) {
        formData.append('file', uploadFile);
      } else {
        formData.append('content', uploadContent.trim());
      }

      const response = await fetch('/api/user/stories/upload-competition', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setShowUploadModal(false);
        setUploadTitle('');
        setUploadContent('');
        setUploadFile(null);
        setUploadError('');
        alert('Story uploaded and submitted to competition successfully!');
        fetchCompetitionData();
      } else {
        setUploadError(data.error || 'Upload failed');
      }
    } catch (error) {
      setUploadError('Failed to upload story');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
        setUploadError('Please upload a .txt file');
        return;
      }
      if (file.size > 1024 * 1024) {
        setUploadError('File size must be less than 1MB');
        return;
      }
      setUploadFile(file);
      setUploadError('');
      
      if (!uploadTitle) {
        const fileName = file.name.replace(/\.[^/.]+$/, '');
        setUploadTitle(fileName.replace(/[-_]/g, ' '));
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading competitions...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/children-dashboard" className="text-gray-100 hover:text-gray-800">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Writing Competitions</h1>
            <p className="text-gray-100">Showcase your stories and compete with young writers worldwide!</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-6 text-center">
            <FileText className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Free Entry</h3>
            <p className="text-blue-200 text-sm">
              Submit up to 3 stories per month for FREE! Competition participation is completely free.
            </p>
          </div>
          
          <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-6 text-center">
            <Trophy className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Publishing Fee</h3>
            <p className="text-green-200 text-sm">
              Optional $10 fee to publish your story in our Physical Book Anthology Collections.
            </p>
          </div>
          
          <div className="bg-purple-600/20 border border-purple-500/30 rounded-xl p-6 text-center">
            <Star className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">AI Judging</h3>
            <p className="text-purple-200 text-sm">
              Fair and consistent evaluation across 16+ categories by advanced AI.
            </p>
          </div>
        </div>

        {currentCompetition && (
          <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl p-6 text-white mb-6 shadow-xl border border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-8 h-8 text-yellow-300" />
                  <h2 className="text-2xl font-bold">
                    {currentCompetition.month} {currentCompetition.year} Competition
                  </h2>
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Submissions Open
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-700/20 rounded-lg p-3">
                    <div className="text-lg font-bold">
                      {currentCompetition.phase === 'submission' ? '📝 Submissions Open' :
                       currentCompetition.phase === 'judging' ? '⚖️ AI Judging' : '🏆 Results Available'}
                    </div>
                    <div className="text-sm text-purple-100">
                      {currentCompetition.daysLeft} days left
                    </div>
                  </div>
                  
                  <div className="bg-gray-700/20 rounded-lg p-3">
                    <div className="text-lg font-bold">
                      0/3
                    </div>
                    <div className="text-sm text-purple-100">Your entries</div>
                  </div>
                  
                  <div className="bg-gray-700/20 rounded-lg p-3">
                    <div className="text-lg font-bold">{currentCompetition.totalParticipants}</div>
                    <div className="text-sm text-purple-100">Total participants</div>
                  </div>
                </div>
              </div>
            </div>

            {currentCompetition.phase === 'submission' && (
              <div className="bg-gray-700/10 rounded-lg p-4 mt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Upload size={20} />
                  Submit Your Stories
                </h3>
                
                <div className="mb-4">
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Upload New Story for Competition
                  </button>
                </div>

                {eligibleStories.length > 0 ? (
                  <div>
                    <h4 className="text-sm font-medium mb-3 text-purple-200">Or submit existing stories:</h4>
                    <div className="grid gap-3">
                      {eligibleStories.map((story) => (
                        <div key={story._id} className="flex items-center justify-between bg-gray-700/20 rounded-lg p-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{story.title}</h4>
                            <p className="text-sm text-purple-100">
                              {story.wordCount} words • Created {new Date(story.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => submitToCompetition(story._id)}
                            disabled={submitting === story._id}
                            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                          >
                            {submitting === story._id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Submitting...
                              </>
                            ) : (
                              <>
                                <Upload size={16} />
                                Submit
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-purple-100 mb-2">No existing eligible stories found</p>
                    <p className="text-sm text-purple-200">Upload a new story above to participate!</p>
                  </div>
                )}
              </div>
            )}

            {currentCompetition.userStats?.userEntries && currentCompetition.userStats.userEntries.length > 0 && (
              <div className="bg-gray-700/10 rounded-lg p-4 mt-4">
                <h3 className="font-semibold mb-3">Your Submitted Stories</h3>
                <div className="space-y-2">
                  {currentCompetition.userStats.userEntries.map((entry) => (
                    <div key={entry.storyId} className="flex items-center justify-between bg-gray-700/20 rounded-lg p-3">
                      <div>
                        <h4 className="font-medium">{entry.title}</h4>
                        <p className="text-sm text-purple-100">
                          Submitted {new Date(entry.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {entry.score ? (
                          <div className="text-green-400 font-bold">{entry.score}%</div>
                        ) : (
                          <div className="text-yellow-400">Pending</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {pastCompetitions.length > 0 && (
          <div className="bg-gray-800/50 border border-gray-600/40 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Past Competitions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastCompetitions.map((competition) => (
                <div key={competition._id} className="bg-gray-700/30 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">
                    {competition.month} {competition.year}
                  </h3>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>Participants: {competition.totalParticipants}</div>
                    <div>Submissions: {competition.totalSubmissions}</div>
                    {competition.winners && competition.winners.length > 0 && (
                      <div className="mt-2">
                        <div className="text-yellow-400">Winner: {competition.winners[0].childName}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-600">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Upload Story for Competition</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-gray-300 font-medium mb-2">
                Story Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="Enter your story title..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                maxLength={100}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-300 font-medium mb-2">
                Upload File (.txt only)
              </label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".txt"
                  className="hidden"
                  id="competition-file-upload"
                />
                <label htmlFor="competition-file-upload" className="cursor-pointer">
                  {uploadFile ? (
                    <div className="text-green-400">
                      <FileText className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-medium">{uploadFile.name}</p>
                      <p className="text-sm text-gray-400">
                        {(uploadFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      <Upload className="w-8 h-8 mx-auto mb-2" />
                      <p>Click to upload .txt file</p>
                      <p className="text-sm">Maximum size: 1MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-300 font-medium mb-2">
                Or paste your story content:
              </label>
              <textarea
                value={uploadContent}
                onChange={(e) => setUploadContent(e.target.value)}
                placeholder="Paste your story here..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 h-32 resize-none"
              />
            </div>

            <div className="mb-6 bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
              <h4 className="text-blue-400 font-medium mb-2">Competition Requirements:</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Story must be 100-2000 words</li>
                <li>• Original content only (no plagiarism)</li>
                <li>• Appropriate for young audiences</li>
                <li>• File format: .txt only or paste content</li>
                <li>• Up to 3 submissions per month</li>
              </ul>
            </div>

            {uploadError && (
              <div className="mb-4 text-red-400 text-sm">{uploadError}</div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFileUpload}
                disabled={uploading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                {uploading ? 'Uploading...' : 'Upload & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}