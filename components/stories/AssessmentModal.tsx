// // components/stories/AssessmentModal.tsx - FIXED WITH PROPER INTERFACE
// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useRouter } from 'next/navigation';
// import {
//   X,
//   Star,
//   Award,
//   BookOpen,
//   TrendingUp,
//   Sparkles,
//   Target,
//   Brain,
//   BookMarked,
// } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';

// interface AssessmentModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   storySession: {
//     _id: string;
//     title: string;
//     totalWords: number;
//   } | null;
//   turns: Array<{
//     childInput: string;
//     aiResponse: string;
//   }>; // FIXED: Added turns back to interface
//   assessment?: DetailedAssessment | null;
// }

// interface DetailedAssessment {
//   grammarScore: number;
//   creativityScore: number;
//   overallScore: number;
//   readingLevel?: string;
//   vocabularyScore?: number;
//   structureScore?: number;
//   characterDevelopmentScore?: number;
//   plotDevelopmentScore?: number;
//   feedback: string;
//   strengths?: string[];
//   improvements?: string[];
//   vocabularyUsed?: string[];
//   suggestedWords?: string[];
//   educationalInsights?: string;
// }

// export default function AssessmentModal({
//   isOpen,
//   onClose,
//   storySession,
//   turns, // FIXED: Added turns parameter back
//   assessment: propAssessment,
// }: AssessmentModalProps) {
//   const router = useRouter();
//   const { toast } = useToast();

//   const [assessment, setAssessment] = useState<DetailedAssessment | null>(propAssessment || null);
//   const [isAssessing, setIsAssessing] = useState(false);
//   const [isPublishing, setIsPublishing] = useState(false);

//   // OPTIMIZATION: Add mounted ref for cleanup
//   const mountedRef = useRef(true);

//   useEffect(() => {
//     mountedRef.current = true;
//     return () => {
//       mountedRef.current = false;
//     };
//   }, []);

//   // When modal opens, try to get existing assessment first
//   useEffect(() => {
//     if (isOpen && storySession && !assessment && mountedRef.current) {
//       fetchExistingAssessment();
//     }
//   }, [isOpen, storySession]);

//   const fetchExistingAssessment = async () => {
//     if (!storySession || !mountedRef.current) return;

//     setIsAssessing(true);

//     try {
//       // Try to get existing assessment first
//       const response = await fetch(`/api/stories/session/${storySession._id}/assessment`);
      
//       if (response.ok) {
//         const data = await response.json();
//         if (data.assessment && mountedRef.current) {
//           setAssessment(data.assessment);
//           setIsAssessing(false);
//           return;
//         }
//       }

//       // If no existing assessment, generate new one
//       console.log('No existing assessment found, generating...');
//       await generateNewAssessment();
      
//     } catch (error) {
//       console.error('Error fetching assessment:', error);
//       await generateNewAssessment(); // Fallback to generation
//     }
//   };

//   const generateNewAssessment = async () => {
//     if (!storySession || !mountedRef.current) return;

//     try {
//       const response = await fetch(`/api/stories/assess/${storySession._id}`, {
//         method: 'POST',
//       });
      
//       const data = await response.json();

//       if (!response.ok || !data.assessment) {
//         console.error('Assessment API error:', data.error);
        
//         // Provide fallback assessment
//         if (mountedRef.current) {
//           setAssessment({
//             grammarScore: 85,
//             creativityScore: 88,
//             overallScore: 86,
//             readingLevel: 'Elementary',
//             vocabularyScore: 82,
//             structureScore: 84,
//             characterDevelopmentScore: 86,
//             plotDevelopmentScore: 87,
//             feedback: 'Great work on your creative story! Your writing shows imagination and effort.',
//             strengths: ['Creative imagination', 'Good story flow', 'Engaging characters', 'Descriptive writing', 'Story structure'],
//             improvements: ['Add more dialogue', 'Use more descriptive words', 'Vary sentence length'],
//             vocabularyUsed: ['adventure', 'mysterious', 'brave', 'discovered', 'amazing'],
//             suggestedWords: ['magnificent', 'extraordinary', 'perilous', 'astonishing', 'triumphant'],
//             educationalInsights: 'Keep developing your creative writing skills! Your storytelling abilities are improving.'
//           });
          
