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
  
  // ADDED: Subscription fields
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
  
  // User Preferences
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    emailNotifications: boolean;
    soundEffects: boolean;
    autoSave: boolean;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['child', 'mentor', 'admin'],
    required: true
  },
  age: {
    type: Number,
    min: 2,
    max: 18
  },
  dateOfBirth: {
    type: Date
  },
  grade: {
    type: String,
    trim: true
  },
  school: {
    type: String,
    trim: true,
    maxlength: 100
  },
  avatar: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // ADDED: Subscription fields with defaults
  subscriptionTier: {
    type: String,
    enum: ['FREE', 'BASIC', 'PREMIUM'],
    required: true,
    default: 'FREE'
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'cancelled'],
    required: true,
    default: 'active'
  },
  billingPeriodStart: {
    type: Date
  },
  billingPeriodEnd: {
    type: Date
  },
  
  // Writing Statistics - ALL REQUIRED with defaults
  totalStoriesCreated: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  storiesCreatedThisMonth: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  totalWordsWritten: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  writingStreak: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  lastActiveDate: {
    type: Date
  },
  totalTimeWriting: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  
  // User Preferences - ALL REQUIRED with defaults
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      required: true,
      default: 'dark'
    },
    language: {
      type: String,
      required: true,
      default: 'en'
    },
    emailNotifications: {
      type: Boolean,
      required: true,
      default: true
    },
    soundEffects: {
      type: Boolean,
      required: true,
      default: true
    },
    autoSave: {
      type: Boolean,
      required: true,
      default: true
    }
  }
}, {
  timestamps: true
});


UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ subscriptionTier: 1, subscriptionStatus: 1 }); 

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);