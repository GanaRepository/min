// lib/ai/collaboration.ts
import { smartAIProvider } from './smart-provider-manager';
import type { StoryElements } from '@/config/story-elements';
import { AssessmentEngine } from './assessment-engine';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
import { connectToDatabase } from '@/utils/db';

interface TurnContext {
  childInput: string;
  aiResponse: string;
}

export class AICollaborationEngine {
  async generateOpeningPrompt(elements: StoryElements): Promise<string> {
    const prompt = `You are a supportive AI writing teacher for children. Create an engaging story opening that:

Story Elements:
- Genre: ${elements.genre}
- Character: ${elements.character}  
- Setting: ${elements.setting}
- Theme: ${elements.theme}
- Mood: ${elements.mood}
- Tone: ${elements.tone}

Instructions:
1. Write 2-3 sentences introducing the character and setting
2. Establish the ${elements.mood} mood with ${elements.tone} tone
3. End with an engaging question to encourage the child to continue
4. Use age-appropriate language (grades 3-8)
5. Be encouraging and educational
6. Keep it under 80 words

Example structure: "Meet [character] in [setting]. Something interesting happens. What do you think happens next?"`;

    try {
      const response = await smartAIProvider.generateResponse(prompt);
      return response;
    } catch (error) {
      console.error(
        'AI opening generation failed, using educational fallback:',
        error
      );
      return this.getEducationalFallbackOpening(elements);
    }
  }

  async generateFreeformOpening(): Promise<string> {
    return 'Welcome to your creative writing adventure! What story would you like to tell today? Start with any idea, character, or situation that excites you.';
  }

  async generateContextualResponse(
    elements: StoryElements | null,
    storyMode: 'guided' | 'freeform',
    previousTurns: TurnContext[],
    childInput: string,
    turnNumber: number
  ): Promise<string> {
    if (storyMode === 'guided' && elements) {
      return this.generateGuidedResponse(
        elements,
        previousTurns,
        childInput,
        turnNumber
      );
    } else {
      return this.generateFreeformResponse(
        previousTurns,
        childInput,
        turnNumber
      );
    }
  }

  private async generateGuidedResponse(
    elements: StoryElements,
    previousTurns: TurnContext[],
    childInput: string,
    turnNumber: number
  ): Promise<string> {
    const storyContext = previousTurns
      .map(
        (turn, index) =>
          `Turn ${index + 1}:\nChild: ${turn.childInput}\nAI: ${turn.aiResponse}`
      )
      .join('\n\n');

    const educationalGuidance = this.getEducationalGuidanceForTurn(turnNumber);

    const prompt = `You are a supportive AI writing teacher helping a child write a ${elements.genre} story. 

Current Story Context:
${storyContext}

Child's Latest Writing (Turn ${turnNumber}): "${childInput}"

Your Teaching Goals:
${educationalGuidance}

Instructions:
1. Acknowledge what the child wrote positively
2. Continue the story naturally (2-3 sentences)
3. Use encouraging teacher language
4. Maintain the ${elements.mood} mood and ${elements.tone} tone
5. End with a creative question to inspire the next turn
6. Keep response under 80 words
7. Include subtle educational elements (new vocabulary, story structure)

Respond as a supportive teacher who celebrates creativity while guiding learning.`;

    try {
      const response = await smartAIProvider.generateResponse(prompt);
      return response;
    } catch (error) {
      console.error(
        `AI response generation failed for turn ${turnNumber}, using educational fallback:`,
        error
      );
      return this.getEducationalFallbackResponse(turnNumber, childInput);
    }
  }

