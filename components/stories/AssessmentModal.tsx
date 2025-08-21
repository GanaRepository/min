// components/stories/AssessmentModal.tsx - COMPLETE UPDATED VERSION
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  X,
  Star,
  Trophy,
  Brain,
  Shield,
  Award,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  XCircle,
  BookOpen,
  DollarSign,
  Sparkles,
  BarChart3,
  Target,
  Lightbulb,
  Zap,
} from 'lucide-react';

interface Assessment {
  overallScore: number;
  grammarScore: number;
  creativityScore: number;
  vocabularyScore: number;
  structureScore: number;
  characterDevelopmentScore: number;
  plotDevelopmentScore: number;
  readingLevel: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  educationalInsights: string;
  integrityAnalysis?: {
    originalityScore: number;
    plagiarismScore: number;
    aiDetectionScore: number;
    integrityRisk: 'low' | 'medium' | 'high' | 'critical';
    plagiarismResult?: {
      score: number;
      riskLevel: string;
      violationCount?: number;
      detailedAnalysis?: string;
    };
    aiDetectionResult?: {
      score: number;
      likelihood: string;
      overallScore: number;
    };
  };
  recommendations?: {
    immediate: string[];
    longTerm: string[];
    practiceExercises: string[];
  };
  progressTracking?: {
    improvementSince?: string;
    scoreChange?: number;
    strengthsGained?: string[];
    areasImproved?: string[];
  };
}

interface StorySession {
  _id: string;
  title: string;
  totalWords: number;
  childWords: number;
  status: string;
  assessmentAttempts: number;
  isUploadedForAssessment?: boolean;
  isPublished?: boolean;
  competitionEligible?: boolean;
}

interface Turn {
  _id: string;
  turnNumber: number;
  childInput: string;
  aiResponse: string;
  childWordCount: number;
  aiWordCount: number;
}

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: Assessment | null;
  storySession: StorySession | null;
  onReassess?: () => void;
  turns?: Turn[];
}

