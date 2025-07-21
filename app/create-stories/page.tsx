// app/create-stories/page.tsx (Enhanced version)
'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import Link from 'next/link';
import { STORY_ELEMENTS } from '@/config/story-elements';
import { useToast } from '@/hooks/use-toast';

interface SelectedElements {
  genre: string;
  character: string;
  setting: string;
  theme: string;
  mood: string;
  tone: string;
  [key: string]: string; // Allow string indexing
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

export default function CreateStoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

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

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login/child');
      return;
    }

    if (session.user.role !== 'child') {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  const currentStepData = steps[currentStep];
  const elementType = currentStepData.id as keyof typeof STORY_ELEMENTS;
  const currentElements = STORY_ELEMENTS[elementType] || [];

  const handleElementSelect = (elementId: string) => {
    setSelectedElements((prev) => ({
      ...prev,
      [elementType]: elementId,
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCreateStory();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateStory = async () => {
    setIsCreating(true);

    try {
      const response = await fetch('/api/stories/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          elements: selectedElements,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create story');
      }

      toast({
        title: '🎉 Story Created!',
        description: 'Your magical adventure begins now!',
      });

      // Redirect to the writing interface
      router.push(`/children-dashboard/story/${data.session.id}`);
    } catch (error) {
      console.error('Error creating story:', error);
      toast({
        title: '❌ Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to create story. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Scroll to story elements section
  const scrollToStoryElements = () => {
    const storyElementsSection = document.getElementById('story-elements');
    if (storyElementsSection) {
      storyElementsSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const isCurrentStepComplete =
    selectedElements[elementType as keyof SelectedElements] !== '';
  const isAllComplete = Object.values(selectedElements).every(
    (value) => value !== ''
  );

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading story creation...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'child') {
    return null;
  }

  return (
    <div className="text-white min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-5">
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
      </div>

      {/* Animated Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large Floating Orbs */}
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

      {/* Enhanced Hero Section */}
      <div className="relative min-h-screen flex items-center px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              className="space-y-8"
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
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
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
                <h1 className="font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight">
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
                className="text-xl text-gray-300 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
                Follow our simple 6-step process to transform your imagination
                into incredible stories with AI collaboration and teacher
                mentorship.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.8 }}
              >
                <Link href="/contact-us">
                  <motion.button
                    className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl font-semibold text-lg text-white shadow-lg shadow-purple-500/25 overflow-hidden"
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

            {/* Right Side - Enhanced 3D Animated Scene */}
            <motion.div
              className="relative flex justify-center items-center h-[600px]"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              {/* Central Floating Book/Story Card */}
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
                  className="relative w-[32rem] h-96 bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-2xl rounded-3xl border border-cyan-400/30 shadow-2xl overflow-hidden"
                  whileHover={{
                    scale: 1.05,
                    rotateY: 10,
                    boxShadow: '0 30px 60px -10px rgba(34, 211, 238, 0.4)',
                  }}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <Image
                      src="/kid7.jpg"
                      alt="Creative young writer"
                      fill
                      className="object-cover"
                      sizes="32rem"
                    />
                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-gray-900/70" />
                  </div>

                  {/* Animated Background Effects (on top of image) */}
                  <div className="absolute inset-0">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-cyan-500/20"
                      animate={{
                        background: [
                          'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(34, 211, 238, 0.2) 100%)',
                          'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
                          'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
                        ],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  </div>
                  {/* Content */}
                  <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                    {/* Header */}
                    <div className="text-center">
                      <motion.div
                        className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
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
                        <span className="text-white font-bold text-xl">M</span>
                      </motion.div>

                      <motion.h3
                        className="text-2xl font-bold text-white mb-2"
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

                      <p className="text-cyan-300 text-sm font-medium">
                        "How to Create Amazing Stories"
                      </p>
                    </div>

                    {/* Animated Writing Lines */}
                    <div className="space-y-3">
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

                    {/* Bottom Icons */}
                    <div className="flex justify-center space-x-8">
                      {[Feather, Palette, Sparkles, BookOpen].map((Icon, i) => (
                        <motion.div
                          key={i}
                          className="w-8 h-8 bg-gray-700/50 rounded-lg flex items-center justify-center"
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
                          <Icon className="w-4 h-4 text-cyan-400" />
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Glowing Border Effect */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl border-2 border-transparent"
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

              {/* Orbiting Elements */}
              <motion.div
                className="absolute w-full h-full"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              >
                {/* Story Element Orbs */}
                {[
                  {
                    icon: Target,
                    color: 'from-purple-500 to-indigo-600',
                    position: 'top-0 left-1/2 -translate-x-1/2 -translate-y-8',
                  },
                  {
                    icon: PenTool,
                    color: 'from-blue-500 to-cyan-600',
                    position: 'right-0 top-1/2 -translate-y-1/2 translate-x-8',
                  },
                  {
                    icon: MessageSquare,
                    color: 'from-orange-500 to-red-600',
                    position:
                      'bottom-0 left-1/2 -translate-x-1/2 translate-y-8',
                  },
                  {
                    icon: Share2,
                    color: 'from-pink-500 to-purple-600',
                    position: 'left-0 top-1/2 -translate-y-1/2 -translate-x-8',
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className={`absolute ${item.position} w-16 h-16 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center shadow-lg opacity-80`}
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
                      scale: { duration: 3, repeat: Infinity, delay: i * 0.5 },
                    }}
                    whileHover={{ scale: 1.3, opacity: 1 }}
                  >
                    <item.icon className="w-8 h-8 text-white" />
                  </motion.div>
                ))}
              </motion.div>

              {/* Floating Text Elements */}
              <motion.div
                className="absolute -top-20 -left-20 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-sm text-white border border-white/20"
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
                className="absolute -bottom-20 -right-20 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-sm text-white border border-white/20"
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
                className="absolute top-1/2 -right-32 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-sm text-white border border-white/20"
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

      {/* How It Works Section */}
      <div className="relative px-4 sm:px-6 lg:px-8 py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">
              How{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                It Works
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our AI-powered platform makes story creation fun and educational
              through collaborative writing
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Choose Elements',
                description:
                  'Select your favorite story elements from our curated collection',
                icon: Target,
                color: 'from-blue-500 to-cyan-500',
              },
              {
                step: '02',
                title: 'AI Collaboration',
                description:
                  'Our AI creates story prompts based on your choices and guides your writing',
                icon: Brain,
                color: 'from-purple-500 to-pink-500',
              },
              {
                step: '03',
                title: 'Create Together',
                description:
                  'Write your story with AI assistance, getting real-time feedback and suggestions',
                icon: PenTool,
                color: 'from-green-500 to-emerald-500',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 h-full">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center mb-6`}
                  >
                    <item.icon className="w-8 h-8 text-white" />
                  </div>

                  <div className="mb-4">
                    <span className="text-sm font-mono text-gray-400 block mb-2">
                      STEP {item.step}
                    </span>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-gray-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent transform -translate-y-1/2" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-r from-purple-900/50 to-cyan-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Ready to Start Your
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                {' '}
                Story Adventure?
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of young writers who are already creating amazing
              stories with AI assistance
            </p>

            {/* Fixed: Start Creating Now button scrolls to story elements */}
            <motion.button
              onClick={scrollToStoryElements}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-white font-semibold text-lg shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-5 h-5 mr-2" />
              Start Creating Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </motion.button>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-gray-400">
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-400 mr-2" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-400 mr-2" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-400 mr-2" />
                <span>Safe for children</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">
              Why Choose{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Mintoons
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Advanced features designed to make story writing engaging,
              educational, and fun for children
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'AI-Powered Assistance',
                description:
                  "Smart AI that adapts to your child's writing level and provides helpful suggestions",
                icon: Brain,
                color: 'from-purple-500 to-indigo-500',
              },
              {
                title: 'Age-Appropriate Content',
                description:
                  'All content is filtered and optimized for different age groups and learning levels',
                icon: Shield,
                color: 'from-green-500 to-teal-500',
              },
              {
                title: 'Real-time Feedback',
                description:
                  'Instant feedback on grammar, creativity, and story structure as you write',
                icon: MessageSquare,
                color: 'from-blue-500 to-cyan-500',
              },
              {
                title: 'Progress Tracking',
                description:
                  'Monitor writing improvement with detailed analytics and achievement systems',
                icon: TrendingUp,
                color: 'from-orange-500 to-red-500',
              },
              {
                title: 'Creative Elements',
                description:
                  'Hundreds of story elements to choose from for endless creative possibilities',
                icon: Lightbulb,
                color: 'from-yellow-500 to-orange-500',
              },
              {
                title: 'Safe Environment',
                description:
                  'Secure platform with parental controls and content moderation',
                icon: Shield,
                color: 'from-pink-500 to-purple-500',
              },
              {
                title: 'Export Stories',
                description:
                  'Download completed stories as PDF or Word documents to share and print',
                icon: BookOpen,
                color: 'from-indigo-500 to-purple-500',
              },
              {
                title: '24/7 Support',
                description:
                  'Round-the-clock support for both children and parents',
                icon: Clock,
                color: 'from-teal-500 to-green-500',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 h-full">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 mt-8 mb-8">
          <div className="mb-8 mt-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex flex-col items-center justify-center mb-8">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-400/30 backdrop-blur-xl mb-4">
                  <Sparkles className="w-4 h-4 text-purple-400 mr-2" />
                  <span className="text-purple-200 font-medium text-sm">
                    AI-Powered Story Creation
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-white text-center">
                  Create Your{' '}
                  <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    Amazing Story
                  </span>
                </h1>

                <p className="text-xl text-gray-300 max-w-4xl text-center mb-12">
                  Choose your story elements and let AI help you create an
                  incredible adventure. Select from hundreds of combinations to
                  make your story unique!
                </p>
              </div>
            </motion.div>
          </div>
          <div className="max-w-6xl mx-auto">
            {/* Element Selection Grid */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
            >
              {currentElements.map((element, index) => {
                const isSelected = selectedElements[elementType] === element.id;

                return (
                  <motion.button
                    key={element.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleElementSelect(element.id)}
                    className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                      isSelected
                        ? `bg-gradient-to-br ${element.color} border-white/40 text-white`
                        : 'bg-gray-800/60 border-gray-600/40 text-gray-300 hover:border-gray-500/60 hover:bg-gray-700/60'
                    }`}
                  >
                    {/* Selection indicator */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 right-3 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}

                    <div className="text-3xl mb-3">{element.emoji}</div>
                    <h3 className="font-semibold text-lg mb-2">
                      {element.name}
                    </h3>
                    <p className="text-sm opacity-80">{element.description}</p>
                  </motion.button>
                );
              })}
            </motion.div>

            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-between"
            >
              <motion.button
                whileHover={{ x: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  currentStep === 0
                    ? 'text-gray-500 cursor-not-allowed'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </motion.button>

              <motion.button
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                disabled={!isCurrentStepComplete || isCreating}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  !isCurrentStepComplete || isCreating
                    ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                    : currentStep === steps.length - 1
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700'
                      : 'bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700'
                }`}
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Magic...</span>
                  </>
                ) : currentStep === steps.length - 1 ? (
                  <>
                    <span>Create My Story</span>
                    <Wand2 className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </motion.div>

            {/* Selected Elements Preview */}
            {Object.values(selectedElements).some((value) => value !== '') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-6 bg-gray-800/40 backdrop-blur-xl border border-gray-600/40 rounded-xl"
              >
                <h3 className="text-white font-semibold mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
                  Your Story Elements
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(selectedElements).map(([type, elementId]) => {
                    if (!elementId) return null;

                    const element = STORY_ELEMENTS[
                      type as keyof typeof STORY_ELEMENTS
                    ]?.find((e) => e.id === elementId);

                    if (!element) return null;

                    return (
                      <div key={type} className="text-center">
                        <div className="text-2xl mb-1">{element.emoji}</div>
                        <div className="text-xs text-gray-400 uppercase mb-1">
                          {type}
                        </div>
                        <div className="text-sm text-white font-medium">
                          {element.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
