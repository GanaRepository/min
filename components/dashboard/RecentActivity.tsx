// components/dashboard/RecentActivity.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Star, MessageSquare, ArrowRight, Calendar } from 'lucide-react';

const recentActivities = [
  {
    type: 'story_completed',
    title: '"The Space Adventure"',
    description: 'Completed yesterday',
    score: {
      grammar: 85,
      creativity: 92,
      overall: 88,
    },
    comments: 2,
    href: '/children-dashboard/my-stories/space-adventure',
    emoji: '🌟',
    time: 'Yesterday',
  },
  {
    type: 'story_progress',
    title: '"Magic Forest Quest"',
    description: 'In progress...',
    progress: {
      words: 245,
      target: 600,
      turn: 3,
      maxTurn: 6,
    },
    href: '/children-dashboard/story/magic-forest-quest',
    emoji: '🌲',
    time: 'Today',
  },
  {
    type: 'story_published',
    title: '"Castle Mystery"',
    description: 'Published 2 days ago',
    downloads: 3,
    mentorFeedback: 'Great character development!',
    href: '/children-dashboard/my-stories/castle-mystery',
    emoji: '🏰',
    time: '2 days ago',
  },
];

export default function RecentActivity() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="mb-8"
    >
      <h2 className="text-xl font-bold text-white mb-4 flex items-center">
        📚 Recent Activity
      </h2>

      <div className="space-y-4">
        {recentActivities.map((activity, index) => (
          <motion.div
            key={activity.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
          >
            <Link href={activity.href}>
              <motion.div
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6 cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="text-3xl">{activity.emoji}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-white font-semibold group-hover:text-green-400 transition-colors">
                          {activity.title}
                        </h3>
                        <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                          {activity.time}
                        </span>
                      </div>

                      <p className="text-gray-300 text-sm mb-3">
                        {activity.description}
                      </p>

                      {/* Activity-specific content */}
                      {activity.type === 'story_completed' &&
                        activity.score && (
                          <div className="flex items-center space-x-4 mb-2">
                            <div className="text-xs text-gray-400">
                              Grammar:{' '}
                              <span className="text-green-400 font-medium">
                                {activity.score.grammar}%
                              </span>
                            </div>
                            <div className="text-xs text-gray-400">
                              Creativity:{' '}
                              <span className="text-blue-400 font-medium">
                                {activity.score.creativity}%
                              </span>
                            </div>
                            <div className="text-xs text-gray-400">
                              Overall:{' '}
                              <span className="text-purple-400 font-medium">
                                {activity.score.overall}%
                              </span>
                            </div>
                          </div>
                        )}

                      {activity.type === 'story_progress' &&
                        activity.progress && (
                          <div className="flex items-center space-x-4 mb-2">
                            <div className="text-xs text-gray-400">
                              Words:{' '}
                              <span className="text-green-400 font-medium">
                                {activity.progress.words}/
                                {activity.progress.target}
                              </span>
                            </div>
                            <div className="text-xs text-gray-400">
                              Turn:{' '}
                              <span className="text-blue-400 font-medium">
                                {activity.progress.turn}/
                                {activity.progress.maxTurn}
                              </span>
                            </div>
                          </div>
                        )}

                      {activity.type === 'story_published' && (
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="text-xs text-gray-400">
                            Downloads:{' '}
                            <span className="text-green-400 font-medium">
                              {activity.downloads}
                            </span>
                          </div>
                          {activity.mentorFeedback && (
                            <div className="text-xs text-gray-400">
                              Mentor:{' '}
                              <span className="text-yellow-400">
                                {activity.mentorFeedback}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Comments indicator */}
                      {activity.comments && (
                        <div className="flex items-center space-x-1 text-xs text-gray-400">
                          <MessageSquare className="w-3 h-3" />
                          <span>{activity.comments} mentor comments</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
                </div>

                {/* Progress bar for in-progress stories */}
                {activity.type === 'story_progress' && activity.progress && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(activity.progress.words / activity.progress.target) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
