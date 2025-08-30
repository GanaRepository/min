'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import TerminalLoader from '../../../../../components/TerminalLoader';

interface Story {
  _id: string;
  title: string;
  status: string;
  assessment?: {
    version: string;
    date: string;
    type: string;
    fullFeedback: {
      grammarClarity: string;
      vocabularyWordChoice: string;
      spellingPunctuation: string;
      plotPacing: string;
      characterDevelopment: string;
      settingWorldBuilding: string;
      dialogueExpression: string;
      themeMessage: string;
      creativityOriginality: string;
      descriptivePower: string;
      authenticityAgeAppropriateness: string;
      strengthsAndAreas: string;
      practiceExercises: string;
    };
  };
  createdAt: string;
  completedAt?: string;
  totalWords?: number;
  content?: string;
}

export default function StoryAssessmentPage() {
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>('overview');
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const storyId = params.storyId as string;

  const toggle = (section: string) => {
    setExpanded(expanded === section ? null : section);
  };

  useEffect(() => {
    const fetchStoryAssessment = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/user/stories/${storyId}`);
        const data = await response.json();

        if (data.success && data.story) {
          setStory(data.story);
          if (!data.story.assessment) {
            setError('Assessment not available for this story.');
          }
        } else {
          setError('Assessment not available for this story.');
        }
      } catch (error) {
        console.error('Error fetching story assessment:', error);
        setError('Failed to load assessment. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/login/child');
      return;
    }

    if (status === 'authenticated' && storyId) {
      fetchStoryAssessment();
    }
  }, [status, storyId, router]);

  const categories = [
    { key: 'grammarClarity', label: 'Grammar & Sentence Clarity' },
    { key: 'vocabularyWordChoice', label: 'Vocabulary & Word Choice' },
    { key: 'spellingPunctuation', label: 'Spelling & Punctuation' },
    { key: 'plotPacing', label: 'Plot & Pacing' },
    { key: 'characterDevelopment', label: 'Character Development' },
    { key: 'settingWorldBuilding', label: 'Setting & World-Building' },
    { key: 'dialogueExpression', label: 'Dialogue & Expression' },
    { key: 'themeMessage', label: 'Theme & Message' },
    { key: 'creativityOriginality', label: 'Creativity & Originality' },
    { key: 'descriptivePower', label: 'Descriptive Power & Emotional Impact' },
    { key: 'authenticityAgeAppropriateness', label: 'Authenticity & Age Appropriateness' },
    { key: 'strengthsAndAreas', label: 'Strengths & Areas to Improve' },
    { key: 'practiceExercises', label: 'Practice Exercises' },
  ];

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <TerminalLoader loadingText="Loading teacher feedback..." />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl text-white mb-2">Login Required</h2>
          <p className="text-gray-400 mb-6">Please log in to view your story assessment.</p>
          <Link
            href="/login/child"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 inline-flex items-center gap-2"
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
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl text-white mb-2">Assessment Not Available</h2>
          <p className="text-gray-400">{error || 'Assessment data is not available for this story.'}</p>
        </div>
      </div>
    );
  }

  if (!story.assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl text-white mb-2">Assessment Not Available</h2>
          <p className="text-gray-400">
            This story hasn&apos;t been assessed yet. Complete your story to get detailed feedback!
          </p>
        </div>
      </div>
    );
  }

  const feedback = story.assessment.fullFeedback;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Teacher Assessment</h1>
        <h2 className="text-lg text-gray-600 mb-6">{story.title}</h2>

        {categories.map(({ key, label }) => (
          <div key={key} className="mb-4 border rounded-lg">
            <button
              onClick={() => toggle(key)}
              className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100"
            >
              <span className="font-semibold text-gray-800">{label}</span>
              {expanded === key ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
            {expanded === key && (
              <div className="p-4 text-gray-700 text-sm leading-relaxed">
                {feedback[key as keyof typeof feedback] || 'No feedback provided.'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
