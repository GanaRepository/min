'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Trophy,
  Plus,
  Calendar,
  Users,
  Edit,
  Eye,
  Trash2,
  Filter,
  Search,
  Image,
  Video,
  Camera,
} from 'lucide-react';

interface Contest {
  _id: string;
  title: string;
  description: string;
  type: 'art' | 'photography' | 'video';
  status: 'draft' | 'active' | 'ended' | 'results_published';
  startDate: string;
  endDate: string;
  resultsDate: string;
  stats: {
    totalSubmissions: number;
    totalParticipants: number;
  };
  maxSubmissionsPerUser: number;
  showPrizes: boolean;
  createdAt: string;
}

const statusColors = {
  draft: 'bg-gray-500',
  active: 'bg-green-500',
  ended: 'bg-yellow-500',
  results_published: 'bg-purple-500',
};

const statusLabels = {
  draft: 'Draft',
  active: 'Active',
  ended: 'Ended',
  results_published: 'Results Published',
};

const typeIcons = {
  art: Image,
  photography: Camera,
  video: Video,
};

export default function AdminCreativeContestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const fetchContests = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (typeFilter !== 'all') params.set('type', typeFilter);

      const response = await fetch(`/api/admin/creative-contests?${params}`);
      const data = await response.json();

      if (data.success) {
        setContests(data.contests);
      }
    } catch (error) {
      console.error('Error fetching contests:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchContests();
  }, [session, status, router, fetchContests]);

  const deleteContest = async (contestId: string) => {
    if (!confirm('Are you sure you want to delete this contest?')) return;

    try {
      const response = await fetch(
        `/api/admin/creative-contests/${contestId}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        fetchContests();
      }
    } catch (error) {
      console.error('Error deleting contest:', error);
    }
  };

  const filteredContests = contests.filter((contest) => {
    const matchesSearch =
      contest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contest.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Creative Contests</h1>
            <p className="text-gray-400 mt-2">
              Manage art, photography, and video competitions
            </p>
          </div>
          <Link
            href="/admin/creative-contests/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>Create Contest</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Contests</p>
                <p className="text-2xl font-bold text-white">
                  {contests.length}
                </p>
              </div>
              <Trophy className="text-yellow-500" size={24} />
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active</p>
                <p className="text-2xl font-bold text-green-400">
                  {contests.filter((c) => c.status === 'active').length}
                </p>
              </div>
              <Calendar className="text-green-500" size={24} />
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Submissions</p>
                <p className="text-2xl font-bold text-blue-400">
                  {contests.reduce(
                    (sum, c) => sum + c.stats.totalSubmissions,
                    0
                  )}
                </p>
              </div>
              <Users className="text-blue-500" size={24} />
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Participants</p>
                <p className="text-2xl font-bold text-purple-400">
                  {contests.reduce(
                    (sum, c) => sum + c.stats.totalParticipants,
                    0
                  )}
                </p>
              </div>
              <Trophy className="text-purple-500" size={24} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search contests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="relative">
              <Filter
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  fetchContests();
                }}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none appearance-none"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="ended">Ended</option>
                <option value="results_published">Results Published</option>
              </select>
            </div>

            <div>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  fetchContests();
                }}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none appearance-none"
              >
                <option value="all">All Types</option>
                <option value="art">Art/Design</option>
                <option value="photography">Photography</option>
                <option value="video">Video</option>
              </select>
            </div>

            <button
              onClick={fetchContests}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Contests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContests.map((contest) => {
            const TypeIcon = typeIcons[contest.type];
            return (
              <div
                key={contest._id}
                className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors"
              >
                {/* Contest Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3 flex-1">
                    <TypeIcon className="text-blue-400" size={24} />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                        {contest.title}
                      </h3>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs text-white ${statusColors[contest.status]}`}
                      >
                        {statusLabels[contest.status]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contest Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">
                      {contest.stats.totalSubmissions}
                    </p>
                    <p className="text-gray-400 text-sm">Submissions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">
                      {contest.stats.totalParticipants}
                    </p>
                    <p className="text-gray-400 text-sm">Participants</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="mb-4">
                  <div className="flex items-center text-gray-400 text-sm mb-1">
                    <Calendar size={16} className="mr-2" />
                    <span>
                      {new Date(contest.startDate).toLocaleDateString()} -
                      {new Date(contest.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-400 text-sm">
                    <Trophy size={16} className="mr-2" />
                    <span>
                      Results:{' '}
                      {new Date(contest.resultsDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                  <div className="flex space-x-2">
                    <Link
                      href={`/admin/creative-contests/${contest._id}`}
                      className="text-blue-400 hover:text-blue-300 p-2 rounded transition-colors"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </Link>
                    <Link
                      href={`/admin/creative-contests/${contest._id}/edit`}
                      className="text-green-400 hover:text-green-300 p-2 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </Link>
                    <button
                      onClick={() => deleteContest(contest._id)}
                      className="text-red-400 hover:text-red-300 p-2 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Status Actions */}
                  <div>
                    {contest.status === 'draft' && (
                      <button
                        onClick={() => {
                          // Update status to active
                          fetch(`/api/admin/creative-contests/${contest._id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'active' }),
                          }).then(() => fetchContests());
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Publish
                      </button>
                    )}
                    {contest.status === 'ended' && (
                      <Link
                        href={`/admin/creative-contests/${contest._id}/select-winners`}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Select Winners
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredContests.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="mx-auto text-gray-600 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No contests found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first creative contest to get started'}
            </p>
            <Link
              href="/admin/creative-contests/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2 transition-colors"
            >
              <Plus size={20} />
              <span>Create Contest</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
