// // 1. Fix lib/competition-manager.ts - Add missing static methods and imports
// import { connectToDatabase } from '@/utils/db';
// import Competition from '@/models/Competition';
// import StorySession from '@/models/StorySession';
// import User from '@/models/User';
// import { COMPETITION_CONFIG, getCompetitionSchedule, getCurrentCompetitionPhase } from '@/config/competition';
// import { sendCompetitionSubmissionConfirmation } from '@/lib/mailer';

// export class CompetitionManager {
//   /**
//    * Create or get current month's competition
//    */
//   static async getCurrentCompetition() {
//     await connectToDatabase();

//     const now = new Date();
//     const currentMonth = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
//     const [monthName, year] = currentMonth.split(' ');

//     let competition = await Competition.findOne({
//       month: monthName,
//       year: parseInt(year),
//       isActive: true,
//     });

//     if (!competition) {
//       competition = await this.createMonthlyCompetition(parseInt(year), now.getMonth() + 1);
//     }

//     return competition;
//   }

//   /**
//    * Create new monthly competition
//    */
//   static async createMonthlyCompetition(year: number, month: number) {
//     const now = new Date();
//     const monthName = new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long' });

//     // Create admin user reference (first admin in system)
//     const adminUser = await User.findOne({ role: 'admin' });
//     if (!adminUser) {
//       throw new Error('No admin user found to create competition');
//     }

//     // Calculate competition dates
//     const submissionStart = new Date(year, month - 1, 1);
//     const submissionEnd = new Date(year, month - 1, 25);
//     const judgingStart = new Date(year, month - 1, 26);
//     const judgingEnd = new Date(year, month - 1, 30);
//     const resultsDate = new Date(year, month - 1, 31);

//     const competition = new Competition({
//       month: monthName,
//       year: year,
//       phase: 'submission',
//       submissionStart,
//       submissionEnd,
//       judgingStart,
//       judgingEnd,
//       resultsDate,
//       maxEntriesPerChild: 3,
//       totalSubmissions: 0,
//       totalParticipants: 0,
//       winners: [],
//       isActive: true,
//       isArchived: false,
//       createdBy: adminUser._id,
//       judgingCriteria: {
//         creativity: { weight: 0.25, maxScore: 25 },
//         grammar: { weight: 0.20, maxScore: 20 },
//         vocabulary: { weight: 0.15, maxScore: 15 },
//         plotStructure: { weight: 0.20, maxScore: 20 },
//         characterDevelopment: { weight: 0.10, maxScore: 10 },
//         originalThinking: { weight: 0.10, maxScore: 10 }
//       },
//     });

//     const savedCompetition = await competition.save();

//     console.log(`✅ Created ${monthName} ${year} competition:`, savedCompetition._id);
//     return savedCompetition;
//   }

//   /**
//    * Submit story to competition
//    */
//   static async submitStory(storyId: string, childId: string) {
//     await connectToDatabase();

//     // Check if story is published and competition eligible
//     const story = await StorySession.findById(storyId);
//     if (!story || !story.isPublished || !story.competitionEligible) {
//       throw new Error('Story must be published to enter competition');
//     }

//     // Check if story is already submitted
//     if (story.competitionEntries && story.competitionEntries.length > 0) {
//       const currentCompetition = await this.getCurrentCompetition();
//       const alreadySubmitted = story.competitionEntries.some(
//         (entry: any) => entry.competitionId.toString() === currentCompetition._id.toString()
//       );
//       if (alreadySubmitted) {
//         throw new Error('Story already submitted to this competition');
//       }
//     }

//     // Check user's monthly competition limit
//     const user = await User.findById(childId);
//     if (!user) {
//       throw new Error('User not found');
//     }

//     if (user.competitionEntriesThisMonth >= 3) {
//       throw new Error('Maximum 3 entries per month reached');
//     }

//     const competition = await this.getCurrentCompetition();
//     if (competition.phase !== 'submission') {
//       throw new Error('Competition submission phase has ended');
//     }

