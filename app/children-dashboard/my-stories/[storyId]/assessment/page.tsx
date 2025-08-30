// 'use client';

// import { useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react';
// import { useRouter, useParams } from 'next/navigation';
// import Link from 'next/link';
// import { ArrowLeft, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
// import TerminalLoader from '../../../../../components/TerminalLoader';

// interface Story {
//   _id: string;
//   title: string;
//   status: string;
//   assessment?: any; // keep flexible for now
//   createdAt: string;
//   completedAt?: string;
//   totalWords?: number;
//   content?: string;
// }

// export default function StoryAssessmentPage() {
//   const [story, setStory] = useState<Story | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [expanded, setExpanded] = useState<string | null>('overview');
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const params = useParams();
//   const storyId = params.storyId as string;

//   const toggle = (section: string) => {
//     setExpanded(expanded === section ? null : section);
//   };

//   useEffect(() => {
//     const fetchStoryAssessment = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(`/api/user/stories/${storyId}`);
//         const data = await response.json();

//         if (data.success && data.story) {
//           const a = data.story.assessment || {};

//           console.log("🐒 RAW assessment (nested structure):", a);

//           const flatFeedback = {
//             grammarClarity: a.coreLanguageSkills?.grammarSentenceClarity || 'No feedback provided.',
//             vocabularyWordChoice: a.coreLanguageSkills?.vocabularyWordChoice || 'No feedback provided.',
//             spellingPunctuation: a.coreLanguageSkills?.spellingPunctuation || 'No feedback provided.',

//             plotPacing: a.storytellingSkills?.plotPacing || 'No feedback provided.',
//             characterDevelopment: a.storytellingSkills?.characterDevelopment || 'No feedback provided.',
//             settingWorldBuilding: a.storytellingSkills?.settingWorldBuilding || 'No feedback provided.',
//             dialogueExpression: a.storytellingSkills?.dialogueExpression || 'No feedback provided.',
//             themeMessage: a.storytellingSkills?.themeMessage || 'No feedback provided.',

//             creativityOriginality: a.creativeExpressiveSkills?.creativityOriginality || 'No feedback provided.',
//             descriptivePower: a.creativeExpressiveSkills?.descriptivePowerEmotionalImpact || 'No feedback provided.',

//             authenticityAgeAppropriateness: a.authenticityGrowth?.ageAppropriatenessAuthorship || 'No feedback provided.',
//             strengthsAndAreas: a.authenticityGrowth?.strengthsAreasToImprove || 'No feedback provided.',
//             practiceExercises: a.authenticityGrowth?.practiceExercises || 'No feedback provided.',
//           };

//           console.log("✅ Normalized flat 13-factor feedback:", flatFeedback);

//           setStory({
//             ...data.story,
//             assessment: {
//               ...a,
//               fullFeedback: flatFeedback,
//             },
//           });
//         } else {
//           setError('Assessment not available for this story.');
//         }
//       } catch (error) {
//         console.error('Error fetching story assessment:', error);
//         setError('Failed to load assessment. Please try again.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (status === 'loading') return;
//     if (status === 'unauthenticated') {
//       router.push('/login/child');
//       return;
//     }
//     if (status === 'authenticated' && storyId) {
//       fetchStoryAssessment();
//     }
//   }, [status, storyId, router]);

//   const categories = [
//     { key: 'grammarClarity', label: 'Grammar & Sentence Clarity' },
//     { key: 'vocabularyWordChoice', label: 'Vocabulary & Word Choice' },
//     { key: 'spellingPunctuation', label: 'Spelling & Punctuation' },
//     { key: 'plotPacing', label: 'Plot & Pacing' },
//     { key: 'characterDevelopment', label: 'Character Development' },
//     { key: 'settingWorldBuilding', label: 'Setting & World-Building' },
//     { key: 'dialogueExpression', label: 'Dialogue & Expression' },
//     { key: 'themeMessage', label: 'Theme & Message' },
//     { key: 'creativityOriginality', label: 'Creativity & Originality' },
//     { key: 'descriptivePower', label: 'Descriptive Power & Emotional Impact' },
//     { key: 'authenticityAgeAppropriateness', label: 'Authenticity & Age Appropriateness' },
//     { key: 'strengthsAndAreas', label: 'Strengths & Areas to Improve' },
//     { key: 'practiceExercises', label: 'Practice Exercises' },
//   ];

//   if (loading || status === 'loading') {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-900">
//         <TerminalLoader loadingText="Loading teacher feedback..." />
//       </div>
//     );
//   }

//   if (status === 'unauthenticated') {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-900">
//         <div className="text-center">
//           <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//           <h2 className="text-xl text-white mb-2">Login Required</h2>
//           <p className="text-gray-400 mb-6">Please log in to view your story assessment.</p>
//           <Link href="/login/child" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 inline-flex items-center gap-2">
//             <ArrowLeft size={16} />
//             Login
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   if (error || !story) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-900">
//         <div className="text-center">
//           <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//           <h2 className="text-xl text-white mb-2">Assessment Not Available</h2>
//           <p className="text-gray-400">{error || 'Assessment data is not available for this story.'}</p>
//         </div>
//       </div>
//     );
//   }

