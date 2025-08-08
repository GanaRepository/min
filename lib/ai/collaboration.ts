// // lib/ai/collaboration.ts
// import { smartAIProvider } from './smart-provider-manager';
// import type { StoryElements } from '@/config/story-elements';

// interface TurnContext {
//   childInput: string;
//   aiResponse: string;
// }

// export class AICollaborationEngine {
//   async generateOpeningPrompt(elements: StoryElements): Promise<string> {
//     const prompt = `You are a supportive AI writing teacher for children. Create an engaging story opening that:

// Story Elements:
// - Genre: ${elements.genre}
// - Character: ${elements.character}
// - Setting: ${elements.setting}
// - Theme: ${elements.theme}
// - Mood: ${elements.mood}
// - Tone: ${elements.tone}

// Instructions:
// 1. Write 2-3 sentences introducing the character and setting
// 2. Establish the ${elements.mood} mood with ${elements.tone} tone
// 3. End with an engaging question to encourage the child to continue
// 4. Use age-appropriate language (grades 3-8)
// 5. Be encouraging and educational
// 6. Keep it under 80 words

// Example structure: "Meet [character] in [setting]. Something interesting happens. What do you think happens next?"`;

//     try {
//       const response = await smartAIProvider.generateResponse(prompt);
//       return response;
//     } catch (error) {
//       console.error(
//         'AI opening generation failed, using educational fallback:',
//         error
//       );
//       return this.getEducationalFallbackOpening(elements);
//     }
//   }

//   async generateContextualResponse(
//     elements: StoryElements,
//     previousTurns: TurnContext[],
//     childInput: string,
//     turnNumber: number
//   ): Promise<string> {
//     const storyContext = previousTurns
//       .map(
//         (turn, index) =>
//           `Turn ${index + 1}:\nChild: ${turn.childInput}\nAI: ${turn.aiResponse}`
//       )
//       .join('\n\n');

//     const educationalGuidance = this.getEducationalGuidanceForTurn(turnNumber);

//     const prompt = `You are a supportive AI writing teacher helping a child write a ${elements.genre} story.

// Current Story Context:
// ${storyContext}

// Child's Latest Writing (Turn ${turnNumber}): "${childInput}"

// Your Teaching Goals:
// ${educationalGuidance}

// Instructions:
// 1. Acknowledge what the child wrote positively
// 2. Continue the story naturally (2-3 sentences)
// 3. Use encouraging teacher language
// 4. Maintain the ${elements.mood} mood and ${elements.tone} tone
// 5. End with a creative question to inspire the next turn
// 6. Keep response under 80 words
// 7. Include subtle educational elements (new vocabulary, story structure)

// Respond as a supportive teacher who celebrates creativity while guiding learning.`;

//     try {
//       const response = await smartAIProvider.generateResponse(prompt);
//       return response;
//     } catch (error) {
//       console.error(
//         `AI response generation failed for turn ${turnNumber}, using educational fallback:`,
//         error
//       );
//       return this.getEducationalFallbackResponse(turnNumber, childInput);
//     }
//   }

//   async generateAssessment(
//     storyContent: string,
//     storyElements: StoryElements,
//     storyStats: {
//       totalWords: number;
//       turnCount: number;
//       storyTheme: string;
//       storyGenre: string;
//     }
//   ): Promise<{
//     grammarScore: number;
//     creativityScore: number;
//     overallScore: number;
//     readingLevel: string;
//     vocabularyScore: number;
//     structureScore: number;
//     characterDevelopmentScore: number;
//     plotDevelopmentScore: number;
//     feedback: string;
//     strengths: string[];
//     improvements: string[];
//     vocabularyUsed: string[];
//     suggestedWords: string[];
//     educationalInsights: string;
//   }> {
//     const prompt = `You are an expert AI writing teacher conducting a comprehensive assessment of a child's creative story.

// STORY TO ASSESS:
// Genre: ${storyElements.genre}
// Theme: ${storyStats.storyTheme}
// Word Count: ${storyStats.totalWords}
// Story Turns: ${storyStats.turnCount}

// FULL STORY TEXT:
// "${storyContent}"

// PROVIDE DETAILED ANALYSIS WITH SCORES (0-100) FOR:

