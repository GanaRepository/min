// models/StorySession.ts - COMPLETE UPDATE with advanced assessment fields
import mongoose, { Schema, Document } from 'mongoose';
import type { StoryElements } from '@/config/story-elements';

export { StoryElements };

export interface IStorySession extends Document {
  _id: mongoose.Types.ObjectId;
  childId: mongoose.Types.ObjectId;
  storyNumber: number;
  title: string;
  elements?: StoryElements;
  aiOpening?: string;
  currentTurn: number;
  totalWords: number;
  childWords: number;
  apiCallsUsed: number;
  maxApiCalls: number;
  status: 'active' | 'completed' | 'paused' | 'flagged';

  // ENHANCED Assessment fields with advanced detection
  assessment?: {
    // Legacy fields for backward compatibility
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

    // NEW: Advanced integrity analysis
    plagiarismScore?: number; // 0-100, higher = more original
    aiDetectionScore?: number; // 0-100, higher = more human-like
    integrityRisk?: 'low' | 'medium' | 'high' | 'critical';

    // Detailed integrity analysis for admin review
    integrityAnalysis?: {
      plagiarismResult?: {
        score: number;
        riskLevel: 'low' | 'medium' | 'high' | 'critical';
        violationCount: number;
        detailedAnalysis: any;
      };
      aiDetectionResult?: {
        score: number;
        likelihood: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
        confidence: number;
        indicatorCount: number;
        detailedAnalysis: any;
      };
    };

    // Educational enhancements
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

    // Assessment metadata
    assessmentVersion?: string; // '1.0' = legacy, '2.0' = advanced
    assessmentDate?: Date;
    isReassessment?: boolean;
    error?: boolean;
    errorMessage?: string;
  };

  // Assessment tracking
  assessmentAttempts: number; // 0-3 max attempts per story
  lastAssessedAt?: Date;

  // Upload tracking
  isUploadedForAssessment?: boolean;

  // Publication Features
  isPublished?: boolean;
  publicationDate?: Date;
  publicationFee?: number;
  competitionEligible?: boolean;

  // Competition Features
  competitionEntries?: Array<{
    competitionId: mongoose.Types.ObjectId;
    submittedAt: Date;
    rank?: number;
    score?: number;
    phase: 'submission' | 'judging' | 'results';
  }>;

  // Legacy assessment fields (top-level for compatibility)
  overallScore?: number;
  grammarScore?: number;
  creativityScore?: number;
  feedback?: string;
  completedAt?: Date;
  pausedAt?: Date;
  resumedAt?: Date;
  draft?: string;

  createdAt: Date;
  updatedAt: Date;
}

const StorySessionSchema = new Schema<IStorySession>(
  {
    childId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    storyNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    elements: {
      type: {
        genre: { type: String, trim: true },
        character: { type: String, trim: true },
        setting: { type: String, trim: true },
        theme: { type: String, trim: true },
        mood: { type: String, trim: true },
        tone: { type: String, trim: true },
      },
      required: false,
      default: undefined,
    },
    aiOpening: {
      type: String,
      trim: true,
    },
    currentTurn: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
      default: 1,
    },
    totalWords: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    childWords: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    apiCallsUsed: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    maxApiCalls: {
      type: Number,
      required: true,
      min: 0,
      default: 7,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused', 'flagged'],
      default: 'active',
      required: true,
      index: true,
    },

    // ENHANCED Assessment object with advanced fields
    assessment: {
      // Legacy fields for backward compatibility
      grammarScore: { type: Number, min: 0, max: 100 },
      creativityScore: { type: Number, min: 0, max: 100 },
      vocabularyScore: { type: Number, min: 0, max: 100 },
      structureScore: { type: Number, min: 0, max: 100 },
      characterDevelopmentScore: { type: Number, min: 0, max: 100 },
      plotDevelopmentScore: { type: Number, min: 0, max: 100 },
      overallScore: { type: Number, min: 0, max: 100 },
      readingLevel: { type: String, trim: true },
      feedback: { type: String, trim: true },
      strengths: [{ type: String, trim: true }],
      improvements: [{ type: String, trim: true }],
      vocabularyUsed: [{ type: String, trim: true }],
      suggestedWords: [{ type: String, trim: true }],
      educationalInsights: { type: String, trim: true },

      // NEW: Advanced integrity analysis fields
      plagiarismScore: { type: Number, min: 0, max: 100 },
      aiDetectionScore: { type: Number, min: 0, max: 100 },
      integrityRisk: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
      },

      // Detailed integrity analysis for admin review
      integrityAnalysis: {
        plagiarismResult: {
          score: { type: Number, min: 0, max: 100 },
          riskLevel: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
          },
          violationCount: { type: Number, min: 0 },
          detailedAnalysis: Schema.Types.Mixed,
        },
        aiDetectionResult: {
          score: { type: Number, min: 0, max: 100 },
          likelihood: {
            type: String,
            enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
          },
          confidence: { type: Number, min: 0, max: 100 },
          indicatorCount: { type: Number, min: 0 },
          detailedAnalysis: Schema.Types.Mixed,
        },
      },

      // Educational enhancements
      recommendations: {
        immediate: [{ type: String, trim: true }],
        longTerm: [{ type: String, trim: true }],
        practiceExercises: [{ type: String, trim: true }],
      },

      progressTracking: {
        improvementSince: Date,
        scoreChange: Number,
        strengthsGained: [{ type: String, trim: true }],
        areasImproved: [{ type: String, trim: true }],
      },

      // Assessment metadata
      assessmentVersion: {
        type: String,
        default: '2.0',
        enum: ['1.0', '2.0'],
      },
      assessmentDate: { type: Date, default: Date.now },
      isReassessment: { type: Boolean, default: false },
      error: { type: Boolean, default: false },
      errorMessage: { type: String, trim: true },
    },

    // Assessment tracking
    assessmentAttempts: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
      default: 0,
    },
    lastAssessedAt: {
      type: Date,
    },

    // Upload tracking
    isUploadedForAssessment: {
      type: Boolean,
      default: false,
    },

    // Publication Features
    isPublished: {
      type: Boolean,
      default: false,
    },
    publicationDate: {
      type: Date,
    },
    publicationFee: {
      type: Number,
      default: 10,
      min: 0,
    },
    competitionEligible: {
      type: Boolean,
      default: true,
    },

    // Competition Features
    competitionEntries: [
      {
        competitionId: {
          type: Schema.Types.ObjectId,
          ref: 'Competition',
          required: true,
        },
        submittedAt: {
          type: Date,
          required: true,
          default: Date.now,
        },
        rank: {
          type: Number,
          min: 1,
        },
        score: {
          type: Number,
          min: 0,
          max: 100,
        },
        phase: {
          type: String,
          enum: ['submission', 'judging', 'results'],
          required: true,
          default: 'submission',
        },
      },
    ],

    // Legacy assessment fields (top-level for backward compatibility)
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    grammarScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    creativityScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    feedback: {
      type: String,
      trim: true,
    },
    completedAt: {
      type: Date,
    },
    pausedAt: {
      type: Date,
    },
    resumedAt: {
      type: Date,
    },
    draft: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
