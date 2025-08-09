'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  Shield,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Trophy,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  storySession: {
    _id: string;
    title: string;
    totalWords: number;
    childWords: number;
    assessmentAttempts: number;
    isUploadedForAssessment?: boolean;
  } | null;
  turns?: Array<{
    childInput: string;
    aiResponse: string;
  }>;
  assessment?: DetailedAssessment | null;
}

interface DetailedAssessment {
  // Core scores
  grammarScore: number;
  creativityScore: number;
  vocabularyScore: number;
  structureScore: number;
  characterDevelopmentScore: number;
  plotDevelopmentScore: number;
  overallScore: number;
  readingLevel: string;
  
  // Feedback
  feedback: string;
  strengths: string[];
  improvements: string[];
  educationalInsights?: string;
  
  // NEW: Advanced integrity fields
  plagiarismScore?: number;
  aiDetectionScore?: number;
  integrityRisk?: 'low' | 'medium' | 'high' | 'critical';
  integrityAnalysis?: {
    originalityScore: number;
    plagiarismScore: number;
    aiDetectionScore: number;
    integrityRisk: string;
    plagiarismRiskLevel: string;
    aiDetectionLikelihood: string;
  };
  
  // Enhanced features
  recommendations?: {
    immediate: string[];
    longTerm: string[];
    practiceExercises: string[];
  };
  progressTracking?: {
    improvementSince: string;
    scoreChange: number;
    strengthsGained: string[];
    areasImproved: string[];
  };
  assessmentVersion?: string;
}

