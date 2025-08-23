// components/ComprehensiveAssessmentDisplay.tsx - ENHANCED ASSESSMENT DISPLAY
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
  Lightbulb,
  MessageSquare,
  Eye,
  Users,
} from 'lucide-react';

interface ComprehensiveAssessmentData {
  // Core Assessment
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

  // Educational Feedback
  educationalFeedback: {
    strengths: string[];
    improvements: string[];
    nextSteps: string[];
    teacherComment: string;
    encouragement: string;
  };

  // Integrity Analysis
  integrityAnalysis: {
    originalityScore: number;
    plagiarismScore: number;
    aiDetectionScore: number;
    integrityRisk: 'low' | 'medium' | 'high' | 'critical';
    plagiarismRiskLevel: string;
    aiDetectionLikelihood: string;
  };

  // Recommendations
  recommendations: {
    immediate: string[];
    longTerm: string[];
    practiceExercises: string[];
  };

  // Progress Tracking
  progressTracking?: {
    improvementSince?: string;
    scoreChange?: number;
    strengthsGained?: string[];
    areasImproved?: string[];
  };

  // Assessment Metadata
  assessmentVersion?: string;
  assessmentDate?: string;
  assessmentType?: string;
}

interface ComprehensiveAssessmentDisplayProps {
  assessment: ComprehensiveAssessmentData;
  storyInfo?: {
    title: string;
    wordCount: number;
    attemptsRemaining: number;
  };
  onReassess?: () => void;
  className?: string;
}

