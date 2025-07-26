// // // app/api/user/progress/route.ts
// // import { NextResponse } from 'next/server';
// // import { getServerSession } from 'next-auth';
// // import { authOptions } from '@/utils/authOptions';
// // import { connectToDatabase } from '@/utils/db';
// // import User from '@/models/User';
// // import StorySession from '@/models/StorySession';
// // import Achievement from '@/models/Achievement';
// // import mongoose from 'mongoose';

// // export async function GET() {
// //   try {
// //     const session = await getServerSession(authOptions);

// //     if (!session || session.user.role !== 'child') {
// //       return NextResponse.json(
// //         { error: 'Access denied. Children only.' },
// //         { status: 403 }
// //       );
// //     }

// //     await connectToDatabase();

// //     const userId = new mongoose.Types.ObjectId(session.user.id);
// //     const now = new Date();
// //     const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
// //     const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

// //     // Get user data
// //     const user = await User.findById(userId);
// //     if (!user) {
// //       return NextResponse.json({ error: 'User not found' }, { status: 404 });
// //     }

// //     // Get story sessions
// //     const [allSessions, completedSessions] = await Promise.all([
// //       StorySession.find({ childId: userId }).lean(),
// //       StorySession.find({ childId: userId, status: 'completed' }).lean(),
// //     ]);

// //     // Calculate overview stats
// //     const totalWords = completedSessions.reduce(
// //       (sum, session) => sum + (session.childWords || 0),
// //       0
// //     );
// //     const totalStories = completedSessions.length;
// //     const averageScore =
// //       completedSessions.length > 0
// //         ? Math.round(
// //             completedSessions.reduce(
// //               (sum, session) => sum + (session.overallScore || 0),
// //               0
// //             ) / completedSessions.length
// //           )
// //         : 0;
// //     const bestScore = Math.max(
// //       ...completedSessions.map((session) => session.overallScore || 0),
// //       0
// //     );
// //     const completionRate =
// //       allSessions.length > 0
// //         ? Math.round((completedSessions.length / allSessions.length) * 100)
// //         : 0;

// //     // Get monthly stats
// //     const monthlyStats = await StorySession.aggregate([
// //       {
// //         $match: {
// //           childId: userId,
// //           createdAt: { $gte: monthStart },
// //           status: 'completed',
// //         },
// //       },
// //       {
// //         $group: {
// //           _id: null,
// //           storiesCreated: { $sum: 1 },
// //           wordsWritten: { $sum: '$childWords' },
// //           avgScore: { $avg: '$overallScore' },
// //           daysActive: {
// //             $addToSet: {
// //               $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
// //             },
// //           },
// //         },
// //       },
// //     ]);

// //     const monthlyData = monthlyStats[0] || {
// //       storiesCreated: 0,
// //       wordsWritten: 0,
// //       avgScore: 0,
// //       daysActive: [],
// //     };

// //     // Get weekly progress
// //     const weeklyStats = await StorySession.aggregate([
// //       {
// //         $match: {
// //           childId: userId,
// //           createdAt: { $gte: weekStart },
// //         },
// //       },
// //       {
// //         $group: {
// //           _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
// //           stories: {
// //             $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
// //           },
// //           words: { $sum: '$childWords' },
// //           avgScore: {
// //             $avg: {
// //               $cond: [{ $eq: ['$status', 'completed'] }, '$overallScore', null],
// //             },
// //           },
// //         },
// //       },
// //       { $sort: { _id: 1 } },
// //     ]);

// //     // Create 7-day progress array
// //     const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
// //       const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
// //       const dateStr = date.toISOString().split('T')[0];
// //       const dayData = weeklyStats.find((stat) => stat._id === dateStr);
// //       return {
// //         date: dateStr,
// //         stories: dayData?.stories || 0,
// //         words: dayData?.words || 0,
// //         score: dayData?.avgScore || 0,
// //       };
// //     });

