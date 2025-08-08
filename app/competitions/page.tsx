// app/competitions/page.tsx - Monthly Competitions with Olympic Results
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
}

export default function CompetitionsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [currentCompetition, setCurrentCompetition] = useState<Competition | null>(null);
  const [previousCompetitions, setPreviousCompetitions] = useState<Competition[]>([]);
  const [eligibleStories, setEligibleStories] = useState<EligibleStory[]>([]);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [canSubmit, setCanSubmit] = useState({ allowed: true, entriesUsed: 0, entriesLimit: 3 });

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
      const previousResponse = await fetch('/api/competitions/previous?limit=6');
      if (previousResponse.ok) {
        const previousData = await previousResponse.json();
        setPreviousCompetitions(previousData.competitions || []);
      }

      // Check user submission eligibility (if logged in)
      if (session?.user?.id) {
        const eligibilityResponse = await fetch('/api/competitions/check-eligibility');
        if (eligibilityResponse.ok) {
          const eligibilityData = await eligibilityResponse.json();
          setCanSubmit(eligibilityData);
        }

        // Fetch eligible stories
        const storiesResponse = await fetch('/api/user/stories?published=true&competitionEligible=true');
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

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'submission': return 'text-blue-400';
      case 'judging': return 'text-yellow-400';
      case 'results': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'submission': return <BookOpen size={20} />;
      case 'judging': return <Clock size={20} />;
      case 'results': return <Trophy size={20} />;
      default: return <Calendar size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen  bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading competitions...</div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen  bg-gradient-to-br from-gray-900 via-gray-800 to-green-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl  text-white mb-4 ">
            🏆 Monthly Writing Competitions
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto ">
            Showcase your creativity and compete with young writers from around the world. 
            Win recognition, certificates, and special badges!
          </p>
        </motion.div>

        {/* Current Competition */}
        {currentCompetition && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-2 border-purple-500/40 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-500/20 p-3 w-16 h-16 flex items-center justify-center">
                    {getPhaseIcon(currentCompetition.phase)}
                  </div>
                  <div>
                    <h2 className="text-3xl  text-white">
                      {currentCompetition.month} {currentCompetition.year}
                    </h2>
                    <div className={`text-lg font-medium ${getPhaseColor(currentCompetition.phase)}`}>
                      {currentCompetition.phase.toUpperCase()} Phase
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-3xl  text-white">
                    {currentCompetition.daysLeft}
                  </div>
                  <div className="text-gray-300">
                    days left in {currentCompetition.phase} phase
                  </div>
                </div>
              </div>

              {/* Competition Stats */}
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl  text-blue-400">
                    {currentCompetition.totalSubmissions}
                  </div>
                  <div className="text-gray-300">Total Submissions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl  text-green-400">
                    {currentCompetition.totalParticipants}
                  </div>
                  <div className="text-gray-300">Participants</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl  text-purple-400">
                    {currentCompetition.maxEntriesPerChild}
                  </div>
                  <div className="text-gray-300">Max Entries/Child</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl  text-yellow-400">
                    3
                  </div>
                  <div className="text-gray-300">Winners Selected</div>
                </div>
              </div>

              {/* Phase-specific Content */}
              {currentCompetition.phase === 'submission' && session?.user && (
                <div className="bg-gray-800/50 p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl  text-white">Submit Your Stories</h3>
                    <div className="text-sm text-gray-300">
                      {canSubmit.entriesUsed}/{canSubmit.entriesLimit} entries used
                    </div>
                  </div>

                  {!canSubmit.allowed ? (
                    <div className="bg-red-600/20 border border-red-500/30 p-4 text-center">
                      <AlertCircle className="text-red-400 mx-auto mb-2" size={24} />
                      <div className="text-red-300">
                        You've reached your monthly submission limit of {canSubmit.entriesLimit} entries.
                      </div>
                    </div>
                  ) : eligibleStories.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-400 mb-2">
                        No eligible stories found
                      </h4>
                      <p className="text-gray-500 mb-4">
                        You need to publish your stories first to make them competition eligible.
                      </p>
                      <Link
                        href="/children-dashboard/my-stories"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 inline-flex items-center gap-2"
                      >
                        <Star size={16} />
                        View My Stories
                      </Link>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {eligibleStories.slice(0, 6).map((story) => {
                        const alreadySubmitted = currentCompetition.userEntries?.some(
                          entry => entry.storyId === story._id
                        );

                        return (
                          <div
                            key={story._id}
                            className="flex items-center justify-between p-4 bg-gray-700/50 border border-gray-600"
                          >
                            <div>
                              <h4 className="font-medium text-white mb-1">
                                {story.title}
                              </h4>
                              <div className="flex items-center gap-3 text-sm text-gray-400">
                                <span>{story.wordCount} words</span>
                                <span>
                                  {new Date(story.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            
                            {alreadySubmitted ? (
                              <div className="flex items-center gap-2 text-green-400 text-sm">
                                <CheckCircle size={16} />
                                Submitted
                              </div>
                            ) : (
                              <button
                                onClick={() => handleSubmitStory(story._id, story.title)}
                                disabled={submitting === story._id || !canSubmit.allowed}
                                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 text-sm flex items-center gap-2"
                              >
                                {submitting === story._id ? (
                                  'Submitting...'
                                ) : (
                                  <>
                                    <Trophy size={14} />
                                    Submit
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {currentCompetition.phase === 'judging' && (
                <div className="bg-yellow-600/20 border border-yellow-500/30 p-6 text-center">
                  <Clock className="text-yellow-400 mx-auto mb-3" size={32} />
                  <h3 className="text-xl  text-white mb-2">AI Judges at Work</h3>
                  <p className="text-yellow-200">
                    Our advanced AI system is currently evaluating all submissions across 16 different categories 
                    including creativity, grammar, vocabulary, and storytelling structure.
                  </p>
                  <div className="mt-4 text-yellow-300 text-sm">
                    Results will be announced on {new Date(currentCompetition.resultsDate).toLocaleDateString()}
                  </div>
                </div>
              )}

              {currentCompetition.phase === 'results' && currentCompetition.winners && (
                <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 p-6">
                  <h3 className="text-2xl  text-white text-center mb-6">
                    🏆 Competition Winners! 🏆
                  </h3>
                  
                  {/* Olympic-style Podium */}
                  <div className="flex items-end justify-center gap-4 mb-8">
                    
                    {/* 2nd Place */}
                    {currentCompetition.winners[1] && (
                      <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-center"
                      >
                        <div className="bg-gray-600 h-24 w-24 flex items-center justify-center mb-3">
                          <div className="text-4xl">🥈</div>
                        </div>
                        <div className="bg-gray-700 p-4 min-h-[120px]">
                          <div className="text-white  text-lg">2nd Place</div>
                          <div className="text-gray-300 text-sm mt-1">
                            {currentCompetition.winners[1].childName}
                          </div>
                          <div className="text-blue-400 text-sm mt-2">
                            "{currentCompetition.winners[1].title}"
                          </div>
                          <div className="text-yellow-400 text-sm mt-2">
                            Score: {currentCompetition.winners[1].score}/100
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* 1st Place */}
                    {currentCompetition.winners[0] && (
                      <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-center"
                      >
                        <div className="bg-yellow-600 h-32 w-24 flex items-center justify-center mb-3">
                          <div className="text-4xl">🥇</div>
                        </div>
                        <div className="bg-yellow-600/20 border-2 border-yellow-400 p-4 min-h-[140px]">
                          <div className="text-yellow-400  text-xl">1st Place</div>
                          <div className="text-white text-lg mt-1 font-medium">
                            {currentCompetition.winners[0].childName}
                          </div>
                          <div className="text-blue-400 text-sm mt-2">
                            "{currentCompetition.winners[0].title}"
                          </div>
                          <div className="text-yellow-400 text-lg  mt-2">
                            Score: {currentCompetition.winners[0].score}/100
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* 3rd Place */}
                    {currentCompetition.winners[2] && (
                      <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-center"
                      >
                        <div className="bg-orange-600 h-16 w-24 flex items-center justify-center mb-3">
                          <div className="text-3xl">🥉</div>
                        </div>
                        <div className="bg-gray-700 p-4 min-h-[100px]">
                          <div className="text-orange-400 ">3rd Place</div>
                          <div className="text-gray-300 text-sm mt-1">
                            {currentCompetition.winners[2].childName}
                          </div>
                          <div className="text-blue-400 text-sm mt-2">
                            "{currentCompetition.winners[2].title}"
                          </div>
                          <div className="text-yellow-400 text-sm mt-2">
                            Score: {currentCompetition.winners[2].score}/100
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Winner Details */}
                  <div className="bg-gray-800/50 p-6 border border-gray-600">
                    <h4 className="text-lg  text-white mb-4">Judges' Comments</h4>
                    <div className="space-y-4">
                      {currentCompetition.winners.map((winner, index) => (
                        <div key={winner.position} className="p-4 bg-gray-700/50 border border-gray-600">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">
                              {winner.position === 1 ? '🥇' : winner.position === 2 ? '🥈' : '🥉'}
                            </span>
                            <span className="font-medium text-white">
                              {winner.childName} - "{winner.title}"
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm">
                            {winner.aiJudgingNotes}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {!session?.user && currentCompetition.phase === 'submission' && (
                <div className="bg-blue-600/20 border border-blue-500/30 p-6 text-center">
                  <Users className="text-blue-400 mx-auto mb-3" size={32} />
                  <h3 className="text-xl  text-white mb-2">Join the Competition!</h3>
                  <p className="text-blue-200 mb-4">
                    Create an account to participate in our monthly writing competitions and showcase your creativity.
                  </p>
                  <Link
                    href="/register/child"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 inline-flex items-center gap-2"
                  >
                    <Star size={16} />
                    Sign Up to Compete
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Previous Competitions */}
        {previousCompetitions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl  text-white">Previous Competitions</h2>
              <Link
                href="/competitions/archive"
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                View All
                <ChevronRight size={16} />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {previousCompetitions.map((competition) => (
                <div
                  key={competition._id}
                  className="bg-gray-800/50 border border-gray-700 p-6 hover:border-gray-600 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Trophy className="text-yellow-400" size={24} />
                      <div>
                        <h3 className=" text-white group-hover:text-blue-300 transition-colors">
                          {competition.month} {competition.year}
                        </h3>
                        <div className="text-green-400 text-sm">Completed</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-xl  text-blue-400">
                        {competition.totalSubmissions}
                      </div>
                      <div className="text-gray-400 text-xs">Submissions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl  text-green-400">
                        {competition.totalParticipants}
                      </div>
                      <div className="text-gray-400 text-xs">Participants</div>
                    </div>
                  </div>

                  {competition.winners && competition.winners.length > 0 && (
                    <div className="bg-gray-700/50 p-3 border border-gray-600 mb-4">
                      <div className="text-sm font-medium text-white mb-2">🏆 Winner:</div>
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
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Eye size={16} />
                    View Results
                  </Link>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* How Competitions Work */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 p-8"
        >
          <h2 className="text-3xl  text-white text-center mb-8">
            How Our Competitions Work
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Phase 1: Submission */}
            <div className="text-center">
              <div className="bg-blue-500/20 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="text-blue-400" size={32} />
              </div>
              <h3 className="text-xl  text-white mb-3">
                Days 1-25: Submission Phase
              </h3>
              <div className="space-y-2 text-gray-300">
                <p>• Publish your completed stories ($10/story)</p>
                <p>• Submit up to 3 stories per competition</p>
                <p>• Stories must be 100-2000 words</p>
                <p>• All genres and themes welcome</p>
              </div>
            </div>

            {/* Phase 2: Judging */}
            <div className="text-center">
              <div className="bg-yellow-500/20 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock className="text-yellow-400" size={32} />
              </div>
              <h3 className="text-xl  text-white mb-3">
                Days 26-30: AI Judging Phase
              </h3>
              <div className="space-y-2 text-gray-300">
                <p>• Advanced AI evaluates all submissions</p>
                <p>• 16 different assessment categories</p>
                <p>• Fair, consistent, and unbiased scoring</p>
                <p>• Detailed feedback for all participants</p>
              </div>
            </div>

            {/* Phase 3: Results */}
            <div className="text-center">
              <div className="bg-green-500/20 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Trophy className="text-green-400" size={32} />
              </div>
              <h3 className="text-xl  text-white mb-3">
                Day 31: Results & Recognition
              </h3>
              <div className="space-y-2 text-gray-300">
                <p>• Top 3 winners announced</p>
                <p>• Olympic-style medal ceremony</p>
                <p>• Digital certificates awarded</p>
                <p>• Stories featured in gallery</p>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-purple-600/20 border border-purple-500/30 p-6 text-center">
            <Award className="text-purple-400 mx-auto mb-3" size={32} />
            <h3 className="text-xl  text-white mb-2">
              What Winners Receive
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-gray-300 text-sm">
              <div>
                <div className="font-medium text-yellow-400">🥇 1st Place</div>
                <div>Champion Writer Badge</div>
                <div>Featured Story Highlight</div>
                <div>Digital Certificate</div>
              </div>
              <div>
                <div className="font-medium text-gray-400">🥈 2nd Place</div>
                <div>Master Storyteller Badge</div>
                <div>Certificate of Achievement</div>
                <div>Story Recognition</div>
              </div>
              <div>
                <div className="font-medium text-orange-400">🥉 3rd Place</div>
                <div>Creative Writer Badge</div>
                <div>Certificate of Merit</div>
                <div>Honorable Mention</div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}