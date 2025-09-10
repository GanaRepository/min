'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Users,
  Download,
  Eye,
  Edit,
  Trophy,
  Clock,
  Settings,
  Image,
  Camera,
  Video,
  FileText,
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
  rules: string;
  acceptedFormats: string[];
  maxFileSize: number;
  maxSubmissionsPerUser: number;
  showPrizes: boolean;
  prizes: Array<{
    position: number;
    title: string;
    description?: string;
  }>;
  submissions: Array<{
    _id: string;
    participantId: string;
    participantName: string;
    fileId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    submissionTitle: string;
    description?: string;
    submittedAt: string;
    isWinner: boolean;
    position?: number;
  }>;
  stats: {
    totalParticipants: number;
    totalSubmissions: number;
  };
  createdBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
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

export default function AdminContestDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const contestId = params.id as string;

  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(
    null
  );

  const fetchContestDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/creative-contests/${contestId}`);
      const data = await response.json();

      if (data.success) {
        setContest(data.contest);
      } else {
        router.push('/admin/creative-contests');
      }
    } catch (error) {
      console.error('Error fetching contest:', error);
      router.push('/admin/creative-contests');
    } finally {
      setLoading(false);
    }
  }, [contestId, router]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchContestDetails();
  }, [session, status, router, contestId, fetchContestDetails]);

  const updateContestStatus = async (newStatus: string) => {
    try {
      console.log(`Starting status update to: ${newStatus}`);
      
      const response = await fetch(
        `/api/admin/creative-contests/${contestId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'update_status',
            status: newStatus 
          }),
        }
      );

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.success) {
        console.log(`Contest status successfully updated to: ${newStatus}`);
        // Refresh the contest data to show updated status
        await fetchContestDetails();
        console.log('Contest details refreshed');
      } else {
        console.error('Failed to update contest status:', data.error || 'Unknown error');
        alert(`Failed to update contest status: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating contest status:', error);
      alert('Network error occurred while updating contest status. Please try again.');
    }
  };

  const downloadFile = async (fileId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const getDaysRemaining = () => {
    if (!contest) return 0;
    const now = new Date();
    const end = new Date(contest.endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading contest details...</div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            Contest Not Found
          </h2>
          <Link
            href="/admin/creative-contests"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3  transition-colors"
          >
            Back to Contests
          </Link>
        </div>
      </div>
    );
  }

  const TypeIcon = typeIcons[contest.type];

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <Link
              href="/admin/creative-contests"
              className="text-blue-400 hover:text-blue-300 mb-4 inline-block"
            >
              ← Back to Contests
            </Link>
            <div className="flex items-center space-x-3 mb-4">
              <TypeIcon className="text-blue-400" size={32} />
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {contest.title}
                </h1>
                <div className="flex items-center space-x-4 mt-2">
                  <span
                    className={`px-3 py-1  text-sm text-white ${statusColors[contest.status]}`}
                  >
                    {statusLabels[contest.status]}
                  </span>
                  <span className="text-gray-400 capitalize">
                    {contest.type} Contest
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Link
              href={`/admin/creative-contests/${contestId}/edit`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2  flex items-center space-x-2 transition-colors"
            >
              <Edit size={16} />
              <span>Edit</span>
            </Link>

            {contest.status === 'draft' && (
              <button
                onClick={() => updateContestStatus('active')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2  transition-colors"
              >
                Publish Contest
              </button>
            )}

            {contest.status === 'active' && (
              <button
                onClick={() => updateContestStatus('ended')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2  transition-colors"
              >
                End Contest
              </button>
            )}

            {contest.status === 'ended' && (
              <Link
                href={`/admin/creative-contests/${contestId}/select-winners`}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2  flex items-center space-x-2 transition-colors"
              >
                <Trophy size={16} />
                <span>Select Winners</span>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 ">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Participants</p>
                <p className="text-3xl font-bold text-blue-400">
                  {contest.stats.totalParticipants}
                </p>
              </div>
              <Users className="text-blue-500" size={24} />
            </div>
          </div>

          <div className="bg-gray-800 p-6 ">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Submissions</p>
                <p className="text-3xl font-bold text-green-400">
                  {contest.stats.totalSubmissions}
                </p>
              </div>
              <FileText className="text-green-500" size={24} />
            </div>
          </div>

          <div className="bg-gray-800 p-6 ">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Max per User</p>
                <p className="text-3xl font-bold text-purple-400">
                  {contest.maxSubmissionsPerUser}
                </p>
              </div>
              <Settings className="text-purple-500" size={24} />
            </div>
          </div>

          <div className="bg-gray-800 p-6 ">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">
                  {contest.status === 'active' ? 'Days Left' : 'Duration'}
                </p>
                <p className="text-3xl font-bold text-yellow-400">
                  {contest.status === 'active'
                    ? getDaysRemaining()
                    : Math.ceil(
                        (new Date(contest.endDate).getTime() -
                          new Date(contest.startDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}
                </p>
              </div>
              <Clock className="text-yellow-500" size={24} />
            </div>
          </div>
        </div>

        {/* Contest Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-gray-800  p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Contest Information
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-gray-300 font-medium mb-2">
                    Description
                  </h3>
                  <p className="text-gray-400">{contest.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-gray-300 font-medium mb-2">Timeline</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Calendar className="mr-2 text-gray-400" size={16} />
                        <span className="text-gray-400">
                          Start: {new Date(contest.startDate).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="mr-2 text-gray-400" size={16} />
                        <span className="text-gray-400">
                          End: {new Date(contest.endDate).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Trophy className="mr-2 text-gray-400" size={16} />
                        <span className="text-gray-400">
                          Results:{' '}
                          {new Date(contest.resultsDate).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-gray-300 font-medium mb-2">
                      File Requirements
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-400">
                        Max size: {contest.maxFileSize} MB
                      </p>
                      <p className="text-gray-400">
                        Formats:{' '}
                        {contest.acceptedFormats.join(', ').toUpperCase()}
                      </p>
                      <p className="text-gray-400">
                        Max submissions: {contest.maxSubmissionsPerUser} per
                        user
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-gray-300 font-medium mb-2">
                    Rules & Guidelines
                  </h3>
                  <div className="text-gray-400 whitespace-pre-line">
                    {contest.rules}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            {/* Prizes */}
            {contest.prizes && contest.prizes.length > 0 && (
              <div className="bg-gray-800  p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Prizes</h2>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      contest.showPrizes
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-600 text-gray-300'
                    }`}
                  >
                    {contest.showPrizes
                      ? 'Visible to Users'
                      : 'Hidden from Users'}
                  </span>
                </div>
                <div className="space-y-3">
                  {contest.prizes.map((prize, index) => (
                    <div key={index} className="bg-gray-700  p-3">
                      <div className="flex items-center mb-1">
                        <Trophy className="text-yellow-400 mr-2" size={16} />
                        <span className="text-white font-medium">
                          {prize.position === 1
                            ? '1st Place'
                            : prize.position === 2
                              ? '2nd Place'
                              : prize.position === 3
                                ? '3rd Place'
                                : `${prize.position}th Place`}
                        </span>
                      </div>
                      <h3 className="text-white font-semibold">
                        {prize.title}
                      </h3>
                      {prize.description && (
                        <p className="text-gray-400 text-sm mt-1">
                          {prize.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contest Creator */}
            <div className="bg-gray-800  p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Contest Details
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Created by</p>
                  <p className="text-white">
                    {contest.createdBy.firstName} {contest.createdBy.lastName}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {contest.createdBy.email}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Created on</p>
                  <p className="text-white">
                    {new Date(contest.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Last updated</p>
                  <p className="text-white">
                    {new Date(contest.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-gray-800  p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">
              Recent Submissions ({contest.submissions.length})
            </h2>
            <div className="flex space-x-3">
              <Link
                href={`/admin/creative-contests/${contestId}/submissions`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2  flex items-center space-x-2 transition-colors"
              >
                <Eye size={16} />
                <span>View All</span>
              </Link>
            </div>
          </div>

          {contest.submissions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto text-gray-600 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">
                No submissions yet
              </h3>
              <p className="text-gray-500">
                Submissions will appear here once participants start entering.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contest.submissions.slice(0, 6).map((submission) => (
                <div
                  key={submission._id}
                  className="bg-gray-700  p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold line-clamp-1">
                        {submission.submissionTitle}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {submission.participantName}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {submission.isWinner && (
                      <Trophy className="text-yellow-400" size={20} />
                    )}
                  </div>

                  <div className="text-gray-400 text-xs mb-3">
                    {submission.fileName} •{' '}
                    {Math.round(submission.fileSize / 1024)} KB
                  </div>
                </div>
              ))}
            </div>
          )}

          {contest.submissions.length > 6 && (
            <div className="text-center mt-6">
              <Link
                href={`/admin/creative-contests/${contestId}/submissions`}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                View all {contest.submissions.length} submissions →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
