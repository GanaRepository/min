// // models/Turn.ts (UPDATED with word count fields)
// import mongoose, { Schema, Document } from 'mongoose';

// export interface ITurn extends Document {
//   _id: mongoose.Types.ObjectId;
//   sessionId: mongoose.Types.ObjectId;
//   turnNumber: number;
//   childInput: string;
//   aiResponse: string;
//   childWordCount: number; // ✅ ADD THIS
//   aiWordCount: number; // ✅ ADD THIS
//   createdAt: Date;
//   updatedAt: Date;
// }

// const TurnSchema = new Schema<ITurn>(
//   {
//     sessionId: {
//       type: Schema.Types.ObjectId,
//       ref: 'StorySession',
//       required: true,
//     },
//     turnNumber: {
//       type: Number,
//       required: true,
//       min: 1,
//       max: 7,
//     },
//     childInput: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     aiResponse: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     childWordCount: {
//       // ✅ ADD THIS FIELD
//       type: Number,
//       required: true,
//       min: 0,
//       default: 0,
//     },
//     aiWordCount: {
//       // ✅ ADD THIS FIELD
//       type: Number,
//       required: true,
//       min: 0,
//       default: 0,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// TurnSchema.index({ sessionId: 1, turnNumber: 1 }, { unique: true });

// export default mongoose.models.Turn ||
//   mongoose.model<ITurn>('Turn', TurnSchema);


// models/Turn.ts - COMPLETE FIXED VERSION
import mongoose, { Schema, Document } from 'mongoose';

export interface ITurn extends Document {
  _id: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  turnNumber: number;
  author: 'child' | 'ai';
  childInput?: string;
  aiResponse?: string;
  content: string;
  wordCount: number;
  isValid: boolean;
  validationErrors?: string[];
  metadata?: {
    writingTime?: number;
    aiModel?: string;
    promptTokens?: number;
    completionTokens?: number;
    timestamp?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TurnSchema = new Schema<ITurn>({
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: 'StorySession',
    required: true,
    index: true,
  },
  turnNumber: {
    type: Number,
    required: true,
    min: 1,
  },
  author: {
    type: String,
    enum: ['child', 'ai'],
    required: true,
  },
  childInput: {
    type: String,
    trim: true,
  },
  aiResponse: {
    type: String,
    trim: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  wordCount: {
    type: Number,
    required: true,
    min: 0,
  },
  isValid: {
    type: Boolean,
    default: true,
  },
  validationErrors: [{
    type: String,
  }],
  metadata: {
    writingTime: { type: Number },
    aiModel: { type: String },
    promptTokens: { type: Number },
    completionTokens: { type: Number },
    timestamp: { type: Date, default: Date.now },
  },
}, {
  timestamps: true,
});

// Indexes for performance
TurnSchema.index({ sessionId: 1, turnNumber: 1 }, { unique: true });
TurnSchema.index({ sessionId: 1, createdAt: 1 });

export default mongoose.models?.Turn || mongoose.model<ITurn>('Turn', TurnSchema);