// app/admin/creative-contests/[id]/submissions/page.tsx - CREATE THIS FILE
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  Eye,
  FileText,
  Filter,
  Search,
  Trophy,
  Calendar,
  User,
  X,
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

// FilePreviewModal component (single correct definition)
function FilePreviewModal({
  fileId,
  submissions,
  onClose,
}: {
  fileId: string;
  submissions: Submission[];
  onClose: () => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const submission = submissions.find((s) => s.fileId === fileId);
    if (!submission) return;
    setFileType(submission.fileType);
    setFileName(submission.fileName);
    setLoading(true);
    fetch(`/api/files/${fileId}`)
      .then((res) => res.blob())
      .then((blob) => {
        setPreviewUrl(URL.createObjectURL(blob));
      })
      .finally(() => setLoading(false));
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line
  }, [fileId]);

  const isImage = fileType.startsWith('image/');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-4xl max-h-screen overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Submission Preview</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="bg-gray-700 rounded-lg p-8 text-center">
          {loading ? (
            <p className="text-gray-400">Loading preview...</p>
          ) : isImage && previewUrl ? (
            <div className="flex justify-center">
              <Image
                src={previewUrl}
                alt={fileName}
                width={600}
                height={400}
                className="max-h-96 max-w-full mx-auto rounded shadow-lg border border-gray-600"
                style={{ objectFit: 'contain' }}
                unoptimized
              />
            </div>
          ) : (
            <>
              <p className="text-gray-400 mb-2">
                Preview not available for this file type.
              </p>
              <a
                href={previewUrl || '#'}
                download={fileName}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors mb-2"
              >
                Download File
              </a>
            </>
          )}
          <p className="text-gray-500 text-sm mt-2">File ID: {fileId}</p>
        </div>
      </div>
    </div>
  );
}

interface Contest {
  _id: string;
  title: string;
  status: string;
  stats: {
    totalSubmissions: number;
    totalParticipants: number;
  };
}

export default function AdminSubmissionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const contestId = params.id as string;

  const [contest, setContest] = useState<Contest | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(
    null
  );
  const [downloading, setDownloading] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/creative-contests/${contestId}/submissions`
      );
      const data = await response.json();

      if (data.success) {
        setContest(data.contest);
        setSubmissions(data.submissions || []);
        setFilteredSubmissions(data.submissions || []);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  }, [contestId]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchSubmissions();
  }, [session, status, router, contestId, fetchSubmissions]);

  useEffect(() => {
    let filtered = [...submissions];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (sub) =>
          sub.participantName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          sub.submissionTitle
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          sub.fileName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort(
          (a, b) =>
            new Date(b.submittedAt).getTime() -
            new Date(a.submittedAt).getTime()
        );
        break;
      case 'oldest':
        filtered.sort(
          (a, b) =>
            new Date(a.submittedAt).getTime() -
            new Date(b.submittedAt).getTime()
        );
        break;
      case 'participant':
        filtered.sort((a, b) =>
          a.participantName.localeCompare(b.participantName)
        );
        break;
      case 'winners':
        filtered.sort((a, b) => {
          if (a.isWinner && !b.isWinner) return -1;
          if (!a.isWinner && b.isWinner) return 1;
          if (a.isWinner && b.isWinner)
            return (a.position || 999) - (b.position || 999);
          return 0;
        });
        break;
    }

    setFilteredSubmissions(filtered);
  }, [searchTerm, sortBy, submissions]);

  const downloadFile = async (fileId: string, fileName: string) => {
    try {
      setDownloading(fileId);
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
    } finally {
      setDownloading(null);
    }
  };

  const downloadAll = async () => {
    for (const submission of filteredSubmissions) {
      await downloadFile(submission.fileId, submission.fileName);
      // Add delay to prevent overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading submissions...</div>
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
            <h1 className="text-3xl font-bold text-white">All Submissions</h1>
            <p className="text-gray-400 mt-2">{contest?.title}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-400 text-sm">Total Submissions</p>
            <p className="text-2xl font-bold text-blue-400">
              {contest?.stats.totalSubmissions || 0}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-400 text-sm">Total Participants</p>
            <p className="text-2xl font-bold text-green-400">
              {contest?.stats.totalParticipants || 0}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-400 text-sm">Winners Selected</p>
            <p className="text-2xl font-bold text-yellow-400">
              {submissions.filter((s) => s.isWinner).length}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-400 text-sm">Contest Status</p>
            <p className="text-lg font-bold text-purple-400 capitalize">
              {contest?.status}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search submissions..."
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
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none appearance-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="participant">By Participant Name</option>
                <option value="winners">Winners First</option>
              </select>
            </div>

            <div className="flex items-center justify-end text-gray-400">
              Showing {filteredSubmissions.length} of {submissions.length}{' '}
              submissions
            </div>
          </div>
        </div>

        {/* Submissions Grid */}
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto text-gray-600 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              {searchTerm ? 'No submissions found' : 'No submissions yet'}
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? 'Try adjusting your search criteria'
                : 'Submissions will appear here once participants start entering'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubmissions.map((submission) => (
              <div
                key={submission._id}
                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
              >
                {/* Winner Badge */}
                {submission.isWinner && (
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`px-3 py-1 rounded-full text-xs text-white font-bold ${
                        submission.position === 1
                          ? 'bg-yellow-500'
                          : submission.position === 2
                            ? 'bg-gray-400'
                            : 'bg-yellow-600'
                      }`}
                    >
                      <Trophy size={12} className="inline mr-1" />
                      {submission.position === 1
                        ? '1st Place'
                        : submission.position === 2
                          ? '2nd Place'
                          : '3rd Place'}
                    </div>
                  </div>
                )}

                {/* Submission Info */}
                <h3 className="text-white font-semibold mb-1 line-clamp-1">
                  {submission.submissionTitle}
                </h3>
                <div className="text-gray-400 text-sm space-y-1 mb-3">
                  <div className="flex items-center">
                    <User size={14} className="mr-1" />
                    {submission.participantName}
                  </div>
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    {new Date(submission.submittedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <FileText size={14} className="mr-1" />
                    {submission.fileName} •{' '}
                    {Math.round(submission.fileSize / 1024)} KB
                  </div>
                </div>

                {submission.description && (
                  <p className="text-gray-500 text-sm italic mb-3 line-clamp-2">
                    &quot;{submission.description}&quot;
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedSubmission(submission.fileId)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm transition-colors flex items-center justify-center"
                  >
                    <Eye size={14} className="mr-1" />
                    View
                  </button>
                  <button
                    onClick={() =>
                      downloadFile(submission.fileId, submission.fileName)
                    }
                    disabled={downloading === submission.fileId}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-3 py-1.5 rounded text-sm transition-colors flex items-center justify-center"
                  >
                    <Download size={14} className="mr-1" />
                    {downloading === submission.fileId
                      ? 'Downloading...'
                      : 'Download'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* File Viewer Modal */}
        {selectedSubmission && (
          <FilePreviewModal
            fileId={selectedSubmission}
            submissions={filteredSubmissions}
            onClose={() => setSelectedSubmission(null)}
          />
        )}
      </div>
    </div>
  );
}
