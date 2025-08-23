// components/DetailedAssessmentDisplay.tsx - ENHANCED FOR DETAILED 16-STEP ANALYSIS
'use client';

import React, { useState } from 'react';
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
  ChevronDown,
  ChevronUp,
  FileText,
  BarChart3,
  Zap,
  Clock,
  GraduationCap,
} from 'lucide-react';

interface DetailedAssessmentData {
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

  // 16-Step Analysis
  sixteenStepAnalysis?: {
    step1_2_academicIntegrity: {
      status: 'PASS' | 'WARNING' | 'FAIL';
      message: string;
      aiDetectionRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      plagiarismRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      recommendation: string;
    };
    step3_6_educationalContent: {
      grammarScore: number;
      vocabularyScore: number;
      creativityScore: number;
      characterDevelopmentScore: number;
      plotDevelopmentScore: number;
      descriptiveWritingScore: number;
    };
    step7_10_specializedAnalysis: {
      sensoryDetailsScore: number;
      plotLogicScore: number;
      themeRecognitionScore: number;
      problemSolvingScore: number;
    };
    step11_13_ageAppropriatenessAndReadingLevel: {
      ageAppropriatenessScore: number;
      readingLevel: string;
      complexity: 'Beginner' | 'Elementary' | 'Intermediate' | 'Advanced';
      recommendation: string;
    };
    step14_16_comprehensiveFeedback: {
      overallScore: number;
      strengths: string[];
      improvements: string[];
      nextSteps: string[];
      teacherComment: string;
      encouragement: string;
      integrityStatus: {
        status: 'PASS' | 'WARNING' | 'FAIL';
        message: string;
        mentorNote?: string;
        adminFlags?: string[];
      };
    };
  };

  // Educational feedback
  feedback: string;
  strengths: string[];
  improvements: string[];
  educationalInsights: string;

  // Integrity analysis
  integrityStatus: string;
  aiDetectionScore: number;
  plagiarismScore: number;
  integrityRisk: string;

  // Metadata
  assessmentVersion?: string;
  assessmentDate?: string;
  assessmentType?: string;
}

interface DetailedAssessmentDisplayProps {
  assessment: DetailedAssessmentData;
  storyInfo?: {
    title: string;
    wordCount: number;
    attemptsRemaining: number;
  };
  onReassess?: () => void;
  className?: string;
}

