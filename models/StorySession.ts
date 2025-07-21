// // // models/StorySession.ts
// // import mongoose, { Schema } from 'mongoose';
// // import { IStorySession } from '@/types/story';

// // const StorySessionSchema = new Schema<IStorySession>(
// //   {
// //     childId: {
// //       type: Schema.Types.ObjectId,
// //       ref: 'User',
// //       required: true,
// //     },
// //     title: {
// //       type: String,
// //       required: true,
// //       trim: true,
// //     },
// //     elements: {
// //       genre: { type: String, required: true },
// //       character: { type: String, required: true },
// //       setting: { type: String, required: true },
// //       theme: { type: String, required: true },
// //       mood: { type: String, required: true },
// //       tone: { type: String, required: true },
// //     },
// //     currentTurn: {
// //       type: Number,
// //       default: 1,
// //       min: 1,
// //       max: 7,
// //     },
// //     totalWords: {
// //       type: Number,
// //       default: 0,
// //       min: 0,
// //     },
// //     apiCallsUsed: {
// //       type: Number,
// //       default: 0,
// //       min: 0,
// //     },
// //     maxApiCalls: {
// //       type: Number,
// //       default: 7,
// //     },
// //     status: {
// //       type: String,
// //       enum: ['active', 'completed', 'paused'],
// //       default: 'active',
// //     },
// //   },
// //   {
// //     timestamps: true,
// //   }
// // );

// // // Indexes for better query performance
// // StorySessionSchema.index({ childId: 1, status: 1 });
// // StorySessionSchema.index({ createdAt: -1 });

// // export default mongoose.models.StorySession ||
// //   mongoose.model<IStorySession>('StorySession', StorySessionSchema);

// // models/StorySession.ts
// import mongoose, { Schema, Document } from 'mongoose';
// import { StoryElements } from '@/types/story';

// export interface IStorySession extends Document {
//   _id: mongoose.Types.ObjectId;
//   childId: mongoose.Types.ObjectId;
//   title: string;
//   elements: StoryElements;
//   currentTurn: number;
//   totalWords: number;
//   status: 'active' | 'completed' | 'draft';
//   createdAt: Date;
//   updatedAt: Date;
// }

// const StorySessionSchema = new Schema<IStorySession>({
//   childId: {
//     type: Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   title: {
//     type: String,
//     required: true,
//     trim: true,
//     maxlength: 100
//   },
//   elements: {
//     genre: { type: String, required: true },
//     character: { type: String, required: true },
//     setting: { type: String, required: true },
//     theme: { type: String },
//     mood: { type: String },
//     tone: { type: String }
//   },
//   currentTurn: {
//     type: Number,
//     default: 1,
//     min: 1,
//     max: 7
//   },
//   totalWords: {
//     type: Number,
//     default: 0,
//     min: 0
//   },
//   status: {
//     type: String,
//     enum: ['active', 'completed', 'draft'],
//     default: 'active'
//   }
// }, {
//   timestamps: true
// });

// // Index for efficient queries
// StorySessionSchema.index({ childId: 1, status: 1 });
// StorySessionSchema.index({ childId: 1, updatedAt: -1 });

// export default mongoose.models.StorySession || mongoose.model<IStorySession>('StorySession', StorySessionSchema);

// models/StorySession.ts (ADD AI OPENING FIELD)
import mongoose, { Schema, Document } from 'mongoose';

export interface StoryElements {
  genre: string;
  character: string;
  setting: string;
  theme: string;
  mood: string;
  tone: string;
}

export interface IStorySession extends Document {
  _id: mongoose.Types.ObjectId;
  childId: mongoose.Types.ObjectId;
  title: string;
  elements: StoryElements;
  aiOpening?: string; // ✅ Add AI opening field
  currentTurn: number;
  totalWords: number;
  apiCallsUsed: number;
  maxApiCalls: number;
  status: 'active' | 'completed' | 'paused';
  createdAt: Date;
  updatedAt: Date;
}

const StorySessionSchema = new Schema<IStorySession>({
  childId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  elements: {
    genre: {
      type: String,
      required: true,
      trim: true
    },
    character: {
      type: String,
      required: true,
      trim: true
    },
    setting: {
      type: String,
      required: true,
      trim: true
    },
    theme: {
      type: String,
      required: true,
      trim: true
    },
    mood: {
      type: String,
      required: true,
      trim: true
    },
    tone: {
      type: String,
      required: true,
      trim: true
    }
  },
  aiOpening: {
    type: String,
    trim: true
  }, // ✅ AI opening saved once, never changes
  currentTurn: {
    type: Number,
    required: true,
    min: 1,
    max: 6,
    default: 1
  },
  totalWords: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  apiCallsUsed: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  maxApiCalls: {
    type: Number,
    required: true,
    min: 1,
    default: 7
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active',
    required: true
  }
}, {
  timestamps: true
});

StorySessionSchema.index({ childId: 1, status: 1 });
StorySessionSchema.index({ createdAt: -1 });

export default mongoose.models.StorySession || mongoose.model<IStorySession>('StorySession', StorySessionSchema);