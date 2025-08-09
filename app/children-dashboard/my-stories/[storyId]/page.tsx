// 'use client';

// import { useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
// import { motion } from 'framer-motion';
// import {
//   ArrowLeft,
//   Eye,
//   Edit,
//   Award,
//   BookOpen,
//   Clock,
//   Star,
//   Trophy,
//   Share2,
//   Download,
//   RefreshCw,
//   Shield,
//   AlertTriangle,
//   CheckCircle,
//   Brain,
// } from 'lucide-react';

// interface Story {
//   _id: string;
//   title: string;
//   storyNumber: number;
//   status: string;
//   totalWords: number;
//   childWords: number;
//   isUploadedForAssessment: boolean;
//   isPublished: boolean;
//   competitionEligible: boolean;
//   createdAt: string;
//   updatedAt: string;
//   elements?: {
//     genre?: string;
//     character?: string;
//     setting?: string;
//     theme?: string;
//     mood?: string;
//     tone?: string;
//   };
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
//     educationalInsights: string;
//     plagiarismScore: number;
//     aiDetectionScore: number;
//     integrityRisk: string;
//     integrityAnalysis: {
//       originalityScore: number;
//       plagiarismScore: number;
//       aiDetectionScore: number;
//       integrityRisk: string;
//     };
//     assessmentDate: string;
//   };
//   content?: string;
//   competitionEntries?: Array<{
//     competitionId: string;
//     submittedAt: string;
//     rank?: number;
//     score?: number;
//   }>;
// }

// export default function StoryDetailPage({ params }: { params: { storyId: string } }) {
//   const { data: session } = useSession();
//   const router = useRouter();
//   const [story, setStory] = useState<Story | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [showContent, setShowContent] = useState(false);

//   useEffect(() => {
//     if (!session) {
//       router.push('/login/child');
//       return;
//     }
//     fetchStory();
//   }, [session, params.storyId]);

//   const fetchStory = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(`/api/user/stories/${params.storyId}`);
      
//       if (response.ok) {
//         const data = await response.json();
//         setStory(data.story);
//       } else {
//         throw new Error('Story not found');
//       }
//     } catch (error) {
//       console.error('Error fetching story:', error);
//       router.push('/children-dashboard/my-stories');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getScoreColor = (score: number) => {
//     if (score >= 90) return 'text-green-400';
//     if (score >= 80) return 'text-blue-400';
//     if (score >= 70) return 'text-yellow-400';
//     return 'text-orange-400';
//   };

//   const getIntegrityIcon = (risk: string) => {
//     switch (risk) {
//       case 'low': return <CheckCircle className="w-5 h-5 text-green-400" />;
//       case 'medium': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
//       case 'high': return <AlertTriangle className="w-5 h-5 text-orange-400" />;
//       case 'critical': return <AlertTriangle className="w-5 h-5 text-red-400" />;
//       default: return <Shield className="w-5 h-5 text-gray-400" />;
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
//         <div className="text-white text-xl">Loading story...</div>
//       </div>
//     );
//   }

//   if (!story) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-white text-2xl mb-4">Story Not Found</h2>
//           <button
//             onClick={() => router.push('/children-dashboard/my-stories')}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
//           >
//             Back to Stories
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 py-20">
//       <div className="max-w-4xl mx-auto px-6">
        
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="mb-8"
//         >
//           <button
//             onClick={() => router.push('/children-dashboard/my-stories')}
//             className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
//           >
//             <ArrowLeft size={20} />
//             Back to My Stories
//           </button>
          
//           <div className="text-center">
//             <h1 className="text-4xl font-bold text-white mb-2">
//               {story.title}
//             </h1>
//             <div className="flex items-center justify-center gap-4 text-gray-300 mb-4">
//               <span>📝 {story.childWords} words</span>
//               <span>📅 {new Date(story.createdAt).toLocaleDateString()}</span>
//               <span className={`px-2 py-1 rounded text-sm capitalize ${
//                 story.status === 'completed' ? 'bg-green-600/20 text-green-300' :
//                 story.status === 'active' ? 'bg-blue-600/20 text-blue-300' :
//                 'bg-gray-600/20 text-gray-300'
//               }`}>
//                 {story.status}
//               </span>
//             </div>
            
//             <div className="flex items-center justify-center gap-2">
//               {story.isUploadedForAssessment && (
//                 <span className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm">
//                   Assessment Upload
//                 </span>
//               )}
//               {story.isPublished && (
//                 <span className="bg-yellow-600/20 text-yellow-300 px-3 py-1 rounded-full text-sm flex items-center gap-1">
//                   <Star size={14} />
//                   Published
//                 </span>
//               )}
//               {story.competitionEntries && story.competitionEntries.length > 0 && (
//                 <span className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm flex items-center gap-1">
//                   <Trophy size={14} />
//                   Competition Entry
//                 </span>
//               )}
//             </div>
//           </div>
//         </motion.div>

