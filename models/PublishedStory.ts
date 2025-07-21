// models/PublishedStory.ts
import mongoose, { Schema } from 'mongoose';
import { IPublishedStory } from '@/types/story';

const PublishedStorySchema = new Schema<IPublishedStory>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'StorySession',
      required: true,
    },
    childId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    totalWords: {
      type: Number,
      required: true,
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
  },
  {
    timestamps: true,
  }
);

// Indexes
PublishedStorySchema.index({ childId: 1, publishedAt: -1 });
PublishedStorySchema.index({ overallScore: -1 });

export default mongoose.models.PublishedStory ||
  mongoose.model<IPublishedStory>('PublishedStory', PublishedStorySchema);