//           toast({
//             title: '⚠️ Assessment Generated',
//             description: 'Using default assessment scores.',
//           });
//         }
//         return;
//       }

//       if (mountedRef.current) {
//         setAssessment(data.assessment);
        
//         toast({
//           title: '📊 Assessment Complete!',
//           description: 'Your story has been evaluated.',
//         });
//       }
      
//     } catch (error) {
//       console.error('Error generating assessment:', error);
      
//       // Provide fallback assessment on error
//       if (mountedRef.current) {
//         setAssessment({
//           grammarScore: 85,
//           creativityScore: 88,
//           overallScore: 86,
//           readingLevel: 'Elementary',
//           vocabularyScore: 82,
//           structureScore: 84,
//           characterDevelopmentScore: 86,
//           plotDevelopmentScore: 87,
//           feedback: 'Great work on your creative story! Assessment could not be fully generated, but your effort is commendable.',
//           strengths: ['Creative imagination', 'Good story flow', 'Engaging characters'],
//           improvements: ['Add more dialogue', 'Use more descriptive words', 'Vary sentence length'],
//           vocabularyUsed: ['adventure', 'mysterious', 'brave', 'discovered', 'amazing'],
//           suggestedWords: ['magnificent', 'extraordinary', 'perilous', 'astonishing', 'triumphant'],
//           educationalInsights: 'Keep developing your creative writing skills!'
//         });
        
//         toast({
//           title: '⚠️ Assessment Error',
//           description: 'Using fallback scores.',
//           variant: 'destructive',
//         });
//       }
//     } finally {
//       if (mountedRef.current) {
//         setIsAssessing(false);
//       }
//     }
//   };

//   const handlePublishStory = async () => {
//     if (!storySession || !assessment || !mountedRef.current) return;

//     setIsPublishing(true);

//     try {
//       const response = await fetch('/api/stories/publish', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           sessionId: storySession._id,
//           assessment,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to publish story');
//       }

//       if (mountedRef.current) {
//         toast({
//           title: '🎉 Story Published!',
//           description: 'Your amazing story is now in your library!',
//         });

//         onClose();
//         router.push('/children-dashboard/my-stories');
//       }
//     } catch (error) {
//       console.error('Error publishing story:', error);
//       if (mountedRef.current) {
//         toast({
//           title: '❌ Error',
//           description: 'Failed to publish story. Please try again.',
//           variant: 'destructive',
//         });
//       }
//     } finally {
//       if (mountedRef.current) {
//         setIsPublishing(false);
//       }
//     }
//   };

//   const handleKeepEditing = () => {
//     onClose();
//     // Story remains in 'active' state for continued editing
//   };

//   const getScoreColor = (score: number) => {
//     if (score >= 90) return 'text-green-400';
//     if (score >= 80) return 'text-blue-400';
//     if (score >= 70) return 'text-yellow-400';
//     return 'text-orange-400';
//   };

//   const getScoreBarColor = (score: number) => {
//     if (score >= 90) return 'from-green-500 to-emerald-500';
//     if (score >= 80) return 'from-blue-500 to-cyan-500';
//     if (score >= 70) return 'from-yellow-500 to-orange-500';
//     return 'from-orange-500 to-red-500';
//   };

//   if (!isOpen || !storySession) return null;

//   return (
//     <AnimatePresence>
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
//         onClick={onClose}
//       >
//         <motion.div
//           initial={{ opacity: 0, scale: 0.9, y: 20 }}
//           animate={{ opacity: 1, scale: 1, y: 0 }}
//           exit={{ opacity: 0, scale: 0.9, y: 20 }}
//           className="bg-gray-800 border border-gray-600 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
//           onClick={(e) => e.stopPropagation()}
//         >
//           {/* Header */}
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-2xl font-bold text-white flex items-center">
//               🎉 Story Complete! "{storySession.title}"
//             </h2>
//             <button
//               onClick={onClose}
//               className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>

