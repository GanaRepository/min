// app/creative-contests/[id]/submit/page.tsx - CREATE THIS FILE
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Upload,
  FileText,
  Image as ImageIcon,
  Camera,
  Video,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';

interface Contest {
  _id: string;
  title: string;
  type: 'art' | 'photography' | 'video';
  status: string;
  acceptedFormats: string[];
  maxFileSize: number;
  maxSubmissionsPerUser: number;
  userStats?: {
    submissionCount: number;
    canSubmit: boolean;
  };
}

const typeIcons = {
  art: ImageIcon,
  photography: Camera,
  video: Video,
};

export default function SubmitEntryPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const contestId = params.id as string;

  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fetchContestDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/creative-contests/${contestId}`);
      const data = await response.json();

      if (data.success && data.contest) {
        if (data.contest.status !== 'active') {
          setError('This contest is not accepting submissions');
          setTimeout(
            () => router.push(`/creative-contests/${contestId}`),
            2000
          );
          return;
        }
        if (!data.contest.userStats?.canSubmit) {
          setError('You have reached the maximum submission limit');
          setTimeout(
            () => router.push(`/creative-contests/${contestId}`),
            2000
          );
          return;
        }
        setContest(data.contest);
      } else {
        setError('Contest not found');
      }
    } catch (error) {
      console.error('Error fetching contest:', error);
      setError('Failed to load contest');
    } finally {
      setLoading(false);
    }
  }, [contestId, router]);

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    fetchContestDetails();
  }, [session, contestId, router, fetchContestDetails]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    if (!contest) return;

    // Validate file type
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !contest.acceptedFormats.includes(fileExtension)) {
      setError(
        `Invalid file format. Accepted formats: ${contest.acceptedFormats.join(', ')}`
      );
      return;
    }

    // Validate file size
    if (selectedFile.size > contest.maxFileSize * 1024 * 1024) {
      setError(`File size exceeds ${contest.maxFileSize}MB limit`);
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !title.trim()) {
      setError('Please provide a title and select a file');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);

      const response = await fetch(
        `/api/creative-contests/${contestId}/submit`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/creative-contests/${contestId}`);
        }, 2000);
      } else {
        setError(data.error || 'Failed to submit entry');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      setError('Failed to submit entry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error && !contest) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-white mb-2">Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link
            href="/creative-contests"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Back to Contests
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Submission Successful!
          </h2>
          <p className="text-gray-400">
            Your entry has been submitted to the contest.
          </p>
          <p className="text-gray-500 text-sm mt-2">Redirecting...</p>
        </div>
      </div>
    );
  }

  const TypeIcon = contest ? typeIcons[contest.type] : FileText;

  return (
    <div className="min-h-screen bg-gray-900 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Link
          href={`/creative-contests/${contestId}`}
          className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Contest
        </Link>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <TypeIcon className="text-blue-400 mr-3" size={28} />
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Submit Your Entry
                </h1>
                <p className="text-gray-400">{contest?.title}</p>
              </div>
            </div>

            {contest?.userStats && (
              <div className="bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-3">
                <p className="text-blue-300 text-sm">
                  You have submitted {contest.userStats.submissionCount} out of{' '}
                  {contest.maxSubmissionsPerUser} allowed entries
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Entry Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                placeholder="Give your entry a creative title..."
                required
                disabled={submitting}
              />
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                placeholder="Tell us about your creation..."
                disabled={submitting}
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload File *
              </label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-500 bg-opacity-10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="space-y-3">
                    {filePreview && (
                      <Image
                        src={filePreview}
                        alt="Preview"
                        width={300}
                        height={200}
                        className="max-h-48 mx-auto rounded-lg object-contain"
                      />
                    )}
                    <div className="flex items-center justify-center space-x-2">
                      <FileText className="text-green-400" size={20} />
                      <span className="text-white">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFile(null);
                          setFilePreview(null);
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto text-gray-400 mb-3" size={40} />
                    <p className="text-gray-300 mb-2">
                      Drag and drop your file here, or click to browse
                    </p>
                    <p className="text-gray-500 text-sm">
                      Accepted formats:{' '}
                      {contest?.acceptedFormats
                        .map((f) => f.toUpperCase())
                        .join(', ')}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Maximum size: {contest?.maxFileSize} MB
                    </p>
                    <input
                      type="file"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileSelection(e.target.files[0]);
                        }
                      }}
                      accept={contest?.acceptedFormats
                        .map((f) => `.${f}`)
                        .join(',')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={submitting}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <Link
                href={`/creative-contests/${contestId}`}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || !file || !title.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Upload size={18} />
                <span>{submitting ? 'Submitting...' : 'Submit Entry'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