// //     // Get achievements
// //     const achievements = await Achievement.find({ userId })
// //       .sort({ earnedAt: -1 })
// //       .limit(10)
// //       .lean();

// //     // Calculate skills (mock improvement for now - implement real tracking later)
// //     const skills = {
// //       grammar: {
// //         current: Math.min(
// //           averageScore + Math.floor(Math.random() * 10) - 5,
// //           100
// //         ),
// //         improvement: Math.floor(Math.random() * 5) + 1,
// //       },
// //       creativity: {
// //         current: Math.min(
// //           averageScore + Math.floor(Math.random() * 15) - 5,
// //           100
// //         ),
// //         improvement: Math.floor(Math.random() * 7) + 1,
// //       },
// //       vocabulary: {
// //         current: Math.min(
// //           averageScore + Math.floor(Math.random() * 12) - 3,
// //           100
// //         ),
// //         improvement: Math.floor(Math.random() * 4) + 1,
// //       },
// //       storytelling: {
// //         current: Math.min(
// //           averageScore + Math.floor(Math.random() * 8) - 2,
// //           100
// //         ),
// //         improvement: Math.floor(Math.random() * 6) + 1,
// //       },
// //     };

// //     // Generate goals based on current progress
// //     const goals = [
// //       {
// //         id: 'monthly_stories',
// //         title: 'Complete 5 Stories This Month',
// //         target: 5,
// //         current: monthlyData.storiesCreated,
// //         type: 'stories' as const,
// //       },
// //       {
// //         id: 'word_milestone',
// //         title: 'Write 1,000 Words',
// //         target: 1000,
// //         current: Math.min(totalWords % 1000, totalWords),
// //         type: 'words' as const,
// //       },
// //       {
// //         id: 'writing_streak',
// //         title: 'Maintain 7-Day Streak',
// //         target: 7,
// //         current: user.writingStreak || 0,
// //         type: 'streak' as const,
// //       },
// //       {
// //         id: 'quality_score',
// //         title: 'Achieve 90% Average Score',
// //         target: 90,
// //         current: averageScore,
// //         type: 'score' as const,
// //       },
// //     ];

// //     return NextResponse.json({
// //       success: true,
// //       progress: {
// //         overview: {
// //           totalStoriesCreated: totalStories,
// //           totalWordsWritten: totalWords,
// //           averageWordsPerStory:
// //             totalStories > 0 ? Math.round(totalWords / totalStories) : 0,
// //           writingStreak: user.writingStreak || 0,
// //           completionRate,
// //           bestScore,
// //           averageScore,
// //         },
// //         monthly: {
// //           storiesCreated: monthlyData.storiesCreated,
// //           wordsWritten: monthlyData.wordsWritten,
// //           averageScore: Math.round(monthlyData.avgScore || 0),
// //           daysActive: monthlyData.daysActive.length,
// //         },
// //         weekly: weeklyProgress,
// //         achievements: achievements.map((achievement) => ({
// //           id: achievement._id,
// //           title: achievement.title,
// //           description: achievement.description,
// //           earnedAt: achievement.earnedAt,
// //           category: achievement.category,
// //         })),
// //         skills,
// //         goals,
// //       },
// //     });
// //   } catch (error) {
// //     console.error('Error fetching progress data:', error);
// //     return NextResponse.json(
// //       { error: 'Failed to fetch progress data' },
// //       { status: 500 }
// //     );
// //   }
// // }

// // app/api/user/progress/route.ts - FIXED: Include detailed assessment data in progress
// import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/utils/authOptions';
// import { connectToDatabase } from '@/utils/db';
// import  StorySession  from '@/models/StorySession';
// import  Turn  from '@/models/Turn';

// export async function GET(request: NextRequest) {
//   try {
//     const userSession = await getServerSession(authOptions);

//     if (!userSession || userSession.user.role !== 'child') {
//       return NextResponse.json(
//         { error: 'Unauthorized access. Children only.' },
//         { status: 403 }
//       );
//     }

//     await  connectToDatabase();

//     const childId = userSession.user.id;

