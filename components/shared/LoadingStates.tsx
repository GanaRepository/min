// components/shared/LoadingStates.tsx
'use client';

import { motion } from 'framer-motion';
import { Loader2, BookOpen, PenTool, Sparkles } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function BasicLoading({
  message = 'Loading...',
  className,
}: LoadingStateProps) {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4"
        />
        <p className="text-white">{message}</p>
      </div>
    </div>
  );
}

export function StoryLoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-white"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotateY: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="text-6xl mb-6"
        >
          📚
        </motion.div>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl  mb-4"
        >
          Loading your creative space...
        </motion.h2>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-48 h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mx-auto"
        />
      </motion.div>
    </div>
  );
}

export function AIThinkingState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6 text-center"
    >
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="text-4xl mb-4"
      >
        🤖
      </motion.div>

      <h3 className="text-white  mb-2">AI is thinking...</h3>
      <p className="text-gray-400 text-sm mb-4">
        Creating the perfect response to continue your story
      </p>

      <div className="flex justify-center space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            className="w-2 h-2 bg-green-400 rounded-full"
          />
        ))}
      </div>
    </motion.div>
  );
}

export function CreatingStoryState() {
  const steps = [
    { icon: Sparkles, text: 'Selecting elements', delay: 0 },
    { icon: BookOpen, text: 'Building story world', delay: 0.5 },
    { icon: PenTool, text: 'Preparing AI assistant', delay: 1 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-white max-w-md"
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="text-6xl mb-6"
        >
          ✨
        </motion.div>

        <h2 className="text-2xl  mb-6">
          Creating Your Magical Story...
        </h2>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: step.delay }}
              className="flex items-center space-x-3"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: step.delay + 0.5,
                }}
                className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center"
              >
                <step.icon className="w-4 h-4 text-green-400" />
              </motion.div>
              <span className="text-gray-300">{step.text}</span>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: step.delay + 1 }}
                className="text-green-400"
              >
                ✓
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 3, delay: 0.5 }}
          className="w-full h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mt-6"
        />
      </motion.div>
    </div>
  );
}

export function SkeletonLoader({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gray-700/50 rounded h-4 w-3/4 mb-2" />
      <div className="bg-gray-700/50 rounded h-4 w-1/2 mb-2" />
      <div className="bg-gray-700/50 rounded h-4 w-5/6" />
    </div>
  );
}

export function StoryCardSkeleton() {
  return (
    <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl overflow-hidden animate-pulse">
      <div className="h-32 bg-gray-700/50" />
      <div className="p-6">
        <div className="h-6 bg-gray-700/50 rounded w-3/4 mb-3" />
        <div className="flex space-x-2 mb-4">
          <div className="h-6 bg-gray-700/50 rounded w-16" />
          <div className="h-6 bg-gray-700/50 rounded w-20" />
          <div className="h-6 bg-gray-700/50 rounded w-14" />
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-700/50 rounded w-full" />
          <div className="h-4 bg-gray-700/50 rounded w-2/3" />
        </div>
        <div className="h-10 bg-gray-700/50 rounded w-full" />
      </div>
    </div>
  );
}
