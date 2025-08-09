'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Trophy,
  Medal,
  Star,
  Clock,
  Users,
  BookOpen,
  Target,
  Award,
  Calendar,
  TrendingUp,
  Eye,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Crown,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

interface Competition {
  _id: string;
  month: string;
  year: number;
  phase: 'submission' | 'judging' | 'results';
  submissionStart: string;
  submissionEnd: string;
  judgingStart: string;
  judgingEnd: string;
  resultsDate: string;
  totalSubmissions: number;
  totalParticipants: number;
  maxEntriesPerChild: number;
  daysLeft: number;
  isActive: boolean;
  winners?: Winner[];
  userEntries?: UserEntry[];
  userStats?: {
    entriesUsed: number;
    entriesLimit: number;
    canSubmit: boolean;
  };
}

interface Winner {
  position: number;
  childId: string;
  childName: string;
  storyId: string;
  title: string;
  score: number;
  aiJudgingNotes: string;
}

interface UserEntry {
  storyId: string;
  title: string;
  submittedAt: string;
  score?: number;
  rank?: number;
}

interface EligibleStory {
  _id: string;
  title: string;
  wordCount: number;
  isPublished: boolean;
  competitionEligible: boolean;
  createdAt: string;
  assessment?: {
    overallScore: number;
  };
}

