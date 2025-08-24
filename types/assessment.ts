// types/assessment.ts - UPDATED FOR BACKWARD COMPATIBILITY
export interface IntegrityAnalysis {
  originalityScore: number;
  plagiarismScore: number;
  aiDetectionScore: number;
  integrityRisk: 'low' | 'medium' | 'high' | 'critical';
  plagiarismRiskLevel?: string;
  aiDetectionLikelihood?: string;
  
  // NEW STRUCTURE SUPPORT
  aiDetection?: {
    humanLikeScore: number;
    aiLikelihood: string;
    confidenceLevel: number;
    analysis: string;
    riskLevel: string;
    indicators: string[];
  };
  plagiarismCheck?: {
    originalityScore: number;
    riskLevel: string;
    violations: string[];
    status: string;
  };
  overallStatus?: string;
  message?: string;
  recommendation?: string;
  
  // LEGACY STRUCTURE SUPPORT
  aiDetectionResult?: {
    likelihood: string;
    confidence: number;
    overallScore?: number;
  };
  plagiarismResult?: {
    overallScore: number;
    riskLevel: string;
  };
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
