// app/children-dashboard/my-stories/[storyId]/page.tsx - COMPLETE UPDATED VERSION
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { DownloadStoryButtons } from '@/components/DownloadStoryButtons';

interface Assessment {
  overallScore: number;
  grammarScore: number;
  creativityScore: number;
  vocabularyScore: number;
  structureScore: number;
  characterDevelopmentScore: number;
  plotDevelopmentScore: number;
  readingLevel: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  educationalInsights: string;
  integrityAnalysis?: {
    originalityScore: number;
    plagiarismScore: number;
    aiDetectionScore: number;
    integrityRisk: 'low' | 'medium' | 'high' | 'critical';
    plagiarismResult?: {
      score: number;
      riskLevel: string;
    };
    aiDetectionResult?: {
      score: number;
      likelihood: string;
    };
  };
  recommendations?: {
    immediate: string[];
    longTerm: string[];
    practiceExercises: string[];
  };
  progressTracking?: {
    improvementSince?: string;
    scoreChange?: number;
    strengthsGained?: string[];
    areasImproved?: string[];
  };
}

interface Story {
  _id: string;
  title: string;
  storyNumber: number;
  status: string;
  totalWords: number;
  childWords: number;
  isUploadedForAssessment: boolean;
  isPublished: boolean;
  competitionEligible: boolean;
  createdAt: string;
  updatedAt: string;
  elements?: {
    genre?: string;
    character?: string;
    setting?: string;
    theme?: string;
    mood?: string;
    tone?: string;
  };
  assessment?: Assessment;
  content?: string;
  competitionEntries?: Array<{
    competitionId: string;
    submittedAt: string;
    rank?: number;
    score?: number;
  }>;
}

