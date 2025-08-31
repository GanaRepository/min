// models/StorySession.ts - FIXED WITH 13-FACTOR ASSESSMENT SCHEMA
import mongoose, { Schema, Document } from 'mongoose';


// ✅ CRITICAL: Clear existing model cache to force schema reload
if (mongoose.models.StorySession) {
  delete mongoose.models.StorySession;
}

export interface IStorySession extends Document {
  _id: mongoose.Types.ObjectId;
  childId: mongoose.Types.ObjectId;
  storyNumber: number;
  title: string;
  aiOpening?: string;
  content?: string;
  currentTurn: number;
  totalWords: number;
  childWords: number;
  aiWords?: number;
  apiCallsUsed: number;
  maxApiCalls: number;
  status: 'active' | 'completed' | 'paused' | 'flagged' | 'review';

  // ✅ FIXED: 13-Factor Assessment Structure
  assessment?: {
    // 13-Factor Structure
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

    // Metadata
    assessmentVersion?: string;
    assessmentDate?: string;
    assessmentType?: string;
    userAge?: number;
    wordCount?: number;
    userContributionCount?: number;

    // Legacy fields for backwards compatibility
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
    overallScore?: number;
    readingLevel?: string;
    feedback?: string;
    strengths?: string[];
    improvements?: string[];
    encouragement?: string;
    integrityAnalysis?: {
      plagiarismResult?: {
        overallScore?: number;
        riskLevel?: string;
        violationCount?: number;
        detailedAnalysis?: any;
      };
      aiDetectionResult?: {
        likelihood?: string;
        confidence?: number;
        indicatorCount?: number;
        detailedAnalysis?: any;
      };
      integrityRisk?: string;
      overallStatus?: string;
      message?: string;
    };
    integrityStatus?: {
      status: 'PASS' | 'WARNING' | 'FAIL';
      message: string;
    };
  };

  // Assessment tracking
  assessmentAttempts?: number;
  lastAssessedAt?: Date;
  isUploadedForAssessment?: boolean;

  // Physical anthology
  physicalAnthology?: {
    purchased: boolean;
    purchaseDate?: Date;
    stripeSessionId?: string;
    amount?: number;
    trackingNumber?: string;
    shippingAddress?: {
      name: string;
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };

  // Competition features
  competitionEligible?: boolean;
  competitionEntries?: Array<{
    competitionId: mongoose.Types.ObjectId;
    submittedAt: Date;
    rank?: number;
    score?: number;
    isWinner?: boolean;
  }>;

  // Story type identification
  storyType?: 'freestyle' | 'uploaded' | 'competition';

  // Story Elements
  elements?: {
    genre?: string;
    character?: string;
    setting?: string;
    theme?: string;
    mood?: string;
    tone?: string;
  };

  // Community features
  isPublished?: boolean;
  publishedAt?: Date;
  views?: number;
  likes?: mongoose.Types.ObjectId[];
  bookmarks?: mongoose.Types.ObjectId[];
  isFeatured?: boolean;
  tags?: string[];
  genre?: string;

  // Legacy fields for backward compatibility
  plagiarismScore?: number;
  aiDetectionScore?: number;
  integrityStatus?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  pausedAt?: Date;
  resumedAt?: Date;
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
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    aiOpening: {
      type: String,
      default: 'Start writing your story here...',
    },
    content: {
      type: String, // For uploaded stories
    },
    currentTurn: {
      type: Number,
      default: 1,
    },
    totalWords: {
      type: Number,
      default: 0,
    },
    childWords: {
      type: Number,
      default: 0,
    },
    aiWords: {
      type: Number,
      default: 0,
    },
    apiCallsUsed: {
      type: Number,
      default: 0,
    },
    maxApiCalls: {
      type: Number,
      default: 7,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused', 'flagged', 'review'],
      default: 'active',
      index: true,
    },

    // ✅ FIXED: 13-Factor Assessment Schema - allow any structure
    assessment: {
      type: Schema.Types.Mixed,
      default: {},
    },

    // Assessment tracking
    assessmentAttempts: { type: Number, default: 0 },
    lastAssessedAt: { type: Date },
    isUploadedForAssessment: { type: Boolean, default: false },

    // Physical anthology
    physicalAnthology: {
      purchased: { type: Boolean, default: false },
      purchaseDate: { type: Date },
      stripeSessionId: { type: String },
      amount: { type: Number },
      trackingNumber: { type: String },
      shippingAddress: {
        name: { type: String },
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zipCode: { type: String },
        country: { type: String },
      },
    },

    // Competition features
    competitionEligible: { type: Boolean, default: false },
    competitionEntries: [
      {
        competitionId: { type: Schema.Types.ObjectId, ref: 'Competition' },
        submittedAt: { type: Date, default: Date.now },
        rank: { type: Number },
        score: { type: Number },
        isWinner: { type: Boolean, default: false },
      },
    ],

    // Story type identification
    storyType: {
      type: String,
      enum: ['freestyle', 'uploaded', 'competition'],
      default: 'freestyle',
      index: true,
    },

    // Story Elements
    elements: {
      genre: { type: String },
      character: { type: String },
      setting: { type: String },
      theme: { type: String },
      mood: { type: String },
      tone: { type: String },
    },

    // Community features
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    views: { type: Number, default: 0 },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isFeatured: { type: Boolean, default: false },
    tags: [{ type: String, trim: true }],
    genre: { type: String, default: 'Adventure' },

    // Legacy fields for backward compatibility
    plagiarismScore: { type: Number },
    aiDetectionScore: { type: Number },
    integrityStatus: { type: String },

    // Timestamps
    completedAt: { type: Date },
    pausedAt: { type: Date },
    resumedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: false // ✅ THIS IS THE KEY FIX
  }
);

// Pre-save middleware to ensure integrityStatus is always set
StorySessionSchema.pre('save', function (next) {
  if (this.assessment && !this.assessment.integrityStatus) {
    this.assessment.integrityStatus = {
      status: 'PASS',
      message: 'Assessment pending...',
    };
  }
  next();
});

// Pre-validate middleware to set defaults before validation
StorySessionSchema.pre('validate', function (next) {
  if (this.assessment && !this.assessment.integrityStatus) {
    this.assessment.integrityStatus = {
      status: 'PASS',
      message: 'Assessment pending...',
    };
  }
  next();
});

// Indexes
StorySessionSchema.index({ childId: 1, createdAt: -1 });
StorySessionSchema.index({ childId: 1, status: 1 });
StorySessionSchema.index({ childId: 1, isPublished: 1 });
StorySessionSchema.index({ childId: 1, storyType: 1 });
StorySessionSchema.index({ 'physicalAnthology.purchased': 1 });
StorySessionSchema.index({ isPublished: 1, publishedAt: -1 });
StorySessionSchema.index({ views: -1 });
StorySessionSchema.index({ isFeatured: 1 });

export default mongoose.models?.StorySession ||
  mongoose.model<IStorySession>('StorySession', StorySessionSchema);
