// utils/authOptions.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import { connectToDatabase } from '@/utils/db';
import { UserRole } from '@/types/auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          await connectToDatabase();

          // Find user by email - simplified query first
          const user = await User.findOne({
            email: credentials.email.toLowerCase(),
          });

          if (!user) {
            console.log('User not found:', credentials.email);
            throw new Error('Invalid email or password');
          }

          console.log('User found:', {
            email: user.email,
            role: user.role,
            isActive: user.isActive,
          });

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.log('Invalid password for user:', credentials.email);
            throw new Error('Invalid email or password');
          }

          // Check if the user is active
          if (!user.isActive) {
            throw new Error(
              'Your account has been deactivated. Please contact support.'
            );
          }

          // Get login path to enforce role-based access
          const referer = req?.headers?.referer || '';
          let expectedRole: UserRole | null = null;

          if (referer.includes('/login/child')) {
            expectedRole = 'child';
          } else if (referer.includes('/login/mentor')) {
            expectedRole = 'mentor';
          } else if (referer.includes('/admin')) {
            expectedRole = 'admin';
          }

          // Verify the expected role if determined from URL
          if (expectedRole && user.role !== expectedRole) {
            let correctLoginPath = '';
            switch (user.role) {
              case 'child':
                correctLoginPath = 'child login page';
                break;
              case 'mentor':
                correctLoginPath = 'mentor login page';
                break;
              case 'admin':
                correctLoginPath = 'admin login page';
                break;
            }

            throw new Error(
              `This email is registered as a ${user.role} account. Please use the ${correctLoginPath}.`
            );
          }

          console.log('Login successful for:', credentials.email);

          // Return user data
          const userData = {
            id: user._id.toString(),
            email: user.email,
            role: user.role as UserRole,
            firstName: user.firstName,
            lastName: user.lastName,
            isActive: user.isActive,
            // Child-specific fields
            ...(user.role === 'child' && {
              age: user.age,
              school: user.school,
              assignedMentor: user.assignedMentor?.toString(),
            }),
            // Mentor-specific fields
            ...(user.role === 'mentor' && {
              createdBy: user.createdBy?.toString(),
            }),
          };

          return userData;
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    // ADD THIS REDIRECT CALLBACK - THIS IS THE FIX!
    async redirect({ url, baseUrl }) {
      console.log('NextAuth redirect callback called:', { url, baseUrl });
      
      // If url is a relative path, make it absolute
      if (url.startsWith("/")) {
        console.log('Redirecting to relative path:', `${baseUrl}${url}`);
        return `${baseUrl}${url}`;
      }
      
      // Allow callback URLs on same origin
      if (new URL(url).origin === baseUrl) {
        console.log('Redirecting to same origin URL:', url);
        return url;
      }
      
      // Default fallback to base URL
      console.log('Fallback redirect to baseUrl:', baseUrl);
      return baseUrl;
    },
    
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as UserRole;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.isActive = token.isActive as boolean;

        // Add child-specific fields to session
        if (token.role === 'child') {
          if (token.age) session.user.age = token.age as number;
          if (token.school) session.user.school = token.school as string;
          if (token.assignedMentor)
            session.user.assignedMentor = token.assignedMentor as string;
        }

        // Add mentor-specific fields to session
        if (token.role === 'mentor') {
          if (token.createdBy)
            session.user.createdBy = token.createdBy as string;
        }
      }
      return session;
    },
    
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.isActive = user.isActive;

        // Add child-specific fields to token
        if (user.role === 'child') {
          if (user.age) token.age = user.age;
          if (user.school) token.school = user.school;
          if (user.assignedMentor) token.assignedMentor = user.assignedMentor;
        }

        // Add mentor-specific fields to token
        if (user.role === 'mentor') {
          if (user.createdBy) token.createdBy = user.createdBy;
        }
      }
      return token;
    },
  },
  pages: {
    signIn: '/login/child', // ← CHANGE THIS BACK TO /login/child
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
};