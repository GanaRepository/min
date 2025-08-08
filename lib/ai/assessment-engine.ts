// lib/ai/assessment-engine.ts - Enhanced AI assessment with 16 categories
export class AssessmentEngine {
  /**
   * Generate comprehensive assessment for uploaded story
   */
  static async assessStory(
    storyContent: string,
    childAge?: number,
    previousAttempts?: any[]
  ) {
    // Determine age group for appropriate feedback
    const ageGroup = this.determineAgeGroup(childAge || 10);
    
    // Analyze story content
    const analysis = await this.analyzeStory(storyContent, ageGroup);
    
    // Generate teacher-like feedback
    const feedback = this.generateTeacherFeedback(analysis, ageGroup, previousAttempts);
    
    return {
      overallScore: analysis.overallScore,
      assessmentFeedback: feedback,
      ageGroup,
      wordCount: storyContent.trim().split(/\s+/).filter(Boolean).length,
      assessmentDate: new Date(),
    };
  }

  private static determineAgeGroup(age: number): '6-8' | '9-12' | '13+' {
    if (age <= 8) return '6-8';
    if (age <= 12) return '9-12';
    return '13+';
  }

  private static async analyzeStory(content: string, ageGroup: string) {
    // This would integrate with your AI service (OpenAI, Claude, etc.)
    // For now, providing structure for comprehensive analysis

    const sentences = content.split(/[.!?]+/).filter(Boolean);
    const words = content.trim().split(/\s+/).filter(Boolean);
    const paragraphs = content.split('\n\n').filter(Boolean);

    // Academic Integrity Analysis
    const plagiarismCheck = this.checkPlagiarism(content);
    const aiContentDetection = this.detectAIContent(content);

    // Writing Quality Analysis
    const grammar = this.analyzeGrammar(content, sentences);
    const spelling = this.analyzeSpelling(words);
    const vocabulary = this.analyzeVocabulary(words, ageGroup);
    const structure = this.analyzeStructure(paragraphs, sentences);

    // Creative Development Analysis
    const characterDevelopment = this.analyzeCharacters(content);
    const plotOriginality = this.analyzePlot(content);
    const descriptiveWriting = this.analyzeDescriptiveWriting(content);
    const sensoryDetails = this.analyzeSensoryDetails(content);

    // Critical Thinking Analysis
    const plotLogic = this.analyzePlotLogic(content);
    const causeEffect = this.analyzeCauseEffect(content);
    const problemSolving = this.analyzeProblemSolving(content);
    const themeRecognition = this.analyzeThemes(content);

    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      (grammar.score * 0.20) +
      (vocabulary.score * 0.15) +
      (structure.score * 0.15) +
      (characterDevelopment.score * 0.15) +
      (plotOriginality.score * 0.20) +
      (descriptiveWriting.score * 0.10) +
      (spelling.score * 0.05)
    );

