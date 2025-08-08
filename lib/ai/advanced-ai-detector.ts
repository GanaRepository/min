// lib/ai/advanced-ai-detector.ts - Sophisticated AI Detection
export class AdvancedAIDetector {
  private static aiSignatures = {
    // OpenAI/ChatGPT specific patterns
    chatgptPatterns: [
      /as an ai (language model|assistant)/gi,
      /i (?:don't have|lack) (?:personal )?(?:experiences?|memories|feelings)/gi,
      /i (?:cannot|can't) (?:feel|experience|remember|access)/gi,
      /it's (?:important|worth|essential) to (?:note|remember|consider)/gi,
      /(?:furthermore|moreover|additionally), it's (?:crucial|important|vital)/gi,
      /in (?:conclusion|summary), (?:it (?:can be|is) (?:said|concluded))/gi,
    ],

    // Claude/Anthropic patterns
    claudePatterns: [
      /i'd be happy to help/gi,
      /i should (?:note|mention|clarify)/gi,
      /to be (?:completely )?(?:honest|transparent|clear)/gi,
      /i (?:want to|should) (?:be clear|clarify)/gi,
    ],

    // Generic AI patterns
    genericAIPatterns: [
      /(?:research|studies) (?:shows?|indicates?|suggests?) that/gi,
      /according to (?:recent )?(?:research|studies|data)/gi,
      /it (?:has been|is) (?:proven|established|demonstrated) (?:that|to)/gi,
      /experts? (?:agree|suggest|recommend) that/gi,
      /the data (?:shows?|indicates?|suggests?)/gi,
    ],

    // Overly perfect writing indicators
    perfectWritingPatterns: [
      /(?:first|second|third|fourth|fifth)ly?,?/gi,
      /(?:in addition|furthermore|moreover|consequently|therefore),?/gi,
      /(?:on the other hand|conversely|nevertheless|nonetheless)/gi,
      /(?:for example|for instance|specifically|particularly)/gi,
    ],
  };

  private static vocabularyAnalysis = {
    // Age-inappropriate advanced vocabulary
    advancedByAge: {
      '6-8': [
        'subsequently', 'consequently', 'nevertheless', 'furthermore', 'moreover',
        'specifically', 'particularly', 'significantly', 'substantially', 'comprehensive',
        'sophisticated', 'fundamental', 'substantial', 'preliminary', 'subsequent'
      ],
      '9-12': [
        'epistemological', 'phenomenological', 'paradigmatic', 'quintessential',
        'ubiquitous', 'multifaceted', 'juxtaposition', 'dichotomy', 'synthesis',
        'methodology', 'theoretical', 'empirical', 'hypothetical', 'conceptual'
      ],
      '13+': [
        'phenomenology', 'epistemology', 'ontological', 'hermeneutic', 'dialectical',
        'deconstructionist', 'postmodern', 'metacognitive', 'heuristic', 'paradigmatic'
      ]
    },

    // Academic/formal vocabulary rarely used by children
    academicVocabulary: [
      'furthermore', 'moreover', 'consequently', 'nevertheless', 'nonetheless',
      'specifically', 'particularly', 'significantly', 'substantially', 'comprehensive',
      'methodology', 'theoretical', 'empirical', 'hypothetical', 'conceptual',
      'fundamental', 'substantial', 'preliminary', 'subsequent', 'ultimately'
    ],
  };

  static async detectAIContent(
    content: string, 
    metadata?: {
      childAge?: number;
      expectedGenre?: string;
      isCreativeWriting?: boolean;
      previousWritingSamples?: string[];
    }
  ): Promise<{
    overallScore: number;
    likelihood: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
    confidence: number;
    detailedAnalysis: {
      patternMatching: number;
      vocabularyAnalysis: number;
      stylometricAnalysis: number;
      semanticConsistency: number;
      humanLikeCharacteristics: number;
    };
    indicators: Array<{
      type: 'pattern' | 'vocabulary' | 'style' | 'semantic' | 'behavioral';
      severity: 'low' | 'medium' | 'high' | 'critical';
      confidence: number;
      evidence: string;
      explanation: string;
      location?: { start: number; end: number };
    }>;
    recommendations: string[];
    educationalFeedback: string;
  }> {
    const indicators: Array<any> = [];
    const age = metadata?.childAge || 10;
    
    // Multi-layer AI detection analysis
    const analyses = {
      patternMatching: await this.analyzeAIPatterns(content, indicators),
      vocabularyAnalysis: this.analyzeVocabularyAuthenticity(content, age, indicators),
      stylometricAnalysis: this.analyzeWritingStyle(content, age, indicators),
      semanticConsistency: this.analyzeSemanticConsistency(content, indicators),
      humanLikeCharacteristics: this.analyzeHumanCharacteristics(content, age, indicators),
    };

    // Calculate weighted overall score
    const weights = {
      patternMatching: 0.3,
      vocabularyAnalysis: 0.25,
      stylometricAnalysis: 0.2,
      semanticConsistency: 0.15,
      humanLikeCharacteristics: 0.1,
    };

    const overallScore = Object.entries(analyses).reduce(
      (sum, [key, score]) => sum + (score * weights[key as keyof typeof weights]), 0
    );

    const { likelihood, confidence } = this.calculateLikelihoodAndConfidence(
      overallScore, 
      indicators, 
      metadata
    );

    const { recommendations, educationalFeedback } = this.generateEducationalResponse(
      overallScore, 
      likelihood, 
      indicators, 
      age
    );

    return {
      overallScore: Math.round(overallScore),
      likelihood,
      confidence,
      detailedAnalysis: analyses,
      indicators,
      recommendations,
      educationalFeedback,
    };
  }

  private static async analyzeAIPatterns(content: string, indicators: any[]): Promise<number> {
    let score = 100;
    let deductions = 0;

    // Check each pattern category
    Object.entries(this.aiSignatures).forEach(([category, patterns]) => {
      patterns.forEach((pattern) => {
        const matches = content.match(pattern);
        if (matches) {
          matches.forEach((match) => {
            const severity = this.getPatternSeverity(category, match);
            const deduction = severity === 'critical' ? 40 : severity === 'high' ? 25 : 15;
            
            indicators.push({
              type: 'pattern',
              severity,
              confidence: 95,
              evidence: match,
              explanation: `Detected ${category} pattern: "${match}"`,
              location: this.findTextLocation(content, match),
            });
            
            deductions += deduction;
          });
        }
      });
    });

    return Math.max(0, score - deductions);
  }

  private static analyzeVocabularyAuthenticity(content: string, age: number, indicators: any[]): number {
    let score = 100;
    const words = content.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const ageGroup = age <= 8 ? '6-8' : age <= 12 ? '9-12' : '13+';
    
    // Check age-inappropriate vocabulary
    const inappropriateWords = this.vocabularyAnalysis.advancedByAge[ageGroup] || [];
    const academicWords = this.vocabularyAnalysis.academicVocabulary;
    
    inappropriateWords.forEach(word => {
      if (words.includes(word.toLowerCase())) {
        const severity = age <= 8 ? 'critical' : age <= 12 ? 'high' : 'medium';
        
        indicators.push({
          type: 'vocabulary',
          severity,
          confidence: 90,
          evidence: word,
          explanation: `Word "${word}" is too advanced for age ${age}`,
          location: this.findTextLocation(content, word),
        });
        
        score -= (severity === 'critical' ? 30 : severity === 'high' ? 20 : 10);
      }
    });

    // Check for excessive academic vocabulary
    const academicCount = words.filter(word => 
      academicWords.includes(word.toLowerCase())
    ).length;
    
    const academicRatio = academicCount / words.length;
    const expectedRatio = age <= 8 ? 0.01 : age <= 12 ? 0.03 : 0.05;
    
    if (academicRatio > expectedRatio * 2) {
      indicators.push({
        type: 'vocabulary',
        severity: 'high',
        confidence: 85,
        evidence: `${academicCount} academic words`,
        explanation: `Too many formal/academic words for age ${age} (${(academicRatio * 100).toFixed(1)}%)`,
      });
      score -= 25;
    }

    return Math.max(0, score);
  }

  private static analyzeWritingStyle(content: string, age: number, indicators: any[]): number {
    let score = 100;
    
    // Analyze stylometric features
    const style = this.extractStylometricFeatures(content);
    const expectedStyle = this.getExpectedStyleForAge(age);
    
    // Check sentence length consistency (AI tends to be very consistent)
    if (style.sentenceLengthVariance < 2 && style.sentenceCount > 8) {
      indicators.push({
        type: 'style',
        severity: 'medium',
        confidence: 75,
        evidence: `Uniform sentence lengths (σ=${style.sentenceLengthVariance.toFixed(1)})`,
        explanation: 'Unnaturally consistent sentence structure suggests AI generation',
      });
      score -= 20;
    }

    // Check punctuation sophistication
    if (style.punctuationSophistication > expectedStyle.maxPunctuation) {
      indicators.push({
        type: 'style',
        severity: age <= 10 ? 'high' : 'medium',
        confidence: 80,
        evidence: `Advanced punctuation usage`,
        explanation: `Punctuation complexity too high for age ${age}`,
      });
      score -= (age <= 10 ? 25 : 15);
    }

    // Check transition word usage
    if (style.transitionDensity > expectedStyle.maxTransitions) {
      indicators.push({
        type: 'style',
        severity: 'medium',
        confidence: 70,
        evidence: `${style.transitionCount} transition words`,
        explanation: 'Too many formal transitions for creative writing',
      });
      score -= 15;
    }

    return Math.max(0, score);
  }

  private static extractStylometricFeatures(content: string) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 5);
    const words = content.split(/\W+/).filter(w => w.length > 0);
    
    // Sentence length analysis
    const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
    const avgSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const sentenceLengthVariance = this.calculateVariance(sentenceLengths);
    
    // Punctuation sophistication
    const semicolons = (content.match(/;/g) || []).length;
    const colons = (content.match(/:/g) || []).length;
    const dashes = (content.match(/—|–/g) || []).length;
    const punctuationSophistication = (semicolons + colons + dashes) / sentences.length;
    
    // Transition word analysis
    const transitionWords = [
      'however', 'furthermore', 'moreover', 'consequently', 'therefore',
      'nevertheless', 'nonetheless', 'additionally', 'specifically'
    ];
    const transitionCount = transitionWords.filter(word => 
      content.toLowerCase().includes(word)
    ).length;
    const transitionDensity = transitionCount / sentences.length;
    
    return {
      sentenceCount: sentences.length,
      avgSentenceLength,
      sentenceLengthVariance,
      punctuationSophistication,
      transitionCount,
      transitionDensity,
    };
  }

