// models/Competition.ts - COMPLETE FIXED VERSION
import mongoose, { Schema, Document } from 'mongoose';

export interface ICompetition extends Document {
  _id: mongoose.Types.ObjectId;
  month: string;
  year: number;
  phase: 'submission' | 'judging' | 'results';
  daysLeft: number;

  // FIXED: Use the field names that competition manager creates
  submissionStart?: Date;
  submissionEnd: Date;
  judgingStart?: Date;
  judgingEnd: Date;
  resultsDate: Date;

  // Status
  isActive: boolean;
  totalSubmissions: number;
  totalParticipants: number;

  // User-specific data (populated dynamically)
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

  // Winners
  winners?: Array<{
    position: number;
    childId: string;
    childName: string;
    title: string;
    score: number;
  }>;

  // Judging criteria
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

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const CompetitionSchema = new Schema<ICompetition>(
  {
    month: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    phase: {
      type: String,
      enum: ['submission', 'judging', 'results'],
      default: 'submission',
    },
    daysLeft: {
      type: Number,
      default: 0,
    },

    // FIXED: Use the field names that competition manager creates
    submissionStart: {
      type: Date,
      required: false, // Optional since some existing competitions might not have this
    },
    submissionEnd: {
      type: Date,
      required: true, // This is what your manager creates as "submissionEnd"
    },
    judgingStart: {
      type: Date,
      required: false,
    },
    judgingEnd: {
      type: Date,
      required: true, // This is what your manager creates as "judgingEnd"
    },
    resultsDate: {
      type: Date,
      required: true,
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    totalSubmissions: {
      type: Number,
      default: 0,
    },
    totalParticipants: {
      type: Number,
      default: 0,
    },

    // Winners
    winners: [
      {
        position: { type: Number },
        childId: { type: String },
        childName: { type: String },
        title: { type: String },
        score: { type: Number },
      },
    ],

    // Judging criteria
    judgingCriteria: {
      grammar: { type: Number, default: 15 },
      creativity: { type: Number, default: 25 },
      structure: { type: Number, default: 15 },
      character: { type: Number, default: 10 },
      plot: { type: Number, default: 15 },
      vocabulary: { type: Number, default: 10 },
      originality: { type: Number, default: 7 },
      engagement: { type: Number, default: 10 },
      aiDetection: { type: Number, default: -3 },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
CompetitionSchema.index({ month: 1, year: 1, isActive: 1 }, { unique: true });

export default mongoose.models?.Competition ||
  mongoose.model<ICompetition>('Competition', CompetitionSchema);