//         <div className="space-y-8">
          
//           {/* Story Elements */}
//           {story.elements && Object.values(story.elements).some(v => v && v.trim()) && (
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.1 }}
//               className="bg-gray-800/60 border border-gray-600/40 rounded-xl p-6"
//             >
//               <h2 className="text-xl font-bold text-white mb-4">Story Elements</h2>
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                 {Object.entries(story.elements)
//                   .filter(([_, value]) => value && value.trim())
//                   .map(([type, value]) => (
//                     <div key={type} className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-3">
//                       <div className="text-purple-300 text-sm font-medium capitalize mb-1">
//                         {type}
//                       </div>
//                       <div className="text-white">{value}</div>
//                     </div>
//                   ))}
//               </div>
//             </motion.div>
//           )}

//           {/* Assessment Results */}
//           {story.assessment && (
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.2 }}
//               className="space-y-6"
//             >
              
//               {/* Integrity Warning */}
//               {story.assessment.integrityAnalysis && 
//                story.assessment.integrityAnalysis.integrityRisk !== 'low' && (
//                 <div className={`border rounded-xl p-6 ${
//                   story.assessment.integrityAnalysis.integrityRisk === 'critical'
//                     ? 'bg-red-600/20 border-red-500/30'
//                     : story.assessment.integrityAnalysis.integrityRisk === 'high'
//                     ? 'bg-orange-600/20 border-orange-500/30'
//                     : 'bg-yellow-600/20 border-yellow-500/30'
//                 }`}>
//                   <div className="flex items-start gap-3">
//                     {getIntegrityIcon(story.assessment.integrityAnalysis.integrityRisk)}
//                     <div>
//                       <h3 className={`font-bold mb-2 ${
//                         story.assessment.integrityAnalysis.integrityRisk === 'critical' ? 'text-red-300' :
//                         story.assessment.integrityAnalysis.integrityRisk === 'high' ? 'text-orange-300' :
//                         'text-yellow-300'
//                       }`}>
//                         Integrity Review Required
//                       </h3>
//                       <p className="text-gray-300 text-sm">
//                         {story.assessment.integrityAnalysis.integrityRisk === 'critical' 
//                          ? 'This story has been flagged for manual review due to serious integrity concerns.'
//                          : story.assessment.integrityAnalysis.integrityRisk === 'high'
//                          ? 'This story has potential integrity issues that need attention.'
//                          : 'This story has minor integrity concerns to review.'
//                        }
//                      </p>
                     
//                      <div className="grid grid-cols-3 gap-4 mt-4">
//                        <div className="text-center">
//                          <div className="text-lg font-bold text-white">
//                            {story.assessment.integrityAnalysis.originalityScore}%
//                          </div>
//                          <div className="text-gray-300 text-xs">Originality</div>
//                        </div>
//                        <div className="text-center">
//                          <div className="text-lg font-bold text-white">
//                            {100 - story.assessment.integrityAnalysis.plagiarismScore}%
//                          </div>
//                          <div className="text-gray-300 text-xs">Unique</div>
//                        </div>
//                        <div className="text-center">
//                          <div className="text-lg font-bold text-white">
//                            {100 - story.assessment.integrityAnalysis.aiDetectionScore}%
//                          </div>
//                          <div className="text-gray-300 text-xs">Human-like</div>
//                        </div>
//                      </div>
//                    </div>
//                  </div>
//                </div>
//              )}

//              {/* Overall Score */}
//              <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-xl p-6 text-center">
//                <div className="flex items-center justify-center gap-3 mb-4">
//                  <Award className="w-8 h-8 text-blue-400" />
//                  <h2 className="text-2xl font-bold text-white">Assessment Score</h2>
//                </div>
//                <div className={`text-5xl font-bold mb-2 ${getScoreColor(story.assessment.overallScore)}`}>
//                  {story.assessment.overallScore >= 90 ? '🌟' : 
//                   story.assessment.overallScore >= 80 ? '⭐' : 
//                   story.assessment.overallScore >= 70 ? '✨' : '💫'} {story.assessment.overallScore}%
//                </div>
//                <div className="text-gray-300 text-lg">{story.assessment.readingLevel} Level</div>
//                <div className="text-gray-400 text-sm mt-2">
//                  Assessed on {new Date(story.assessment.assessmentDate).toLocaleDateString()}
//                </div>
//              </div>

