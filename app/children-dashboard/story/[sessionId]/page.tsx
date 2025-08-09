// // 'use client';

// // import { useState, useEffect, useRef, useCallback } from 'react';
// // import { useSession } from 'next-auth/react';
// // import { useRouter } from 'next/navigation';
// // import { motion } from 'framer-motion';
// // import {
// //   ArrowLeft,
// //   Send,
// //   Save,
// //   Pause,
// //   CheckCircle,
// //   Sparkles,
// //   BookOpen,
// //   Target,
// //   Award,
// //   Brain,
// //   Zap,
// // } from 'lucide-react';
// // import { useToast } from '@/hooks/use-toast';
// // import WordCountValidator from '@/components/writing/WordCountValidator';
// // import AssessmentModal from '@/components/stories/AssessmentModal';

// // interface StorySession {
// //   _id: string;
// //   title: string;
// //   elements?: {
// //     genre?: string;
// //     character?: string;
// //     setting?: string;
// //     theme?: string;
// //     mood?: string;
// //     tone?: string;
// //   };
// //   currentTurn: number;
// //   totalWords: number;
// //   childWords: number;
// //   apiCallsUsed: number;
// //   maxApiCalls: number;
// //   status: 'active' | 'completed' | 'paused';
// //   aiOpening?: string;
// //   assessment?: any;
// //   assessmentAttempts: number;
// //   isUploadedForAssessment?: boolean;
// // }

// // interface Turn {
// //   _id: string;
// //   turnNumber: number;
// //   childInput: string;
// //   aiResponse: string;
// //   childWordCount: number;
// //   aiWordCount: number;
// // }

// // export default function StoryWritingPage({
// //   params,
// // }: {
// //   params: { sessionId: string };
// // }) {
// //   const { data: session, status } = useSession();
// //   const router = useRouter();
// //   const { toast } = useToast();
// //   const { sessionId } = params;

// //   const [storySession, setStorySession] = useState<StorySession | null>(null);
// //   const [turns, setTurns] = useState<Turn[]>([]);
// //   const storyTimelineRef = useRef<HTMLDivElement>(null);
// //   const [isLoading, setIsLoading] = useState(true);
// //   const [currentInput, setCurrentInput] = useState('');

// //   const [isValid, setIsValid] = useState(false);
// //   const [wordCount, setWordCount] = useState(0);
// //   const [isSubmitting, setIsSubmitting] = useState(false);
// //   const [isSaving, setIsSaving] = useState(false);
// //   const [showAssessment, setShowAssessment] = useState(false);
// //   const [assessment, setAssessment] = useState<any>(null);
// //   const [isLoadingAI, setIsLoadingAI] = useState(false);
// //   const [isAIGenerating, setIsAIGenerating] = useState(false);
// //   const [isSubmittingTurn, setIsSubmittingTurn] = useState(false);

// //   const maxTurns = 7; // Set maxTurns to 7 for freestyle only

// //   const pollForAIOpening = useCallback(
// //     (actualSessionId: string) => {
// //       setIsAIGenerating(true);

// //       toast({
// //         title: '🤖 AI Teacher is Preparing',
// //         description: 'Your story opening is being crafted...',
// //       });

// //       const pollInterval = setInterval(async () => {
// //         try {
// //           const response = await fetch(
// //             `/api/stories/session/${actualSessionId}`
// //           );
// //           const data = await response.json();

// //           if (data.session?.aiOpening) {
// //             setStorySession((prev) =>
// //               prev ? { ...prev, aiOpening: data.session.aiOpening } : null
// //             );
// //             setIsAIGenerating(false);
// //             clearInterval(pollInterval);

// //             toast({
// //               title: '✨ Story Opening Ready!',
// //               description: 'Your AI teacher has prepared your story opening!',
// //             });
// //           }
// //         } catch (error) {
// //           console.error('Error polling for AI opening:', error);
// //         }
// //       }, 3000);

// //       setTimeout(() => {
// //         clearInterval(pollInterval);
// //         if (isAIGenerating) {
// //           setIsAIGenerating(false);
// //           toast({
// //             title: '⏰ Taking Longer Than Expected',
// //             description:
// //               'You can start writing while AI prepares your opening.',
// //           });
// //         }
// //       }, 180000);
// //     },
// //     [toast, setIsAIGenerating, setStorySession, isAIGenerating]
// //   );

// //   const fetchStorySession = useCallback(async () => {
// //     try {
// //       console.log('Fetching story session:', sessionId);

// //       const response = await fetch(`/api/stories/session/${sessionId}`);
// //       const data = await response.json();

// //       if (!response.ok) {
// //         throw new Error(data.error || 'Failed to fetch story session');
// //       }

// //       setStorySession(data.session);

// //       if (data.session.status === 'paused') {
// //         const resumeResponse = await fetch(
// //           `/api/stories/session/${sessionId}/resume`,
// //           {
// //             method: 'POST',
// //           }
// //         );

// //         if (resumeResponse.ok) {
// //           const resumeData = await resumeResponse.json();
// //           setStorySession(resumeData.session);

// //           toast({
// //             title: '▶️ Story Resumed',
// //             description: 'Welcome back! Continue your adventure.',
// //           });
// //         }
// //       }

// //       fetchTurns(data.session._id);

// //       if (!data.session.aiOpening) {
// //         pollForAIOpening(data.session._id);
// //       }
// //     } catch (error) {
// //       console.error('Error fetching story session:', error);
// //       toast({
// //         title: '❌ Error',
// //         description: 'Failed to load story session. Please try again.',
// //         variant: 'destructive',
// //       });
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   }, [sessionId, toast, pollForAIOpening]);

// //   useEffect(() => {
// //     if (status === 'loading') return;

// //     if (!session || session.user.role !== 'child') {
// //       router.push('/login/child');
// //       return;
// //     }

// //     fetchStorySession();
// //   }, [session, status, fetchStorySession, router]);

// //   const fetchTurns = async (actualSessionId: string) => {
// //     try {
// //       const response = await fetch(
// //         `/api/stories/session/${actualSessionId}/turns`
// //       );
// //       const data = await response.json();

// //       if (response.ok) {
// //         setTurns(data.turns || []);
// //       } else {
// //         console.error('Failed to fetch turns:', data.error);
// //       }
// //     } catch (error) {
// //       console.error('Error fetching turns:', error);
// //     }
// //   };

// //   const fetchAssessment = async () => {
// //     if (!storySession) return;

// //     setIsLoadingAI(true);

// //     try {
// //       console.log('🎯 Fetching assessment for session:', storySession._id);

// //       let response = await fetch(
// //         `/api/stories/session/${storySession._id}/assessment`
// //       );
// //       let data = await response.json();

// //       if (response.ok && data.assessment) {
// //         console.log('✅ Found existing assessment:', data.assessment);
// //         setAssessment(data.assessment);
// //         setShowAssessment(true);

// //         toast({
// //           title: '📊 Assessment Ready!',
// //           description: 'Your story has been evaluated!',
// //         });
// //       } else if (response.status === 404) {
// //         console.log('🔄 No assessment found, generating new one...');
// //         const generateResponse = await fetch(
// //           `/api/stories/assess/${storySession._id}`,
// //           {
// //             method: 'POST',
// //           }
// //         );

// //         const generateData = await generateResponse.json();

// //         if (generateResponse.ok && generateData.assessment) {
// //           console.log('✅ Generated new assessment:', generateData.assessment);
// //           setAssessment(generateData.assessment);
// //           setShowAssessment(true);

// //           toast({
// //             title: '🎉 Assessment Complete!',
// //             description: 'Your story has been evaluated!',
// //           });
// //         } else {
// //           throw new Error(
// //             generateData.error || 'Failed to generate assessment'
// //           );
// //         }
// //       } else {
// //         throw new Error(data.error || 'Failed to fetch assessment');
// //       }
// //     } catch (error) {
// //       console.error('❌ Error fetching assessment:', error);
// //       toast({
// //         title: '❌ Assessment Error',
// //         description:
// //           error instanceof Error ? error.message : 'Could not load assessment',
// //         variant: 'destructive',
// //       });
// //     } finally {
// //       setIsLoadingAI(false);
// //     }
// //   };

// //   const handleSubmitTurn = async () => {
// //     if (!storySession || !currentInput.trim()) return;

// //     setIsSubmittingTurn(true);
// //     setIsLoadingAI(true);

// //     try {
// //       const response = await fetch('/api/stories/ai-respond', {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify({
// //           sessionId: storySession._id,
// //           childInput: currentInput.trim(),
// //           turnNumber: storySession.currentTurn,
// //         }),
// //       });

// //       const data = await response.json();

// //       if (response.ok) {
// //         // Update session state
// //         setStorySession((prev) =>
// //           prev
// //             ? {
// //                 ...prev,
// //                 currentTurn: data.session.currentTurn,
// //                 totalWords: data.session.totalWords,
// //                 childWords: data.session.childWords,
// //                 apiCallsUsed: data.session.apiCallsUsed,
// //                 status: data.session.status,
// //               }
// //             : null
// //         );

// //         // Add the new turn to the turns array
// //         setTurns((prev) => [...prev, data.turn]);

// //         setCurrentInput(''); // Clear input after successful submission

// //         toast({
// //           title: '✨ Turn Added!',
// //           description: 'AI is responding to your story...',
// //         });

