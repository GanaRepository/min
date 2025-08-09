'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Award,
  BookOpen,
  Trophy,
  Upload,
  Star,
  Eye,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Target,
  Zap,
  Shield,
  Brain,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

interface UsageStats {
  storiesCreated: number;
  storyLimit: number;
  assessmentUploads: number;
  assessmentLimit: number;
  totalAssessmentAttempts: number;
  maxAssessmentAttempts: number;
  competitionEntries: number;
  competitionLimit: number;
  storiesRemaining: number;
  assessmentsRemaining: number;
  competitionEntriesRemaining: number;
  hasStoryPackThisMonth: boolean;
  monthlySpent: number;
  lastReset: string;
}

interface Story {
  _id: string;
  title: string;
  storyNumber: number;
  status: 'active' | 'completed' | 'paused' | 'flagged';
  currentTurn: number;
  totalWords: number;
  childWords: number;
  assessmentAttempts: number;
  isPublished: boolean;
  competitionEligible: boolean;
  createdAt: string;
  isUploadedForAssessment?: boolean;
  assessment?: {
    overallScore: number;
    integrityAnalysis?: {
      originalityScore: number;
      plagiarismScore: number;
      aiDetectionScore: number;
      integrityRisk: 'low' | 'medium' | 'high' | 'critical';
    };
  };
}

interface Competition {
  _id: string;
  month: string;
  year: number;
  phase: 'submission' | 'judging' | 'results';
  daysLeft: number;
  userEntries: number;
  maxEntries: number;
  totalParticipants: number;
  winners?: Array<{
    position: number;
    childName: string;
    title: string;
    score: number;
  }>;
}

