// lib/rate-limiter.ts - DISABLED OLD SYSTEM
// THIS FILE IS DEPRECATED - USE lib/usage-manager.ts INSTEAD

// export async function checkMonthlyUsage() {
//   // COMMENTED OUT - USE UsageManager instead
// }

// ONLY KEEP THE SIMPLE IN-MEMORY RATE LIMITING FOR SPAM PROTECTION
const rateLimitMap = new Map<string, number[]>();

export function checkRateLimit(
  userId: string,
  action: string,
  userTier: string = 'FREE'
): { allowed: boolean; retryAfter?: number; message?: string } {
  const limits: Record<
    string,
    { windowMs: number; maxRequests: number; message: string }
  > = {
    'assessment-attempt': {
      windowMs: 5 * 60 * 1000, // 5 minutes between attempts
      maxRequests: 1,
      message: 'Please wait before attempting another assessment.',
    },
    'story-submit': {
      windowMs: 60 * 1000,
      maxRequests: 3,
      message: 'Too many story submissions. Please wait before trying again.',
    },
    'story-publication': {
      windowMs: 60 * 1000, // 1 minute between publications
      maxRequests: 1,
      message: 'Please wait before publishing another story.',
    },
  };

  const config = limits[action];
  if (!config) return { allowed: true };

  const key = `${action}:${userId}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  let requests = rateLimitMap.get(key) || [];
  requests = requests.filter((timestamp) => timestamp > windowStart);

  if (requests.length >= config.maxRequests) {
    const retryAfter = Math.ceil((requests[0] + config.windowMs - now) / 1000);
    return {
      allowed: false,
      retryAfter,
      message: config.message,
    };
  }

  requests.push(now);
  rateLimitMap.set(key, requests);
  return { allowed: true };
}