//           {/* Assessment Results */}
//           {isAssessing ? (
//             <div className="text-center py-12">
//               <motion.div
//                 animate={{ rotate: 360 }}
//                 transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
//                 className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full mx-auto mb-4"
//               />
//               <p className="text-white font-medium">
//                 Analyzing your amazing story...
//               </p>
//               <p className="text-gray-400 text-sm mt-2">
//                 This will just take a moment!
//               </p>
//             </div>
//           ) : assessment ? (
//             <>
//               {/* Main Score Cards */}
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
//                 {/* Grammar Score */}
//                 <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6 text-center">
//                   <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-3" />
//                   <div className={`text-3xl font-bold mb-2 ${getScoreColor(assessment.grammarScore)}`}>
//                     {assessment.grammarScore}%
//                   </div>
//                   <div className="text-gray-300 text-sm font-medium">
//                     Grammar & Writing
//                   </div>
//                   <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
//                     <motion.div
//                       className={`bg-gradient-to-r ${getScoreBarColor(assessment.grammarScore)} h-2 rounded-full`}
//                       initial={{ width: 0 }}
//                       animate={{ width: `${assessment.grammarScore}%` }}
//                       transition={{ duration: 1, delay: 0.2 }}
//                     />
//                   </div>
//                 </div>

//                 {/* Creativity Score */}
//                 <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6 text-center">
//                   <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-3" />
//                   <div className={`text-3xl font-bold mb-2 ${getScoreColor(assessment.creativityScore)}`}>
//                     {assessment.creativityScore}%
//                   </div>
//                   <div className="text-gray-300 text-sm font-medium">
//                     Creativity & Ideas
//                   </div>
//                   <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
//                     <motion.div
//                       className={`bg-gradient-to-r ${getScoreBarColor(assessment.creativityScore)} h-2 rounded-full`}
//                       initial={{ width: 0 }}
//                       animate={{ width: `${assessment.creativityScore}%` }}
//                       transition={{ duration: 1, delay: 0.4 }}
//                     />
//                   </div>
//                 </div>

//                 {/* Overall Score */}
//                 <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6 text-center">
//                   <Award className="w-8 h-8 text-green-400 mx-auto mb-3" />
//                   <div className={`text-3xl font-bold mb-2 ${getScoreColor(assessment.overallScore)}`}>
//                     {assessment.overallScore}%
//                   </div>
//                   <div className="text-gray-300 text-sm font-medium">
//                     Overall Score
//                   </div>
//                   <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
//                     <motion.div
//                       className={`bg-gradient-to-r ${getScoreBarColor(assessment.overallScore)} h-2 rounded-full`}
//                       initial={{ width: 0 }}
//                       animate={{ width: `${assessment.overallScore}%` }}
//                       transition={{ duration: 1, delay: 0.6 }}
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Detailed Assessment Scores */}
//               {(assessment.vocabularyScore || assessment.structureScore || assessment.characterDevelopmentScore || assessment.plotDevelopmentScore) && (
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
//                   {[
//                     { label: 'Vocabulary', score: assessment.vocabularyScore || 0, color: 'orange' },
//                     { label: 'Structure', score: assessment.structureScore || 0, color: 'cyan' },
//                     { label: 'Character Dev.', score: assessment.characterDevelopmentScore || 0, color: 'pink' },
//                     { label: 'Plot Dev.', score: assessment.plotDevelopmentScore || 0, color: 'indigo' },
//                   ].map((item) => (
//                     <div key={item.label} className="bg-gray-700/30 rounded-lg p-3 text-center">
//                       <div className={`text-lg font-bold text-${item.color}-400`}>
//                         {item.score}%
//                       </div>
//                       <div className="text-gray-300 text-xs">{item.label}</div>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {/* Reading Level */}
//               {assessment.readingLevel && (
//                 <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-500/30 mb-6">
//                   <h3 className="text-white font-semibold mb-2 flex items-center">
//                     <BookOpen className="w-5 h-5 mr-2 text-blue-400" />
//                     📚 Reading Level: {assessment.readingLevel}
//                   </h3>
//                 </div>
//               )}

//               {/* AI Teacher Feedback */}
//               <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6 mb-8">
//                 <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
//                   <Star className="w-5 h-5 mr-2 text-yellow-400" />
//                   AI Teacher Feedback
//                 </h3>
//                 <p className="text-gray-200 leading-relaxed">
//                   {assessment.feedback}
//                 </p>
//               </div>

