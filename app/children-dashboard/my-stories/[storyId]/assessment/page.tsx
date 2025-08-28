// //app/children-dashboard/my-stories/[storyId]/assessment/page.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react';
// import { useRouter, useParams } from 'next/navigation';
// import Link from 'next/link';
// import {
//   ArrowLeft,
//   Brain,
//   BookOpen,
//   Trophy,
//   Star,
//   Target,
//   Award,
//   Shield,
//   CheckCircle,
//   AlertTriangle,
//   XCircle,
// } from 'lucide-react';
// import { motion } from 'framer-motion';
// import TerminalLoader from '../../../../../components/TerminalLoader';

// interface Assessment {
//   overallScore?: number;
//   grammarScore?: number;
//   creativityScore?: number;
//   vocabularyScore?: number;
//   structureScore?: number;
//   characterDevelopmentScore?: number;
//   plotDevelopmentScore?: number;
//   themeScore?: number;
//   dialogueScore?: number;
//   descriptiveScore?: number;
//   pacingScore?: number;
//   readingLevel?: string;
//   feedback?: string;
//   strengths?: string[];
//   improvements?: string[];
//   encouragement?: string;
//   integrityAnalysis?: {
//     plagiarismResult?: {
//       overallScore?: number;
//       riskLevel?: string;
//     };
//     aiDetectionResult?: {
//       likelihood?: string;
//       confidence?: number;
//     };
//     integrityRisk?: string;
//   };
//   integrityStatus?: {
//     status: 'PASS' | 'WARNING' | 'FAIL';
//     message: string;
//   };
//   assessmentDate?: string;
// }

// interface Story {
//   _id: string;
//   title: string;
//   status: string;
//   assessment?: Assessment;
//   createdAt: string;
//   completedAt?: string;
// }

// export default function StoryAssessmentPage() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const params = useParams();
//   const storyId = params.storyId as string;

//   const [story, setStory] = useState<Story | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchStoryAssessment = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(`/api/user/stories/${storyId}`);
//         const data = await response.json();

//         if (data.success && data.story) {
//           setStory(data.story);
//           if (!data.story.assessment) {
//             setError('Assessment not available for this story.');
//           }
//         } else {
//           throw new Error(data.error || 'Failed to fetch story assessment');
//         }
//       } catch (error) {
//         console.error('Error fetching story assessment:', error);
//         setError('Failed to load assessment. Please try again.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (status === 'loading') return;

//     if (status === 'unauthenticated') {
//       router.push('/login/child');
//       return;
//     }

//     if (status === 'authenticated' && storyId) {
//       fetchStoryAssessment();
//     }
//   }, [status, storyId, router]);

//   const getScoreColor = (score: number) => {
//     if (score >= 90) return 'text-green-500';
//     if (score >= 80) return 'text-blue-500';
//     if (score >= 70) return 'text-yellow-500';
//     if (score >= 60) return 'text-orange-500';
//     return 'text-red-500';
//   };

//   const getScoreBg = (score: number) => {
//     if (score >= 90) return 'bg-green-500/10 border-green-500/30';
//     if (score >= 80) return 'bg-blue-500/10 border-blue-500/30';
//     if (score >= 70) return 'bg-yellow-500/10 border-yellow-500/30';
//     if (score >= 60) return 'bg-orange-500/10 border-orange-500/30';
//     return 'bg-red-500/10 border-red-500/30';
//   };

//   const getStatusText = (score: number) => {
//     if (score >= 95) return 'EXCEPTIONAL WORK';
//     if (score >= 90) return 'EXCELLENT WORK';
//     if (score >= 80) return 'GREAT WORK';
//     if (score >= 70) return 'GOOD WORK';
//     if (score >= 60) return 'SATISFACTORY WORK';
//     return 'NEEDS IMPROVEMENT';
//   };

//   const getIntegrityIcon = (status?: string) => {
//     if (status === 'FAIL') return <XCircle className="w-6 h-6 text-red-500" />;
//     if (status === 'WARNING')
//       return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
//     return <CheckCircle className="w-6 h-6 text-green-500" />;
//   };

//   if (loading || status === 'loading') {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-green-900 flex items-center justify-center">
//         <TerminalLoader loadingText="Loading assessment details..." />
//       </div>
//     );
//   }