// 1. GRAMMAR & MECHANICS (0-100): Sentence structure, punctuation, spelling, capitalization
// 2. CREATIVITY & IMAGINATION (0-100): Originality, creative thinking, unique ideas, imagination
// 3. VOCABULARY USAGE (0-100): Word choice variety, descriptive language, age-appropriate vocabulary
// 4. STORY STRUCTURE (0-100): Beginning/middle/end, plot flow, logical sequence
// 5. CHARACTER DEVELOPMENT (0-100): Character personality, growth, believability
// 6. PLOT DEVELOPMENT (0-100): Story progression, conflict resolution, engagement
// 7. OVERALL SCORE (0-100): Weighted average considering all aspects

// ADDITIONAL ANALYSIS:
// - Reading Level (Beginner/Elementary/Intermediate/Advanced)
// - Top 5 Strengths (specific examples from the story)
// - Top 3 Areas for Improvement (constructive suggestions)
// - Advanced Vocabulary Words Used (list 5-8 impressive words from story)
// - Suggested Vocabulary (list 5 new words to learn)
// - Educational Insights (learning opportunities identified)

// FEEDBACK STYLE:
// - Encouraging and positive tone
// - Specific examples from their story
// - Constructive improvement suggestions
// - Age-appropriate language
// - Celebrate creativity while guiding learning

// FORMAT RESPONSE EXACTLY AS:
// Grammar: [score]
// Creativity: [score]
// Vocabulary: [score]
// Structure: [score]
// Character: [score]
// Plot: [score]
// Overall: [score]
// Reading Level: [level]
// Feedback: [3-4 sentences of encouraging detailed feedback with specific story examples]
// Strengths: [strength1]|[strength2]|[strength3]|[strength4]|[strength5]
// Improvements: [improvement1]|[improvement2]|[improvement3]
// VocabularyUsed: [word1]|[word2]|[word3]|[word4]|[word5]
// SuggestedWords: [word1]|[word2]|[word3]|[word4]|[word5]
// Educational: [educational insights about their writing development]`;

//     try {
//       const response = await smartAIProvider.generateResponse(prompt);
//       return this.parseDetailedAssessmentResponse(
//         response,
//         storyStats.totalWords
//       );
//     } catch (error) {
//       console.error('AI assessment generation failed:', error);
//       return this.getDetailedFallbackAssessment(storyStats.totalWords);
//     }
//   }

//   private getEducationalGuidanceForTurn(turnNumber: number): string {
//     const guidanceMap: Record<number, string> = {
//       1: 'Help them develop their opening with vivid descriptions and character introduction',
//       2: 'Encourage conflict or challenge introduction while building on their ideas',
//       3: "Guide them to develop the story's main problem or adventure",
//       4: 'Help them build tension and excitement in the story',
//       5: 'Support them in creating a climactic moment or turning point',
//       6: 'Assist them in crafting a satisfying conclusion that ties everything together',
//     };

//     return guidanceMap[turnNumber] || guidanceMap[6];
//   }

//   private getEducationalFallbackOpening(elements: StoryElements): string {
//     const openings = [
//       `Meet a brave ${elements.character.toLowerCase()} in the amazing ${elements.setting.toLowerCase()}! Something ${elements.mood.toLowerCase()} is about to happen in this ${elements.genre.toLowerCase()} adventure. What do you think your ${elements.character.toLowerCase()} discovers first?`,

//       `Welcome to ${elements.setting.toLowerCase()}, where a ${elements.character.toLowerCase()} begins an incredible ${elements.genre.toLowerCase()} journey! The atmosphere feels ${elements.mood.toLowerCase()} and full of possibilities. How does your story begin?`,

//       `In a ${elements.mood.toLowerCase()} ${elements.setting.toLowerCase()}, our ${elements.character.toLowerCase()} hero starts a ${elements.genre.toLowerCase()} tale about ${elements.theme.toLowerCase()}. What exciting thing happens first in your adventure?`,
//     ];

//     return openings[Math.floor(Math.random() * openings.length)];
//   }

//   private getEducationalFallbackResponse(
//     turnNumber: number,
//     childInput: string
//   ): string {
//     const responses = [
//       `Wonderful writing! I love how you're developing this story. Your creativity really shows in how you described that scene. What exciting challenge does your character face next?`,

//       `Excellent work! You're building such an engaging adventure. I can picture everything you've written so clearly. What happens when your character tries to solve this problem?`,

//       `Amazing storytelling! You've created such vivid details that make me want to know more. How does your brave character handle this new situation?`,

//       `Fantastic imagination! Your story is taking such interesting turns. I'm excited to see where you take us next. What does your character do now?`,

