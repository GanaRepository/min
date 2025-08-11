// app/children-dashboard/my-stories/page.tsx - COMPLETE UPDATED VERSION
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Sparkles,
  Upload,
  Trophy,
  Star,
  ArrowLeft,
  Search,
  Grid3X3,
  List,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Plus,
  Eye,
  DollarSign,
  Award,
  FileText,
  Zap,
} from 'lucide-react';

interface Story {
  _id: string;
  title: string;
  status: 'active' | 'completed';
  createdAt: string;
  totalWords: number;
  childWords: number;
  isPublished: boolean;
  submittedToCompetition: boolean;
  storyNumber: number;
  isUploadedForAssessment: boolean;
  competitionEntries?: Array<{
    competitionId: string;
    submittedAt: string;
    rank?: number;
    score?: number;
  }>;
  assessment?: {
    overallScore: number;
    grammarScore: number;
    creativityScore: number;
    integrityAnalysis?: {
      integrityRisk?: 'low' | 'medium' | 'high' | 'critical';
    };
  };
}

type FilterType = 'all' | 'active' | 'completed' | 'uploaded' | 'published' | 'competition';
type ViewType = 'grid' | 'list';

export default function MyStories() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [error, setError] = useState<string | null>(null);
  const [publishingStory, setPublishingStory] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'child') {
      router.push('/login/child');
      return;
    }
    fetchStories();
  }, [session, status, router]);

  useEffect(() => {
    filterStories();
  }, [stories, searchTerm, activeFilter]);

  const fetchStories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/user/stories');
      if (response.ok) {
        const data = await response.json();
        setStories(data.stories || []);
      } else {
        console.error('Failed to fetch stories:', response.status);
        setError('Failed to load stories');
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
      setError('Failed to load stories');
    } finally {
      setLoading(false);
    }
  };

  const filterStories = () => {
    let filtered = stories;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(story =>
        story.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    switch (activeFilter) {
      case 'active':
        filtered = filtered.filter(story => story.status === 'active');
        break;
      case 'completed':
        filtered = filtered.filter(story => story.status === 'completed');
        break;
      case 'uploaded':
        filtered = filtered.filter(story => story.isUploadedForAssessment);
        break;
      case 'published':
        filtered = filtered.filter(story => story.isPublished);
        break;
      case 'competition':
        filtered = filtered.filter(story => 
          story.competitionEntries && story.competitionEntries.length > 0
        );
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    setFilteredStories(filtered);
  };

  const getStoryTypeLabel = (story: Story) => {
    if (story.competitionEntries && story.competitionEntries.length > 0) {
      return { label: "COMPETITION STORY", icon: Trophy, color: "purple" };
    }
    if (story.isUploadedForAssessment) {
      return { label: "UPLOADED STORY", icon: Upload, color: "blue" };
    }
    return { label: "FREESTYLE STORY", icon: Sparkles, color: "green" };
  };

  const getIntegrityIcon = (integrityRisk?: string) => {
    switch (integrityRisk) {
      case 'low':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const handlePublishStory = async (storyId: string, storyTitle: string) => {
    if (!session?.user?.id) return;
    
    setPublishingStory(storyId);
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productType: 'story_publication',
          storyId: storyId,
          userId: session.user.id
        })
      });

      const data = await response.json();
      
      if (data.success && data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error initiating publication:', error);
      alert('Failed to start publication process. Please try again.');
    } finally {
      setPublishingStory(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const filters = [
    { key: 'all', label: 'All Stories', count: stories.length },
    { key: 'active', label: 'In Progress', count: stories.filter(s => s.status === 'active').length },
    { key: 'completed', label: 'Completed', count: stories.filter(s => s.status === 'completed').length },
    { key: 'uploaded', label: 'Uploaded', count: stories.filter(s => s.isUploadedForAssessment).length },
    { key: 'published', label: 'Published', count: stories.filter(s => s.isPublished).length },
    { key: 'competition', label: 'Competition', count: stories.filter(s => (s.competitionEntries ?? []).length > 0).length },
  ];

  if (loading) {
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

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <BookOpen size={40} className="text-blue-400" />
                My Stories
              </h1>
              <p className="text-gray-300">
                Manage your creative writing collection and track your progress
              </p>
            </div>

            <Link
              href="/create-stories"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all font-medium w-fit"
            >
              <Plus size={20} />
              Create New Story
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{stories.length}</div>
            <div className="text-sm text-blue-300">Total Stories</div>
          </div>
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {stories.filter(s => s.isPublished).length}
            </div>
            <div className="text-sm text-green-300">Published</div>
          </div>
          <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {stories.filter(s => (s.competitionEntries ?? []).length > 0).length}
            </div>
            <div className="text-sm text-purple-300">In Competition</div>
          </div>
          <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">
              {stories.reduce((total, story) => total + (story.totalWords || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-orange-300">Total Words</div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search your stories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key as FilterType)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeFilter === filter.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewType('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewType === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <Grid3X3 size={20} />
            </button>
            <button
              onClick={() => setViewType('list')}
              className={`p-2 rounded-lg transition-all ${
                viewType === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <List size={20} />
            </button>
          </div>
        </motion.div>

        {/* Stories Grid/List */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {filteredStories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-12"
          >
            <BookOpen size={64} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              {searchTerm || activeFilter !== 'all' ? 'No stories match your criteria' : 'No stories yet'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || activeFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Start your creative writing journey by creating your first story!'
              }
            </p>
            {!searchTerm && activeFilter === 'all' && (
              <Link
                href="/create-stories"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl inline-flex items-center gap-2 transition-colors"
              >
                <Plus size={20} />
                Create Your First Story
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={
              viewType === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {filteredStories.map((story, index) => {
              const storyType = getStoryTypeLabel(story);
              const TypeIcon = storyType.icon;

              return (
                <motion.div
                  key={story._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 hover:border-gray-600/50 transition-all ${
                    viewType === 'list' ? 'flex items-center justify-between' : ''
                  }`}
                >
                  <div className={viewType === 'list' ? 'flex-1' : ''}>
                    {/* Story Type Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium
                        ${storyType.color === 'purple' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                          storyType.color === 'blue' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                          'bg-green-500/20 text-green-300 border border-green-500/30'
                        }`}>
                        <TypeIcon size={14} />
                        {storyType.label}
                      </div>
                      
                      {story.assessment?.integrityAnalysis && (
                        <div className="flex items-center gap-1">
                          {getIntegrityIcon(story.assessment.integrityAnalysis.integrityRisk)}
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2">
                      {story.title}
                    </h3>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                      <span>📝 {story.childWords} words</span>
                      <span>📅 {new Date(story.createdAt).toLocaleDateString()}</span>
                      <span className={`capitalize ${
                        story.status === 'completed' ? 'text-green-400' :
                        story.status === 'active' ? 'text-blue-400' : 'text-gray-400'
                      }`}>
                        {story.status}
                      </span>
                    </div>

                    {/* Assessment Score */}
                    {story.assessment && (
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className={`font-medium ${getScoreColor(story.assessment.overallScore)}`}>
                          {story.assessment.overallScore}% Overall
                        </span>
                        <span className="text-gray-400 text-sm">
                          (G: {story.assessment.grammarScore}%, C: {story.assessment.creativityScore}%)
                        </span>
                      </div>
                    )}

                    {/* Status Badges */}
                    <div className="flex items-center gap-2 mb-4">
                      {story.isPublished && (
                        <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs font-medium border border-green-500/30">
                          📚 Published
                        </span>
                      )}
                      {story.competitionEntries && story.competitionEntries.length > 0 && (
                        <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs font-medium border border-purple-500/30">
                          🏆 In Competition
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className={`flex gap-2 ${viewType === 'list' ? 'flex-col' : 'flex-wrap'}`}>
                    <Link
                      href={`/children-dashboard/my-stories/${story._id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      <Eye size={16} />
                      View
                    </Link>

                    {!story.isPublished && story.status === 'completed' && (
                      <button
                        onClick={() => handlePublishStory(story._id, story.title)}
                        disabled={publishingStory === story._id}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                      >
                        {publishingStory === story._id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Publishing...
                          </>
                        ) : (
                          <>
                            <DollarSign size={16} />
                            Publish $10
                          </>
                        )}
                      </button>
                    )}

                    {story.status === 'active' && (
                      <Link
                        href={`/children-dashboard/story/${story._id}`}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                      >
                        <Zap size={16} />
                        Continue
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}