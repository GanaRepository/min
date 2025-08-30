// app/create-stories/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Upload,
  Trophy,
  FileText,
  Zap,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Star,
  Brain,
  Target,
  Clock,
  Palette,
  Heart,
  Rocket,
  Crown,
  Shield,
  Gift,
  Plus,
  X,
  Download,
  Eye,
} from 'lucide-react';
import TerminalLoader from '@/components/TerminalLoader';

// ===== INTERFACES =====
interface UsageStats {
  freestyleStories: {
    used: number;
    limit: number;
    remaining: number;
    canUse: boolean;
  };
  assessmentRequests: {
    used: number;
    limit: number;
    remaining: number;
    canUse: boolean;
  };
  competitionEntries: {
    used: number;
    limit: number;
    remaining: number;
    canUse: boolean;
  };
  subscriptionTier: 'FREE' | 'STORY_PACK';
  resetDate: string;
}

interface FileUpload {
  file: File | null;
  content: string;
  title: string;
  uploadType: 'freestyle' | 'assessment' | 'competition';
}

// Loading fallback component for Suspense boundary
function CreateStoriesLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <TerminalLoader
        title="Story Creator"
        loadingText="Loading your creative tools..."
        size="lg"
      />
    </div>
  );
}

function CreateStoriesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ===== STATE =====
  const [loading, setLoading] = useState(true);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [activeSection, setActiveSection] = useState<
    'home' | 'freestyle' | 'assessment' | 'competition'
  >('home');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // File upload states
  const [uploadData, setUploadData] = useState<FileUpload>({
    file: null,
    content: '',
    title: '',
    uploadType: 'assessment',
  });
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [creatingStory, setCreatingStory] = useState(false);

  // ===== EFFECTS =====
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'child') {
      router.push('/login/child');
      return;
    }

    // Check for URL hash to navigate to specific section
    const hash = window.location.hash.replace('#', '');
    if (['freestyle', 'assessment', 'competition'].includes(hash)) {
      setActiveSection(hash as any);
    }

    fetchUsageStats();
  }, [session, status, router]);

  useEffect(() => {
    // Update URL hash when section changes
    if (activeSection !== 'home') {
      window.history.replaceState(null, '', `#${activeSection}`);
    } else {
      window.history.replaceState(null, '', '/create-stories');
    }
  }, [activeSection]);

  // ===== DATA FETCHING =====
  const fetchUsageStats = async () => {
    try {
      setLoading(true);
      // Force fresh data by adding timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/user/usage?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsageStats(data.usage);
      } else {
        console.error('Failed to fetch usage stats');
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setLoading(false);
    }
  };

  // ===== STORY CREATION =====
  const handleCreateFreestyleStory = async () => {
    if (!usageStats?.freestyleStories.canUse) {
      setError(
        'You have reached your monthly story creation limit. Upgrade to Story Pack for more stories!'
      );
      return;
    }

    setCreatingStory(true);
    setError(null);

    try {
      const response = await fetch('/api/stories/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionType: 'freestyle',
          title: 'My New Story', // Default title, user can change later
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to the story writing interface
        router.push(`/children-dashboard/story/${data.sessionId}`);
      } else {
        throw new Error(data.error || 'Failed to create story session');
      }
    } catch (error) {
      console.error('❌ Story creation error:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to create story. Please try again.'
      );
    } finally {
      setCreatingStory(false);
      // Refresh usage stats after story creation (success or failure)
      fetchUsageStats();
    }
  };

  // ===== FILE HANDLING =====
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Check file type
    const validTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const validExtensions = ['.txt', '.pdf', '.docx'];

    const isValidType =
      validTypes.includes(file.type) ||
      validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!isValidType) {
      setError('Please upload only .txt, .pdf, or .docx files');
      return;
    }

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploadData((prev) => ({
      ...prev,
      file,
      title:
        prev.title || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
    }));
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  // ===== STORY UPLOAD =====
  const handleUploadStory = async () => {
    if (!uploadData.title.trim()) {
      setError('Please enter a story title');
      return;
    }

    if (!uploadData.content.trim() && !uploadData.file) {
      setError('Please provide story content via file upload or text input');
      return;
    }

    // Check usage limits based on upload type
    if (
      uploadData.uploadType === 'assessment' &&
      !usageStats?.assessmentRequests.canUse
    ) {
      setError(
        'You have reached your monthly assessment upload limit. Upgrade to Story Pack for more uploads!'
      );
      return;
    }

    if (
      uploadData.uploadType === 'competition' &&
      !usageStats?.competitionEntries.canUse
    ) {
      setError(
        'You have reached your monthly competition entry limit (3 entries maximum).'
      );
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', uploadData.title.trim());
      formData.append('uploadType', uploadData.uploadType);

      if (uploadData.file) {
        formData.append('file', uploadData.file);
      } else {
        formData.append('content', uploadData.content.trim());
      }

      const endpoint =
        uploadData.uploadType === 'competition'
          ? '/api/user/stories/upload-competition'
          : '/api/stories/upload';

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      // FIXED: Better error handling for non-JSON responses
      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // FIXED: Handle JSON parsing errors
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('❌ JSON parsing error:', jsonError);
        throw new Error('Server returned invalid response. Please try again.');
      }

      if (data.success) {
        setSuccess(
          `Story uploaded successfully! ${
            uploadData.uploadType === 'assessment'
              ? 'AI assessment has begun and will be ready shortly.'
              : 'Your competition entry has been submitted.'
          }`
        );

        // Reset form
        setUploadData({
          file: null,
          content: '',
          title: '',
          uploadType: 'assessment',
        });

        // Refresh usage stats
        fetchUsageStats();

        // FIXED: Use the correct property from response
        const storyId = data.storyId || data.story?.id;
        if (storyId) {
          // Redirect to story view after delay
          setTimeout(() => {
            router.push(`/children-dashboard/my-stories/${storyId}`);
          }, 2000);
        }
      } else {
        // Handle general upload errors
        setError(data.error || 'Failed to upload story');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to upload story. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <TerminalLoader
          title="Dashboard"
          loadingText="Loading your creative studio..."
          size="md"
        />
      </div>
    );
  }

  // ===== RENDER SECTIONS =====
  const renderHomeSection = () => (
    <div className="max-w-7xl mx-auto px-6 mt-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="relative "
          >
            <Palette className="w-20 h-20 text-purple-400" />
            <div className="rounded-md absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-500 to-yellow-500  flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </motion.div>
        </div>

        <h1 className="text-5xl md:text-6xl  text-white mb-6">
          <span className="block">Your Creative</span>
          <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Writing Studio
          </span>
        </h1>

        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          Three powerful ways to create and improve your stories:
          <span className="text-blue-400 "> AI Collaboration</span>,
          <span className="text-green-400 "> Expert Assessment</span>, and
          <span className="text-purple-400 "> Monthly Competitions</span>
        </p>

        {/* Usage Stats Overview */}
        {usageStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-3 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12"
          >
            <div className="bg-blue-500/20 border border-blue-500/30  p-4">
              <div className="text-2xl  text-blue-400">
                {usageStats.freestyleStories.remaining}
              </div>
              <div className="text-sm text-blue-300">
                Freestyle Stories Left
              </div>
            </div>
            <div className="bg-green-500/20 border border-green-500/30  p-4">
              <div className="text-2xl  text-green-400">
                {usageStats.assessmentRequests.remaining}
              </div>
              <div className="text-sm text-green-300">
                Assessment Requests Left
              </div>
            </div>
            <div className="bg-purple-500/20 border border-purple-500/30  p-4">
              <div className="text-2xl  text-purple-400">
                {usageStats.competitionEntries.remaining}
              </div>
              <div className="text-sm text-purple-300">
                Competition Entries Left
              </div>
            </div>
          </motion.div>
        )}

        {/* Subscription Tier Badge */}
        {usageStats && (
          <div className="flex justify-center mb-8">
            {usageStats.subscriptionTier === 'STORY_PACK' ? (
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 px-6 py-2   flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Story Pack Active
              </div>
            ) : (
              <div className="rounded-sm bg-gray-700/50 text-gray-300 px-6 py-2   flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Free Writer
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Three Main Options */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {/* Freestyle Writing */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => setActiveSection('freestyle')}
          className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30  p-8 cursor-pointer hover:scale-105 transition-all duration-300 group"
        >
          <div className="text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600  blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 w-16 h-16  flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>

            <h3 className="text-2xl  text-white mb-4">Freestyle Writing</h3>
            <p className="text-gray-300 mb-6">
              Turn-based AI collaboration to develop your creative story ideas
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-300">
                <Clock className="w-4 h-4 mr-2 text-blue-400" />7 turns of
                collaborative writing
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Brain className="w-4 h-4 mr-2 text-blue-400" />
                AI helps develop your story naturally
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Target className="w-4 h-4 mr-2 text-blue-400" />
                Automatic assessment when complete
              </div>
            </div>

            {usageStats && (
              <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/20 ">
                <p className="text-sm text-gray-300">
                  {usageStats.freestyleStories?.canUse ? (
                    `${usageStats.freestyleStories?.remaining ?? 0} stories remaining this month`
                  ) : (
                    <span className="text-red-400">
                      Monthly limit reached - Upgrade to Story Pack
                    </span>
                  )}
                </p>
              </div>
            )}

            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3   transition-all flex items-center justify-center gap-2">
              <Rocket className="w-5 h-5" />
              Start Writing
            </button>
          </div>
        </motion.div>

        {/* Upload for Assessment */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => setActiveSection('assessment')}
          className="bg-gradient-to-br from-green-500/20 to-teal-500/20 border border-green-500/30  p-8 cursor-pointer hover:scale-105 transition-all duration-300 group"
        >
          <div className="text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-600  blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-green-500 to-teal-600 w-16 h-16  flex items-center justify-center mx-auto">
                <Upload className="w-8 h-8 text-white" />
              </div>
            </div>

            <h3 className="text-2xl  text-white mb-4">Upload for Assessment</h3>
            <p className="text-gray-300 mb-6">
              Get detailed AI feedback on stories you&apos;ve already written
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-300">
                <FileText className="w-4 h-4 mr-2 text-green-400" />
                Support for .txt, .pdf, .docx files
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Brain className="w-4 h-4 mr-2 text-green-400" />
                16+ category analysis like a teacher
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Shield className="w-4 h-4 mr-2 text-green-400" />
                Plagiarism and AI content detection
              </div>
            </div>

            {usageStats && (
              <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 ">
                <p className="text-sm text-gray-300">
                  {usageStats.assessmentRequests.canUse ? (
                    `${usageStats.assessmentRequests.remaining} uploads remaining this month`
                  ) : (
                    <span className="text-red-400">
                      Monthly limit reached - Upgrade to Story Pack
                    </span>
                  )}
                </p>
              </div>
            )}

            <button className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-3   transition-all flex items-center justify-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Story
            </button>
          </div>
        </motion.div>

        {/* Competition Entry */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => setActiveSection('competition')}
          className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30  p-8 cursor-pointer hover:scale-105 transition-all duration-300 group"
        >
          <div className="text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600  blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-purple-500 to-pink-600 w-16 h-16  flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8 text-white" />
              </div>
            </div>

            <h3 className="text-2xl  text-white mb-4">Competition Entry</h3>
            <p className="text-gray-300 mb-6">
              Submit your best stories to monthly writing competitions
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-300">
                <Gift className="w-4 h-4 mr-2 text-purple-400" />
                Completely FREE to enter
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Star className="w-4 h-4 mr-2 text-purple-400" />
                Top 3 winners each month
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Trophy className="w-4 h-4 mr-2 text-purple-400" />
                AI-powered fair judging
              </div>
            </div>

            {usageStats && (
              <div className="mb-6 p-3 bg-purple-500/10 border border-purple-500/20 ">
                <p className="text-sm text-gray-300">
                  {usageStats.competitionEntries.canUse ? (
                    `${usageStats.competitionEntries.remaining} entries remaining this month`
                  ) : (
                    <span className="text-orange-400">
                      3 entries used - Maximum reached
                    </span>
                  )}
                </p>
              </div>
            )}

            <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3   transition-all flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5" />
              Enter Competition
            </button>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-8 mb-16"
      >
        <h2 className="text-3xl  text-white text-center mb-8">
          Why Choose Mintoons? ✨
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <Brain className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg  text-white mb-2">AI-Powered Learning</h3>
            <p className="text-gray-400 text-sm">
              Get detailed feedback on 16+ writing categories
            </p>
          </div>

          <div className="text-center">
            <Shield className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg  text-white mb-2">Safe & Secure</h3>
            <p className="text-gray-400 text-sm">
              Child-friendly platform with integrity checking
            </p>
          </div>

          <div className="text-center">
            <Trophy className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg  text-white mb-2">Monthly Contests</h3>
            <p className="text-gray-400 text-sm">
              Compete with young writers worldwide
            </p>
          </div>

          <div className="text-center">
            <Heart className="w-12 h-12 text-pink-400 mx-auto mb-4" />
            <h3 className="text-lg  text-white mb-2">Encouraging Community</h3>
            <p className="text-gray-400 text-sm">
              Supportive feedback from mentors and peers
            </p>
          </div>
        </div>
      </motion.div>

      {/* Upgrade Promotion */}
      {usageStats && usageStats.subscriptionTier === 'FREE' && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30  p-8 text-center"
        >
          <Crown className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h3 className="text-2xl  text-white mb-4">
            Want More Creative Power?
          </h3>
          <p className="text-gray-300 mb-6">
            Upgrade to Story Pack and get 5 more stories, 5 more assessments,
            and 15 more assessment attempts each month!
          </p>
          <button
            onClick={() => router.push('/pricing')}
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3   transition-colors"
          >
            Upgrade to Story Pack - $15/month
          </button>
        </motion.div>
      )}
    </div>
  );

  const renderFreestyleSection = () => (
    <div className="max-w-4xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <button
          onClick={() => setActiveSection('home')}
          className="bg-green-500 p-2 px-6  flex items-center gap-2 text-gray-800 hover:text-white mb-6 transition-colors mx-auto"
        >
          ← Back to Options
        </button>

        <div className="relative mb-6">
          <Sparkles className="w-20 h-20 text-blue-400 mx-auto" />
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500  flex items-center justify-center">
            <Rocket className="w-4 h-4 text-white" />
          </div>
        </div>

        <h1 className="text-4xl  text-white mb-4">Freestyle Story Writing</h1>
        <p className="text-xl text-gray-300 mb-8">
          Collaborate with AI to create amazing stories through turn-based
          writing
        </p>
      </motion.div>

      <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-8 mb-8">
        <h3 className="text-2xl  text-white mb-6">How It Works:</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600  flex items-center justify-center mx-auto mb-4 text-white ">
              1
            </div>
            <h4 className=" text-white mb-2">You Write</h4>
            <p className="text-gray-400 text-sm">
              Start your story with any idea - at least 60 words per turn
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-600  flex items-center justify-center mx-auto mb-4 text-white ">
              2
            </div>
            <h4 className=" text-white mb-2">AI Responds</h4>
            <p className="text-gray-400 text-sm">
              AI continues your story naturally and asks inspiring questions
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-green-600  flex items-center justify-center mx-auto mb-4 text-white ">
              3
            </div>
            <h4 className=" text-white mb-2">Repeat & Assess</h4>
            <p className="text-gray-400 text-sm">
              Continue for 7 turns, then get detailed AI assessment
            </p>
          </div>
        </div>

        {usageStats && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 ">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">Stories Remaining:</span>
              <span className="text-white ">
                {usageStats.freestyleStories?.remaining ?? 0} /{' '}
                {usageStats.freestyleStories?.limit ?? 0}
              </span>
            </div>
            <div className="w-full bg-blue-800/30  h-2">
              <div
                className="bg-blue-400 h-2  transition-all"
                style={{
                  width: `${((usageStats.freestyleStories?.used ?? 0) / (usageStats.freestyleStories?.limit ?? 1)) * 100}%`,
                }}
              />
            </div>
            {!usageStats.freestyleStories?.canUse && (
              <p className="text-red-400 text-sm mt-2">
                Monthly limit reached.
                <button
                  onClick={() => router.push('/pricing')}
                  className="underline ml-1 hover:no-underline"
                >
                  Upgrade to Story Pack
                </button>
              </p>
            )}
          </div>
        )}

        <div className="text-center">
          <button
            onClick={handleCreateFreestyleStory}
            disabled={creatingStory || !usageStats?.freestyleStories?.canUse}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-4   text-lg transition-all flex items-center gap-3 mx-auto disabled:cursor-not-allowed"
          >
            {creatingStory ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent  animate-spin" />
                Creating Your Story...
              </>
            ) : (
              <>
                <Rocket className="w-6 h-6" />
                Start Writing Now!
              </>
            )}
          </button>
        </div>
      </div>

      {/* Story Examples */}
      <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-600/30  p-6">
        <h3 className="text-xl  text-white mb-4">
          Story Ideas to Get You Started:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-700/30  p-4">
            <h4 className=" text-blue-400 mb-2">🚀 Adventure</h4>
            <p className="text-gray-300 text-sm">
              A kid discovers a secret spaceship in their backyard...
            </p>
          </div>
          <div className="bg-gray-700/30  p-4">
            <h4 className=" text-green-400 mb-2">🧙‍♂️ Fantasy</h4>
            <p className="text-gray-300 text-sm">
              Your pet suddenly starts talking and reveals a magical secret...
            </p>
          </div>
          <div className="bg-gray-700/30  p-4">
            <h4 className=" text-purple-400 mb-2">🔮 Mystery</h4>
            <p className="text-gray-300 text-sm">
              Strange things keep disappearing from your school locker...
            </p>
          </div>
          <div className="bg-gray-700/30  p-4">
            <h4 className=" text-pink-400 mb-2">👥 Friendship</h4>
            <p className="text-gray-300 text-sm">
              You meet someone who seems to be from a different time period...
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAssessmentSection = () => (
    <div className="max-w-4xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <button
          onClick={() => setActiveSection('home')}
          className="bg-green-500 p-2 px-6  flex items-center gap-2 text-gray-800 hover:text-white mb-6 transition-colors mx-auto"
        >
          ← Back to Options
        </button>

        <div className="relative mb-6">
          <Upload className="w-20 h-20 text-green-400 mx-auto" />
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500  flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
        </div>

        <h1 className="text-4xl  text-white mb-4">Upload for Assessment</h1>
        <p className="text-xl text-gray-300 mb-8">
          Get detailed AI feedback on stories you&apos;ve already written
        </p>
      </motion.div>

      <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-8">
        {/* Upload Type Selection */}
        <div className="mb-8">
          <h3 className="text-lg  text-white mb-4">Upload Purpose:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() =>
                setUploadData((prev) => ({ ...prev, uploadType: 'assessment' }))
              }
              className={`p-4  border transition-all ${
                uploadData.uploadType === 'assessment'
                  ? 'border-green-500 bg-green-500/20 text-green-300'
                  : 'border-gray-600 bg-gray-700/30 text-gray-300 hover:border-green-400'
              }`}
            >
              <Brain className="w-8 h-8 mx-auto mb-2" />
              <div className="">For Assessment</div>
              <div className="text-sm opacity-75">Get detailed AI feedback</div>
            </button>

            <button
              onClick={() =>
                setUploadData((prev) => ({
                  ...prev,
                  uploadType: 'competition',
                }))
              }
              className={`p-4  border transition-all ${
                uploadData.uploadType === 'competition'
                  ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                  : 'border-gray-600 bg-gray-700/30 text-gray-300 hover:border-purple-400'
              }`}
            >
              <Trophy className="w-8 h-8 mx-auto mb-2" />
              <div className="">For Competition</div>
              <div className="text-sm opacity-75">Enter monthly contest</div>
            </button>
          </div>
        </div>

        {/* Title Input */}
        <div className="mb-6">
          <label className="block text-sm  text-gray-300 mb-2">
            Story Title *
          </label>
          <input
            type="text"
            placeholder="Enter your story title..."
            value={uploadData.title}
            onChange={(e) =>
              setUploadData((prev) => ({ ...prev, title: e.target.value }))
            }
            maxLength={100}
            className="w-full bg-gray-700/50 border border-gray-600/40  px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-400 mt-1">
            {uploadData.title.length}/100 characters
          </p>
        </div>

        {/* File Upload Area */}

        {/* Text Input Alternative */}
        <div className="mb-6">
          <label className="block text-sm  text-gray-300 mb-2">
            Paste your story text directly (600 words max) *:
          </label>

          <textarea
            placeholder="Paste your story here..."
            value={uploadData.content}
            onChange={(e) =>
              setUploadData((prev) => ({ ...prev, content: e.target.value }))
            }
            rows={8}
            className="w-full bg-gray-700/50 border border-gray-600/40  px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical"
          />
          <p className="text-sm text-gray-400 mt-1">
            {
              uploadData.content.split(' ').filter((word) => word.length > 0)
                .length
            }{' '}
            words
          </p>
        </div>

        {/* Usage Stats */}
        {usageStats && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 ">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">Uploads Remaining:</span>
                  <span className="text-white ">
                    {uploadData.uploadType === 'assessment'
                      ? `${usageStats.assessmentRequests.remaining} / ${usageStats.assessmentRequests.limit}`
                      : `${usageStats.competitionEntries.remaining} / ${usageStats.competitionEntries.limit}`}
                  </span>
                </div>
                <div className="w-full bg-green-800/30  h-2">
                  <div
                    className="bg-green-400 h-2  transition-all"
                    style={{
                      width: `${
                        uploadData.uploadType === 'assessment'
                          ? (usageStats.assessmentRequests.used /
                              usageStats.assessmentRequests.limit) *
                            100
                          : (usageStats.competitionEntries.used /
                              usageStats.competitionEntries.limit) *
                            100
                      }%`,
                    }}
                  />
                </div>
              </div>

              {uploadData.uploadType === 'assessment' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Assessment Attempts:</span>
                    <span className="text-white ">
                      {usageStats.assessmentRequests.remaining} /{' '}
                      {usageStats.assessmentRequests.limit}
                    </span>
                  </div>
                  <div className="w-full bg-yellow-800/30  h-2">
                    <div
                      className="bg-yellow-400 h-2  transition-all"
                      style={{
                        width: `${(usageStats.assessmentRequests.used / usageStats.assessmentRequests.limit) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 ">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 ">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-green-400">{success}</p>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <div className="text-center">
          <button
            onClick={handleUploadStory}
            disabled={
              uploading ||
              !uploadData.title.trim() ||
              (!uploadData.content.trim() && !uploadData.file) ||
              (uploadData.uploadType === 'assessment' &&
                !usageStats?.assessmentRequests.canUse) ||
              (uploadData.uploadType === 'competition' &&
                !usageStats?.competitionEntries.canUse)
            }
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-4   text-lg transition-all flex items-center gap-3 mx-auto disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent  animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-6 h-6" />
                {uploadData.uploadType === 'assessment'
                  ? 'Upload for Assessment'
                  : 'Submit to Competition'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Assessment Features */}
      <div className="mt-8 bg-gray-800/40 backdrop-blur-xl border border-gray-600/30  p-6">
        <h3 className="text-xl  text-white mb-4">What You&apos;ll Get:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className=" text-white text-sm">Grammar Analysis</div>
          </div>
          <div className="text-center">
            <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className=" text-white text-sm">Creativity Score</div>
          </div>
          <div className="text-center">
            <BookOpen className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className=" text-white text-sm">Vocabulary Review</div>
          </div>
          <div className="text-center">
            <Shield className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <div className=" text-white text-sm">Integrity Check</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompetitionSection = () => (
    <div className="max-w-4xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <button
          onClick={() => setActiveSection('home')}
          className="bg-green-500 p-2 px-6  flex items-center gap-2 text-gray-800 hover:text-white mb-6 transition-colors mx-auto"
        >
          ← Back to Options
        </button>

        <div className="relative mb-6">
          <Trophy className="w-20 h-20 text-purple-400 mx-auto" />
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500  flex items-center justify-center">
            <Star className="w-4 h-4 text-white" />
          </div>
        </div>

        <h1 className="text-4xl  text-white mb-4">Competition Entry</h1>
        <p className="text-xl text-gray-300 mb-8">
          Submit your best stories to monthly writing competitions - completely
          FREE!
        </p>
      </motion.div>

      <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40  p-8 mb-8">
        <h3 className="text-2xl  text-white mb-6">How Competitions Work:</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-600  flex items-center justify-center mx-auto mb-4 text-white ">
              1
            </div>
            <h4 className=" text-white mb-2">Submit (Days 1-25)</h4>
            <p className="text-gray-400 text-sm">
              Upload up to 3 of your best stories
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-600  flex items-center justify-center mx-auto mb-4 text-white ">
              2
            </div>
            <h4 className=" text-white mb-2">AI Judging (Days 26-30)</h4>
            <p className="text-gray-400 text-sm">
              Advanced AI evaluates all entries fairly
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-green-600  flex items-center justify-center mx-auto mb-4 text-white ">
              3
            </div>
            <h4 className=" text-white mb-2">Results (Day 31)</h4>
            <p className="text-gray-400 text-sm">
              Top 3 winners announced with certificates
            </p>
          </div>
        </div>

        <div className="bg-purple-500/10 border border-purple-500/20  p-6 mb-6">
          <h4 className=" text-purple-300 mb-3">Competition Rules:</h4>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>• Completely FREE to enter</li>
            <li>• Maximum 3 stories per month</li>
            <li>• Stories must be 350-2000 words</li>
            <li>• Any genre welcome</li>
            <li>• Original work only (AI detection in place)</li>
            <li>• Winner announcements on the last day of each month</li>
          </ul>
        </div>

        <div className="text-center">
          <button
            onClick={() => {
              setUploadData((prev) => ({ ...prev, uploadType: 'competition' }));
              setActiveSection('assessment'); // Reuse upload interface
            }}
            disabled={!usageStats?.competitionEntries.canUse}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-4   text-lg transition-all flex items-center gap-3 mx-auto disabled:cursor-not-allowed"
          >
            <Trophy className="w-6 h-6" />
            {usageStats?.competitionEntries.canUse
              ? 'Submit to Competition'
              : 'Competition Limit Reached'}
          </button>
        </div>
      </div>

      {/* Competition Features */}
      <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-600/30  p-6">
        <h3 className="text-xl  text-white mb-4">Why Enter Competitions?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <Gift className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className=" text-white text-sm">Completely Free</div>
          </div>
          <div className="text-center">
            <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className=" text-white text-sm">Recognition</div>
          </div>
          <div className="text-center">
            <Brain className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className=" text-white text-sm">Fair AI Judging</div>
          </div>
          <div className="text-center">
            <Heart className="w-8 h-8 text-pink-400 mx-auto mb-2" />
            <div className=" text-white text-sm">Community</div>
          </div>
        </div>
      </div>
    </div>
  );

  // ===== MAIN RENDER =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 py-20">
      {/* Section Router */}
      {activeSection === 'home' && renderHomeSection()}
      {activeSection === 'freestyle' && renderFreestyleSection()}
      {activeSection === 'assessment' && renderAssessmentSection()}
      {activeSection === 'competition' && renderCompetitionSection()}
    </div>
  );
}

// Main export with Suspense wrapper
export default function CreateStoriesPage() {
  return (
    <Suspense fallback={<CreateStoriesLoading />}>
      <CreateStoriesContent />
    </Suspense>
  );
}