//     // Get all story sessions for this child
//     const storySessions = await StorySession.find({ childId }).sort({ createdAt: -1 });

//     // Get all turns for analytics
//     const allTurns = await Turn.find({
//       sessionId: { $in: storySessions.map(s => s._id) }
//     }).sort({ createdAt: -1 });

//     // Calculate overview statistics
//     const totalStoriesCreated = storySessions.length;
//     const completedStories = storySessions.filter(s => s.status === 'completed');
//     const totalWordsWritten = storySessions.reduce((sum, session) => sum + (session.childWords || 0), 0);
//     const averageWordsPerStory = totalStoriesCreated > 0 ? Math.round(totalWordsWritten / totalStoriesCreated) : 0;

//     // Calculate writing streak (simplified)
//     const today = new Date();
//     const yesterday = new Date(today);
//     yesterday.setDate(yesterday.getDate() - 1);
    
//     const todayActivity = allTurns.some(turn => {
//       const turnDate = new Date(turn.createdAt);
//       return turnDate.toDateString() === today.toDateString();
//     });
    
//     const yesterdayActivity = allTurns.some(turn => {
//       const turnDate = new Date(turn.createdAt);
//       return turnDate.toDateString() === yesterday.toDateString();
//     });

//     const writingStreak = todayActivity ? (yesterdayActivity ? 2 : 1) : 0;
//     const completionRate = totalStoriesCreated > 0 ? Math.round((completedStories.length / totalStoriesCreated) * 100) : 0;

//     // FIXED: Calculate best and average scores from detailed assessments
//     const storiesWithScores = completedStories.filter(s => s.overallScore || s.assessment?.overallScore);
//     const scores = storiesWithScores.map(s => s.assessment?.overallScore || s.overallScore || 0);
//     const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
//     const averageScore = scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;

//     // Monthly statistics
//     const currentMonth = new Date();
//     currentMonth.setDate(1);
//     const currentMonthSessions = storySessions.filter(s => new Date(s.createdAt) >= currentMonth);
//     const currentMonthTurns = allTurns.filter(t => new Date(t.createdAt) >= currentMonth);

//     const monthly = {
//       storiesCreated: currentMonthSessions.filter(s => s.status === 'completed').length,
//       wordsWritten: currentMonthSessions.reduce((sum, session) => sum + (session.childWords || 0), 0),
//       averageScore: currentMonthSessions.length > 0 ? 
//         Math.round(currentMonthSessions
//           .filter(s => s.overallScore || s.assessment?.overallScore)
//           .reduce((sum, s) => sum + (s.assessment?.overallScore || s.overallScore || 0), 0) / 
//           Math.max(currentMonthSessions.filter(s => s.overallScore || s.assessment?.overallScore).length, 1)) : 0,
//       daysActive: new Set(currentMonthTurns.map(t => new Date(t.createdAt).toDateString())).size
//     };

//     // Weekly progress (last 7 days)
//     const weeklyProgress = [];
//     for (let i = 6; i >= 0; i--) {
//       const date = new Date();
//       date.setDate(date.getDate() - i);
//       const dateStr = date.toISOString().split('T')[0];
      
//       const dayTurns = allTurns.filter(turn => {
//         const turnDate = new Date(turn.createdAt);
//         return turnDate.toDateString() === date.toDateString();
//       });
      
//       const dayStories = storySessions.filter(session => {
//         const sessionDate = new Date(session.updatedAt);
//         return sessionDate.toDateString() === date.toDateString() && session.status === 'completed';
//       });

//       const dayWords = dayTurns.reduce((sum, turn) => sum + (turn.childWordCount || 0), 0);
//       const dayScore = dayStories.length > 0 ? 
//         Math.round(dayStories.reduce((sum, s) => sum + (s.assessment?.overallScore || s.overallScore || 0), 0) / dayStories.length) : 0;

//       weeklyProgress.push({
//         date: dateStr,
//         stories: dayStories.length,
//         words: dayWords,
//         score: dayScore
//       });
//     }

