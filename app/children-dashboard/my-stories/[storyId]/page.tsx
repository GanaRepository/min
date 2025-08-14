// app/children-dashboard/my-stories/[storyId]/page.tsx - COMPLETE UPDATE FOR MINTOONS REQUIREMENTS
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Eye,
  Edit,
  Award,
  BookOpen,
  Clock,
  Star,
  Trophy,
  Shield,
  AlertTriangle,
  CheckCircle,
  Brain,
  DollarSign,
  Download,
  Share2,
  XCircle,
  Sparkles,
  Upload,
  FileText,
  Calendar,
  BarChart3,
  Target,
  Palette,
  Heart,
  Zap,
  RefreshCw,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  ExternalLink,
  MessageSquare,
  TrendingUp,
  Lightbulb,
  Users,
  Crown,
  Medal,
} from 'lucide-react';

// ===== INTERFACES =====
interface Assessment {
  // Core scores
  overallScore: number;
  grammarScore: number;
  creativityScore: number;
  vocabularyScore: number;
  structureScore: number;
  characterDevelopmentScore: number;
  plotDevelopmentScore: number;
  
  // Additional details
  readingLevel: string;
  feedback: string;
  strengths: string[];
  improvements: string[];
  encouragement: string;
  educationalInsights: string;
  
  // Vocabulary analysis
  vocabularyUsed: string[];
  suggestedWords: string[];
  
  // Integrity analysis
  integrityAnalysis?: {
    originalityScore: number;
    plagiarismResult: {
      overallScore: number;
      riskLevel: string;
      violations: any[];
    };
    aiDetectionResult: {
      likelihood: string;
      confidence: number;
      indicators: any[];
    };
    integrityRisk: 'low' | 'medium' | 'high' | 'critical';
  };
  
  integrityStatus: {
    status: 'PASS' | 'WARNING' | 'FAIL';
    message: string;
  };
  
  // Recommendations
  recommendations?: {
    immediate: string[];
    longTerm: string[];
    practiceExercises: string[];
  };
  
  // Progress tracking
  progressTracking?: {
    improvementSince?: string;
    scoreChange?: number;
    strengthsGained?: string[];
    areasImproved?: string[];
  };
}

interface Turn {
  turnNumber: number;
  childInput: string;
  aiResponse: string;
  wordCount: number;
  timestamp: string;
}

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    role: string;
  } | null;
  createdAt: string;
  isPublic: boolean;
  category: string;
}

interface Story {
  _id: string;
  title: string;
  status: 'active' | 'completed' | 'flagged' | 'review' | 'paused';
  storyType: 'freestyle' | 'uploaded' | 'competition';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  
  // Progress tracking
  totalWords: number;
  childWords: number;
  currentTurn: number;
  maxTurns: number;
  apiCallsUsed: number;
  
  // Content
  content: string;
  aiOpening: string;
  turns: Turn[];
  
  // Publication & Competition
  isPublished: boolean;
  publishedAt?: string;
  competitionEligible: boolean;
  competitionEntries: Array<{
    competitionId: string;
    submittedAt: string;
    rank?: number;
    score?: number;
  }>;
  
  // Assessment
  isUploadedForAssessment: boolean;
  assessmentAttempts: number;
  assessment?: Assessment;
  
  // Story elements
  elements: {
    genre?: string;
    character?: string;
    setting?: string;
    theme?: string;
    mood?: string;
    tone?: string;
  };
  
  // Comments from mentors/admin
  comments: Comment[];
  
  // Metadata
  storyNumber: number;
  pausedAt?: string;
  resumedAt?: string;
}

