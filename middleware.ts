// middleware.ts - FIXED VERSION WITH DEBUG
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define paths that are publicly accessible
const publicPaths = [
  '/',
  '/about',
  '/contact-us',
  '/pricing',
  '/competitions',
  '/stories/public',
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
    path.startsWith('/api/stripe/webhook') ||
    path.startsWith('/api/cron/') ||
    path.startsWith('/api/competitions/current') ||
    path.includes('favicon') ||
    path.startsWith('/_next/') ||
    path.startsWith('/api/_next/')
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

  // TEMPORARY DEBUG: Add special logging for upload route
  if (path === '/api/stories/upload') {
    console.log('🔧 [MW] SPECIAL DEBUG FOR UPLOAD ROUTE');
    console.log('🔧 [MW] Request method:', request.method);
    console.log(
      '🔧 [MW] Request headers:',
      Object.fromEntries(request.headers.entries())
    );
    console.log('🔧 [MW] Will process normally...');
  }

  // Skip middleware for static files and Next.js internals
  if (
    isStaticFile(path) ||
    path.startsWith('/_next/') ||
    path.startsWith('/favicon')
  ) {
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
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;
  const userRole = token?.role;

  logMiddleware('info', `Auth Status`, {
    path,
    role: userRole,
    authenticated: isAuthenticated,
  });

  // ===== ADMIN ROUTES =====
  if (
    path.startsWith('/admin-dashboard') ||
    path.startsWith('/admin') ||
    path.startsWith('/api/admin/')
  ) {
    // Skip authentication for admin login page
    if (path === '/admin/login') {
      logMiddleware('info', `Public admin login access: ${path}`);
      return NextResponse.next();
    }

    if (!isAuthenticated) {
      logMiddleware('warn', `Unauthenticated admin access attempt: ${path}`);
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    if (userRole !== 'admin') {
      logMiddleware(
        'warn',
        `Non-admin access attempt to admin area by ${userRole}: ${path}`
      );
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    logMiddleware('info', `Admin access granted: ${path}`);
    return NextResponse.next();
  }

  // ===== MENTOR ROUTES =====
  if (path.startsWith('/mentor-dashboard') || path.startsWith('/api/mentor/')) {
    if (!isAuthenticated) {
      logMiddleware('warn', `Unauthenticated mentor access attempt: ${path}`);
      return NextResponse.redirect(new URL('/login/mentor', request.url));
    }

    if (userRole !== 'mentor') {
      logMiddleware(
        'warn',
        `Non-mentor access attempt to mentor area by ${userRole}: ${path}`
      );
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

    if (userRole !== 'child') {
      logMiddleware(
        'warn',
        `Non-child access attempt to child area by ${userRole}: ${path}`
      );
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // SPECIAL DEBUG for upload route
    if (path === '/api/stories/upload') {
      console.log('🔧 [MW] About to grant child access to upload route');
      console.log('🔧 [MW] User role:', userRole);
      console.log('🔧 [MW] Authenticated:', isAuthenticated);
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
