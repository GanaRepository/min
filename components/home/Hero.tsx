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
  Wand2,
  Lightbulb,
  TrendingUp,
  Image as ImageIcon,
  Play,
  Code,
  Palette,
  BarChart3,
  Shield,
  Target,
  MessageSquare,
  Share2,
  CheckCircle,
  ArrowRight,
  Globe,
  Rocket,
  Cat,
} from 'lucide-react';
import React from 'react';

import { DiamondSeparator } from '../seperators/DiamondSeparator';

export default function Home() {
  const features = [
    {
      icon: <PenTool className="w-6 h-6" />,
      title: 'Choose Your Story Elements',
      description:
        'Select from genres, characters, settings, and themes through guided prompts to build your unique story foundation.',
      gradient: 'from-green-500 to-teal-600',
      image: '/kid1.jpg',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Teacher Mentorship',
      description:
        'English teachers provide real-time feedback and guidance through our commenting system, just like Google Docs reviews.',
      gradient: 'from-blue-500 to-indigo-600',
      image: '/kid2.jpg',
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Stage-Based Learning',
      description:
        'Start with 1-page stories and progress to longer adventures. Complete 10 stories per stage to advance your writing skills.',
      gradient: 'from-orange-500 to-yellow-600',
      image: '/kid4.jpg',
    },
    {
      icon: <Wand2 className="w-6 h-6" />,
      title: 'AI Collaboration & Illustrations',
      description:
        'AI suggests plot developments as you write, plus generates custom illustrations of your characters and scenes.',
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

  // Story elements data
  const storyElements = {
    genres: [
      { name: 'Fantasy', icon: '🧙‍♀️', gradient: 'from-purple-500 to-pink-600' },
      { name: 'Adventure', icon: '🗺️', gradient: 'from-teal-500 to-cyan-600' },
      { name: 'Space', icon: '🚀', gradient: 'from-blue-500 to-indigo-600' },
      { name: 'Animals', icon: '🐾', gradient: 'from-orange-500 to-red-600' },
      { name: 'Mystery', icon: '🔍', gradient: 'from-gray-500 to-blue-600' },
      {
        name: 'Friendship',
        icon: '👥',
        gradient: 'from-pink-500 to-orange-600',
      },
    ],
    settings: [
      {
        name: 'Enchanted Forest',
        icon: '🌲',
        gradient: 'from-green-500 to-emerald-600',
      },
      {
        name: 'Magical Castle',
        icon: '🏰',
        gradient: 'from-purple-500 to-blue-600',
      },
      {
        name: 'Space Station',
        icon: '🛸',
        gradient: 'from-blue-500 to-indigo-600',
      },
      {
        name: 'Underwater City',
        icon: '🌊',
        gradient: 'from-cyan-500 to-blue-600',
      },
      {
        name: 'Sky Kingdom',
        icon: '☁️',
        gradient: 'from-blue-500 to-indigo-600',
      },
      {
        name: 'Time Portal',
        icon: '⏰',
        gradient: 'from-yellow-500 to-orange-600',
      },
    ],
  };

  // Platform features data
  const platformFeatures = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'AI Writing Companion',
      description:
        'Smart prompts and suggestions that inspire creativity while children write their own unique stories',
      gradient: 'from-pink-500 to-purple-600',
      bgColor: 'from-pink-500/10 to-purple-500/10',
      learnMore: true,
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Ultra-Safe Environment',
      description:
        'COPPA-compliant platform with advanced content filtering and parental controls for peace of mind',
      gradient: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-500/10 to-emerald-500/10',
      learnMore: true,
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Expert Story Mentors',
      description:
        'Professional educators provide personalized feedback and encouragement for every young writer',
      gradient: 'from-blue-500 to-cyan-600',
      bgColor: 'from-blue-500/10 to-cyan-500/10',
      learnMore: true,
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Gamified Learning',
      description:
        'Earn badges, build streaks, and unlock achievements that make writing fun and rewarding',
      gradient: 'from-yellow-500 to-orange-600',
      bgColor: 'from-yellow-500/10 to-orange-500/10',
      learnMore: true,
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Smart Story Assessment',
      description:
        'AI analyzes grammar, creativity, and structure, providing constructive feedback for improvement',
      gradient: 'from-red-500 to-pink-600',
      bgColor: 'from-red-500/10 to-pink-500/10',
      learnMore: true,
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Creativity-First Approach',
      description:
        'Focus on original thinking and imagination rather than AI-generated content',
      gradient: 'from-purple-500 to-pink-600',
      bgColor: 'from-purple-500/10 to-pink-500/10',
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
      icon: <Target className="w-8 h-8" />,
      title: 'Choose Your Elements',
      description:
        'Select genre, characters, setting, and theme from our guided prompts to build your story foundation.',
      gradient: 'from-purple-500 to-indigo-600',
      features: ['9 Genre Options', '9 Settings', '9 Characters', '6 Themes'],
      image: '/kid9.jpg',
    },
    {
      number: '02',
      icon: <PenTool className="w-8 h-8" />,
      title: 'Start Writing',
      description:
        'Begin your story with AI-generated prompts that spark your imagination and creativity.',
      gradient: 'from-blue-500 to-cyan-600',
      features: [
        'AI Story Starters',
        'Creative Prompts',
        'Writing Tips',
        'Real-time Guidance',
      ],
      image: '/kid10.jpg',
    },
    {
      number: '03',
      icon: <Sparkles className="w-8 h-8" />,
      title: 'Collaborate & Create',
      description:
        'Write your ideas, get AI suggestions, continue building your unique story through collaboration.',
      gradient: 'from-green-500 to-teal-600',
      features: [
        'Interactive Writing',
        'AI Plot Suggestions',
        'Character Development',
        'Scene Building',
      ],
      image: '/kid11.jpg',
    },
    {
      number: '04',
      icon: <MessageSquare className="w-8 h-8" />,
      title: 'Get Feedback',
      description:
        'Teachers review and provide guidance through our real-time commenting system.',
      gradient: 'from-orange-500 to-red-600',
      features: [
        'Teacher Comments',
        'Writing Tips',
        'Grammar Help',
        'Creative Guidance',
      ],
      image: '/kid12.jpg',
    },
    {
      number: '05',
      icon: <Share2 className="w-8 h-8" />,
      title: 'Publish & Share',
      description:
        'Turn completed stories into real books and share your creative achievements.',
      gradient: 'from-pink-500 to-purple-600',
      features: [
        'PDF Generation',
        'Book Publishing',
        'Story Library',
        'Achievement Badges',
      ],
      image: '/kid14.jpg',
    },
  ];

  const values = [
    {
      icon: Target,
      title: 'Creativity Development',
      description:
        'Our platform encourages original thinking and prevents "robot-like" writing by having children do the actual creative work while AI provides inspiration.',
      gradient: 'from-blue-600 to-blue-800',
    },
    {
      icon: Shield,
      title: 'Child Safety & Privacy',
      description:
        'COPPA-compliant platform with industry-leading security measures and transparent data practices for complete peace of mind.',
      gradient: 'from-green-600 to-green-800',
    },
    {
      icon: Lightbulb,
      title: 'Collaborative Writing Process',
      description:
        'Children write 4-5 lines, AI responds with plot suggestions, then children continue - creating truly collaborative storytelling that builds writing skills.',
      gradient: 'from-purple-600 to-purple-800',
    },
    {
      icon: BarChart3,
      title: 'Story Publishing & Progress',
      description:
        'Track writing development through our stage system and publish completed stories as real books, giving children tangible creative achievements.',
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
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

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-green-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            variants={particleVariants}
            animate="animate"
            transition={{ delay: i * 0.3 }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12 xl:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8 flex flex-col items-center">
              {/* Floating badge */}
              <motion.div
                className="mt-12 inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-green-400/30 backdrop-blur-xl"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <Sparkles className="w-4 h-4 text-green-400 mr-2" />
                <span className="text-green-200 font-medium text-sm">
                  Creative Writing Education Platform
                </span>
              </motion.div>

              {/* Main heading */}
              <motion.div
                className="space-y-4 text-center"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
              >
                <h1 className=" text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight">
                  <span className="block text-white">Where Young Writers</span>
                  <span className="block bg-gradient-to-r from-green-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                    Create Amazing Stories
                  </span>
                </h1>

                <p className="text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed">
                  A collaborative platform where children develop{' '}
                  <span className="text-green-300 font-medium">creativity</span>{' '}
                  through{' '}
                  <span className="text-teal-300 font-medium">
                    interactive story writing
                  </span>{' '}
                  with{' '}
                  <span className="text-cyan-300 font-medium">AI guidance</span>{' '}
                  and{' '}
                  <span className="text-blue-300 font-medium">
                    teacher mentorship
                  </span>
                  .
                </p>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col justify-center gap-4"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <Link href="/create-stories">
                  <motion.button
                    className="group relative px-8 py-3 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl  text-base text-white shadow-lg shadow-green-500/25 overflow-hidden"
                    whileHover={{
                      scale: 1.05,
                      boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="relative z-10 flex items-center ">
                      <PenTool className="w-4 h-4 mr-2" />
                      Start Writing Now →
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-teal-600 to-green-500"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '0%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.button>
                </Link>

                <Link href="/contact-us">
                  <motion.button
                    className="px-8 py-3 bg-gray-800/60 backdrop-blur-xl rounded-xl  text-base text-white border border-gray-600/50 shadow-lg hover:bg-gray-700/60 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Know More About Us →
                    </span>
                  </motion.button>
                </Link>
              </motion.div>

              {/* Feature Icons Preview */}
              <motion.div
                className="flex items-center space-x-6 pt-4 justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <ImageIcon className="w-4 h-4" />
                  <span>AI Illustrations</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <Palette className="w-4 h-4" />
                  <span>Teacher Feedback</span>
                </div>
              </motion.div>
            </div>

            {/* Middle - Hero Image */}
            <motion.div
              className="relative flex justify-center"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              <motion.div
                className="relative"
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {/* Glow Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-teal-500/30  blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 0.8, 0.4],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                {/* Hero Image Container */}
                <div className="relative w-80 sm:w-96 h-[28rem] sm:h-[32rem]  overflow-hidden shadow-2xl">
                  <Image
                    src="/kid3.jpg"
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
                      <h3 className="text-lg sm:text-xl  text-white mb-2">
                        Mintoons
                      </h3>
                      <p className="text-green-300 text-xs sm:text-sm font-medium">
                        Creative Writing Education Platform
                      </p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right - Animated Card */}
            <motion.div
              className="relative flex justify-center"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 1.4 }}
            >
              <motion.div
                className="relative"
                animate={{
                  y: [0, -20, 0],
                  rotateY: [0, 5, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {/* Enhanced Glow Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-teal-500/30  blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 0.8, 0.4],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                {/* Main Card with Image */}
                <div className="relative w-80 sm:w-96 h-[28rem] sm:h-[32rem] bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-2xl  border border-gray-600/40 shadow-2xl overflow-hidden">
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
                      <span className="text-white  text-lg sm:text-xl relative z-10">
                        M
                      </span>
                    </motion.div>

                    {/* Card Content */}
                    <div className="text-center space-y-2 sm:space-y-4 flex-grow">
                      <motion.h3
                        className="text-xl sm:text-2xl  text-white"
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

                      <motion.p
                        className="text-gray-300 text-xs sm:text-sm leading-relaxed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                      >
                        &quot;Where Young Writers Create Amazing Stories&quot;
                      </motion.p>
                      <motion.p
                        className="text-gray-300 text-xs sm:text-sm leading-relaxed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                      >
                        Empowering children to develop creativity through
                        collaborative writing with AI assistance and teacher
                        mentorship.
                      </motion.p>

                      {/* New Content Addition */}
                      <motion.p
                        className="text-gray-300 text-xs sm:text-sm leading-relaxed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                      >
                        Dive into a world where children&apos;s original ideas
                        come to life, building writing skills and creative
                        confidence.
                      </motion.p>

                      {/* Mini Feature Icons */}
                      <div className="flex justify-center space-x-2 sm:space-x-4 py-2">
                        {[ImageIcon, Users, PenTool, Sparkles, BookOpen].map(
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
                        className="text-green-400 text-xs font-medium"
                        animate={{
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      >
                        Creative Writing Education Platform
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
            <h2 className="text-3xl sm:text-4xl lg:text-5xl  mb-6">
              Amazing Stories by{' '}
              <span className="bg-gradient-to-r from-green-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Young Writers
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              See what incredible stories children are creating with MINTOONS
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                <div className="relative h-full  bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 shadow-xl overflow-hidden">
                  {/* Story Card Header */}
                  <div
                    className={`relative h-48 bg-gradient-to-br ${story.gradient} overflow-hidden`}
                  >
                    {/* Genre Badge */}
                    <div className="absolute top-4 left-4 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
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
                    <h3 className="text-xl  text-white mb-3 group-hover:text-green-400 transition-colors">
                      {story.title}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
                      {story.description}
                    </p>

                    {/* Author Info */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-600/30">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-teal-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs ">
                            {story.author.split(',')[0].charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-green-400 text-sm font-medium">
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
              <motion.button
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl  text-lg text-white shadow-lg shadow-purple-500/25 overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center">
                  Register Now to Explore All Stories
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-500"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '0%' }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      <DiamondSeparator />

      {/* Story Elements Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl  mb-6">
              Choose from{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Amazing Elements
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              Mix and match genres, characters, settings, and moods to create
              unique stories
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Exciting Genres */}
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
                <h3 className="text-2xl  text-white">
                  Exciting Genres
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {storyElements.genres.map((genre, index) => (
                  <motion.div
                    key={index}
                    className={`relative p-4 bg-gradient-to-r ${genre.gradient}  text-white cursor-pointer group overflow-hidden`}
                    whileHover={{ scale: 1.05, y: -2 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="relative z-10 flex items-center space-x-3">
                      <span className="text-2xl">{genre.icon}</span>
                      <span className="">{genre.name}</span>
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

            {/* Magical Settings */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl  text-white">
                  Magical Settings
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {storyElements.settings.map((setting, index) => (
                  <motion.div
                    key={index}
                    className={`relative p-4 bg-gradient-to-r ${setting.gradient}  text-white cursor-pointer group overflow-hidden`}
                    whileHover={{ scale: 1.05, y: -2 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="relative z-10 flex items-center space-x-3">
                      <span className="text-2xl">{setting.icon}</span>
                      <span className="">{setting.name}</span>
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
              <motion.button
                className="group relative px-10 py-4 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl  text-lg text-white shadow-lg shadow-purple-500/25 overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center">
                  Start Creating Stories
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-500"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '0%' }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
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
              <span className="text-purple-200 font-medium text-sm">
                Platform Features
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl  mb-6">
              Everything Your Child Needs to{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                Write Amazing Stories
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              Designed specifically for young writers with safety, creativity,
              and learning at the core
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
                  className={`relative h-full p-8  bg-gradient-to-br ${feature.bgColor} backdrop-blur-xl border border-gray-600/40 shadow-xl overflow-hidden`}
                >
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${feature.gradient}  flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    {React.cloneElement(feature.icon, {
                      className: 'text-white',
                    })}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl  text-white mb-4 group-hover:text-green-400 transition-colors">
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
            <h2 className="text-2xl sm:text-3xl lg:text-4xl  text-white pb-6">
              Why Kids Love{' '}
              <span className="bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                Mintoons
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
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
                <div className="relative h-full  bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 shadow-xl overflow-hidden">
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
                    <h3 className="text-lg sm:text-xl  text-white mb-2 sm:mb-3">
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
            <h2 className="text-3xl sm:text-4xl lg:text-5xl  text-white mb-4">
              Our Core Principles
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              The foundational values that guide our educational approach and
              commitment to developing children&apos;s creativity and writing
              skills.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/10 backdrop-blur-xl  p-6 sm:p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group"
              >
                <div
                  className={`w-14 sm:w-16 h-14 sm:h-16 bg-gradient-to-r ${value.gradient} rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <value.icon className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl  text-white mb-2 sm:mb-4">
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
            <h2 className="text-4xl sm:text-5xl  text-white mb-6">
              How It{' '}
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our proven 5-step process guides young writers from initial idea
              to published story
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
                        className={`w-16 h-16 bg-gradient-to-r ${step.gradient}  flex items-center justify-center shadow-lg`}
                      >
                        {step.icon}
                      </div>
                      <div className="text-6xl  text-blue-100 dark:text-gray-700">
                        {step.number}
                      </div>
                    </div>

                    <h3 className="text-3xl  text-white">
                      {step.title}
                    </h3>

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
                      className="relative h-80 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl  border border-gray-600/40 overflow-hidden shadow-xl"
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
            className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl  p-8 sm:p-10 lg:p-12 text-center border border-gray-600/40 shadow-xl relative overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10">
              <Image
                src="/kid1.jpg"
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

              <h2 className="text-2xl sm:text-3xl lg:text-4xl  text-white mb-4">
                Ready to Start Your{' '}
                <span className="bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                  Creative Writing Journey?
                </span>
              </h2>

              <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 leading-relaxed max-w-3xl mx-auto">
                Join a platform designed to develop children&apos;s{' '}
                <span className="text-green-300 font-medium">
                  creativity and original thinking
                </span>{' '}
                through{' '}
                <span className="text-teal-300 font-medium">
                  collaborative storytelling
                </span>{' '}
                with AI assistance and teacher guidance.
              </p>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/create-stories">
                  <button className="group relative px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl  text-base sm:text-lg text-white shadow-lg shadow-cyan-500/25 overflow-hidden">
                    <span className="relative z-10 flex items-center justify-center">
                      <Zap className="w-4 sm:w-5 h-4 sm:h-5 mr-2 sm:mr-3" />
                      Start Writing Your First Story →
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '0%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
