'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Brain,
  Trophy,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Star,
  TrendingUp,
  BookOpen,
  Award,
  Target,
  Lightbulb,
  MessageSquare,
  Shield,
  Eye,
} from 'lucide-react';
import { motion } from 'framer-motion';
import TerminalLoader from '@/components/TerminalLoader';

interface ComprehensiveAssessment {
  // Core scores
  overallScore: number;
  categoryScores: {
    grammar: number;
    vocabulary: number;
    creativity: number;
    structure: number;
    characterDevelopment: number;
    plotDevelopment: number;
    descriptiveWriting: number;
    sensoryDetails: number;
    plotLogic: number;
    causeEffect: number;
    problemSolving: number;
    themeRecognition: number;
    ageAppropriateness: number;
    readingLevel: string;
  };
  
  // Academic integrity analysis
  integrityAnalysis: {
    plagiarismResult: {
      overallScore: number;
      riskLevel: string;
    };
    aiDetectionResult: {
      likelihood: string;
      confidence: number;
    };
    originalityScore: number;
    integrityRisk: string;
  };
  
  // Educational feedback
  educationalFeedback: {
    strengths: string[];
    improvements: string[];
    nextSteps: string[];
    teacherComment: string;
    encouragement: string;
  };
  
  // Progress tracking
  progressTracking?: {
    improvementSince?: string;
    scoreChange?: number;
    strengthsGained?: string[];
    areasImproved?: string[];
  };
  
  // Recommendations
  recommendations: {
    immediate: string[];
    longTerm: string[];
    practiceExercises: string[];
  };
  
  // Integrity status
  integrityStatus: {
    status: 'PASS' | 'WARNING' | 'FAIL';
    message: string;
    recommendation: string;
  };
  
  // Assessment metadata
  assessmentVersion?: string;
  assessmentDate?: string;
  assessmentType?: string;
}

interface Story {
  _id: string;
  title: string;
  status: string;
  assessment?: ComprehensiveAssessment;
  createdAt: string;
  completedAt?: string;
}