export default function AssessmentModal({
  isOpen,
  onClose,
  storySession,
  turns = [],
  assessment: propAssessment,
}: AssessmentModalProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [assessment, setAssessment] = useState<DetailedAssessment | null>(propAssessment || null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showDetailedView, setShowDetailedView] = useState(false);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (propAssessment && mountedRef.current) {
      setAssessment(propAssessment);
      setIsAssessing(false);
    }
  }, [propAssessment]);

  const generateNewAssessment = useCallback(async () => {
    if (!storySession || !mountedRef.current) return;

    setIsAssessing(true);

    try {
      const endpoint = storySession.isUploadedForAssessment 
        ? `/api/stories/assessment/${storySession._id}`
        : `/api/stories/assess/${storySession._id}`;

      const response = await fetch(endpoint, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok || !data.assessment) {
        throw new Error(data.error || 'Assessment failed');
      }

      if (mountedRef.current) {
        setAssessment(data.assessment);
        
        if (data.assessment.integrityRisk === 'critical') {
          toast({
            title: '⚠️ Integrity Issue Detected',
            description: 'Your story has been flagged for review.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: '🎉 Assessment Complete!',
            description: `Your story scored ${data.assessment.overallScore}%`,
          });
        }
      }
    } catch (error) {
      console.error('Assessment error:', error);
      if (mountedRef.current) {
        toast({
          title: '❌ Assessment Failed',
          description: error instanceof Error ? error.message : 'Please try again',
          variant: 'destructive',
        });
      }
    } finally {
      if (mountedRef.current) {
        setIsAssessing(false);
      }
    }
  }, [storySession, toast]);

  const fetchExistingAssessment = useCallback(async () => {
    if (!storySession || !mountedRef.current) return;

    setIsAssessing(true);

    try {
      const response = await fetch(`/api/stories/session/${storySession._id}/assessment`);

      if (response.ok) {
        const data = await response.json();
        if (data.assessment && mountedRef.current) {
          setAssessment(data.assessment);
          setIsAssessing(false);
          return;
        }
      }

      await generateNewAssessment();
    } catch (error) {
      console.error('Error fetching assessment:', error);
      await generateNewAssessment();
    }
  }, [storySession, generateNewAssessment]);

  useEffect(() => {
    if (isOpen && storySession && !propAssessment && !assessment && mountedRef.current) {
      fetchExistingAssessment();
    }
  }, [isOpen, storySession, propAssessment, assessment, fetchExistingAssessment]);

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

 const getScoreColor = (score: number) => {
   if (score >= 90) return 'text-green-400';
   if (score >= 80) return 'text-blue-400';
   if (score >= 70) return 'text-yellow-400';
   return 'text-orange-400';
 };

 const getScoreEmoji = (score: number) => {
   if (score >= 90) return '🌟';
   if (score >= 80) return '⭐';
   if (score >= 70) return '✨';
   return '💫';
 };

 const getIntegrityIcon = (risk: string) => {
   switch (risk) {
     case 'low': return <CheckCircle className="w-5 h-5 text-green-400" />;
     case 'medium': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
     case 'high': return <AlertTriangle className="w-5 h-5 text-orange-400" />;
     case 'critical': return <AlertTriangle className="w-5 h-5 text-red-400" />;
     default: return <Shield className="w-5 h-5 text-gray-400" />;
   }
 };

 const canReassess = storySession && storySession.assessmentAttempts < 3;

 if (!isOpen) return null;

 return (
   <AnimatePresence>
     <motion.div
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       exit={{ opacity: 0 }}
       className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
       onClick={onClose}
     >
       <motion.div
         initial={{ opacity: 0, scale: 0.95, y: 20 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         exit={{ opacity: 0, scale: 0.95, y: 20 }}
         transition={{ type: 'spring', damping: 30, stiffness: 300 }}
         className="bg-gray-900/95 backdrop-blur-xl border border-gray-600/40 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
         onClick={(e) => e.stopPropagation()}
       >
         {/* Header */}
         <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border-b border-gray-600/40 p-6">
           <div className="flex items-center justify-between">
             <div>
               <h2 className="text-2xl font-bold text-white mb-1">
                 📊 Story Assessment
               </h2>
               <p className="text-gray-300">
                 {storySession?.title} • {storySession?.childWords || storySession?.totalWords} words
               </p>
             </div>
             <button
               onClick={onClose}
               className="p-2 text-gray-400 hover:text-white transition-colors"
             >
               <X size={24} />
             </button>
           </div>
         </div>

         <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
           {isAssessing ? (
             <div className="text-center py-12">
               <Loader2 className="w-12 h-12 text-green-400 mx-auto mb-4 animate-spin" />
               <h3 className="text-white font-bold text-xl mb-2">
                 Analyzing Your Story...
               </h3>
               <p className="text-gray-400 mb-4">
                 Running advanced AI assessment with integrity analysis
               </p>
               <div className="text-sm text-gray-500">
                 This may take 30-60 seconds
               </div>
             </div>
           ) : assessment ? (
             <div className="space-y-6">
               
               {/* Integrity Analysis Warning */}
               {assessment.integrityAnalysis && assessment.integrityAnalysis.integrityRisk !== 'low' && (
                 <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className={`border rounded-xl p-4 ${
                     assessment.integrityAnalysis.integrityRisk === 'critical'
                       ? 'bg-red-600/20 border-red-500/30'
                       : assessment.integrityAnalysis.integrityRisk === 'high'
                       ? 'bg-orange-600/20 border-orange-500/30'
                       : 'bg-yellow-600/20 border-yellow-500/30'
                   }`}
                 >
                   <div className="flex items-start gap-3">
                     {getIntegrityIcon(assessment.integrityAnalysis.integrityRisk)}
                     <div className="flex-1">
                       <h3 className={`font-bold mb-2 ${
                         assessment.integrityAnalysis.integrityRisk === 'critical' ? 'text-red-300' :
                         assessment.integrityAnalysis.integrityRisk === 'high' ? 'text-orange-300' :
                         'text-yellow-300'
                       }`}>
                         Integrity Analysis
                       </h3>
                       
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                         <div className="text-center">
                           <div className="text-lg font-bold text-white">
                             {assessment.integrityAnalysis.originalityScore}%
                           </div>
                           <div className="text-gray-300 text-sm">Originality</div>
                         </div>
                         <div className="text-center">
                           <div className="text-lg font-bold text-white">
                             {100 - assessment.integrityAnalysis.plagiarismScore}%
                           </div>
                           <div className="text-gray-300 text-sm">Unique Content</div>
                         </div>
                         <div className="text-center">
                           <div className="text-lg font-bold text-white">
                             {100 - assessment.integrityAnalysis.aiDetectionScore}%
                           </div>
                           <div className="text-gray-300 text-sm">Human-like</div>
                         </div>
                       </div>

                       {assessment.integrityAnalysis.integrityRisk === 'critical' && (
                         <div className="bg-red-700/30 rounded-lg p-3">
                           <p className="text-red-200 text-sm">
                             ⚠️ This story has been flagged for manual review due to potential integrity concerns. 
                             Please ensure all content is your original work.
                           </p>
                         </div>
                       )}

                       {assessment.integrityAnalysis.plagiarismScore > 20 && (
                         <div className="bg-orange-700/30 rounded-lg p-3 mt-2">
                           <p className="text-orange-200 text-sm">
                             🔍 Potential similarity to existing content detected. Ensure your work is original.
                           </p>
                         </div>
                       )}

                       {assessment.integrityAnalysis.aiDetectionScore > 70 && (
                         <div className="bg-yellow-700/30 rounded-lg p-3 mt-2">
                           <p className="text-yellow-200 text-sm">
                             🤖 Content may appear AI-generated. Submit only your own original writing.
                           </p>
                         </div>
                       )}
                     </div>
                   </div>
                 </motion.div>
               )}

               {/* Overall Score */}
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
                 className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-xl p-6 text-center"
               >
                 <div className="flex items-center justify-center gap-3 mb-4">
                   <Award className="w-8 h-8 text-blue-400" />
                   <h3 className="text-2xl font-bold text-white">Overall Score</h3>
                 </div>
                 <div className={`text-6xl font-bold mb-2 ${getScoreColor(assessment.overallScore)}`}>
                   {getScoreEmoji(assessment.overallScore)} {assessment.overallScore}%
                 </div>
                 <div className="text-gray-300 text-lg">{assessment.readingLevel} Level</div>
               </motion.div>

               {/* Category Scores */}
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
                 className="bg-gray-800/60 border border-gray-600/40 rounded-xl p-6"
               >
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-xl font-bold text-white flex items-center gap-2">
                     <Target className="w-6 h-6 text-purple-400" />
                     Detailed Breakdown
                   </h3>
                   <button
                     onClick={() => setShowDetailedView(!showDetailedView)}
                     className="text-green-400 hover:text-green-300 text-sm font-medium transition-colors"
                   >
                     {showDetailedView ? 'Simple View' : 'Detailed View'}
                   </button>
                 </div>
                 
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                   {[
                     { label: 'Grammar', score: assessment.grammarScore, icon: BookOpen, color: 'blue' },
                     { label: 'Creativity', score: assessment.creativityScore, icon: Sparkles, color: 'purple' },
                     { label: 'Vocabulary', score: assessment.vocabularyScore, icon: Target, color: 'green' },
                     { label: 'Structure', score: assessment.structureScore, icon: Award, color: 'orange' },
                     { label: 'Characters', score: assessment.characterDevelopmentScore, icon: Star, color: 'pink' },
                     { label: 'Plot', score: assessment.plotDevelopmentScore, icon: TrendingUp, color: 'cyan' },
                   ].map((category, index) => (
                     <motion.div
                       key={category.label}
                       initial={{ opacity: 0, scale: 0.9 }}
                       animate={{ opacity: 1, scale: 1 }}
                       transition={{ delay: 0.3 + index * 0.05 }}
                       className="bg-gray-700/50 rounded-lg p-4 text-center hover:bg-gray-700/70 transition-colors"
                     >
                       <category.icon className={`w-6 h-6 mx-auto mb-2 text-${category.color}-400`} />
                       <div className={`text-xl font-bold mb-1 ${getScoreColor(category.score)}`}>
                         {category.score}%
                       </div>
                       <div className="text-gray-400 text-sm">{category.label}</div>
                       
                       {showDetailedView && (
                         <div className="mt-2">
                           <div className="w-full bg-gray-600 rounded-full h-2">
                             <div
                               className={`h-2 rounded-full bg-gradient-to-r ${
                                 category.score >= 90 ? 'from-green-500 to-green-400' :
                                 category.score >= 80 ? 'from-blue-500 to-blue-400' :
                                 category.score >= 70 ? 'from-yellow-500 to-yellow-400' :
                                 'from-orange-500 to-orange-400'
                               }`}
                               style={{ width: `${category.score}%` }}
                             />
                           </div>
                         </div>
                       )}
                     </motion.div>
                   ))}
                 </div>
               </motion.div>

               {/* Feedback Sections */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 
                 {/* Strengths */}
                 {assessment.strengths && assessment.strengths.length > 0 && (
                   <motion.div
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.4 }}
                     className="bg-green-600/20 border border-green-500/30 rounded-xl p-6"
                   >
                     <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                       <Star className="w-5 h-5 text-green-400" />
                       Your Strengths
                     </h3>
                     <ul className="space-y-2">
                       {assessment.strengths.slice(0, 4).map((strength, index) => (
                         <motion.li
                           key={index}
                           initial={{ opacity: 0, x: -10 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: 0.5 + index * 0.1 }}
                           className="text-green-300 text-sm flex items-start gap-2"
                         >
                           <span className="text-green-400 mt-1">✓</span>
                           {strength}
                         </motion.li>
                       ))}
                     </ul>
                   </motion.div>
                 )}

                 {/* Areas for Improvement */}
                 {assessment.improvements && assessment.improvements.length > 0 && (
                   <motion.div
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.4 }}
                     className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-6"
                   >
                     <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                       <Target className="w-5 h-5 text-blue-400" />
                       Growth Areas
                     </h3>
                     <ul className="space-y-2">
                       {assessment.improvements.slice(0, 4).map((improvement, index) => (
                         <motion.li
                           key={index}
                           initial={{ opacity: 0, x: 10 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: 0.5 + index * 0.1 }}
                           className="text-blue-300 text-sm flex items-start gap-2"
                         >
                           <span className="text-blue-400 mt-1">→</span>
                           {improvement}
                         </motion.li>
                       ))}
                     </ul>
                   </motion.div>
                 )}
               </div>

               {/* Teacher Feedback */}
               {assessment.feedback && (
                 <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.6 }}
                   className="bg-purple-600/20 border border-purple-500/30 rounded-xl p-6"
                 >
                   <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                     <Brain className="w-5 h-5 text-purple-400" />
                     Teacher's Comment
                   </h3>
                   <p className="text-gray-300 leading-relaxed">
                     {assessment.feedback}
                   </p>
                 </motion.div>
               )}

               {/* Educational Insights */}
               {assessment.educationalInsights && (
                 <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.7 }}
                   className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-xl p-6"
                 >
                   <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                     <BookMarked className="w-5 h-5 text-green-400" />
                     Keep Writing!
                   </h3>
                   <p className="text-gray-300 leading-relaxed">
                     {assessment.educationalInsights}
                   </p>
                 </motion.div>
               )}

               {/* Recommendations */}
               {assessment.recommendations && (
                 <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.8 }}
                   className="bg-gray-800/60 border border-gray-600/40 rounded-xl p-6"
                 >
                   <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                     <Target className="w-5 h-5 text-yellow-400" />
                     Personalized Recommendations
                   </h3>
                   
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     {assessment.recommendations.immediate && (
                       <div>
                         <h4 className="text-green-400 font-medium mb-2">Try Next:</h4>
                         <ul className="space-y-1">
                           {assessment.recommendations.immediate.slice(0, 3).map((rec, index) => (
                             <li key={index} className="text-gray-300 text-sm">• {rec}</li>
                           ))}
                         </ul>
                       </div>
                     )}
                     
                     {assessment.recommendations.longTerm && (
                       <div>
                         <h4 className="text-blue-400 font-medium mb-2">This Month:</h4>
                         <ul className="space-y-1">
                           {assessment.recommendations.longTerm.slice(0, 3).map((rec, index) => (
                             <li key={index} className="text-gray-300 text-sm">• {rec}</li>
                           ))}
                         </ul>
                       </div>
                     )}
                     
                     {assessment.recommendations.practiceExercises && (
                       <div>
                         <h4 className="text-purple-400 font-medium mb-2">Practice:</h4>
                         <ul className="space-y-1">
                           {assessment.recommendations.practiceExercises.slice(0, 3).map((rec, index) => (
                             <li key={index} className="text-gray-300 text-sm">• {rec}</li>
                           ))}
                         </ul>
                       </div>
                     )}
                   </div>
                 </motion.div>
               )}

               {/* Progress Tracking */}
               {assessment.progressTracking && (
                 <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.9 }}
                   className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6"
                 >
                   <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                     <TrendingUp className="w-5 h-5 text-purple-400" />
                     Your Writing Journey
                   </h3>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {assessment.progressTracking.scoreChange !== 0 && (
                       <div>
                         <h4 className="text-white font-medium mb-2">Score Progress:</h4>
                         <div className={`text-lg font-bold ${
                           assessment.progressTracking.scoreChange > 0 ? 'text-green-400' : 'text-orange-400'
                         }`}>
                           {assessment.progressTracking.scoreChange > 0 ? '+' : ''}
                           {assessment.progressTracking.scoreChange}% since last story
                         </div>
                       </div>
                     )}
                     
                     {assessment.progressTracking.strengthsGained && assessment.progressTracking.strengthsGained.length > 0 && (
                       <div>
                         <h4 className="text-white font-medium mb-2">New Strengths:</h4>
                         <ul className="space-y-1">
                           {assessment.progressTracking.strengthsGained.slice(0, 2).map((strength, index) => (
                             <li key={index} className="text-green-300 text-sm">• {strength}</li>
                           ))}
                         </ul>
                       </div>
                     )}
                   </div>
                 </motion.div>
               )}
             </div>
           ) : (
             <div className="text-center py-12">
               <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
               <h3 className="text-white font-bold text-xl mb-4">No Assessment Available</h3>
               <p className="text-gray-400 mb-6">
                 Get detailed AI feedback on your story with advanced analysis
               </p>
               <button
                 onClick={generateNewAssessment}
                 disabled={!canReassess}
                 className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto ${
                   canReassess
                     ? 'bg-green-600 hover:bg-green-700 text-white'
                     : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                 }`}
               >
                 <Brain size={20} />
                 Generate Assessment
                 {!canReassess && (
                   <span className="text-xs">(Max attempts reached)</span>
                 )}
               </button>
             </div>
           )}
         </div>

         {/* Footer Actions */}
         {assessment && (
           <div className="border-t border-gray-600/40 p-6">
             <div className="flex flex-col sm:flex-row gap-3 justify-center">
               
               {canReassess && (
                 <button
                   onClick={generateNewAssessment}
                   disabled={isAssessing}
                   className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                 >
                   <RefreshCw size={20} />
                   Reassess Story
                   <span className="text-xs">
                     ({3 - (storySession?.assessmentAttempts || 0)} left)
                   </span>
                 </button>
               )}

               {!storySession?.isUploadedForAssessment && assessment.integrityRisk !== 'critical' && (
                 <button
                   onClick={handlePublishStory}
                   disabled={isPublishing}
                   className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                 >
                   {isPublishing ? (
                     <>
                       <Loader2 className="w-5 h-5 animate-spin" />
                       Publishing...
                     </>
                   ) : (
                     <>
                       <Star size={20} />
                       Publish Story - $10
                     </>
                   )}
                 </button>
               )}

               <button
                 onClick={() => {
                   onClose();
                   router.push('/children-dashboard/my-stories');
                 }}
                 className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
               >
                 <BookOpen size={20} />
                 View All Stories
               </button>

               <button
                 onClick={() => router.push('/create-stories')}
                 className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
               >
                 <Sparkles size={20} />
                 Write New Story
               </button>
             </div>
           </div>
         )}
       </motion.div>
     </motion.div>
   </AnimatePresence>
 );
}