//     // Submit story to competition
//     const submissionEntry = {
//       competitionId: competition._id,
//       submittedAt: new Date(),
//       score: 0,
//       rank: 0,
//       aiJudgingNotes: ''
//     };

//     // Update story with competition entry
//     await StorySession.findByIdAndUpdate(storyId, {
//       $push: { competitionEntries: submissionEntry }
//     });

//     // Update user's competition entries count
//     await User.findByIdAndUpdate(childId, {
//       $inc: { competitionEntriesThisMonth: 1 }
//     });

//     // Update competition total submissions
//     await Competition.findByIdAndUpdate(competition._id, {
//       $inc: { totalSubmissions: 1 }
//     });

//     // Send submission confirmation email
//     try {
//       await sendCompetitionSubmissionConfirmation(childId, storyId, competition._id.toString());
//     } catch (emailError) {
//       console.error('Failed to send submission confirmation email:', emailError);
//     }

//     console.log(`✅ Story ${storyId} submitted to ${competition.month} competition`);
//     return submissionEntry;
//   }

//   /**
//    * Advance competition phase
//    */
//   static async advancePhase(competitionId?: string) {
//     await connectToDatabase();

//     const competition = competitionId
//       ? await Competition.findById(competitionId)
//       : await this.getCurrentCompetition();

//     if (!competition) {
//       throw new Error('Competition not found');
//     }

//     const now = new Date();

//     switch (competition.phase) {
//       case 'submission':
//         if (now >= competition.submissionEnd) {
//           competition.phase = 'judging';
//           await competition.save();

//           // Start AI judging process
//           await this.startAIJudging(competition._id.toString());

//           console.log(`🤖 Competition ${competition.month} moved to JUDGING phase`);
//         }
//         break;

//       case 'judging':
//         if (now >= competition.judgingEnd) {
//           competition.phase = 'results';
//           await competition.save();

//           // Finalize results and determine winners
//           await this.finalizeResults(competition._id.toString());

//           console.log(`🏆 Competition ${competition.month} moved to RESULTS phase`);
//         }
//         break;

//       case 'results':
//         if (now >= competition.resultsDate) {
//           competition.isActive = false;
//           competition.isArchived = true;
//           await competition.save();

//           console.log(`📁 Competition ${competition.month} ARCHIVED`);
//         }
//         break;
//     }

//     return competition;
//   }

//   /**
//    * Start AI judging process
//    */
//   static async startAIJudging(competitionId: string) {
//     const competition = await Competition.findById(competitionId);
//     if (!competition) throw new Error('Competition not found');

//     // Get all submitted stories
//     const submittedStories = await StorySession.find({
//       'competitionEntries.competitionId': competitionId
//     }).populate('childId', 'firstName lastName email');

//     console.log(`🤖 Starting AI judging for ${submittedStories.length} stories`);

//     for (const story of submittedStories) {
//       // Calculate AI score based on multiple criteria
//       const judgedScore = await this.calculateAIScore(story);

//       // Update story with AI judgment
//       await StorySession.findOneAndUpdate(
//         {
//           _id: story._id,
//           'competitionEntries.competitionId': competitionId
//         },
//         {
//           $set: {
//             'competitionEntries.$.score': judgedScore.totalScore,
//             'competitionEntries.$.aiJudgingNotes': judgedScore.feedback
//           }
//         }
//       );

//       console.log(`📊 Judged "${story.title}": ${judgedScore.totalScore}/100`);
//     }
//   }

//   /**
//    * Calculate AI score for story
//    */
//   static async calculateAIScore(story: any) {
//     const content = story.collaborativeContent || story.freeformContent || '';
//     const wordCount = content.split(' ').length;

//     // AI scoring criteria (simulated - replace with actual AI assessment)
//     const scores = {
//       creativity: Math.min(25, Math.random() * 20 + (wordCount > 200 ? 5 : 0)),
//       grammar: Math.min(20, Math.random() * 15 + 5),
//       vocabulary: Math.min(15, Math.random() * 12 + 3),
//       plotStructure: Math.min(20, Math.random() * 15 + (wordCount > 300 ? 5 : 0)),
//       characterDevelopment: Math.min(10, Math.random() * 8 + 2),
//       originalThinking: Math.min(10, Math.random() * 8 + 2)
//     };

