// lib/ai/word-enforcer.ts
interface TurnRequirement {
  turnNumber: number;
  minWords: number;
  maxWords: number;
  guidance: string;
}

// Updated for 7 turns with 60-100 words per turn
export const TURN_PROGRESSION: TurnRequirement[] = [
  {
    turnNumber: 1,
    minWords: 60,
    maxWords: 100,
    guidance: 'Start your adventure (8-12 lines) - Introduce your character, setting, and opening situation',
  },
  {
    turnNumber: 2,
    minWords: 60,
    maxWords: 100,
    guidance: 'Develop the story (8-12 lines) - Show what your character discovers or encounters',
  },
  {
    turnNumber: 3,
    minWords: 60,
    maxWords: 100,
    guidance: 'Add more details (8-12 lines) - Introduce a challenge, conflict, or mystery',
  },
  {
    turnNumber: 4,
    minWords: 60,
    maxWords: 100,
    guidance: 'Build excitement (8-12 lines) - Your character takes action and faces obstacles',
  },
  {
    turnNumber: 5,
    minWords: 60,
    maxWords: 100,
    guidance: 'Increase tension (8-12 lines) - The adventure gets more intense and challenging',
  },
  {
    turnNumber: 6,
    minWords: 60,
    maxWords: 100,
    guidance: 'Create the climax (8-12 lines) - The most exciting and crucial moment of your story!',
  },
  {
    turnNumber: 7,
    minWords: 60,
    maxWords: 100,
    guidance: 'Write the ending (8-12 lines) - Resolve the adventure and show what your character learned',
  },
];

// Enhanced word counting with better text processing
export function countWords(text: string): number {
  if (!text || text.trim().length === 0) {
    return 0;
  }
  
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0 && /[a-zA-Z0-9]/.test(word)).length;
}

// Enhanced to handle up to 7 turns
export function getTurnRequirement(turnNumber: number): TurnRequirement {
  // Clamp turn number between 1 and 7
  const clampedTurn = Math.max(1, Math.min(turnNumber, 7));
  return TURN_PROGRESSION[clampedTurn - 1];
}

// Enhanced validation with better messaging
export function validateTurnInput(
  input: string,
  turnNumber: number
): {
  isValid: boolean;
  wordCount: number;
  requirement: TurnRequirement;
  message?: string;
} {
  const wordCount = countWords(input);
  const requirement = getTurnRequirement(turnNumber);

  if (wordCount < requirement.minWords) {
    const wordsNeeded = requirement.minWords - wordCount;
    return {
      isValid: false,
      wordCount,
      requirement,
      message: `Please write ${wordsNeeded} more word${wordsNeeded !== 1 ? 's' : ''} to continue (${wordCount}/${requirement.minWords} words)`,
    };
  }

  if (wordCount > requirement.maxWords) {
    const wordsOver = wordCount - requirement.maxWords;
    return {
      isValid: true, // Still valid, just a warning
      wordCount,
      requirement,
      message: `Great writing! You're ${wordsOver} word${wordsOver !== 1 ? 's' : ''} over the suggested maximum. Consider being more concise for better pacing.`,
    };
  }

  return {
    isValid: true,
    wordCount,
    requirement,
    message: `Perfect! You're within the ideal range (${wordCount}/${requirement.minWords}-${requirement.maxWords} words).`,
  };
}

// Updated for 7-turn story progression with 60-100 words per turn
export function getWordCountStatus(
  currentWords: number,
  turn: number
): {
  status: 'on_track' | 'behind' | 'ahead' | 'final_push';
  message: string;
  suggestedWords: number;
} {
  // Target: 80 words per turn (middle of 60-100 range) = ~560 total words
  const expectedWords = turn * 80;

  if (turn === 7) {
    // Final turn logic
    if (currentWords < 500) {
      return {
        status: 'final_push',
        message: `This is your final turn! Write a strong ending to reach at least 500 total words.`,
        suggestedWords: Math.max(80, 520 - currentWords),
      };
    }
    return {
      status: 'final_push',
      message: `Perfect! Time to write your epic conclusion with 60-100 words!`,
      suggestedWords: 80,
    };
  }

  if (currentWords < expectedWords * 0.75) {
    const suggestedWords = Math.min(100, Math.ceil((expectedWords - currentWords) * 1.2));
    return {
      status: 'behind',
      message: `You're behind pace! Try writing about ${suggestedWords} words this turn to catch up.`,
      suggestedWords,
    };
  }

  if (currentWords > expectedWords * 1.3) {
    return {
      status: 'ahead',
      message: "Excellent! You're ahead of pace. Keep writing 60-100 words per turn!",
      suggestedWords: 70,
    };
  }

  return {
    status: 'on_track',
    message: 'Perfect pace! Keep writing 60-100 words per turn.',
    suggestedWords: 80,
  };
}