//     // FIXED: Skills development with detailed assessment data
//     const skills = {
//       grammar: {
//         current: storiesWithScores.length > 0 ? 
//           Math.round(storiesWithScores.reduce((sum, s) => sum + (s.assessment?.grammarScore || s.grammarScore || 0), 0) / storiesWithScores.length) : 0,
//         improvement: 5 // This would need more complex calculation for real improvement
//       },
//       creativity: {
//         current: storiesWithScores.length > 0 ? 
//           Math.round(storiesWithScores.reduce((sum, s) => sum + (s.assessment?.creativityScore || s.creativityScore || 0), 0) / storiesWithScores.length) : 0,
//         improvement: 8
//       },
//       vocabulary: {
//         current: storiesWithScores.length > 0 ? 
//           Math.round(storiesWithScores.reduce((sum, s) => sum + (s.assessment?.vocabularyScore || s.grammarScore || 0), 0) / storiesWithScores.length) : 0,
//         improvement: 6
//       },
//       storytelling: {
//         current: storiesWithScores.length > 0 ? 
//           Math.round(storiesWithScores.reduce((sum, s) => sum + (s.assessment?.plotDevelopmentScore || s.creativityScore || 0), 0) / storiesWithScores.length) : 0,
//         improvement: 4
//       }
//     };

//     // Generate achievements based on actual progress
//     const achievements = [];
//     if (totalStoriesCreated >= 1) achievements.push({ 
//       id: 'first_story', 
//       title: 'First Story', 
//       description: 'Completed your very first story!', 
//       earnedAt: storySessions[0]?.createdAt || new Date(),
//       category: 'writing' as const
//     });
//     if (totalStoriesCreated >= 5) achievements.push({ 
//       id: 'five_stories', 
//       title: 'Story Explorer', 
//       description: 'Written 5 amazing stories!', 
//       earnedAt: storySessions[4]?.createdAt || new Date(),
//       category: 'writing' as const
//     });
//     if (totalWordsWritten >= 1000) achievements.push({ 
//       id: 'thousand_words', 
//       title: 'Word Master', 
//       description: 'Written over 1,000 words!', 
//       earnedAt: new Date(),
//       category: 'writing' as const
//     });
//     if (bestScore >= 90) achievements.push({ 
//       id: 'excellent_score', 
//       title: 'Excellence Award', 
//       description: 'Achieved a 90%+ story score!', 
//       earnedAt: new Date(),
//       category: 'quality' as const
//     });
//     if (writingStreak >= 3) achievements.push({ 
//       id: 'consistent_writer', 
//       title: 'Consistent Writer', 
//       description: 'Writing streak of 3+ days!', 
//       earnedAt: new Date(),
//       category: 'consistency' as const
//     });

//     // Current goals
//     const goals = [
//       {
//         id: 'complete_5_stories',
//         title: 'Complete 5 Stories This Month',
//         target: 5,
//         current: monthly.storiesCreated,
//         type: 'stories' as const
//       },
//       {
//         id: 'write_1000_words',
//         title: 'Write 1,000 Words',
//         target: 1000,
//         current: monthly.wordsWritten,
//         type: 'words' as const
//       },
//       {
//         id: 'maintain_streak',
//         title: 'Maintain 7-Day Streak',
//         target: 7,
//         current: writingStreak,
//         type: 'streak' as const
//       },
//       {
//         id: 'achieve_90_score',
//         title: 'Achieve 90% Average Score',
//         target: 90,
//         current: monthly.averageScore,
//         type: 'score' as const
//       }
//     ];

//     const progressData = {
//       overview: {
//         totalStoriesCreated,
//         totalWordsWritten,
//         averageWordsPerStory,
//         writingStreak,
//         completionRate,
//         bestScore,
//         averageScore
//       },
//       monthly,
//       weekly: weeklyProgress,
//       achievements,
//       skills,
//       goals
//     };

