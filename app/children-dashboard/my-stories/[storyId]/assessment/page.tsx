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
  Calendar,
  User,
  FileText,
} from 'lucide-react';
import TerminalLoader from '@/components/TerminalLoader';

interface Assessment {
  fullFeedback?: {
    coreLanguageSkills?: {
      grammarSentenceClarity?: string;
      vocabularyWordChoice?: string;
      spellingPunctuation?: string;
    };
    storytellingSkills?: {
      plotPacing?: string;
      characterDevelopment?: string;
      settingWorldBuilding?: string;
      dialogueExpression?: string;
      themeMessage?: string;
    };
    creativeExpressiveSkills?: {
      creativityOriginality?: string;
      descriptivePowerEmotionalImpact?: string;
    };
    authenticityGrowth?: {
      ageAppropriatenessAuthorship?: string;
      strengthsAreasToImprove?: string;
      practiceExercises?: string;
    };
  };
  // Direct structure (legacy compatibility)
  coreLanguageSkills?: {
    grammarSentenceClarity?: string;
    vocabularyWordChoice?: string;
    spellingPunctuation?: string;
  };
  storytellingSkills?: {
    plotPacing?: string;
    characterDevelopment?: string;
    settingWorldBuilding?: string;
    dialogueExpression?: string;
    themeMessage?: string;
  };
  creativeExpressiveSkills?: {
    creativityOriginality?: string;
    descriptivePowerEmotionalImpact?: string;
  };
  authenticityGrowth?: {
    ageAppropriatenessAuthorship?: string;
    strengthsAreasToImprove?: string;
    practiceExercises?: string;
  };
  version?: string;
  date?: string;
  type?: string;
  assessmentVersion?: string;
  assessmentDate?: string;
  assessmentType?: string;
}

interface Story {
  _id: string;
  title: string;
  status: string;
  assessment?: Assessment;
  createdAt: string;
  completedAt?: string;
  totalWords?: number;
  content?: string;
  storyType?: string;
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

        console.log('📊 Raw API Response:', data);

