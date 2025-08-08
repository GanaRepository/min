// lib/ai/unified-assessment-engine.ts - Combined Assessment for Both Paths
import { AdvancedPlagiarismDetector } from './advanced-plagiarism-detector';
import { AdvancedAIDetector } from './advanced-ai-detector';
export class UnifiedAssessmentEngine {
  // Spelling assessment stub (replace with real logic if needed)
  private static async assessSpelling(content: string): Promise<number> {
    // Simple spelling check: returns 100 for now
    return 100;
  }
  /**
   * Comprehensive assessment that works for both freeform writing and uploaded stories
   */
  static async performCompleteAssessment(
    content: string,
    metadata: {
      childAge?: number;
      isCollaborativeStory?: boolean; // true for freeform, false for upload
      storyTitle?: string;
      previousAttempts?: any[];
      expectedGenre?: 'creative' | 'fantasy' | 'adventure' | 'mystery';
      userTurns?: string[]; // For collaborative stories - only user's contributions
    }
  ): Promise<{
    // Core Assessment Scores
    overallScore: number;
    categoryScores: {
      grammar: number;
      vocabulary: number;
      creativity: number;
      structure: number;
      characterDevelopment: number;
      plotDevelopment: number;
      descriptiveWriting: number;
      sensoryDetails: number;
      plotLogic: number;
      causeEffect: number;
      problemSolving: number;
      themeRecognition: number;
      ageAppropriateness: number;
      readingLevel: string;
    };
    
    // Academic Integrity Analysis
    integrityAnalysis: {
      plagiarismResult: any;
      aiDetectionResult: any;
      originalityScore: number;
      integrityRisk: 'low' | 'medium' | 'high' | 'critical';
    };
    
    // Educational Feedback
    educationalFeedback: {
      strengths: string[];
      improvements: string[];
      nextSteps: string[];
      teacherComment: string;
      encouragement: string;
    };
    
    // Progress Tracking
    progressTracking?: {
      improvementSince?: string;
      scoreChange?: number;
      strengthsGained?: string[];
      areasImproved?: string[];
    };
    
    // Recommendations
    recommendations: {
      immediate: string[];
      longTerm: string[];
      practiceExercises: string[];
    };
  }> {
    const age = metadata.childAge || 10;
    const isCollaborative = metadata.isCollaborativeStory || false;
    
    // Step 1: Academic Integrity Check
    const integrityAnalysis = await this.performIntegrityAnalysis(content, metadata);
    
    // Step 2: Educational Content Assessment  
    const contentToAssess = isCollaborative && metadata.userTurns 
      ? metadata.userTurns.join('\n\n') // Only assess user's contributions for collaborative stories
      : content; // Assess entire content for uploads
    
    const educationalAssessment = await this.performEducationalAssessment(
      contentToAssess, 
      content, // Full story for context
      metadata
    );
    
    // Step 3: Progress Analysis
    const progressTracking = metadata.previousAttempts 
      ? this.analyzeProgress(educationalAssessment.categoryScores, metadata.previousAttempts)
      : undefined;
    
    // Step 4: Generate Comprehensive Feedback
    const educationalFeedback = this.generateComprehensiveFeedback(
      educationalAssessment,
      integrityAnalysis,
      age,
      isCollaborative
    );
    
    // Step 5: Create Personalized Recommendations
    const recommendations = this.generatePersonalizedRecommendations(
      educationalAssessment,
      integrityAnalysis,
      age,
      isCollaborative,
      progressTracking
    );
    
    return {
      overallScore: educationalAssessment.overallScore,
      categoryScores: educationalAssessment.categoryScores,
      integrityAnalysis,
      educationalFeedback,
      progressTracking,
      recommendations,
    };
  }

  private static async performIntegrityAnalysis(content: string, metadata: any) {
    // Run both plagiarism and AI detection in parallel
    const [plagiarismResult, aiDetectionResult] = await Promise.all([
      AdvancedPlagiarismDetector.checkPlagiarism(content, {
        childAge: metadata.childAge,
        expectedGenre: metadata.expectedGenre,
        isCreativeWriting: true,
      }),
      AdvancedAIDetector.detectAIContent(content, {
        childAge: metadata.childAge,
        expectedGenre: metadata.expectedGenre,
        isCreativeWriting: true,
      }),
    ]);
    
    // Calculate combined originality score
    const plagiarismWeight = 0.6;
    const aiDetectionWeight = 0.4;
    
    const originalityScore = Math.round(
      (plagiarismResult.overallScore * plagiarismWeight) +
      (aiDetectionResult.overallScore * aiDetectionWeight)
    );
    
    // Determine overall integrity risk
    const integrityRisk = this.calculateIntegrityRisk(
      plagiarismResult.riskLevel,
      aiDetectionResult.likelihood,
      originalityScore
    );
    
    return {
      plagiarismResult,
      aiDetectionResult,
      originalityScore,
      integrityRisk,
    };
  }

  private static async performEducationalAssessment(
    contentToAssess: string,
    fullStory: string,
    metadata: any
  ) {
    const age = metadata.childAge || 10;
    const ageGroup = age <= 8 ? '6-8' : age <= 12 ? '9-12' : '13+';
    
    // Comprehensive educational analysis
    const analysis = {
      // Core Language Skills
      grammar: await this.assessGrammar(contentToAssess, ageGroup),
      vocabulary: await this.assessVocabulary(contentToAssess, ageGroup),
      spelling: await this.assessSpelling(contentToAssess),
      
      // Creative Writing Skills
      creativity: await this.assessCreativity(contentToAssess, fullStory),
      structure: await this.assessStructure(fullStory),
      characterDevelopment: await this.assessCharacterDevelopment(fullStory),
      plotDevelopment: await this.assessPlotDevelopment(fullStory),
      
      // Descriptive Writing
      descriptiveWriting: await this.assessDescriptiveWriting(contentToAssess),
      sensoryDetails: await this.assessSensoryDetails(contentToAssess),
      
      // Critical Thinking
      plotLogic: await this.assessPlotLogic(fullStory),
      causeEffect: await this.assessCauseEffect(fullStory),
      problemSolving: await this.assessProblemSolving(fullStory),
      themeRecognition: await this.assessThemeRecognition(fullStory),
      
      // Age Appropriateness
      ageAppropriateness: await this.assessAgeAppropriateness(contentToAssess, age),
      readingLevel: this.calculateReadingLevel(contentToAssess),
    };
    
    // Calculate weighted overall score
    const weights = {
      grammar: 0.15,
      vocabulary: 0.12,
      creativity: 0.15,
      structure: 0.12,
      characterDevelopment: 0.10,
      plotDevelopment: 0.12,
      descriptiveWriting: 0.08,
      sensoryDetails: 0.06,
      plotLogic: 0.05,
      causeEffect: 0.05,
      problemSolving: 0.05,
      themeRecognition: 0.05,
      ageAppropriateness: 0.10,
    };
    
    const overallScore = Math.round(
      Object.entries(weights).reduce((sum, [key, weight]) => {
        return sum + (analysis[key as keyof typeof analysis] as number * weight);
      }, 0)
    );
    
    return {
      overallScore,
      categoryScores: {
        grammar: analysis.grammar,
        vocabulary: analysis.vocabulary,
        creativity: analysis.creativity,
        structure: analysis.structure,
        characterDevelopment: analysis.characterDevelopment,
        plotDevelopment: analysis.plotDevelopment,
        descriptiveWriting: analysis.descriptiveWriting,
        sensoryDetails: analysis.sensoryDetails,
        plotLogic: analysis.plotLogic,
        causeEffect: analysis.causeEffect,
        problemSolving: analysis.problemSolving,
        themeRecognition: analysis.themeRecognition,
        ageAppropriateness: analysis.ageAppropriateness,
        readingLevel: analysis.readingLevel,
      },
    };
  }