//     const totalScore = Math.round(
//       scores.creativity +
//       scores.grammar +
//       scores.vocabulary +
//       scores.plotStructure +
//       scores.characterDevelopment +
//       scores.originalThinking
//     );

//     const feedback = this.generateJudgingFeedback(scores, wordCount);

//     return { totalScore, scores, feedback };
//   }

//   /**
//    * Generate judging feedback
//    */
//   static generateJudgingFeedback(scores: any, wordCount: number): string {
//     let feedback = `Story Length: ${wordCount} words\n\n`;

//     if (scores.creativity > 20) {
//       feedback += "🌟 Exceptional creativity and imagination!\n";
//     } else if (scores.creativity > 15) {
//       feedback += "✨ Good creative elements present.\n";
//     }

//     if (scores.grammar > 15) {
//       feedback += "📝 Excellent grammar and mechanics.\n";
//     } else if (scores.grammar > 10) {
//       feedback += "📝 Good grammar with minor improvements needed.\n";
//     } else {
//       feedback += "📝 Focus on grammar and sentence structure.\n";
//     }

//     if (scores.vocabulary > 12) {
//       feedback += "📚 Rich vocabulary usage.\n";
//     } else if (scores.vocabulary > 8) {
//       feedback += "📚 Good word choices.\n";
//     }

//     if (scores.plotStructure > 15) {
//       feedback += "🎭 Well-structured story with clear plot.\n";
//     } else {
//       feedback += "🎭 Work on story structure and flow.\n";
//     }

//     feedback += "\nKeep writing and improving! 🚀";
//     return feedback;
//   }

//   /**
//    * Finalize competition results
//    */
//   static async finalizeResults(competitionId: string) {
//     const competition = await Competition.findById(competitionId);
//     if (!competition) throw new Error('Competition not found');

//     // Get all submitted stories with scores
//     const submittedStories = await StorySession.find({
//       'competitionEntries.competitionId': competitionId
//     }).populate('childId', 'firstName lastName email');

//     // Extract and sort by scores
//     const rankedEntries = submittedStories
//       .map(story => {
//         const entry = story.competitionEntries.find(
//           (e: any) => e.competitionId.toString() === competitionId
//         );
//         return {
//           childId: story.childId._id,
//           childName: `${story.childId.firstName} ${story.childId.lastName}`,
//           childEmail: story.childId.email,
//           storyId: story._id,
//           title: story.title,
//           score: entry.score,
//           aiJudgingNotes: entry.aiJudgingNotes
//         };
//       })
//       .sort((a, b) => b.score - a.score);

//     // Select top 3 winners
//     const winners = rankedEntries.slice(0, 3).map((entry, index) => ({
//       position: index + 1,
//       childId: entry.childId,
//       childName: entry.childName,
//       childEmail: entry.childEmail,
//       storyId: entry.storyId,
//       title: entry.title,
//       score: entry.score,
//       aiJudgingNotes: entry.aiJudgingNotes
//     }));

//     // Update competition with winners
//     competition.winners = winners;
//     competition.totalParticipants = new Set(rankedEntries.map(e => e.childId.toString())).size;
//     await competition.save();

//     // Update story sessions with rankings
//     for (let i = 0; i < rankedEntries.length; i++) {
//       await StorySession.findOneAndUpdate(
//         {
//           _id: rankedEntries[i].storyId,
//           'competitionEntries.competitionId': competitionId
//         },
//         {
//           $set: {
//             'competitionEntries.$.rank': i + 1
//           }
//         }
//       );
//     }

//     console.log(`🏆 Competition ${competition.month} results finalized:`,
//       winners.map(w => `${w.position}. ${w.childName} (${w.score})`));

//     return { winners, totalParticipants: rankedEntries.length };
//   }

