// app/api/user/usage/route.ts - Get User's Current Usage Statistics
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import { getUserLimits, canPerformAction } from '@/config/limits';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
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
    
    // Calculate total assessment attempts used
    let totalAssessmentAttempts = 0;
    if (user.assessmentAttempts) {
      for (const attempts of user.assessmentAttempts.values()) {
        totalAssessmentAttempts += attempts;
      }
    }

    const usageStats = {
      storiesCreated: user.storiesCreatedThisMonth || 0,
      storyLimit: limits.stories,
      assessmentUploads: user.assessmentUploadsThisMonth || 0,
      assessmentLimit: limits.assessments,
      competitionEntries: user.competitionEntriesThisMonth || 0,
      competitionLimit: limits.competitionEntries,
      totalAssessmentAttempts,
      maxAssessmentAttempts: limits.totalAssessmentAttempts,
      lastReset: user.lastMonthlyReset,
      
      // Remaining counts
      storiesRemaining: Math.max(0, limits.stories - (user.storiesCreatedThisMonth || 0)),
      assessmentsRemaining: Math.max(0, limits.assessments - (user.assessmentUploadsThisMonth || 0)),
      competitionEntriesRemaining: Math.max(0, limits.competitionEntries - (user.competitionEntriesThisMonth || 0)),
      
      // Purchase info
      hasStoryPackThisMonth: limits.stories > 3, // More than free tier
      monthlySpent: user.purchaseHistory?.reduce((total: number, purchase: any) => {
        const purchaseDate = new Date(purchase.purchaseDate);
        const thisMonth = new Date();
        if (purchaseDate.getMonth() === thisMonth.getMonth() && purchaseDate.getFullYear() === thisMonth.getFullYear()) {
          return total + purchase.amount;
        }
        return total;
      }, 0) || 0,
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