  // Advanced Assessment Methods
  private static async assessGrammar(content: string, ageGroup: string): Promise<number> {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 5);
    let score = 100;
    let errorCount = 0;
    
    // Age-appropriate grammar error detection
    const grammarRules = this.getGrammarRulesForAge(ageGroup);
    
    grammarRules.forEach(rule => {
      const violations = content.match(rule.pattern);
      if (violations) {
        errorCount += violations.length;
        score -= violations.length * rule.penalty;
      }
    });
    
    // Sentence structure analysis
    const structureScore = this.analyzesentenceStructure(sentences, ageGroup);
    score = (score * 0.7) + (structureScore * 0.3);
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private static getGrammarRulesForAge(ageGroup: string) {
    const baseRules = [
      { pattern: /\bi is\b/gi, penalty: 8, description: "Subject-verb disagreement" },
      { pattern: /\bme and \w+ (is|are|was|were)/gi, penalty: 6, description: "Incorrect pronoun usage" },
      { pattern: /\bshould of\b/gi, penalty: 10, description: "Should have vs should of" },
      { pattern: /\byour going\b/gi, penalty: 8, description: "You're vs your confusion" },
      { pattern: /\bits raining\b/gi, penalty: 5, description: "Missing apostrophe in contractions" },
    ];
    
    if (ageGroup === '6-8') {
      return baseRules.filter(rule => rule.penalty <= 8); // More lenient for younger children
    } else if (ageGroup === '9-12') {
      return baseRules.concat([
        { pattern: /\bwho's\b.*\bcar/gi, penalty: 7, description: "Whose vs who's confusion" },
        { pattern: /\bthere car\b/gi, penalty: 8, description: "Their vs there confusion" },
      ]);
    } else {
      return baseRules.concat([
        { pattern: /\bwho's\b.*\bcar/gi, penalty: 7, description: "Whose vs who's confusion" },
        { pattern: /\bthere car\b/gi, penalty: 8, description: "Their vs there confusion" },
        { pattern: /\bwhom\b/gi, penalty: -5, description: "Bonus for correct whom usage" }, // Negative penalty = bonus
      ]);
    }
  }

  private static analyzesentenceStructure(sentences: string[], ageGroup: string): number {
    let score = 100;
    
    // Check for age-appropriate sentence variety
    const simpleSentences = sentences.filter(s => !s.includes(',') && !s.includes('and')).length;
    const complexSentences = sentences.filter(s => s.includes(',') || s.includes('because') || s.includes('although')).length;
    
    const simpleRatio = simpleSentences / sentences.length;
    const complexRatio = complexSentences / sentences.length;
    
    // Age-appropriate expectations
    const expectations = {
      '6-8': { simpleMin: 0.4, simpleMax: 0.8, complexMin: 0.1, complexMax: 0.4 },
      '9-12': { simpleMin: 0.2, simpleMax: 0.6, complexMin: 0.3, complexMax: 0.7 },
      '13+': { simpleMin: 0.1, simpleMax: 0.4, complexMin: 0.5, complexMax: 0.9 },
    };
    
    const expected = expectations[ageGroup as keyof typeof expectations];
    
    // Penalty for being outside expected ranges
    if (simpleRatio < expected.simpleMin || simpleRatio > expected.simpleMax) {
      score -= 15;
    }
    if (complexRatio < expected.complexMin || complexRatio > expected.complexMax) {
      score -= 15;
    }
    
    return Math.max(0, score);
  }

  private static async assessVocabulary(content: string, ageGroup: string): Promise<number> {
    const words = content.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    const uniqueWords = new Set(words);
    
    let score = 100;
    
    // Vocabulary diversity (Type-Token Ratio)
    const diversity = uniqueWords.size / words.length;
    const expectedDiversity = {
      '6-8': { min: 0.4, max: 0.7 },
      '9-12': { min: 0.5, max: 0.8 },
      '13+': { min: 0.6, max: 0.9 },
    };
    
    const expected = expectedDiversity[ageGroup as keyof typeof expectedDiversity];
    if (diversity < expected.min) {
      score -= (expected.min - diversity) * 100;
    } else if (diversity > expected.max) {
      score -= (diversity - expected.max) * 50; // Less penalty for too much diversity
    }
    
    // Advanced vocabulary usage
    const advancedWords = this.identifyAdvancedVocabulary(words, ageGroup);
    const advancedRatio = advancedWords.length / words.length;
    
    // Bonus for appropriate advanced vocabulary
    if (advancedRatio > 0.02 && advancedRatio < 0.15) {
      score += Math.min(15, advancedRatio * 300);
    }
    
    // Descriptive vocabulary
    const descriptiveWords = this.identifyDescriptiveVocabulary(words);
    const descriptiveRatio = descriptiveWords.length / words.length;
    
    if (descriptiveRatio > 0.05) {
      score += Math.min(10, descriptiveRatio * 200);
    }
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private static identifyAdvancedVocabulary(words: string[], ageGroup: string): string[] {
    const vocabularyLevels = {
      '6-8': ['beautiful', 'adventure', 'mysterious', 'dangerous', 'enormous'],
      '9-12': ['magnificent', 'extraordinary', 'catastrophic', 'fascinating', 'tremendous'],
      '13+': ['exceptional', 'unprecedented', 'sophisticated', 'revolutionary', 'phenomenal'],
    };
    
    const expectedLevel = vocabularyLevels[ageGroup as keyof typeof vocabularyLevels];
    return words.filter(word => expectedLevel.includes(word));
  }

  private static identifyDescriptiveVocabulary(words: string[]): string[] {
    const descriptiveWords = [
      'bright', 'dark', 'colorful', 'shiny', 'dull', 'vivid', 'pale',
      'loud', 'quiet', 'silent', 'noisy', 'melodic', 'harsh',
      'soft', 'rough', 'smooth', 'bumpy', 'silky', 'coarse',
      'sweet', 'sour', 'bitter', 'salty', 'delicious', 'awful',
      'fragrant', 'stinky', 'fresh', 'musty', 'aromatic'
    ];
    
    return words.filter(word => descriptiveWords.includes(word));
  }

  private static async assessCreativity(userContent: string, fullStory: string): Promise<number> {
    let score = 100;
    
    // Originality assessment
    const originalityScore = this.assessOriginality(userContent);
    score = (score * 0.4) + (originalityScore * 0.6);
    
    // Creative elements
    const creativeElements = this.identifyCreativeElements(fullStory);
    const creativityBonus = Math.min(20, creativeElements.length * 3);
    score += creativityBonus;
    
    // Imaginative scenarios
    const imaginationScore = this.assessImagination(fullStory);
    score = (score * 0.8) + (imaginationScore * 0.2);
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private static assessOriginality(content: string): number {
    // Check for clichéd phrases
    const clichés = [
      'once upon a time', 'happily ever after', 'dark and stormy night',
      'suddenly', 'all of a sudden', 'the end'
    ];
    
    let score = 100;
    clichés.forEach(cliché => {
      if (content.toLowerCase().includes(cliché)) {
        score -= 10;
      }
    });
    
    return Math.max(0, score);
  }

  private static identifyCreativeElements(story: string): string[] {
    const elements = [];
    const content = story.toLowerCase();
    
    // Fantasy elements
    if (/\b(magic|wizard|dragon|fairy|unicorn|spell)\b/.test(content)) {
      elements.push('fantasy');
    }
    
    // Unusual settings
    if (/\b(space|alien|robot|future|time travel|underwater|floating)\b/.test(content)) {
      elements.push('unique_setting');
    }
    
    // Creative characters
    if (/\b(talking animal|superhero|inventor|explorer|detective)\b/.test(content)) {
      elements.push('interesting_characters');
    }
    
    // Plot twists
    if (/\b(surprise|twist|unexpected|reveal|secret|hidden)\b/.test(content)) {
      elements.push('plot_twist');
    }
    
    return elements;
  }

  private static assessImagination(story: string): number {
    let score = 70; // Base score
    
    // Creative problem solving
    if (/\b(invent|create|discover|solve|figure out)\b/.test(story.toLowerCase())) {
      score += 15;
    }
    
    // Unique descriptions
    const uniqueDescriptions = story.match(/\b\w+(?:-\w+)*\s+(?:like|as)\s+\w+/g);
    if (uniqueDescriptions && uniqueDescriptions.length > 0) {
      score += Math.min(15, uniqueDescriptions.length * 3);
    }
    
    return Math.min(100, score);
  }

  // Additional assessment methods...
  private static async assessStructure(story: string): Promise<number> {
    const paragraphs = story.split(/\n\s*\n/).filter(p => p.trim().length > 20);
    let score = 100;
    
    // Basic structure: beginning, middle, end
    const hasBeginning = this.hasStoryBeginning(story);
    const hasMiddle = paragraphs.length >= 2;
    const hasEnd = this.hasStoryEnding(story);
    
    if (!hasBeginning) score -= 25;
    if (!hasMiddle) score -= 25;
    if (!hasEnd) score -= 25;
    
    // Paragraph organization
    if (paragraphs.length > 1) {
      const organizationScore = this.assessParagraphOrganization(paragraphs);
      score = (score * 0.7) + (organizationScore * 0.3);
    }
    
    return Math.max(0, Math.round(score));
  }

  private static hasStoryBeginning(story: string): boolean {
    const firstSentence = story.split(/[.!?]/)[0].toLowerCase();
    const beginningPatterns = [
      /\b(one day|once|there was|in|at|when|long ago)\b/,
      /\b(my name is|i am|this is)\b/,
      /\b(it was|the)\b/
    ];
    
    return beginningPatterns.some(pattern => pattern.test(firstSentence));
  }

  private static hasStoryEnding(story: string): boolean {
    const lastSentences = story.split(/[.!?]/).slice(-3).join(' ').toLowerCase();
    const endingPatterns = [
      /\b(the end|finally|in the end|at last|ever after)\b/,
      /\b(learned|realized|never forgot|remembered)\b/,
      /\b(happy|safe|home|peace)\b/
    ];
    
    return endingPatterns.some(pattern => pattern.test(lastSentences));
  }

  private static assessParagraphOrganization(paragraphs: string[]): number {
    let score = 100;
    
    // Check if each paragraph has a clear focus
    paragraphs.forEach((paragraph, index) => {
      const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 5);
      
      // Very short paragraphs (unless dialogue)
      if (sentences.length === 1 && !paragraph.includes('"')) {
        score -= 5;
      }
      
      // Very long paragraphs
      if (sentences.length > 8) {
        score -= 10;
      }
    });
    
    return Math.max(0, score);
  }

  // Continue with other assessment methods...
  private static calculateIntegrityRisk(
    plagiarismRisk: string,
    aiLikelihood: string,
    originalityScore: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    // Convert to numeric scores for calculation
    const plagiarismScore = {
      'low': 10, 'medium': 30, 'high': 60, 'critical': 90
    }[plagiarismRisk] || 10;
    
    const aiScore = {
      'very_low': 5, 'low': 15, 'medium': 40, 'high': 70, 'very_high': 95
    }[aiLikelihood] || 5;
    
    const combinedRisk = Math.max(plagiarismScore, aiScore);
    
    if (combinedRisk >= 80 || originalityScore < 30) return 'critical';
    if (combinedRisk >= 60 || originalityScore < 50) return 'high';
    if (combinedRisk >= 30 || originalityScore < 70) return 'medium';
    return 'low';
  }

  // Helper methods for remaining assessments would continue here...
  // (assessCharacterDevelopment, assessPlotDevelopment, etc.)
  
  private static generateComprehensiveFeedback(
    educationalAssessment: any,
    integrityAnalysis: any,
    age: number,
    isCollaborative: boolean
  ) {
    const strengths: string[] = [];
    const improvements: string[] = [];
    const nextSteps: string[] = [];
    
    // Analyze strengths
    Object.entries(educationalAssessment.categoryScores).forEach(([category, score]) => {
      if (typeof score === 'number' && score >= 80) {
        strengths.push(this.getCategoryStrengthMessage(category, age));
      } else if (typeof score === 'number' && score < 60) {
        improvements.push(this.getCategoryImprovementMessage(category, age));
      }
    });
    
    // Generate teacher comment
    const teacherComment = this.generateTeacherComment(
      educationalAssessment.overallScore,
      strengths,
      improvements,
      age,
      isCollaborative
    );
    
    // Generate encouragement
    const encouragement = this.generateEncouragement(
      educationalAssessment.overallScore,
      integrityAnalysis.originalityScore,
      age
    );
    
    // Generate next steps
    nextSteps.push(...this.generateNextSteps(improvements, age));
    
    return {
      strengths: strengths.slice(0, 5), // Top 5 strengths
      improvements: improvements.slice(0, 3), // Top 3 improvements  
      nextSteps: nextSteps.slice(0, 3), // Top 3 next steps
      teacherComment,
      encouragement,
    };
  }

  private static getCategoryStrengthMessage(category: string, age: number): string {
    const messages = {
      grammar: age <= 8 ? "Great job with your sentences!" : "Excellent grammar and sentence structure!",
      vocabulary: age <= 8 ? "You use wonderful words!" : "Impressive vocabulary choices!",
      creativity: "Your imagination shines through!",
      structure: "Well-organized story structure!",
      characterDevelopment: "Your characters feel real and interesting!",
      plotDevelopment: "Engaging and well-developed plot!",
      descriptiveWriting: "Beautiful descriptive details!",
      // ... more categories
    };
    
    return messages[category as keyof typeof messages] || "Great work in this area!";
  }

  private static getCategoryImprovementMessage(category: string, age: number): string {
    const messages = {
      grammar: age <= 8 ? "Practice writing complete sentences" : "Focus on grammar and punctuation",
      vocabulary: "Try using more varied and interesting words",
      creativity: "Let your imagination run wild with unique ideas",
      structure: "Work on organizing your story with clear beginning, middle, and end",
      characterDevelopment: "Develop your characters by describing their feelings and motivations",
      plotDevelopment: "Build more excitement and conflict in your story",
      descriptiveWriting: "Add more details to help readers picture your story",
      // ... more categories
    };
    
    return messages[category as keyof typeof messages] || "Focus on improving this area";
  }

  private static generateTeacherComment(
    overallScore: number,
    strengths: string[],
    improvements: string[],
    age: number,
    isCollaborative: boolean
  ): string {
    const storyType = isCollaborative ? "collaborative story" : "story";
    
    if (overallScore >= 90) {
      return `Outstanding work on your ${storyType}! ${strengths.slice(0, 2).join(' ')} You're developing into a skilled young writer.`;
    } else if (overallScore >= 80) {
      return `Excellent ${storyType}! ${strengths.slice(0, 2).join(' ')} Keep practicing to make your writing even stronger.`;
    } else if (overallScore >= 70) {
      return `Good work on your ${storyType}! I can see your creativity and effort. ${improvements.slice(0, 1).join('')} to make it even better.`;
    } else if (overallScore >= 60) {
      return `Nice effort on your ${storyType}! You have some good ideas. Focus on ${improvements.slice(0, 2).join(' and ')} to improve your writing.`;
    } else {
      return age <= 8 
        ? `Keep practicing your writing! Remember to ${improvements.slice(0, 1).join('')}. You're learning and that's what matters!`
        : `This ${storyType} shows potential. Focus on ${improvements.slice(0, 2).join(' and ')} to strengthen your writing skills.`;
    }
  }

  private static generateEncouragement(
    educationalScore: number,
    originalityScore: number,
    age: number
  ): string {
    if (originalityScore >= 90 && educationalScore >= 80) {
      return "You're an amazing original storyteller! Keep writing from your heart and imagination.";
    } else if (originalityScore >= 80) {
      return "I love how original and creative your story is! Keep using your unique voice.";
    } else if (educationalScore >= 80) {
      return "Your writing skills are really developing well! Keep practicing and stay creative.";
    } else {
      return age <= 8 
        ? "Every story you write helps you become a better writer! Keep using your imagination!"
        : "You're on the right track! Keep practicing and don't be afraid to let your creativity shine.";
    }
  }

  private static generateNextSteps(improvements: string[], age: number): string[] {
    const steps: string[] = [];
    
    if (improvements.some(imp => imp.includes('grammar'))) {
      steps.push(age <= 8 ? "Read your story out loud to check if it sounds right" : "Practice writing simple sentences before trying complex ones");
    }
    
    if (improvements.some(imp => imp.includes('vocabulary'))) {
      steps.push("Try learning one new interesting word each day and use it in your writing");
    }
    
    if (improvements.some(imp => imp.includes('creativity'))) {
      steps.push("Think about 'what if' questions to spark new story ideas");
    }
    
    if (improvements.some(imp => imp.includes('structure'))) {
      steps.push("Practice telling stories with a clear beginning, middle, and end");
    }
    
    return steps;
  }

  private static generatePersonalizedRecommendations(
    educationalAssessment: any,
    integrityAnalysis: any,
    age: number,
    isCollaborative: boolean,
    progressTracking?: any
  ) {
    const immediate: string[] = [];
    const longTerm: string[] = [];
    const practiceExercises: string[] = [];
    
    // Immediate recommendations based on integrity analysis
    if (integrityAnalysis.integrityRisk === 'high' || integrityAnalysis.integrityRisk === 'critical') {
      immediate.push("Focus on writing completely original content using only your own ideas");
      immediate.push("Avoid copying text from any sources - books, websites, or AI tools");
    }
    
    // Educational recommendations
    if (educationalAssessment.categoryScores.creativity < 70) {
      immediate.push("Try writing about your own experiences and dreams");
      practiceExercises.push("Write a story about an ordinary object that becomes magical");
    }
    
    if (educationalAssessment.categoryScores.descriptiveWriting < 70) {
      immediate.push("Add more sensory details - what do characters see, hear, smell, feel?");
      practiceExercises.push("Describe your bedroom using all five senses");
    }
    
    // Long-term development
    longTerm.push("Read diverse stories to expand your writing inspiration");
    longTerm.push("Keep a writing journal to practice daily");
    
    if (age >= 10) {
      longTerm.push("Join a writing club or find writing buddies to share stories with");
    }
    
    // Progress-based recommendations
    if (progressTracking?.scoreChange && progressTracking.scoreChange > 0) {
      immediate.push("Great improvement! Continue with the same writing strategies");
    }
    
    return {
      immediate: immediate.slice(0, 3),
      longTerm: longTerm.slice(0, 3),
      practiceExercises: practiceExercises.slice(0, 3),
    };
  }

  // Complete the remaining assessment methods
 private static async assessCharacterDevelopment(story: string): Promise<number> {
   let score = 100;
   const content = story.toLowerCase();
   
   // Character presence and naming
   const characters = this.identifyCharacters(story);
   if (characters.length === 0) {
     score -= 30; // No clear characters
   } else if (characters.length === 1) {
     score -= 10; // Only one character
   }
   
   // Character descriptions
   const hasPhysicalDescriptions = /\b(tall|short|brown hair|blue eyes|wore|dressed)\b/.test(content);
   const hasPersonalityTraits = /\b(kind|mean|brave|scared|funny|serious|smart|silly)\b/.test(content);
   const hasEmotions = /\b(happy|sad|angry|excited|worried|surprised|afraid)\b/.test(content);
   
   if (!hasPhysicalDescriptions) score -= 15;
   if (!hasPersonalityTraits) score -= 20;
   if (!hasEmotions) score -= 15;
   
   // Character development/growth
   const hasCharacterGrowth = this.detectCharacterGrowth(story);
   if (hasCharacterGrowth) score += 10;
   
   return Math.max(0, Math.min(100, Math.round(score)));
 }

 private static identifyCharacters(story: string): string[] {
   const characters: string[] = [];
   
   // Look for names (capitalized words that aren't sentence beginnings)
   const words = story.split(/\s+/);
   words.forEach((word, index) => {
     if (/^[A-Z][a-z]+$/.test(word) && index > 0) {
       const prevWord = words[index - 1];
       if (!/[.!?]$/.test(prevWord)) {
         characters.push(word);
       }
     }
   });
   
   // Look for pronouns and character references
   const content = story.toLowerCase();
   if (/\b(he|she|him|her|his|hers)\b/.test(content)) {
     characters.push('character');
   }
   if (/\b(mom|dad|mother|father|friend|teacher|brother|sister)\b/.test(content)) {
     characters.push('family/friend');
   }
   
   return [...new Set(characters)];
 }

 private static detectCharacterGrowth(story: string): boolean {
   const growthPatterns = [
     /\b(learned|realized|understood|discovered|changed|became)\b/gi,
     /\b(now (?:he|she|i) (?:knew|understood|was))\b/gi,
     /\b(never again|from that day|after that)\b/gi,
   ];
   
   return growthPatterns.some(pattern => pattern.test(story));
 }

 private static async assessPlotDevelopment(story: string): Promise<number> {
   let score = 100;
   const content = story.toLowerCase();
   
   // Plot elements
   const hasConflict = this.detectConflict(content);
   const hasResolution = this.detectResolution(content);
   const hasProgression = this.detectPlotProgression(story);
   const hasTension = this.detectTension(content);
   
   if (!hasConflict) score -= 25;
   if (!hasResolution) score -= 20;
   if (!hasProgression) score -= 25;
   if (!hasTension) score -= 15;
   
   // Bonus for sophisticated plot elements
   const hasSubplot = this.detectSubplot(story);
   const hasForeshadowing = this.detectForeshadowing(content);
   
   if (hasSubplot) score += 10;
   if (hasForeshadowing) score += 5;
   
   return Math.max(0, Math.min(100, Math.round(score)));
 }

 private static detectConflict(content: string): boolean {
   const conflictPatterns = [
     /\b(problem|trouble|difficult|challenge|struggle|fight|argue|disagree)\b/gi,
     /\b(lost|broken|missing|stolen|trapped|stuck|scared|worried)\b/gi,
     /\b(enemy|villain|monster|danger|threat|crisis)\b/gi,
   ];
   
   return conflictPatterns.some(pattern => pattern.test(content));
 }

 private static detectResolution(content: string): boolean {
   const resolutionPatterns = [
     /\b(solved|fixed|found|saved|helped|won|succeeded|better|safe)\b/gi,
     /\b(finally|at last|in the end|eventually|after|then)\b/gi,
     /\b(happy|peaceful|calm|relieved|satisfied)\b/gi,
   ];
   
   return resolutionPatterns.some(pattern => pattern.test(content));
 }

 private static detectPlotProgression(story: string): boolean {
  const paragraphs = story.split(/\n\s*\n/).filter(p => p.trim().length > 50);
  if (paragraphs.length < 2) return false;
  // Check for temporal progression
  const timeMarkers = ['first', 'then', 'next', 'after', 'later', 'finally', 'meanwhile'];
  const hasTimeProgression = timeMarkers.some(marker => story.toLowerCase().includes(marker));
  // Check for escalating action
  const actionWords = story.toLowerCase().match(/\b(ran|jumped|shouted|fought|escaped|chased)\b/g);
  const hasActionProgression = actionWords ? actionWords.length >= 2 : false;
  return !!hasTimeProgression || hasActionProgression;
 }

 private static detectTension(content: string): boolean {
   const tensionPatterns = [
     /\b(suddenly|unexpected|surprise|shock|gasp|scream)\b/gi,
     /\b(dangerous|scary|frightening|terrifying|mysterious)\b/gi,
     /\b(what if|will (?:he|she|i)|could (?:he|she|i))\b/gi,
   ];
   
   return tensionPatterns.some(pattern => pattern.test(content));
 }

 private static detectSubplot(story: string): boolean {
   // Simple detection: multiple character threads or secondary conflicts
   const characters = this.identifyCharacters(story);
   const conflicts = story.toLowerCase().match(/\b(problem|trouble|conflict)\b/g);
   
  return characters.length > 2 && !!conflicts && conflicts.length > 1;
 }

 private static detectForeshadowing(content: string): boolean {
   const foreshadowingPatterns = [
     /\b(little did (?:he|she|i) know|if only (?:he|she|i) knew)\b/gi,
     /\b(later (?:he|she|i) would|this would be)\b/gi,
     /\b(warning|sign|hint|clue|feeling)\b/gi,
   ];
   
   return foreshadowingPatterns.some(pattern => pattern.test(content));
 }

 private static async assessDescriptiveWriting(content: string): Promise<number> {
   let score = 100;
   const words = content.split(/\W+/).filter(w => w.length > 0);
   
   // Descriptive adjectives
   const adjectives = [
     'beautiful', 'ugly', 'bright', 'dark', 'colorful', 'shiny', 'dull',
     'big', 'small', 'huge', 'tiny', 'enormous', 'gigantic', 'miniature',
     'fast', 'slow', 'quick', 'rapid', 'swift', 'sluggish',
     'loud', 'quiet', 'noisy', 'silent', 'deafening', 'whispered'
   ];
   
   const descriptiveCount = words.filter(word => 
     adjectives.includes(word.toLowerCase())
   ).length;
   
   const descriptiveRatio = descriptiveCount / words.length;
   
   // Expected ratio: 3-8% for good descriptive writing
   if (descriptiveRatio < 0.03) {
     score -= 30; // Too few descriptives
   } else if (descriptiveRatio > 0.08) {
     score -= 10; // Too many descriptives
   } else {
     score += Math.min(20, descriptiveRatio * 500); // Bonus for good balance
   }
   
   // Variety of descriptive categories
   const categories = {
     visual: ['bright', 'dark', 'colorful', 'shiny', 'beautiful'],
     size: ['big', 'small', 'huge', 'tiny', 'enormous'],
     sound: ['loud', 'quiet', 'noisy', 'silent'],
     speed: ['fast', 'slow', 'quick', 'rapid'],
   };
   
   const usedCategories = Object.values(categories).filter(category =>
     category.some(word => content.toLowerCase().includes(word))
   ).length;
   
   score += usedCategories * 5; // Bonus for variety
   
   return Math.max(0, Math.min(100, Math.round(score)));
 }

 private static async assessSensoryDetails(content: string): Promise<number> {
   let score = 100;
   const lowerContent = content.toLowerCase();
   
   const sensoryWords = {
     sight: ['saw', 'looked', 'watched', 'bright', 'dark', 'colorful', 'shiny', 'sparkled'],
     sound: ['heard', 'listened', 'loud', 'quiet', 'whispered', 'shouted', 'music', 'noise'],
     smell: ['smelled', 'scent', 'fragrant', 'stinky', 'fresh', 'perfume', 'aroma'],
     taste: ['tasted', 'sweet', 'sour', 'bitter', 'salty', 'delicious', 'yummy', 'flavor'],
     touch: ['felt', 'touched', 'soft', 'hard', 'rough', 'smooth', 'warm', 'cold', 'bumpy'],
   };
   
   const sensesUsed = Object.entries(sensoryWords).filter(([sense, words]) =>
     words.some(word => lowerContent.includes(word))
   );
   
   // Score based on number of senses used
   const senseScore = (sensesUsed.length / 5) * 100;
   score = senseScore;
   
   // Bonus for rich sensory descriptions
   const totalSensoryWords = Object.values(sensoryWords).flat().filter(word =>
     lowerContent.includes(word)
   ).length;
   
   if (totalSensoryWords > 5) {
     score += Math.min(20, totalSensoryWords * 2);
   }
   
   return Math.max(0, Math.min(100, Math.round(score)));
 }

 private static async assessPlotLogic(story: string): Promise<number> {
   let score = 100;
   
   // Check for logical inconsistencies
   const inconsistencies = this.detectLogicalInconsistencies(story);
   score -= inconsistencies.length * 10;
   
   // Check for cause and effect relationships
   const causeEffectScore = this.assessCauseEffectLogic(story);
   score = (score * 0.7) + (causeEffectScore * 0.3);
   
   return Math.max(0, Math.min(100, Math.round(score)));
 }

 private static detectLogicalInconsistencies(story: string): string[] {
   const inconsistencies: string[] = [];
   const content = story.toLowerCase();
   
   // Time inconsistencies
   if (content.includes('morning') && content.includes('sunset') && content.includes('same time')) {
     inconsistencies.push('Time inconsistency detected');
   }
   
   // Character inconsistencies
   if (content.includes('alone') && content.includes('they talked')) {
     inconsistencies.push('Character presence inconsistency');
   }
   
   // Magical solutions without setup
   if (content.includes('magic') || content.includes('suddenly') || content.includes('magically')) {
     const sentences = story.split(/[.!?]+/);
     const magicIndex = sentences.findIndex(s => /magic|suddenly|magically/.test(s.toLowerCase()));
     if (magicIndex > 0 && magicIndex < sentences.length - 1) {
       const hasSetup = sentences.slice(0, magicIndex).some(s => 
         /wizard|fairy|spell|power/.test(s.toLowerCase())
       );
       if (!hasSetup) {
         inconsistencies.push('Unexplained magical elements');
       }
     }
   }
   
   return inconsistencies;
 }

 private static assessCauseEffectLogic(story: string): number {
   let score = 100;
   const sentences = story.split(/[.!?]+/).filter(s => s.trim().length > 10);
   
   // Look for cause-effect relationships
   const causeEffectWords = ['because', 'since', 'so', 'therefore', 'as a result', 'due to'];
   const hasExplicitCausation = causeEffectWords.some(word => 
     story.toLowerCase().includes(word)
   );
   
   if (hasExplicitCausation) {
     score += 20; // Bonus for explicit causation
   }
   
   // Check for logical sequence
   const logicalSequence = this.checkLogicalSequence(sentences);
   score = (score * 0.8) + (logicalSequence * 0.2);
   
   return Math.max(0, score);
 }

 private static checkLogicalSequence(sentences: string[]): number {
   let logicalConnections = 0;
   
   for (let i = 0; i < sentences.length - 1; i++) {
     const current = sentences[i].toLowerCase();
     const next = sentences[i + 1].toLowerCase();
     
     // Look for logical connections
     if (current.includes('problem') && next.includes('solve')) logicalConnections++;
     if (current.includes('door') && next.includes('open')) logicalConnections++;
     if (current.includes('ran') && next.includes('tired')) logicalConnections++;
     if (current.includes('rain') && next.includes('wet')) logicalConnections++;
   }
   
   return Math.min(100, (logicalConnections / sentences.length) * 400);
 }

 private static async assessCauseEffect(story: string): Promise<number> {
   const causeEffectPairs = this.identifyCauseEffectPairs(story);
   const baseScore = Math.min(100, causeEffectPairs.length * 25);
   
   // Bonus for sophisticated causal relationships
   const sophisticatedCausation = this.detectSophisticatedCausation(story);
   return Math.min(100, baseScore + sophisticatedCausation);
 }

 private static identifyCauseEffectPairs(story: string): Array<{cause: string, effect: string}> {
   const pairs: Array<{cause: string, effect: string}> = [];
   const sentences = story.split(/[.!?]+/).filter(s => s.trim().length > 10);
   
   // Simple cause-effect detection
   const patterns = [
     { cause: /rain/, effect: /wet|umbrella|inside/ },
     { cause: /hungry/, effect: /eat|food|kitchen/ },
     { cause: /tired/, effect: /sleep|rest|bed/ },
     { cause: /cold/, effect: /jacket|warm|fire/ },
     { cause: /dark/, effect: /light|flashlight|candle/ },
   ];
   
   sentences.forEach(sentence => {
     patterns.forEach(pattern => {
       if (pattern.cause.test(sentence.toLowerCase()) && pattern.effect.test(sentence.toLowerCase())) {
         pairs.push({
           cause: sentence.match(pattern.cause)?.[0] || '',
           effect: sentence.match(pattern.effect)?.[0] || ''
         });
       }
     });
   });
   
   return pairs;
 }

 private static detectSophisticatedCausation(story: string): number {
   let bonus = 0;
   const content = story.toLowerCase();
   
   // Multiple causation
   if (content.includes('not only') && content.includes('but also')) bonus += 10;
   
   // Conditional causation
   if (content.includes('if') && content.includes('then')) bonus += 5;
   
   // Delayed effects
   if (content.includes('later') || content.includes('eventually')) bonus += 5;
   
   return bonus;
 }

 private static async assessProblemSolving(story: string): Promise<number> {
   let score = 100;
   const content = story.toLowerCase();
   
   // Identify problems
   const problems = this.identifyProblems(content);
   if (problems.length === 0) {
     score -= 40; // No clear problems to solve
   }
   
   // Identify solutions
   const solutions = this.identifySolutions(content);
   if (solutions.length === 0) {
     score -= 30; // No solutions provided
   }
   
   // Match problems to solutions
   const problemSolutionRatio = Math.min(solutions.length / Math.max(problems.length, 1), 1);
   score = score * problemSolutionRatio;
   
   // Bonus for creative problem-solving
   const creativeSolutions = this.identifyCreativeSolutions(content);
   score += creativeSolutions * 10;
   
   return Math.max(0, Math.min(100, Math.round(score)));
 }

 private static identifyProblems(content: string): string[] {
   const problemPatterns = [
     /\b(problem|trouble|difficulty|challenge|issue|crisis)\b/g,
     /\b(lost|broken|missing|stuck|trapped|scared)\b/g,
     /\b(can't|couldn't|unable|impossible)\b/g,
   ];
   
   const problems: string[] = [];
   problemPatterns.forEach(pattern => {
     const matches = content.match(pattern);
     if (matches) problems.push(...matches);
   });
   
   return [...new Set(problems)];
 }

 private static identifySolutions(content: string): string[] {
   const solutionPatterns = [
     /\b(solved|fixed|found|discovered|figured out)\b/g,
     /\b(idea|plan|strategy|approach|method)\b/g,
     /\b(decided|chose|tried|attempted)\b/g,
   ];
   
   const solutions: string[] = [];
   solutionPatterns.forEach(pattern => {
     const matches = content.match(pattern);
     if (matches) solutions.push(...matches);
   });
   
   return [...new Set(solutions)];
 }

 private static identifyCreativeSolutions(content: string): number {
   let creative = 0;
   
   // Creative solution indicators
   if (/\b(invent|create|build|make|design)\b/.test(content)) creative++;
   if (/\b(clever|smart|brilliant|creative|unique)\b/.test(content)) creative++;
   if (/\b(teamwork|together|help|cooperate)\b/.test(content)) creative++;
   if (/\b(think|brainstorm|imagine|wonder)\b/.test(content)) creative++;
   
   return creative;
 }

 private static async assessThemeRecognition(story: string): Promise<number> {
   const themes = this.identifyThemes(story);
   const baseScore = Math.min(100, themes.length * 30);
   
   // Bonus for theme development
   const themeDevelopment = this.assessThemeDevelopment(story, themes);
   return Math.min(100, baseScore + themeDevelopment);
 }

 private static identifyThemes(story: string): string[] {
   const content = story.toLowerCase();
   const themes: string[] = [];
   
   // Common children's story themes
   const themePatterns = {
     friendship: /\b(friend|friendship|together|help|share|kind)\b/,
     courage: /\b(brave|courage|fear|scared|hero|stand up)\b/,
     family: /\b(family|mom|dad|brother|sister|love|care)\b/,
     growth: /\b(learn|grow|change|better|improve|understand)\b/,
     adventure: /\b(adventure|explore|journey|travel|discover)\b/,
     honesty: /\b(truth|honest|lie|trust|tell|secret)\b/,
     perseverance: /\b(try|keep|never give up|persist|continue)\b/,
     kindness: /\b(kind|nice|help|generous|caring|gentle)\b/,
   };
   
   Object.entries(themePatterns).forEach(([theme, pattern]) => {
     if (pattern.test(content)) {
       themes.push(theme);
     }
   });
   
   return themes;
 }

 private static assessThemeDevelopment(story: string, themes: string[]): number {
   let development = 0;
   
   // Check if themes are developed throughout the story
   const paragraphs = story.split(/\n\s*\n/).filter(p => p.trim().length > 50);
   
   themes.forEach(theme => {
     const appearancesAcrossParagraphs = paragraphs.filter(p => 
       this.themeAppearsInText(p, theme)
     ).length;
     
     if (appearancesAcrossParagraphs > 1) {
       development += 10; // Theme appears in multiple sections
     }
   });
   
   return development;
 }

 private static themeAppearsInText(text: string, theme: string): boolean {
   const themeWords = {
     friendship: ['friend', 'together', 'help', 'share'],
     courage: ['brave', 'courage', 'fear', 'hero'],
     family: ['family', 'mom', 'dad', 'love'],
     growth: ['learn', 'grow', 'change', 'better'],
     adventure: ['adventure', 'explore', 'journey'],
     honesty: ['truth', 'honest', 'lie', 'trust'],
     perseverance: ['try', 'keep', 'continue'],
     kindness: ['kind', 'nice', 'help', 'caring'],
   };
   
   const words = themeWords[theme as keyof typeof themeWords] || [];
   return words.some(word => text.toLowerCase().includes(word));
 }

 private static async assessAgeAppropriateness(content: string, age: number): Promise<number> {
   let score = 100;
   
   // Content appropriateness
   const inappropriateContent = this.checkInappropriateContent(content);
   score -= inappropriateContent * 20;
   
   // Complexity appropriateness
   const complexityScore = this.assessComplexityForAge(content, age);
   score = (score * 0.6) + (complexityScore * 0.4);
   
   // Topic appropriateness
   const topicScore = this.assessTopicAppropriatenessForAge(content, age);
   score = (score * 0.8) + (topicScore * 0.2);
   
   return Math.max(0, Math.min(100, Math.round(score)));
 }

 private static checkInappropriateContent(content: string): number {
   const inappropriatePatterns = [
     /\b(kill|death|murder|violence|blood|gun|weapon)\b/gi,
     /\b(hate|stupid|dumb|idiot)\b/gi,
     /\b(scary|terrifying|nightmare|horror)\b/gi, // Too intense for younger children
   ];
   
   let violations = 0;
   inappropriatePatterns.forEach(pattern => {
     const matches = content.match(pattern);
     if (matches) violations += matches.length;
   });
   
   return violations;
 }

 private static assessComplexityForAge(content: string, age: number): number {
   const complexity = this.calculateTextComplexity(content);
   const expectedComplexity = this.getExpectedComplexityForAge(age);
   
   // Score based on how close to expected complexity
   const difference = Math.abs(complexity - expectedComplexity);
   return Math.max(0, 100 - (difference * 100));
 }

 private static calculateTextComplexity(content: string): number {
   const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 5);
   const words = content.split(/\W+/).filter(w => w.length > 0);
   
   const avgWordsPerSentence = words.length / sentences.length;
   const avgSyllablesPerWord = words.reduce((sum, word) => sum + this.countSyllables(word), 0) / words.length;
   const complexWords = words.filter(word => this.countSyllables(word) >= 3).length / words.length;
   
   // Combine metrics (0-1 scale)
   return (avgWordsPerSentence / 20) + (avgSyllablesPerWord / 3) + complexWords;
 }

 private static getExpectedComplexityForAge(age: number): number {
   if (age <= 8) return 0.3;
   if (age <= 12) return 0.5;
   return 0.7;
 }

 private static assessTopicAppropriatenessForAge(content: string, age: number): number {
   let score = 100;
   const topics = this.identifyTopics(content);
   
   const ageAppropriateTopics = {
     '6-8': ['animals', 'family', 'school', 'friends', 'toys', 'games', 'adventure'],
     '9-12': ['friendship', 'school', 'sports', 'hobbies', 'mystery', 'adventure', 'fantasy'],
     '13+': ['relationships', 'identity', 'future', 'challenges', 'society', 'complex emotions'],
   };
   
   const ageGroup = age <= 8 ? '6-8' : age <= 12 ? '9-12' : '13+';
   const appropriateTopics = ageAppropriateTopics[ageGroup];
   
   const appropriateCount = topics.filter(topic => 
     appropriateTopics.some(appropriate => topic.includes(appropriate))
   ).length;
   
   if (topics.length > 0) {
     const appropriatenessRatio = appropriateCount / topics.length;
     score = appropriatenessRatio * 100;
   }
   
   return score;
 }

 private static identifyTopics(content: string): string[] {
   const topicKeywords = {
     animals: ['dog', 'cat', 'bird', 'animal', 'pet', 'zoo'],
     family: ['mom', 'dad', 'family', 'brother', 'sister', 'parent'],
     school: ['school', 'teacher', 'class', 'homework', 'learn'],
     friends: ['friend', 'buddy', 'pal', 'classmate'],
     adventure: ['adventure', 'explore', 'journey', 'quest'],
     mystery: ['mystery', 'secret', 'clue', 'solve', 'detective'],
     fantasy: ['magic', 'wizard', 'fairy', 'dragon', 'spell'],
   };
   
   const topics: string[] = [];
   const lowerContent = content.toLowerCase();
   
   Object.entries(topicKeywords).forEach(([topic, keywords]) => {
     if (keywords.some(keyword => lowerContent.includes(keyword))) {
       topics.push(topic);
     }
   });
   
   return topics;
 }

 private static calculateReadingLevel(content: string): string {
   const complexity = this.calculateTextComplexity(content);
   
   if (complexity < 0.3) return 'Beginner';
   if (complexity < 0.5) return 'Elementary';
   if (complexity < 0.7) return 'Intermediate';
   return 'Advanced';
 }

 private static countSyllables(word: string): number {
   // Enhanced syllable counting
   word = word.toLowerCase().replace(/[^a-z]/g, '');
   if (word.length <= 3) return 1;
   
   // Remove silent endings
   word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
   word = word.replace(/^y/, '');
   
   // Count vowel groups
   const matches = word.match(/[aeiouy]{1,2}/g);
   let syllables = matches ? matches.length : 1;
   
   // Adjust for common patterns
   if (word.endsWith('le') && word.length > 2) syllables++;
   if (word.endsWith('ion')) syllables++;
   
   return Math.max(1, syllables);
 }

 private static analyzeProgress(currentScores: any, previousAttempts: any[]): any {
   if (!previousAttempts.length) return undefined;
   
   const lastAttempt = previousAttempts[previousAttempts.length - 1];
   const improvements: string[] = [];
   const areasImproved: string[] = [];
   
   let totalImprovement = 0;
   let categoriesImproved = 0;
   
   Object.entries(currentScores).forEach(([category, currentScore]) => {
     if (typeof currentScore === 'number' && lastAttempt.categoryScores?.[category]) {
       const previousScore = lastAttempt.categoryScores[category];
       const improvement = currentScore - previousScore;
       
       if (improvement > 5) {
         areasImproved.push(category);
         categoriesImproved++;
       }
       
       totalImprovement += improvement;
     }
   });
   
   // Generate improvement messages
   if (categoriesImproved > 0) {
     improvements.push(`Improved in ${categoriesImproved} areas since last assessment`);
   }
   
   if (totalImprovement > 10) {
     improvements.push('Significant overall progress in writing skills');
   }
   
   return {
     improvementSince: lastAttempt.assessmentDate,
     scoreChange: Math.round(totalImprovement),
     strengthsGained: improvements,
     areasImproved,
   };
 }
}