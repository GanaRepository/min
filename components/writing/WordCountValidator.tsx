// components/writing/WordCountValidator.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Target } from 'lucide-react';

interface WordCountValidatorProps {
  value: string;
  onChange: (value: string) => void;
  turnNumber: number;
  onValidationChange: (isValid: boolean, wordCount: number) => void;
  disabled?: boolean;
}

// Update the WORD_REQUIREMENTS to be consistent:
const WORD_REQUIREMENTS = {
  min: 60,
  max: 100,
  optimal: 80,
};

export default function WordCountValidator({
  value,
  onChange,
  turnNumber,
  onValidationChange,
  disabled = false,
}: WordCountValidatorProps) {
  const [wordCount, setWordCount] = useState(0);
  const [isValid, setIsValid] = useState(false);

  // FIXED: Simple word counting function
  const countWords = (text: string): number => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  useEffect(() => {
    const count = countWords(value);
    setWordCount(count);

    const valid =
      count >= WORD_REQUIREMENTS.min && count <= WORD_REQUIREMENTS.max;
    setIsValid(valid);
    onValidationChange(valid, count);
  }, [value, onValidationChange]);

  const getValidationStatus = () => {
    if (wordCount === 0) return 'empty';
    if (wordCount < WORD_REQUIREMENTS.min) return 'too-short';
    if (wordCount > WORD_REQUIREMENTS.max) return 'too-long';
    return 'valid';
  };

  const getStatusColor = () => {
    switch (getValidationStatus()) {
      case 'too-short':
        return 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10';
      case 'too-long':
        return 'text-red-400 border-red-500/50 bg-red-500/10';
      case 'valid':
        return 'text-green-400 border-green-500/50 bg-green-500/10';
      default:
        return 'text-gray-400 border-gray-600/50 bg-gray-800/50';
    }
  };

  const getStatusIcon = () => {
    switch (getValidationStatus()) {
      case 'too-short':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'too-long':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'valid':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      default:
        return <Target className="w-5 h-5 text-gray-400" />;
    }
  };

  // Update the validation messages:
  const getStatusMessage = () => {
    switch (getValidationStatus()) {
      case 'empty':
        return `Ready to write Turn ${turnNumber}? Write ${WORD_REQUIREMENTS.min}-${WORD_REQUIREMENTS.max} words to continue your story!`;
      case 'too-short':
        return `Keep writing! You need ${WORD_REQUIREMENTS.min - wordCount} more words to reach the minimum of ${WORD_REQUIREMENTS.min}.`;
      case 'too-long':
        return `Great writing! Please trim ${wordCount - WORD_REQUIREMENTS.max} words to stay within the ${WORD_REQUIREMENTS.max} word limit.`;
      case 'valid':
        return `Perfect! Your ${wordCount} words are within the ideal range (${WORD_REQUIREMENTS.min}-${WORD_REQUIREMENTS.max}). Ready to submit!`;
    }
  };

  const getProgressPercentage = () => {
    if (wordCount === 0) return 0;
    if (wordCount >= WORD_REQUIREMENTS.max) return 100;
    return (wordCount / WORD_REQUIREMENTS.max) * 100;
  };

  const getTurnGuidance = () => {
    const guidance: Record<number, string> = {
      1: 'Start your adventure! Introduce your character and setting.',
      2: 'What happens next? Add some action or dialogue.',
      3: 'Develop the story! What challenges does your character face?',
      4: 'Build excitement! How does the tension grow?',
      5: "Climax time! What's the biggest moment in your story?",
      6: 'Bring it home! How does your amazing story end?',
    };

    return guidance[turnNumber] || guidance[6];
  };

  return (
    <div className="space-y-4">
      {/* Turn Guidance */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4"
      >
        <h3 className="text-blue-300 font-semibold mb-2 flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Turn {turnNumber} Guidance
        </h3>
        <p className="text-blue-200 text-sm">{getTurnGuidance()}</p>
      </motion.div>

      {/* Word Count Status */}
      <motion.div
        layout
        className={`border rounded-xl p-4 transition-all duration-300 ${getStatusColor()}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="font-semibold">
              Word Count: {wordCount} / {WORD_REQUIREMENTS.min}-
              {WORD_REQUIREMENTS.max}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700/50 rounded-full h-2 mb-3 overflow-hidden">
          <motion.div
            className={`h-full transition-all duration-500 ${
              getValidationStatus() === 'valid'
                ? 'bg-green-500'
                : getValidationStatus() === 'too-long'
                  ? 'bg-red-500'
                  : 'bg-yellow-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(getProgressPercentage(), 100)}%` }}
          />
        </div>

        {/* Status Message */}
        <p className="text-sm opacity-90">{getStatusMessage()}</p>
      </motion.div>

      {/* Writing Textarea */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={`Turn ${turnNumber}: ${getTurnGuidance()}\n\nStart writing here... (${WORD_REQUIREMENTS.min}-${WORD_REQUIREMENTS.max} words)`}
          className={`w-full h-48 p-6 bg-gray-800/60 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all resize-none ${
            disabled
              ? 'cursor-not-allowed opacity-50'
              : getValidationStatus() === 'valid'
                ? 'border-green-500/50 focus:ring-green-500/25'
                : getValidationStatus() === 'too-long'
                  ? 'border-red-500/50 focus:ring-red-500/25'
                  : 'border-gray-600/50 focus:ring-blue-500/25'
          }`}
        />

        {/* Character indicator in corner */}
        <div
          className={`absolute bottom-4 right-4 px-3 py-1 rounded-lg text-xs font-mono ${
            getValidationStatus() === 'valid'
              ? 'bg-green-500/20 text-green-300'
              : getValidationStatus() === 'too-long'
                ? 'bg-red-500/20 text-red-300'
                : 'bg-gray-700/50 text-gray-400'
          }`}
        >
          {wordCount} words
        </div>
      </div>

      {/* Writing Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-4"
      >
        <h4 className="text-purple-300 font-semibold mb-2 flex items-center">
          💡 Writing Tips for Turn {turnNumber}
        </h4>
        <ul className="text-purple-200 text-sm space-y-1">
          <li>• Use descriptive words to paint a picture</li>
          <li>• Include dialogue to make characters come alive</li>
          <li>• Show what characters are feeling and thinking</li>
          <li>• Connect this turn to your previous writing</li>
        </ul>
      </motion.div>
    </div>
  );
}
