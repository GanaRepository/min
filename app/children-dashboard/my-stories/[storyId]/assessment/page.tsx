

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Download,
  FileText,
} from 'lucide-react';
import Comprehensive42FactorAssessment from '../../../../../components/Comprehensive42FactorAssessment';
import { motion } from 'framer-motion';
import TerminalLoader from '../../../../../components/TerminalLoader';

interface Assessment {
  overallScore?: number;
  grammarScore?: number;
  creativityScore?: number;
  vocabularyScore?: number;
  structureScore?: number;
  characterDevelopmentScore?: number;
  plotDevelopmentScore?: number;
  themeScore?: number;
  dialogueScore?: number;
  descriptiveScore?: number;
  pacingScore?: number;
  readingLevel?: string;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
  encouragement?: string;
  integrityAnalysis?: {
    plagiarismResult?: {
      overallScore?: number;
      riskLevel?: string;
    };
    aiDetectionResult?: {
      likelihood?: string;
      confidence?: number;
    };
    integrityRisk?: string;
  };
  integrityStatus?: {
    status: 'PASS' | 'WARNING' | 'FAIL';
    message: string;
  };
  assessmentDate?: string;
  // Enhanced assessment fields for export
  coreWritingSkills?: {
    grammar?: { score: number; feedback: string };
    vocabulary?: { score: number; feedback: string };
    creativity?: { score: number; feedback: string };
    structure?: { score: number; feedback: string };
  };
  storyDevelopment?: {
    characterDevelopment?: { score: number; feedback: string };
    plotDevelopment?: { score: number; feedback: string };
    descriptiveWriting?: { score: number; feedback: string };
  };
  comprehensiveFeedback?: {
    strengths?: string[];
    areasForEnhancement?: string[];
    nextSteps?: string[];
    teacherAssessment?: string;
  };
  ageAnalysis?: {
    ageAppropriateness: number;
    readingLevel: string;
    contentSuitability: string;
  };
}

interface Story {
  _id: string;
  title: string;
  status: string;
  assessment?: Assessment;
  createdAt: string;
  completedAt?: string;
  totalWords?: number;
  aiOpening?: string;
  content?: string;
  elements?: {
    genre: string;
    character: string;
    setting: string;
    theme: string;
    mood: string;
    tone: string;
  };
}

