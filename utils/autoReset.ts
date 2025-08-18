// utils/autoReset.ts - UPDATED TO PRESERVE STORY PACK PURCHASES
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import { getCurrentMonth } from './internetDate';

export async function checkAndPerformMonthlyReset(): Promise<boolean> {
  const currentMonth = await getCurrentMonth();
  await connectToDatabase();
  
  const userNeedingReset = await User.findOne({ currentMonth: { $ne: currentMonth } });
  
  if (userNeedingReset) {
    console.log('🔄 Performing monthly reset - preserving Story Pack purchases...');
    
    // CRITICAL: Only reset FREE tier tracking, DO NOT touch purchaseHistory or active Story Packs
    await User.updateMany({}, {
      $set: {
        currentMonth,
        lastMonthlyReset: new Date(),
      },
      // REMOVED: monthlyLimits reset (now calculated dynamically from 30-day purchases)
      // REMOVED: subscriptionTier reset (now calculated dynamically)
      // REMOVED: billingPeriodStart/End reset (now calculated from purchases)
    });
    
    console.log('✅ Monthly reset completed - Story Pack purchases preserved');
    return true;
  }
  
  return false;
}