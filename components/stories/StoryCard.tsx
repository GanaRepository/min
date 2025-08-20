// components/stories/StoryCard.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Clock,
  Star,
  Download,
  Eye,
  Edit,
  MoreVertical,
  Play,
} from 'lucide-react';

interface Story {
  _id: string;
  title: string;
  content: string;
  totalWords: number;
  grammarScore: number;
  creativityScore: number;
  overallScore: number;
  publishedAt: string;
  elements: {
    genre: string;
    character: string;
    setting: string;
  };
  status: 'published' | 'draft' | 'in_progress';
}

interface StoryCardProps {
  story: Story;
  viewMode: 'grid' | 'list';
}

export default function StoryCard({ story, viewMode }: StoryCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return '✅';
      case 'in_progress':
        return '⏳';
      case 'draft':
        return '💾';
      default:
        return '📝';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'text-green-400';
      case 'in_progress':
        return 'text-yellow-400';
      case 'draft':
        return 'text-gray-400';
      default:
        return 'text-blue-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ x: 4, transition: { duration: 0.2 } }}
        className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6 group cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {/* Story Icon */}
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">
                {story.elements.genre === 'fantasy'
                  ? '🧙‍♀️'
                  : story.elements.genre === 'space'
                    ? '🚀'
                    : story.elements.genre === 'animals'
                      ? '🐾'
                      : '📖'}
              </span>
            </div>

            {/* Story Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-white  text-lg group-hover:text-green-400 transition-colors truncate">
                  {story.title}
                </h3>
                <span className={`text-sm ${getStatusColor(story.status)}`}>
                  {getStatusIcon(story.status)}
                </span>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                <span>{story.totalWords} words</span>
                <span>•</span>
                <span>{formatDate(story.publishedAt)}</span>
                <span>•</span>
                <span className="capitalize">
                  {story.status.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                {story.status === 'published' && (
                  <>
                    <div className="text-xs text-gray-400">
                      Grammar:{' '}
                      <span className="text-green-400 ">
                        {story.grammarScore}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Creativity:{' '}
                      <span className="text-blue-400 ">
                        {story.creativityScore}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Overall:{' '}
                      <span className="text-purple-400 ">
                        {story.overallScore}%
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {story.status === 'in_progress' ? (
              <Link href={`/children-dashboard/story/${story._id}`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>Continue</span>
                </motion.button>
              </Link>
            ) : (
              <Link href={`/children-dashboard/my-stories/${story._id}`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </motion.button>
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative"
    >
      <Link
        href={
          story.status === 'in_progress'
            ? `/children-dashboard/story/${story._id}`
            : `/children-dashboard/my-stories/${story._id}`
        }
      >
        <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl overflow-hidden shadow-xl cursor-pointer">
          {/* Header */}
          <div className="relative h-32 bg-gradient-to-br from-purple-500 via-pink-600 to-orange-600 overflow-hidden">
            {/* Status badge */}
            <div className="absolute top-3 left-3 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs ">
              {story.elements.genre}
            </div>

            {/* Status indicator */}
            <div
              className={`absolute top-3 right-3 text-lg ${getStatusColor(story.status)}`}
            >
              {getStatusIcon(story.status)}
            </div>

            {/* Story element emoji */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ duration: 0.3 }}
                className="text-6xl opacity-80"
              >
                {story.elements.genre === 'fantasy'
                  ? '🧙‍♀️'
                  : story.elements.genre === 'space'
                    ? '🚀'
                    : story.elements.genre === 'animals'
                      ? '🐾'
                      : story.elements.genre === 'adventure'
                        ? '🗺️'
                        : '📖'}
              </motion.div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-xl  text-white mb-3 group-hover:text-green-400 transition-colors line-clamp-2">
              {story.title}
            </h3>

            {/* Story elements */}
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.values(story.elements)
                .slice(0, 3)
                .map((element, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-700/50 rounded-full text-xs text-gray-300"
                  >
                    {element}
                  </span>
                ))}
            </div>

            {/* Stats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>{story.totalWords} words</span>
                <span>{formatDate(story.publishedAt)}</span>
              </div>

              {story.status === 'published' && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400  text-sm">
                      {story.overallScore}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-400">
                    <Download className="w-3 h-3" />
                    <span>PDF & Word</span>
                  </div>
                </div>
              )}

              {story.status === 'in_progress' && (
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                  <p className="text-yellow-300 text-sm ">
                    Ready to continue your adventure!
                  </p>
                </div>
              )}
            </div>

            {/* Action button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full mt-4 py-2 px-4 rounded-lg  text-sm transition-all ${
                story.status === 'in_progress'
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {story.status === 'in_progress'
                ? 'Continue Writing'
                : 'View Story'}
            </motion.button>
          </div>

          {/* Hover effect overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </Link>
    </motion.div>
  );
}