//   /**
//    * Get competition statistics
//    */
//   static async getCompetitionStats(competitionId?: string) {
//     await connectToDatabase();

//     const competition = competitionId
//       ? await Competition.findById(competitionId)
//       : await this.getCurrentCompetition();

//     if (!competition) return null;

//     const submittedStories = await StorySession.countDocuments({
//       'competitionEntries.competitionId': competition._id
//     });

//     const participatingChildren = await StorySession.distinct('childId', {
//       'competitionEntries.competitionId': competition._id
//     });

//     return {
//       competitionId: competition._id,
//       month: competition.month,
//       year: competition.year,
//       phase: competition.phase,
//       submissionStart: competition.submissionStart,
//       submissionEnd: competition.submissionEnd,
//       judgingStart: competition.judgingStart,
//       judgingEnd: competition.judgingEnd,
//       resultsDate: competition.resultsDate,
//       totalSubmissions: submittedStories,
//       totalParticipants: participatingChildren.length,
//       maxEntriesPerChild: competition.maxEntriesPerChild,
//       winners: competition.winners,
//       daysLeft: this.getDaysUntilPhaseEnd(competition),
//       isActive: competition.isActive
//     };
//   }

//   /**
//    * Get days until current phase ends
//    */
//   static getDaysUntilPhaseEnd(competition: any): number {
//     const now = new Date();
//     let targetDate: Date;

//     switch (competition.phase) {
//       case 'submission':
//         targetDate = competition.submissionEnd;
//         break;
//       case 'judging':
//         targetDate = competition.judgingEnd;
//         break;
//       case 'results':
//         targetDate = competition.resultsDate;
//         break;
//       default:
//         return 0;
//     }

//     const diffTime = targetDate.getTime() - now.getTime();
//     return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
//   }

//   /**
//    * Check if user can submit to competition
//    */
//   static async canUserSubmit(userId: string): Promise<{
//     allowed: boolean;
//     reason?: string;
//     entriesUsed: number;
//     entriesLimit: number;
//   }> {
//     await connectToDatabase();

//     const user = await User.findById(userId);
//     if (!user) {
//       return { allowed: false, reason: 'User not found', entriesUsed: 0, entriesLimit: 0 };
//     }

//     const competition = await this.getCurrentCompetition();
//     if (!competition || competition.phase !== 'submission') {
//       return {
//         allowed: false,
//         reason: 'No active competition or submission phase ended',
//         entriesUsed: user.competitionEntriesThisMonth,
//         entriesLimit: 3
//       };
//     }

//     if (user.competitionEntriesThisMonth >= 3) {
//       return {
//         allowed: false,
//         reason: 'Maximum 3 entries per month reached',
//         entriesUsed: user.competitionEntriesThisMonth,
//         entriesLimit: 3
//       };
//     }

//     return {
//       allowed: true,
//       entriesUsed: user.competitionEntriesThisMonth,
//       entriesLimit: 3
//     };
//   }

//   /**
//    * Get user's competition entries for current month
//    */
//   static async getUserCompetitionEntries(userId: string) {
//     await connectToDatabase();

//     const competition = await this.getCurrentCompetition();
//     if (!competition) return [];

//     const userStories = await StorySession.find({
//       childId: userId,
//       'competitionEntries.competitionId': competition._id
//     }).select('title competitionEntries createdAt');

//     return userStories.map(story => {
//       const entry = story.competitionEntries.find(
//         (e: any) => e.competitionId.toString() === competition._id.toString()
//       );
//       return {
//         storyId: story._id,
//         title: story.title,
//         submittedAt: entry.submittedAt,
//         score: entry.score,
//         rank: entry.rank,
//         phase: competition.phase
//       };
//     });
//   }
// }

// // Export singleton instance
// export const competitionManager = new CompetitionManager();

// lib/competition-manager.ts - Competition automation and management
import { connectToDatabase } from '@/utils/db';
import Competition from '@/models/Competition';
import StorySession from '@/models/StorySession';
import User from '@/models/User';
import {
  COMPETITION_CONFIG,
  getCompetitionSchedule,
  getCurrentCompetitionPhase,
} from '@/config/competition';
import { sendCompetitionSubmissionConfirmation } from '@/lib/mailer';

