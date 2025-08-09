
// app/children-dashboard/competitions/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  Upload,
  Eye,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Crown,
  Zap,
  DollarSign,
  FileText,
  Package,
  MapPin,
  Phone,
  Mail,
  Info,
  Gift,
  Sparkles,
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
}

interface Winner {
  position: number;
  childId: string;
  childName: string;
  storyId: string;
  title: string;
  score: number;
  aiJudgingNotes?: string;
}

interface UserStats {
  used: number;
  limit: number;
  remaining: number;
  canUse: boolean;
}

interface UserSubmission {
  _id: string;
  title: string;
  submittedToCompetition: boolean;
  competitionSubmissionDate?: string;
  totalWords: number;
  isPublished: boolean;
  createdAt: string;
}

interface EligibleStory {
  _id: string;
  title: string;
  totalWords: number;
  isPublished: boolean;
  createdAt: string;
  assessment?: {
    overallScore: number;
  };
}

export default function CompetitionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [currentCompetition, setCurrentCompetition] = useState<Competition | null>(null);
  const [previousCompetitions, setPreviousCompetitions] = useState<Competition[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userSubmissions, setUserSubmissions] = useState<UserSubmission[]>([]);
  const [eligibleStories, setEligibleStories] = useState<EligibleStory[]>([]);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadContent, setUploadContent] = useState('');
  const [uploadError, setUploadError] = useState('');

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

      if (session?.user?.id) {
        // Fetch user competition stats
        const limitsResponse = await fetch('/api/user/subscription-limits');
        if (limitsResponse.ok) {
          const limitsData = await limitsResponse.json();
          setUserStats(limitsData.limits.competitions);
        }

        // Fetch user's submitted stories for current competition
        const submissionsResponse = await fetch('/api/user/stories?competition=true');
        if (submissionsResponse.ok) {
          const submissionsData = await submissionsResponse.json();
          setUserSubmissions(submissionsData.stories || []);
        }

        // Fetch eligible stories (published stories that can be submitted)
        const eligibleResponse = await fetch('/api/user/stories?published=true&notSubmitted=true');
        if (eligibleResponse.ok) {
          const eligibleData = await eligibleResponse.json();
          setEligibleStories(eligibleData.stories || []);
        }
      }

    } catch (error) {
      console.error('Error fetching competition data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStoryUpload = async () => {
    if (!uploadTitle.trim()) {
      setUploadError('Please enter a story title');
      return;
    }

    if (!uploadContent.trim() && !uploadFile) {
      setUploadError('Please provide story content');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', uploadTitle.trim());
      formData.append('forCompetition', 'true');
      
      if (uploadFile) {
        formData.append('file', uploadFile);
      } else {
        formData.append('content', uploadContent.trim());
      }

      const response = await fetch('/api/stories/upload-competition', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setShowUploadModal(false);
        setUploadTitle('');
        setUploadContent('');
        setUploadFile(null);
        setUploadError('');
        fetchCompetitionData(); // Refresh data
        alert('Story uploaded and submitted to competition successfully!');
      } else {
        setUploadError(data.error || 'Upload failed');
      }
    } catch (error) {
      setUploadError('Failed to upload story');
    }
  };

  const handleSubmitExistingStory = async (storyId: string, storyTitle: string) => {
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
        fetchCompetitionData(); // Refresh data
      } else {
        alert(`Submission failed: ${data.error}`);
      }

    } catch (error) {
      console.error('Submission error:', error);
      alert('Submission failed. Please try again.');
    } finally {
      setSubmitting(null);
    }
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'submission': return <Upload className="text-green-400" />;
      case 'judging': return <Clock className="text-yellow-400" />;
      case 'results': return <Trophy className="text-purple-400" />;
      default: return <Calendar className="text-gray-400" />;
    }
  };

  const getPodiumIcon = (position: number) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏆';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white  animate-spin mx-auto mb-4"></div>
          <p>Loading competition data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 relative">
      {/* Modern background gradient for vibrant look */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-900 via-gray-800 to-green-900" />
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 "
      >
  
        <div className="text-center mb-8 pt-24">
          <h1 className="text-4xl font-extrabold text-blue-900 mb-2 flex items-center justify-center gap-3 drop-shadow-lg">
            <Trophy size={36} className="text-yellow-400" />
            Monthly Writing Competitions
          </h1>
          <p className="text-lg text-blue-700">
            Compete with young writers worldwide! Submit up to 3 published stories each month.
            <br />
            Winners are selected by our advanced AI judging system.
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
          <div className="bg-gradient-to-br from-[#fef9c3] via-[#e0e7ff] to-[#f0fdfa] border border-blue-300  p-6 mb-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="text-blue-500" size={24} />
                <span className="text-xl font-bold text-blue-700">{currentCompetition.month} {currentCompetition.year}</span>
              </div>
              <div className={`px-4 py-2  text-sm font-bold shadow ${
                currentCompetition.phase === 'submission' 
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : currentCompetition.phase === 'judging'
                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                  : 'bg-purple-100 text-purple-700 border border-purple-300'
              }`}>
                {currentCompetition.phase.charAt(0).toUpperCase() + currentCompetition.phase.slice(1)} Phase
              </div>
            </div>

            {/* Competition Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center bg-blue-100 rounded-lg p-4 shadow">
                <span className="block text-2xl font-bold text-blue-700">{currentCompetition.totalParticipants}</span>
                <span className="text-blue-500">Participants</span>
              </div>
              <div className="text-center bg-yellow-100 rounded-lg p-4 shadow">
                <span className="block text-2xl font-bold text-yellow-700">{currentCompetition.totalSubmissions}</span>
                <span className="text-yellow-500">Stories Submitted</span>
              </div>
              <div className="text-center bg-green-100 rounded-lg p-4 shadow">
                <span className="block text-2xl font-bold text-green-700">{currentCompetition.maxEntriesPerChild}</span>
                <span className="text-green-500">Max Entries/Child</span>
              </div>
              <div className="text-center bg-purple-100 rounded-lg p-4 shadow">
                <span className="block text-2xl font-bold text-purple-700">{currentCompetition.daysLeft}</span>
                <span className="text-purple-500">Days Left</span>
              </div>
            </div>

            {/* User Competition Status */}
            {session && userStats && (
              <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Target className="text-green-400" />
                  Your Competition Status
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{userStats.used}</div>
                    <div className="text-gray-300 text-sm">Stories Submitted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{userStats.remaining}</div>
                    <div className="text-gray-300 text-sm">Entries Remaining</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{eligibleStories.length}</div>
                    <div className="text-gray-300 text-sm">Eligible Stories</div>
                  </div>
                </div>

                {/* User's Submitted Stories */}
                {userSubmissions.length > 0 && (
                  <div className="space-y-3 mb-4">
                    <h4 className="text-white font-medium">Your Submissions This Month:</h4>
                    {userSubmissions.map((story) => (
                      <div key={story._id} className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3">
                        <div>
                          <div className="text-white font-medium">{story.title}</div>
                          <div className="text-gray-400 text-sm">
                            {story.totalWords} words • Submitted {new Date(story.competitionSubmissionDate!).toLocaleDateString()}
                          </div>
                        </div>
                        <CheckCircle className="text-green-400" size={20} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {currentCompetition.phase === 'submission' && session && userStats?.canUse && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Upload New Story */}
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg font-bold flex items-center justify-center gap-3 transition-colors"
                >
                  <Upload size={20} />
                  Upload New Story for Competition
                </button>

                {/* Submit Existing Story */}
                {eligibleStories.length > 0 && (
                  <div className="relative">
                    <details className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-colors">
                      <summary className="font-bold flex items-center justify-center gap-3 cursor-pointer">
                        <BookOpen size={20} />
                        Submit Existing Story ({eligibleStories.length} available)
                      </summary>
                      <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                        {eligibleStories.map((story) => (
                          <div key={story._id} className="flex items-center justify-between bg-white/10 rounded p-2">
                            <div>
                              <div className="font-medium">{story.title}</div>
                              <div className="text-sm opacity-75">{story.totalWords} words</div>
                            </div>
                            <button
                              onClick={() => handleSubmitExistingStory(story._id, story.title)}
                              disabled={submitting === story._id}
                              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm disabled:opacity-50"
                            >
                              {submitting === story._id ? 'Submitting...' : 'Submit'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
              </div>
            )}

            {/* Phase Information */}
            {currentCompetition.phase === 'judging' && (
              <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-4 text-center">
                <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <h3 className="text-white font-bold mb-2">AI Judging in Progress</h3>
                <p className="text-gray-300">
                  Our advanced AI is evaluating all submissions across 16 different categories.
                  Results will be announced on day 31!
                </p>
              </div>
            )}

            {/* Results Display */}
            {currentCompetition.phase === 'results' && currentCompetition.winners && (
              <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-6">
                <h3 className="text-white font-bold mb-4 text-center flex items-center justify-center gap-2">
                  <Crown className="text-yellow-400" />
                  Competition Results - Olympic Style Podium
                </h3>
                <div className="space-y-3">
                  {currentCompetition.winners.map((winner) => (
                    <motion.div
                      key={winner.position}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: winner.position * 0.2 }}
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
                          <div className="text-white font-bold">{winner.childName}</div>
                          <div className="text-gray-300 text-sm">"{winner.title}"</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold text-lg">{winner.score}%</div>
                        <div className="text-gray-400 text-sm">Final Score</div>
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
        <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
          <Info className="text-blue-500" />
          How Our Competitions Work
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Submission Phase */}
          <div className="bg-blue-100 border border-blue-300  p-6 shadow">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl font-bold text-green-600">1</span>
              <span className="font-semibold text-blue-700">Submission Phase</span>
            </div>
            <ul className="text-blue-700 text-sm list-disc pl-5">
              <li>Submit up to 3 published stories</li>
              <li>Stories must be 100-2000 words</li>
              <li>$10 publication fee per story</li>
              <li>All genres and themes welcome</li>
            </ul>
          </div>
          <div className="bg-yellow-100 border border-yellow-300  p-6 shadow">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl font-bold text-yellow-600">2</span>
              <span className="font-semibold text-yellow-700">AI Judging</span>
            </div>
            <ul className="text-yellow-700 text-sm list-disc pl-5">
              <li>Advanced AI evaluates all submissions</li>
              <li>16+ evaluation categories</li>
              <li>Creativity & originality focus</li>
              <li>Fair & consistent scoring</li>
            </ul>
          </div>
          <div className="bg-purple-100 border border-purple-300  p-6 shadow">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl font-bold text-purple-600">3</span>
              <span className="font-semibold text-purple-700">Results</span>
            </div>
            <ul className="text-purple-700 text-sm list-disc pl-5">
              <li>Top 3 winners announced</li>
              <li>Olympic-style medal ceremony</li>
              <li>Digital certificates awarded</li>
              <li>Annual anthology eligibility</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Revenue Model */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
          <DollarSign className="text-green-500" />
          Pricing & Publishing
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-green-100 border border-green-300  p-6 shadow">
            <h3 className="text-xl font-bold text-green-700 mb-2 flex items-center gap-2">
              <span className="text-green-500">🏆</span> Competition Participation
            </h3>
            <ul className="text-green-700 text-sm list-disc pl-5 mb-2">
              <li>Monthly Competition Entry</li>
              <li>Maximum Stories per Month: <span className="font-bold">3 Stories</span></li>
              <li>Story Publication (Optional): <span className="font-bold text-yellow-700">$10/story</span></li>
            </ul>
            <div className="bg-green-50 border border-green-200 rounded p-2 text-green-700 text-xs">
              <span className="font-bold">Note:</span> Competition entry is completely FREE! The $10 fee is only for publishing your story to make it eligible for the competition and visible in our public gallery.
            </div>
          </div>
          <div className="bg-blue-100 border border-blue-300  p-6 shadow">
            <h3 className="text-xl font-bold text-blue-700 mb-2 flex items-center gap-2">
              <span className="text-blue-500">📚</span> Physical Book Publishing
            </h3>
            <ul className="text-blue-700 text-sm list-disc pl-5 mb-2">
              <li>Monthly Collection</li>
              <li>Quarterly Edition</li>
              <li>Half-Yearly Edition</li>
              <li>Annual Collection</li>
            </ul>
            <div className="bg-blue-50 border border-blue-200 rounded p-2 text-blue-700 text-xs mb-2">
              <span className="font-bold">Custom Pricing:</span> Physical book costs vary based on location, shipping, book size, page count, print quality, and quantity ordered.
            </div>
            <a href="mailto:admin@mintoons.com" className="text-blue-600 underline font-semibold">Contact Admin for personalized quote</a>
          </div>
        </div>
      </motion.div>

      {/* Previous Competition Winners */}
      {previousCompetitions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="text-gray-400" />
            Previous Competition Winners
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {previousCompetitions.map((competition, index) => (
              <motion.div
                key={competition._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-gray-800/60 border border-gray-600/40  p-6 hover:border-gray-500/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold">{competition.month} {competition.year}</h3>
                  <div className="bg-purple-600/20 text-purple-400 px-2 py-1 rounded text-xs font-medium">
                    Completed
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Participants:</span>
                    <span className="text-white">{competition.totalParticipants}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Entries:</span>
                    <span className="text-white">{competition.totalSubmissions}</span>
                  </div>
                </div>

                {competition.winners && competition.winners.length > 0 && (
                  <div>
                    <h4 className="text-white font-medium mb-2 text-sm">🏆 Winners:</h4>
                    <div className="space-y-1">
                      {competition.winners.slice(0, 3).map((winner) => (
                        <div key={winner.position} className="text-xs text-gray-300">
                          {getPodiumIcon(winner.position)} {winner.childName} - "{winner.title}" ({winner.score}%)
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 border border-gray-700  p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-xl font-bold text-white">Upload Story for Competition</h3>
               <button
                 onClick={() => setShowUploadModal(false)}
                 className="text-gray-400 hover:text-white transition-colors"
               >
                 ✕
               </button>
             </div>

             <div className="space-y-4">
               {/* Title Input */}
               <div>
                 <label className="block text-sm font-medium text-gray-300 mb-2">
                   Story Title *
                 </label>
                 <input
                   type="text"
                   value={uploadTitle}
                   onChange={(e) => setUploadTitle(e.target.value)}
                   className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                   placeholder="Enter your story title"
                 />
               </div>

               {/* File Upload */}
               <div>
                 <label className="block text-sm font-medium text-gray-300 mb-2">
                   Upload File (.txt only)
                 </label>
                 <input
                   type="file"
                   accept=".txt"
                   onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                   className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                 />
               </div>

               {/* OR Divider */}
               <div className="flex items-center gap-4">
                 <div className="flex-1 h-px bg-gray-600"></div>
                 <span className="text-gray-400 text-sm">OR</span>
                 <div className="flex-1 h-px bg-gray-600"></div>
               </div>

               {/* Text Input */}
               <div>
                 <label className="block text-sm font-medium text-gray-300 mb-2">
                   Paste Story Content
                 </label>
                 <textarea
                   value={uploadContent}
                   onChange={(e) => setUploadContent(e.target.value)}
                   className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 h-32"
                   placeholder="Paste your story content here..."
                 />
               </div>

               {/* Requirements */}
               <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-3">
                 <p className="text-blue-200 text-sm mb-2">📋 <strong>Requirements:</strong></p>
                 <ul className="text-blue-200 text-xs space-y-1">
                   <li>• Story must be 100-2000 words</li>
                   <li>• Original content only (no plagiarism)</li>
                   <li>• $10 publication fee for competition eligibility</li>
                   <li>• All genres welcome</li>
                 </ul>
               </div>

               {/* Error Display */}
               {uploadError && (
                 <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-3">
                   <p className="text-red-200 text-sm">{uploadError}</p>
                 </div>
               )}

               {/* Action Buttons */}
               <div className="flex gap-3 pt-4">
                 <button
                   onClick={() => setShowUploadModal(false)}
                   className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                 >
                   Cancel
                 </button>
                 <button
                   onClick={handleStoryUpload}
                   className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                 >
                   Upload & Submit to Competition
                 </button>
               </div>
             </div>
           </motion.div>
         </motion.div>
       )}
     </AnimatePresence>
   </div>
 );
}