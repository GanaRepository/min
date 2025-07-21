// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define paths that are publicly accessible
const publicPaths = [
  '/',
  '/about-us',
  '/contact-us',
  '/terms-of-service',
  '/privacy-policy',
  '/create-stories', // Public story creation page
  '/login',
  '/login/child',
  '/login/mentor',
  '/login/admin',
  '/register',
  '/register/child',
  '/register/mentor',
  '/forgot-password',
  '/reset-password',
  '/logout',
  '/unauthorized',
  '/auth/error',
];

// Helper function to check file extensions
function isStaticFile(path: string): boolean {
  return /\.(jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot|webp|mp4|webm|pdf)$/.test(path);
}

// Helper for public API paths
function isPublicApiPath(path: string): boolean {
  return (
    path.startsWith('/api/auth/') ||
    path.startsWith('/api/contact') ||
    path.startsWith('/api/files') ||
    path.startsWith('/api/stories/create-session') || // Allow story creation for guests
    path.includes('favicon') ||
    path.startsWith('/_next/') ||
    path.startsWith('/api/_next/')
  );
}

// Helper to check if path requires authentication
function requiresAuth(path: string): boolean {
  return (
    path.startsWith('/children-dashboard') ||
    path.startsWith('/mentor-dashboard') ||
    path.startsWith('/admin-dashboard') ||
    path.startsWith('/api/stories/') && !path.includes('create-session') ||
    path.startsWith('/api/user/') ||
    path.startsWith('/api/admin/') ||
    path.startsWith('/api/mentor/')
  );
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip middleware for static files and Next.js internals
  if (isStaticFile(path) || path.startsWith('/_next/')) {
    return NextResponse.next();
  }

  console.log(`🔍 Middleware checking path: ${path}`);

  // Public paths are always accessible
  if (publicPaths.includes(path) || isPublicApiPath(path)) {
    console.log(`✅ Public path allowed: ${path}`);
    return NextResponse.next();
  }

  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const userRole = token?.role || 'none';
    const userId = token?.id || 'none';
    
    console.log(`🔐 PATH: ${path}, ROLE: ${userRole}, USER_ID: ${userId}`);

    // ===== ADMIN ROUTES =====
    if (path.startsWith('/admin-dashboard') || path.startsWith('/api/admin/')) {
      if (!token) {
        console.log(`❌ Unauthenticated admin access attempt: ${path}`);
        return NextResponse.redirect(new URL('/login/admin', request.url));
      }

      if (token.role !== 'admin') {
        console.log(`❌ NON-ADMIN (${token.role}) tried to access: ${path}`);
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      console.log(`✅ Admin access granted: ${path}`);
      return NextResponse.next();
    }

    // ===== MENTOR ROUTES =====
    if (path.startsWith('/mentor-dashboard') || path.startsWith('/api/mentor/')) {
      if (!token) {
        console.log(`❌ Unauthenticated mentor access attempt: ${path}`);
        return NextResponse.redirect(new URL('/login/mentor', request.url));
      }

      if (token.role !== 'mentor' && token.role !== 'admin') {
        console.log(`❌ NON-MENTOR (${token.role}) tried to access: ${path}`);
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      console.log(`✅ Mentor access granted: ${path}`);
      return NextResponse.next();
    }

    // ===== CHILDREN DASHBOARD ROUTES =====
    if (path.startsWith('/children-dashboard')) {
      if (!token) {
        console.log(`❌ Unauthenticated child dashboard access: ${path}`);
        // Store the intended destination for redirect after login
        const callbackUrl = encodeURIComponent(path);
        return NextResponse.redirect(new URL(`/login/child?callbackUrl=${callbackUrl}`, request.url));
      }

      if (token.role !== 'child' && token.role !== 'admin') {
        console.log(`❌ NON-CHILD (${token.role}) tried to access children dashboard: ${path}`);
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      // Check if user account is active
      if (token.isActive === false) {
        console.log(`❌ Inactive child account tried to access: ${path}`);
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      console.log(`✅ Child dashboard access granted: ${path}`);
      return NextResponse.next();
    }

    // ===== STORY API ROUTES (Protected) =====
    if (path.startsWith('/api/stories/') && !path.includes('create-session')) {
      if (!token) {
        console.log(`❌ Unauthenticated API access: ${path}`);
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      // Most story APIs are for children, but allow admins too
      if (token.role !== 'child' && token.role !== 'admin') {
        console.log(`❌ Invalid role for story API: ${token.role} trying to access ${path}`);
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      console.log(`✅ Story API access granted: ${path}`);
      return NextResponse.next();
    }

    // ===== USER API ROUTES =====
    if (path.startsWith('/api/user/')) {
      if (!token) {
        console.log(`❌ Unauthenticated user API access: ${path}`);
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      console.log(`✅ User API access granted: ${path}`);
      return NextResponse.next();
    }

    // ===== REDIRECT AUTHENTICATED USERS FROM AUTH PAGES =====
    if (token && (
      path.startsWith('/login/') || 
      path.startsWith('/register/') ||
      path === '/login' ||
      path === '/register'
    )) {
      console.log(`🔄 Authenticated user (${token.role}) accessing auth page, redirecting to dashboard`);
      
      // Redirect to appropriate dashboard based on role
      switch (token.role) {
        case 'child':
          return NextResponse.redirect(new URL('/children-dashboard', request.url));
        case 'mentor':
          return NextResponse.redirect(new URL('/mentor-dashboard', request.url));
        case 'admin':
          return NextResponse.redirect(new URL('/admin-dashboard', request.url));
        default:
          return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // ===== SUBSCRIPTION ENFORCEMENT =====
    if (path.startsWith('/children-dashboard/story/') && token?.role === 'child') {
      // Check if user has exceeded their story limit
      // This would require a database call, so we'll handle it in the page component
      // But we can add rate limiting here if needed
      console.log(`📊 Story access for user: ${userId}, tier: ${token.subscriptionTier || 'FREE'}`);
    }

    // ===== DEFAULT BEHAVIOR =====
    // If the path requires authentication but user is not authenticated
    if (requiresAuth(path) && !token) {
      console.log(`❌ Authentication required for: ${path}`);
      const callbackUrl = encodeURIComponent(path);
      return NextResponse.redirect(new URL(`/login/child?callbackUrl=${callbackUrl}`, request.url));
    }

    // If path is not specifically handled, allow access
    console.log(`✅ Default access granted: ${path}`);
    return NextResponse.next();

  } catch (error) {
    console.error('❌ Middleware error:', error);
    
    // If it's an API route, return JSON error
    if (path.startsWith('/api/')) {
      return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 500 });
    }
    
    // For page routes, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|images|icons).*)',
  ],
};

// Additional helper functions for future expansion

/**
 * Check if user has permission to access a specific story
 * This would be called from API routes for additional security
 */
export function hasStoryAccess(userRole: string, userId: string, storyOwnerId: string): boolean {
  // Admins can access all stories
  if (userRole === 'admin') return true;
  
  // Users can only access their own stories
  if (userRole === 'child' && userId === storyOwnerId) return true;
  
  // Mentors can access stories of their assigned children
  // This would require checking the mentor-child relationship in the database
  
  return false;
}

/**
 * Rate limiting helper (can be expanded)
 */
export function checkRateLimit(userId: string, action: string): boolean {
  // Implement rate limiting logic here
  // For now, always return true
  return true;
}

/**
 * Subscription limit checker
 */
export function checkSubscriptionLimits(tier: string, currentUsage: number): boolean {
  const limits = {
    FREE: 50,
    BASIC: 100,
    PREMIUM: 200,
    PRO: 300
  };
  
  return currentUsage < (limits[tier as keyof typeof limits] || limits.FREE);
}