// lib/ai/collaboration.ts - UPDATED WITH ADVANCED DETECTION
import { smartAIProvider } from './smart-provider-manager';
import { ComprehensiveAssessmentEngine } from './comprehensive-assessment-engine';
import { AdvancedAIDetector } from './advanced-ai-detector';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
import { connectToDatabase } from '@/utils/db';

interface TurnContext {
  childInput: string;
  aiResponse: string;
}

export class AICollaborationEngine {
  // REMOVED: All guided story methods - only freeform now

  async generateFreeformOpening(): Promise<string> {
    return 'Welcome to your creative writing adventure! What story would you like to tell today? Start with any idea, character, or situation that excites you.';
  }

  // SIMPLIFIED: Only freeform collaborative responses
  async generateFreeformResponse(
    childInput: string,
    storyContext: string,
    turnNumber: number
  ): Promise<string> {
    // Don't generate response for 7th turn - assessment time
    if (turnNumber >= 7) {
      return "Amazing work on your story! You've written 7 parts and created something wonderful. Let's see how your story measures up with a detailed assessment of your creative writing!";
    }

    const educationalGuidance = this.getFreeformGuidanceForTurn(turnNumber);

    const prompt = `You are a supportive AI writing teacher helping a child with their creative freeform story.

Current Story Context:
${storyContext}

Child's Latest Writing (Turn ${turnNumber}): "${childInput}"

Your Teaching Goals:
${educationalGuidance}

Instructions:
1. Acknowledge what the child wrote positively
2. Continue their unique story naturally (2-3 sentences)  
3. Use encouraging teacher language
4. Maintain whatever mood and tone they have established
5. End with a creative question to inspire the next turn
6. Keep response under 80 words
7. Support their creative vision while providing gentle guidance

Respond as a supportive teacher who celebrates their unique creativity.`;

    try {
      const response = await smartAIProvider.generateResponse(prompt);
      return response;
    } catch (error) {
      console.error(
        `AI freeform response generation failed for turn ${turnNumber}, using educational fallback:`,
        error
      );
      return this.getEducationalFallbackResponse(turnNumber, childInput);
    }
  }

  private getFreeformGuidanceForTurn(turnNumber: number): string {
    const guidanceMap: Record<number, string> = {
      1: 'Help them expand on their creative opening with vivid details and character development',
      2: 'Encourage them to introduce challenges or interesting developments that build on their unique ideas',
      3: 'Guide them to develop whatever main conflict or adventure they have established',
      4: 'Help them build on the momentum and excitement of their story',
      5: 'Support them in creating a climactic moment that fits their story direction',
      6: 'Assist them in crafting a satisfying conclusion for their unique tale',
    };
    return guidanceMap[turnNumber] || guidanceMap[6];
  }

  private getEducationalFallbackResponse(
    turnNumber: number,
    childInput: string
  ): string {
    const responses = [
      `Wonderful writing! I love how you're developing this story. Your creativity really shows in how you described that scene. What exciting challenge does your character face next?`,
      `Excellent work! You're building such an engaging adventure. I can picture everything you've written so clearly. What happens when your character tries to solve this problem?`,
      `Amazing storytelling! You've created such vivid details that make me want to know more. How does your brave character handle this new situation?`,
      `Fantastic imagination! Your story is taking such interesting turns. I'm excited to see where you take us next. What does your character do now?`,
      `Outstanding creativity! You're weaving together all the story elements beautifully. What final challenge awaits your character in this adventure?`,
      `Incredible conclusion building! You're bringing all the pieces together so well. How does your hero's journey end?`,
    ];
    return responses[Math.min(turnNumber - 1, responses.length - 1)];
  }