//              {/* Category Breakdown */}
//              <div className="bg-gray-800/60 border border-gray-600/40 rounded-xl p-6">
//                <h3 className="text-xl font-bold text-white mb-6">Score Breakdown</h3>
               
//                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                  {[
//                    { label: 'Grammar', score: story.assessment.grammarScore },
//                    { label: 'Creativity', score: story.assessment.creativityScore },
//                    { label: 'Vocabulary', score: story.assessment.vocabularyScore },
//                    { label: 'Structure', score: story.assessment.structureScore },
//                    { label: 'Characters', score: story.assessment.characterDevelopmentScore },
//                    { label: 'Plot', score: story.assessment.plotDevelopmentScore },
//                  ].map((category, index) => (
//                    <div key={category.label} className="bg-gray-700/50 rounded-lg p-4 text-center">
//                      <div className={`text-xl font-bold mb-1 ${getScoreColor(category.score)}`}>
//                        {category.score}%
//                      </div>
//                      <div className="text-gray-400 text-sm">{category.label}</div>
//                      <div className="mt-2">
//                        <div className="w-full bg-gray-600 rounded-full h-1.5">
//                          <div
//                            className={`h-1.5 rounded-full ${
//                              category.score >= 90 ? 'bg-green-500' :
//                              category.score >= 80 ? 'bg-blue-500' :
//                              category.score >= 70 ? 'bg-yellow-500' :
//                              'bg-orange-500'
//                            }`}
//                            style={{ width: `${category.score}%` }}
//                          />
//                        </div>
//                      </div>
//                    </div>
//                  ))}
//                </div>
//              </div>

//              {/* Feedback */}
//              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               
//                {/* Strengths */}
//                {story.assessment.strengths && story.assessment.strengths.length > 0 && (
//                  <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-6">
//                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
//                      <Star className="w-5 h-5 text-green-400" />
//                      Your Strengths
//                    </h3>
//                    <ul className="space-y-2">
//                      {story.assessment.strengths.map((strength, index) => (
//                        <li key={index} className="text-green-300 text-sm flex items-start gap-2">
//                          <span className="text-green-400 mt-1">✓</span>
//                          {strength}
//                        </li>
//                      ))}
//                    </ul>
//                  </div>
//                )}

//                {/* Improvements */}
//                {story.assessment.improvements && story.assessment.improvements.length > 0 && (
//                  <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-6">
//                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
//                      <Brain className="w-5 h-5 text-blue-400" />
//                      Growth Areas
//                    </h3>
//                    <ul className="space-y-2">
//                      {story.assessment.improvements.map((improvement, index) => (
//                        <li key={index} className="text-blue-300 text-sm flex items-start gap-2">
//                          <span className="text-blue-400 mt-1">→</span>
//                          {improvement}
//                        </li>
//                      ))}
//                    </ul>
//                  </div>
//                )}
//              </div>

//              {/* Teacher Feedback */}
//              {story.assessment.feedback && (
//                <div className="bg-purple-600/20 border border-purple-500/30 rounded-xl p-6">
//                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
//                    <Brain className="w-5 h-5 text-purple-400" />
//                    Teacher's Comment
//                  </h3>
//                  <p className="text-gray-300 leading-relaxed">
//                    {story.assessment.feedback}
//                  </p>
//                </div>
//              )}

//              {/* Educational Insights */}
//              {story.assessment.educationalInsights && (
//                <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-xl p-6">
//                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
//                    <BookOpen className="w-5 h-5 text-green-400" />
//                    Keep Writing!
//                  </h3>
//                  <p className="text-gray-300 leading-relaxed">
//                    {story.assessment.educationalInsights}
//                  </p>
//                </div>
//              )}
//            </motion.div>
//          )}

//          {/* Competition History */}
//          {story.competitionEntries && story.competitionEntries.length > 0 && (
//            <motion.div
//              initial={{ opacity: 0, y: 20 }}
//              animate={{ opacity: 1, y: 0 }}
//              transition={{ delay: 0.3 }}
//              className="bg-purple-600/20 border border-purple-500/30 rounded-xl p-6"
//            >
//              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
//                <Trophy className="w-6 h-6 text-purple-400" />
//                Competition History
//              </h2>
             
