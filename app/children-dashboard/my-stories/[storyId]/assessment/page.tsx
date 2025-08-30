'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  BookOpen, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  PenTool,
  MessageSquare,
  Target,
  Award,
  Brain,
  Heart,
  Star
} from 'lucide-react';

interface Story {
  _id: string;
  title: string;
  status: string;
  assessment?: any;
  createdAt: string;
  completedAt?: string;
  totalWords?: number;
  content?: string;
}

// Category configuration with icons
const categoryConfig = {
  coreLanguageSkills: {
    title: 'Core Language Skills',
    icon: PenTool,
    factors: [
      { key: 'grammarSentenceClarity', label: '📝 Grammar & Sentence Clarity' },
      { key: 'vocabularyWordChoice', label: '📚 Vocabulary & Word Choice' },
      { key: 'spellingPunctuation', label: '✏️ Spelling & Punctuation' },
    ]
  },
  storytellingSkills: {
    title: 'Storytelling Skills',
    icon: BookOpen,
    factors: [
      { key: 'plotPacing', label: '🎬 Plot & Pacing' },
      { key: 'characterDevelopment', label: '👥 Character Development' },
      { key: 'settingWorldBuilding', label: '🌍 Setting & World-Building' },
      { key: 'dialogueExpression', label: '💬 Dialogue & Expression' },
      { key: 'themeMessage', label: '💡 Theme & Message' },
    ]
  },
  creativeExpressiveSkills: {
    title: 'Creative & Expressive Skills',
    icon: Sparkles,
    factors: [
      { key: 'creativityOriginality', label: '✨ Creativity & Originality' },
      { key: 'descriptivePowerEmotionalImpact', label: '❤️ Descriptive Power & Emotional Impact' },
    ]
  },
  authenticityGrowth: {
    title: 'Authenticity & Growth',
    icon: Target,
    factors: [
      { key: 'ageAppropriatenessAuthorship', label: '🎯 Age Appropriateness & Authorship' },
      { key: 'strengthsAreasToImprove', label: '💪 Strengths & Areas to Improve' },
      { key: 'practiceExercises', label: '📋 Practice Exercises' },
    ]
  }
};

