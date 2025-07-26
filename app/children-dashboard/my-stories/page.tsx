// app/children-dashboard/my-stories/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  Edit,
  Eye,
  PlayCircle,
  CheckCircle,
  PauseCircle,
  Plus,
  Clock,
  TrendingUp,
  Award,
} from 'lucide-react';

interface Story {
  _id: string;
  storyNumber: number;
  title: string;
  elements: {
    genre: string;
    character: string;
    setting: string;
    theme: string;
    mood: string;
    tone: string;
  };
  totalWords: number;
  childWords: number;
  status: 'active' | 'completed' | 'paused';
  currentTurn?: number;
  overallScore?: number;
  grammarScore?: number;
  creativityScore?: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function MyStoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(
    searchParams?.get('filter') || 'all'
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'score' | 'words'>(
    'newest'
  );

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'child') {
      router.push('/login/child');
      return;
    }

    fetchStories();
  }, [session, status, router]);

  const fetchStories = async () => {
    try {
      const response = await fetch('/api/user/stories');
      const data = await response.json();

      if (data.success) {
        setStories(data.stories);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // FIXED: Handle both continuing and viewing stories
const handleStoryAction = (story: Story) => {
  if (story.status === 'completed') {
    // Use MongoDB _id for completed stories
    router.push(`/children-dashboard/my-stories/${story._id}`);
  } else {
    // FIXED: Use MongoDB _id consistently for active/paused stories
    router.push(`/children-dashboard/story/${story._id}`);
  }
};

  const filteredStories = stories.filter((story) => {
    if (
      searchQuery &&
      !story.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !story.elements.genre.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    if (activeFilter === 'completed' && story.status !== 'completed')
      return false;
    if (activeFilter === 'active' && story.status !== 'active') return false;
    if (activeFilter === 'paused' && story.status !== 'paused') return false;

    return true;
  });

  const sortedStories = [...filteredStories].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      case 'oldest':
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case 'score':
        return (b.overallScore || 0) - (a.overallScore || 0);
      case 'words':
        return (b.childWords || 0) - (a.childWords || 0);
      default:
        return 0;
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'active':
        return <PlayCircle className="w-4 h-4 text-blue-400" />;
      case 'paused':
        return <PauseCircle className="w-4 h-4 text-yellow-400" />;
      default:
        return <PlayCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'active':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'paused':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getActionText = (status: string) => {
    switch (status) {
      case 'active':
        return { text: 'Continue', icon: Edit };
      case 'completed':
        return { text: 'View', icon: Eye };
      case 'paused':
        return { text: 'Resume', icon: PlayCircle };
      default:
        return { text: 'Open', icon: Eye };
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading your stories...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'child') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-600/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mt-16"
          >
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold flex items-center">
                <BookOpen className="w-8 h-8 mr-4 text-blue-400" />
                My Amazing Stories
              </h1>
              <p className="text-gray-300 mt-2 text-lg">
                {stories.length === 0
                  ? 'Ready to write your first story?'
                  : `You've written ${stories.length} amazing ${stories.length === 1 ? 'story' : 'stories'}!`}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/create-stories')}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>New Story</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search your stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          {/* Filters and View Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'all', label: 'All Stories', count: stories.length },
                {
                  key: 'completed',
                  label: 'Completed',
                  count: stories.filter((s) => s.status === 'completed').length,
                },
                {
                  key: 'active',
                  label: 'In Progress',
                  count: stories.filter((s) => s.status === 'active').length,
                },
                {
                  key: 'paused',
                  label: 'Paused',
                  count: stories.filter((s) => s.status === 'paused').length,
                },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key as any)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    activeFilter === filter.key
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  {filter.label}
                  {filter.count > 0 && (
                    <span
                      className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                        activeFilter === filter.key
                          ? 'bg-white/20'
                          : 'bg-gray-600/50'
                      }`}
                    >
                      {filter.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Sort and View Controls */}
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="score">Highest Score</option>
                <option value="words">Most Words</option>
              </select>

              <div className="flex bg-gray-800/50 border border-gray-600/50 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stories Grid/List */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your stories...</p>
          </div>
        ) : sortedStories.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-20 h-20 text-gray-600 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-white mb-4">
              {searchQuery
                ? 'No stories found'
                : activeFilter === 'all'
                  ? 'No stories yet'
                  : `No ${activeFilter} stories`}
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              {searchQuery
                ? 'Try adjusting your search or filters'
                : activeFilter === 'all'
                  ? "You haven't written any stories yet. Ready to create your first magical adventure?"
                  : `You don't have any ${activeFilter} stories yet.`}
            </p>
            {activeFilter === 'all' && !searchQuery && (
              <button
                onClick={() => router.push('/create-stories')}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-8 py-4 rounded-xl font-semibold text-lg flex items-center space-x-3 mx-auto shadow-xl"
              >
                <Plus className="w-6 h-6" />
                <span>Write Your First Story</span>
              </button>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-6'
            }
          >
            {sortedStories.map((story, index) => {
              const actionInfo = getActionText(story.status);
              const ActionIcon = actionInfo.icon;
              
              return (
                <motion.div
                  key={story._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`group cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-gray-800/50 border border-gray-600/50 rounded-2xl p-6 hover:bg-gray-800/70 transition-all hover:border-blue-500/50'
                      : 'bg-gray-800/50 border border-gray-600/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all'
                  }`}
                  onClick={() => handleStoryAction(story)} 
                >
                  {/* Story Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors line-clamp-2">
                        {story.title}
                        <span className="text-xs text-gray-400 ml-2">
                          Story #{story.storyNumber ?? story._id.slice(-6)}
                        </span>
                      </h3>
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(story.status)}`}
                      >
                        {getStatusIcon(story.status)}
                        <span className="ml-2 capitalize">
                          {story.status === 'active'
                            ? 'In Progress'
                            : story.status}
                        </span>
                      </div>
                    </div>

                    {story.overallScore && (
                      <div className="flex items-center ml-4">
                        <Star className="w-4 h-4 mr-1 text-yellow-400" />
                        <span className="text-yellow-400 font-semibold">
                          {story.overallScore}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Story Elements */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {Object.entries(story.elements)
                      .slice(0, 3)
                      .map(([type, value]) => (
                        <span
                          key={type}
                          className="px-2 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg text-xs text-purple-200"
                        >
                          {value}
                        </span>
                      ))}
                    {Object.keys(story.elements).length > 3 && (
                      <span className="px-2 py-1 bg-gray-700/50 border border-gray-600/30 rounded-lg text-xs text-gray-400">
                        +{Object.keys(story.elements).length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        <span>{story.childWords || story.totalWords} words</span>
                      </div>
                      {story.currentTurn && story.status !== 'completed' && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>Turn {story.currentTurn}/6</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress bar for active stories */}
                  {story.status === 'active' && story.currentTurn && (
                    <div className="mb-4">
                      <div className="w-full bg-gray-700/50 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${((story.currentTurn - 1) / 6) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {Math.round(((story.currentTurn - 1) / 6) * 100)}%
                        complete
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {story.status === 'completed' && story.publishedAt
                        ? `Published ${new Date(story.publishedAt).toLocaleDateString()}`
                        : `Updated ${new Date(story.updatedAt).toLocaleDateString()}`}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium flex items-center ${
                        story.status === 'active' ? 'text-blue-400' :
                        story.status === 'completed' ? 'text-green-400' :
                        'text-yellow-400'
                      }`}>
                        <ActionIcon className="w-4 h-4 mr-1" />
                        {actionInfo.text}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Story Statistics Summary */}
        {stories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl p-6"
          >
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
              Your Writing Journey
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {stories.length}
                </div>
                <div className="text-purple-300 text-sm">Total Stories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {stories.reduce(
                    (sum, story) =>
                      sum + (story.childWords || story.totalWords),
                    0
                  )}
                </div>
                <div className="text-purple-300 text-sm">Words Written</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {stories.filter((s) => s.status === 'completed').length}
                </div>
                <div className="text-purple-300 text-sm">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {stories.filter((s) => s.overallScore).length > 0
                    ? Math.round(
                        stories
                          .filter((s) => s.overallScore)
                          .reduce((sum, s) => sum + (s.overallScore || 0), 0) /
                          stories.filter((s) => s.overallScore).length
                      )
                    : 0}
                  %
                </div>
                <div className="text-purple-300 text-sm">Avg Score</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}