import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import { getCurrentMonth } from './internetDate';

export async function checkAndPerformMonthlyReset(): Promise<boolean> {
  const currentMonth = await getCurrentMonth();
  await connectToDatabase();
  const userNeedingReset = await User.findOne({ currentMonth: { $ne: currentMonth } });
  if (userNeedingReset) {
    await User.updateMany({}, {
      $set: {
        monthlyLimits: { freestyleStories: 3, assessmentRequests: 9, competitionEntries: 3 },
        subscriptionTier: 'FREE',
        subscriptionStatus: 'active',
        currentMonth,
        billingPeriodStart: null,
        billingPeriodEnd: null,
      }
    });
    return true;
  }
  return false;
}