    return {
      overallScore,
      plagiarismCheck,
      aiContentDetection,
      grammar,
      spelling,
      vocabulary,
      structure,
      characterDevelopment,
      plotOriginality,
      descriptiveWriting,
      sensoryDetails,
      plotLogic,
      causeEffect,
      problemSolving,
      themeRecognition,
      wordCount: words.length,
      readingLevel: this.calculateReadingLevel(sentences, words),
    };
  }

  private static generateTeacherFeedback(analysis: any, ageGroup: string, previousAttempts?: any[]) {
    const improvements = [];
    const strengths = [];
    const nextSteps = [];
    const achievements = [];

    // Identify strengths
    if (analysis.grammar.score >= 80) strengths.push("Excellent grammar skills!");
    if (analysis.vocabulary.score >= 80) strengths.push("Rich vocabulary usage");
    if (analysis.characterDevelopment.score >= 80) strengths.push("Well-developed characters");
    if (analysis.plotOriginality.score >= 80) strengths.push("Creative and original plot");

    // Identify improvements
    if (analysis.grammar.score < 70) improvements.push("Focus on grammar and sentence structure");
    if (analysis.vocabulary.score < 70) improvements.push("Try using more varied vocabulary");
    if (analysis.descriptiveWriting.score < 70) improvements.push("Add more descriptive details");

    // Age-appropriate feedback
    let teacherTone = "";
    if (ageGroup === '6-8') {
      teacherTone = `Great job on your story! I can see you're working hard on your writing. ${strengths.length > 0 ? `You're really good at: ${strengths.join(', ')}.` : ''} To make your story even better, try ${improvements.slice(0, 2).join(' and ')}.`;
    } else if (ageGroup === '9-12') {
      teacherTone = `This is a solid piece of creative writing! ${strengths.length > 0 ? `Your strengths include ${strengths.join(', ')}.` : ''} For your next draft, consider ${improvements.slice(0, 3).join(', ')}.`;
    } else {
      teacherTone = `Your writing shows real potential and creativity. ${strengths.length > 0 ? `Notable strengths: ${strengths.join(', ')}.` : ''} Areas for development: ${improvements.join(', ')}.`;
    }

    // Progress tracking
    let progressTracking;
    if (previousAttempts && previousAttempts.length > 0) {
      const lastAttempt = previousAttempts[previousAttempts.length - 1];
      const scoreChange = analysis.overallScore - (lastAttempt.overallScore || 0);
      
      progressTracking = {
        improvementSince: lastAttempt.assessmentDate,
        scoreChange,
        strengthsGained: scoreChange > 0 ? ["Overall writing improvement"] : [],
      };

      if (scoreChange > 5) {
        achievements.push("Significant improvement from last assessment!");
      }
    }

    return {
      plagiarismCheck: analysis.plagiarismCheck,
      aiContentDetection: analysis.aiContentDetection,
      grammar: analysis.grammar,
      spelling: analysis.spelling,
      vocabulary: analysis.vocabulary,
      structure: analysis.structure,
      characterDevelopment: analysis.characterDevelopment,
      plotOriginality: analysis.plotOriginality,
      descriptiveWriting: analysis.descriptiveWriting,
      sensoryDetails: analysis.sensoryDetails,
      plotLogic: analysis.plotLogic,
      causeEffect: analysis.causeEffect,
      problemSolving: analysis.problemSolving,
      themeRecognition: analysis.themeRecognition,
      overallScore: analysis.overallScore,
      teacherTone,
      ageAppropriate: `Feedback tailored for ages ${ageGroup}`,
      nextSteps: improvements.slice(0, 3),
      achievements,
      progressTracking,
    };
  }

  // Individual analysis methods (simplified implementations)
  private static checkPlagiarism(content: string) {
    // This would integrate with plagiarism detection service
    return {
      score: 95, // Assume original unless detected otherwise
      issues: [],
      suggestions: ["Keep writing in your own voice - you're doing great!"],
    };
  }

  private static detectAIContent(content: string) {
    // This would integrate with AI detection service
    const suspiciousPatterns = [
      /as an ai/i,
      /i don't have personal experience/i,
      /i cannot feel/i
    ];
    
    const likelihood = suspiciousPatterns.some(pattern => pattern.test(content)) ? 'medium' : 'low';
    
    return {
      score: likelihood === 'low' ? 90 : 60,
      likelihood: likelihood as 'low' | 'medium' | 'high',
      recommendations: likelihood === 'low' ? 
        ["Great original writing!"] : 
        ["Try writing more about your own experiences and imagination"],
    };
  }

  private static analyzeGrammar(content: string, sentences: string[]) {
    // Simplified grammar analysis
    const commonErrors = [
      { pattern: /\bi\s+am\s+went/gi, correction: "I went", explanation: "Use simple past tense" },
      { pattern: /\btheir\s+going/gi, correction: "they're going", explanation: "Use 'they're' (they are)" },
      { pattern: /\bits\s+raining/gi, correction: "it's raining", explanation: "Use apostrophe for contractions" }
    ];

    const mistakes: Array<{ line: number; issue: string; correction: string; explanation: string }> = [];
    commonErrors.forEach((error, index) => {
      const matches = content.match(error.pattern);
      if (matches) {
        mistakes.push({
          line: index + 1, // Simplified line numbering
          issue: matches[0],
          correction: error.correction,
          explanation: error.explanation,
        });
      }
    });

    const score = Math.max(100 - (mistakes.length * 10), 0);
    return { score, mistakes };
  }

  private static analyzeSpelling(words: string[]) {
    // Simplified spelling check
    const commonMisspellings: Record<string, string> = {
      'teh': 'the',
      'adn': 'and',
      'recieve': 'receive',
      'seperate': 'separate'
    };

    const errors: Array<{ word: string; suggestions: string[]; context: string }> = [];
    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      if (Object.prototype.hasOwnProperty.call(commonMisspellings, cleanWord)) {
        errors.push({
          word: cleanWord,
          suggestions: [commonMisspellings[cleanWord]],
          context: `Replace "${cleanWord}" with "${commonMisspellings[cleanWord]}"`,
        });
      }
    });

    const score = Math.max(100 - (errors.length * 5), 0);
    return { score, errors };
  }

  private static analyzeVocabulary(words: string[], ageGroup: string) {
    const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^\w]/g, '')));
    const vocabularyRichness = (uniqueWords.size / words.length) * 100;
    
    // Age-appropriate vocabulary expectations
    const expectedRichness = ageGroup === '6-8' ? 40 : ageGroup === '9-12' ? 50 : 60;
    const score = Math.min((vocabularyRichness / expectedRichness) * 100, 100);
    
    const suggestions = [];
    if (score < 70) {
      suggestions.push({
        original: "good",
        alternatives: ["excellent", "wonderful", "fantastic"],
        context: "Instead of 'good', try more specific words",
      });
    }

    return {
      score: Math.round(score),
      level: vocabularyRichness > 60 ? "Advanced" : vocabularyRichness > 40 ? "Grade Level" : "Developing",
      suggestions,
    };
  }

  private static analyzeStructure(paragraphs: string[], sentences: string[]) {
    const hasClearBeginning = sentences.length > 0;
    const hasMiddleDevelopment = paragraphs.length > 1;
    const hasClearEnding = sentences.length > 2;
    
    const score = (
      (hasClearBeginning ? 40 : 0) +
      (hasMiddleDevelopment ? 40 : 0) +
      (hasClearEnding ? 20 : 0)
    );

    const improvements = [];
    if (!hasMiddleDevelopment) improvements.push("Try organizing your story into paragraphs");
    if (sentences.length < 5) improvements.push("Add more detail to develop your story");

    return {
      score,
      analysis: `Your story has ${paragraphs.length} paragraphs and ${sentences.length} sentences`,
      improvements,
    };
  }

  private static analyzeCharacters(content: string) {
    const hasCharacterNames = /\b[A-Z][a-z]+\b/.test(content);
    const hasDialogue = /"[^"]*"/.test(content);
    const hasCharacterActions = /\b(ran|walked|said|thought|felt)\b/i.test(content);
    
    const score = (
      (hasCharacterNames ? 40 : 0) +
      (hasDialogue ? 30 : 0) +
      (hasCharacterActions ? 30 : 0)
    );

    const feedback = [];
    if (hasCharacterNames) feedback.push("Good use of character names");
    if (hasDialogue) feedback.push("Great dialogue writing");

    const improvements = [];
    if (!hasDialogue) improvements.push("Try adding dialogue to bring characters to life");
    if (!hasCharacterActions) improvements.push("Show what your characters do and feel");

    return { score, feedback: feedback.join('. '), strengths: feedback, improvements };
  }

  private static analyzePlot(content: string) {
    const hasConflict = /\b(problem|trouble|difficult|challenge|struggle)\b/i.test(content);
    const hasResolution = /\b(solved|fixed|better|ended|finally)\b/i.test(content);
    const hasProgression = content.split(/\.\s+/).length > 3;
    
    const score = (
      (hasProgression ? 40 : 0) +
      (hasConflict ? 35 : 0) +
      (hasResolution ? 25 : 0)
    );

    const suggestions = [];
    if (!hasConflict) suggestions.push("Try adding a problem for your character to solve");
    if (!hasResolution) suggestions.push("Show how the story problem gets resolved");

    return {
      score,
      analysis: "Plot development analysis based on story structure",
      suggestions,
    };
  }

  private static analyzeDescriptiveWriting(content: string) {
    const descriptiveWords = /\b(beautiful|scary|bright|dark|loud|quiet|huge|tiny|smooth|rough)\b/gi;
    const matches = content.match(descriptiveWords) || [];
    const score = Math.min(matches.length * 15, 100);

    const examples = matches.slice(0, 3);
    const improvements = [];
    if (score < 60) {
      improvements.push("Add more descriptive words to help readers picture your story");
      improvements.push("Use your five senses: what do characters see, hear, smell, taste, touch?");
    }

    return { score, examples, improvements };
  }

  private static analyzeSensoryDetails(content: string) {
    const sensoryPatterns = {
      sight: /\b(saw|looked|bright|colorful|dark)\b/gi,
      sound: /\b(heard|loud|quiet|whispered|shouted)\b/gi,
      smell: /\b(smelled|fragrant|stinky)\b/gi,
      taste: /\b(tasted|sweet|sour|delicious)\b/gi,
      touch: /\b(felt|soft|hard|warm|cold)\b/gi,
    };

    const present: string[] = [];
    const missing: string[] = [];
    
    Object.entries(sensoryPatterns).forEach(([sense, pattern]) => {
      if (pattern.test(content)) {
        present.push(sense);
      } else {
        missing.push(sense);
      }
    });

    const score = (present.length / 5) * 100;
    const suggestions: string[] = missing.slice(0, 2).map(sense => 
      `Try adding ${sense} details to make your story more vivid`
    );

    return { score: Math.round(score), present, missing, suggestions };
  }

  private static analyzePlotLogic(content: string) {
    // Simplified logic analysis
    const hasLogicalFlow = content.split(/\.\s+/).length > 2;
    const hasConsistency = !/\b(suddenly|magically|impossibly)\b/gi.test(content);
    
    const score = (hasLogicalFlow ? 60 : 0) + (hasConsistency ? 40 : 0);
    const issues = hasConsistency ? [] : ["Some events seem to happen too suddenly"];
    const suggestions = issues.length > 0 ? ["Try explaining how things happen in your story"] : [];

    return { score, issues, suggestions };
  }

  private static analyzeCauseEffect(content: string) {
    const hasConnectors = /\b(because|so|therefore|since|as a result)\b/gi.test(content);
    const score = hasConnectors ? 85 : 60;
    
    return {
      score,
      analysis: hasConnectors ? "Good use of cause and effect relationships" : "Could show more connections between events",
      improvements: hasConnectors ? [] : ["Try using words like 'because' or 'so' to connect ideas"],
    };
  }

  private static analyzeProblemSolving(content: string) {
    const hasProblemSolving = /\b(solved|figured out|decided|planned|tried)\b/gi.test(content);
    const score = hasProblemSolving ? 80 : 50;
    
    return {
      score,
      creativity: hasProblemSolving ? "Shows creative problem-solving" : "Could develop problem-solving elements",
      alternatives: hasProblemSolving ? [] : ["What different ways could your character solve their problem?"],
    };
  }

  private static analyzeThemes(content: string) {
    const themes = [];
    if (/\b(friend|friendship|together)\b/gi.test(content)) themes.push("friendship");
    if (/\b(brave|courage|fear)\b/gi.test(content)) themes.push("courage");
    if (/\b(family|mother|father|sister|brother)\b/gi.test(content)) themes.push("family");
    if (/\b(learn|school|teach)\b/gi.test(content)) themes.push("learning");

    const score = themes.length > 0 ? 80 : 60;
    
    return {
      score,
      identifiedThemes: themes,
      clarity: themes.length > 0 ? "Clear themes present in your story" : "Themes could be developed more clearly",
    };
  }

  private static calculateReadingLevel(sentences: string[], words: string[]): string {
    const avgWordsPerSentence = words.length / sentences.length;
    
    if (avgWordsPerSentence < 8) return "Early Elementary";
    if (avgWordsPerSentence < 12) return "Elementary";
    if (avgWordsPerSentence < 16) return "Middle School";
    return "High School";
  }
}
