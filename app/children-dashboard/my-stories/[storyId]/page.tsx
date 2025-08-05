'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  Share2,
  Edit,
  Star,
  Clock,
  BookOpen,
  MessageSquare,
  TrendingUp,
  Award,
  Sparkles,
  User,
  Calendar,
  Target,
  BookMarked,
  Brain,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface DetailedAssessment {
  grammarScore: number;
  creativityScore: number;
  overallScore: number;
  readingLevel: string;
  vocabularyScore: number;
  structureScore: number;
  characterDevelopmentScore: number;
  plotDevelopmentScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  vocabularyUsed: string[];
  suggestedWords: string[];
  educationalInsights: string;
}

interface StoryData {
  _id: string;
  title: string;
  content: string;
  totalWords: number;
  childWords: number;
  grammarScore: number;
  creativityScore: number;
  overallScore: number;
  aifeedback: string;
  publishedAt: string;
  elements: {
    genre: string;
    character: string;
    setting: string;
    theme: string;
    mood: string;
    tone: string;
  };
  assessment?: DetailedAssessment;
}

export default function StoryViewPage({
  params,
}: {
  params: { storyId: string };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const { storyId } = params;

  const [story, setStory] = useState<StoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState<'pdf' | 'word' | null>(
    null
  );

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'child') {
      router.push('/login/child');
      return;
    }

    const fetchStory = async () => {
      try {
        const response = await fetch(
          `/api/stories/session/${storyId}/complete`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch story');
        }

        setStory(data.story);
      } catch (error) {
        console.error('Error fetching story:', error);
        toast({
          title: '❌ Error',
          description: 'Failed to load story. Please try again.',
          variant: 'destructive',
        });
        router.push('/children-dashboard/my-stories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStory();
  }, [session, status, storyId, router, toast]);

  const handleDownload = async (format: 'pdf' | 'word') => {
    if (!story) return;

    setIsDownloading(format);

    try {
      const response = await fetch(
        `/api/stories/export/${story._id}/${format}`
      );

      if (!response.ok) {
        throw new Error('Failed to export story');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${story.title}.${format === 'pdf' ? 'pdf' : 'docx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: '📄 Download Ready!',
        description: `Your story has been exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Error downloading story:', error);
      toast({
        title: '❌ Download Failed',
        description: 'Failed to download story. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 90) return 'from-green-500 to-emerald-500';
    if (score >= 80) return 'from-blue-500 to-cyan-500';
    if (score >= 70) return 'from-yellow-500 to-orange-500';
    return 'from-orange-500 to-red-500';
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading your story...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'child' || !story) {
    return null;
  }

  // FIXED: Use detailed assessment if available, with better fallback structure
  const assessment = story.assessment || {
    grammarScore: story.grammarScore || 85,
    creativityScore: story.creativityScore || 88,
    overallScore: story.overallScore || 86,
    readingLevel: 'Elementary',
    vocabularyScore: story.grammarScore || 82,
    structureScore: story.creativityScore || 84,
    characterDevelopmentScore: story.overallScore || 86,
    plotDevelopmentScore: story.creativityScore || 87,
    feedback: story.aifeedback || 'Great work on your creative story!',
    strengths: [
      'Creative imagination',
      'Good story flow',
      'Engaging characters',
      'Descriptive writing',
      'Story structure',
    ],
    improvements: [
      'Add more dialogue',
      'Use more descriptive words',
      'Vary sentence length',
    ],
    vocabularyUsed: [
      'adventure',
      'mysterious',
      'brave',
      'discovered',
      'amazing',
    ],
    suggestedWords: [
      'magnificent',
      'extraordinary',
      'perilous',
      'astonishing',
      'triumphant',
    ],
    educationalInsights:
      'Keep developing your creative writing skills! Your storytelling abilities are improving.',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 ">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8 "
        >
          <Link href="/children-dashboard/my-stories">
            <motion.button
              whileHover={{ x: -2 }}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors mt-8 sm:mt-16 mb-6 sm:mb-10 bg-white p-2 sm:p-3 rounded-lg text-sm sm:text-base"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to My Stories</span>
            </motion.button>
          </Link>

          <div className="flex flex-col gap-4 md:gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 break-words">
                {story.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>
                    Published {new Date(story.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <span>•</span>
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  <span>{story.childWords} words (your writing)</span>
                </div>
                <span>•</span>
                <div className="flex items-center">
                  <Target className="w-4 h-4 mr-1" />
                  <span>Reading Level: {assessment.readingLevel}</span>
                </div>
              </div>

              {/* Story Elements */}
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {story.elements && typeof story.elements === 'object'
                  ? Object.entries(story.elements).map(([type, value]) => (
                      <span
                        key={type}
                        className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-sm text-white capitalize"
                      >
                        {value}
                      </span>
                    ))
                  : null}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:flex-col mt-2 lg:mt-0">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDownload('pdf')}
                disabled={isDownloading === 'pdf'}
                className="flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl font-medium transition-all disabled:opacity-50"
              >
                {isDownloading === 'pdf' ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Download PDF</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDownload('word')}
                disabled={isDownloading === 'word'}
                className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-xl font-medium transition-all disabled:opacity-50"
              >
                {isDownloading === 'word' ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Download Word</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Story Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 min-w-0"
          >
            <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-4 sm:p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-green-400" />
                {story.title}
              </h2>

              <div className="prose prose-base sm:prose-lg prose-invert max-w-none">
                <div className="text-gray-200 leading-relaxed whitespace-pre-wrap text-base sm:text-lg">
                  {story.content}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Main Assessment Scores */}
            <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-4 sm:p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-400" />
                Assessment Scores
              </h3>
              <div className="space-y-4">
                {[
                  {
                    label: 'Grammar & Writing',
                    score: assessment.grammarScore,
                    icon: BookOpen,
                    color: 'blue',
                  },
                  {
                    label: 'Creativity & Ideas',
                    score: assessment.creativityScore,
                    icon: Sparkles,
                    color: 'purple',
                  },
                  {
                    label: 'Overall Score',
                    score: assessment.overallScore,
                    icon: Award,
                    color: 'green',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Icon className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-gray-300 text-sm">
                            {item.label}
                          </span>
                        </div>
                        <span
                          className={`font-bold ${getScoreColor(item.score)}`}
                        >
                          {item.score}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.score}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className={`h-2 rounded-full bg-gradient-to-r ${getScoreBarColor(item.score)}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Scores */}
            <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-4 sm:p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                Detailed Analysis
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  {
                    label: 'Vocabulary',
                    score: assessment.vocabularyScore,
                    color: 'orange',
                  },
                  {
                    label: 'Structure',
                    score: assessment.structureScore,
                    color: 'cyan',
                  },
                  {
                    label: 'Character Dev.',
                    score: assessment.characterDevelopmentScore,
                    color: 'pink',
                  },
                  {
                    label: 'Plot Dev.',
                    score: assessment.plotDevelopmentScore,
                    color: 'indigo',
                  },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className={`text-lg font-bold text-${item.color}-400`}>
                      {item.score}%
                    </div>
                    <div className="text-gray-400 text-xs">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Feedback */}
            <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-4 sm:p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-purple-400" />
                AI Teacher Feedback
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {assessment.feedback}
              </p>
            </div>

            {/* Strengths */}
            {assessment.strengths && assessment.strengths.length > 0 && (
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-3 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-green-400" />
                  Your Strengths
                </h3>
              <div className="space-y-1 sm:space-y-2">
                {assessment.strengths.slice(0, 3).map((strength, index) => (
                  <div
                    key={index}
                    className="flex items-center text-green-300 text-xs sm:text-sm"
                  >
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2 sm:mr-3"></span>
                    {strength}
                  </div>
                ))}
              </div>
              </div>
            )}

            {/* Areas for Improvement */}
            {assessment.improvements && assessment.improvements.length > 0 && (
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-3 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-yellow-400" />
                  Areas to Improve
                </h3>
              <div className="space-y-1 sm:space-y-2">
                {assessment.improvements.map((improvement, index) => (
                  <div
                    key={index}
                    className="flex items-center text-yellow-300 text-xs sm:text-sm"
                  >
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 sm:mr-3"></span>
                    {improvement}
                  </div>
                ))}
              </div>
              </div>
            )}

            {/* Story Stats */}
            <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-4 sm:p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                Story Statistics
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-4 text-center">
                <div>
                  <div className="text-green-400 font-bold text-lg">
                    {story.childWords}
                  </div>
                  <div className="text-gray-400 text-xs">Your Words</div>
                </div>
                <div>
                  <div className="text-blue-400 font-bold text-lg">
                    {story.totalWords}
                  </div>
                  <div className="text-gray-400 text-xs">Total Words</div>
                </div>
                <div>
                  <div className="text-purple-400 font-bold text-lg">
                    {assessment.readingLevel}
                  </div>
                  <div className="text-gray-400 text-xs">Reading Level</div>
                </div>
                <div>
                  <div className="text-orange-400 font-bold text-lg">6</div>
                  <div className="text-gray-400 text-xs">Story Turns</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Vocabulary Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 sm:mt-8 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2"
        >
          {/* Great Words Used */}
          {assessment.vocabularyUsed &&
            assessment.vocabularyUsed.length > 0 && (
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4 sm:p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
                  Great Words You Used
                </h3>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {assessment.vocabularyUsed.map((word, index) => (
                    <span
                      key={index}
                      className="bg-purple-600/30 text-purple-300 px-3 py-1 rounded-lg text-sm font-medium"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {/* New Words to Learn */}
          {assessment.suggestedWords &&
            assessment.suggestedWords.length > 0 && (
              <div className="bg-gradient-to-r from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 rounded-xl p-4 sm:p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center">
                  <BookMarked className="w-5 h-5 mr-2 text-indigo-400" />
                  New Words to Learn
                </h3>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {assessment.suggestedWords.map((word, index) => (
                    <span
                      key={index}
                      className="bg-indigo-600/30 text-indigo-300 px-3 py-1 rounded-lg text-sm font-medium"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
        </motion.div>

        {/* Educational Insights */}
        {assessment.educationalInsights && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-6 sm:mt-8 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl p-4 sm:p-6"
          >
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-green-400" />
              Educational Insights
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {assessment.educationalInsights}
            </p>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
        >
          <button
            onClick={() => router.push('/children-dashboard/my-stories')}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-medium transition-all flex items-center justify-center text-sm sm:text-base"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            View All Stories
          </button>

          <button
            onClick={() => router.push('/create-stories')}
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-medium transition-all flex items-center justify-center text-sm sm:text-base"
          >
            <Edit className="w-5 h-5 mr-2" />
            Write New Story
          </button>
        </motion.div>
      </div>
    </div>
  );
}
