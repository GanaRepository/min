// types/story.ts - ADD MISSING PROPERTIES
export interface Story {
  _id: string;
  title: string;
  status: 'active' | 'completed' | 'flagged' | 'review';
  storyType: 'freestyle' | 'uploaded' | 'competition';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  totalWords: number;
  childWords: number;
  currentTurn: number;
  maxTurns: number;
  apiCallsUsed: number;

  // Publication & Competition
  isPublished: boolean;
  competitionEligible: boolean;
  competitionEntries?: Array<{
    competitionId: string;
    submittedAt: string;
    rank?: number;
    score?: number;
  }>;

  // Assessment
  isUploadedForAssessment: boolean;
  assessmentAttempts: number;
  assessment?: {
    overallScore: number;
    grammarScore: number;
    creativityScore: number;
    vocabularyScore: number;
    structureScore: number;
    characterDevelopmentScore: number;
    plotDevelopmentScore: number;
    themeScore?: number;
    dialogueScore?: number;
    descriptiveScore?: number;
    pacingScore?: number;
    readingLevel: string;
    feedback: string;
    strengths: string[];
    improvements: string[];
    integrityAnalysis?: {
      plagiarismResult?: {
        overallScore: number;
        riskLevel: string;
      };
      aiDetectionResult?: {
        likelihood: string;
        confidence: number;
      };
      integrityRisk?: 'low' | 'medium' | 'high' | 'critical';
    };
    integrityStatus: {
      status: 'PASS' | 'WARNING' | 'FAIL';
      message: string;
    };
  };

  // ADD ALL MISSING PROPERTIES FROM ERRORS:
  aiOpening?: string;
  publicationDate?: string;
  publicationFee?: number;
  pausedAt?: string;
  resumedAt?: string;
  storyNumber?: number;

  // Story Elements
  elements?: {
    genre?: string;
    character?: string;
    setting?: string;
    theme?: string;
    mood?: string;
    tone?: string;
  };
}
