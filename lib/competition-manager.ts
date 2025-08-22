// lib/competition-manager.ts - COMPLETE $20 BUDGET OPTIMIZED VERSION
import { connectToDatabase } from '@/utils/db';
import Competition from '@/models/Competition';
import StorySession from '@/models/StorySession';
import User from '@/models/User';
import { AIAssessmentEngine } from '@/lib/ai/ai-assessment-engine';
import {
  sendWinnerCongratulationsEmail,
  sendCompetitionUpdateEmail,
} from '@/lib/mailer';

export class CompetitionManager {
  /**
   * Utility: Cleanup duplicate competitions for the same month/year
   * Deactivates all but the most recent active competition for each month/year
   */
  static async cleanupDuplicateCompetitions() {
    await connectToDatabase();
    const competitions = await Competition.find({ isActive: true }).sort({
      year: -1,
      month: -1,
      createdAt: -1,
    });
    const seen = new Set();
    let deactivated = 0;
    for (const comp of competitions) {
      const key = `${comp.month}-${comp.year}`;
      if (seen.has(key)) {
        comp.isActive = false;
        await comp.save();
        deactivated++;
        console.log(
          `🧹 [CLEANUP] Deactivated duplicate: ${comp.month} ${comp.year} (${comp._id})`
        );
      } else {
        seen.add(key);
      }
    }
    console.log(
      `🧹 [CLEANUP] Deactivated ${deactivated} duplicate competitions.`
    );
    return deactivated;
  }
  // ULTRA-BUDGET AI Processing Configuration
  private static readonly BUDGET_CONFIG = {
    MONTHLY_BUDGET: 20, // $20/month hard limit
    COST_PER_FULL_AI: 0.02, // 2¢ per comprehensive AI analysis
    COST_PER_LIGHT_AI: 0.005, // 0.5¢ per lightweight AI analysis

    // Tier thresholds for 10K stories
    TIER_1_FILTER: 200, // Quick filter: 10K → 200 (FREE)
    TIER_2_FILTER: 50, // Pattern filter: 200 → 50 (FREE)
    TIER_3_AI_ANALYSIS: 20, // Light AI: 50 → 20 ($0.25)
    FINAL_AI_WINNERS: 3, // Full AI: 20 → 3 ($0.40)

    BATCH_SIZE: 5, // Process 5 stories at once
    DELAY_BETWEEN_BATCHES: 500, // 0.5 second delay
  };

  /**
   * Get or create current month's competition (starts automatically on 1st)
   */
  static async getCurrentCompetition() {
    await connectToDatabase();

    const now = new Date();
    const currentMonth = now.toLocaleDateString('en-US', { month: 'long' });
    const currentYear = now.getFullYear();

    let competition = await Competition.findOne({
      month: currentMonth,
      year: currentYear,
    });

    // Auto-create competition on 1st of month
    if (!competition) {
      competition = await this.createMonthlyCompetition(
        currentYear,
        now.getMonth() + 1
      );
    }

    // Auto-advance phases based on dates
    await this.checkAndAdvancePhase(competition);

    return competition;
  }

  /**
   * Create new monthly competition (starts on 1st automatically)
   */
  static async createMonthlyCompetition(year: number, month: number) {
    const monthName = new Date(year, month - 1, 1).toLocaleDateString('en-US', {
      month: 'long',
    });

    // Calculate correct dates for the competition
    const now = new Date();
    const firstDay = new Date(year, month - 1, 1); // 1st of month
    const submissionEnd = new Date(year, month - 1, 28, 23, 59, 59, 999); // 28th, end of day
    const judgingStart = new Date(year, month - 1, 29, 0, 0, 0, 0); // 29th
    const judgingEnd = new Date(year, month - 1, 30, 23, 59, 59, 999); // 30th, end of day
    const resultsDate = new Date(year, month - 1, 31, 23, 59, 59, 999); // 31st, end of day
    const lastDay = resultsDate;

    const competition = new Competition({
      month: monthName,
      year: year,
      phase: 'submission',
      submissionStart: firstDay,
      submissionEnd,
      judgingStart,
      judgingEnd,
      resultsDate,
      isActive: true,
      winners: [],
      judgingCriteria: {
        grammar: 12,
        creativity: 25, // Highest weight for competition
        structure: 10,
        character: 12,
        plot: 15,
        vocabulary: 10,
        originality: 8,
        engagement: 5,
        aiDetection: 3, // Penalize AI-generated content
      },
    });

    await competition.save();
    console.log(
      `🎉 [COMPETITION] Created: ${monthName} ${year} - Submissions open!`
    );
    return competition;
  }

