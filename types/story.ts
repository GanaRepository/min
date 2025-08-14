// types/story.ts - COMPLETE FIXED VERSION
import { Document, Types } from 'mongoose';

// Usage Stats interface that matches dashboard requirements
export interface UsageStats {
  stories: {
    used: number;
    limit: number;
    remaining: number;
    canUse: boolean;
  };
  assessments: {
    used: number;
    limit: number;
    remaining: number;
    canUse: boolean;
  };
  assessmentAttempts: {
    used: number;
    limit: number;
    remaining: number;
    canUse: boolean;
  };
  competitions: {
    used: number;
    limit: number;
    remaining: number;
    canUse: boolean;
  };
  publications: {
    used: number;
    limit: number;
    remaining: number;
    canUse: boolean;
  };
  resetDate: string;
  subscriptionTier: 'FREE' | 'STORY_PACK';
}

// Story interface that matches all component requirements
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

// Competition interface that matches all component requirements
export interface Competition {
  _id: string;
  month: string;
  year: number;
  phase: 'submission' | 'judging' | 'results';
  daysLeft: number;
  totalSubmissions: number;
  totalParticipants: number;
  submissionDeadline: string;
  judgingDeadline: string;
  resultsDate: string;
  isActive: boolean;
  
  userStats?: {
    entriesUsed: number;
    entriesLimit: number;
    canSubmit: boolean;
    userEntries: Array<{
      storyId: string;
      title: string;
      submittedAt: string;
      rank?: number;
      score?: number;
    }>;
  };
  
  winners?: Array<{
    position: number;
    childId: string;
    childName: string;
    title: string;
    score: number;
  }>;
  
  judgingCriteria: {
    grammar: number;
    creativity: number;
    structure: number;
    character: number;
    plot: number;
    vocabulary: number;
    originality: number;
    engagement: number;
    aiDetection: number;
  };
}

// Achievement interface
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
  category: 'writing' | 'creativity' | 'competition' | 'milestone';
}

// Stories Stats interface
export interface StoriesStats {
  total: number;
  completed: number;
  active: number;
  flagged: number;
  published: number;
  averageScore: number;
}

// Published Story interface
export interface IPublishedStory extends Document {
  sessionId: Types.ObjectId;
  childId: Types.ObjectId;
  title: string;
  content: string;
  totalWords: number;
  grammarScore: number;
  creativityScore: number;
  overallScore: number;
  aiFeeback: string; // Note: This has a typo in the original model
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Turn interface for story writing
export interface ITurn extends Document {
  sessionId: Types.ObjectId;
  turnNumber: number;
  author: 'child' | 'ai';
  content: string;
  wordCount: number;
  isValid: boolean;
  validationErrors?: string[];
  metadata?: {
    writingTime?: number;
    aiModel?: string;
    promptTokens?: number;
    completionTokens?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Story Elements
export interface IStoryElement {
  id: string;
  type: 'genre' | 'character' | 'setting' | 'theme' | 'mood' | 'tone';
  name: string;
  description: string;
  emoji: string;
  color: string;
}

// API Response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Story Creation Request
export interface StoryCreationRequest {
  elements?: {
    genre?: string;
    character?: string;
    setting?: string;
    theme?: string;
    mood?: string;
    tone?: string;
  };
  title?: string;
  type: 'freestyle' | 'uploaded' | 'competition';
}

// AI Collaboration Request
export interface AICollaborationRequest {
  sessionId: string;
  childInput: string;
  turnNumber: number;
}

// Assessment Request
export interface AssessmentRequest {
  sessionId: string;
  finalStory?: string;
  forceReassess?: boolean;
}