export default function ComprehensiveAssessmentDisplay({
  assessment,
  storyInfo,
  onReassess,
  className = '',
}: ComprehensiveAssessmentDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-500/10 border-green-500/20';
    if (score >= 80) return 'bg-blue-500/10 border-blue-500/20';
    if (score >= 70) return 'bg-yellow-500/10 border-yellow-500/20';
    if (score >= 60) return 'bg-orange-500/10 border-orange-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 90) return '🌟';
    if (score >= 80) return '⭐';
    if (score >= 70) return '👍';
    if (score >= 60) return '📝';
    return '💪';
  };

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

  // Group categories for better organization
  const coreCategories = [
    { key: 'grammar', label: 'Grammar & Language', icon: BookOpen },
    { key: 'vocabulary', label: 'Vocabulary', icon: Target },
    { key: 'creativity', label: 'Creativity', icon: Star },
    { key: 'structure', label: 'Story Structure', icon: Award },
  ];

  const storyCategories = [
    {
      key: 'characterDevelopment',
      label: 'Character Development',
      icon: Users,
    },
    { key: 'plotDevelopment', label: 'Plot Development', icon: TrendingUp },
    { key: 'descriptiveWriting', label: 'Descriptive Writing', icon: Eye },
    { key: 'sensoryDetails', label: 'Sensory Details', icon: Star },
  ];

  const thinkingCategories = [
    { key: 'plotLogic', label: 'Plot Logic', icon: Brain },
    { key: 'causeEffect', label: 'Cause & Effect', icon: TrendingUp },
    { key: 'problemSolving', label: 'Problem Solving', icon: Lightbulb },
    { key: 'themeRecognition', label: 'Theme Recognition', icon: Award },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-8 ${className}`}
    >
      {/* Story Info Header */}
      {storyInfo && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {storyInfo.title}
              </h2>
              <p className="text-gray-600 text-lg">
                {storyInfo.wordCount} words
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">
                Assessment Progress
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {3 - storyInfo.attemptsRemaining}/3
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overall Score Section */}
      <div
        className={`rounded-xl p-8 border ${getScoreBgColor(assessment.overallScore)}`}
      >
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Award className="w-10 h-10 text-blue-600" />
            <h3 className="text-3xl font-bold text-gray-900">
              Overall Assessment
            </h3>
          </div>
          <div
            className={`text-7xl font-bold mb-4 ${getScoreColor(assessment.overallScore)}`}
          >
            {getScoreEmoji(assessment.overallScore)} {assessment.overallScore}%
          </div>
          <div className="text-xl text-gray-600 mb-2">
            Reading Level: {assessment.categoryScores.readingLevel}
          </div>
          {assessment.assessmentDate && (
            <div className="text-sm text-gray-500">
              Assessed on{' '}
              {new Date(assessment.assessmentDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Category Scores */}
      <div className="bg-white rounded-xl border p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <Target className="w-7 h-7 text-purple-600" />
          <span>Detailed Writing Analysis</span>
        </h3>

        {/* Core Writing Skills */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 text-blue-600">
            Core Writing Skills
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {coreCategories.map((category) => {
              const score = assessment.categoryScores[
                category.key as keyof typeof assessment.categoryScores
              ] as number;
              return (
                <motion.div
                  key={category.key}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-blue-50 rounded-lg p-4 border border-blue-200"
                >
                  <div className="flex items-center justify-center mb-3">
                    <category.icon className="w-6 h-6 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700 text-center">
                      {category.label}
                    </span>
                  </div>
                  <div
                    className={`text-3xl font-bold text-center ${getScoreColor(score)}`}
                  >
                    {score}%
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Story Development */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 text-purple-600">
            Story Development
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {storyCategories.map((category) => {
              const score = assessment.categoryScores[
                category.key as keyof typeof assessment.categoryScores
              ] as number;
              return (
                <motion.div
                  key={category.key}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-purple-50 rounded-lg p-4 border border-purple-200"
                >
                  <div className="flex items-center justify-center mb-3">
                    <category.icon className="w-6 h-6 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700 text-center">
                      {category.label}
                    </span>
                  </div>
                  <div
                    className={`text-3xl font-bold text-center ${getScoreColor(score)}`}
                  >
                    {score}%
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Critical Thinking */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4 text-green-600">
            Critical Thinking & Logic
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {thinkingCategories.map((category) => {
              const score = assessment.categoryScores[
                category.key as keyof typeof assessment.categoryScores
              ] as number;
              return (
                <motion.div
                  key={category.key}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 rounded-lg p-4 border border-green-200"
                >
                  <div className="flex items-center justify-center mb-3">
                    <category.icon className="w-6 h-6 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700 text-center">
                      {category.label}
                    </span>
                  </div>
                  <div
                    className={`text-3xl font-bold text-center ${getScoreColor(score)}`}
                  >
                    {score}%
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Age Appropriateness */}
        <div className="mt-6 text-center">
          <div className="inline-block bg-gray-50 rounded-lg p-4 border border-gray-200">
            <span className="text-sm font-medium text-gray-700 mr-2">
              Age Appropriateness:
            </span>
            <span
              className={`text-2xl font-bold ${getScoreColor(assessment.categoryScores.ageAppropriateness)}`}
            >
              {assessment.categoryScores.ageAppropriateness}%
            </span>
          </div>
        </div>
      </div>

      {/* Educational Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center space-x-2">
            <Star className="w-6 h-6" />
            <span>Your Strengths</span>
          </h3>
          {assessment.educationalFeedback.strengths.length > 0 ? (
            <ul className="space-y-3">
              {assessment.educationalFeedback.strengths.map(
                (strength, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-green-800">{strength}</span>
                  </motion.li>
                )
              )}
            </ul>
          ) : (
            <p className="text-green-700">
              Keep practicing to develop your strengths!
            </p>
          )}
        </div>

        {/* Areas for Improvement */}
        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
          <h3 className="text-xl font-bold text-yellow-800 mb-4 flex items-center space-x-2">
            <TrendingUp className="w-6 h-6" />
            <span>Areas to Improve</span>
          </h3>
          {assessment.educationalFeedback.improvements.length > 0 ? (
            <ul className="space-y-3">
              {assessment.educationalFeedback.improvements.map(
                (improvement, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <Target className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-yellow-800">{improvement}</span>
                  </motion.li>
                )
              )}
            </ul>
          ) : (
            <p className="text-yellow-700">
              Great work! No major areas for improvement identified.
            </p>
          )}
        </div>
      </div>

      {/* Teacher Comments */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center space-x-2">
          <MessageSquare className="w-6 h-6" />
          <span>Teacher Comments</span>
        </h3>
        <div className="bg-white rounded-lg p-4 border border-blue-100 mb-4">
          <p className="text-gray-800 leading-relaxed text-lg">
            {assessment.educationalFeedback.teacherComment}
          </p>
        </div>
        {assessment.educationalFeedback.encouragement && (
          <div className="bg-blue-100 rounded-lg p-4">
            <p className="text-blue-800 font-medium">
              💫 {assessment.educationalFeedback.encouragement}
            </p>
          </div>
        )}
      </div>

      {/* Next Steps & Practice Exercises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Steps */}
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center space-x-2">
            <Lightbulb className="w-6 h-6" />
            <span>Next Steps</span>
          </h3>
          {assessment.educationalFeedback.nextSteps.length > 0 ? (
            <ol className="space-y-3">
              {assessment.educationalFeedback.nextSteps.map((step, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-start space-x-3"
                >
                  <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-purple-800">{step}</span>
                </motion.li>
              ))}
            </ol>
          ) : (
            <p className="text-purple-700">
              Continue practicing your writing skills!
            </p>
          )}
        </div>

        {/* Practice Exercises */}
        <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
          <h3 className="text-xl font-bold text-indigo-800 mb-4 flex items-center space-x-2">
            <BookOpen className="w-6 h-6" />
            <span>Practice Exercises</span>
          </h3>
          {assessment.recommendations.practiceExercises.length > 0 ? (
            <ul className="space-y-3">
              {assessment.recommendations.practiceExercises.map(
                (exercise, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <Award className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span className="text-indigo-800">{exercise}</span>
                  </motion.li>
                )
              )}
            </ul>
          ) : (
            <p className="text-indigo-700">
              Keep writing stories to improve your skills!
            </p>
          )}
        </div>
      </div>

      {/* Academic Integrity Section */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Shield className="w-7 h-7 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">
              Academic Integrity
            </h3>
          </div>
          <div
            className={`px-4 py-2 rounded-full border text-sm font-medium ${getRiskColor(assessment.integrityAnalysis.integrityRisk)}`}
          >
            <div className="flex items-center space-x-1">
              {getRiskIcon(assessment.integrityAnalysis.integrityRisk)}
              <span className="capitalize">
                {assessment.integrityAnalysis.integrityRisk} Risk
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Originality Score */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div
              className={`text-4xl font-bold ${getScoreColor(assessment.integrityAnalysis.originalityScore)}`}
            >
              {assessment.integrityAnalysis.originalityScore}%
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Overall Originality
            </div>
          </div>

          {/* Plagiarism Score */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Search className="w-5 h-5 text-gray-600" />
              <div
                className={`text-3xl font-bold ${getScoreColor(assessment.integrityAnalysis.plagiarismScore)}`}
              >
                {assessment.integrityAnalysis.plagiarismScore}%
              </div>
            </div>
            <div className="text-sm text-gray-600">Plagiarism Check</div>
          </div>

          {/* AI Detection Score */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Brain className="w-5 h-5 text-gray-600" />
              <div
                className={`text-3xl font-bold ${getScoreColor(assessment.integrityAnalysis.aiDetectionScore)}`}
              >
                {assessment.integrityAnalysis.aiDetectionScore}%
              </div>
            </div>
            <div className="text-sm text-gray-600">Human-like Writing</div>
          </div>
        </div>
      </div>

      {/* Progress Tracking */}
      {assessment.progressTracking && (
        <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
          <h3 className="text-xl font-bold text-emerald-800 mb-4 flex items-center space-x-2">
            <TrendingUp className="w-6 h-6" />
            <span>Your Progress</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assessment.progressTracking.scoreChange !== undefined && (
              <div className="text-center">
                <div
                  className={`text-5xl font-bold ${
                    assessment.progressTracking.scoreChange > 0
                      ? 'text-green-600'
                      : assessment.progressTracking.scoreChange < 0
                        ? 'text-red-600'
                        : 'text-gray-600'
                  }`}
                >
                  {assessment.progressTracking.scoreChange > 0 ? '+' : ''}
                  {assessment.progressTracking.scoreChange}%
                </div>
                <div className="text-emerald-700 font-medium">Score Change</div>
              </div>
            )}
            {assessment.progressTracking.areasImproved && (
              <div className="text-center">
                <div className="text-5xl font-bold text-emerald-600">
                  {assessment.progressTracking.areasImproved.length}
                </div>
                <div className="text-emerald-700 font-medium">
                  Areas Improved
                </div>
              </div>
            )}
          </div>
          {assessment.progressTracking.strengthsGained &&
            assessment.progressTracking.strengthsGained.length > 0 && (
              <div className="mt-6">
                <h4 className="text-emerald-700 font-semibold mb-3">
                  Recent Improvements:
                </h4>
                <ul className="space-y-2">
                  {assessment.progressTracking.strengthsGained.map(
                    (strength, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span className="text-emerald-800">{strength}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
        </div>
      )}

      {/* Reassessment Option */}
      {onReassess && storyInfo && storyInfo.attemptsRemaining > 0 && (
        <div className="text-center">
          <button
            onClick={onReassess}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-colors duration-200 flex items-center space-x-2 mx-auto text-lg"
          >
            <TrendingUp className="w-6 h-6" />
            <span>
              Request New Assessment ({storyInfo.attemptsRemaining} left)
            </span>
          </button>
          <p className="text-gray-600 mt-3">
            Improve your story and get a fresh assessment!
          </p>
        </div>
      )}

      {/* Success Message for High Quality Work */}
      {assessment.overallScore >= 85 &&
        assessment.integrityAnalysis.integrityRisk === 'low' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200"
          >
            <div className="flex items-center space-x-4">
              <div className="text-6xl">🏆</div>
              <div>
                <h4 className="text-2xl font-bold text-green-800">
                  Outstanding Work!
                </h4>
                <p className="text-green-700 mt-2 text-lg">
                  Your story demonstrates excellent writing skills and complete
                  originality. You should be proud of this creative achievement!
                </p>
              </div>
            </div>
          </motion.div>
        )}
    </motion.div>
  );
}
