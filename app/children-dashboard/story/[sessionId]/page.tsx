// // app/children-dashboard/story/[sessionId]/page.tsx (UPDATED)
// 'use client';

// import { useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
// import { motion, AnimatePresence } from 'framer-motion';
// import { 
//   ArrowLeft, 
//   Save, 
//   Pause, 
//   Send, 
//   Clock,
//   BookOpen,
//   Sparkles,
//   Target,
//   TrendingUp
// } from 'lucide-react';
// import Link from 'next/link';
// import { useToast } from '@/hooks/use-toast';
// import WritingInterface from '@/components/writing/WritingInterface';
// import StoryTimeline from '@/components/writing/StoryTimeline';
// import ProgressTracker from '@/components/writing/ProgressTracker';
// import AssessmentModal from '@/components/stories/AssessmentModal';

// interface StorySession {
//   _id: string;
//   title: string;
//   elements: {
//     genre: string;
//     character: string;
//     setting: string;
//     theme: string;
//     mood: string;
//     tone: string;
//   };
//   currentTurn: number;
//   totalWords: number;
//   apiCallsUsed: number;
//   maxApiCalls: number;
//   status: 'active' | 'completed' | 'paused';
// }

// interface Turn {
//   turnNumber: number;
//   childInput: string;
//   aiResponse: string;
//   wordCount: number;
//   timestamp: string;
// }

// export default function StoryWritingPage({ params }: { params: { sessionId: string } }) {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const { toast } = useToast();
//   const { sessionId } = params;

//   const [storySession, setStorySession] = useState<StorySession | null>(null);
//   const [turns, setTurns] = useState<Turn[]>([]);
//   const [aiOpening, setAiOpening] = useState<string>(''); // ✅ Add AI opening state
//   const [currentInput, setCurrentInput] = useState('');
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showAssessment, setShowAssessment] = useState(false);
//   const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

//   useEffect(() => {
//     if (status === 'loading') return;
    
//     if (!session || session.user.role !== 'child') {
//       router.push('/login/child');
//       return;
//     }

//     fetchStorySession();
//   }, [session, status, sessionId]);

//   // Auto-save functionality
//   useEffect(() => {
//     if (!currentInput.trim() || autoSaveStatus === 'saving') return;

//     setAutoSaveStatus('unsaved');
    
//     const autoSaveTimer = setTimeout(() => {
//       handleAutoSave();
//     }, 3000);

//     return () => clearTimeout(autoSaveTimer);
//   }, [currentInput]);

//   const fetchStorySession = async () => {
//     try {
//       const response = await fetch(`/api/stories/session/${sessionId}`);
//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to fetch story session');
//       }

//       setStorySession(data.session);
//       setTurns(data.turns || []);
//       setAiOpening(data.aiOpening || ''); // ✅ Set AI opening

//       // Check if story is completed
//       if (data.session.status === 'completed') {
//         setShowAssessment(true);
//       }

//     } catch (error) {
//       console.error('Error fetching story session:', error);
//       toast({
//         title: "❌ Error",
//         description: "Failed to load your story. Please try again.",
//         variant: "destructive",
//       });
//       router.push('/children-dashboard');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleAutoSave = async () => {
//     if (!currentInput.trim()) return;

//     setAutoSaveStatus('saving');
    
//     try {
//       // This would save the draft - for now we'll just simulate
//       await new Promise(resolve => setTimeout(resolve, 500));
//       setAutoSaveStatus('saved');
//     } catch (error) {
//       setAutoSaveStatus('unsaved');
//     }
//   };

//   const handleSubmitTurn = async () => {
//     if (!currentInput.trim() || !storySession || isSubmitting) return;

//     setIsSubmitting(true);

//     try {
//       const response = await fetch('/api/stories/ai-respond', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           sessionId: storySession._id,
//           childInput: currentInput.trim(),
//           turnNumber: storySession.currentTurn,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to submit turn');
//       }

//       // Add new turn to the list
//       const newTurn: Turn = {
//         turnNumber: storySession.currentTurn,
//         childInput: currentInput.trim(),
//         aiResponse: data.aiResponse,
//         wordCount: data.session.totalWords - storySession.totalWords,
//         timestamp: new Date().toISOString(),
//       };

//       setTurns([...turns, newTurn]);
      