//   if (status === 'unauthenticated') {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-green-900 flex items-center justify-center">
//         <div className="text-center max-w-md mx-auto px-6">
//           <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//           <h2 className="text-xl  text-white mb-2">Login Required</h2>
//           <p className="text-gray-400 mb-6">
//             Please log in to view your story assessment.
//           </p>
//           <Link
//             href="/login/child"
//             className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3  transition-colors inline-flex items-center gap-2"
//           >
//             <ArrowLeft size={16} />
//             Login
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   if (error || !story) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-green-900 flex items-center justify-center">
//         <div className="text-center max-w-md mx-auto px-6">
//           <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//           <h2 className="text-xl  text-white mb-2">Assessment Not Available</h2>
//           <p className="text-gray-400 mb-6">
//             {error || 'Assessment data is not available for this story.'}
//           </p>
//           <Link
//             href={`/children-dashboard/my-stories/${storyId}`}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3  transition-colors inline-flex items-center gap-2"
//           >
//             <ArrowLeft size={16} />
//             Back to Story
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   if (!story.assessment) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-green-900 flex items-center justify-center">
//         <div className="text-center max-w-md mx-auto px-6">
//           <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//           <h2 className="text-xl  text-white mb-2">Assessment Not Available</h2>
//           <p className="text-gray-400 mb-6">
//             This story hasn&apos;t been assessed yet. Complete your story to get
//             detailed feedback!
//           </p>
//           <Link
//             href={`/children-dashboard/my-stories/${storyId}`}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3  transition-colors inline-flex items-center gap-2"
//           >
//             <ArrowLeft size={16} />
//             Back to Story
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   const assessment = story.assessment;
//   const overallScore = assessment.overallScore || 0;
//   const statusText = getStatusText(overallScore);
//   const integrityStatus = assessment.integrityStatus?.status || 'PASS';

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-green-900">
//       <div className="container mx-auto px-4 py-8 max-w-6xl">
//         {/* Back Navigation */}
//         <motion.div
//           initial={{ opacity: 0, x: -20 }}
//           animate={{ opacity: 1, x: 0 }}
//           className="mb-6"
//         >
//           <Link
//             href={`/children-dashboard/my-stories/${storyId}`}
//             className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
//           >
//             <ArrowLeft size={20} />
//             <span>Back to Story</span>
//           </Link>
//         </motion.div>

//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="text-center mb-8"
//         >
//           <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600  flex items-center justify-center mx-auto mb-4">
//             <Trophy className="w-8 h-8 text-white" />
//           </div>
//           <h1 className="text-3xl  text-white mb-2">Assessment Results</h1>
//           <h2 className="text-xl text-gray-300 mb-4">
//             &ldquo;{story.title}&rdquo;
//           </h2>
//           <div className="text-gray-400">Comprehensive Writing Analysis</div>
//         </motion.div>

//         {/* Overall Score Banner */}
//         <motion.div
//           initial={{ opacity: 0, scale: 0.95 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ delay: 0.1 }}
//           className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-8 mb-8 text-center"
//         >
//           <div className="flex items-center justify-center mb-6">
//             <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600  flex items-center justify-center mr-6">
//               <Trophy className="w-8 h-8 text-white" />
//             </div>
//             <div>
//               <div className="text-5xl  text-white mb-2">{overallScore}%</div>
//               <div className="text-lg text-gray-300">Overall Score</div>
//             </div>
//           </div>
//           <div
//             className={`inline-block px-6 py-3  border ${getScoreBg(overallScore)}`}
//           >
//             <div className={` text-lg ${getScoreColor(overallScore)}`}>
//               {statusText}
//             </div>
//           </div>
//         </motion.div>

//         {/* Content Integrity Check */}
//         {assessment.integrityStatus && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-6 mb-8"
//           >
//             <div className="flex items-center gap-3 mb-6">
//               {getIntegrityIcon(integrityStatus)}
//               <h3 className="text-xl  text-white">Content Integrity</h3>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               {/* Originality Check */}
//               <div className="bg-gray-700/40 border border-gray-600/30  p-4">
//                 <div className="flex items-center gap-2 mb-3">
//                   <CheckCircle className="w-5 h-5 text-green-500" />
//                   <h4 className=" text-white">Original Content</h4>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-3xl  text-green-500 mb-1">
//                     {assessment.integrityAnalysis?.plagiarismResult
//                       ?.overallScore || 100}
//                     %
//                   </div>
//                   <div className="text-sm text-gray-400">
//                     No plagiarism detected
//                   </div>
//                 </div>
//               </div>