StorySessionSchema.index({ childId: 1, status: 1 });
StorySessionSchema.index({ childId: 1, storyNumber: 1 });
StorySessionSchema.index({ createdAt: -1 });
StorySessionSchema.index({ status: 1, 'assessment.integrityRisk': 1 }); // For flagged content queries
StorySessionSchema.index({ isUploadedForAssessment: 1 });
StorySessionSchema.index({ isPublished: 1, competitionEligible: 1 });
StorySessionSchema.index({ 'assessment.assessmentVersion': 1 }); // Track assessment versions

// Compound indexes for complex queries
StorySessionSchema.index({
  childId: 1,
  'assessment.integrityRisk': 1,
  createdAt: -1,
}); // User's flagged content

StorySessionSchema.index({
  status: 1,
  'assessment.plagiarismScore': 1,
  'assessment.aiDetectionScore': 1,
}); // Admin integrity monitoring

// Pre-save middleware to sync legacy fields
StorySessionSchema.pre('save', function (next) {
  if (this.assessment) {
    // Sync top-level fields with assessment object
    this.overallScore = this.assessment.overallScore;
    this.grammarScore = this.assessment.grammarScore;
    this.creativityScore = this.assessment.creativityScore;
    this.feedback = this.assessment.feedback;
  }
  next();
});

// Virtual for integrity status
StorySessionSchema.virtual('integrityStatus').get(function () {
  if (!this.assessment) return 'not_assessed';

  const risk = this.assessment.integrityRisk;
  if (risk === 'critical') return 'flagged';
  if (risk === 'high') return 'suspicious';
  if (risk === 'medium') return 'questionable';
  return 'clean';
});

// Method to check if story can be reassessed
StorySessionSchema.methods.canReassess = function () {
  return this.status === 'completed' && this.assessmentAttempts < 3;
};

// Method to get assessment summary
StorySessionSchema.methods.getAssessmentSummary = function () {
  if (!this.assessment) return null;

  return {
    overallScore: this.assessment.overallScore || 0,
    integrityScore: this.assessment.plagiarismScore || 0,
    humanLikeScore: this.assessment.aiDetectionScore || 0,
    riskLevel: this.assessment.integrityRisk || 'unknown',
    attemptNumber: this.assessmentAttempts || 0,
    maxAttempts: 3,
    canReassess: this.canReassess(),
  };
};

// Static method to find flagged content
StorySessionSchema.statics.findFlaggedContent = function (limit = 50) {
  return this.find({
    'assessment.integrityRisk': { $in: ['high', 'critical'] },
  })
    .populate('childId', 'firstName lastName email')
    .sort({ 'assessment.assessmentDate': -1 })
    .limit(limit);
};

// Static method to get integrity statistics
StorySessionSchema.statics.getIntegrityStats = function () {
  return this.aggregate([
    {
      $match: {
        assessment: { $exists: true },
        'assessment.integrityRisk': { $exists: true },
      },
    },
    {
      $group: {
        _id: '$assessment.integrityRisk',
        count: { $sum: 1 },
        avgPlagiarismScore: { $avg: '$assessment.plagiarismScore' },
        avgAIScore: { $avg: '$assessment.aiDetectionScore' },
      },
    },
  ]);
};

// ✅ CRITICAL: Force Mongoose to reload the model in development
if (mongoose.models.StorySession) {
  delete mongoose.models.StorySession;
  console.log('🔄 Cleared cached StorySession model');
}

export default mongoose.model<IStorySession>(
  'StorySession',
  StorySessionSchema
);