        if (data.success && data.story) {
          console.log('📋 Story Assessment Data:', data.story.assessment);
          setStory(data.story);
        } else {
          setError('Story not found or assessment not available.');
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

  // Helper function to get assessment data from either structure
  const getAssessmentData = (assessment: Assessment) => {
    // Try fullFeedback structure first (new format), then direct structure (legacy)
    return {
      coreLanguageSkills:
        assessment.fullFeedback?.coreLanguageSkills ||
        assessment.coreLanguageSkills ||
        {},
      storytellingSkills:
        assessment.fullFeedback?.storytellingSkills ||
        assessment.storytellingSkills ||
        {},
      creativeExpressiveSkills:
        assessment.fullFeedback?.creativeExpressiveSkills ||
        assessment.creativeExpressiveSkills ||
        {},
      authenticityGrowth:
        assessment.fullFeedback?.authenticityGrowth ||
        assessment.authenticityGrowth ||
        {},
    };
  };

  // Helper function to safely get feedback text
  const getFeedback = (
    assessmentData: any,
    section: string,
    key: string
  ): string => {
    const sectionData = assessmentData[section];
    if (sectionData && typeof sectionData === 'object') {
      return sectionData[key] || 'No feedback provided.';
    }
    return 'No feedback provided.';
  };

  const categories = [
    // Core Language Skills
    {
      key: 'grammarSentenceClarity',
      label: 'Grammar & Sentence Clarity',
      section: 'coreLanguageSkills',
      icon: '📝',
      description: 'How well you use grammar and create clear sentences',
    },
    {
      key: 'vocabularyWordChoice',
      label: 'Vocabulary & Word Choice',
      section: 'coreLanguageSkills',
      icon: '📚',
      description: 'The variety and appropriateness of words you use',
    },
    {
      key: 'spellingPunctuation',
      label: 'Spelling & Punctuation',
      section: 'coreLanguageSkills',
      icon: '✏️',
      description: 'Accuracy in spelling and punctuation marks',
    },

    // Storytelling Skills
    {
      key: 'plotPacing',
      label: 'Plot & Pacing',
      section: 'storytellingSkills',
      icon: '⚡',
      description: 'How your story moves from beginning to end',
    },
    {
      key: 'characterDevelopment',
      label: 'Character Development',
      section: 'storytellingSkills',
      icon: '👥',
      description: 'How well you create and develop your characters',
    },
    {
      key: 'settingWorldBuilding',
      label: 'Setting & World-Building',
      section: 'storytellingSkills',
      icon: '🏛️',
      description: 'How you create and describe the world of your story',
    },
    {
      key: 'dialogueExpression',
      label: 'Dialogue & Expression',
      section: 'storytellingSkills',
      icon: '💬',
      description: 'How characters speak and express themselves',
    },
    {
      key: 'themeMessage',
      label: 'Theme & Message',
      section: 'storytellingSkills',
      icon: '🎯',
      description: 'The deeper meaning and message in your story',
    },

    // Creative & Expressive Skills
    {
      key: 'creativityOriginality',
      label: 'Creativity & Originality',
      section: 'creativeExpressiveSkills',
      icon: '🌟',
      description: 'How unique and imaginative your story is',
    },
    {
      key: 'descriptivePowerEmotionalImpact',
      label: 'Descriptive Power & Emotional Impact',
      section: 'creativeExpressiveSkills',
      icon: '🎨',
      description: 'How well you paint pictures with words and create emotions',
    },

    // Authenticity & Growth
    {
      key: 'ageAppropriatenessAuthorship',
      label: 'Authenticity & Age Appropriateness',
      section: 'authenticityGrowth',
      icon: '🎪',
      description: 'How well your writing fits your age and authentic voice',
    },
    {
      key: 'strengthsAreasToImprove',
      label: 'Strengths & Areas to Improve',
      section: 'authenticityGrowth',
      icon: '💪',
      description: 'What you do well and where you can grow',
    },
    {
      key: 'practiceExercises',
      label: 'Practice Exercises',
      section: 'authenticityGrowth',
      icon: '🏃',
      description: 'Suggestions for improving your writing skills',
    },
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
          <p className="text-gray-400 mb-6">
            Please log in to view your story assessment.
          </p>
          <Link
            href="/login/child"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
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
          <p className="text-gray-400 mb-6">
            {error || 'Assessment data is not available for this story.'}
          </p>
          <Link
            href="/children-dashboard/my-stories"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to My Stories
          </Link>
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
          <p className="text-gray-400 mb-6">
            This story hasn&apos;t been assessed yet. Complete your story to get
            detailed feedback!
          </p>
          <Link
            href={`/children-dashboard/my-stories/${story._id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            View Story
          </Link>
        </div>
      </div>
    );
  }

  const assessmentData = getAssessmentData(story.assessment);
  const assessment = story.assessment;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-green-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/children-dashboard/my-stories/${story._id}`}
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Story
          </Link>

          <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-2xl p-8">
            <div className="text-center">
              <h1 className="text-4xl  text-white mb-2">
                Teacher&apos;s Assessment
              </h1>
              <h2 className="text-2xl text-blue-300 mb-6">{story.title}</h2>

              {/* Assessment Metadata */}
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                {assessment.assessmentDate && (
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>
                      Assessed:{' '}
                      {new Date(assessment.assessmentDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {assessment.assessmentVersion && (
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    <span>Version: {assessment.assessmentVersion}</span>
                  </div>
                )}
                {story.totalWords && (
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} />
                    <span>Words: {story.totalWords}</span>
                  </div>
                )}
                {story.storyType && (
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <span>Type: {story.storyType}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Individual Category Sections */}
        <div className="space-y-4">
          <h3 className="text-2xl  text-white mb-4">📝 Core Language Skills</h3>
          {categories
            .filter((cat) => cat.section === 'coreLanguageSkills')
            .map(({ key, label, section, icon, description }) => {
              const feedback = getFeedback(assessmentData, section, key);
              return (
                <div
                  key={key}
                  className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => toggle(key)}
                    className="w-full p-6 hover:bg-gray-700/50 transition-all duration-200 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{icon}</span>
                      <div>
                        <h4 className="text-xl  text-white">{label}</h4>
                        <p className="text-gray-400 text-sm">{description}</p>
                      </div>
                    </div>
                    {expanded === key ? (
                      <ChevronUp size={24} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={24} className="text-gray-400" />
                    )}
                  </button>
                  {expanded === key && (
                    <div className="px-6 pb-6">
                      <div className="bg-gray-900/50 rounded-lg p-4 border-l-4 border-blue-500">
                        <p className="text-gray-200 leading-relaxed">
                          {feedback}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

          <h3 className="text-2xl  text-white mb-4 mt-8">
            📖 Storytelling Skills
          </h3>
          {categories
            .filter((cat) => cat.section === 'storytellingSkills')
            .map(({ key, label, section, icon, description }) => {
              const feedback = getFeedback(assessmentData, section, key);
              return (
                <div
                  key={key}
                  className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => toggle(key)}
                    className="w-full p-6 hover:bg-gray-700/50 transition-all duration-200 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{icon}</span>
                      <div>
                        <h4 className="text-xl  text-white">{label}</h4>
                        <p className="text-gray-400 text-sm">{description}</p>
                      </div>
                    </div>
                    {expanded === key ? (
                      <ChevronUp size={24} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={24} className="text-gray-400" />
                    )}
                  </button>
                  {expanded === key && (
                    <div className="px-6 pb-6">
                      <div className="bg-gray-900/50 rounded-lg p-4 border-l-4 border-green-500">
                        <p className="text-gray-200 leading-relaxed">
                          {feedback}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

          <h3 className="text-2xl  text-white mb-4 mt-8">
            🎨 Creative & Expressive Skills
          </h3>
          {categories
            .filter((cat) => cat.section === 'creativeExpressiveSkills')
            .map(({ key, label, section, icon, description }) => {
              const feedback = getFeedback(assessmentData, section, key);
              return (
                <div
                  key={key}
                  className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => toggle(key)}
                    className="w-full p-6 hover:bg-gray-700/50 transition-all duration-200 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{icon}</span>
                      <div>
                        <h4 className="text-xl  text-white">{label}</h4>
                        <p className="text-gray-400 text-sm">{description}</p>
                      </div>
                    </div>
                    {expanded === key ? (
                      <ChevronUp size={24} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={24} className="text-gray-400" />
                    )}
                  </button>
                  {expanded === key && (
                    <div className="px-6 pb-6">
                      <div className="bg-gray-900/50 rounded-lg p-4 border-l-4 border-purple-500">
                        <p className="text-gray-200 leading-relaxed">
                          {feedback}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

          <h3 className="text-2xl  text-white mb-4 mt-8">
            🌱 Authenticity & Growth
          </h3>
          {categories
            .filter((cat) => cat.section === 'authenticityGrowth')
            .map(({ key, label, section, icon, description }) => {
              const feedback = getFeedback(assessmentData, section, key);
              return (
                <div
                  key={key}
                  className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => toggle(key)}
                    className="w-full p-6 hover:bg-gray-700/50 transition-all duration-200 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{icon}</span>
                      <div>
                        <h4 className="text-xl  text-white">{label}</h4>
                        <p className="text-gray-400 text-sm">{description}</p>
                      </div>
                    </div>
                    {expanded === key ? (
                      <ChevronUp size={24} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={24} className="text-gray-400" />
                    )}
                  </button>
                  {expanded === key && (
                    <div className="px-6 pb-6">
                      <div className="bg-gray-900/50 rounded-lg p-4 border-l-4 border-yellow-500">
                        <p className="text-gray-200 leading-relaxed">
                          {feedback}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