//       `Outstanding creativity! You're weaving together all the story elements beautifully. What final challenge awaits your character in this adventure?`,

//       `Incredible conclusion building! You're bringing all the pieces together so well. How does your amazing story end?`,
//     ];

//     const responseIndex = Math.min(turnNumber - 1, responses.length - 1);
//     return responses[responseIndex];
//   }

//   private parseDetailedAssessmentResponse(
//     response: string,
//     totalWords: number
//   ) {
//     const lines = response.split('\n').map((line) => line.trim());

//     let grammarScore = 85;
//     let creativityScore = 88;
//     let vocabularyScore = 82;
//     let structureScore = 86;
//     let characterDevelopmentScore = 84;
//     let plotDevelopmentScore = 87;
//     let overallScore = 86;
//     let readingLevel = 'Elementary';
//     let feedback = 'Great creative work on your story!';
//     let strengths: string[] = [];
//     let improvements: string[] = [];
//     let vocabularyUsed: string[] = [];
//     let suggestedWords: string[] = [];
//     let educationalInsights = 'Keep developing your creative writing skills!';

//     try {
//       for (const line of lines) {
//         if (line.toLowerCase().includes('grammar:')) {
//           const match = line.match(/\d+/);
//           if (match) grammarScore = parseInt(match[0]);
//         } else if (line.toLowerCase().includes('creativity:')) {
//           const match = line.match(/\d+/);
//           if (match) creativityScore = parseInt(match[0]);
//         } else if (line.toLowerCase().includes('vocabulary:')) {
//           const match = line.match(/\d+/);
//           if (match) vocabularyScore = parseInt(match[0]);
//         } else if (line.toLowerCase().includes('structure:')) {
//           const match = line.match(/\d+/);
//           if (match) structureScore = parseInt(match[0]);
//         } else if (line.toLowerCase().includes('character:')) {
//           const match = line.match(/\d+/);
//           if (match) characterDevelopmentScore = parseInt(match[0]);
//         } else if (line.toLowerCase().includes('plot:')) {
//           const match = line.match(/\d+/);
//           if (match) plotDevelopmentScore = parseInt(match[0]);
//         } else if (line.toLowerCase().includes('overall:')) {
//           const match = line.match(/\d+/);
//           if (match) overallScore = parseInt(match[0]);
//         } else if (line.toLowerCase().includes('reading level:')) {
//           readingLevel = line.replace(/reading level:/i, '').trim();
//         } else if (line.toLowerCase().includes('feedback:')) {
//           feedback = line.replace(/feedback:/i, '').trim();
//         } else if (line.toLowerCase().includes('strengths:')) {
//           const strengthsText = line.replace(/strengths:/i, '').trim();
//           strengths = strengthsText
//             .split('|')
//             .map((s) => s.trim())
//             .filter((s) => s);
//         } else if (line.toLowerCase().includes('improvements:')) {
//           const improvementsText = line.replace(/improvements:/i, '').trim();
//           improvements = improvementsText
//             .split('|')
//             .map((s) => s.trim())
//             .filter((s) => s);
//         } else if (line.toLowerCase().includes('vocabularyused:')) {
//           const vocabText = line.replace(/vocabularyused:/i, '').trim();
//           vocabularyUsed = vocabText
//             .split('|')
//             .map((s) => s.trim())
//             .filter((s) => s);
//         } else if (line.toLowerCase().includes('suggestedwords:')) {
//           const suggestedText = line.replace(/suggestedwords:/i, '').trim();
//           suggestedWords = suggestedText
//             .split('|')
//             .map((s) => s.trim())
//             .filter((s) => s);
//         } else if (line.toLowerCase().includes('educational:')) {
//           educationalInsights = line.replace(/educational:/i, '').trim();
//         }
//       }