export default function DetailedAssessmentDisplay({
  assessment,
  storyInfo,
  onReassess,
  className = '',
}: DetailedAssessmentDisplayProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['overview'])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

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

  const getRiskColor = (risk: string) => {
    const riskLevel = risk.toUpperCase();
    switch (riskLevel) {
      case 'LOW':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'HIGH':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'CRITICAL':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getIntegrityIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PASS':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'WARNING':
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'FAIL':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-600" />;
    }
  };

  const renderStepSection = (
    title: string,
    sectionKey: string,
    icon: any,
    children: React.ReactNode,
    color: string = 'blue'
  ) => {
    const isExpanded = expandedSections.has(sectionKey);
    const IconComponent = icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-${color}-50 rounded-xl border border-${color}-200 overflow-hidden`}
      >
        <button
          onClick={() => toggleSection(sectionKey)}
          className={`w-full px-6 py-4 flex items-center justify-between bg-${color}-100 hover:bg-${color}-150 transition-colors`}
        >
          <div className="flex items-center space-x-3">
            <IconComponent className={`w-6 h-6 text-${color}-600`} />
            <h3 className={`text-lg font-semibold text-${color}-800`}>
              {title}
            </h3>
          </div>
          {isExpanded ? (
            <ChevronUp className={`w-5 h-5 text-${color}-600`} />
          ) : (
            <ChevronDown className={`w-5 h-5 text-${color}-600`} />
          )}
        </button>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6"
          >
            {children}
          </motion.div>
        )}
      </motion.div>
    );
  };

  // Overall Assessment Prediction
  const getOverallPrediction = () => {
    const score = assessment.overallScore;
    const integrityStatus = assessment.integrityStatus?.toUpperCase() || 'PASS';

    if (score >= 87 && integrityStatus === 'PASS') {
      return {
        level: 'EXCEPTIONAL',
        message: 'Outstanding creative writing with excellent technical skills',
        color: 'green',
        icon: '🏆',
      };
    } else if (score >= 75) {
      return {
        level: 'STRONG',
        message: 'Well-developed story with good writing fundamentals',
        color: 'blue',
        icon: '⭐',
      };
    } else if (score >= 60) {
      return {
        level: 'DEVELOPING',
        message: 'Shows promise with room for growth',
        color: 'yellow',
        icon: '📝',
      };
    } else {
      return {
        level: 'EMERGING',
        message: 'Building foundation writing skills',
        color: 'orange',
        icon: '💪',
      };
    }
  };

  const prediction = getOverallPrediction();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-6 ${className}`}
    >
      {/* Header - Story Title and Overall Prediction */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8 border border-purple-200">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Assessment Analysis: &ldquo;
            {storyInfo?.title || 'Your Story'}&rdquo;
          </h1>
          <div className="text-lg text-gray-600 mb-4">
            16-Step Comprehensive Writing Evaluation
          </div>

          {/* Overall Assessment Prediction */}
          <div
            className={`inline-block px-6 py-4 rounded-xl bg-${prediction.color}-100 border border-${prediction.color}-300`}
          >
            <div className="flex items-center justify-center space-x-3">
              <span className="text-3xl">{prediction.icon}</span>
              <div>
                <div
                  className={`text-2xl font-bold text-${prediction.color}-800`}
                >
                  {prediction.level} WORK
                </div>
                <div className={`text-${prediction.color}-700`}>
                  {prediction.message}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Steps 1-2: Academic Integrity Check */}
      {assessment.sixteenStepAnalysis &&
        renderStepSection(
          'Steps 1-2: Academic Integrity Check',
          'integrity',
          Shield,
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {getIntegrityIcon(
                    assessment.sixteenStepAnalysis.step1_2_academicIntegrity
                      .status
                  )}
                </div>
                <div className="font-semibold text-lg">
                  {
                    assessment.sixteenStepAnalysis.step1_2_academicIntegrity
                      .status
                  }
                </div>
                <div className="text-sm text-gray-600">Integrity Status</div>
              </div>

              <div
                className={`text-center p-3 rounded-lg border ${getRiskColor(assessment.sixteenStepAnalysis.step1_2_academicIntegrity.aiDetectionRisk)}`}
              >
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Brain className="w-5 h-5" />
                  <span className="font-bold text-lg">
                    {
                      assessment.sixteenStepAnalysis.step1_2_academicIntegrity
                        .aiDetectionRisk
                    }
                  </span>
                </div>
                <div className="text-sm">AI Detection Risk</div>
              </div>

              <div
                className={`text-center p-3 rounded-lg border ${getRiskColor(assessment.sixteenStepAnalysis.step1_2_academicIntegrity.plagiarismRisk)}`}
              >
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Search className="w-5 h-5" />
                  <span className="font-bold text-lg">
                    {
                      assessment.sixteenStepAnalysis.step1_2_academicIntegrity
                        .plagiarismRisk
                    }
                  </span>
                </div>
                <div className="text-sm">Plagiarism Risk</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <div className="font-semibold text-gray-800 mb-2">
                Assessment Result:
              </div>
              <p className="text-gray-700 mb-3">
                {
                  assessment.sixteenStepAnalysis.step1_2_academicIntegrity
                    .message
                }
              </p>
              <div className="font-semibold text-gray-800 mb-2">
                Recommendation:
              </div>
              <p className="text-gray-700">
                {
                  assessment.sixteenStepAnalysis.step1_2_academicIntegrity
                    .recommendation
                }
              </p>
            </div>
          </div>,
          'red'
        )}

      {/* Steps 3-6: Educational Content Assessment */}
      {assessment.sixteenStepAnalysis &&
        renderStepSection(
          'Steps 3-6: Educational Content Assessment',
          'content',
          GraduationCap,
          <div>
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-3 text-blue-800">
                Category Scores (Predicted)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(
                  assessment.sixteenStepAnalysis.step3_6_educationalContent
                ).map(([key, score]) => {
                  const displayName = key
                    .replace(/Score$/, '')
                    .replace(/([A-Z])/g, ' $1')
                    .trim();
                  const capitalizedName =
                    displayName.charAt(0).toUpperCase() + displayName.slice(1);

                  return (
                    <div
                      key={key}
                      className="bg-white rounded-lg p-4 text-center border"
                    >
                      <div
                        className={`text-2xl font-bold ${getScoreColor(score as number)}`}
                      >
                        {score}/100
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {capitalizedName}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>,
          'blue'
        )}

      {/* Steps 7-10: Specialized Analysis */}
      {assessment.sixteenStepAnalysis &&
        renderStepSection(
          'Steps 7-10: Specialized Analysis',
          'specialized',
          BarChart3,
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(
                assessment.sixteenStepAnalysis.step7_10_specializedAnalysis
              ).map(([key, score]) => {
                const displayName = key
                  .replace(/Score$/, '')
                  .replace(/([A-Z])/g, ' $1')
                  .trim();
                const capitalizedName =
                  displayName.charAt(0).toUpperCase() + displayName.slice(1);

                return (
                  <div
                    key={key}
                    className="bg-white rounded-lg p-4 text-center border"
                  >
                    <div
                      className={`text-2xl font-bold ${getScoreColor(score as number)}`}
                    >
                      {score}/100
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {capitalizedName}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>,
          'purple'
        )}

      {/* Steps 11-13: Age Appropriateness & Reading Level */}
      {assessment.sixteenStepAnalysis &&
        renderStepSection(
          'Steps 11-13: Age Appropriateness & Reading Level',
          'age',
          Clock,
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              <div className="text-center bg-white rounded-lg p-4 border">
                <div
                  className={`text-3xl font-bold ${getScoreColor(assessment.sixteenStepAnalysis.step11_13_ageAppropriatenessAndReadingLevel.ageAppropriatenessScore)}`}
                >
                  {
                    assessment.sixteenStepAnalysis
                      .step11_13_ageAppropriatenessAndReadingLevel
                      .ageAppropriatenessScore
                  }
                  /100
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Age Appropriateness
                </div>
              </div>

              <div className="text-center bg-white rounded-lg p-4 border">
                <div className="text-2xl font-bold text-blue-600">
                  {
                    assessment.sixteenStepAnalysis
                      .step11_13_ageAppropriatenessAndReadingLevel.readingLevel
                  }
                </div>
                <div className="text-sm text-gray-600 mt-1">Reading Level</div>
              </div>

              <div className="text-center bg-white rounded-lg p-4 border">
                <div className="text-2xl font-bold text-purple-600">
                  {
                    assessment.sixteenStepAnalysis
                      .step11_13_ageAppropriatenessAndReadingLevel.complexity
                  }
                </div>
                <div className="text-sm text-gray-600 mt-1">Complexity</div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="font-semibold text-blue-800 mb-2">
                Recommendation:
              </div>
              <p className="text-blue-700">
                {
                  assessment.sixteenStepAnalysis
                    .step11_13_ageAppropriatenessAndReadingLevel.recommendation
                }
              </p>
            </div>
          </div>,
          'green'
        )}

      {/* Steps 14-16: Comprehensive Feedback Generation */}
      {assessment.sixteenStepAnalysis &&
        renderStepSection(
          'Steps 14-16: Comprehensive Feedback Generation',
          'feedback',
          MessageSquare,
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-600 mb-2">
                {
                  assessment.sixteenStepAnalysis.step14_16_comprehensiveFeedback
                    .overallScore
                }
                %
              </div>
              <div className="text-xl text-gray-600">
                Final Assessment Score
              </div>
            </div>

            {/* Strengths and Improvements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Strengths
                </h4>
                <ul className="space-y-2">
                  {assessment.sixteenStepAnalysis.step14_16_comprehensiveFeedback.strengths.map(
                    (strength, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-green-800 text-sm">
                          {strength}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <h4 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Areas for Improvement
                </h4>
                <ul className="space-y-2">
                  {assessment.sixteenStepAnalysis.step14_16_comprehensiveFeedback.improvements.map(
                    (improvement, index) => (
                      <li key={index} className="flex items-start">
                        <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-yellow-800 text-sm">
                          {improvement}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>

            {/* Teacher Comment */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="text-lg font-semibold text-blue-800 mb-3">
                Teacher&apos;s Comment
              </h4>
              <p className="text-blue-800 leading-relaxed">
                {
                  assessment.sixteenStepAnalysis.step14_16_comprehensiveFeedback
                    .teacherComment
                }
              </p>
            </div>

            {/* Next Steps */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h4 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2" />
                Next Steps
              </h4>
              <ol className="space-y-2">
                {assessment.sixteenStepAnalysis.step14_16_comprehensiveFeedback.nextSteps.map(
                  (step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-purple-800 text-sm">{step}</span>
                    </li>
                  )
                )}
              </ol>
            </div>

            {/* Final Integrity Status */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Final Integrity Status
              </h4>
              <div className="flex items-center space-x-3 mb-2">
                {getIntegrityIcon(
                  assessment.sixteenStepAnalysis.step14_16_comprehensiveFeedback
                    .integrityStatus.status
                )}
                <span className="font-semibold text-lg">
                  {
                    assessment.sixteenStepAnalysis
                      .step14_16_comprehensiveFeedback.integrityStatus.status
                  }
                </span>
              </div>
              <p className="text-gray-700">
                {
                  assessment.sixteenStepAnalysis.step14_16_comprehensiveFeedback
                    .integrityStatus.message
                }
              </p>
            </div>
          </div>,
          'indigo'
        )}

      {/* Risk Factors Summary */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="w-6 h-6 text-yellow-600 mr-2" />
          Assessment Summary & Risk Factors
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-3xl font-bold text-blue-600">
              {assessment.aiDetectionScore}%
            </div>
            <div className="text-sm text-blue-700 mt-1">Human-like Writing</div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-3xl font-bold text-green-600">
              {assessment.plagiarismScore}%
            </div>
            <div className="text-sm text-green-700 mt-1">Originality Score</div>
          </div>

          <div
            className={`text-center p-4 rounded-lg border ${getRiskColor(assessment.integrityRisk)}`}
          >
            <div className="text-2xl font-bold">
              {assessment.integrityRisk.toUpperCase()}
            </div>
            <div className="text-sm mt-1">Overall Risk</div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="font-semibold text-gray-800 mb-2">
            Final Assessment:
          </div>
          <p className="text-gray-700">{assessment.feedback}</p>
        </div>
      </div>

      {/* Reassessment Option */}
      {onReassess && storyInfo && storyInfo.attemptsRemaining > 0 && (
        <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
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
            Improve your story and get a fresh detailed analysis!
          </p>
        </div>
      )}
    </motion.div>
  );
}
