// components/IntegrityDisplay.tsx - NEW COMPONENT
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
} from 'lucide-react';

interface IntegrityResult {
  integrityScore: number;
  plagiarismScore?: number;
  aiDetectionScore?: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  plagiarismRiskLevel?: 'low' | 'medium' | 'high' | 'critical';
  aiDetectionLikelihood?: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
}

interface IntegrityDisplayProps {
  results: IntegrityResult;
  warnings?: Array<{
    type: 'plagiarism' | 'ai_content';
    message: string;
    severity: string;
    score: number;
  }>;
  recommendations?: string[];
  showDetails?: boolean;
  className?: string;
}

export default function IntegrityDisplay({
  results,
  warnings = [],
  recommendations = [],
  showDetails = true,
  className = '',
}: IntegrityDisplayProps) {
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
    if (score >= 80) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getAiLikelihoodText = (likelihood: string) => {
    switch (likelihood) {
      case 'very_low':
        return 'Very Low';
      case 'low':
        return 'Low';
      case 'medium':
        return 'Medium';
      case 'high':
        return 'High';
      case 'very_high':
        return 'Very High';
      default:
        return 'Unknown';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-6 ${className}`}
    >
      {/* Overall Integrity Score */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">
              Content Integrity
            </h3>
          </div>
          <div
            className={`px-3 py-1 rounded-full border text-sm font-medium ${getRiskColor(results.riskLevel)}`}
          >
            <div className="flex items-center space-x-1">
              {getRiskIcon(results.riskLevel)}
              <span className="capitalize">{results.riskLevel} Risk</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Overall Score */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div
              className={`text-3xl font-bold ${getScoreColor(results.integrityScore)}`}
            >
              {results.integrityScore}%
            </div>
            <div className="text-sm text-gray-600 mt-1">Overall Integrity</div>
          </div>

          {/* Plagiarism Score */}
          {results.plagiarismScore !== undefined && (
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Search className="w-4 h-4 text-gray-600" />
                <div
                  className={`text-2xl font-bold ${getScoreColor(results.plagiarismScore)}`}
                >
                  {results.plagiarismScore}%
                </div>
              </div>
              <div className="text-sm text-gray-600">Originality</div>
              {results.plagiarismRiskLevel && (
                <div
                  className={`text-xs mt-1 px-2 py-1 rounded ${getRiskColor(results.plagiarismRiskLevel)}`}
                >
                  {results.plagiarismRiskLevel} risk
                </div>
              )}
            </div>
          )}

          {/* AI Detection Score */}
          {results.aiDetectionScore !== undefined && (
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Brain className="w-4 h-4 text-gray-600" />
                <div
                  className={`text-2xl font-bold ${getScoreColor(results.aiDetectionScore)}`}
                >
                  {results.aiDetectionScore}%
                </div>
              </div>
              <div className="text-sm text-gray-600">Human-like</div>
              {results.aiDetectionLikelihood && (
                <div
                  className={`text-xs mt-1 px-2 py-1 rounded ${
                    results.aiDetectionLikelihood === 'very_low' ||
                    results.aiDetectionLikelihood === 'low'
                      ? 'text-green-600 bg-green-50'
                      : results.aiDetectionLikelihood === 'medium'
                        ? 'text-yellow-600 bg-yellow-50'
                        : 'text-red-600 bg-red-50'
                  }`}
                >
                  {getAiLikelihoodText(results.aiDetectionLikelihood)} AI
                  likelihood
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
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
                    className={`font-medium ${
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

      {/* Recommendations */}
      {recommendations.length > 0 && showDetails && (
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h4 className="text-lg font-semibold text-blue-900 mb-3 flex items-center space-x-2">
            <Info className="w-5 h-5" />
            <span>Recommendations</span>
          </h4>
          <ul className="space-y-2">
            {recommendations.map((recommendation, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-start space-x-3 text-blue-800"
              >
                <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                <span className="text-sm">{recommendation}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Success Message */}
      {results.riskLevel === 'low' && warnings.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 rounded-lg p-6 border border-green-200"
        >
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h4 className="text-lg font-semibold text-green-900">
                Excellent Work!
              </h4>
              <p className="text-green-800 mt-1">
                Your content appears to be original and authentic. Keep up the
                great creative writing!
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
