// components/writing/WordCounter.tsx (FIXED PROPS)
'use client';

import { motion } from 'framer-motion';
import { Target, CheckCircle, AlertCircle } from 'lucide-react';

interface WordCounterProps {
  current: number;
  min: number;
  max?: number;
  className?: string;
  // Legacy props for backward compatibility
  currentWords?: number;
  minWords?: number;
  maxWords?: number;
  totalStoryWords?: number;
  turnNumber?: number;
}

export default function WordCounter({
  current,
  min,
  max = 150,
  className = '',
  // Legacy props
  currentWords,
  minWords,
  maxWords,
  totalStoryWords,
  turnNumber,
}: WordCounterProps) {
  // Use new props if available, fallback to legacy props
  const wordCount = current ?? currentWords ?? 0;
  const minWordCount = min ?? minWords ?? 20;
  const maxWordCount = max ?? maxWords ?? 150;

  const getStatus = () => {
    if (wordCount < minWordCount) {
      return 'insufficient';
    } else if (wordCount >= minWordCount && wordCount <= maxWordCount) {
      return 'good';
    } else {
      return 'excessive';
    }
  };

  const status = getStatus();
  const percentage = Math.min((wordCount / minWordCount) * 100, 100);

  const getStatusColor = () => {
    switch (status) {
      case 'insufficient':
        return 'text-yellow-400';
      case 'good':
        return 'text-green-400';
      case 'excessive':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'insufficient':
        return <Target className="w-4 h-4" />;
      case 'good':
        return <CheckCircle className="w-4 h-4" />;
      case 'excessive':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getStatusMessage = () => {
    if (wordCount === 0) {
      return `Write at least ${minWordCount} words`;
    } else if (status === 'insufficient') {
      const needed = minWordCount - wordCount;
      return `${needed} more word${needed === 1 ? '' : 's'} needed`;
    } else if (status === 'good') {
      return `Perfect! ${wordCount} words`;
    } else {
      return `${wordCount} words (consider shortening)`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-3 rounded-lg border backdrop-blur-sm ${
        status === 'insufficient'
          ? 'bg-yellow-500/10 border-yellow-500/30'
          : status === 'good'
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-orange-500/10 border-orange-500/30'
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className=" text-sm">
            {wordCount}/{minWordCount}
          </span>
        </div>
        <span className={`text-xs ${getStatusColor()}`}>
          {Math.round(percentage)}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-700/50 rounded-full h-2 mb-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 0.3 }}
          className={`h-2 rounded-full ${
            status === 'insufficient'
              ? 'bg-yellow-400'
              : status === 'good'
                ? 'bg-green-400'
                : 'bg-orange-400'
          }`}
        />
      </div>

      {/* Status Message */}
      <p className={`text-xs ${getStatusColor()}`}>{getStatusMessage()}</p>

      {/* Additional info for legacy usage */}
      {totalStoryWords !== undefined && (
        <div className="mt-2 pt-2 border-t border-gray-600/30">
          <p className="text-xs text-gray-400">
            Story total: {totalStoryWords}/600 words
          </p>
        </div>
      )}
    </motion.div>
  );
}
