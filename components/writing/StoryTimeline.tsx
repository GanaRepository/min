// components/writing/StoryTimeline.tsx (FIXED HEIGHT & AI OPENING)
'use client';

import { motion } from 'framer-motion';
import { User, Bot, Sparkles } from 'lucide-react';

interface Turn {
  turnNumber: number;
  childInput: string;
  aiResponse: string;
  wordCount: number;
  timestamp?: string;
}

interface StoryTimelineProps {
  turns: Turn[];
  currentTurn: number;
  aiOpening?: string;
  storyElements?: any;
  isAiTyping?: boolean;
}

const TypingIndicator = () => (
  <div className="flex items-center space-x-1">
    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
    <div
      className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
      style={{ animationDelay: '0.1s' }}
    ></div>
    <div
      className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
      style={{ animationDelay: '0.2s' }}
    ></div>
    <span className="text-green-300 text-sm ml-2">AI is writing...</span>
  </div>
);

export default function StoryTimeline({
  turns,
  currentTurn,
  aiOpening,
  storyElements,
  isAiTyping = false,
}: StoryTimelineProps) {
  return (
    <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6">
      <h3 className="text-white  text-lg mb-4 flex items-center">
        💬 Story Chat
      </h3>

      {/* ✅ FIXED: Normal order (top to bottom) + proper height */}
      <div className="space-y-4 overflow-y-auto pr-2 h-[500px]">
        {/* ✅ 1. CHILD: Selected Story Elements (LEFT SIDE) */}
        {storyElements && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-start space-x-3 max-w-[85%]">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 rounded-bl-none">
                <div className="text-purple-300  text-sm mb-2">
                  Selected Story Elements:
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(storyElements).map(([type, value]) => (
                    <span
                      key={type}
                      className="px-2 py-1 bg-purple-600/30 rounded-full text-xs text-purple-200 capitalize"
                    >
                      {value as string}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ✅ 2. AI: Opening Response (RIGHT SIDE) - SHOW THIS! */}
        {aiOpening && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-end"
          >
            <div className="flex items-start space-x-3 max-w-[85%]">
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 rounded-br-none">
                <div className="text-green-300  text-sm mb-2">
                  🎭 Teacher&apos;s Opening:
                </div>
                <p className="text-gray-200 text-sm leading-relaxed">
                  {aiOpening}
                </p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            </div>
          </motion.div>
        )}

        {/* ✅ 3. STORY TURNS - Chronological Order (First to Last) */}
        {turns.map((turn, index) => (
          <div key={`turn-${turn.turnNumber}`} className="space-y-4">
            {/* Child's Input (LEFT SIDE) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex justify-start"
            >
              <div className="flex items-start space-x-3 max-w-[85%]">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 rounded-bl-none">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-purple-300  text-sm">You wrote:</span>
                    <span className="text-xs text-gray-400">
                      Turn {turn.turnNumber}
                    </span>
                  </div>
                  <p className="text-gray-200 text-sm leading-relaxed mb-2">
                    {turn.childInput}
                  </p>
                  <div className="text-xs text-purple-300">
                    {turn.wordCount} words
                  </div>
                </div>
              </div>
            </motion.div>

            {/* AI's Response (RIGHT SIDE) */}
            {turn.aiResponse && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.1 }}
                className="flex justify-end"
              >
                <div className="flex items-start space-x-3 max-w-[85%]">
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 rounded-br-none">
                    <div className="text-green-300  text-sm mb-2">
                      AI responded:
                    </div>
                    <p className="text-gray-200 text-sm leading-relaxed">
                      {turn.aiResponse}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ))}

        {/* ✅ 4. AI Typing Indicator */}
        {isAiTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-end"
          >
            <div className="flex items-start space-x-3 max-w-[85%]">
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 rounded-br-none">
                <TypingIndicator />
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Current turn indicator */}
        {currentTurn <= 6 && !isAiTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-4"
          >
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span>● Ready for turn {currentTurn}</span>
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {turns.length === 0 && !aiOpening && !storyElements && (
          <div className="text-gray-400 text-center py-8">
            <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Your story chat will appear here!</p>
          </div>
        )}
      </div>
    </div>
  );
}
