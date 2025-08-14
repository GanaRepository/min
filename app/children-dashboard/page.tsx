// app/children-dashboard/page.tsx - COMPLETE UPDATE FOR MINTOONS REQUIREMENTS
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Sparkles,
  Trophy,
  Star,
  Upload,
  TrendingUp,
  Award,
  Clock,
  Users,
  Calendar,
  Eye,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Zap,
  FileText,
  BarChart3,
  Plus,
  ArrowRight,
  Target,
  Brain,
  Palette,
  Shield,
  Gift,
  Crown,
  Heart,
  Rocket,
} from 'lucide-react';

// ===== INTERFACES =====
interface UsageStats {
  stories: {
    used: number;
    limit: number;
    remaining: number;
    canUse: boolean;
  };
  assessments: {
    used: number;
    limit: number;
    remaining: number;
    canUse: boolean;
  };
  assessmentAttempts: {
    used: number;
    limit: number;
    remaining: number;
    canUse: boolean;
  };
  competitions: {
    used: number;
    limit: number;
    remaining: number;
    canUse: boolean;
  };
  publications: {
    used: number;
    limit: number;
    remaining: number;
    canUse: boolean;
  };
  resetDate: string;
  subscriptionTier: 'FREE' | 'STORY_PACK';
}

interface Story {
  _id: string;
  title: string;
  status: 'active' | 'completed' | 'flagged' | 'review';
  createdAt: string;
  updatedAt: string;
  totalWords: number;
  childWords: number;
  isPublished: boolean;
  isUploadedForAssessment: boolean;
  competitionEligible: boolean;
  storyType: 'freestyle' | 'uploaded' | 'competition';
  competitionEntries?: Array<{
    competitionId: string;
    submittedAt: string;
    rank?: number;
    score?: number;
  }>;
  assessment?: {
    overallScore: number;
    grammarScore: number;
    creativityScore: number;
    vocabularyScore: number;
    structureScore: number;
    characterDevelopmentScore: number;
    plotDevelopmentScore: number;
    readingLevel: string;
    feedback: string;
    strengths: string[];
    improvements: string[];
    integrityAnalysis?: {
      plagiarismResult?: {
        overallScore: number;
        riskLevel: string;
      };
      aiDetectionResult?: {
        likelihood: string;
        confidence: number;
      };
      integrityRisk?: 'low' | 'medium' | 'high' | 'critical';
    };
    integrityStatus: {
      status: 'PASS' | 'WARNING' | 'FAIL';
      message: string;
    };
  };
}

interface Competition {
  _id: string;
  month: string;
  year: number;
  phase: 'submission' | 'judging' | 'results';
  daysLeft: number;
  totalSubmissions: number;
  totalParticipants: number;
  submissionDeadline: string;
  resultsDate: string;
  isActive: boolean;
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
  winners?: Array<{
    position: number;
    childId: string;
    childName: string;
    title: string;
    score: number;
  }>;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
  category: 'writing' | 'creativity' | 'competition' | 'milestone';
}

