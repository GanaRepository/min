// // middleware.ts
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import { getToken } from 'next-auth/jwt';
// import { checkRateLimit } from '@/lib/rate-limiter'; // ADDED: Import your existing rate limiter

// // Define paths that are publicly accessible
// const publicPaths = [
//   '/',
//   '/about-us',
//   '/contact-us',
//   '/terms-of-service',
//   '/privacy-policy',
//   '/create-stories', // Public story creation page
//   '/login',
//   '/login/child',
//   '/login/mentor',
//   '/login/admin',
//   '/register',
//   '/register/child',
//   '/register/mentor',
//   '/forgot-password',
//   '/reset-password',
//   '/logout',
//   '/unauthorized',
//   '/auth/error',
// ];

// // Helper function to check file extensions
// function isStaticFile(path: string): boolean {
//   return /\.(jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot|webp|mp4|webm|pdf)$/.test(
//     path
//   );
// }

// // Helper for public API paths
// function isPublicApiPath(path: string): boolean {
//   return (
//     path.startsWith('/api/auth/') ||
//     path.startsWith('/api/contact') ||
//     path.startsWith('/api/files') ||
//     path.startsWith('/api/stories/create-session') || // Allow story creation for guests
//     path.startsWith('/api/stories/store-pending-elements') || // Allow storing elements for unauthenticated users
//     path.startsWith('/api/stories/pending-elements') || // Allow retrieving pending elements
//     path.includes('favicon') ||
//     path.startsWith('/_next/') ||
//     path.startsWith('/api/_next/')
//   );
// }

// // Helper to check if path requires authentication
// function requiresAuth(path: string): boolean {
//   return (
//     path.startsWith('/children-dashboard') ||
//     path.startsWith('/mentor-dashboard') ||
//     path.startsWith('/admin-dashboard') ||
//     (path.startsWith('/api/stories/') &&
//       !path.includes('create-session') &&
//       !path.includes('store-pending-elements') &&
//       !path.includes('pending-elements')) ||
//     path.startsWith('/api/user/') ||
//     path.startsWith('/api/admin/') ||
//     path.startsWith('/api/mentor/')
//   );
// }

// export async function middleware(request: NextRequest) {
//   const path = request.nextUrl.pathname;

//   // Skip middleware for static files and Next.js internals
//   if (isStaticFile(path) || path.startsWith('/_next/')) {
//     return NextResponse.next();
//   }

//   console.log(`🔍 Middleware checking path: ${path}`);

//   // Public paths are always accessible
//   if (publicPaths.includes(path) || isPublicApiPath(path)) {
//     console.log(`✅ Public path allowed: ${path}`);
//     return NextResponse.next();
//   }

//   try {
//     const token = await getToken({
//       req: request,
//       secret: process.env.NEXTAUTH_SECRET,
//     });

//     const userRole = token?.role || 'none';
//     const userId = token?.id || 'none';

//     console.log(`🔐 PATH: ${path}, ROLE: ${userRole}, USER_ID: ${userId}`);

//     // ===== RATE LIMITING FOR AUTHENTICATED USERS =====
//     if (token?.id) {
//       // ADDED: Rate limiting for story creation
//       if (
//         path.startsWith('/children-dashboard/story/') &&
//         request.method === 'GET'
//       ) {
//         const rateLimitCheck = checkRateLimit(token.id, 'story-create');
//         if (!rateLimitCheck.allowed) {
//           console.log(
//             `🚫 Rate limit exceeded for user ${token.id}: ${rateLimitCheck.message}`
//           );
//           return NextResponse.redirect(
//             new URL('/children-dashboard?error=rate-limit', request.url)
//           );
//         }
//       }

//       // ADDED: Rate limiting for API story submissions
//       if (path.startsWith('/api/stories/ai-respond')) {
//         const rateLimitCheck = checkRateLimit(token.id, 'story-submit');
//         if (!rateLimitCheck.allowed) {
//           console.log(
//             `🚫 Story submission rate limit exceeded for user ${token.id}`
//           );
//           return NextResponse.json(
//             {
//               error: rateLimitCheck.message,
//               retryAfter: rateLimitCheck.retryAfter,
//             },
//             { status: 429 }
//           );
//         }
//       }

