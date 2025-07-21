// lib/ai/word-enforcer.ts
interface TurnRequirement {
  turnNumber: number;
  minWords: number;
  maxWords: number;
  guidance: string;
}

export const TURN_PROGRESSION: TurnRequirement[] = [
  { turnNumber: 1, minWords: 30, maxWords: 50, guidance: "Start your adventure (4-5 lines)" },
  { turnNumber: 2, minWords: 40, maxWords: 70, guidance: "Develop the story (5-7 lines)" },
  { turnNumber: 3, minWords: 50, maxWords: 80, guidance: "Add more details (6-8 lines)" },
  { turnNumber: 4, minWords: 60, maxWords: 90, guidance: "Build excitement (7-9 lines)" },
  { turnNumber: 5, minWords: 70, maxWords: 100, guidance: "Create the climax (8-10 lines)" },
  { turnNumber: 6, minWords: 80, maxWords: 120, guidance: "Write the ending (10-12 lines)" }
];

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

export function getTurnRequirement(turnNumber: number): TurnRequirement {
  return TURN_PROGRESSION[turnNumber - 1] || TURN_PROGRESSION[TURN_PROGRESSION.length - 1];
}

export function validateTurnInput(input: string, turnNumber: number): {
  isValid: boolean;
  wordCount: number;
  requirement: TurnRequirement;
  message?: string;
} {
  const wordCount = countWords(input);
  const requirement = getTurnRequirement(turnNumber);
  
  if (wordCount < requirement.minWords) {
    return {
      isValid: false,
      wordCount,
      requirement,
      message: `Please write at least ${requirement.minWords} words to continue (you have ${wordCount})`
    };
  }
  
  return {
    isValid: true,
    wordCount,
    requirement
  };
}

export function getWordCountStatus(currentWords: number, turn: number): {
  status: 'on_track' | 'behind' | 'ahead' | 'final_push';
  message: string;
  suggestedWords: number;
} {
  const expectedWords = turn * 85; // ~85 words per turn target
  
  if (currentWords < expectedWords * 0.7) {
    return {
      status: 'behind',
      message: `You're a bit behind! Try writing ${Math.ceil((expectedWords - currentWords) * 1.3)} more words this turn.`,
      suggestedWords: Math.ceil((expectedWords - currentWords) * 1.3)
    };
  }
  
  if (currentWords > expectedWords * 1.3) {
    return {
      status: 'ahead', 
      message: "Great job! You're ahead of pace. Keep the momentum going!",
      suggestedWords: 60
    };
  }
  
  return {
    status: 'on_track',
    message: "Perfect pace! Keep writing at this level.",
    suggestedWords: 80
  };
}