// //         // If story is complete and assessment was generated
// //         if (data.assessment) {
// //           setAssessment(data.assessment);
// //           setTimeout(() => {
// //             setShowAssessment(true);
// //           }, 1000);
// //         }
// //       } else {
// //         throw new Error(data.error || 'Failed to submit turn');
// //       }
// //     } catch (error) {
// //       console.error('Error submitting turn:', error);
// //       toast({
// //         title: '❌ Error',
// //         description: 'Failed to submit your writing. Please try again.',
// //         variant: 'destructive',
// //       });
// //     } finally {
// //       setIsSubmittingTurn(false);
// //       setIsLoadingAI(false);
// //     }
// //   };

// //   const handleSaveDraft = async () => {
// //     if (!storySession || !currentInput.trim()) return;

// //     setIsSaving(true);

// //     try {
// //       const response = await fetch(
// //         `/api/stories/session/${storySession._id}/draft`,
// //         {
// //           method: 'POST',
// //           headers: {
// //             'Content-Type': 'application/json',
// //           },
// //           body: JSON.stringify({
// //             draftContent: currentInput.trim(),
// //             turnNumber: storySession.currentTurn,
// //           }),
// //         }
// //       );

// //       if (!response.ok) {
// //         throw new Error('Failed to save draft');
// //       }

// //       toast({
// //         title: '💾 Draft Saved!',
// //         description: 'Your progress has been saved.',
// //       });
// //     } catch (error) {
// //       console.error('Error saving draft:', error);
// //       toast({
// //         title: '❌ Save Error',
// //         description: 'Failed to save draft. Please try again.',
// //         variant: 'destructive',
// //       });
// //     } finally {
// //       setIsSaving(false);
// //     }
// //   };

// //   const handlePauseStory = async () => {
// //     if (!storySession) return;

// //     setIsSaving(true);

// //     try {
// //       const response = await fetch(
// //         `/api/stories/session/${storySession._id}/pause`,
// //         {
// //           method: 'POST',
// //         }
// //       );

// //       if (!response.ok) {
// //         throw new Error('Failed to pause story');
// //       }

// //       toast({
// //         title: '⏸️ Story Paused',
// //         description: 'You can continue anytime!',
// //       });

// //       router.push('/children-dashboard/my-stories');
// //     } catch (error) {
// //       console.error('Error pausing story:', error);
// //       toast({
// //         title: '❌ Error',
// //         description: 'Failed to pause story. Please try again.',
// //         variant: 'destructive',
// //       });
// //     } finally {
// //       setIsSaving(false);
// //     }
// //   };

// //   useEffect(() => {
// //     if (storyTimelineRef.current) {
// //       storyTimelineRef.current.scrollTop =
// //         storyTimelineRef.current.scrollHeight;
// //     }
// //   }, [turns]);

// //   if (status === 'loading' || isLoading) {
// //     return (
// //       <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
// //         <div className="text-white text-center">
// //           <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
// //           <p>Loading your story...</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   if (!session || session.user.role !== 'child' || !storySession) {
// //     return null;
// //   }

// //   const progressPercentage = ((storySession.currentTurn - 1) / maxTurns) * 100;

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white">
// //       {/* Header */}
// //       <div className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-600/40 sticky top-0 z-10">
// //         <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
// //           <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-8 sm:pt-16 lg:pt-20">
// //             <button
// //               onClick={() => router.push('/children-dashboard/my-stories')}
// //               className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors text-sm sm:text-base"
// //             >
// //               <ArrowLeft className="w-5 h-5" />
// //               <span>Back to Stories</span>
// //             </button>

// //             <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-4">
// //               <div className="text-xs sm:text-sm text-gray-300">
// //                 Turn {storySession.currentTurn} of {maxTurns}
// //               </div>
// //               <div className="w-full sm:w-32 bg-gray-700 rounded-full h-2 sm:h-3 overflow-hidden">
// //                 <motion.div
// //                   className="bg-gradient-to-r from-blue-500 to-green-500 h-2 sm:h-3 rounded-full transition-all duration-500"
// //                   initial={{ width: 0 }}
// //                   animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
// //                 />
// //               </div>
// //               <div className="text-xs sm:text-sm text-gray-300">
// //                 {storySession.apiCallsUsed}/{storySession.maxApiCalls} AI calls
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Main Content */}
// //       <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
// //         <motion.div
// //           initial={{ opacity: 0, y: 20 }}
// //           animate={{ opacity: 1, y: 0 }}
// //           className="mb-6 sm:mb-8"
// //         >
// //           <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 break-words">
// //             {storySession.title}
// //           </h1>

// //           <div className="flex flex-wrap gap-1 sm:gap-2">
// //             {storySession.elements &&
// //               Object.entries(storySession.elements)
// //                 .filter(([type, value]) => value && value.trim() !== '')
// //                 .map(([type, value]) => (
// //                   <span
// //                     key={type}
// //                     className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-xs sm:text-sm text-white capitalize"
// //                   >
// //                     {type}: {value}
// //                   </span>
// //                 ))}

// //             {(!storySession.elements ||
// //               Object.entries(storySession.elements).every(
// //                 ([_, value]) => !value || value.trim() === ''
// //               )) && (
// //               <span className="px-3 py-1 bg-gray-500/20 border border-gray-500/30 rounded-full text-sm text-gray-300 italic">
// //                 ✨ Freeform Story
// //               </span>
// //             )}
// //           </div>
// //         </motion.div>

// //         <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:gap-8">
// //           <div
// //             className="xl:col-span-8 space-y-4 sm:space-y-6 h-[60vh] sm:h-[68rem] overflow-y-auto scrollbar-thin scrollbar-track-gray-700/30 scrollbar-thumb-emerald-500 hover:scrollbar-thumb-emerald-400 scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
// //             ref={storyTimelineRef}
// //           >
// //             <h2 className="text-lg sm:text-xl font-semibold flex items-center">
// //               <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-400" />
// //               Story So Far
// //             </h2>

// //             <div className="space-y-6">
// //               {storySession && (
// //                 <div className="mb-6">
// //                   {isAIGenerating ? (
// //                     <motion.div
// //                       initial={{ opacity: 0, y: 20 }}
// //                       animate={{ opacity: 1, y: 0 }}
// //                       className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 sm:p-6"
// //                     >
// //                       <div className="flex items-center space-x-3 mb-4">
// //                         <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
// //                           <motion.div
// //                             animate={{ rotate: 360 }}
// //                             transition={{
// //                               duration: 2,
// //                               repeat: Infinity,
// //                               ease: 'linear',
// //                             }}
// //                             className="text-lg"
// //                           >
// //                             🤖
// //                           </motion.div>
// //                         </div>
// //                         <div>
// //                           <h3 className="font-semibold text-blue-400">
// //                             AI Teacher
// //                           </h3>
// //                           <p className="text-sm text-blue-300">
// //                             Preparing your story opening...
// //                           </p>
// //                         </div>
// //                       </div>

// //                       <div className="space-y-2">
// //                         <div className="flex items-center space-x-2">
// //                           <motion.div
// //                             className="w-2 h-2 bg-blue-400 rounded-full"
// //                             animate={{ opacity: [0.3, 1, 0.3] }}
// //                             transition={{ duration: 1.5, repeat: Infinity }}
// //                           />
// //                           <span className="text-blue-300 text-sm">
// //                             Analyzing your story elements
// //                           </span>
// //                         </div>
// //                         <div className="flex items-center space-x-2">
// //                           <motion.div
// //                             className="w-2 h-2 bg-blue-400 rounded-full"
// //                             animate={{ opacity: [0.3, 1, 0.3] }}
// //                             transition={{
// //                               duration: 1.5,
// //                               repeat: Infinity,
// //                               delay: 0.5,
// //                             }}
// //                           />
// //                           <span className="text-blue-300 text-sm">
// //                             Crafting the perfect opening
// //                           </span>
// //                         </div>
// //                         <div className="flex items-center space-x-2">
// //                           <motion.div
// //                             className="w-2 h-2 bg-blue-400 rounded-full"
// //                             animate={{ opacity: [0.3, 1, 0.3] }}
// //                             transition={{
// //                               duration: 1.5,
// //                               repeat: Infinity,
// //                               delay: 1,
// //                             }}
// //                           />
// //                           <span className="text-blue-300 text-sm">
// //                             Almost ready...
// //                           </span>
// //                         </div>
// //                       </div>

// //                       <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-500/20 rounded-lg">
// //                         <p className="text-sm text-blue-200">
// //                           💡 <strong>Tip:</strong> You can explore your story
// //                           elements below while the AI prepares your opening!
// //                         </p>
// //                       </div>
// //                     </motion.div>
// //                   ) : storySession.aiOpening ? (
// //                     <motion.div
// //                       initial={{ opacity: 0, scale: 0.95 }}
// //                       animate={{ opacity: 1, scale: 1 }}
// //                       className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 sm:p-6"
// //                     >
// //                       <div className="flex items-center space-x-3 mb-4">
// //                         <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-lg">
// //                           🤖
// //                         </div>
// //                         <div>
// //                           <h3 className="font-semibold text-purple-400">
// //                             {'Your Story Opening'}
// //                           </h3>
// //                         </div>
// //                       </div>
// //                       <p className="text-white leading-relaxed">
// //                         {storySession.aiOpening}
// //                       </p>
// //                     </motion.div>
// //                   ) : null}
// //                 </div>
// //               )}

// //               {turns.map((turn, index) => (
// //                 <motion.div
// //                   key={turn._id}
// //                   initial={{ opacity: 0, y: 20 }}
// //                   animate={{ opacity: 1, y: 0 }}
// //                   transition={{ delay: index * 0.1 }}
// //                   className="space-y-3 sm:space-y-4"
// //                 >
// //                   <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 sm:p-6">
// //                     <div className="flex items-center justify-between mb-3">
// //                       <div className="flex items-center">
// //                         <Target className="w-5 h-5 text-green-400 mr-2" />
// //                         <span className="text-green-300 font-medium">
// //                           Your Turn {turn.turnNumber}
// //                         </span>
// //                       </div>
// //                       <span className="text-green-300 text-sm">
// //                         {turn.childWordCount} words
// //                       </span>
// //                     </div>
// //                     <p className="text-gray-100 leading-relaxed">
// //                       {turn.childInput}
// //                     </p>
// //                   </div>