//               {/* Strengths and Improvements */}
//               {(assessment.strengths || assessment.improvements) && (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//                   {/* Strengths */}
//                   {assessment.strengths && (
//                     <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6">
//                       <h3 className="text-white font-semibold mb-4 flex items-center">
//                         <Star className="w-5 h-5 mr-2 text-green-400" />
//                         Your Strengths
//                       </h3>
//                       <div className="space-y-2">
//                         {(assessment.strengths || []).slice(0, 5).map((strength, index) => (
//                           <div key={index} className="flex items-center text-green-300 text-sm">
//                             <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
//                             {strength}
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {/* Areas for Improvement */}
//                   {assessment.improvements && (
//                     <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6">
//                       <h3 className="text-white font-semibold mb-4 flex items-center">
//                         <Target className="w-5 h-5 mr-2 text-yellow-400" />
//                         Areas to Improve
//                       </h3>
//                       <div className="space-y-2">
//                         {(assessment.improvements || []).map((improvement, index) => (
//                           <div key={index} className="flex items-center text-yellow-300 text-sm">
//                             <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
//                             {improvement}
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Vocabulary Analysis */}
//               {(assessment.vocabularyUsed || assessment.suggestedWords) && (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//                   {/* Great Words Used */}
//                   {assessment.vocabularyUsed && (
//                     <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6">
//                       <h3 className="text-white font-semibold mb-4 flex items-center">
//                         <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
//                         Great Words You Used
//                       </h3>
//                       <div className="flex flex-wrap gap-2">
//                         {(assessment.vocabularyUsed || []).map((word, index) => (
//                           <span
//                             key={index}
//                             className="bg-purple-600/30 text-purple-300 px-3 py-1 rounded-lg text-sm font-medium"
//                           >
//                             {word}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {/* New Words to Learn */}
//                   {assessment.suggestedWords && (
//                     <div className="bg-gradient-to-r from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 rounded-xl p-6">
//                       <h3 className="text-white font-semibold mb-4 flex items-center">
//                         <BookMarked className="w-5 h-5 mr-2 text-indigo-400" />
//                         New Words to Learn
//                       </h3>
//                       <div className="flex flex-wrap gap-2">
//                         {(assessment.suggestedWords || []).map((word, index) => (
//                           <span
//                             key={index}
//                             className="bg-indigo-600/30 text-indigo-300 px-3 py-1 rounded-lg text-sm font-medium"
//                           >
//                             {word}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Educational Insights */}
//               {assessment.educationalInsights && (
//                 <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl p-6 mb-8">
//                   <h3 className="text-white font-semibold mb-4 flex items-center">
//                     <Brain className="w-5 h-5 mr-2 text-green-400" />
//                     Educational Insights
//                   </h3>
//                   <p className="text-gray-300 leading-relaxed">
//                     {assessment.educationalInsights}
//                   </p>
//                 </div>
//               )}

//               {/* Action Buttons */}
//               <motion.div 
//                 className="flex flex-col sm:flex-row gap-3"
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.8 }}
//               >
//                 <motion.button
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={handlePublishStory}
//                   disabled={isPublishing}
//                   className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 px-6 rounded-xl font-medium transition-all disabled:cursor-not-allowed"
//                 >
//                   {isPublishing ? (
//                     <div className="flex items-center justify-center space-x-2">
//                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                       <span>Publishing...</span>
//                     </div>
//                   ) : (
//                     <div className="flex items-center justify-center space-x-2">
//                       <BookOpen className="w-4 h-4" />
//                       <span>🚀 Publish Story</span>
//                     </div>
//                   )}
//                 </motion.button>

//                 <motion.button
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={handleKeepEditing}
//                   className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-medium transition-all"
//                 >
//                   📝 Keep Editing
//                 </motion.button>

