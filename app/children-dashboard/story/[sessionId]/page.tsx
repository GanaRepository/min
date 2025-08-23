'use client';

// app/children-dashboard/story/[sessionId]/page.tsx - FIXED INPUT VISIBILITY

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import TerminalLoader from '../../../../components/TerminalLoader';
import {
  ArrowLeft,
  Send,
  Save,
  CheckCircle,
  BookOpen,
  Target,
  Award,
  Brain,
  Zap,
  Edit3,
  Check,
  X,
  User,
  Bot,
  Clock,
  Lightbulb,
  Trophy,
  Star,
  MessageCircle,
  FileText,
  Wand2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StorySession {
  _id: string;
  title: string;
  elements?: {
    genre?: string;
    character?: string;
    setting?: string;
    theme?: string;
    mood?: string;
    tone?: string;
  };
  currentTurn: number;
  totalWords: number;
  childWords: number;
  apiCallsUsed: number;
  maxApiCalls: number;
  status: 'active' | 'completed' | 'paused';
  aiOpening?: string;
  assessment?: any;
  assessmentAttempts: number;
  isUploadedForAssessment?: boolean;
}

interface Turn {
  _id: string;
  turnNumber: number;
  childInput: string;
  aiResponse: string;
  childWordCount: number;
  aiWordCount: number;
  timestamp: Date;
}

interface Assessment {
  overallScore: number;
  categoryScores: {
    grammar: number;
    creativity: number;
    vocabulary: number;
    structure: number;
    characterDevelopment: number;
    plotDevelopment: number;
  };
  feedback: string;
  integrityStatus: string;
  aiDetectionScore: number;
}

export default function StoryWritingInterface({
  params,
}: {
  params: { sessionId: string };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const { sessionId } = params;

  // Core state
  const [storySession, setStorySession] = useState<StorySession | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentInput, setCurrentInput] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isValid, setIsValid] = useState(false);

  // Action states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loadingAssessment, setLoadingAssessment] = useState(false);

  // Title editing
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [isSavingTitle, setIsSavingTitle] = useState(false);

  // Refs
  const storyTimelineRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const maxTurns = 7;

  // Auto-fetch assessment when story is completed
  useEffect(() => {
    const fetchAssessment = async () => {
      const childTurns = turns.filter(
        (turn) => turn.childInput && turn.childInput.trim()
      );

      // Only try to fetch if story is completed and we don't have assessment yet
      if (childTurns.length >= 7 && !assessment && !loadingAssessment) {
        setLoadingAssessment(true);
        try {
          console.log('🎯 Fetching assessment for completed story...');
          const response = await fetch(`/api/stories/assessment/${sessionId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.assessment) {
              setAssessment(data.assessment);
              console.log('✅ Assessment loaded successfully');
            }
          } else {
            console.log(
              '⚠️ No assessment available yet, may still be generating...'
            );
          }
        } catch (error) {
          console.error('Error fetching assessment:', error);
        } finally {
          setLoadingAssessment(false);
        }
      }
    };

    if (turns.length > 0) {
      fetchAssessment();
    }
  }, [turns, sessionId, assessment, loadingAssessment]);

  // Auto-show assessment modal when story is completed and assessment is available
  useEffect(() => {
    const childTurns = turns.filter(
      (turn) => turn.childInput && turn.childInput.trim()
    );

    if (childTurns.length >= 7 && assessment && !showAssessment) {
      // Small delay to allow UI to update before showing modal
      const timer = setTimeout(() => {
        setShowAssessment(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [turns, assessment, showAssessment]);

  const fetchStoryData = useCallback(async () => {
    try {
      setIsLoading(true);

      const [sessionResponse, turnsResponse] = await Promise.all([
        fetch(`/api/stories/session/${sessionId}`),
        fetch(`/api/stories/session/${sessionId}/turns`),
      ]);

      if (!sessionResponse.ok || !turnsResponse.ok) {
        throw new Error('Failed to fetch story data');
      }

      const sessionData = await sessionResponse.json();
      const turnsData = await turnsResponse.json();

      // FIXED: Extract session from the nested response structure
      const actualSession = sessionData.session || sessionData;

      setStorySession(actualSession);

      // FIXED: Use the structured turns data with proper filtering
      const allTurns = turnsData.turns || [];
      setTurns(allTurns);
      setEditedTitle(actualSession.title || '');

      console.log('📊 Fetched story data:', {
        sessionId: actualSession._id,
        status: actualSession.status,
        allTurns: allTurns.length,
        childTurnsOnly: turnsData.childTurnsOnly?.length || 0,
        sessionInfo: turnsData.sessionInfo,
      });

      // Check if story is completed and has assessment
      if (actualSession.status === 'completed' && actualSession.assessment) {
        setAssessment(actualSession.assessment);
        console.log('✅ Assessment found for completed story');
        // Automatically show assessment modal for completed stories
        setTimeout(() => setShowAssessment(true), 1000);
      } else if (
        actualSession.status === 'completed' &&
        !actualSession.assessment
      ) {
        console.log(
          '⚠️ Story completed but no assessment found - may need to trigger assessment'
        );
      }
    } catch (error) {
      console.error('Error fetching story data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load story. Please try again.',
        variant: 'destructive',
      });
      router.push('/children-dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, toast, router]);

  // Load story session and turns
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchStoryData();
  }, [sessionId, session, status, router, fetchStoryData]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + 'px';
    }
  }, [currentInput]);

  // Focus title input when editing
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Scroll to bottom of timeline
  useEffect(() => {
    if (storyTimelineRef.current) {
      storyTimelineRef.current.scrollTop =
        storyTimelineRef.current.scrollHeight;
    }
  }, [turns, isAIGenerating]);

  // Auto-show assessment modal when assessment becomes available
  useEffect(() => {
    if (assessment && !showAssessment && storySession?.status === 'completed') {
      console.log('🎯 Assessment available - showing modal');
      setShowAssessment(true);
    }
  }, [assessment, showAssessment, storySession?.status]);

  const handleInputChange = (value: string) => {
    setCurrentInput(value);
    const words = value.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);
    setIsValid(words.length >= 60 && words.length <= 100);
  };

  const saveTitle = async () => {
    if (!storySession || !editedTitle.trim()) return;

    setIsSavingTitle(true);
    try {
      const response = await fetch(`/api/stories/session/${storySession._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editedTitle.trim() }),
      });

      if (response.ok) {
        setStorySession((prev) =>
          prev ? { ...prev, title: editedTitle.trim() } : null
        );
        setIsEditingTitle(false);
        toast({
          title: 'Success',
          description: 'Story title updated successfully!',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update title. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingTitle(false);
    }
  };

  const submitTurn = async () => {
    if (!isValid || !storySession || isSubmitting) return;

    setIsSubmitting(true);
    setIsAIGenerating(true);

    try {
      console.log(
        `📝 Submitting turn ${nextTurnNumber} with ${wordCount} words`
      );

      const response = await fetch('/api/stories/collaborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: storySession._id,
          childInput: currentInput.trim(),
          turnNumber: nextTurnNumber, // Use the correct next turn number
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit turn');
      }

      console.log(`✅ Turn ${nextTurnNumber} submitted successfully:`, data);

      // Update session with the response data
      setStorySession((prev) =>
        prev
          ? {
              ...prev,
              currentTurn: data.newTurn.turnNumber,
              totalWords:
                prev.totalWords +
                data.newTurn.childWordCount +
                (data.newTurn.aiWordCount || 0),
              childWords: prev.childWords + data.newTurn.childWordCount,
              status:
                data.newTurn.turnNumber >= maxTurns ? 'completed' : 'active',
              // Include assessment if story is completed
              ...(data.assessment && { assessment: data.assessment }),
            }
          : null
      );

      // Add new turn to the turns array (combining child input and AI response into one display item)
      const newTurnData = {
        _id: data.newTurn._id,
        turnNumber: data.newTurn.turnNumber,
        childInput: data.newTurn.childInput,
        aiResponse: data.newTurn.aiResponse,
        childWordCount: data.newTurn.childWordCount,
        aiWordCount: data.newTurn.aiWordCount,
        timestamp: data.newTurn.timestamp,
      };

      setTurns((prev) => [...prev, newTurnData]);
      setCurrentInput('');
      setWordCount(0);
      setIsValid(false);

      // Handle story completion
      if (data.newTurn.turnNumber >= maxTurns) {
        console.log('🏁 Story completed! Checking for assessment...');
        console.log('Assessment data received:', data.assessment);

        if (data.assessment && data.assessment.fullAssessment) {
          console.log('✅ Full assessment found in response');
          setAssessment(data.assessment.fullAssessment);
          setShowAssessment(true); // Automatically show assessment modal
          toast({
            title: '🎉 Story Complete!',
            description:
              'Amazing work! Your story has been assessed automatically.',
          });
        } else if (data.assessment) {
          console.log('⚠️ Partial assessment found, using fallback');
          setAssessment(data.assessment);
          setShowAssessment(true);
          toast({
            title: '🎉 Story Complete!',
            description:
              'Amazing work! Your story has been assessed automatically.',
          });
        } else {
          // If no assessment in response, trigger it manually
          console.log('❌ No assessment found, triggering manual assessment');
          toast({
            title: '🎉 Story Complete!',
            description: 'Generating your assessment...',
          });

          setTimeout(() => {
            triggerAssessment();
          }, 1000); // Reduced delay from 2000 to 1000
        }
      } else {
        toast({
          title: 'Turn Submitted!',
          description: `Turn ${data.newTurn.turnNumber} submitted successfully!`,
        });
      }
    } catch (error: any) {
      console.error('Error submitting turn:', error);
      toast({
        title: 'Error',
        description:
          error.message || 'Failed to submit turn. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setIsAIGenerating(false);
    }
  };

  const triggerAssessment = async () => {
    if (!storySession) {
      console.error('❌ No story session found for assessment');
      return;
    }

    try {
      console.log('🎯 Triggering assessment for completed story...');
      console.log('Story session ID:', storySession._id);
      console.log('Story status:', storySession.status);
      
      const response = await fetch(
        `/api/stories/assessment/${storySession._id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      console.log('Assessment response:', data);

      if (response.ok && data.success) {
        console.log('✅ Assessment completed successfully');
        setAssessment(data.assessment);
        setShowAssessment(true); // Show the assessment modal
        setStorySession((prev) =>
          prev
            ? {
                ...prev,
                assessment: data.assessment,
                status: 'completed',
              }
            : null
        );

        toast({
          title: '🎉 Story Complete!',
          description: 'Your story has been assessed. Check out your results!',
        });
      } else {
        console.error('❌ Assessment failed:', data.error);
        console.error('Response status:', response.status);
        console.error('Full response:', data);
        
        toast({
          title: 'Assessment Error',
          description:
            data.error || 'Failed to generate assessment. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error triggering assessment:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate assessment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const saveDraft = async () => {
    if (!storySession || !currentInput.trim()) return;

    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/stories/session/${storySession._id}/draft`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ draftContent: currentInput }),
        }
      );

      if (response.ok) {
        toast({
          title: 'Draft Saved',
          description: 'Your progress has been saved.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save draft.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-green-900 flex items-center justify-center">
        <TerminalLoader
          title="Story"
          loadingText="Loading your story..."
          size="md"
        />
      </div>
    );
  }

  if (!storySession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-green-900 flex items-center justify-center">
        <TerminalLoader title="Story" loadingText="Story not found" size="md" />
      </div>
    );
  }

  const isCompleted = storySession.status === 'completed';

  // FIXED: Calculate turns correctly - only count child inputs, not AI responses
  const childTurns = turns.filter(
    (turn) => turn.childInput && turn.childInput.trim()
  );
  const actualCompletedTurns = childTurns.length;
  const nextTurnNumber = actualCompletedTurns + 1;

  // Can write if story is active and we haven't reached max turns
  const canWrite =
    storySession.status === 'active' && nextTurnNumber <= maxTurns;

  // Progress calculation based on actual completed child turns
  const turnsCompleted = Math.min(actualCompletedTurns, maxTurns);
  const progressPercentage = isCompleted
    ? 100
    : Math.round((turnsCompleted / maxTurns) * 100);

  // DEBUG: Log the corrected values
  console.log('DEBUG - Story Session (REALLY FIXED):', {
    allTurns: turns.length,
    childTurnsOnly: childTurns.length,
    actualCompletedTurns,
    nextTurnNumber,
    maxTurns,
    status: storySession.status,
    canWrite,
    isCompleted,
    turnsCompleted,
    progressPercentage,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-green-900">
      {/* Header */}
      <div className=" backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/children-dashboard')}
                className="p-2 hover:bg-gray-700/50  transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600  flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>

                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      ref={titleInputRef}
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="bg-gray-800 text-white px-3 py-1  border border-gray-600 focus:border-purple-500 focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveTitle();
                        if (e.key === 'Escape') setIsEditingTitle(false);
                      }}
                    />
                    <button
                      onClick={saveTitle}
                      disabled={isSavingTitle}
                      className="p-1 hover:bg-green-600/20 rounded text-green-400"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsEditingTitle(false)}
                      className="p-1 hover:bg-red-600/20 rounded text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-white text-xl ">
                      {storySession.title}
                    </h1>
                    <button
                      onClick={() => setIsEditingTitle(true)}
                      className="p-1 hover:bg-gray-700/50 rounded text-gray-400"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isCompleted && assessment && (
                <button
                  onClick={() => setShowAssessment(true)}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white   hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  View Assessment
                </button>
              )}

              <div className="text-right">
                <div className="text-sm text-gray-400">
                  Turn{' '}
                  {isCompleted ? maxTurns : Math.min(nextTurnNumber, maxTurns)}{' '}
                  of {maxTurns}
                </div>
                <div className="text-xs text-gray-500">
                  {storySession.childWords} words written
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Story Progress</span>
              <span className="text-sm text-purple-400 ">
                {progressPercentage}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-700  h-2">
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 "
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Story Timeline - Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white  text-lg flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-purple-400" />
                  Story Conversation
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4" />
                  Collaborative Writing
                </div>
              </div>

              {/* Timeline */}
              <div
                ref={storyTimelineRef}
                className="space-y-6 max-h-[130vh] overflow-y-auto pr-4 custom-scrollbar"
              >
                {/* AI Opening */}
                {storySession.aiOpening && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-end"
                  >
                    <div className="flex items-start space-x-3 max-w-[85%]">
                      <div className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-500/30  p-4 rounded-br-none">
                        <div className="flex items-center gap-2 mb-2">
                          <Bot className="w-4 h-4 text-green-400" />
                          <span className="text-green-300  text-sm">
                            AI Writing Partner
                          </span>
                        </div>
                        <p className="text-gray-200 leading-relaxed">
                          {storySession.aiOpening}
                        </p>
                      </div>
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600  flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Turns */}
                {turns.map((turn, index) => (
                  <div key={turn._id}>
                    {/* Child Input */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex justify-start mb-4"
                    >
                      <div className="flex items-start space-x-3 max-w-[85%]">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600  flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-purple-500/20 border border-purple-500/30  p-4 rounded-bl-none">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-purple-300  text-sm">
                                You
                              </span>
                              <span className="text-xs text-gray-400">
                                Turn {turn.turnNumber}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {turn.childWordCount} words
                            </span>
                          </div>
                          <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                            {turn.childInput}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* AI Response */}
                    {turn.aiResponse && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.05 }}
                        className="flex justify-end"
                      >
                        <div className="flex items-start space-x-3 max-w-[85%]">
                          <div className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-500/30  p-4 rounded-br-none">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Bot className="w-4 h-4 text-green-400" />
                                <span className="text-green-300  text-sm">
                                  AI Partner
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {turn.aiWordCount || 0} words
                              </span>
                            </div>
                            <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                              {turn.aiResponse}
                            </p>
                          </div>
                          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600  flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}

                {/* AI Generating Indicator */}
                {isAIGenerating && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-end"
                  >
                    <div className="flex items-start space-x-3 max-w-[85%]">
                      <div className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-500/30  p-4 rounded-br-none">
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4 text-green-400" />
                          <span className="text-green-300  text-sm">
                            AI Partner
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 mt-2">
                          <div className="w-2 h-2 bg-green-400  animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-green-400  animate-bounce"
                            style={{ animationDelay: '0.1s' }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-green-400  animate-bounce"
                            style={{ animationDelay: '0.2s' }}
                          ></div>
                          <span className="text-green-300 text-sm ml-2">
                            Writing response...
                          </span>
                        </div>
                      </div>
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600  flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Start Writing Message for Turn 1 */}
                {nextTurnNumber === 1 && turns.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <div className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 border border-purple-500/30  p-6">
                      <Edit3 className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                      <h3 className="text-white  text-lg mb-2">
                        Ready to Start Your Story!
                      </h3>
                      <p className="text-gray-300 mb-4">
                        Write your opening scene below (60-100 words). What
                        adventure will you create?
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Completion Message */}
                {isCompleted && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-6"
                  >
                    <div className="bg-gradient-to-r from-yellow-500/20 to-orange-600/20 border border-yellow-500/30  p-6">
                      <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                      <h3 className="text-white  text-lg mb-2">
                        🎉 Story Complete!
                      </h3>
                      <p className="text-gray-300 mb-4">
                        Amazing work! You&apos;ve completed all {maxTurns} turns
                        of your collaborative story.
                      </p>
                      {assessment && (
                        <button
                          onClick={() => setShowAssessment(true)}
                          className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white   hover:from-yellow-600 hover:to-orange-700 transition-all flex items-center gap-2 mx-auto"
                        >
                          <Award className="w-5 h-5" />
                          View Your Assessment
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* FIXED Writing Input - Always show when canWrite is true */}
            {canWrite && (
              <div className="mt-6 bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white  text-lg flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-purple-400" />
                    {nextTurnNumber === 1
                      ? 'Start Your Story!'
                      : `Your Turn ${nextTurnNumber}`}
                  </h3>
                  <div className="flex items-center gap-4">
                    <div
                      className={`text-sm  ${
                        isValid
                          ? 'text-green-400'
                          : wordCount > 100
                            ? 'text-red-400'
                            : 'text-gray-400'
                      }`}
                    >
                      {wordCount}/60-100 words
                    </div>
                    {currentInput.trim() && (
                      <button
                        onClick={saveDraft}
                        disabled={isSaving}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" />
                        {isSaving ? 'Saving...' : 'Save Draft'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <textarea
                    ref={textareaRef}
                    value={currentInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder={
                      nextTurnNumber === 1
                        ? 'Start your amazing story here! Introduce your character, setting, or situation...'
                        : 'Continue your story here... What happens next in your adventure?'
                    }
                    className="w-full bg-gray-900/50 border border-gray-600  p-4 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none min-h-[120px]"
                    disabled={isSubmitting}
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Lightbulb className="w-4 h-4" />
                      Write 60-100 words to{' '}
                      {nextTurnNumber === 1 ? 'begin' : 'continue'} your story
                    </div>

                    <button
                      onClick={submitTurn}
                      disabled={!isValid || isSubmitting}
                      className={`px-6 py-3   transition-all flex items-center gap-2 ${
                        isValid && !isSubmitting
                          ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white  animate-spin"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          {nextTurnNumber === 1
                            ? 'Start Story!'
                            : 'Submit Turn'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Story Stats */}
            <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-6">
              <h3 className="text-white  text-lg mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                Story Stats
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Current Turn</span>
                  <span className="text-white ">
                    {isCompleted
                      ? maxTurns
                      : Math.min(nextTurnNumber, maxTurns)}{' '}
                    / {maxTurns}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Your Words</span>
                  <span className="text-white ">{storySession.childWords}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Words</span>
                  <span className="text-white ">{storySession.totalWords}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status</span>
                  <span
                    className={` ${
                      isCompleted ? 'text-green-400' : 'text-blue-400'
                    }`}
                  >
                    {isCompleted ? 'Completed' : 'In Progress'}
                  </span>
                </div>
              </div>
            </div>

            {/* Writing Tips */}
            <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-6">
              <h3 className="text-white  text-lg mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                Writing Tips
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Star className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">
                    Be creative! Add unique details that make your story
                    special.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <Brain className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">
                    Think about what your characters are feeling and why.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <Zap className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">
                    Use exciting action words to make scenes come alive.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <Trophy className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">
                    Remember: 60-100 words per turn works best for great
                    stories!
                  </p>
                </div>
              </div>
            </div>

            {/* Turn Guidelines */}
            <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-6">
              <h3 className="text-white  text-lg mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-400" />
                Turn Guidelines
              </h3>

              <div className="space-y-3 text-sm">
                {[1, 2, 3, 4, 5, 6, 7].map((turnNum) => (
                  <div
                    key={turnNum}
                    className={`flex items-center gap-3 p-2  transition-colors ${
                      nextTurnNumber === turnNum && !isCompleted
                        ? 'bg-purple-500/20 border border-purple-500/30'
                        : actualCompletedTurns >= turnNum || isCompleted
                          ? 'bg-green-500/10'
                          : 'bg-gray-700/30'
                    }`}
                  >
                    <div
                      className={`w-6 h-6  flex items-center justify-center text-xs  ${
                        actualCompletedTurns >= turnNum || isCompleted
                          ? 'bg-green-500 text-white'
                          : nextTurnNumber === turnNum && !isCompleted
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      {actualCompletedTurns >= turnNum || isCompleted ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        turnNum
                      )}
                    </div>

                    <span
                      className={`${
                        nextTurnNumber === turnNum && !isCompleted
                          ? 'text-purple-300 '
                          : actualCompletedTurns >= turnNum || isCompleted
                            ? 'text-green-300'
                            : 'text-gray-400'
                      }`}
                    >
                      {turnNum === 7
                        ? 'Final Turn & Assessment'
                        : `Turn ${turnNum}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assessment Loading */}
            {loadingAssessment && isCompleted && (
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30  p-6">
                <h3 className="text-white  text-lg mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-400 animate-pulse" />
                  Generating Assessment...
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-400  animate-pulse"></div>
                    <span className="text-gray-300">
                      Analyzing creativity...
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-400  animate-pulse"></div>
                    <span className="text-gray-300">Checking grammar...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400  animate-pulse"></div>
                    <span className="text-gray-300">
                      Evaluating structure...
                    </span>
                  </div>
                </div>

                <p className="text-gray-400 text-sm mt-4">
                  Please wait while we create your detailed assessment...
                </p>
              </div>
            )}

            {/* Assessment Preview */}
            {assessment && (
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-500/30  p-6">
                <h3 className="text-white  text-lg mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  Assessment Ready!
                </h3>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Overall Score</span>
                    <span className="text-white  text-lg">
                      {assessment.overallScore}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Creativity</span>
                    <span className="text-green-400 ">
                      {assessment.categoryScores?.creativity || 0}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Grammar</span>
                    <span className="text-blue-400 ">
                      {assessment.categoryScores?.grammar || 0}%
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowAssessment(true)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white   hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  <Award className="w-5 h-5" />
                  View Full Assessment
                </button>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-6">
              <h3 className="text-white  text-lg mb-4 flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-400" />
                Quick Actions
              </h3>

              <div className="space-y-3">
                <button
                  onClick={() => router.push('/children-dashboard/my-stories')}
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300  transition-colors flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  My Stories
                </button>

                <button
                  onClick={() =>
                    router.push('/children-dashboard/create-stories')
                  }
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300  transition-colors flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  New Story
                </button>

                <button
                  onClick={() =>
                    router.push('/children-dashboard/competitions')
                  }
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300  transition-colors flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  Competitions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Modal */}
      <AnimatePresence>
        {showAssessment && assessment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAssessment(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600  flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white text-2xl ">Story Assessment</h2>
                    <p className="text-gray-400">
                      Your creative writing analysis
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowAssessment(false)}
                  className="p-2 hover:bg-gray-800  transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* Overall Score */}
              <div className="text-center mb-8">
                <div className="w-32 h-32 mx-auto mb-4 relative">
                  <svg
                    className="w-32 h-32 transform -rotate-90"
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
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - assessment.overallScore / 100)}`}
                      className={`transition-all duration-1000 ease-out ${
                        assessment.overallScore >= 80
                          ? 'text-green-500'
                          : assessment.overallScore >= 60
                            ? 'text-yellow-500'
                            : 'text-red-500'
                      }`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl  text-white">
                      {assessment.overallScore}%
                    </span>
                  </div>
                </div>

                <h3 className="text-white text-xl  mb-2">
                  Overall Score: {assessment.overallScore}%
                </h3>
                <p className="text-gray-400">
                  {assessment.overallScore >= 80
                    ? 'Excellent work!'
                    : assessment.overallScore >= 60
                      ? 'Good job!'
                      : 'Keep practicing!'}
                </p>
              </div>

              {/* Category Scores */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {assessment.categoryScores &&
                  Object.entries(assessment.categoryScores).map(
                    ([category, score]) => (
                      <div key={category} className="bg-gray-800/50  p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-300 capitalize">
                            {category.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="text-white ">
                            {score as number}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700  h-2">
                          <div
                            className={`h-2  transition-all duration-1000 ease-out ${
                              (score as number) >= 80
                                ? 'bg-green-500'
                                : (score as number) >= 60
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    )
                  )}
              </div>

              {/* Integrity Status */}
              <div className="bg-gray-800/50  p-6 mb-8">
                <h4 className="text-white  text-lg mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Integrity Analysis
                </h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Content Status</span>
                    <span
                      className={` ${
                        assessment.integrityStatus === 'original'
                          ? 'text-green-400'
                          : assessment.integrityStatus === 'questionable'
                            ? 'text-yellow-400'
                            : 'text-red-400'
                      }`}
                    >
                      {assessment.integrityStatus === 'original'
                        ? 'Original'
                        : assessment.integrityStatus === 'questionable'
                          ? 'Needs Review'
                          : 'Flagged'}
                    </span>
                  </div>

                  {assessment.aiDetectionScore !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">AI Detection</span>
                      <span className="text-gray-400">
                        {assessment.aiDetectionScore}% AI likelihood
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Feedback */}
              {assessment.feedback && (
                <div className="bg-blue-500/10 border border-blue-500/30  p-6">
                  <h4 className="text-white  text-lg mb-3 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-400" />
                    Teacher Feedback
                  </h4>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {assessment.feedback}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowAssessment(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white   transition-colors"
                >
                  Close
                </button>

                <button
                  onClick={() => {
                    setShowAssessment(false);
                    router.push('/children-dashboard/my-stories');
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white   transition-all"
                >
                  View All Stories
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(75, 85, 99, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </div>
  );
}
