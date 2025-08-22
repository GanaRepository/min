// // models/StoryComment.ts - FIX PROPERTY NAMES
// import mongoose, { Schema, Document } from 'mongoose';

// export interface IStoryComment extends Document {
//   _id: mongoose.Types.ObjectId;
//   storyId: mongoose.Types.ObjectId;
//   authorId: mongoose.Types.ObjectId;
//   authorRole: 'admin' | 'mentor';
//   content: string; // Changed from 'comment' to 'content'
//   commentType: 'general' | 'grammar' | 'creativity' | 'structure' | 'suggestion' | 'admin_feedback';
//   category: string; // Added this property
//   isPublic: boolean; // Added this property
//   isResolved: boolean;
//   resolvedAt?: Date;
//   resolvedBy?: mongoose.Types.ObjectId;
//   parentCommentId?: mongoose.Types.ObjectId;
//   position?: {
//     paragraph: number;
//     sentence: number;
//   };
//   createdAt: Date;
//   updatedAt: Date;
// }

// const StoryCommentSchema = new Schema<IStoryComment>({
//   storyId: {
//     type: Schema.Types.ObjectId,
//     ref: 'StorySession',
//     required: true,
//     index: true,
//   },
//   authorId: {
//     type: Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   },
//   authorRole: {
//     type: String,
//     enum: ['admin', 'mentor'],
//     required: true,
//   },
//   content: { // Changed from 'comment' to 'content'
//     type: String,
//     required: true,
//     maxlength: 1000,
//   },
//   commentType: {
//     type: String,
//     enum: ['general', 'grammar', 'creativity', 'structure', 'suggestion', 'admin_feedback'],
//     default: 'general',
//   },
//   category: { // Added this field
//     type: String,
//     default: 'general',
//   isResolved: {
//     type: Boolean,
//     default: false,
//     index: true,
//   },
//   resolvedAt: {
//     type: Date,
//   },
//   resolvedBy: {
//     type: Schema.Types.ObjectId,
//     ref: 'User',
//   },
//   parentCommentId: {
//     type: Schema.Types.ObjectId,
//     ref: 'StoryComment',
//   },
//   position: {
//     paragraph: { type: Number },
//     sentence: { type: Number },
//   },
// }, {
//   timestamps: true,
// });

// // Indexes
// StoryCommentSchema.index({ storyId: 1, createdAt: -1 });
// StoryCommentSchema.index({ authorId: 1, createdAt: -1 });

// export default mongoose.models?.StoryComment || mongoose.model<IStoryComment>('StoryComment', StoryCommentSchema);

// models/StoryComment.ts - COMPLETELY FIXED VERSION
import mongoose, { Schema, Document } from 'mongoose';

export interface IStoryComment extends Document {
  _id: mongoose.Types.ObjectId;
  storyId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  authorRole: 'admin' | 'mentor' | 'child'; // 🆕 Added 'child' for community comments
  content: string;
  commentType:
    | 'general'
    | 'grammar'
    | 'creativity'
    | 'structure'
    | 'suggestion'
    | 'admin_feedback'
    | 'community'; // 🆕 Added 'community'
  category: string;
  isPublic: boolean;
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId;
  parentCommentId?: mongoose.Types.ObjectId;
  position?: {
    paragraph: number;
    sentence: number;
  };

  // 🆕 COMMUNITY FEATURES - ALL OPTIONAL TO PREVENT TYPESCRIPT ERRORS
  likes?: mongoose.Types.ObjectId[];
  isModerated?: boolean;
  moderatedBy?: mongoose.Types.ObjectId;
  moderatedAt?: Date;
  moderationReason?: string;
  reports?: Array<{
    reportedBy: mongoose.Types.ObjectId;
    reason: 'inappropriate' | 'spam' | 'harassment' | 'other';
    description?: string;
    reportedAt: Date;
  }>;

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
      index: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
      trim: true,
    },
    commentType: {
      type: String,
      enum: [
        'general',
        'grammar',
        'creativity',
        'structure',
        'suggestion',
        'admin_feedback',
        'community',
      ], // 🆕 Added 'community'
      default: 'general',
    },
    category: {
      type: String,
      enum: ['grammar', 'creativity', 'structure', 'general', 'community'], // 🆕 Added 'community'
      default: 'general',
    },
    isPublic: {
      type: Boolean,
      default: false, // 🆕 Default to false for safety
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

    // 🆕 COMMUNITY FEATURES - ALL OPTIONAL WITH DEFAULTS
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isModerated: {
      type: Boolean,
      default: false,
    },
    moderatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    moderatedAt: {
      type: Date,
    },
    moderationReason: {
      type: String,
    },
    reports: [
      {
        reportedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        reason: {
          type: String,
          enum: ['inappropriate', 'spam', 'harassment', 'other'],
          required: true,
        },
        description: {
          type: String,
        },
        reportedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Existing indexes
StoryCommentSchema.index({ storyId: 1, createdAt: -1 });
StoryCommentSchema.index({ authorId: 1, createdAt: -1 });

// 🆕 NEW COMMUNITY INDEXES
StoryCommentSchema.index({ isPublic: 1, createdAt: -1 });
StoryCommentSchema.index({ parentCommentId: 1 });
StoryCommentSchema.index({ isModerated: 1 });
StoryCommentSchema.index({ 'reports.reportedBy': 1 });

export default mongoose.models?.StoryComment ||
  mongoose.model<IStoryComment>('StoryComment', StoryCommentSchema);