//                 <motion.button
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={() => {
//                     onClose();
//                     router.push('/children-dashboard/my-stories');
//                   }}
//                   className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl transition-all"
//                 >
//                   💾 Save as Draft
//                 </motion.button>
//               </motion.div>
//             </>
//           ) : (
//             <div className="text-center py-12">
//               <p className="text-white">No assessment available</p>
//               <button
//                 onClick={generateNewAssessment}
//                 className="mt-4 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white"
//               >
//                 Generate Assessment
//               </button>
//             </div>
//           )}
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// }

// components/stories/AssessmentModal.tsx - FIXED WITH PROPER INTERFACE
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  X,
  Star,
  Award,
  BookOpen,
  TrendingUp,
  Sparkles,
  Target,
  Brain,
  BookMarked,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  storySession: {
    _id: string;
    title: string;
    totalWords: number;
  } | null;
  turns: Array<{
    childInput: string;
    aiResponse: string;
  }>;
  assessment?: DetailedAssessment | null; // ← Added this prop
}

interface DetailedAssessment {
  grammarScore: number;
  creativityScore: number;
  overallScore: number;
  readingLevel?: string;
  vocabularyScore?: number;
  structureScore?: number;
  characterDevelopmentScore?: number;
  plotDevelopmentScore?: number;
  feedback: string;
  strengths?: string[];
  improvements?: string[];
  vocabularyUsed?: string[];
  suggestedWords?: string[];
  educationalInsights?: string;
}

export default function AssessmentModal({
  isOpen,
  onClose,
  storySession,
  turns,
  assessment: propAssessment, // ← Accept the assessment prop
}: AssessmentModalProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [assessment, setAssessment] = useState<DetailedAssessment | null>(propAssessment || null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // OPTIMIZATION: Add mounted ref for cleanup
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Update assessment when prop changes
  useEffect(() => {
    if (propAssessment && mountedRef.current) {
      console.log('📊 Received assessment prop:', propAssessment);
      setAssessment(propAssessment);
      setIsAssessing(false);
    }
  }, [propAssessment]);

  // When modal opens, try to get existing assessment first ONLY if no prop assessment
  useEffect(() => {
    if (isOpen && storySession && !propAssessment && !assessment && mountedRef.current) {
      console.log('🔍 No assessment prop, fetching from API...');
      fetchExistingAssessment();
    }
  }, [isOpen, storySession, propAssessment]);

  const fetchExistingAssessment = async () => {
    if (!storySession || !mountedRef.current) return;

    setIsAssessing(true);

    try {
      // Try to get existing assessment first
      const response = await fetch(`/api/stories/session/${storySession._id}/assessment`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.assessment && mountedRef.current) {
          setAssessment(data.assessment);
          setIsAssessing(false);
          return;
        }
      }

      // If no existing assessment, generate new one
      console.log('No existing assessment found, generating...');
      await generateNewAssessment();
      
    } catch (error) {
      console.error('Error fetching assessment:', error);
      await generateNewAssessment(); // Fallback to generation
    }
  };

  const generateNewAssessment = async () => {
    if (!storySession || !mountedRef.current) return;

    try {
      const response = await fetch(`/api/stories/assess/${storySession._id}`, {
        method: 'POST',
      });
      
      const data = await response.json();

      if (!response.ok || !data.assessment) {
        console.error('Assessment API error:', data.error);
        
        // Provide fallback assessment
        if (mountedRef.current) {
          setAssessment({
            grammarScore: 85,
            creativityScore: 88,
            overallScore: 86,
            readingLevel: 'Elementary',
            vocabularyScore: 82,
            structureScore: 84,
            characterDevelopmentScore: 86,
            plotDevelopmentScore: 87,
            feedback: 'Great work on your creative story! Your writing shows imagination and effort.',
            strengths: ['Creative imagination', 'Good story flow', 'Engaging characters', 'Descriptive writing', 'Story structure'],
            improvements: ['Add more dialogue', 'Use more descriptive words', 'Vary sentence length'],
            vocabularyUsed: ['adventure', 'mysterious', 'brave', 'discovered', 'amazing'],
            suggestedWords: ['magnificent', 'extraordinary', 'perilous', 'astonishing', 'triumphant'],
            educationalInsights: 'Keep developing your creative writing skills! Your storytelling abilities are improving.'
          });
          
          toast({
            title: '⚠️ Assessment Generated',
            description: 'Using default assessment scores.',
          });
        }
        return;
      }

      if (mountedRef.current) {
        setAssessment(data.assessment);
        
        toast({
          title: '📊 Assessment Complete!',
          description: 'Your story has been evaluated.',
        });
      }
      
    } catch (error) {
      console.error('Error generating assessment:', error);
      
      // Provide fallback assessment on error
      if (mountedRef.current) {
        setAssessment({
          grammarScore: 85,
          creativityScore: 88,
          overallScore: 86,
          readingLevel: 'Elementary',
          vocabularyScore: 82,
          structureScore: 84,
          characterDevelopmentScore: 86,
          plotDevelopmentScore: 87,
          feedback: 'Great work on your creative story! Assessment could not be fully generated, but your effort is commendable.',
          strengths: ['Creative imagination', 'Good story flow', 'Engaging characters'],
          improvements: ['Add more dialogue', 'Use more descriptive words', 'Vary sentence length'],
          vocabularyUsed: ['adventure', 'mysterious', 'brave', 'discovered', 'amazing'],
          suggestedWords: ['magnificent', 'extraordinary', 'perilous', 'astonishing', 'triumphant'],
          educationalInsights: 'Keep developing your creative writing skills!'
        });
        
        toast({
          title: '⚠️ Assessment Error',
          description: 'Using fallback scores.',
          variant: 'destructive',
        });
      }
    } finally {
      if (mountedRef.current) {
        setIsAssessing(false);
      }
    }
  };

  const handlePublishStory = async () => {
    if (!storySession || !assessment || !mountedRef.current) return;

    setIsPublishing(true);

    try {
      const response = await fetch('/api/stories/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: storySession._id,
          assessment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish story');
      }

      if (mountedRef.current) {
        toast({
          title: '🎉 Story Published!',
          description: 'Your amazing story is now in your library!',
        });

        onClose();
        router.push('/children-dashboard/my-stories');
      }
    } catch (error) {
      console.error('Error publishing story:', error);
      if (mountedRef.current) {
        toast({
          title: '❌ Error',
          description: 'Failed to publish story. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      if (mountedRef.current) {
        setIsPublishing(false);
      }
    }
  };

  const handleKeepEditing = () => {
    onClose();
    // Story remains in 'active' state for continued editing
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 90) return 'from-green-500 to-emerald-500';
    if (score >= 80) return 'from-blue-500 to-cyan-500';
    if (score >= 70) return 'from-yellow-500 to-orange-500';
    return 'from-orange-500 to-red-500';
  };

  if (!isOpen || !storySession) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gray-800 border border-gray-600 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              🎉 Story Complete! "{storySession.title}"
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Assessment Results */}
          {isAssessing ? (
            <div className="text-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full mx-auto mb-4"
              />
              <p className="text-white font-medium">
                Analyzing your amazing story...
              </p>
              <p className="text-gray-400 text-sm mt-2">
                This will just take a moment!
              </p>
            </div>
          ) : assessment ? (
            <>
              {/* Main Score Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Grammar Score */}
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <div className={`text-3xl font-bold mb-2 ${getScoreColor(assessment.grammarScore)}`}>
                    {assessment.grammarScore}%
                  </div>
                  <div className="text-gray-300 text-sm font-medium">
                    Grammar & Writing
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                    <motion.div
                      className={`bg-gradient-to-r ${getScoreBarColor(assessment.grammarScore)} h-2 rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${assessment.grammarScore}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </div>
                </div>

                {/* Creativity Score */}
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6 text-center">
                  <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <div className={`text-3xl font-bold mb-2 ${getScoreColor(assessment.creativityScore)}`}>
                    {assessment.creativityScore}%
                  </div>
                  <div className="text-gray-300 text-sm font-medium">
                    Creativity & Ideas
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                    <motion.div
                      className={`bg-gradient-to-r ${getScoreBarColor(assessment.creativityScore)} h-2 rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${assessment.creativityScore}%` }}
                      transition={{ duration: 1, delay: 0.4 }}
                    />
                  </div>
                </div>

                {/* Overall Score */}
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6 text-center">
                  <Award className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <div className={`text-3xl font-bold mb-2 ${getScoreColor(assessment.overallScore)}`}>
                    {assessment.overallScore}%
                  </div>
                  <div className="text-gray-300 text-sm font-medium">
                    Overall Score
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                    <motion.div
                      className={`bg-gradient-to-r ${getScoreBarColor(assessment.overallScore)} h-2 rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${assessment.overallScore}%` }}
                      transition={{ duration: 1, delay: 0.6 }}
                    />
                  </div>
                </div>
              </div>

              {/* Detailed Assessment Scores */}
              {(assessment.vocabularyScore || assessment.structureScore || assessment.characterDevelopmentScore || assessment.plotDevelopmentScore) && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Vocabulary', score: assessment.vocabularyScore || 0, color: 'orange' },
                    { label: 'Structure', score: assessment.structureScore || 0, color: 'cyan' },
                    { label: 'Character Dev.', score: assessment.characterDevelopmentScore || 0, color: 'pink' },
                    { label: 'Plot Dev.', score: assessment.plotDevelopmentScore || 0, color: 'indigo' },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-700/30 rounded-lg p-3 text-center">
                      <div className={`text-lg font-bold text-${item.color}-400`}>
                        {item.score}%
                      </div>
                      <div className="text-gray-300 text-xs">{item.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reading Level */}
              {assessment.readingLevel && (
                <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-500/30 mb-6">
                  <h3 className="text-white font-semibold mb-2 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-blue-400" />
                    📚 Reading Level: {assessment.readingLevel}
                  </h3>
                </div>
              )}

              {/* AI Teacher Feedback */}
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-400" />
                  AI Teacher Feedback
                </h3>
                <p className="text-gray-200 leading-relaxed">
                  {assessment.feedback}
                </p>
              </div>

              {/* Strengths and Improvements */}
              {(assessment.strengths || assessment.improvements) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Strengths */}
                  {assessment.strengths && (
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6">
                      <h3 className="text-white font-semibold mb-4 flex items-center">
                        <Star className="w-5 h-5 mr-2 text-green-400" />
                        Your Strengths
                      </h3>
                      <div className="space-y-2">
                        {(assessment.strengths || []).slice(0, 5).map((strength, index) => (
                          <div key={index} className="flex items-center text-green-300 text-sm">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                            {strength}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Areas for Improvement */}
                  {assessment.improvements && (
                    <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6">
                      <h3 className="text-white font-semibold mb-4 flex items-center">
                        <Target className="w-5 h-5 mr-2 text-yellow-400" />
                        Areas to Improve
                      </h3>
                      <div className="space-y-2">
                        {(assessment.improvements || []).map((improvement, index) => (
                          <div key={index} className="flex items-center text-yellow-300 text-sm">
                            <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                            {improvement}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Vocabulary Analysis */}
              {(assessment.vocabularyUsed || assessment.suggestedWords) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Great Words Used */}
                  {assessment.vocabularyUsed && (
                    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6">
                      <h3 className="text-white font-semibold mb-4 flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
                        Great Words You Used
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(assessment.vocabularyUsed || []).map((word, index) => (
                          <span
                            key={index}
                            className="bg-purple-600/30 text-purple-300 px-3 py-1 rounded-lg text-sm font-medium"
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Words to Learn */}
                  {assessment.suggestedWords && (
                    <div className="bg-gradient-to-r from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 rounded-xl p-6">
                      <h3 className="text-white font-semibold mb-4 flex items-center">
                        <BookMarked className="w-5 h-5 mr-2 text-indigo-400" />
                        New Words to Learn
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(assessment.suggestedWords || []).map((word, index) => (
                          <span
                            key={index}
                            className="bg-indigo-600/30 text-indigo-300 px-3 py-1 rounded-lg text-sm font-medium"
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Educational Insights */}
              {assessment.educationalInsights && (
                <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl p-6 mb-8">
                  <h3 className="text-white font-semibold mb-4 flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-green-400" />
                    Educational Insights
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {assessment.educationalInsights}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePublishStory}
                  disabled={isPublishing}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 px-6 rounded-xl font-medium transition-all disabled:cursor-not-allowed"
                >
                  {isPublishing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Publishing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <BookOpen className="w-4 h-4" />
                      <span>🚀 Publish Story</span>
                    </div>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleKeepEditing}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-medium transition-all"
                >
                  📝 Keep Editing
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onClose();
                    router.push('/children-dashboard/my-stories');
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl transition-all"
                >
                  💾 Save as Draft
                </motion.button>
              </motion.div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-white">No assessment available</p>
              <button
                onClick={generateNewAssessment}
                className="mt-4 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white"
              >
                Generate Assessment
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}