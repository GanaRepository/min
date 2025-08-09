'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Search,
  Filter,
  Grid,
  List,
  Plus,
  Eye,
  Star,
  Trophy,
  Shield,
  AlertTriangle,
  CheckCircle,
  Zap,
  Clock,
  Target,
  Upload,
  ArrowLeft,
  ChevronDown,
  Brain,
} from 'lucide-react';
import Link from 'next/link';

interface Story {
  _id: string;
  title: string;
  storyNumber: number;
  status: 'active' | 'completed' | 'paused' | 'flagged';
  currentTurn: number;
  totalWords: number;
  childWords: number;
  assessmentAttempts: number;
  isPublished: boolean;
  competitionEligible: boolean;
  isUploadedForAssessment?: boolean;
  createdAt: string;
  updatedAt: string;
  elements?: {
    genre?: string;
    character?: string;
    setting?: string;
    theme?: string;
    mood?: string;
    tone?: string;
  };
  assessment?: {
    overallScore: number;
    grammarScore: number;
    creativityScore: number;
    integrityAnalysis?: {
      originalityScore: number;
      plagiarismScore: number;
      aiDetectionScore: number;
      integrityRisk: 'low' | 'medium' | 'high' | 'critical';
    };
    assessmentDate: string;
  };
  competitionEntries?: Array<{
    competitionId: string;
    submittedAt: string;
    rank?: number;
    score?: number;
  }>;
}

