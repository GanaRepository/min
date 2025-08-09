'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Award,
  Brain,
  Shield,
  AlertTriangle,
  CheckCircle,
  Star,
  Target,
  BookOpen,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Loader2,
} from 'lucide-react';

interface Assessment {
  // Legacy fields
  grammarScore: number;
  creativityScore: number;
  vocabularyScore: number;
  structureScore: number;
  characterDevelopmentScore: number;
  plotDevelopmentScore: number;
  overallScore: number;
  readingLevel: string;
  feedback: string;
  strengths: string[];
  improvements: string[];
  educationalInsights: string;
  
  // Advanced integrity fields
  plagiarismScore: number;
  aiDetectionScore: number;
  integrityRisk: 'low' | 'medium' | 'high' | 'critical';
  integrityAnalysis: {
    originalityScore: number;
    plagiarismScore: number;
    aiDetectionScore: number;
    integrityRisk: string;
    plagiarismRiskLevel: string;
    aiDetectionLikelihood: string;
  };
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
  assessmentVersion: string;
  assessmentDate: string;
}

interface StorySession {
  _id: string;
  title: string;
  storyNumber: number;
  status: string;
  totalWords: number;
  childWords: number;
  assessmentAttempts: number;
  isUploadedForAssessment: boolean;
  createdAt: string;
  assessment: Assessment;
}

export default function AssessmentPage({ params }: { params: { sessionId: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [storySession, setStorySession] = useState<StorySession | null>(null);
  const [loading, setLoading] = useState(true);
  const [reassessing, setReassessing] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push('/login/child');
      return;
    }
    fetchStoryAndAssessment();
  }, [session, params.sessionId]);

  const fetchStoryAndAssessment = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stories/session/${params.sessionId}/assessment`);
      
      if (response.ok) {
        const data = await response.json();
        setStorySession(data.storySession);
      } else {
        throw new Error('Failed to fetch assessment');
      }
    } catch (error) {
      console.error('Error fetching assessment:', error);
      router.push('/children-dashboard/my-stories');
    } finally {
      setLoading(false);
    }
  };

  const handleReassess = async () => {
    if (!storySession || storySession.assessmentAttempts >= 3) return;

    setReassessing(true);
    try {
      const response = await fetch(`/api/stories/assessment/${params.sessionId}`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          await fetchStoryAndAssessment();
        }
      }
    } catch (error) {
      console.error('Reassessment error:', error);
    } finally {
      setReassessing(false);
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
        <div className="text-white text-xl">Loading assessment...</div>
      </div>
    );
  }

  if (!storySession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-white text-2xl mb-4">Assessment Not Found</h2>
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

  const assessment = storySession.assessment;

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
              📊 Story Assessment
            </h1>
            <p className="text-gray-300 text-lg">
              {storySession.title} • {storySession.childWords} words
            </p>
            <div className="text-gray-400 text-sm mt-2">
              Assessment #{storySession.assessmentAttempts} • 
              {new Date(assessment.assessmentDate).toLocaleDateString()}
            </div>
          </div>
        </motion.div>

        <div className="space-y-8">
          
          {/* Integrity Analysis */}
          {assessment.integrityAnalysis && assessment.integrityAnalysis.integrityRisk !== 'low' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`border rounded-xl p-6 ${
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
                  <h3 className={`font-bold text-lg mb-4 ${
                    assessment.integrityAnalysis.integrityRisk === 'critical' ? 'text-red-300' :
                    assessment.integrityAnalysis.integrityRisk === 'high' ? 'text-orange-300' :
                    'text-yellow-300'
                  }`}>
                    Integrity Analysis
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">
                        {assessment.integrityAnalysis.originalityScore}%
                      </div>
                      <div className="text-gray-300 text-sm">Originality Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">
                        {100 - assessment.integrityAnalysis.plagiarismScore}%
                      </div>
                      <div className="text-gray-300 text-sm">Unique Content</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">
                        {100 - assessment.integrityAnalysis.aiDetectionScore}%
                      </div>
                      <div className="text-gray-300 text-sm">Human-like Writing</div>
                    </div>
                  </div>

                  {assessment.integrityAnalysis.integrityRisk === 'critical' && (
                    <div className="bg-red-700/30 rounded-lg p-4">
                      <p className="text-red-200">
                        ⚠️ This story has been flagged for manual review due to integrity concerns. 
                        Please ensure all content is your original work.
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
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-xl p-8 text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Award className="w-10 h-10 text-blue-400" />
              <h2 className="text-3xl font-bold text-white">Overall Score</h2>
            </div>
            <div className={`text-7xl font-bold mb-4 ${getScoreColor(assessment.overallScore)}`}>
              {assessment.overallScore >= 90 ? '🌟' : assessment.overallScore >= 80 ? '⭐' : assessment.overallScore >= 70 ? '✨' : '💫'} {assessment.overallScore}%
            </div>
            <div className="text-gray-300 text-xl">{assessment.readingLevel} Level</div>
          </motion.div>

          {/* Category Scores */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/60 border border-gray-600/40 rounded-xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-purple-400" />
              Detailed Category Scores
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { label: 'Grammar', score: assessment.grammarScore, icon: BookOpen },
                { label: 'Creativity', score: assessment.creativityScore, icon: Sparkles },
                { label: 'Vocabulary', score: assessment.vocabularyScore, icon: Target },
                { label: 'Structure', score: assessment.structureScore, icon: Award },
                { label: 'Characters', score: assessment.characterDevelopmentScore, icon: Star },
                { label: 'Plot', score: assessment.plotDevelopmentScore, icon: TrendingUp },
              ].map((category, index) => (
                <motion.div
                  key={category.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-gray-700/50 rounded-lg p-4 text-center"
                >
                  <category.icon className="w-8 h-8 mx-auto mb-3 text-blue-400" />
                  <div className={`text-2xl font-bold mb-2 ${getScoreColor(category.score)}`}>
                    {category.score}%
                  </div>
                  <div className="text-gray-400">{category.label}</div>
                  
                  <div className="mt-3">
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          category.score >= 90 ? 'bg-green-500' :
                          category.score >= 80 ? 'bg-blue-500' :
                          category.score >= 70 ? 'bg-yellow-500' :
                          'bg-orange-500'
                        }`}
                        style={{ width: `${category.score}%` }}
                      />
                    </div>
                  </div>
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
                transition={{ delay: 0.5 }}
                className="bg-green-600/20 border border-green-500/30 rounded-xl p-6"
              >
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-green-400" />
                  Your Strengths
                </h3>
                <ul className="space-y-3">
                  {assessment.strengths.map((strength, index) => (
                    <li key={index} className="text-green-300 flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Improvements */}
            {assessment.improvements && assessment.improvements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-6"
              >
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  Areas for Growth
                </h3>
                <ul className="space-y-3">
                  {assessment.improvements.map((improvement, index) => (
                    <li key={index} className="text-blue-300 flex items-start gap-2">
                      <span className="text-blue-400 mt-1">→</span>
                      {improvement}
                    </li>
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
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                Teacher's Comment
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg">
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
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-400" />
                Keep Writing!
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                {assessment.educationalInsights}
              </p>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {storySession.assessmentAttempts < 3 && (
              <button
                onClick={handleReassess}
                disabled={reassessing}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {reassessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Reassessing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Reassess Story ({3 - storySession.assessmentAttempts} left)
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => router.push('/children-dashboard/my-stories')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              View All Stories
            </button>

            <button
              onClick={() => router.push('/create-stories')}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              Write New Story
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}