export default function StoryDetailPage({
  params,
}: {
  params: { storyId: string };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ===== STATE =====
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'assessment' | 'content' | 'comments'>('overview');
  const [error, setError] = useState<string | null>(null);
  
  // Action states
  const [publishingStory, setPublishingStory] = useState(false);
  const [purchasingStory, setPurchasingStory] = useState(false);
  const [reassessingStory, setReassessingStory] = useState(false);
  const [deletingStory, setDeletingStory] = useState(false);
  
  // UI states
  const [showFullContent, setShowFullContent] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // ===== EFFECTS =====
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'child') {
      router.push('/login/child');
      return;
    }
    fetchStory();
  }, [session, status, router, params.storyId]);

  // ===== DATA FETCHING =====
  const fetchStory = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📖 Fetching story details for:', params.storyId);

      const response = await fetch(`/api/user/stories/${params.storyId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Story not found');
        } else {
          setError('Failed to load story');
        }
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        setStory(data.story);
        setNewTitle(data.story.title);
        console.log('✅ Story loaded:', data.story.title);
      } else {
        setError(data.error || 'Failed to load story');
      }
    } catch (error) {
      console.error('❌ Error fetching story:', error);
      setError('Failed to load story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ===== HELPER FUNCTIONS =====
  const getStoryTypeInfo = (story: Story) => {
    switch (story.storyType) {
      case 'competition':
        return {
          label: 'COMPETITION ENTRY',
          icon: Trophy,
          color: 'text-purple-400',
          bgColor: 'bg-purple-500/20',
          borderColor: 'border-purple-500/30'
        };
      case 'uploaded':
        return {
          label: 'UPLOADED FOR ASSESSMENT',
          icon: Upload,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/30'
        };
      default:
        return {
          label: 'FREESTYLE STORY',
          icon: Sparkles,
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/30'
        };
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-400', label: 'Completed' };
      case 'active':
        return { icon: Clock, color: 'text-blue-400', label: 'In Progress' };
      case 'paused':
        return { icon: Pause, color: 'text-yellow-400', label: 'Paused' };
      case 'flagged':
        return { icon: XCircle, color: 'text-red-400', label: 'Flagged' };
      case 'review':
        return { icon: AlertTriangle, color: 'text-yellow-400', label: 'Under Review' };
      default:
        return { icon: FileText, color: 'text-gray-400', label: 'Unknown' };
    }
  };

  const getIntegrityIcon = (integrityRisk?: string) => {
    switch (integrityRisk) {
      case 'low':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Shield className="w-5 h-5 text-gray-400" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-400" />;
      default:
        return <Trophy className="w-6 h-6 text-purple-400" />;
    }
  };

  // ===== STORY ACTIONS =====
  const handlePublishStory = async () => {
    if (!story) return;
    
    setPublishingStory(true);
    
    try {
      const response = await fetch('/api/stories/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: story._id })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('🎉 Story published to community showcase!');
        fetchStory(); // Refresh data
      } else {
        throw new Error(data.error || 'Failed to publish story');
      }
    } catch (error) {
      console.error('❌ Publication error:', error);
      alert('Failed to publish story. Please try again.');
    } finally {
      setPublishingStory(false);
    }
  };

  const handlePurchaseStory = async () => {
    if (!story || !session?.user?.id) return;
    
    setPurchasingStory(true);
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: 'story_purchase',
          storyId: story._id,
          userId: session.user.id
        })
      });

      const data = await response.json();
      
      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('❌ Purchase error:', error);
      alert('Failed to start purchase process. Please try again.');
    } finally {
      setPurchasingStory(false);
    }
  };

  const handleReassessStory = async () => {
    if (!story) return;
    
    setReassessingStory(true);
    
    try {
      const response = await fetch(`/api/user/stories/${story._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request_reassessment' })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Reassessment requested! Your story will be re-evaluated.');
        fetchStory(); // Refresh data
      } else {
        throw new Error(data.error || 'Failed to request reassessment');
      }
    } catch (error) {
      console.error('❌ Reassessment error:', error);
      alert('Failed to request reassessment. Please try again.');
    } finally {
      setReassessingStory(false);
    }
  };

  const handleUpdateTitle = async () => {
    if (!story || !newTitle.trim() || newTitle.trim() === story.title) {
      setEditingTitle(false);
      setNewTitle(story?.title || '');
      return;
    }
    
    try {
      const response = await fetch(`/api/user/stories/${story._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim() })
      });

      const data = await response.json();
      
      if (data.success) {
        setStory(prev => prev ? { ...prev, title: newTitle.trim() } : null);
        setEditingTitle(false);
      } else {
        throw new Error(data.error || 'Failed to update title');
      }
    } catch (error) {
      console.error('❌ Title update error:', error);
      alert('Failed to update title. Please try again.');
      setNewTitle(story.title);
      setEditingTitle(false);
    }
  };

  const handleDeleteStory = async () => {
    if (!story || !confirm(`Are you sure you want to delete "${story.title}"? This action cannot be undone.`)) {
      return;
    }
    
    setDeletingStory(true);
    
    try {
      const response = await fetch(`/api/user/stories/${story._id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Story deleted successfully');
        router.push('/children-dashboard/my-stories');
      } else {
        throw new Error(data.error || 'Failed to delete story');
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      alert('Failed to delete story. Please try again.');
    } finally {
      setDeletingStory(false);
    }
  };

  const handleContinueWriting = () => {
    if (!story) return;
    router.push(`/children-dashboard/story/${story._id}`);
  };

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          Loading story details...
        </div>
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (error || !story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Story Not Found</h2>
          <p className="text-gray-300 mb-6">{error || 'The story you\'re looking for doesn\'t exist or you don\'t have access to it.'}</p>
          <Link
            href="/children-dashboard/my-stories"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back to My Stories
          </Link>
        </div>
      </div>
    );
  }

  const typeInfo = getStoryTypeInfo(story);
  const statusInfo = getStatusInfo(story.status);

  // ===== MAIN RENDER =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 py-20">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* ===== HEADER ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push('/children-dashboard/my-stories')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to My Stories
          </button>

          {/* Story Type Badge */}
          <div className="flex justify-center mb-6">
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${typeInfo.bgColor} ${typeInfo.borderColor} border`}>
              <typeInfo.icon size={20} className={typeInfo.color} />
              <span className={`font-bold text-lg ${typeInfo.color}`}>
                {typeInfo.label}
              </span>
            </div>
          </div>

          {/* Title Section */}
          <div className="text-center mb-8">
            {editingTitle ? (
              <div className="max-w-2xl mx-auto">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onBlur={handleUpdateTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdateTitle();
                    if (e.key === 'Escape') {
                      setEditingTitle(false);
                      setNewTitle(story.title);
                    }
                  }}
                  autoFocus
                  className="w-full text-4xl font-bold text-white bg-transparent border-b-2 border-blue-400 focus:outline-none text-center"
                  maxLength={100}
                />
              </div>
            ) : (
              <div className="group cursor-pointer" onClick={() => setEditingTitle(true)}>
                <h1 className="text-4xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                  {story.title}
                  <Edit className="w-6 h-6 inline-block ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h1>
              </div>
            )}
            
            {/* Story Metadata */}
            <div className="flex items-center justify-center gap-6 text-gray-300 mb-6 flex-wrap">
              <span className="flex items-center gap-1">
                <FileText size={16} />
                Story #{story.storyNumber}
              </span>
              <span className="flex items-center gap-1">
                <BarChart3 size={16} />
                {story.totalWords} words
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={16} />
                {new Date(story.createdAt).toLocaleDateString()}
              </span>
              <div className="flex items-center gap-2">
                <statusInfo.icon className={`w-4 h-4 ${statusInfo.color}`} />
                <span className={statusInfo.color}>{statusInfo.label}</span>
              </div>
            </div>

            {/* Competition Entries */}
            {story.competitionEntries.length > 0 && (
              <div className="flex justify-center mb-6">
                <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
                  <h4 className="font-medium text-purple-300 mb-2">Competition History</h4>
                  <div className="space-y-2">
                    {story.competitionEntries.map((entry, index) => (
                      <div key={index} className="flex items-center gap-3">
                        {entry.rank && getRankIcon(entry.rank)}
                        <div>
                          <div className="text-white font-medium">
                            Submitted: {new Date(entry.submittedAt).toLocaleDateString()}
                          </div>
                          {entry.rank && (
                            <div className="text-yellow-400 text-sm">
                              Rank: #{entry.rank} {entry.score && `(${entry.score.toFixed(1)}%)`}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ===== TAB NAVIGATION ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex justify-center">
            <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-2 flex gap-2">
              {[
                { id: 'overview', label: 'Overview', icon: Eye },
                { id: 'assessment', label: 'Assessment', icon: Brain },
                { id: 'content', label: 'Content', icon: BookOpen },
                { id: 'comments', label: 'Comments', icon: MessageSquare },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 rounded-lg transition-all flex items-center gap-2 font-medium ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                  {tab.id === 'comments' && story.comments.length > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 ml-1">
                      {story.comments.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ===== TAB CONTENT ===== */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Story Stats */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Progress Card */}
                <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    Story Progress
                  </h3>
                  
                  <div className="space-y-4">
                    {story.storyType === 'freestyle' && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Turns Complete:</span>
                          <span className="text-white">{story.currentTurn - 1} / {story.maxTurns}</span>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-2">
                          <div
                            className="bg-blue-400 h-2 rounded-full transition-all"
                            style={{ width: `${((story.currentTurn - 1) / story.maxTurns) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Words Written:</span>
                        <span className="text-white">{story.childWords} / {story.totalWords}</span>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-2">
                        <div
                          className="bg-green-400 h-2 rounded-full transition-all"
                          style={{ width: `${story.totalWords > 0 ? (story.childWords / story.totalWords) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    
                    {story.storyType === 'freestyle' && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">AI Calls Used:</span>
                          <span className="text-white">{story.apiCallsUsed} / {story.maxTurns}</span>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-2">
                          <div
                            className="bg-purple-400 h-2 rounded-full transition-all"
                            style={{ width: `${(story.apiCallsUsed / story.maxTurns) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Continue Writing Button */}
                  {story.status === 'active' && story.storyType === 'freestyle' && (
                    <button
                      onClick={handleContinueWriting}
                      className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <Play size={18} />
                      Continue Writing
                    </button>
                  )}
                </div>

                {/* Assessment Overview */}
                {story.assessment && (
                  <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-green-400" />
                      Assessment Score
                    </h3>
                    
                    <div className="text-center mb-6">
                      <div className={`text-4xl font-bold ${getScoreColor(story.assessment.overallScore)} mb-2`}>
                        {story.assessment.overallScore}%
                      </div>
                      <div className="text-gray-400">Overall Score</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className={`text-xl font-semibold ${getScoreColor(story.assessment.grammarScore)}`}>
                          {story.assessment.grammarScore}%
                        </div>
                        <div className="text-xs text-gray-400">Grammar</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-xl font-semibold ${getScoreColor(story.assessment.creativityScore)}`}>
                          {story.assessment.creativityScore}%
                        </div>
                        <div className="text-xs text-gray-400">Creativity</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-xl font-semibold ${getScoreColor(story.assessment.vocabularyScore)}`}>
                          {story.assessment.vocabularyScore}%
                        </div>
                        <div className="text-xs text-gray-400">Vocabulary</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-xl font-semibold ${getScoreColor(story.assessment.structureScore)}`}>
                          {story.assessment.structureScore}%
                        </div>
                        <div className="text-xs text-gray-400">Structure</div>
                      </div>
                    </div>

                    {/* Integrity Status */}
                    {story.assessment.integrityAnalysis && (
                      <div className="flex items-center justify-center gap-2 p-3 bg-gray-700/30 rounded-lg">
                        {getIntegrityIcon(story.assessment.integrityAnalysis.integrityRisk)}
                        <span className="text-sm font-medium text-white">
                          Integrity: {story.assessment.integrityAnalysis.integrityRisk.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions Card */}
                <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Actions
                  </h3>
                  
                  <div className="space-y-3">
                    {/* Publish Story */}
                    {story.status === 'completed' && !story.isPublished && (
                      <button
                        onClick={handlePublishStory}
                        disabled={publishingStory}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                      >
                        {publishingStory ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Publishing...
                          </>
                        ) : (
                          <>
                            <Star size={18} />
                            Publish Free
                          </>
                        )}
                      </button>
                    )}

                    {/* Purchase Story */}
                    {story.status === 'completed' && (
                      <button
                        onClick={handlePurchaseStory}
                        disabled={purchasingStory}
                        className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                      >
                        {purchasingStory ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <DollarSign size={18} />
                            Purchase $10
                          </>
                        )}
                      </button>
                    )}

                    {/* Reassess Story */}
                    {story.assessment && story.assessmentAttempts < 5 && (
                      <button
                        onClick={handleReassessStory}
                        disabled={reassessingStory}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                      >
                        {reassessingStory ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Requesting...
                          </>
                        ) : (
                          <>
                            <RefreshCw size={18} />
                            Reassess ({story.assessmentAttempts}/5)
                          </>
                        )}
                      </button>
                    )}

                    {/* Delete Story */}
                    {!story.isPublished && story.competitionEntries.length === 0 && (
                      <button
                        onClick={handleDeleteStory}
                        disabled={deletingStory}
                        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                      >
                        {deletingStory ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 size={18} />
                            Delete Story
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Story Details */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Story Elements */}
                {Object.keys(story.elements).length > 0 && (
                  <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Palette className="w-5 h-5 text-purple-400" />
                      Story Elements
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(story.elements).map(([key, value]) => (
                        value && (
                          <div key={key} className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                            <div className="text-sm text-purple-300 capitalize font-medium">{key}</div>
                            <div className="text-white">{value}</div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Information */}
                <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    Story Timeline
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Created:</span>
                      <span className="text-white">{new Date(story.createdAt).toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Last Updated:</span>
                      <span className="text-white">{new Date(story.updatedAt).toLocaleString()}</span>
                    </div>
                    
                    {story.completedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Completed:</span>
                        <span className="text-white">{new Date(story.completedAt).toLocaleString()}</span>
                      </div>
                    )}
                    
                    {story.publishedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Published:</span>
                        <span className="text-white">{new Date(story.publishedAt).toLocaleString()}</span>
                      </div>
                    )}
                    
                    {story.pausedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Paused:</span>
                        <span className="text-white">{new Date(story.pausedAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">{story.totalWords}</div>
                    <div className="text-sm text-gray-400">Total Words</div>
                  </div>
                  
                  <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">{story.childWords}</div>
                    <div className="text-sm text-gray-400">Your Words</div>
                  </div>
                  
                  <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">{story.turns.length}</div>
                    <div className="text-sm text-gray-400">Writing Turns</div>
                  </div>
                  
                  <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">{story.assessmentAttempts}</div>
                    <div className="text-sm text-gray-400">Assessments</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assessment' && story.assessment && (
            <div className="space-y-8">
              
              {/* Overall Assessment */}
              <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-8">
                <div className="text-center mb-8">
                  <div className={`text-6xl font-bold ${getScoreColor(story.assessment.overallScore)} mb-4`}>
                    {story.assessment.overallScore}%
                  </div>
                  <h2 className="text-2xl font-semibold text-white">Overall Assessment Score</h2>
                  <p className="text-gray-400 mt-2">Reading Level: Grade {story.assessment.readingLevel}</p>
                </div>

                {/* Category Scores */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  {[
                    { key: 'grammarScore', label: 'Grammar', icon: Target },
                    { key: 'creativityScore', label: 'Creativity', icon: Sparkles },
                    { key: 'vocabularyScore', label: 'Vocabulary', icon: BookOpen },
                    { key: 'structureScore', label: 'Structure', icon: BarChart3 },
                    { key: 'characterDevelopmentScore', label: 'Characters', icon: Users },
                    { key: 'plotDevelopmentScore', label: 'Plot', icon: TrendingUp },
                  ].map(({ key, label, icon: Icon }) => {
                    const score = story.assessment![key as keyof Assessment] as number;
                    return (
                      <div key={key} className="text-center">
                        <Icon className={`w-8 h-8 mx-auto mb-2 ${getScoreColor(score)}`} />
                        <div className={`text-2xl font-bold ${getScoreColor(score)} mb-1`}>
                          {score}%
                        </div>
                        <div className="text-sm text-gray-400">{label}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Integrity Analysis */}
                {story.assessment.integrityAnalysis && (
                  <div className="bg-gray-700/30 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-400" />
                      Integrity Analysis
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400 mb-1">
                          {story.assessment.integrityAnalysis.originalityScore}%
                        </div>
                        <div className="text-sm text-gray-400">Originality</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400 mb-1">
                          {story.assessment.integrityAnalysis.plagiarismResult.overallScore}%
                        </div>
                        <div className="text-sm text-gray-400">Plagiarism Check</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          {getIntegrityIcon(story.assessment.integrityAnalysis.integrityRisk)}
                          <span className="font-bold text-white capitalize">
                            {story.assessment.integrityAnalysis.integrityRisk}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400">Risk Level</div>
                      </div>
                    </div>

                    <div className={`mt-4 p-4 rounded-lg ${
                      story.assessment.integrityStatus.status === 'PASS' 
                        ? 'bg-green-500/20 border border-green-500/30'
                        : story.assessment.integrityStatus.status === 'WARNING'
                        ? 'bg-yellow-500/20 border border-yellow-500/30'
                        : 'bg-red-500/20 border border-red-500/30'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {story.assessment.integrityStatus.status === 'PASS' && (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        )}
                        {story.assessment.integrityStatus.status === 'WARNING' && (
                          <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        )}
                        {story.assessment.integrityStatus.status === 'FAIL' && (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                        <span className="font-semibold text-white">
                          {story.assessment.integrityStatus.status}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">
                        {story.assessment.integrityStatus.message}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Detailed Feedback */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Feedback & Insights */}
                <div className="space-y-6">
                  {story.assessment.feedback && (
                    <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-400" />
                        Teacher Feedback
                      </h3>
                      <p className="text-gray-300 leading-relaxed">{story.assessment.feedback}</p>
                    </div>
                  )}

                  {story.assessment.educationalInsights && (
                    <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                        Educational Insights
                      </h3>
                      <p className="text-gray-300 leading-relaxed">{story.assessment.educationalInsights}</p>
                    </div>
                  )}

                  {story.assessment.encouragement && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-green-300 mb-4 flex items-center gap-2">
                        <Heart className="w-5 h-5" />
                        Encouragement
                      </h3>
                      <p className="text-green-100 leading-relaxed">{story.assessment.encouragement}</p>
                    </div>
                  )}
                </div>

                {/* Strengths & Improvements */}
                <div className="space-y-6">
                  {story.assessment.strengths.length > 0 && (
                    <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        Strengths
                      </h3>
                      <div className="space-y-2">
                        {story.assessment.strengths.map((strength, index) => (
                          <div key={index} className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                            <span className="text-green-300">✓ {strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {story.assessment.improvements.length > 0 && (
                    <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-orange-400" />
                        Areas for Improvement
                      </h3>
                      <div className="space-y-2">
                        {story.assessment.improvements.map((improvement, index) => (
                          <div key={index} className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                            <span className="text-orange-300">→ {improvement}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vocabulary Analysis */}
                  {(story.assessment.vocabularyUsed.length > 0 || story.assessment.suggestedWords.length > 0) && (
                    <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-purple-400" />
                        Vocabulary Analysis
                      </h3>
                      
                      {story.assessment.vocabularyUsed.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-purple-300 mb-2">Great Words You Used:</h4>
                          <div className="flex flex-wrap gap-2">
                            {story.assessment.vocabularyUsed.slice(0, 10).map((word, index) => (
                              <span key={index} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-sm">
                                {word}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {story.assessment.suggestedWords.length > 0 && (
                        <div>
                          <h4 className="font-medium text-blue-300 mb-2">Suggested Words to Try:</h4>
                          <div className="flex flex-wrap gap-2">
                            {story.assessment.suggestedWords.slice(0, 10).map((word, index) => (
                              <span key={index} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-sm">
                                {word}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendations */}
              {story.assessment.recommendations && (
                <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-400" />
                    Personalized Recommendations
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {story.assessment.recommendations.immediate.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-red-300 mb-3">Immediate Actions</h4>
                        <div className="space-y-2">
                          {story.assessment.recommendations.immediate.map((rec, index) => (
                            <div key={index} className="bg-red-500/10 border border-red-500/30 rounded p-3 text-red-300 text-sm">
                              {rec}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {story.assessment.recommendations.longTerm.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-blue-300 mb-3">Long-term Goals</h4>
                        <div className="space-y-2">
                          {story.assessment.recommendations.longTerm.map((rec, index) => (
                            <div key={index} className="bg-blue-500/10 border border-blue-500/30 rounded p-3 text-blue-300 text-sm">
                              {rec}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {story.assessment.recommendations.practiceExercises.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-green-300 mb-3">Practice Exercises</h4>
                        <div className="space-y-2">
                          {story.assessment.recommendations.practiceExercises.map((rec, index) => (
                            <div key={index} className="bg-green-500/10 border border-green-500/30 rounded p-3 text-green-300 text-sm">
                              {rec}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'content' && (
            <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  Full Story Content
                </h3>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowFullContent(!showFullContent)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
                  >
                    <Eye size={16} />
                    {showFullContent ? 'Hide' : 'Show'} Content
                  </button>
                  
                  <button
                    onClick={() => {
                      const element = document.createElement('a');
                      const file = new Blob([story.content], { type: 'text/plain' });
                      element.href = URL.createObjectURL(file);
                      element.download = `${story.title}.txt`;
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
                  >
                    <Download size={16} />
                    Download
                  </button>
                </div>
              </div>

              {showFullContent ? (
                <div className="bg-gray-900/50 rounded-lg p-6 max-h-96 overflow-y-auto">
                  <div className="prose prose-invert max-w-none">
                    {story.content.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="text-gray-300 leading-relaxed mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Click "Show Content" to view your full story</p>
                </div>
              )}

              {/* Turn-by-turn breakdown for freestyle stories */}
              {story.storyType === 'freestyle' && story.turns.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-white mb-4">Writing Timeline</h4>
                  <div className="space-y-4">
                    {story.turns.map((turn, index) => (
                      <div key={index} className="bg-gray-700/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium">
                            Turn {turn.turnNumber}
                          </span>
                          <span className="text-gray-400 text-sm">
                            {turn.wordCount} words • {new Date(turn.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {turn.childInput && (
                          <div className="mb-3">
                            <div className="text-green-300 text-sm font-medium mb-1">Your Writing:</div>
                            <p className="text-gray-300 text-sm bg-green-500/10 border border-green-500/20 rounded p-3">
                              {turn.childInput}
                            </p>
                          </div>
                        )}
                        
                        {turn.aiResponse && (
                          <div>
                            <div className="text-purple-300 text-sm font-medium mb-1">AI Response:</div>
                            <p className="text-gray-300 text-sm bg-purple-500/10 border border-purple-500/20 rounded p-3">
                              {turn.aiResponse}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                Mentor & Teacher Comments
              </h3>
              
              {story.comments.length > 0 ? (
                <div className="space-y-4">
                  {story.comments.map((comment) => (
                    <div key={comment._id} className="bg-gray-700/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${
                          comment.author?.role === 'admin' ? 'bg-red-400' :
                          comment.author?.role === 'mentor' ? 'bg-blue-400' : 'bg-gray-400'
                        }`} />
                        <span className="font-medium text-white">
                          {comment.author?.name || 'Anonymous'}
                        </span>
                        <span className="text-xs text-gray-400 capitalize">
                          {comment.author?.role || 'Unknown'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-300">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No comments yet</p>
                  <p className="text-gray-500 text-sm">
                    Mentors and teachers can leave helpful feedback on your story
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}