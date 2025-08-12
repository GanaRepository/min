'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Upload, 
  Clock, 
  Star, 
  Medal, 
  Download, 
  ArrowLeft, 
  FileText, 
  Plus, 
  X,
  Calendar,
  Users,
  Award,
  Crown,
  CheckCircle,
  AlertTriangle,
  Eye,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import DigitalCertificate from '@/components/DigitalCertificate';

interface Competition {
  _id: string;
  month: string;
  year: number;
  phase: 'submission' | 'judging' | 'results';
  daysLeft: number;
  totalSubmissions: number;
  totalParticipants: number;
  winners?: Array<{
    position: number;
    childId: string;
    childName: string;
    title: string;
    score: number;
  }>;
  userStats?: {
    entriesUsed: number;
    entriesLimit: number;
    canSubmit: boolean;
    userEntries: Array<{
      storyId: string;
      title: string;
      submittedAt: string;
      score?: number;
      rank?: number;
    }>;
  };
}

interface EligibleStory {
  _id: string;
  title: string;
  wordCount: number;
  createdAt: string;
  isEligible: boolean;
}

export default function CompetitionsPage() {
  const { data: session } = useSession();
  const [currentCompetition, setCurrentCompetition] = useState<Competition | null>(null);
  const [pastCompetitions, setPastCompetitions] = useState<Competition[]>([]);
  const [eligibleStories, setEligibleStories] = useState<EligibleStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  
  // Certificate modal state
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateData, setCertificateData] = useState<any>(null);
  
  // File upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadContent, setUploadContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    fetchCompetitionData();
    
    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchCompetitionData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCompetitionData = async () => {
    try {
      setError('');
      
      // Fetch current competition with user stats
      const currentResponse = await fetch('/api/competitions/current');
      if (currentResponse.ok) {
        const currentData = await currentResponse.json();
        setCurrentCompetition(currentData.competition);
        
        // Fetch eligible stories if in submission phase
        if (currentData.competition?.phase === 'submission') {
          const storiesResponse = await fetch('/api/stories/eligible-for-competition');
          if (storiesResponse.ok) {
            const storiesData = await storiesResponse.json();
            setEligibleStories(storiesData.stories || []);
          }
        }
      }

      // Fetch past competitions
      const pastResponse = await fetch('/api/competitions/past');
      if (pastResponse.ok) {
        const pastData = await pastResponse.json();
        setPastCompetitions(pastData.competitions || []);
      }

    } catch (error) {
      console.error('Error fetching competition data:', error);
      setError('Failed to load competition data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const submitToCompetition = async (storyId: string) => {
    setSubmitting(storyId);
    try {
      const response = await fetch('/api/competitions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId })
      });

      const data = await response.json();

      if (response.ok) {
        alert('🎉 Story submitted to competition successfully!');
        fetchCompetitionData(); // Refresh data
      } else {
        alert(data.error || 'Failed to submit story');
      }
    } catch (error) {
      alert('Failed to submit story. Please try again.');
    } finally {
      setSubmitting(null);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadTitle.trim()) {
      setUploadError('Please enter a story title');
      return;
    }

    if (!uploadContent.trim() && !uploadFile) {
      setUploadError('Please provide story content');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('title', uploadTitle.trim());
      
      if (uploadFile) {
        formData.append('file', uploadFile);
      } else {
        formData.append('content', uploadContent.trim());
      }

      const response = await fetch('/api/user/stories/upload-competition', {
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
        alert('🎉 Story uploaded and submitted to competition successfully!');
        fetchCompetitionData();
      } else {
        setUploadError(data.error || 'Upload failed');
      }
    } catch (error) {
      setUploadError('Failed to upload story');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset previous errors
    setUploadError('');

    // Check file size first (5MB = 5 * 1024 * 1024 bytes)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      setUploadError(`File size too large. Maximum allowed size is 5MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`);
      event.target.value = ''; // Reset input
      return;
    }

    // Check file extension - allow common document formats
    const fileName = file.name.toLowerCase();
    const allowedExtensions = ['.txt', '.doc', '.docx', '.pdf', '.rtf', '.odt'];
    const fileExtension = '.' + fileName.split('.').pop();
    
    if (!allowedExtensions.includes(fileExtension)) {
      setUploadError(`File type not supported. Allowed formats: ${allowedExtensions.join(', ')}`);
      event.target.value = ''; // Reset input
      return;
    }

    // Check MIME types for common document formats
    const allowedMimeTypes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/rtf',
      'text/rtf',
      'application/vnd.oasis.opendocument.text'
    ];

    if (file.type && !allowedMimeTypes.includes(file.type)) {
      setUploadError(`Invalid file type. Please upload a valid document file.`);
      event.target.value = ''; // Reset input
      return;
    }

    // If all checks pass, set the file
    setUploadFile(file);
    
    // Auto-fill title if not provided
    if (!uploadTitle.trim()) {
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setUploadTitle(fileNameWithoutExt.replace(/[-_]/g, ' '));
    }
  };

  const showUserCertificate = (winnerData: any) => {
    setCertificateData(winnerData);
    setShowCertificate(true);
  };

  const getPodiumIcon = (position: number) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏆';
    }
  };

  const getPhaseInfo = (phase: string) => {
    switch (phase) {
      case 'submission':
        return {
          icon: <Upload className="w-6 h-6" />,
          color: 'text-green-400',
          bg: 'bg-green-600/20 border-green-500/30',
          text: 'Submissions Open'
        };
      case 'judging':
        return {
          icon: <Clock className="w-6 h-6" />,
          color: 'text-yellow-400',
          bg: 'bg-yellow-600/20 border-yellow-500/30',
          text: 'AI Judging in Progress'
        };
      case 'results':
        return {
          icon: <Trophy className="w-6 h-6" />,
          color: 'text-purple-400',
          bg: 'bg-purple-600/20 border-purple-500/30',
          text: 'Results Available'
        };
      default:
        return {
          icon: <Calendar className="w-6 h-6" />,
          color: 'text-gray-400',
          bg: 'bg-gray-600/20 border-gray-500/30',
          text: 'Competition Ended'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-lg text-white">Loading competitions...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8 pt-12"
        >
          <Link href="/children-dashboard" className="text-gray-100 hover:text-white transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 ">Writing Competitions</h1>
            <p className="text-gray-300 text-lg">Showcase your stories and compete with young writers worldwide!</p>
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-600/20 border border-red-500/30 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-400" size={20} />
              <span className="text-red-300">{error}</span>
            </div>
          </motion.div>
        )}

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-6 text-center">
            <FileText className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Free Entry</h3>
            <p className="text-blue-200 text-sm">
              Submit up to 3 stories per month for FREE! Competition participation is completely free.
            </p>
          </div>
          
          <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-6 text-center">
            <Trophy className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Publishing Fee</h3>
            <p className="text-green-200 text-sm">
              Optional $10 fee to publish your story in our Physical Book Anthology Collections.
            </p>
          </div>
          
          <div className="bg-purple-600/20 border border-purple-500/30 rounded-xl p-6 text-center">
            <Star className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">AI Judging</h3>
            <p className="text-purple-200 text-sm">
              Fair and consistent evaluation across 16+ categories by advanced AI system.
            </p>
          </div>
        </motion.div>

        {/* Current Competition */}
        {currentCompetition ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl p-8 text-white mb-8 shadow-xl border border-purple-500/30"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Trophy className="w-10 h-10 text-yellow-300" />
                <div>
                  <h2 className="text-3xl font-bold">
                    {currentCompetition.month} {currentCompetition.year} Competition
                  </h2>
                  <p className="text-purple-200">Monthly Writing Competition</p>
                </div>
              </div>
              
              <div className={`px-6 py-3 rounded-full border ${getPhaseInfo(currentCompetition.phase).bg} ${getPhaseInfo(currentCompetition.phase).color}`}>
                <div className="flex items-center gap-2">
                  {getPhaseInfo(currentCompetition.phase).icon}
                  <span className="font-bold">{getPhaseInfo(currentCompetition.phase).text}</span>
                </div>
              </div>
            </div>
            
            {/* Competition Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-700/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {currentCompetition.userStats ? 
                    `${currentCompetition.userStats.entriesUsed}/${currentCompetition.userStats.entriesLimit}` : 
                    '0/3'
                  }
                </div>
                <div className="text-sm text-purple-100">Your Entries</div>
              </div>
              
              <div className="bg-gray-700/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{currentCompetition.daysLeft}</div>
                <div className="text-sm text-purple-100">Days Left</div>
              </div>
              
              <div className="bg-gray-700/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">{currentCompetition.totalParticipants}</div>
                <div className="text-sm text-purple-100">Total Participants</div>
              </div>
              
              <div className="bg-gray-700/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{currentCompetition.totalSubmissions}</div>
                <div className="text-sm text-purple-100">Total Submissions</div>
              </div>
            </div>

            {/* Phase-specific Content */}
            {currentCompetition.phase === 'submission' && (
              <div className="bg-gray-700/10 rounded-lg p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Upload size={20} />
                  Submit Your Stories
                </h3>
                
                <div className="mb-6">
                  <button
                    onClick={() => setShowUploadModal(true)}
                    disabled={!currentCompetition.userStats?.canSubmit}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg font-bold transition-colors flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Upload New Story for Competition
                  </button>
                  {!currentCompetition.userStats?.canSubmit && (
                    <p className="text-yellow-300 text-sm mt-2">
                      You've reached your monthly submission limit (3 stories max)
                    </p>
                  )}
                </div>

                {eligibleStories.length > 0 ? (
                  <div>
                    <h4 className="text-lg font-bold mb-4 text-purple-200">Or submit existing published stories:</h4>
                    <div className="grid gap-4">
                      {eligibleStories.map((story) => (
                        <div key={story._id} className="flex items-center justify-between bg-gray-700/20 rounded-lg p-4">
                          <div className="flex-1">
                            <h4 className="font-bold text-white text-lg">{story.title}</h4>
                            <p className="text-purple-100">
                              {story.wordCount} words • Created {new Date(story.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => submitToCompetition(story._id)}
                            disabled={submitting === story._id || !currentCompetition.userStats?.canSubmit}
                            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-bold transition-colors flex items-center gap-2"
                          >
                            {submitting === story._id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Submitting...
                              </>
                            ) : (
                              <>
                                <Upload size={16} />
                                Submit
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-purple-100 text-lg mb-2">No eligible stories found</p>
                    <p className="text-purple-200">Upload a new story above to participate in the competition!</p>
                  </div>
                )}
              </div>
            )}

            {currentCompetition.phase === 'judging' && (
              <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-6 text-center">
                <Clock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-white font-bold text-xl mb-2">AI Judging in Progress</h3>
                <p className="text-gray-300">
                  Our advanced AI is evaluating all submissions across 16+ different categories.
                  Results will be announced soon!
                </p>
              </div>
            )}

            {/* Display Winners */}
            {currentCompetition.phase === 'results' && currentCompetition.winners && currentCompetition.winners.length > 0 && (
              <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-6">
                <h3 className="text-white font-bold text-2xl mb-6 text-center flex items-center justify-center gap-3">
                  <Crown className="text-yellow-400" />
                  Competition Results - Olympic Style Podium
                </h3>
                <div className="space-y-4">
                  {currentCompetition.winners.slice(0, 3).map((winner) => {
                    const isCurrentUser = session?.user?.id === winner.childId;
                    return (
                      <motion.div
                        key={winner.position}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: winner.position * 0.2 }}
                        className={`flex items-center justify-between p-6 rounded-xl border-2 ${
                          winner.position === 1
                            ? 'bg-yellow-600/20 border-yellow-500/30'
                            : winner.position === 2
                            ? 'bg-gray-400/20 border-gray-400/30'
                            : 'bg-orange-600/20 border-orange-500/30'
                        } ${isCurrentUser ? 'ring-2 ring-blue-400' : ''}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-5xl">
                            {getPodiumIcon(winner.position)}
                          </div>
                          <div>
                            <div className="text-white font-bold text-xl">
                              {winner.childName} {isCurrentUser && '(You!)'}
                            </div>
                            <div className="text-gray-300 text-lg">
                              "{winner.title}"
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold text-2xl">
                            {winner.score}%
                          </div>
                          <div className="text-gray-400">Final Score</div>
                          {isCurrentUser && (
                            <button
                              onClick={() => showUserCertificate({
                                childName: winner.childName,
                                position: winner.position,
                                title: winner.title,
                                score: winner.score,
                                month: currentCompetition.month,
                                year: currentCompetition.year
                              })}
                              className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                            >
                              <Download size={16} />
                              Get Certificate
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* User's Submitted Stories */}
            {currentCompetition.userStats?.userEntries && currentCompetition.userStats.userEntries.length > 0 && (
              <div className="bg-gray-700/10 rounded-lg p-6 mt-6">
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                  <CheckCircle className="text-green-400" />
                  Your Submitted Stories
                </h3>
                <div className="space-y-3">
                  {currentCompetition.userStats.userEntries.map((entry) => (
                    <div key={entry.storyId} className="flex items-center justify-between bg-gray-700/20 rounded-lg p-4">
                      <div>
                        <h4 className="font-bold text-white">{entry.title}</h4>
                        <p className="text-purple-100">
                          Submitted {new Date(entry.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {entry.score ? (
                          <div>
                            <div className="text-green-400 font-bold text-lg">{entry.score}%</div>
                            {entry.rank && (
                              <div className="text-gray-400 text-sm">Rank #{entry.rank}</div>
                            )}
                          </div>
                        ) : (
                          <div className="text-yellow-400 font-bold">
                            {currentCompetition.phase === 'submission' ? 'Submitted' : 'Judging...'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center bg-gray-800/60 backdrop-blur-xl border border-gray-600/30 rounded-2xl p-12 mb-8"
          >
            <Calendar className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-white mb-4">No Active Competition</h3>
            <p className="text-gray-300 text-lg">
              There's no active competition at the moment. Check back soon for the next monthly competition!
            </p>
          </motion.div>
        )}

        {/* Past Competitions */}
        {pastCompetitions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 border border-gray-600/40 rounded-xl p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Trophy className="text-yellow-400" />
              Past Competition Results
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastCompetitions.map((competition) => (
                <div key={competition._id} className="bg-gray-700/30 rounded-lg p-6 hover:bg-gray-700/40 transition-colors">
                  <h3 className="font-bold text-white text-xl mb-3">
                    {competition.month} {competition.year}
                  </h3>
                  <div className="text-gray-300 space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Participants:</span>
                      <span className="font-bold">{competition.totalParticipants}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Submissions:</span>
                      <span className="font-bold">{competition.totalSubmissions}</span>
                    </div>
                  </div>
                  {competition.winners && competition.winners.length > 0 && (
                    <div>
                      <h4 className="text-yellow-400 font-bold mb-2">Winners:</h4>
                      <div className="space-y-1">
                        {competition.winners.slice(0, 3).map((winner) => (
                          <div key={winner.position} className="text-sm text-gray-300 flex items-center gap-2">
                            <span className="text-lg">{getPodiumIcon(winner.position)}</span>
                            <span className="font-medium">{winner.childName}</span>
                            <span className="text-gray-400">({winner.score}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-600">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Upload Story for Competition</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-gray-300 font-medium mb-2">
                Story Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="Enter your story title..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                maxLength={100}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-300 font-medium mb-2">
                Upload Story File
              </label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  id="competition-file-upload"
                />
                <label htmlFor="competition-file-upload" className="cursor-pointer">
                  {uploadFile ? (
                    <div className="text-green-400">
                      <FileText className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-medium">{uploadFile.name}</p>
                      <p className="text-sm text-gray-400">
                        {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      <Upload className="w-8 h-8 mx-auto mb-2" />
                      <p>Click to upload your story document</p>
                      <p className="text-sm">PDF, DOCX, or TXT files only</p>
                      <p className="text-sm">Maximum size: 10MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-300 font-medium mb-2">
                Or paste your story content:
              </label>
              <textarea
                value={uploadContent}
                onChange={(e) => setUploadContent(e.target.value)}
                placeholder="Paste your story here..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 h-32 resize-none"
              />
            </div>

            <div className="mb-6 bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
              <h4 className="text-blue-400 font-medium mb-2">Competition Requirements:</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Story must be 100-2000 words</li>
                <li>• Original content only (no plagiarism)</li>
                <li>• Appropriate for young audiences</li>
                <li>• File formats: PDF, DOCX, or TXT files</li>
                <li>• Maximum file size: 10MB</li>
                <li>• Up to 3 submissions per month</li>
              </ul>
            </div>

            {uploadError && (
              <div className="mb-4 bg-red-600/20 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-red-400 flex-shrink-0" size={16} />
                  <span className="text-red-300 text-sm">{uploadError}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadError('');
                  setUploadFile(null);
                  setUploadTitle('');
                  setUploadContent('');
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFileUpload}
                disabled={uploading || (!uploadFile && !uploadContent.trim()) || !uploadTitle.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                {uploading ? 'Uploading...' : 'Upload & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {showCertificate && certificateData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Your Competition Certificate</h3>
              <button
                onClick={() => setShowCertificate(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <X size={24} />
              </button>
            </div>
            
            <DigitalCertificate 
              winnerData={certificateData}
              onDownload={() => {
                console.log('Certificate downloaded!');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}