export default function StoryAssessmentPage() {
  // Map the assessment to the expected 42-factor structure if possible
  function mapTo42Factor(assessment: any) {
    if (!assessment) return null;
    // If already in 42-factor format, return as is
    if (assessment.allFactors && assessment.status && assessment.statusMessage) {
      return assessment;
    }
    // Helper to safely get score/analysis
    const safe = (obj: any, scoreKey: string, analysisKey: string = 'analysis', fallbackScore = 0) => {
      if (!obj) return { score: fallbackScore, analysis: '' };
      if (typeof obj === 'object' && 'score' in obj) return { score: obj.score ?? fallbackScore, analysis: obj[analysisKey] ?? '' };
      return { score: obj ?? fallbackScore, analysis: '' };
    };
    // Map as many fields as possible, fallback to 0/empty
    return {
      overallScore: assessment.overallScore || 0,
      status: assessment.status || 'Completed',
      statusMessage: assessment.statusMessage || '',
      allFactors: {
        // Core Writing Mechanics (1-6)
        grammarSyntax: safe(assessment.coreWritingSkills?.grammar, 'score', 'feedback', assessment.grammarScore),
        vocabularyRange: safe(assessment.coreWritingSkills?.vocabulary, 'score', 'feedback', assessment.vocabularyScore),
        originalityCreativity: safe(assessment.coreWritingSkills?.creativity, 'score', 'feedback', assessment.creativityScore),
        sentenceStructure: safe(assessment.coreWritingSkills?.structure, 'score', 'feedback', assessment.structureScore),
        spelling: safe(assessment.spellingScore, 'score'),
        punctuation: safe(assessment.punctuationScore, 'score'),

        // Story Elements (7-12)
        plotDevelopmentPacing: safe(assessment.storyDevelopment?.plotDevelopment, 'score', 'feedback', assessment.plotDevelopmentScore),
        characterDevelopment: safe(assessment.storyDevelopment?.characterDevelopment, 'score', 'feedback', assessment.characterDevelopmentScore),
        descriptiveWriting: safe(assessment.storyDevelopment?.descriptiveWriting, 'score', 'feedback', assessment.descriptiveScore),
        theme: safe(assessment.themeScore, 'score'),
        dialogue: safe(assessment.dialogueScore, 'score'),
        pacing: safe(assessment.pacingScore, 'score'),

        // Creative & Literary Skills (13-18)
        literaryDevices: safe(assessment.literaryDevicesScore, 'score'),
        figurativeLanguage: safe(assessment.figurativeLanguageScore, 'score'),
        imagery: safe(assessment.imageryScore, 'score'),
        symbolism: safe(assessment.symbolismScore, 'score'),
        toneMood: safe(assessment.toneMoodScore, 'score'),
        pointOfView: safe(assessment.pointOfViewScore, 'score'),

        // Structure & Organization (19-23)
        organization: safe(assessment.organizationScore, 'score'),
        transitions: safe(assessment.transitionsScore, 'score'),
        paragraphing: safe(assessment.paragraphingScore, 'score'),
        introduction: safe(assessment.introductionScore, 'score'),
        conclusion: safe(assessment.conclusionScore, 'score'),

        // Advanced Elements (24-28)
        foreshadowing: safe(assessment.foreshadowingScore, 'score'),
        flashback: safe(assessment.flashbackScore, 'score'),
        suspense: safe(assessment.suspenseScore, 'score'),
        humor: safe(assessment.humorScore, 'score'),
        twist: safe(assessment.twistScore, 'score'),

        // AI Detection Analysis (29-32)
        aiDetectionLikelihood: safe(assessment.integrityAnalysis?.aiDetectionResult?.confidence, 'score'),
        plagiarismRisk: safe(assessment.integrityAnalysis?.plagiarismResult?.overallScore, 'score'),
        integrityRisk: safe(assessment.integrityAnalysis?.integrityRisk, 'score'),
        integrityStatus: { score: assessment.integrityStatus?.status === 'PASS' ? 100 : 0, analysis: assessment.integrityStatus?.message || '' },

        // Educational Feedback (33-42)
        strengths: { score: 0, analysis: (assessment.comprehensiveFeedback?.strengths || []).join(', ') },
        areasForEnhancement: { score: 0, analysis: (assessment.comprehensiveFeedback?.areasForEnhancement || []).join(', ') },
        nextSteps: { score: 0, analysis: (assessment.comprehensiveFeedback?.nextSteps || []).join(', ') },
        teacherAssessment: { score: 0, analysis: assessment.comprehensiveFeedback?.teacherAssessment || '' },
        ageAppropriateness: { score: assessment.ageAnalysis?.ageAppropriateness || 0, analysis: assessment.ageAnalysis?.contentSuitability || '' },
        readingLevel: { score: 0, analysis: assessment.ageAnalysis?.readingLevel || '' },
        // Fill remaining factors with 0/empty if needed
      },
    };
  }


  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingWord, setDownloadingWord] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const storyId = params.storyId as string;
  const assessment42 = mapTo42Factor(story?.assessment);


  useEffect(() => {

    const fetchStoryAssessment = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/user/stories/${storyId}`);
        const data = await response.json();

        if (data.success && data.story) {
          setStory(data.story);
          if (data.story.assessment) {
            console.log('Assessment data:', data.story.assessment);
          } else {
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
  }, [status as string, storyId as string, router]);

  const handleDownload = async (format: 'pdf' | 'word') => {
    if (!story) return;

    const setDownloadState = format === 'pdf' ? setDownloadingPDF : setDownloadingWord;
    
    try {
      setDownloadState(true);
      
      const response = await fetch(`/api/stories/export/${storyId}/${format}`);
      
      if (!response.ok) {
        throw new Error(`Failed to download ${format.toUpperCase()}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${story.title}_assessment.${format === 'pdf' ? 'pdf' : 'docx'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error downloading ${format}:`, error);
      alert(`Failed to download ${format.toUpperCase()}. Please try again.`);
    } finally {
      setDownloadState(false);
    }
  };



  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-green-900 flex items-center justify-center">
        <TerminalLoader loadingText="Loading assessment details..." />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-green-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl  text-white mb-2">Login Required</h2>
          <p className="text-gray-400 mb-6">
            Please log in to view your story assessment.
          </p>
          <Link
            href="/login/child"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3  transition-colors inline-flex items-center gap-2"
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-green-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl  text-white mb-2">Assessment Not Available</h2>
          <p className="text-gray-400 mb-6">
            {error || 'Assessment data is not available for this story.'}
          </p>
          <Link
            href={`/children-dashboard/my-stories/${storyId}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3  transition-colors inline-flex items-center gap-2"
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-green-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl  text-white mb-2">Assessment Not Available</h2>
          <p className="text-gray-400 mb-6">
            This story hasn&apos;t been assessed yet. Complete your story to get
            detailed feedback!
          </p>
          <Link
            href={`/children-dashboard/my-stories/${storyId}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3  transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Story
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-green-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {assessment42 && (
          <Comprehensive42FactorAssessment
            assessment={assessment42}
            storyId={story._id}
            storyTitle={story.title}
          />
        )}
      </div>
    </div>
  );
}