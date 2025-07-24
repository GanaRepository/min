import { Document, Types } from 'mongoose';
import { DefaultSession } from 'next-auth';

export type UserRole = 'admin' | 'mentor' | 'child';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  age?: number; // For children only
  school?: string; // For children only
  role: UserRole;
  isActive: boolean;

  // Subscription fields - ADDED to match your User model
  subscriptionTier: 'FREE' | 'BASIC' | 'PREMIUM';
  subscriptionStatus: 'active' | 'inactive' | 'cancelled';
  billingPeriodStart?: Date;
  billingPeriodEnd?: Date;

  // Writing Statistics - ADDED to match your User model
  totalStoriesCreated: number;
  storiesCreatedThisMonth: number;
  totalWordsWritten: number;
  writingStreak: number;
  lastActiveDate?: Date;
  totalTimeWriting: number;

  // User Preferences - ADDED to match your User model
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    emailNotifications: boolean;
    soundEffects: boolean;
    autoSave: boolean;
  };

  createdBy?: Types.ObjectId; // For mentors (created by admin)
  assignedMentor?: Types.ObjectId; // For children (assigned mentor)
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISession {
  user: {
    id: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    age?: number;
    school?: string;
    isActive: boolean;
    subscriptionTier: string;
    subscriptionStatus: string;
    assignedMentor?: string;
    createdBy?: string;
  };
  expires: string;
}

export interface ILoginCredentials {
  email: string;
  password: string;
}

export interface IRegisterChild {
  firstName: string;
  lastName: string;
  email: string;
  age: string; // String from form, will be converted to number
  school: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface ICreateMentor {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  createdBy: string; // Admin ID who creates the mentor
}

export interface IChildProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  school: string;
  assignedMentor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: Date;
}

export interface IMentorProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  assignedChildren: IChildProfile[];
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: Date;
}

// Extend NextAuth types to fix TypeScript errors - UPDATED to match your User model
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      role: UserRole;
      firstName: string;
      lastName: string;
      age?: number;
      school?: string;
      isActive: boolean;
      subscriptionTier: string;
      subscriptionStatus: string;
      assignedMentor?: string;
      createdBy?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    age?: number;
    school?: string;
    isActive: boolean;
    subscriptionTier?: string;
    subscriptionStatus?: string;
    assignedMentor?: string;
    createdBy?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    age?: number;
    school?: string;
    isActive: boolean;
    subscriptionTier?: string;
    subscriptionStatus?: string;
    assignedMentor?: string;
    createdBy?: string;
  }
}
