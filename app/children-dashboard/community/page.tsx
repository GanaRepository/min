// app/children-dashboard/community/page.tsx - COMMUNITY SHOWCASE
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Heart,
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
  ThumbsUp,
  Share2,
  Bookmark,
  Crown,
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
  isLikedByUser: boolean;
  isBookmarkedByUser: boolean;
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
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showFeatured, setShowFeatured] = useState(false);
  const [showWinners, setShowWinners] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchCommunityData();
  }, [searchTerm, selectedGenre, selectedAgeGroup, sortBy, showFeatured, showWinners]);

  const fetchCommunityData = async (page = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
        genre: selectedGenre,
        ageGroup: selectedAgeGroup,
        sort: sortBy,
        featured: showFeatured.toString(),
        winners: showWinners.toString(),
      });

      const [storiesRes, statsRes] = await Promise.all([
        fetch(`/api/community/stories?${params}`),
        page === 1 ? fetch('/api/community/stats') : Promise.resolve(null),
      ]);

      if (storiesRes.ok) {
        const storiesData = await storiesRes.json();
        if (append) {
          setStories(prev => [...prev, ...storiesData.stories]);
        } else {
          setStories(storiesData.stories || []);
        }
        setHasMore(storiesData.hasMore);
        setCurrentPage(page);
      }

      if (statsRes?.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

    } catch (error) {
      console.error('Error fetching community data:', error);
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

  const toggleLike = async (storyId: string) => {
    try {
      const response = await fetch(`/api/community/stories/${storyId}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setStories(prev => prev.map(story => 
          story._id === storyId 
            ? { 
                ...story, 
                isLikedByUser: data.isLiked,
                stats: { 
                  ...story.stats, 
                  likes: data.isLiked ? story.stats.likes + 1 : story.stats.likes - 1 
                }
              }
            : story
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const toggleBookmark = async (storyId: string) => {
    try {
      const response = await fetch(`/api/community/stories/${storyId}/bookmark`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setStories(prev => prev.map(story => 
          story._id === storyId 
            ? { 
                ...story, 
                isBookmarkedByUser: data.isBookmarked,
                stats: { 
                  ...story.stats, 
                  bookmarks: data.isBookmarked ? story.stats.bookmarks + 1 : story.stats.bookmarks - 1 
                }
              }
            : story
        ));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const getStoryTypeInfo = (type: string) => {
    switch (type) {
      case 'freestyle':
        return { 
          label: 'FREESTYLE', 
          icon: Sparkles, 
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
        };
      case 'uploaded':
        return { 
          label: 'UPLOADED', 
          icon: Upload, 
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
        };
      case 'competition':
        return { 
          label: 'COMPETITION', 
          icon: Trophy, 
          color: 'text-purple-400',
          bgColor: 'bg-purple-500/20',
        };
      default:
        return { 
          label: 'STORY', 
          icon: BookOpen, 
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
        };
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedGenre('all');
    setSelectedAgeGroup('all');
    setSortBy('newest');
    setShowFeatured(false);
    setShowWinners(false);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading community stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-6 border border-purple-500/20">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            📚 Community Stories
          </h1>
          <p className="text-gray-300 text-lg mb-4">
            Discover amazing stories from young writers around the world
          </p>
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{stats.totalPublishedStories.toLocaleString()}</div>
                <div className="text-gray-400 text-sm">Published Stories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.totalAuthors.toLocaleString()}</div>
                <div className="text-gray-400 text-sm">Young Authors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{stats.totalViews.toLocaleString()}</div>
                <div className="text-gray-400 text-sm">Total Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{stats.totalLikes.toLocaleString()}</div>
                <div className="text-gray-400 text-sm">Total Likes</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search stories or authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              />
            </div>
          </div>

          {/* Genre Filter */}
          <div>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Genres</option>
              <option value="fantasy">Fantasy</option>
              <option value="adventure">Adventure</option>
              <option value="mystery">Mystery</option>
              <option value="sci-fi">Science Fiction</option>
              <option value="realistic">Realistic Fiction</option>
              <option value="humor">Humor</option>
            </select>
          </div>

          {/* Age Group Filter */}
          <div>
            <select
              value={selectedAgeGroup}
              onChange={(e) => setSelectedAgeGroup(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Ages</option>
              <option value="6-8">Ages 6-8</option>
              <option value="9-12">Ages 9-12</option>
              <option value="13+">Ages 13+</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="most_liked">Most Liked</option>
              <option value="most_viewed">Most Viewed</option>
              <option value="highest_rated">Highest Rated</option>
            </select>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-xs text-gray-300">
              <input
                type="checkbox"
                checked={showFeatured}
                onChange={(e) => setShowFeatured(e.target.checked)}
                className="rounded border-gray-600 bg-gray-700"
              />
              Featured
            </label>
            <label className="flex items-center gap-1 text-xs text-gray-300">
              <input
                type="checkbox"
                checked={showWinners}
                onChange={(e) => setShowWinners(e.target.checked)}
                className="rounded border-gray-600 bg-gray-700"
              />
              Winners
            </label>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchTerm || selectedGenre !== 'all' || selectedAgeGroup !== 'all' || showFeatured || showWinners) && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-400">Active filters:</span>
            {searchTerm && (
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                Search: "{searchTerm}"
              </span>
            )}
            {selectedGenre !== 'all' && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                Genre: {selectedGenre}
              </span>
            )}
            {selectedAgeGroup !== 'all' && (
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                Age: {selectedAgeGroup}
              </span>
            )}
            {showFeatured && (
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                Featured
              </span>
            )}
            {showWinners && (
              <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">
                Winners
              </span>
            )}
            <button
              onClick={resetFilters}
              className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {stories.map((story, index) => {
            const typeInfo = getStoryTypeInfo(story.storyType);
            const TypeIcon = typeInfo.icon;

            return (
              <motion.div
                key={story._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-750 transition-colors group"
              >
                {/* Story Header */}
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <Link href={`/children-dashboard/community/${story._id}`}>
                        <h3 className="text-white font-medium hover:text-blue-400 transition-colors cursor-pointer line-clamp-2">
                          {story.title}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${typeInfo.bgColor} ${typeInfo.color}`}>
                          <TypeIcon className="w-3 h-3" />
                          {typeInfo.label}
                        </div>
                        {story.isFeatured && (
                          <div className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400">
                            <Star className="w-3 h-3" />
                            FEATURED
                          </div>
                        )}
                        {story.competitionWinner && (
                          <div className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-orange-500/20 text-orange-400">
                            <Crown className="w-3 h-3" />
                            {story.competitionWinner.position === 1 ? '🥇' : 
                             story.competitionWinner.position === 2 ? '🥈' : '🥉'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Author Info */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {story.author.firstName[0]}{story.author.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">
                        {story.author.firstName} {story.author.lastName}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {story.author.ageGroup} • {story.genre}
                      </div>
                    </div>
                  </div>

                  {/* Story Excerpt */}
                  <p className="text-gray-300 text-sm line-clamp-3 mb-4">
                    {story.excerpt}
                  </p>

                  {/* Story Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-lg font-bold text-white">
                        {story.assessment.overallScore.toFixed(1)}/10
                      </div>
                      <div className="text-gray-400 text-xs">Overall Score</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-400">
                        {story.wordCount.toLocaleString()}
                      </div>
                      <div className="text-gray-400 text-xs">Words</div>
                    </div>
                  </div>

                  {/* Assessment Breakdown */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center">
                      <div className="text-sm font-bold text-green-400">
                        {story.assessment.creativity.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-400">Creativity</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-blue-400">
                        {story.assessment.grammar.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-400">Grammar</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-purple-400">
                        {story.assessment.vocabulary.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-400">Vocabulary</div>
                    </div>
                  </div>
                </div>

                {/* Story Actions */}
                <div className="p-4">
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

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleLike(story._id)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                          story.isLikedByUser
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-gray-700 text-gray-400 hover:bg-red-500/20 hover:text-red-400'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${story.isLikedByUser ? 'fill-current' : ''}`} />
                        {story.stats.likes}
                      </button>

                      <button
                        onClick={() => toggleBookmark(story._id)}
                        className={`p-1 rounded-lg transition-colors ${
                          story.isBookmarkedByUser
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-gray-700 text-gray-400 hover:bg-yellow-500/20 hover:text-yellow-400'
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${story.isBookmarkedByUser ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <Link href={`/children-dashboard/community/${story._id}`}>
                      <button className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                        Read Story
                      </button>
                    </Link>
                  </div>

                  {/* Tags */}
                  {story.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-3 flex-wrap">
                      {story.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                      {story.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{story.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={loadMoreStories}
            disabled={loadingMore}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            {loadingMore ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Loading...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" />
                Load More Stories
              </>
            )}
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && stories.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Stories Found</h3>
          <p className="text-gray-400 mb-4">
            {searchTerm || selectedGenre !== 'all' || selectedAgeGroup !== 'all'
              ? 'Try adjusting your filters to find more stories.'
              : 'Be the first to publish a story to the community!'}
          </p>
          {searchTerm || selectedGenre !== 'all' || selectedAgeGroup !== 'all' ? (
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          ) : (
            <Link href="/children-dashboard/my-stories">
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                Publish Your Story
              </button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}