//       // ADDED: Rate limiting for assessments
//       if (path.startsWith('/api/stories/assess/')) {
//         const rateLimitCheck = checkRateLimit(token.id, 'assessment');
//         if (!rateLimitCheck.allowed) {
//           console.log(`🚫 Assessment rate limit exceeded for user ${token.id}`);
//           return NextResponse.json(
//             {
//               error: rateLimitCheck.message,
//               retryAfter: rateLimitCheck.retryAfter,
//             },
//             { status: 429 }
//           );
//         }
//       }
//     }

//     // ===== ADMIN ROUTES =====
//     if (path.startsWith('/admin-dashboard') || path.startsWith('/api/admin/')) {
//       if (!token) {
//         console.log(`❌ Unauthenticated admin access attempt: ${path}`);
//         return NextResponse.redirect(new URL('/login/admin', request.url));
//       }

//       if (token.role !== 'admin') {
//         console.log(`❌ NON-ADMIN (${token.role}) tried to access: ${path}`);
//         return NextResponse.redirect(new URL('/unauthorized', request.url));
//       }

//       console.log(`✅ Admin access granted: ${path}`);
//       return NextResponse.next();
//     }

//     // ===== MENTOR ROUTES =====
//     if (
//       path.startsWith('/mentor-dashboard') ||
//       path.startsWith('/api/mentor/')
//     ) {
//       if (!token) {
//         console.log(`❌ Unauthenticated mentor access attempt: ${path}`);
//         return NextResponse.redirect(new URL('/login/mentor', request.url));
//       }

//       if (token.role !== 'mentor' && token.role !== 'admin') {
//         console.log(`❌ NON-MENTOR (${token.role}) tried to access: ${path}`);
//         return NextResponse.redirect(new URL('/unauthorized', request.url));
//       }

//       console.log(`✅ Mentor access granted: ${path}`);
//       return NextResponse.next();
//     }

//     // ===== CHILDREN DASHBOARD ROUTES =====
//     if (path.startsWith('/children-dashboard')) {
//       if (!token) {
//         console.log(`❌ Unauthenticated child dashboard access: ${path}`);
//         // Store the intended destination for redirect after login
//         const callbackUrl = encodeURIComponent(path);
//         return NextResponse.redirect(
//           new URL(`/login/child?callbackUrl=${callbackUrl}`, request.url)
//         );
//       }

//       if (token.role !== 'child' && token.role !== 'admin') {
//         console.log(
//           `❌ NON-CHILD (${token.role}) tried to access children dashboard: ${path}`
//         );
//         return NextResponse.redirect(new URL('/unauthorized', request.url));
//       }

//       // Check if user account is active
//       if (token.isActive === false) {
//         console.log(`❌ Inactive child account tried to access: ${path}`);
//         return NextResponse.redirect(new URL('/unauthorized', request.url));
//       }

//       console.log(`✅ Child dashboard access granted: ${path}`);
//       return NextResponse.next();
//     }

//     // ===== STORY API ROUTES (Protected) =====
//     if (
//       path.startsWith('/api/stories/') &&
//       !path.includes('create-session') &&
//       !path.includes('store-pending-elements') &&
//       !path.includes('pending-elements')
//     ) {
//       if (!token) {
//         console.log(`❌ Unauthenticated API access: ${path}`);
//         return NextResponse.json(
//           { error: 'Authentication required' },
//           { status: 401 }
//         );
//       }

//       // Most story APIs are for children, but allow admins too
//       if (token.role !== 'child' && token.role !== 'admin') {
//         console.log(
//           `❌ Invalid role for story API: ${token.role} trying to access ${path}`
//         );
//         return NextResponse.json(
//           { error: 'Insufficient permissions' },
//           { status: 403 }
//         );
//       }

//       console.log(`✅ Story API access granted: ${path}`);
//       return NextResponse.next();
//     }

