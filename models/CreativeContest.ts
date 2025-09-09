import mongoose, { Schema, Document } from 'mongoose';

export interface ICreativeContest extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: 'art' | 'photography' | 'video';
  createdBy: mongoose.Types.ObjectId;
  status: 'draft' | 'active' | 'ended' | 'results_published';
  showPrizes: boolean;

  startDate: Date;
  endDate: Date;
  resultsDate: Date;

  acceptedFormats: string[];
  maxFileSize: number;
  maxSubmissionsPerUser: number;
  rules: string;

  prizes: Array<{
    position: number;
    title: string;
    description?: string;
  }>;

  submissions: Array<{
    participantId: mongoose.Types.ObjectId;
    participantName: string;
    fileId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    submissionTitle: string;
    description?: string;
    submittedAt: Date;
    isWinner: boolean;
    position?: number;
  }>;

  stats: {
    totalParticipants: number;
    totalSubmissions: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

const CreativeContestSchema = new Schema<ICreativeContest>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    type: {
      type: String,
      enum: ['art', 'photography', 'video'],
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'ended', 'results_published'],
      default: 'draft',
      index: true,
    },
    showPrizes: {
      type: Boolean,
      default: true,
    },

    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    resultsDate: {
      type: Date,
      required: true,
    },

    acceptedFormats: [
      {
        type: String,
        required: true,
      },
    ],
    maxFileSize: {
      type: Number,
      required: true,
      default: 25,
    },
    maxSubmissionsPerUser: {
      type: Number,
      required: true,
      default: 3,
    },
    rules: {
      type: String,
      required: true,
    },

    prizes: [
      {
        position: {
          type: Number,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
        },
      },
    ],

    submissions: [
      {
        participantId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        participantName: {
          type: String,
          required: true,
        },
        fileId: {
          type: String,
          required: true,
        },
        fileName: {
          type: String,
          required: true,
        },
        fileType: {
          type: String,
          required: true,
        },
        fileSize: {
          type: Number,
          required: true,
        },
        submissionTitle: {
          type: String,
          required: true,
        },
        description: {
          type: String,
        },
        submittedAt: {
          type: Date,
          default: Date.now,
        },
        isWinner: {
          type: Boolean,
          default: false,
        },
        position: {
          type: Number,
        },
      },
    ],

    stats: {
      totalParticipants: {
        type: Number,
        default: 0,
      },
      totalSubmissions: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

CreativeContestSchema.index({ status: 1, type: 1 });
CreativeContestSchema.index({ startDate: 1, endDate: 1 });
CreativeContestSchema.index({ createdBy: 1, createdAt: -1 });

export default mongoose.models?.CreativeContest ||
  mongoose.model<ICreativeContest>('CreativeContest', CreativeContestSchema);
