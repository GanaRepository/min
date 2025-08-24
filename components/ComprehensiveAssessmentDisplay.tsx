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

interface ComprehensiveAssessmentProps {
  assessment: any;
  storyTitle: string;
}

export default function ComprehensiveAssessmentDisplay({
  assessment,
  storyTitle,
}: ComprehensiveAssessmentProps) {
  const data = assessment.comprehensiveAssessment;

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

  const getStatusColor = (status: string) => {
    if (status === 'EXCEPTIONAL WORK')
      return 'text-green-600 bg-green-50 border-green-200';
    if (status === 'EXCELLENT WORK')
      return 'text-blue-600 bg-blue-50 border-blue-200';
    if (status === 'GOOD WORK')
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (status === 'AI CONTENT DETECTED')
      return 'text-red-600 bg-red-50 border-red-200';
    return 'text-orange-600 bg-orange-50 border-orange-200';
  };

  const getRiskColor = (risk: string) => {
    if (risk.includes('CRITICAL'))
      return 'text-red-600 bg-red-50 border-red-200';
    if (risk.includes('HIGH'))
      return 'text-orange-600 bg-orange-50 border-orange-200';
    if (risk.includes('MEDIUM'))
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (risk.includes('LOW'))
      return 'text-green-600 bg-green-50 border-green-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getIntegrityIcon = (status: string) => {
    if (status === 'FAIL') return <XCircle className="w-8 h-8 text-red-600" />;
    if (status === 'WARNING')
      return <AlertTriangle className="w-8 h-8 text-yellow-600" />;
    return <CheckCircle className="w-8 h-8 text-green-600" />;
  };

  const isAIDetected =
    data.integrityAnalysis.overallStatus === 'FAIL' &&
    data.integrityAnalysis.aiDetection.riskLevel === 'CRITICAL RISK';

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
            Advanced 16-Step Analysis with AI Detection
          </div>
        </motion.div>

        {/* Overall Score Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl p-8 mb-8 text-center ${
            isAIDetected
              ? 'bg-gradient-to-r from-red-600 to-orange-600'
              : 'bg-gradient-to-r from-blue-600 to-purple-600'
          }`}
        >
          <div className="flex items-center justify-center mb-4">
            {isAIDetected ? (
              <AlertOctagon className="w-16 h-16 text-yellow-300 mr-4" />
            ) : (
              <Trophy className="w-16 h-16 text-yellow-300 mr-4" />
            )}
            <div>
              <div className="text-6xl font-bold text-white">
                {data.overallScore}%
              </div>
              <div className="text-xl text-gray-200">Overall Score</div>
            </div>
            {isAIDetected ? (
              <XCircle className="w-8 h-8 text-red-300 ml-4" />
            ) : (
              <CheckCircle className="w-8 h-8 text-green-400 ml-4" />
            )}
          </div>
          <div
            className={`inline-block px-6 py-3 rounded-full border-2 ${getStatusColor(data.status)}`}
          >
            <div className="font-bold text-lg">{data.status}</div>
            <div className="text-sm">{data.statusMessage}</div>
          </div>
        </motion.div>

        {/* STEP 1-2: Academic Integrity Check (ENHANCED) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-8 mb-8"
        >
          <div className="flex items-center mb-6">
            {getIntegrityIcon(data.integrityAnalysis.overallStatus)}
            <h4 className="text-2xl font-bold text-gray-900 ml-3">
              STEP 1-2: Advanced Integrity Analysis
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* AI Detection Results */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Brain className="w-6 h-6 text-blue-600" />
                <h5 className="text-xl font-bold text-gray-800">
                  AI Detection Results
                </h5>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${getRiskColor(data.integrityAnalysis.aiDetection.riskLevel)}`}
                >
                  {data.integrityAnalysis.aiDetection.riskLevel}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div
                  className={`p-4 rounded-lg border-2 ${
                    data.integrityAnalysis.aiDetection.humanLikeScore < 30
                      ? 'bg-red-50 border-red-200'
                      : data.integrityAnalysis.aiDetection.humanLikeScore < 60
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-green-50 border-green-200'
                  }`}
                >
                  <div
                    className={`text-3xl font-bold ${
                      data.integrityAnalysis.aiDetection.humanLikeScore < 30
                        ? 'text-red-600'
                        : data.integrityAnalysis.aiDetection.humanLikeScore < 60
                          ? 'text-yellow-600'
                          : 'text-green-600'
                    }`}
                  >
                    {data.integrityAnalysis.aiDetection.humanLikeScore}%
                  </div>
                  <div className="text-sm text-gray-600">Human-like Score</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-lg font-bold text-gray-700">
                    {data.integrityAnalysis.aiDetection.aiLikelihood}
                  </div>
                  <div className="text-sm text-gray-600">AI Likelihood</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">
                    {data.integrityAnalysis.aiDetection.confidenceLevel}%
                  </div>
                  <div className="text-sm text-gray-600">Confidence</div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800 text-sm">
                  <strong>Analysis:</strong>{' '}
                  {data.integrityAnalysis.aiDetection.analysis}
                </p>
              </div>

              {/* AI Detection Indicators */}
              {data.integrityAnalysis.aiDetection.indicators &&
                data.integrityAnalysis.aiDetection.indicators.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h6 className="font-semibold text-gray-800 mb-2">
                      Detection Indicators:
                    </h6>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {data.integrityAnalysis.aiDetection.indicators
                        .slice(0, 4)
                        .map((indicator: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            <span>{indicator}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
            </div>

            {/* Plagiarism Check */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-green-600" />
                <h5 className="text-xl font-bold text-gray-800">
                  Plagiarism Analysis
                </h5>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${
                    data.integrityAnalysis.plagiarismCheck.status === 'CLEAR'
                      ? 'text-green-600 bg-green-50 border-green-200'
                      : data.integrityAnalysis.plagiarismCheck.status ===
                          'WARNING'
                        ? 'text-yellow-600 bg-yellow-50 border-yellow-200'
                        : 'text-red-600 bg-red-50 border-red-200'
                  }`}
                >
                  {data.integrityAnalysis.plagiarismCheck.status}
                </div>
              </div>

              <div className="text-center p-6 bg-green-50 border-2 border-green-200 rounded-xl">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {data.integrityAnalysis.plagiarismCheck.originalityScore}%
                </div>
                <div className="text-lg font-medium text-gray-700 mb-2">
                  Originality Score
                </div>
                <div className="text-sm text-green-700">
                  Risk Level: {data.integrityAnalysis.plagiarismCheck.riskLevel}
                </div>
                {data.integrityAnalysis.plagiarismCheck.violations &&
                  data.integrityAnalysis.plagiarismCheck.violations.length >
                    0 && (
                    <div className="text-sm text-gray-600 mt-2">
                      Issues:{' '}
                      {Array.isArray(
                        data.integrityAnalysis.plagiarismCheck.violations
                      )
                        ? data.integrityAnalysis.plagiarismCheck.violations.join(
                            ', '
                          )
                        : data.integrityAnalysis.plagiarismCheck.violations}
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Final Integrity Assessment */}
          <div
            className={`p-6 rounded-xl border-2 ${
              data.integrityAnalysis.overallStatus === 'FAIL'
                ? 'bg-red-50 border-red-200'
                : data.integrityAnalysis.overallStatus === 'WARNING'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-green-50 border-green-200'
            }`}
          >
            <div className="flex items-center space-x-2 mb-4">
              {getIntegrityIcon(data.integrityAnalysis.overallStatus)}
              <h5
                className={`text-lg font-bold ${
                  data.integrityAnalysis.overallStatus === 'FAIL'
                    ? 'text-red-800'
                    : data.integrityAnalysis.overallStatus === 'WARNING'
                      ? 'text-yellow-800'
                      : 'text-green-800'
                }`}
              >
                Final Integrity Assessment:{' '}
                {data.integrityAnalysis.overallStatus}
              </h5>
            </div>
            <div className="space-y-2">
              <p
                className={`font-medium ${
                  data.integrityAnalysis.overallStatus === 'FAIL'
                    ? 'text-red-800'
                    : data.integrityAnalysis.overallStatus === 'WARNING'
                      ? 'text-yellow-800'
                      : 'text-green-800'
                }`}
              >
                <strong>Status:</strong> {data.integrityAnalysis.message}
              </p>
              <p
                className={`${
                  data.integrityAnalysis.overallStatus === 'FAIL'
                    ? 'text-red-700'
                    : data.integrityAnalysis.overallStatus === 'WARNING'
                      ? 'text-yellow-700'
                      : 'text-green-700'
                }`}
              >
                <strong>Recommendation:</strong>{' '}
                {data.integrityAnalysis.recommendation}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Conditional Content Based on Integrity Status */}
        {data.integrityAnalysis.overallStatus === 'FAIL' ? (
          // Show limited content for failed integrity
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 mb-8"
          >
            <div className="text-center">
              <AlertOctagon className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-red-800 mb-4">
                Assessment Incomplete
              </h3>
              <p className="text-red-700 mb-6">
                This submission appears to contain AI-generated content or other
                integrity concerns. Please submit original work that reflects
                your own creativity and writing abilities.
              </p>
              <div className="bg-white p-6 rounded-lg border border-red-200">
                <h4 className="font-bold text-red-800 mb-2">Next Steps:</h4>
                <ul className="text-red-700 text-left space-y-2">
                  {data.comprehensiveFeedback.nextSteps.map(
                    (step: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        <span>{step}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </motion.div>
        ) : (
          // Show full assessment for passed integrity
          <>
            {/* STEP 3-6: Educational Content Assessment */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-8 mb-8"
            >
              <div className="flex items-center mb-6">
                <BookOpen className="w-8 h-8 text-purple-600 mr-3" />
                <h4 className="text-2xl font-bold text-gray-900">
                  STEP 3-6: Educational Content Assessment
                </h4>
              </div>

              {/* Core Writing Skills */}
              <div className="mb-8">
                <h5 className="text-xl font-bold text-gray-800 mb-4">
                  Core Writing Skills:
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    {
                      key: 'grammar',
                      label: 'Grammar & Structure',
                      icon: BookOpen,
                      data: data.coreWritingSkills.grammar,
                    },
                    {
                      key: 'vocabulary',
                      label: 'Vocabulary',
                      icon: Zap,
                      data: data.coreWritingSkills.vocabulary,
                    },
                    {
                      key: 'creativity',
                      label: 'Creativity',
                      icon: Sparkles,
                      data: data.coreWritingSkills.creativity,
                    },
                    {
                      key: 'structure',
                      label: 'Structure',
                      icon: Target,
                      data: data.coreWritingSkills.structure,
                    },
                  ].map(({ key, label, icon: Icon, data: skillData }) => (
                    <div
                      key={key}
                      className={`p-4 rounded-xl border-2 ${getScoreBg(skillData.score)}`}
                    >
                      <div className="flex items-center justify-center mb-2">
                        <Icon className="w-5 h-5 text-gray-600 mr-2" />
                        <span className="font-medium text-sm text-center">
                          {label}
                        </span>
                      </div>
                      <div
                        className={`text-2xl font-bold text-center mb-2 ${getScoreColor(skillData.score)}`}
                      >
                        {skillData.score}/100
                      </div>
                      <p className="text-xs text-gray-600 text-center">
                        {skillData.feedback}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Story Development */}
              <div>
                <h5 className="text-xl font-bold text-gray-800 mb-4">
                  Story Development:
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      key: 'character',
                      label: 'Character Development',
                      icon: Users,
                      data: data.storyDevelopment.characterDevelopment,
                    },
                    {
                      key: 'plot',
                      label: 'Plot Development',
                      icon: TrendingUp,
                      data: data.storyDevelopment.plotDevelopment,
                    },
                    {
                      key: 'descriptive',
                      label: 'Descriptive Writing',
                      icon: Eye,
                      data: data.storyDevelopment.descriptiveWriting,
                    },
                  ].map(({ key, label, icon: Icon, data: skillData }) => (
                    <div
                      key={key}
                      className={`p-4 rounded-xl border-2 ${getScoreBg(skillData.score)}`}
                    >
                      <div className="flex items-center justify-center mb-2">
                        <Icon className="w-5 h-5 text-gray-600 mr-2" />
                        <span className="font-medium text-sm text-center">
                          {label}
                        </span>
                      </div>
                      <div
                        className={`text-2xl font-bold text-center mb-2 ${getScoreColor(skillData.score)}`}
                      >
                        {skillData.score}/100
                      </div>
                      <p className="text-xs text-gray-600 text-center">
                        {skillData.feedback}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Continue with remaining steps... */}
            {/* STEP 7-10, 11-13, 14-16 follow the same pattern as before */}

            {/* Teacher Comments and Final Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-8"
            >
              <div className="flex items-center mb-4">
                <Users className="w-6 h-6 text-blue-600 mr-2" />
                <h5 className="text-xl font-bold text-blue-800">
                  Teacher&apos;s Assessment
                </h5>
              </div>
              <blockquote className="text-blue-900 leading-relaxed italic">
                &ldquo;{data.comprehensiveFeedback.teacherAssessment}&rdquo;
              </blockquote>
            </motion.div>

            {/* Final Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-center text-white mb-8"
            >
              <h4 className="text-2xl font-bold mb-4">
                Final Assessment Summary
              </h4>
              <p className="text-lg leading-relaxed mb-6">
                {data.finalSummary}
              </p>
              <div className="flex justify-center items-center space-x-8">
                <div>
                  <div className="text-3xl font-bold">{data.overallRating}</div>
                  <div className="text-sm opacity-90">Overall Rating</div>
                </div>
                <div>
                  <div className="text-xl font-bold">
                    {data.recognitionLevel}
                  </div>
                  <div className="text-sm opacity-90">Recognition Level</div>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Assessment Completion Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="text-center text-white"
        >
          {data.integrityAnalysis.overallStatus === 'FAIL' ? (
            <p className="text-xl leading-relaxed text-red-300">
              ⚠️ This assessment detected integrity concerns. Please focus on
              submitting original work that reflects your authentic creative
              abilities and personal voice.
            </p>
          ) : (
            <p className="text-xl leading-relaxed">
              🎉 This assessment reflects comprehensive analysis with advanced
              AI detection. The evaluation considers both creative quality and
              content authenticity.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