//       // Update session data
//       setStorySession({
//         ...storySession,
//         currentTurn: data.session.currentTurn,
//         totalWords: data.session.totalWords,
//         apiCallsUsed: data.session.apiCallsUsed,
//         status: data.session.status,
//       });

//       // Clear input and AI opening (since we now have real turns)
//       setCurrentInput('');
//       setAiOpening(''); // ✅ Clear AI opening after first turn
//       setAutoSaveStatus('saved');

//       // Check if story is completed
//       if (data.session.completed) {
//         toast({
//           title: "🎉 Story Completed!",
//           description: "Your amazing adventure is finished! Let's see how you did.",
//         });
//         setShowAssessment(true);
//       } else {
//         toast({
//           title: "✨ Great Turn!",
//           description: "The AI has responded. Keep the story going!",
//         });
//       }

//     } catch (error) {
//       console.error('Error submitting turn:', error);
//       toast({
//         title: "❌ Error",
//         description: error instanceof Error ? error.message : "Failed to submit turn. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handlePauseStory = async () => {
//     setIsSaving(true);
    
//     try {
//       // This would pause the story session
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       toast({
//         title: "⏸️ Story Paused",
//         description: "Your story has been saved. You can continue anytime!",
//       });
      
//       router.push('/children-dashboard');
//     } catch (error) {
//       toast({
//         title: "❌ Error",
//         description: "Failed to pause story. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   if (status === 'loading' || isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
//         <div className="text-white text-center">
//           <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
//           <p>Loading your story...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!session || session.user.role !== 'child' || !storySession) {
//     return null;
//   }

//   return (
//     <div className="min-h-screen p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
//       {/* Progress Tracker */}
//       <ProgressTracker 
//         session={storySession}
//         className="mb-6"
//       />

//       {/* Story Elements */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="mb-6 p-4 bg-gray-800/40 backdrop-blur-xl border border-gray-600/40 rounded-xl"
//       >
//         <h3 className="text-white font-semibold mb-3 flex items-center">
//           <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
//           Story Elements
//         </h3>
//         <div className="flex flex-wrap gap-2">
//           {Object.entries(storySession.elements).map(([type, value]) => (
//             <span
//               key={type}
//               className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-sm text-white"
//             >
//               {value}
//             </span>
//           ))}
//         </div>
//       </motion.div>

//       {/* Writing Interface */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Left Column - Story Timeline */}
//         <motion.div
//           initial={{ opacity: 0, x: -20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ delay: 0.2 }}
//         >
//           <StoryTimeline 
//             turns={turns}
//             currentTurn={storySession.currentTurn}
//             aiOpening={aiOpening} // ✅ Pass AI opening
//             storyElements={storySession.elements} // ✅ Pass story elements
//           />
//         </motion.div>

//         {/* Right Column - Writing Area */}
//         <motion.div
//           initial={{ opacity: 0, x: 20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ delay: 0.4 }}
//         >
//           <WritingInterface
//             currentInput={currentInput}
//             onInputChange={setCurrentInput}
//             onSubmit={handleSubmitTurn}
//             isSubmitting={isSubmitting}
//             session={storySession}
//             turnNumber={storySession.currentTurn}
//           />
//         </motion.div>
//       </div>

//       {/* Assessment Modal */}
//       <AssessmentModal
//         isOpen={showAssessment}
//         onClose={() => setShowAssessment(false)}
//         storySession={storySession}
//         turns={turns}
//       />
//     </div>
//   );
// }

// app/children-dashboard/story/[sessionId]/page.tsx (UPDATED WITH LOADING STATES)
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import WritingInterface from '@/components/writing/WritingInterface';
import StoryTimeline from '@/components/writing/StoryTimeline';
import ProgressTracker from '@/components/writing/ProgressTracker';
import AssessmentModal from '@/components/stories/AssessmentModal';

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
  apiCallsUsed: number;
  maxApiCalls: number;
  status: 'active' | 'completed' | 'paused';
}

interface Turn {
  turnNumber: number;
  childInput: string;
  aiResponse: string;
  wordCount: number;
  timestamp: string;
}

export default function StoryWritingPage({ params }: { params: { sessionId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const { sessionId } = params;

  const [storySession, setStorySession] = useState<StorySession | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [aiOpening, setAiOpening] = useState<string>('');
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false); // ✅ Add AI typing state
  const [showAssessment, setShowAssessment] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'child') {
      router.push('/login/child');
      return;
    }

    fetchStorySession();
  }, [session, status, sessionId]);

  const fetchStorySession = async () => {
    try {
      const response = await fetch(`/api/stories/session/${sessionId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch story session');
      }

      setStorySession(data.session);
      setTurns(data.turns || []);
      setAiOpening(data.aiOpening || '');

      if (data.session.status === 'completed') {
        setShowAssessment(true);
      }

    } catch (error) {
      console.error('Error fetching story session:', error);
      toast({
        title: "❌ Error",
        description: "Failed to load your story. Please try again.",
        variant: "destructive",
      });
      router.push('/children-dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitTurn = async () => {
    if (!currentInput.trim() || !storySession || isSubmitting) return;

    setIsSubmitting(true);
    setIsAiTyping(true); // ✅ Show AI typing immediately

    try {
      // ✅ Add artificial delay to simulate AI thinking (2-3 seconds)
      const startTime = Date.now();
      
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
        throw new Error(data.error || 'Failed to submit turn');
      }

      // ✅ Ensure minimum 2 seconds of "AI typing" for better UX
      const elapsedTime = Date.now() - startTime;
      const minDelay = 2000; // 2 seconds minimum
      if (elapsedTime < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsedTime));
      }

      // Add new turn to the list
      const newTurn: Turn = {
        turnNumber: storySession.currentTurn,
        childInput: currentInput.trim(),
        aiResponse: data.turn.aiResponse,
        wordCount: data.turn.wordCount,
        timestamp: new Date().toISOString(),
      };

      setTurns([...turns, newTurn]);
      
      // Update session data
      setStorySession({
        ...storySession,
        currentTurn: data.session.currentTurn,
        totalWords: data.session.totalWords,
        apiCallsUsed: data.session.apiCallsUsed,
        status: data.session.status,
      });

      // Clear input and AI opening
      setCurrentInput('');
      setAiOpening('');

      // Check if story is completed
      if (data.session.completed) {
        toast({
          title: "🎉 Story Completed!",
          description: "Your amazing adventure is finished! Let's see how you did.",
        });
        setShowAssessment(true);
      } else {
        toast({
          title: "✨ Great Turn!",
          description: "The AI has responded. Keep the story going!",
        });
      }

    } catch (error) {
      console.error('Error submitting turn:', error);
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Failed to submit turn. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsAiTyping(false); // ✅ Hide AI typing
    }
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

  if (!session || session.user.role !== 'child' || !storySession) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-gray-800/80 backdrop-blur-xl border-b border-gray-600/40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/children-dashboard">
                <motion.button
                  whileHover={{ x: -2 }}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden sm:block">Back to Dashboard</span>
                </motion.button>
              </Link>
              <div className="border-l border-gray-600 pl-4">
                <h1 className="text-white font-semibold text-lg">✍️ {storySession.title}</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {session.user.firstName.charAt(0)}
                </span>
              </div>
              <span className="text-white text-sm">{session.user.firstName}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 p-4 sm:p-6 lg:p-8">
        {/* Progress Tracker */}
        <ProgressTracker session={storySession} className="mb-6" />

        {/* Story Elements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gray-800/40 backdrop-blur-xl border border-gray-600/40 rounded-xl"
        >
          <h3 className="text-white font-semibold mb-3 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
            Your Story Elements
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(storySession.elements).map(([type, value]) => (
              <span
                key={type}
                className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-sm text-white"
              >
                {value}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Writing Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Story Chat */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StoryTimeline 
              turns={turns}
              currentTurn={storySession.currentTurn}
              aiOpening={aiOpening}
              storyElements={storySession.elements}
              isAiTyping={isAiTyping} // ✅ Pass AI typing state
            />
          </motion.div>

          {/* Right Column - Writing Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <WritingInterface
              currentInput={currentInput}
              onInputChange={setCurrentInput}
              onSubmit={handleSubmitTurn}
              isSubmitting={isSubmitting}
              session={storySession}
              turnNumber={storySession.currentTurn}
            />
          </motion.div>
        </div>

        {/* Assessment Modal */}
        <AssessmentModal
          isOpen={showAssessment}
          onClose={() => setShowAssessment(false)}
          storySession={storySession}
          turns={turns}
        />
      </main>
    </div>
  );
}