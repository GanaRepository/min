// // components/writing/WordCounter.tsx
// 'use client';

// import { motion } from 'framer-motion';
// import { Target, TrendingUp } from 'lucide-react';
// import { getWordCountStatus } from '@/lib/ai/word-enforcer';

// interface WordCounterProps {
//   currentWords: number;
//   minWords: number;
//   maxWords: number;
//   totalStoryWords: number;
//   turnNumber: number;
// }

// export default function WordCounter({
//   currentWords,
//   minWords,
//   maxWords,
//   totalStoryWords,
//   turnNumber
// }: WordCounterProps) {
//   const progress = Math.min((currentWords / minWords) * 100, 100);
//   const overallProgress = Math.min((totalStoryWords / 600) * 100, 100);
//   const status = getWordCountStatus(totalStoryWords, turnNumber);
  
//   const isComplete = currentWords >= minWords;
//   const isOverTarget = currentWords > maxWords;

//   return (
//     <div className="space-y-4 mb-4">
//       {/* Turn Progress */}
//       <div>
//         <div className="flex items-center justify-between mb-2">
//           <span className="text-sm text-gray-300 flex items-center">
//             <Target className="w-4 h-4 mr-1" />
//             This Turn: {currentWords}/{minWords} words
//           </span>
//           {isComplete && (
//             <span className="text-green-400 text-sm font-medium">✓ Ready</span>
//           )}
//           {isOverTarget && (
//             <span className="text-yellow-400 text-sm">
//               Over suggested ({maxWords})
//             </span>
//           )}
//         </div>
//         <div className="w-full bg-gray-700 rounded-full h-2">
//           <motion.div
//             initial={{ width: 0 }}
//             animate={{ width: `${Math.min(progress, 100)}%` }}
//             className={`h-2 rounded-full transition-all duration-300 ${
//               isComplete
//                 ? 'bg-gradient-to-r from-green-500 to-emerald-500'
//                 : 'bg-gradient-to-r from-blue-500 to-cyan-500'
//             }`}
//           />
//         </div>
//         {!isComplete && currentWords > 0 && (
//           <p className="text-xs text-gray-400 mt-1">
//             Need {minWords - currentWords} more words
//           </p>
//         )}
//       </div>

//       {/* Story Progress */}
//       <div>
//         <div className="flex items-center justify-between mb-2">
//           <span className="text-sm text-gray-300 flex items-center">
//             <TrendingUp className="w-4 h-4 mr-1" />
//             Story Progress: {totalStoryWords}/600 words
//           </span>
//           <span className="text-sm text-gray-400">
//             {overallProgress.toFixed(0)}%
//           </span>
//         </div>
//         <div className="w-full bg-gray-700 rounded-full h-2">
//           <motion.div
//             initial={{ width: 0 }}
//             animate={{ width: `${overallProgress}%` }}
//             className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
//           />
//         </div>
//       </div>

//       {/* Status Message */}
//       <motion.div
//         initial={{ opacity: 0, y: 10 }}
//         animate={{ opacity: 1, y: 0 }}
//         className={`p-3 rounded-lg border ${
//           status.status === 'ahead'
//             ? 'bg-green-500/20 border-green-500/30 text-green-300'
//             : status.status === 'behind'
//             ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300'
//             : 'bg-blue-500/20 border-blue-500/30 text-blue-300'
//         }`}
//       >
//         <p className="text-sm">{status.message}</p>
//       </motion.div>
//     </div>
//   );
// }

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
  turnNumber
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
          <span className="font-medium text-sm">
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
      <p className={`text-xs ${getStatusColor()}`}>
        {getStatusMessage()}
      </p>

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