// // models/StorySession.ts (COMPLETE REPLACEMENT - DELETE ALL OLD CODE)
// import mongoose, { Schema, Document } from 'mongoose';

// export interface StoryElements {
//   genre?: string;  // ✅ Optional
//   character?: string;  // ✅ Optional
//   setting?: string;  // ✅ Optional
//   theme?: string;  // ✅ Optional
//   mood?: string;  // ✅ Optional
//   tone?: string;  // ✅ Optional
// }

// export interface IStorySession extends Document {
//   _id: mongoose.Types.ObjectId;
//   childId: mongoose.Types.ObjectId;
//   storyNumber: number;
//   title: string;
//   elements?: StoryElements;  // ✅ Optional
//   storyMode: 'guided' | 'freeform';  // ✅ Add story mode
//   aiOpening?: string;
//   currentTurn: number;
//   totalWords: number;
//   childWords: number;
//   apiCallsUsed: number;
//   maxApiCalls: number;
//   status: 'active' | 'completed' | 'paused';

//   // Assessment fields
//   assessment?: {
//     grammarScore: number;
//     creativityScore: number;
//     overallScore: number;
//     feedback: string;
//   };
//   overallScore?: number;
//   grammarScore?: number;
//   creativityScore?: number;
//   feedback?: string;
//   completedAt?: Date;
//   pausedAt?: Date;

//   // Draft storage
//   draft?: Record<string, any>;

//   createdAt: Date;
//   updatedAt: Date;
// }

// const StorySessionSchema = new Schema<IStorySession>(
//   {
//     childId: {
//       type: Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     storyNumber: {
//       type: Number,
//       required: true,
//       min: 1,
//     },
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//       maxlength: 100,
//     },
//     // ✅ FIXED: Elements are now optional and support both guided/freeform
//     elements: {
//       type: {
//         genre: { type: String, trim: true },      // ✅ No longer required
//         character: { type: String, trim: true },  // ✅ No longer required
//         setting: { type: String, trim: true },    // ✅ No longer required
//         theme: { type: String, trim: true },      // ✅ No longer required
//         mood: { type: String, trim: true },       // ✅ No longer required
//         tone: { type: String, trim: true },       // ✅ No longer required
//       },
//       required: false,  // ✅ Elements object is optional
//       default: undefined,  // ✅ Default to undefined for freeform
//     },
//     // ✅ ADD: Story mode field
//     storyMode: {
//       type: String,
//       enum: ['guided', 'freeform'],
//       required: true,
//       default: 'guided',
//     },
//     aiOpening: {
//       type: String,
//       trim: true,
//     },
//     currentTurn: {
//       type: Number,
//       required: true,
//       min: 1,
//       max: 6,
//       default: 1,
//     },
//     totalWords: {
//       type: Number,
//       required: true,
//       min: 0,
//       default: 0,
//     },
//     childWords: {
//       type: Number,
//       required: true,
//       min: 0,
//       default: 0,
//     },
//     apiCallsUsed: {
//       type: Number,
//       required: true,
//       min: 0,
//       default: 0,
//     },
//     maxApiCalls: {
//       type: Number,
//       required: true,
//       min: 1,
//       default: 7,
//     },
//     status: {
//       type: String,
//       enum: ['active', 'completed', 'paused'],
//       default: 'active',
//       required: true,
//     },

//     // Assessment fields
//     assessment: {
//       grammarScore: { type: Number, min: 0, max: 100 },
//       creativityScore: { type: Number, min: 0, max: 100 },
//       overallScore: { type: Number, min: 0, max: 100 },
//       feedback: { type: String, trim: true },
//     },
//     overallScore: { type: Number, min: 0, max: 100 },
//     grammarScore: { type: Number, min: 0, max: 100 },
//     creativityScore: { type: Number, min: 0, max: 100 },
//     feedback: { type: String, trim: true },
//     completedAt: { type: Date },
//     pausedAt: { type: Date },

//     // Draft storage
//     draft: {
//       type: Schema.Types.Mixed,
//       default: {},
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// StorySessionSchema.index({ childId: 1, status: 1 });
// StorySessionSchema.index({ createdAt: -1 });

// // ✅ CRITICAL: Force Mongoose to reload the model in development
// if (mongoose.models.StorySession) {
//   delete mongoose.models.StorySession;
//   console.log('🔄 Cleared cached StorySession model');
// }

// export default mongoose.model<IStorySession>('StorySession', StorySessionSchema);

import mongoose, { Schema, Document } from 'mongoose';
import type { StoryElements } from '@/config/story-elements';

export { StoryElements };

export interface IStorySession extends Document {
  _id: mongoose.Types.ObjectId;
  childId: mongoose.Types.ObjectId;
  storyNumber: number;
  title: string;
  elements?: StoryElements;
  storyMode: 'guided' | 'freeform';
  aiOpening?: string;
  currentTurn: number;
  totalWords: number;
  childWords: number;
  apiCallsUsed: number;
  maxApiCalls: number;
  status: 'active' | 'completed' | 'paused';
  assessment?: {
    grammarScore: number;
    creativityScore: number;
    overallScore: number;
    feedback: string;
    readingLevel: string;
    vocabularyScore: number;
    structureScore: number;
    characterDevelopmentScore: number;
    plotDevelopmentScore: number;
    strengths: string[];
    improvements: string[];
    vocabularyUsed: string[];
    suggestedWords: string[];
    educationalInsights: string;
  };
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

const StorySessionSchema = new Schema<IStorySession>({
  childId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  storyNumber: { type: Number, required: true },
  title: { type: String, required: true },
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
    default: 'guided' 
  },
  aiOpening: String,
  currentTurn: { type: Number, default: 1 },
  totalWords: { type: Number, default: 0 },
  childWords: { type: Number, default: 0 },
  apiCallsUsed: { type: Number, default: 0 },
  maxApiCalls: { type: Number, default: 7 },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active',
  },
  assessment: {
    grammarScore: Number,
    creativityScore: Number,
    overallScore: Number,
    feedback: String,
    readingLevel: String,
    vocabularyScore: Number,
    structureScore: Number,
    characterDevelopmentScore: Number,
    plotDevelopmentScore: Number,
    strengths: [String],
    improvements: [String],
    vocabularyUsed: [String],
    suggestedWords: [String],
    educationalInsights: String,
  },
  overallScore: Number,
  grammarScore: Number,
  creativityScore: Number,
  feedback: String,
  completedAt: Date,
  pausedAt: Date,
  resumedAt: Date,
  draft: String,
}, {
  timestamps: true,
});

export default mongoose.models.StorySession || mongoose.model<IStorySession>('StorySession', StorySessionSchema);