export class CompetitionManager {
  /**
   * Check if user can submit to competition
   */
  static async canUserSubmit(userId: string): Promise<{
    canSubmit: boolean;
    reason?: string;
    entriesUsed: number;
    maxEntries: number;
    currentPhase: string;
  }> {
    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) {
      return {
        canSubmit: false,
        reason: 'User not found',
        entriesUsed: 0,
        maxEntries: 3,
        currentPhase: 'unknown',
      };
    }

    const competition = await this.getCurrentCompetition();
    if (!competition) {
      return {
        canSubmit: false,
        reason: 'No active competition',
        entriesUsed: user.competitionEntriesThisMonth || 0,
        maxEntries: 3,
        currentPhase: 'none',
      };
    }

    // Check if in submission phase
    if (competition.phase !== 'submission') {
      return {
        canSubmit: false,
        reason: `Competition is in ${competition.phase} phase`,
        entriesUsed: user.competitionEntriesThisMonth || 0,
        maxEntries: 3,
        currentPhase: competition.phase,
      };
    }

    // Check monthly entries limit
    const entriesUsed = user.competitionEntriesThisMonth || 0;
    const maxEntries = 3;

    if (entriesUsed >= maxEntries) {
      return {
        canSubmit: false,
        reason: `Monthly entry limit reached (${maxEntries} max)`,
        entriesUsed,
        maxEntries,
        currentPhase: competition.phase,
      };
    }

