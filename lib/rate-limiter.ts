
// // 5. Fix lib/rate-limiter.ts - Remove old imports and fix function signatures
// import { USAGE_LIMITS } from '@/config/limits';
// import { connectToDatabase } from '@/utils/db';
// import User from '@/models/User';

// const rateLimitMap = new Map<string, number[]>();

// export function checkRateLimit(
//   userId: string,
//   action: string,
//   userTier: string = 'FREE'
// ): { allowed: boolean; retryAfter?: number; message?: string } {
//   const limits: Record<
//     string,
//     { windowMs: number; maxRequests: number; message: string }
//   > = {
//     'story-create': {
//       windowMs: 30 * 24 * 60 * 60 * 1000, // Monthly limit
//       maxRequests: USAGE_LIMITS.FREE.stories, // Use new usage limits
//       message: 'You have reached your story creation limit for this month.',
//     },
//     'story-upload': {
//       windowMs: 30 * 24 * 60 * 60 * 1000, // Monthly limit
//       maxRequests: USAGE_LIMITS.FREE.assessments, // New assessment upload limit
//       message: 'You have reached your story upload limit for this month.',
//     },
//     'assessment-attempt': {
//       windowMs: 5 * 60 * 1000, // 5 minutes between attempts
//       maxRequests: 1,
//       message: 'Please wait before attempting another assessment.',
//     },
//     'competition-submit': {
//       windowMs: 30 * 24 * 60 * 60 * 1000, // Monthly limit
//       maxRequests: USAGE_LIMITS.FREE.competitionEntries,
//       message: 'You have reached your competition entry limit for this month.',
//     },
//     'story-submit': {
//       windowMs: 60 * 1000,
//       maxRequests: 3,
//       message: 'Too many story submissions. Please wait before trying again.',
//     },
//     'story-publication': {
//       windowMs: 60 * 1000, // 1 minute between publications
//       maxRequests: 1,
//       message: 'Please wait before publishing another story.',
//     },
//   };

//   const config = limits[action];
//   if (!config) return { allowed: true };

//   const key = `${action}:${userId}`;
//   const now = Date.now();
//   const windowStart = now - config.windowMs;

//   let requests = rateLimitMap.get(key) || [];
//   requests = requests.filter((timestamp) => timestamp > windowStart);

//   if (requests.length >= config.maxRequests) {
//     const retryAfter = Math.ceil((requests[0] + config.windowMs - now) / 1000);
//     return {
//       allowed: false,
//       retryAfter,
//       message: config.message,
//     };
//   }

//   requests.push(now);
//   rateLimitMap.set(key, requests);
//   return { allowed: true };
// }

// // NEW: Check monthly usage limits from database
// export async function checkMonthlyUsage(
//   userId: string,
//   action: 'story-create' | 'story-upload' | 'competition-submit'
// ): Promise<{ allowed: boolean; used: number; limit: number; message?: string }> {
//   try {
//     await connectToDatabase();
//     const user = await User.findById(userId);
    
//     if (!user) {
//       return { allowed: false, used: 0, limit: 0, message: 'User not found' };
//     }

//     let used = 0;
//     let limit = 0;
//     let message = '';

//     switch (action) {
//       case 'story-create':
//         used = user.storiesCreatedThisMonth || 0;
//         limit = USAGE_LIMITS.FREE.stories;
//         message = `You have used ${used}/${limit} story creations this month`;
//         break;
        
//       case 'story-upload':
//         used = user.assessmentUploadsThisMonth || 0;
//         limit = USAGE_LIMITS.FREE.assessments;
//         message = `You have used ${used}/${limit} assessment uploads this month`;
//         break;
        
//       case 'competition-submit':
//         used = user.competitionEntriesThisMonth || 0;
//         limit = USAGE_LIMITS.FREE.competitionEntries;
//         message = `You have used ${used}/${limit} competition entries this month`;
//         break;
//     }

//     return {
//       allowed: used < limit,
//       used,
//       limit,
//       message: used >= limit ? `Monthly limit of ${limit} reached for ${action.replace('-', ' ')}` : message
//     };

//   } catch (error) {
//     console.error('Error checking monthly usage:', error);
//     return { allowed: false, used: 0, limit: 0, message: 'Error checking usage limits' };
//   }
// }

// // NEW: Check story assessment attempts
// export async function checkAssessmentAttempts(
//   userId: string,
//   storyId: string
// ): Promise<{ allowed: boolean; attempts: number; limit: number; message?: string }> {
//   try {
//     await connectToDatabase();
//     const user = await User.findById(userId);
    
//     if (!user) {
//       return { allowed: false, attempts: 0, limit: 3, message: 'User not found' };
//     }

//     const attempts = user.assessmentAttempts?.get(storyId) || 0;
//     const limit = 3; // MAX_ASSESSMENT_ATTEMPTS from config

//     return {
//       allowed: attempts < limit,
//       attempts,
//       limit,
//       message: attempts >= limit ? `Maximum ${limit} assessment attempts reached for this story` : `${attempts}/${limit} attempts used`
//     };

//   } catch (error) {
//     console.error('Error checking assessment attempts:', error);
//     return { allowed: false, attempts: 0, limit: 3, message: 'Error checking assessment attempts' };
//   }
// }

