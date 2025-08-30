// components/writing/ProgressTracker.tsx (DEBUG VERSION)
'use client';

import { motion } from 'framer-motion';
import { Clock, Target, Zap, BookOpen } from 'lucide-react';

interface ProgressTrackerProps {
  session: {
    currentTurn: number;
    totalWords: number;
    apiCallsUsed: number;
    maxApiCalls: number;
    status: string;
  };
  className?: string;
}

export default function ProgressTracker({
  session,
  className = '',
}: ProgressTrackerProps) {
  // ✅ ADD DEBUG LOGGING
  console.log('🔧 ProgressTracker session data:', {
    apiCallsUsed: session.apiCallsUsed,
    maxApiCalls: session.maxApiCalls,
    type_apiCallsUsed: typeof session.apiCallsUsed,
    type_maxApiCalls: typeof session.maxApiCalls,
  });

  const turnsProgress = ((session.currentTurn - 1) / 6) * 100;
  const wordsProgress = Math.min((session.totalWords / 600) * 100, 100);

  // ✅ FIXED: Handle null/undefined values properly
  const apiCallsUsed = Number(session.apiCallsUsed) || 0;
  const maxApiCalls = Number(session.maxApiCalls) || 7;
  const apiProgress = (apiCallsUsed / maxApiCalls) * 100;

  console.log('🔧 Calculated API progress:', {
    apiCallsUsed,
    maxApiCalls,
    apiProgress,
    percentage: Math.round(apiProgress),
  });

  const getEncouragementMessage = () => {
    if (session.currentTurn <= 2) {
      return "🌟 Great start! You're building an amazing story.";
    } else if (session.currentTurn <= 4) {
      return '🚀 Keep going! Your creativity is shining through.';
    } else if (session.currentTurn <= 6) {
      return '🎯 Almost there! Time to bring your story to an epic conclusion.';
    } else {
      return "🎉 Story complete! What an amazing adventure you've created.";
    }
  };

  const getWordTarget = () => {
    if (session.totalWords < 100) {
      return 'Try writing 100 more words this turn.';
    } else if (session.totalWords < 300) {
      return "You're building great momentum! Keep describing the adventure.";
    } else if (session.totalWords < 500) {
      return 'Excellent progress! Your story is really taking shape.';
    } else {
      return "Fantastic word count! You're telling a rich, detailed story.";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gray-800/40 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white  text-xl flex items-center">
          📊 Story Progress
        </h2>
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              session.status === 'active'
                ? 'bg-green-400 animate-pulse'
                : session.status === 'completed'
                  ? 'bg-blue-400'
                  : 'bg-yellow-400'
            }`}
          />
          <span className="text-gray-300 text-sm capitalize">
            {session.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Turns Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-gray-300 ">Turns</span>
            </div>
            <span className="text-white ">
              {session.currentTurn - 1}/6 completed
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${turnsProgress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full"
            />
          </div>
          <p className="text-blue-300 text-sm">{Math.round(turnsProgress)}%</p>
        </div>

        {/* Words Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-green-400" />
              <span className="text-gray-300 ">Words</span>
            </div>
            <span className="text-white ">{session.totalWords}/600 words</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${wordsProgress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full"
            />
          </div>
          <p className="text-green-300 text-sm">{Math.round(wordsProgress)}%</p>
        </div>

        {/* API Calls Progress - FIXED */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <span className="text-gray-300 ">AI Calls</span>
            </div>
            <span className="text-white ">
              {apiCallsUsed}/{maxApiCalls} used
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(apiProgress, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
              className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full"
            />
          </div>
          <p className="text-purple-300 text-sm">{Math.round(apiProgress)}%</p>
          {/* ✅ DEBUG INFO */}
          <p className="text-xs text-gray-500">
            Debug: {apiCallsUsed} calls used
          </p>
        </div>
      </div>

      {/* Encouragement Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg"
      >
        <p className="text-blue-300 ">{getEncouragementMessage()}</p>
        <p className="text-gray-400 text-sm mt-1">{getWordTarget()}</p>
      </motion.div>
    </motion.div>
  );
}