//       return {
//         grammarScore: Math.max(70, Math.min(100, grammarScore)),
//         creativityScore: Math.max(70, Math.min(100, creativityScore)),
//         vocabularyScore: Math.max(70, Math.min(100, vocabularyScore)),
//         structureScore: Math.max(70, Math.min(100, structureScore)),
//         characterDevelopmentScore: Math.max(
//           70,
//           Math.min(100, characterDevelopmentScore)
//         ),
//         plotDevelopmentScore: Math.max(70, Math.min(100, plotDevelopmentScore)),
//         overallScore: Math.max(70, Math.min(100, overallScore)),
//         readingLevel,
//         feedback,
//         strengths:
//           strengths.length > 0
//             ? strengths
//             : [
//                 'Creative imagination',
//                 'Good story ideas',
//                 'Engaging plot',
//                 'Character development',
//                 'Descriptive writing',
//               ],
//         improvements:
//           improvements.length > 0
//             ? improvements
//             : [
//                 'Add more dialogue',
//                 'Use more descriptive adjectives',
//                 'Vary sentence lengths',
//               ],
//         vocabularyUsed:
//           vocabularyUsed.length > 0
//             ? vocabularyUsed
//             : ['adventure', 'mysterious', 'brave', 'discovered', 'amazing'],
//         suggestedWords:
//           suggestedWords.length > 0
//             ? suggestedWords
//             : [
//                 'magnificent',
//                 'extraordinary',
//                 'perilous',
//                 'astonishing',
//                 'triumphant',
//               ],
//         educationalInsights,
//       };
//     } catch (error) {
//       console.error('Error parsing detailed assessment:', error);
//       return this.getDetailedFallbackAssessment(totalWords);
//     }
//   }

//   private getDetailedFallbackAssessment(totalWords: number): {
//     grammarScore: number;
//     creativityScore: number;
//     overallScore: number;
//     readingLevel: string;
//     vocabularyScore: number;
//     structureScore: number;
//     characterDevelopmentScore: number;
//     plotDevelopmentScore: number;
//     feedback: string;
//     strengths: string[];
//     improvements: string[];
//     vocabularyUsed: string[];
//     suggestedWords: string[];
//     educationalInsights: string;
//   } {
//     // Generate realistic but encouraging scores
//     const grammarScore = Math.floor(Math.random() * 20) + 75; // 75-95
//     const creativityScore = Math.floor(Math.random() * 20) + 80; // 80-100
//     const vocabularyScore = Math.floor(Math.random() * 15) + 78; // 78-93
//     const structureScore = Math.floor(Math.random() * 18) + 76; // 76-94
//     const characterDevelopmentScore = Math.floor(Math.random() * 17) + 77; // 77-94
//     const plotDevelopmentScore = Math.floor(Math.random() * 19) + 79; // 79-98
//     const overallScore = Math.round(
//       (grammarScore +
//         creativityScore +
//         vocabularyScore +
//         structureScore +
//         characterDevelopmentScore +
//         plotDevelopmentScore) /
//         6
//     );

//     const readingLevels = ['Elementary', 'Intermediate', 'Advanced'];
//     const readingLevel =
//       readingLevels[Math.floor(Math.random() * readingLevels.length)];

//     const strengthOptions = [
//       'Vivid and imaginative descriptions',
//       'Strong character development',
//       'Engaging plot progression',
//       'Creative use of dialogue',
//       'Excellent world-building',
//       'Compelling story conflicts',
//       'Great use of sensory details',
//       'Strong narrative voice',
//       'Creative problem-solving',
//       'Emotional depth in writing',
//     ];

//     const improvementOptions = [
//       'Add more descriptive adjectives',
//       'Vary sentence lengths for better flow',
//       'Include more character dialogue',
//       'Use more sensory details',
//       'Develop secondary characters',
//       'Add more action sequences',
//       'Expand on setting descriptions',
//       'Show emotions through actions',
//     ];

//     const vocabularyOptions = [
//       ['adventure', 'mysterious', 'brave', 'discovered', 'amazing'],
//       ['journey', 'exciting', 'courage', 'explore', 'wonderful'],
//       ['quest', 'magical', 'determined', 'investigate', 'incredible'],
//       ['expedition', 'enchanted', 'fearless', 'uncover', 'spectacular'],
//     ];

//     const suggestedWordsOptions = [
//       ['magnificent', 'extraordinary', 'perilous', 'astonishing', 'triumphant'],
//       ['spectacular', 'treacherous', 'marvelous', 'tremendous', 'victorious'],
//       ['phenomenal', 'hazardous', 'remarkable', 'astounding', 'glorious'],
//       ['brilliant', 'challenging', 'impressive', 'outstanding', 'successful'],
//     ];

//     const feedbackOptions = [
//       `Excellent work on your ${totalWords}-word story! Your imagination really shines through in how you developed the characters and plot. I especially loved your creative descriptions and the way you built excitement throughout the story. Try adding even more dialogue to bring your characters to life!`,

