// models/StorySession.ts - COMPLETE FIXED VERSION
import mongoose, { Schema, Document } from 'mongoose';

export interface IStorySession extends Document {
  childId: mongoose.Types.ObjectId;
  storyNumber: number;
  title: string;
  aiOpening?: string;
  currentTurn: number;
  totalWords: number;
  childWords: number;
  apiCallsUsed: number;
  maxApiCalls: number;
  status: 'active' | 'completed' | 'paused';
  
  // Assessment fields
  assessment?: {
    grammarScore?: number;
    creativityScore?: number;
    vocabularyScore?: number;
    structureScore?: number;
    characterDevelopmentScore?: number;
    plotDevelopmentScore?: number;
    overallScore?: number;
    readingLevel?: string;
    feedback?: string;
    strengths?: string[];
    improvements?: string[];
    vocabularyUsed?: string[];
    suggestedWords?: string[];
    educationalInsights?: string;
    plagiarismScore?: number;
    aiDetectionScore?: number;
    integrityRisk?: 'low' | 'medium' | 'high' | 'critical';
    integrityAnalysis?: {
      plagiarismResult?: {
        score: number;
        riskLevel: string;
        violationCount: number;
        detailedAnalysis: any;
      };
      aiDetectionResult?: {
        score: number;
        likelihood: string;
        confidence: number;
        indicatorCount: number;
        detailedAnalysis: any;
      };
    };
    recommendations?: {
      immediate?: string[];
      longTerm?: string[];
      practiceExercises?: string[];
    };
    progressTracking?: {
      improvementSince?: Date;
      scoreChange?: number;
      strengthsGained?: string[];
      areasImproved?: string[];
    };
    assessmentVersion?: string;
    assessmentDate?: Date;
    isReassessment?: boolean;
  };
  
  assessmentAttempts: number;
  isUploadedForAssessment: boolean;
  lastAssessedAt?: Date;
  
  // Publication fields
  isPublished: boolean;
  publicationDate?: Date;
  publicationFee?: number;
  competitionEligible: boolean;
  
  // Competition fields
  competitionEntries: Array<{
    competitionId: mongoose.Types.ObjectId;
    submittedAt: Date;
    phase: 'submission' | 'judging' | 'results';
  }>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  pausedAt?: Date;
  resumedAt?: Date;
  
  // Legacy fields for backward compatibility
  overallScore?: number;
  grammarScore?: number;
  creativityScore?: number;
  feedback?: string;
}

const StorySessionSchema = new Schema({
  childId: {
    type: Schema.Types.ObjectId,  // ✅ This ensures ObjectId type
    ref: 'User',
    required: true,
    index: true
  },
  storyNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  aiOpening: {
    type: String,
    default: 'Start writing your story here...'
  },
  currentTurn: {
    type: Number,
    default: 1
  },
  totalWords: {
    type: Number,
    default: 0
  },
  childWords: {
    type: Number,
    default: 0
  },
  apiCallsUsed: {
    type: Number,
    default: 0
  },
  maxApiCalls: {
    type: Number,
    default: 7
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active',
    index: true
  },
  
  // Assessment fields
  assessment: {
    grammarScore: { type: Number, min: 0, max: 100 },
    creativityScore: { type: Number, min: 0, max: 100 },
    vocabularyScore: { type: Number, min: 0, max: 100 },
    structureScore: { type: Number, min: 0, max: 100 },
    characterDevelopmentScore: { type: Number, min: 0, max: 100 },
    plotDevelopmentScore: { type: Number, min: 0, max: 100 },
    overallScore: { type: Number, min: 0, max: 100 },
    readingLevel: { type: String },
    feedback: { type: String },
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    vocabularyUsed: [{ type: String }],
    suggestedWords: [{ type: String }],
    educationalInsights: { type: String },
    plagiarismScore: { type: Number, min: 0, max: 100 },
    aiDetectionScore: { type: Number, min: 0, max: 100 },
    integrityRisk: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    integrityAnalysis: {
      plagiarismResult: {
        score: Number,
        riskLevel: String,
        violationCount: Number,
        detailedAnalysis: Schema.Types.Mixed
      },
      aiDetectionResult: {
        score: Number,
        likelihood: String,
        confidence: Number,
        indicatorCount: Number,
        detailedAnalysis: Schema.Types.Mixed
      }
    },
    recommendations: {
      immediate: [{ type: String }],
      longTerm: [{ type: String }],
      practiceExercises: [{ type: String }]
    },
    progressTracking: {
      improvementSince: Date,
      scoreChange: Number,
      strengthsGained: [{ type: String }],
      areasImproved: [{ type: String }]
    },
    assessmentVersion: { type: String, default: '2.0' },
    assessmentDate: { type: Date },
    isReassessment: { type: Boolean, default: false }
  },
  
  assessmentAttempts: {
    type: Number,
    default: 0
  },
  isUploadedForAssessment: {
    type: Boolean,
    default: false,
    index: true
  },
  lastAssessedAt: {
    type: Date
  },
  
  // Publication fields
  isPublished: {
    type: Boolean,
    default: false,
    index: true
  },
  publicationDate: {
    type: Date
  },
  publicationFee: {
    type: Number,
    default: 10
  },
  competitionEligible: {
    type: Boolean,
    default: true,
    index: true
  },
  
  // Competition fields
  competitionEntries: [{
    competitionId: {
      type: Schema.Types.ObjectId,
      ref: 'Competition'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    phase: {
      type: String,
      enum: ['submission', 'judging', 'results'],
      default: 'submission'
    }
  }],
  
  // Timestamps
  completedAt: {
    type: Date
  },
  pausedAt: {
    type: Date
  },
  resumedAt: {
    type: Date
  },
  
  // Legacy fields for backward compatibility
  overallScore: { type: Number, min: 0, max: 100 },
  grammarScore: { type: Number, min: 0, max: 100 },
  creativityScore: { type: Number, min: 0, max: 100 },
  feedback: { type: String }
}, {
  collection: 'storysessions', // ✅ Force correct collection name
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
StorySessionSchema.index({ childId: 1, createdAt: -1 });
StorySessionSchema.index({ childId: 1, status: 1 });
StorySessionSchema.index({ childId: 1, isPublished: 1 });
StorySessionSchema.index({ childId: 1, isUploadedForAssessment: 1 });

// Virtual for submission status
StorySessionSchema.virtual('submittedToCompetition').get(function() {
  return this.competitionEntries && this.competitionEntries.length > 0;
});

// Ensure we don't recreate the model if it already exists
export default mongoose.models.StorySession || mongoose.model<IStorySession>('StorySession', StorySessionSchema);