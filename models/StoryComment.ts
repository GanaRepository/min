import mongoose, { Schema, Document } from 'mongoose';

export interface IStoryComment extends Document {
  storyId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId; // Admin or Mentor
  authorRole: 'admin' | 'mentor';
  comment: string;
  commentType:
    | 'general'
    | 'grammar'
    | 'creativity'
    | 'structure'
    | 'suggestion';
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId;
  parentCommentId?: mongoose.Types.ObjectId; // For reply threads
  position?: {
    paragraph: number;
    sentence: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const StoryCommentSchema = new Schema<IStoryComment>(
  {
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
    comment: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    commentType: {
      type: String,
      enum: ['general', 'suggestion'],
      default: 'general',
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
  },
  {
    timestamps: true,
  }
);

// Indexes
StoryCommentSchema.index({ storyId: 1, createdAt: -1 });
StoryCommentSchema.index({ authorId: 1, createdAt: -1 });

export default mongoose.models.StoryComment ||
  mongoose.model<IStoryComment>('StoryComment', StoryCommentSchema);
