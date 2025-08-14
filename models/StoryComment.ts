// models/StoryComment.ts - FIX PROPERTY NAMES
import mongoose, { Schema, Document } from 'mongoose';

export interface IStoryComment extends Document {
  _id: mongoose.Types.ObjectId;
  storyId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  authorRole: 'admin' | 'mentor';
  content: string; // Changed from 'comment' to 'content'
  commentType: 'general' | 'grammar' | 'creativity' | 'structure' | 'suggestion' | 'admin_feedback';
  category: string; // Added this property
  isPublic: boolean; // Added this property
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId;
  parentCommentId?: mongoose.Types.ObjectId;
  position?: {
    paragraph: number;
    sentence: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const StoryCommentSchema = new Schema<IStoryComment>({
  storyId: {
    type: Schema.Types.ObjectId,
    ref: 'StorySession',
    required: true,
    index: true,
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  authorRole: {
    type: String,
    enum: ['admin', 'mentor'],
    required: true,
  },
  content: { // Changed from 'comment' to 'content'
    type: String,
    required: true,
    maxlength: 1000,
  },
  commentType: {
    type: String,
    enum: ['general', 'grammar', 'creativity', 'structure', 'suggestion', 'admin_feedback'],
    default: 'general',
  },
  category: { // Added this field
    type: String,
    default: 'general',
  },
  isPublic: { // Added this field
    type: Boolean,
    default: true,
  },
  isResolved: {
    type: Boolean,
    default: false,
    index: true,
  },
  resolvedAt: {
    type: Date,
  },
  resolvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  parentCommentId: {
    type: Schema.Types.ObjectId,
    ref: 'StoryComment',
  },
  position: {
    paragraph: { type: Number },
    sentence: { type: Number },
  },
}, {
  timestamps: true,
});

// Indexes
StoryCommentSchema.index({ storyId: 1, createdAt: -1 });
StoryCommentSchema.index({ authorId: 1, createdAt: -1 });

export default mongoose.models?.StoryComment || mongoose.model<IStoryComment>('StoryComment', StoryCommentSchema);