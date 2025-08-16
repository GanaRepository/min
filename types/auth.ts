// types/auth.ts - FINAL CLEAN VERSION (NO CONFLICTING INTERFACES)
import { DefaultSession } from 'next-auth';

export type UserRole = 'admin' | 'mentor' | 'child';

// REMOVED: IUser interface - now only exists in models/User.ts

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

// Extend NextAuth types to fix TypeScript errors
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