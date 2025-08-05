'use client';

import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Sparkles,
  BookOpen,
  Users,
  Target,
  Palette,
  Star,
  Compass,
  Wand2,
  HelpCircle,
  Rocket,
  Smile,
  Heart,
  Castle,
  Baby,
  TreePine,
  Waves,
  Building,
  Home,
  Mountain,
  Sun,
  Eye,
  Gamepad2,
  Crown,
  Shield,
  Flame,
  Zap,
  Gift,
  Sword,
  Trophy,
  HandHeart,
  Award,
  TrendingUp,
  UserCheck,
  Play,
  ArrowRight,
  Check,
  ChevronRight,
  PenTool,
  MessageSquare,
  Lightbulb,
  Brain,
  Globe,
  Clock,
  CheckCircle,
  Feather,
  Share2,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { STORY_ELEMENTS } from '@/config/story-elements';
import Link from 'next/link';
import { DiamondSeparator } from '@/components/seperators/DiamondSeparator';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import StoryModeSelection from '@/components/stories/StoryModeSelection';
import FreeformStoryCreator from '@/components/stories/FreeformStoryCreator';

interface SelectedElements {
  genre: string;
  character: string;
  setting: string;
  theme: string;
  mood: string;
  tone: string;
  [key: string]: string;
}

const steps = [
  {
    id: 'genre',
    title: 'Choose Your Genre',
    description: 'What type of story excites you?',
  },
  {
    id: 'character',
    title: 'Pick Your Hero',
    description: 'Who will be the star of your adventure?',
  },
  {
    id: 'setting',
    title: 'Select Your World',
    description: 'Where will your story take place?',
  },
  {
    id: 'theme',
    title: 'Choose Your Theme',
    description: 'What will your story be about?',
  },
  {
    id: 'mood',
    title: 'Set the Mood',
    description: 'How should your story feel?',
  },
  {
    id: 'tone',
    title: 'Pick Your Tone',
    description: 'What style fits your story?',
  },
];

function CreateStoriesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [storyMode, setStoryMode] = useState<'selection' | 'guided' | 'freeform'>('selection');
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedElements, setSelectedElements] = useState<SelectedElements>({
    genre: '',
    character: '',
    setting: '',
    theme: '',
    mood: '',
    tone: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isProcessingToken, setIsProcessingToken] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Get pending token from URL
  const pendingToken = searchParams?.get('pendingToken');

  // Helper functions
  function isCurrentStepComplete(stepIndex: number) {
    const stepId = steps[stepIndex]?.id;
    return stepId ? selectedElements[stepId] !== '' : false;
  }

  function scrollToStoryElements() {
    const storyElementsSection = document.getElementById('story-elements');
    if (storyElementsSection) {
      storyElementsSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }

  // Mode selection handlers
  const handleModeSelect = (mode: 'guided' | 'freeform') => {
    setStoryMode(mode);
    if (mode === 'guided') {
      scrollToStoryElements();
    }
  };

  const handleBackToModeSelection = () => {
    setStoryMode('selection');
    // Reset any state if needed
    setCurrentStep(0);
    setSelectedElements({
      genre: '',
      character: '',
      setting: '',
      theme: '',
      mood: '',
      tone: '',
    });
  };

 const handleFreeformComplete = async (openingText: string) => {
  if (!session?.user?.id) {
    toast({
      title: '❌ Error',
      description: 'Please log in to create a story.',
      variant: 'destructive',
    });
    return;
  }

  setIsCreating(true);
  try {
    const response = await fetch('/api/stories/create-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        storyMode: 'freeform',
        openingText: openingText.trim()
      }),
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      toast({
        title: '🎉 Story Created!',
        description: 'Your story adventure begins!',
      });
      router.push(`/children-dashboard/story/${data.session.id}`);
    } else {
      throw new Error(data.error || 'Failed to create story');
    }
  } catch (error) {
    console.error('Error creating freeform story:', error);
    toast({
      title: '❌ Error',
      description: error instanceof Error ? error.message : 'Failed to create story. Please try again.',
      variant: 'destructive',
    });
  } finally {
    setIsCreating(false);
  }
};

  // FIXED: Memoized createStoryFromPendingToken function
  const createStoryFromPendingToken = useCallback(
    async (token: string) => {
      try {
        console.log(
          '🚀 Creating story from pending token:',
          token.substring(0, 8) + '...'
        );

        toast({
          title: '✨ Creating Your Story',
          description: 'Your magical adventure is being prepared...',
        });

        const response = await fetch('/api/stories/create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pendingToken: token }),
        });

        const data = await response.json();
        console.log('📤 Create-session response:', { ok: response.ok, data });

        if (!response.ok || !data.success) {
          throw new Error(
            data.error || 'Failed to create story from saved elements'
          );
        }

        // Success!
        toast({
          title: '🎉 Story Created Successfully!',
          description: 'Your magical adventure begins now!',
        });

        console.log(
          '🎯 Redirecting to story:',
          `/children-dashboard/story/${data.session.id}`
        );

        // Small delay to show success message
        setTimeout(() => {
          router.push(`/children-dashboard/story/${data.session.id}`);
        }, 1500);
      } catch (error) {
        console.error('❌ Error processing pending token:', error);

        toast({
          title: '❌ Error Creating Story',
          description:
            error instanceof Error
              ? error.message
              : 'Please try selecting your story elements again.',
          variant: 'destructive',
        });

        // Fallback to normal story creation
        setIsProcessingToken(false);
        router.replace('/create-stories');
      }
    },
    [toast, router]
  );

  // FIXED: Immediate token processing with proper loading states
  useEffect(() => {
    // Don't run multiple times
    if (hasInitialized) return;

    const processInitialization = async () => {
      console.log('🔄 Initializing create stories page...', {
        pendingToken: !!pendingToken,
        sessionStatus: status,
        hasSession: !!session,
      });

      // Wait for session to load
      if (status === 'loading') {
        console.log('⏳ Waiting for session to load...');
        return;
      }

      // Check authentication
      if (!session || session.user.role !== 'child') {
        console.log('🚫 Not authenticated or not a child, redirecting...');
        router.push('/login/child');
        return;
      }

      // Set initialized flag first to prevent re-runs
      setHasInitialized(true);

      // Process pending token if it exists
      if (pendingToken) {
        console.log('🎫 Found pending token, processing...');
        setIsProcessingToken(true);
        await createStoryFromPendingToken(pendingToken);
      } else {
        console.log('✅ No pending token, showing normal page');
      }
    };

    processInitialization();
  }, [
    pendingToken,
    session,
    status,
    hasInitialized,
    router,
    createStoryFromPendingToken,
  ]);

  // Element selection handlers (existing code)
  const handleElementSelect = (category: string, value: string) => {
    setSelectedElements((prev) => ({
      ...prev,
      [category]: value,
    }));

    // Auto-advance to next step
    const currentStepId = steps[currentStep]?.id;
    if (currentStepId === category && currentStep < steps.length - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 300);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= currentStep || isCurrentStepComplete(stepIndex)) {
      setCurrentStep(stepIndex);
    }
  };

  const createStory = async () => {
    const allElementsSelected = Object.values(selectedElements).every(
      (value) => value !== ''
    );

    if (!allElementsSelected) {
      toast({
        title: '⚠️ Missing Elements',
        description: 'Please select all story elements before creating your story.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch('/api/stories/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          elements: selectedElements,
          storyMode: 'guided'
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: '🎉 Story Created!',
          description: 'Your magical adventure begins now!',
        });

        // Navigate to the story page
        router.push(`/children-dashboard/story/${data.session.id}`);
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error creating story:', error);

      toast({
        title: '❌ Error Creating Story',
        description:
          error instanceof Error
            ? error.message
            : 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Show loading when processing token
  if (isProcessingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl  text-white mb-2">
            Creating Your Story...
          </h2>
          <p className="text-gray-400">
            Your magical adventure is being prepared!
          </p>
        </div>
      </div>
    );
  }

  return (
       <div className=" py-10 text-white min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 relative overflow-hidden">
      {/* Animated background */}
      {/* <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div> */}

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            top: '10%',
            left: '10%',
          }}
        />

        <motion.div
          className="absolute w-80 h-80 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
          style={{
            top: '60%',
            right: '10%',
          }}
        />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'easeInOut',
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>


      {/* Enhanced Hero Section - FIXED LAYOUT */}
      <div className="relative flex items-center px-2 sm:px-4 md:px-6 lg:px-8 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 sm:gap-12 items-center pt-8 sm:pt-20">
            {/* Left Content - Always on top for mobile */}
            <motion.div
              className="space-y-8 text-center lg:text-left w-full lg:order-1"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <motion.div
                className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-400/30 backdrop-blur-xl"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  <Sparkles className="w-4 h-4 text-purple-400 mr-2" />
                </motion.div>
                <span className="text-purple-200 font-medium text-sm">
                  Start Your Creative Journey
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <h1 className=" text-2xl sm:text-4xl lg:text-6xl leading-tight tracking-tight">
                  <motion.span
                    className="block text-white"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  >
                    How to Create
                  </motion.span>
                  <motion.span
                    className="block bg-gradient-to-r from-purple-400 via-pink-300 to-cyan-400 bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0, duration: 0.6 }}
                  >
                    Amazing Stories
                  </motion.span>
                </h1>
              </motion.div>

              <motion.p
                className="text-base sm:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
                Follow our simple 6-step process to transform your imagination
                into incredible stories with AI collaboration and teacher
                mentorship.
              </motion.p>

              <motion.div
                className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.8 }}
              >
                <Link href="/contact-us">
                  <motion.button
                    className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600   text-lg text-white shadow-lg shadow-purple-500/25 overflow-hidden"
                    whileHover={{
                      scale: 1.05,
                      boxShadow: '0 20px 40px -10px rgba(147, 51, 234, 0.6)',
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="relative z-10 flex items-center">
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Play className="w-5 h-5 mr-2" />
                      </motion.div>
                      Know More →
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-500"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '0%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Side - Enhanced 3D Animated Scene - Below text on mobile */}
            <motion.div
              className="relative flex justify-center items-center w-full lg:order-2"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              <motion.div
                className="relative z-20"
                animate={{
                  y: [0, -20, 0],
                  rotateY: [0, 5, 0, -5, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <motion.div
                  className="relative w-full max-w-xs sm:max-w-lg h-72 sm:h-96 bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-cyan-400/30  overflow-hidden"
                  whileHover={{
                    scale: 1.05,
                    rotateY: 10,
                    boxShadow: '0 30px 60px -10px rgba(34, 211, 238, 0.4)',
                  }}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div className="absolute inset-0">
                    <Image
                      src="/kid7.jpg"
                      alt="Creative young writer"
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 90vw, 32rem"
                    />
           
                  </div>


                  <div className="relative z-10 p-6 sm:p-8 h-full flex flex-col justify-between">
                    <div className="text-center">
                      <motion.div
                        className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg"
                        animate={{
                          rotate: [0, 360],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      >
                        <span className="text-white  text-lg sm:text-xl">M</span>
                      </motion.div>

                      <motion.h3
                        className="text-xl sm:text-2xl  text-white mb-2"
                        animate={{
                          opacity: [0.8, 1, 0.8],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                        }}
                      >
                        Mintoons
                      </motion.h3>

                      <p className="text-cyan-300 text-xs sm:text-sm font-medium">
                        &quot;How to Create Amazing Stories&quot;
                      </p>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="h-2 bg-gradient-to-r from-gray-600/50 to-transparent rounded-full"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.random() * 40 + 60}%`,
                            opacity: [0.3, 0.8, 0.3],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3,
                            ease: 'easeInOut',
                          }}
                        />
                      ))}
                    </div>

                    <div className="flex justify-center space-x-4 sm:space-x-8">
                      {[Feather, Palette, Sparkles, BookOpen].map((Icon, i) => (
                        <motion.div
                          key={i}
                          className="w-6 sm:w-8 h-6 sm:h-8 bg-gray-700/50 rounded-lg flex items-center justify-center"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.4,
                          }}
                        >
                          <Icon className="w-3 sm:w-4 h-3 sm:h-4 text-cyan-400" />
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <motion.div
                    className="absolute inset-0  border-2 border-transparent"
                    animate={{
                      borderColor: [
                        'rgba(34, 211, 238, 0.5)',
                        'rgba(168, 85, 247, 0.5)',
                        'rgba(236, 72, 153, 0.5)',
                        'rgba(34, 211, 238, 0.5)',
                      ],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                    }}
                  />
                </motion.div>
              </motion.div>

              <motion.div
                className="absolute w-full h-full"
                animate={{ rotate: [0, 360] }}
                transition={{
                  duration: 30,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                {[
                  {
                    icon: Target,
                    color: 'from-purple-500 to-indigo-600',
                    position: 'top-0 left-1/2 -translate-x-1/2 -translate-y-6 sm:-translate-y-8',
                  },
                  {
                    icon: PenTool,
                    color: 'from-blue-500 to-cyan-600',
                    position: 'right-0 top-1/2 -translate-y-1/2 translate-x-6 sm:translate-x-8',
                  },
                  {
                    icon: MessageSquare,
                    color: 'from-orange-500 to-red-600',
                    position:
                      'bottom-0 left-1/2 -translate-x-1/2 translate-y-6 sm:translate-y-8',
                  },
                  {
                    icon: Share2,
                    color: 'from-pink-500 to-purple-600',
                    position: 'left-0 top-1/2 -translate-y-1/2 -translate-x-6 sm:-translate-x-8',
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className={`absolute ${item.position} w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center shadow-lg opacity-80`}
                    animate={{
                      rotate: [0, -360],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      rotate: {
                        duration: 30,
                        repeat: Infinity,
                        ease: 'linear',
                      },
                      scale: {
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.5,
                      },
                    }}
                    whileHover={{ scale: 1.3, opacity: 1 }}
                  >
                    <item.icon className="w-5 sm:w-8 h-5 sm:h-8 text-white" />
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                className="absolute -top-12 sm:-top-20 -left-12 sm:-left-20 bg-white/10 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-white border border-white/20"
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: 1,
                }}
              >
                ✨ Choose Elements
              </motion.div>

              <motion.div
                className="absolute -bottom-12 sm:-bottom-20 -right-12 sm:-right-20 bg-white/10 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-white border border-white/20"
                animate={{
                  y: [0, 10, 0],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: 2,
                }}
              >
                📚 Publish Stories
              </motion.div>

              <motion.div
                className="absolute top-1/2 -right-20 sm:-right-32 bg-white/10 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-white border border-white/20"
                animate={{
                  x: [0, 10, 0],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: 0.5,
                }}
              >
                🤖 AI Collaboration
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

       <DiamondSeparator />

       {/* How It Works Section */}
       <section className="py-12 px-6">
         <div className="max-w-6xl mx-auto text-center">
           <motion.h2
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="text-4xl  text-white mb-4"
           >
             How It Works
           </motion.h2>
           <motion.p
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.2 }}
             className="text-gray-400 text-xl mb-16"
           >
             Create amazing stories in just 3 simple steps
           </motion.p>

           <div className="grid md:grid-cols-3 gap-12">
             {[
               {
                 step: '01',
                 title: 'Choose Your Path',
                 description: 'Select guided story building with elements or write your own opening',
                 icon: Compass,
                 color: 'from-purple-500 to-indigo-600',
               },
               {
                 step: '02',
                 title: 'AI Collaboration',
                 description: 'Our AI helps guide your story or responds to your creative writing',
                 icon: Sparkles,
                 color: 'from-blue-500 to-cyan-600',
               },
               {
                 step: '03',
                 title: 'Create Together',
                 description: 'Continue writing your story with AI assistance and bring it to life',
                 icon: BookOpen,
                 color: 'from-green-500 to-teal-600',
               },
             ].map((item, index) => (
               <motion.div
                 key={index}
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: index * 0.2 }}
                 className="relative"
               >
                 <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/60 backdrop-blur-xl border border-gray-600/40  p-8 h-full hover:border-gray-500/60 transition-all duration-300 hover:scale-105">
                   <div className="text-center">
                     <div className="relative mb-6">
                       <div className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-full blur-lg opacity-30`}></div>
                       <div className={`relative bg-gradient-to-r ${item.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto`}>
                         <item.icon className="w-8 h-8 text-white" />
                       </div>
                     </div>
                     
                     <div className="text-sm  text-gray-400 mb-2">
                       STEP {item.step}
                     </div>
                     <h3 className="text-xl  text-white mb-4">
                       {item.title}
                     </h3>
                     <p className="text-gray-300">
                       {item.description}
                     </p>
                   </div>
                 </div>
               </motion.div>
             ))}
           </div>
         </div>
       </section>

       <DiamondSeparator />

       {/* Features Section */}
       <section className="py-12 px-6">
         <div className="max-w-6xl mx-auto">
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="text-center mb-16"
           >
             <h2 className="text-4xl  text-white mb-4">
               Why Choose Mintoons?
             </h2>
             <p className="text-gray-400 text-xl">
               Everything you need to create amazing stories
             </p>
           </motion.div>

           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
             {[
               {
                 icon: Sparkles,
                 title: 'AI-Powered Assistance',
                 description: 'Get creative help and story suggestions from our smart AI',
                 color: 'from-purple-500 to-indigo-600',
               },
               {
                 icon: Shield,
                 title: 'Age-Appropriate Content',
                 description: 'Safe, educational storytelling designed for young minds',
                 color: 'from-green-500 to-teal-600',
               },
               {
                 icon: TrendingUp,
                 title: 'Real-time Feedback',
                 description: 'Instant suggestions to improve your writing skills',
                 color: 'from-blue-500 to-cyan-600',
               },
               {
                 icon: Users,
                 title: 'Collaborative Writing',
                 description: 'Work together with AI to create amazing stories',
                 color: 'from-pink-500 to-rose-600',
               },
               {
                 icon: Target,
                 title: 'Goal-Oriented Learning',
                 description: 'Structured approach to develop writing skills',
                 color: 'from-orange-500 to-red-600',
               },
               {
                 icon: Award,
                 title: 'Progress Tracking',
                 description: 'See your improvement with detailed analytics',
                 color: 'from-yellow-500 to-orange-600',
               },
               {
                 icon: Globe,
                 title: 'Unlimited Creativity',
                 description: 'Explore any genre, character, or setting you can imagine',
                 color: 'from-indigo-500 to-purple-600',
               },
               {
                 icon: Clock,
                 title: 'Anytime, Anywhere',
                 description: 'Write your stories whenever inspiration strikes',
                 color: 'from-teal-500 to-green-600',
               },
             ].map((feature, index) => (
               <motion.div
                 key={index}
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: index * 0.1 }}
                 className="group"
               >
                 <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/60 backdrop-blur-xl border border-gray-600/40  p-6 h-full hover:border-gray-500/60 transition-all duration-300 group-hover:scale-105">
                   <div className="relative mb-4">
                     <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-lg blur-lg opacity-20 group-hover:opacity-30 transition-opacity`}></div>
                     <div className={`relative bg-gradient-to-r ${feature.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                       <feature.icon className="w-6 h-6 text-white" />
                     </div>
                   </div>
                   
                   <h3 className="text-lg  text-white mb-2">
                     {feature.title}
                   </h3>
                   <p className="text-gray-300 text-sm">
                     {feature.description}
                   </p>
                 </div>
               </motion.div>
             ))}
           </div>
         </div>
       </section>

       <DiamondSeparator />

       {/* Story Creation Interface */}
       <section id="story-elements" className="py-12 px-6">
         <div className="max-w-7xl mx-auto">
           <AnimatePresence mode="wait">
             {storyMode === 'selection' && (
               <motion.div
                 key="selection"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
               >
                 <StoryModeSelection onModeSelect={handleModeSelect} />
               </motion.div>
             )}

             {storyMode === 'freeform' && (
               <motion.div
                 key="freeform"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
               >
                 <FreeformStoryCreator 
                   onComplete={handleFreeformComplete}
                   onBack={handleBackToModeSelection}
                 />
               </motion.div>
             )}

             {storyMode === 'guided' && (
               <motion.div
                 key="guided"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
               >
                 <div className="mb-8">
                   <button
                     onClick={handleBackToModeSelection}
                     className="flex items-center text-gray-800 hover:text-gray-900 transition-colors mb-8 bg-gray-300 p-2 rounded-lg m-2"
                   >
                     <ArrowLeft className="w-4 h-4 mr-2" />
                     Back to Mode Selection
                   </button>
                 </div>

                 {/* Story Elements Selection Header */}
                 <div className="text-center mb-12">
                   <motion.h2
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="text-4xl  text-white mb-4"
                   >
                     Choose Your Story Elements
                   </motion.h2>
                   <motion.p
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.2 }}
                     className="text-gray-400 text-xl"
                   >
                     Pick the elements that will shape your unique adventure
                   </motion.p>
                 </div>

                 {/* Progress Steps */}
                 <div className="mb-12">
                   <div className="flex flex-wrap justify-center gap-4 mb-8">
                     {steps.map((step, index) => (
                       <motion.button
                         key={step.id}
                         initial={{ opacity: 0, scale: 0.8 }}
                         animate={{ opacity: 1, scale: 1 }}
                         transition={{ delay: index * 0.1 }}
                         onClick={() => handleStepClick(index)}
                         className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                           index === currentStep
                             ? 'bg-purple-500 text-white shadow-lg'
                             : isCurrentStepComplete(index)
                             ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                             : index < currentStep
                             ? 'bg-gray-600/50 text-gray-300 cursor-pointer hover:bg-gray-600/70'
                             : 'bg-gray-700/50 text-gray-500'
                         }`}
                         disabled={index > currentStep && !isCurrentStepComplete(index)}
                       >
                         <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs">
                           {isCurrentStepComplete(index) ? (
                             <Check className="w-3 h-3" />
                           ) : (
                             index + 1
                           )}
                         </span>
                         <span className="hidden sm:inline">{step.title}</span>
                       </motion.button>
                     ))}
                   </div>

                   {/* Progress Bar */}
                   <div className="w-full bg-gray-700/50 rounded-full h-2">
                     <motion.div
                       className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full"
                       initial={{ width: 0 }}
                       animate={{
                         width: `${((currentStep + 1) / steps.length) * 100}%`
                       }}
                       transition={{ duration: 0.5 }}
                     />
                   </div>
                 </div>

                 {/* Current Step */}
                 <AnimatePresence mode="wait">
                   <motion.div
                     key={currentStep}
                     initial={{ opacity: 0, x: 50 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -50 }}
                     transition={{ duration: 0.3 }}
                     className="mb-12"
                   >
                     <div className="text-center mb-8">
                       <h3 className="text-2xl  text-white mb-2">
                         {steps[currentStep]?.title}
                       </h3>
                       <p className="text-gray-400">
                         {steps[currentStep]?.description}
                       </p>
                     </div>

                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {STORY_ELEMENTS[steps[currentStep]?.id as keyof typeof STORY_ELEMENTS]?.map((element: any, index: number) => (
                        <motion.div
                          key={element.name}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="cursor-pointer"
                        >
                          <div
                            onClick={() => {
                              console.log('Element clicked:', element.name);
                              handleElementSelect(steps[currentStep]?.id, element.name);
                            }}
                            onTouchEnd={() => {
                              console.log('Element touched:', element.name);
                              handleElementSelect(steps[currentStep]?.id, element.name);
                            }}
                            className={`p-4  border-2 transition-all text-center hover:scale-105 active:scale-95 transform ${
                              selectedElements[steps[currentStep]?.id] === element.name
                                ? 'border-purple-500 bg-purple-500/20 text-white'
                                : 'border-gray-600/40 bg-gray-800/60 text-gray-300 hover:border-gray-500/60 hover:bg-gray-700/60'
                            }`}
                          >
                            <div className="text-2xl mb-2">{element.emoji}</div>
                            <div className="font-medium text-sm">{element.name}</div>
                            {element.description && (
                              <div className="text-xs text-gray-400 mt-1">
                                {element.description}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                     </div>
                   </motion.div>
                 </AnimatePresence>

                 {/* Story Summary & Create Button */}
                 <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="bg-gradient-to-br from-gray-800/60 to-gray-700/60 backdrop-blur-xl border border-gray-600/40  p-8"
                 >
                   <h4 className="text-xl  text-white mb-4 text-center">
                     Your Story Preview
                   </h4>
                   
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                     {Object.entries(selectedElements).map(([type, value]) => (
                       <div key={type} className="text-center">
                         <div className="text-sm text-gray-400 capitalize mb-1">{type}</div>
                         <div className={`text-white font-medium ${!value ? 'text-gray-500' : ''}`}>
                           {value || 'Not selected'}
                         </div>
                       </div>
                     ))}
                   </div>

                   {Object.values(selectedElements).every(value => value !== '') && (
                     <motion.div
                       initial={{ opacity: 0, scale: 0.9 }}
                       animate={{ opacity: 1, scale: 1 }}
                       className="text-center mb-6"
                     >
                       <div className="text-green-400  text-lg mb-2">
                         🎉 All elements selected! Ready to create your story!
                       </div>
                       <div className="text-green-300 text-sm">
                         Your {selectedElements.mood} {selectedElements.genre} adventure featuring {selectedElements.character} in {selectedElements.setting} awaits!
                       </div>
                     </motion.div>
                   )}

                   <motion.button
                     whileHover={{ scale: Object.values(selectedElements).every(value => value !== '') ? 1.02 : 1 }}
                     whileTap={{ scale: Object.values(selectedElements).every(value => value !== '') ? 0.98 : 1 }}
                     onClick={createStory}
                     disabled={!Object.values(selectedElements).every(value => value !== '') || isCreating}
                     className={`w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-lg font-medium text-lg transition-all ${
                       Object.values(selectedElements).every(value => value !== '') && !isCreating
                         ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-xl'
                         : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                     }`}
                   >
                     {isCreating ? (
                       <>
                         <Loader2 className="w-5 h-5 animate-spin" />
                         <span>Creating Your Story...</span>
                       </>
                     ) : (
                       <>
                         <Sparkles className="w-5 h-5" />
                         <span>Create My Story</span>
                       </>
                     )}
                   </motion.button>
                 </motion.div>
               </motion.div>
             )}
           </AnimatePresence>
         </div>
       </section>
     </div>
 );
}

export default function CreateStoriesPage() {
 return (
   <Suspense
     fallback={
       <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
         <div className="text-center">
           <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
           <p className="text-white text-xl">Loading create stories page...</p>
         </div>
       </div>
     }
   >
     <CreateStoriesContent />
   </Suspense>
 );
}