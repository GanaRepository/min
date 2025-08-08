// models/Competition.ts - Monthly competition management
import mongoose, { Schema, Document } from 'mongoose';

export interface ICompetition extends Document {
  _id: mongoose.Types.ObjectId;
  month: string; // "March 2024"
  year: number;
  phase: 'submission' | 'judging' | 'results';

  // Competition Timeline
  submissionStart: Date; // Day 1
  submissionEnd: Date; // Day 25
  judgingStart: Date; // Day 26
  judgingEnd: Date; // Day 30
  resultsDate: Date; // Day 31

  // Competition Settings
  maxEntriesPerChild: number; // 3
  totalSubmissions: number;
  totalParticipants: number;

  // Winners (Olympic-style podium)
  winners: Array<{
    position: number; // 1, 2, 3
    childId: mongoose.Types.ObjectId;
    storyId: mongoose.Types.ObjectId;
    score: number;
    title: string;
    childName: string;
    aiJudgingNotes?: string;
  }>;

  // Competition Status
  isActive: boolean;
  isArchived: boolean;

  // AI Judging Criteria Weights
  judgingCriteria: {
    grammar: number; // 20%
    creativity: number; // 25%
    structure: number; // 15%
    characterDev: number; // 15%
    plotOriginality: number; // 15%
    vocabulary: number; // 10%
  };

  // Metadata
  createdBy: mongoose.Types.ObjectId; // Admin who created
  createdAt: Date;
  updatedAt: Date;
}

const CompetitionSchema = new Schema<ICompetition>(
  {
    month: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      min: 2024,
    },
    phase: {
      type: String,
      enum: ['submission', 'judging', 'results'],
      required: true,
      default: 'submission',
      index: true,
    },

    // Timeline
    submissionStart: {
      type: Date,
      required: true,
    },
    submissionEnd: {
      type: Date,
      required: true,
    },
    judgingStart: {
      type: Date,
      required: true,
    },
    judgingEnd: {
      type: Date,
      required: true,
    },
    resultsDate: {
      type: Date,
      required: true,
    },

    // Settings
    maxEntriesPerChild: {
      type: Number,
      required: true,
      default: 3,
      min: 1,
      max: 10,
    },
    totalSubmissions: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalParticipants: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    // Winners
    winners: [
      {
        position: {
          type: Number,
          required: true,
          min: 1,
          max: 3,
        },
        childId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        storyId: {
          type: Schema.Types.ObjectId,
          ref: 'StorySession',
          required: true,
        },
        score: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
        title: {
          type: String,
          required: true,
          trim: true,
        },
        childName: {
          type: String,
          required: true,
          trim: true,
        },
        aiJudgingNotes: {
          type: String,
          trim: true,
        },
      },
    ],

    // Status
    isActive: {
      type: Boolean,
      required: true,
      default: true,
      index: true,
    },
    isArchived: {
      type: Boolean,
      required: true,
      default: false,
    },

    // AI Judging Weights
    judgingCriteria: {
      grammar: { type: Number, default: 0.2 },
      creativity: { type: Number, default: 0.25 },
      structure: { type: Number, default: 0.15 },
      characterDev: { type: Number, default: 0.15 },
      plotOriginality: { type: Number, default: 0.15 },
      vocabulary: { type: Number, default: 0.1 },
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
CompetitionSchema.index({ year: 1, month: 1 }, { unique: true });
CompetitionSchema.index({ phase: 1, isActive: 1 });
CompetitionSchema.index({ submissionEnd: 1, judgingEnd: 1, resultsDate: 1 });

export default mongoose.models.Competition ||
  mongoose.model<ICompetition>('Competition', CompetitionSchema);
