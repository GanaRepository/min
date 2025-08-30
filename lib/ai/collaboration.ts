import { smartAIProvider } from './smart-provider-manager';
import { SingleCallAssessmentEngine } from './SingleCallAssessmentEngine';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
import { connectToDatabase } from '@/utils/db';

export class AICollaborationEngine {
  async generateFreeformOpening(): Promise<string> {
    return 'Welcome to your creative writing adventure! What story would you like to tell today? Start with any idea, character, or situation that excites you.';
  }

  async generateFreeformResponse(
    childInput: string,
    storyContext: string,
    turnNumber: number
  ): Promise<string> {
    if (turnNumber >= 7) {
      return "Amazing work on your story! You've written 7 parts and created something wonderful. Let's see how your story measures up with a detailed teacher assessment!";
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
7. Support their creative vision while providing gentle guidance`;

    try {
      const response = await smartAIProvider.generateResponse(prompt);
      return response;
    } catch (error) {
      console.error(
        `AI freeform response generation failed for turn ${turnNumber}, using fallback:`,
        error
      );
      return this.getEducationalFallbackResponse(turnNumber, childInput);
    }
  }

  private getFreeformGuidanceForTurn(turnNumber: number): string {
    const guidanceMap: Record<number, string> = {
      1: 'Help them expand their opening with vivid details and character development',
      2: 'Encourage them to introduce challenges or interesting developments',
      3: 'Guide them to develop the main conflict or adventure',
      4: 'Help them build momentum and excitement',
      5: 'Support them in creating a climactic moment',
      6: 'Assist them in crafting a satisfying conclusion',
    };
    return guidanceMap[turnNumber] || guidanceMap[6];
  }

  private getEducationalFallbackResponse(
    turnNumber: number,
    childInput: string
  ): string {
    const responses = [
      `Wonderful writing! I love how you're developing this story. What exciting challenge does your character face next?`,
      `Excellent work! You're building such an engaging adventure. What happens when your character tries to solve this problem?`,
      `Amazing storytelling! You've created vivid details that make me want to know more. How does your brave character handle this new situation?`,
      `Fantastic imagination! Your story is taking such interesting turns. What does your character do now?`,
      `Outstanding creativity! You're weaving together all the story elements beautifully. What final challenge awaits your character?`,
      `Incredible conclusion building! You're bringing all the pieces together so well. How does your hero's journey end?`,
    ];
    return responses[Math.min(turnNumber - 1, responses.length - 1)];
  }

  /**
   * Complete collaborative story and run the new 13-factor assessment
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

    if (!session) throw new Error('Active story session not found');

    const turns = await Turn.find({ sessionId }).sort({ turnNumber: 1 });
    if (turns.length === 0) throw new Error('No story content found');

    const userTurns = turns
      .filter((t) => t.childInput?.trim())
      .map((t) => t.childInput.trim());

    const fullStory = turns
      .map((t) => t.childInput || t.aiResponse || '')
      .filter((content) => content.trim())
      .join('\n\n');

    if (userTurns.length === 0) {
      throw new Error('No user content found for assessment');
    }

    const userContent = userTurns.join('\n\n');
    const wordCount = userContent.split(/\s+/).filter(Boolean).length;

    if (wordCount < 50) {
      throw new Error('User content must be at least 50 words for assessment');
    }

    console.log(
      `📊 Running 13-factor assessment on collaborative story: ${wordCount} user words from ${userTurns.length} turns`
    );

    const assessmentResult = await SingleCallAssessmentEngine.performAssessment(
      userContent,
      {
        childAge: session.childAge || 10,
        storyTitle: session.title,
      }
    );

    const updateData: any = {
      status: 'completed',
      completedAt: new Date(),
      totalWords: fullStory.split(/\s+/).filter(Boolean).length,
      childWords: wordCount,
      assessment: {
        teacherAssessment: assessmentResult,
        assessmentDate: new Date(),
        assessmentType: 'collaborative',
        childAge: session.childAge || 10,
      },
      assessmentAttempts: 1,
      lastAssessedAt: new Date(),
    };

    await StorySession.findByIdAndUpdate(sessionId, { $set: updateData });

    console.log(
      `✅ Collaborative story completed with teacher assessment: ${sessionId}`
    );

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
      status: { $in: ['completed'] },
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
    };
  }

  /**
   * Re-assess story with the 13-factor system
   */
  static async reassessStory(sessionId: string, userId: string) {
    await connectToDatabase();

    const session = await StorySession.findOne({
      _id: sessionId,
      childId: userId,
      status: { $in: ['completed'] },
    });

    if (!session) {
      throw new Error('Story session not found');
    }

    if (session.assessmentAttempts >= 3) {
      throw new Error('Maximum assessment attempts reached');
    }

    const turns = await Turn.find({ sessionId }).sort({ turnNumber: 1 });
    const userTurns = turns
      .filter((t) => t.childInput?.trim())
      .map((t) => t.childInput.trim());

    if (userTurns.length === 0) {
      throw new Error('No user content found for reassessment');
    }

    const userContent = userTurns.join('\n\n');

    console.log(`🔄 Running reassessment on story: ${sessionId}`);

    const assessmentResult = await SingleCallAssessmentEngine.performAssessment(
      userContent,
      {
        childAge: session.childAge || 10,
        storyTitle: session.title,
      }
    );

    await StorySession.findByIdAndUpdate(sessionId, {
      $set: {
        'assessment.teacherAssessment': assessmentResult,
        'assessment.assessmentDate': new Date(),
      },
      $inc: { assessmentAttempts: 1 },
    });

    console.log(`✅ Reassessment complete.`);

    return {
      sessionId,
      newAssessment: assessmentResult,
      attemptNumber: session.assessmentAttempts + 1,
    };
  }
}

export const collaborationEngine = new AICollaborationEngine();
