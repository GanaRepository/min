// types/assessment.ts - NEW FILE
export interface IntegrityAnalysis {
  originalityScore: number;
  plagiarismScore: number;
  aiDetectionScore: number;
  integrityRisk: 'low' | 'medium' | 'high' | 'critical';
  plagiarismRiskLevel?: string;
  aiDetectionLikelihood?: string;
}

export interface AssessmentRecommendations {
  immediate: string[];
  longTerm: string[];
  practiceExercises: string[];
}

export interface ProgressTracking {
  improvementSince: string;
  scoreChange: number;
  strengthsGained: string[];
  areasImproved: string[];
}

export interface StoryAssessment {
  // Core scores
  grammarScore: number;
  creativityScore: number;
  vocabularyScore: number;
  structureScore: number;
  characterDevelopmentScore: number;
  plotDevelopmentScore: number;
  overallScore: number;
  readingLevel: string;

  // NEW: Additional assessment categories
  descriptiveWritingScore?: number;
  sensoryDetailsScore?: number;
  plotLogicScore?: number;
  causeEffectScore?: number;
  problemSolvingScore?: number;
  themeRecognitionScore?: number;
  ageAppropriatenessScore?: number;

  // Advanced category scores (from new engine)
  categoryScores?: {
    grammar: number;
    vocabulary: number;
    creativity: number;
    structure: number;
    characterDevelopment: number;
    plotDevelopment: number;
    descriptiveWriting: number;
    sensoryDetails: number;
    plotLogic: number;
    causeEffect: number;
    problemSolving: number;
    themeRecognition: number;
    ageAppropriateness: number;
    readingLevel: string;
  };

  // Feedback
  feedback: string;
  strengths: string[];
  improvements: string[];
  educationalInsights: string;

  // Integrity fields
  plagiarismScore: number;
  aiDetectionScore: number;
  integrityRisk: 'low' | 'medium' | 'high' | 'critical';
  integrityAnalysis: IntegrityAnalysis;

  // Enhanced features
  recommendations?: AssessmentRecommendations;
  progressTracking?: ProgressTracking;

  // Metadata
  assessmentVersion: string;
  assessmentDate: string;
  isReassessment?: boolean;
  error?: boolean;
  errorMessage?: string;
}
