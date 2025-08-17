'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  Users,
  FileText,
  Calendar,
  Crown,
  Medal,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Eye,
  Filter,
  Search,
  Download,
  Plus,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Winner {
  position: number;
  childId: string;
  childName: string;
  title: string;
  score: number;
  aiJudgingNotes?: string;
}

interface Competition {
  _id: string;
  month: string;
  year: number;
  phase: 'submission' | 'judging' | 'results';
  isActive: boolean;
  totalSubmissions: number;
  totalParticipants: number;
  winners?: Winner[];
  submissionStart?: string;
  submissionEnd?: string;
  judgingStart?: string;
  judgingEnd?: string;
  resultsDate?: string;
  createdAt: string;
  updatedAt: string;
  theme?: string;
  judgingCriteria?: any;
}

interface CompetitionStats {
  totalCompetitions: number;
  activeCompetitions: number;
  totalSubmissions: number;
  avgParticipants: number;
}

export default function AdminCompetitionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [currentCompetition, setCurrentCompetition] = useState<Competition | null>(null);
  const [stats, setStats] = useState<CompetitionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [advancingPhase, setAdvancingPhase] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPhase, setFilterPhase] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchData();
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Use existing APIs
      const [currentResponse, pastResponse] = await Promise.all([
        fetch('/api/competitions/current'),
        fetch('/api/competitions/past')
      ]);
      const currentData = await currentResponse.json();
      const pastData = await pastResponse.json();

      // Set current competition
      let currentComp = null;
      if (currentData.success && currentData.competition) {
        currentComp = currentData.competition;
        setCurrentCompetition(currentComp);
      }

      // Combine all competitions for admin view - BUT AVOID DUPLICATES
      const allCompetitions = [];
      // Add current competition first (if exists)
      if (currentComp) {
        allCompetitions.push(currentComp);
      }
      // Add past competitions, but EXCLUDE the current competition to prevent duplicates
      if (pastData.success && pastData.competitions) {
        const filteredPastCompetitions = pastData.competitions.filter((comp: Competition) => {
          // If there's no current competition, include all past competitions
          if (!currentComp) return true;
          // Otherwise, exclude any competition that matches the current competition ID
          return comp._id !== currentComp._id;
        });
        allCompetitions.push(...filteredPastCompetitions);
      }

      console.log(`📊 [ADMIN] Loaded ${allCompetitions.length} competitions total`);
      console.log(`📊 [ADMIN] Current: ${currentComp ? 1 : 0}, Past: ${pastData.competitions?.length || 0}, Filtered: ${allCompetitions.length}`);

      setCompetitions(allCompetitions);

      // Calculate stats from existing data
      const statsData = {
        totalCompetitions: allCompetitions.length,
        activeCompetitions: allCompetitions.filter(c => c.isActive).length,
        totalSubmissions: allCompetitions.reduce((sum, c) => sum + (c.totalSubmissions || 0), 0),
        avgParticipants: allCompetitions.length > 0 
          ? Math.round(allCompetitions.reduce((sum, c) => sum + (c.totalParticipants || 0), 0) / allCompetitions.length)
          : 0,
      };

      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancePhase = async (competitionId: string) => {
    if (!confirm('Are you sure you want to advance this competition to the next phase?')) {
      return;
    }

    try {
      setAdvancingPhase(true);
      
      // Use existing advance-phase API
      const response = await fetch('/api/admin/competitions/advance-phase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitionId })
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchData(); // Refresh data
        alert(data.message);
      } else {
        alert('Failed to advance phase: ' + data.error);
      }
    } catch (error) {
      console.error('Error advancing phase:', error);
      alert('Error advancing phase');
    } finally {
      setAdvancingPhase(false);
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'submission': return 'bg-green-100 text-green-800';
      case 'judging': return 'bg-yellow-100 text-yellow-800';
      case 'results': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'submission': return <FileText className="w-4 h-4" />;
      case 'judging': return <Clock className="w-4 h-4" />;
      case 'results': return <Trophy className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Filter and sort competitions
  const filteredCompetitions = competitions
    .filter(comp => {
      const matchesSearch = comp.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           comp.year.toString().includes(searchTerm);
      const matchesPhase = filterPhase === 'all' || comp.phase === filterPhase;
      return matchesSearch && matchesPhase;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'submissions':
          return (b.totalSubmissions || 0) - (a.totalSubmissions || 0);
        case 'participants':
          return (b.totalParticipants || 0) - (a.totalParticipants || 0);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-700 border-t-green-400  animate-spin mb-4"></div>
          <p className="text-green-300 ">Loading competitions...</p>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gray-900 p-2 sm:p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 w-full"
      >
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 w-full min-w-0">
          <div>
            <h1 className="text-2xl sm:text-4xl  text-white mb-2 break-words">
              🏆 Competition Management
            </h1>
            <p className="text-xs sm:text-gray-400 break-words">
              Manage monthly storytelling competitions and track winners
            </p>
          </div>
          <div className="flex space-x-2 sm:space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-700 text-white  hover:bg-blue-600 transition-colors"
            >
              <Download className="w-4 h-4 mr-2 inline" />
              Export Data
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 w-full"
        >
          <div className="bg-gray-800  p-4 sm:p-6 shadow-lg border border-gray-700 w-full min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Competitions</p>
                <p className="text-3xl  text-white">{stats.totalCompetitions}</p>
              </div>
              <Trophy className="w-12 h-12 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-800  p-4 sm:p-6 shadow-lg border border-gray-700 w-full min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Competitions</p>
                <p className="text-3xl  text-green-400">{stats.activeCompetitions}</p>
              </div>
              <Clock className="w-12 h-12 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800  p-4 sm:p-6 shadow-lg border border-gray-700 w-full min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Submissions</p>
                <p className="text-3xl  text-blue-400">{stats.totalSubmissions}</p>
              </div>
              <FileText className="w-12 h-12 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-800  p-4 sm:p-6 shadow-lg border border-gray-700 w-full min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Participants</p>
                <p className="text-3xl  text-orange-400">{stats.avgParticipants}</p>
              </div>
              <Users className="w-12 h-12 text-orange-400" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Current Competition Highlight */}
      {currentCompetition && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800  p-4 sm:p-6 mb-8 text-white border border-gray-700 w-full min-w-0"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between w-full min-w-0">
            <div>
              <h2 className="text-lg sm:text-2xl  mb-2 break-words">
                Current Competition: {currentCompetition.month} {currentCompetition.year}
              </h2>
              <div className="flex flex-wrap items-center gap-2 sm:space-x-4 text-blue-100 min-w-0">
                <span className="flex items-center break-words">
                  <Users className="w-4 h-4 mr-1" />
                  {currentCompetition.totalParticipants || 0} participants
                </span>
                <span className="flex items-center break-words">
                  <FileText className="w-4 h-4 mr-1" />
                  {currentCompetition.totalSubmissions || 0} submissions
                </span>
                <span className={`px-2 sm:px-3 py-1  text-xs  ${
                  currentCompetition.phase === 'submission' ? 'bg-green-500/20 text-green-100' :
                  currentCompetition.phase === 'judging' ? 'bg-yellow-500/20 text-yellow-100' :
                  'bg-blue-500/20 text-blue-100'
                }`}>
                  {getPhaseIcon(currentCompetition.phase)}
                  <span className="ml-1 capitalize">{currentCompetition.phase}</span>
                </span>
              </div>
            </div>
            {currentCompetition.phase !== 'results' && (
              <button
                onClick={() => handleAdvancePhase(currentCompetition._id)}
                disabled={advancingPhase}
                className="px-6 py-3 bg-white/20 hover:bg-white/30   transition-colors disabled:opacity-50"
              >
                {advancingPhase ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white  animate-spin mr-2"></div>
                    Advancing...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Play className="w-4 h-4 mr-2" />
                    Advance to {currentCompetition.phase === 'submission' ? 'Judging' : 'Results'}
                  </div>
                )}
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Filters and Search */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  className="bg-gray-800  p-4 sm:p-6 shadow-lg border border-gray-700 mb-8 overflow-x-auto w-full min-w-0"
  >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm  text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search competitions..."
                className="w-full pl-10 pr-4 py-2 border border-gray-700 bg-gray-900 text-white  focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm  text-gray-700 mb-2">Phase</label>
            <select
              value={filterPhase}
              onChange={(e) => setFilterPhase(e.target.value)}
              className="w-full px-3 py-2 border border-gray-700 bg-gray-900 text-white  focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Phases</option>
              <option value="submission">Submission</option>
              <option value="judging">Judging</option>
              <option value="results">Results</option>
            </select>
          </div>

          <div>
            <label className="block text-sm  text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-700 bg-gray-900 text-white  focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="submissions">Most Submissions</option>
              <option value="participants">Most Participants</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterPhase('all');
                setSortBy('newest');
              }}
              className="w-full px-4 py-2 bg-gray-700 text-gray-200  hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </motion.div>

      {/* Competitions List */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  className="space-y-6 overflow-x-auto w-full min-w-0"
  >
        {filteredCompetitions.length === 0 ? (
          <div className="bg-gray-800  p-12 shadow-lg border border-gray-700 text-center">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No competitions found</h3>
            <p className="text-gray-400">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          filteredCompetitions.map((competition, index) => (
            <motion.div
              key={competition._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800  p-4 sm:p-6 shadow-lg border border-gray-700 hover:shadow-xl transition-all duration-300 min-w-0 w-full"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4 w-full min-w-0">
                <div className="flex items-center gap-2 sm:space-x-4 min-w-0">
                  <div className="w-12 h-12 bg-blue-700  flex items-center justify-center text-white  text-base sm:text-lg">
                    {competition.month.substring(0, 3)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-xl  text-white break-words">
                      {competition.month} {competition.year}
                    </h3>
                    <p className="text-xs sm:text-gray-400 break-words">
                      {competition.theme || 'Monthly Storytelling Competition'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:space-x-3 min-w-0">
                  <span className={`px-2 sm:px-3 py-1  text-xs sm:text-sm  ${getPhaseColor(competition.phase)} break-words`}>
                    {getPhaseIcon(competition.phase)}
                    <span className="ml-1 capitalize">{competition.phase}</span>
                  </span>
                  {competition.isActive && (
                    <span className="px-2 py-1 bg-green-900 text-green-300  text-xs  break-words">
                      Active
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4 sm:gap-4 mb-4 w-full">
                <div className="text-center">
                  <p className="text-lg sm:text-2xl  text-blue-400 break-words">{competition.totalParticipants || 0}</p>
                  <p className="text-xs sm:text-sm text-gray-400 break-words">Participants</p>
                </div>
                <div className="text-center">
                  <p className="text-lg sm:text-2xl  text-blue-400 break-words">{competition.totalSubmissions || 0}</p>
                  <p className="text-xs sm:text-sm text-gray-400 break-words">Submissions</p>
                </div>
                <div className="text-center">
                  <p className="text-lg sm:text-2xl  text-green-400 break-words">{competition.winners?.length || 0}</p>
                  <p className="text-xs sm:text-sm text-gray-400 break-words">Winners</p>
                </div>
                <div className="text-center">
                  <p className="text-lg sm:text-2xl  text-orange-400 break-words">
                    {competition.resultsDate ? new Date(competition.resultsDate).toLocaleDateString() : 'TBD'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400 break-words">Results Date</p>
                </div>
              </div>

              {/* Winners Section */}
              {competition.winners && competition.winners.length > 0 && (
                <div className="border-t border-gray-700 pt-4">
                  <h4 className="font-semibold text-white mb-3 flex items-center">
                    <Medal className="w-4 h-4 mr-2 text-yellow-400" />
                    Winners
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {competition.winners.slice(0, 3).map((winner) => (
                      <div
                        key={winner.position}
                        className="flex items-center space-x-3 p-3 bg-gray-700 "
                      >
                        <div className="flex-shrink-0">
                          {winner.position === 1 && <span className="text-2xl">🥇</span>}
                          {winner.position === 2 && <span className="text-2xl">🥈</span>}
                          {winner.position === 3 && <span className="text-2xl">🥉</span>}
                        </div>
                        <div className="flex-1 min-w-0 break-words">
                          <p className=" text-white truncate">{winner.childName}</p>
                          <p className="text-sm text-gray-400 truncate">{winner.title}</p>
                          {winner.score && (
                            <p className="text-xs text-blue-400 ">Score: {winner.score}/100</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-700 gap-2 w-full min-w-0">
                <div className="text-sm text-gray-400">
                  Created: {new Date(competition.createdAt).toLocaleDateString()}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedCompetition(competition)}
                    className="px-4 py-2 bg-blue-800 text-blue-200  hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-1 inline" />
                    View Details
                  </button>
                  {competition.isActive && competition.phase !== 'results' && (
                    <button
                      onClick={() => handleAdvancePhase(competition._id)}
                      disabled={advancingPhase}
                      className="px-4 py-2 bg-green-800 text-green-200  hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Play className="w-4 h-4 mr-1 inline" />
                      Advance Phase
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Competition Details Modal */}
      {selectedCompetition && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-1 sm:p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900  w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-700"
          >
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl  text-white">
                  {selectedCompetition.month} {selectedCompetition.year} Competition Details
                </h2>
                <button
                  onClick={() => setSelectedCompetition(null)}
                  className="p-2 hover:bg-gray-800  transition-colors text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Competition Info */}
                <div>
                  <h3 className="font-semibold text-white mb-3">Competition Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Phase:</span>
                      <span className={`px-2 py-1  text-xs  ${getPhaseColor(selectedCompetition.phase)}`}>
                        {selectedCompetition.phase}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className={`px-2 py-1  text-xs  ${
                        selectedCompetition.isActive ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-400'
                      }`}>
                        {selectedCompetition.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Participants:</span>
                      <span className=" text-white">{selectedCompetition.totalParticipants || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Submissions:</span>
                      <span className=" text-white">{selectedCompetition.totalSubmissions || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Created:</span>
                      <span className=" text-white">{new Date(selectedCompetition.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Judging Criteria */}
                {selectedCompetition.judgingCriteria && (
                  <div>
                    <h3 className="font-semibold text-white mb-3">Judging Criteria</h3>
                    <div className="space-y-2 text-sm">
                      {Object.entries(selectedCompetition.judgingCriteria).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                          <span className=" text-white">{String(value)} points</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Winners Details */}
              {selectedCompetition.winners && selectedCompetition.winners.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-white mb-4">Competition Winners</h3>
                  <div className="space-y-3">
                    {selectedCompetition.winners.map((winner) => (
                      <div key={winner.position} className="p-4 bg-gray-800 ">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">
                              {winner.position === 1 && '🥇'}
                              {winner.position === 2 && '🥈'}
                              {winner.position === 3 && '🥉'}
                            </div>
                            <div>
                              <p className=" text-white">{winner.childName}</p>
                              <p className="text-sm text-gray-400">{winner.title}</p>
                            </div>
                          </div>
                          {winner.score && (
                            <div className="text-right">
                              <p className="text-lg  text-blue-400">{winner.score}/100</p>
                              <p className="text-xs text-gray-400">Final Score</p>
                            </div>
                          )}
                        </div>
                        {winner.aiJudgingNotes && (
                          <div className="mt-3 p-3 bg-gray-900  border-l-4 border-blue-500">
                            <p className="text-sm text-gray-300">{winner.aiJudgingNotes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}