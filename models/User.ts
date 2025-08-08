// import mongoose, { Schema, Document } from 'mongoose';

// export interface IUser extends Document {
//   _id: mongoose.Types.ObjectId;
//   firstName: string;
//   lastName: string;
//   email: string;
//   password: string;
//   role: 'child' | 'mentor' | 'admin';
//   age?: number;
//   dateOfBirth?: Date;
//   grade?: string;
//   school?: string;
//   avatar?: string;
//   isActive: boolean;
//   isVerified: boolean; // Added this field

//   // Subscription fields
//   subscriptionTier: 'FREE' | 'BASIC' | 'PREMIUM';
//   subscriptionStatus: 'active' | 'inactive' | 'cancelled';
//   billingPeriodStart?: Date;
//   billingPeriodEnd?: Date;

//   // Writing Statistics
//   totalStoriesCreated: number;
//   storiesCreatedThisMonth: number;
//   totalWordsWritten: number;
//   writingStreak: number;
//   lastActiveDate?: Date;
//   totalTimeWriting: number;

//   // User Preferences
//   preferences: {
//     theme: 'light' | 'dark' | 'auto';
//     language: string;
//     emailNotifications: boolean;
//     soundEffects: boolean;
//     autoSave: boolean;
//   };

//   // Password reset fields
//   resetPasswordToken?: string | null;
//   resetPasswordExpires?: Date | null;

//   // Optional mentor/child relationship fields
//   assignedMentor?: mongoose.Types.ObjectId;
//   createdBy?: mongoose.Types.ObjectId;

//   createdAt: Date;
//   updatedAt: Date;
// }

// const UserSchema = new Schema<IUser>(
//   {
//     firstName: {
//       type: String,
//       required: true,
//       trim: true,
//       maxlength: 50,
//     },
//     lastName: {
//       type: String,
//       required: true,
//       trim: true,
//       maxlength: 50,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },
//     password: {
//       type: String,
//       required: true,
//       minlength: 6,
//     },
//     role: {
//       type: String,
//       enum: ['child', 'mentor', 'admin'],
//       required: true,
//     },
//     age: {
//       type: Number,
//       min: 2,
//       max: 18,
//     },
//     dateOfBirth: {
//       type: Date,
//     },
//     grade: {
//       type: String,
//       trim: true,
//     },
//     school: {
//       type: String,
//       trim: true,
//       maxlength: 100,
//     },
//     avatar: {
//       type: String,
//       trim: true,
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//     // Added isVerified field
//     isVerified: {
//       type: Boolean,
//       required: true,
//       default: false,
//     },

//     // Subscription fields with defaults
//     subscriptionTier: {
//       type: String,
//       enum: ['FREE', 'BASIC', 'PREMIUM'],
//       required: true,
//       default: 'FREE',
//     },
//     subscriptionStatus: {
//       type: String,
//       enum: ['active', 'inactive', 'cancelled'],
//       required: true,
//       default: 'active',
//     },
//     billingPeriodStart: {
//       type: Date,
//     },
//     billingPeriodEnd: {
//       type: Date,
//     },

//     // Writing Statistics - ALL REQUIRED with defaults
//     totalStoriesCreated: {
//       type: Number,
//       required: true,
//       default: 0,
//       min: 0,
//     },
//     storiesCreatedThisMonth: {
//       type: Number,
//       required: true,
//       default: 0,
//       min: 0,
//     },
//     totalWordsWritten: {
//       type: Number,
//       required: true,
//       default: 0,
//       min: 0,
//     },
//     writingStreak: {
//       type: Number,
//       required: true,
//       default: 0,
//       min: 0,
//     },
//     lastActiveDate: {
//       type: Date,
//     },
//     totalTimeWriting: {
//       type: Number,
//       required: true,
//       default: 0,
//       min: 0,
//     },

//     // User Preferences - ALL REQUIRED with defaults
//     preferences: {
//       theme: {
//         type: String,
//         enum: ['light', 'dark', 'auto'],
//         required: true,
//         default: 'dark',
//       },
//       language: {
//         type: String,
//         required: true,
//         default: 'en',
//       },
//       emailNotifications: {
//         type: Boolean,
//         required: true,
//         default: true,
//       },
//       soundEffects: {
//         type: Boolean,
//         required: true,
//         default: true,
//       },
//       autoSave: {
//         type: Boolean,
//         required: true,
//         default: true,
//       },
//     },

//     // Password reset fields
//     resetPasswordToken: {
//       type: String,
//       default: null,
//     },
//     resetPasswordExpires: {
//       type: Date,
//       default: null,
//     },

