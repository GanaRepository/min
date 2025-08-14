// types/index.ts - COMPLETELY FIXED ALL INTERFACE ISSUES
import mongoose from 'mongoose';

// Base MongoDB document interface
export interface BaseDocument {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Story Types - FIXED: Make isPublished required, not optional
export interface CompetitionEntry {
  competitionId: mongoose.Types.ObjectId;
  submittedAt: Date;
  rank?: number;
  score?: number;
}

export interface StoryElements {
  genre?: string;
  character?: string;
  setting?: string;
  theme?: string;
  mood?: string;
  tone?: string;
}

export interface IntegrityAnalysis {
  plagiarismResult?: {
    overallScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  aiDetectionResult?: {
    likelihood: 'low' | 'medium' | 'high';
    confidence: number;
  };
  integrityRisk?: 'low' | 'medium' | 'high' | 'critical';
}

export interface StoryAssessment {
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
  encouragement?: string;
  integrityAnalysis?: IntegrityAnalysis;
  integrityStatus: {
    status: 'PASS' | 'WARNING' | 'FAIL';
    message: string;
  };
}

export interface StoryTurn {
  turnNumber: number;
  childInput: string;
  aiResponse: string;
  wordCount: number;
  timestamp: Date;
}

// Main Story Interface - FIXED: isPublished is required boolean
export interface Story extends BaseDocument {
  childId: mongoose.Types.ObjectId;
  title: string;
  status: 'active' | 'completed' | 'flagged' | 'review';
  storyType: 'freestyle' | 'uploaded' | 'competition';
  storyNumber: number;
  
  // Content and Progress
  aiOpening?: string;
  currentTurn: number;
  maxApiCalls: number;
  apiCallsUsed: number;
  totalWords: number;
  childWords: number;
  
  // Story elements
  elements?: StoryElements;
  
  // Publication - FIXED: Required boolean
  isPublished: boolean;
  publicationDate?: Date;
  publicationFee?: number;
  
  // Competition - FIXED: Required boolean
  competitionEligible: boolean;
  competitionEntries?: CompetitionEntry[];
  
  // Assessment - FIXED: Required boolean
  isUploadedForAssessment: boolean;
  assessmentAttempts: number;
  assessment?: StoryAssessment;
  
  // Timing
  completedAt?: Date;
  pausedAt?: Date;
  resumedAt?: Date;
}

// Competition Types
export interface CompetitionWinner {
  position: number;
  childId: mongoose.Types.ObjectId;
  childName: string;
  title: string;
  score: number;
}

export interface Competition extends BaseDocument {
  month: string;
  year: number;
  phase: 'submission' | 'judging' | 'results';
  isActive: boolean;
  
  // Timing
  submissionStart?: Date;
  submissionEnd?: Date;
  judgingEnd?: Date;
  resultsDate?: Date;
  
  // Stats
  totalSubmissions?: number;
  totalParticipants?: number;
  
  // Results
  winners?: CompetitionWinner[];
  judgingCriteria?: Record<string, number>;
  
  // Entries
  entries?: Array<{
    storyId: mongoose.Types.ObjectId;
    submittedAt: Date;
    score?: number;
    rank?: number;
  }>;
  
  // Archive
  archivedAt?: Date;
}

// User Types
export interface User extends BaseDocument {
  firstName: string;
  lastName: string;
  email: string;
  role: 'child' | 'parent' | 'mentor' | 'admin';
  
  // Usage tracking
  storiesThisMonth?: number;
  assessmentsThisMonth?: number;
  totalAssessmentAttemptsThisMonth?: number;
  competitionEntriesThisMonth?: number;
  
  // Limits
  monthlyStoryLimit?: number;
  monthlyAssessmentLimit?: number;
  monthlyAssessmentAttemptLimit?: number;
  
  // Features
  hasStoryPack?: boolean;
  storyPackExpiresAt?: Date;
  
  // Parent connection
  parentId?: mongoose.Types.ObjectId;
  children?: mongoose.Types.ObjectId[];
}

// API Response Types - FIXED: StoryResponse matches Story interface exactly
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

// FIXED: StoryResponse now correctly extends Story with exact same types
export interface StoryResponse extends Story {
  turns?: StoryTurn[];
  content?: string;
  publishedAt?: Date;
  comments?: Array<{
    _id: string;
    content: string;
    author: {
      firstName: string;
      lastName: string;
      role: string;
    };
    createdAt: Date;
  }>;
  latestCompetitionEntry?: CompetitionEntry | null;
  submittedToCompetition?: boolean;
}

export interface CompetitionResponse extends Competition {
  daysLeft?: number;
  submissionDeadline?: string | null;
  judgingDeadline?: string | null;
  userStats?: {
    entriesUsed: number;
    entriesLimit: number;
    canSubmit: boolean;
    userEntries: Array<{
      storyId: string;
      title: string;
      submittedAt: Date;
      rank?: number | null;
      score?: number | null;
    }>;
  } | null;
}

// Usage Manager Types
export interface UsageCheckResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: boolean;
  currentUsage?: number;
  limit?: number;
}

export interface UsageLimits {
  stories: number;
  assessments: number;
  totalAssessmentAttempts: number;
  competitions: number;
}

// Form and Component Types
export interface StorySessionRequest {
  sessionType: 'freestyle' | 'guided';
  title?: string;
  elements?: StoryElements;
}

export interface CompetitionAction {
  action: 'advance_phase' | 'create_new_competition' | 'update_settings' | 'run_judging';
  competitionId?: string;
  data?: Record<string, any>;
}

// Dashboard Types
export interface DashboardStats {
  totalStories: number;
  completedStories: number;
  publishedStories: number;
  competitionEntries: number;
  currentMonthUsage: {
    stories: number;
    assessments: number;
    competitions: number;
  };
  limits: UsageLimits;
}

// Navigation Types
export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: string | number;
}

// Session Types (NextAuth)
export interface SessionUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'child' | 'parent' | 'mentor' | 'admin';
}

export interface ExtendedSession {
  user: SessionUser;
  expires: string;
}

// MongoDB Lean Document Types (for fixing FlattenMaps errors)
export type StoryLean = mongoose.FlattenMaps<Story> & { _id: mongoose.Types.ObjectId };
export type CompetitionLean = mongoose.FlattenMaps<Competition> & { _id: mongoose.Types.ObjectId };
export type UserLean = mongoose.FlattenMaps<User> & { _id: mongoose.Types.ObjectId };

// Utility Types
export type StoryStatus = 'active' | 'completed' | 'flagged' | 'review';
export type StoryType = 'freestyle' | 'uploaded' | 'competition';
export type CompetitionPhase = 'submission' | 'judging' | 'results';
export type UserRole = 'child' | 'parent' | 'mentor' | 'admin';
export type IntegrityRisk = 'low' | 'medium' | 'high' | 'critical';
export type IntegrityStatus = 'PASS' | 'WARNING' | 'FAIL';

// Export commonly used Mongoose types
export { Types } from 'mongoose';

// Re-export for convenience
export type ObjectId = mongoose.Types.ObjectId;