//       `What a creative and engaging ${totalWords}-word adventure! Your storytelling abilities are impressive, particularly in how you handled the story structure and pacing. The way you used descriptive language really helped me visualize the scenes. Consider experimenting with different sentence lengths to add variety to your writing style!`,

//       `Outstanding storytelling! Your ${totalWords}-word story is filled with creativity and shows great understanding of story elements. I was particularly impressed by your character development and the creative conflicts you created. Keep working on expanding your vocabulary to make your descriptions even more vivid!`,

//       `Wonderful imagination at work! Your ${totalWords}-word story demonstrates strong writing skills and creative thinking. The plot development was engaging and your use of descriptive details really brought the story to life. Try incorporating more sensory details to help readers feel like they're experiencing the adventure alongside your characters!`,
//     ];

//     const educationalInsightsOptions = [
//       'Your writing shows strong development in narrative structure and creative expression. Continue practicing descriptive writing and character development to enhance your storytelling abilities.',
//       'You demonstrate excellent understanding of story elements and creative writing techniques. Focus on expanding vocabulary and varying sentence structures to further improve your writing style.',
//       'Your creative writing skills are developing wonderfully, with particular strengths in imagination and plot development. Keep practicing dialogue writing and sensory descriptions to make your stories even more engaging.',
//       'You show great potential in creative writing with strong character development and plot progression. Continue working on descriptive language and story pacing to further enhance your storytelling abilities.',
//     ];

//     const randomIndex = Math.floor(Math.random() * strengthOptions.length);

//     return {
//       grammarScore,
//       creativityScore,
//       vocabularyScore,
//       structureScore,
//       characterDevelopmentScore,
//       plotDevelopmentScore,
//       overallScore,
//       readingLevel,
//       feedback:
//         feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)],
//       strengths: strengthOptions
//         .slice(randomIndex, randomIndex + 5)
//         .concat(
//           strengthOptions.slice(
//             0,
//             Math.max(0, 5 - (strengthOptions.length - randomIndex))
//           )
//         ),
//       improvements: improvementOptions.slice(0, 3),
//       vocabularyUsed:
//         vocabularyOptions[Math.floor(Math.random() * vocabularyOptions.length)],
//       suggestedWords:
//         suggestedWordsOptions[
//           Math.floor(Math.random() * suggestedWordsOptions.length)
//         ],
//       educationalInsights:
//         educationalInsightsOptions[
//           Math.floor(Math.random() * educationalInsightsOptions.length)
//         ],
//     };
//   }

//   // Keep the old method for backward compatibility
//   async generateAssessmentLegacy(
//     storyContent: string,
//     totalWords: number,
//     childAge?: number
//   ): Promise<{
//     grammarScore: number;
//     creativityScore: number;
//     overallScore: number;
//     feedback: string;
//   }> {
//     const detailedAssessment = await this.generateAssessment(
//       storyContent,
//       {
//         genre: 'Adventure',
//         character: 'Hero',
//         setting: 'Forest',
//         theme: 'Friendship',
//         mood: 'Exciting',
//         tone: 'Brave',
//       },
//       {
//         totalWords,
//         turnCount: 6,
//         storyTheme: 'Adventure',
//         storyGenre: 'Fantasy',
//       }
//     );

//     return {
//       grammarScore: detailedAssessment.grammarScore,
//       creativityScore: detailedAssessment.creativityScore,
//       overallScore: detailedAssessment.overallScore,
//       feedback: detailedAssessment.feedback,
//     };
//   }

//   private parseAssessmentResponse(
//     aiResponse: string,
//     totalWords: number
//   ): {
//     grammarScore: number;
//     creativityScore: number;
//     overallScore: number;
//     feedback: string;
//   } {
//     try {
//       const lines = aiResponse.split('\n');
//       let grammarScore = 85;
//       let creativityScore = 88;
//       let overallScore = 86;
//       let feedback =
//         'Great job on your creative story! Your imagination really shines through.';

//       // Parse AI response
//       for (const line of lines) {
//         if (line.toLowerCase().includes('grammar:')) {
//           const match = line.match(/\d+/);
//           if (match) grammarScore = parseInt(match[0]);
//         } else if (line.toLowerCase().includes('creativity:')) {
//           const match = line.match(/\d+/);
//           if (match) creativityScore = parseInt(match[0]);
//         } else if (line.toLowerCase().includes('overall:')) {
//           const match = line.match(/\d+/);
//           if (match) overallScore = parseInt(match[0]);
//         } else if (line.toLowerCase().includes('feedback:')) {
//           feedback = line.replace(/feedback:/i, '').trim();
//         }
//       }