export default function AssessmentModal({
  isOpen,
  onClose,
  assessment,
  storySession,
  onReassess,
  turns = [],
}: AssessmentModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const mountedRef = useRef(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isReassessing, setIsReassessing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'detailed' | 'integrity'
  >('overview');

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  if (!assessment || !storySession || !isOpen) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-500/20 border-green-500/30';
    if (score >= 80) return 'bg-blue-500/20 border-blue-500/30';
    if (score >= 70) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-orange-500/20 border-orange-500/30';
  };

  const getIntegrityIcon = (risk: string) => {
    switch (risk) {
      case 'low':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Shield className="w-5 h-5 text-gray-400" />;
    }
  };

  const getIntegrityColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'high':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'critical':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const handlePublishStory = async () => {
    if (!storySession) return;

    setIsPublishing(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productType: 'story_publication',
          storyId: storySession._id,
          userId: 'user-id', // This should come from session
        }),
      });

      const data = await response.json();

      if (response.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
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

  const handleReassess = async () => {
    if (!storySession || !onReassess) return;

    setIsReassessing(true);
    try {
      await onReassess();
      if (mountedRef.current) {
        toast({
          title: '🔄 Reassessing Story',
          description: 'Generating new assessment with updated feedback...',
        });
      }
    } catch (error) {
      console.error('Error reassessing story:', error);
      if (mountedRef.current) {
        toast({
          title: '❌ Error',
          description: 'Failed to reassess story. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      if (mountedRef.current) {
        setIsReassessing(false);
      }
    }
  };

  const categoryScores = [
    { label: 'Grammar', score: assessment.grammarScore, icon: BarChart3 },
    { label: 'Creativity', score: assessment.creativityScore, icon: Sparkles },
    { label: 'Vocabulary', score: assessment.vocabularyScore, icon: BookOpen },
    { label: 'Structure', score: assessment.structureScore, icon: Target },
    {
      label: 'Character Development',
      score: assessment.characterDevelopmentScore,
      icon: Award,
    },
    {
      label: 'Plot Development',
      score: assessment.plotDevelopmentScore,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl  text-white flex items-center gap-2">
              <Brain className="text-purple-400" />
              Story Assessment
            </h2>
            <p className="text-gray-400">&quot;{storySession.title}&quot;</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Overall Score Hero */}
        <div className="p-6 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div
                className={`p-6 rounded-2xl border ${getScoreBgColor(assessment.overallScore)}`}
              >
                <div
                  className={`text-4xl  ${getScoreColor(assessment.overallScore)}`}
                >
                  {assessment.overallScore}%
                </div>
                <div className="text-sm text-gray-300 mt-1">Overall Score</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="text-white ">
                    {assessment.overallScore >= 90
                      ? 'Excellent Work!'
                      : assessment.overallScore >= 80
                        ? 'Great Job!'
                        : assessment.overallScore >= 70
                          ? 'Good Effort!'
                          : 'Keep Improving!'}
                  </span>
                </div>

                {assessment.integrityAnalysis && (
                  <div
                    className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getIntegrityColor(assessment.integrityAnalysis.integrityRisk)}`}
                  >
                    {getIntegrityIcon(
                      assessment.integrityAnalysis.integrityRisk
                    )}
                    <span className="text-sm ">
                      Integrity:{' '}
                      {assessment.integrityAnalysis.integrityRisk.toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="text-sm text-gray-400">
                  Reading Level: Grade {assessment.readingLevel}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {!storySession.isPublished &&
                storySession.status === 'completed' && (
                  <button
                    onClick={handlePublishStory}
                    disabled={isPublishing}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-green-400 disabled:to-emerald-400 text-white px-6 py-3 rounded-xl  flex items-center gap-2 transition-all"
                  >
                    {isPublishing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Publishing...
                      </>
                    ) : (
                      <>
                        <DollarSign size={16} />
                        Publish for $10
                      </>
                    )}
                  </button>
                )}

              {onReassess && storySession.assessmentAttempts < 3 && (
                <button
                  onClick={handleReassess}
                  disabled={isReassessing}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-xl  flex items-center gap-2 transition-all"
                >
                  {isReassessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Reassessing...
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      Reassess ({3 - storySession.assessmentAttempts} left)
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-4  transition-colors ${
              activeTab === 'overview'
                ? 'border-b-2 border-purple-400 text-purple-400 bg-purple-500/10'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('detailed')}
            className={`px-6 py-4  transition-colors ${
              activeTab === 'detailed'
                ? 'border-b-2 border-purple-400 text-purple-400 bg-purple-500/10'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            Detailed Feedback
          </button>
          {assessment.integrityAnalysis && (
            <button
              onClick={() => setActiveTab('integrity')}
              className={`px-6 py-4  transition-colors ${
                activeTab === 'integrity'
                  ? 'border-b-2 border-purple-400 text-purple-400 bg-purple-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              Integrity Analysis
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="p-6 space-y-6">
              {/* Category Scores Grid */}
              <div>
                <h3 className="text-lg  text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="text-blue-400" />
                  Category Scores
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryScores.map(({ label, score, icon: Icon }) => (
                    <div
                      key={label}
                      className={`p-4 rounded-lg border ${getScoreBgColor(score)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon size={20} className={getScoreColor(score)} />
                        <span className={`text-2xl  ${getScoreColor(score)}`}>
                          {score}%
                        </span>
                      </div>
                      <div className="text-sm text-gray-300 ">{label}</div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            score >= 90
                              ? 'bg-green-400'
                              : score >= 80
                                ? 'bg-blue-400'
                                : score >= 70
                                  ? 'bg-yellow-400'
                                  : 'bg-orange-400'
                          }`}
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Feedback */}
              <div>
                <h3 className="text-lg  text-white mb-4 flex items-center gap-2">
                  <Award className="text-yellow-400" />
                  Teacher's Comment
                </h3>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                  <p className="text-blue-100 leading-relaxed text-lg">
                    {assessment.feedback}
                  </p>
                </div>
              </div>

              {/* Strengths and Improvements */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg  text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="text-green-400" />
                    Strengths
                  </h3>
                  <div className="space-y-2">
                    {assessment.strengths.map((strength, index) => (
                      <div
                        key={index}
                        className="bg-green-500/10 border border-green-500/30 rounded-lg p-3"
                      >
                        <span className="text-green-300 flex items-start gap-2">
                          <CheckCircle
                            size={16}
                            className="mt-0.5 flex-shrink-0"
                          />
                          {strength}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg  text-white mb-4 flex items-center gap-2">
                    <Target className="text-orange-400" />
                    Areas for Improvement
                  </h3>
                  <div className="space-y-2">
                    {assessment.improvements.map((improvement, index) => (
                      <div
                        key={index}
                        className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3"
                      >
                        <span className="text-orange-300 flex items-start gap-2">
                          <Target size={16} className="mt-0.5 flex-shrink-0" />
                          {improvement}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Educational Insights */}
              {assessment.educationalInsights && (
                <div>
                  <h3 className="text-lg  text-white mb-4 flex items-center gap-2">
                    <Lightbulb className="text-purple-400" />
                    Educational Insights
                  </h3>
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
                    <p className="text-purple-100 leading-relaxed">
                      {assessment.educationalInsights}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'detailed' && (
            <div className="p-6 space-y-6">
              {/* Recommendations */}
              {assessment.recommendations && (
                <div>
                  <h3 className="text-lg  text-white mb-4 flex items-center gap-2">
                    <Lightbulb className="text-yellow-400" />
                    Personalized Recommendations
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {assessment.recommendations.immediate && (
                      <div>
                        <h4 className="text-sm  text-red-300 mb-3 uppercase tracking-wide">
                          Immediate Actions
                        </h4>
                        <div className="space-y-2">
                          {assessment.recommendations.immediate.map(
                            (rec, index) => (
                              <div
                                key={index}
                                className="bg-red-500/10 border border-red-500/30 rounded-lg p-3"
                              >
                                <p className="text-red-300 text-sm">{rec}</p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {assessment.recommendations.longTerm && (
                      <div>
                        <h4 className="text-sm  text-blue-300 mb-3 uppercase tracking-wide">
                          Long-term Goals
                        </h4>
                        <div className="space-y-2">
                          {assessment.recommendations.longTerm.map(
                            (rec, index) => (
                              <div
                                key={index}
                                className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3"
                              >
                                <p className="text-blue-300 text-sm">{rec}</p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {assessment.recommendations.practiceExercises && (
                      <div>
                        <h4 className="text-sm  text-green-300 mb-3 uppercase tracking-wide">
                          Practice Exercises
                        </h4>
                        <div className="space-y-2">
                          {assessment.recommendations.practiceExercises.map(
                            (rec, index) => (
                              <div
                                key={index}
                                className="bg-green-500/10 border border-green-500/30 rounded-lg p-3"
                              >
                                <p className="text-green-300 text-sm">{rec}</p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Progress Tracking */}
              {assessment.progressTracking && (
                <div>
                  <h3 className="text-lg  text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="text-green-400" />
                    Progress Tracking
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {assessment.progressTracking.scoreChange && (
                      <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
                        <h4 className="text-white  mb-2">Score Change</h4>
                        <div
                          className={`text-2xl  ${
                            assessment.progressTracking.scoreChange > 0
                              ? 'text-green-400'
                              : 'text-red-400'
                          }`}
                        >
                          {assessment.progressTracking.scoreChange > 0
                            ? '+'
                            : ''}
                          {assessment.progressTracking.scoreChange}%
                        </div>
                        <p className="text-gray-400 text-sm">
                          {assessment.progressTracking.improvementSince &&
                            `Since ${assessment.progressTracking.improvementSince}`}
                        </p>
                      </div>
                    )}

                    {assessment.progressTracking.strengthsGained &&
                      assessment.progressTracking.strengthsGained.length >
                        0 && (
                        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
                          <h4 className="text-white  mb-2">New Strengths</h4>
                          <div className="space-y-1">
                            {assessment.progressTracking.strengthsGained.map(
                              (strength, index) => (
                                <div
                                  key={index}
                                  className="text-green-300 text-sm flex items-center gap-2"
                                >
                                  <CheckCircle size={14} />
                                  {strength}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Detailed Score Breakdown */}
              <div>
                <h3 className="text-lg  text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="text-blue-400" />
                  Detailed Score Analysis
                </h3>
                <div className="space-y-4">
                  {categoryScores.map(({ label, score, icon: Icon }) => (
                    <div
                      key={label}
                      className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Icon size={20} className={getScoreColor(score)} />
                          <span className="text-white ">{label}</span>
                        </div>
                        <span className={`text-xl  ${getScoreColor(score)}`}>
                          {score}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            score >= 90
                              ? 'bg-green-400'
                              : score >= 80
                                ? 'bg-blue-400'
                                : score >= 70
                                  ? 'bg-yellow-400'
                                  : 'bg-orange-400'
                          }`}
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 text-sm text-gray-400">
                        {score >= 90
                          ? 'Excellent - Keep up the great work!'
                          : score >= 80
                            ? 'Good - Minor improvements needed'
                            : score >= 70
                              ? 'Fair - Some areas need attention'
                              : 'Needs improvement - Focus on this area'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrity' && assessment.integrityAnalysis && (
            <div className="p-6 space-y-6">
              {/* Integrity Overview */}
              <div
                className={`border rounded-xl p-6 ${getIntegrityColor(assessment.integrityAnalysis.integrityRisk)}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  {getIntegrityIcon(assessment.integrityAnalysis.integrityRisk)}
                  <h3 className="text-xl ">
                    Integrity Risk:{' '}
                    {assessment.integrityAnalysis.integrityRisk.toUpperCase()}
                  </h3>
                </div>
                <p className="opacity-90">
                  {assessment.integrityAnalysis.integrityRisk === 'low' &&
                    'Your story shows excellent originality and authentic writing. Great work!'}
                  {assessment.integrityAnalysis.integrityRisk === 'medium' &&
                    'Your story is mostly original with minor concerns. Review the analysis below.'}
                  {assessment.integrityAnalysis.integrityRisk === 'high' &&
                    'Your story has some originality concerns that should be addressed.'}
                  {assessment.integrityAnalysis.integrityRisk === 'critical' &&
                    'Your story has significant originality issues that need immediate attention.'}
                </p>
              </div>

              {/* Detailed Scores */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 text-center">
                  <Shield className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <div className="text-3xl  text-green-400 mb-1">
                    {assessment.integrityAnalysis.originalityScore}%
                  </div>
                  <div className="text-sm text-green-300">
                    Originality Score
                  </div>
                  <p className="text-xs text-green-200 mt-2">
                    Measures how unique and original your content is
                  </p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 text-center">
                  <Brain className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <div className="text-3xl  text-blue-400 mb-1">
                    {assessment.integrityAnalysis.aiDetectionScore}%
                  </div>
                  <div className="text-sm text-blue-300">
                    AI Detection Score
                  </div>
                  <p className="text-xs text-blue-200 mt-2">
                    Likelihood that content was generated by AI
                  </p>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6 text-center">
                  <Award className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <div className="text-3xl  text-purple-400 mb-1">
                    {100 - assessment.integrityAnalysis.plagiarismScore}%
                  </div>
                  <div className="text-sm text-purple-300">
                    Uniqueness Score
                  </div>
                  <p className="text-xs text-purple-200 mt-2">
                    How much of your content is unique
                  </p>
                </div>
              </div>

              {/* Detailed Analysis */}
              {assessment.integrityAnalysis.plagiarismResult && (
                <div>
                  <h3 className="text-lg  text-white mb-4 flex items-center gap-2">
                    <Shield className="text-green-400" />
                    Plagiarism Analysis
                  </h3>
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-400">
                          Detection Score
                        </div>
                        <div className="text-xl  text-white">
                          {assessment.integrityAnalysis.plagiarismResult.score}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Risk Level</div>
                        <div className="text-xl  text-white">
                          {
                            assessment.integrityAnalysis.plagiarismResult
                              .riskLevel
                          }
                        </div>
                      </div>
                    </div>
                    {assessment.integrityAnalysis.plagiarismResult
                      .detailedAnalysis && (
                      <div className="bg-gray-700/50 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-2">
                          Detailed Analysis
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {
                            assessment.integrityAnalysis.plagiarismResult
                              .detailedAnalysis
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {assessment.integrityAnalysis.aiDetectionResult && (
                <div>
                  <h3 className="text-lg  text-white mb-4 flex items-center gap-2">
                    <Brain className="text-blue-400" />
                    AI Detection Analysis
                  </h3>
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-400">
                          Overall Score
                        </div>
                        <div className="text-xl  text-white">
                          {
                            assessment.integrityAnalysis.aiDetectionResult
                              .overallScore
                          }
                          %
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Likelihood</div>
                        <div className="text-xl  text-white">
                          {
                            assessment.integrityAnalysis.aiDetectionResult
                              .likelihood
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-800/50">
          <div className="text-sm text-gray-400">
            Assessment generated on {new Date().toLocaleDateString()}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => router.push('/children-dashboard/my-stories')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              View All Stories
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
