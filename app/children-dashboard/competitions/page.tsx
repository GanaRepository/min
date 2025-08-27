// app/children-dashboard/competitions/page.tsx 
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

import TerminalLoader from '@/components/TerminalLoader';
import {
  Trophy,
  Calendar,
  Clock,
  Users,
  Star,
  Upload,
  Gift,
  ArrowLeft,
  Crown,
  Medal,
  Award,
  Target,
  Brain,
  Sparkles,
  FileText,
  Eye,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Plus,
  Download,
  Share2,
  Info,
  Zap,
  Heart,
  Rocket,
  X,
} from 'lucide-react';
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from '@/components/ui/toast';

// ===== INTERFACES =====
interface Competition {
  _id: string;
  month: string;
  year: number;
  phase: 'submission' | 'judging' | 'results';
  daysLeft: number;
  totalSubmissions: number;
  totalParticipants: number;
  submissionDeadline: string;
  judgingDeadline: string;
  resultsDate: string;
  isActive: boolean;

  // User-specific data
  userStats?: {
    entriesUsed: number;
    entriesLimit: number;
    canSubmit: boolean;
    userEntries: Array<{
      storyId: string;
      title: string;
      submittedAt: string;
      rank?: number;
      score?: number;
    }>;
  };

  // Winners (for results phase)
  winners?: Array<{
    position: number;
    childId: string;
    childName: string;
    title: string;
    score: number;
  }>;

  // Judging criteria
  judgingCriteria: {
    grammar: number;
    creativity: number;
    structure: number;
    character: number;
    plot: number;
    vocabulary: number;
    originality: number;
    engagement: number;
    aiDetection: number;
  };
}

interface EligibleStory {
  _id: string;
  title: string;
  totalWords: number;
  childWords: number;
  createdAt: string;
  isEligible: boolean;
  assessment?: {
    overallScore: number;
    integrityStatus: {
      status: 'PASS' | 'WARNING' | 'FAIL';
    };
  };
}

interface UploadModal {
  show: boolean;
  file: File | null;
  content: string;
  title: string;
  uploading: boolean;
  error: string;
}