export default function MyStoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'active' | 'completed' | 'uploaded' | 'published'
  >('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'score' | 'words'>(
    'newest'
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const storiesPerPage = 12;

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login/child');
      return;
    }
    fetchStories();
  }, [session, status]);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/stories?limit=100');

      if (response.ok) {
        const data = await response.json();
        setStories(data.stories || []);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStoryClick = (story: Story) => {
    if (story.isUploadedForAssessment || story.status === 'completed') {
      router.push(`/children-dashboard/my-stories/${story._id}`);
    } else {
      router.push(`/children-dashboard/story/${story._id}`);
    }
  };

  const getIntegrityIcon = (integrityRisk?: string) => {
    switch (integrityRisk) {
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'high':
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const filteredStories = stories.filter((story) => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const titleMatch = story.title.toLowerCase().includes(searchLower);
      const genreMatch =
        story.elements?.genre?.toLowerCase().includes(searchLower) || false;
      if (!titleMatch && !genreMatch) return false;
    }

    // Status filter
    switch (activeFilter) {
      case 'active':
        return story.status === 'active';
      case 'completed':
        return story.status === 'completed' && !story.isUploadedForAssessment;
      case 'uploaded':
        return story.isUploadedForAssessment;
      case 'published':
        return story.isPublished;
      default:
        return true;
    }
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
        return (
          (b.assessment?.overallScore || 0) - (a.assessment?.overallScore || 0)
        );
      case 'words':
        return (b.childWords || 0) - (a.childWords || 0);
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedStories.length / storiesPerPage);
  const startIndex = (currentPage - 1) * storiesPerPage;
  const paginatedStories = sortedStories.slice(
    startIndex,
    startIndex + storiesPerPage
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your stories...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push('/children-dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <BookOpen size={36} />
                My Stories
              </h1>
              <p className="text-gray-300">
                {stories.length} {stories.length === 1 ? 'story' : 'stories'} in
                your collection
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href="/create-stories"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Plus size={20} />
                Create New Story
              </Link>
              <Link
                href="/children-dashboard/upload-assessment"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Upload size={20} />
                Upload Assessment
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search stories by title or genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'all', label: 'All', icon: BookOpen },
                { key: 'active', label: 'Active', icon: Zap },
                { key: 'completed', label: 'Completed', icon: CheckCircle },
                { key: 'uploaded', label: 'Uploaded', icon: Upload },
                { key: 'published', label: 'Published', icon: Star },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    activeFilter === filter.key
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <filter.icon size={16} />
                  {filter.label}
                </button>
              ))}
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Filter size={20} />
              </button>

              <div className="flex border border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-gray-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${
                    viewMode === 'list'
                      ? 'bg-gray-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-600"
            >
              <div className="flex gap-4 items-center">
                <label className="text-gray-300 font-medium">Sort by:</label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none pr-8"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="score">Highest Score</option>
                    <option value="words">Most Words</option>
                  </select>
                  <ChevronDown
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={16}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Stories Grid/List */}
        {paginatedStories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center"
          >
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-white font-bold text-xl mb-2">
              {searchQuery || activeFilter !== 'all'
                ? 'No Stories Found'
                : 'No Stories Yet'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || activeFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start your writing journey by creating your first story!'}
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/create-stories"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus size={20} />
                Create Story
              </Link>
              <Link
                href="/children-dashboard/upload-assessment"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Upload size={20} />
                Upload for Assessment
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
              >
                {paginatedStories.map((story, index) => (
                  <motion.div
                    key={story._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="bg-gray-800/60 border border-gray-600/40 rounded-xl p-6 hover:border-gray-500/40 transition-all cursor-pointer group"
                    onClick={() => handleStoryClick(story)}
                  >
                    {/* Story Header */}
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-white font-bold text-lg group-hover:text-green-400 transition-colors line-clamp-2">
                          {story.title}
                        </h3>
                        <div className="flex items-center gap-1 ml-2">
                          {story.isUploadedForAssessment && (
                            <Upload className="w-4 h-4 text-blue-400" />
                          )}
                          {story.isPublished && (
                            <Star className="w-4 h-4 text-yellow-400" />
                          )}
                          {story.competitionEntries &&
                            story.competitionEntries.length > 0 && (
                              <Trophy className="w-4 h-4 text-purple-400" />
                            )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                            story.status === 'completed'
                              ? 'bg-green-600/20 text-green-300'
                              : story.status === 'active'
                                ? 'bg-blue-600/20 text-blue-300'
                                : story.status === 'flagged'
                                  ? 'bg-red-600/20 text-red-300'
                                  : 'bg-gray-600/20 text-gray-300'
                          }`}
                        >
                          {story.status}
                        </span>

                        {story.assessment?.integrityAnalysis && (
                          <div className="flex items-center gap-1">
                            {getIntegrityIcon(
                              story.assessment.integrityAnalysis.integrityRisk
                            )}
                            <span className="text-xs text-gray-400">
                              {
                                story.assessment.integrityAnalysis
                                  .originalityScore
                              }
                              %
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Story Elements Tags */}
                      {story.elements && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {Object.entries(story.elements)
                            .filter(
                              ([_, value]) => value && value.trim() !== ''
                            )
                            .slice(0, 2)
                            .map(([type, value]) => (
                              <span
                                key={type}
                                className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs capitalize"
                              >
                                {value}
                              </span>
                            ))}
                          {!story.elements ||
                          Object.values(story.elements).every(
                            (v) => !v || v.trim() === ''
                          ) ? (
                            <span className="px-2 py-1 bg-gray-600/20 text-gray-400 rounded text-xs">
                              ✨ Freeform Story
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>

                    {/* Story Stats */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Words:</span>
                        <span className="text-white font-medium">
                          {story.childWords || story.totalWords}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Created:</span>
                        <span className="text-white">
                          {new Date(story.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {story.assessment && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Score:</span>
                          <span
                            className={`font-bold ${getScoreColor(story.assessment.overallScore)}`}
                          >
                            {story.assessment.overallScore}%
                          </span>
                        </div>
                      )}

                      {story.competitionEntries &&
                        story.competitionEntries.length > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Competitions:</span>
                            <span className="text-purple-400 font-medium">
                              {story.competitionEntries.length}
                            </span>
                          </div>
                        )}
                    </div>

                    {/* Integrity Warning */}
                    {story.assessment?.integrityAnalysis?.integrityRisk &&
                      ['high', 'critical'].includes(
                        story.assessment.integrityAnalysis.integrityRisk
                      ) && (
                        <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-2 mb-4">
                          <div className="flex items-center gap-2 text-red-300 text-xs">
                            <AlertTriangle size={14} />
                            <span>Integrity Review Required</span>
                          </div>
                        </div>
                      )}

                    {/* Action Button */}
                    <div className="flex gap-2">
                      <button
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                          story.status === 'active'
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-600 hover:bg-gray-700 text-white'
                        }`}
                      >
                        {story.status === 'active' ? (
                          <>
                            <Zap size={14} />
                            Continue
                          </>
                        ) : (
                          <>
                            <Eye size={14} />
                            View
                          </>
                        )}
                      </button>

                      {!story.isPublished &&
                        story.status === 'completed' &&
                        story.assessment && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(
                                `/children-dashboard/story/${story._id}?action=publish`
                              );
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1 transition-colors"
                          >
                            <Star size={14} />
                            Publish
                          </button>
                        )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              /* List View */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4 mb-8"
              >
                {paginatedStories.map((story, index) => (
                  <motion.div
                    key={story._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="bg-gray-800/60 border border-gray-600/40 rounded-xl p-6 hover:border-gray-500/40 transition-all cursor-pointer group"
                    onClick={() => handleStoryClick(story)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-bold text-xl group-hover:text-green-400 transition-colors">
                            {story.title}
                          </h3>

                          <div className="flex items-center gap-2">
                            {story.isUploadedForAssessment && (
                              <span className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-xs">
                                Assessment Upload
                              </span>
                            )}
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                                story.status === 'completed'
                                  ? 'bg-green-600/20 text-green-300'
                                  : story.status === 'active'
                                    ? 'bg-blue-600/20 text-blue-300'
                                    : story.status === 'flagged'
                                      ? 'bg-red-600/20 text-red-300'
                                      : 'bg-gray-600/20 text-gray-300'
                              }`}
                            >
                              {story.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-400 mb-3">
                          <span>
                            📝 {story.childWords || story.totalWords} words
                          </span>
                          <span>
                            📅 {new Date(story.createdAt).toLocaleDateString()}
                          </span>
                          {story.assessment && (
                            <div className="flex items-center gap-3">
                              <span
                                className={`font-medium ${getScoreColor(story.assessment.overallScore)}`}
                              >
                                ⭐ {story.assessment.overallScore}%
                              </span>
                              {story.assessment.integrityAnalysis && (
                                <div className="flex items-center gap-1">
                                  {getIntegrityIcon(
                                    story.assessment.integrityAnalysis
                                      .integrityRisk
                                  )}
                                  <span className="text-xs">
                                    {
                                      story.assessment.integrityAnalysis
                                        .originalityScore
                                    }
                                    % Original
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Story Elements */}
                        {story.elements && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {Object.entries(story.elements)
                              .filter(
                                ([_, value]) => value && value.trim() !== ''
                              )
                              .slice(0, 4)
                              .map(([type, value]) => (
                                <span
                                  key={type}
                                  className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs capitalize"
                                >
                                  {type}: {value}
                                </span>
                              ))}
                            {!story.elements ||
                            Object.values(story.elements).every(
                              (v) => !v || v.trim() === ''
                            ) ? (
                              <span className="px-2 py-1 bg-gray-600/20 text-gray-400 rounded text-xs">
                                ✨ Freeform Story
                              </span>
                            ) : null}
                          </div>
                        )}

                        {/* Integrity Warning */}
                        {story.assessment?.integrityAnalysis?.integrityRisk &&
                          ['high', 'critical'].includes(
                            story.assessment.integrityAnalysis.integrityRisk
                          ) && (
                            <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-3 mb-3">
                              <div className="flex items-center gap-2 text-red-300 text-sm">
                                <AlertTriangle size={16} />
                                Integrity Review Required -
                                {story.assessment.integrityAnalysis
                                  .plagiarismScore < 80 &&
                                  ' Potential plagiarism detected'}
                                {story.assessment.integrityAnalysis
                                  .aiDetectionScore > 70 &&
                                  ' AI-generated content suspected'}
                              </div>
                            </div>
                          )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 ml-6">
                        <div className="flex items-center gap-1 text-gray-400">
                          {story.isPublished && (
                            <Star className="w-4 h-4 text-yellow-400" />
                          )}
                          {story.competitionEntries &&
                            story.competitionEntries.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Trophy className="w-4 h-4 text-purple-400" />
                                <span className="text-xs">
                                  {story.competitionEntries.length}
                                </span>
                              </div>
                            )}
                        </div>

                        <button
                          className={`py-2 px-4 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                            story.status === 'active'
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-gray-600 hover:bg-gray-700 text-white'
                          }`}
                        >
                          {story.status === 'active' ? (
                            <>
                              <Zap size={16} />
                              Continue
                            </>
                          ) : (
                            <>
                              <Eye size={16} />
                              View
                            </>
                          )}
                        </button>

                        {!story.isPublished &&
                          story.status === 'completed' &&
                          story.assessment && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                  `/children-dashboard/story/${story._id}?action=publish`
                                );
                              }}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                              <Star size={16} />
                              Publish - $10
                            </button>
                          )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center items-center gap-2"
              >
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                >
                  Previous
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                >
                  Next
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
