// components/home/Hero.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  BookOpen,
  Users,
  Award,
  Heart,
  Star,
  Zap,
  PenTool,
  Lightbulb,
  TrendingUp,
  Image as ImageIcon,
  BarChart3,
  Shield,
  Target,
  MessageSquare,
  Share2,
  CheckCircle,
  ArrowRight,
  Globe,
  Rocket,
  Upload,
  Brain,
  FileText,
  Trophy,
  Clock,
  BookMarked,
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

import { DiamondSeparator } from '../seperators/DiamondSeparator';
import AnimatedButton from '../AnimatedButton';

export default function Home() {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Optimized scroll detection to reduce animation complexity during scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set new timeout to detect scroll end
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const features = [
    {
      icon: <PenTool className="w-6 h-6" />,
      title: 'Complete Creative Freedom',
      description:
        'Write any story you want! No restrictions, just pure creativity with AI collaboration to help develop your ideas.',
      gradient: 'from-green-500 to-teal-600',
      image: '/kid3.jpg',
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'Smart AI Assessment',
      description:
        'Upload your completed stories for detailed AI feedback on grammar, creativity, structure, and originality with plagiarism detection.',
      gradient: 'from-blue-500 to-indigo-600',
      image: '/kid2.jpg',
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Monthly Writing Competitions',
      description:
        'Compete with other young writers in monthly contests. Winners get recognition and their stories featured globally.',
      gradient: 'from-orange-500 to-yellow-600',
      image: '/kid7.jpg',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Safe Learning Environment',
      description:
        'COPPA-compliant platform with content safety checks, parental controls, and age-appropriate feedback for young writers.',
      gradient: 'from-pink-500 to-red-600',
      image: '/kid5.jpg',
    },
  ];

  // Story showcase data
  const storyShowcase = [
    {
      title: 'The Magic Rainbow Bridge',
      description:
        'Luna discovered a shimmering bridge made of rainbow light that connected her backyard to a world where animals could talk and flowers sang melodies.',
      author: 'Emma, age 8',
      readTime: '4 min read',
      rating: 4.8,
      genre: 'Fantasy',
      gradient: 'from-pink-500 to-purple-600',
      emoji: '🌈',
      image: '/kid1.jpg',
    },
    {
      title: 'Mission: Save the Space Station',
      description:
        'Commander Jake detected mysterious signals coming from the abandoned space station orbiting Mars. With his robot companion ZETA, he must solve the mystery.',
      author: 'Alex, age 12',
      readTime: '7 min read',
      rating: 4.9,
      genre: 'Space Adventure',
      gradient: 'from-blue-500 to-indigo-600',
      emoji: '🚀',
      image: '/kid2.jpg',
    },
    {
      title: 'Whiskers the Brave Cat',
      description:
        'When all the neighborhood pets started disappearing, Whiskers knew she had to be brave and find them. Her adventure led her through secret tunnels.',
      author: 'Lily, age 6',
      readTime: '3 min read',
      rating: 4.7,
      genre: 'Animal Tales',
      gradient: 'from-orange-500 to-red-600',
      emoji: '🐱',
      image: '/kid3.jpg',
    },
  ];

  // Writing inspiration categories (replacing story elements)
  const writingCategories = {
    genres: [
      {
        name: 'Fantasy Adventures',
        icon: '🧙‍♀️',
        description: 'Magical worlds and mystical creatures',
      },
      {
        name: 'Space Exploration',
        icon: '🚀',
        description: 'Cosmic adventures and alien encounters',
      },
      {
        name: 'Animal Stories',
        icon: '🐾',
        description: 'Tales of brave pets and wild creatures',
      },
      {
        name: 'Mystery & Detective',
        icon: '🔍',
        description: 'Solve puzzles and uncover secrets',
      },
      {
        name: 'Friendship Tales',
        icon: '👥',
        description: 'Stories about bonds and teamwork',
      },
      {
        name: 'Time Travel',
        icon: '⏰',
        description: 'Journey through past and future',
      },
    ],
    themes: [
      {
        name: 'Courage & Bravery',
        icon: '⚡',
        description: 'Heroes facing their fears',
      },
      {
        name: 'Friendship & Loyalty',
        icon: '💝',
        description: 'The power of true friendship',
      },
      {
        name: 'Discovery & Wonder',
        icon: '🔭',
        description: 'Exploring new worlds and ideas',
      },
      {
        name: 'Problem Solving',
        icon: '🧩',
        description: 'Creative solutions to challenges',
      },
      {
        name: 'Growth & Learning',
        icon: '🌱',
        description: 'Characters who grow and change',
      },
      {
        name: 'Magic & Wonder',
        icon: '✨',
        description: 'Extraordinary and magical elements',
      },
    ],
  };

  // Platform features data
  const platformFeatures = [
    {
      icon: <PenTool className="w-8 h-8" />,
      title: 'Complete Creative Freedom',
      description:
        'Write any story you want with no restrictions. AI helps develop your ideas while you maintain full creative control.',
      gradient: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-500/10 to-emerald-500/10',
      learnMore: true,
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'Advanced AI Assessment',
      description:
        'Get detailed feedback on grammar, creativity, structure, and originality. Includes plagiarism and AI content detection.',
      gradient: 'from-blue-500 to-cyan-600',
      bgColor: 'from-blue-500/10 to-cyan-500/10',
      learnMore: true,
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Ultra-Safe Environment',
      description:
        'COPPA-compliant platform with advanced content filtering and parental controls for peace of mind.',
      gradient: 'from-purple-500 to-pink-600',
      bgColor: 'from-purple-500/10 to-pink-500/10',
      learnMore: true,
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Monthly Writing Contests',
      description:
        'Compete with young writers worldwide. Winners get featured stories and recognition for their creativity.',
      gradient: 'from-yellow-500 to-orange-600',
      bgColor: 'from-yellow-500/10 to-orange-500/10',
      learnMore: true,
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Progress Tracking',
      description:
        'Monitor writing improvement over time with detailed analytics and personalized learning insights.',
      gradient: 'from-red-500 to-pink-600',
      bgColor: 'from-red-500/10 to-pink-500/10',
      learnMore: true,
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Encouraging Feedback',
      description:
        'AI provides supportive, age-appropriate feedback that builds confidence while helping writers improve.',
      gradient: 'from-pink-500 to-purple-600',
      bgColor: 'from-pink-500/10 to-purple-500/10',
      learnMore: true,
    },
  ];

  // Statistics data
  const statistics = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      value: '10K+',
      label: 'Stories Created',
      gradient: 'from-purple-500 to-indigo-600',
    },
    {
      icon: <Users className="w-8 h-8" />,
      value: '500+',
      label: 'Young Writers',
      gradient: 'from-blue-500 to-cyan-600',
    },
    {
      icon: <Heart className="w-8 h-8" />,
      value: '98%',
      label: 'Parent Satisfaction',
      gradient: 'from-pink-500 to-red-600',
    },
    {
      icon: <Globe className="w-8 h-8" />,
      value: '25+',
      label: 'Countries Worldwide',
      gradient: 'from-green-500 to-emerald-600',
    },
  ];

  const steps = [
    {
      number: '01',
      icon: <PenTool className="w-8 h-8" />,
      title: 'Start Writing Freely',
      description:
        'Begin your story with complete creative freedom. Write about anything that sparks your imagination - no limits!',
      gradient: 'from-green-500 to-teal-600',
      features: [
        'Any Genre Welcome',
        'No Story Restrictions',
        'Real-time AI Help',
        'Word Count Tracking',
      ],
      image: '/kid12.jpg',
    },
    {
      number: '02',
      icon: <Sparkles className="w-8 h-8" />,
      title: 'Collaborate with AI',
      description:
        'Get suggestions and ideas from AI as you write. The AI helps develop your story while you stay in complete control.',
      gradient: 'from-blue-500 to-cyan-600',
      features: [
        'Plot Suggestions',
        'Character Development',
        'Creative Prompts',
        'Writing Guidance',
      ],
      image: '/ai16.jpg',
    },
    {
      number: '03',
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Complete Your Story',
      description:
        'Finish your masterpiece! Stories can be any length - from short tales to epic adventures (350 words to 600 words).',
      gradient: 'from-purple-500 to-indigo-600',
      features: [
        'Max 600 Words Length',
        'Auto-save Progress',
        'Draft Management',
        'Story Preview',
      ],
      image: '/kid20.jpg',
    },
    {
      number: '04',
      icon: <Upload className="w-8 h-8" />,
      title: 'Upload for Assessment',
      description:
        'Submit your completed story for detailed AI analysis and personalized feedback to improve your writing.',
      gradient: 'from-orange-500 to-red-600',
      features: [
        'Just Paste Your Story',
        'Instant Processing',
        'Multiple Attempts',
        'Plagiarism Detection',
      ],
      image: '/kid19.jpg',
    },
    {
      number: '05',
      icon: <Award className="w-8 h-8" />,
      title: 'Get Feedback & Compete',
      description:
        'Receive comprehensive feedback to improve your writing and enter monthly competitions with other young writers.',
      gradient: 'from-pink-500 to-purple-600',
      features: [
        'Grammar Analysis',
        'Creativity Scores',
        'Competition Entry',
        'Progress Tracking',
      ],
      image: '/kid23.jpg',
    },
    {
      number: '06',
      icon: <Trophy className="w-8 h-8" />,
      title: 'Join Competitions',
      description:
        'Participate in monthly writing competitions! Compete with writers worldwide and improve your skills.',
      gradient: 'from-yellow-500 to-orange-600',
      features: [
        'Monthly Challenges',
        'Upload Your 3 Best Stories',
        'Ai Picks Top 3 Winners',
        'Winner Will be Considered for Free Spot in Anthology Books',
      ],
      image: '/kid21.jpg', // Add this image
    },
    {
      number: '07',
      icon: <Users className="w-8 h-8" />,
      title: 'Share in Community',
      description:
        'Publish your 3 best stories in a month to the community page where other young writers, mentors, and admins can read and comment.',
      gradient: 'from-indigo-500 to-purple-600',
      features: [
        'Public Story Showcase',
        'Reader Comments',
        'Story Ratings',
        'Author Profiles',
      ],
      image: '/kid10.jpg', // Add this image
    },
    {
      number: '08',
      icon: <BookMarked className="w-8 h-8" />,
      title: 'Reserve & Order Physical Books',
      description:
        'Reserve your anthology spot for $10 per Story, then contact admin through our form to order the actual printed book at custom pricing.',
      gradient: 'from-emerald-500 to-teal-600',
      features: [
        '$10 Per Story for Spot Reservation',
        'Custom Book Pricing',
        'Contact Admin for Orders',
        'Professional Anthology',
      ],
      image: '/kid14.jpg', // Add this image
    },
  ];

  // Updated values for current system
  const values = [
    {
      icon: Target,
      title: 'Creative Freedom',
      description:
        'No story templates or rigid structures. Children write exactly what they want, exploring their unique imagination and ideas without any restrictions.',
      gradient: 'from-green-600 to-green-800',
    },
    {
      icon: Brain,
      title: 'Smart AI Assessment',
      description:
        'Advanced AI analyzes grammar, creativity, structure, and originality. Includes plagiarism detection and personalized improvement suggestions.',
      gradient: 'from-blue-600 to-blue-800',
    },
    {
      icon: Shield,
      title: 'Child Safety & Privacy',
      description:
        'COPPA-compliant platform with industry-leading security measures, content filtering, and transparent data practices for complete peace of mind.',
      gradient: 'from-purple-600 to-purple-800',
    },
    {
      icon: BarChart3,
      title: 'Progress Tracking',
      description:
        'Monitor writing development over time with detailed analytics, skill progression tracking, and personalized learning insights to celebrate growth.',
      gradient: 'from-orange-600 to-orange-800',
    },
  ];

  // Floating particles animation
  const particleVariants = {
    animate: {
      y: [0, -20, 0],
      opacity: [0.3, 0.8, 0.3],
      scale: [1, 1.2, 1],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white relative overflow-hidden px-8 lg:px-24 ${
        isScrolling ? 'scrolling' : ''
      }`}
      style={{
        // Critical optimizations to prevent white patches
        backgroundAttachment: 'scroll', // Changed from fixed
        transform: 'translateZ(0)', // Force hardware acceleration
        backfaceVisibility: 'hidden',
        contain: 'layout style paint', // Optimize rendering
      }}
    >
      {/* Optimized Animated Background Elements - Reduced during scroll */}
      <div
        className={`absolute inset-0 overflow-hidden ${isScrolling ? 'opacity-30' : 'opacity-100'} transition-opacity duration-300`}
      >
        {[...Array(isScrolling ? 8 : 15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-green-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: 'translateZ(0)', // Force hardware acceleration
            }}
            variants={particleVariants}
            animate={isScrolling ? 'initial' : 'animate'}
            transition={{ delay: i * 0.3 }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative flex items-center px-4 sm:px-6 lg:px-8 py-12 mt-20 ">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 gap-8 sm:gap-12 md:gap-16 lg:gap-24 xl:gap-32 lg:grid-cols-3 items-center">
            {/* Left Content */}
            <div className="space-y-8 flex flex-col items-center justify-center h-full lg:mb-0 mb-8">
              {/* Main heading */}
              <motion.div
                className="space-y-4 text-center"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
              >
                <h1 className="text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight">
                  <span className="block text-white">Where Young Writers</span>
                  <span className="block bg-gradient-to-r from-green-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                    Create Amazing Stories
                  </span>
                </h1>

                <p className="text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed">
                  A platform where children{' '}
                  <span className="text-green-300 ">write freely</span> with{' '}
                  <span className="text-teal-300 ">AI collaboration</span> and
                  get <span className="text-cyan-300 ">detailed feedback</span>{' '}
                  to improve their writing skills.
                </p>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                className="flex justify-center w-full mt-4"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <Link href="/create-stories">
                  <AnimatedButton text="Unleash Creativity" />
                </Link>
              </motion.div>
            </div>

            {/* Middle - Hero Image */}
            <motion.div
              className="relative flex flex-col justify-center items-center h-full"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              <motion.div className="relative flex flex-col justify-center items-center h-full">
                {/* Glow Effect removed as requested */}

                {/* Hero Image Container */}
                <div className="relative w-80 sm:w-96 h-[28rem] sm:h-[32rem] overflow-hidden shadow-2xl">
                  <Image
                    src="/kid1.jpg"
                    alt="Creative young writer"
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent" />

                  {/* Floating Icons */}
                  <motion.div
                    className="absolute top-4 right-4 w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full opacity-80 flex items-center justify-center shadow-lg"
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 15, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <Sparkles className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                  </motion.div>

                  <motion.div
                    className="absolute bottom-16 left-4 w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full opacity-80 flex items-center justify-center shadow-lg"
                    animate={{
                      x: [0, 10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 1,
                    }}
                  >
                    <BookOpen className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                  </motion.div>

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                    <motion.div
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.5 }}
                    >
                      <h3 className="text-lg sm:text-xl text-white mb-2">
                        Mintoons
                      </h3>
                      <p className="text-green-300 text-xs sm:text-sm ">
                        Creative Writing Education Platform
                      </p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right - Animated Card */}
            <motion.div
              className="relative flex flex-col justify-center items-center h-full"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 1.4 }}
            >
              <motion.div className="relative flex flex-col justify-center items-center h-full">
                {/* Enhanced Glow Effect removed as requested */}

                {/* Main Card with Image */}
                <div className="relative w-80 sm:w-96 h-[28rem] sm:h-[32rem] bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-2xl border border-gray-600/40 shadow-2xl overflow-hidden">
                  {/* Background Image */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="w-full h-full bg-gradient-to-br from-green-500/20 to-teal-500/20" />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0iY3VycmVudENvbG9yIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4K')] opacity-30" />
                  </div>

                  <div className="relative z-10 p-6 sm:p-8 h-full flex flex-col">
                    {/* Logo Circle with enhanced animation */}
                    <motion.div
                      className="w-14 sm:w-16 h-14 sm:h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto shadow-lg relative overflow-hidden"
                      animate={{
                        rotate: [0, 360],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    >
                      {/* Inner glow */}
                      <motion.div
                        className="absolute inset-0 bg-white/20 rounded-full"
                        animate={{
                          scale: [0.8, 1.2, 0.8],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      />
                      <span className="text-white text-lg sm:text-xl relative z-10">
                        M
                      </span>
                    </motion.div>

                    {/* Card Content */}
                    <div className="text-center space-y-2 sm:space-y-4 flex-grow">
                      <h3 className="text-lg sm:text-xl text-white mb-2">
                        Mintoons
                      </h3>
                      <p className="text-green-300 text-xs sm:text-sm ">
                        Creative Writing Education Platform
                      </p>
                      <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mt-2">
                        Write freely with AI collaboration and get detailed
                        feedback to improve your creative writing skills.
                      </p>
                      <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                        3 free stories + 9 free assessments monthly. Join
                        thousands of young writers worldwide!
                      </p>

                      {/* New Content Addition */}
                      <motion.p
                        className="text-gray-300 text-xs sm:text-sm leading-relaxed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                      >
                        3 free stories + 9 free assessments monthly. Join
                        thousands of young writers worldwide!
                      </motion.p>

                      {/* Mini Feature Icons */}
                      <div className="flex justify-center space-x-2 sm:space-x-4 py-2">
                        {[PenTool, Brain, Upload, Award, BookOpen].map(
                          (Icon, i) => (
                            <motion.div
                              key={i}
                              className="w-6 sm:w-8 h-6 sm:h-8 bg-gray-700/50 rounded-lg flex items-center justify-center"
                              animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.7, 1, 0.7],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.3,
                              }}
                            >
                              <Icon className="w-3 sm:w-4 h-3 sm:h-4 text-green-400" />
                            </motion.div>
                          )
                        )}
                      </div>

                      <motion.p
                        className="text-green-400 text-xs "
                        animate={{
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      >
                        Freeform Writing + AI Assessment Platform
                      </motion.p>
                    </div>

                    {/* Enhanced Progress Dots */}
                    <div className="flex justify-center space-x-2 mt-4 sm:mt-6">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-green-400' : 'bg-gray-600'}`}
                          animate={
                            i === 0
                              ? {
                                  scale: [1, 1.5, 1],
                                  opacity: [0.7, 1, 0.7],
                                }
                              : {}
                          }
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Enhanced Orbiting Elements */}
                <motion.div
                  className="absolute -top-6 -right-6 w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full opacity-70 flex items-center justify-center"
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  style={{
                    transformOrigin: '200px 200px',
                  }}
                >
                  <Sparkles className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                </motion.div>

                <motion.div
                  className="absolute -bottom-8 -left-8 w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full opacity-70 flex items-center justify-center"
                  animate={{
                    rotate: [360, 0],
                  }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  style={{
                    transformOrigin: '160px 160px',
                  }}
                >
                  <BookOpen className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                </motion.div>

                <motion.div
                  className="absolute top-1/2 -right-12 w-6 sm:w-8 h-6 sm:h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full opacity-60 flex items-center justify-center"
                  animate={{
                    rotate: [0, 360],
                    y: [0, -20, 0],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  <Star className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <DiamondSeparator />

      {/* Story Showcase Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl mb-6">
              Amazing Stories by{' '}
              <span className="bg-gradient-to-r from-green-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Young Writers
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              See what incredible stories children are creating with MINTOONS
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 sm:gap-10 md:gap-12 lg:gap-14 xl:gap-16 md:grid-cols-2 lg:grid-cols-3">
            {storyShowcase.map((story, index) => (
              <motion.div
                key={index}
                className="group relative"
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <div className="relative h-full bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 shadow-xl overflow-hidden">
                  {/* Story Card Header */}
                  <div
                    className={`relative h-48 bg-gradient-to-br ${story.gradient} overflow-hidden`}
                  >
                    {/* Genre Badge */}
                    <div className="absolute top-4 left-4 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs ">
                      {story.genre}
                    </div>

                    {/* Rating Badge */}
                    <div className="absolute top-4 right-4 flex items-center space-x-1 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{story.rating}</span>
                    </div>

                    {/* Story Icon/Emoji */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="text-6xl"
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        transition={{ duration: 0.3 }}
                      >
                        {story.emoji}
                      </motion.div>
                    </div>
                  </div>

                  {/* Story Content */}
                  <div className="p-6">
                    <h3 className="text-xl text-white mb-3 group-hover:text-green-400 transition-colors">
                      {story.title}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
                      {story.description}
                    </p>

                    {/* Author Info */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-600/30">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-teal-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">
                            {story.author.split(',')[0].charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-green-400 text-sm ">
                            {story.author}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {story.readTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover Effect Overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Explore All Stories Button */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
          >
            <Link href="/register">
              <AnimatedButton text="Register Now" />
            </Link>
          </motion.div>
        </div>
      </section>

      <DiamondSeparator />

      {/* Writing Inspiration Section (Replacing Story Elements) */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl mb-6">
              Find Your{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Writing Inspiration
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              Explore different genres and themes to spark your creativity.
              Write about anything that excites you!
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Popular Genres */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl text-white">Popular Story Genres</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {writingCategories.genres.map((genre, index) => (
                  <motion.div
                    key={index}
                    className="relative p-4 bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30 text-white cursor-pointer group overflow-hidden hover:border-blue-400/50 transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -2 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="relative z-10 text-center space-y-2">
                      <span className="text-2xl block">{genre.icon}</span>
                      <span className="text-sm  block">{genre.name}</span>
                      <span className="text-xs text-gray-300 block">
                        {genre.description}
                      </span>
                    </div>
                    <motion.div
                      className="absolute inset-0 bg-white/10"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Story Themes */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl text-white">Story Themes</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {writingCategories.themes.map((theme, index) => (
                  <motion.div
                    key={index}
                    className="relative p-4 bg-gradient-to-r from-green-500/20 to-teal-600/20 border border-green-500/30 text-white cursor-pointer group overflow-hidden hover:border-green-400/50 transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -2 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="relative z-10 text-center space-y-2">
                      <span className="text-2xl block">{theme.icon}</span>
                      <span className="text-sm  block">{theme.name}</span>
                      <span className="text-xs text-gray-300 block">
                        {theme.description}
                      </span>
                    </div>
                    <motion.div
                      className="absolute inset-0 bg-white/10"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Start Creating Button */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
          >
            <Link href="/create-stories">
              <AnimatedButton text="Spark Imagination" />
            </Link>
          </motion.div>
        </div>
      </section>

      <DiamondSeparator />

      {/* Platform Features Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 backdrop-blur-xl mb-4">
              <Sparkles className="w-4 h-4 text-purple-400 mr-2" />
              <span className="text-purple-200  text-sm">
                Platform Features
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl mb-6">
              Everything Your Child Needs to{' '}
              <span className="bg-gradient-to-r from-green-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Write & Improve
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              Freeform creative writing with AI collaboration and advanced
              assessment feedback
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {platformFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="group relative"
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <div
                  className={`relative h-full p-8 bg-gradient-to-br ${feature.bgColor} backdrop-blur-xl border border-gray-600/40 shadow-xl overflow-hidden`}
                >
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    {React.cloneElement(feature.icon, {
                      className: 'text-white',
                    })}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl text-white mb-4 group-hover:text-green-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    {feature.description}
                  </p>

                  {/* Hover Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <DiamondSeparator />

      {/* Features Section with Images */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl text-white pb-6">
              Why Kids Love{' '}
              <span className="bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                Mintoons
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-14 md:grid-cols-2 xl:grid-cols-4 ">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group relative"
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <div className="relative h-full bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 shadow-xl overflow-hidden p-2">
                  {/* Feature Image */}
                  <div className="relative h-40 sm:h-48 overflow-hidden">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />

                    {/* Reduced Gradient Overlay */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-30`}
                    />

                    {/* Icon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="text-white bg-black/20 backdrop-blur-sm rounded-full p-2 sm:p-3"
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        transition={{ duration: 0.3 }}
                      >
                        {React.cloneElement(feature.icon, {
                          className: 'w-6 sm:w-8 h-6 sm:h-8',
                        })}
                      </motion.div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl text-white mb-2 sm:mb-3">
                      {feature.title}
                    </h3>

                    <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <DiamondSeparator />

      {/* Values Section */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl text-white mb-4">
              Our Core Principles
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              The foundational values that guide our educational approach and
              commitment to developing children&apos;s creativity and writing
              skills.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:gap-10 lg:gap-12 md:grid-cols-2">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/10 backdrop-blur-xl p-6 sm:p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group"
              >
                <div
                  className={`w-14 sm:w-16 h-14 sm:h-16 bg-gradient-to-r ${value.gradient} rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <value.icon className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl text-white mb-2 sm:mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <DiamondSeparator />

      {/* How It Works Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl text-white mb-6">
              How It{' '}
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our proven 8-step process guides young writers from initial idea
              to published story with detailed feedback and much more.
            </p>
          </motion.div>

          <div className="space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
                >
                  {/* Content Side */}
                  <div
                    className={`space-y-6 ${index % 2 === 1 ? 'lg:order-2' : ''}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-16 h-16 bg-gradient-to-r ${step.gradient} flex items-center justify-center shadow-lg`}
                      >
                        {step.icon}
                      </div>
                      <div className="text-6xl text-blue-100 dark:text-gray-700">
                        {step.number}
                      </div>
                    </div>

                    <h3 className="text-3xl text-white">{step.title}</h3>

                    <p className="text-lg text-gray-300 leading-relaxed">
                      {step.description}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      {step.features.map((feature, featureIndex) => (
                        <div
                          key={featureIndex}
                          className="flex items-center space-x-2 text-gray-300"
                        >
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Visual Side - Updated with Images */}
                  <div
                    className={`relative ${index % 2 === 1 ? 'lg:order-1' : ''}`}
                  >
                    <motion.div
                      className="relative h-80 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-600/40 overflow-hidden shadow-xl"
                      whileHover={{ scale: 1.02, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Background Image */}
                      <div className="absolute inset-0">
                        <Image
                          src={step.image}
                          alt={step.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>

                      {/* Animated Color Overlay (on top of image) */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-20`}
                      />

                      {/* Floating elements */}
                      <motion.div
                        className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full"
                        animate={{
                          y: [0, -10, 0],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.5,
                        }}
                      />
                    </motion.div>
                  </div>
                </div>

                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <motion.div
                    className="flex justify-center my-12"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: index * 0.2 + 0.5 }}
                    viewport={{ once: true }}
                  >
                    <ArrowRight className="w-8 h-8 text-gray-600" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-8xl mx-auto">
          <motion.div
            className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl p-8 sm:p-10 lg:p-12 text-center border border-gray-600/40 shadow-xl relative overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10">
              <Image
                src="/kid5.jpg"
                alt="Background"
                fill
                className="opacity-20 object-center object-cover"
              />
            </div>

            <div className="relative z-10">
              <motion.div
                className="inline-flex p-3 sm:p-4 rounded-full bg-gradient-to-r from-green-500 to-teal-600 mb-4 sm:mb-6 shadow-lg"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                }}
              >
                <Lightbulb className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
              </motion.div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl text-white mb-4">
                Ready to Start Your{' '}
                <span className="bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                  Creative Writing Journey?
                </span>
              </h2>

              <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 leading-relaxed max-w-3xl mx-auto">
                Join thousands of young writers creating amazing stories with{' '}
                <span className="text-green-300 ">
                  complete creative freedom
                </span>{' '}
                and <span className="text-teal-300 ">AI-powered feedback</span>{' '}
                to improve their skills. Start with 3 free stories and 9 free
                assessments!
              </p>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/create-stories">
                  <AnimatedButton text="Spark Imagination" />
                </Link>
              </motion.div>

              {/* Added pricing info */}
              <motion.div
                className="mt-6 pt-6 border-t border-gray-600/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>3 Free Stories Monthly</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>9 Free AI Assessments</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>3 Free Competition Entries</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>No Credit Card Required</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