// // Add function to clear rate limit cache when needed
// export function clearRateLimit(userId: string, action: string) {
//   const key = `${action}:${userId}`;
//   rateLimitMap.delete(key);
// }

// // NEW: Reset monthly usage counters (for cron job)
// export async function resetMonthlyUsage() {
//   try {
//     await connectToDatabase();
    
//     const result = await User.updateMany(
//       { role: 'child', isActive: true },
//       {
//         $set: {
//           storiesCreatedThisMonth: 0,
//           assessmentUploadsThisMonth: 0,
//           competitionEntriesThisMonth: 0,
//           lastMonthlyReset: new Date(),
//         }
//       }
//     );

//     console.log(`✅ Monthly usage reset for ${result.modifiedCount} users`);
//     return result.modifiedCount;

//   } catch (error) {
//     console.error('Error resetting monthly usage:', error);
//     throw error;
//   }
// }


// lib/rate-limiter.ts - Fixed imports only
import { USAGE_LIMITS } from '@/config/limits';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';

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
    'story-create': {
      windowMs: 30 * 24 * 60 * 60 * 1000, // Monthly limit
      maxRequests: USAGE_LIMITS.FREE.stories, // Use new usage limits
      message: 'You have reached your story creation limit for this month.',
    },
    'story-upload': {
      windowMs: 30 * 24 * 60 * 60 * 1000, // Monthly limit
      maxRequests: USAGE_LIMITS.FREE.assessments, // New assessment upload limit
      message: 'You have reached your story upload limit for this month.',
    },
    'assessment-attempt': {
      windowMs: 5 * 60 * 1000, // 5 minutes between attempts
      maxRequests: 1,
      message: 'Please wait before attempting another assessment.',
    },
    'competition-submit': {
      windowMs: 30 * 24 * 60 * 60 * 1000, // Monthly limit
      maxRequests: USAGE_LIMITS.FREE.competitionEntries,
      message: 'You have reached your competition entry limit for this month.',
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

// NEW: Check monthly usage limits from database
export async function checkMonthlyUsage(
  userId: string,
  action: 'story-create' | 'story-upload' | 'competition-submit'
): Promise<{ allowed: boolean; used: number; limit: number; message?: string }> {
  try {
    await connectToDatabase();
    const user = await User.findById(userId);
    
    if (!user) {
      return { allowed: false, used: 0, limit: 0, message: 'User not found' };
    }

    let used = 0;
    let limit = 0;
    let message = '';

    switch (action) {
      case 'story-create':
        used = user.storiesCreatedThisMonth || 0;
        limit = USAGE_LIMITS.FREE.stories;
        message = `You have used ${used}/${limit} story creations this month`;
        break;
        
      case 'story-upload':
        used = user.assessmentUploadsThisMonth || 0;
        limit = USAGE_LIMITS.FREE.assessments;
        message = `You have used ${used}/${limit} assessment uploads this month`;
        break;
        
      case 'competition-submit':
        used = user.competitionEntriesThisMonth || 0;
        limit = USAGE_LIMITS.FREE.competitionEntries;
        message = `You have used ${used}/${limit} competition entries this month`;
        break;
    }

    return {
      allowed: used < limit,
      used,
      limit,
      message: used >= limit ? `Monthly limit of ${limit} reached for ${action.replace('-', ' ')}` : message
    };

  } catch (error) {
    console.error('Error checking monthly usage:', error);
    return { allowed: false, used: 0, limit: 0, message: 'Error checking usage limits' };
  }
}

// NEW: Check story assessment attempts
export async function checkAssessmentAttempts(
  userId: string,
  storyId: string
): Promise<{ allowed: boolean; attempts: number; limit: number; message?: string }> {
  try {
    await connectToDatabase();
    const user = await User.findById(userId);
    
    if (!user) {
      return { allowed: false, attempts: 0, limit: 3, message: 'User not found' };
    }

    const attempts = user.assessmentAttempts?.get(storyId) || 0;
    const limit = 3; // MAX_ASSESSMENT_ATTEMPTS from config

    return {
      allowed: attempts < limit,
      attempts,
      limit,
      message: attempts >= limit ? `Maximum ${limit} assessment attempts reached for this story` : `${attempts}/${limit} attempts used`
    };

  } catch (error) {
    console.error('Error checking assessment attempts:', error);
    return { allowed: false, attempts: 0, limit: 3, message: 'Error checking assessment attempts' };
  }
}

// Add function to clear rate limit cache when needed
export function clearRateLimit(userId: string, action: string) {
  const key = `${action}:${userId}`;
  rateLimitMap.delete(key);
}

// NEW: Reset monthly usage counters (for cron job)
export async function resetMonthlyUsage() {
  try {
    await connectToDatabase();
    
    const result = await User.updateMany(
      { role: 'child', isActive: true },
      {
        $set: {
          storiesCreatedThisMonth: 0,
          assessmentUploadsThisMonth: 0,
          competitionEntriesThisMonth: 0,
          lastMonthlyReset: new Date(),
        }
      }
    );

    console.log(`✅ Monthly usage reset for ${result.modifiedCount} users`);
    return result.modifiedCount;

  } catch (error) {
    console.error('Error resetting monthly usage:', error);
    throw error;
  }
}