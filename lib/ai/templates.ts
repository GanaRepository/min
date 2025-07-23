// lib/ai/templates.ts
import type { StoryElements } from '@/config/story-elements';

export class TemplateSystem {
  static generateOpeningTemplate(elements: StoryElements): string {
    const openingTemplates = [
      `In the ${elements.mood.toLowerCase()} world of ${elements.setting}, a ${elements.character.toLowerCase()} discovers something amazing about ${elements.theme.toLowerCase()}. The air feels ${elements.tone.toLowerCase()} as our hero begins this incredible ${elements.genre.toLowerCase()} journey. What do you think happens first in this adventure?`,
      
      `Welcome to a ${elements.mood.toLowerCase()} ${elements.genre.toLowerCase()} tale! Our ${elements.character.toLowerCase()} stands at the edge of ${elements.setting}, feeling ${elements.tone.toLowerCase()} about the journey ahead. The theme of ${elements.theme.toLowerCase()} will guide this story. What's the first thing that catches your character's attention?`,
      
      `Once upon a time, in the ${elements.mood.toLowerCase()} realm of ${elements.setting}, there lived a ${elements.character.toLowerCase()} with a ${elements.tone.toLowerCase()} spirit. This ${elements.genre.toLowerCase()} story about ${elements.theme.toLowerCase()} is about to unfold. How does your adventure begin?`
    ];
    
    return openingTemplates[Math.floor(Math.random() * openingTemplates.length)];
  }

  static generateContinuationTemplate(turnNumber: number): string {
    const continuationTemplates: Record<number, string[]> = {
      2: [
        "What an exciting beginning! Your story is taking an interesting direction. I love how you've set up the scene. What happens next in this adventure?",
        "Fantastic start! You've created a wonderful opening that draws me in. I'm curious to see where you take the story from here. What does your character do next?"
      ],
      3: [
        "The plot thickens! I love how you're developing this adventure. Your creativity is really showing through. Where does the story go from here?",
        "Excellent development! The story is becoming more engaging with each turn. I'm excited to see what challenge or discovery comes next. What happens?"
      ],
      4: [
        "Incredible twist! Your creativity is really shining through. The story has such good momentum now. What challenge does your character face next?",
        "This is getting so engaging! I love the way you're building the tension and excitement. What obstacle or opportunity appears now?"
      ],
      5: [
        "The tension is building beautifully! I'm on the edge of my seat wondering what happens next. How does your character handle this situation?",
        "Such an exciting turn of events! The story is reaching its climax perfectly. What important decision does your character make now?"
      ],
      6: [
        "This is getting so exciting! I can feel we're approaching the climax of your amazing story. How does this incredible adventure conclude?",
        "What a thrilling journey this has been! Your storytelling has been wonderful throughout. How do you want to bring this adventure to its exciting conclusion?"
      ]
    };

    const templates = continuationTemplates[turnNumber] || continuationTemplates[6];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  static generateAssessmentTemplate(wordCount: number): {
    grammarScore: number;
    creativityScore: number;
    overallScore: number;
    feedback: string;
  } {
    const grammarScore = Math.floor(Math.random() * 15) + 80;
    const creativityScore = Math.floor(Math.random() * 15) + 85;
    const overallScore = Math.floor((grammarScore + creativityScore) / 2);

    const feedbackTemplates = [
      `Excellent work on your ${wordCount}-word story! Your imagination really shines through, and your writing skills are developing wonderfully. Keep up the fantastic work!`,
      `What a creative and engaging story! You've written ${wordCount} words of pure imagination. Your storytelling abilities are impressive. Keep writing!`,
      `Outstanding storytelling! Your ${wordCount}-word adventure is filled with creativity and excitement. Your writing skills are truly impressive. Wonderful work!`
    ];

    return {
      grammarScore,
      creativityScore,
      overallScore,
      feedback: feedbackTemplates[Math.floor(Math.random() * feedbackTemplates.length)]
    };
  }
}