// // utils/authOptions.ts
// import { NextAuthOptions } from 'next-auth';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import bcrypt from 'bcryptjs';
// import User from '@/models/User';
// import { connectToDatabase } from '@/utils/db';
// import { UserRole } from '@/types/auth';

// export const authOptions: NextAuthOptions = {
//   providers: [
//     CredentialsProvider({
//       id: 'credentials',
//       name: 'Credentials',
//       credentials: {
//         email: { label: 'Email', type: 'text' },
//         password: { label: 'Password', type: 'password' },
//       },
//       async authorize(credentials, req) {
//         if (!credentials?.email || !credentials?.password) {
//           throw new Error('Email and password are required');
//         }

//         try {
//           await connectToDatabase();

//           // Find user by email - simplified query first
//           const user = await User.findOne({
//             email: credentials.email.toLowerCase(),
//           });

//           if (!user) {
//             console.log('User not found:', credentials.email);
//             throw new Error('Invalid email or password');
//           }

//           console.log('User found:', {
//             email: user.email,
//             role: user.role,
//             isActive: user.isActive,
//           });

//           const isPasswordValid = await bcrypt.compare(
//             credentials.password,
//             user.password
//           );

//           if (!isPasswordValid) {
//             console.log('Invalid password for user:', credentials.email);
//             throw new Error('Invalid email or password');
//           }

//           // Check if the user is active
//           if (!user.isActive) {
//             throw new Error(
//               'Your account has been deactivated. Please contact support.'
//             );
//           }

//           // Get login path to enforce role-based access
//           const referer = req?.headers?.referer || '';
//           let expectedRole: UserRole | null = null;

//           if (referer.includes('/login/child')) {
//             expectedRole = 'child';
//           } else if (referer.includes('/login/mentor')) {
//             expectedRole = 'mentor';
//           } else if (referer.includes('/admin')) {
//             expectedRole = 'admin';
//           }

//           // Verify the expected role if determined from URL
//           if (expectedRole && user.role !== expectedRole) {
//             let correctLoginPath = '';
//             switch (user.role) {
//               case 'child':
//                 correctLoginPath = 'child login page';
//                 break;
//               case 'mentor':
//                 correctLoginPath = 'mentor login page';
//                 break;
//               case 'admin':
//                 correctLoginPath = 'admin login page';
//                 break;
//             }

//             throw new Error(
//               `This email is registered as a ${user.role} account. Please use the ${correctLoginPath}.`
//             );
//           }

//           console.log('Login successful for:', credentials.email);

//           // Return user data
//           const userData = {
//             id: user._id.toString(),
//             email: user.email,
//             role: user.role as UserRole,
//             firstName: user.firstName,
//             lastName: user.lastName,
//             isActive: user.isActive,
//             // Child-specific fields
//             ...(user.role === 'child' && {
//               age: user.age,
//               school: user.school,
//               assignedMentor: user.assignedMentor?.toString(),
//             }),
//             // Mentor-specific fields
//             ...(user.role === 'mentor' && {
//               createdBy: user.createdBy?.toString(),
//             }),
//           };

//           return userData;
//         } catch (error) {
//           console.error('Auth error:', error);
//           throw error;
//         }
//       },
//     }),
//   ],

//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.role = user.role;
//         token.firstName = user.firstName;
//         token.lastName = user.lastName;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (token && session.user) {
//         // Fix the type casting here
//         (session.user as any).role = token.role as UserRole;
//         (session.user as any).firstName = token.firstName as string;
//         (session.user as any).lastName = token.lastName as string;
//         (session.user as any).id = token.sub as string;
//       }
//       return session;
//     },
//     async redirect({ url, baseUrl }) {
//       // Handle redirects after authentication

//       // If there's a callbackUrl in the URL, use it
//       if (url.includes('callbackUrl=')) {
//         const urlParams = new URLSearchParams(url.split('?')[1]);
//         const callbackUrl = urlParams.get('callbackUrl');
//         if (callbackUrl) {
//           return decodeURIComponent(callbackUrl);
//         }
//       }

//       // If URL is relative, prepend baseUrl
//       if (url.startsWith('/')) {
//         return `${baseUrl}${url}`;
//       }

//       // If URL is on the same origin, allow it
//       if (new URL(url).origin === baseUrl) {
//         return url;
//       }

//       // Default redirect for different roles
//       // For direct logins without callbackUrl, redirect to create-stories
//       return `${baseUrl}/create-stories`;
//     },
//   },

//   pages: {
//     signIn: '/login/child',
//     error: '/auth/error',
//   },
//   session: {
//     strategy: 'jwt',
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//   },
//   debug: process.env.NODE_ENV === 'development',
//   secret: process.env.NEXTAUTH_SECRET,
// };

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          await connectToDatabase();

          const user = await User.findOne({
            email: credentials.email.toLowerCase(),
          }).select('+password');

          if (!user) {
            throw new Error('Invalid email or password');
          }

          if (!user.isActive) {
            throw new Error('Account is deactivated. Please contact support.');
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValidPassword) {
            throw new Error('Invalid email or password');
          }

          // Update last active date
          await User.findByIdAndUpdate(user._id, {
            lastActiveDate: new Date(),
          });

          // Return user object that matches NextAuth User interface
          return {
            id: user._id.toString(),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            age: user.age,
            school: user.school,
            isActive: user.isActive,
            subscriptionTier: user.subscriptionTier || 'FREE',
            subscriptionStatus: user.subscriptionStatus || 'active',
          };
        } catch (error) {
          console.error('Authentication error:', error);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.age = user.age;
        token.school = user.school;
        token.isActive = user.isActive;
        token.subscriptionTier = user.subscriptionTier;
        token.subscriptionStatus = user.subscriptionStatus;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.age = token.age as number | undefined;
        session.user.school = token.school as string | undefined;
        session.user.isActive = token.isActive as boolean;
        session.user.subscriptionTier = token.subscriptionTier as string;
        session.user.subscriptionStatus = token.subscriptionStatus as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log('🔄 Auth redirect called with:', { url, baseUrl });

      // If there's a callbackUrl in the URL, use it
      if (url.includes('callbackUrl=')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const callbackUrl = urlParams.get('callbackUrl');
        if (callbackUrl) {
          const decodedCallbackUrl = decodeURIComponent(callbackUrl);
          console.log('✅ Using callbackUrl:', decodedCallbackUrl);
          return decodedCallbackUrl;
        }
      }

      // If URL is relative, prepend baseUrl
      if (url.startsWith('/')) {
        const fullUrl = `${baseUrl}${url}`;
        console.log('✅ Using relative URL:', fullUrl);
        return fullUrl;
      }

      // If URL is on the same origin, allow it
      try {
        if (new URL(url).origin === baseUrl) {
          console.log('✅ Using same origin URL:', url);
          return url;
        }
      } catch (e) {
        console.log('❌ URL parsing failed for:', url);
      }

      // Default redirect to create-stories for fresh element selection
      const defaultUrl = `${baseUrl}/create-stories`;
      console.log('✅ Using default redirect:', defaultUrl);
      return defaultUrl;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
