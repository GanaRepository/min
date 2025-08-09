'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Eye,
  Edit,
  Award,
  BookOpen,
  Clock,
  Star,
  Trophy,
  Shield,
  AlertTriangle,
  CheckCircle,
  Brain,
} from 'lucide-react';
import { StoryAssessment } from '@/types/assessment';

interface Story {
  _id: string;
  title: string;
  storyNumber: number;
  status: string;
  totalWords: number;
  childWords: number;
  isUploadedForAssessment: boolean;
  isPublished: boolean;
  competitionEligible: boolean;
  createdAt: string;
  updatedAt: string;
  elements?: {
    genre?: string;
    character?: string;
    setting?: string;
    theme?: string;
    mood?: string;
    tone?: string;
  };
  assessment?: StoryAssessment;
  content?: string;
  competitionEntries?: Array<{
    competitionId: string;
    submittedAt: string;
    rank?: number;
    score?: number;
  }>;
}

export default function StoryDetailPage({ params }: { params: { storyId: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push('/login/child');
      return;
    }
    fetchStory();
  }, [session, params.storyId]);

  const fetchStory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user/stories/${params.storyId}`);
      
      if (response.ok) {
        const data = await response.json();
        setStory(data.story);
      } else {
        throw new Error('Story not found');
      }
    } catch (error) {
      console.error('Error fetching story:', error);
      router.push('/children-dashboard/my-stories');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-orange-400';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading story...</div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-white text-2xl mb-4">Story Not Found</h2>
          <button
            onClick={() => router.push('/children-dashboard/my-stories')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Back to Stories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 py-20">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push('/children-dashboard/my-stories')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to My Stories
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">
              {story.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-gray-300 mb-4">
              <span>📝 {story.childWords} words</span>
              <span>📅 {new Date(story.createdAt).toLocaleDateString()}</span>
              <span className={`px-2 py-1 rounded text-sm capitalize ${
                story.status === 'completed' ? 'bg-green-600/20 text-green-300' :
                story.status === 'active' ? 'bg-blue-600/20 text-blue-300' :
                'bg-gray-600/20 text-gray-300'
              }`}>
                {story.status}
              </span>
            </div>
            
            <div className="flex items-center justify-center gap-2">
              {story.isUploadedForAssessment && (
                <span className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                  Assessment Upload
                </span>
              )}
              {story.isPublished && (
                <span className="bg-yellow-600/20 text-yellow-300 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <Star size={14} />
                  Published
                </span>
              )}
              {story.competitionEntries && story.competitionEntries.length > 0 && (
                <span className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <Trophy size={14} />
                  Competition Entry
                </span>
              )}
            </div>
          </div>
        </motion.div>

        <div className="space-y-8">
          
          {/* Assessment Results */}
          {story.assessment && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              
              {/* Integrity Warning */}
              {story.assessment.integrityAnalysis && 
               story.assessment.integrityAnalysis.integrityRisk !== 'low' && (
                <div className={`border rounded-xl p-6 ${
                  story.assessment.integrityAnalysis.integrityRisk === 'critical'
                    ? 'bg-red-600/20 border-red-500/30'
                    : story.assessment.integrityAnalysis.integrityRisk === 'high'
                    ? 'bg-orange-600/20 border-orange-500/30'
                    : 'bg-yellow-600/20 border-yellow-500/30'
                }`}>
                  <div className="flex items-start gap-3">
                    {getIntegrityIcon(story.assessment.integrityAnalysis.integrityRisk)}
                    <div>
                      <h3 className={`font-bold mb-2 ${
                        story.assessment.integrityAnalysis.integrityRisk === 'critical' ? 'text-red-300' :
                        story.assessment.integrityAnalysis.integrityRisk === 'high' ? 'text-orange-300' :
                        'text-yellow-300'
                      }`}>
                        Integrity Review Required
                      </h3>
                      <p className="text-gray-300 text-sm">
                        {story.assessment.integrityAnalysis.integrityRisk === 'critical' 
                          ? 'This story has been flagged for manual review due to serious integrity concerns.'
                          : story.assessment.integrityAnalysis.integrityRisk === 'high'
                          ? 'This story has potential integrity issues that need attention.'
                          : 'This story has minor integrity concerns to review.'
                        }
                      </p>
                      
                      <div className="grid grid-cols-3 gap-4 mt-4">
                       <div className="text-center">
                         <div className="text-lg font-bold text-white">
                           {story.assessment.integrityAnalysis.originalityScore}%
                         </div>
                         <div className="text-gray-300 text-xs">Originality</div>
                       </div>
                       <div className="text-center">
                         <div className="text-lg font-bold text-white">
                           {100 - story.assessment.integrityAnalysis.plagiarismScore}%
                         </div>
                         <div className="text-gray-300 text-xs">Unique</div>
                       </div>
                       <div className="text-center">
                         <div className="text-lg font-bold text-white">
                           {100 - story.assessment.integrityAnalysis.aiDetectionScore}%
                         </div>
                         <div className="text-gray-300 text-xs">Human-like</div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             )}

             {/* Overall Score */}
             <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-xl p-6 text-center">
               <div className="flex items-center justify-center gap-3 mb-4">
                 <Award className="w-8 h-8 text-blue-400" />
                 <h2 className="text-2xl font-bold text-white">Assessment Score</h2>
               </div>
               <div className={`text-5xl font-bold mb-2 ${getScoreColor(story.assessment.overallScore)}`}>
                 {story.assessment.overallScore >= 90 ? '🌟' : 
                  story.assessment.overallScore >= 80 ? '⭐' : 
                  story.assessment.overallScore >= 70 ? '✨' : '💫'} {story.assessment.overallScore}%
               </div>
               <div className="text-gray-300 text-lg">{story.assessment.readingLevel} Level</div>
               <div className="text-gray-400 text-sm mt-2">
                 Assessed on {new Date(story.assessment.assessmentDate).toLocaleDateString()}
               </div>
             </div>

             {/* Category Breakdown */}
             <div className="bg-gray-800/60 border border-gray-600/40 rounded-xl p-6">
               <h3 className="text-xl font-bold text-white mb-6">Score Breakdown</h3>
               
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 {[
                   { label: 'Grammar', score: story.assessment.grammarScore },
                   { label: 'Creativity', score: story.assessment.creativityScore },
                   { label: 'Vocabulary', score: story.assessment.vocabularyScore },
                   { label: 'Structure', score: story.assessment.structureScore },
                   { label: 'Characters', score: story.assessment.characterDevelopmentScore },
                   { label: 'Plot', score: story.assessment.plotDevelopmentScore },
                 ].map((category, index) => (
                   <div key={category.label} className="bg-gray-700/50 rounded-lg p-4 text-center">
                     <div className={`text-xl font-bold mb-1 ${getScoreColor(category.score)}`}>
                       {category.score}%
                     </div>
                     <div className="text-gray-400 text-sm">{category.label}</div>
                     <div className="mt-2">
                       <div className="w-full bg-gray-600 rounded-full h-1.5">
                         <div
                           className={`h-1.5 rounded-full ${
                             category.score >= 90 ? 'bg-green-500' :
                             category.score >= 80 ? 'bg-blue-500' :
                             category.score >= 70 ? 'bg-yellow-500' :
                             'bg-orange-500'
                           }`}
                           style={{ width: `${category.score}%` }}
                         />
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>

             {/* Feedback */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               
               {/* Strengths */}
               {story.assessment.strengths && story.assessment.strengths.length > 0 && (
                 <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-6">
                   <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                     <Star className="w-5 h-5 text-green-400" />
                     Your Strengths
                   </h3>
                   <ul className="space-y-2">
                     {story.assessment.strengths.map((strength, index) => (
                       <li key={index} className="text-green-300 text-sm flex items-start gap-2">
                         <span className="text-green-400 mt-1">✓</span>
                         {strength}
                       </li>
                     ))}
                   </ul>
                 </div>
               )}

               {/* Improvements */}
               {story.assessment.improvements && story.assessment.improvements.length > 0 && (
                 <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-6">
                   <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                     <Brain className="w-5 h-5 text-blue-400" />
                     Growth Areas
                   </h3>
                   <ul className="space-y-2">
                     {story.assessment.improvements.map((improvement, index) => (
                       <li key={index} className="text-blue-300 text-sm flex items-start gap-2">
                         <span className="text-blue-400 mt-1">→</span>
                         {improvement}
                       </li>
                     ))}
                   </ul>
                 </div>
               )}
             </div>

             {/* Teacher Feedback */}
             {story.assessment.feedback && (
               <div className="bg-purple-600/20 border border-purple-500/30 rounded-xl p-6">
                 <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                   <Brain className="w-5 h-5 text-purple-400" />
                   Teacher's Comment
                 </h3>
                 <p className="text-gray-300 leading-relaxed">
                   {story.assessment.feedback}
                 </p>
               </div>
             )}

             {/* Educational Insights */}
             {story.assessment.educationalInsights && (
               <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-xl p-6">
                 <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                   <BookOpen className="w-5 h-5 text-green-400" />
                   Keep Writing!
                 </h3>
                 <p className="text-gray-300 leading-relaxed">
                   {story.assessment.educationalInsights}
                 </p>
               </div>
             )}
           </motion.div>
         )}

         {/* Actions */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5 }}
           className="flex flex-col sm:flex-row gap-4 justify-center"
         >
           {story.status === 'active' && (
             <button
               onClick={() => router.push(`/children-dashboard/story/${story._id}`)}
               className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
             >
               <Edit className="w-5 h-5" />
               Continue Writing
             </button>
           )}

           {story.assessment && (
             <button
               onClick={() => router.push(`/children-dashboard/assessment/${story._id}`)}
               className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
             >
               <Award className="w-5 h-5" />
               View Full Assessment
             </button>
           )}

           <button
             onClick={() => router.push('/children-dashboard/my-stories')}
             className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
           >
             <BookOpen className="w-5 h-5" />
             Back to Stories
           </button>
         </motion.div>
       </div>
     </div>
   </div>
 );
}