//     return NextResponse.json({ success: true, progress: progressData });

//   } catch (error) {
//     console.error('Error fetching progress data:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch progress data' },
//       { status: 500 }
//     );
//   }
// }



// app/api/user/progress/route.ts - PROPER VERSION READING FROM DATABASE
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const userSession = await getServerSession(authOptions);

    if (!userSession || userSession.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Unauthorized access. Children only.' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'month';
    
    console.log('📊 Fetching REAL progress data for user:', userSession.user.id);

    const childId = new mongoose.Types.ObjectId(userSession.user.id);

    // Get ALL story sessions for this child
    const storySessions = await StorySession.find({ childId }).sort({ createdAt: -1 });
    
    console.log('📚 Found story sessions:', storySessions.length);

    // Calculate REAL overview statistics
    const totalStoriesCreated = storySessions.length;
    const completedStories = storySessions.filter(s => s.status === 'completed');
    const totalWordsWritten = storySessions.reduce((sum, session) => sum + (session.childWords || 0), 0);
    const averageWordsPerStory = totalStoriesCreated > 0 ? Math.round(totalWordsWritten / totalStoriesCreated) : 0;
    
    // Calculate REAL scores from your actual assessment data
    const scoresFromNewAssessments = completedStories
      .filter(story => story.assessment)
      .map(story => ({
        grammar: story.assessment.grammarScore,
        creativity: story.assessment.creativityScore,
        overall: story.assessment.overallScore
      }));
    
    const scoresFromLegacyFields = completedStories
      .filter(story => story.overallScore && !story.assessment)
      .map(story => ({
        grammar: story.grammarScore || 0,
        creativity: story.creativityScore || 0,
        overall: story.overallScore || 0
      }));

    const allScores = [...scoresFromNewAssessments, ...scoresFromLegacyFields];
    
    const bestScore = allScores.length > 0 ? Math.max(...allScores.map(s => s.overall)) : 0;
    const averageScore = allScores.length > 0 ? 
      Math.round(allScores.reduce((sum, score) => sum + score.overall, 0) / allScores.length) : 0;

    // Get current month data based on timeframe
    const now = new Date();
    let timeStart: Date;
    
    if (timeframe === 'week') {
      timeStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === 'year') {
      timeStart = new Date(now.getFullYear(), 0, 1);
    } else {
      timeStart = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    const periodStories = storySessions.filter(s => s.createdAt >= timeStart);
    const periodCompletedStories = periodStories.filter(s => s.status === 'completed');
    
    // Calculate REAL weekly data for chart (last 7 days)
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayStories = storySessions.filter(s => {
        const storyDate = new Date(s.createdAt).toISOString().split('T')[0];
        return storyDate === dateStr && s.status === 'completed';
      });
      
      const dayScores = dayStories
        .map(story => story.assessment?.overallScore || story.overallScore || 0)
        .filter(score => score > 0);
      
      return {
        date: dateStr,
        stories: dayStories.length,
        words: dayStories.reduce((sum, story) => sum + (story.childWords || 0), 0),
        score: dayScores.length > 0 ? Math.round(dayScores.reduce((a, b) => a + b, 0) / dayScores.length) : 0
      };
    });

    // Calculate REAL skills from your actual assessment data
    const skills = {
      grammar: {
        current: allScores.length > 0 ? 
          Math.round(allScores.reduce((sum, score) => sum + score.grammar, 0) / allScores.length) : 0,
        improvement: 0 // You can calculate this by comparing recent vs older stories
      },
      creativity: {
        current: allScores.length > 0 ? 
          Math.round(allScores.reduce((sum, score) => sum + score.creativity, 0) / allScores.length) : 0,
        improvement: 0
      },
      vocabulary: {
        current: allScores.length > 0 ? 
          Math.round(allScores.reduce((sum, score) => sum + (score.grammar * 0.9), 0) / allScores.length) : 0, // Estimate from grammar
        improvement: 0
      },
      storytelling: {
        current: allScores.length > 0 ? 
          Math.round(allScores.reduce((sum, score) => sum + (score.creativity * 0.95), 0) / allScores.length) : 0, // Estimate from creativity
        improvement: 0
      }
    };

    // Calculate writing streak (consecutive days with completed stories)
    const writingStreak = calculateWritingStreak(completedStories);

    const progressData = {
      overview: {
        totalStoriesCreated,
        totalWordsWritten,
        averageWordsPerStory,
        writingStreak,
        completionRate: totalStoriesCreated > 0 ? Math.round((completedStories.length / totalStoriesCreated) * 100) : 0,
        bestScore,
        averageScore,
      },
      monthly: {
        storiesCreated: periodCompletedStories.length,
        wordsWritten: periodStories.reduce((sum, story) => sum + (story.childWords || 0), 0),
        averageScore: periodCompletedStories.length > 0 ? 
          Math.round(periodCompletedStories
            .map(s => s.assessment?.overallScore || s.overallScore || 0)
            .filter(score => score > 0)
            .reduce((a, b) => a + b, 0) / periodCompletedStories.length) : 0,
        daysActive: new Set(periodStories.map(s => new Date(s.createdAt).toDateString())).size,
      },
      weekly: weeklyData,
      achievements: generateAchievements(completedStories),
      skills,
      goals: generateGoals(totalStoriesCreated, totalWordsWritten, writingStreak, averageScore, periodCompletedStories.length),
    };

    console.log('✅ REAL progress data calculated:', {
      totalStories: totalStoriesCreated,
      completedStories: completedStories.length,
      bestScore,
      averageScore,
      skills: skills,
      timeframe
    });

    return NextResponse.json({
      success: true,
      progress: progressData,
    });

  } catch (error) {
    console.error('❌ Error fetching progress data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress data' },
      { status: 500 }
    );
  }
}

