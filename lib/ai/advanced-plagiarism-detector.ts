// lib/ai/advanced-plagiarism-detector.ts - Enterprise-Level Detection
export class AdvancedPlagiarismDetector {
  private static knowledgeBase = {
    // Expanded knowledge base with semantic understanding
    literaryWorks: new Map([
      // Classic literature fingerprints
      ["call me ishmael", { score: 100, source: "Moby Dick", type: "opening" }],
      ["it was the best of times", { score: 100, source: "Tale of Two Cities", type: "opening" }],
      ["in a hole in the ground", { score: 100, source: "The Hobbit", type: "opening" }],
      
      // Modern popular content
      ["may the force be with you", { score: 95, source: "Star Wars", type: "quote" }],
      ["i am your father", { score: 90, source: "Star Wars", type: "quote" }],
      ["winter is coming", { score: 95, source: "Game of Thrones", type: "quote" }],
      
      // Educational content patterns
      ["the mitochondria is the powerhouse", { score: 100, source: "Biology textbook", type: "fact" }],
      ["photosynthesis is the process by which", { score: 95, source: "Science content", type: "definition" }],
      ["world war ii began in 1939", { score: 90, source: "History content", type: "fact" }],
    ]),

    // Wikipedia and encyclopedia patterns
    wikipediaPatterns: [
      /\b\w+\s*\([^)]*born[^)]*\d{4}[^)]*\)\s*(?:is|was)\s*an?\s*\w+/gi,
      /\b\w+\s*\([^)]*\d{4}[-–—]\d{4}[^)]*\)\s*(?:was|is)\s*an?\s*/gi,
      /according to (?:the\s+)?(?:encyclopedia|wikipedia|britannica)/gi,
      /\[\d+\]|\[citation needed\]|\[edit\]/gi,
      /see also:|main article:|further reading:/gi,
    ],

    // Academic and formal writing indicators
    academicPatterns: [
      /(?:research|studies|evidence) (?:shows?|indicates?|suggests?|demonstrates?)/gi,
      /(?:according to|based on) (?:recent\s+)?(?:research|studies|findings)/gi,
      /it (?:has been|is) (?:proven|established|demonstrated) that/gi,
      /scholars? (?:argue|contend|suggest|maintain) that/gi,
      /peer[- ]reviewed (?:research|studies?|literature)/gi,
      /statistically significant/gi,
      /correlation (?:does not imply|vs) causation/gi,
    ],

    // News and journalism patterns
    journalismPatterns: [
      /(?:reuters|associated press|ap news|cnn|bbc|fox news) (?:reports?|reported)/gi,
      /(?:breaking|developing) (?:news|story)/gi,
      /sources? (?:close to|familiar with) the (?:matter|situation)/gi,
      /(?:yesterday|today|this morning), (?:president|officials?) announced/gi,
      /in an? (?:exclusive|brief|phone) interview/gi,
    ],

    // Social media and internet content
    internetPatterns: [
      /(?:like and subscribe|smash that like button|don't forget to subscribe)/gi,
      /(?:link in|check) (?:the\s+)?(?:description|bio|comments)/gi,
      /(?:dm|message) me (?:for|if)/gi,
      /(?:viral|trending) (?:on|across) social media/gi,
      /#\w+|@\w+/g, // hashtags and mentions
    ],
  };

  static async checkPlagiarism(content: string, metadata?: {
    childAge?: number;
    expectedGenre?: string;
    isCreativeWriting?: boolean;
  }): Promise<{
    overallScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    detailedAnalysis: {
      semanticSimilarity: number;
      structuralAnalysis: number;
      contentAuthenticity: number;
      linguisticFingerprint: number;
    };
    violations: Array<{
      type: 'exact_match' | 'paraphrase' | 'structure' | 'concept';
      severity: 'minor' | 'moderate' | 'severe' | 'critical';
      confidence: number;
      source: string;
      originalText: string;
      matchedText: string;
      explanation: string;
      startIndex: number;
      endIndex: number;
    }>;
    recommendations: string[];
    educationalFeedback: string;
  }> {
    const violations: Array<any> = [];
    let totalDeductions = 0;

    // 1. EXACT MATCH DETECTION (Highest Priority)
    const exactMatches = this.detectExactMatches(content);
    violations.push(...exactMatches.violations);
    totalDeductions += exactMatches.deductions;

    // 2. SEMANTIC SIMILARITY ANALYSIS
    const semanticAnalysis = await this.analyzeSemantic(content, metadata);
    violations.push(...semanticAnalysis.violations);
    totalDeductions += semanticAnalysis.deductions;

    // 3. STRUCTURAL PATTERN ANALYSIS
    const structuralAnalysis = this.analyzeStructuralPatterns(content, metadata);
    violations.push(...structuralAnalysis.violations);
    totalDeductions += structuralAnalysis.deductions;

    // 4. LINGUISTIC FINGERPRINTING
    const linguisticAnalysis = this.analyzeLinguisticFingerprint(content, metadata);
    violations.push(...linguisticAnalysis.violations);
    totalDeductions += linguisticAnalysis.deductions;

    // 5. CONTENT AUTHENTICITY ANALYSIS
    const authenticityAnalysis = this.analyzeContentAuthenticity(content, metadata);
    violations.push(...authenticityAnalysis.violations);
    totalDeductions += authenticityAnalysis.deductions;

    // Calculate comprehensive score
    const overallScore = Math.max(0, 100 - totalDeductions);
    const riskLevel = this.calculateRiskLevel(overallScore, violations);

    // Generate detailed breakdown
    const detailedAnalysis = {
      semanticSimilarity: Math.max(0, 100 - semanticAnalysis.deductions),
      structuralAnalysis: Math.max(0, 100 - structuralAnalysis.deductions),
      contentAuthenticity: Math.max(0, 100 - authenticityAnalysis.deductions),
      linguisticFingerprint: Math.max(0, 100 - linguisticAnalysis.deductions),
    };

    // Generate educational feedback
    const { recommendations, educationalFeedback } = this.generateEducationalResponse(
      violations, 
      overallScore, 
      metadata
    );

    return {
      overallScore,
      riskLevel,
      detailedAnalysis,
      violations,
      recommendations,
      educationalFeedback,
    };
  }

  private static detectExactMatches(content: string) {
    const violations: Array<any> = [];
    let deductions = 0;
    const lowerContent = content.toLowerCase();

    // Check against known content database
    this.knowledgeBase.literaryWorks.forEach((data, phrase) => {
      const index = lowerContent.indexOf(phrase);
      if (index !== -1) {
        violations.push({
          type: 'exact_match',
          severity: data.score > 95 ? 'critical' : data.score > 80 ? 'severe' : 'moderate',
          confidence: data.score,
          source: data.source,
          originalText: phrase,
          matchedText: content.substring(index, index + phrase.length),
          explanation: `Exact match found from ${data.source} (${data.type})`,
          startIndex: index,
          endIndex: index + phrase.length,
        });
        deductions += Math.min(data.score * 0.3, 30);
      }
    });

    // Pattern-based detection
    Object.entries(this.knowledgeBase).forEach(([category, patterns]) => {
      if (Array.isArray(patterns)) {
        patterns.forEach((pattern) => {
          const matches = content.match(pattern);
          if (matches) {
            matches.forEach((match) => {
              const index = content.indexOf(match);
              violations.push({
                type: 'structure',
                severity: 'moderate',
                confidence: 85,
                source: category,
                originalText: match,
                matchedText: match,
                explanation: `Pattern typical of ${category} detected`,
                startIndex: index,
                endIndex: index + match.length,
              });
              deductions += 15;
            });
          }
        });
      }
    });

    return { violations, deductions };
  }

  private static async analyzeSemantic(content: string, metadata?: any) {
    const violations: Array<any> = [];
    let deductions = 0;

    // Semantic chunking and analysis
    const chunks = this.createSemanticChunks(content);
    
    for (const chunk of chunks) {
      const semanticScore = await this.calculateSemanticOriginality(chunk, metadata);
      
      if (semanticScore < 70) {
        violations.push({
          type: 'paraphrase',
          severity: semanticScore < 50 ? 'severe' : 'moderate',
          confidence: 100 - semanticScore,
          source: 'semantic_analysis',
          originalText: chunk.text,
          matchedText: chunk.text,
          explanation: `Content appears to be paraphrased from existing sources`,
          startIndex: chunk.startIndex,
          endIndex: chunk.endIndex,
        });
        deductions += (70 - semanticScore) * 0.3;
      }
    }

    return { violations, deductions };
  }

  private static createSemanticChunks(content: string) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const chunks: Array<{text: string; startIndex: number; endIndex: number}> = [];

    // Create overlapping chunks for better detection
    for (let i = 0; i < sentences.length; i++) {
      const chunkSentences = sentences.slice(i, Math.min(i + 3, sentences.length));
      const chunkText = chunkSentences.join('. ').trim();
      
      if (chunkText.length > 50) {
        const startIndex = content.indexOf(chunkSentences[0]);
        const endIndex = startIndex + chunkText.length;
        chunks.push({ text: chunkText, startIndex, endIndex });
      }
    }

    return chunks;
  }

  private static async calculateSemanticOriginality(chunk: {text: string}, metadata?: any): Promise<number> {
    // Advanced semantic analysis using multiple techniques
    
    // 1. Concept density analysis
    const conceptDensity = this.analyzeConceptDensity(chunk.text);
    
    // 2. Lexical diversity analysis  
    const lexicalDiversity = this.calculateLexicalDiversity(chunk.text);
    
    // 3. Information entropy analysis
    const entropy = this.calculateInformationEntropy(chunk.text);
    
    // 4. Age-appropriate complexity analysis
    const complexityScore = this.analyzeComplexityForAge(chunk.text, metadata?.childAge);

    // Combine metrics for semantic originality score
    const semanticScore = (conceptDensity * 0.3) + (lexicalDiversity * 0.3) + (entropy * 0.2) + (complexityScore * 0.2);
    
    return Math.max(0, Math.min(100, semanticScore));
  }

  private static analyzeConceptDensity(text: string): number {
    const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const uniqueConcepts = new Set(words);
    
    // Higher concept density = more original
    const density = (uniqueConcepts.size / words.length) * 100;
    return Math.min(100, density * 2); // Boost for creative writing
  }

  private static calculateLexicalDiversity(text: string): number {
    const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    const uniqueWords = new Set(words);
    
    // Type-Token Ratio with adjustment for text length
    const ttr = uniqueWords.size / words.length;
    const adjustedTTR = ttr * Math.sqrt(words.length); // Adjust for length bias
    
    return Math.min(100, adjustedTTR * 100);
  }

  private static calculateInformationEntropy(text: string): number {
    const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 0);
    const frequency = new Map<string, number>();
    
    // Calculate word frequencies
    words.forEach(word => {
      frequency.set(word, (frequency.get(word) || 0) + 1);
    });
    
    // Calculate entropy
    let entropy = 0;
    const totalWords = words.length;
    
    frequency.forEach(count => {
      const probability = count / totalWords;
      entropy -= probability * Math.log2(probability);
    });
    
    // Normalize entropy (higher = more unpredictable = more original)
    return Math.min(100, (entropy / Math.log2(totalWords)) * 100);
  }

  private static analyzeComplexityForAge(text: string, age: number = 10): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\W+/).filter(w => w.length > 0);
    
    // Calculate various complexity metrics
    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = words.reduce((sum, word) => sum + this.countSyllables(word), 0) / words.length;
    const complexWords = words.filter(word => this.countSyllables(word) >= 3).length;
    
    // Age-appropriate expectations
    const expectedComplexity = age <= 8 ? 0.3 : age <= 12 ? 0.5 : 0.7;
    const actualComplexity = (avgWordsPerSentence / 20) + (avgSyllablesPerWord / 3) + (complexWords / words.length);
    
    // Score based on how close to expected complexity (not too simple, not too complex)
    const deviation = Math.abs(actualComplexity - expectedComplexity);
    return Math.max(0, 100 - (deviation * 100));
  }

  private static countSyllables(word: string): number {
    // Simple syllable counting algorithm
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }

  private static analyzeStructuralPatterns(content: string, metadata?: any) {
    const violations: Array<any> = [];
    let deductions = 0;

    // Advanced structural analysis
    const structure = this.analyzeTextStructure(content);
    
    // Check for suspicious uniformity
    if (structure.sentenceLengthVariance < 3 && structure.sentences.length > 8) {
      violations.push({
        type: 'structure',
        severity: 'moderate',
        confidence: 80,
        source: 'structural_analysis',
        originalText: 'Sentence structure pattern',
        matchedText: `All sentences ${Math.round(structure.avgSentenceLength)} ± 2 words`,
        explanation: 'Unnaturally uniform sentence lengths suggest potential copying',
        startIndex: 0,
        endIndex: content.length,
      });
      deductions += 15;
    }

    // Check for repetitive paragraph structures
    const paragraphStructures = this.analyzeParagraphStructures(content);
    if (paragraphStructures.repetitionScore > 70) {
      violations.push({
        type: 'structure',
        severity: 'moderate',
        confidence: paragraphStructures.repetitionScore,
        source: 'paragraph_analysis',
        originalText: 'Paragraph structure pattern',
        matchedText: 'Repetitive paragraph organization',
        explanation: 'Paragraphs follow identical structural patterns',
        startIndex: 0,
        endIndex: content.length,
      });
      deductions += paragraphStructures.repetitionScore * 0.2;
    }

    return { violations, deductions };
  }

  private static analyzeTextStructure(content: string) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 5);
    const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
    
    const avgSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const variance = sentenceLengths.reduce((acc, len) => acc + Math.pow(len - avgSentenceLength, 2), 0) / sentenceLengths.length;
    
    return {
      sentences,
      sentenceLengths,
      avgSentenceLength,
      sentenceLengthVariance: Math.sqrt(variance),
    };
  }

  private static analyzeParagraphStructures(content: string) {
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 50);
    const structures = paragraphs.map(p => this.getParagraphStructure(p));
    
    // Calculate similarity between paragraph structures
    let totalSimilarity = 0;
    let comparisons = 0;
    
    for (let i = 0; i < structures.length - 1; i++) {
      for (let j = i + 1; j < structures.length; j++) {
        totalSimilarity += this.calculateStructureSimilarity(structures[i], structures[j]);
        comparisons++;
      }
    }
    
    const repetitionScore = comparisons > 0 ? (totalSimilarity / comparisons) * 100 : 0;
    
    return { repetitionScore, structures };
  }

  private static getParagraphStructure(paragraph: string) {
    const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 5);
    return {
      sentenceCount: sentences.length,
      avgSentenceLength: sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) / sentences.length,
      startsWithTransition: /^(however|furthermore|moreover|additionally|consequently)/i.test(paragraph.trim()),
      endsWithConclusion: /(therefore|thus|in conclusion|finally).*[.!?]$/i.test(paragraph.trim()),
    };
  }

  private static calculateStructureSimilarity(struct1: any, struct2: any): number {
    let similarity = 0;
    
    // Compare sentence counts
    if (Math.abs(struct1.sentenceCount - struct2.sentenceCount) <= 1) similarity += 0.3;
    
    // Compare average sentence lengths
    if (Math.abs(struct1.avgSentenceLength - struct2.avgSentenceLength) <= 2) similarity += 0.3;
    
    // Compare transition usage
    if (struct1.startsWithTransition === struct2.startsWithTransition) similarity += 0.2;
    
    // Compare conclusion usage
    if (struct1.endsWithConclusion === struct2.endsWithConclusion) similarity += 0.2;
    
    return similarity;
  }

  private static analyzeLinguisticFingerprint(content: string, metadata?: any) {
    const violations: Array<any> = [];
    let deductions = 0;

    // Advanced linguistic analysis
    const fingerprint = this.createLinguisticFingerprint(content);
    const suspicionScore = this.analyzeFingerprintSuspicion(fingerprint, metadata);
    
    if (suspicionScore > 60) {
      violations.push({
        type: 'concept',
        severity: suspicionScore > 80 ? 'severe' : 'moderate',
        confidence: suspicionScore,
        source: 'linguistic_analysis',
        originalText: 'Writing style analysis',
        matchedText: fingerprint.summary,
        explanation: 'Linguistic patterns suggest potential copying or AI generation',
        startIndex: 0,
        endIndex: content.length,
      });
      deductions += suspicionScore * 0.25;
    }

    return { violations, deductions };
  }

  private static createLinguisticFingerprint(content: string) {
    const words = content.toLowerCase().split(/\W+/).filter(w => w.length > 0);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 5);
    
    // Function word analysis (the, and, of, to, etc.)
    const functionWords = ['the', 'and', 'of', 'to', 'a', 'in', 'for', 'is', 'on', 'that', 'by', 'this', 'with', 'i', 'you', 'it', 'not', 'or', 'be', 'are'];
    const functionWordFreq = functionWords.map(word => words.filter(w => w === word).length / words.length);
    
    // Punctuation analysis
    const punctuationFreq = {
      comma: (content.match(/,/g) || []).length / content.length,
      semicolon: (content.match(/;/g) || []).length / content.length,
      colon: (content.match(/:/g) || []).length / content.length,
      exclamation: (content.match(/!/g) || []).length / content.length,
    };
    
    // Syntactic complexity
    const avgWordsPerSentence = words.length / sentences.length;
    const complexSentences = sentences.filter(s => s.includes(',') && s.includes('and')).length / sentences.length;
    
    return {
      functionWordFreq,
      punctuationFreq,
      avgWordsPerSentence,
      complexSentences,
      summary: `AWL: ${avgWordsPerSentence.toFixed(1)}, Complex: ${(complexSentences * 100).toFixed(0)}%`,
    };
  }

  private static analyzeFingerprintSuspicion(fingerprint: any, metadata?: any): number {
    let suspicion = 0;
    const age = metadata?.childAge || 10;
    
    // Check for age-inappropriate sophistication
    if (fingerprint.avgWordsPerSentence > (age <= 8 ? 8 : age <= 12 ? 12 : 16)) {
      suspicion += 20;
    }
    
    // Check for unnatural punctuation patterns
    if (fingerprint.punctuationFreq.semicolon > 0.01 && age < 12) {
      suspicion += 25; // Young children rarely use semicolons
    }
    
    // Check for overly complex sentence structures
    if (fingerprint.complexSentences > (age <= 8 ? 0.2 : age <= 12 ? 0.4 : 0.6)) {
      suspicion += 15;
    }
    
    return Math.min(100, suspicion);
  }

  private static analyzeContentAuthenticity(content: string, metadata?: any) {
    const violations: Array<any> = [];
    let deductions = 0;

    // Multi-layered authenticity analysis
    const authenticityScores = {
      personalityConsistency: this.analyzePersonalityConsistency(content),
      ageAppropriateness: this.analyzeAgeAppropriateness(content, metadata?.childAge),
      culturalAuthenticity: this.analyzeCulturalAuthenticity(content),
      temporalConsistency: this.analyzeTemporalConsistency(content),
    };

    Object.entries(authenticityScores).forEach(([metric, score]) => {
      if (score < 60) {
        violations.push({
          type: 'concept',
          severity: score < 40 ? 'severe' : 'moderate',
          confidence: 100 - score,
          source: `authenticity_${metric}`,
          originalText: metric,
          matchedText: `${metric}: ${score}%`,
          explanation: `Content shows inconsistencies in ${metric.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
          startIndex: 0,
          endIndex: content.length,
        });
        deductions += (60 - score) * 0.2;
      }
    });

    return { violations, deductions };
  }

  private static analyzePersonalityConsistency(content: string): number {
    // Analyze consistency of voice, tone, and personality throughout
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 50);
    if (paragraphs.length < 2) return 100;

    const personalityTraits = paragraphs.map(p => this.extractPersonalityTraits(p));
    
    // Calculate consistency between paragraphs
    let totalConsistency = 0;
    let comparisons = 0;

    for (let i = 0; i < personalityTraits.length - 1; i++) {
      for (let j = i + 1; j < personalityTraits.length; j++) {
        totalConsistency += this.calculatePersonalityConsistency(personalityTraits[i], personalityTraits[j]);
        comparisons++;
      }
    }

    return comparisons > 0 ? (totalConsistency / comparisons) * 100 : 100;
  }

  private static extractPersonalityTraits(text: string) {
    return {
      formalityLevel: this.calculateFormality(text),
      emotionalTone: this.calculateEmotionalTone(text),
      vocabularyLevel: this.calculateVocabularyLevel(text),
      sentenceComplexity: this.calculateSentenceComplexity(text),
    };
  }

  private static calculateFormality(text: string): number {
    const formalWords = ['furthermore', 'moreover', 'consequently', 'nevertheless', 'therefore', 'however'];
    const informalWords = ['gonna', 'wanna', 'yeah', 'okay', 'cool', 'awesome', 'stuff'];
    
    const formal = formalWords.filter(word => text.toLowerCase().includes(word)).length;
    const informal = informalWords.filter(word => text.toLowerCase().includes(word)).length;
    
    return formal > informal ? 0.8 : informal > formal ? 0.2 : 0.5;
  }

  private static calculateEmotionalTone(text: string): number {
    const positiveWords = ['happy', 'excited', 'amazing', 'wonderful', 'great', 'love', 'joy'];
    const negativeWords = ['sad', 'angry', 'terrible', 'awful', 'hate', 'fear', 'worried'];
    
    const positive = positiveWords.filter(word => text.toLowerCase().includes(word)).length;
    const negative = negativeWords.filter(word => text.toLowerCase().includes(word)).length;
    
    return positive > negative ? 0.7 : negative > positive ? 0.3 : 0.5;
  }

  private static calculateVocabularyLevel(text: string): number {
    const words = text.split(/\W+/).filter(w => w.length > 3);
    const advancedWords = words.filter(word => word.length > 7).length;
    return Math.min(1, advancedWords / words.length * 10);
  }

  private static calculateSentenceComplexity(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
    const complexSentences = sentences.filter(s => 
      s.includes(',') && (s.includes('because') || s.includes('although') || s.includes('while'))
    ).length;
    return complexSentences / sentences.length;
  }

  private static calculatePersonalityConsistency(traits1: any, traits2: any): number {
    const differences = [
      Math.abs(traits1.formalityLevel - traits2.formalityLevel),
      Math.abs(traits1.emotionalTone - traits2.emotionalTone),
      Math.abs(traits1.vocabularyLevel - traits2.vocabularyLevel),
      Math.abs(traits1.sentenceComplexity - traits2.sentenceComplexity),
    ];
    
    const avgDifference = differences.reduce((a, b) => a + b, 0) / differences.length;
    return Math.max(0, 1 - avgDifference);
  }

  private static analyzeAgeAppropriateness(content: string, age: number = 10): number {
    const expectations = this.getAgeExpectations(age);
    const actual = this.analyzeContentCharacteristics(content);
    
    // Calculate how well content matches age expectations
    const scores = [
      this.scoreMatch(actual.vocabularyComplexity, expectations.vocabularyComplexity),
      this.scoreMatch(actual.sentenceComplexity, expectations.sentenceComplexity),
      this.scoreMatch(actual.topicSophistication, expectations.topicSophistication),
      this.scoreMatch(actual.grammarAccuracy, expectations.grammarAccuracy),
    ];
    
    return scores.reduce((a, b) => a + b, 0) / scores.length * 100;
  }

  private static getAgeExpectations(age: number) {
    if (age <= 8) {
      return {
        vocabularyComplexity: 0.3,
        sentenceComplexity: 0.2,
        topicSophistication: 0.2,
        grammarAccuracy: 0.6,
      };
    } else if (age <= 12) {
      return {
        vocabularyComplexity: 0.5,
        sentenceComplexity: 0.4,
        topicSophistication: 0.4,
        grammarAccuracy: 0.8,
      };
    } else {
      return {
        vocabularyComplexity: 0.7,
        sentenceComplexity: 0.6,
        topicSophistication: 0.6,
        grammarAccuracy: 0.9,
      };
    }
  }

  private static analyzeContentCharacteristics(content: string) {
    return {
      vocabularyComplexity: this.calculateVocabularyLevel(content),
      sentenceComplexity: this.calculateSentenceComplexity(content),
      topicSophistication: this.calculateTopicSophistication(content),
      grammarAccuracy: this.calculateGrammarAccuracy(content),
    };
  }

  private static calculateTopicSophistication(content: string): number {
    const sophisticatedTopics = [
      'philosophy', 'psychology', 'economics', 'politics', 'sociology',
      'quantum', 'molecular', 'theoretical', 'existential', 'metaphysical'
      ];
   
   const abstractConcepts = [
     'consciousness', 'identity', 'morality', 'ethics', 'justice',
     'freedom', 'truth', 'beauty', 'meaning', 'purpose'
   ];
   
   const words = content.toLowerCase().split(/\W+/);
   const sophisticatedCount = words.filter(word => 
     sophisticatedTopics.some(topic => word.includes(topic)) ||
     abstractConcepts.some(concept => word.includes(concept))
   ).length;
   
   return Math.min(1, sophisticatedCount / words.length * 50);
 }

 private static calculateGrammarAccuracy(content: string): number {
   // Common grammar errors that children typically make
   const commonErrors = [
     /\bI is\b/gi,
     /\bthere car\b/gi,
     /\bshould of\b/gi,
     /\bcould of\b/gi,
     /\byour going\b/gi,
     /\bits raining\b/gi, // should be "it's"
     /\balot\b/gi, // should be "a lot"
   ];
   
   let errors = 0;
   commonErrors.forEach(pattern => {
     const matches = content.match(pattern);
     if (matches) errors += matches.length;
   });
   
   const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 5);
   const errorRate = errors / sentences.length;
   
   return Math.max(0, 1 - errorRate * 2);
 }

 private static scoreMatch(actual: number, expected: number): number {
   const difference = Math.abs(actual - expected);
   return Math.max(0, 1 - difference * 2);
 }

 private static analyzeCulturalAuthenticity(content: string): number {
   // Analyze cultural references for authenticity
   const culturalMarkers = {
     americanSlang: ['awesome', 'cool', 'dude', 'guys', 'yeah'],
     britishSlang: ['brilliant', 'lovely', 'quite', 'rather', 'bloke'],
     formalLanguage: ['indeed', 'certainly', 'precisely', 'furthermore'],
     internetSlang: ['lol', 'omg', 'btw', 'tbh', 'ngl'],
   };
   
   const markerCounts = Object.entries(culturalMarkers).map(([culture, markers]) => ({
     culture,
     count: markers.filter(marker => content.toLowerCase().includes(marker)).length
   }));
   
   // Check for cultural consistency
   const dominantCulture = markerCounts.reduce((a, b) => a.count > b.count ? a : b);
   const totalMarkers = markerCounts.reduce((sum, culture) => sum + culture.count, 0);
   
   if (totalMarkers === 0) return 100; // No cultural markers to analyze
   
   const consistency = dominantCulture.count / totalMarkers;
   return consistency * 100;
 }

 private static analyzeTemporalConsistency(content: string): number {
   // Check for anachronisms and temporal inconsistencies
   const timeMarkers = {
     past: ['was', 'were', 'had', 'did', 'went', 'came', 'said'],
     present: ['is', 'are', 'have', 'do', 'go', 'come', 'say'],
     future: ['will', 'shall', 'going to', 'gonna'],
   };
   
   const tenseUsage = Object.entries(timeMarkers).map(([tense, markers]) => ({
     tense,
     count: markers.filter(marker => content.toLowerCase().includes(marker)).length
   }));
   
   const totalTenseMarkers = tenseUsage.reduce((sum, tense) => sum + tense.count, 0);
   if (totalTenseMarkers === 0) return 100;
   
   // Check for dominant tense consistency
   const dominantTense = tenseUsage.reduce((a, b) => a.count > b.count ? a : b);
   const consistency = dominantTense.count / totalTenseMarkers;
   
   return Math.max(60, consistency * 100); // Give benefit of doubt
 }

 private static calculateRiskLevel(score: number, violations: any[]): 'low' | 'medium' | 'high' | 'critical' {
   const criticalViolations = violations.filter(v => v.severity === 'critical').length;
   const severeViolations = violations.filter(v => v.severity === 'severe').length;
   
   if (criticalViolations > 0 || score < 30) return 'critical';
   if (severeViolations > 1 || score < 50) return 'high';
   if (violations.length > 3 || score < 70) return 'medium';
   return 'low';
 }

 private static generateEducationalResponse(violations: any[], score: number, metadata?: any) {
   const recommendations: string[] = [];
   const ageGroup = metadata?.childAge <= 8 ? 'young' : metadata?.childAge <= 12 ? 'middle' : 'older';
   
   // Generate age-appropriate recommendations
   if (score < 50) {
     if (ageGroup === 'young') {
       recommendations.push("This story has parts that look like they came from somewhere else. Let's write your own story using your imagination!");
       recommendations.push("Try writing about things you know - your pets, friends, or favorite games.");
     } else {
       recommendations.push("Several sections appear to be copied from other sources. Focus on creating original content.");
       recommendations.push("Use your own experiences and imagination to make the story uniquely yours.");
     }
   } else if (score < 70) {
     recommendations.push("Some parts of your story might be influenced by other sources. Try to write more in your own voice.");
     recommendations.push("Add personal details and unique ideas to make your story more original.");
   } else {
     recommendations.push("Great original writing! Keep using your own words and creative ideas.");
   }

   // Category-specific feedback
   const violationTypes = violations.map(v => v.type);
   if (violationTypes.includes('exact_match')) {
     recommendations.push("Avoid copying exact phrases from books, movies, or websites you've read.");
   }
   if (violationTypes.includes('structure')) {
     recommendations.push("Try varying your sentence lengths and paragraph structures to make your writing more natural.");
   }

   const educationalFeedback = this.generateEducationalFeedback(score, violations, ageGroup);

   return { recommendations, educationalFeedback };
 }

 private static generateEducationalFeedback(score: number, violations: any[], ageGroup: string): string {
   if (score >= 90) {
     return "Excellent original writing! Your story shows creativity and authentic voice. Keep developing your unique writing style.";
   } else if (score >= 70) {
     return "Good original content with room for improvement. Focus on making your voice even more unique and personal.";
   } else if (score >= 50) {
     return "Your story shows some originality, but some parts seem borrowed from other sources. Practice writing more from your own imagination.";
   } else {
     if (ageGroup === 'young') {
       return "Let's work on writing your very own story! Think about your favorite things and create something that's all yours.";
     } else {
       return "This story contains significant copied content. Let's focus on developing your original writing skills and creative voice.";
     }
   }
 }
}