//               {/* AI Detection - Show actual percentage */}
//               <div className="bg-gray-700/40 border border-gray-600/30  p-4">
//                 <div className="flex items-center gap-2 mb-3">
//                   <Brain className="w-5 h-5 text-orange-500" />
//                   <h4 className=" text-white">AI Detection</h4>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-3xl  text-orange-500 mb-1">
//                     {assessment.integrityAnalysis?.aiDetectionResult
//                       ?.confidence || 0}
//                     %
//                   </div>
//                   <div className="text-sm text-gray-400">
//                     Likelihood of AI generation
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Overall Assessment */}
//             <div
//               className={`mt-6 p-4  border ${
//                 integrityStatus === 'FAIL'
//                   ? 'bg-red-500/10 border-red-500/30'
//                   : integrityStatus === 'WARNING'
//                     ? 'bg-yellow-500/10 border-yellow-500/30'
//                     : 'bg-green-500/10 border-green-500/30'
//               }`}
//             >
//               <div className="flex items-center gap-2 mb-2">
//                 {getIntegrityIcon(integrityStatus)}
//                 <span
//                   className={` ${
//                     integrityStatus === 'FAIL'
//                       ? 'text-red-400'
//                       : integrityStatus === 'WARNING'
//                         ? 'text-yellow-400'
//                         : 'text-green-400'
//                   }`}
//                 >
//                   {integrityStatus === 'WARNING'
//                     ? 'Possible AI Content Detected'
//                     : integrityStatus === 'FAIL'
//                       ? 'High AI Content Detected'
//                       : 'Human-Written Content'}
//                 </span>
//               </div>
//               <p className="text-gray-300 text-sm">
//                 {integrityStatus === 'WARNING'
//                   ? `This content shows ${assessment.integrityAnalysis?.aiDetectionResult?.confidence || 0}% likelihood of AI generation.`
//                   : integrityStatus === 'FAIL'
//                     ? `This content appears to be primarily AI-generated (${assessment.integrityAnalysis?.aiDetectionResult?.confidence || 0}% confidence).`
//                     : 'This content appears to be original human writing.'}
//               </p>
//             </div>
//           </motion.div>
//         )}

//         {/* Detailed Scores */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.3 }}
//           className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-6 mb-8"
//         >
//           <div className="flex items-center gap-3 mb-6">
//             <BookOpen className="w-6 h-6 text-purple-500" />
//             <h3 className="text-xl  text-white">Detailed Scores</h3>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {[
//               { key: 'grammarScore', label: 'Grammar', icon: BookOpen },
//               { key: 'vocabularyScore', label: 'Vocabulary', icon: Brain },
//               { key: 'creativityScore', label: 'Creativity', icon: Star },
//               { key: 'structureScore', label: 'Structure', icon: Target },
//               {
//                 key: 'characterDevelopmentScore',
//                 label: 'Characters',
//                 icon: Trophy,
//               },
//               { key: 'plotDevelopmentScore', label: 'Plot', icon: Award },
//             ].map(({ key, label, icon: Icon }) => {
//               const score = assessment[key as keyof Assessment] as number;
//               if (score === undefined) return null;

//               return (
//                 <div
//                   key={key}
//                   className={`bg-gray-700/40 border border-gray-600/30  p-4 text-center`}
//                 >
//                   <div className="flex items-center justify-center gap-2 mb-2">
//                     <Icon className="w-4 h-4 text-gray-400" />
//                     <span className="text-sm  text-gray-300">{label}</span>
//                   </div>
//                   <div className={`text-2xl  ${getScoreColor(score)}`}>
//                     {score}
//                   </div>
//                   <div className="text-xs text-gray-500">out of 100</div>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Reading Level */}
//           {assessment.readingLevel && (
//             <div className="mt-6 p-4 bg-gray-700/40 border border-gray-600/30  text-center">
//               <div className="flex items-center justify-center gap-2">
//                 <BookOpen className="w-5 h-5 text-blue-500" />
//                 <span className="text-white ">
//                   Reading Level:{' '}
//                   <span className="text-blue-400">
//                     {assessment.readingLevel}
//                   </span>
//                 </span>
//               </div>
//             </div>
//           )}
//         </motion.div>

