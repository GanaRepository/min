// import { NextAuthOptions } from 'next-auth';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import bcrypt from 'bcryptjs';
// import { connectToDatabase } from '@/utils/db';
// import User from '@/models/User';

// export const authOptions: NextAuthOptions = {
//   providers: [
//     CredentialsProvider({
//       name: 'credentials',
//       credentials: {
//         email: { label: 'Email', type: 'email' },
//         password: { label: 'Password', type: 'password' },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           throw new Error('Email and password are required');
//         }

//         try {
//           await connectToDatabase();

//           const user = await User.findOne({
//             email: credentials.email.toLowerCase(),
//           }).select('+password');

//           if (!user) {
//             throw new Error('Invalid email or password');
//           }

//           if (!user.isActive) {
//             throw new Error('Account is deactivated. Please contact support.');
//           }

//           const isValidPassword = await bcrypt.compare(
//             credentials.password,
//             user.password
//           );

//           if (!isValidPassword) {
//             throw new Error('Invalid email or password');
//           }

//           // Update last active date
//           await User.findByIdAndUpdate(user._id, {
//             lastActiveDate: new Date(),
//           });

//           // Return user object that matches NextAuth User interface
//           return {
//             id: user._id.toString(),
//             email: user.email,
//             firstName: user.firstName,
//             lastName: user.lastName,
//             role: user.role,
//             age: user.age,
//             school: user.school,
//             isActive: user.isActive,
//             subscriptionTier: user.subscriptionTier || 'FREE',
//             subscriptionStatus: user.subscriptionStatus || 'active',
//           };
//         } catch (error) {
//           console.error('Authentication error:', error);
//           throw error;
//         }
//       },
//     }),
//   ],
//   session: {
//     strategy: 'jwt',
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//   },
//   jwt: {
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//   },
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.role = user.role;
//         token.firstName = user.firstName;
//         token.lastName = user.lastName;
//         token.age = user.age;
//         token.school = user.school;
//         token.isActive = user.isActive;
//         token.subscriptionTier = user.subscriptionTier;
//         token.subscriptionStatus = user.subscriptionStatus;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (token && session.user) {
//         session.user.id = token.id as string;
//         session.user.role = token.role as any;
//         session.user.firstName = token.firstName as string;
//         session.user.lastName = token.lastName as string;
//         session.user.age = token.age as number | undefined;
//         session.user.school = token.school as string | undefined;
//         session.user.isActive = token.isActive as boolean;
//         session.user.subscriptionTier = token.subscriptionTier as string;
//         session.user.subscriptionStatus = token.subscriptionStatus as string;
//       }
//       return session;
//     },
//     async redirect({ url, baseUrl }) {
//       console.log('🔄 Auth redirect called with:', { url, baseUrl });

//       // If there's a callbackUrl in the URL, use it
//       if (url.includes('callbackUrl=')) {
//         const urlParams = new URLSearchParams(url.split('?')[1]);
//         const callbackUrl = urlParams.get('callbackUrl');
//         if (callbackUrl) {
//           const decodedCallbackUrl = decodeURIComponent(callbackUrl);
//           console.log('✅ Using callbackUrl:', decodedCallbackUrl);
//           return decodedCallbackUrl;
//         }
//       }

//       // If URL is relative, prepend baseUrl
//       if (url.startsWith('/')) {
//         const fullUrl = `${baseUrl}${url}`;
//         console.log('✅ Using relative URL:', fullUrl);
//         return fullUrl;
//       }

//       // If URL is on the same origin, allow it
//       try {
//         if (new URL(url).origin === baseUrl) {
//           console.log('✅ Using same origin URL:', url);
//           return url;
//         }
//       } catch (e) {
//         console.log('❌ URL parsing failed for:', url);
//       }

//       // Default redirect to create-stories for fresh element selection
//       const defaultUrl = `${baseUrl}/create-stories`;
//       console.log('✅ Using default redirect:', defaultUrl);
//       return defaultUrl;
//     },
//   },
//   pages: {
//     signIn: '/login',
//     error: '/login',
//   },
//   secret: process.env.NEXTAUTH_SECRET,
//   debug: process.env.NODE_ENV === 'development',
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

          // Return user object with EXPLICIT TYPE
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
            isVerified: user.isVerified || false,
            assignedMentor: user.assignedMentor?.toString(),
            createdBy: user.createdBy?.toString(),
          } as any; // FORCE IT
        } catch (error) {
          console.error('Authentication error:', error);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as any; // FORCE IT
        token.id = u.id;
        token.role = u.role;
        token.firstName = u.firstName;
        token.lastName = u.lastName;
        token.age = u.age;
        token.school = u.school;
        token.isActive = u.isActive;
        token.subscriptionTier = u.subscriptionTier;
        token.subscriptionStatus = u.subscriptionStatus;
        token.isVerified = u.isVerified;
        token.assignedMentor = u.assignedMentor;
        token.createdBy = u.createdBy;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id || '';
        (session.user as any).role = token.role || 'child';
        (session.user as any).firstName = token.firstName || '';
        (session.user as any).lastName = token.lastName || '';
        (session.user as any).age = token.age;
        (session.user as any).school = token.school;
        (session.user as any).isActive = token.isActive ?? true;
        (session.user as any).subscriptionTier = token.subscriptionTier || 'FREE';
        (session.user as any).subscriptionStatus = token.subscriptionStatus || 'active';
        (session.user as any).isVerified = token.isVerified ?? false; // THIS IS THE IMPORTANT ONE
        (session.user as any).assignedMentor = token.assignedMentor;
        (session.user as any).createdBy = token.createdBy;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log('🔄 Auth redirect called with:', { url, baseUrl });

      if (url.includes('callbackUrl=')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const callbackUrl = urlParams.get('callbackUrl');
        if (callbackUrl) {
          const decodedCallbackUrl = decodeURIComponent(callbackUrl);
          console.log('✅ Using callbackUrl:', decodedCallbackUrl);
          return decodedCallbackUrl;
        }
      }

      if (url.startsWith('/')) {
        const fullUrl = `${baseUrl}${url}`;
        console.log('✅ Using relative URL:', fullUrl);
        return fullUrl;
      }

      try {
        if (new URL(url).origin === baseUrl) {
          console.log('✅ Using same origin URL:', url);
          return url;
        }
      } catch (e) {
        console.log('❌ URL parsing failed for:', url);
      }

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