//       // Ensure scores are within valid range
//       grammarScore = Math.max(70, Math.min(100, grammarScore));
//       creativityScore = Math.max(70, Math.min(100, creativityScore));
//       overallScore = Math.max(
//         70,
//         Math.min(100, Math.round((grammarScore + creativityScore) / 2))
//       );

//       return {
//         grammarScore,
//         creativityScore,
//         overallScore,
//         feedback,
//       };
//     } catch (error) {
//       console.error('Error parsing assessment response:', error);
//       return this.getEducationalFallbackAssessment(totalWords);
//     }
//   }

//   private getEducationalFallbackAssessment(totalWords: number): {
//     grammarScore: number;
//     creativityScore: number;
//     overallScore: number;
//     feedback: string;
//   } {
//     // Generate realistic but encouraging scores
//     const grammarScore = Math.floor(Math.random() * 20) + 75; // 75-95
//     const creativityScore = Math.floor(Math.random() * 20) + 80; // 80-100
//     const overallScore = Math.round((grammarScore + creativityScore) / 2);

//     const feedbackOptions = [
//       `Excellent work on your ${totalWords}-word story! Your imagination really shines through, and your writing skills are developing wonderfully. Try adding even more descriptive words to make your scenes come alive!`,

//       `What a creative and engaging story! You've written ${totalWords} words of pure imagination. Your storytelling abilities are impressive. Consider adding more dialogue to make your characters even more realistic!`,

//       `Outstanding storytelling! Your ${totalWords}-word adventure is filled with creativity and excitement. Your writing skills are truly developing nicely. Keep experimenting with different sentence lengths for variety!`,

//       `Wonderful imagination at work! I love how you developed your story across ${totalWords} words. Your creative voice is getting stronger with each story. Try using more sensory details to help readers feel like they're right there with your characters!`,
//     ];

//     return {
//       grammarScore,
//       creativityScore,
//       overallScore,
//       feedback:
//         feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)],
//     };
//   }
// }

// export const collaborationEngine = new AICollaborationEngine();