  /**
   * Complete collaborative story and run COMPREHENSIVE assessment with AI detection
   */
  static async completeAndAssessCollaborativeStory(
    sessionId: string,
    userId: string
  ) {
    await connectToDatabase();

    const session = await StorySession.findOne({
      _id: sessionId,
      childId: userId,
      status: 'active',
    });

    if (!session) {
      throw new Error('Active story session not found');
    }

    // Get all turns for the session
    const turns = await Turn.find({ sessionId }).sort({ turnNumber: 1 });

    if (turns.length === 0) {
      throw new Error('No story content found');
    }

    // Extract user contributions only for assessment
    const userTurns = turns
      .filter((turn) => turn.childInput?.trim())
      .map((turn) => turn.childInput.trim());

    const fullStory = turns
      .map((turn) => turn.childInput || turn.aiResponse || '')
      .filter((content) => content.trim())
      .join('\n\n');

    if (userTurns.length === 0) {
      throw new Error('No user content found for assessment');
    }

    // Use only user content for assessment (collaborative stories)
    const userContent = userTurns.join('\n\n');
    const wordCount = userContent.split(/\s+/).filter(Boolean).length;

    if (wordCount < 50) {
      throw new Error('User content must be at least 50 words for assessment');
    }

    console.log(
      `📊 Running COMPREHENSIVE assessment on collaborative story: ${wordCount} user words from ${userTurns.length} turns`
    );

    // CHANGED: Use the NEW Comprehensive Assessment Engine
    const assessmentResult = await ComprehensiveAssessmentEngine.performCompleteAssessment(
      userContent,
      {
        childAge: session.childAge || 10,
        isCollaborativeStory: true,
        storyTitle: session.title,
        expectedGenre: 'creative',
      }
    );

    // Log assessment results for debugging
    console.log(`🔍 AI Detection: ${assessmentResult.integrityAnalysis.aiDetection.aiLikelihood}`);
    console.log(`📝 Plagiarism: ${assessmentResult.integrityAnalysis.plagiarismCheck.riskLevel} risk`);
    console.log(`⚖️ Integrity Status: ${assessmentResult.integrityAnalysis.overallStatus}`);

    // Set session status based on integrity
    let sessionStatus = 'completed';
    let integrityFlags = null;

    // Add integrity flags for mentor/admin review if concerns exist
    if (assessmentResult.integrityAnalysis.overallStatus === 'FAIL') {
      integrityFlags = {
        needsReview: true,
        aiDetectionLevel: assessmentResult.integrityAnalysis.aiDetection.aiLikelihood,
        plagiarismRisk: assessmentResult.integrityAnalysis.plagiarismCheck.riskLevel,
        overallRisk: assessmentResult.integrityAnalysis.overallStatus,
        flaggedAt: new Date(),
        reviewStatus: 'pending_mentor_review',
      };
      sessionStatus = 'flagged';
    } else if (assessmentResult.integrityAnalysis.overallStatus === 'WARNING') {
      sessionStatus = 'review';
    }

    // Update session with COMPREHENSIVE assessment
    const updateData: any = {
      status: sessionStatus,
      completedAt: new Date(),
      totalWords: fullStory.split(/\s+/).filter(Boolean).length,
      childWords: wordCount,

      // Store complete comprehensive assessment
      assessment: {
        // NEW: Full comprehensive assessment data
        comprehensiveAssessment: assessmentResult,

        // Legacy compatibility fields
        grammarScore: assessmentResult.coreWritingSkills.grammar.score,
        creativityScore: assessmentResult.coreWritingSkills.creativity.score,
        vocabularyScore: assessmentResult.coreWritingSkills.vocabulary.score,
        structureScore: assessmentResult.coreWritingSkills.structure.score,
        characterDevelopmentScore: assessmentResult.storyDevelopment.characterDevelopment.score,
        plotDevelopmentScore: assessmentResult.storyDevelopment.plotDevelopment.score,
        overallScore: assessmentResult.overallScore,

        // Educational feedback
        feedback: assessmentResult.comprehensiveFeedback.teacherAssessment,
        strengths: assessmentResult.comprehensiveFeedback.strengths,
        improvements: assessmentResult.comprehensiveFeedback.areasForEnhancement,
        nextSteps: assessmentResult.comprehensiveFeedback.nextSteps,

        // Integrity analysis
        integrityAnalysis: {
          aiDetection: assessmentResult.integrityAnalysis.aiDetection,
          plagiarismCheck: assessmentResult.integrityAnalysis.plagiarismCheck,
          overallStatus: assessmentResult.integrityAnalysis.overallStatus,
          message: assessmentResult.integrityAnalysis.message,
          recommendation: assessmentResult.integrityAnalysis.recommendation,
        },

        // Assessment metadata
        assessmentVersion: '6.0-comprehensive',
        assessmentDate: new Date(),
        assessmentType: 'collaborative',
        childAge: session.childAge || 10,
      },

      // Sync top-level fields
      overallScore: assessmentResult.overallScore,
      grammarScore: assessmentResult.coreWritingSkills.grammar.score,
      creativityScore: assessmentResult.coreWritingSkills.creativity.score,
      feedback: assessmentResult.comprehensiveFeedback.teacherAssessment,
      assessmentAttempts: 1,
      lastAssessedAt: new Date(),

      // Integrity tracking at top level
      integrityStatus: assessmentResult.integrityAnalysis.overallStatus,
      aiDetectionScore: assessmentResult.integrityAnalysis.aiDetection.humanLikeScore,
      plagiarismScore: assessmentResult.integrityAnalysis.plagiarismCheck.originalityScore,

      // Add integrity flags if concerns exist
      ...(integrityFlags && { integrityFlags }),
    };

    // Execute the update
    await StorySession.findByIdAndUpdate(sessionId, { $set: updateData });

    console.log(`✅ Collaborative story completed with COMPREHENSIVE assessment: ${sessionId}`);
    console.log(`📊 Overall Score: ${assessmentResult.overallScore}%`);
    console.log(`🔍 Integrity Status: ${assessmentResult.integrityAnalysis.overallStatus}`);

    return {
      sessionId,
      fullStory,
      userContent,
      assessment: assessmentResult,
      wordCount: {
        total: fullStory.split(/\s+/).filter(Boolean).length,
        userOnly: wordCount,
      },
      turnStats: {
        totalTurns: turns.length,
        userTurns: userTurns.length,
      },
      integrityStatus: assessmentResult.integrityAnalysis.overallStatus,
    };
  }