// //                   <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-4 sm:p-6">
// //                     <div className="flex items-center justify-between mb-3">
// //                       <div className="flex items-center">
// //                         <Brain className="w-5 h-5 text-blue-400 mr-2" />
// //                         <span className="text-blue-300 font-medium">
// //                           AI Teacher Response
// //                         </span>
// //                       </div>
// //                       <span className="text-blue-300 text-sm">
// //                         {turn.aiWordCount} words
// //                       </span>
// //                     </div>
// //                     <p className="text-gray-100 leading-relaxed">
// //                       {turn.aiResponse}
// //                     </p>
// //                   </div>
// //                 </motion.div>
// //               ))}

// //               {isLoadingAI && (
// //                 <motion.div
// //                   initial={{ opacity: 0, scale: 0.9 }}
// //                   animate={{ opacity: 1, scale: 1 }}
// //                   className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-xl p-4 sm:p-6"
// //                 >
// //                   <div className="flex items-center justify-center space-x-3">
// //                     <div className="w-6 h-6 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
// //                     <span className="text-purple-300 font-medium">
// //                       AI Teacher is thinking...
// //                     </span>
// //                   </div>
// //                   <p className="text-center text-gray-300 text-sm mt-2">
// //                     Creating an educational response to your wonderful writing!
// //                   </p>
// //                 </motion.div>
// //               )}
// //             </div>
// //           </div>

// //           <div className="xl:col-span-4 space-y-4 sm:space-y-6 mt-6 xl:mt-0">
// //             {storySession.status === 'completed' ? (
// //               <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-6 sm:p-8 text-center">
// //                 <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
// //                 <h3 className="text-xl sm:text-2xl font-bold text-green-300 mb-2">
// //                   Story Complete! 🎉
// //                 </h3>
// //                 <p className="text-gray-300 mb-4 sm:mb-6">
// //                   Congratulations! You&apos;ve finished your{' '}
// //                   {storySession.childWords}-word adventure.
// //                 </p>
// //                 <button
// //                   onClick={fetchAssessment}
// //                   disabled={isLoadingAI}
// //                   className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold flex items-center space-x-2 mx-auto disabled:cursor-not-allowed text-sm sm:text-base"
// //                 >
// //                   {isLoadingAI ? (
// //                     <>
// //                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
// //                       <span>Loading...</span>
// //                     </>
// //                   ) : (
// //                     <>
// //                       <Award className="w-5 h-5" />
// //                       <span>View Assessment</span>
// //                     </>
// //                   )}
// //                 </button>
// //               </div>
// //             ) : (
// //               <>
// //                 <WordCountValidator
// //                   value={currentInput}
// //                   onChange={setCurrentInput}
// //                   turnNumber={storySession.currentTurn}
// //                   onValidationChange={(valid, count) => {
// //                     setIsValid(valid);
// //                     setWordCount(count);
// //                   }}
// //                   disabled={isSubmittingTurn || isLoadingAI}
// //                 />

// //                 <div className="flex flex-col gap-3 sm:gap-4">
// //                   <motion.button
// //                     whileHover={{ scale: 1.02 }}
// //                     whileTap={{ scale: 0.98 }}
// //                     onClick={handleSubmitTurn}
// //                     disabled={!isValid || isSubmittingTurn || isLoadingAI}
// //                     className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 sm:space-x-3 transition-all disabled:cursor-not-allowed text-sm sm:text-base"
// //                   >
// //                     {isSubmittingTurn || isLoadingAI ? (
// //                       <>
// //                         <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
// //                         <span>
// //                           {isLoadingAI ? 'AI Thinking...' : 'Submitting...'}
// //                         </span>
// //                       </>
// //                     ) : (
// //                       <>
// //                         <Send className="w-5 h-5" />
// //                         <span>
// //                           {storySession.currentTurn === maxTurns
// //                             ? 'Complete Story'
// //                             : 'Submit Turn'}
// //                         </span>
// //                       </>
// //                     )}
// //                   </motion.button>

// //                   <div className="grid grid-cols-2 gap-2 sm:gap-3">
// //                     <button
// //                       onClick={handleSaveDraft}
// //                       disabled={!currentInput.trim() || isSaving}
// //                       className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-medium flex items-center justify-center space-x-1 sm:space-x-2 transition-colors disabled:cursor-not-allowed text-xs sm:text-sm"
// //                     >
// //                       {isSaving ? (
// //                         <>
// //                           <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
// //                           <span>Saving...</span>
// //                         </>
// //                       ) : (
// //                         <>
// //                           <Save className="w-4 h-4" />
// //                           <span>Save Draft</span>
// //                         </>
// //                       )}
// //                     </button>

// //                     <button
// //                       onClick={handlePauseStory}
// //                       disabled={isSaving}
// //                       className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-medium flex items-center justify-center space-x-1 sm:space-x-2 transition-colors disabled:cursor-not-allowed text-xs sm:text-sm"
// //                     >
// //                       <Pause className="w-4 h-4" />
// //                       <span>Pause</span>
// //                     </button>
// //                   </div>
// //                 </div>
// //               </>
// //             )}

// //             <div className="bg-gray-800/50 border border-gray-600/50 rounded-xl p-4 sm:p-6">
// //               <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
// //                 <Zap className="w-5 h-5 mr-2 text-yellow-400" />
// //                 Story Progress
// //               </h3>

// //               <div className="grid grid-cols-2 gap-2 sm:gap-4">
// //                 <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 sm:p-4 text-center">
// //                   <div className="text-lg sm:text-2xl font-bold text-white">
// //                     {storySession.childWords}
// //                   </div>
// //                   <div className="text-blue-300 text-xs sm:text-sm">
// //                     Your Words
// //                   </div>
// //                 </div>

// //                 <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 sm:p-4 text-center">
// //                   <div className="text-lg sm:text-2xl font-bold text-white">
// //                     {storySession.totalWords}
// //                   </div>
// //                   <div className="text-green-300 text-xs sm:text-sm">
// //                     Total Words
// //                   </div>
// //                 </div>

// //                 <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 sm:p-4 text-center">
// //                   <div className="text-lg sm:text-2xl font-bold text-white">
// //                     {storySession.currentTurn}/{maxTurns}
// //                   </div>
// //                   <div className="text-purple-300 text-xs sm:text-sm">
// //                     Current Turn
// //                   </div>
// //                 </div>

// //                 <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3 sm:p-4 text-center">
// //                   <div className="text-lg sm:text-2xl font-bold text-white">
// //                     {storySession.apiCallsUsed}/{storySession.maxApiCalls}
// //                   </div>
// //                   <div className="text-orange-300 text-xs sm:text-sm">
// //                     AI Calls Used
// //                   </div>
// //                 </div>
// //               </div>

// //               <div className="mt-4 sm:mt-6 flex items-center justify-center">
// //                 <div className="relative w-20 h-20 sm:w-24 sm:h-24">
// //                   <svg
// //                     className="w-20 h-20 sm:w-24 sm:h-24 transform -rotate-90"
// //                     viewBox="0 0 100 100"
// //                   >
// //                     <circle
// //                       cx="50"
// //                       cy="50"
// //                       r="40"
// //                       stroke="currentColor"
// //                       strokeWidth="8"
// //                       fill="transparent"
// //                       className="text-gray-700"
// //                     />
// //                     <motion.circle
// //                       cx="50"
// //                       cy="50"
// //                       r="40"
// //                       stroke="currentColor"
// //                       strokeWidth="8"
// //                       fill="transparent"
// //                       strokeDasharray={`${progressPercentage * 2.51} 251`}
// //                       className="text-green-400"
// //                       initial={{ strokeDasharray: '0 251' }}
// //                       animate={{
// //                         strokeDasharray: `${progressPercentage * 2.51} 251`,
// //                       }}
// //                       transition={{ duration: 1, ease: 'easeInOut' }}
// //                     />
// //                   </svg>
// //                   <div className="absolute inset-0 flex items-center justify-center">
// //                     <span className="text-base sm:text-lg font-bold text-white">
// //                       {Math.round(progressPercentage)}%
// //                     </span>
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       <AssessmentModal
// //         isOpen={showAssessment}
// //         onClose={() => setShowAssessment(false)}
// //         storySession={storySession}
// //         turns={turns}
// //         assessment={assessment}
// //       />

// //       <style jsx global>{`
// //         .scrollbar-thin::-webkit-scrollbar {
// //           width: 8px;
// //         }

// //         .scrollbar-track-gray-700\/30::-webkit-scrollbar-track {
// //           background: rgba(55, 65, 81, 0.3);
// //           border-radius: 4px;
// //         }

// //         .scrollbar-thumb-emerald-500::-webkit-scrollbar-thumb {
// //           background: linear-gradient(to bottom, #10b981, #059669);
// //           border-radius: 4px;
// //           border: 1px solid rgba(255, 255, 255, 0.1);
// //         }

// //         .hover\\:scrollbar-thumb-emerald-400::-webkit-scrollbar-thumb:hover {
// //           background: linear-gradient(to bottom, #34d399, #10b981);
// //         }

// //         .scrollbar-thumb-rounded-full::-webkit-scrollbar-thumb {
// //           border-radius: 9999px;
// //         }

