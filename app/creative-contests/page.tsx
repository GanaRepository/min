// app/creative-contests/page.tsx - IMPROVED VERSION
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Trophy,
  Calendar,
  Clock,
  ChevronRight,
  ChevronLeft,
  Filter,
  Search,
  Image,
  Camera,
  Video,
  Sparkles,
  Palette,
  Aperture,
  Film,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Contest {
  _id: string;
  title: string;
  description: string;
  type: 'art' | 'photography' | 'video';
  status: 'active' | 'ended' | 'results_published';
  startDate: string;
  endDate: string;
  resultsDate: string;
  maxSubmissionsPerUser: number;
  showPrizes: boolean;
  prizes?: Array<{
    position: number;
    title: string;
    description?: string;
  }>;
  userStats?: {
    hasSubmitted: boolean;
    submissionCount: number;
    canSubmit: boolean;
  };
  submissions?: Array<{
    _id: string;
    participantName: string;
    submissionTitle: string;
    fileId: string;
    isWinner: boolean;
    position?: number;
  }>;
}

const typeIcons = {
  art: Image,
  photography: Camera,
  video: Video,
};

const typeLabels = {
  art: 'Art & Design',
  photography: 'Photography',
  video: 'Video',
};

export default function CreativeContestsPage() {
  const { data: session } = useSession();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const contestsPerPage = 6;

  const fetchContests = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const response = await fetch(`/api/creative-contests?${params}`);
      const data = await response.json();

      if (data.success) {
        setContests(data.contests || []);
      }
    } catch (error) {
      console.error('Error fetching contests:', error);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter]);

  useEffect(() => {
    fetchContests();
  }, [fetchContests]);

  const getDaysRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getWinners = (contest: Contest) => {
    if (!contest.submissions) return [];
    return contest.submissions
      .filter((sub) => sub.isWinner)
      .sort((a, b) => (a.position || 999) - (b.position || 999))
      .slice(0, 3);
  };

  // Filter and paginate contests
  const filteredContests = contests.filter((contest) => {
    const matchesSearch =
      contest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contest.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredContests.length / contestsPerPage);
  const startIndex = (currentPage - 1) * contestsPerPage;
  const paginatedContests = filteredContests.slice(
    startIndex,
    startIndex + contestsPerPage
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading contests...</div>
      </div>
    );
  }

  // No contests available - show coming soon page
  if (contests.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 mt-20">
            <h1 className="text-4xl font-bold text-white mb-4">
              Creative Contests
            </h1>
            <p className="text-xl text-gray-300">
              Exciting competitions coming soon!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Art Contest Preview */}
            <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-lg p-8 text-center transform hover:scale-105 transition-all">
              <div className="animate-pulse">
                <Palette className="mx-auto text-purple-300 mb-4" size={64} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Art & Design
              </h3>
              <p className="text-gray-200">
                Express your creativity through digital art, illustrations, and
                graphic design
              </p>
            </div>

            {/* Photography Contest Preview */}
            <div className="bg-gradient-to-br from-blue-900 to-cyan-900 rounded-lg p-8 text-center transform hover:scale-105 transition-all">
              <div className="animate-pulse">
                <Aperture className="mx-auto text-blue-300 mb-4" size={64} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Photography
              </h3>
              <p className="text-gray-200">
                Capture stunning moments and share your unique perspective
                through the lens
              </p>
            </div>

            {/* Video Contest Preview */}
            <div className="bg-gradient-to-br from-green-900 to-teal-900 rounded-lg p-8 text-center transform hover:scale-105 transition-all">
              <div className="animate-pulse">
                <Film className="mx-auto text-green-300 mb-4" size={64} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Video</h3>
              <p className="text-gray-200">
                Create compelling stories through motion pictures and animations
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center mb-8">
              <Sparkles
                className="text-yellow-400 animate-pulse mr-3"
                size={32}
              />
              <h2 className="text-3xl font-bold text-white">Coming Soon</h2>
              <Sparkles
                className="text-yellow-400 animate-pulse ml-3"
                size={32}
              />
            </div>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              We&apos;re preparing amazing creative competitions for you. Stay
              tuned for announcements about upcoming contests where you can
              showcase your talents and win exciting prizes!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-20">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 -full blur-3xl"
          animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          style={{ top: '10%', left: '10%' }}
        />
        <motion.div
          className="absolute w-80 h-80 bg-gradient-to-r from-violet-500/10 to-blue-500/10 -full blur-3xl"
          animate={{ x: [0, -80, 0], y: [0, 60, 0], scale: [1, 0.8, 1] }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
          style={{ top: '60%', right: '10%' }}
        />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 mt-20">
          <h1 className="text-4xl font-bold text-white mb-4">
            Creative Contests
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Showcase your creativity in art, photography, and video competitions
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search contests..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="art">Art & Design</option>
              <option value="photography">Photography</option>
              <option value="video">Video</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Contests</option>
              <option value="active">Open</option>
              <option value="ended">Closed</option>
              <option value="results_published">Results Available</option>
            </select>
          </div>
        </div>

        {/* Contests Grid - Responsive with proper spacing */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {paginatedContests.map((contest) => {
            const TypeIcon = typeIcons[contest.type];
            const winners = getWinners(contest);

            return (
              <div
                key={contest._id}
                className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-all border border-gray-700 hover:border-gray-600"
              >
                {/* Contest content remains the same as before */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <TypeIcon className="text-blue-400 mr-2" size={20} />
                      <span className="text-blue-400 text-sm">
                        {typeLabels[contest.type]}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {contest.title}
                    </h3>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs text-white ${
                        contest.status === 'active'
                          ? 'bg-green-500'
                          : contest.status === 'ended'
                            ? 'bg-yellow-500'
                            : 'bg-purple-500'
                      }`}
                    >
                      {contest.status === 'active'
                        ? 'Open for Submissions'
                        : contest.status === 'ended'
                          ? 'Submissions Closed'
                          : 'Results Available'}
                    </span>
                  </div>
                </div>

                <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                  {contest.description}
                </p>

                {contest.status === 'active' && (
                  <div className="flex items-center text-green-400 text-sm mb-3">
                    <Clock size={16} className="mr-2" />
                    <span>
                      {getDaysRemaining(contest.endDate)} days remaining
                    </span>
                  </div>
                )}

                {/* Winners for completed contests */}
                {contest.status === 'results_published' &&
                  winners.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">
                        🏆 Winners:
                      </h4>
                      <div className="space-y-1">
                        {winners.map((winner) => (
                          <div
                            key={winner.position}
                            className="flex items-center text-sm"
                          >
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mr-2 ${
                                winner.position === 1
                                  ? 'bg-yellow-500 text-white'
                                  : winner.position === 2
                                    ? 'bg-gray-400 text-white'
                                    : 'bg-yellow-600 text-white'
                              }`}
                            >
                              {winner.position}
                            </span>
                            <span className="text-gray-300">
                              {winner.participantName}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                <Link
                  href={`/creative-contests/${contest._id}`}
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-lg transition-colors"
                >
                  View Details
                </Link>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex space-x-1">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    currentPage === index + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