//     // Optional relationship fields
//     assignedMentor: {
//       type: Schema.Types.ObjectId,
//       ref: 'User',
//     },
//     createdBy: {
//       type: Schema.Types.ObjectId,
//       ref: 'User',
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Indexes
// UserSchema.index({ role: 1, isActive: 1 });
// UserSchema.index({ subscriptionTier: 1, subscriptionStatus: 1 });
// UserSchema.index({ email: 1, isVerified: 1 }); // Added index for verification queries
// UserSchema.index({ isActive: 1, isVerified: 1 }); // Added compound index

// export default mongoose.models.User ||
//   mongoose.model<IUser>('User', UserSchema);

// models/User.ts - UPDATED with new pay-per-use fields
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'child' | 'mentor' | 'admin';
  age?: number;
  dateOfBirth?: Date;
  grade?: string;
  school?: string;
  avatar?: string;
  isActive: boolean;
  isVerified: boolean;

  // LEGACY Subscription fields (keep for migration compatibility)
  subscriptionTier: 'FREE' | 'BASIC' | 'PREMIUM';
  subscriptionStatus: 'active' | 'inactive' | 'cancelled';
  billingPeriodStart?: Date;
  billingPeriodEnd?: Date;

  // Writing Statistics
  totalStoriesCreated: number;
  storiesCreatedThisMonth: number;
  totalWordsWritten: number;
  writingStreak: number;
  lastActiveDate?: Date;
  totalTimeWriting: number;

  // NEW: Monthly Usage Tracking (Pay-per-use system)
  assessmentUploadsThisMonth: number;
  competitionEntriesThisMonth: number;
  lastMonthlyReset: Date;

  // NEW: Purchase Tracking
  purchaseHistory: Array<{
    type: 'story_pack' | 'story_publication';
    amount: number;
    stripePaymentId: string;
    purchaseDate: Date;
    itemsAdded: number;
    metadata?: {
      storyId?: mongoose.Types.ObjectId;
      storiesAdded?: number;
      assessmentsAdded?: number;
    };
  }>;

  // NEW: Assessment Attempts Per Story (Map: storyId -> attemptCount)
  assessmentAttempts: Map<string, number>;

  // User Preferences
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    emailNotifications: boolean;
    soundEffects: boolean;
    autoSave: boolean;
  };

  // Password reset fields
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;

  // Optional mentor/child relationship fields
  assignedMentor?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
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
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['child', 'mentor', 'admin'],
      required: true,
    },
    age: {
      type: Number,
      min: 2,
      max: 18,
    },
    dateOfBirth: {
      type: Date,
    },
    grade: {
      type: String,
      trim: true,
    },
    school: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    avatar: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },

    // LEGACY Subscription fields (keep for backward compatibility)
    subscriptionTier: {
      type: String,
      enum: ['FREE', 'BASIC', 'PREMIUM'],
      required: true,
      default: 'FREE',
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'inactive', 'cancelled'],
      required: true,
      default: 'active',
    },
    billingPeriodStart: {
      type: Date,
    },
    billingPeriodEnd: {
      type: Date,
    },

    // Writing Statistics
    totalStoriesCreated: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    storiesCreatedThisMonth: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalWordsWritten: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    writingStreak: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    lastActiveDate: {
      type: Date,
    },
    totalTimeWriting: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    // NEW: Monthly Usage Tracking Fields
    assessmentUploadsThisMonth: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    competitionEntriesThisMonth: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    lastMonthlyReset: {
      type: Date,
      required: true,
      default: Date.now,
    },

    // NEW: Purchase History
    purchaseHistory: [
      {
        type: {
          type: String,
          enum: ['story_pack', 'story_publication'],
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        stripePaymentId: {
          type: String,
          required: true,
        },
        purchaseDate: {
          type: Date,
          required: true,
          default: Date.now,
        },
        itemsAdded: {
          type: Number,
          required: true,
        },
        metadata: {
          storyId: {
            type: Schema.Types.ObjectId,
            ref: 'StorySession',
          },
          storiesAdded: Number,
          assessmentsAdded: Number,
        },
      },
    ],

    // NEW: Assessment Attempts Map (storyId -> attemptCount)
    assessmentAttempts: {
      type: Map,
      of: Number,
      default: new Map(),
    },

    // User Preferences
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        required: true,
        default: 'dark',
      },
      language: {
        type: String,
        required: true,
        default: 'en',
      },
      emailNotifications: {
        type: Boolean,
        required: true,
        default: true,
      },
      soundEffects: {
        type: Boolean,
        required: true,
        default: true,
      },
      autoSave: {
        type: Boolean,
        required: true,
        default: true,
      },
    },

    // Password reset fields
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },

    // Optional relationship fields
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
UserSchema.index({ email: 1, isVerified: 1 });
UserSchema.index({ isActive: 1, isVerified: 1 });
UserSchema.index({ lastMonthlyReset: 1 }); // NEW: For monthly reset queries

export default (mongoose.models && mongoose.models.User)
  ? mongoose.models.User as mongoose.Model<IUser>
  : mongoose.model<IUser>('User', UserSchema);
