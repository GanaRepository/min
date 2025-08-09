//app/admin/competitions/[id]/page.tsx

// app/admin/competitions/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Users,
  BookOpen,
  Award,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface CompetitionDetails {
  _id: string;
  month: string;
  year: number;
  phase: string;
  theme: string;
  description: string;
  isActive: boolean;
  submissionStart: string;
  submissionEnd: string;
  judgingStart: string;
  judgingEnd: string;
  resultsDate: string;
  createdBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
  judgingCriteria: {
    grammar: number;
    creativity: number;
    structure: number;
    characterDev: number;
    plotOriginality: number;
    vocabulary: number;
  };
  entries: Array<{
    _id: string;
    title: string;
    totalWords: number;
    competitionScore?: number;
    competitionRank?: number;
    createdAt: string;
    childId: {
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
  totalEntries: number;
}

export default function ViewCompetition() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const competitionId = params.id as string;

  const [competition, setCompetition] = useState<CompetitionDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchCompetition();
  }, [session, status, router, competitionId]);

  const fetchCompetition = async () => {
    try {
      const response = await fetch(`/api/admin/competitions/${competitionId}`);
      const data = await response.json();

      if (data.success) {
        setCompetition(data.competition);
      } else {
        router.push('/admin/competitions');
      }
    } catch (error) {
      console.error('Error fetching competition:', error);
      router.push('/admin/competitions');
    } finally {
      setLoading(false);
    }
  };

  const deleteCompetition = async () => {
    if (
      !confirm(
        `Are you sure you want to delete the ${competition?.month} ${competition?.year} competition? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/competitions/${competitionId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Competition deleted successfully');
        router.push('/admin/competitions');
      } else {
        alert('Failed to delete competition: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting competition:', error);
      alert('Failed to delete competition');
    } finally {
      setDeleting(false);
    }
  };

  const advancePhase = async () => {
    if (
      !confirm(
        `Are you sure you want to advance the competition to the next phase?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch('/api/admin/competitions/advance-phase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ competitionId }),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        fetchCompetition(); // Refresh data
      } else {
        alert('Failed to advance phase: ' + data.error);
      }
    } catch (error) {
      console.error('Error advancing phase:', error);
      alert('Failed to advance phase');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">
          Loading competition details...
        </div>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Competition not found</div>
      </div>
    );
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'submission':
        return 'bg-blue-100 text-blue-800';
      case 'judging':
        return 'bg-orange-100 text-orange-800';
      case 'results':
        return 'bg-green-100 text-green-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/competitions">
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {competition.month} {competition.year} Competition
            </h1>
            <p className="text-gray-400">Competition details and entries</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {competition.phase !== 'ended' && (
            <button
              onClick={advancePhase}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <TrendingUp size={16} className="mr-2" />
              Advance Phase
            </button>
          )}
          <button
            onClick={deleteCompetition}
            disabled={deleting}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
          >
            <Trash2 size={16} className="mr-2" />
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Competition Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Phase</h3>
            <Calendar size={20} className="text-blue-400" />
          </div>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPhaseColor(competition.phase)}`}
          >
            {competition.phase}
          </span>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Total Entries</h3>
            <BookOpen size={20} className="text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {competition.totalEntries}
          </p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Participants</h3>
            <Users size={20} className="text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {new Set(competition.entries.map((e) => e.childId.email)).size}
          </p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Status</h3>
            <Award size={20} className="text-orange-400" />
          </div>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              competition.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {competition.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Competition Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Competition Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Theme</label>
              <p className="text-white font-medium">
                {competition.theme || 'No theme set'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Description</label>
              <p className="text-white">
                {competition.description || 'No description provided'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Created By</label>
              <p className="text-white">
                {competition.createdBy.firstName}{' '}
                {competition.createdBy.lastName}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Timeline</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-400">Submission Phase</span>
              <span className="text-white text-sm">
                {new Date(competition.submissionStart).toLocaleDateString()} -{' '}
                {new Date(competition.submissionEnd).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-400">Judging Phase</span>
              <span className="text-white text-sm">
                {new Date(competition.judgingStart).toLocaleDateString()} -{' '}
                {new Date(competition.judgingEnd).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-400">Results</span>
              <span className="text-white text-sm">
                {new Date(competition.resultsDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Judging Criteria */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Judging Criteria
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(competition.judgingCriteria).map(([key, value]) => (
            <div
              key={key}
              className="bg-gray-700/50 rounded-lg p-3 text-center"
            >
              <div className="text-2xl font-bold text-white">
                {Math.round(value * 100)}%
              </div>
              <div className="text-xs text-gray-400 capitalize">
                {key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase())}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Entries */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Competition Entries
        </h3>

        {competition.entries.length > 0 ? (
          <div className="space-y-3">
            {competition.entries
              .sort(
                (a, b) =>
                  (a.competitionRank || 999) - (b.competitionRank || 999)
              )
              .map((entry, index) => (
                <motion.div
                  key={entry._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    {entry.competitionRank && entry.competitionRank <= 3 && (
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          entry.competitionRank === 1
                            ? 'bg-yellow-500'
                            : entry.competitionRank === 2
                              ? 'bg-gray-400'
                              : 'bg-amber-600'
                        }`}
                      >
                        #{entry.competitionRank}
                      </div>
                    )}
                    <div>
                      <Link href={`/admin/stories/${entry._id}`}>
                        <h4 className="text-white font-medium hover:text-blue-400 cursor-pointer">
                          {entry.title}
                        </h4>
                      </Link>
                      <p className="text-gray-400 text-sm">
                        by {entry.childId.firstName} {entry.childId.lastName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm">
                        <div className="text-white font-medium">
                          {entry.totalWords} words
                        </div>
                        <div className="text-gray-400">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {entry.competitionScore && (
                        <div className="text-center">
                          <div className="text-xl font-bold text-white">
                            {entry.competitionScore}
                          </div>
                          <div className="text-xs text-gray-400">score</div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">
              No entries yet
            </h3>
            <p className="text-gray-500">
              Entries will appear here as students submit their stories
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
