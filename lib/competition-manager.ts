// lib/competition-manager.ts - COMPLETE VERSION
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
   * Get current active competition
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
      competition = await this.createMonthlyCompetition(currentYear, now.getMonth() + 1);
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
    console.log(`✅ Created competition: ${monthName} ${year}`);
    return competition;
  }

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
      'competitionEntries.competitionId': competition._id
    }).select('title competitionEntries createdAt').lean();

    return entries.map((story: any) => {
      const entry = story.competitionEntries.find(
        (e: any) => e.competitionId.toString() === competition._id.toString()
      );
      return {
        storyId: story._id,
        title: story.title,
        submittedAt: entry.submittedAt,
        score: entry.score,
        rank: entry.rank,
        phase: competition.phase
      };
    });
  }

  /**
   * Submit story to competition
   */
  static async submitStoryToCompetition(storyId: string, userId: string) {
    await connectToDatabase();

    const competition = await this.getCurrentCompetition();
    if (!competition) {
      throw new Error('No active competition found');
    }

    if (competition.phase !== 'submission') {
      throw new Error('Submission phase has ended');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user has reached entry limit
    const entriesUsed = user.competitionEntriesThisMonth || 0;
    if (entriesUsed >= 3) {
      throw new Error('Maximum 3 entries per month already submitted');
    }

    const story = await StorySession.findById(storyId);
    if (!story) {
      throw new Error('Story not found');
    }

    if (story.childId.toString() !== userId) {
      throw new Error('You can only submit your own stories');
    }

    if (!story.isPublished) {
      throw new Error('Story must be published before competition submission');
    }

    // Check if already submitted to this competition
    const existingEntry = story.competitionEntries?.find(
      (e: any) => e.competitionId.toString() === competition._id.toString()
    );
    
    if (existingEntry) {
      throw new Error('Story already submitted to this competition');
    }

    // Add competition entry to story
    const competitionEntry = {
      competitionId: competition._id,
      submittedAt: new Date(),
      phase: 'submission'
    };

    await StorySession.findByIdAndUpdate(storyId, {
      $push: { competitionEntries: competitionEntry }
    });

    // Increment user's monthly competition entries
    await User.findByIdAndUpdate(userId, {
      $inc: { competitionEntriesThisMonth: 1 }
    });

    // Send confirmation email
    try {
      await sendCompetitionSubmissionConfirmation(user.email, story.title, competition.month);
    } catch (emailError) {
      console.error('Failed to send submission confirmation:', emailError);
    }

    return {
      success: true,
      competitionId: competition._id,
      submissionDate: new Date(),
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

    switch (competition.phase) {
      case 'submission':
        if (now >= competition.judgingStart) {
          competition.phase = 'judging';
          await competition.save();
          console.log(`📊 Competition ${competition.month} moved to JUDGING phase`);
          
          // Start AI judging process
          await this.startAIJudging(competitionId);
        }
        break;

      case 'judging':
        if (now >= competition.resultsDate) {
          competition.phase = 'results';
          await competition.save();
          console.log(`🏆 Competition ${competition.month} moved to RESULTS phase`);
          
          // Finalize results
          await this.finalizeResults(competitionId);
        }
        break;

      case 'results':
        if (now >= competition.resultsDate) {
          competition.isActive = false;
          await competition.save();
          console.log(`📁 Competition ${competition.month} COMPLETED`);
        }
        break;
    }

    return competition;
  }

  /**
   * Start AI judging process
   */
  static async startAIJudging(competitionId: string) {
    const competition = await Competition.findById(competitionId);
    if (!competition) throw new Error('Competition not found');

    // Get all submitted stories
    const submittedStories = await StorySession.find({
      'competitionEntries.competitionId': competitionId
    }).populate('childId', 'name email');

    console.log(`🤖 Starting AI judging for ${submittedStories.length} stories`);

    for (const story of submittedStories) {
      // Use existing assessment or calculate score
      const judgedScore = await this.calculateCompetitionScore(story);

      // Update story with AI judgment
      await StorySession.findOneAndUpdate(
        {
          _id: story._id,
          'competitionEntries.competitionId': competitionId
        },
        {
          $set: {
            'competitionEntries.$.score': judgedScore.totalScore,
            'competitionEntries.$.phase': 'judging'
          }
        }
      );

      console.log(`📊 Judged "${story.title}": ${judgedScore.totalScore}/100`);
    }
  }

  /**
   * Calculate competition score based on existing assessment
   */
  static async calculateCompetitionScore(story: any) {
    const assessment = story.assessment;
    
    if (assessment) {
      // Use existing assessment scores with competition weights
      const totalScore = Math.round(
        (assessment.grammarScore || 0) * 0.20 +
        (assessment.creativityScore || 0) * 0.25 +
        (assessment.structureScore || 0) * 0.15 +
        (assessment.characterScore || 0) * 0.15 +
        (assessment.plotScore || 0) * 0.15 +
        (assessment.vocabularyScore || 0) * 0.10
      );
      
      return { totalScore };
    } else {
      // Fallback scoring if no assessment exists
      const wordCount = story.totalWords || story.childWords || 0;
      const totalScore = Math.min(100, Math.max(50, 60 + (wordCount > 500 ? 20 : 10) + Math.random() * 20));
      
      return { totalScore: Math.round(totalScore) };
    }
  }

  /**
   * Finalize competition results
   */
  static async finalizeResults(competitionId: string) {
    const competition = await Competition.findById(competitionId);
    if (!competition) throw new Error('Competition not found');

    // Get all submitted stories with scores
    const submittedStories = await StorySession.find({
      'competitionEntries.competitionId': competitionId
    }).populate('childId', 'name email');

    // Extract and sort by scores
    const rankedEntries = submittedStories
      .map((story: any) => {
        const entry = story.competitionEntries.find(
          (e: any) => e.competitionId.toString() === competitionId
        );
        return {
          childId: story.childId._id,
          childName: story.childId.name,
          childEmail: story.childId.email,
          storyId: story._id,
          title: story.title,
          score: entry.score || 0
        };
      })
      .sort((a, b) => b.score - a.score);

    // Select top 3 winners
    const winners = rankedEntries.slice(0, 3).map((entry, index) => ({
      position: index + 1,
      childId: entry.childId,
      childName: entry.childName,
      storyId: entry.storyId,
      title: entry.title,
      score: entry.score,
      aiJudgingNotes: `Competition score: ${entry.score}%`
    }));

    // Update competition with winners
    competition.winners = winners;
    competition.totalParticipants = new Set(rankedEntries.map(e => e.childId.toString())).size;
    competition.totalSubmissions = rankedEntries.length;
    await competition.save();

    // Update story sessions with rankings
    for (let i = 0; i < rankedEntries.length; i++) {
      await StorySession.findOneAndUpdate(
        {
          _id: rankedEntries[i].storyId,
          'competitionEntries.competitionId': competitionId
        },
        {
          $set: {
            'competitionEntries.$.rank': i + 1,
            'competitionEntries.$.phase': 'results'
          }
        }
      );
    }

    console.log(`🏆 Competition ${competition.month} results finalized:`,
      winners.map(w => `${w.position}. ${w.childName} (${w.score}%)`));

    return { winners, totalParticipants: rankedEntries.length };
  }

  /**
   * Get past competitions
   */
  static async getPastCompetitions(limit: number = 10) {
    await connectToDatabase();

    return await Competition.find({
      phase: 'results',
      isActive: false
    })
    .sort({ year: -1, createdAt: -1 })
    .limit(limit)
    .lean();
  }

  /**
   * Get eligible stories for competition submission
   */
  static async getEligibleStories(userId: string) {
    await connectToDatabase();

    const competition = await this.getCurrentCompetition();
    if (!competition) return [];

    // Get stories that are published and not already submitted to current competition
    const stories = await StorySession.find({
      childId: userId,
      isPublished: true,
      competitionEligible: true,
      'competitionEntries.competitionId': { $ne: competition._id }
    }).select('title totalWords childWords createdAt').lean();

    return stories.map((story: any) => ({
      _id: story._id,
      title: story.title,
      wordCount: story.totalWords || story.childWords || 0,
      createdAt: story.createdAt,
      isEligible: true
    }));
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

    // Get submission count for this competition
    const submissionCount = await StorySession.countDocuments({
      'competitionEntries.competitionId': competition._id
    });

    // Get unique participants
    const participantStories = await StorySession.find({
      'competitionEntries.competitionId': competition._id
    }).select('childId').lean();

    const uniqueParticipants = new Set(
      participantStories.map((story: any) => story.childId.toString())
    ).size;

    return {
      _id: competition._id,
      month: competition.month,
      year: competition.year,
      phase: competition.phase,
      isActive: competition.isActive,
      totalSubmissions: submissionCount,
      totalParticipants: uniqueParticipants,
      winners: competition.winners || [],
      submissionStart: competition.submissionStart,
      submissionEnd: competition.submissionEnd,
      judgingStart: competition.judgingStart,
      judgingEnd: competition.judgingEnd,
      resultsDate: competition.resultsDate,
      createdAt: competition.createdAt,
      updatedAt: competition.updatedAt
    };
  }
}

// Export both class and instance for compatibility
export const competitionManager = CompetitionManager;
export default CompetitionManager;