//         {/* Feedback Section */}
//         {(assessment.feedback ||
//           assessment.strengths?.length ||
//           assessment.improvements?.length) && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.4 }}
//             className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-6 mb-8"
//           >
//             <div className="flex items-center gap-3 mb-6">
//               <Star className="w-6 h-6 text-yellow-500" />
//               <h3 className="text-xl  text-white">Feedback</h3>
//             </div>

//             {assessment.feedback && (
//               <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 ">
//                 <h4 className=" text-blue-400 mb-2">Overall Feedback:</h4>
//                 <p className="text-gray-300">{assessment.feedback}</p>
//               </div>
//             )}

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               {/* Strengths */}
//               {assessment.strengths && assessment.strengths.length > 0 && (
//                 <div className="bg-green-500/10 border border-green-500/30  p-4">
//                   <h4 className=" text-green-400 mb-3 flex items-center gap-2">
//                     <CheckCircle className="w-5 h-5" />
//                     Your Strengths
//                   </h4>
//                   <ul className="space-y-2">
//                     {assessment.strengths.map((strength, index) => (
//                       <li
//                         key={index}
//                         className="text-gray-300 flex items-start gap-2"
//                       >
//                         <span className="text-green-500 mt-1">•</span>
//                         <span className="text-sm">{strength}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               )}

//               {/* Areas for Improvement */}
//               {assessment.improvements &&
//                 assessment.improvements.length > 0 && (
//                   <div className="bg-yellow-500/10 border border-yellow-500/30  p-4">
//                     <h4 className=" text-yellow-400 mb-3 flex items-center gap-2">
//                       <Target className="w-5 h-5" />
//                       Areas to Improve
//                     </h4>
//                     <ul className="space-y-2">
//                       {assessment.improvements.map((improvement, index) => (
//                         <li
//                           key={index}
//                           className="text-gray-300 flex items-start gap-2"
//                         >
//                           <span className="text-yellow-500 mt-1">•</span>
//                           <span className="text-sm">{improvement}</span>
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}
//             </div>

//             {/* Encouragement */}
//             {assessment.encouragement && (
//               <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 ">
//                 <h4 className=" text-purple-400 mb-2 flex items-center gap-2">
//                   <Award className="w-5 h-5" />
//                   Encouragement
//                 </h4>
//                 <p className="text-gray-300">{assessment.encouragement}</p>
//               </div>
//             )}
//           </motion.div>
//         )}

//         {/* Action Buttons */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.5 }}
//           className="flex flex-col sm:flex-row justify-center gap-4"
//         >
//           <Link
//             href={`/children-dashboard/my-stories/${storyId}`}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3  transition-colors flex items-center justify-center gap-2"
//           >
//             <ArrowLeft size={16} />
//             Back to Story
//           </Link>
//           <Link
//             href="/children-dashboard/my-stories"
//             className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3  transition-colors flex items-center justify-center gap-2"
//           >
//             <BookOpen size={16} />
//             All Stories
//           </Link>
//         </motion.div>

//         {/* Assessment Info */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.6 }}
//           className="text-center mt-8"
//         >
//           <p className="text-gray-400 leading-relaxed">
//             🎉 This assessment provides detailed feedback to help you grow as a
//             writer. Keep practicing and exploring your creativity!
//           </p>
//           {assessment.assessmentDate && (
//             <p className="text-sm text-gray-500 mt-2">
//               Assessment completed on:{' '}
//               {new Date(assessment.assessmentDate).toLocaleDateString()}
//             </p>
//           )}
//         </motion.div>
//       </div>
//     </div>
//   );
// }

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Brain,
  BookOpen,
  Trophy,
  Star,
  Target,
  Award,
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Download,
  FileText,
} from 'lucide-react';
import { motion } from 'framer-motion';
import TerminalLoader from '../../../../../components/TerminalLoader';

