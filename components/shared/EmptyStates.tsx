// components/shared/EmptyStates.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Search, Trophy, AlertCircle } from 'lucide-react';
import { ComponentType } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  icon: ComponentType<{ className?: string }>;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  actionText,
  actionHref,
  onAction,
  icon: Icon,
  className = '',
}: EmptyStateProps) {
  const ActionComponent = actionHref ? Link : 'button';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center py-12 px-6 ${className}`}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <Icon className="w-12 h-12 text-gray-400" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xl  text-white mb-2"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-gray-400 mb-6 max-w-md mx-auto"
      >
        {description}
      </motion.p>

      {actionText && (actionHref || onAction) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ActionComponent
            href={actionHref || '#'}
            onClick={onAction}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl  hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            {actionText}
          </ActionComponent>
        </motion.div>
      )}
    </motion.div>
  );
}

// Specific empty state variants
export function NoStoriesEmpty() {
  return (
    <EmptyState
      title="No stories yet"
      description="Start creating your first amazing story and let your imagination run wild!"
      // components/shared/EmptyStates.tsx (continued)
      actionText="Create Your First Story"
      actionHref="/create-stories"
      icon={BookOpen}
    />
  );
}

export function NoSearchResultsEmpty({ query }: { query: string }) {
  return (
    <EmptyState
      title="No stories found"
      description={`We couldn't find any stories matching "${query}". Try adjusting your search or filters.`}
      icon={Search}
    />
  );
}

export function NoAchievementsEmpty() {
  return (
    <EmptyState
      title="No achievements yet"
      description="Keep writing amazing stories to unlock your first achievement badge!"
      icon={Trophy}
    />
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We encountered an error. Please try again.',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      actionText="Try Again"
      onAction={onRetry}
      icon={AlertCircle}
    />
  );
}
