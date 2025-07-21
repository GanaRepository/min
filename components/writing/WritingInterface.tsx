// components/writing/WritingInterface.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Lightbulb, Target } from 'lucide-react';
import WordCounter from './WordCounter';
import WritingTips from './WritingTips';
import { getTurnRequirement, validateTurnInput } from '@/lib/ai/word-enforcer';

interface WritingInterfaceProps {
  currentInput: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  session: {
    currentTurn: number;
    totalWords: number;
    status: string;
  };
  turnNumber: number;
}

export default function WritingInterface({
  currentInput,
  onInputChange,
  onSubmit,
  isSubmitting,
  session,
  turnNumber
}: WritingInterfaceProps) {
  const [wordCount, setWordCount] = useState(0);
  const [validation, setValidation] = useState({ isValid: false, message: '' });
  
  const turnRequirement = getTurnRequirement(turnNumber);

  useEffect(() => {
    const words = currentInput.trim().split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
    
    const validationResult = validateTurnInput(currentInput, turnNumber);
    setValidation({
      isValid: validationResult.isValid,
      message: validationResult.message || ''
    });
  }, [currentInput, turnNumber]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (validation.isValid && !isSubmitting) {
        onSubmit();
      }
    }
  };

  return (
    <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6">
      <div className="mb-4">
        <h3 className="text-white font-semibold text-lg mb-2 flex items-center">
          ✍️ Your Turn to Write
        </h3>
        <p className="text-gray-400 text-sm">
          {turnRequirement.guidance}
        </p>
      </div>

      {/* Writing Area */}
      <div className="mb-4">
        <textarea
          value={currentInput}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Continue your amazing story here..."
          disabled={isSubmitting || session.status === 'completed'}
          className="w-full h-40 p-4 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Word Counter */}
      <WordCounter
        currentWords={wordCount}
        minWords={turnRequirement.minWords}
        maxWords={turnRequirement.maxWords}
        totalStoryWords={session.totalWords}
        turnNumber={turnNumber}
        current={wordCount}
        min={turnRequirement.minWords}
      />

      {/* Validation Message */}
      {!validation.isValid && currentInput.trim() && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg"
        >
          <p className="text-yellow-300 text-sm flex items-center">
            <Target className="w-4 h-4 mr-2" />
            {validation.message}
          </p>
        </motion.div>
      )}

      {/* Writing Tips */}
      <WritingTips 
        turnNumber={turnNumber}
        elements={session}
        className="mb-4"
      />

      {/* Submit Button */}
      <motion.button
        whileHover={{ scale: validation.isValid ? 1.02 : 1 }}
        whileTap={{ scale: validation.isValid ? 0.98 : 1 }}
        onClick={onSubmit}
        disabled={!validation.isValid || isSubmitting || session.status === 'completed'}
        className={`w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-medium transition-all ${
          validation.isValid && !isSubmitting && session.status !== 'completed'
            ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700'
            : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
        }`}
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Sending to AI...</span>
          </>
        ) : session.status === 'completed' ? (
          <>
            <span>Story Completed!</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Continue Story</span>
          </>
        )}
      </motion.button>

      {/* Keyboard Shortcut Hint */}
      <p className="text-xs text-gray-500 text-center mt-2">
        Press Ctrl+Enter (⌘+Enter on Mac) to submit
      </p>
    </div>
  );
}

