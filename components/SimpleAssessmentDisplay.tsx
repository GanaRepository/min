'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  BookOpen,
  Sparkles,
  Users,
  TrendingUp,
  Target,
  Eye,
  Lightbulb,
  Award,
  Shield,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Brain,
  Trophy,
  Zap,
  ThumbsUp,
  XCircle,
  AlertOctagon,
} from 'lucide-react';

interface SimpleAssessmentProps {
  assessment: {
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
        status?: string;
      };
      aiDetectionResult?: {
        likelihood?: string;
        confidence?: number;
        humanLikeScore?: number;
        riskLevel?: string;
      };
      overallStatus?: string;
      message?: string;
    };
    integrityStatus?: {
      status: 'PASS' | 'WARNING' | 'FAIL';
      message: string;
    };
    assessmentDate?: string;
  };
  storyTitle: string;
}

export default function SimpleAssessmentDisplay({
  assessment,
  storyTitle,
}: SimpleAssessmentProps) {
  if (!assessment || assessment.overallScore === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">
            No Assessment Available
          </h2>
          <p className="text-gray-300 mb-6">
            This story hasn&apos;t been assessed yet. Complete your story to get
            detailed feedback!
          </p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 80) return 'bg-blue-50 border-blue-200';
    if (score >= 70) return 'bg-yellow-50 border-yellow-200';
    if (score >= 60) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getStatusText = (score: number) => {
    if (score >= 95) return 'EXCEPTIONAL WORK';
    if (score >= 90) return 'EXCELLENT WORK';
    if (score >= 80) return 'GREAT WORK';
    if (score >= 70) return 'GOOD WORK';
    if (score >= 60) return 'SATISFACTORY WORK';
    return 'NEEDS IMPROVEMENT';
  };

  const getStatusColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 80) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getIntegrityIcon = (status?: string) => {
    if (status === 'FAIL') return <XCircle className="w-8 h-8 text-red-600" />;
    if (status === 'WARNING')
      return <AlertTriangle className="w-8 h-8 text-yellow-600" />;
    return <CheckCircle className="w-8 h-8 text-green-600" />;
  };

  const overallScore = assessment.overallScore || 0;
  const statusText = getStatusText(overallScore);
  const integrityStatus = assessment.integrityStatus?.status || 'PASS';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Assessment Results
          </h1>
          <h2 className="text-2xl text-gray-300 mb-6">
            &ldquo;{storyTitle}&rdquo;
          </h2>
          <div className="text-lg text-gray-400">
            Comprehensive Writing Assessment
          </div>
        </motion.div>

        {/* Overall Score Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-center"
        >
          <div className="flex items-center justify-center mb-4">
            <Trophy className="w-16 h-16 text-yellow-300 mr-4" />
            <div>
              <div className="text-6xl font-bold text-white">
                {overallScore}%
              </div>
              <div className="text-xl text-gray-200">Overall Score</div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400 ml-4" />
          </div>
          <div
            className={`inline-block px-6 py-3 rounded-full border-2 ${getStatusColor(overallScore)}`}
          >
            <div className="font-bold text-lg">{statusText}</div>
            <div className="text-sm">Keep up the great work!</div>
          </div>
        </motion.div>

        {/* Integrity Check */}
        {assessment.integrityStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-8 mb-8"
          >
            <div className="flex items-center mb-6">
              {getIntegrityIcon(integrityStatus)}
              <h4 className="text-2xl font-bold text-gray-900 ml-3">
                Content Integrity Check
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Plagiarism Check */}
              {assessment.integrityAnalysis?.plagiarismResult && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-6 h-6 text-green-600" />
                    <h5 className="text-xl font-bold text-gray-800">
                      Originality Check
                    </h5>
                  </div>
                  <div className="text-center p-6 bg-green-50 border-2 border-green-200 rounded-xl">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {assessment.integrityAnalysis.plagiarismResult
                        .overallScore || 100}
                      %
                    </div>
                    <div className="text-lg font-medium text-gray-700 mb-2">
                      Originality Score
                    </div>
                    <div className="text-sm text-green-700">
                      Risk Level:{' '}
                      {assessment.integrityAnalysis.plagiarismResult
                        .riskLevel || 'low'}
                    </div>
                  </div>
                </div>
              )}

              {/* AI Detection */}
              {assessment.integrityAnalysis?.aiDetectionResult && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-6 h-6 text-blue-600" />
                    <h5 className="text-xl font-bold text-gray-800">
                      AI Detection
                    </h5>
                  </div>
                  <div className="text-center p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <div className="text-lg font-bold text-blue-600 mb-2">
                      {assessment.integrityAnalysis.aiDetectionResult
                        .likelihood || 'Low'}
                    </div>
                    <div className="text-sm text-blue-700 mb-3">
                      AI Likelihood
                    </div>

                    {/* Human-like Score */}
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {assessment.integrityAnalysis.aiDetectionResult
                        .humanLikeScore || 90}
                      %
                    </div>
                    <div className="text-sm text-green-700 mb-3">
                      Human-like Score
                    </div>

                    {/* Risk Level */}
                    <div className="text-sm text-gray-600 mb-2">
                      Risk:{' '}
                      {assessment.integrityAnalysis.aiDetectionResult
                        .riskLevel || 'VERY LOW RISK'}
                    </div>

                    {assessment.integrityAnalysis.aiDetectionResult
                      .confidence && (
                      <div className="text-xs text-gray-600 mt-2">
                        Confidence:{' '}
                        {
                          assessment.integrityAnalysis.aiDetectionResult
                            .confidence
                        }
                        %
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Final Status */}
            <div
              className={`p-6 rounded-xl border-2 mt-6 ${
                integrityStatus === 'FAIL'
                  ? 'bg-red-50 border-red-200'
                  : integrityStatus === 'WARNING'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-green-50 border-green-200'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                {getIntegrityIcon(integrityStatus)}
                <h5
                  className={`text-lg font-bold ${
                    integrityStatus === 'FAIL'
                      ? 'text-red-800'
                      : integrityStatus === 'WARNING'
                        ? 'text-yellow-800'
                        : 'text-green-800'
                  }`}
                >
                  Integrity Status: {integrityStatus}
                </h5>
              </div>
              <p
                className={`${
                  integrityStatus === 'FAIL'
                    ? 'text-red-700'
                    : integrityStatus === 'WARNING'
                      ? 'text-yellow-700'
                      : 'text-green-700'
                }`}
              >
                {assessment.integrityStatus.message}
              </p>
            </div>
          </motion.div>
        )}

        {/* Detailed Scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-8 mb-8"
        >
          <div className="flex items-center mb-6">
            <BookOpen className="w-8 h-8 text-purple-600 mr-3" />
            <h4 className="text-2xl font-bold text-gray-900">
              Detailed Assessment
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Core Writing Skills */}
            {[
              {
                key: 'grammarScore',
                label: 'Grammar & Structure',
                icon: BookOpen,
              },
              { key: 'vocabularyScore', label: 'Vocabulary', icon: Zap },
              { key: 'creativityScore', label: 'Creativity', icon: Sparkles },
              { key: 'structureScore', label: 'Story Structure', icon: Target },
              {
                key: 'characterDevelopmentScore',
                label: 'Character Development',
                icon: Users,
              },
              {
                key: 'plotDevelopmentScore',
                label: 'Plot Development',
                icon: TrendingUp,
              },
            ].map(({ key, label, icon: Icon }) => {
              const score = assessment[
                key as keyof typeof assessment
              ] as number;
              if (score === undefined) return null;

              return (
                <div
                  key={key}
                  className={`p-4 rounded-xl border-2 ${getScoreBg(score)}`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Icon className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="font-medium text-sm text-center">
                      {label}
                    </span>
                  </div>
                  <div
                    className={`text-2xl font-bold text-center mb-2 ${getScoreColor(score)}`}
                  >
                    {score}/100
                  </div>
                </div>
              );
            })}

            {/* Additional Scores */}
            {assessment.themeScore && (
              <div
                className={`p-4 rounded-xl border-2 ${getScoreBg(assessment.themeScore)}`}
              >
                <div className="flex items-center justify-center mb-2">
                  <Lightbulb className="w-5 h-5 text-gray-600 mr-2" />
                  <span className="font-medium text-sm text-center">Theme</span>
                </div>
                <div
                  className={`text-2xl font-bold text-center mb-2 ${getScoreColor(assessment.themeScore)}`}
                >
                  {assessment.themeScore}/100
                </div>
              </div>
            )}

            {assessment.dialogueScore && (
              <div
                className={`p-4 rounded-xl border-2 ${getScoreBg(assessment.dialogueScore)}`}
              >
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 text-gray-600 mr-2" />
                  <span className="font-medium text-sm text-center">
                    Dialogue
                  </span>
                </div>
                <div
                  className={`text-2xl font-bold text-center mb-2 ${getScoreColor(assessment.dialogueScore)}`}
                >
                  {assessment.dialogueScore}/100
                </div>
              </div>
            )}

            {assessment.descriptiveScore && (
              <div
                className={`p-4 rounded-xl border-2 ${getScoreBg(assessment.descriptiveScore)}`}
              >
                <div className="flex items-center justify-center mb-2">
                  <Eye className="w-5 h-5 text-gray-600 mr-2" />
                  <span className="font-medium text-sm text-center">
                    Descriptive Writing
                  </span>
                </div>
                <div
                  className={`text-2xl font-bold text-center mb-2 ${getScoreColor(assessment.descriptiveScore)}`}
                >
                  {assessment.descriptiveScore}/100
                </div>
              </div>
            )}
          </div>

          {/* Reading Level */}
          {assessment.readingLevel && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-gray-600 mr-2" />
                <span className="font-medium text-gray-800">
                  Reading Level:{' '}
                  <span className="text-blue-600">
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
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-8 mb-8"
          >
            <div className="flex items-center mb-6">
              <ThumbsUp className="w-8 h-8 text-green-600 mr-3" />
              <h4 className="text-2xl font-bold text-gray-900">
                Detailed Feedback
              </h4>
            </div>

            {assessment.feedback && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h5 className="font-bold text-blue-800 mb-2">
                  Overall Feedback:
                </h5>
                <p className="text-blue-700">{assessment.feedback}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              {assessment.strengths && assessment.strengths.length > 0 && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h5 className="font-bold text-green-800 mb-3 flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    Your Strengths:
                  </h5>
                  <ul className="space-y-2">
                    {assessment.strengths.map((strength, index) => (
                      <li
                        key={index}
                        className="text-green-700 flex items-start"
                      >
                        <span className="text-green-500 mr-2">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Areas for Improvement */}
              {assessment.improvements &&
                assessment.improvements.length > 0 && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h5 className="font-bold text-yellow-800 mb-3 flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Areas to Improve:
                    </h5>
                    <ul className="space-y-2">
                      {assessment.improvements.map((improvement, index) => (
                        <li
                          key={index}
                          className="text-yellow-700 flex items-start"
                        >
                          <span className="text-yellow-500 mr-2">•</span>
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>

            {/* Encouragement */}
            {assessment.encouragement && (
              <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h5 className="font-bold text-purple-800 mb-2 flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Encouragement:
                </h5>
                <p className="text-purple-700">{assessment.encouragement}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Assessment Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center text-white"
        >
          <p className="text-lg leading-relaxed">
            🎉 This assessment provides detailed feedback to help you grow as a
            writer. Keep practicing and exploring your creativity!
          </p>
          {assessment.assessmentDate && (
            <p className="text-sm text-gray-400 mt-2">
              Assessment completed on:{' '}
              {new Date(assessment.assessmentDate).toLocaleDateString()}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