export default function StoryAssessmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const storyId = params.storyId as string;

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    if (status === 'authenticated' && storyId) {
      fetchStoryAssessment();
    }
  }, [status, storyId, router]);

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

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-500/20 border-green-500/30';
    if (score >= 80) return 'bg-blue-500/20 border-blue-500/30';
    if (score >= 70) return 'bg-yellow-500/20 border-yellow-500/30';
    if (score >= 60) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const getIntegrityIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Shield className="w-5 h-5 text-gray-400" />;
    }
  };

  const getIntegrityRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'high':
        return 'text-orange-400';
      case 'critical':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <TerminalLoader loadingText="Loading assessment details..." />
      </div>
    );
  }

  if (error || !story || !story.assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Assessment Not Available</h2>
          <p className="text-gray-300 mb-6">
            {error || "Assessment data is not available for this story."}
          </p>
          <Link
            href={`/children-dashboard/my-stories/${storyId}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Story
          </Link>
        </div>
      </div>
    );
  }

  const assessment = story.assessment;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Link
              href={`/children-dashboard/my-stories/${storyId}`}
              className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-1">Assessment Results</h1>
              <p className="text-gray-300">{story.title}</p>
            </div>
          </div>

          {/* Overall Score Banner */}
          <div className={`rounded-lg border p-6 ${getScoreBgColor(assessment.overallScore)}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Overall Score</h2>
                <p className="text-gray-200">
                  {assessment.assessmentDate && (
                    <>Assessed on {new Date(assessment.assessmentDate).toLocaleDateString()}</>
                  )}
                </p>
              </div>
              <div className="text-right">
                <div className={`text-5xl font-bold ${getScoreColor(assessment.overallScore)}`}>
                  {assessment.overallScore}%
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {getIntegrityIcon(assessment.integrityStatus.status)}
                  <span className="text-white font-medium">
                    {assessment.integrityStatus.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Assessment Content */}
        <div className="space-y-8">
          {/* Category Scores */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-lg p-6"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Category Scores
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(assessment.categoryScores).map(([category, score]) => {
                if (category === 'readingLevel') return null;
                
                const displayName = category
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase());
                
                return (
                  <div key={category} className="bg-gray-700/30 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300 text-sm">{displayName}</span>
                      <span className={`font-bold ${getScoreColor(score as number)}`}>
                        {score}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                        style={{ width: `${Math.min(100, Math.max(0, score as number))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              
              {/* Reading Level */}
              <div className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Reading Level</span>
                  <span className="font-bold text-blue-400">
                    {assessment.categoryScores.readingLevel}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Educational Feedback */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Strengths */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
              <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Strengths
              </h3>
              {assessment.educationalFeedback.strengths.length > 0 ? (
                <ul className="space-y-2">
                  {assessment.educationalFeedback.strengths.map((strength, index) => (
                    <li key={index} className="text-gray-300 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">Keep practicing to develop your strengths!</p>
              )}
            </div>

            {/* Areas for Improvement */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
              <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Areas for Improvement
              </h3>
              {assessment.educationalFeedback.improvements.length > 0 ? (
                <ul className="space-y-2">
                  {assessment.educationalFeedback.improvements.map((improvement, index) => (
                    <li key={index} className="text-gray-300 flex items-start gap-2">
                      <Target className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      {improvement}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">Great work! No major areas for improvement identified.</p>
              )}
            </div>
          </motion.div>

          {/* Teacher Comments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6"
          >
            <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Teacher Comments
            </h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              {assessment.educationalFeedback.teacherComment}
            </p>
            {assessment.educationalFeedback.encouragement && (
              <div className="bg-blue-500/10 rounded-lg p-4">
                <p className="text-blue-200 italic">
                  💫 {assessment.educationalFeedback.encouragement}
                </p>
              </div>
            )}
          </motion.div>

          {/* Next Steps & Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Next Steps */}
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-6">
              <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Next Steps
              </h3>
              {assessment.educationalFeedback.nextSteps.length > 0 ? (
                <ul className="space-y-2">
                  {assessment.educationalFeedback.nextSteps.map((step, index) => (
                    <li key={index} className="text-gray-300 flex items-start gap-2">
                      <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">Continue practicing your writing skills!</p>
              )}
            </div>

            {/* Practice Recommendations */}
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-6">
              <h3 className="text-lg font-bold text-indigo-400 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Practice Exercises
              </h3>
              {assessment.recommendations.practiceExercises.length > 0 ? (
                <ul className="space-y-2">
                  {assessment.recommendations.practiceExercises.map((exercise, index) => (
                    <li key={index} className="text-gray-300 flex items-start gap-2">
                      <Award className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                      {exercise}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">Keep writing stories to improve your skills!</p>
              )}
            </div>
          </motion.div>

          {/* Progress Tracking */}
          {assessment.progressTracking && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-6"
            >
              <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Your Progress
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assessment.progressTracking.scoreChange !== undefined && (
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      assessment.progressTracking.scoreChange > 0 ? 'text-green-400' : 
                      assessment.progressTracking.scoreChange < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {assessment.progressTracking.scoreChange > 0 ? '+' : ''}
                      {assessment.progressTracking.scoreChange}%
                    </div>
                    <div className="text-gray-400 text-sm">Score Change</div>
                  </div>
                )}
                {assessment.progressTracking.areasImproved && assessment.progressTracking.areasImproved.length > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">
                      {assessment.progressTracking.areasImproved.length}
                    </div>
                    <div className="text-gray-400 text-sm">Areas Improved</div>
                  </div>
                )}
              </div>
              {assessment.progressTracking.strengthsGained && assessment.progressTracking.strengthsGained.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-emerald-300 font-medium mb-2">Recent Improvements:</h4>
                  <ul className="space-y-1">
                    {assessment.progressTracking.strengthsGained.map((strength, index) => (
                      <li key={index} className="text-gray-300 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}

          {/* Academic Integrity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-700/30 rounded-lg p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-400" />
              Academic Integrity
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {assessment.integrityAnalysis.originalityScore}%
                </div>
                <div className="text-gray-400 text-sm">Originality Score</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold capitalize ${getIntegrityRiskColor(assessment.integrityAnalysis.integrityRisk)}`}>
                  {assessment.integrityAnalysis.integrityRisk}
                </div>
                <div className="text-gray-400 text-sm">Integrity Risk</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white capitalize">
                  {assessment.integrityAnalysis.aiDetectionResult.likelihood}
                </div>
                <div className="text-gray-400 text-sm">AI Detection</div>
              </div>
            </div>

            <div className="bg-gray-600/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                {getIntegrityIcon(assessment.integrityStatus.status)}
                <span className="font-medium text-white">
                  {assessment.integrityStatus.message}
                </span>
              </div>
              <p className="text-gray-300 text-sm">
                {assessment.integrityStatus.recommendation}
              </p>
            </div>
          </motion.div>

          {/* Assessment Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gray-700/30 rounded-lg p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-gray-400" />
              Assessment Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Assessment Date:</span>
                <div className="text-white">
                  {assessment.assessmentDate 
                    ? new Date(assessment.assessmentDate).toLocaleDateString()
                    : 'N/A'
                  }
                </div>
              </div>
              <div>
                <span className="text-gray-400">Assessment Type:</span>
                <div className="text-white capitalize">
                  {assessment.assessmentType?.replace(/_/g, ' ') || 'Standard'}
                </div>
              </div>
              <div>
                <span className="text-gray-400">Version:</span>
                <div className="text-white">
                  {assessment.assessmentVersion || '1.0'}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center gap-4 mt-8"
        >
          <Link
            href={`/children-dashboard/my-stories/${storyId}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Story
          </Link>
          <Link
            href="/children-dashboard/my-stories"
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            <BookOpen size={16} />
            All Stories
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