export default function StoryAssessmentPage() {
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showRawData, setShowRawData] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const storyId = params.storyId as string;

  const toggleSection = (key: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSections(newExpanded);
  };

  const expandAll = () => {
    const allKeys = new Set<string>();
    Object.values(categoryConfig).forEach(category => {
      category.factors.forEach(factor => {
        allKeys.add(factor.key);
      });
    });
    setExpandedSections(allKeys);
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  useEffect(() => {
    const fetchStoryAssessment = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/user/stories/${storyId}`);
        const data = await response.json();

        if (data.success && data.story) {
          console.log('📚 Fetched story data:', data.story);
          setStory(data.story);
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

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-purple-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-white" />
            </div>
          </div>
          <p className="text-white mt-4 text-lg">Loading your teacher's feedback...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center bg-gray-800 rounded-2xl p-8">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Login Required</h2>
          <p className="text-gray-300 mb-6">Please log in to view your story assessment.</p>
          <Link 
            href="/login/child" 
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-all"
          >
            <ArrowLeft size={16} />
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center bg-gray-800 rounded-2xl p-8">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Assessment Not Available</h2>
          <p className="text-gray-300 mb-6">{error || 'Assessment data is not available for this story.'}</p>
          <Link 
            href="/children-dashboard/my-stories" 
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-all"
          >
            <ArrowLeft size={16} />
            Back to My Stories
          </Link>
        </div>
      </div>
    );
  }

  const assessment = story.assessment || {};
  const hasAssessment = assessment && (
    assessment.coreLanguageSkills || 
    assessment.storytellingSkills || 
    assessment.creativeExpressiveSkills || 
    assessment.authenticityGrowth ||
    assessment.fullFeedback
  );

  if (!hasAssessment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center bg-gray-800 rounded-2xl p-8">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Assessment Yet</h2>
          <p className="text-gray-300 mb-6">Complete your story to receive detailed teacher feedback!</p>
          <Link 
            href={`/children-dashboard/my-stories/${storyId}`}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-all"
          >
            <ArrowLeft size={16} />
            Back to Story
          </Link>
        </div>
      </div>
    );
  }

  // Check if we have the nested structure or need to use fullFeedback
  const hasNestedStructure = assessment.coreLanguageSkills || assessment.storytellingSkills;

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gray-800 rounded-2xl shadow-xl p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Link 
              href={`/children-dashboard/my-stories/${storyId}`}
              className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-2 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Story
            </Link>
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="text-sm bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 px-3 py-1 rounded-lg transition-colors"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded-lg transition-colors"
              >
                Collapse All
              </button>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Teacher's Assessment
            </h1>
            <h2 className="text-xl text-gray-300 mb-2">{story.title}</h2>
            <div className="flex items-center justify-center gap-1 text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} fill="currentColor" />
              ))}
            </div>
          </div>

          {/* Assessment metadata */}
          {(assessment.assessmentDate || assessment.wordCount) && (
            <div className="mt-4 flex justify-center gap-6 text-sm text-gray-400">
              {assessment.assessmentDate && (
                <span>📅 Assessed: {new Date(assessment.assessmentDate).toLocaleDateString()}</span>
              )}
              {assessment.wordCount && (
                <span>📝 {assessment.wordCount} words</span>
              )}
              {assessment.assessmentType && (
                <span>🎯 Type: {assessment.assessmentType}</span>
              )}
            </div>
          )}
        </div>

        {/* Main Assessment Content */}
        <div className="space-y-6">
          {hasNestedStructure ? (
            // Display nested 13-factor structure
            Object.entries(categoryConfig).map(([categoryKey, category]) => {
              const categoryData = assessment[categoryKey];
              if (!categoryData) return null;

              const Icon = category.icon;

              return (
                <div key={categoryKey} className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-700">
                  <div className="p-4 bg-gradient-to-r from-purple-600 to-purple-700">
                    <div className="flex items-center gap-3 text-white">
                      <Icon size={24} />
                      <h3 className="text-xl font-bold">{category.title}</h3>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-3">
                    {category.factors.map(factor => {
                      const feedback = categoryData[factor.key];
                      if (!feedback || feedback === 'No feedback provided.') return null;
                      
                      const isExpanded = expandedSections.has(factor.key);
                      
                      return (
                        <div key={factor.key} className="border border-gray-700 rounded-xl overflow-hidden hover:border-gray-600 transition-colors">
                          <button
                            onClick={() => toggleSection(factor.key)}
                            className="w-full flex justify-between items-center px-5 py-4 bg-gray-700/50 hover:bg-gray-700 transition-colors"
                          >
                            <span className="font-medium text-gray-200 text-left">{factor.label}</span>
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            )}
                          </button>
                          
                          {isExpanded && (
                            <div className="px-5 py-4 bg-gray-800/50 border-t border-gray-700">
                              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {feedback}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : assessment.fullFeedback ? (
            // Fallback: Display flattened fullFeedback if available
            <div className="bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4 text-white">Assessment Feedback</h3>
              <div className="space-y-3">
                {Object.entries(assessment.fullFeedback).map(([key, value]) => {
                  const isExpanded = expandedSections.has(key);
                  return (
                    <div key={key} className="border border-gray-700 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleSection(key)}
                        className="w-full flex justify-between items-center px-5 py-4 bg-gray-700/50 hover:bg-gray-700 transition-colors"
                      >
                        <span className="font-medium text-gray-200">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="px-5 py-4 bg-gray-800/50 border-t border-gray-700">
                          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {value as string}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        {/* Debug Section (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-gray-800 rounded-xl p-4 border border-gray-700">
            <button
              onClick={() => setShowRawData(!showRawData)}
              className="text-sm text-gray-400 hover:text-gray-300 underline"
            >
              {showRawData ? 'Hide' : 'Show'} Raw Assessment Data (Debug)
            </button>
            {showRawData && (
              <pre className="mt-4 bg-gray-900 p-4 rounded-lg text-xs text-gray-400 overflow-x-auto">
                {JSON.stringify(assessment, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}