  /**
   * QUICK AI CHECK: Before full assessment, check if content is AI-generated
   */
  static async quickAICheck(
    userContent: string,
    childAge: number = 10
  ): Promise<{
    isAI: boolean;
    likelihood: string;
    confidence: number;
    score: number;
    shouldBlock: boolean;
  }> {
    console.log('🔍 Running quick AI detection check...');

    const aiResult = await AdvancedAIDetector.detectAIContent(userContent, {
      childAge,
      isCreativeWriting: true,
    });

    const isAI = aiResult.riskLevel === 'CRITICAL RISK' || aiResult.riskLevel === 'HIGH RISK';
    const shouldBlock = aiResult.riskLevel === 'CRITICAL RISK';

    console.log(`🤖 Quick AI Check: ${aiResult.humanLikeScore}% human-like, ${aiResult.aiLikelihood}`);

    return {
      isAI,
      likelihood: aiResult.aiLikelihood,
      confidence: aiResult.confidenceLevel,
      score: aiResult.humanLikeScore,
      shouldBlock,
    };
  }

  /**
   * Get assessment for completed collaborative story
   */
  static async getCollaborativeStoryAssessment(
    sessionId: string,
    userId: string
  ) {
    await connectToDatabase();

    const session = await StorySession.findOne({
      _id: sessionId,
      childId: userId,
      status: { $in: ['completed', 'flagged', 'review'] },
    });

    if (!session) {
      throw new Error('Completed story session not found');
    }

    if (!session.assessment) {
      throw new Error('Story not yet assessed');
    }

    const canReassess = session.assessmentAttempts < 3;

    return {
      sessionId,
      assessment: session.assessment,
      storyInfo: {
        title: session.title,
        storyNumber: session.storyNumber,
        totalWords: session.totalWords,
        userWords: session.childWords,
        completedAt: session.completedAt,
        assessmentAttempts: session.assessmentAttempts,
        maxAttempts: 3,
        canReassess,
      },
      integrityStatus: {
        status: session.integrityStatus || 'unknown',
        aiDetectionScore: session.aiDetectionScore || 0,
        plagiarismScore: session.plagiarismScore || 0,
        message: session.assessment.integrityAnalysis?.message || '',
        recommendation: session.assessment.integrityAnalysis?.recommendation || '',
      },
      isComprehensive: session.assessment.assessmentVersion?.includes('comprehensive') || false,
    };
  }

  /**
   * Re-assess story with comprehensive system
   */
  static async reassessStory(sessionId: string, userId: string) {
    await connectToDatabase();

    const session = await StorySession.findOne({
      _id: sessionId,
      childId: userId,
      status: { $in: ['completed', 'flagged', 'review'] },
    });

    if (!session) {
      throw new Error('Story session not found');
    }

    if (session.assessmentAttempts >= 3) {
      throw new Error('Maximum assessment attempts reached');
    }

    // Get user content from turns
    const turns = await Turn.find({ sessionId }).sort({ turnNumber: 1 });
    const userTurns = turns
      .filter((turn) => turn.childInput?.trim())
      .map((turn) => turn.childInput.trim());

    if (userTurns.length === 0) {
      throw new Error('No user content found for reassessment');
    }

    const userContent = userTurns.join('\n\n');

    console.log(`🔄 Running COMPREHENSIVE REASSESSMENT on story: ${sessionId}`);

    // Run comprehensive assessment again
    const assessmentResult = await ComprehensiveAssessmentEngine.performCompleteAssessment(
      userContent,
      {
        childAge: session.childAge || 10,
        isCollaborativeStory: true,
        storyTitle: session.title,
        expectedGenre: 'creative',
      }
    );

    // Update with new assessment
    await StorySession.findByIdAndUpdate(sessionId, {
      $set: {
        'assessment.comprehensiveAssessment': assessmentResult,
        'assessment.overallScore': assessmentResult.overallScore,
        'assessment.integrityAnalysis': {
          aiDetection: assessmentResult.integrityAnalysis.aiDetection,
          plagiarismCheck: assessmentResult.integrityAnalysis.plagiarismCheck,
          overallStatus: assessmentResult.integrityAnalysis.overallStatus,
          message: assessmentResult.integrityAnalysis.message,
          recommendation: assessmentResult.integrityAnalysis.recommendation,
        },
        'assessment.feedback': assessmentResult.comprehensiveFeedback.teacherAssessment,
        integrityStatus: assessmentResult.integrityAnalysis.overallStatus,
        aiDetectionScore: assessmentResult.integrityAnalysis.aiDetection.humanLikeScore,
        plagiarismScore: assessmentResult.integrityAnalysis.plagiarismCheck.originalityScore,
        overallScore: assessmentResult.overallScore,
      },
      $inc: { assessmentAttempts: 1 },
    });

    console.log(`✅ Comprehensive reassessment complete: ${assessmentResult.integrityAnalysis.overallStatus}`);

    return {
      sessionId,
      newAssessment: assessmentResult,
      attemptNumber: session.assessmentAttempts + 1,
    };
  }
}

export const collaborationEngine = new AICollaborationEngine();