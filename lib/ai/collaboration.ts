// // lib/ai/collaboration.ts (UPDATED)
// import { smartAIProvider } from './smart-provider-manager';

// interface StoryElements {
//   genre: string;
//   character: string;
//   setting: string;
//   theme: string;
//   mood: string;
//   tone: string;
// }

// export class AICollaborationEngine {
  
//   async generateOpeningPrompt(elements: StoryElements): Promise<string> {
//     const prompt = `You are a creative writing teacher helping a young student start their story. 

// Story Elements:
// - Genre: ${elements.genre}
// - Character: ${elements.character}  
// - Setting: ${elements.setting}
// - Theme: ${elements.theme}
// - Mood: ${elements.mood}
// - Tone: ${elements.tone}

// Create an engaging story opening (2-3 sentences) that:
// 1. Introduces the character and setting
// 2. Sets the mood and tone
// 3. Ends with an encouraging question that invites the child to continue

// Be encouraging, age-appropriate, and exciting! Make the child excited to write their first part of the story.`;

//     return await smartAIProvider.generateResponse(prompt);
//   }

//   async generateResponse(context: any, childInput: string, turnNumber: number, elements: StoryElements): Promise<string> {
//     const prompt = `Continue this ${elements.genre} story with a ${elements.mood} mood. 

// Previous story context: ${context}

// Child's latest addition: "${childInput}"

// Respond with 2-3 sentences that:
// 1. Acknowledge what the child wrote positively
// 2. Add an exciting story development 
// 3. End with a question or prompt for the child to continue

// Keep it encouraging, creative, and age-appropriate. Turn ${turnNumber}/6.`;

//     return await smartAIProvider.generateResponse(prompt);
//   }

//   async generateAssessment(storyContent: string, totalWords: number): Promise<{
//     grammarScore: number;
//     creativityScore: number;
//     overallScore: number;
//     feedback: string;
//   }> {
//     const prompt = `Assess this children's story (${totalWords} words):

// "${storyContent}"

// Provide scores (0-100) for:
// 1. Grammar & Writing Mechanics
// 2. Creativity & Imagination  
// 3. Overall Quality

// Also write encouraging feedback highlighting what the child did well.

// Format: Grammar: [score], Creativity: [score], Overall: [score], Feedback: [feedback]`;

//     const response = await smartAIProvider.generateResponse(prompt);
    
//     // Parse the response (add fallback scores)
//     const lines = response.split('\n');
//     let grammarScore = 85;
//     let creativityScore = 88;
//     let overallScore = 86;
//     let feedback = "Great job on your creative story! Keep writing and let your imagination soar.";

//     try {
//       for (const line of lines) {
//         if (line.toLowerCase().includes('grammar:')) {
//           grammarScore = parseInt(line.match(/\d+/)?.[0] || '85');
//         } else if (line.toLowerCase().includes('creativity:')) {
//           creativityScore = parseInt(line.match(/\d+/)?.[0] || '88');
//         } else if (line.toLowerCase().includes('overall:')) {
//           overallScore = parseInt(line.match(/\d+/)?.[0] || '86');
//         } else if (line.toLowerCase().includes('feedback:')) {
//           feedback = line.replace(/feedback:\s*/i, '').trim() || feedback;
//         }
//       }
//     } catch (error) {
//       console.error('Error parsing assessment:', error);
//     }

//     return {
//       grammarScore: Math.min(100, Math.max(0, grammarScore)),
//       creativityScore: Math.min(100, Math.max(0, creativityScore)), 
//       overallScore: Math.min(100, Math.max(0, overallScore)),
//       feedback
//     };
//   }
// }

// export const collaborationEngine = new AICollaborationEngine();

// lib/ai/collaboration.ts (COMPLETE UPDATED VERSION)
import { smartAIProvider } from './smart-provider-manager';

interface StoryElements {
  genre: string;
  character: string;
  setting: string;
  theme: string;
  mood: string;
  tone: string;
}

interface StoryContext {
  elements: StoryElements;
  previousTurns: Array<{
    childInput: string;
    aiResponse: string;
  }>;
  currentTurn: number;
}

export class AICollaborationEngine {
  
  async generateOpeningPrompt(elements: StoryElements): Promise<string> {
    const prompt = `You are a creative writing teacher helping a young student start their story. Create a magical opening based on these specific elements:

Story Elements:
- Genre: ${elements.genre}
- Character: ${elements.character}  
- Setting: ${elements.setting}
- Theme: ${elements.theme}
- Mood: ${elements.mood}
- Tone: ${elements.tone}

Create an engaging, specific story opening (2-3 sentences) that:
1. Introduces the ${elements.character} in the ${elements.setting}
2. Sets a ${elements.mood} mood with a ${elements.tone} tone
3. Incorporates the theme of ${elements.theme}
4. Ends with an exciting question that makes the child eager to write

Example style: "Princess Luna stood before the shimmering time portal, her heart racing with curiosity about where it might lead. The magical doorway sparkled with rainbow colors, and she could hear faint laughter echoing from the other side. What amazing adventure awaits her when she steps through?"

Make it specific to these exact elements, exciting, and age-appropriate for children!`;

    return await smartAIProvider.generateResponse(prompt);
  }

