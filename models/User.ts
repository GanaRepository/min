// models/User.ts - COMPLETE FIXED VERSION
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  age?: number;
  school?: string;
  role: 'admin' | 'mentor' | 'child';
  isActive: boolean;

  // Subscription fields
  subscriptionTier: 'FREE' | 'STORY_PACK';
  subscriptionStatus: 'active' | 'inactive' | 'cancelled';
  billingPeriodStart?: Date;
  billingPeriodEnd?: Date;

  // Writing Statistics
  totalStoriesCreated: number;
  storiesCreatedThisMonth: number;
  assessmentUploadsThisMonth: number;
  competitionEntriesThisMonth: number;
  totalWordsWritten: number;
  writingStreak: number;
  lastActiveDate?: Date;
  lastMonthlyReset?: Date;
  totalTimeWriting: number;

  // Purchase History - THE MISSING FIELD CAUSING ALL ERRORS
  purchaseHistory: Array<{
    type: 'story_pack' | 'individual_story' | 'story_purchase';
    amount: number;
    stripePaymentId?: string;
    stripeSessionId?: string;
    paymentStatus: 'pending' | 'completed' | 'failed';
    itemDetails?: {
      storyId?: mongoose.Types.ObjectId;
      storyTitle?: string;
      storiesAdded?: number;
      assessmentsAdded?: number;
    };
    purchaseDate: Date;
    _id?: mongoose.Types.ObjectId;
  }>;

  // Monthly Limits (for stacking purchases)
  monthlyLimits: {
    freestyleStories: number;
    assessmentRequests: number;
    competitionEntries: number;
  };

  // Monthly reset tracking
  currentMonth: string;

  // User Preferences
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    emailNotifications: boolean;
    soundEffects: boolean;
    autoSave: boolean;
  };

  // Password reset
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;

  // Relationships
  assignedMentor?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      min: 3,
      max: 18,
    },
    school: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'mentor', 'child'],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Subscription fields
    subscriptionTier: {
      type: String,
      enum: ['FREE', 'STORY_PACK'],
      default: 'FREE',
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'inactive', 'cancelled'],
      default: 'active',
    },
    billingPeriodStart: Date,
    billingPeriodEnd: Date,

    // Writing Statistics
    totalStoriesCreated: {
      type: Number,
      default: 0,
    },
    storiesCreatedThisMonth: {
      type: Number,
      default: 0,
    },
    assessmentUploadsThisMonth: {
      type: Number,
      default: 0,
    },
    competitionEntriesThisMonth: {
      type: Number,
      default: 0,
    },
    totalWordsWritten: {
      type: Number,
      default: 0,
    },
    writingStreak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: Date,
    lastMonthlyReset: Date,
    totalTimeWriting: {
      type: Number,
      default: 0,
    },

    // Purchase History - SCHEMA FIELD FOR STRIPE WEBHOOKS
    purchaseHistory: [
      {
        type: {
          type: String,
          enum: ['story_pack', 'individual_story', 'story_purchase'],
          required: true,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        stripePaymentId: {
          type: String,
        },
        stripeSessionId: {
          type: String,
        },
        paymentStatus: {
          type: String,
          enum: ['pending', 'completed', 'failed'],
          required: true,
          default: 'completed',
        },
        itemDetails: {
          storyId: {
            type: Schema.Types.ObjectId,
            ref: 'StorySession',
          },
          storyTitle: { type: String },
          storiesAdded: { type: Number },
          assessmentsAdded: { type: Number },
        },
        purchaseDate: {
          type: Date,
          required: true,
          default: Date.now,
        },
      },
    ],

    // Monthly Limits (for stacking purchases)
    monthlyLimits: {
      freestyleStories: {
        type: Number,
        default: 3,
      },
      assessmentRequests: {
        type: Number,
        default: 9,
      },
      competitionEntries: {
        type: Number,
        default: 3,
      },
    },

    // Monthly reset tracking
    currentMonth: {
      type: String,
      default: () => new Date().toISOString().slice(0, 7), // "YYYY-MM"
    },

    // User Preferences
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'dark',
      },
      language: {
        type: String,
        default: 'en',
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      soundEffects: {
        type: Boolean,
        default: true,
      },
      autoSave: {
        type: Boolean,
        default: true,
      },
    },

    // Password reset
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // Relationships
    assignedMentor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ subscriptionTier: 1, subscriptionStatus: 1 });
UserSchema.index({ 'purchaseHistory.stripeSessionId': 1 });
UserSchema.index({ 'purchaseHistory.purchaseDate': -1 });

export default mongoose.models?.User ||
  mongoose.model<IUser>('User', UserSchema);
