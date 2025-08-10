import mongoose, { Schema, Document } from 'mongoose';

export interface IStorySession extends Document {
  childId: string;
  storyNumber: number;
  title: string;
  elements?: {
    genre?: string;
    character?: string;
    setting?: string;
    theme?: string;
    mood?: string;
    tone?: string;
  };
  storyMode: 'guided' | 'freeform';
  currentTurn: number;
  totalWords: number;
  childWords: number;
  apiCallsUsed: number;
  maxApiCalls: number;
  status: 'active' | 'completed' | 'paused' | 'flagged';
  aiOpening?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  lastModifiedAt: Date; // Added this field
  lastAssessedAt?: Date;
  isUploadedForAssessment?: boolean;
  assessmentAttempts: number;
  overallScore?: number;
  grammarScore?: number;
  creativityScore?: number;
  feedback?: string;
  assessment?: {
    grammarScore: number;
    creativityScore: number;
    vocabularyScore: number;
    structureScore: number;
    characterDevelopmentScore: number;
    plotDevelopmentScore: number;
    overallScore: number;
    readingLevel: string;
    feedback: string;
    strengths: string[];
    improvements: string[];
    vocabularyUsed: string[];
    suggestedWords: string[];
    educationalInsights: string;
    integrityAnalysis?: any;
    recommendations?: any;
    progressTracking?: any;
    assessmentVersion?: string;
    assessmentDate?: string;
  };
}

const StorySessionSchema: Schema = new Schema(
  {
    childId: {
      type: String,
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
      maxlength: 200,
    },
    elements: {
      genre: String,
      character: String,
      setting: String,
      theme: String,
      mood: String,
      tone: String,
    },
    storyMode: {
      type: String,
      enum: ['guided', 'freeform'],
      default: 'freeform',
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
    apiCallsUsed: {
      type: Number,
      default: 0,
    },
    maxApiCalls: {
      type: Number,
      default: 15,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused', 'flagged'],
      default: 'active',
    },
    aiOpening: {
      type: String,
      maxlength: 1000,
    },
    completedAt: {
      type: Date,
    },
    lastModifiedAt: {
      type: Date,
      default: Date.now,
    },
    lastAssessedAt: {
      type: Date,
    },
    isUploadedForAssessment: {
      type: Boolean,
      default: false,
    },
    assessmentAttempts: {
      type: Number,
      default: 0,
    },
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
      maxlength: 2000,
    },
    assessment: {
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
      vocabularyScore: {
        type: Number,
        min: 0,
        max: 100,
      },
      structureScore: {
        type: Number,
        min: 0,
        max: 100,
      },
      characterDevelopmentScore: {
        type: Number,
        min: 0,
        max: 100,
      },
      plotDevelopmentScore: {
        type: Number,
        min: 0,
        max: 100,
      },
      overallScore: {
        type: Number,
        min: 0,
        max: 100,
      },
      readingLevel: {
        type: String,
        enum: ['Beginner', 'Elementary', 'Intermediate', 'Advanced'],
      },
      feedback: {
        type: String,
        maxlength: 2000,
      },
      strengths: [{
        type: String,
        maxlength: 200,
      }],
      improvements: [{
        type: String,
        maxlength: 200,
      }],
      vocabularyUsed: [{
        type: String,
        maxlength: 50,
      }],
      suggestedWords: [{
        type: String,
        maxlength: 50,
      }],
      educationalInsights: {
        type: String,
        maxlength: 1000,
      },
      integrityAnalysis: {
        type: Schema.Types.Mixed,
      },
      recommendations: {
        type: Schema.Types.Mixed,
      },
      progressTracking: {
        type: Schema.Types.Mixed,
      },
      assessmentVersion: {
        type: String,
        default: '2.0',
      },
      assessmentDate: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
    collection: 'story_sessions',
  }
);

// Pre-save middleware to update lastModifiedAt
StorySessionSchema.pre('save', function(next) {
  this.lastModifiedAt = new Date();
  next();
});

// Pre-update middleware to update lastModifiedAt
StorySessionSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  this.set({ lastModifiedAt: new Date() });
  next();
});

// Indexes for better query performance
StorySessionSchema.index({ childId: 1, storyNumber: 1 }, { unique: true });
StorySessionSchema.index({ childId: 1, status: 1 });
StorySessionSchema.index({ childId: 1, createdAt: -1 });
StorySessionSchema.index({ status: 1, completedAt: -1 });

const StorySession = mongoose.models.StorySession || mongoose.model<IStorySession>('StorySession', StorySessionSchema);

export default StorySession;