interface Assessment {
  overallScore?: number;
  grammarScore?: number;
  creativityScore?: number;
  vocabularyScore?: number;
  structureScore?: number;
  characterDevelopmentScore?: number;
  plotDevelopmentScore?: number;
  themeScore?: number;
  dialogueScore?: number;
  descriptiveScore?: number;
  pacingScore?: number;
  readingLevel?: string;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
  encouragement?: string;
  integrityAnalysis?: {
    plagiarismResult?: {
      overallScore?: number;
      riskLevel?: string;
    };
    aiDetectionResult?: {
      likelihood?: string;
      confidence?: number;
    };
    integrityRisk?: string;
  };
  integrityStatus?: {
    status: 'PASS' | 'WARNING' | 'FAIL';
    message: string;
  };
  assessmentDate?: string;
  // Enhanced assessment fields for export
  coreWritingSkills?: {
    grammar?: { score: number; feedback: string };
    vocabulary?: { score: number; feedback: string };
    creativity?: { score: number; feedback: string };
    structure?: { score: number; feedback: string };
  };
  storyDevelopment?: {
    characterDevelopment?: { score: number; feedback: string };
    plotDevelopment?: { score: number; feedback: string };
    descriptiveWriting?: { score: number; feedback: string };
  };
  comprehensiveFeedback?: {
    strengths?: string[];
    areasForEnhancement?: string[];
    nextSteps?: string[];
    teacherAssessment?: string;
  };
  ageAnalysis?: {
    ageAppropriateness: number;
    readingLevel: string;
    contentSuitability: string;
  };
}

interface Story {
  _id: string;
  title: string;
  status: string;
  assessment?: Assessment;
  createdAt: string;
  completedAt?: string;
  totalWords?: number;
  aiOpening?: string;
  content?: string;
  elements?: {
    genre: string;
    character: string;
    setting: string;
    theme: string;
    mood: string;
    tone: string;
  };
}