//              <div className="space-y-3">
//                {story.competitionEntries.map((entry, index) => (
//                  <div key={index} className="bg-gray-700/50 rounded-lg p-4">
//                    <div className="flex items-center justify-between">
//                      <div>
//                        <div className="text-white font-medium">Competition Entry</div>
//                        <div className="text-gray-400 text-sm">
//                          Submitted {new Date(entry.submittedAt).toLocaleDateString()}
//                        </div>
//                      </div>
//                      {entry.rank && (
//                        <div className="text-yellow-400 font-bold text-lg">
//                          #{entry.rank}
//                        </div>
//                      )}
//                    </div>
//                    {entry.score && (
//                      <div className="mt-2 text-purple-300">
//                        Competition Score: {entry.score}%
//                      </div>
//                    )}
//                  </div>
//                ))}
//              </div>
//            </motion.div>
//          )}

//          {/* Story Content */}
//          {story.content && (
//            <motion.div
//              initial={{ opacity: 0, y: 20 }}
//              animate={{ opacity: 1, y: 0 }}
//              transition={{ delay: 0.4 }}
//              className="bg-gray-800/60 border border-gray-600/40 rounded-xl p-6"
//            >
//              <div className="flex items-center justify-between mb-4">
//                <h2 className="text-xl font-bold text-white flex items-center gap-2">
//                  <BookOpen className="w-6 h-6 text-blue-400" />
//                  Story Content
//                </h2>
//                <button
//                  onClick={() => setShowContent(!showContent)}
//                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
//                >
//                  <Eye size={16} />
//                  {showContent ? 'Hide' : 'Show'} Content
//                </button>
//              </div>
             
//              {showContent && (
//                <div className="bg-gray-700/50 rounded-lg p-6">
//                  <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
//                    {story.content}
//                  </div>
//                </div>
//              )}
//            </motion.div>
//          )}

//          {/* Actions */}
//          <motion.div
//            initial={{ opacity: 0, y: 20 }}
//            animate={{ opacity: 1, y: 0 }}
//            transition={{ delay: 0.5 }}
//            className="flex flex-col sm:flex-row gap-4 justify-center"
//          >
//            {story.status === 'active' && (
//              <button
//                onClick={() => router.push(`/children-dashboard/story/${story._id}`)}
//                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
//              >
//                <Edit className="w-5 h-5" />
//                Continue Writing
//              </button>
//            )}

//            {story.assessment && (
//              <button
//                onClick={() => router.push(`/children-dashboard/assessment/${story._id}`)}
//                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
//              >
//                <Award className="w-5 h-5" />
//                View Full Assessment
//              </button>
//            )}

//            {!story.isPublished && story.status === 'completed' && story.assessment && (
//              <button
//                onClick={() => router.push(`/children-dashboard/story/${story._id}?action=publish`)}
//                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
//              >
//                <Star className="w-5 h-5" />
//                Publish Story - $10
//              </button>
//            )}

//            <button
//              onClick={() => router.push('/children-dashboard/my-stories')}
//              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
//            >
//              <BookOpen className="w-5 h-5" />
//              Back to Stories
//            </button>
//          </motion.div>
//        </div>
//      </div>
//    </div>
//  );
// }

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Star,
  Upload,
  Shield,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Eye,
  Trophy,
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
  storyMode: 'guided' | 'freeform';
  currentTurn: number;
  totalWords: number;
  childWords: number;
  apiCallsUsed: number;
  maxApiCalls: number;
  status: 'active' | 'completed' | 'paused' | 'flagged';
  aiOpening?: string;
  isUploadedForAssessment?: boolean;
  assessment?: {
    overallScore: number;
    grammarScore: number;
    creativityScore: number;
    vocabularyScore: number;
    structureScore: number;
    characterDevelopmentScore: number;
    plotDevelopmentScore: number;
    readingLevel: string;
    feedback: string;
    strengths: string[];
    improvements: string[];
    educationalInsights: string;
    plagiarismScore: number;
    aiDetectionScore: number;
    integrityRisk: 'low' | 'medium' | 'high' | 'critical';
    integrityAnalysis: {
      originalityScore: number;
      plagiarismScore: number;
      aiDetectionScore: number;
      integrityRisk: string;
    };
    assessmentDate: string;
    assessmentVersion: string;
  };
  assessmentAttempts: number;
  isPublished?: boolean;
  competitionEligible?: boolean;
}

interface Turn {
  _id: string;
  turnNumber: number;
  childInput: string;
  aiResponse: string;
  wordCount: number;
  createdAt: string;
}