  /**
   * Automatic phase advancement based on dates
   */
  static async checkAndAdvancePhase(competition: any) {
    const now = new Date();

    switch (competition.phase) {
      case 'submission':
        if (now >= competition.submissionEnd) {
          competition.phase = 'judging';
          await competition.save();

          console.log(
            `🔒 [COMPETITION] ${competition.month} submissions CLOSED`
          );
          console.log(
            `🤖 [COMPETITION] AI judging begins - winners announced on ${competition.resultsDate.toLocaleDateString()}`
          );

          await this.notifySubmissionClosure(competition);
        }
        break;

      case 'judging':
        if (now >= competition.resultsDate) {
          competition.phase = 'results';
          await competition.save();

          console.log(
            `🏆 [COMPETITION] ${competition.month} - AI judging starting!`
          );

          const winners = await this.runBudgetOptimizedJudging(competition._id);
          await this.announceWinners(competition, winners);
        }
        break;

      case 'results':
        const nextMonth = new Date(
          competition.year,
          new Date(`${competition.month} 1, ${competition.year}`).getMonth() +
            1,
          1
        );
        if (now >= nextMonth) {
          competition.isActive = false;
          await competition.save();
          console.log(
            `📁 [COMPETITION] ${competition.month} ${competition.year} completed`
          );
        }
        break;
    }

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
    daysLeft?: number;
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
        entriesUsed: 0,
        maxEntries: 3,
        currentPhase: 'none',
      };
    }

    // Check if in submission phase
    if (competition.phase !== 'submission') {
      return {
        canSubmit: false,
        reason:
          competition.phase === 'judging'
            ? 'Submissions closed - AI judging in progress'
            : 'Competition results available',
        entriesUsed: user.competitionEntriesThisMonth || 0,
        maxEntries: 3,
        currentPhase: competition.phase,
      };
    }

    // Calculate days left for submission
    const now = new Date();
    const daysLeft = Math.ceil(
      (competition.submissionEnd.getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Check monthly entries limit (max 3 stories per month)
    const entriesUsed = user.competitionEntriesThisMonth || 0;
    const maxEntries = 3;

    if (entriesUsed >= maxEntries) {
      return {
        canSubmit: false,
        reason: `Maximum ${maxEntries} stories per month already submitted`,
        entriesUsed,
        maxEntries,
        currentPhase: competition.phase,
        daysLeft,
      };
    }

    return {
      canSubmit: true,
      entriesUsed,
      maxEntries,
      currentPhase: competition.phase,
      daysLeft: Math.max(0, daysLeft),
    };
  }

  /**
   * Submit story to competition (upload best stories)
   */
  static async submitStoryToCompetition(storyId: string, userId: string) {
    await connectToDatabase();

    const competition = await this.getCurrentCompetition();
    if (!competition || competition.phase !== 'submission') {
      throw new Error('Submission period has ended');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check submission limit
    const entriesUsed = user.competitionEntriesThisMonth || 0;
    if (entriesUsed >= 3) {
      throw new Error('Maximum 3 stories per month already submitted');
    }

    const story = await StorySession.findById(storyId);
    if (!story) {
      throw new Error('Story not found');
    }

    if (story.childId.toString() !== userId) {
      throw new Error('You can only submit your own stories');
    }

    if (story.status !== 'completed') {
      throw new Error('Only completed stories can be submitted');
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
      phase: 'submitted',
    };

    await StorySession.findByIdAndUpdate(storyId, {
      $push: { competitionEntries: competitionEntry },
    });

    // Increment user's monthly competition entries
    await User.findByIdAndUpdate(userId, {
      $inc: { competitionEntriesThisMonth: 1 },
    });

    const daysLeft = Math.ceil(
      (competition.submissionEnd.getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );

    console.log(
      `📝 [COMPETITION] Story "${story.title}" submitted by ${user.firstName} (${entriesUsed + 1}/3)`
    );

    return {
      success: true,
      competitionId: competition._id,
      submissionDate: new Date(),
      entriesUsed: entriesUsed + 1,
      daysLeft: Math.max(0, daysLeft),
    };
  }

  /**
   * ULTRA-BUDGET AI JUDGING: $20 budget for 10K stories
   */
  static async runBudgetOptimizedJudging(competitionId: string) {
    console.log(
      `💰 [BUDGET-AI] Starting $20 budget optimization for large-scale judging`
    );

    const competition = await Competition.findById(competitionId);
    if (!competition) throw new Error('Competition not found');

    // Get all submissions
    const allSubmissions = await StorySession.find({
      'competitionEntries.competitionId': competitionId,
    }).populate('childId', 'firstName lastName email');

    const totalStories = allSubmissions.length;
    console.log(
      `📊 [BUDGET-AI] Processing ${totalStories} stories with $20 budget`
    );

    if (totalStories === 0) {
      console.log(`⚠️ [COMPETITION] No submissions found`);
      return [];
    }

    if (totalStories <= 20) {
      // Small volume: Use full AI for all (cost: ~$0.40)
      console.log(
        `📊 [SMALL-VOLUME] Using full AI analysis for all ${totalStories} stories`
      );
      return await this.fullAIAnalysis(allSubmissions, competitionId);
    }

    // LARGE VOLUME: Multi-tier filtering approach
    return await this.ultraBudgetTieredAnalysis(allSubmissions, competitionId);
  }

  /**
   * TIER-1: Quick Mathematical Filter (10K → 200 stories) - FREE
   */
  static async tier1QuickFilter(stories: any[], targetCount: number = 200) {
    console.log(
      `🔢 [TIER-1] Quick mathematical filter: ${stories.length} → ${targetCount} (FREE)`
    );

    const scoredStories = stories.map((story) => {
      const quickScore = this.calculateMathematicalScore(story);
      return { ...(story._doc || story), quickScore };
    });

    const topStories = scoredStories
      .sort((a, b) => b.quickScore - a.quickScore)
      .slice(0, targetCount);

    console.log(
      `✅ [TIER-1] Selected top ${topStories.length} stories for next tier`
    );
    console.log(
      `   Top score: ${topStories[0]?.quickScore}, Bottom score: ${topStories[topStories.length - 1]?.quickScore}`
    );

    return topStories;
  }

  /**
   * TIER-2: Advanced Pattern Analysis (200 → 50 stories) - FREE
   */
  static async tier2PatternFilter(stories: any[], targetCount: number = 50) {
    console.log(
      `🔍 [TIER-2] Pattern analysis filter: ${stories.length} → ${targetCount} (FREE)`
    );

    const scoredStories = stories.map((story) => {
      const patternScore = this.calculatePatternScore(story);
      const combinedScore = story.quickScore * 0.6 + patternScore * 0.4;
      return { ...story, patternScore, combinedScore };
    });

    const topStories = scoredStories
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, targetCount);

    console.log(
      `✅ [TIER-2] Selected top ${topStories.length} stories for AI analysis`
    );
    console.log(
      `   Top combined score: ${topStories[0]?.combinedScore?.toFixed(1)}, Bottom: ${topStories[topStories.length - 1]?.combinedScore?.toFixed(1)}`
    );

    return topStories;
  }

  /**
   * TIER-3: Limited AI Analysis (50 → 20 stories) - $0.25
   */
  static async tier3LimitedAI(stories: any[], targetCount: number = 20) {
    console.log(
      `🤖 [TIER-3] Limited AI analysis: ${stories.length} → ${targetCount} ($0.25)`
    );

    const aiResults = [];
    const batches = this.createBatches(stories, this.BUDGET_CONFIG.BATCH_SIZE);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(
        `   Processing batch ${i + 1}/${batches.length} (${batch.length} stories)`
      );

      const batchPromises = batch.map(async (story) => {
        try {
          const lightAnalysis = await this.lightweightAIAnalysis(story);
          return {
            ...story,
            aiScore: lightAnalysis.score,
            aiNotes: lightAnalysis.notes,
          };
        } catch (error) {
          console.error(`Failed lightweight AI for ${story.title}:`, error);
          return {
            ...story,
            aiScore: story.combinedScore,
            aiNotes: 'Fallback scoring',
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      aiResults.push(...batchResults);

      // Small delay between batches
      if (i < batches.length - 1) {
        await this.delay(this.BUDGET_CONFIG.DELAY_BETWEEN_BATCHES);
      }
    }

    const topStories = aiResults
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, targetCount);

    console.log(
      `✅ [TIER-3] Selected top ${topStories.length} for final comprehensive AI`
    );
    console.log(
      `   Top AI score: ${topStories[0]?.aiScore}, Bottom: ${topStories[topStories.length - 1]?.aiScore}`
    );

    return topStories;
  }

  /**
   * TIER-4: Full Comprehensive AI (20 → 3 winners) - $0.40
   */
  static async tier4ComprehensiveAI(stories: any[], competitionId: string) {
    console.log(
      `🎯 [TIER-4] Comprehensive AI analysis for final ${stories.length} stories ($0.40)`
    );

    const finalResults = [];

    for (let i = 0; i < stories.length; i++) {
      const story = stories[i];
      console.log(`   Analyzing ${i + 1}/${stories.length}: "${story.title}"`);

      try {
        // Full comprehensive analysis (same as assessment engine)
        const storyContent =
          story.childTurns?.join('\n\n') || story.content || '';

        const assessment = await AIAssessmentEngine.performCompleteAssessment(
          storyContent,
          {
            childAge: 10,
            isCompetition: true,
            expectedWordCount: story.totalWords || 400,
            storyTitle: story.title,
          }
        );

        const competitionScore = this.calculateCompetitionScore(
          assessment,
          story
        );

        finalResults.push({
          storyId: story._id,
          title: story.title,
          childId: story.childId._id || story.childId,
          childName: `${story.childId.firstName} ${story.childId.lastName}`,
          childEmail: story.childId.email,
          score: competitionScore.totalScore,
          breakdown: competitionScore.breakdown,
          fullAnalysis: assessment,
        });

        console.log(
          `   ✅ "${story.title}": ${competitionScore.totalScore}/100`
        );
      } catch (error) {
        console.error(
          `   ❌ Failed comprehensive AI for "${story.title}":`,
          error
        );
        finalResults.push({
          storyId: story._id,
          title: story.title,
          childId: story.childId._id || story.childId,
          childName: `${story.childId.firstName} ${story.childId.lastName}`,
          childEmail: story.childId.email,
          score: story.aiScore || 70,
          breakdown: { error: 'Comprehensive analysis failed' },
        });
      }
    }

    // Select top 3 winners
    const winners = finalResults
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((story, index) => ({
        position: index + 1,
        place: index === 0 ? '1st' : index === 1 ? '2nd' : '3rd',
        ...story,
      }));

    console.log(`🏆 [WINNERS] Final 3 selected with comprehensive AI analysis`);
    winners.forEach((w) =>
      console.log(`   ${w.place}: ${w.childName} - "${w.title}" (${w.score}%)`)
    );

    // Update competition results
    await this.updateCompetitionResults(competitionId, winners, finalResults);

    return winners;
  }

  /**
   * Main ultra-budget tiered analysis workflow
   */
  static async ultraBudgetTieredAnalysis(
    allStories: any[],
    competitionId: string
  ) {
    const startTime = Date.now();

    try {
      console.log(
        `🎯 [ULTRA-BUDGET] Starting 4-tier analysis for ${allStories.length} stories`
      );

      // TIER 1: Mathematical filter (FREE) - 10K → 200
      const tier1Results = await this.tier1QuickFilter(
        allStories,
        Math.min(this.BUDGET_CONFIG.TIER_1_FILTER, allStories.length)
      );

      // TIER 2: Pattern analysis (FREE) - 200 → 50
      const tier2Results = await this.tier2PatternFilter(
        tier1Results,
        Math.min(this.BUDGET_CONFIG.TIER_2_FILTER, tier1Results.length)
      );

      // TIER 3: Lightweight AI (CHEAP) - 50 → 20
      const tier3Results = await this.tier3LimitedAI(
        tier2Results,
        Math.min(this.BUDGET_CONFIG.TIER_3_AI_ANALYSIS, tier2Results.length)
      );

      // TIER 4: Comprehensive AI (FULL) - 20 → 3
      const winners = await this.tier4ComprehensiveAI(
        tier3Results,
        competitionId
      );

      const processingTime = (Date.now() - startTime) / 1000;
      const estimatedCost =
        tier2Results.length * this.BUDGET_CONFIG.COST_PER_LIGHT_AI +
        tier3Results.length * this.BUDGET_CONFIG.COST_PER_FULL_AI;

      console.log(
        `⚡ [COMPLETE] Processed ${allStories.length} stories in ${processingTime.toFixed(1)}s`
      );
      console.log(
        `💰 [COST] Estimated total: $${estimatedCost.toFixed(2)} (well under $20 budget)`
      );
      console.log(
        `📊 [EFFICIENCY] ${(((allStories.length - 3) / allStories.length) * 100).toFixed(1)}% filtered without expensive AI`
      );

      return winners;
    } catch (error) {
      console.error(`❌ [ERROR] Budget AI judging failed:`, error);
      throw error;
    }
  }

  /**
   * Full AI analysis for small volumes
   */
  static async fullAIAnalysis(stories: any[], competitionId: string) {
    console.log(
      `🤖 [FULL-AI] Comprehensive analysis for all ${stories.length} stories`
    );

    const results = [];

    for (let i = 0; i < stories.length; i++) {
      const story = stories[i];
      console.log(`   Analyzing ${i + 1}/${stories.length}: "${story.title}"`);

      try {
        const storyContent =
          story.childTurns?.join('\n\n') || story.content || '';

        const assessment = await AIAssessmentEngine.performCompleteAssessment(
          storyContent,
          {
            childAge: 10,
            isCompetition: true,
            expectedWordCount: story.totalWords || 400,
            storyTitle: story.title,
          }
        );

        const competitionScore = this.calculateCompetitionScore(
          assessment,
          story
        );

        results.push({
          storyId: story._id,
          title: story.title,
          childId: story.childId._id || story.childId,
          childName: `${story.childId.firstName} ${story.childId.lastName}`,
          childEmail: story.childId.email,
          score: competitionScore.totalScore,
          breakdown: competitionScore.breakdown,
        });

        console.log(
          `   ✅ "${story.title}": ${competitionScore.totalScore}/100`
        );
      } catch (error) {
        console.error(`   ❌ Failed analysis for "${story.title}":`, error);
        results.push({
          storyId: story._id,
          title: story.title,
          childId: story.childId._id || story.childId,
          childName: `${story.childId.firstName} ${story.childId.lastName}`,
          childEmail: story.childId.email,
          score: 70,
          breakdown: { error: 'Analysis failed' },
        });
      }
    }

    // Select top 3 winners
    const winners = results
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((story, index) => ({
        position: index + 1,
        place: index === 0 ? '1st' : index === 1 ? '2nd' : '3rd',
        ...story,
      }));

    await this.updateCompetitionResults(competitionId, winners, results);
    return winners;
  }

  /**
   * Mathematical scoring (no AI calls) - FREE
   */
  static calculateMathematicalScore(story: any): number {
    const wordCount = story.totalWords || story.childWords || 0;
    const title = story.title || '';
    const createdAt = new Date(story.createdAt);
    const now = new Date();

    // Word count scoring (0-30 points)
    let wordScore = 0;
    if (wordCount < 100) wordScore = 5;
    else if (wordCount < 300) wordScore = 15;
    else if (wordCount < 600) wordScore = 25;
    else if (wordCount < 1000) wordScore = 30;
    else if (wordCount < 1500) wordScore = 25;
    else wordScore = 15; // Too long penalty

    // Title quality (0-20 points)
    const titleScore = Math.min(20, Math.max(5, title.length * 1.2));

    // Recency bonus (0-15 points)
    const daysOld =
      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 15 - daysOld * 0.3);

    // Completion status (0-25 points)
    const completionScore =
      story.status === 'completed'
        ? 25
        : story.status === 'in_progress'
          ? 15
          : 10;

    // Story structure bonus (0-10 points)
    const turnCount = story.childTurns?.length || 1;
    const structureScore =
      turnCount >= 7 ? 10 : turnCount >= 5 ? 8 : turnCount >= 3 ? 5 : 2;

    const totalScore =
      wordScore + titleScore + recencyScore + completionScore + structureScore;
    return Math.round(Math.min(100, Math.max(0, totalScore)));
  }

  /**
   * Pattern analysis scoring (no AI calls) - FREE
   */
  static calculatePatternScore(story: any): number {
    const content = story.childTurns?.join(' ') || story.content || '';
    const title = story.title || '';

    if (!content) return 50; // Default score for empty content

    // Vocabulary diversity (0-25 points)
    const words = content
      .toLowerCase()
      .split(/\s+/)
      .filter((w: any) => w.length > 2);
    const uniqueWords = new Set(words);
    const diversityRatio =
      words.length > 0 ? uniqueWords.size / words.length : 0;
    const vocabularyScore = Math.min(25, diversityRatio * 80);

    // Sentence structure variety (0-20 points)
    const sentences = content
      .split(/[.!?]+/)
      .filter((s: string) => s.trim().length > 5);
    const avgSentenceLength: number =
      sentences.length > 0
        ? sentences.reduce(
            (sum: number, s: string) => sum + s.trim().split(/\s+/).length,
            0
          ) / sentences.length
        : 0;
    const structureScore =
      avgSentenceLength > 12
        ? 20
        : avgSentenceLength > 8
          ? 15
          : avgSentenceLength > 5
            ? 10
            : 5;

    // Title creativity (0-15 points)
    const creativeTitleWords = [
      'adventure',
      'mystery',
      'magic',
      'secret',
      'journey',
      'dragon',
      'princess',
      'treasure',
      'quest',
      'kingdom',
    ];
    const titleCreativity = creativeTitleWords.some((word) =>
      title.toLowerCase().includes(word)
    )
      ? 15
      : title.length > 15
        ? 12
        : title.length > 8
          ? 8
          : 5;

    // Dialogue presence (0-20 points)
    const dialogueMatches = content.match(/["'].*?["']/g) || [];
    const hasDialogue =
      dialogueMatches.length > 2 ? 20 : dialogueMatches.length > 0 ? 15 : 5;

    // Descriptive language (0-20 points)
    const descriptiveWords = [
      'beautiful',
      'scary',
      'enormous',
      'tiny',
      'colorful',
      'bright',
      'dark',
      'mysterious',
      'sparkling',
      'ancient',
    ];
    const descriptiveCount = descriptiveWords.filter((word) =>
      content.toLowerCase().includes(word)
    ).length;
    const descriptiveScore = Math.min(20, descriptiveCount * 3);

    const totalScore =
      vocabularyScore +
      structureScore +
      titleCreativity +
      hasDialogue +
      descriptiveScore;
    return Math.round(Math.min(100, Math.max(0, totalScore)));
  }

  /**
   * Lightweight AI analysis (cheaper than full assessment)
   */
  static async lightweightAIAnalysis(story: any) {
    const content = story.childTurns?.join('\n\n') || story.content || '';

    // Use a much simpler prompt to reduce token costs
    const lightPrompt = `Rate this children's story from 60-95 for overall quality. Consider creativity, writing skill, and storytelling. Return only a number: "${content.substring(0, 400)}..."`;

    try {
      // This would use your lightweight AI assessment
      const response =
        await AIAssessmentEngine.performLightweightAssessment(lightPrompt);
      const score = parseInt(response.match(/\d+/)?.[0] || '75');

      return {
        score: Math.min(95, Math.max(60, score)),
        notes: 'Lightweight AI screening',
      };
    } catch (error) {
      // Fallback to mathematical score with small boost
      const fallbackScore = Math.min(
        85,
        (story.combinedScore || 70) + Math.random() * 10
      );
      return {
        score: Math.round(fallbackScore),
        notes: 'Pattern-based scoring (AI unavailable)',
      };
    }
  }

  /**
   * Competition score calculation using assessment engine results
   */
  static calculateCompetitionScore(assessment: any, story: any) {
    const scores = {
      grammar:
        assessment.integrityAnalysis?.plagiarismResult?.grammarScore || 70,
      creativity: assessment.educationalAssessment?.creativityScore || 75,
      structure: assessment.educationalAssessment?.structureScore || 70,
      character: assessment.educationalAssessment?.characterScore || 70,
      plot: assessment.educationalAssessment?.plotScore || 70,
      vocabulary: assessment.educationalAssessment?.vocabularyScore || 70,
      wordCount: this.calculateWordCountScore(story.totalWords || 0),
      originality: assessment.integrityAnalysis?.originalityScore || 80,
      aiPenalty:
        assessment.integrityAnalysis?.aiDetectionResult?.overallScore || 100,
    };

    // Weighted competition scoring (prioritizes creativity and plot)
    const totalScore = Math.round(
      scores.grammar * 0.12 + // 12% - Grammar
        scores.creativity * 0.25 + // 25% - Creativity (highest)
        scores.structure * 0.1 + // 10% - Structure
        scores.character * 0.12 + // 12% - Character
        scores.plot * 0.15 + // 15% - Plot
        scores.vocabulary * 0.1 + // 10% - Vocabulary
        scores.wordCount * 0.05 + // 5% - Word count
        scores.originality * 0.08 + // 8% - Originality
        (scores.aiPenalty / 100) * 0.03 // 3% - AI penalty
    );

    const notes = `Competition Analysis: Creativity(${scores.creativity}%) Grammar(${scores.grammar}%) Plot(${scores.plot}%) Originality(${scores.originality}%) AI-Check(${scores.aiPenalty}%)`;
    return {
      totalScore: Math.min(100, Math.max(0, totalScore)),
      notes,
      breakdown: scores,
    };
  }

  /**
   * Word count scoring for competition
   */
  static calculateWordCountScore(wordCount: number): number {
    // Optimal word count scoring for children's stories
    if (wordCount < 100) return 40; // Too short
    if (wordCount < 200) return 60; // Short but acceptable
    if (wordCount < 400) return 85; // Good length
    if (wordCount < 800) return 100; // Perfect length
    if (wordCount < 1200) return 95; // Very good
    if (wordCount < 1500) return 90; // Long but good
    if (wordCount <= 2000) return 85; // Long
    return 70; // Too long - may lose reader interest
  }

  /**
   * Helper function to create batches for processing
   */
  static createBatches(array: any[], batchSize: number): any[][] {
    const batches = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Helper function for delays between API calls
   */
  static async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Update competition with final results
   */
  static async updateCompetitionResults(
    competitionId: string,
    winners: any[],
    allResults: any[]
  ) {
    try {
      const competition = await Competition.findById(competitionId);
      if (!competition) return;

      // Prevent duplicate results update
      if (competition.winners && competition.winners.length > 0) {
        console.log(
          `⚠️ Competition already has winners, skipping updateCompetitionResults`
        );
        return;
      }

      // Update competition document
      competition.winners = winners;
      competition.totalSubmissions = allResults.length;
      competition.totalParticipants = new Set(
        allResults.map((r) => r.childId.toString())
      ).size;
      await competition.save();

      // Update individual story sessions with rankings, skip if already has rank
      for (let i = 0; i < allResults.length; i++) {
        const result = allResults[i];
        const existingStory = await StorySession.findOne({
          _id: result.storyId,
          'competitionEntries.competitionId': competitionId,
          'competitionEntries.rank': { $exists: true },
        });
        if (existingStory) {
          console.log(`⚠️ Story already has competition results, skipping`);
          continue;
        }
        await StorySession.findOneAndUpdate(
          {
            _id: result.storyId,
            'competitionEntries.competitionId': competitionId,
          },
          {
            $set: {
              'competitionEntries.$.score': result.score,
              'competitionEntries.$.rank': i + 1,
              'competitionEntries.$.phase': 'results',
              'competitionEntries.$.aiJudgingNotes': result.breakdown
                ? JSON.stringify(result.breakdown)
                : 'Competition analyzed',
            },
          }
        );
      }

      console.log(
        `📊 [UPDATE] Competition results saved - ${winners.length} winners, ${allResults.length} total entries`
      );
    } catch (error) {
      console.error(`❌ [ERROR] Failed to update competition results:`, error);
    }
  }

  /**
   * Olympic-style winner announcement with emails
   */
  static async announceWinners(competition: any, winners: any[]) {
    console.log(
      `🎉 [OLYMPIC-ANNOUNCEMENT] ${competition.month} ${competition.year} Competition Results!`
    );

    if (winners.length === 0) {
      console.log(`ℹ️  No winners - no valid submissions found`);
      return [];
    }

    // Display winners Olympic-style
    winners.forEach((winner) => {
      const medal =
        winner.position === 1 ? '🥇' : winner.position === 2 ? '🥈' : '🥉';
      console.log(
        `${medal} ${winner.place} Place: ${winner.childName} - "${winner.title}" (${winner.score}%)`
      );
    });

    // Send congratulations emails to winners
    const emailPromises = winners.map(async (winner) => {
      try {
        await sendWinnerCongratulationsEmail(
          winner.childEmail,
          winner.childName,
          winner.place,
          winner.title,
          winner.score,
          competition.month,
          competition.year
        );
        console.log(
          `📧 [CONGRATULATIONS] Email sent to ${winner.place} place winner: ${winner.childName}`
        );
        return { success: true, winner: winner.childName };
      } catch (error) {
        console.error(
          `❌ [EMAIL-ERROR] Failed to send congratulations to ${winner.childName}:`,
          error
        );
        return { success: false, winner: winner.childName, error };
      }
    });

    const emailResults = await Promise.all(emailPromises);
    const successfulEmails = emailResults.filter((r) => r.success).length;
    console.log(
      `📬 [EMAIL-SUMMARY] ${successfulEmails}/${winners.length} congratulations emails sent successfully`
    );

    return winners;
  }

  /**
   * Notify users about submission closure
   */
  static async notifySubmissionClosure(competition: any) {
    try {
      // This could send emails to all participants about submission closure
      console.log(
        `📢 [NOTIFICATION] Submissions closed for ${competition.month} ${competition.year}`
      );
      console.log(
        `🤖 AI judging will complete by ${competition.resultsDate.toLocaleDateString()}`
      );

      // Optional: Send email to admin about closure
      await sendCompetitionUpdateEmail(
        process.env.ADMIN_EMAIL || 'admin@yourdomain.com',
        `${competition.month} Competition Update`,
        `Submissions for ${competition.month} ${competition.year} are now closed. AI judging will begin and results will be announced on ${competition.resultsDate.toLocaleDateString()}.`
      );
    } catch (error) {
      console.error(
        `❌ [NOTIFICATION-ERROR] Failed to send closure notification:`,
        error
      );
    }
  }

  /**
   * Get competition status for UI display
   */
  static async getCompetitionStatus() {
    try {
      const competition = await this.getCurrentCompetition();
      if (!competition) return null;

      const now = new Date();
      let statusMessage = '';
      let daysLeft = 0;
      let phaseIcon = '';

      switch (competition.phase) {
        case 'submission':
          daysLeft = Math.ceil(
            (competition.submissionEnd.getTime() - now.getTime()) /
              (1000 * 60 * 60 * 24)
          );
          phaseIcon = '📝';
          statusMessage = `Submissions open! ${Math.max(0, daysLeft)} day${daysLeft !== 1 ? 's' : ''} left to submit your best stories`;
          break;
        case 'judging':
          const resultDays = Math.ceil(
            (competition.resultsDate.getTime() - now.getTime()) /
              (1000 * 60 * 60 * 24)
          );
          phaseIcon = '🤖';
          statusMessage = `AI judging in progress! Results in ${Math.max(0, resultDays)} day${resultDays !== 1 ? 's' : ''}`;
          break;
        case 'results':
          phaseIcon = '🏆';
          statusMessage = `Results are live! Check out this month's winners`;
          break;
      }

      // Get submission count
      const submissionCount = await StorySession.countDocuments({
        'competitionEntries.competitionId': competition._id,
      });

      return {
        competition: {
          _id: competition._id,
          month: competition.month,
          year: competition.year,
          phase: competition.phase,
          isActive: competition.isActive,
          submissionStart: competition.submissionStart,
          submissionEnd: competition.submissionEnd,
          resultsDate: competition.resultsDate,
          winners: competition.winners || [],
          totalSubmissions: submissionCount,
        },
        statusMessage,
        phaseIcon,
        daysLeft: Math.max(0, daysLeft),
        canSubmit: competition.phase === 'submission',
        submissionCount,
      };
    } catch (error) {
      console.error(
        `❌ [STATUS-ERROR] Failed to get competition status:`,
        error
      );
      return null;
    }
  }

  /**
   * Get user's submissions for current competition
   */
  static async getUserSubmissions(userId: string) {
    try {
      const competition = await this.getCurrentCompetition();
      if (!competition) return [];

      const submissions = await StorySession.find({
        childId: userId,
        'competitionEntries.competitionId': competition._id,
      })
        .select(
          'title totalWords childWords competitionEntries createdAt status'
        )
        .lean();

      return submissions
        .map((story: any) => {
          const entry = story.competitionEntries.find(
            (e: any) =>
              e.competitionId.toString() === competition._id.toString()
          );
          return {
            storyId: story._id,
            title: story.title,
            wordCount: story.totalWords || story.childWords || 0,
            submittedAt: entry.submittedAt,
            score: entry.score || null,
            rank: entry.rank || null,
            phase: entry.phase || 'submitted',
            status: story.status,
          };
        })
        .sort(
          (a, b) =>
            new Date(b.submittedAt).getTime() -
            new Date(a.submittedAt).getTime()
        );
    } catch (error) {
      console.error(
        `❌ [USER-SUBMISSIONS-ERROR] Failed to get user submissions:`,
        error
      );
      return [];
    }
  }

  /**
   * Get eligible stories for competition submission
   */
  static async getEligibleStories(userId: string) {
    try {
      const competition = await this.getCurrentCompetition();
      if (!competition || competition.phase !== 'submission') return [];

      // Get completed stories that haven't been submitted to current competition
      const stories = await StorySession.find({
        childId: userId,
        status: 'completed',
        $or: [
          { 'competitionEntries.competitionId': { $ne: competition._id } },
          { competitionEntries: { $exists: false } },
          { competitionEntries: { $size: 0 } },
        ],
      })
        .select('title totalWords childWords createdAt')
        .lean();

      return stories
        .map((story: any) => ({
          _id: story._id,
          title: story.title,
          wordCount: story.totalWords || story.childWords || 0,
          createdAt: story.createdAt,
          isEligible: true,
        }))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    } catch (error) {
      console.error(
        `❌ [ELIGIBLE-STORIES-ERROR] Failed to get eligible stories:`,
        error
      );
      return [];
    }
  }

  /**
   * Get competition leaderboard/results
   */
  static async getCompetitionResults(competitionId?: string) {
    try {
      const competition = competitionId
        ? await Competition.findById(competitionId)
        : await this.getCurrentCompetition();

      if (!competition || competition.phase !== 'results') return null;

      // Get all submissions with scores
      const submissions = await StorySession.find({
        'competitionEntries.competitionId': competition._id,
      })
        .populate('childId', 'firstName lastName')
        .select('title totalWords childWords competitionEntries childId')
        .lean();

      const results = submissions
        .map((story: any) => {
          const entry = story.competitionEntries.find(
            (e: any) =>
              e.competitionId.toString() === competition._id.toString()
          );
          return {
            rank: entry.rank || 999,
            childName: `${story.childId.firstName} ${story.childId.lastName}`,
            title: story.title,
            wordCount: story.totalWords || story.childWords || 0,
            score: entry.score || 0,
            isWinner: entry.rank <= 3,
            medal:
              entry.rank === 1
                ? '🥇'
                : entry.rank === 2
                  ? '🥈'
                  : entry.rank === 3
                    ? '🥉'
                    : null,
          };
        })
        .sort((a, b) => a.rank - b.rank);

      return {
        competition: {
          month: competition.month,
          year: competition.year,
          totalParticipants: competition.totalParticipants,
          totalSubmissions: competition.totalSubmissions,
        },
        winners: results.slice(0, 3),
        allResults: results,
      };
    } catch (error) {
      console.error(
        `❌ [RESULTS-ERROR] Failed to get competition results:`,
        error
      );
      return null;
    }
  }

  /**
   * Get past competitions for historical view
   */
  static async getPastCompetitions(limit: number = 12) {
    try {
      await connectToDatabase();

      const pastCompetitions = await Competition.find({
        phase: 'results',
        isActive: false,
      })
        .sort({ year: -1, createdAt: -1 })
        .limit(limit)
        .select(
          'month year winners totalParticipants totalSubmissions resultsDate'
        )
        .lean();

      return pastCompetitions.map((comp: any) => ({
        _id: comp._id,
        month: comp.month,
        year: comp.year,
        winners: comp.winners || [],
        totalParticipants: comp.totalParticipants || 0,
        totalSubmissions: comp.totalSubmissions || 0,
        resultsDate: comp.resultsDate,
      }));
    } catch (error) {
      console.error(
        `❌ [PAST-COMPETITIONS-ERROR] Failed to get past competitions:`,
        error
      );
      return [];
    }
  }

  /**
   * Manual competition phase advancement (for admin)
   */
  static async forceAdvancePhase(competitionId: string) {
    try {
      const competition = await Competition.findById(competitionId);
      if (!competition) {
        throw new Error('Competition not found');
      }

      const oldPhase = competition.phase;

      switch (competition.phase) {
        case 'submission':
          competition.phase = 'judging';
          competition.submissionEnd = new Date(); // ✅ This field exists

          // Set judgingEnd if not set (use the existing field name)
          if (!competition.judgingEnd) {
            competition.judgingEnd = new Date(
              Date.now() + 5 * 24 * 60 * 60 * 1000
            ); // 5 days from now
          }
          break;
        case 'judging':
          // Prevent duplicate judging/results
          if (competition.winners && competition.winners.length > 0) {
            console.log(`⚠️ Competition already has winners, skipping judging`);
            competition.phase = 'results';
          } else {
            competition.phase = 'results';
            const winners = await this.runBudgetOptimizedJudging(competitionId);
            await this.announceWinners(competition, winners);
          }
          break;
        case 'results':
          competition.isActive = false;
          break;
      }

      await competition.save();
      console.log(
        `👨‍💼 [ADMIN] Manually advanced ${competition.month} from ${oldPhase} to ${competition.phase}`
      );

      return competition;
    } catch (error) {
      console.error(
        `❌ [FORCE-ADVANCE-ERROR] Failed to force advance phase:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get competition statistics for admin dashboard
   */
  static async getCompetitionStats() {
    try {
      await connectToDatabase();

      const currentCompetition = await this.getCurrentCompetition();
      const allCompetitions = await Competition.countDocuments();
      const activeCompetitions = await Competition.countDocuments({
        isActive: true,
      });

      // Total submissions across all competitions
      const totalSubmissions = await Competition.aggregate([
        { $group: { _id: null, total: { $sum: '$totalSubmissions' } } },
      ]);

      // Average participants per competition
      const avgParticipants = await Competition.aggregate([
        { $group: { _id: null, avg: { $avg: '$totalParticipants' } } },
      ]);

      return {
        currentCompetition: currentCompetition
          ? {
              month: currentCompetition.month,
              year: currentCompetition.year,
              phase: currentCompetition.phase,
              submissions: currentCompetition.totalSubmissions || 0,
              participants: currentCompetition.totalParticipants || 0,
            }
          : null,
        totalCompetitions: allCompetitions,
        activeCompetitions,
        totalSubmissions: totalSubmissions[0]?.total || 0,
        averageParticipants: Math.round(avgParticipants[0]?.avg || 0),
      };
    } catch (error) {
      console.error(`❌ [STATS-ERROR] Failed to get competition stats:`, error);
      return null;
    }
  }

  /**
   * Update competition statistics after new submission
   */
  static async updateCompetitionStats(competitionId: string) {
    try {
      await connectToDatabase();

      // Get real-time counts
      const totalSubmissions = await StorySession.countDocuments({
        'competitionEntries.competitionId': competitionId,
      });

      const totalParticipants = await StorySession.distinct('childId', {
        'competitionEntries.competitionId': competitionId,
      });

      // Update competition document
      await Competition.findByIdAndUpdate(competitionId, {
        $set: {
          totalSubmissions,
          totalParticipants: totalParticipants.length,
        },
      });

      console.log(
        `📊 Updated competition stats: ${totalSubmissions} submissions, ${totalParticipants.length} participants`
      );
    } catch (error) {
      console.error('❌ Failed to update competition stats:', error);
    }
  }
}

// Export both class and instance for compatibility
export const competitionManager = CompetitionManager;
export default CompetitionManager;