//     // ===== USER API ROUTES =====
//     if (path.startsWith('/api/user/')) {
//       if (!token) {
//         console.log(`❌ Unauthenticated user API access: ${path}`);
//         return NextResponse.json(
//           { error: 'Authentication required' },
//           { status: 401 }
//         );
//       }

//       console.log(`✅ User API access granted: ${path}`);
//       return NextResponse.next();
//     }

//     // ===== REDIRECT AUTHENTICATED USERS FROM AUTH PAGES =====
//     if (
//       token &&
//       (path.startsWith('/login/') ||
//         path.startsWith('/register/') ||
//         path === '/login' ||
//         path === '/register')
//     ) {
//       console.log(
//         `🔄 Authenticated user (${token.role}) accessing auth page, redirecting to dashboard`
//       );

//       // Redirect to appropriate dashboard based on role
//       switch (token.role) {
//         case 'child':
//           return NextResponse.redirect(
//             new URL('/children-dashboard', request.url)
//           );
//         case 'mentor':
//           return NextResponse.redirect(
//             new URL('/mentor-dashboard', request.url)
//           );
//         case 'admin':
//           return NextResponse.redirect(
//             new URL('/admin-dashboard', request.url)
//           );
//         default:
//           return NextResponse.redirect(new URL('/', request.url));
//       }
//     }

//     // ===== SUBSCRIPTION ENFORCEMENT =====
//     if (
//       path.startsWith('/children-dashboard/story/') &&
//       token?.role === 'child'
//     ) {
//       // Check if user has exceeded their story limit
//       // This would require a database call, so we'll handle it in the page component
//       // But we can add rate limiting here if needed
//       console.log(
//         `📊 Story access for user: ${userId}, tier: ${token.subscriptionTier || 'FREE'}`
//       );
//     }

//     // ===== DEFAULT BEHAVIOR =====
//     // If the path requires authentication but user is not authenticated
//     if (requiresAuth(path) && !token) {
//       console.log(`❌ Authentication required for: ${path}`);
//       const callbackUrl = encodeURIComponent(path);
//       return NextResponse.redirect(
//         new URL(`/login/child?callbackUrl=${callbackUrl}`, request.url)
//       );
//     }

//     // If path is not specifically handled, allow access
//     console.log(`✅ Default access granted: ${path}`);
//     return NextResponse.next();
//   } catch (error) {
//     console.error('❌ Middleware error:', error);

//     // If it's an API route, return JSON error
//     if (path.startsWith('/api/')) {
//       return NextResponse.json(
//         { error: 'Authentication service unavailable' },
//         { status: 500 }
//       );
//     }

//     // For page routes, redirect to login
//     return NextResponse.redirect(new URL('/login', request.url));
//   }
// }

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      * - public files (images, etc.)
//      */
//     '/((?!_next/static|_next/image|favicon.ico|public|images|icons).*)',
//   ],
// };

// // Additional helper functions for future expansion

// /**
//  * Check if user has permission to access a specific story
//  * This would be called from API routes for additional security
//  */
// export function hasStoryAccess(
//   userRole: string,
//   userId: string,
//   storyOwnerId: string
// ): boolean {
//   // Admins can access all stories
//   if (userRole === 'admin') return true;

//   // Users can only access their own stories
//   if (userRole === 'child' && userId === storyOwnerId) return true;

//   // Mentors can access stories of their assigned children
//   // This would require checking the mentor-child relationship in the database

//   return false;
// }

// /**
//  * UPDATED: Subscription limit checker with new tier structure
//  */
// export function checkSubscriptionLimits(
//   tier: string,
//   currentUsage: number
// ): boolean {
//   const limits = {
//     FREE: 10,
//     BASIC: 20,
//     PREMIUM: 100,
//   };

//   return currentUsage < (limits[tier as keyof typeof limits] || limits.FREE);
// }

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { checkRateLimit } from '@/lib/rate-limiter';

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
  return /\.(jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot|webp|mp4|webm|pdf)$/.test(
    path
  );
}