// //         .scrollbar-track-rounded-full::-webkit-scrollbar-track {
// //           border-radius: 9999px;
// //         }

// //         .scrollbar-thin {
// //           scrollbar-width: thin;
// //           scrollbar-color: #10b981 rgba(55, 65, 81, 0.3);
// //         }
// //       `}</style>
// //     </div>
// //   );
// // }


// // app/children-dashboard/story/[sessionId]/page.tsx - MINIMAL TITLE EDIT ADDITION
// 'use client';

// import { useState, useEffect, useRef, useCallback } from 'react';
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
// import { motion } from 'framer-motion';
// import {
//   ArrowLeft,
//   Send,
//   Save,
//   Pause,
//   CheckCircle,
//   Sparkles,
//   BookOpen,
//   Target,
//   Award,
//   Brain,
//   Zap,
//   Edit3,  // ADD THIS
//   Check,  // ADD THIS
//   X,      // ADD THIS
// } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';
// import WordCountValidator from '@/components/writing/WordCountValidator';
// import AssessmentModal from '@/components/stories/AssessmentModal';

// interface StorySession {
//   _id: string;
//   title: string;
//   elements?: {
//     genre?: string;
//     character?: string;
//     setting?: string;
//     theme?: string;
//     mood?: string;
//     tone?: string;
//   };
//   currentTurn: number;
//   totalWords: number;
//   childWords: number;
//   apiCallsUsed: number;
//   maxApiCalls: number;
//   status: 'active' | 'completed' | 'paused';
//   aiOpening?: string;
//   assessment?: any;
//   assessmentAttempts: number;
//   isUploadedForAssessment?: boolean;
// }

// interface Turn {
//   _id: string;
//   turnNumber: number;
//   childInput: string;
//   aiResponse: string;
//   childWordCount: number;
//   aiWordCount: number;
// }

// export default function StoryWritingPage({
//   params,
// }: {
//   params: { sessionId: string };
// }) {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const { toast } = useToast();
//   const { sessionId } = params;

//   const [storySession, setStorySession] = useState<StorySession | null>(null);
//   const [turns, setTurns] = useState<Turn[]>([]);
//   const storyTimelineRef = useRef<HTMLDivElement>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [currentInput, setCurrentInput] = useState('');

//   const [isValid, setIsValid] = useState(false);
//   const [wordCount, setWordCount] = useState(0);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [showAssessment, setShowAssessment] = useState(false);
//   const [assessment, setAssessment] = useState<any>(null);
//   const [isLoadingAI, setIsLoadingAI] = useState(false);
//   const [isAIGenerating, setIsAIGenerating] = useState(false);
//   const [isSubmittingTurn, setIsSubmittingTurn] = useState(false);

//   // ADD THESE TITLE EDITING STATES
//   const [isEditingTitle, setIsEditingTitle] = useState(false);
//   const [editedTitle, setEditedTitle] = useState('');
//   const [isSavingTitle, setIsSavingTitle] = useState(false);
//   const titleInputRef = useRef<HTMLInputElement>(null);

//   const maxTurns = 7;

//   // ADD THIS USEEFFECT FOR TITLE INPUT FOCUS
//   useEffect(() => {
//     if (isEditingTitle && titleInputRef.current) {
//       titleInputRef.current.focus();
//       titleInputRef.current.select();
//     }
//   }, [isEditingTitle]);

//   // ADD THESE TITLE EDITING FUNCTIONS
//   const startEditingTitle = () => {
//     setIsEditingTitle(true);
//     setEditedTitle(storySession?.title || '');
//   };

//   const cancelEditingTitle = () => {
//     setIsEditingTitle(false);
//     setEditedTitle(storySession?.title || '');
//   };

//   const saveTitle = async () => {
//     if (!storySession || !editedTitle.trim()) return;

//     setIsSavingTitle(true);

//     try {
//       const response = await fetch(`/api/stories/session/${storySession._id}/update-title`, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           title: editedTitle.trim(),
//         }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setStorySession(prev => prev ? { ...prev, title: data.title } : null);
//         setIsEditingTitle(false);
        
//         toast({
//           title: '✅ Title Updated',
//           description: 'Your story title has been saved!',
//         });
//       } else {
//         throw new Error('Failed to update title');
//       }
//     } catch (error) {
//       console.error('Error updating title:', error);
//       toast({
//         title: '❌ Error',
//         description: 'Failed to update title. Please try again.',
//         variant: 'destructive',
//       });
//     } finally {
//       setIsSavingTitle(false);
//     }
//   };

//   const handleTitleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter') {
//       saveTitle();
//     } else if (e.key === 'Escape') {
//       cancelEditingTitle();
//     }
//   };

//   const pollForAIOpening = useCallback(
//     (actualSessionId: string) => {
//       setIsAIGenerating(true);

//       toast({
//         title: '🤖 AI Teacher is Preparing',
//         description: 'Your story opening is being crafted...',
//       });

//       const pollInterval = setInterval(async () => {
//         try {
//           const response = await fetch(
//             `/api/stories/session/${actualSessionId}`
//           );
//           const data = await response.json();

//           if (data.session?.aiOpening) {
//             setStorySession((prev) =>
//               prev ? { ...prev, aiOpening: data.session.aiOpening } : null
//             );
//             setIsAIGenerating(false);
//             clearInterval(pollInterval);

//             toast({
//               title: '✨ Story Opening Ready!',
//               description: 'Your AI teacher has prepared your story opening!',
//             });
//           }
//         } catch (error) {
//           console.error('Error polling for AI opening:', error);
//         }
//       }, 3000);

//       setTimeout(() => {
//         clearInterval(pollInterval);
//         if (isAIGenerating) {
//           setIsAIGenerating(false);
//           toast({
//             title: '⏰ Taking Longer Than Expected',
//             description:
//               'You can start writing while AI prepares your opening.',
//           });
//         }
//       }, 180000);
//     },
//     [toast, setIsAIGenerating, setStorySession, isAIGenerating]
//   );

//   const fetchStorySession = useCallback(async () => {
//     try {
//       console.log('Fetching story session:', sessionId);

//       const response = await fetch(`/api/stories/session/${sessionId}`);
//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to fetch story session');
//       }

//       setStorySession(data.session);
//       setEditedTitle(data.session.title); // ADD THIS LINE

//       if (data.session.status === 'paused') {
//         const resumeResponse = await fetch(
//           `/api/stories/session/${sessionId}/resume`,
//           {
//             method: 'POST',
//           }
//         );

//         if (resumeResponse.ok) {
//           const resumeData = await resumeResponse.json();
//           setStorySession(resumeData.session);

//           toast({
//             title: '▶️ Story Resumed',
//             description: 'Welcome back! Continue your adventure.',
//           });
//         }
//       }

//       fetchTurns(data.session._id);

//       if (!data.session.aiOpening) {
//         pollForAIOpening(data.session._id);
//       }
//     } catch (error) {
//       console.error('Error fetching story session:', error);
//       toast({
//         title: '❌ Error',
//         description: 'Failed to load story session. Please try again.',
//         variant: 'destructive',
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   }, [sessionId, toast, pollForAIOpening]);

//   useEffect(() => {
//     if (status === 'loading') return;

//     if (!session || session.user.role !== 'child') {
//       router.push('/login/child');
//       return;
//     }

//     fetchStorySession();
//   }, [session, status, fetchStorySession, router]);

//   const fetchTurns = async (actualSessionId: string) => {
//     try {
//       const response = await fetch(
//         `/api/stories/session/${actualSessionId}/turns`
//       );
//       const data = await response.json();

//       if (response.ok) {
//         setTurns(data.turns || []);
//       } else {
//         console.error('Failed to fetch turns:', data.error);
//       }
//     } catch (error) {
//       console.error('Error fetching turns:', error);
//     }
//   };

//   const fetchAssessment = async () => {
//     if (!storySession) return;

//     setIsLoadingAI(true);

//     try {
//       console.log('🎯 Fetching assessment for session:', storySession._id);

//       let response = await fetch(
//         `/api/stories/session/${storySession._id}/assessment`
//       );
//       let data = await response.json();

//       if (response.ok && data.assessment) {
//         console.log('✅ Found existing assessment:', data.assessment);
//         setAssessment(data.assessment);
//         setShowAssessment(true);

//         toast({
//           title: '📊 Assessment Ready!',
//           description: 'Your story has been evaluated!',
//         });
//       } else if (response.status === 404) {
//         console.log('🔄 No assessment found, generating new one...');
//         const generateResponse = await fetch(
//           `/api/stories/assess/${storySession._id}`,
//           {
//             method: 'POST',
//           }
//         );

//         const generateData = await generateResponse.json();

//         if (generateResponse.ok && generateData.assessment) {
//           console.log('✅ Generated new assessment:', generateData.assessment);
//           setAssessment(generateData.assessment);
//           setShowAssessment(true);

//           toast({
//             title: '🎉 Assessment Complete!',
//             description: 'Your story has been evaluated!',
//           });
//         } else {
//           throw new Error(
//             generateData.error || 'Failed to generate assessment'
//           );
//         }
//       } else {
//         throw new Error(data.error || 'Failed to fetch assessment');
//       }
//     } catch (error) {
//       console.error('❌ Error fetching assessment:', error);
//       toast({
//         title: '❌ Assessment Error',
//         description:
//           error instanceof Error ? error.message : 'Could not load assessment',
//         variant: 'destructive',
//       });
//     } finally {
//       setIsLoadingAI(false);
//     }
//   };

//   const handleSubmitTurn = async () => {
//     if (!storySession || !currentInput.trim()) return;

//     setIsSubmittingTurn(true);
//     setIsLoadingAI(true);