//   const feedback = story.assessment.fullFeedback || {};

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
//         <h1 className="text-2xl font-bold mb-4">Teacher Assessment</h1>
//         <h2 className="text-lg text-gray-600 mb-6">{story.title}</h2>

//         {categories.map(({ key, label }) => (
//           <div key={key} className="mb-4 border rounded-lg">
//             <button
//               onClick={() => toggle(key)}
//               className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100"
//             >
//               <span className="font-semibold text-gray-800">{label}</span>
//               {expanded === key ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
//             </button>
//             {expanded === key && (
//               <div className="p-4 text-gray-700 text-sm leading-relaxed">
//                 {feedback[key as keyof typeof feedback] || 'No feedback provided.'}
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

interface AssessmentPageProps {
  params: { storyId: string };
}

export default function AssessmentPage({ params }: AssessmentPageProps) {
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchStory();
  }, [params.storyId]);

  const fetchStory = async () => {
    try {
      const response = await fetch(`/api/user/stories/${params.storyId}`);
      const data = await response.json();
      if (data.success) {
        setStory(data.story);
      }
    } catch (error) {
      console.error('Error fetching story:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (key: string) => {
    setExpanded(expanded === key ? null : key);
  };

  // Updated categories to match the 13-factor structure
  const categories = [
    // Core Language Skills (3 factors)
    {
      key: 'grammarSentenceClarity',
      label: 'Grammar & Sentence Clarity',
      section: 'coreLanguageSkills',
    },
    {
      key: 'vocabularyWordChoice',
      label: 'Vocabulary & Word Choice',
      section: 'coreLanguageSkills',
    },
    {
      key: 'spellingPunctuation',
      label: 'Spelling & Punctuation',
      section: 'coreLanguageSkills',
    },

    // Storytelling Skills (5 factors)
    {
      key: 'plotPacing',
      label: 'Plot & Pacing',
      section: 'storytellingSkills',
    },
    {
      key: 'characterDevelopment',
      label: 'Character Development',
      section: 'storytellingSkills',
    },
    {
      key: 'settingWorldBuilding',
      label: 'Setting & World-Building',
      section: 'storytellingSkills',
    },
    {
      key: 'dialogueExpression',
      label: 'Dialogue & Expression',
      section: 'storytellingSkills',
    },
    {
      key: 'themeMessage',
      label: 'Theme & Message',
      section: 'storytellingSkills',
    },

    // Creative Expressive Skills (2 factors)
    {
      key: 'creativityOriginality',
      label: 'Creativity & Originality',
      section: 'creativeExpressiveSkills',
    },
    {
      key: 'descriptivePowerEmotionalImpact',
      label: 'Descriptive Power & Emotional Impact',
      section: 'creativeExpressiveSkills',
    },

    // Authenticity Growth (3 factors)
    {
      key: 'ageAppropriatenessAuthorship',
      label: 'Age Appropriateness & Authorship',
      section: 'authenticityGrowth',
    },
    {
      key: 'strengthsAreasToImprove',
      label: 'Strengths & Areas to Improve',
      section: 'authenticityGrowth',
    },
    {
      key: 'practiceExercises',
      label: 'Practice Exercises',
      section: 'authenticityGrowth',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mb-4"></div>
          <p className="text-white">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl text-white mb-2">Story Not Found</h2>
          <p className="text-gray-400">
            The story you're looking for doesn't exist or you don't have access
            to it.
          </p>
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
            This story hasn't been assessed yet. Complete your story to get
            detailed feedback!
          </p>
        </div>
      </div>
    );
  }

  // Extract the 13-factor assessment data
  const assessment = story.assessment;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Teacher Assessment</h1>
        <h2 className="text-lg text-gray-600 mb-6">{story.title}</h2>

        {/* Assessment Info */}
        {assessment.assessmentDate && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600">
              Assessment completed on:{' '}
              {new Date(assessment.assessmentDate).toLocaleDateString()}
            </p>
            <p className="text-sm text-blue-600">
              Assessment Version:{' '}
              {assessment.assessmentVersion || '1.0-13-factor'}
            </p>
          </div>
        )}

        {/* 13-Factor Categories */}
        {categories.map(({ key, label, section }) => {
          // Get feedback from the correct section
          const feedback =
            assessment[section]?.[key] || 'No feedback provided.';

          return (
            <div key={key} className="mb-4 border rounded-lg">
              <button
                onClick={() => toggle(key)}
                className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="font-semibold text-gray-800">{label}</span>
                {expanded === key ? (
                  <ChevronUp className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-600" />
                )}
              </button>
              {expanded === key && (
                <div className="p-4 bg-white border-t">
                  <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {feedback}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Additional Assessment Info */}
        {(assessment.wordCount ||
          assessment.userAge ||
          assessment.assessmentType) && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">
              Assessment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              {assessment.wordCount && (
                <div>
                  <span className="font-medium">Word Count:</span>{' '}
                  {assessment.wordCount}
                </div>
              )}
              {assessment.userAge && (
                <div>
                  <span className="font-medium">Writer Age:</span>{' '}
                  {assessment.userAge}
                </div>
              )}
              {assessment.assessmentType && (
                <div>
                  <span className="font-medium">Assessment Type:</span>{' '}
                  {assessment.assessmentType}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
