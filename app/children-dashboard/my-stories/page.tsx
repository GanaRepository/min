// app/children-dashboard/my-stories/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Plus,
  BookOpen,
  Clock,
  Star,
  Download
} from 'lucide-react';
import Link from 'next/link';
import StoryCard from '@/components/stories/StoryCard';
import StoryFilters from '@/components/stories/StoryFilters';
import EmptyState from '@/components/shared/EmptyStates';

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

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'published' | 'in_progress' | 'drafts';
type SortType = 'newest' | 'oldest' | 'highest_score' | 'most_words';

export default function MyStoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'child') {
      router.push('/login/child');
      return;
    }

    fetchUserStories();
  }, [session, status]);

  useEffect(() => {
    filterAndSortStories();
  }, [stories, searchQuery, activeFilter, sortBy]);

  const fetchUserStories = async () => {
    try {
      const response = await fetch('/api/stories/user-stories');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stories');
      }

      setStories(data.stories || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
      setStories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortStories = () => {
    let filtered = [...stories];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(story =>
        story.title.toLowerCase().includes(query) ||
        story.elements.genre.toLowerCase().includes(query) ||
        story.elements.character.toLowerCase().includes(query) ||
        story.elements.setting.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(story => {
        switch (activeFilter) {
          case 'published':
            return story.status === 'published';
          case 'in_progress':
            return story.status === 'in_progress';
          case 'drafts':
            return story.status === 'draft';
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        case 'highest_score':
          return b.overallScore - a.overallScore;
        case 'most_words':
          return b.totalWords - a.totalWords;
        case 'newest':
        default:
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
    });

    setFilteredStories(filtered);
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
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              📚 My Stories ({stories.length} stories)
            </h1>
            <p className="text-gray-400">
              All your amazing adventures in one place
            </p>
          </div>
          
          <Link href="/create-stories">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-6 rounded-xl font-medium transition-all mt-4 sm:mt-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Story</span>
            </motion.button>
          </Link>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search your stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/60 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Filters */}
          <StoryFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 bg-gray-800/60 border border-gray-600 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stories Content */}
      {filteredStories.length === 0 ? (
        <EmptyState
          title={searchQuery || activeFilter !== 'all' ? 'No stories found' : 'No stories yet'}
          description={
            searchQuery || activeFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Start creating your first amazing story!'
          }
          actionText="Create Your First Story"
          actionHref="/create-stories"
          icon={BookOpen}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {filteredStories.map((story, index) => (
            <motion.div
              key={story._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <StoryCard
                story={story}
                viewMode={viewMode}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}