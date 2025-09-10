'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Trophy,
  ArrowLeft,
  Download,
  Eye,
  Award,
  Check,
  X,
  Save,
  Users,
  FileText,
} from 'lucide-react';

interface Submission {
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
}

interface Contest {
  _id: string;
  title: string;
  description: string;
  type: 'art' | 'photography' | 'video';
  status: string;
  prizes?: Array<{
    position: number;
    title: string;
    description?: string;
  }>;
  stats: {
    totalSubmissions: number;
    totalParticipants: number;
  };
}

interface Winner {
  submissionId: string;
  position: number;
  participantName: string;
  submissionTitle: string;
}

export default function SelectWinnersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const contestId = params.id as string;

  const [contest, setContest] = useState<Contest | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedWinners, setSelectedWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(
    null
  );

  const fetchContestData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/creative-contests/${contestId}/select-winners`
      );
      const data = await response.json();

      if (data.success) {
        setContest(data.contest);
        setSubmissions(data.submissions || []);

        // Pre-populate existing winners
        const existingWinners =
          data.submissions
            ?.filter((sub: Submission) => sub.isWinner)
            ?.map((sub: Submission) => ({
              submissionId: sub._id,
              position: sub.position || 1,
              participantName: sub.participantName,
              submissionTitle: sub.submissionTitle,
            })) || [];

        setSelectedWinners(existingWinners);
      } else {
        setError(data.error || 'Failed to load contest data');
        setTimeout(() => router.push('/admin/creative-contests'), 2000);
      }
    } catch (error) {
      console.error('Error fetching contest:', error);
      setError('Failed to load contest data');
      setTimeout(() => router.push('/admin/creative-contests'), 2000);
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
    fetchContestData();
  }, [session, status, router, contestId, fetchContestData]);

  const addWinner = (submission: Submission, position: number) => {
    // Remove if already selected for any position
    const filteredWinners = selectedWinners.filter(
      (w) => w.submissionId !== submission._id
    );

    // Remove any existing winner at this position
    const winnersWithoutPosition = filteredWinners.filter(
      (w) => w.position !== position
    );

    // Add new winner
    const newWinner: Winner = {
      submissionId: submission._id,
      position,
      participantName: submission.participantName,
      submissionTitle: submission.submissionTitle,
    };

    setSelectedWinners(
      [...winnersWithoutPosition, newWinner].sort(
        (a, b) => a.position - b.position
      )
    );
  };

  const removeWinner = (submissionId: string) => {
    setSelectedWinners(
      selectedWinners.filter((w) => w.submissionId !== submissionId)
    );
  };

  const getWinnerAtPosition = (position: number): Winner | null => {
    return selectedWinners.find((w) => w.position === position) || null;
  };

  const isSubmissionSelected = (submissionId: string): boolean => {
    return selectedWinners.some((w) => w.submissionId === submissionId);
  };

  const handlePublishResults = async () => {
    if (selectedWinners.length === 0) {
      setError('Please select at least one winner before publishing results');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/creative-contests/${contestId}/select-winners`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            winners: selectedWinners.map((w) => ({
              submissionId: w.submissionId,
              position: w.position,
            })),
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        router.push(
          `/admin/creative-contests/${contestId}?success=winners-published`
        );
      } else {
        setError(data.error || 'Failed to publish results');
      }
    } catch (error) {
      console.error('Error publishing results:', error);
      setError('Failed to publish results. Please try again.');
    } finally {
      setSaving(false);
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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading contest data...</div>
      </div>
    );
  }

  if (error && !contest) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-white mb-2">
            Error Loading Contest
          </h2>
          <p className="text-gray-400 mb-6">{error}</p>
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

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href={`/admin/creative-contests/${contestId}`}
              className="flex items-center text-blue-400 hover:text-blue-300 mb-4 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Contest
            </Link>
            <h1 className="text-3xl font-bold text-white">Select Winners</h1>
            <p className="text-gray-400 mt-2">{contest?.title}</p>
          </div>

          <button
            onClick={handlePublishResults}
            disabled={Boolean(saving) || selectedWinners.length === 0}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white px-6 py-3  flex items-center space-x-2 transition-colors"
          >
            <Save size={20} />
            <span>{saving ? 'Publishing...' : 'Publish Results'}</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 ">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Submissions</p>
                <p className="text-3xl font-bold text-blue-400">
                  {contest?.stats.totalSubmissions}
                </p>
              </div>
              <FileText className="text-blue-500" size={24} />
            </div>
          </div>

          <div className="bg-gray-800 p-6 ">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Participants</p>
                <p className="text-3xl font-bold text-green-400">
                  {contest?.stats.totalParticipants}
                </p>
              </div>
              <Users className="text-green-500" size={24} />
            </div>
          </div>

          <div className="bg-gray-800 p-6 ">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Winners Selected</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {selectedWinners.length}
                </p>
              </div>
              <Trophy className="text-yellow-500" size={24} />
            </div>
          </div>
        </div>

        {/* Winner Selection Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Winner Positions */}
          <div className="bg-gray-800  p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <Award className="mr-3 text-yellow-400" size={24} />
              Winner Positions
            </h2>

            <div className="space-y-4">
              {[1, 2, 3].map((position) => {
                const winner = getWinnerAtPosition(position);
                const prize = contest?.prizes?.find(
                  (p) => p.position === position
                );

                return (
                  <div key={position} className="bg-gray-700  p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div
                          className={`w-8 h-8  flex items-center justify-center text-white font-bold mr-3 ${
                            position === 1
                              ? 'bg-yellow-500'
                              : position === 2
                                ? 'bg-gray-400'
                                : 'bg-yellow-600'
                          }`}
                        >
                          {position}
                        </div>
                        <div>
                          <p className="text-white font-semibold">
                            {position === 1
                              ? '1st Place'
                              : position === 2
                                ? '2nd Place'
                                : '3rd Place'}
                          </p>
                          {prize && (
                            <p className="text-gray-400 text-sm">
                              {prize.title}
                            </p>
                          )}
                        </div>
                      </div>

                      {winner && (
                        <button
                          onClick={() => removeWinner(winner.submissionId)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    {winner ? (
                      <div className="bg-gray-600 rounded p-3">
                        <p className="text-white font-medium">
                          &quot;{winner.submissionTitle}&quot;
                        </p>
                        <p className="text-gray-300 text-sm">
                          {winner.participantName}
                        </p>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-600 rounded p-3 text-center">
                        <p className="text-gray-400 text-sm">
                          No winner selected
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* All Submissions */}
          <div className="lg:col-span-2 bg-gray-800  p-6">
            <h2 className="text-xl font-bold text-white mb-6">
              All Submissions ({submissions.length})
            </h2>

            {submissions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto text-gray-600 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">
                  No submissions yet
                </h3>
                <p className="text-gray-500">
                  This contest doesn&apos;t have any submissions to judge.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {submissions.map((submission) => {
                  const isSelected = isSubmissionSelected(submission._id);
                  const selectedPosition = selectedWinners.find(
                    (w) => w.submissionId === submission._id
                  )?.position;

                  return (
                    <div
                      key={submission._id}
                      className={`border  p-4 transition-all ${
                        isSelected
                          ? 'border-yellow-500 bg-yellow-500 bg-opacity-10'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="text-white font-semibold">
                              &quot;{submission.submissionTitle}&quot;
                            </h3>
                            {isSelected && (
                              <span
                                className={`ml-2 px-2 py-1 rounded text-xs text-white ${
                                  selectedPosition === 1
                                    ? 'bg-yellow-500'
                                    : selectedPosition === 2
                                      ? 'bg-gray-400'
                                      : 'bg-yellow-600'
                                }`}
                              >
                                {selectedPosition === 1
                                  ? '1st'
                                  : selectedPosition === 2
                                    ? '2nd'
                                    : '3rd'}{' '}
                                Place
                              </span>
                            )}
                          </div>

                          <p className="text-gray-300 mb-2">
                            {submission.participantName}
                          </p>

                          <div className="text-gray-400 text-sm mb-3">
                            <p>
                              {submission.fileName} •{' '}
                              {Math.round(submission.fileSize / 1024)} KB
                            </p>
                            <p>
                              Submitted:{' '}
                              {new Date(
                                submission.submittedAt
                              ).toLocaleDateString()}
                            </p>
                            {submission.description && (
                              <p className="mt-1 italic">
                                &quot;{submission.description}&quot;
                              </p>
                            )}
                          </div>

                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                setSelectedSubmission(submission.fileId)
                              }
                              className="text-blue-400 hover:text-blue-300 text-sm flex items-center transition-colors"
                            >
                              <Eye size={14} className="mr-1" />
                              View
                            </button>
                            <button
                              onClick={() =>
                                downloadFile(
                                  submission.fileId,
                                  submission.fileName
                                )
                              }
                              className="text-green-400 hover:text-green-300 text-sm flex items-center transition-colors"
                            >
                              <Download size={14} className="mr-1" />
                              Download
                            </button>
                          </div>
                        </div>

                        {/* Winner Selection Buttons */}
                        <div className="ml-4 flex flex-col space-y-2">
                          {[1, 2, 3].map((position) => {
                            const currentWinner = getWinnerAtPosition(position);
                            const isThisSubmissionWinner =
                              currentWinner?.submissionId === submission._id;
                            const isPositionTaken =
                              currentWinner && !isThisSubmissionWinner;

                            return (
                              <button
                                key={position}
                                onClick={() => addWinner(submission, position)}
                                disabled={Boolean(isPositionTaken)}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                  isThisSubmissionWinner
                                    ? 'bg-yellow-500 text-white'
                                    : isPositionTaken
                                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                      : 'bg-gray-600 hover:bg-gray-500 text-white'
                                }`}
                              >
                                {position === 1
                                  ? '1st'
                                  : position === 2
                                    ? '2nd'
                                    : '3rd'}
                                {isThisSubmissionWinner && (
                                  <Check size={12} className="ml-1 inline" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-900 border border-red-700 ">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* File Viewer Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800  p-6 max-w-4xl max-h-screen overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">
                  Submission Preview
                </h3>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="bg-gray-700  p-8 text-center">
                <p className="text-gray-400">
                  File preview functionality would be implemented here
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  File ID: {selectedSubmission}
                </p>
                <button
                  onClick={() => {
                    const submission = submissions.find(
                      (s) => s.fileId === selectedSubmission
                    );
                    if (submission) {
                      downloadFile(submission.fileId, submission.fileName);
                    }
                  }}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Download File
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
