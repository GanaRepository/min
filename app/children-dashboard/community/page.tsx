// app/children-dashboard/community/page.tsx - FIXED COMMUNITY PAGE
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  MessageCircle,
  Trophy,
  Star,
  Search,
  Filter,
  Calendar,
  User,
  Eye,
  Award,
  Sparkles,
  Upload,
  TrendingUp,
  Clock,
  Share2,
  Crown,
  ChevronDown,
  Grid3X3,
  List,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PublishedStory {
  _id: string;
  title: string;
  excerpt: string;
  wordCount: number;
  storyType: 'freestyle' | 'uploaded' | 'competition';
  publishedAt: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    ageGroup: string;
  };
  assessment: {
    overallScore: number;
    creativity: number;
    grammar: number;
    vocabulary: number;
  };
  stats: {
    views: number;
    likes: number;
    comments: number;
    bookmarks: number;
  };
  tags: string[];
  genre: string;
  isFeatured: boolean;
  competitionWinner?: {
    position: number;
    competitionName: string;
    month: string;
  };
  // ...existing code...
}

interface CommunityStats {
  totalPublishedStories: number;
  totalAuthors: number;
  totalViews: number;
  totalLikes: number;
  featuredStories: number;
  competitionWinners: number;
}

export default function CommunityPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [stories, setStories] = useState<PublishedStory[]>([]);
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const genres = [
    'Adventure',
    'Fantasy',
    'Mystery',
    'Sci-Fi',
    'Comedy',
    'Drama',
    'Horror',
  ];
  const ageGroups = ['6-8', '9-11', '12-14', '15-17'];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'most_liked', label: 'Most Liked' },
    { value: 'most_viewed', label: 'Most Viewed' },
    { value: 'highest_rated', label: 'Highest Rated' },
  ];

  useEffect(() => {
    fetchCommunityData(1, false);
  }, [searchTerm, selectedGenre, selectedAgeGroup, sortBy]);

  const fetchCommunityData = async (page: number, append: boolean) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sort: sortBy,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedGenre && { genre: selectedGenre }),
        ...(selectedAgeGroup && { ageGroup: selectedAgeGroup }),
      });

      const [storiesRes, statsRes] = await Promise.all([
        fetch(`/api/community/stories?${params}`),
        page === 1 ? fetch('/api/community/stats') : Promise.resolve(null),
      ]);

      if (storiesRes.ok) {
        const storiesData = await storiesRes.json();
        if (append) {
          setStories((prev) => [...prev, ...storiesData.stories]);
        } else {
          setStories(storiesData.stories || []);
        }
        setHasMore(storiesData.hasMore);
        setCurrentPage(page);
      } else {
        console.error('Failed to fetch stories:', await storiesRes.text());
        setStories([]);
      }

      if (statsRes?.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error('Error fetching community data:', error);
      setStories([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreStories = () => {
    if (!loadingMore && hasMore) {
      fetchCommunityData(currentPage + 1, true);
    }
  };

  // Removed like and bookmark handlers

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedGenre('');
    setSelectedAgeGroup('');
    setSortBy('newest');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600  animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading community stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl  text-white mb-2">Community Showcase</h1>
          <p className="text-gray-400">
            Discover amazing stories from young writers around the world
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2  transition-colors ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-400'
            }`}
          >
            <Grid3X3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2  transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-400'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-gray-800  p-4 text-center">
            <div className="text-2xl  text-blue-400">
              {stats.totalPublishedStories}
            </div>
            <div className="text-sm text-gray-400">Published Stories</div>
          </div>
          <div className="bg-gray-800  p-4 text-center">
            <div className="text-2xl  text-green-400">{stats.totalAuthors}</div>
            <div className="text-sm text-gray-400">Young Authors</div>
          </div>
          <div className="bg-gray-800  p-4 text-center">
            <div className="text-2xl  text-purple-400">
              {stats.totalViews.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Total Views</div>
          </div>
          <div className="bg-gray-800  p-4 text-center">
            <div className="text-2xl  text-red-400">{stats.totalLikes}</div>
            <div className="text-sm text-gray-400">Total Likes</div>
          </div>
          <div className="bg-gray-800  p-4 text-center">
            <div className="text-2xl  text-yellow-400">
              {stats.featuredStories}
            </div>
            <div className="text-sm text-gray-400">Featured Stories</div>
          </div>
          <div className="bg-gray-800  p-4 text-center">
            <div className="text-2xl  text-orange-400">
              {stats.competitionWinners}
            </div>
            <div className="text-sm text-gray-400">Competition Winners</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-800  p-6">
        <div className="flex flex-wrap gap-4 mb-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600  text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Genre Filter */}
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600  text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>

          {/* Age Group Filter */}
          <select
            value={selectedAgeGroup}
            onChange={(e) => setSelectedAgeGroup(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600  text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Ages</option>
            {ageGroups.map((age) => (
              <option key={age} value={age}>
                {age}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600  text-white focus:border-blue-500 focus:outline-none"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          {(searchTerm ||
            selectedGenre ||
            selectedAgeGroup ||
            sortBy !== 'newest') && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white  transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Stories Grid/List */}
      {stories.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl  text-white mb-2">No Stories Found</h3>
          <p className="text-gray-400 mb-4">
            {searchTerm || selectedGenre || selectedAgeGroup
              ? 'Try adjusting your filters to see more stories.'
              : 'Be the first to publish a story to the community!'}
          </p>
          <Link href="/children-dashboard/my-stories">
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white  transition-colors">
              View My Stories
            </button>
          </Link>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          <AnimatePresence>
            {stories.map((story, index) => (
              <motion.div
                key={story._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={
                  viewMode === 'grid'
                    ? 'bg-gray-800  overflow-hidden hover:bg-gray-750 transition-colors'
                    : 'bg-gray-800  p-6 hover:bg-gray-750 transition-colors'
                }
              >
                {viewMode === 'grid' ? (
                  // Grid View
                  <>
                    {/* Badges */}
                    <div className="p-4 pb-0">
                      <div className="flex items-center gap-2 mb-3">
                        {story.isFeatured && (
                          <div className="inline-flex items-center gap-1 px-2 py-1  text-xs  bg-yellow-500/20 text-yellow-400">
                            <Star className="w-3 h-3" />
                            FEATURED
                          </div>
                        )}
                        {story.competitionWinner && (
                          <div className="inline-flex items-center gap-1 px-2 py-1  text-xs  bg-orange-500/20 text-orange-400">
                            <Crown className="w-3 h-3" />
                            {story.competitionWinner.position === 1
                              ? '🥇'
                              : story.competitionWinner.position === 2
                                ? '🥈'
                                : '🥉'}
                          </div>
                        )}
                        <div className="inline-flex items-center gap-1 px-2 py-1  text-xs  bg-blue-500/20 text-blue-400">
                          {story.storyType === 'competition'
                            ? 'Competition'
                            : story.storyType === 'uploaded'
                              ? 'Uploaded'
                              : 'Freestyle'}
                        </div>
                      </div>
                    </div>

                    {/* Story Content */}
                    <div className="p-4">
                      <Link href={`/children-dashboard/community/${story._id}`}>
                        <h3 className="text-lg  text-white mb-2 hover:text-blue-400 transition-colors cursor-pointer line-clamp-2">
                          {story.title}
                        </h3>
                      </Link>

                      <p className="text-gray-400 text-sm mb-3 line-clamp-3">
                        {story.excerpt}
                      </p>

                      {/* Author & Genre */}
                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                        <User className="w-4 h-4" />
                        <span>
                          {story.author.firstName} {story.author.lastName}
                        </span>
                        <span>•</span>
                        <span>{story.genre}</span>
                        <span>•</span>
                        <span>{story.wordCount} words</span>
                      </div>

                      {/* Assessment Scores */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center">
                          <div className="text-lg  text-blue-400">
                            {story.assessment.overallScore}
                          </div>
                          <div className="text-xs text-gray-400">Overall</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg  text-purple-400">
                            {story.assessment.creativity}
                          </div>
                          <div className="text-xs text-gray-400">
                            Creativity
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg  text-green-400">
                            {story.assessment.grammar}
                          </div>
                          <div className="text-xs text-gray-400">Grammar</div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {story.stats.views}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {story.stats.comments}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(story.publishedAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {/* Like and Bookmark buttons removed */}
                        </div>

                        <Link
                          href={`/children-dashboard/community/${story._id}`}
                        >
                          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm  transition-colors">
                            Read Story
                          </button>
                        </Link>
                      </div>
                    </div>
                  </>
                ) : (
                  // List View
                  <div className="flex gap-6">
                    <div className="flex-1">
                      {/* Badges */}
                      <div className="flex items-center gap-2 mb-2">
                        {story.isFeatured && (
                          <div className="inline-flex items-center gap-1 px-2 py-1  text-xs  bg-yellow-500/20 text-yellow-400">
                            <Star className="w-3 h-3" />
                            FEATURED
                          </div>
                        )}
                        {story.competitionWinner && (
                          <div className="inline-flex items-center gap-1 px-2 py-1  text-xs  bg-orange-500/20 text-orange-400">
                            <Crown className="w-3 h-3" />
                            {story.competitionWinner.position === 1
                              ? '🥇'
                              : story.competitionWinner.position === 2
                                ? '🥈'
                                : '🥉'}
                          </div>
                        )}
                        <div className="inline-flex items-center gap-1 px-2 py-1  text-xs  bg-blue-500/20 text-blue-400">
                          {story.storyType === 'competition'
                            ? 'Competition'
                            : story.storyType === 'uploaded'
                              ? 'Uploaded'
                              : 'Freestyle'}
                        </div>
                      </div>

                      <Link href={`/children-dashboard/community/${story._id}`}>
                        <h3 className="text-xl  text-white mb-2 hover:text-blue-400 transition-colors cursor-pointer">
                          {story.title}
                        </h3>
                      </Link>

                      <p className="text-gray-400 mb-3">{story.excerpt}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {story.author.firstName} {story.author.lastName}
                        </div>
                        <span>{story.genre}</span>
                        <span>{story.wordCount} words</span>
                        <span>
                          {new Date(story.publishedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {story.stats.views}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {story.stats.comments}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Like and Bookmark buttons removed */}

                          <Link
                            href={`/children-dashboard/community/${story._id}`}
                          >
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white  transition-colors">
                              Read Story
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="w-32 text-center">
                      <div className="text-lg  text-blue-400">
                        {story.assessment.overallScore}
                      </div>
                      <div className="text-xs text-gray-400 mb-2">
                        Overall Score
                      </div>
                      <div className="grid grid-cols-1 gap-1 text-xs">
                        <div>
                          <span className="text-purple-400">
                            {story.assessment.creativity}
                          </span>
                          <div className="text-gray-500">Creativity</div>
                        </div>
                        <div>
                          <span className="text-green-400">
                            {story.assessment.grammar}
                          </span>
                          <div className="text-gray-500">Grammar</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && stories.length > 0 && (
        <div className="text-center">
          <button
            onClick={loadMoreStories}
            disabled={loadingMore}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white  transition-colors"
          >
            {loadingMore ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white  animate-spin"></div>
                Loading More...
              </div>
            ) : (
              'Load More Stories'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