  async generateResponse(context: StoryContext, childInput: string): Promise<string> {
    const previousContext = context.previousTurns.length > 0 
      ? `Previous story parts:\n${context.previousTurns.map((turn, index) => 
          `Turn ${index + 1}:\nChild wrote: ${turn.childInput}\nAI added: ${turn.aiResponse}`
        ).join('\n\n')}\n\n`
      : '';

    const prompt = `Continue this ${context.elements.genre} story with a ${context.elements.mood} mood and ${context.elements.tone} tone.

Story Elements: ${context.elements.character} in ${context.elements.setting}, theme: ${context.elements.theme}

${previousContext}Child's latest addition (Turn ${context.currentTurn}): "${childInput}"

Respond with 2-3 sentences that:
1. Acknowledge what the child wrote positively and specifically
2. Add an exciting story development that fits the ${context.elements.mood} mood
3. End with a question or prompt that encourages the child to continue
4. Keep the ${context.elements.tone} tone throughout

Be encouraging, creative, and age-appropriate. This is Turn ${context.currentTurn} of 6.`;

    return await smartAIProvider.generateResponse(prompt);
  }

  // New method for better story context management
  async generateContextualResponse(
    elements: StoryElements,
    allTurns: Array<{ childInput: string; aiResponse: string }>,
    newChildInput: string,
    turnNumber: number
  ): Promise<string> {
    const storyContext = allTurns.map((turn, index) => 
      `Turn ${index + 1}: ${turn.childInput}`
    ).join('\n');

    const prompt = `Continue this ${elements.genre} story about a ${elements.character} in a ${elements.setting}.

Story so far:
${storyContext}

New addition (Turn ${turnNumber}): "${newChildInput}"

Respond as a creative writing teacher with 2-3 sentences that:
1. Positively acknowledge the child's writing
2. Add an exciting ${elements.mood} development 
3. Keep the ${elements.tone} tone
4. Focus on the theme of ${elements.theme}
5. End with an engaging question to continue

Make it encouraging and age-appropriate!`;

    return await smartAIProvider.generateResponse(prompt);
  }

  async generateAssessment(storyContent: string, totalWords: number, elements: StoryElements): Promise<{
    grammarScore: number;
    creativityScore: number;
    overallScore: number;
    feedback: string;
  }> {
    const prompt = `Assess this children's story (${totalWords} words) as a encouraging teacher:

Story Elements Used: ${elements.character}, ${elements.setting}, ${elements.theme}, ${elements.mood}, ${elements.tone}

Story Content:
"${storyContent}"

Provide scores (0-100) and encouraging feedback:

1. Grammar & Writing Mechanics (0-100)
2. Creativity & Imagination (0-100) 
3. Overall Quality (0-100)

Focus on what the child did well! Mention:
- How well they used the story elements
- Creative parts you enjoyed
- Writing skills they demonstrated
- One gentle suggestion for improvement

Format your response as:
Grammar: [score]
Creativity: [score]
Overall: [score]
Feedback: [encouraging feedback highlighting specific strengths]`;

    const response = await smartAIProvider.generateResponse(prompt);
    
    // Parse the AI response with better error handling
    const lines = response.split('\n');
    let grammarScore = 85;
    let creativityScore = 88;
    let overallScore = 86;
    let feedback = "Great job on your creative story! You used your story elements wonderfully and showed great imagination. Keep writing and let your creativity soar!";

    try {
      for (const line of lines) {
        const trimmedLine = line.trim().toLowerCase();
        
        if (trimmedLine.includes('grammar:')) {
          const match = line.match(/\d+/);
          if (match) grammarScore = parseInt(match[0]);
        } else if (trimmedLine.includes('creativity:')) {
          const match = line.match(/\d+/);
          if (match) creativityScore = parseInt(match[0]);
        } else if (trimmedLine.includes('overall:')) {
          const match = line.match(/\d+/);
          if (match) overallScore = parseInt(match[0]);
        } else if (trimmedLine.includes('feedback:')) {
          const feedbackText = line.replace(/feedback:\s*/i, '').trim();
          if (feedbackText.length > 10) feedback = feedbackText;
        }
      }
    } catch (error) {
      console.error('Error parsing assessment:', error);
    }

    return {
      grammarScore: Math.min(100, Math.max(0, grammarScore)),
      creativityScore: Math.min(100, Math.max(0, creativityScore)), 
      overallScore: Math.min(100, Math.max(0, overallScore)),
      feedback
    };
  }

  // Helper method to get writing tips based on turn number
  getWritingTip(turnNumber: number, elements: StoryElements): string {
    const tips = {
      1: `Start by introducing your ${elements.character} in the ${elements.setting}. What does your character see, hear, or feel?`,
      2: `Show your ${elements.character}'s personality! How do they react to their surroundings? Add some dialogue or thoughts.`,
      3: `Create a challenge or problem for your ${elements.character}. What obstacle do they face in the ${elements.setting}?`,
      4: `Build excitement! How does your ${elements.character} work towards solving the problem? Show their ${elements.theme} in action.`,
      5: `This is the climax! What's the most exciting moment? How does the theme of ${elements.theme} help resolve the conflict?`,
      6: `Wrap up your adventure! How has your ${elements.character} changed? End with a satisfying conclusion that reflects the ${elements.mood} mood.`
    };

    return tips[turnNumber as keyof typeof tips] || tips[6];
  }

  // Method to validate story elements
  validateElements(elements: StoryElements): boolean {
    const required = ['genre', 'character', 'setting', 'theme', 'mood', 'tone'];
    return required.every(key => elements[key as keyof StoryElements]?.length > 0);
  }
}

export const collaborationEngine = new AICollaborationEngine();