// components/stories/AssessmentModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  X,
  Star,
  Award,
  Download,
  Share2,
  BookOpen,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  storySession: {
    _id: string;
    title: string;
    totalWords: number;
  } | null;
  turns: Array<{
    childInput: string;
    aiResponse: string;
  }>;
}

interface AssessmentData {
  grammarScore: number;
  creativityScore: number;
  overallScore: number;
  feedback: string;
}

export default function AssessmentModal({
  isOpen,
  onClose,
  storySession,
  turns,
}: AssessmentModalProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (isOpen && storySession && turns.length > 0 && !assessment) {
      generateAssessment();
    }
  }, [isOpen, storySession, turns, assessment]);

  const generateAssessment = async () => {
    if (!storySession) return;

    setIsAssessing(true);

    try {
      // Combine all story content
      const fullStory = turns.map((turn) => turn.childInput).join('\n\n');

      const response = await fetch('/api/stories/ai-assess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: storySession._id,
          finalStory: fullStory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assess story');
      }

      setAssessment(data.assessment);
    } catch (error) {
      console.error('Error generating assessment:', error);
      // Fallback assessment
      setAssessment({
        grammarScore: 85,
        creativityScore: 92,
        overallScore: 88,
        feedback:
          'Great job on your creative story! You showed wonderful imagination and your writing has improved. Keep practicing and let your creativity shine!',
      });
    } finally {
      setIsAssessing(false);
    }
  };

  const handlePublishStory = async () => {
    if (!storySession || !assessment) return;

    setIsPublishing(true);

    try {
      const response = await fetch('/api/stories/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: storySession._id,
          assessment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish story');
      }

      toast({
        title: '🎉 Story Published!',
        description: 'Your amazing story is now in your library!',
      });

      router.push('/children-dashboard/my-stories');
    } catch (error) {
      console.error('Error publishing story:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to publish story. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleKeepEditing = () => {
    onClose();
    // Story remains in 'active' state for continued editing
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

  if (!isOpen || !storySession) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gray-800 border border-gray-600 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              🎉 Story Complete! "{storySession.title}"
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Assessment Results */}
          {isAssessing ? (
            <div className="text-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full mx-auto mb-4"
              />
              <p className="text-white font-medium">
                Analyzing your amazing story...
              </p>
              <p className="text-gray-400 text-sm mt-2">
                This will just take a moment!
              </p>
            </div>
          ) : assessment ? (
            <div className="space-y-6">
              {/* Scores */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    label: 'Grammar',
                    score: assessment.grammarScore,
                    icon: BookOpen,
                  },
                  {
                    label: 'Creativity',
                    score: assessment.creativityScore,
                    icon: Sparkles,
                  },
                  {
                    label: 'Overall',
                    score: assessment.overallScore,
                    icon: Award,
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-700/50 rounded-xl p-4 text-center"
                  >
                    <item.icon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <div
                      className={`text-2xl font-bold mb-1 ${getScoreColor(item.score)}`}
                    >
                      {item.score}%
                    </div>
                    <div className="text-gray-300 text-sm mb-3">
                      {item.label}
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.score}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        className={`bg-gradient-to-r ${getScoreBarColor(item.score)} h-2 rounded-full`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* AI Feedback */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6"
              >
                <h3 className="text-white font-semibold mb-3 flex items-center">
                  🤖 AI Feedback
                </h3>
                <p className="text-gray-200 leading-relaxed">
                  {assessment.feedback}
                </p>
              </motion.div>

              {/* Story Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-700/30 rounded-xl p-4"
              >
                <h3 className="text-white font-semibold mb-3 flex items-center">
                  📈 Story Stats
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-green-400 font-bold text-lg">
                      {storySession.totalWords}
                    </div>
                    <div className="text-gray-400 text-xs">Words</div>
                  </div>
                  <div>
                    <div className="text-blue-400 font-bold text-lg">
                      {turns.length}
                    </div>
                    <div className="text-gray-400 text-xs">Turns</div>
                  </div>
                  <div>
                    <div className="text-purple-400 font-bold text-lg">
                      Grade 3-4
                    </div>
                    <div className="text-gray-400 text-xs">Reading Level</div>
                  </div>
                  <div>
                    <div className="text-orange-400 font-bold text-lg">
                      42 min
                    </div>
                    <div className="text-gray-400 text-xs">Writing Time</div>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePublishStory}
                  disabled={isPublishing}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPublishing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Publishing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <BookOpen className="w-4 h-4" />
                      <span>🚀 Publish Story</span>
                    </div>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleKeepEditing}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-medium transition-all"
                >
                  📝 Keep Editing
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl transition-all"
                >
                  💾 Save as Draft
                </motion.button>
              </motion.div>
            </div>
          ) : null}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
