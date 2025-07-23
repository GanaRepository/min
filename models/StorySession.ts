// models/StorySession.ts (COMPLETE REPLACEMENT)
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
  storyNumber: number;
  title: string;
  elements: StoryElements;
  aiOpening?: string;
  currentTurn: number;
  totalWords: number;
  childWords: number;
  apiCallsUsed: number;
  maxApiCalls: number;
  status: 'active' | 'completed' | 'paused';

  // Assessment fields
  assessment?: {
    grammarScore: number;
    creativityScore: number;
    overallScore: number;
    feedback: string;
  };
  overallScore?: number;
  grammarScore?: number;
  creativityScore?: number;
  feedback?: string;
  completedAt?: Date;
  pausedAt?: Date;

  // Draft storage
  draft?: Record<string, any>;

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
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    elements: {
      genre: { type: String, required: true, trim: true },
      character: { type: String, required: true, trim: true },
      setting: { type: String, required: true, trim: true },
      theme: { type: String, required: true, trim: true },
      mood: { type: String, required: true, trim: true },
      tone: { type: String, required: true, trim: true },
    },
    aiOpening: {
      type: String,
      trim: true,
    },
    currentTurn: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
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
      min: 1,
      default: 7,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused'],
      default: 'active',
      required: true,
    },

    // Assessment fields
    assessment: {
      grammarScore: { type: Number, min: 0, max: 100 },
      creativityScore: { type: Number, min: 0, max: 100 },
      overallScore: { type: Number, min: 0, max: 100 },
      feedback: { type: String, trim: true },
    },
    overallScore: { type: Number, min: 0, max: 100 },
    grammarScore: { type: Number, min: 0, max: 100 },
    creativityScore: { type: Number, min: 0, max: 100 },
    feedback: { type: String, trim: true },
    completedAt: { type: Date },
    pausedAt: { type: Date },

    // Draft storage
    draft: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

StorySessionSchema.index({ childId: 1, status: 1 });
StorySessionSchema.index({ createdAt: -1 });

export default mongoose.models.StorySession ||
  mongoose.model<IStorySession>('StorySession', StorySessionSchema);