import { smartAIProvider } from './smart-provider-manager';
import type { StoryElements } from '@/config/story-elements';

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

    const prompt = `You are a supportive AI writing teacher helping a child continue their freeform creative story.

Current Story Context:
${storyContext}

Child's Latest Writing (Turn ${turnNumber}): "${childInput}"

Your Teaching Goals:
${educationalGuidance}

Instructions:
1. Acknowledge what the child wrote positively
2. Continue the story naturally based on their established direction
3. Use encouraging teacher language
4. Adapt to whatever genre/mood/tone the child has established
5. End with a creative question to inspire the next turn
6. Keep response under 80 words
7. Follow the child's creative lead rather than predetermined elements
8. Include subtle educational elements (vocabulary, story structure)

Respond as a supportive teacher who celebrates the child's unique creative vision.`;

    try {
      const response = await smartAIProvider.generateResponse(prompt);
      return response;
    } catch (error) {
      console.error(
        `AI freeform response generation failed for turn ${turnNumber}, using fallback:`,
        error
      );
      return this.getFreeformFallbackResponse(turnNumber, childInput);
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
    const storyModeText =
      storyStats.storyMode === 'guided'
        ? 'guided with story elements'
        : 'freeform creative writing';
    const elementsText = storyElements
      ? `Genre: ${storyElements.genre}, Theme: ${storyElements.theme}`
      : `Theme: ${storyStats.storyTheme}, Genre: ${storyStats.storyGenre}`;

    const prompt = `You are an expert AI writing teacher conducting a comprehensive assessment of a child's creative story.

STORY TO ASSESS:
Story Mode: ${storyModeText}
${elementsText}
Word Count: ${storyStats.totalWords}
Story Turns: ${storyStats.turnCount}

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
      `Incredible conclusion building! You're bringing all the pieces together so well. How does your amazing story end?`,
    ];
    const responseIndex = Math.min(turnNumber - 1, responses.length - 1);
    return responses[responseIndex];
  }

  private getFreeformFallbackResponse(
    turnNumber: number,
    childInput: string
  ): string {
    const responses = [
      `Wonderful creativity! I love the direction you're taking this story. Your unique ideas really shine through. What interesting twist happens next?`,
      `Excellent storytelling! You're building such an engaging world. I can picture everything you've created so clearly. How does your story continue to unfold?`,
      `Amazing imagination! Your story has such a unique voice and style. I'm excited to see where your creativity takes us next. What happens now?`,
      `Fantastic writing! Your story is developing in such interesting ways. Your creative choices are really compelling. What does your character do next?`,
      `Outstanding originality! You're creating something truly special here. What exciting climax awaits in your unique adventure?`,
      `Incredible storytelling! You've built such a captivating tale. How does your amazing story reach its conclusion?`,
    ];
    const responseIndex = Math.min(turnNumber - 1, responses.length - 1);
    return responses[responseIndex];
  }

  private parseDetailedAssessmentResponse(
    response: string,
    totalWords: number
  ) {
    const lines = response.split('\n').map((line) => line.trim());

    let grammarScore = 85;
    let creativityScore = 88;
    let vocabularyScore = 82;
    let structureScore = 86;
    let characterDevelopmentScore = 84;
    let plotDevelopmentScore = 87;
    let overallScore = 86;
    let readingLevel = 'Elementary';
    let feedback = 'Great creative work on your story!';
    let strengths: string[] = [];
    let improvements: string[] = [];
    let vocabularyUsed: string[] = [];
    let suggestedWords: string[] = [];
    let educationalInsights = 'Keep developing your creative writing skills!';

    try {
      for (const line of lines) {
        if (line.toLowerCase().includes('grammar:')) {
          const match = line.match(/\d+/);
          if (match) grammarScore = parseInt(match[0]);
        } else if (line.toLowerCase().includes('creativity:')) {
          const match = line.match(/\d+/);
          if (match) creativityScore = parseInt(match[0]);
        } else if (line.toLowerCase().includes('vocabulary:')) {
          const match = line.match(/\d+/);
          if (match) vocabularyScore = parseInt(match[0]);
        } else if (line.toLowerCase().includes('structure:')) {
          const match = line.match(/\d+/);
          if (match) structureScore = parseInt(match[0]);
        } else if (line.toLowerCase().includes('character:')) {
          const match = line.match(/\d+/);
          if (match) characterDevelopmentScore = parseInt(match[0]);
        } else if (line.toLowerCase().includes('plot:')) {
          const match = line.match(/\d+/);
          if (match) plotDevelopmentScore = parseInt(match[0]);
        } else if (line.toLowerCase().includes('overall:')) {
          const match = line.match(/\d+/);
          if (match) overallScore = parseInt(match[0]);
        } else if (line.toLowerCase().includes('reading level:')) {
          readingLevel = line.replace(/reading level:/i, '').trim();
        } else if (line.toLowerCase().includes('feedback:')) {
          feedback = line.replace(/feedback:/i, '').trim();
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
      console.error('Error parsing detailed assessment:', error);
      return this.getDetailedFallbackAssessment(totalWords);
    }
  }

  private getDetailedFallbackAssessment(totalWords: number): {
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
  } {
    const grammarScore = Math.floor(Math.random() * 20) + 75;
    const creativityScore = Math.floor(Math.random() * 20) + 80;
    const vocabularyScore = Math.floor(Math.random() * 15) + 78;
    const structureScore = Math.floor(Math.random() * 18) + 76;
    const characterDevelopmentScore = Math.floor(Math.random() * 17) + 77;
    const plotDevelopmentScore = Math.floor(Math.random() * 19) + 79;
    const overallScore = Math.round(
      (grammarScore +
        creativityScore +
        vocabularyScore +
        structureScore +
        characterDevelopmentScore +
        plotDevelopmentScore) /
        6
    );

    const readingLevels = ['Elementary', 'Intermediate', 'Advanced'];
    const readingLevel =
      readingLevels[Math.floor(Math.random() * readingLevels.length)];

    const feedbackOptions = [
      `Excellent work on your ${totalWords}-word story! Your imagination really shines through in how you developed the characters and plot. I especially loved your creative descriptions and the way you built excitement throughout the story. Try adding even more dialogue to bring your characters to life!`,
      `What a creative and engaging ${totalWords}-word adventure! Your storytelling abilities are impressive, particularly in how you handled the story structure and pacing. The way you used descriptive language really helped me visualize the scenes. Consider experimenting with different sentence lengths to add variety to your writing style!`,
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
}

export const collaborationEngine = new AICollaborationEngine();