// Helper function to calculate writing streak
function calculateWritingStreak(completedStories: any[]): number {
  if (completedStories.length === 0) return 0;
  
  const today = new Date();
  let streak = 0;
  let currentDate = new Date(today);
  
  // Go backwards day by day to find consecutive days
  for (let i = 0; i < 30; i++) { // Check last 30 days max
    const dateStr = currentDate.toISOString().split('T')[0];
    const hasStoryOnDate = completedStories.some(story => {
      const storyDate = new Date(story.createdAt).toISOString().split('T')[0];
      return storyDate === dateStr;
    });
    
    if (hasStoryOnDate) {
      streak++;
    } else if (streak > 0) {
      break; // Streak broken
    }
    
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  return streak;
}

// Helper function to generate achievements
function generateAchievements(completedStories: any[]) {
  const achievements = [];
  
  if (completedStories.length >= 1) {
    achievements.push({
      id: '1',
      title: 'First Story',
      description: 'Completed your very first story!',
      earnedAt: completedStories[completedStories.length - 1].createdAt,
      category: 'writing' as const,
    });
  }
  
  if (completedStories.length >= 5) {
    achievements.push({
      id: '2',
      title: 'Storyteller',
      description: 'Completed 5 amazing stories!',
      earnedAt: completedStories[4].createdAt,
      category: 'consistency' as const,
    });
  }
  
  return achievements;
}

// Helper function to generate goals
function generateGoals(totalStories: number, totalWords: number, streak: number, avgScore: number, monthlyStories: number) {
  return [
    {
      id: '1',
      title: 'Complete 5 Stories This Month',
      target: 5,
      current: monthlyStories,
      type: 'stories' as const,
    },
    {
      id: '2',
      title: 'Write 1,000 Words',
      target: 1000,
      current: totalWords,
      type: 'words' as const,
    },
    {
      id: '3',
      title: 'Maintain 7-Day Streak',
      target: 7,
      current: streak,
      type: 'streak' as const,
    },
    {
      id: '4',
      title: 'Achieve 90% Average Score',
      target: 90,
      current: avgScore,
      type: 'score' as const,
    },
  ];
}