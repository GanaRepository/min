// models/PublishedStory.ts - FIXED VERSION
import mongoose, { Schema, Document } from 'mongoose';

export interface IPublishedStory extends Document {
  _id: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  childId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  elements?: {
    genre?: string;
    character?: string;
    setting?: string;
    theme?: string;
    mood?: string;
    tone?: string;
  };
  totalWords: number;
  childWords?: number;
  grammarScore: number;
  creativityScore: number;
  overallScore: number;
  aiFeeback: string; // Note: keeping the typo from original
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PublishedStorySchema = new Schema<IPublishedStory>({
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: 'StorySession',
    required: true,
    unique: true,
  },
  childId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  elements: {
    genre: { type: String },
    character: { type: String },
    setting: { type: String },
    theme: { type: String },
    mood: { type: String },
    tone: { type: String },
  },
  totalWords: {
    type: Number,
    required: true,
    min: 0,
  },
  childWords: {
    type: Number,
    min: 0,
  },
  grammarScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  creativityScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  overallScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  aiFeeback: {
    type: String,
    required: true,
  },
  publishedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
PublishedStorySchema.index({ childId: 1, publishedAt: -1 });
PublishedStorySchema.index({ overallScore: -1 });

export default mongoose.models?.PublishedStory || mongoose.model<IPublishedStory>('PublishedStory', PublishedStorySchema);