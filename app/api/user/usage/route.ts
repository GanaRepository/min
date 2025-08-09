import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';

// Define proper interfaces
interface UserLimits {
  stories: number;
  assessments: number;
  competitionEntries: number;
  totalAssessmentAttempts: number;
}

interface PurchaseHistoryItem {
  type: string;
  amount: number;
  purchaseDate: Date;
}

function getUserLimits(user: any): UserLimits {
  // Basic implementation - you can enhance this based on your business logic
  const hasStoryPack = user.purchaseHistory?.some((purchase: PurchaseHistoryItem) => {
    const purchaseDate = new Date(purchase.purchaseDate);
    const thisMonth = new Date();
    return purchase.type === 'story_pack' && 
           purchaseDate.getMonth() === thisMonth.getMonth() && 
           purchaseDate.getFullYear() === thisMonth.getFullYear();
  });

  return {
    stories: hasStoryPack ? 8 : 3, // 8 if they bought story pack, 3 free
    assessments: hasStoryPack ? 8 : 3,
    competitionEntries: 3,
    totalAssessmentAttempts: 9, // 3 attempts per story, 3 stories max
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById(session.user.id).select(
      'storiesCreatedThisMonth assessmentUploadsThisMonth competitionEntriesThisMonth assessmentAttempts purchaseHistory lastMonthlyReset'
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's current limits based on purchases
    const limits = getUserLimits(user);
    
    // Calculate total assessment attempts used - handle Map properly
    let totalAssessmentAttempts = 0;
    if (user.assessmentAttempts && typeof user.assessmentAttempts === 'object') {
      if (user.assessmentAttempts instanceof Map) {
        for (const attempts of user.assessmentAttempts.values()) {
          totalAssessmentAttempts += Number(attempts) || 0;
        }
      } else {
        // Handle as object
        for (const attempts of Object.values(user.assessmentAttempts)) {
          totalAssessmentAttempts += Number(attempts) || 0;
        }
      }
    }

    // Calculate monthly spent safely
    let monthlySpent = 0;
    if (user.purchaseHistory && Array.isArray(user.purchaseHistory)) {
      monthlySpent = user.purchaseHistory.reduce((total: number, purchase: any) => {
        if (purchase && purchase.purchaseDate && purchase.amount) {
          const purchaseDate = new Date(purchase.purchaseDate);
          const thisMonth = new Date();
          if (purchaseDate.getMonth() === thisMonth.getMonth() && 
              purchaseDate.getFullYear() === thisMonth.getFullYear()) {
            return total + (Number(purchase.amount) || 0);
          }
        }
        return total;
      }, 0);
    }

    const usageStats = {
      storiesCreated: Number(user.storiesCreatedThisMonth) || 0,
      storyLimit: limits.stories,
      assessmentUploads: Number(user.assessmentUploadsThisMonth) || 0,
      assessmentLimit: limits.assessments,
      competitionEntries: Number(user.competitionEntriesThisMonth) || 0,
      competitionLimit: limits.competitionEntries,
      totalAssessmentAttempts,
      maxAssessmentAttempts: limits.totalAssessmentAttempts,
      lastReset: user.lastMonthlyReset,
      
      // Remaining counts
      storiesRemaining: Math.max(0, limits.stories - (Number(user.storiesCreatedThisMonth) || 0)),
      assessmentsRemaining: Math.max(0, limits.assessments - (Number(user.assessmentUploadsThisMonth) || 0)),
      competitionEntriesRemaining: Math.max(0, limits.competitionEntries - (Number(user.competitionEntriesThisMonth) || 0)),
      
      // Purchase info
      hasStoryPackThisMonth: limits.stories > 3, // More than free tier
      monthlySpent,
    };

    return NextResponse.json(usageStats);

  } catch (error) {
    console.error('Error fetching user usage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage statistics' },
      { status: 500 }
    );
  }
}