export default function ChildrenDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [recentStories, setRecentStories] = useState<Story[]>([]);
  const [currentCompetition, setCurrentCompetition] = useState<Competition | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login/child');
      return;
    }
    fetchDashboardData();
  }, [session, status]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch usage statistics
      const usageResponse = await fetch('/api/user/usage');
      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        setUsageStats(usageData);
      }

      // Fetch recent stories
      const storiesResponse = await fetch('/api/user/stories?limit=6');
      if (storiesResponse.ok) {
        const storiesData = await storiesResponse.json();
        setRecentStories(storiesData.stories || []);
      }

      // Fetch current competition
      const competitionResponse = await fetch('/api/competitions/current');
      if (competitionResponse.ok) {
        const competitionData = await competitionResponse.json();
        setCurrentCompetition(competitionData.competition);
      }

      // Fetch purchase history
      const purchasesResponse = await fetch('/api/user/purchase-history?limit=3');
      if (purchasesResponse.ok) {
        const purchasesData = await purchasesResponse.json();
        setPurchaseHistory(purchasesData.purchases || []);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIntegrityIcon = (integrityRisk?: string) => {
    switch (integrityRisk) {
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'high':
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your dashboard...</div>
      </div>
    );
  }

  const firstName = session?.user?.firstName || 'Writer';
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {firstName}!
          </h1>
          <p className="text-gray-300 text-lg">
            Ready for your next creative writing adventure?
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Usage Statistics Cards */}
            {usageStats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                <div className="bg-gradient-to-br from-blue-600/20 to-blue-500/20 border border-blue-500/30 rounded-xl p-4">
                  <div className="text-center">
                    <Sparkles className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <div className="text-xl font-bold text-white">
                      {usageStats.storiesRemaining}
                    </div>
                    <div className="text-blue-300 text-sm">Stories Left</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {usageStats.storiesCreated}/{usageStats.storyLimit} used
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-600/20 to-green-500/20 border border-green-500/30 rounded-xl p-4">
                  <div className="text-center">
                    <Upload className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <div className="text-xl font-bold text-white">
                      {usageStats.assessmentsRemaining}
                    </div>
                    <div className="text-green-300 text-sm">Assessments</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {usageStats.assessmentUploads}/{usageStats.assessmentLimit} used
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-600/20 to-purple-500/20 border border-purple-500/30 rounded-xl p-4">
                  <div className="text-center">
                    <Trophy className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-xl font-bold text-white">
                      {usageStats.competitionEntriesRemaining}
                    </div>
                    <div className="text-purple-300 text-sm">Comp. Entries</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {usageStats.competitionEntries}/{usageStats.competitionLimit} used
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-600/20 to-orange-500/20 border border-orange-500/30 rounded-xl p-4">
                  <div className="text-center">
                    <Target className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                    <div className="text-xl font-bold text-white">
                      {usageStats.maxAssessmentAttempts - usageStats.totalAssessmentAttempts}
                    </div>
                    <div className="text-orange-300 text-sm">Attempts</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {usageStats.totalAssessmentAttempts}/{usageStats.maxAssessmentAttempts} used
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <Link
                href="/create-stories"
                className="bg-gradient-to-br from-green-600/20 to-green-500/20 border border-green-500/30 rounded-xl p-6 hover:from-green-500/30 hover:to-green-400/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-green-500 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Create New Story</h3>
                    <p className="text-gray-300 text-sm">Start your next creative adventure</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/children-dashboard/upload-assessment"
                className="bg-gradient-to-br from-blue-600/20 to-blue-500/20 border border-blue-500/30 rounded-xl p-6 hover:from-blue-500/30 hover:to-blue-400/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Upload for Assessment</h3>
                    <p className="text-gray-300 text-sm">Get AI feedback on your story</p>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Recent Stories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <BookOpen size={24} />
                  Recent Stories
                </h2>
                <Link
                  href="/children-dashboard/my-stories"
                  className="text-green-400 hover:text-green-300 font-medium flex items-center gap-1"
                >
                  View All <Eye size={16} />
                </Link>
              </div>

              {recentStories.length === 0 ? (
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white font-medium mb-2">No Stories Yet</h3>
                  <p className="text-gray-400 mb-4">Start your writing journey today!</p>
                  <Link
                    href="/create-stories"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Create Your First Story
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentStories.map((story) => (
                    <div
                      key={story._id}
                      className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-white font-semibold text-lg">{story.title}</h3>
                            {story.isUploadedForAssessment && (
                              <span className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-xs">
                                Assessment Upload
                              </span>
                            )}
                            <span className={`px-2 py-1 rounded text-xs capitalize ${
                              story.status === 'completed' 
                                ? 'bg-green-600/20 text-green-300'
                                : story.status === 'active'
                                ? 'bg-blue-600/20 text-blue-300'
                                : 'bg-gray-600/20 text-gray-300'
                            }`}>
                              {story.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                            <span>📝 {story.childWords || story.totalWords} words</span>
                            <span>📅 {new Date(story.createdAt).toLocaleDateString()}</span>
                            {story.assessment && (
                              <div className="flex items-center gap-2">
                                <span className={`font-medium ${getScoreColor(story.assessment.overallScore)}`}>
                                  ⭐ {story.assessment.overallScore}%
                                </span>
                                {story.assessment.integrityAnalysis && (
                                  <div className="flex items-center gap-1">
                                    {getIntegrityIcon(story.assessment.integrityAnalysis.integrityRisk)}
                                    <span className="text-xs">
                                      {story.assessment.integrityAnalysis.originalityScore}% Original
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {story.assessment?.integrityAnalysis?.integrityRisk && 
                           ['high', 'critical'].includes(story.assessment.integrityAnalysis.integrityRisk) && (
                            <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-3 mb-3">
                              <div className="flex items-center gap-2 text-red-300 text-sm">
                                <AlertTriangle size={16} />
                                Integrity Review Required - 
                                {story.assessment.integrityAnalysis.plagiarismScore < 80 && " Potential plagiarism detected"}
                                {story.assessment.integrityAnalysis.aiDetectionScore > 70 && " AI-generated content suspected"}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          {story.status === 'active' ? (
                            <Link
                              href={`/children-dashboard/story/${story._id}`}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm flex items-center gap-1"
                            >
                              <Zap size={14} />
                              Continue
                            </Link>
                          ) : (
                            <Link
                              href={story.isUploadedForAssessment 
                                ? `/children-dashboard/my-stories/${story._id}` 
                                : `/children-dashboard/story/${story._id}`}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm flex items-center gap-1"
                            >
                              <Eye size={14} />
                              View
                            </Link>
                          )}

                          {!story.isPublished && story.status === 'completed' && story.assessment && (
                            <button
                              onClick={() => router.push(`/children-dashboard/story/${story._id}?action=publish`)}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm flex items-center gap-1"
                            >
                              <Star size={14} />
                              Publish - $10
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            
            {/* Current Competition */}
            {currentCompetition && (
              <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="text-purple-400" size={24} />
                  <h2 className="text-lg font-bold text-white">
                    {currentCompetition.month} Competition
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Phase:</span>
                    <span className="text-purple-300 capitalize font-medium">
                      {currentCompetition.phase}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Your Entries:</span>
                    <span className="text-white font-medium">
                      {currentCompetition.userEntries}/{currentCompetition.maxEntries}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Participants:</span>
                    <span className="text-white font-medium">
                      {currentCompetition.totalParticipants}
                    </span>
                  </div>

                  {currentCompetition.phase === 'submission' && (
                    <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-3 mt-4">
                      <div className="text-yellow-300 text-sm font-medium">
                        ⏰ {currentCompetition.daysLeft} days left to submit!
                      </div>
                      <div className="text-yellow-200 text-xs mt-1">
                        Publish your stories to make them competition eligible
                      </div>
                    </div>
                  )}

                  {currentCompetition.phase === 'judging' && (
                    <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-3 mt-4">
                      <div className="text-blue-300 text-sm font-medium">
                        🤖 AI judges are reviewing all submissions
                      </div>
                      <div className="text-blue-200 text-xs mt-1">
                        Results will be announced soon!
                      </div>
                    </div>
                  )}

                  {currentCompetition.phase === 'results' && currentCompetition.winners && (
                    <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-3 mt-4">
                      <div className="text-green-300 text-sm font-medium mb-2">
                        🏆 Winners Announced!
                      </div>
                      {currentCompetition.winners.slice(0, 3).map((winner, index) => (
                        <div key={winner.position} className="text-xs text-green-200 mb-1">
                          {winner.position === 1 ? '🥇' : winner.position === 2 ? '🥈' : '🥉'} 
                          {winner.childName} - "{winner.title}" ({winner.score}%)
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  href="/children-dashboard/competitions"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 mt-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Trophy size={16} />
                  View Competition
                </Link>
              </div>
            )}

            {/* Upgrade Prompt */}
            {usageStats && !usageStats.hasStoryPackThisMonth && (usageStats.storiesRemaining <= 1 || usageStats.assessmentsRemaining <= 1) && (
              <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl p-6">
                <div className="text-center">
                  <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">Running Low!</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Get 5 more stories + 5 more assessments this month
                  </p>
                  <Link
                    href="/pricing"
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 text-sm font-medium"
                  >
                    <Star size={16} />
                    Story Pack - $15
                  </Link>
                </div>
              </div>
            )}

            {/* Recent Purchases */}
            {purchaseHistory.length > 0 && usageStats && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="text-green-400" size={20} />
                  <h2 className="text-lg font-bold text-white">Recent Purchases</h2>
                </div>

                <div className="space-y-3">
                  {purchaseHistory.slice(0, 3).map((purchase, index) => (
                    <div
                      key={purchase.id || index}
                      className="flex items-center justify-between p-3 bg-gray-700/50 border border-gray-600 rounded-lg"
                    >
                      <div>
                        <div className="text-white text-sm font-medium">
                          {purchase.type === 'story_pack' ? 'Story Pack' : 'Story Publication'}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {new Date(purchase.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-green-400 font-medium">
                        ${purchase.amount}
                      </div>
                    </div>
                  ))}
                </div>

                {usageStats.monthlySpent > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-600">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Monthly Total:</span>
                      <span className="text-green-400 font-medium">${usageStats.monthlySpent}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </div>
  );
}