  private static getExpectedStyleForAge(age: number) {
    if (age <= 8) {
      return {
        maxPunctuation: 0.05,
        maxTransitions: 0.1,
        maxSentenceLength: 10,
      };
    } else if (age <= 12) {
      return {
        maxPunctuation: 0.1,
        maxTransitions: 0.2,
        maxSentenceLength: 15,
      };
    } else {
      return {
        maxPunctuation: 0.2,
        maxTransitions: 0.3,
        maxSentenceLength: 20,
      };
    }
  }

  private static analyzeSemanticConsistency(content: string, indicators: any[]): number {
    let score = 100;
    
    // Analyze semantic coherence and flow
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 50);
    
    if (paragraphs.length > 2) {
      const semanticShifts = this.detectSemanticShifts(paragraphs);
      
      // AI often has abrupt semantic shifts or overly perfect flow
      if (semanticShifts.abruptShifts > paragraphs.length * 0.3) {
        indicators.push({
          type: 'semantic',
          severity: 'medium',
          confidence: 70,
          evidence: `${semanticShifts.abruptShifts} abrupt topic shifts`,
          explanation: 'Unnatural transitions between ideas suggest AI generation',
        });
        score -= 20;
      }
      
      if (semanticShifts.overlyPerfectFlow) {
        indicators.push({
          type: 'semantic',
          severity: 'medium',
          confidence: 65,
          evidence: 'Overly structured progression',
          explanation: 'Too perfect logical flow for natural creative writing',
        });
        score -= 15;
      }
    }
    