// Helper for public API paths
function isPublicApiPath(path: string): boolean {
  return (
    path.startsWith('/api/auth/') ||
    path.startsWith('/api/contact') ||
    path.startsWith('/api/files') ||
    path.startsWith('/api/stories/create-session') ||
    path.startsWith('/api/stories/store-pending-elements') ||
    path.startsWith('/api/stories/pending-elements') ||
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
    (path.startsWith('/api/stories/') &&
      !path.includes('create-session') &&
      !path.includes('store-pending-elements') &&
      !path.includes('pending-elements')) ||
    path.startsWith('/api/user/') ||
    path.startsWith('/api/admin/') ||
    path.startsWith('/api/mentor/')
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
  const path = request.nextUrl.pathname;

  // Skip middleware for static files and Next.js internals
  if (isStaticFile(path) || path.startsWith('/_next/')) {
    return NextResponse.next();
  }

  logMiddleware('info', `Checking: ${path}`);

  // Public paths are always accessible
  if (publicPaths.includes(path) || isPublicApiPath(path)) {
    logMiddleware('info', `✅ Public access: ${path}`);
    return NextResponse.next();
  }

  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const userRole = token?.role || 'guest';
    const userId = token?.id || null;
    const isAuthenticated = !!token;

    logMiddleware('info', `Auth Status`, {
      path,
      role: userRole,
      authenticated: isAuthenticated,
      userId: userId ? `${userId.substring(0, 8)}...` : 'none',
    });

    // ===== RATE LIMITING FOR AUTHENTICATED USERS =====
    if (token?.id) {
      // Rate limiting for story creation access
      if (
        path.startsWith('/children-dashboard/story/') &&
        request.method === 'GET'
      ) {
        const rateLimitCheck = checkRateLimit(token.id, 'story-create');
        if (!rateLimitCheck.allowed) {
          logMiddleware(
            'warn',
            `Rate limit exceeded: story-create for user ${token.id.substring(0, 8)}...`
          );
          return NextResponse.redirect(
            new URL('/children-dashboard?error=rate-limit', request.url)
          );
        }
      }

      // Rate limiting for API story submissions
      if (path.startsWith('/api/stories/ai-respond')) {
        const rateLimitCheck = checkRateLimit(token.id, 'story-submit');
        if (!rateLimitCheck.allowed) {
          logMiddleware(
            'warn',
            `Rate limit exceeded: story-submit for user ${token.id.substring(0, 8)}...`
          );
          return NextResponse.json(
            {
              error: rateLimitCheck.message,
              retryAfter: rateLimitCheck.retryAfter,
            },
            { status: 429 }
          );
        }
      }

      // Rate limiting for assessments
      if (path.startsWith('/api/stories/assess/')) {
        const rateLimitCheck = checkRateLimit(token.id, 'assessment');
        if (!rateLimitCheck.allowed) {
          logMiddleware(
            'warn',
            `Rate limit exceeded: assessment for user ${token.id.substring(0, 8)}...`
          );
          return NextResponse.json(
            {
              error: rateLimitCheck.message,
              retryAfter: rateLimitCheck.retryAfter,
            },
            { status: 429 }
          );
        }
      }
    }

    // ===== ADMIN ROUTES =====
    if (path.startsWith('/admin-dashboard') || path.startsWith('/api/admin/')) {
      if (!token) {
        logMiddleware('warn', `Unauthenticated admin access attempt: ${path}`);
        return NextResponse.redirect(new URL('/login/admin', request.url));
      }

      if (token.role !== 'admin') {
        logMiddleware(
          'error',
          `Non-admin (${token.role}) tried to access admin route: ${path}`
        );
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      logMiddleware('info', `✅ Admin access granted: ${path}`);
      return NextResponse.next();
    }

    // ===== MENTOR ROUTES =====
    if (
      path.startsWith('/mentor-dashboard') ||
      path.startsWith('/api/mentor/')
    ) {
      if (!token) {
        logMiddleware('warn', `Unauthenticated mentor access attempt: ${path}`);
        return NextResponse.redirect(new URL('/login/mentor', request.url));
      }

      if (token.role !== 'mentor' && token.role !== 'admin') {
        logMiddleware(
          'error',
          `Non-mentor (${token.role}) tried to access mentor route: ${path}`
        );
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      logMiddleware('info', `✅ Mentor access granted: ${path}`);
      return NextResponse.next();
    }

    // ===== CHILDREN DASHBOARD ROUTES =====
    if (path.startsWith('/children-dashboard')) {
      if (!token) {
        logMiddleware(
          'warn',
          `Unauthenticated child dashboard access: ${path}`
        );
        const callbackUrl = encodeURIComponent(path);
        return NextResponse.redirect(
          new URL(`/login/child?callbackUrl=${callbackUrl}`, request.url)
        );
      }

      if (token.role !== 'child' && token.role !== 'admin') {
        logMiddleware(
          'error',
          `Non-child (${token.role}) tried to access children dashboard: ${path}`
        );
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      // Check if user account is active
      if (token.isActive === false) {
        logMiddleware(
          'error',
          `Inactive child account tried to access: ${path}`
        );
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      logMiddleware('info', `✅ Child dashboard access granted: ${path}`);
      return NextResponse.next();
    }

    // ===== STORY API ROUTES (Protected) =====
    if (
      path.startsWith('/api/stories/') &&
      !path.includes('create-session') &&
      !path.includes('store-pending-elements') &&
      !path.includes('pending-elements')
    ) {
      if (!token) {
        logMiddleware('warn', `Unauthenticated story API access: ${path}`);
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Most story APIs are for children, but allow admins too
      if (token.role !== 'child' && token.role !== 'admin') {
        logMiddleware(
          'error',
          `Invalid role (${token.role}) for story API: ${path}`
        );
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      logMiddleware('info', `✅ Story API access granted: ${path}`);
      return NextResponse.next();
    }

    // ===== USER API ROUTES =====
    if (path.startsWith('/api/user/')) {
      if (!token) {
        logMiddleware('warn', `Unauthenticated user API access: ${path}`);
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      logMiddleware('info', `✅ User API access granted: ${path}`);
      return NextResponse.next();
    }

    // ===== REMOVED: REDIRECT AUTHENTICATED USERS FROM AUTH PAGES =====
    // This section was causing the issue - REMOVED COMPLETELY
    // Let NextAuth handle the redirect flow properly

    // ===== SUBSCRIPTION ENFORCEMENT =====
    if (
      path.startsWith('/children-dashboard/story/') &&
      token?.role === 'child'
    ) {
      logMiddleware('info', `Story access check`, {
        userId: userId ? `${userId.substring(0, 8)}...` : 'unknown',
        tier: token.subscriptionTier || 'FREE',
      });
    }

    // ===== DEFAULT BEHAVIOR =====
    // If the path requires authentication but user is not authenticated
    if (requiresAuth(path) && !token) {
      logMiddleware('warn', `Authentication required for: ${path}`);
      const callbackUrl = encodeURIComponent(path);
      return NextResponse.redirect(
        new URL(`/login/child?callbackUrl=${callbackUrl}`, request.url)
      );
    }

    // If path is not specifically handled, allow access
    logMiddleware('info', `✅ Default access granted: ${path}`);
    return NextResponse.next();
  } catch (error) {
    logMiddleware('error', 'Middleware error:', error);

    // If it's an API route, return JSON error
    if (path.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Authentication service unavailable' },
        { status: 500 }
      );
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
export function hasStoryAccess(
  userRole: string,
  userId: string,
  storyOwnerId: string
): boolean {
  // Admins can access all stories
  if (userRole === 'admin') return true;

  // Users can only access their own stories
  if (userRole === 'child' && userId === storyOwnerId) return true;

  // Mentors can access stories of their assigned children
  // This would require checking the mentor-child relationship in the database

  return false;
}

/**
 * UPDATED: Subscription limit checker with new tier structure
 */
export function checkSubscriptionLimits(
  tier: string,
  currentUsage: number
): boolean {
  const limits = {
    FREE: 50, // Updated to match your config
    BASIC: 100,
    PREMIUM: 200,
  };

  return currentUsage < (limits[tier as keyof typeof limits] || limits.FREE);
}