export default function StorySessionPage({ params }: { params: { sessionId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [storySession, setStorySession] = useState<StorySession | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAssessment, setShowAssessment] = useState(false);
  const [isValidInput, setIsValidInput] = useState(false);
  const [currentWordCount, setCurrentWordCount] = useState(0);
  const [autoSaving, setAutoSaving] = useState(false);
  const [showPublishFlow, setShowPublishFlow] = useState(false);

  const storyContentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  const maxTurns = 7;
  const action = searchParams?.get('action');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'child') {
      router.push('/login/child');
      return;
    }
    fetchStorySession();
  }, [session, status, params.sessionId]);

  useEffect(() => {
    if (action === 'publish' && storySession?.status === 'completed' && storySession.assessment) {
      setShowPublishFlow(true);
    }
  }, [action, storySession]);

  useEffect(() => {
    // Auto-save functionality
    if (currentInput.trim() && storySession?.status === 'active') {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave();
      }, 2000); // Auto-save after 2 seconds of inactivity
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [currentInput]);

  const fetchStorySession = async () => {
    try {
      setIsLoading(true);
      
      const [sessionResponse, turnsResponse] = await Promise.all([
        fetch(`/api/stories/session/${params.sessionId}`),
        fetch(`/api/stories/session/${params.sessionId}/turns`)
      ]);

      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        setStorySession(sessionData.session);
      } else {
        throw new Error('Story session not found');
      }

      if (turnsResponse.ok) {
        const turnsData = await turnsResponse.json();
        setTurns(turnsData.turns || []);
      }

    } catch (error) {
      console.error('Error fetching story session:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to load story session',
        variant: 'destructive',
      });
      router.push('/children-dashboard/my-stories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoSave = async () => {
    if (!currentInput.trim() || !storySession) return;

    setAutoSaving(true);
    try {
      await fetch(`/api/stories/session/${params.sessionId}/draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          draftContent: currentInput,
          turnNumber: storySession.currentTurn,
        }),
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setAutoSaving(false);
    }
  };

  const handleSubmitTurn = async () => {
    if (!isValidInput || !currentInput.trim() || !storySession || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/stories/ai-respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: params.sessionId,
          childInput: currentInput.trim(),
          turnNumber: storySession.currentTurn,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update turns
        setTurns(prev => [...prev, data.turn]);
        
        // Update session
        setStorySession(prev => prev ? {
          ...prev,
          currentTurn: data.session.currentTurn,
          totalWords: data.session.totalWords,
          childWords: data.session.childWords,
          apiCallsUsed: data.session.apiCallsUsed,
          status: data.session.status,
        } : null);

        // Clear input
        setCurrentInput('');

        // Check if story is completed
        if (data.session.status === 'completed') {
          toast({
            title: '🎉 Story Completed!',
            description: 'Great job! Your story is ready for assessment.',
          });
          
          // Auto-show assessment modal
          setTimeout(() => {
            setShowAssessment(true);
          }, 1000);
        }

        // Scroll to latest content
        if (storyContentRef.current) {
          storyContentRef.current.scrollTop = storyContentRef.current.scrollHeight;
        }

      } else {
        throw new Error(data.error || 'Failed to submit turn');
      }

    } catch (error) {
      console.error('Error submitting turn:', error);
      toast({
        title: '❌ Error',
        description: error instanceof Error ? error.message : 'Failed to submit your writing',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePauseStory = async () => {
    try {
      const response = await fetch(`/api/stories/session/${params.sessionId}/pause`, {
        method: 'POST',
      });

      if (response.ok) {
        setStorySession(prev => prev ? { ...prev, status: 'paused' } : null);
        toast({
          title: '⏸️ Story Paused',
          description: 'You can continue writing later from your dashboard.',
        });
      }
    } catch (error) {
      console.error('Error pausing story:', error);
    }
  };

  const handleResumeStory = async () => {
    try {
      const response = await fetch(`/api/stories/session/${params.sessionId}/resume`, {
        method: 'POST',
      });

      if (response.ok) {
        setStorySession(prev => prev ? { ...prev, status: 'active' } : null);
        toast({
          title: '▶️ Story Resumed',
          description: 'Continue your amazing story!',
        });
      }
    } catch (error) {
      console.error('Error resuming story:', error);
    }
  };

  const handlePublishStory = async () => {
    if (!storySession?.assessment) return;

    try {
      const response = await fetch('/api/stories/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: params.sessionId,
          assessment: storySession.assessment,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: '🎉 Story Published!',
          description: 'Your story is now available in your library and eligible for competitions!',
        });
        
        setStorySession(prev => prev ? { ...prev, isPublished: true, competitionEligible: true } : null);
        setShowPublishFlow(false);
        
        // Redirect to payment if needed
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        }
      } else {
        throw new Error(data.error || 'Failed to publish story');
      }

    } catch (error) {
      console.error('Error publishing story:', error);
      toast({
        title: '❌ Publication Failed',
        description: error instanceof Error ? error.message : 'Failed to publish story',
        variant: 'destructive',
      });
    }
  };

  const getProgressPercentage = () => {
    if (!storySession) return 0;
    return Math.round(((storySession.currentTurn - 1) / maxTurns) * 100);
  };

  const getIntegrityIcon = (risk?: string) => {
    switch (risk) {
      case 'low': return <Shield className="w-4 h-4 text-green-400" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-400 mx-auto mb-4 animate-spin" />
          <div className="text-white text-xl">Loading your story...</div>
        </div>
      </div>
    );
  }

  if (!storySession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-white text-2xl mb-4">Story Not Found</h2>
          <button
            onClick={() => router.push('/children-dashboard/my-stories')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Back to My Stories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <button
            onClick={() => router.push('/children-dashboard/my-stories')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 sm:mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to My Stories
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {storySession.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>{storySession.storyMode === 'freeform' ? '✨ Freeform' : '🎯 Guided'}</span>
                <span>Turn {storySession.currentTurn}/{maxTurns}</span>
                <span>{storySession.childWords} words</span>
                {autoSaving && (
                  <span className="flex items-center gap-1 text-blue-400">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Saving...
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {storySession.status === 'completed' && storySession.assessment && (
                <div className="flex items-center gap-2 bg-green-600/20 border border-green-500/30 rounded-lg px-3 py-1">
                  {getIntegrityIcon(storySession.assessment.integrityAnalysis?.integrityRisk)}
                  <span className="text-green-300 text-sm font-medium">
                    {storySession.assessment.overallScore}%
                  </span>
                </div>
              )}
              
              {storySession.isPublished && (
                <div className="flex items-center gap-1 bg-yellow-600/20 border border-yellow-500/30 rounded-lg px-3 py-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-300 text-sm">Published</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Story Progress</span>
            <span className="text-white text-sm font-medium">{getProgressPercentage()}%</span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Story Area */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Story Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl"
            >
              <div className="p-4 sm:p-6 border-b border-gray-600/40">
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  Your Story
                </h2>
              </div>
              
              <div
                ref={storyContentRef}
                className="p-4 sm:p-6 max-h-96 overflow-y-auto scrollbar-thin scrollbar-track-gray-700/30 scrollbar-thumb-green-500"
              >
                {/* AI Opening */}
                {storySession.aiOpening && (
                  <div className="mb-6">
                    <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
                      <div className="text-blue-300 text-sm font-medium mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Story Beginning
                      </div>
                      <p className="text-gray-300 leading-relaxed">{storySession.aiOpening}</p>
                    </div>
                  </div>
                )}

                {/* Story Turns */}
                {turns.map((turn, index) => (
                  <div key={turn._id} className="mb-6">
                    {/* Child Input */}
                    {turn.childInput && (
                      <div className="mb-4">
                        <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-4">
                          <div className="text-green-300 text-sm font-medium mb-2">
                            Turn {turn.turnNumber} - Your Writing ({turn.wordCount} words)
                          </div>
                          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {turn.childInput}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* AI Response */}
                    {turn.aiResponse && (
                      <div className="mb-4">
                        <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-4">
                          <div className="text-purple-300 text-sm font-medium mb-2 flex items-center gap-2">
                            <Brain className="w-4 h-4" />
                            AI Continuation
                          </div>
                          <p className="text-gray-300 leading-relaxed">{turn.aiResponse}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* No content yet */}
                {turns.length === 0 && !storySession.aiOpening && (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-white font-medium mb-2">Ready to Start Writing?</h3>
                    <p className="text-gray-400">
                      Your story adventure begins below. Write your first part!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Writing Interface */}
            {storySession.status === 'active' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <WordCountValidator
                  value={currentInput}
                  onChange={setCurrentInput}
                  turnNumber={storySession.currentTurn}
                  onValidationChange={(isValid, wordCount) => {
                    setIsValidInput(isValid);
                    setCurrentWordCount(wordCount);
                  }}
                  disabled={isSubmitting}
                />

                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleSubmitTurn}
                    disabled={!isValidInput || isSubmitting || storySession.apiCallsUsed >= storySession.maxApiCalls}
                    className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                      isValidInput && !isSubmitting && storySession.apiCallsUsed < storySession.maxApiCalls
                        ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700'
                        : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending to AI...
                      </>
                    ) : storySession.apiCallsUsed >= storySession.maxApiCalls ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Story Complete!
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Continue Story
                      </>
                    )}
                  </button>

                  <button
                    onClick={handlePauseStory}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Pause className="w-5 h-5" />
                    Pause
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-2">
                  Press Ctrl+Enter (⌘+Enter on Mac) to submit
                </p>
              </motion.div>
            )}

            {/* Paused State */}
            {storySession.status === 'paused' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-6 text-center"
              >
                <Pause className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-white font-bold text-lg mb-2">Story Paused</h3>
                <p className="text-gray-300 mb-4">You can continue writing whenever you're ready!</p>
                <button
                  onClick={handleResumeStory}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
                >
                  <Zap className="w-5 h-5" />
                  Resume Writing
                </button>
              </motion.div>
            )}

            {/* Completed State */}
            {storySession.status === 'completed' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-xl p-6 text-center"
              >
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-white font-bold text-lg mb-2">🎉 Story Completed!</h3>
                <p className="text-gray-300 mb-6">
                  Amazing work! Your story has {storySession.childWords} words and is ready for assessment.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => setShowAssessment(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Brain className="w-5 h-5" />
                    Get AI Assessment
                  </button>

                  {storySession.assessment && !storySession.isPublished && (
                    <button
                      onClick={() => setShowPublishFlow(true)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <Star className="w-5 h-5" />
                      Publish Story - $10
                    </button>
                  )}

                  <button
                    onClick={() => router.push('/children-dashboard/my-stories')}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <BookOpen className="w-5 h-5" />
                    View All Stories
                  </button>
                </div>
              </motion.div>
            )}

            {/* Flagged State */}
            {storySession.status === 'flagged' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-red-600/20 border border-red-500/30 rounded-xl p-6 text-center"
              >
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-white font-bold text-lg mb-2">Story Under Review</h3>
                <p className="text-gray-300 mb-4">
                  This story has been flagged for integrity review. Please ensure all content is your original work.
                </p>
                
                {storySession.assessment?.integrityAnalysis && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">
                        {storySession.assessment.integrityAnalysis.originalityScore}%
                      </div>
                      <div className="text-gray-300 text-sm">Originality</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">
                        {100 - storySession.assessment.integrityAnalysis.plagiarismScore}%
                      </div>
                      <div className="text-gray-300 text-sm">Unique</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">
                        {100 - storySession.assessment.integrityAnalysis.aiDetectionScore}%
                      </div>
                      <div className="text-gray-300 text-sm">Human-like</div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Story Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-4"
            >
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-400" />
                Writing Stats
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-3 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-white">
                    {storySession.childWords}
                  </div>
                  <div className="text-blue-300 text-xs sm:text-sm">
                    Your Words
                  </div>
                </div>

                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-white">
                    {storySession.totalWords}
                  </div>
                  <div className="text-green-300 text-xs sm:text-sm">
                    Total Words
                  </div>
                </div>

                <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-white">
                    {storySession.currentTurn}/{maxTurns}
                  </div>
                 <div className="text-purple-300 text-xs sm:text-sm">
                   Current Turn
                 </div>
               </div>

               <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3 text-center">
                 <div className="text-lg sm:text-2xl font-bold text-white">
                   {storySession.apiCallsUsed}/{storySession.maxApiCalls}
                 </div>
                 <div className="text-orange-300 text-xs sm:text-sm">
                   AI Calls
                 </div>
               </div>
             </div>
           </motion.div>

           {/* Story Elements */}
           {storySession.elements && Object.values(storySession.elements).some(v => v && v.trim()) && (
             <motion.div
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.5 }}
               className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-4"
             >
               <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                 <Sparkles className="w-5 h-5 text-purple-400" />
                 Story Elements
               </h3>
               
               <div className="space-y-3">
                 {Object.entries(storySession.elements)
                   .filter(([_, value]) => value && value.trim())
                   .map(([type, value]) => (
                     <div key={type} className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-3">
                       <div className="text-purple-300 text-xs font-medium uppercase tracking-wide mb-1">
                         {type}
                       </div>
                       <div className="text-white text-sm">{value}</div>
                     </div>
                   ))}
               </div>
             </motion.div>
           )}

           {/* Assessment Summary */}
           {storySession.assessment && (
             <motion.div
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.6 }}
               className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-4"
             >
               <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                 <Award className="w-5 h-5 text-yellow-400" />
                 Assessment Summary
               </h3>
               
               <div className="space-y-3">
                 <div className="text-center">
                   <div className="text-3xl font-bold text-green-400 mb-1">
                     {storySession.assessment.overallScore}%
                   </div>
                   <div className="text-gray-300 text-sm">Overall Score</div>
                 </div>

                 <div className="grid grid-cols-2 gap-2 text-xs">
                   <div className="text-center">
                     <div className="text-blue-400 font-bold">{storySession.assessment.grammarScore}%</div>
                     <div className="text-gray-400">Grammar</div>
                   </div>
                   <div className="text-center">
                     <div className="text-purple-400 font-bold">{storySession.assessment.creativityScore}%</div>
                     <div className="text-gray-400">Creativity</div>
                   </div>
                 </div>

                 {storySession.assessment.integrityAnalysis && (
                   <div className="bg-gray-700/50 rounded-lg p-3 mt-3">
                     <div className="flex items-center justify-between mb-2">
                       <span className="text-gray-300 text-sm">Integrity Analysis</span>
                       {getIntegrityIcon(storySession.assessment.integrityAnalysis.integrityRisk)}
                     </div>
                     <div className="text-xs text-gray-400">
                       {storySession.assessment.integrityAnalysis.originalityScore}% Original Content
                     </div>
                   </div>
                 )}

                 <button
                   onClick={() => setShowAssessment(true)}
                   className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                 >
                   <Eye className="w-4 h-4" />
                   View Full Assessment
                 </button>
               </div>
             </motion.div>
           )}

           {/* Quick Actions */}
           <motion.div
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.7 }}
             className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-4"
           >
             <h3 className="text-white font-bold mb-4">Quick Actions</h3>
             
             <div className="space-y-3">
               <button
                 onClick={() => router.push('/create-stories')}
                 className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
               >
                 <Sparkles className="w-4 h-4" />
                 New Story
               </button>

               <button
                 onClick={() => router.push('/children-dashboard/upload-assessment')}
                 className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
               >
                 <Upload className="w-4 h-4" />
                 Upload Assessment
               </button>

               <button
                 onClick={() => router.push('/children-dashboard/competitions')}
                 className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
               >
                 <Trophy className="w-4 h-4" />
                 Competitions
               </button>
             </div>
           </motion.div>

           {/* Writing Tips */}
           {storySession.status === 'active' && (
             <motion.div
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.8 }}
               className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-4"
             >
               <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                 <Brain className="w-5 h-5 text-blue-400" />
                 Writing Tips
               </h3>
               
               <div className="space-y-2 text-sm text-gray-300">
                 <p>• Add descriptive details to make your story vivid</p>
                 <p>• Show character emotions through actions</p>
                 <p>• Use dialogue to bring characters to life</p>
                 <p>• Build tension and excitement in your plot</p>
               </div>
             </motion.div>
           )}
         </div>
       </div>

       {/* Assessment Modal */}
       <AssessmentModal
         isOpen={showAssessment}
         onClose={() => setShowAssessment(false)}
         storySession={storySession}
         turns={turns}
         assessment={storySession?.assessment || null}
       />

       {/* Publish Flow Modal */}
       {showPublishFlow && storySession.assessment && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-gray-800 border border-gray-600 rounded-xl p-6 w-full max-w-md"
           >
             <div className="text-center">
               <Star className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
               <h3 className="text-xl font-bold text-white mb-2">Publish Your Story</h3>
               <p className="text-gray-300 mb-6">
                 Publishing your story makes it eligible for competitions and adds it to your public portfolio.
               </p>

               <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                 <div className="text-center">
                   <div className="text-2xl font-bold text-white mb-1">
                     {storySession.assessment.overallScore}%
                   </div>
                   <div className="text-gray-300 text-sm">Assessment Score</div>
                   
                   {storySession.assessment.integrityAnalysis && (
                     <div className="flex items-center justify-center gap-2 mt-2">
                       {getIntegrityIcon(storySession.assessment.integrityAnalysis.integrityRisk)}
                       <span className="text-xs text-gray-400">
                         {storySession.assessment.integrityAnalysis.originalityScore}% Original
                       </span>
                     </div>
                   )}
                 </div>
               </div>

               {storySession.assessment.integrityRisk === 'critical' ? (
                 <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-4 mb-6">
                   <div className="text-red-300 text-sm">
                     ⚠️ This story cannot be published due to integrity concerns. Please review and resubmit original content.
                   </div>
                 </div>
               ) : (
                 <>
                   <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
                     <div className="text-yellow-300 text-sm font-medium mb-2">
                       Publication Fee: $10
                     </div>
                     <div className="text-gray-300 text-xs">
                       This fee helps maintain our platform and competition prizes
                     </div>
                   </div>

                   <div className="flex gap-3">
                     <button
                       onClick={() => setShowPublishFlow(false)}
                       className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors"
                     >
                       Cancel
                     </button>
                     <button
                       onClick={handlePublishStory}
                       className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                     >
                       <Star className="w-4 h-4" />
                       Publish - $10
                     </button>
                   </div>
                 </>
               )}
             </div>
           </motion.div>
         </div>
       )}
     </div>
   </div>
 );
}