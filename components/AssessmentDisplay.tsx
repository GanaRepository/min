// components/AssessmentDisplay.tsx - ENHANCED FOR INTEGRITY ANALYSIS
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Brain,
  Search,
  Info,
  Star,
  TrendingUp,
  Award,
  Target,
  BookOpen,
} from 'lucide-react';

interface AssessmentData {
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
  vocabularyUsed: string[];
  suggestedWords: string[];
  educationalInsights: string;

  // NEW: Additional assessment categories
  descriptiveWritingScore?: number;
  sensoryDetailsScore?: number;
  plotLogicScore?: number;
  causeEffectScore?: number;
  problemSolvingScore?: number;
  themeRecognitionScore?: number;
  ageAppropriatenessScore?: number;

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
  recommendations?: {
    immediate: string[];
    longTerm: string[];
    practiceExercises: string[];
  };
  assessmentVersion?: string;

  // Advanced category scores (from new engine)
  categoryScores?: {
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
}

interface AssessmentDisplayProps {
  assessment: AssessmentData;
  warnings?: Array<{
    type: 'plagiarism' | 'ai_content';
    message: string;
    severity: string;
    score: number;
  }>;
  storyInfo?: {
    title: string;
    wordCount: number;
    attemptsRemaining: number;
  };
  onReassess?: () => void;
  className?: string;
}

export default function AssessmentDisplay({
  assessment,
  warnings = [],
  storyInfo,
  onReassess,
  className = '',
}: AssessmentDisplayProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low':
        return <CheckCircle className="w-5 h-5" />;
      case 'medium':
        return <AlertCircle className="w-5 h-5" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5" />;
      case 'critical':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 90) return '🌟';
    if (score >= 80) return '⭐';
    if (score >= 70) return '👍';
    if (score >= 60) return '📝';
    return '💪';
  };

  // Check if this is an advanced assessment
  const isAdvancedAssessment =
    assessment.assessmentVersion === '2.0' ||
    assessment.integrityAnalysis ||
    assessment.plagiarismScore !== undefined ||
    assessment.categoryScores;

  // Helper function to get category score with fallback
  const getCategoryScore = (category: string): number => {
    if (assessment.categoryScores) {
      return assessment.categoryScores[category as keyof typeof assessment.categoryScores] as number || 0;
    }
    // Fallback to legacy fields
    switch (category) {
      case 'grammar': return assessment.grammarScore;
      case 'creativity': return assessment.creativityScore;
      case 'vocabulary': return assessment.vocabularyScore;
      case 'structure': return assessment.structureScore;
      case 'characterDevelopment': return assessment.characterDevelopmentScore;
      case 'plotDevelopment': return assessment.plotDevelopmentScore;
      case 'descriptiveWriting': return assessment.descriptiveWritingScore || 0;
      case 'sensoryDetails': return assessment.sensoryDetailsScore || 0;
      case 'plotLogic': return assessment.plotLogicScore || 0;
      case 'causeEffect': return assessment.causeEffectScore || 0;
      case 'problemSolving': return assessment.problemSolvingScore || 0;
      case 'themeRecognition': return assessment.themeRecognitionScore || 0;
      case 'ageAppropriateness': return assessment.ageAppropriatenessScore || 0;
      default: return 0;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-6 ${className}`}
    >
      {/* Story Info Header */}
      {storyInfo && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl  text-gray-900 mb-1">{storyInfo.title}</h2>
              <p className="text-gray-600">{storyInfo.wordCount} words</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Assessment Attempts</div>
              <div className="text-2xl  text-blue-600">
                {3 - storyInfo.attemptsRemaining}/3
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Integrity Analysis (if available) */}
      {isAdvancedAssessment &&
        (assessment.integrityAnalysis ||
          assessment.plagiarismScore !== undefined) && (
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl  text-gray-900">Content Integrity</h3>
              </div>
              <div
                className={`px-3 py-1 rounded-full border text-sm  ${getRiskColor(
                  assessment.integrityAnalysis?.integrityRisk ||
                    assessment.integrityRisk ||
                    'low'
                )}`}
              >
                <div className="flex items-center space-x-1">
                  {getRiskIcon(
                    assessment.integrityAnalysis?.integrityRisk ||
                      assessment.integrityRisk ||
                      'low'
                  )}
                  <span className="capitalize">
                    {assessment.integrityAnalysis?.integrityRisk ||
                      assessment.integrityRisk ||
                      'Low'}{' '}
                    Risk
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Overall Integrity */}
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div
                  className={`text-3xl  ${getScoreColor(
                    assessment.integrityAnalysis?.originalityScore ||
                      assessment.plagiarismScore ||
                      0
                  )}`}
                >
                  {assessment.integrityAnalysis?.originalityScore ||
                    assessment.plagiarismScore ||
                    0}
                  %
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Overall Integrity
                </div>
              </div>

              {/* Plagiarism Score */}
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Search className="w-4 h-4 text-gray-600" />
                  <div
                    className={`text-2xl  ${getScoreColor(
                      assessment.integrityAnalysis?.plagiarismScore ||
                        assessment.plagiarismScore ||
                        0
                    )}`}
                  >
                    {assessment.integrityAnalysis?.plagiarismScore ||
                      assessment.plagiarismScore ||
                      0}
                    %
                  </div>
                </div>
                <div className="text-sm text-gray-600">Originality</div>
                {assessment.integrityAnalysis?.plagiarismRiskLevel && (
                  <div
                    className={`text-xs mt-1 px-2 py-1 rounded ${getRiskColor(assessment.integrityAnalysis.plagiarismRiskLevel)}`}
                  >
                    {assessment.integrityAnalysis.plagiarismRiskLevel} risk
                  </div>
                )}
              </div>

              {/* AI Detection Score */}
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Brain className="w-4 h-4 text-gray-600" />
                  <div
                    className={`text-2xl  ${getScoreColor(
                      assessment.integrityAnalysis?.aiDetectionScore ||
                        assessment.aiDetectionScore ||
                        0
                    )}`}
                  >
                    {assessment.integrityAnalysis?.aiDetectionScore ||
                      assessment.aiDetectionScore ||
                      0}
                    %
                  </div>
                </div>
                <div className="text-sm text-gray-600">Human-like</div>
                {assessment.integrityAnalysis?.aiDetectionLikelihood && (
                  <div
                    className={`text-xs mt-1 px-2 py-1 rounded ${
                      assessment.integrityAnalysis.aiDetectionLikelihood ===
                        'very_low' ||
                      assessment.integrityAnalysis.aiDetectionLikelihood ===
                        'low'
                        ? 'text-green-600 bg-green-50'
                        : assessment.integrityAnalysis.aiDetectionLikelihood ===
                            'medium'
                          ? 'text-yellow-600 bg-yellow-50'
                          : 'text-red-600 bg-red-50'
                    }`}
                  >
                    {assessment.integrityAnalysis.aiDetectionLikelihood.replace(
                      '_',
                      ' '
                    )}{' '}
                    AI likelihood
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {/* Warnings Section */}
      {warnings.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg  text-gray-900 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span>Integrity Concerns</span>
          </h4>
          {warnings.map((warning, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border-l-4 ${
                warning.type === 'plagiarism'
                  ? 'bg-red-50 border-red-400'
                  : 'bg-orange-50 border-orange-400'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`mt-0.5 ${
                    warning.type === 'plagiarism'
                      ? 'text-red-600'
                      : 'text-orange-600'
                  }`}
                >
                  {warning.type === 'plagiarism' ? (
                    <Search className="w-5 h-5" />
                  ) : (
                    <Brain className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <div
                    className={` ${
                      warning.type === 'plagiarism'
                        ? 'text-red-800'
                        : 'text-orange-800'
                    }`}
                  >
                    {warning.type === 'plagiarism'
                      ? 'Potential Plagiarism'
                      : 'Possible AI Content'}
                  </div>
                  <div
                    className={`text-sm mt-1 ${
                      warning.type === 'plagiarism'
                        ? 'text-red-700'
                        : 'text-orange-700'
                    }`}
                  >
                    {warning.message}
                  </div>
                  <div
                    className={`text-xs mt-2 ${
                      warning.type === 'plagiarism'
                        ? 'text-red-600'
                        : 'text-orange-600'
                    }`}
                  >
                    Score: {warning.score}% • Severity: {warning.severity}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Overall Score */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Award className="w-8 h-8 text-blue-600" />
            <h3 className="text-2xl  text-gray-900">Overall Score</h3>
          </div>
          <div
            className={`text-6xl  mb-2 ${getScoreColor(assessment.overallScore)}`}
          >
            {getScoreEmoji(assessment.overallScore)} {assessment.overallScore}%
          </div>
          <div className="text-gray-600 text-lg">
            {assessment.readingLevel} Level
          </div>
        </div>
      </div>

      {/* Category Scores */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-xl  text-gray-900 mb-4 flex items-center space-x-2">
          <Target className="w-6 h-6 text-purple-600" />
          <span>Detailed Breakdown</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[
            // Core Writing Skills
            {
              label: 'Grammar',
              category: 'grammar',
              score: getCategoryScore('grammar'),
              icon: BookOpen,
              group: 'core'
            },
            {
              label: 'Creativity',
              category: 'creativity', 
              score: getCategoryScore('creativity'),
              icon: Star,
              group: 'core'
            },
            {
              label: 'Vocabulary',
              category: 'vocabulary',
              score: getCategoryScore('vocabulary'),
              icon: Target,
              group: 'core'
            },
            {
              label: 'Structure',
              category: 'structure',
              score: getCategoryScore('structure'),
              icon: Award,
              group: 'core'
            },
            // Story Development
            {
              label: 'Characters',
              category: 'characterDevelopment',
              score: getCategoryScore('characterDevelopment'),
              icon: Star,
              group: 'story'
            },
            {
              label: 'Plot',
              category: 'plotDevelopment',
              score: getCategoryScore('plotDevelopment'),
              icon: TrendingUp,
              group: 'story'
            },
            // Advanced Writing Skills (only show if available)
            ...(isAdvancedAssessment ? [
              {
                label: 'Descriptive Writing',
                category: 'descriptiveWriting',
                score: getCategoryScore('descriptiveWriting'),
                icon: BookOpen,
                group: 'advanced'
              },
              {
                label: 'Sensory Details',
                category: 'sensoryDetails', 
                score: getCategoryScore('sensoryDetails'),
                icon: Star,
                group: 'advanced'
              },
              {
                label: 'Plot Logic',
                category: 'plotLogic',
                score: getCategoryScore('plotLogic'),
                icon: Target,
                group: 'advanced'
              },
              {
                label: 'Cause & Effect',
                category: 'causeEffect',
                score: getCategoryScore('causeEffect'),
                icon: TrendingUp,
                group: 'advanced'
              },
              {
                label: 'Problem Solving',
                category: 'problemSolving',
                score: getCategoryScore('problemSolving'),
                icon: Award,
                group: 'advanced'
              },
              {
                label: 'Theme Recognition',
                category: 'themeRecognition',
                score: getCategoryScore('themeRecognition'),
                icon: Star,
                group: 'advanced'
              },
              {
                label: 'Age Appropriateness',
                category: 'ageAppropriateness',
                score: getCategoryScore('ageAppropriateness'),
                icon: CheckCircle,
                group: 'advanced'
              }
            ] : [])
          ].filter(category => category.score > 0 || !isAdvancedAssessment || category.group === 'core').map((category, index) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-gray-50 rounded-lg p-4 text-center border-l-4 ${
                category.group === 'core' ? 'border-blue-400' :
                category.group === 'story' ? 'border-purple-400' :
                'border-green-400'
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <category.icon className={`w-5 h-5 mr-2 ${
                  category.group === 'core' ? 'text-blue-600' :
                  category.group === 'story' ? 'text-purple-600' :
                  'text-green-600'
                }`} />
                <span className="text-sm font-medium text-gray-700">{category.label}</span>
              </div>
              <div className={`text-3xl font-bold ${getScoreColor(category.score)}`}>
                {category.score}%
              </div>
              {category.group === 'advanced' && (
                <div className="text-xs text-green-600 mt-1 font-medium">
                  Advanced
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Teacher Feedback */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-xl  text-gray-900 mb-4 flex items-center space-x-2">
          <Info className="w-6 h-6 text-blue-600" />
          <span>Teacher Feedback</span>
        </h3>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-blue-900 leading-relaxed">{assessment.feedback}</p>
        </div>
      </div>

      {/* Strengths and Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <h4 className="text-lg  text-green-900 mb-3 flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>Your Strengths</span>
          </h4>
          <ul className="space-y-2">
            {assessment.strengths.map((strength, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="flex items-start space-x-2"
              >
                <Star className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-green-800 text-sm">{strength}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
          <h4 className="text-lg  text-yellow-900 mb-3 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Areas to Improve</span>
          </h4>
          <ul className="space-y-2">
            {assessment.improvements.map((improvement, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-start space-x-2"
              >
                <Target className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <span className="text-yellow-800 text-sm">{improvement}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      {/* Advanced Recommendations (if available) */}
      {assessment.recommendations && (
        <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
          <h4 className="text-lg  text-purple-900 mb-4 flex items-center space-x-2">
            <Info className="w-5 h-5" />
            <span>Personalized Recommendations</span>
          </h4>

          {assessment.recommendations.immediate &&
            assessment.recommendations.immediate.length > 0 && (
              <div className="mb-4">
                <h5 className=" text-purple-800 mb-2">Immediate Actions:</h5>
                <ul className="space-y-1">
                  {assessment.recommendations.immediate.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span className="text-purple-700 text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {assessment.recommendations.practiceExercises &&
            assessment.recommendations.practiceExercises.length > 0 && (
              <div>
                <h5 className=" text-purple-800 mb-2">Practice Exercises:</h5>
                <ul className="space-y-1">
                  {assessment.recommendations.practiceExercises.map(
                    (exercise, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Target className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span className="text-purple-700 text-sm">
                          {exercise}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
        </div>
      )}

      {/* Encouragement */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6 border border-pink-200">
        <h4 className="text-lg  text-pink-900 mb-3 flex items-center space-x-2">
          <Award className="w-5 h-5" />
          <span>Keep Writing!</span>
        </h4>
        <p className="text-pink-800 leading-relaxed">
          {assessment.educationalInsights}
        </p>
      </div>

      {/* Reassessment Option */}
      {onReassess && storyInfo && storyInfo.attemptsRemaining > 0 && (
        <div className="text-center">
          <button
            onClick={onReassess}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg  transition-colors duration-200 flex items-center space-x-2 mx-auto"
          >
            <TrendingUp className="w-5 h-5" />
            <span>
              Request New Assessment ({storyInfo.attemptsRemaining} left)
            </span>
          </button>
          <p className="text-gray-600 text-sm mt-2">
            Improve your story and get a fresh assessment!
          </p>
        </div>
      )}

      {/* Success Message for Clean Content */}
      {isAdvancedAssessment &&
        (assessment.integrityAnalysis?.integrityRisk === 'low' ||
          assessment.integrityRisk === 'low') &&
        warnings.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 rounded-lg p-6 border border-green-200"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h4 className="text-lg  text-green-900">
                  Excellent Original Work!
                </h4>
                <p className="text-green-800 mt-1">
                  Your content is completely original and authentic. Outstanding
                  creative writing!
                </p>
              </div>
            </div>
          </motion.div>
        )}
    </motion.div>
  );
}