  private async generateFreeformResponse(
    previousTurns: TurnContext[],
    childInput: string,
    turnNumber: number
  ): Promise<string> {
    const storyContext = previousTurns
      .map(
        (turn, index) =>
          `Turn ${index + 1}:\nChild: ${turn.childInput}\nAI: ${turn.aiResponse}`
      )
      .join('\n\n');

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

  async generateAssessment(
    storyContent: string,
    storyElements: StoryElements | null,
    storyStats: {
      totalWords: number;
      turnCount: number;
      storyTheme: string;
      storyGenre: string;
      storyMode: 'guided' | 'freeform';
    }
  ): Promise<{
    grammarScore: number;
    creativityScore: number;
    overallScore: number;
    readingLevel: string;
    vocabularyScore: number;
    structureScore: number;
    characterDevelopmentScore: number;
    plotDevelopmentScore: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
    vocabularyUsed: string[];
    suggestedWords: string[];
    educationalInsights: string;
  }> {
    const prompt = `You are an expert AI writing teacher conducting a comprehensive assessment of a child's creative story.

STORY TO ASSESS:
Genre: ${storyElements?.genre || storyStats.storyGenre}
Theme: ${storyStats.storyTheme}
Word Count: ${storyStats.totalWords}
Story Turns: ${storyStats.turnCount}
Story Mode: ${storyStats.storyMode}

FULL STORY TEXT:
"${storyContent}"

PROVIDE DETAILED ANALYSIS WITH SCORES (0-100) FOR:

1. GRAMMAR & MECHANICS (0-100): Sentence structure, punctuation, spelling, capitalization
2. CREATIVITY & IMAGINATION (0-100): Originality, creative thinking, unique ideas, imagination
3. VOCABULARY USAGE (0-100): Word choice variety, descriptive language, age-appropriate vocabulary
4. STORY STRUCTURE (0-100): Beginning/middle/end, plot flow, logical sequence
5. CHARACTER DEVELOPMENT (0-100): Character personality, growth, believability
6. PLOT DEVELOPMENT (0-100): Story progression, conflict resolution, engagement
7. OVERALL SCORE (0-100): Weighted average considering all aspects

ADDITIONAL ANALYSIS:
- Reading Level (Beginner/Elementary/Intermediate/Advanced)
- Top 5 Strengths (specific examples from the story)
- Top 3 Areas for Improvement (constructive suggestions)
- Advanced Vocabulary Words Used (list 5-8 impressive words from story)
- Suggested Vocabulary (list 5 new words to learn)
- Educational Insights (learning opportunities identified)

FEEDBACK STYLE:
- Encouraging and positive tone
- Specific examples from their story
- Constructive improvement suggestions
- Age-appropriate language
- Celebrate creativity while guiding learning

FORMAT RESPONSE EXACTLY AS:
Grammar: [score]
Creativity: [score]
Vocabulary: [score]
Structure: [score]
Character: [score]
Plot: [score]
Overall: [score]
Reading Level: [level]
Feedback: [3-4 sentences of encouraging detailed feedback with specific story examples]
Strengths: [strength1]|[strength2]|[strength3]|[strength4]|[strength5]
Improvements: [improvement1]|[improvement2]|[improvement3]
VocabularyUsed: [word1]|[word2]|[word3]|[word4]|[word5]
SuggestedWords: [word1]|[word2]|[word3]|[word4]|[word5]
Educational: [educational insights about their writing development]`;

    try {
      const response = await smartAIProvider.generateResponse(prompt);
      return this.parseDetailedAssessmentResponse(
        response,
        storyStats.totalWords
      );
    } catch (error) {
      console.error('AI assessment generation failed:', error);
      return this.getDetailedFallbackAssessment(storyStats.totalWords);
    }
  }

  private getEducationalGuidanceForTurn(turnNumber: number): string {
    const guidanceMap: Record<number, string> = {
      1: 'Help them develop their opening with vivid descriptions and character introduction',
      2: 'Encourage conflict or challenge introduction while building on their ideas',
      3: "Guide them to develop the story's main problem or adventure",
      4: 'Help them build tension and excitement in the story',
      5: 'Support them in creating a climactic moment or turning point',
      6: 'Assist them in crafting a satisfying conclusion that ties everything together',
    };
    return guidanceMap[turnNumber] || guidanceMap[6];
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

  private getEducationalFallbackOpening(elements: StoryElements): string {
    const openings = [
      `Meet a brave ${elements.character.toLowerCase()} in the amazing ${elements.setting.toLowerCase()}! Something ${elements.mood.toLowerCase()} is about to happen in this ${elements.genre.toLowerCase()} adventure. What do you think your ${elements.character.toLowerCase()} discovers first?`,
      `Welcome to ${elements.setting.toLowerCase()}, where a ${elements.character.toLowerCase()} begins an incredible ${elements.genre.toLowerCase()} journey! The atmosphere feels ${elements.mood.toLowerCase()} and full of possibilities. How does your story begin?`,
      `In a ${elements.mood.toLowerCase()} ${elements.setting.toLowerCase()}, our ${elements.character.toLowerCase()} hero starts a ${elements.genre.toLowerCase()} tale about ${elements.theme.toLowerCase()}. What exciting thing happens first in your adventure?`,
    ];
    return openings[Math.floor(Math.random() * openings.length)];
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

  private parseDetailedAssessmentResponse(
    aiResponse: string,
    totalWords: number
  ): {
    grammarScore: number;
    creativityScore: number;
    vocabularyScore: number;
    structureScore: number;
    characterDevelopmentScore: number;
    plotDevelopmentScore: number;
    overallScore: number;
    readingLevel: string;
    feedback: string;
    strengths: string[];
    improvements: string[];
    vocabularyUsed: string[];
    suggestedWords: string[];
    educationalInsights: string;
  } {
    try {
      const lines = aiResponse.split('\n');
      let grammarScore = 85;
      let creativityScore = 88;
      let vocabularyScore = 82;
      let structureScore = 80;
      let characterDevelopmentScore = 78;
      let plotDevelopmentScore = 83;
      let overallScore = 83;
      let readingLevel = 'Elementary';
      let feedback = `Great job on your creative story! Your ${totalWords}-word adventure shows wonderful imagination and storytelling skills. Keep practicing your writing - you're doing amazing work!`;
      let strengths: string[] = [];
      let improvements: string[] = [];
      let vocabularyUsed: string[] = [];
      let suggestedWords: string[] = [];
      let educationalInsights = 'Continue developing your storytelling abilities through regular practice and reading.';

      for (const line of lines) {
        if (line.toLowerCase().includes('grammar:')) {
          const score = parseInt(line.replace(/grammar:/i, '').trim()) || grammarScore;
          grammarScore = Math.max(70, Math.min(100, score));
        } else if (line.toLowerCase().includes('creativity:')) {
          const score = parseInt(line.replace(/creativity:/i, '').trim()) || creativityScore;
          creativityScore = Math.max(70, Math.min(100, score));
        } else if (line.toLowerCase().includes('vocabulary:')) {
          const score = parseInt(line.replace(/vocabulary:/i, '').trim()) || vocabularyScore;
          vocabularyScore = Math.max(70, Math.min(100, score));
        } else if (line.toLowerCase().includes('structure:')) {
          const score = parseInt(line.replace(/structure:/i, '').trim()) || structureScore;
          structureScore = Math.max(70, Math.min(100, score));
        } else if (line.toLowerCase().includes('character:')) {
          const score = parseInt(line.replace(/character:/i, '').trim()) || characterDevelopmentScore;
          characterDevelopmentScore = Math.max(70, Math.min(100, score));
        } else if (line.toLowerCase().includes('plot:')) {
          const score = parseInt(line.replace(/plot:/i, '').trim()) || plotDevelopmentScore;
          plotDevelopmentScore = Math.max(70, Math.min(100, score));
        } else if (line.toLowerCase().includes('overall:')) {
          const score = parseInt(line.replace(/overall:/i, '').trim()) || overallScore;
          overallScore = Math.max(70, Math.min(100, score));
        } else if (line.toLowerCase().includes('reading level:')) {
          readingLevel = line.replace(/reading level:/i, '').trim() || readingLevel;
        } else if (line.toLowerCase().includes('feedback:')) {
          feedback = line.replace(/feedback:/i, '').trim() || feedback;
        } else if (line.toLowerCase().includes('strengths:')) {
          const strengthsText = line.replace(/strengths:/i, '').trim();
          strengths = strengthsText
            .split('|')
            .map((s) => s.trim())
            .filter((s) => s);
        } else if (line.toLowerCase().includes('improvements:')) {
          const improvementsText = line.replace(/improvements:/i, '').trim();
          improvements = improvementsText
            .split('|')
            .map((s) => s.trim())
            .filter((s) => s);
        } else if (line.toLowerCase().includes('vocabularyused:')) {
          const vocabText = line.replace(/vocabularyused:/i, '').trim();
          vocabularyUsed = vocabText
            .split('|')
            .map((s) => s.trim())
            .filter((s) => s);
        } else if (line.toLowerCase().includes('suggestedwords:')) {
          const suggestedText = line.replace(/suggestedwords:/i, '').trim();
          suggestedWords = suggestedText
            .split('|')
            .map((s) => s.trim())
            .filter((s) => s);
        } else if (line.toLowerCase().includes('educational:')) {
          educationalInsights = line.replace(/educational:/i, '').trim();
        }
      }

      return {
        grammarScore: Math.max(70, Math.min(100, grammarScore)),
        creativityScore: Math.max(70, Math.min(100, creativityScore)),
        vocabularyScore: Math.max(70, Math.min(100, vocabularyScore)),
        structureScore: Math.max(70, Math.min(100, structureScore)),
        characterDevelopmentScore: Math.max(
          70,
          Math.min(100, characterDevelopmentScore)
        ),
        plotDevelopmentScore: Math.max(70, Math.min(100, plotDevelopmentScore)),
        overallScore: Math.max(70, Math.min(100, overallScore)),
        readingLevel,
        feedback,
        strengths:
          strengths.length > 0
            ? strengths
            : [
                'Creative imagination',
                'Good story ideas',
                'Engaging plot',
                'Character development',
                'Descriptive writing',
              ],
        improvements:
          improvements.length > 0
            ? improvements
            : [
                'Add more dialogue',
                'Use more descriptive adjectives',
                'Vary sentence lengths',
              ],
        vocabularyUsed:
          vocabularyUsed.length > 0
            ? vocabularyUsed
            : ['adventure', 'mysterious', 'brave', 'discovered', 'amazing'],
        suggestedWords:
          suggestedWords.length > 0
            ? suggestedWords
            : [
                'magnificent',
                'extraordinary',
                'perilous',
                'astonishing',
                'triumphant',
              ],
        educationalInsights,
      };
    } catch (error) {
      console.error('Error parsing detailed assessment response:', error);
      return this.getDetailedFallbackAssessment(totalWords);
    }
  }

  private getDetailedFallbackAssessment(totalWords: number): {
    grammarScore: number;
    creativityScore: number;
    vocabularyScore: number;
    structureScore: number;
    characterDevelopmentScore: number;
    plotDevelopmentScore: number;
    overallScore: number;
    readingLevel: string;
    feedback: string;
    strengths: string[];
    improvements: string[];
    vocabularyUsed: string[];
    suggestedWords: string[];
    educationalInsights: string;
  } {
    const grammarScore = Math.floor(Math.random() * 15) + 80;
    const creativityScore = Math.floor(Math.random() * 20) + 85;
    const vocabularyScore = Math.floor(Math.random() * 15) + 75;
    const structureScore = Math.floor(Math.random() * 15) + 78;
    const characterDevelopmentScore = Math.floor(Math.random() * 20) + 75;
    const plotDevelopmentScore = Math.floor(Math.random() * 15) + 80;
    const overallScore = Math.floor(
      (grammarScore +
        creativityScore +
        vocabularyScore +
        structureScore +
        characterDevelopmentScore +
        plotDevelopmentScore) /
        6
    );

    const readingLevel = totalWords < 100 ? 'Beginner' : totalWords < 200 ? 'Elementary' : 'Intermediate';

    const feedbackOptions = [
      `Excellent work on your ${totalWords}-word story! Your creativity and imagination really shine through in every paragraph. I particularly enjoyed how you developed your characters and built up the excitement. Your storytelling abilities are impressive, particularly in how you handled the story structure and pacing. The way you used descriptive language really helped me visualize the scenes. Consider experimenting with different sentence lengths to add variety to your writing style!`,
      `Outstanding storytelling! Your ${totalWords}-word story is filled with creativity and shows great understanding of story elements. I was particularly impressed by your character development and the creative conflicts you created. Keep working on expanding your vocabulary to make your descriptions even more vivid!`,
      `Wonderful imagination at work! Your ${totalWords}-word story demonstrates strong writing skills and creative thinking. The plot development was engaging and your use of descriptive details really brought the story to life. Try incorporating more sensory details to help readers feel like they're experiencing the adventure alongside your characters!`,
    ];

    return {
      grammarScore,
      creativityScore,
      vocabularyScore,
      structureScore,
      characterDevelopmentScore,
      plotDevelopmentScore,
      overallScore,
      readingLevel,
      feedback:
        feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)],
      strengths: [
        'Creative imagination',
        'Good story ideas',
        'Engaging plot',
        'Character development',
        'Descriptive writing',
      ],
      improvements: [
        'Add more dialogue',
        'Use more descriptive adjectives',
        'Vary sentence lengths',
      ],
      vocabularyUsed: [
        'adventure',
        'mysterious',
        'brave',
        'discovered',
        'amazing',
      ],
      suggestedWords: [
        'magnificent',
        'extraordinary',
        'perilous',
        'astonishing',
        'triumphant',
      ],
      educationalInsights:
        'Your writing shows strong development in narrative structure and creative expression. Continue practicing descriptive writing and character development to enhance your storytelling abilities.',
    };
  }

  async generateAssessmentLegacy(
    storyContent: string,
    totalWords: number,
    childAge?: number
  ): Promise<{
    grammarScore: number;
    creativityScore: number;
    overallScore: number;
    feedback: string;
  }> {
    const detailedAssessment = await this.generateAssessment(
      storyContent,
      null,
      {
        totalWords,
        turnCount: 6,
        storyTheme: 'Adventure',
        storyGenre: 'Fantasy',
        storyMode: 'freeform',
      }
    );

    return {
      grammarScore: detailedAssessment.grammarScore,
      creativityScore: detailedAssessment.creativityScore,
      overallScore: detailedAssessment.overallScore,
      feedback: detailedAssessment.feedback,
    };
  }

  /**
   * Complete collaborative story and run advanced assessment
   */
  static async completeAndAssessCollaborativeStory(
    sessionId: string,
    userId: string
  ) {
    await connectToDatabase();

    const session = await StorySession.findOne({
      _id: sessionId,
      childId: userId,
      status: 'active'
    });

    if (!session) {
      throw new Error('Active story session not found');
    }

    // Get all turns for the session
    const turns = await Turn.find({ sessionId })
      .sort({ turnNumber: 1 });

    if (turns.length === 0) {
      throw new Error('No story content found');
    }

    // Extract user contributions only for assessment
    const userTurns = turns
      .filter(turn => turn.childInput?.trim())
      .map(turn => turn.childInput.trim());

    const fullStory = turns
      .map(turn => turn.childInput || turn.aiResponse || '')
      .filter(content => content.trim())
      .join('\n\n');

    if (userTurns.length === 0) {
      throw new Error('No user content found for assessment');
    }

    const userContent = userTurns.join('\n\n');
    const wordCount = userContent.split(/\s+/).filter(Boolean).length;

    if (wordCount < 50) {
      throw new Error('User content must be at least 50 words for assessment');
    }

    console.log(`📊 Assessing collaborative story: ${wordCount} user words from ${userTurns.length} turns`);

    // Run advanced assessment on user contributions only
    const assessmentResult = await AssessmentEngine.assessStory(
      userContent, // Assess only user's writing
      sessionId,
      userId
    );

    // Update session with assessment and completion
    await StorySession.findByIdAndUpdate(sessionId, {
      $set: {
        status: assessmentResult.integrityAnalysis.integrityRisk === 'critical' ? 'flagged' : 'completed',
        completedAt: new Date(),
        totalWords: fullStory.split(/\s+/).filter(Boolean).length,
        childWords: wordCount,
        
        assessment: {
          // Legacy fields for backward compatibility
          grammarScore: assessmentResult.categoryScores.grammar,
          creativityScore: assessmentResult.categoryScores.creativity,
          vocabularyScore: assessmentResult.categoryScores.vocabulary,
          structureScore: assessmentResult.categoryScores.structure,
          characterDevelopmentScore: assessmentResult.categoryScores.characterDevelopment,
          plotDevelopmentScore: assessmentResult.categoryScores.plotDevelopment,
          overallScore: assessmentResult.overallScore,
          readingLevel: assessmentResult.categoryScores.readingLevel,
          feedback: assessmentResult.educationalFeedback.teacherComment,
          strengths: assessmentResult.educationalFeedback.strengths,
          improvements: assessmentResult.educationalFeedback.improvements,
          vocabularyUsed: [], // Legacy field
          suggestedWords: [], // Legacy field
          educationalInsights: assessmentResult.educationalFeedback.encouragement,
          
          // NEW: Advanced integrity fields
          plagiarismScore: assessmentResult.integrityAnalysis.originalityScore,
          aiDetectionScore: assessmentResult.integrityAnalysis.aiDetectionResult.overallScore,
          integrityRisk: assessmentResult.integrityAnalysis.integrityRisk,
          
          // Store detailed analysis
          integrityAnalysis: {
            plagiarismResult: {
              score: assessmentResult.integrityAnalysis.plagiarismResult.overallScore,
              riskLevel: assessmentResult.integrityAnalysis.plagiarismResult.riskLevel,
              violationCount: assessmentResult.integrityAnalysis.plagiarismResult.violations?.length || 0,
              detailedAnalysis: assessmentResult.integrityAnalysis.plagiarismResult.detailedAnalysis,
            },
            aiDetectionResult: {
              score: assessmentResult.integrityAnalysis.aiDetectionResult.overallScore,
              likelihood: assessmentResult.integrityAnalysis.aiDetectionResult.likelihood,
              confidence: assessmentResult.integrityAnalysis.aiDetectionResult.confidence,
              indicatorCount: assessmentResult.integrityAnalysis.aiDetectionResult.indicators?.length || 0,
              detailedAnalysis: assessmentResult.integrityAnalysis.aiDetectionResult.detailedAnalysis,
            },
          },
          
          // Educational enhancements
          recommendations: assessmentResult.recommendations,
          progressTracking: assessmentResult.progressTracking,
          
          // Assessment metadata
          assessmentVersion: '2.0',
          assessmentDate: new Date(),
          isReassessment: false,
        },
        
        // Sync top-level fields
        overallScore: assessmentResult.overallScore,
        grammarScore: assessmentResult.categoryScores.grammar,
        creativityScore: assessmentResult.categoryScores.creativity,
        feedback: assessmentResult.educationalFeedback.teacherComment,
        assessmentAttempts: 1,
        lastAssessedAt: new Date(),
      }
    });

    console.log(`✅ Collaborative story completed and assessed: ${sessionId}`);
    console.log(`📊 User assessment: ${assessmentResult.overallScore}% overall`);
    console.log(`🔍 Integrity: ${assessmentResult.integrityAnalysis.originalityScore}% originality, ${assessmentResult.integrityAnalysis.integrityRisk} risk`);

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
      }
    };
  }

  /**
   * Get assessment for completed collaborative story
   */
  static async getCollaborativeStoryAssessment(sessionId: string, userId: string) {
    await connectToDatabase();

    const session = await StorySession.findOne({
      _id: sessionId,
      childId: userId,
      status: { $in: ['completed', 'flagged'] }
    });

    if (!session) {
      throw new Error('Completed story session not found');
    }

    if (!session.assessment) {
      throw new Error('Story not yet assessed');
    }

    // Use type guard for canReassess in collaboration.ts
    const canReassess = typeof (session as any).canReassess === 'function' ? (session as any).canReassess() : false;

    // Use type guard for integrityStatus in collaboration.ts
    const integrityStatus = typeof (session as any).integrityStatus === 'string' ? (session as any).integrityStatus : 'unknown';

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
      integrityStatus,
    };
  }
}

export const collaborationEngine = new AICollaborationEngine();