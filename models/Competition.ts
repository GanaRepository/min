// models/CompetitionSubmission.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ICompetitionSubmission extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  competitionId: mongoose.Types.ObjectId;
  
  // Story Details
  title: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileBuffer: Buffer;
  wordCount: number;
  
  // Submission Info
  submittedAt: Date;
  status: 'submitted' | 'under_review' | 'judged' | 'winner' | 'disqualified';
  
  // Publishing
  published: boolean;
  publicationFee: number; // $10
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  publishedAt?: Date;
  
  // Competition Results
  competitionRank?: number; // 1, 2, 3, etc.
  competitionScore?: number; // 0-100
  judgedAt?: Date;
  aiJudgingNotes?: string;
  
  // AI Analysis (when judged)
  grammarScore?: number;
  creativityScore?: number;
  structureScore?: number;
  characterScore?: number;
  plotScore?: number;
  vocabularyScore?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const CompetitionSubmissionSchema = new Schema<ICompetitionSubmission>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    competitionId: {
      type: Schema.Types.ObjectId,
      ref: 'Competition',
      required: true,
      index: true,
    },
    
    // Story Details
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileSize: {
      type: Number,
      required: true,
      min: 0,
      max: 10 * 1024 * 1024, // 10MB max
    },
    fileType: {
      type: String,
      required: true,
      enum: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    },
    fileBuffer: {
      type: Buffer,
      required: true,
    },
    wordCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 2000,
    },
    
    // Submission Info
    submittedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'judged', 'winner', 'disqualified'],
      default: 'submitted',
      required: true,
      index: true,
    },
    
    // Publishing
    published: {
      type: Boolean,
      default: false,
      index: true,
    },
    publicationFee: {
      type: Number,
      required: true,
      default: 10,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      required: true,
      index: true,
    },
    publishedAt: {
      type: Date,
    },
    
    // Competition Results
    competitionRank: {
      type: Number,
      min: 1,
      index: true,
    },
    competitionScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    judgedAt: {
      type: Date,
    },
    aiJudgingNotes: {
      type: String,
      maxlength: 1000,
    },
    
    // AI Analysis Scores
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
    structureScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    characterScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    plotScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    vocabularyScore: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
CompetitionSubmissionSchema.index({ userId: 1, competitionId: 1 });
CompetitionSubmissionSchema.index({ competitionId: 1, competitionRank: 1 });
CompetitionSubmissionSchema.index({ competitionId: 1, competitionScore: -1 });
CompetitionSubmissionSchema.index({ submittedAt: -1 });
CompetitionSubmissionSchema.index({ status: 1, judgedAt: -1 });

// Ensure a user can't submit the same title twice in the same competition
CompetitionSubmissionSchema.index(
  { userId: 1, competitionId: 1, title: 1 }, 
  { unique: true }
);

export default mongoose.models.CompetitionSubmission ||
  mongoose.model<ICompetitionSubmission>('CompetitionSubmission', CompetitionSubmissionSchema);