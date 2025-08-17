// app/admin/competitions/page.tsx - COMPLETE FIXED VERSION
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Trophy,
  Users,
  Calendar,
  TrendingUp,
  Eye,
  Award,
  Clock,
  Play,
  Pause,
  RefreshCw,
  Crown,
  Medal,
  Star,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Timer,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Competition {
  _id: string;
  month: string;
  year: number;
  phase: 'submission' | 'judging' | 'results';
  totalSubmissions: number;
  totalParticipants: number;
  isActive: boolean;
  daysLeft?: number;
  submissionDeadline?: string;
  judgingDeadline?: string;
  resultsDate?: string;
  winners?: Array<{
    position: number;
    childName: string;
    title: string;
    score: number;
  }>;
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
      
      // Fetch current competition
      const currentResponse = await fetch('/api/competitions/current');
      const currentData = await currentResponse.json();
      
      // Fetch past competitions
      const pastResponse = await fetch('/api/competitions/past');
      const pastData = await pastResponse.json();
      
      // Fetch admin competitions data
      const adminResponse = await fetch('/api/admin/competitions');
      const adminData = await adminResponse.json();

      // Set current competition
      if (currentData.success && currentData.competition) {
        setCurrentCompetition(currentData.competition);
      }

      // Combine all competitions
      const allCompetitions = [];
      if (currentData.success && currentData.competition) {
        allCompetitions.push(currentData.competition);
      }
      if (pastData.success && pastData.competitions) {
        allCompetitions.push(...pastData.competitions);
      }
      
      setCompetitions(allCompetitions);

      // Calculate stats
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
      console.error('Error fetching competitions data:', error);
    } finally {
      setLoading(false);
    }
  };

  const advancePhase = async () => {
    if (!currentCompetition) return;

    try {
      setAdvancingPhase(true);
      const response = await fetch('/api/admin/competitions/advance-phase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitionId: currentCompetition._id }),
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        fetchData(); // Refresh data
      } else {
        alert('Failed to advance phase: ' + data.error);
      }
    } catch (error) {
      console.error('Error advancing phase:', error);
      alert('Failed to advance competition phase');
    } finally {
      setAdvancingPhase(false);
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'submission':
        return 'bg-blue-100 text-blue-800';
      case 'judging':
        return 'bg-yellow-100 text-yellow-800';
      case 'results':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'submission':
        return <Clock size={16} />;
      case 'judging':
        return <Timer size={16} />;
      case 'results':
        return <Trophy size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Loading competitions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Competition Management
          </h1>
          <p className="text-gray-400">
            Automated monthly competitions - view results and analytics
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center"
        >
          <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Trophy size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Competitions</p>
                <p className="text-2xl font-bold text-white">{stats.totalCompetitions}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 p-3 rounded-lg">
                <Users size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Submissions</p>
                <p className="text-2xl font-bold text-white">{stats.totalSubmissions}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-600 p-3 rounded-lg">
                <Star size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Active Competitions</p>
                <p className="text-2xl font-bold text-white">{stats.activeCompetitions}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-600 p-3 rounded-lg">
                <TrendingUp size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Avg Participants</p>
                <p className="text-2xl font-bold text-white">{stats.avgParticipants}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Competition Status */}
      {currentCompetition ? (
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Current Competition</h2>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPhaseColor(currentCompetition.phase)}`}>
                {getPhaseIcon(currentCompetition.phase)}
                <span className="ml-1">{currentCompetition.phase.toUpperCase()}</span>
              </span>
              {currentCompetition.phase !== 'results' && (
                <button
                  onClick={advancePhase}
                  disabled={advancingPhase}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
                >
                  <Play size={16} className="mr-2" />
                  {advancingPhase ? 'Advancing...' : 'Advance Phase'}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="text-blue-400" size={20} />
                <span className="text-blue-400 font-medium">Period</span>
              </div>
              <p className="text-white text-lg font-semibold">
                {currentCompetition.month} {currentCompetition.year}
              </p>
            </div>

            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="text-green-400" size={20} />
                <span className="text-green-400 font-medium">Submissions</span>
              </div>
              <p className="text-white text-lg font-semibold">
                {currentCompetition.totalSubmissions || 0}
              </p>
            </div>

            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Trophy className="text-purple-400" size={20} />
                <span className="text-purple-400 font-medium">Participants</span>
              </div>
              <p className="text-white text-lg font-semibold">
                {currentCompetition.totalParticipants || 0}
              </p>
            </div>

            <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="text-orange-400" size={20} />
                <span className="text-orange-400 font-medium">Days Left</span>
              </div>
              <p className="text-white text-lg font-semibold">
                {currentCompetition.daysLeft || 0}
              </p>
            </div>
          </div>

          {/* Winners Section (if results phase) */}
          {currentCompetition.phase === 'results' && currentCompetition.winners && currentCompetition.winners.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Competition Winners</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentCompetition.winners.slice(0, 3).map((winner, index) => (
                  <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                      }`}>
                        {index === 0 ? <Crown size={20} className="text-white" /> : 
                         index === 1 ? <Medal size={20} className="text-white" /> :
                         <Award size={20} className="text-white" />}
                      </div>
                      <div>
                        <p className="text-white font-medium">{winner.childName}</p>
                        <p className="text-gray-400 text-sm">"{winner.title}"</p>
                        <p className="text-blue-400 text-sm">Score: {winner.score}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="text-center py-8">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl text-gray-400 mb-2">No Active Competition</h3>
            <p className="text-gray-500">
              No competition is currently running. A new one will start automatically.
            </p>
          </div>
        </div>
      )}

      {/* Past Competitions */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Competition History</h2>
          <span className="text-sm text-gray-400">
            {competitions.length} total competitions
          </span>
        </div>

        {competitions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Period</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Phase</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Submissions</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Participants</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Winner</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {competitions.map((competition, index) => (
                  <motion.tr
                    key={competition._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">
                          {competition.month} {competition.year}
                        </span>
                        {competition.isActive && (
                          <span className="bg-green-500 w-2 h-2 rounded-full"></span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPhaseColor(competition.phase)}`}>
                        {getPhaseIcon(competition.phase)}
                        <span className="ml-1">{competition.phase}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white">
                      {competition.totalSubmissions || 0}
                    </td>
                    <td className="py-3 px-4 text-white">
                      {competition.totalParticipants || 0}
                    </td>
                    <td className="py-3 px-4">
                      {competition.winners && competition.winners.length > 0 ? (
                        <span className="text-yellow-400">
                          {competition.winners[0].childName}
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/admin/competitions/${competition._id}`}>
                        <button className="text-blue-400 hover:text-blue-300 p-1 rounded">
                          <Eye size={16} />
                        </button>
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Trophy size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl text-gray-400 mb-2">No Competitions Yet</h3>
            <p className="text-gray-500">
              Competitions will appear here once they are created.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}