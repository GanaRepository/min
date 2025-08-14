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
  totalWordsWritten: number;
  writingStreak: number;
  lastActiveDate?: Date;
  totalTimeWriting: number;

  // Monthly Usage Tracking - FIXED to match dashboard requirements
  monthlyUsage: {
    stories: {
      used: number;
      limit: number;
    };
    assessments: {
      used: number;
      limit: number;
    };
    assessmentAttempts: {
      used: number;
      limit: number;
    };
    competitions: {
      used: number;
      limit: number;
    };
    publications: {
      used: number;
      limit: number;
    };
    resetDate: Date;
  };

  // Assessment attempts per story
  assessmentAttempts: Map<string, number>;

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

const UserSchema = new Schema<IUser>({
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
  totalWordsWritten: {
    type: Number,
    default: 0,
  },
  writingStreak: {
    type: Number,
    default: 0,
  },
  lastActiveDate: Date,
  totalTimeWriting: {
    type: Number,
    default: 0,
  },

  // Monthly Usage Tracking
  monthlyUsage: {
    stories: {
      used: { type: Number, default: 0 },
      limit: { type: Number, default: 3 },
    },
    assessments: {
      used: { type: Number, default: 0 },
      limit: { type: Number, default: 3 },
    },
    assessmentAttempts: {
      used: { type: Number, default: 0 },
      limit: { type: Number, default: 9 },
    },
    competitions: {
      used: { type: Number, default: 0 },
      limit: { type: Number, default: 3 },
    },
    publications: {
      used: { type: Number, default: 0 },
      limit: { type: Number, default: 1 },
    },
    resetDate: {
      type: Date,
      default: () => new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
    },
  },

  // Assessment attempts map
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
}, {
  timestamps: true,
});

// Indexes
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ subscriptionTier: 1, subscriptionStatus: 1 });

export default mongoose.models?.User || mongoose.model<IUser>('User', UserSchema);