export default function StoryAssessmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const storyId = params.storyId as string;

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingWord, setDownloadingWord] = useState(false);

  useEffect(() => {
    const fetchStoryAssessment = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/user/stories/${storyId}`);
        const data = await response.json();

        if (data.success && data.story) {
          setStory(data.story);
          if (!data.story.assessment) {
            setError('Assessment not available for this story.');
          }
        } else {
          throw new Error(data.error || 'Failed to fetch story assessment');
        }
      } catch (error) {
        console.error('Error fetching story assessment:', error);
        setError('Failed to load assessment. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/login/child');
      return;
    }

    if (status === 'authenticated' && storyId) {
      fetchStoryAssessment();
    }
  }, [status, storyId, router]);

  const handleDownload = async (format: 'pdf' | 'word') => {
    if (!story) return;

    const setDownloadState = format === 'pdf' ? setDownloadingPDF : setDownloadingWord;
    
    try {
      setDownloadState(true);
      
      const response = await fetch(`/api/stories/export/${storyId}/${format}`);
      
      if (!response.ok) {
        throw new Error(`Failed to download ${format.toUpperCase()}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${story.title}_assessment.${format === 'pdf' ? 'pdf' : 'docx'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error downloading ${format}:`, error);
      alert(`Failed to download ${format.toUpperCase()}. Please try again.`);
    } finally {
      setDownloadState(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 80) return 'text-blue-500';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-500/10 border-green-500/30';
    if (score >= 80) return 'bg-blue-500/10 border-blue-500/30';
    if (score >= 70) return 'bg-yellow-500/10 border-yellow-500/30';
    if (score >= 60) return 'bg-orange-500/10 border-orange-500/30';
    return 'bg-red-500/10 border-red-500/30';
  };

  const getStatusText = (score: number) => {
    if (score >= 95) return 'EXCEPTIONAL WORK';
    if (score >= 90) return 'EXCELLENT WORK';
    if (score >= 80) return 'GREAT WORK';
    if (score >= 70) return 'GOOD WORK';
    if (score >= 60) return 'SATISFACTORY WORK';
    return 'NEEDS IMPROVEMENT';
  };

  const getIntegrityIcon = (status?: string) => {
    if (status === 'FAIL') return <XCircle className="w-6 h-6 text-red-500" />;
    if (status === 'WARNING')
      return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
    return <CheckCircle className="w-6 h-6 text-green-500" />;
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-green-900 flex items-center justify-center">
        <TerminalLoader loadingText="Loading assessment details..." />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-green-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl  text-white mb-2">Login Required</h2>
          <p className="text-gray-400 mb-6">
            Please log in to view your story assessment.
          </p>
          <Link
            href="/login/child"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3  transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-green-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl  text-white mb-2">Assessment Not Available</h2>
          <p className="text-gray-400 mb-6">
            {error || 'Assessment data is not available for this story.'}
          </p>
          <Link
            href={`/children-dashboard/my-stories/${storyId}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3  transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Story
          </Link>
        </div>
      </div>
    );
  }

  if (!story.assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-green-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl  text-white mb-2">Assessment Not Available</h2>
          <p className="text-gray-400 mb-6">
            This story hasn&apos;t been assessed yet. Complete your story to get
            detailed feedback!
          </p>
          <Link
            href={`/children-dashboard/my-stories/${storyId}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3  transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Story
          </Link>
        </div>
      </div>
    );
  }

  const assessment = story.assessment;
  const overallScore = assessment.overallScore || 0;
  const statusText = getStatusText(overallScore);
  const integrityStatus = assessment.integrityStatus?.status || 'PASS';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-green-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            href={`/children-dashboard/my-stories/${storyId}`}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Story</span>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600  flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl  text-white mb-2">Assessment Results</h1>
          <h2 className="text-xl text-gray-300 mb-4">
            &ldquo;{story.title}&rdquo;
          </h2>
          <div className="text-gray-400">Comprehensive Writing Analysis</div>
        </motion.div>

        {/* Download Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row justify-center gap-4 mb-8"
        >
          <button
            onClick={() => handleDownload('pdf')}
            disabled={downloadingPDF}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3  transition-colors flex items-center justify-center gap-2"
          >
            {downloadingPDF ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download size={16} />
            )}
            {downloadingPDF ? 'Generating PDF...' : 'Download PDF Report'}
          </button>
          
          <button
            onClick={() => handleDownload('word')}
            disabled={downloadingWord}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3  transition-colors flex items-center justify-center gap-2"
          >
            {downloadingWord ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileText size={16} />
            )}
            {downloadingWord ? 'Generating Word...' : 'Download Word Report'}
          </button>
        </motion.div>

        {/* Overall Score Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-8 mb-8 text-center"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600  flex items-center justify-center mr-6">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-5xl  text-white mb-2">{overallScore}%</div>
              <div className="text-lg text-gray-300">Overall Score</div>
            </div>
          </div>
          <div
            className={`inline-block px-6 py-3  border ${getScoreBg(overallScore)}`}
          >
            <div className={` text-lg ${getScoreColor(overallScore)}`}>
              {statusText}
            </div>
          </div>
        </motion.div>

        {/* Content Integrity Check */}
        {assessment.integrityStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-6 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              {getIntegrityIcon(integrityStatus)}
              <h3 className="text-xl  text-white">Content Integrity</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Originality Check */}
              <div className="bg-gray-700/40 border border-gray-600/30  p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <h4 className=" text-white">Original Content</h4>
                </div>
                <div className="text-center">
                  <div className="text-3xl  text-green-500 mb-1">
                    {assessment.integrityAnalysis?.plagiarismResult
                      ?.overallScore || 100}
                    %
                  </div>
                  <div className="text-sm text-gray-400">
                    No plagiarism detected
                  </div>
                </div>
              </div>

              {/* AI Detection - Show actual percentage */}
              <div className="bg-gray-700/40 border border-gray-600/30  p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-5 h-5 text-orange-500" />
                  <h4 className=" text-white">AI Detection</h4>
                </div>
                <div className="text-center">
                  <div className="text-3xl  text-orange-500 mb-1">
                    {assessment.integrityAnalysis?.aiDetectionResult
                      ?.confidence || 0}
                    %
                  </div>
                  <div className="text-sm text-gray-400">
                    Likelihood of AI generation
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Assessment */}
            <div
              className={`mt-6 p-4  border ${
                integrityStatus === 'FAIL'
                  ? 'bg-red-500/10 border-red-500/30'
                  : integrityStatus === 'WARNING'
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-green-500/10 border-green-500/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {getIntegrityIcon(integrityStatus)}
                <span
                  className={` ${
                    integrityStatus === 'FAIL'
                      ? 'text-red-400'
                      : integrityStatus === 'WARNING'
                        ? 'text-yellow-400'
                        : 'text-green-400'
                  }`}
                >
                  {integrityStatus === 'WARNING'
                    ? 'Possible AI Content Detected'
                    : integrityStatus === 'FAIL'
                      ? 'High AI Content Detected'
                      : 'Human-Written Content'}
                </span>
              </div>
              <p className="text-gray-300 text-sm">
                {integrityStatus === 'WARNING'
                  ? `This content shows ${assessment.integrityAnalysis?.aiDetectionResult?.confidence || 0}% likelihood of AI generation.`
                  : integrityStatus === 'FAIL'
                    ? `This content appears to be primarily AI-generated (${assessment.integrityAnalysis?.aiDetectionResult?.confidence || 0}% confidence).`
                    : 'This content appears to be original human writing.'}
              </p>
            </div>
          </motion.div>
        )}

        {/* Detailed Scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6 text-purple-500" />
            <h3 className="text-xl  text-white">Detailed Scores</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'grammarScore', label: 'Grammar', icon: BookOpen },
              { key: 'vocabularyScore', label: 'Vocabulary', icon: Brain },
              { key: 'creativityScore', label: 'Creativity', icon: Star },
              { key: 'structureScore', label: 'Structure', icon: Target },
              {
                key: 'characterDevelopmentScore',
                label: 'Characters',
                icon: Trophy,
              },
              { key: 'plotDevelopmentScore', label: 'Plot', icon: Award },
            ].map(({ key, label, icon: Icon }) => {
              const score = assessment[key as keyof Assessment] as number;
              if (score === undefined) return null;

              return (
                <div
                  key={key}
                  className={`bg-gray-700/40 border border-gray-600/30  p-4 text-center`}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm  text-gray-300">{label}</span>
                  </div>
                  <div className={`text-2xl  ${getScoreColor(score)}`}>
                    {score}
                  </div>
                  <div className="text-xs text-gray-500">out of 100</div>
                </div>
              );
            })}
          </div>

          {/* Reading Level */}
          {assessment.readingLevel && (
            <div className="mt-6 p-4 bg-gray-700/40 border border-gray-600/30  text-center">
              <div className="flex items-center justify-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                <span className="text-white ">
                  Reading Level:{' '}
                  <span className="text-blue-400">
                    {assessment.readingLevel}
                  </span>
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Feedback Section */}
        {(assessment.feedback ||
          assessment.strengths?.length ||
          assessment.improvements?.length) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-6 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-6 h-6 text-yellow-500" />
              <h3 className="text-xl  text-white">Feedback</h3>
            </div>

            {assessment.feedback && (
              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 ">
                <h4 className=" text-blue-400 mb-2">Overall Feedback:</h4>
                <p className="text-gray-300">{assessment.feedback}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strengths */}
              {assessment.strengths && assessment.strengths.length > 0 && (
                <div className="bg-green-500/10 border border-green-500/30  p-4">
                  <h4 className=" text-green-400 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Your Strengths
                  </h4>
                  <ul className="space-y-2">
                    {assessment.strengths.map((strength, index) => (
                      <li
                        key={index}
                        className="text-gray-300 flex items-start gap-2"
                      >
                        <span className="text-green-500 mt-1">•</span>
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Areas for Improvement */}
              {assessment.improvements &&
                assessment.improvements.length > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30  p-4">
                    <h4 className=" text-yellow-400 mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Areas to Improve
                    </h4>
                    <ul className="space-y-2">
                      {assessment.improvements.map((improvement, index) => (
                        <li
                          key={index}
                          className="text-gray-300 flex items-start gap-2"
                        >
                          <span className="text-yellow-500 mt-1">•</span>
                          <span className="text-sm">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>

            {/* Encouragement */}
            {assessment.encouragement && (
              <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 ">
                <h4 className=" text-purple-400 mb-2 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Encouragement
                </h4>
                <p className="text-gray-300">{assessment.encouragement}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <Link
            href={`/children-dashboard/my-stories/${storyId}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3  transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Story
          </Link>
          <Link
            href="/children-dashboard/my-stories"
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3  transition-colors flex items-center justify-center gap-2"
          >
            <BookOpen size={16} />
            All Stories
          </Link>
        </motion.div>

        {/* Assessment Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-8"
        >
          <p className="text-gray-400 leading-relaxed">
            This assessment provides detailed feedback to help you grow as a
            writer. Keep practicing and exploring your creativity!
          </p>
          {assessment.assessmentDate && (
            <p className="text-sm text-gray-500 mt-2">
              Assessment completed on:{' '}
              {new Date(assessment.assessmentDate).toLocaleDateString()}
            </p>
          )}
          <p className="text-xs text-gray-600 mt-3">
            Download your complete assessment report with detailed analysis to keep track of your writing progress.
          </p>
        </motion.div>
      </div>
    </div>
  );
}