export default function ChildrenDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ===== STATE =====
  const [loading, setLoading] = useState(true);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [recentStories, setRecentStories] = useState<Story[]>([]);
  const [currentCompetition, setCurrentCompetition] = useState<Competition | null>(null);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [publishingStory, setPublishingStory] = useState<string | null>(null);
  const [showUpgradePromo, setShowUpgradePromo] = useState(false);

  // ===== EFFECTS =====
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'child') {
      router.push('/login/child');
      return;
    }
    fetchDashboardData();
    
    // Check for purchase success/failure
    const purchaseStatus = searchParams.get('purchase');
    if (purchaseStatus === 'success') {
      setTimeout(() => {
        fetchDashboardData();
      }, 1000);
    }
  }, [session, status, router, searchParams]);

  // ===== DATA FETCHING =====
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 Fetching complete dashboard data...');

      // Parallel fetch all dashboard data
      const [usageResponse, storiesResponse, competitionResponse] = await Promise.all([
        fetch('/api/user/usage'),
        fetch('/api/user/stories?limit=3&recent=true'),
        fetch('/api/competitions/current')
      ]);

      // Handle usage statistics
      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        console.log('📈 Usage stats loaded:', usageData);
        setUsageStats(usageData.usage);
        
        // Show upgrade promo if user is close to limits
        if (usageData.usage.subscriptionTier === 'FREE') {
          const nearLimit = 
            usageData.usage.stories.remaining <= 1 ||
            usageData.usage.assessments.remaining <= 1 ||
            usageData.usage.assessmentAttempts.remaining <= 3;
          setShowUpgradePromo(nearLimit);
        }
      } else {
        console.error('❌ Failed to fetch usage stats');
        setUsageStats(getDefaultUsageStats());
      }

      // Handle recent stories
      if (storiesResponse.ok) {
        const storiesData = await storiesResponse.json();
        console.log('📚 Recent stories loaded:', storiesData.stories?.length || 0);
        setRecentStories(storiesData.stories || []);
      } else {
        console.error('❌ Failed to fetch recent stories');
        setRecentStories([]);
      }

      // Handle current competition
      if (competitionResponse.ok) {
        const competitionData = await competitionResponse.json();
        console.log('🏆 Competition data loaded:', competitionData.competition?.month);
        setCurrentCompetition(competitionData.competition);
      } else {
        console.error('❌ Failed to fetch competition data');
        setCurrentCompetition(null);
      }

      // Fetch achievements (optional)
      try {
        const achievementsResponse = await fetch('/api/user/achievements?recent=3');
        if (achievementsResponse.ok) {
          const achievementsData = await achievementsResponse.json();
          setRecentAchievements(achievementsData.achievements || []);
        }
      } catch (err) {
        console.log('ℹ️ Achievements not available');
      }

    } catch (error) {
      console.error('❌ Dashboard data fetch error:', error);
      setError('Failed to load dashboard data. Please refresh the page.');
      setUsageStats(getDefaultUsageStats());
      setRecentStories([]);
      setCurrentCompetition(null);
    } finally {
      setLoading(false);
    }
  };

  // ===== HELPER FUNCTIONS =====
  const getDefaultUsageStats = (): UsageStats => ({
    stories: { used: 0, limit: 3, remaining: 3, canUse: true },
    assessments: { used: 0, limit: 3, remaining: 3, canUse: true },
    assessmentAttempts: { used: 0, limit: 9, remaining: 9, canUse: true },
    competitions: { used: 0, limit: 3, remaining: 3, canUse: true },
    publications: { used: 0, limit: 1, remaining: 1, canUse: true },
    resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
    subscriptionTier: 'FREE'
  });

  const getStoryTypeInfo = (story: Story) => {
    if (story.competitionEntries && story.competitionEntries.length > 0) {
      return { 
        label: "COMPETITION ENTRY", 
        icon: Trophy, 
        color: "text-purple-400",
        bgColor: "bg-purple-500/20",
        borderColor: "border-purple-500/30"
      };
    }
    if (story.isUploadedForAssessment) {
      return { 
        label: "UPLOADED FOR ASSESSMENT", 
        icon: Upload, 
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
        borderColor: "border-blue-500/30"
      };
    }
    return { 
      label: "FREESTYLE STORY", 
      icon: Sparkles, 
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      borderColor: "border-green-500/30"
    };
  };

  const getIntegrityIcon = (integrityRisk?: string) => {
    switch (integrityRisk) {
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const handlePublishStory = async (storyId: string) => {
    if (!session?.user?.id || !usageStats?.publications.canUse) return;
    
    setPublishingStory(storyId);
    
    try {
      const response = await fetch('/api/stories/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: storyId })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('🎉 Story published to community showcase!');
        fetchDashboardData(); // Refresh data
      } else {
        throw new Error(data.error || 'Failed to publish story');
      }
    } catch (error) {
      console.error('❌ Publication error:', error);
      alert('Failed to publish story. Please try again.');
    } finally {
      setPublishingStory(null);
    }
  };

  const handlePurchaseStory = async (storyId: string) => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: 'story_purchase',
          storyId: storyId,
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
    }
  };

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          Loading your creative dashboard...
        </div>
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 py-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* ===== WELCOME HEADER ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Rocket className="w-16 h-16 text-blue-400" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-gray-900" />
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome back, {session?.user?.firstName || session?.user?.name || 'Writer'}! 🌟
          </h1>
          
          <p className="text-xl text-gray-300 mb-6">
            Ready to create amazing stories today? Your writing adventure awaits!
          </p>

          {/* Subscription Status Badge */}
          <div className="flex justify-center mb-8">
            {usageStats?.subscriptionTier === 'STORY_PACK' ? (
              <div className="bg-gradient-to-r from-gold-500 to-yellow-500 text-gray-900 px-6 py-2 rounded-full font-semibold flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Story Pack Active
              </div>
            ) : (
              <div className="bg-gray-700/50 text-gray-300 px-6 py-2 rounded-full font-medium flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Free Writer
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-4xl mx-auto">
            <Link
              href="/create-stories"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 transform hover:scale-105"
            >
              <Sparkles size={24} />
              Start Writing Freestyle
            </Link>
            
            <Link
              href="/children-dashboard/upload-story"
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 transform hover:scale-105"
            >
              <Upload size={24} />
              Upload for Assessment
            </Link>
            
            <Link
              href="/children-dashboard/competitions"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 transform hover:scale-105"
            >
              <Trophy size={24} />
              Enter Competition
            </Link>
          </div>
        </motion.div>

        {/* ===== USAGE STATISTICS CARDS ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12"
        >
          {/* Freestyle Stories */}
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/10 rounded-full -translate-y-4 translate-x-4"></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-300">Freestyle Stories</h3>
              <Sparkles className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-3xl font-bold text-white">
                {usageStats?.stories.remaining || 0}
              </span>
              <span className="text-blue-300">remaining</span>
            </div>
            <div className="text-sm text-blue-200">
              {usageStats?.stories.used || 0} / {usageStats?.stories.limit || 3} used
            </div>
            <div className="w-full bg-blue-800/30 rounded-full h-2 mt-3">
              <div
                className="bg-blue-400 h-2 rounded-full transition-all"
                style={{ 
                  width: `${Math.min(((usageStats?.stories.used || 0) / (usageStats?.stories.limit || 3)) * 100, 100)}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Assessment Uploads */}
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-400/10 rounded-full -translate-y-4 translate-x-4"></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-300">Assessment Uploads</h3>
              <Upload className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-3xl font-bold text-white">
                {usageStats?.assessments.remaining || 0}
              </span>
              <span className="text-green-300">remaining</span>
            </div>
            <div className="text-sm text-green-200">
              {usageStats?.assessments.used || 0} / {usageStats?.assessments.limit || 3} used
            </div>
            <div className="w-full bg-green-800/30 rounded-full h-2 mt-3">
              <div
                className="bg-green-400 h-2 rounded-full transition-all"
                style={{ 
                  width: `${Math.min(((usageStats?.assessments.used || 0) / (usageStats?.assessments.limit || 3)) * 100, 100)}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Assessment Attempts */}
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-400/10 rounded-full -translate-y-4 translate-x-4"></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-yellow-300">Assessment Pool</h3>
              <Brain className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-3xl font-bold text-white">
                {usageStats?.assessmentAttempts.remaining || 0}
              </span>
              <span className="text-yellow-300">remaining</span>
            </div>
            <div className="text-sm text-yellow-200">
              {usageStats?.assessmentAttempts.used || 0} / {usageStats?.assessmentAttempts.limit || 9} used
            </div>
            <div className="w-full bg-yellow-800/30 rounded-full h-2 mt-3">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all"
                style={{ 
                  width: `${Math.min(((usageStats?.assessmentAttempts.used || 0) / (usageStats?.assessmentAttempts.limit || 9)) * 100, 100)}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Competition Entries */}
          <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-400/10 rounded-full -translate-y-4 translate-x-4"></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-purple-300">Competition Entries</h3>
              <Trophy className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-3xl font-bold text-white">
                {usageStats?.competitions.remaining || 0}
              </span>
              <span className="text-purple-300">remaining</span>
            </div>
            <div className="text-sm text-purple-200">
              {usageStats?.competitions.used || 0} / {usageStats?.competitions.limit || 3} used
            </div>
            <div className="w-full bg-purple-800/30 rounded-full h-2 mt-3">
              <div
                className="bg-purple-400 h-2 rounded-full transition-all"
                style={{ 
                  width: `${Math.min(((usageStats?.competitions.used || 0) / (usageStats?.competitions.limit || 3)) * 100, 100)}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Free Publications */}
          <div className="bg-pink-500/20 border border-pink-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-pink-400/10 rounded-full -translate-y-4 translate-x-4"></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-pink-300">Free Publications</h3>
              <Star className="w-6 h-6 text-pink-400" />
            </div>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-3xl font-bold text-white">
                {usageStats?.publications.remaining || 0}
              </span>
              <span className="text-pink-300">remaining</span>
            </div>
            <div className="text-sm text-pink-200">
              {usageStats?.publications.used || 0} / {usageStats?.publications.limit || 1} used
            </div>
            <div className="w-full bg-pink-800/30 rounded-full h-2 mt-3">
              <div
                className="bg-pink-400 h-2 rounded-full transition-all"
                style={{ 
                  width: `${Math.min(((usageStats?.publications.used || 0) / (usageStats?.publications.limit || 1)) * 100, 100)}%` 
                }}
              ></div>
            </div>
          </div>
        </motion.div>

        {/* ===== UPGRADE PROMOTION (if near limits) ===== */}
        {showUpgradePromo && usageStats?.subscriptionTier === 'FREE' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Gift className="w-8 h-8 text-orange-400" />
                <div>
                  <h3 className="text-xl font-bold text-white">Running low on creative fuel? 🚀</h3>
                  <p className="text-gray-300">
                    Upgrade to Story Pack and get 5 more stories, 5 more assessments, and 15 more assessment attempts!
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgradePromo(false)}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Later
                </button>
                <Link
                  href="/pricing"
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Upgrade Now - $15/month
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* ===== MAIN CONTENT GRID ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ===== LEFT COLUMN: RECENT STORIES ===== */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <BookOpen className="w-7 h-7 text-blue-400" />
                  Your Recent Stories
                </h2>
                <Link
                  href="/children-dashboard/my-stories"
                  className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
                >
                  View All
                  <ArrowRight size={16} />
                </Link>
              </div>

              {recentStories.length === 0 ? (
                <div className="text-center py-12">
                  <Palette className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No stories yet</h3>
                  <p className="text-gray-500 mb-6">Start your first creative writing adventure today!</p>
                  <Link
                    href="/create-stories"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Create Your First Story
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentStories.map((story, index) => {
                    const typeInfo = getStoryTypeInfo(story);
                    return (
                      <motion.div
                        key={story._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className={`${typeInfo.bgColor} border ${typeInfo.borderColor} rounded-lg p-4 hover:bg-opacity-30 transition-all group`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <typeInfo.icon className={`w-4 h-4 ${typeInfo.color}`} />
                              <span className={`text-xs font-medium ${typeInfo.color} uppercase tracking-wide`}>
                                {typeInfo.label}
                              </span>
                              {story.status === 'flagged' && (
                                <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs">
                                  Flagged
                                </span>
                              )}
                              {story.status === 'review' && (
                                <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs">
                                  Under Review
                                </span>
                              )}
                            </div>
                            
                            <h3 className="font-semibold text-white text-lg mb-1 truncate">
                              {story.title}
                            </h3>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                              <span>{story.totalWords} words</span>
                              <span>•</span>
                              <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                              {story.assessment?.overallScore && (
                                <>
                                  <span>•</span>
                                  <span className={`font-medium ${getScoreColor(story.assessment.overallScore)}`}>
                                    {story.assessment.overallScore}% Score
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Assessment Summary */}
                            {story.assessment && (
                              <div className="flex items-center gap-3 mb-3">
                                <div className="flex items-center gap-1">
                                  <Target className="w-4 h-4 text-blue-400" />
                                  <span className="text-sm text-blue-300">
                                    Grammar: {story.assessment.grammarScore}%
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Sparkles className="w-4 h-4 text-purple-400" />
                                  <span className="text-sm text-purple-300">
                                    Creativity: {story.assessment.creativityScore}%
                                  </span>
                                </div>
                                {story.assessment.integrityAnalysis?.integrityRisk && (
                                  <div className="flex items-center gap-1">
                                    {getIntegrityIcon(story.assessment.integrityAnalysis.integrityRisk)}
                                    <span className="text-sm text-gray-300">
                                      Integrity Check
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link
                                href={`/children-dashboard/my-stories/${story._id}`}
                                className="bg-gray-700/50 hover:bg-gray-600/50 text-white px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1"
                              >
                                <Eye size={14} />
                                View
                              </Link>
                              
                              {/* Publish Button (conditional) */}
                              {story.status === 'completed' && !story.isPublished && usageStats?.publications.canUse && (
                                <button
                                  onClick={() => handlePublishStory(story._id)}
                                  disabled={publishingStory === story._id}
                                  className="bg-green-600/20 hover:bg-green-600/30 text-green-400 px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1 disabled:opacity-50"
                                >
                                  {publishingStory === story._id ? (
                                    <>
                                      <div className="w-3 h-3 border border-green-400 border-t-transparent rounded-full animate-spin"></div>
                                      Publishing...
                                    </>
                                  ) : (
                                    <>
                                      <Star size={14} />
                                      Publish Free
                                    </>
                                  )}
                                </button>
                              )}
                              
                              {/* Purchase Button (always available) */}
                              {story.status === 'completed' && (
                                <button
                                  onClick={() => handlePurchaseStory(story._id)}
                                  className="bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1"
                                >
                                  <DollarSign size={14} />
                                  Purchase $10
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>

          {/* ===== RIGHT COLUMN: COMPETITION & ACHIEVEMENTS ===== */}
          <div className="space-y-8">
            
            {/* Current Competition */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-7 h-7 text-yellow-400" />
                <h2 className="text-xl font-bold text-white">
                  {currentCompetition ? `${currentCompetition.month} Competition` : 'Monthly Competition'}
                </h2>
              </div>

              {currentCompetition ? (
                <div className="space-y-4">
                  {/* Competition Phase */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Phase:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                      currentCompetition.phase === 'submission' 
                        ? 'bg-green-500/20 text-green-400'
                        : currentCompetition.phase === 'judging'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {currentCompetition.phase}
                    </span>
                  </div>

                  {/* Days Left */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Time Left:</span>
                    <span className="text-white font-semibold">
                      {currentCompetition.daysLeft} days
                    </span>
                  </div>

                  {/* User Stats */}
                  {currentCompetition.userStats && (
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                      <div className="text-sm text-purple-300 mb-2">Your Competition Status</div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300">Entries Used:</span>
                        <span className="text-white font-medium">
                          {currentCompetition.userStats.entriesUsed} / {currentCompetition.userStats.entriesLimit}
                        </span>
                      </div>
                      
                      {currentCompetition.userStats.userEntries.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="text-sm text-purple-300">Your Entries:</div>
                          {currentCompetition.userStats.userEntries.map((entry, index) => (
                            <div key={index} className="bg-gray-700/30 rounded p-2">
                              <div className="text-sm font-medium text-white">{entry.title}</div>
                              {entry.rank && (
                                <div className="text-xs text-yellow-400">Rank: #{entry.rank}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Participation Stats */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-blue-500/10 rounded-lg p-3">
                      <div className="text-xl font-bold text-blue-400">
                        {currentCompetition.totalParticipants}
                      </div>
                      <div className="text-xs text-blue-300">Participants</div>
                    </div>
                    <div className="bg-green-500/10 rounded-lg p-3">
                      <div className="text-xl font-bold text-green-400">
                        {currentCompetition.totalSubmissions}
                      </div>
                      <div className="text-xs text-green-300">Submissions</div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    href="/children-dashboard/competitions"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Trophy size={18} />
                    {currentCompetition.phase === 'submission' && currentCompetition.userStats?.canSubmit
                      ? 'Enter Competition'
                      : 'View Competition'
                    }
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400 mb-4">No active competition</p>
                  <div className="text-sm text-gray-500">
                    Competitions run monthly. Check back soon!
                  </div>
                </div>
              )}
            </motion.div>

            {/* Recent Achievements */}
            {recentAchievements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Award className="w-7 h-7 text-green-400" />
                  <h2 className="text-xl font-bold text-white">Recent Achievements</h2>
                </div>

                <div className="space-y-3">
                  {recentAchievements.map((achievement, index) => (
                    <div
                      key={achievement.id}
                      className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center gap-3"
                    >
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium text-white">{achievement.title}</div>
                        <div className="text-sm text-gray-400">{achievement.description}</div>
                        <div className="text-xs text-green-400 mt-1">
                          {new Date(achievement.earnedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-7 h-7 text-orange-400" />
                <h2 className="text-xl font-bold text-white">Quick Stats</h2>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Words Written:</span>
                  <span className="text-white font-semibold">
                    {recentStories.reduce((total, story) => total + (story.childWords || 0), 0).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Stories Completed:</span>
                  <span className="text-white font-semibold">
                    {recentStories.filter(story => story.status === 'completed').length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Average Score:</span>
                  <span className="text-white font-semibold">
                    {recentStories.length > 0 && recentStories.some(s => s.assessment?.overallScore)
                      ? Math.round(
                          recentStories
                            .filter(s => s.assessment?.overallScore)
                            .reduce((total, story) => total + (story.assessment?.overallScore || 0), 0) /
                          recentStories.filter(s => s.assessment?.overallScore).length
                        )
                      : 'N/A'
                    }%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Next Reset:</span>
                  <span className="text-white font-semibold">
                    {usageStats?.resetDate 
                      ? new Date(usageStats.resetDate).toLocaleDateString()
                      : 'Loading...'
                    }
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ===== BOTTOM CTA SECTION ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12 text-center"
        >
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-3">
              Keep Your Creative Journey Going! ✨
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Whether you want to write freestyle, get AI feedback, or compete with other young writers, 
              there's always something exciting waiting for you.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/children-dashboard/my-stories"
                className="bg-gray-700/50 hover:bg-gray-600/50 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 justify-center"
              >
                <BookOpen size={20} />
                View All Stories
              </Link>
              
              {usageStats?.subscriptionTier === 'FREE' && (
                <Link
                  href="/pricing"
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-lg transition-all flex items-center gap-2 justify-center font-medium"
                >
                  <Zap size={20} />
                  Unlock More Stories
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}