// import 'next-auth';

// export type UserRole = 'child' | 'mentor' | 'admin';

// declare module 'next-auth' {
//   interface Session {
//     user: {
//       id: string;
//       email: string;
//       role: UserRole;
//       firstName: string;
//       lastName: string;
//       age?: number;
//       school?: string;
//       isActive: boolean;
//       subscriptionTier: string;
//       subscriptionStatus: string;
//       assignedMentor?: string;
//       createdBy?: string;
//     };
//   }

//   interface User {
//     id: string;
//     email: string;
//     role: UserRole;
//     firstName: string;
//     lastName: string;
//     age?: number;
//     school?: string;
//     isActive: boolean;
//     subscriptionTier?: string;
//     subscriptionStatus?: string;
//     assignedMentor?: string;
//     createdBy?: string;
//   }
// }

// declare module 'next-auth/jwt' {
//   interface JWT {
//     id: string;
//     email: string;
//     role: UserRole;
//     firstName: string;
//     lastName: string;
//     age?: number;
//     school?: string;
//     isActive: boolean;
//     subscriptionTier?: string;
//     subscriptionStatus?: string;
//     assignedMentor?: string;
//     createdBy?: string;
//   }
// }

import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    role: 'child' | 'mentor' | 'admin'
    age?: number
    school?: string
    isActive: boolean
    subscriptionTier: string
    subscriptionStatus: string
    isVerified: boolean
    assignedMentor?: string
    createdBy?: string
  }

  interface Session {
    user: User
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: 'child' | 'mentor' | 'admin'
    firstName?: string
    lastName?: string
    age?: number
    school?: string
    isActive?: boolean
    subscriptionTier?: string
    subscriptionStatus?: string
    isVerified?: boolean
    assignedMentor?: string
    createdBy?: string
  }
}