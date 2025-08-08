'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Suspense } from 'react';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Story {
  _id: string;
  storyNumber: number;
  title: string;
  elements?: {
    genre?: string;
    character?: string;
    setting?: string;
    theme?: string;
    mood?: string;
    tone?: string;
  };
  storyMode?: 'guided' | 'freeform';
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

function MyStoriesContent() {
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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const storiesPerPage = 8; // 4 cards in each row for both layouts

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

  const handleStoryAction = (story: Story) => {
    console.log('🎯 Story action clicked:', story._id, story.status);

    if (story.status === 'completed') {
      router.push(`/children-dashboard/my-stories/${story._id}`);
    } else {
      router.push(`/children-dashboard/story/${story._id}`);
    }
  };

  const filteredStories = stories.filter((story) => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const titleMatch = story.title.toLowerCase().includes(searchLower);
      const genreMatch =
        story.elements?.genre?.toLowerCase().includes(searchLower) || false;

      if (!titleMatch && !genreMatch) {
        return false;
      }
    }

    // Status filter
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

  // Pagination logic
  const totalPages = Math.ceil(sortedStories.length / storiesPerPage);
  const startIndex = (currentPage - 1) * storiesPerPage;
  const endIndex = startIndex + storiesPerPage;
  const currentStories = sortedStories.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery, sortBy]);

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

  const getMaxTurns = (story: Story) => {
    return story.storyMode === 'guided' ? 6 : 7;
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
      {/* Professional Header */}
      <div className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-600/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mt-16"
          >
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl  flex items-center mb-2 ">
                <BookOpen className="w-8 h-8 mr-4 text-blue-400" />
                My Amazing Stories
              </h1>
              <p className="text-gray-300 text-lg">
                {stories.length === 0
                  ? 'Ready to write your first story?'
                  : `You've written ${stories.length} amazing ${stories.length === 1 ? 'story' : 'stories'}!`}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/create-stories')}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-6 py-3 rounded-xl  flex items-center space-x-2 shadow-lg text-base lg:text-lg"
            >
              <Plus className="w-5 h-5" />
              <span>New Story</span>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Search and Filters */}
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search your stories by title or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Professional Filter Controls */}
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
                  className={`px-4 py-2.5 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 transform ${
                    activeFilter === filter.key
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600/50'
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
                className="px-4 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="score">Highest Score</option>
                <option value="words">Most Words</option>
              </select>

              <div className="flex bg-gray-800/50 border border-gray-600/50 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 transition-all hover:scale-105 active:scale-95 transform ${
                    viewMode === 'grid'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 transition-all hover:scale-105 active:scale-95 transform ${
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

        {/* Stories Display */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your stories...</p>
          </div>
        ) : sortedStories.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-20 h-20 text-gray-600 mx-auto mb-6" />
            <h3 className="text-2xl  text-white mb-4">
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
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-8 py-4 rounded-xl  text-lg flex items-center space-x-3 mx-auto shadow-xl"
              >
                <Plus className="w-6 h-6" />
                <span>Write Your First Story</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Stories Grid/List - Different layouts */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }
            >
              <AnimatePresence>
                {currentStories.map((story, index) => {
                  const actionInfo = getActionText(story.status);
                  const ActionIcon = actionInfo.icon;
                  const maxTurns = getMaxTurns(story);

                  return (
                    <motion.div
                      key={story._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className={`group cursor-pointer transition-all hover:shadow-2xl ${
                        viewMode === 'grid'
                          ? 'bg-gray-800/50 border border-gray-600/50 rounded-2xl p-6 hover:bg-gray-800/70 hover:border-blue-500/50 shadow-xl hover:shadow-blue-500/10'
                          : 'bg-gray-800/50 border border-gray-600/50 rounded-xl p-6 hover:bg-gray-800/70 hover:border-blue-500/50 shadow-lg hover:shadow-blue-500/10 flex items-center space-x-6'
                      }`}
                      onClick={() => handleStoryAction(story)}
                    >
                      {viewMode === 'grid' ? (
                        // Grid View - Vertical Card Layout
                        <>
                          {/* Story Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 mr-3">
                              <h3 className="text-lg  text-white mb-2 group-hover:text-blue-300 transition-colors line-clamp-2 leading-tight">
                                {story.title}
                              </h3>
                              <span className="text-xs text-gray-400">
                                Story #
                                {story.storyNumber ?? story._id.slice(-6)}
                              </span>
                            </div>

                            {story.overallScore && (
                              <div className="flex items-center">
                                <Star className="w-4 h-4 mr-1 text-yellow-400" />
                                <span className="text-yellow-400  text-sm">
                                  {story.overallScore}%
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Status Badge */}
                          <div className="mb-4">
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

                          {/* Story Elements */}
                          <div className="mb-4 space-y-2">
                            {story.elements &&
                              Object.entries(story.elements)
                                .filter(
                                  ([type, value]) =>
                                    value && value.trim() !== ''
                                )
                                .slice(0, 2)
                                .map(([type, value]) => (
                                  <span
                                    key={type}
                                    className="inline-block px-2 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg text-xs text-white capitalize mr-1 mb-1"
                                  >
                                    {type}: {value}
                                  </span>
                                ))}

                            {(!story.elements ||
                              Object.entries(story.elements).every(
                                ([_, value]) => !value || value.trim() === ''
                              )) && (
                              <span className="inline-block px-2 py-1 bg-gray-700/50 border border-gray-600/30 rounded-lg text-xs text-gray-400 italic">
                                ✨ Freeform Story
                              </span>
                            )}
                          </div>

                          {/* Stats */}
                          <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                            <div className="flex items-center">
                              <BookOpen className="w-4 h-4 mr-1" />
                              <span>
                                {story.childWords || story.totalWords} words
                              </span>
                            </div>
                            {story.currentTurn &&
                              story.status !== 'completed' && (
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  <span>
                                    Turn {story.currentTurn}/{maxTurns}
                                  </span>
                                </div>
                              )}
                          </div>

                          {/* Progress Bar */}
                          {story.status === 'active' && story.currentTurn && (
                            <div className="mb-4">
                              <div className="w-full bg-gray-700/50 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${((story.currentTurn - 1) / maxTurns) * 100}%`,
                                  }}
                                />
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {Math.round(
                                  ((story.currentTurn - 1) / maxTurns) * 100
                                )}
                                % complete
                              </div>
                            </div>
                          )}

                          {/* Action Button */}
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700/50">
                            <div className="text-xs text-gray-500">
                              {story.status === 'completed' && story.publishedAt
                                ? `Published ${new Date(story.publishedAt).toLocaleDateString()}`
                                : `Updated ${new Date(story.updatedAt).toLocaleDateString()}`}
                            </div>
                            <div
                              className={`text-sm font-medium flex items-center hover:scale-105 active:scale-95 transform transition-all ${
                                story.status === 'active'
                                  ? 'text-blue-400 hover:text-blue-300'
                                  : story.status === 'completed'
                                    ? 'text-green-400 hover:text-green-300'
                                    : 'text-yellow-400 hover:text-yellow-300'
                              }`}
                            >
                              <ActionIcon className="w-4 h-4 mr-1" />
                              {actionInfo.text}
                            </div>
                          </div>
                        </>
                      ) : (
                        // List View - Horizontal Card Layout
                        <>
                          {/* Left Section - Main Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="text-xl  text-white mb-1 group-hover:text-blue-300 transition-colors">
                                  {story.title}
                                </h3>
                                <span className="text-sm text-gray-400">
                                  Story #
                                  {story.storyNumber ?? story._id.slice(-6)}
                                </span>
                              </div>

                              {story.overallScore && (
                                <div className="flex items-center ml-4">
                                  <Star className="w-5 h-5 mr-1 text-yellow-400" />
                                  <span className="text-yellow-400  text-lg">
                                    {story.overallScore}%
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Story Elements - Inline */}
                            <div className="flex flex-wrap gap-2 mb-3">
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

                              {story.elements &&
                                Object.entries(story.elements)
                                  .filter(
                                    ([type, value]) =>
                                      value && value.trim() !== ''
                                  )
                                  .slice(0, 3)
                                  .map(([type, value]) => (
                                    <span
                                      key={type}
                                      className="px-2 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg text-xs text-white capitalize"
                                    >
                                      {type}: {value}
                                    </span>
                                  ))}

                              {(!story.elements ||
                                Object.entries(story.elements).every(
                                  ([_, value]) => !value || value.trim() === ''
                                )) && (
                                <span className="px-2 py-1 bg-gray-700/50 border border-gray-600/30 rounded-lg text-xs text-gray-400 italic">
                                  ✨ Freeform Story
                                </span>
                              )}
                            </div>

                            {/* Progress Bar for List View */}
                            {story.status === 'active' && story.currentTurn && (
                              <div className="mb-2">
                                <div className="w-full bg-gray-700/50 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                                    style={{
                                      width: `${((story.currentTurn - 1) / maxTurns) * 100}%`,
                                    }}
                                  />
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {Math.round(
                                    ((story.currentTurn - 1) / maxTurns) * 100
                                  )}
                                  % complete
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Right Section - Stats & Actions */}
                          <div className="flex flex-col items-end justify-between h-full min-w-[200px]">
                            {/* Stats */}
                            <div className="flex flex-col items-end space-y-2 mb-4">
                              <div className="flex items-center text-gray-400">
                                <BookOpen className="w-4 h-4 mr-2" />
                                <span className="font-medium">
                                  {story.childWords || story.totalWords} words
                                </span>
                              </div>
                              {story.currentTurn &&
                                story.status !== 'completed' && (
                                  <div className="flex items-center text-gray-400">
                                    <Clock className="w-4 h-4 mr-2" />
                                    <span>
                                      Turn {story.currentTurn}/{maxTurns}
                                    </span>
                                  </div>
                                )}
                              <div className="text-xs text-gray-500 text-right">
                                {story.status === 'completed' &&
                                story.publishedAt
                                  ? `Published ${new Date(story.publishedAt).toLocaleDateString()}`
                                  : `Updated ${new Date(story.updatedAt).toLocaleDateString()}`}
                              </div>
                            </div>

                            {/* Action Button */}
                            <div
                              className={`px-4 py-2 rounded-lg font-medium flex items-center hover:scale-105 active:scale-95 transform transition-all border ${
                                story.status === 'active'
                                  ? 'text-blue-400 hover:text-blue-300 border-blue-500/30 hover:border-blue-500/50 bg-blue-500/10'
                                  : story.status === 'completed'
                                    ? 'text-green-400 hover:text-green-300 border-green-500/30 hover:border-green-500/50 bg-green-500/10'
                                    : 'text-yellow-400 hover:text-yellow-300 border-yellow-500/30 hover:border-yellow-500/50 bg-yellow-500/10'
                              }`}
                            >
                              <ActionIcon className="w-4 h-4 mr-2" />
                              {actionInfo.text}
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {/* Professional Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-12 space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-gray-800/50 border border-gray-600/50 text-gray-400 hover:text-white hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        currentPage === page
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'bg-gray-800/50 border border-gray-600/50 text-gray-400 hover:text-white hover:border-blue-500/50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-gray-800/50 border border-gray-600/50 text-gray-400 hover:text-white hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Show pagination info */}
            <div className="text-center mt-6 text-gray-400">
              Showing {startIndex + 1}-
              {Math.min(endIndex, sortedStories.length)} of{' '}
              {sortedStories.length} stories
            </div>
          </>
        )}

        {/* Enhanced Statistics Summary */}
        {stories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-2xl p-6"
          >
            <h3 className="text-white  mb-6 flex items-center text-xl">
              <TrendingUp className="w-6 h-6 mr-3 text-purple-400" />
              Your Writing Journey
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-3xl  text-white mb-1">
                  {stories.length}
                </div>
                <div className="text-purple-300">Total Stories</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-3xl  text-white mb-1">
                  {stories
                    .reduce(
                      (sum, story) =>
                        sum + (story.childWords || story.totalWords),
                      0
                    )
                    .toLocaleString()}
                </div>
                <div className="text-purple-300">Words Written</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-3xl  text-white mb-1">
                  {stories.filter((s) => s.status === 'completed').length}
                </div>
                <div className="text-purple-300">Completed</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-3xl  text-white mb-1">
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
                <div className="text-purple-300">Avg Score</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function MyStoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <MyStoriesContent />
    </Suspense>
  );
}