    return {
      canSubmit: true,
      entriesUsed,
      maxEntries,
      currentPhase: competition.phase,
    };
  }

  /**
   * Get user's competition entries for current month
   */
  static async getUserCompetitionEntries(userId: string) {
    await connectToDatabase();

    const competition = await this.getCurrentCompetition();
    if (!competition) return [];

    const entries = await StorySession.find({
      childId: userId,
      competitionId: competition._id,
      isPublished: true,
    }).select('title storyNumber createdAt competitionScore competitionRank');

    return entries;
  }

  /**
   * Submit story to competition
   */
  static async submitStory(storyId: string, userId: string) {
    await connectToDatabase();

    const [story, competition] = await Promise.all([
      StorySession.findById(storyId),
      this.getCurrentCompetition(),
    ]);

    if (!story) {
      throw new Error('Story not found');
    }

    if (!competition) {
      throw new Error('No active competition');
    }

    if (story.childId.toString() !== userId) {
      throw new Error('Not authorized to submit this story');
    }

    if (!story.isPublished) {
      throw new Error(
        'Story must be published before submitting to competition'
      );
    }

    if (story.competitionId) {
      throw new Error('Story already submitted to a competition');
    }

    // Update story with competition info
    await StorySession.findByIdAndUpdate(storyId, {
      competitionId: competition._id,
      submittedToCompetition: true,
      competitionSubmissionDate: new Date(),
    });

    // Increment user's competition entries
    await User.findByIdAndUpdate(userId, {
      $inc: { competitionEntriesThisMonth: 1 },
      $set: { lastActiveDate: new Date() },
    });

    // Send confirmation email
    try {
      await sendCompetitionSubmissionConfirmation(
        userId,
        storyId,
        competition._id.toString()
      );
    } catch (emailError) {
      console.error('Failed to send competition submission email:', emailError);
      // Don't fail the entire submission for email issues
    }

    return {
      success: true,
      competitionId: competition._id,
      submissionDate: new Date(),
    };
  }

  /**
   * Get current competition
   */
  static async getCurrentCompetition() {
    await connectToDatabase();

    const now = new Date();
    const currentMonth = now.toLocaleDateString('en-US', { month: 'long' });
    const currentYear = now.getFullYear();

    let competition = await Competition.findOne({
      month: currentMonth,
      year: currentYear,
      isActive: true,
    });

    if (!competition) {
      competition = await this.createMonthlyCompetition(
        currentYear,
        now.getMonth() + 1
      );
    }

    return competition;
  }

  /**
   * Create new monthly competition
   */
  static async createMonthlyCompetition(year: number, month: number) {
    const schedule = getCompetitionSchedule(year, month);
    const monthName = new Date(year, month - 1, 1).toLocaleDateString('en-US', {
      month: 'long',
    });

    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      throw new Error('No admin user found to create competition');
    }

    const competition = new Competition({
      month: monthName,
      year: year,
      phase: 'submission',
      submissionStart: schedule.submissionStart,
      submissionEnd: schedule.submissionEnd,
      judgingStart: schedule.judgingStart,
      judgingEnd: schedule.judgingEnd,
      resultsDate: schedule.resultsDate,
      isActive: true,
      createdBy: adminUser._id,
      entries: [],
      winners: [],
      judgingCriteria: COMPETITION_CONFIG.judgingCriteria,
    });

    await competition.save();
    return competition;
  }

  /**
   * Get competition statistics
   */
  static async getCompetitionStats(competitionId?: string) {
    await connectToDatabase();

    const competition = competitionId
      ? await Competition.findById(competitionId)
      : await this.getCurrentCompetition();

    if (!competition) return null;

    const totalEntries = await StorySession.countDocuments({
      competitionId: competition._id,
      isPublished: true,
    });

    const uniqueParticipants = await StorySession.distinct('childId', {
      competitionId: competition._id,
      isPublished: true,
    });

    return {
      ...competition.toObject(),
      totalEntries,
      uniqueParticipants: uniqueParticipants.length,
    };
  }

  /**
   * Advance competition phase
   */
  static async advancePhase(competitionId: string) {
    await connectToDatabase();

    const competition = await Competition.findById(competitionId);
    if (!competition) {
      throw new Error('Competition not found');
    }

    const now = new Date();
    let newPhase = competition.phase;

    // Determine new phase based on schedule
    if (now > competition.resultsDate) {
      newPhase = 'ended';
      competition.isActive = false;
    } else if (now > competition.judgingEnd) {
      newPhase = 'results';
    } else if (now > competition.submissionEnd) {
      newPhase = 'judging';

      // Start AI judging process
      if (competition.phase === 'submission') {
        await this.runAIJudging(competitionId);
      }
    }

    if (newPhase !== competition.phase) {
      competition.phase = newPhase;
      await competition.save();

      console.log(
        `Competition ${competition.month} ${competition.year} advanced to ${newPhase} phase`
      );
    }

    return competition;
  }

  /**
   * Run AI judging for competition
   */
  static async runAIJudging(competitionId: string) {
    const entries = await StorySession.find({
      competitionId: competitionId,
      isPublished: true,
    });

    // Simple scoring algorithm (can be enhanced with actual AI)
    const scoredEntries = entries
      .map((entry) => {
        const wordCount = entry.totalWords || 0;
        const score = Math.min(
          100,
          Math.max(0, (wordCount / 1000) * 100 + Math.random() * 10)
        );

        return {
          ...entry.toObject(),
          competitionScore: Math.round(score),
        };
      })
      .sort((a, b) => b.competitionScore - a.competitionScore);

    // Update entries with scores and ranks
    for (let i = 0; i < scoredEntries.length; i++) {
      await StorySession.findByIdAndUpdate(scoredEntries[i]._id, {
        competitionScore: scoredEntries[i].competitionScore,
        competitionRank: i + 1,
      });
    }

    // Update competition with winners
    const winners = scoredEntries.slice(0, 3).map((entry, index) => ({
      storyId: entry._id,
      childId: entry.childId,
      rank: index + 1,
      score: entry.competitionScore,
    }));

    await Competition.findByIdAndUpdate(competitionId, {
      winners,
      judgingCompleted: true,
    });

    console.log(
      `AI judging completed for competition ${competitionId}. ${entries.length} entries judged.`
    );
  }
}

// Export singleton instance
export const competitionManager = CompetitionManager;
