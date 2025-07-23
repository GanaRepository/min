// lib/rate-limiter.ts
import { SUBSCRIPTION_TIERS, DEFAULT_TIER } from '@/config/tiers';

const rateLimitMap = new Map<string, number[]>();

export function checkRateLimit(userId: string, action: string, userTier: string = 'FREE'): { allowed: boolean; retryAfter?: number; message?: string } {
  const limits: Record<string, { windowMs: number; maxRequests: number; message: string }> = {
    'story-create': {
      windowMs: 30 * 24 * 60 * 60 * 1000, // Monthly limit
      maxRequests: SUBSCRIPTION_TIERS[userTier]?.storyLimit || DEFAULT_TIER.storyLimit,
      message: 'You have reached your story creation limit for this month.'
    },
    'story-submit': { 
      windowMs: 60 * 1000, 
      maxRequests: 3, 
      message: 'Too many story submissions. Please wait before trying again.' 
    },
    'assessment': { 
      windowMs: 5 * 60 * 1000, 
      maxRequests: 1, 
      message: 'Assessment already in progress. Please wait.' 
    }
  };

  const config = limits[action];
  if (!config) return { allowed: true };

  const key = `${action}:${userId}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  let requests = rateLimitMap.get(key) || [];
  requests = requests.filter(timestamp => timestamp > windowStart);
  
  if (requests.length >= config.maxRequests) {
    const retryAfter = Math.ceil((requests[0] + config.windowMs - now) / 1000);
    return {
      allowed: false,
      retryAfter,
      message: config.message
    };
  }

  requests.push(now);
  rateLimitMap.set(key, requests);
  return { allowed: true };
}