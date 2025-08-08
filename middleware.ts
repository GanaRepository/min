// Updated middleware.ts - Use New Limits System
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { checkRateLimit, checkMonthlyUsage } from '@/lib/rate-limiter';

// Define paths that are publicly accessible
const publicPaths = [
  '/',
  '/about',
  '/contact',
  '/pricing', // Updated pricing page
  '/competitions', // New competitions page
  '/stories/public', // Public stories
  '/login',
  '/login/child',
  '/login/mentor',
  '/admin/login',
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
  return /\.(jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot|webp|mp4|webm|pdf)$/.test(
    path
  );
}

// Helper for public API paths
function isPublicApiPath(path: string): boolean {
  return (
    path.startsWith('/api/auth/') ||
    path.startsWith('/api/contact') ||
    path.startsWith('/api/stripe/webhook') || // Stripe webhooks must be public
    path.startsWith('/api/cron/') || // Cron jobs
    path.startsWith('/api/competitions/current') || // Public competition info
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
    path.startsWith('/admin/') ||
    (path.startsWith('/api/') && !isPublicApiPath(path))
  );
}

// Helper for cleaner logging
function logMiddleware(
  level: 'info' | 'warn' | 'error',
  message: string,
  extra?: any
) {
  const emoji = level === 'info' ? '🔍' : level === 'warn' ? '⚠️' : '❌';
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `${emoji} [MW] ${message}`,
      extra ? JSON.stringify(extra, null, 2) : ''
    );
  }
}

export async function middleware(request: NextRequest) {
  const { pathname: path } = request.nextUrl;

  // Skip middleware for static files and Next.js internals
  if (isStaticFile(path) || path.startsWith('/_next/') || path.startsWith('/favicon')) {
    return NextResponse.next();
  }

  // Skip middleware for public API paths
  if (isPublicApiPath(path)) {
    logMiddleware('info', `Public API access: ${path}`);
    return NextResponse.next();
  }

  // Skip middleware for public paths
  if (publicPaths.includes(path)) {
    logMiddleware('info', `Public path access: ${path}`);
    return NextResponse.next();
  }

  // Get session token
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const isAuthenticated = !!token;
  const userRole = token?.role;
  const userId = token?.id;

  logMiddleware('info', `Auth Status`, {
    path,
    role: userRole,
    authenticated: isAuthenticated,
    userId: userId ? `${userId.substring(0, 8)}...` : 'none',
  });

  // ===== RATE LIMITING FOR AUTHENTICATED USERS =====
  if (token?.id) {
    // Rate limiting for story creation
    if (path.startsWith('/create-stories') && request.method === 'GET') {
      const usageCheck = await checkMonthlyUsage(token.id, 'story-create');
      if (!usageCheck.allowed) {
        logMiddleware(
          'warn',
          `Monthly limit exceeded: story creation for user ${token.id.substring(0, 8)}...`
        );
        return NextResponse.redirect(
          new URL('/children-dashboard?error=story-limit', request.url)
        );
      }
    }

    // Rate limiting for API calls
    if (path.startsWith('/api/stories/create-session')) {
      const usageCheck = await checkMonthlyUsage(token.id, 'story-create');
      if (!usageCheck.allowed) {
        logMiddleware(
          'warn',
          `API rate limit exceeded: story creation for user ${token.id.substring(0, 8)}...`
        );
        return NextResponse.json(
          { error: usageCheck.message },
          { status: 429 }
        );
      }
    }

    // Rate limiting for assessment uploads
    if (path.startsWith('/api/stories/upload')) {
      const usageCheck = await checkMonthlyUsage(token.id, 'story-upload');
      if (!usageCheck.allowed) {
        logMiddleware(
          'warn',
          `API rate limit exceeded: story upload for user ${token.id.substring(0, 8)}...`
        );
        return NextResponse.json(
          { error: usageCheck.message },
          { status: 429 }
        );
      }
    }

    // Rate limiting for competition submissions
    if (path.startsWith('/api/competitions/submit')) {
      const usageCheck = await checkMonthlyUsage(token.id, 'competition-submit');
      if (!usageCheck.allowed) {
        logMiddleware(
          'warn',
          `API rate limit exceeded: competition submit for user ${token.id.substring(0, 8)}...`
        );
        return NextResponse.json(
          { error: usageCheck.message },
          { status: 429 }
        );
      }
    }
  }

  // ===== ADMIN ROUTES =====
  if (
    path.startsWith('/admin-dashboard') ||
    path.startsWith('/admin/') ||
    path.startsWith('/api/admin/')
  ) {
    if (!isAuthenticated) {
      logMiddleware('warn', `Unauthenticated admin access attempt: ${path}`);
      return NextResponse.redirect(new URL('/login/admin', request.url));
    }

    if (userRole !== 'admin') {
      logMiddleware('warn', `Non-admin access attempt to admin area by ${userRole}: ${path}`);
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    logMiddleware('info', `Admin access granted: ${path}`);
    return NextResponse.next();
  }

  // ===== MENTOR ROUTES =====
  if (
    path.startsWith('/mentor-dashboard') ||
    path.startsWith('/api/mentor/')
  ) {
    if (!isAuthenticated) {
      logMiddleware('warn', `Unauthenticated mentor access attempt: ${path}`);
      return NextResponse.redirect(new URL('/login/mentor', request.url));
    }

    if (userRole !== 'mentor' && userRole !== 'admin') {
      logMiddleware('warn', `Non-mentor access attempt to mentor area by ${userRole}: ${path}`);
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    logMiddleware('info', `Mentor access granted: ${path}`);
    return NextResponse.next();
  }

  // ===== CHILDREN ROUTES =====
  if (
    path.startsWith('/children-dashboard') ||
    path.startsWith('/create-stories') ||
    path.startsWith('/api/user/') ||
    path.startsWith('/api/stories/') ||
    path.startsWith('/api/assessments/') ||
    path.startsWith('/api/competitions/check-eligibility') ||
    path.startsWith('/api/competitions/submit')
  ) {
    if (!isAuthenticated) {
      logMiddleware('warn', `Unauthenticated child access attempt: ${path}`);
      return NextResponse.redirect(new URL('/login/child', request.url));
    }

    if (userRole !== 'child' && userRole !== 'admin') {
      logMiddleware('warn', `Non-child access attempt to child area by ${userRole}: ${path}`);
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    logMiddleware('info', `Child access granted: ${path}`);
    return NextResponse.next();
  }

  // ===== PAYMENT ROUTES (Stripe) =====
  if (
    path.startsWith('/api/stripe/checkout') ||
    path.startsWith('/api/user/purchase-history')
  ) {
    if (!isAuthenticated) {
      logMiddleware('warn', `Unauthenticated payment access attempt: ${path}`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logMiddleware('info', `Payment access granted: ${path}`);
    return NextResponse.next();
  }

  // ===== DEFAULT: ALLOW ACCESS =====
  logMiddleware('info', `Default access granted: ${path}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};