export default function StoryDetailPage({
  params,
}: {
  params: { storyId: string };
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [publishingStory, setPublishingStory] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'assessment' | 'content'>('overview');

  useEffect(() => {
    if (!session) {
      router.push('/login/child');
      return;
    }
    // If session exists, route to /create-stories if currently on /login/child
    if (window.location.pathname === '/login/child') {
      router.push('/create-stories');
      return;
    }
    fetchStory();
  }, [session, params.storyId]);

  const fetchStory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user/stories/${params.storyId}`);

      if (response.ok) {
        const data = await response.json();
        setStory(data.story);
      } else {
        throw new Error('Story not found');
      }
    } catch (error) {
      console.error('Error fetching story:', error);
      router.push('/children-dashboard/my-stories');
    } finally {
      setLoading(false);
    }
  };

  const getStoryTypeInfo = (story: Story) => {
    if (story.competitionEntries && story.competitionEntries.length > 0) {
      return { 
        label: "COMPETITION STORY", 
        icon: Trophy, 
        color: "from-purple-500 to-pink-500",
        bgColor: "bg-purple-500/20",
        borderColor: "border-purple-500/30",
        textColor: "text-purple-300"
      };
    }
    if (story.isUploadedForAssessment) {
      return { 
        label: "UPLOADED STORY", 
        icon: Upload, 
        color: "from-blue-500 to-cyan-500",
        bgColor: "bg-blue-500/20",
        borderColor: "border-blue-500/30",
        textColor: "text-blue-300"
      };
    }
    return { 
      label: "FREESTYLE STORY", 
      icon: Sparkles, 
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/20",
      borderColor: "border-green-500/30",
      textColor: "text-green-300"
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getIntegrityIcon = (risk: string) => {
    switch (risk) {
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

  const getIntegrityColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const handlePublishStory = async () => {
    if (!session?.user?.id || !story) return;
    
    setPublishingStory(true);
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productType: 'story_publication',
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
      console.error('Error initiating publication:', error);
      alert('Failed to start publication process. Please try again.');
    } finally {
      setPublishingStory(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading story...</div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-white text-2xl mb-4">Story Not Found</h2>
          <button
            onClick={() => router.push('/children-dashboard/my-stories')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Back to Stories
          </button>
        </div>
      </div>
    );
  }

  const storyType = getStoryTypeInfo(story);
  const TypeIcon = storyType.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 py-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
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

          <div className="text-center mb-8">
            {/* Story Type Badge */}
            <div className="flex justify-center mb-4">
              <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${storyType.bgColor} ${storyType.borderColor} border`}>
                <TypeIcon size={20} className={storyType.textColor} />
                <span className={`font-bold text-lg ${storyType.textColor}`}>
                  {storyType.label}
                </span>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-white mb-2">
              {story.title}
            </h1>
            
            <div className="flex items-center justify-center gap-6 text-gray-300 mb-6">
              <span className="flex items-center gap-1">
                <FileText size={16} />
                Story #{story.storyNumber}
              </span>
              <span className="flex items-center gap-1">
                <BarChart3 size={16} />
                {story.childWords} words
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={16} />
                {new Date(story.createdAt).toLocaleDateString()}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                  story.status === 'completed'
                    ? 'bg-green-600/20 text-green-300 border border-green-500/30'
                    : story.status === 'active'
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                      : 'bg-gray-600/20 text-gray-300 border border-gray-500/30'
                }`}
              >
                {story.status}
              </span>
            </div>

            {/* Status Badges */}
            <div className="flex items-center justify-center gap-3 mb-6">
              {story.isPublished && (
                <span className="bg-green-500/20 text-green-300 px-4 py-2 rounded-lg text-sm font-medium border border-green-500/30 flex items-center gap-2">
                  <BookOpen size={16} />
                  Published
                </span>
              )}
              {story.competitionEntries && story.competitionEntries.length > 0 && (
                <span className="bg-purple-500/20 text-purple-300 px-4 py-2 rounded-lg text-sm font-medium border border-purple-500/30 flex items-center gap-2">
                  <Trophy size={16} />
                  In Competition
                </span>
              )}
              {story.assessment?.integrityAnalysis && (
                <span className={`px-4 py-2 rounded-lg text-sm font-medium border flex items-center gap-2 ${
                  story.assessment.integrityAnalysis.integrityRisk === 'low' 
                    ? 'bg-green-500/20 text-green-300 border-green-500/30'
                    : story.assessment.integrityAnalysis.integrityRisk === 'medium'
                      ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                      : story.assessment.integrityAnalysis.integrityRisk === 'high'
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                        : 'bg-red-500/20 text-red-300 border-red-500/30'
                }`}>
                  {getIntegrityIcon(story.assessment.integrityAnalysis.integrityRisk)}
                  Integrity: {story.assessment.integrityAnalysis.integrityRisk}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4">
              {!story.isPublished && story.status === 'completed' && (
                <button
                  onClick={handlePublishStory}
                  disabled={publishingStory}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-green-400 disabled:to-emerald-400 text-white px-8 py-3 rounded-xl font-bold text-lg flex items-center gap-2 transition-all shadow-lg"
                >
                  {publishingStory ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Publishing...
                    </>
                  ) : (
                    <>
                      <DollarSign size={20} />
                      Publish for $10
                    </>
                  )}
                </button>
              )}
              
              {story.status === 'active' && (
                <button
                  onClick={() => router.push(`/children-dashboard/story/${story._id}`)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-bold text-lg flex items-center gap-2 transition-all shadow-lg"
                >
                  <Edit size={20} />
                  Continue Writing
                </button>
              )}

       {/* Download Buttons for Word/PDF */}
            <div className="flex items-center justify-center mt-8">
              <DownloadStoryButtons
                story={{
                  title: story.title,
                  content: story.content ?? '',
                  totalWords: story.totalWords,
                  authorName: session?.user?.name || 'Unknown',
                  publishedAt: story.updatedAt || story.createdAt || '',
                  elements: {
                    genre: story.elements?.genre ?? '',
                    character: story.elements?.character ?? '',
                    setting: story.elements?.setting ?? '',
                    theme: story.elements?.theme ?? '',
                    mood: story.elements?.mood ?? '',
                    tone: story.elements?.tone ?? '',
                  },
                  scores: story.assessment
                    ? {
                        grammar: story.assessment.grammarScore,
                        creativity: story.assessment.creativityScore,
                        overall: story.assessment.overallScore,
                      }
                    : undefined,
                }}
              />
            </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex justify-center">
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-1 inline-flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'overview'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                Overview
              </button>
              {story.assessment && (
                <button
                  onClick={() => setActiveTab('assessment')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    activeTab === 'assessment'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  Assessment
                </button>
              )}
              <button
                onClick={() => setActiveTab('content')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'content'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                Content
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Story Elements */}
              {story.elements && (
                <div className="lg:col-span-2">
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Sparkles className="text-purple-400" />
                      Story Elements
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(story.elements).map(([key, value]) => (
                        <div key={key} className="bg-gray-700/30 rounded-lg p-3">
                          <div className="text-sm text-gray-400 capitalize font-medium mb-1">{key}</div>
                          <div className="text-white">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Story Stats */}
              <div>
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="text-blue-400" />
                    Statistics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Total Words</span>
                      <span className="text-white font-bold">{story.totalWords}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Your Words</span>
                      <span className="text-white font-bold">{story.childWords}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Created</span>
                      <span className="text-white font-bold">{new Date(story.createdAt).toLocaleDateString()}</span>
                    </div>
                    {story.assessment && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Overall Score</span>
                        <span className={`font-bold ${getScoreColor(story.assessment.overallScore)}`}>
                          {story.assessment.overallScore}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Competition Info */}
                {story.competitionEntries && story.competitionEntries.length > 0 && (
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mt-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Trophy className="text-purple-400" />
                      Competition Status
                    </h3>
                    <div className="space-y-3">
                      {story.competitionEntries.map((entry, index) => (
                        <div key={index} className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                          <div className="text-sm text-purple-300 mb-1">
                            Submitted: {new Date(entry.submittedAt).toLocaleDateString()}
                          </div>
                          {entry.rank && (
                            <div className="text-lg font-bold text-purple-300">
                              Rank: #{entry.rank}
                            </div>
                          )}
                          {entry.score && (
                            <div className="text-purple-300">
                              Score: {entry.score}%
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'assessment' && story.assessment && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Assessment Scores */}
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Brain className="text-purple-400" />
                  Assessment Scores
                </h3>
                
                {/* Overall Score */}
                <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-white">Overall Score</span>
                    <span className={`text-3xl font-bold ${getScoreColor(story.assessment.overallScore)}`}>
                      {story.assessment.overallScore}%
                    </span>
                  </div>
                </div>

                {/* Category Scores */}
                <div className="space-y-4">
                  {[
                    { label: 'Grammar', score: story.assessment.grammarScore },
                    { label: 'Creativity', score: story.assessment.creativityScore },
                    { label: 'Vocabulary', score: story.assessment.vocabularyScore },
                    { label: 'Structure', score: story.assessment.structureScore },
                    { label: 'Character Development', score: story.assessment.characterDevelopmentScore },
                    { label: 'Plot Development', score: story.assessment.plotDevelopmentScore },
                  ].map(({ label, score }) => (
                    <div key={label} className="flex justify-between items-center py-2">
                      <span className="text-gray-300">{label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              score >= 90 ? 'bg-green-400' :
                              score >= 80 ? 'bg-blue-400' :
                              score >= 70 ? 'bg-yellow-400' : 'bg-orange-400'
                            }`}
                            style={{ width: `${score}%` }}
                          ></div>
                        </div>
                        <span className={`font-bold ${getScoreColor(score)}`}>
                          {score}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Integrity Analysis */}
              {story.assessment.integrityAnalysis && (
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Shield className="text-green-400" />
                    Integrity Analysis
                  </h3>
                  
                  <div className="space-y-4">
                    <div className={`border rounded-lg p-4 ${
                      story.assessment.integrityAnalysis.integrityRisk === 'low' 
                        ? 'bg-green-500/10 border-green-500/30'
                        : story.assessment.integrityAnalysis.integrityRisk === 'medium'
                          ? 'bg-yellow-500/10 border-yellow-500/30'
                          : story.assessment.integrityAnalysis.integrityRisk === 'high'
                            ? 'bg-orange-500/10 border-orange-500/30'
                            : 'bg-red-500/10 border-red-500/30'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {getIntegrityIcon(story.assessment.integrityAnalysis.integrityRisk)}
                        <span className={`font-bold ${getIntegrityColor(story.assessment.integrityAnalysis.integrityRisk)}`}>
                          Risk Level: {(story.assessment.integrityAnalysis?.integrityRisk ? story.assessment.integrityAnalysis.integrityRisk.toUpperCase() : 'UNKNOWN')}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-1">Originality Score</div>
                        <div className="text-2xl font-bold text-green-400">
                          {story.assessment.integrityAnalysis.originalityScore}%
                        </div>
                      </div>
                      
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-1">AI Detection Score</div>
                        <div className="text-2xl font-bold text-blue-400">
                          {story.assessment.integrityAnalysis.aiDetectionScore}%
                        </div>
                      </div>
                    </div>

                    {story.assessment.integrityAnalysis.plagiarismResult && (
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-2">Plagiarism Analysis</div>
                        <div className="text-white font-medium">
                          Score: {story.assessment.integrityAnalysis.plagiarismResult.score}%
                        </div>
                        <div className="text-gray-300">
                          Risk: {story.assessment.integrityAnalysis.plagiarismResult.riskLevel}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Feedback Section */}
              <div className="lg:col-span-2 bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Award className="text-yellow-400" />
                  Detailed Feedback
                </h3>
                
                <div className="space-y-6">
                  {/* Main Feedback */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Teacher's Comment</h4>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <p className="text-blue-100 leading-relaxed">{story.assessment.feedback}</p>
                    </div>
                  </div>

                  {/* Strengths */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Strengths</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {story.assessment.strengths.map((strength, index) => (
                        <div key={index} className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                          <span className="text-green-300">✓ {strength}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Improvements */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Areas for Improvement</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {story.assessment.improvements.map((improvement, index) => (
                        <div key={index} className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                          <span className="text-orange-300">→ {improvement}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Educational Insights */}
                  {story.assessment.educationalInsights && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Educational Insights</h4>
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                        <p className="text-purple-100 leading-relaxed">{story.assessment.educationalInsights}</p>
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {story.assessment.recommendations && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {story.assessment.recommendations.immediate && (
                        <div>
                          <h5 className="font-semibold text-white mb-2">Immediate Actions</h5>
                          <div className="space-y-2">
                            {story.assessment.recommendations.immediate.map((rec, index) => (
                              <div key={index} className="bg-red-500/10 border border-red-500/30 rounded p-2 text-red-300 text-sm">
                                {rec}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {story.assessment.recommendations.longTerm && (
                        <div>
                          <h5 className="font-semibold text-white mb-2">Long-term Goals</h5>
                          <div className="space-y-2">
                            {story.assessment.recommendations.longTerm.map((rec, index) => (
                              <div key={index} className="bg-blue-500/10 border border-blue-500/30 rounded p-2 text-blue-300 text-sm">
                                {rec}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {story.assessment.recommendations.practiceExercises && (
                        <div>
                          <h5 className="font-semibold text-white mb-2">Practice Exercises</h5>
                          <div className="space-y-2">
                            {story.assessment.recommendations.practiceExercises.map((rec, index) => (
                              <div key={index} className="bg-green-500/10 border border-green-500/30 rounded p-2 text-green-300 text-sm">
                                {rec}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FileText className="text-blue-400" />
                Story Content
              </h3>
              
              {story.content ? (
                <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-6">
                  <div className="prose prose-invert max-w-none">
                    {story.content.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="text-gray-100 leading-relaxed mb-4 text-lg">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <FileText size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Content not available for this story.</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}