// Updated story completion progress
export function getStoryProgress(
  currentTurn: number,
  totalWords: number
): {
  progressPercentage: number;
  phase: 'beginning' | 'middle' | 'climax' | 'ending';
  nextMilestone: string;
  expectedWords: number;
} {
  const progressPercentage = Math.min((currentTurn / 7) * 100, 100);
  const expectedWords = currentTurn * 80; // 80 words per turn target
  
  let phase: 'beginning' | 'middle' | 'climax' | 'ending';
  let nextMilestone: string;

  if (currentTurn <= 2) {
    phase = 'beginning';
    nextMilestone = 'Introduce the main challenge or mystery (60-100 words)';
  } else if (currentTurn <= 4) {
    phase = 'middle';
    nextMilestone = 'Build towards the most exciting moment (60-100 words)';
  } else if (currentTurn <= 6) {
    phase = 'climax';
    nextMilestone = 'Create the big moment of your story (60-100 words)';
  } else {
    phase = 'ending';
    nextMilestone = 'Wrap up your adventure with a satisfying conclusion (60-100 words)';
  }

  return {
    progressPercentage,
    phase,
    nextMilestone,
    expectedWords,
  };
}

// Updated writing tips for longer turns
export function getWritingTip(turnNumber: number): string {
  const tips = [
    "Start with vivid description and action! Set the scene with rich details and introduce your character with personality.",
    "Show your character exploring and discovering. Use all five senses to make the scene come alive for readers.",
    "Introduce conflict or mystery that will drive your story forward. Build tension and make readers want to know more.",
    "Show your character making important choices and taking decisive action. Add dialogue to bring characters to life.",
    "Increase the stakes and build suspense! What obstacles does your character face? How do they overcome them?",
    "This is your big moment! Make it exciting, memorable, and emotional. Show your character at their bravest or most clever.",
    "Bring your story full circle. Show how your character has changed and what they've learned from their adventure."
  ];

  return tips[Math.max(0, Math.min(turnNumber - 1, tips.length - 1))];
}

// Updated reading time calculation
export function getEstimatedReadingTime(wordCount: number): string {
  const wordsPerMinute = 200; // Average reading speed for children
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  
  if (minutes < 1) {
    return "Less than 1 minute";
  } else if (minutes === 1) {
    return "1 minute";
  } else if (minutes <= 3) {
    return `${minutes} minutes`;
  } else {
    return `${minutes} minutes (great length!)`;
  }
}

// Updated completion requirements for longer stories
export function isStoryComplete(
  currentTurn: number,
  totalWords: number
): {
  isComplete: boolean;
  meetsRequirements: boolean;
  feedback: string;
  targetLength: string;
} {
  const isComplete = currentTurn >= 7;
  const meetsRequirements = totalWords >= 420 && currentTurn >= 6; // 7 turns × 60 words minimum
  const idealLength = totalWords >= 560; // 7 turns × 80 words target

  let feedback: string;
  const targetLength = "420-700 words (7 turns × 60-100 words each)";

  if (!isComplete && !meetsRequirements) {
    const turnsLeft = 7 - currentTurn;
    const wordsNeeded = Math.max(0, 420 - totalWords);
    feedback = `Keep writing! You need ${turnsLeft} more turn${turnsLeft !== 1 ? 's' : ''} and about ${wordsNeeded} more words.`;
  } else if (!isComplete) {
    const turnsLeft = 7 - currentTurn;
    feedback = `Great word count! Complete ${turnsLeft} more turn${turnsLeft !== 1 ? 's' : ''} to finish your story.`;
  } else if (!meetsRequirements) {
    feedback = `Story complete, but aim for at least 420 words (60 words per turn) for a richer story.`;
  } else if (idealLength) {
    feedback = `Excellent! Your story is complete and has great length and detail!`;
  } else {
    feedback = `Good job! Your story meets the requirements. Consider adding more detail in future stories.`;
  }

  return {
    isComplete,
    meetsRequirements,
    feedback,
    targetLength,
  };
}

// NEW: Get turn-specific word count guidance
export function getTurnGuidance(turnNumber: number, currentWords: number): string {
  const requirement = getTurnRequirement(turnNumber);
  
  if (currentWords < 30) {
    return `Write ${requirement.minWords}-${requirement.maxWords} words for this turn. Aim for 8-12 lines of text.`;
  } else if (currentWords < requirement.minWords) {
    const needed = requirement.minWords - currentWords;
    return `Add ${needed} more words to reach the minimum (${requirement.minWords} words needed).`;
  } else if (currentWords <= requirement.maxWords) {
    return `Perfect length! You can submit now or add up to ${requirement.maxWords - currentWords} more words.`;
  } else {
    return `You've written ${currentWords} words - that's great detail! Consider if you can make it more concise.`;
  }
}