export default function CompetitionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ===== STATE =====
  const [loading, setLoading] = useState(true);
  const [currentCompetition, setCurrentCompetition] =
    useState<Competition | null>(null);
  const [pastCompetitions, setPastCompetitions] = useState<Competition[]>([]);
  const [eligibleStories, setEligibleStories] = useState<EligibleStory[]>([]);
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Upload modal state
  const [uploadModal, setUploadModal] = useState<UploadModal>({
    show: false,
    file: null,
    content: '',
    title: '',
    uploading: false,
    error: '',
  });

  // Certificate modal state
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateData, setCertificateData] = useState<any>(null);

  // Pagination for past competitions
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(pastCompetitions.length / itemsPerPage);
  const paginatedCompetitions = pastCompetitions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ===== EFFECTS =====
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'child') {
      router.push('/login/child');
      return;
    }
    fetchCompetitionData();

    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchCompetitionData, 30000);
    return () => clearInterval(interval);
  }, [session, status, router]);

  // ===== DATA FETCHING =====
  const fetchCompetitionData = async () => {
    try {
      setError('');

      console.log('🏆 Fetching competition data...');

      // Fetch current competition with user stats
      const [currentResponse, pastResponse] = await Promise.all([
        fetch('/api/competitions/current'),
        fetch('/api/competitions/past'),
      ]);

      if (currentResponse.ok) {
        const currentData = await currentResponse.json();
        setCurrentCompetition(currentData.competition);
        console.log(
          '📊 Current competition loaded:',
          currentData.competition?.month
        );

        // Fetch eligible stories if in submission phase
        if (currentData.competition?.phase === 'submission') {
          const storiesResponse = await fetch(
            '/api/stories/eligible-for-competition'
          );
          if (storiesResponse.ok) {
            const storiesData = await storiesResponse.json();
            setEligibleStories(storiesData.stories || []);
            console.log(
              '📚 Eligible stories loaded:',
              storiesData.stories?.length || 0
            );
          }
        }
      } else {
        console.log('ℹ️ No current competition found');
      }

      if (pastResponse.ok) {
        const pastData = await pastResponse.json();
        setPastCompetitions(pastData.competitions || []);
        console.log(
          '📜 Past competitions loaded:',
          pastData.competitions?.length || 0
        );
      }
    } catch (error) {
      console.error('❌ Error fetching competition data:', error);
      setError('Failed to load competition data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // ===== STORY SUBMISSION =====
  const handleSubmitExistingStory = async (storyId: string, title: string) => {
    if (!currentCompetition?.userStats?.canSubmit) {
      setError(
        'You have reached the maximum number of entries for this competition.'
      );
      return;
    }

    setSubmitting(storyId);

    try {
      const response = await fetch('/api/competitions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId: storyId,
          competitionId: currentCompetition._id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setToastMessage(
          `🎉 "${title}" has been submitted to the ${currentCompetition.month} competition!`
        );
        fetchCompetitionData(); // Refresh data
      } else {
        throw new Error(data.error || 'Failed to submit story');
      }
    } catch (error) {
      console.error('❌ Submission error:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to submit story. Please try again.'
      );
    } finally {
      setSubmitting(null);
    }
  };

  // ===== UPLOAD HANDLING =====
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Check file type
    const validTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const validExtensions = ['.txt', '.pdf', '.docx'];

    const isValidType =
      validTypes.includes(file.type) ||
      validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!isValidType) {
      setUploadModal((prev) => ({
        ...prev,
        error: 'Please upload only .txt, .pdf, or .docx files',
      }));
      return;
    }

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadModal((prev) => ({
        ...prev,
        error: 'File size must be less than 10MB',
      }));
      return;
    }

    setUploadModal((prev) => ({
      ...prev,
      file,
      title:
        prev.title || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      error: '',
    }));
  };

  const handleUploadSubmission = async () => {
    if (!uploadModal.title.trim()) {
      setUploadModal((prev) => ({
        ...prev,
        error: 'Please enter a story title',
      }));
      return;
    }

    if (!uploadModal.content.trim() && !uploadModal.file) {
      setUploadModal((prev) => ({
        ...prev,
        error: 'Please provide story content via file upload or text input',
      }));
      return;
    }

    setUploadModal((prev) => ({ ...prev, uploading: true, error: '' }));

    try {
      const formData = new FormData();
      formData.append('title', uploadModal.title.trim());
      formData.append('competitionId', currentCompetition!._id);

      if (uploadModal.file) {
        formData.append('file', uploadModal.file);
      } else {
        formData.append('content', uploadModal.content.trim());
      }

      const response = await fetch('/api/user/stories/upload-competition', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setToastMessage(
          `🎉 "${uploadModal.title}" has been uploaded and submitted to the competition!`
        );

        // Reset modal
        setUploadModal({
          show: false,
          file: null,
          content: '',
          title: '',
          uploading: false,
          error: '',
        });

        fetchCompetitionData(); // Refresh data
      } else {
        throw new Error(data.error || 'Failed to upload and submit story');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      setUploadModal((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to upload story. Please try again.',
        uploading: false,
      }));
    }
  };

  // ===== HELPER FUNCTIONS =====
  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'submission':
        return <Upload className="w-6 h-6 text-green-400" />;
      case 'judging':
        return <Brain className="w-6 h-6 text-yellow-400" />;
      case 'results':
        return <Trophy className="w-6 h-6 text-purple-400" />;
      default:
        return <Clock className="w-6 h-6 text-gray-400" />;
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'submission':
        return 'text-green-400';
      case 'judging':
        return 'text-yellow-400';
      case 'results':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-8 h-8 text-yellow-400" />;
      case 2:
        return <Medal className="w-8 h-8 text-gray-300" />;
      case 3:
        return <Award className="w-8 h-8 text-orange-400" />;
      default:
        return <Star className="w-8 h-8 text-gray-400" />;
    }
  };

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <TerminalLoader loadingText="Loading competitions..." />
      </div>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 py-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* ===== HEADER ===== */}
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

            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="relative"
                >
                  <Trophy className="w-20 h-20 text-purple-400" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500  flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                </motion.div>
              </div>

              <h1 className="text-5xl  text-white mb-4">
                <span className="block">Monthly Writing</span>
                <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                  Competitions
                </span>
              </h1>

              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Showcase your creative writing skills in our monthly contests.
                <span className="text-green-400 ">
                  {' '}
                  Completely FREE to enter
                </span>{' '}
                with
                <span className="text-yellow-400 ">
                  {' '}
                  AI-powered fair judging
                </span>{' '}
                and
                <span className="text-purple-400 ">
                  {' '}
                  amazing recognition
                </span>{' '}
                for winners!
              </p>
            </div>
          </motion.div>

          {/* ===== ERROR MESSAGE ===== */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 bg-red-500/20 border border-red-500/30 "
            >
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-400">{error}</p>
              </div>
            </motion.div>
          )}

          {/* ===== CURRENT COMPETITION ===== */}
          {currentCompetition ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-12"
            >
              <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-8">
                {/* Competition Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl  text-white mb-2">
                      {currentCompetition.month} {currentCompetition.year}{' '}
                      Competition
                    </h2>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getPhaseIcon(currentCompetition.phase)}
                        <span
                          className={` capitalize ${getPhaseColor(currentCompetition.phase)}`}
                        >
                          {currentCompetition.phase} Phase
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Clock className="w-5 h-5" />
                        <span>{currentCompetition.daysLeft} days left</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/create-stories"
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3   transition-all flex items-center gap-2 shadow-lg"
                  >
                    <Plus size={20} />
                    Upload Story For Competition
                  </Link>
                </div>

                {/* Competition Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-3xl  text-blue-400">
                      {currentCompetition.totalSubmissions}
                    </div>
                    <div className="text-sm text-gray-400">
                      Total Submissions
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl  text-green-400">
                      {currentCompetition.totalParticipants}
                    </div>
                    <div className="text-sm text-gray-400">Participants</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl  text-purple-400">
                      {currentCompetition.userStats?.entriesUsed || 0}
                    </div>
                    <div className="text-sm text-gray-400">Your Entries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl  text-yellow-400">3</div>
                    <div className="text-sm text-gray-400">Max Entries</div>
                  </div>
                </div>

                {/* Phase-specific Content */}
                {currentCompetition.phase === 'submission' && (
                  <div className="space-y-6">
                    {/* User Entry Status */}
                    {currentCompetition.userStats && (
                      <div className="bg-purple-500/10 border border-purple-500/20  p-6">
                        <h3 className="text-lg  text-white mb-4">
                          Your Competition Status
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-gray-300">
                                Entries Used:
                              </span>
                              <span className="text-white ">
                                {currentCompetition.userStats.entriesUsed} /{' '}
                                {currentCompetition.userStats.entriesLimit}
                              </span>
                            </div>
                            <div className="w-full bg-purple-800/30  h-2">
                              <div
                                className="bg-purple-400 h-2  transition-all"
                                style={{
                                  width: `${(currentCompetition.userStats.entriesUsed / currentCompetition.userStats.entriesLimit) * 100}%`,
                                }}
                              />
                            </div>
                          </div>

                          <div className="text-center">
                            <div
                              className={`text-lg  ${
                                currentCompetition.userStats.canSubmit
                                  ? 'text-green-400'
                                  : 'text-orange-400'
                              }`}
                            >
                              {currentCompetition.userStats.canSubmit
                                ? 'Ready to Submit!'
                                : 'Limit Reached'}
                            </div>
                            <div className="text-sm text-gray-400">
                              {currentCompetition.userStats.canSubmit
                                ? 'You can still submit more stories'
                                : "You've used all 3 entries for this month"}
                            </div>
                          </div>
                        </div>

                        {/* User's Submitted Entries */}
                        {currentCompetition.userStats.userEntries.length >
                          0 && (
                          <div className="mt-6">
                            <h4 className=" text-purple-300 mb-3">
                              Your Submitted Stories:
                            </h4>
                            <div className="space-y-2">
                              {currentCompetition.userStats.userEntries.map(
                                (entry, index) => (
                                  <div
                                    key={index}
                                    className="bg-gray-700/30  p-3 flex items-center justify-between"
                                  >
                                    <div>
                                      <div className=" text-white">
                                        {entry.title}
                                      </div>
                                      <div className="text-sm text-gray-400">
                                        Submitted:{' '}
                                        {new Date(
                                          entry.submittedAt
                                        ).toLocaleDateString()}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {entry.rank && (
                                        <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1  text-xs">
                                          Rank #{entry.rank}
                                        </span>
                                      )}
                                      <Link
                                        href={`/children-dashboard/my-stories/${entry.storyId}`}
                                        className="text-blue-400 hover:text-blue-300 transition-colors"
                                      >
                                        <Eye size={16} />
                                      </Link>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Eligible Stories for Submission */}
                    {eligibleStories.length > 0 &&
                      currentCompetition.userStats?.canSubmit && (
                        <div className="bg-green-500/10 border border-green-500/20  p-6">
                          <h3 className="text-lg  text-white mb-4">
                            Submit Existing Stories
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {eligibleStories.map((story) => (
                              <div
                                key={story._id}
                                className="bg-gray-700/30  p-4"
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h4 className=" text-white mb-1">
                                      {story.title}
                                    </h4>
                                    <div className="text-sm text-gray-400">
                                      {story.totalWords} words •{' '}
                                      {new Date(
                                        story.createdAt
                                      ).toLocaleDateString()}
                                    </div>
                                    {story.assessment && (
                                      <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs text-blue-400">
                                          Score: {story.assessment.overallScore}
                                          %
                                        </span>
                                        {story.assessment.integrityStatus
                                          .status === 'PASS' ? (
                                          <CheckCircle className="w-4 h-4 text-green-400" />
                                        ) : (
                                          <AlertTriangle className="w-4 h-4 text-yellow-400" />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  <Link
                                    href={`/children-dashboard/my-stories/${story._id}`}
                                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-3  text-sm transition-colors flex items-center justify-center gap-2"
                                  >
                                    <Eye size={14} />
                                    View
                                  </Link>

                                  <button
                                    onClick={() =>
                                      handleSubmitExistingStory(
                                        story._id,
                                        story.title
                                      )
                                    }
                                    disabled={
                                      submitting === story._id ||
                                      !story.isEligible
                                    }
                                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-2 px-3  text-sm transition-colors flex items-center justify-center gap-2"
                                  >
                                    {submitting === story._id ? (
                                      <div className="w-4 h-4 border border-white border-t-transparent  animate-spin" />
                                    ) : (
                                      <>
                                        <Trophy size={14} />
                                        Submit
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {/* Judging Phase */}
                {currentCompetition.phase === 'judging' && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20  p-6 text-center">
                    <Brain className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-xl  text-white mb-2">
                      AI Judging in Progress
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Our advanced AI is carefully evaluating all{' '}
                      {currentCompetition.totalSubmissions} submissions across
                      multiple categories including creativity, grammar,
                      structure, and originality.
                    </p>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-4 text-sm">
                      {Object.entries(currentCompetition.judgingCriteria).map(
                        ([category, weight]) => (
                          <div key={category} className="text-center">
                            <div className=" text-yellow-400">{weight}%</div>
                            <div className="text-gray-400 capitalize">
                              {category.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Results Phase */}
                {currentCompetition.phase === 'results' &&
                  currentCompetition.winners && (
                    <div className="bg-purple-500/10 border border-purple-500/20  p-6">
                      <h3 className="text-xl  text-white mb-6 text-center">
                        🎉 {currentCompetition.month} {currentCompetition.year}{' '}
                        Winners! 🎉
                      </h3>

                      <div className="space-y-4">
                        {currentCompetition.winners.map((winner) => (
                          <div
                            key={winner.position}
                            className={`flex items-center gap-4 p-4  ${
                              winner.position === 1
                                ? 'bg-yellow-500/20 border border-yellow-500/30'
                                : winner.position === 2
                                  ? 'bg-gray-500/20 border border-gray-500/30'
                                  : 'bg-orange-500/20 border border-orange-500/30'
                            }`}
                          >
                            <div className="flex-shrink-0">
                              {getRankIcon(winner.position)}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className=" text-white">
                                  #{winner.position}
                                </span>
                                <span className="text-white">
                                  {winner.childName}
                                </span>
                              </div>
                              <div className="text-gray-300 ">
                                {winner.title}
                              </div>
                              <div className="text-sm text-gray-400">
                                Score: {winner.score.toFixed(1)}%
                              </div>
                            </div>

                            {winner.childId === session?.user?.id && (
                              <button
                                onClick={() => {
                                  setCertificateData(winner);
                                  setShowCertificate(true);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2  text-sm transition-colors flex items-center gap-2"
                              >
                                <Download size={16} />
                                Certificate
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </motion.div>
          ) : (
            /* No Current Competition */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-12 text-center"
            >
              <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-12">
                <Trophy className="w-20 h-20 text-gray-500 mx-auto mb-6" />
                <h2 className="text-2xl  text-white mb-4">
                  No Active Competition
                </h2>
                <p className="text-gray-300 mb-6">
                  The next monthly competition will begin on the 1st of next
                  month. Stay tuned and keep writing amazing stories!
                </p>
                <Link
                  href="/create-stories"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3  transition-colors inline-flex items-center gap-2"
                >
                  <Plus size={20} />
                  Create Stories for Next Competition
                </Link>
              </div>
            </motion.div>
          )}

          {/* ===== PAST COMPETITIONS ===== */}
          {pastCompetitions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-2xl  text-white mb-6">Past Competitions</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedCompetitions.map(
                  (competition: Competition, index: number) => (
                    <motion.div
                      key={competition._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="bg-gray-800/40 backdrop-blur-xl border border-gray-600/30  p-6"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Trophy className="w-6 h-6 text-purple-400" />
                        <h3 className="text-lg  text-white">
                          {competition.month} {competition.year}
                        </h3>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Submissions:</span>
                          <span className="text-white">
                            {competition.totalSubmissions}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Participants:</span>
                          <span className="text-white">
                            {competition.totalParticipants}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Results:</span>
                          <span className="text-green-400">Completed</span>
                        </div>
                      </div>

                      {/* Show winners if available */}
                      {competition.winners &&
                        competition.winners.length > 0 && (
                          <div className="border-t border-gray-600/30 pt-4">
                            <div className="text-sm text-gray-400 mb-2">
                              Winners:
                            </div>
                            <div className="space-y-1">
                              {competition.winners
                                .slice(0, 3)
                                .map(
                                  (winner: {
                                    position: number;
                                    childName: string;
                                  }) => (
                                    <div
                                      key={winner.position}
                                      className="flex items-center gap-2 text-sm"
                                    >
                                      <span
                                        className={`w-6 h-6  flex items-center justify-center text-xs  ${
                                          winner.position === 1
                                            ? 'bg-yellow-500 text-gray-900'
                                            : winner.position === 2
                                              ? 'bg-gray-400 text-gray-900'
                                              : 'bg-orange-500 text-gray-900'
                                        }`}
                                      >
                                        {winner.position}
                                      </span>
                                      <span className="text-white truncate">
                                        {winner.childName}
                                      </span>
                                    </div>
                                  )
                                )}
                            </div>
                          </div>
                        )}
                    </motion.div>
                  )
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <nav
                    className="inline-flex items-center gap-2"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-gray-700 text-white disabled:bg-gray-900 disabled:text-gray-500"
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 ${
                            page === currentPage
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 bg-gray-700 text-white disabled:bg-gray-900 disabled:text-gray-500"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </motion.div>
          )}

          {/* ===== COMPETITION INFO ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-8"
          >
            <h2 className="text-2xl  text-white mb-6 text-center">
              How Competitions Work
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600  flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg  text-white mb-2">Submit (Days 1-25)</h3>
                <p className="text-gray-400 text-sm">
                  Upload up to 3 of your best stories. New uploads or existing
                  stories are both welcome!
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-600  flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg  text-white mb-2">
                  AI Judging (Days 26-30)
                </h3>
                <p className="text-gray-400 text-sm">
                  Advanced AI evaluates all entries fairly across creativity,
                  grammar, structure, and more.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600  flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg  text-white mb-2">Results (Day 31)</h3>
                <p className="text-gray-400 text-sm">
                  Top 3 winners announced with digital certificates and
                  community recognition!
                </p>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20  p-6">
              <h3 className="text-lg  text-blue-300 mb-4">
                Competition Rules & Guidelines
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
                <div>
                  <h4 className=" text-white mb-2">📝 Entry Requirements:</h4>
                  <ul className="space-y-1">
                    <li>• Stories must be 350-2000 words</li>
                    <li>• Any genre is welcome</li>
                    <li>• Maximum 3 entries per month</li>
                    <li>• Original work only (AI detection in place)</li>
                  </ul>
                </div>
                <div>
                  <h4 className=" text-white mb-2">🏆 Judging Criteria:</h4>
                  <ul className="space-y-1">
                    <li>• Creativity & Originality (25%)</li>
                    <li>• Plot Development (15%)</li>
                    <li>• Grammar & Structure (22%)</li>
                    <li>• Character Development (12%)</li>
                    <li>• Vocabulary & Engagement (23%)</li>
                    <li>• AI Detection Penalty (3%)</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ===== UPLOAD MODAL ===== */}
          {uploadModal.show && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-800 border border-gray-600  p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl  text-white">
                    Upload Story for Competition
                  </h3>
                  <button
                    onClick={() =>
                      setUploadModal((prev) => ({ ...prev, show: false }))
                    }
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Title Input */}
                  <div>
                    <label className="block text-sm  text-gray-300 mb-2">
                      Story Title *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your story title..."
                      value={uploadModal.title}
                      onChange={(e) =>
                        setUploadModal((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      maxLength={100}
                      className="w-full bg-gray-700/50 border border-gray-600/40  px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-400 mt-1">
                      {uploadModal.title.length}/100 characters
                    </p>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm  text-gray-300 mb-2">
                      Upload Story File
                    </label>
                    <div className="border-2 border-dashed border-gray-600  p-6 text-center">
                      {uploadModal.file ? (
                        <div className="space-y-4">
                          <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
                          <div>
                            <p className="text-white ">
                              {uploadModal.file.name}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {(uploadModal.file.size / 1024 / 1024).toFixed(2)}{' '}
                              MB
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              setUploadModal((prev) => ({
                                ...prev,
                                file: null,
                              }))
                            }
                            className="text-red-400 hover:text-red-300 text-sm underline"
                          >
                            Remove file
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                          <div>
                            <p className="text-white  mb-2">
                              Choose your story file
                            </p>
                            <p className="text-gray-400 text-sm mb-4">
                              .txt, .pdf, .docx files up to 10MB
                            </p>
                            <input
                              type="file"
                              accept=".txt,.pdf,.docx"
                              onChange={handleFileSelect}
                              className="hidden"
                              id="competition-file-upload"
                            />
                            <label
                              htmlFor="competition-file-upload"
                              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2  cursor-pointer transition-colors inline-block"
                            >
                              Choose File
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Text Input Alternative */}
                  <div>
                    <label className="block text-sm  text-gray-300 mb-2">
                      Or paste your story text directly:
                    </label>
                    <textarea
                      placeholder="Paste your story here..."
                      value={uploadModal.content}
                      onChange={(e) =>
                        setUploadModal((prev) => ({
                          ...prev,
                          content: e.target.value,
                        }))
                      }
                      rows={8}
                      className="w-full bg-gray-700/50 border border-gray-600/40  px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical"
                    />
                    <p className="text-sm text-gray-400 mt-1">
                      {
                        uploadModal.content
                          .split(' ')
                          .filter((word) => word.length > 0).length
                      }{' '}
                      words
                    </p>
                  </div>

                  {/* Error Message */}
                  {uploadModal.error && (
                    <div className="p-4 bg-red-500/20 border border-red-500/30 ">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-400" />
                        <p className="text-red-400">{uploadModal.error}</p>
                      </div>
                    </div>
                  )}

                  {/* Upload Button */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() =>
                        setUploadModal((prev) => ({ ...prev, show: false }))
                      }
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3  transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUploadSubmission}
                      disabled={
                        uploadModal.uploading ||
                        !uploadModal.title.trim() ||
                        (!uploadModal.content.trim() && !uploadModal.file)
                      }
                      className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-3  transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                    >
                      {uploadModal.uploading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent  animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Trophy size={20} />
                          Submit to Competition
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* ===== CERTIFICATE MODAL ===== */}
          {showCertificate && certificateData && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-yellow-50 to-orange-50 border-4 border-yellow-400  p-8 w-full max-w-2xl text-center relative"
              >
                <button
                  onClick={() => setShowCertificate(false)}
                  className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <X size={24} />
                </button>

                <div className="mb-6">
                  <Crown className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
                  <h2 className="text-3xl  text-gray-800 mb-2">
                    Certificate of Achievement
                  </h2>
                  <div className="w-32 h-1 bg-yellow-400 mx-auto"></div>
                </div>

                <div className="mb-8">
                  <p className="text-lg text-gray-700 mb-4">
                    This certifies that
                  </p>
                  <h3 className="text-4xl  text-gray-800 mb-4">
                    {certificateData.childName}
                  </h3>
                  <p className="text-lg text-gray-700 mb-2">
                    achieved{' '}
                    <span className=" text-yellow-600">
                      #{certificateData.position} place
                    </span>
                  </p>
                  <p className="text-lg text-gray-700 mb-2">
                    in the{' '}
                    <span className="">
                      {currentCompetition?.month} {currentCompetition?.year}
                    </span>{' '}
                    Writing Competition
                  </p>
                  <p className="text-lg text-gray-700 mb-4">
                    for the story &quot;
                    <span className=" italic">{certificateData.title}</span>
                    &quot;
                  </p>
                  <p className="text-md text-gray-600">
                    Score:{' '}
                    <span className="">
                      {certificateData.score.toFixed(1)}%
                    </span>
                  </p>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => window.print()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3  transition-colors flex items-center gap-2"
                  >
                    <Download size={20} />
                    Download Certificate
                  </button>
                  <button
                    onClick={() => {
                      navigator.share({
                        title: 'My Writing Competition Certificate',
                        text: `I won ${certificateData.position} place in the ${currentCompetition?.month} writing competition!`,
                      });
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3  transition-colors flex items-center gap-2"
                  >
                    <Share2 size={20} />
                    Share
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
      {toastMessage && (
        <Toast>
          <ToastTitle>
            {toastMessage.includes('🎉') ||
            toastMessage.includes('successfully') ||
            toastMessage.includes('completed')
              ? 'Success!'
              : toastMessage.includes('Failed') ||
                  toastMessage.includes('Error')
                ? 'Error'
                : 'Info'}
          </ToastTitle>
          <ToastDescription>{toastMessage}</ToastDescription>
          <ToastClose onClick={() => setToastMessage(null)} />
        </Toast>
      )}
      <ToastViewport />
    </ToastProvider>
  );
}
