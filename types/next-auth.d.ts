// types/next-auth.d.ts

import 'next-auth';
import { UserRole } from './auth';

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
      assignedMentor?: string;
      createdBy?: string; // Add this for mentors
    };
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
    assignedMentor?: string;
    createdBy?: string; // Add this for mentors
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    age?: number;
    school?: string;
    isActive: boolean;
    assignedMentor?: string;
    createdBy?: string; // Add this for mentors
  }
}