//     try {
//       const response = await fetch('/api/stories/ai-respond', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           sessionId: storySession._id,
//           childInput: currentInput.trim(),
//           turnNumber: storySession.currentTurn,
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setStorySession((prev) =>
//           prev
//             ? {
//                 ...prev,
//                 currentTurn: data.session.currentTurn,
//                 totalWords: data.session.totalWords,
//                 childWords: data.session.childWords,
//                 apiCallsUsed: data.session.apiCallsUsed,
//                 status: data.session.status,
//               }
//             : null
//         );

//         setTurns((prev) => [...prev, data.turn]);
//         setCurrentInput('');

//         toast({
//           title: '✨ Turn Added!',
//           description: 'AI is responding to your story...',
//         });

//         if (data.assessment) {
//           setAssessment(data.assessment);
//           setTimeout(() => {
//             setShowAssessment(true);
//           }, 1000);
//         }
//       } else {
//         throw new Error(data.error || 'Failed to submit turn');
//       }
//     } catch (error) {
//       console.error('Error submitting turn:', error);
//       toast({
//         title: '❌ Error',
//         description: 'Failed to submit your writing. Please try again.',
//         variant: 'destructive',
//       });
//     } finally {
//       setIsSubmittingTurn(false);
//       setIsLoadingAI(false);
//     }
//   };

//   const handleSaveDraft = async () => {
//     if (!storySession || !currentInput.trim()) return;

//     setIsSaving(true);

//     try {
//       const response = await fetch(
//         `/api/stories/session/${storySession._id}/draft`,
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             draftContent: currentInput.trim(),
//             turnNumber: storySession.currentTurn,
//           }),
//         }
//       );

//       if (!response.ok) {
//         throw new Error('Failed to save draft');
//       }

//       toast({
//         title: '💾 Draft Saved!',
//         description: 'Your progress has been saved.',
//       });
//     } catch (error) {
//       console.error('Error saving draft:', error);
//       toast({
//         title: '❌ Save Error',
//         description: 'Failed to save draft. Please try again.',
//         variant: 'destructive',
//       });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handlePauseStory = async () => {
//     if (!storySession) return;

//     setIsSaving(true);

//     try {
//       const response = await fetch(
//         `/api/stories/session/${storySession._id}/pause`,
//         {
//           method: 'POST',
//         }
//       );

//       if (!response.ok) {
//         throw new Error('Failed to pause story');
//       }

//       toast({
//         title: '⏸️ Story Paused',
//         description: 'You can continue anytime!',
//       });

//       router.push('/children-dashboard/my-stories');
//     } catch (error) {
//       console.error('Error pausing story:', error);
//       toast({
//         title: '❌ Error',
//         description: 'Failed to pause story. Please try again.',
//         variant: 'destructive',
//       });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   useEffect(() => {
//     if (storyTimelineRef.current) {
//       storyTimelineRef.current.scrollTop =
//         storyTimelineRef.current.scrollHeight;
//     }
//   }, [turns]);

//   if (status === 'loading' || isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
//         <div className="text-white text-center">
//           <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
//           <p>Loading your story...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!session || session.user.role !== 'child' || !storySession) {
//     return null;
//   }

//   const progressPercentage = ((storySession.currentTurn - 1) / maxTurns) * 100;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white">
//       {/* Header */}
//       <div className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-600/40 sticky top-0 z-10">
//         <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
//           <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-8 sm:pt-16 lg:pt-20">
//             <button
//               onClick={() => router.push('/children-dashboard/my-stories')}
//               className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors text-sm sm:text-base"
//             >
//               <ArrowLeft className="w-5 h-5" />
//               <span>Back to Stories</span>
//             </button>

//             <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-4">
//               <div className="text-xs sm:text-sm text-gray-300">
//                 Turn {storySession.currentTurn} of {maxTurns}
//               </div>
//               <div className="w-full sm:w-32 bg-gray-700 rounded-full h-2 sm:h-3 overflow-hidden">
//                 <motion.div
//                   className="bg-gradient-to-r from-blue-500 to-green-500 h-2 sm:h-3 rounded-full transition-all duration-500"
//                   initial={{ width: 0 }}
//                   animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
//                 />
//               </div>
//               <div className="text-xs sm:text-sm text-gray-300">
//                 {storySession.apiCallsUsed}/{storySession.maxApiCalls} AI calls
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="mb-6 sm:mb-8"
//         >
//           {/* REPLACE THE TITLE SECTION WITH THIS */}
//           {!isEditingTitle ? (
//             <div className="flex items-center gap-3 group mb-3 sm:mb-4">
//               <h1 className="text-2xl sm:text-3xl font-bold break-words">
//                 {storySession.title}
//               </h1>
//               <button
//                 onClick={startEditingTitle}
//                 className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
//                 title="Edit title"
//               >
//                 <Edit3 size={18} className="text-gray-400 hover:text-white" />
//               </button>
//             </div>
//           ) : (
//             <div className="flex items-center gap-2 mb-3 sm:mb-4">
//               <input
//                 ref={titleInputRef}
//                 type="text"
//                 value={editedTitle}
//                 onChange={(e) => setEditedTitle(e.target.value)}
//                 onKeyDown={handleTitleKeyPress}
//                 className="text-2xl sm:text-3xl font-bold bg-transparent text-white border-b-2 border-blue-500 focus:outline-none focus:border-blue-400 transition-colors flex-1"
//                 placeholder="Enter story title..."
//                 disabled={isSavingTitle}
//                 maxLength={100}
//               />
//               <button
//                 onClick={saveTitle}
//                 disabled={isSavingTitle || !editedTitle.trim()}
//                 className="p-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded transition-colors"
//                 title="Save title"
//               >
//                 {isSavingTitle ? (
//                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                 ) : (
//                   <Check size={16} />
//                 )}
//               </button>
//               <button
//                 onClick={cancelEditingTitle}
//                 disabled={isSavingTitle}
//                 className="p-1 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
//                 title="Cancel"
//               >
//                 <X size={16} />
//               </button>
//             </div>
//           )}

//           <div className="flex flex-wrap gap-1 sm:gap-2">
//             {storySession.elements &&
//               Object.entries(storySession.elements)
//                 .filter(([type, value]) => value && value.trim() !== '')
//                 .map(([type, value]) => (
//                   <span
//                     key={type}
//                     className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-xs sm:text-sm text-white capitalize"
//                   >
//                     {type}: {value}
//                   </span>
//                 ))}

//             {(!storySession.elements ||
//               Object.entries(storySession.elements).every(
//                 ([_, value]) => !value || value.trim() === ''
//               )) && (
//               <span className="px-3 py-1 bg-gray-500/20 border border-gray-500/30 rounded-full text-sm text-gray-300 italic">
//                 ✨ Freeform Story
//               </span>
//             )}
//           </div>
//         </motion.div>

//         {/* REST OF YOUR EXISTING CODE STAYS EXACTLY THE SAME */}
//         <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:gap-8">
//           <div
//             className="xl:col-span-8 space-y-4 sm:space-y-6 h-[60vh] sm:h-[68rem] overflow-y-auto scrollbar-thin scrollbar-track-gray-700/30 scrollbar-thumb-emerald-500 hover:scrollbar-thumb-emerald-400 scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
//             ref={storyTimelineRef}
//           >
//             <h2 className="text-lg sm:text-xl font-semibold flex items-center">
//               <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-400" />
//               Story So Far
//             </h2>

//             <div className="space-y-6">
//               {storySession && (
//                 <div className="mb-6">
//                   {isAIGenerating ? (
//                     <motion.div
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 sm:p-6"
//                     >
//                       <div className="flex items-center space-x-3 mb-4">
//                         <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
//                           <motion.div
//                             animate={{ rotate: 360 }}
//                             transition={{
//                               duration: 2,
//                               repeat: Infinity,
//                               ease: 'linear',
//                             }}
//                             className="text-lg"
//                           >
//                             🤖
//                           </motion.div>
//                         </div>
//                         <div>
//                           <h3 className="font-semibold text-blue-400">
//                             AI Teacher
//                           </h3>
//                           <p className="text-sm text-blue-300">
//                             Preparing your story opening...
//                           </p>
//                         </div>
//                       </div>

//                       <div className="space-y-2">
//                         <div className="flex items-center space-x-2">
//                           <motion.div
//                             className="w-2 h-2 bg-blue-400 rounded-full"
//                             animate={{ opacity: [0.3, 1, 0.3] }}
//                             transition={{ duration: 1.5, repeat: Infinity }}
//                           />
//                           <span className="text-blue-300 text-sm">
//                             Analyzing your story elements
//                           </span>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           <motion.div
//                             className="w-2 h-2 bg-blue-400 rounded-full"
//                             animate={{ opacity: [0.3, 1, 0.3] }}
//                             transition={{
//                               duration: 1.5,
//                               repeat: Infinity,
//                               delay: 0.5,
//                             }}
//                           />
//                           <span className="text-blue-300 text-sm">
//                             Crafting the perfect opening
//                           </span>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           <motion.div
//                             className="w-2 h-2 bg-blue-400 rounded-full"
//                             animate={{ opacity: [0.3, 1, 0.3] }}
//                             transition={{
//                               duration: 1.5,
//                               repeat: Infinity,
//                               delay: 1,
//                             }}
//                           />
//                           <span className="text-blue-300 text-sm">
//                             Almost ready...
//                           </span>
//                         </div>
//                       </div>

//                       <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-500/20 rounded-lg">
//                         <p className="text-sm text-blue-200">
//                           💡 <strong>Tip:</strong> You can explore your story
//                           elements below while the AI prepares your opening!
//                         </p>
//                       </div>
//                     </motion.div>
//                   ) : storySession.aiOpening ? (
//                     <motion.div
//                       initial={{ opacity: 0, scale: 0.95 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 sm:p-6"
//                     >
//                       <div className="flex items-center space-x-3 mb-4">
//                         <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-lg">
//                           🤖
//                         </div>
//                         <div>
//                           <h3 className="font-semibold text-purple-400">
//                             {'Your Story Opening'}
//                           </h3>
//                         </div>
//                       </div>
//                       <p className="text-white leading-relaxed">
//                         {storySession.aiOpening}
//                       </p>
//                     </motion.div>
//                   ) : null}
//                 </div>
//               )}

//               {turns.map((turn, index) => (
//                 <motion.div
//                   key={turn._id}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: index * 0.1 }}
//                   className="space-y-3 sm:space-y-4"
//                 >
//                   <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 sm:p-6">
//                     <div className="flex items-center justify-between mb-3">
//                       <div className="flex items-center">
//                         <Target className="w-5 h-5 text-green-400 mr-2" />
//                         <span className="text-green-300 font-medium">
//                           Your Turn {turn.turnNumber}
//                         </span>
//                       </div>
//                       <span className="text-green-300 text-sm">
//                         {turn.childWordCount} words
//                       </span>
//                     </div>
//                     <p className="text-gray-100 leading-relaxed">
//                       {turn.childInput}
//                     </p>
//                   </div>

//                   <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-4 sm:p-6">
//                     <div className="flex items-center justify-between mb-3">
//                       <div className="flex items-center">
//                         <Brain className="w-5 h-5 text-blue-400 mr-2" />
//                         <span className="text-blue-300 font-medium">
//                           AI Teacher Response
//                         </span>
//                       </div>
//                       <span className="text-blue-300 text-sm">
//                         {turn.aiWordCount} words
//                       </span>
//                     </div>
//                     <p className="text-gray-100 leading-relaxed">
//                       {turn.aiResponse}
//                     </p>
//                   </div>
//                 </motion.div>
//               ))}

//               {isLoadingAI && (
//                 <motion.div
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-xl p-4 sm:p-6"
//                 >
//                   <div className="flex items-center justify-center space-x-3">
//                     <div className="w-6 h-6 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
//                     <span className="text-purple-300 font-medium">
//                       AI Teacher is thinking...
//                     </span>
//                   </div>
//                   <p className="text-center text-gray-300 text-sm mt-2">
//                     Creating an educational response to your wonderful writing!
//                   </p>
//                 </motion.div>
//               )}
//             </div>
//           </div>

//           <div className="xl:col-span-4 space-y-4 sm:space-y-6 mt-6 xl:mt-0">
//             {storySession.status === 'completed' ? (
//               <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-6 sm:p-8 text-center">
//                 <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
//                 <h3 className="text-xl sm:text-2xl font-bold text-green-300 mb-2">
//                   Story Complete! 🎉
//                 </h3>
//                 <p className="text-gray-300 mb-4 sm:mb-6">
//                   Congratulations! You&apos;ve finished your{' '}
//                   {storySession.childWords}-word adventure.
//                </p>
//                <button
//                  onClick={fetchAssessment}
//                  disabled={isLoadingAI}
//                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold flex items-center space-x-2 mx-auto disabled:cursor-not-allowed text-sm sm:text-base"
//                >
//                  {isLoadingAI ? (
//                    <>
//                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                      <span>Loading...</span>
//                    </>
//                  ) : (
//                    <>
//                      <Award className="w-5 h-5" />
//                      <span>View Assessment</span>
//                    </>
//                  )}
//                </button>
//              </div>
//            ) : (
//              <>
//                <WordCountValidator
//                  value={currentInput}
//                  onChange={setCurrentInput}
//                  turnNumber={storySession.currentTurn}
//                  onValidationChange={(valid, count) => {
//                    setIsValid(valid);
//                    setWordCount(count);
//                  }}
//                  disabled={isSubmittingTurn || isLoadingAI}
//                />

//                <div className="flex flex-col gap-3 sm:gap-4">
//                  <motion.button
//                    whileHover={{ scale: 1.02 }}
//                    whileTap={{ scale: 0.98 }}
//                    onClick={handleSubmitTurn}
//                    disabled={!isValid || isSubmittingTurn || isLoadingAI}
//                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 sm:space-x-3 transition-all disabled:cursor-not-allowed text-sm sm:text-base"
//                  >
//                    {isSubmittingTurn || isLoadingAI ? (
//                      <>
//                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                        <span>
//                          {isLoadingAI ? 'AI Thinking...' : 'Submitting...'}
//                        </span>
//                      </>
//                    ) : (
//                      <>
//                        <Send className="w-5 h-5" />
//                        <span>
//                          {storySession.currentTurn === maxTurns
//                            ? 'Complete Story'
//                            : 'Submit Turn'}
//                        </span>
//                      </>
//                    )}
//                  </motion.button>

//                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
//                    <button
//                      onClick={handleSaveDraft}
//                      disabled={!currentInput.trim() || isSaving}
//                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-medium flex items-center justify-center space-x-1 sm:space-x-2 transition-colors disabled:cursor-not-allowed text-xs sm:text-sm"
//                    >
//                      {isSaving ? (
//                        <>
//                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                          <span>Saving...</span>
//                        </>
//                      ) : (
//                        <>
//                          <Save className="w-4 h-4" />
//                          <span>Save Draft</span>
//                        </>
//                      )}
//                    </button>

//                    <button
//                      onClick={handlePauseStory}
//                      disabled={isSaving}
//                      className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-medium flex items-center justify-center space-x-1 sm:space-x-2 transition-colors disabled:cursor-not-allowed text-xs sm:text-sm"
//                    >
//                      <Pause className="w-4 h-4" />
//                      <span>Pause</span>
//                    </button>
//                  </div>
//                </div>
//              </>
//            )}

//            <div className="bg-gray-800/50 border border-gray-600/50 rounded-xl p-4 sm:p-6">
//              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
//                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
//                Story Progress
//              </h3>

//              <div className="grid grid-cols-2 gap-2 sm:gap-4">
//                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 sm:p-4 text-center">
//                  <div className="text-lg sm:text-2xl font-bold text-white">
//                    {storySession.childWords}
//                  </div>
//                  <div className="text-blue-300 text-xs sm:text-sm">
//                    Your Words
//                  </div>
//                </div>

//                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 sm:p-4 text-center">
//                  <div className="text-lg sm:text-2xl font-bold text-white">
//                    {storySession.totalWords}
//                  </div>
//                  <div className="text-green-300 text-xs sm:text-sm">
//                    Total Words
//                  </div>
//                </div>

//                <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 sm:p-4 text-center">
//                  <div className="text-lg sm:text-2xl font-bold text-white">
//                    {storySession.currentTurn}/{maxTurns}
//                  </div>
//                  <div className="text-purple-300 text-xs sm:text-sm">
//                    Current Turn
//                  </div>
//                </div>

//                <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3 sm:p-4 text-center">
//                  <div className="text-lg sm:text-2xl font-bold text-white">
//                    {storySession.apiCallsUsed}/{storySession.maxApiCalls}
//                  </div>
//                  <div className="text-orange-300 text-xs sm:text-sm">
//                    AI Calls Used
//                  </div>
//                </div>
//              </div>

//              <div className="mt-4 sm:mt-6 flex items-center justify-center">
//                <div className="relative w-20 h-20 sm:w-24 sm:h-24">
//                  <svg
//                    className="w-20 h-20 sm:w-24 sm:h-24 transform -rotate-90"
//                    viewBox="0 0 100 100"
//                  >
//                    <circle
//                      cx="50"
//                      cy="50"
//                      r="40"
//                      stroke="currentColor"
//                      strokeWidth="8"
//                      fill="transparent"
//                      className="text-gray-700"
//                    />
//                    <motion.circle
//                      cx="50"
//                      cy="50"
//                      r="40"
//                      stroke="currentColor"
//                      strokeWidth="8"
//                      fill="transparent"
//                      strokeDasharray={`${progressPercentage * 2.51} 251`}
//                      className="text-green-400"
//                      initial={{ strokeDasharray: '0 251' }}
//                      animate={{
//                        strokeDasharray: `${progressPercentage * 2.51} 251`,
//                      }}
//                      transition={{ duration: 1, ease: 'easeInOut' }}
//                    />
//                  </svg>
//                  <div className="absolute inset-0 flex items-center justify-center">
//                    <span className="text-base sm:text-lg font-bold text-white">
//                      {Math.round(progressPercentage)}%
//                    </span>
//                  </div>
//                </div>
//              </div>
//            </div>
//          </div>
//        </div>
//      </div>

//      <AssessmentModal
//        isOpen={showAssessment}
//        onClose={() => setShowAssessment(false)}
//        storySession={storySession}
//        turns={turns}
//        assessment={assessment}
//      />

//      <style jsx global>{`
//        .scrollbar-thin::-webkit-scrollbar {
//          width: 8px;
//        }

//        .scrollbar-track-gray-700\/30::-webkit-scrollbar-track {
//          background: rgba(55, 65, 81, 0.3);
//          border-radius: 4px;
//        }

//        .scrollbar-thumb-emerald-500::-webkit-scrollbar-thumb {
//          background: linear-gradient(to bottom, #10b981, #059669);
//          border-radius: 4px;
//          border: 1px solid rgba(255, 255, 255, 0.1);
//        }

//        .hover\\:scrollbar-thumb-emerald-400::-webkit-scrollbar-thumb:hover {
//          background: linear-gradient(to bottom, #34d399, #10b981);
//        }

//        .scrollbar-thumb-rounded-full::-webkit-scrollbar-thumb {
//          border-radius: 9999px;
//        }

//        .scrollbar-track-rounded-full::-webkit-scrollbar-track {
//          border-radius: 9999px;
//        }

//        .scrollbar-thin {
//          scrollbar-width: thin;
//          scrollbar-color: #10b981 rgba(55, 65, 81, 0.3);
//        }
//      `}</style>
//    </div>
//  );
// }

// app/children-dashboard/story/[sessionId]/page.tsx - COMPLETE FIXED FILE
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  Save,
  Pause,
  CheckCircle,
  Sparkles,
  BookOpen,
  Target,
  Award,
  Brain,
  Zap,
  Edit3,
  Check,
  X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import WordCountValidator from '@/components/writing/WordCountValidator';
import AssessmentModal from '@/components/stories/AssessmentModal';

interface StorySession {
  _id: string;
  title: string;
  elements?: {
    genre?: string;
    character?: string;
    setting?: string;
    theme?: string;
    mood?: string;
    tone?: string;
  };
  currentTurn: number;
  totalWords: number;
  childWords: number;
  apiCallsUsed: number;
  maxApiCalls: number;
  status: 'active' | 'completed' | 'paused';
  aiOpening?: string;
  assessment?: any;
  assessmentAttempts: number;
  isUploadedForAssessment?: boolean;
}

interface Turn {
  _id: string;
  turnNumber: number;
  childInput: string;
  aiResponse: string;
  childWordCount: number;
  aiWordCount: number;
}

export default function StoryWritingPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const { sessionId } = params;

  const [storySession, setStorySession] = useState<StorySession | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const storyTimelineRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentInput, setCurrentInput] = useState('');

  const [isValid, setIsValid] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessment, setAssessment] = useState<any>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [isSubmittingTurn, setIsSubmittingTurn] = useState(false);

  // Title editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const maxTurns = 7;

  // Focus title input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Title editing functions
  const startEditingTitle = () => {
    setIsEditingTitle(true);
    setEditedTitle(storySession?.title || '');
  };

  const cancelEditingTitle = () => {
    setIsEditingTitle(false);
    setEditedTitle(storySession?.title || '');
  };

  const saveTitle = async () => {
    if (!storySession || !editedTitle.trim()) return;

    setIsSavingTitle(true);

    try {
      const response = await fetch(`/api/stories/session/${storySession._id}/update-title`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editedTitle.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setStorySession(prev => prev ? { ...prev, title: data.title } : null);
        setIsEditingTitle(false);
        
        toast({
          title: '✅ Title Updated',
          description: 'Your story title has been saved!',
        });
      } else {
        throw new Error('Failed to update title');
      }
    } catch (error) {
      console.error('Error updating title:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to update title. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingTitle(false);
    }
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveTitle();
    } else if (e.key === 'Escape') {
      cancelEditingTitle();
    }
  };

  const pollForAIOpening = useCallback(
    (actualSessionId: string) => {
      setIsAIGenerating(true);

      toast({
        title: '🤖 AI Teacher is Preparing',
        description: 'Your story opening is being crafted...',
      });

      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(
            `/api/stories/session/${actualSessionId}`
          );
          const data = await response.json();

          if (data.session?.aiOpening) {
            setStorySession((prev) =>
              prev ? { ...prev, aiOpening: data.session.aiOpening } : null
            );
            setIsAIGenerating(false);
            clearInterval(pollInterval);

            toast({
              title: '✨ Story Opening Ready!',
              description: 'Your AI teacher has prepared your story opening!',
            });
          }
        } catch (error) {
          console.error('Error polling for AI opening:', error);
        }
      }, 3000);

      setTimeout(() => {
        clearInterval(pollInterval);
        if (isAIGenerating) {
          setIsAIGenerating(false);
          toast({
            title: '⏰ Taking Longer Than Expected',
            description:
              'You can start writing while AI prepares your opening.',
          });
        }
      }, 180000);
    },
    [toast, setIsAIGenerating, setStorySession, isAIGenerating]
  );

  const fetchStorySession = useCallback(async () => {
    try {
      console.log('Fetching story session:', sessionId);

      const response = await fetch(`/api/stories/session/${sessionId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch story session');
      }

      setStorySession(data.session);
      setEditedTitle(data.session.title);

      if (data.session.status === 'paused') {
        const resumeResponse = await fetch(
          `/api/stories/session/${sessionId}/resume`,
          {
            method: 'POST',
          }
        );

        if (resumeResponse.ok) {
          const resumeData = await resumeResponse.json();
          setStorySession(resumeData.session);

          toast({
            title: '▶️ Story Resumed',
            description: 'Welcome back! Continue your adventure.',
          });
        }
      }

      fetchTurns(data.session._id);

      if (!data.session.aiOpening) {
        pollForAIOpening(data.session._id);
      }
    } catch (error) {
      console.error('Error fetching story session:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to load story session. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, toast, pollForAIOpening]);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'child') {
      router.push('/login/child');
      return;
    }

    fetchStorySession();
  }, [session, status, fetchStorySession, router]);

  const fetchTurns = async (actualSessionId: string) => {
    try {
      const response = await fetch(
        `/api/stories/session/${actualSessionId}/turns`
      );
      const data = await response.json();

      if (response.ok) {
        setTurns(data.turns || []);
      } else {
        console.error('Failed to fetch turns:', data.error);
      }
    } catch (error) {
      console.error('Error fetching turns:', error);
    }
  };

  // FIXED: Assessment fetching function
  const fetchAssessment = async () => {
    if (!storySession) return;

    setIsLoadingAI(true);

    try {
      console.log('🎯 Fetching assessment for session:', storySession._id);

      let response = await fetch(
        `/api/stories/session/${storySession._id}/assessment`
      );
      let data = await response.json();

      console.log('📋 Assessment API Response:', data);

      if (response.ok) {
        // FIX: The API returns { storySession: { assessment: {...} } }
        let assessmentData = null;
        
        if (data.storySession?.assessment) {
          assessmentData = data.storySession.assessment;
        } else if (data.assessment) {
          assessmentData = data.assessment;
        }

        if (assessmentData) {
          console.log('✅ Found existing assessment:', assessmentData);
          setAssessment(assessmentData);
          setShowAssessment(true);

          toast({
            title: '📊 Assessment Ready!',
            description: 'Your story has been evaluated!',
          });
          return;
        }
      }

      // If no existing assessment, try to generate one
      console.log('🔄 No assessment found, generating new one...');
      const generateResponse = await fetch(
        `/api/stories/assess/${storySession._id}`,
        {
          method: 'POST',
        }
      );

      const generateData = await generateResponse.json();
      console.log('📋 Generate Assessment Response:', generateData);

      if (generateResponse.ok) {
        let newAssessmentData = null;
        
        if (generateData.assessment) {
          newAssessmentData = generateData.assessment;
        } else if (generateData.overallScore !== undefined) {
          newAssessmentData = generateData;
        }

        if (newAssessmentData) {
          console.log('✅ Generated new assessment:', newAssessmentData);
          setAssessment(newAssessmentData);
          setShowAssessment(true);

          toast({
            title: '🎉 Assessment Complete!',
            description: 'Your story has been evaluated!',
          });
          return;
        }
      }

      throw new Error(generateData.error || 'Failed to generate assessment');

    } catch (error) {
      console.error('❌ Error fetching assessment:', error);
      toast({
        title: '❌ Assessment Error',
        description:
          error instanceof Error ? error.message : 'Could not load assessment',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSubmitTurn = async () => {
    if (!storySession || !currentInput.trim()) return;

    setIsSubmittingTurn(true);
    setIsLoadingAI(true);

    try {
      const response = await fetch('/api/stories/ai-respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: storySession._id,
          childInput: currentInput.trim(),
          turnNumber: storySession.currentTurn,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStorySession((prev) =>
          prev
            ? {
                ...prev,
                currentTurn: data.session.currentTurn,
                totalWords: data.session.totalWords,
                childWords: data.session.childWords,
                apiCallsUsed: data.session.apiCallsUsed,
                status: data.session.status,
              }
            : null
        );

        setTurns((prev) => [...prev, data.turn]);
        setCurrentInput('');

        toast({
          title: '✨ Turn Added!',
          description: 'AI is responding to your story...',
        });

        if (data.assessment) {
          setAssessment(data.assessment);
          setTimeout(() => {
            setShowAssessment(true);
          }, 1000);
        }
      } else {
        throw new Error(data.error || 'Failed to submit turn');
      }
    } catch (error) {
      console.error('Error submitting turn:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to submit your writing. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingTurn(false);
      setIsLoadingAI(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!storySession || !currentInput.trim()) return;

    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/stories/session/${storySession._id}/draft`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            draftContent: currentInput.trim(),
            turnNumber: storySession.currentTurn,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save draft');
      }

      toast({
        title: '💾 Draft Saved!',
        description: 'Your progress has been saved.',
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: '❌ Save Error',
        description: 'Failed to save draft. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePauseStory = async () => {
    if (!storySession) return;

    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/stories/session/${storySession._id}/pause`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to pause story');
      }

      toast({
        title: '⏸️ Story Paused',
        description: 'You can continue anytime!',
      });

      router.push('/children-dashboard/my-stories');
    } catch (error) {
      console.error('Error pausing story:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to pause story. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (storyTimelineRef.current) {
      storyTimelineRef.current.scrollTop =
        storyTimelineRef.current.scrollHeight;
    }
  }, [turns]);

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

  if (!session || session.user.role !== 'child' || !storySession) {
    return null;
  }

  const progressPercentage = ((storySession.currentTurn - 1) / maxTurns) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-600/40 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-8 sm:pt-16 lg:pt-20">
            <button
              onClick={() => router.push('/children-dashboard/my-stories')}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors text-sm sm:text-base"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Stories</span>
            </button>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-4">
              <div className="text-xs sm:text-sm text-gray-300">
                Turn {storySession.currentTurn} of {maxTurns}
              </div>
              <div className="w-full sm:w-32 bg-gray-700 rounded-full h-2 sm:h-3 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 sm:h-3 rounded-full transition-all duration-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
              <div className="text-xs sm:text-sm text-gray-300">
                {storySession.apiCallsUsed}/{storySession.maxApiCalls} AI calls
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          {/* Editable Title Section */}
          {!isEditingTitle ? (
            <div className="flex items-center gap-3 group mb-3 sm:mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold break-words">
                {storySession.title}
              </h1>
              <button
                onClick={startEditingTitle}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
                title="Edit title"
              >
                <Edit3 size={18} className="text-gray-400 hover:text-white" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <input
                ref={titleInputRef}
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={handleTitleKeyPress}
                className="text-2xl sm:text-3xl font-bold bg-transparent text-white border-b-2 border-blue-500 focus:outline-none focus:border-blue-400 transition-colors flex-1"
                placeholder="Enter story title..."
                disabled={isSavingTitle}
                maxLength={100}
              />
              <button
                onClick={saveTitle}
                disabled={isSavingTitle || !editedTitle.trim()}
                className="p-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded transition-colors"
                title="Save title"
              >
                {isSavingTitle ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check size={16} />
                )}
              </button>
              <button
                onClick={cancelEditingTitle}
                disabled={isSavingTitle}
                className="p-1 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                title="Cancel"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-1 sm:gap-2">
            {storySession.elements &&
              Object.entries(storySession.elements)
                .filter(([type, value]) => value && value.trim() !== '')
                .map(([type, value]) => (
                  <span
                    key={type}
                    className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-xs sm:text-sm text-white capitalize"
                  >
                    {type}: {value}
                  </span>
                ))}

            {(!storySession.elements ||
              Object.entries(storySession.elements).every(
                ([_, value]) => !value || value.trim() === ''
              )) && (
              <span className="px-3 py-1 bg-gray-500/20 border border-gray-500/30 rounded-full text-sm text-gray-300 italic">
                ✨ Freeform Story
              </span>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:gap-8">
          <div
            className="xl:col-span-8 space-y-4 sm:space-y-6 h-[60vh] sm:h-[68rem] overflow-y-auto scrollbar-thin scrollbar-track-gray-700/30 scrollbar-thumb-emerald-500 hover:scrollbar-thumb-emerald-400 scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
            ref={storyTimelineRef}
          >
            <h2 className="text-lg sm:text-xl font-semibold flex items-center">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-400" />
              Story So Far
            </h2>

            <div className="space-y-6">
              {storySession && (
                <div className="mb-6">
                  {isAIGenerating ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 sm:p-6"
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                            className="text-lg"
                          >
                            🤖
                          </motion.div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-blue-400">
                            AI Teacher
                          </h3>
                          <p className="text-sm text-blue-300">
                            Preparing your story opening...
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <motion.div
                            className="w-2 h-2 bg-blue-400 rounded-full"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                          <span className="text-blue-300 text-sm">
                            Analyzing your story elements
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <motion.div
                            className="w-2 h-2 bg-blue-400 rounded-full"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: 0.5,
                            }}
                          />
                          <span className="text-blue-300 text-sm">
                            Crafting the perfect opening
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <motion.div
                            className="w-2 h-2 bg-blue-400 rounded-full"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: 1,
                            }}
                          />
                          <span className="text-blue-300 text-sm">
                            Almost ready...
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-500/20 rounded-lg">
                        <p className="text-sm text-blue-200">
                          💡 <strong>Tip:</strong> You can explore your story
                          elements below while the AI prepares your opening!
                        </p>
                      </div>
                    </motion.div>
                  ) : storySession.aiOpening ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 sm:p-6"
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-lg">
                          🤖
                        </div>
                        <div>
                          <h3 className="font-semibold text-purple-400">
                            {'Your Story Opening'}
                          </h3>
                        </div>
                      </div>
                      <p className="text-white leading-relaxed">
                        {storySession.aiOpening}
                      </p>
                    </motion.div>
                  ) : null}
                </div>
              )}

              {turns.map((turn, index) => (
                <motion.div
                  key={turn._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-3 sm:space-y-4"
                >
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Target className="w-5 h-5 text-green-400 mr-2" />
                        <span className="text-green-300 font-medium">
                          Your Turn {turn.turnNumber}
                        </span>
                      </div>
                      <span className="text-green-300 text-sm">
                        {turn.childWordCount} words
                      </span>
                    </div>
                    <p className="text-gray-100 leading-relaxed">
                      {turn.childInput}
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Brain className="w-5 h-5 text-blue-400 mr-2" />
                        <span className="text-blue-300 font-medium">
                          AI Teacher Response
                        </span>
                      </div>
                      <span className="text-blue-300 text-sm">
                        {turn.aiWordCount} words
                      </span>
                    </div>
                    <p className="text-gray-100 leading-relaxed">
                      {turn.aiResponse}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isLoadingAI && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-xl p-4 sm:p-6"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-6 h-6 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                    <span className="text-purple-300 font-medium">
                      AI Teacher is thinking...
                    </span>
                  </div>
                  <p className="text-center text-gray-300 text-sm mt-2">
                    Creating an educational response to your wonderful writing!
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          <div className="xl:col-span-4 space-y-4 sm:space-y-6 mt-6 xl:mt-0">
            {storySession.status === 'completed' ? (
              <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-6 sm:p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold text-green-300 mb-2">
                  Story Complete! 🎉
                </h3>
                <p className="text-gray-300 mb-4 sm:mb-6">
                  Congratulations! You&apos;ve finished your{' '}
                  {storySession.childWords}-word adventure.
                </p>
                <button
                  onClick={fetchAssessment}
                  disabled={isLoadingAI}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold flex items-center space-x-2 mx-auto disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {isLoadingAI ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-5 h-5" />
                      <span>View Assessment</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <>
                <WordCountValidator
                  value={currentInput}
                  onChange={setCurrentInput}
                  turnNumber={storySession.currentTurn}
                  onValidationChange={(valid, count) => {
                    setIsValid(valid);
                    setWordCount(count);
                  }}
                  disabled={isSubmittingTurn || isLoadingAI}
                />

                <div className="flex flex-col gap-3 sm:gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmitTurn}
                    disabled={!isValid || isSubmittingTurn || isLoadingAI}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 sm:space-x-3 transition-all disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {isSubmittingTurn || isLoadingAI ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>
                          {isLoadingAI ? 'AI Thinking...' : 'Submitting...'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>
                          {storySession.currentTurn === maxTurns
                            ? 'Complete Story'
                            : 'Submit Turn'}
                        </span>
                      </>
                    )}
                  </motion.button>

                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <button
                      onClick={handleSaveDraft}
                      disabled={!currentInput.trim() || isSaving}
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-medium flex items-center justify-center space-x-1 sm:space-x-2 transition-colors disabled:cursor-not-allowed text-xs sm:text-sm"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Draft</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handlePauseStory}
                      disabled={isSaving}
                      className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-medium flex items-center justify-center space-x-1 sm:space-x-2 transition-colors disabled:cursor-not-allowed text-xs sm:text-sm"
                    >
                      <Pause className="w-4 h-4" />
                      <span>Pause</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="bg-gray-800/50 border border-gray-600/50 rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                Story Progress
              </h3>

              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-white">
                    {storySession.childWords}
                  </div>
                  <div className="text-blue-300 text-xs sm:text-sm">
                    Your Words
                  </div>
                </div>

                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-white">
                    {storySession.totalWords}
                  </div>
                  <div className="text-green-300 text-xs sm:text-sm">
                    Total Words
                  </div>
                </div>

                <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-white">
                    {storySession.currentTurn}/{maxTurns}
                  </div>
                  <div className="text-purple-300 text-xs sm:text-sm">
                    Current Turn
                  </div>
                </div>

                <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-white">
                    {storySession.apiCallsUsed}/{storySession.maxApiCalls}
                  </div>
                  <div className="text-orange-300 text-xs sm:text-sm">
                    AI Calls Used
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 flex items-center justify-center">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                  <svg
                    className="w-20 h-20 sm:w-24 sm:h-24 transform -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-gray-700"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${progressPercentage * 2.51} 251`}
                      className="text-green-400"
                      initial={{ strokeDasharray: '0 251' }}
                      animate={{
                        strokeDasharray: `${progressPercentage * 2.51} 251`,
                      }}
                      transition={{ duration: 1, ease: 'easeInOut' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-base sm:text-lg font-bold text-white">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AssessmentModal
        isOpen={showAssessment}
        onClose={() => setShowAssessment(false)}
        storySession={storySession}
        turns={turns}
        assessment={assessment}
      />

      <style jsx global>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
        }

        .scrollbar-track-gray-700\/30::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 4px;
        }

        .scrollbar-thumb-emerald-500::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #10b981, #059669);
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .hover\\:scrollbar-thumb-emerald-400::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #34d399, #10b981);
        }

        .scrollbar-thumb-rounded-full::-webkit-scrollbar-thumb {
          border-radius: 9999px;
        }

        .scrollbar-track-rounded-full::-webkit-scrollbar-track {
          border-radius: 9999px;
        }

        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #10b981 rgba(55, 65, 81, 0.3);
        }
      `}</style>
    </div>
  );
}