    return Math.max(0, score);
  }

  private static detectSemanticShifts(paragraphs: string[]) {
    let abruptShifts = 0;
    let perfectTransitions = 0;
    
    for (let i = 0; i < paragraphs.length - 1; i++) {
      const current = paragraphs[i];
      const next = paragraphs[i + 1];
      
      // Simple semantic analysis
      const currentTopics = this.extractTopics(current);
      const nextTopics = this.extractTopics(next);
      
      const overlap = currentTopics.filter(topic => nextTopics.includes(topic)).length;
      const maxTopics = Math.max(currentTopics.length, nextTopics.length);
      
      if (maxTopics > 0) {
        const similarity = overlap / maxTopics;
        
        if (similarity < 0.2) {
          abruptShifts++;
        } else if (similarity > 0.8) {
          perfectTransitions++;
        }
      }
    }
    
    const overlyPerfectFlow = perfectTransitions > paragraphs.length * 0.6;
    
    return { abruptShifts, overlyPerfectFlow };
  }

  private static extractTopics(text: string): string[] {
    // Simple topic extraction based on nouns and key concepts
    const words = text.toLowerCase().split(/\W+/);
    const topics = words.filter(word => 
      word.length > 4 && 
      !['that', 'with', 'have', 'this', 'will', 'from', 'they', 'been', 'said', 'each', 'which', 'their'].includes(word)
    );
    
    return [...new Set(topics)];
  }

  private static analyzeHumanCharacteristics(content: string, age: number, indicators: any[]): number {
    let score = 100;
    
    // Look for characteristics that indicate human writing
    const humanTraits = this.detectHumanTraits(content, age);
    
    // Lack of human characteristics is suspicious
    if (humanTraits.personalExperiences === 0 && content.length > 200) {
      indicators.push({
        type: 'behavioral',
        severity: 'medium',
        confidence: 60,
        evidence: 'No personal experiences mentioned',
        explanation: 'Children typically include personal references in creative writing',
      });
      score -= 15;
    }
    
    if (humanTraits.emotionalExpressions === 0 && content.length > 300) {
      indicators.push({
        type: 'behavioral',
        severity: 'medium',
        confidence: 65,
        evidence: 'No emotional expressions',
        explanation: 'Lack of emotional language unusual for creative writing',
      });
      score -= 15;
    }
    
    // Perfect grammar/spelling can be suspicious for younger children
    if (age <= 10 && humanTraits.typicalErrors === 0 && content.length > 200) {
      indicators.push({
        type: 'behavioral',
        severity: 'high',
        confidence: 75,
        evidence: 'Perfect spelling and grammar',
        explanation: `Perfect writing unusual for age ${age}`,
      });
      score -= 25;
    }
    
    return Math.max(0, score);
  }

  private static detectHumanTraits(content: string, age: number) {
    const lowerContent = content.toLowerCase();
    
    // Personal experience markers
    const personalMarkers = ['i remember', 'my mom', 'my dad', 'my friend', 'at school', 'last week', 'yesterday'];
    const personalExperiences = personalMarkers.filter(marker => lowerContent.includes(marker)).length;
    
    // Emotional expression markers
    const emotionalMarkers = ['excited', 'scared', 'happy', 'sad', 'angry', 'surprised', 'worried'];
    const emotionalExpressions = emotionalMarkers.filter(marker => lowerContent.includes(marker)).length;
    
    // Typical spelling/grammar errors children make
    const typicalErrors = [
      /\balot\b/g, // a lot
      /\bteh\b/g, // the
      /\brecieve\b/g, // receive
      /\bseperate\b/g, // separate
      /\byour going\b/g, // you're going
    ];
    const errorCount = typicalErrors.reduce((count, pattern) => {
      const matches = content.match(pattern);
      return count + (matches ? matches.length : 0);
    }, 0);
    
    return {
      personalExperiences,
      emotionalExpressions,
      typicalErrors: errorCount,
    };
  }

  private static calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const variance = numbers.reduce((acc, num) => acc + Math.pow(num - mean, 2), 0) / numbers.length;
    return Math.sqrt(variance);
  }

  private static getPatternSeverity(category: string, match: string): 'low' | 'medium' | 'high' | 'critical' {
    if (category === 'chatgptPatterns' && match.includes('as an ai')) return 'critical';
    if (category === 'chatgptPatterns') return 'high';
    if (category === 'claudePatterns') return 'high';
    if (category === 'genericAIPatterns') return 'medium';
    return 'low';
  }

  private static findTextLocation(content: string, searchText: string): { start: number; end: number } {
    const index = content.toLowerCase().indexOf(searchText.toLowerCase());
    return index !== -1 ? { start: index, end: index + searchText.length } : { start: 0, end: 0 };
  }

  private static calculateLikelihoodAndConfidence(
    score: number, 
    indicators: any[], 
    metadata?: any
  ): { likelihood: 'very_low' | 'low' | 'medium' | 'high' | 'very_high'; confidence: number } {
    // Calculate confidence based on indicator strength
    const criticalIndicators = indicators.filter(i => i.severity === 'critical').length;
    const highIndicators = indicators.filter(i => i.severity === 'high').length;
    
    let confidence = 50; // Base confidence
    confidence += criticalIndicators * 20;
    confidence += highIndicators * 10;
    confidence += indicators.length * 3;
    confidence = Math.min(95, confidence);
    
    // Determine likelihood
    let likelihood: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
    
    if (score >= 90) likelihood = 'very_low';
    else if (score >= 75) likelihood = 'low';
    else if (score >= 50) likelihood = 'medium';
    else if (score >= 25) likelihood = 'high';
    else likelihood = 'very_high';
    
    // Adjust based on critical indicators
    if (criticalIndicators > 0) {
      likelihood = 'very_high';
      confidence = Math.max(90, confidence);
    }
    
    return { likelihood, confidence };
  }

  private static generateEducationalResponse(
    score: number, 
    likelihood: string, 
    indicators: any[], 
    age: number
  ) {
    const recommendations: string[] = [];
    const isYoung = age <= 8;
    
    if (likelihood === 'very_high' || likelihood === 'high') {
      if (isYoung) {
        recommendations.push("This story looks like it might be written by a computer. Let's write your own story!");
        recommendations.push("Think about your favorite toys, games, or pets and write about them.");
      } else {
        recommendations.push("This appears to be AI-generated content. Please write your own original story.");
        recommendations.push("Use your personal experiences and imagination to create authentic content.");
      }
    } else if (likelihood === 'medium') {
      recommendations.push("Some parts of this story might be from AI. Try writing more personally.");
      recommendations.push("Add details about things you've experienced or imagined yourself.");
    } else {
      recommendations.push("Great original writing! Keep using your own voice and ideas.");
    }
    
    // Specific feedback based on indicators
    const patternIndicators = indicators.filter(i => i.type === 'pattern');
    const vocabIndicators = indicators.filter(i => i.type === 'vocabulary');
    
    if (patternIndicators.length > 0) {
      recommendations.push("Avoid using phrases that sound too formal or robotic.");
    }
    if (vocabIndicators.length > 0) {
      recommendations.push("Try using simpler words that feel more natural for your age.");
    }
    
    let educationalFeedback: string;
    if (likelihood === 'very_high' || likelihood === 'high') {
      educationalFeedback = isYoung 
        ? "Let's practice writing stories that come from your own imagination! Think about things that make you happy or excited."
        : "This content appears to be AI-generated. Let's focus on developing your authentic writing voice and personal storytelling skills.";
    } else if (likelihood === 'medium') {
      educationalFeedback = "Your writing shows both original and potentially AI-influenced elements. Focus on writing more from your personal perspective and experiences.";
    } else {
     educationalFeedback = "Excellent authentic writing! Your personal voice and creativity shine through. Keep developing your unique storytelling style.";
   }
   
   return { recommendations, educationalFeedback };
 }
}