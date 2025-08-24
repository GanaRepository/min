//app/children-dashboard/my-stories/[storyId]/assessment/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Brain,
  BookOpen,
} from 'lucide-react';
import { motion } from 'framer-motion';
import TerminalLoader from '../../../../../components/TerminalLoader';
import ComprehensiveAssessmentDisplay from '../../../../../components/ComprehensiveAssessmentDisplay';

interface Story {
  _id: string;
  title: string;
  status: string;
  assessment?: any; // New comprehensive assessment structure
  createdAt: string;
  completedAt?: string;
}

export default function StoryAssessmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const storyId = params.storyId as string;

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStoryAssessment = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/user/stories/${storyId}`);
        const data = await response.json();

        console.log('🔍 API Response:', data);
        console.log('🎯 Story Assessment:', data.story?.assessment);

        if (data.success && data.story) {
          setStory(data.story);
          if (!data.story.assessment) {
            console.log('❌ No assessment found for story');
            setError('Assessment not available for this story.');
          } else {
            console.log('✅ Assessment found:', data.story.assessment);
          }
        } else {
          throw new Error(data.error || 'Failed to fetch story assessment');
        }
      } catch (error) {
        console.error('Error fetching story assessment:', error);
        setError('Failed to load assessment. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'loading') {
      // Still checking authentication status
      return;
    }

    if (status === 'unauthenticated') {
      // Redirect to login page
      router.push('/login/child');
      return;
    }

    if (status === 'authenticated' && storyId) {
      fetchStoryAssessment();
    }
  }, [status, storyId, router]);

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <TerminalLoader loadingText="Loading assessment details..." />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Login Required</h2>
          <p className="text-gray-300 mb-6">
            Please log in to view your story assessment.
          </p>
          <Link
            href="/login/child"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            Assessment Not Available
          </h2>
          <p className="text-gray-300 mb-6">
            {error || 'Assessment data is not available for this story.'}
          </p>
          <Link
            href={`/children-dashboard/my-stories/${storyId}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Story
          </Link>
        </div>
      </div>
    );
  }

  if (!story.assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            Assessment Not Available
          </h2>
          <p className="text-gray-300 mb-6">
            This story hasn&apos;t been assessed yet. Complete your story to get
            detailed feedback!
          </p>
          <Link
            href={`/children-dashboard/my-stories/${storyId}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Story
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900">
      <div className="container mx-auto px-6 py-8">
        
        {/* Assessment Content - Use Comprehensive Assessment Display Component */}
        <ComprehensiveAssessmentDisplay
          assessment={{ comprehensiveAssessment: story.assessment }}
          storyTitle={story.title}
        />

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center gap-4 mt-8"
        >
          <Link
            href={`/children-dashboard/my-stories/${storyId}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Story
          </Link>
          <Link
            href="/children-dashboard/my-stories"
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            <BookOpen size={16} />
            All Stories
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