export default function CompetitionPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [currentCompetition, setCurrentCompetition] =
    useState<Competition | null>(null);
  const [previousCompetitions, setPreviousCompetitions] = useState<
    Competition[]
  >([]);
  const [eligibleStories, setEligibleStories] = useState<EligibleStory[]>([]);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);

  useEffect(() => {
    fetchCompetitionData();
  }, []);

  const fetchCompetitionData = async () => {
    try {
      setLoading(true);

      // Fetch current competition
      const currentResponse = await fetch('/api/competitions/current');
      if (currentResponse.ok) {
        const currentData = await currentResponse.json();
        setCurrentCompetition(currentData.competition);
      }

      // Fetch previous competitions
      const previousResponse = await fetch(
        '/api/competitions/previous?limit=6'
      );
      if (previousResponse.ok) {
        const previousData = await previousResponse.json();
        setPreviousCompetitions(previousData.competitions || []);
      }

      // Fetch eligible stories (if logged in)
      if (session?.user?.id) {
        const storiesResponse = await fetch(
          '/api/user/stories?published=true&competitionEligible=true'
        );
        if (storiesResponse.ok) {
          const storiesData = await storiesResponse.json();
          setEligibleStories(storiesData.stories || []);
        }
      }
    } catch (error) {
      console.error('Error fetching competition data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitStory = async (storyId: string, storyTitle: string) => {
    if (!session?.user?.id) {
      router.push('/login/child');
      return;
    }

    setSubmitting(storyId);

    try {
      const response = await fetch('/api/competitions/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storyId,
          competitionId: currentCompetition?._id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`"${storyTitle}" successfully submitted to the competition!`);
        await fetchCompetitionData(); // Refresh data
        setShowSubmissionModal(false);
      } else {
        alert(`Submission failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Submission failed. Please try again.');
    } finally {
      setSubmitting(null);
    }
  };

  const getPodiumIcon = (position: number) => {
    switch (position) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${position}`;
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'submission':
        return 'text-green-400';
      case 'judging':
        return 'text-blue-400';
      case 'results':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading competitions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
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

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Trophy className="text-yellow-400" size={40} />
              Monthly Writing Competitions
            </h1>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Compete with young writers worldwide! Submit up to 3 published
              stories each month. Winners are selected by our advanced AI
              judging system.
            </p>
          </div>
        </motion.div>

        {/* Current Competition */}
        {currentCompetition && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="text-purple-400" />
              {currentCompetition.month} {currentCompetition.year} Competition
            </h2>

            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-8">
              {/* Competition Status */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div
                    className={`text-2xl font-bold ${getPhaseColor(currentCompetition.phase)}`}
                  >
                    {currentCompetition.phase.toUpperCase()}
                  </div>
                  <div className="text-gray-300 text-sm">Current Phase</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {currentCompetition.daysLeft}
                  </div>
                  <div className="text-gray-300 text-sm">Days Left</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {currentCompetition.totalParticipants}
                  </div>
                  <div className="text-gray-300 text-sm">Participants</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {currentCompetition.totalSubmissions}
                  </div>
                  <div className="text-gray-300 text-sm">Total Entries</div>
                </div>
              </div>

              {/* User's Entries */}
              {session && currentCompetition.userStats && (
                <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Target className="text-green-400" />
                    Your Competition Status
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-white">
                        {currentCompetition.userStats.entriesUsed}
                      </div>
                      <div className="text-gray-300 text-sm">
                        Stories Submitted
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-xl font-bold text-white">
                        {currentCompetition.userStats.entriesLimit -
                          currentCompetition.userStats.entriesUsed}
                      </div>
                      <div className="text-gray-300 text-sm">
                        Entries Remaining
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-xl font-bold text-white">
                        {eligibleStories.length}
                      </div>
                      <div className="text-gray-300 text-sm">
                        Eligible Stories
                      </div>
                    </div>
                  </div>

                  {/* User's Submitted Stories */}
                  {currentCompetition.userEntries &&
                    currentCompetition.userEntries.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-white font-medium">
                          Your Submissions:
                        </h4>
                        {currentCompetition.userEntries.map((entry, index) => (
                          <div
                            key={entry.storyId}
                            className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3"
                          >
                            <div>
                              <div className="text-white font-medium">
                                {entry.title}
                              </div>
                              <div className="text-gray-400 text-sm">
                                Submitted{' '}
                                {new Date(
                                  entry.submittedAt
                                ).toLocaleDateString()}
                              </div>
                            </div>
                            {entry.rank && (
                              <div className="text-yellow-400 font-bold">
                                Rank #{entry.rank}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              )}

              {/* Phase-specific content */}
              {currentCompetition.phase === 'submission' && session && (
                <div className="text-center">
                  {currentCompetition.userStats?.canSubmit ? (
                    <button
                      onClick={() => setShowSubmissionModal(true)}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 mx-auto transition-colors"
                    >
                      <Trophy size={20} />
                      Submit Story to Competition
                    </button>
                  ) : (
                    <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-4">
                      <div className="text-yellow-300 font-medium">
                        You've used all 3 competition entries for this month!
                      </div>
                      <div className="text-yellow-200 text-sm mt-1">
                        Come back next month for a new competition
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentCompetition.phase === 'judging' && (
                <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-6 text-center">
                  <div className="text-blue-300 font-bold text-lg mb-2">
                    🤖 AI Judging in Progress
                  </div>
                  <div className="text-blue-200">
                    Our advanced AI is carefully reviewing all{' '}
                    {currentCompetition.totalSubmissions} submissions. Results
                    will be announced soon!
                  </div>
                </div>
              )}

              {currentCompetition.phase === 'results' &&
                currentCompetition.winners && (
                  <div className="bg-gradient-to-r from-yellow-600/20 to-purple-600/20 border border-yellow-500/30 rounded-lg p-6">
                    <h3 className="text-white font-bold text-xl mb-6 text-center flex items-center justify-center gap-2">
                      <Crown className="text-yellow-400" />
                      Competition Winners!
                    </h3>

                    <div className="space-y-4">
                      {currentCompetition.winners
                        .slice(0, 3)
                        .map((winner, index) => (
                          <motion.div
                            key={winner.position}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-center justify-between p-4 rounded-lg border ${
                              winner.position === 1
                                ? 'bg-yellow-600/20 border-yellow-500/30'
                                : winner.position === 2
                                  ? 'bg-gray-400/20 border-gray-400/30'
                                  : 'bg-orange-600/20 border-orange-500/30'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="text-3xl">
                                {getPodiumIcon(winner.position)}
                              </div>
                              <div>
                                <div className="text-white font-bold">
                                  {winner.childName}
                                </div>
                                <div className="text-gray-300 text-sm">
                                  "{winner.title}"
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-white font-bold text-lg">
                                {winner.score}%
                              </div>
                              <div className="text-gray-400 text-sm">
                                Final Score
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                )}
            </div>
          </motion.div>
        )}

        {/* How Competitions Work */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Award className="text-blue-400" />
            How Competitions Work
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/60 border border-gray-600/40 rounded-xl p-6">
              <div className="text-center mb-4">
                <div className="bg-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="text-white font-bold">Submit Phase</h3>
                <p className="text-gray-400 text-sm">Days 1-25</p>
              </div>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Submit up to 3 published stories</li>
                <li>• Stories must be competition-eligible</li>
                <li>• $10 publication fee per story</li>
                <li>• All genres welcome</li>
              </ul>
            </div>

            <div className="bg-gray-800/60 border border-gray-600/40 rounded-xl p-6">
              <div className="text-center mb-4">
                <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="text-white font-bold">AI Judging</h3>
                <p className="text-gray-400 text-sm">Days 26-30</p>
              </div>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Advanced AI analysis</li>
                <li>• 16+ evaluation categories</li>
                <li>• Creativity & originality focus</li>
                <li>• Fair & consistent scoring</li>
              </ul>
            </div>

            <div className="bg-gray-800/60 border border-gray-600/40 rounded-xl p-6">
              <div className="text-center mb-4">
                <div className="bg-purple-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="text-white font-bold">Results</h3>
                <p className="text-gray-400 text-sm">Day 31</p>
              </div>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Top 3 winners announced</li>
                <li>• Olympic-style podium</li>
                <li>• Winner recognition</li>
                <li>• Annual anthology eligibility</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Previous Competitions */}
        {previousCompetitions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="text-gray-400" />
              Previous Competitions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {previousCompetitions.map((competition, index) => (
                <motion.div
                  key={competition._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-gray-800/60 border border-gray-600/40 rounded-xl p-6 hover:border-gray-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold">
                      {competition.month} {competition.year}
                    </h3>
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        competition.phase === 'results'
                          ? 'bg-green-600/20 text-green-400'
                          : 'bg-gray-600/20 text-gray-400'
                      }`}
                    >
                      {competition.phase === 'results'
                        ? 'Completed'
                        : competition.phase}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-400">
                        {competition.totalSubmissions}
                      </div>
                      <div className="text-gray-400 text-xs">Submissions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-400">
                        {competition.totalParticipants}
                      </div>
                      <div className="text-gray-400 text-xs">Participants</div>
                    </div>
                  </div>

                  {competition.winners && competition.winners.length > 0 && (
                    <div className="bg-gray-700/50 rounded-lg p-3 mb-4">
                      <div className="text-sm font-medium text-white mb-2">
                        🏆 Winner:
                      </div>
                      <div className="text-yellow-400 text-sm font-medium">
                        {competition.winners[0].childName}
                      </div>
                      <div className="text-gray-300 text-xs">
                        "{competition.winners[0].title}"
                      </div>
                    </div>
                  )}

                  <Link
                    href={`/competitions/${competition._id}`}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                  >
                    <Eye size={16} />
                    View Results
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Submission Modal */}
        {showSubmissionModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800 border border-gray-600 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  Submit to Competition
                </h3>
                <button
                  onClick={() => setShowSubmissionModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>

              {eligibleStories.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-white font-medium mb-2">
                    No Eligible Stories
                  </h4>
                  <p className="text-gray-400 mb-4">
                    You need published stories to enter competitions. Publish a
                    story for $10 to make it eligible.
                  </p>
                  <Link
                    href="/children-dashboard/my-stories"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg inline-block transition-colors"
                  >
                    View My Stories
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-300 mb-4">
                    Select a published story to submit to the{' '}
                    {currentCompetition?.month} competition:
                  </p>

                  {eligibleStories.map((story) => (
                    <div
                      key={story._id}
                      className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">
                            {story.title}
                          </h4>
                          <div className="text-gray-400 text-sm mt-1">
                            {story.wordCount} words • Created{' '}
                            {new Date(story.createdAt).toLocaleDateString()}
                            {story.assessment && (
                              <span className="ml-2">
                                • Score: {story.assessment.overallScore}%
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            handleSubmitStory(story._id, story.title)
                          }
                          disabled={submitting === story._id}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            submitting === story._id
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {submitting === story._id
                            ? 'Submitting...'
                            : 'Submit'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
