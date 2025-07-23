'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  Save,
  Pause,
  CheckCircle,
  AlertCircle,
  Sparkles,
  BookOpen,
  Clock,
  Target,
  Award,
  Brain,
  Zap,
  Star,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import WordCountValidator from '@/components/writing/WordCountValidator';

interface StorySession {
  _id: string;
  title: string;
  elements: {
    genre: string;
    character: string;
    setting: string;
    theme: string;
    mood: string;
    tone: string;
  };
  currentTurn: number;
  totalWords: number;
  childWords: number;
  apiCallsUsed: number;
  maxApiCalls: number;
  status: 'active' | 'completed' | 'paused';
  aiOpening?: string;
}

interface Turn {
  _id: string;
  turnNumber: number;
  childInput: string;
  aiResponse: string;
  childWordCount: number;
  aiWordCount: number;
}

export default function StoryWritingPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const { sessionId } = params;

  const [storySession, setStorySession] = useState<StorySession | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const storyTimelineRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentInput, setCurrentInput] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessment, setAssessment] = useState<any>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'child') {
      router.push('/login/child');
      return;
    }

    fetchStoryData();
  }, [session, status, sessionId, router]);

  const fetchStoryData = async () => {
    try {
      const [sessionResponse, turnsResponse] = await Promise.all([
        fetch(`/api/stories/session/${sessionId}`),
        fetch(`/api/stories/session/${sessionId}/turns`),
      ]);

      const [sessionData, turnsData] = await Promise.all([
        sessionResponse.json(),
        turnsResponse.json(),
      ]);

      if (!sessionResponse.ok) {
        throw new Error(sessionData.error || 'Failed to fetch story session');
      }

      if (!turnsResponse.ok) {
        throw new Error(turnsData.error || 'Failed to fetch story turns');
      }

      setStorySession(sessionData.session);
      setTurns(turnsData.turns);

      // Check if story is completed and show assessment
      if (
        sessionData.session.status === 'completed' &&
        sessionData.session.currentTurn > 6
      ) {
        fetchAssessment();
      }
    } catch (error) {
      console.error('Error fetching story data:', error);
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

  const fetchAssessment = async () => {
    try {
      const response = await fetch(
        `/api/stories/session/${sessionId}/assessment`
      );
      const data = await response.json();

      if (response.ok) {
        setAssessment(data.assessment);
        setShowAssessment(true);
        await autoPublishStory(data.assessment); // Auto-publish if not already published
      } else if (response.status === 404) {
        // If not found, try to generate it
        const postResponse = await fetch(`/api/stories/assess/${sessionId}`, {
          method: 'POST',
        });
        const postData = await postResponse.json();
        if (postResponse.ok) {
          setAssessment(postData.assessment);
          setShowAssessment(true);
          await autoPublishStory(postData.assessment); // Auto-publish after assessment
        } else {
          // Optionally, handle error if assessment generation fails
          console.error('Failed to generate assessment:', postData.error);
        }
      }
    } catch (error) {
      console.error('Error fetching assessment:', error);
    }
  };

  const autoPublishStory = async (assessment: any) => {
    try {
      await fetch('/api/stories/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          assessment,
        }),
      });
      // No need to handle response here; just ensure publish is triggered
    } catch (error) {
      console.error('Auto-publish failed:', error);
    }
  };

  // FIXED: Improved turn submission with better UX
  const handleSubmitTurn = async () => {
    if (!isValid || !storySession) return;

    setIsSubmitting(true);
    setIsLoadingAI(true);

    try {
      const response = await fetch('/api/stories/ai-respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: storySession._id,
          childInput: currentInput.trim(),
          turnNumber: storySession.currentTurn,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit your story part');
      }

      // Add new turn to the list
      setTurns((prev) => [...prev, data.turn]);

      // Update session data
      setStorySession((prev) =>
        prev
          ? {
              ...prev,
              currentTurn: data.session.currentTurn,
              totalWords: data.session.totalWords,
              childWords: data.session.childWords,
              apiCallsUsed: data.session.apiCallsUsed,
              status: data.session.status,
            }
          : null
      );

      // Clear input
      setCurrentInput('');

      // Check if story is completed
      if (data.session.completed) {
        toast({
          title: '🎉 Story Complete!',
          description: "Amazing work! Let's see how you did.",
        });

        // Trigger assessment
        setTimeout(() => {
          requestAssessment();
        }, 1000);
      } else {
        toast({
          title: '✅ Great job!',
          description: `Turn ${data.turn.turnNumber} submitted successfully! The AI is continuing your story.`,
        });
      }
    } catch (error) {
      console.error('Error submitting turn:', error);
      toast({
        title: '❌ Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to submit your story part.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setIsLoadingAI(false);
    }
  };

  const requestAssessment = async () => {
    if (!storySession) return;

    setIsLoadingAI(true);
    try {
      const response = await fetch(`/api/stories/assess/${storySession._id}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setAssessment(data.assessment);
        setShowAssessment(true);

        // Update session status
        setStorySession((prev) =>
          prev
            ? {
                ...prev,
                status: 'completed',
              }
            : null
        );
      }
    } catch (error) {
      console.error('Error requesting assessment:', error);
      toast({
        title: '❌ Assessment Error',
        description:
          "Your story is complete but we couldn't generate your scores. You can view it in My Stories.",
        variant: 'destructive',
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!storySession || !currentInput.trim()) return;

    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/stories/session/${storySession._id}/draft`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            draftContent: currentInput.trim(),
            turnNumber: storySession.currentTurn,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save draft');
      }

      toast({
        title: '💾 Draft Saved!',
        description: 'Your progress has been saved.',
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: '❌ Save Error',
        description: 'Failed to save draft. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePauseStory = async () => {
    if (!storySession) return;

    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/stories/session/${storySession._id}/pause`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to pause story');
      }

      toast({
        title: '⏸️ Story Paused',
        description: 'You can continue anytime!',
      });

      router.push('/children-dashboard');
    } catch (error) {
      console.error('Error pausing story:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to pause story. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-scroll to bottom when turns change
  useEffect(() => {
    if (storyTimelineRef.current) {
      storyTimelineRef.current.scrollTop =
        storyTimelineRef.current.scrollHeight;
    }
  }, [turns]);

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

  if (!session || session.user.role !== 'child' || !storySession) {
    return null;
  }
  // FIXED: Better progress calculation
  const progressPercentage = ((storySession.currentTurn - 1) / 6) * 100; // 6 total turns

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white pt-32">
      {/* FIXED: Header with proper spacing and responsive container */}
      <div className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-600/40 sticky top-0 z-10 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/children-dashboard/my-stories')}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Stories</span>
            </button>

            {/* FIXED: Enhanced Progress Indicator */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300">
                Turn {storySession.currentTurn} of 6
              </div>
              <div className="w-32 bg-gray-700 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
              <div className="text-sm text-gray-300">
                {storySession.apiCallsUsed}/{storySession.maxApiCalls} AI calls
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FIXED: Main Content with proper responsive container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
        {/* Story Title and Elements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-4">{storySession.title}</h1>
          <div className="flex flex-wrap gap-2">
            {Object.entries(storySession.elements).map(([type, value]) => (
              <span
                key={type}
                className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-sm text-white capitalize"
              >
                {type}: {value}
              </span>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* FIXED: Story Timeline with proper responsive layout */}
          <div
            className="xl:col-span-8 space-y-6 "
            ref={storyTimelineRef}
            style={{ maxHeight: '68rem', overflowY: 'auto' }}
          >
            <h2 className="text-xl font-semibold flex items-center">
              <BookOpen className="w-6 h-6 mr-2 text-blue-400" />
              Story So Far
            </h2>

            <div className="space-y-6">
              {/* AI Opening */}
              {storySession.aiOpening && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6"
                >
                  <div className="flex items-center mb-3">
                    <Brain className="w-5 h-5 text-blue-400 mr-2" />
                    <span className="text-blue-300 font-medium">
                      AI Teacher's Story Opening
                    </span>
                  </div>
                  <p className="text-gray-100 leading-relaxed">
                    {storySession.aiOpening}
                  </p>
                </motion.div>
              )}

              {/* Story Turns */}
              {turns.map((turn, index) => (
                <motion.div
                  key={turn._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-4"
                >
                  {/* Child's Input */}
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Target className="w-5 h-5 text-green-400 mr-2" />
                        <span className="text-green-300 font-medium">
                          Your Turn {turn.turnNumber}
                        </span>
                      </div>
                      <span className="text-green-300 text-sm">
                        {turn.childWordCount} words
                      </span>
                    </div>
                    <p className="text-gray-100 leading-relaxed">
                      {turn.childInput}
                    </p>
                  </div>

                  {/* AI Response */}
                  <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Brain className="w-5 h-5 text-blue-400 mr-2" />
                        <span className="text-blue-300 font-medium">
                          AI Teacher Response
                        </span>
                      </div>
                      <span className="text-blue-300 text-sm">
                        {turn.aiWordCount} words
                      </span>
                    </div>
                    <p className="text-gray-100 leading-relaxed">
                      {turn.aiResponse}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* FIXED: AI Loading State */}
              {isLoadingAI && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-xl p-6"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-6 h-6 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                    <span className="text-purple-300 font-medium">
                      AI Teacher is thinking...
                    </span>
                  </div>
                  <p className="text-center text-gray-300 text-sm mt-2">
                    Creating an educational response to your wonderful writing!
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* FIXED: Writing Interface with improved layout */}
          <div className="xl:col-span-4 space-y-6">
            {storySession.status === 'completed' ? (
              <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-300 mb-2">
                  Story Complete! 🎉
                </h3>
                <p className="text-gray-300 mb-6">
                  Congratulations! You've finished your{' '}
                  {storySession.childWords}-word adventure.
                </p>
                <button
                  onClick={fetchAssessment}
                  className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 mx-auto"
                >
                  <Award className="w-5 h-5" />
                  <span>View Assessment</span>
                </button>
              </div>
            ) : (
              <>
                {/* FIXED: Word Count Validator with consistent requirements */}
                <WordCountValidator
                  value={currentInput}
                  onChange={setCurrentInput}
                  turnNumber={storySession.currentTurn}
                  onValidationChange={(valid, count) => {
                    setIsValid(valid);
                    setWordCount(count);
                  }}
                  disabled={isSubmitting || isLoadingAI}
                />

                {/* Action Buttons */}
                <div className="flex flex-col gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmitTurn}
                    disabled={!isValid || isSubmitting || isLoadingAI}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 px-6 py-4 rounded-xl font-semibold flex items-center justify-center space-x-3 transition-all disabled:cursor-not-allowed"
                  >
                    {isSubmitting || isLoadingAI ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>
                          {isLoadingAI ? 'AI Thinking...' : 'Submitting...'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>
                          {storySession.currentTurn === 6
                            ? 'Complete Story'
                            : 'Submit Turn'}
                        </span>
                      </>
                    )}
                  </motion.button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleSaveDraft}
                      disabled={!currentInput.trim() || isSaving}
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 px-4 py-3 rounded-xl font-medium flex items-center justify-center space-x-2 transition-colors disabled:cursor-not-allowed text-sm"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Draft</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handlePauseStory}
                      disabled={isSaving}
                      className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 px-4 py-3 rounded-xl font-medium flex items-center justify-center space-x-2 transition-colors disabled:cursor-not-allowed text-sm"
                    >
                      <Pause className="w-4 h-4" />
                      <span>Pause</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* FIXED: Story Stats with better visual hierarchy */}
            <div className="bg-gray-800/50 border border-gray-600/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                Story Progress
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">
                    {storySession.childWords}
                  </div>
                  <div className="text-blue-300 text-sm">Your Words</div>
                </div>

                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">
                    {storySession.totalWords}
                  </div>
                  <div className="text-green-300 text-sm">Total Words</div>
                </div>

                <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">
                    {storySession.currentTurn}/6
                  </div>
                  <div className="text-purple-300 text-sm">Current Turn</div>
                </div>

                <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">
                    {storySession.apiCallsUsed}/7
                  </div>
                  <div className="text-orange-300 text-sm">AI Calls Used</div>
                </div>
              </div>

              {/* Progress Ring */}
              <div className="mt-6 flex items-center justify-center">
                <div className="relative w-24 h-24">
                  <svg
                    className="w-24 h-24 transform -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-gray-700"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${progressPercentage * 2.51} 251`}
                      className="text-green-400"
                      initial={{ strokeDasharray: '0 251' }}
                      animate={{
                        strokeDasharray: `${progressPercentage * 2.51} 251`,
                      }}
                      transition={{ duration: 1, ease: 'easeInOut' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FIXED: Assessment Modal with better design */}
      <AnimatePresence>
        {showAssessment && assessment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAssessment(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-800 border border-gray-600 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Assessment Header */}
              <div className="text-center mb-8">
                <Award className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">
                  Story Assessment 🌟
                </h2>
                <p className="text-gray-300">
                  Here's how you did on your amazing story!
                </p>
              </div>

              {/* Scores */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-400 mb-2">
                    {assessment.grammarScore}%
                  </div>
                  <div className="text-blue-300 font-medium">
                    Grammar & Writing
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                    <motion.div
                      className="bg-blue-400 h-2 rounded-full transition-all duration-1000"
                      initial={{ width: 0 }}
                      animate={{ width: `${assessment.grammarScore}%` }}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-400 mb-2">
                    {assessment.creativityScore}%
                  </div>
                  <div className="text-purple-300 font-medium">
                    Creativity & Ideas
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                    <motion.div
                      className="bg-purple-400 h-2 rounded-full transition-all duration-1000 delay-300"
                      initial={{ width: 0 }}
                      animate={{ width: `${assessment.creativityScore}%` }}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-4xl font-bold text-green-400 mb-2">
                    {assessment.overallScore}%
                  </div>
                  <div className="text-green-300 font-medium">
                    Overall Score
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                    <motion.div
                      className="bg-green-400 h-2 rounded-full transition-all duration-1000 delay-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${assessment.overallScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Feedback */}
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-400" />
                  AI Teacher Feedback
                </h3>
                <p className="text-gray-200 leading-relaxed">
                  {assessment.feedback}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    setShowAssessment(false);
                    router.push('/children-dashboard/my-stories');
                  }}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-6 py-4 rounded-xl font-semibold flex items-center justify-center space-x-2"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>View All Stories</span>
                </button>

                <button
                  onClick={() => {
                    setShowAssessment(false);
                    router.push('/create-stories');
                  }}
                  className="bg-blue-500 hover:bg-blue-600 px-6 py-4 rounded-xl font-semibold flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Write New Story</span>
                </button>

                <button
                  onClick={() => setShowAssessment(false)}
                  className="bg-gray-600 hover:bg-gray-700 px-6 py-4 rounded-xl font-semibold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
