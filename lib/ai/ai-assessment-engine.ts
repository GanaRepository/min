// lib/ai/ai-assessment-engine.ts - Consolidated Assessment Engine (Updated)
import { AIDetector } from './ai-detector';
import StorySession from '@/models/StorySession';
import User from '@/models/User';
import { connectToDatabase } from '@/utils/db';

export class AIAssessmentEngine {
  // Knowledge base for plagiarism detection
  private static knowledgeBase = {
    literaryWorks: new Map([
      // Classic literature fingerprints
      ['call me ishmael', { score: 100, source: 'Moby Dick', type: 'opening' }],
      [
        'it was the best of times',
        { score: 100, source: 'Tale of Two Cities', type: 'opening' },
      ],
      [
        'in a hole in the ground',
        { score: 100, source: 'The Hobbit', type: 'opening' },
      ],
      // Modern popular content
      [
        'may the force be with you',
        { score: 95, source: 'Star Wars', type: 'quote' },
      ],
      ['i am your father', { score: 90, source: 'Star Wars', type: 'quote' }],
      [
        'winter is coming',
        { score: 95, source: 'Game of Thrones', type: 'quote' },
      ],
      // Educational content patterns
      [
        'the mitochondria is the powerhouse',
        { score: 100, source: 'Biology textbook', type: 'fact' },
      ],
      [
        'photosynthesis is the process by which',
        { score: 95, source: 'Science content', type: 'definition' },
      ],
      [
        'world war ii began in 1939',
        { score: 90, source: 'History content', type: 'fact' },
      ],
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

  /**
   * Main assessment method - comprehensive story analysis
   */
  static async assessStory(
    storyContent: string,
    sessionId: string,
    userId: string
  ) {
    await connectToDatabase();

    // Get story session and user data
    const [storySession, user] = await Promise.all([
      StorySession.findById(sessionId),
      User.findById(userId),
    ]);

    if (!storySession) {
      throw new Error('Story session not found');
    }

    // Get previous assessments for progress tracking
    const previousSessions = await StorySession.find({
      childId: userId,
      assessment: { $exists: true },
      'assessment.overallScore': { $exists: true },
    })
      .sort({ createdAt: -1 })
      .limit(5);

    const previousAttempts = previousSessions.map((session) => ({
      assessmentDate: session.completedAt || session.createdAt,
      overallScore: session.assessment?.overallScore || 0,
      categoryScores: {
        grammar: session.assessment?.grammarScore || 0,
        creativity: session.assessment?.creativityScore || 0,
        vocabulary: session.assessment?.vocabularyScore || 0,
        structure: session.assessment?.structureScore || 0,
        characterDevelopment:
          session.assessment?.characterDevelopmentScore || 0,
        plotDevelopment: session.assessment?.plotDevelopmentScore || 0,
      },
    }));

    // Use comprehensive assessment
    const assessmentResult = await this.performCompleteAssessment(
      storyContent,
      {
        childAge: user?.age || 10,
        isCollaborativeStory: false,
        storyTitle: storySession.title,
        previousAttempts,
        expectedGenre: 'creative',
      }
    );

    return assessmentResult;
  }

  /**
   * Assess uploaded story directly
   */
  static async assessUploadedStory(
    storyContent: string,
    title: string,
    userId: string
  ) {
    await connectToDatabase();

    const user = await User.findById(userId);

    // Get previous assessments for progress tracking
    const previousSessions = await StorySession.find({
      childId: userId,
      assessment: { $exists: true },
      'assessment.overallScore': { $exists: true },
    })
      .sort({ createdAt: -1 })
      .limit(5);

    const previousAttempts = previousSessions.map((session) => ({
      assessmentDate: session.completedAt || session.createdAt,
      overallScore: session.assessment?.overallScore || 0,
      categoryScores: {
        grammar: session.assessment?.grammarScore || 0,
        creativity: session.assessment?.creativityScore || 0,
        vocabulary: session.assessment?.vocabularyScore || 0,
        structure: session.assessment?.structureScore || 0,
        characterDevelopment:
          session.assessment?.characterDevelopmentScore || 0,
        plotDevelopment: session.assessment?.plotDevelopmentScore || 0,
      },
    }));

    const assessmentResult = await this.performCompleteAssessment(
      storyContent,
      {
        childAge: user?.age || 10,
        isCollaborativeStory: false,
        storyTitle: title,
        previousAttempts,
        expectedGenre: 'creative',
      }
    );

    return assessmentResult;
  }

  /**
   * Lightweight AI assessment for competition filtering
   */
  static async performLightweightAssessment(prompt: string): Promise<string> {
    try {
      // Use a simpler AI call or your existing AI provider
      // This is a placeholder - replace with your actual lightweight AI implementation
      const response = await fetch('/api/lightweight-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      return data.response || '75';
    } catch (error) {
      console.error('Lightweight AI assessment failed:', error);
      // Return fallback score
      return '75';
    }
  }

  /**
   * NEW: 16-Step Detailed Assessment Analysis
   * Provides comprehensive analysis matching the expected assessment format
   */
  static async performSixteenStepAnalysis(
    content: string,
    metadata: {
      childAge?: number;
      storyTitle?: string;
      isCollaborativeStory?: boolean;
      expectedGenre?: 'creative' | 'adventure' | 'mystery' | 'fantasy';
    }
  ): Promise<{
    step1_2_academicIntegrity: {
      status: 'PASS' | 'WARNING' | 'FAIL';
      message: string;
      aiDetectionRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      plagiarismRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      recommendation: string;
    };
    step3_6_educationalContent: {
      grammarScore: number;
      vocabularyScore: number;
      creativityScore: number;
      characterDevelopmentScore: number;
      plotDevelopmentScore: number;
      descriptiveWritingScore: number;
    };
    step7_10_specializedAnalysis: {
      sensoryDetailsScore: number;
      plotLogicScore: number;
      themeRecognitionScore: number;
      problemSolvingScore: number;
    };
    step11_13_ageAppropriatenessAndReadingLevel: {
      ageAppropriatenessScore: number;
      readingLevel: string;
      complexity: 'Beginner' | 'Elementary' | 'Intermediate' | 'Advanced';
      recommendation: string;
    };
    step14_16_comprehensiveFeedback: {
      overallScore: number;
      strengths: string[];
      improvements: string[];
      nextSteps: string[];
      teacherComment: string;
      encouragement: string;
      integrityStatus: {
        status: 'PASS' | 'WARNING' | 'FAIL';
        message: string;
        mentorNote?: string;
        adminFlags?: string[];
      };
    };
    detailedAnalysisBreakdown: {
      contentAnalysis: any;
      integrityAnalysis: any;
      progressTracking?: any;
      recommendations: any;
    };
  }> {
    console.log('🔍 Starting 16-Step Detailed Assessment Analysis...');

    const age = metadata.childAge || 10;

    // Perform complete assessment first
    const completeAssessment = await this.performCompleteAssessment(
      content,
      metadata
    );

    // Step 1-2: Academic Integrity Check
    const step1_2_academicIntegrity = {
      status: completeAssessment.integrityStatus.status,
      message: completeAssessment.integrityStatus.message,
      aiDetectionRisk: this.mapToRiskLevel(
        completeAssessment.integrityAnalysis.aiDetectionResult.likelihood
      ),
      plagiarismRisk: this.mapToRiskLevel(
        completeAssessment.integrityAnalysis.plagiarismResult.riskLevel
      ),
      recommendation: completeAssessment.integrityStatus.recommendation,
    };

    // Step 3-6: Educational Content Assessment
    const step3_6_educationalContent = {
      grammarScore: completeAssessment.categoryScores.grammar,
      vocabularyScore: completeAssessment.categoryScores.vocabulary,
      creativityScore: completeAssessment.categoryScores.creativity,
      characterDevelopmentScore:
        completeAssessment.categoryScores.characterDevelopment,
      plotDevelopmentScore: completeAssessment.categoryScores.plotDevelopment,
      descriptiveWritingScore:
        completeAssessment.categoryScores.descriptiveWriting,
    };

    // Step 7-10: Specialized Analysis
    const step7_10_specializedAnalysis = {
      sensoryDetailsScore: completeAssessment.categoryScores.sensoryDetails,
      plotLogicScore: completeAssessment.categoryScores.plotLogic,
      themeRecognitionScore: completeAssessment.categoryScores.themeRecognition,
      problemSolvingScore: completeAssessment.categoryScores.problemSolving,
    };

    // Step 11-13: Age Appropriateness & Reading Level
    const complexity = this.determineComplexityLevel(
      completeAssessment.categoryScores.readingLevel,
      completeAssessment.categoryScores.ageAppropriateness
    );

    const step11_13_ageAppropriatenessAndReadingLevel = {
      ageAppropriatenessScore:
        completeAssessment.categoryScores.ageAppropriateness,
      readingLevel: completeAssessment.categoryScores.readingLevel,
      complexity,
      recommendation: this.generateReadingLevelRecommendation(
        completeAssessment.categoryScores.ageAppropriateness,
        age,
        complexity
      ),
    };

    // Step 14-16: Comprehensive Feedback Generation
    const step14_16_comprehensiveFeedback = {
      overallScore: completeAssessment.overallScore,
      strengths: completeAssessment.educationalFeedback.strengths,
      improvements: completeAssessment.educationalFeedback.improvements,
      nextSteps: completeAssessment.educationalFeedback.nextSteps,
      teacherComment: completeAssessment.educationalFeedback.teacherComment,
      encouragement: completeAssessment.educationalFeedback.encouragement,
      integrityStatus: completeAssessment.integrityStatus,
    };

    return {
      step1_2_academicIntegrity,
      step3_6_educationalContent,
      step7_10_specializedAnalysis,
      step11_13_ageAppropriatenessAndReadingLevel,
      step14_16_comprehensiveFeedback,
      detailedAnalysisBreakdown: {
        contentAnalysis: completeAssessment.categoryScores,
        integrityAnalysis: completeAssessment.integrityAnalysis,
        progressTracking: completeAssessment.progressTracking,
        recommendations: completeAssessment.recommendations,
      },
    };
  }

  // Helper methods for 16-step analysis
  private static mapToRiskLevel(
    level: string
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    switch (level.toLowerCase()) {
      case 'very_low':
      case 'low':
        return 'LOW';
      case 'medium':
        return 'MEDIUM';
      case 'high':
        return 'HIGH';
      case 'very_high':
      case 'critical':
        return 'CRITICAL';
      default:
        return 'MEDIUM';
    }
  }

  private static determineComplexityLevel(
    readingLevel: string,
    ageAppropriatenessScore: number
  ): 'Beginner' | 'Elementary' | 'Intermediate' | 'Advanced' {
    if (readingLevel.includes('Beginner') || ageAppropriatenessScore < 60) {
      return 'Beginner';
    } else if (
      readingLevel.includes('Elementary') ||
      ageAppropriatenessScore < 75
    ) {
      return 'Elementary';
    } else if (
      readingLevel.includes('Intermediate') ||
      ageAppropriatenessScore < 85
    ) {
      return 'Intermediate';
    } else {
      return 'Advanced';
    }
  }

  private static generateReadingLevelRecommendation(
    score: number,
    age: number,
    complexity: string
  ): string {
    if (score >= 85) {
      return `Perfect content complexity for age ${age}. Continue developing your writing skills.`;
    } else if (score >= 70) {
      return `Good age-appropriate content. Try adding more ${age <= 8 ? 'simple' : 'varied'} details.`;
    } else if (score >= 60) {
      return `Content may be ${complexity === 'Advanced' ? 'too complex' : 'too simple'} for age ${age}. ${
        complexity === 'Advanced'
          ? 'Try using simpler words and shorter sentences.'
          : 'Challenge yourself with more descriptive language.'
      }`;
    } else {
      return `Content needs significant adjustment for age ${age}. ${
        age <= 8
          ? 'Focus on simple, clear storytelling with familiar words.'
          : 'Work on age-appropriate vocabulary and themes.'
      }`;
    }
  }
  static async performCompleteAssessment(
    content: string,
    metadata: {
      childAge?: number;
      isCollaborativeStory?: boolean;
      isCompetition?: boolean;
      storyTitle?: string;
      previousAttempts?: any[];
      expectedGenre?: 'adventure' | 'mystery' | 'creative' | 'fantasy';
      userTurns?: string[];
      expectedWordCount?: number;
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

    // NEW: Clear integrity status
    integrityStatus: {
      status: 'PASS' | 'WARNING' | 'FAIL';
      message: string;
      recommendation: string;
    };
  }> {
    const age = metadata.childAge || 10;
    const isCollaborative = metadata.isCollaborativeStory || false;

    // Step 1: Academic Integrity Check
    const integrityAnalysis = await this.performIntegrityAnalysis(
      content,
      metadata
    );

    // Step 2: Educational Content Assessment
    const contentToAssess =
      isCollaborative && metadata.userTurns
        ? metadata.userTurns.join('\n\n')
        : content;

    const educationalAssessment = await this.performEducationalAssessment(
      contentToAssess,
      content,
      metadata
    );

    // Step 3: Progress Analysis
    const progressTracking = metadata.previousAttempts
      ? this.analyzeProgress(
          educationalAssessment.categoryScores,
          metadata.previousAttempts
        )
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

    // Step 6: Get Clear Integrity Status
    const integrityStatus = this.getIntegrityAssessment(integrityAnalysis);

    return {
      overallScore: educationalAssessment.overallScore,
      categoryScores: educationalAssessment.categoryScores,
      integrityAnalysis,
      educationalFeedback,
      progressTracking,
      recommendations,
      integrityStatus,
    };
  }

  // PLAGIARISM DETECTION METHODS
  static async checkPlagiarism(
    content: string,
    metadata?: {
      childAge?: number;
      expectedGenre?: string;
      isCreativeWriting?: boolean;
    }
  ): Promise<{
    overallScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    detailedAnalysis: {
      semanticSimilarity: number;
      structuralAnalysis: number;
      contentAuthenticity: number;
      linguisticFingerprint: number;
    };
    violations: Array<any>;
    recommendations: string[];
    educationalFeedback: string;
  }> {
    const violations: Array<any> = [];
    let totalDeductions = 0;

    // 1. EXACT MATCH DETECTION
    const exactMatches = this.detectExactMatches(content);
    violations.push(...exactMatches.violations);
    totalDeductions += exactMatches.deductions;

    // 2. SEMANTIC SIMILARITY ANALYSIS
    const semanticAnalysis = await this.analyzeSemantic(content, metadata);
    violations.push(...semanticAnalysis.violations);
    totalDeductions += semanticAnalysis.deductions;

    // 3. STRUCTURAL PATTERN ANALYSIS
    const structuralAnalysis = this.analyzeStructuralPatterns(
      content,
      metadata
    );
    violations.push(...structuralAnalysis.violations);
    totalDeductions += structuralAnalysis.deductions;

    // 4. LINGUISTIC FINGERPRINTING
    const linguisticAnalysis = this.analyzeLinguisticFingerprint(
      content,
      metadata
    );
    violations.push(...linguisticAnalysis.violations);
    totalDeductions += linguisticAnalysis.deductions;

    // 5. CONTENT AUTHENTICITY ANALYSIS
    const authenticityAnalysis = this.analyzeContentAuthenticity(
      content,
      metadata
    );
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
    const { recommendations, educationalFeedback } =
      this.generatePlagiarismEducationalResponse(
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

  // EDUCATIONAL ASSESSMENT METHODS
  private static async performIntegrityAnalysis(
    content: string,
    metadata: any
  ) {
    // Run both plagiarism and AI detection in parallel
    const [plagiarismResult, aiDetectionResult] = await Promise.all([
      this.checkPlagiarism(content, {
        childAge: metadata.childAge,
        expectedGenre: metadata.expectedGenre,
        isCreativeWriting: true,
      }),
      AIDetector.detectAIContent(content, {
        childAge: metadata.childAge,
        expectedGenre: metadata.expectedGenre,
        isCreativeWriting: true,
      }),
    ]);

    // FIXED: Weighted calculation that prioritizes AI detection for low scores
    const plagiarismWeight = aiDetectionResult.overallScore < 40 ? 0.3 : 0.6; // Reduce plagiarism weight if high AI risk
    const aiDetectionWeight = aiDetectionResult.overallScore < 40 ? 0.7 : 0.4; // Increase AI weight if high AI risk

    const originalityScore = Math.round(
      plagiarismResult.overallScore * plagiarismWeight +
        aiDetectionResult.overallScore * aiDetectionWeight
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

  // Fix the integrity risk calculation to prioritize AI detection
  private static calculateIntegrityRisk(
    plagiarismRisk: string,
    aiLikelihood: string,
    originalityScore: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    // AI detection takes priority - this fixes contradictions
    if (aiLikelihood === 'very_high') return 'critical';
    if (aiLikelihood === 'high') return 'high';
    if (aiLikelihood === 'medium' && originalityScore < 70) return 'high';
    if (aiLikelihood === 'medium') return 'medium';

    // Then check plagiarism
    if (plagiarismRisk === 'critical') return 'critical';
    if (plagiarismRisk === 'high') return 'high';
    if (plagiarismRisk === 'medium') return 'medium';

    // Finally check overall originality
    if (originalityScore < 50) return 'critical';
    if (originalityScore < 70) return 'high';
    if (originalityScore < 85) return 'medium';

    return 'low';
  }

  // HUMAN-FIRST INTEGRITY ASSESSMENT - Always PASS for children, provide data for mentors
  static getIntegrityAssessment(integrityAnalysis: any): {
    status: 'PASS' | 'WARNING' | 'FAIL';
    message: string;
    recommendation: string;
    mentorNote?: string; // NEW: For mentor/admin guidance
    adminFlags?: string[]; // NEW: For admin dashboard
  } {
    const { aiDetectionResult, integrityRisk, originalityScore } =
      integrityAnalysis;

    // ALWAYS PASS for children - let mentors handle concerns through comments
    const adminFlags = [];
    let mentorNote = '';

    // Collect data for mentor/admin review
    if (
      aiDetectionResult.likelihood === 'very_high' ||
      aiDetectionResult.likelihood === 'high'
    ) {
      adminFlags.push('AI_DETECTION_HIGH');
      mentorNote += `🤖 High AI detection confidence (${aiDetectionResult.likelihood}). `;
    }

    if (integrityRisk === 'critical' || integrityRisk === 'high') {
      adminFlags.push('INTEGRITY_CONCERNS');
      mentorNote += `⚠️ Integrity concerns detected (${integrityRisk} risk). `;
    }

    if (originalityScore < 30) {
      adminFlags.push('LOW_ORIGINALITY');
      mentorNote += `📝 Low originality score (${originalityScore}%). `;
    }

    // Always provide encouraging message to child, but include mentor guidance
    if (adminFlags.length > 0) {
      mentorNote += `👨‍🏫 MENTOR: Please review this story and provide guidance through comments.`;

      return {
        status: 'PASS', // Always pass for children
        message: '✅ STORY COMPLETED SUCCESSFULLY',
        recommendation:
          'Great work completing your story! Your mentor may provide additional feedback.',
        mentorNote,
        adminFlags,
      };
    }

    return {
      status: 'PASS',
      message: '✅ EXCELLENT CREATIVE WRITING',
      recommendation:
        'Outstanding original work! Keep up the great creativity.',
    };
  }

  private static async performEducationalAssessment(
    contentToAssess: string,
    fullStory: string,
    metadata: any
  ) {
    const age = metadata.childAge || 10;
    const ageGroup = age <= 8 ? '6-8' : age <= 12 ? '9-12' : '13+';

    console.log('🎯 Starting educational assessment...');
    console.log('📊 Content length:', contentToAssess.length, 'characters');
    console.log('👶 Age group:', ageGroup);

    // Comprehensive educational analysis - NO FALLBACKS
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
      ageAppropriateness: await this.assessAgeAppropriateness(
        contentToAssess,
        age
      ),
      readingLevel: this.calculateReadingLevel(contentToAssess),
    };

    console.log('📈 Assessment scores calculated:', analysis);

    // Enhanced weighted overall score calculation
    const weights = {
      grammar: 0.15,
      vocabulary: 0.12,
      creativity: 0.15,
      structure: 0.12,
      characterDevelopment: 0.1,
      plotDevelopment: 0.12,
      descriptiveWriting: 0.08,
      sensoryDetails: 0.06,
      plotLogic: 0.05,
      causeEffect: 0.05,
      problemSolving: 0.05,
      themeRecognition: 0.05,
      ageAppropriateness: 0.1,
    };

    const overallScore = Math.round(
      Object.entries(weights).reduce((sum, [key, weight]) => {
        const score = analysis[key as keyof typeof analysis] as number;
        if (typeof score !== 'number' || isNaN(score)) {
          throw new Error(`Assessment failed for ${key}: received ${score}`);
        }
        return sum + score * weight;
      }, 0)
    );

    console.log('🎯 Final overall score:', overallScore);

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

  // Updated Educational Feedback Generation - ENHANCED FOR DETAILED FEEDBACK
  private static generateComprehensiveFeedback(
    educationalAssessment: any,
    integrityAnalysis: any,
    age: number,
    isCollaborative: boolean
  ) {
    const strengths: string[] = [];
    const improvements: string[] = [];
    const nextSteps: string[] = [];

    // PRIORITY: Address AI detection first
    if (
      integrityAnalysis.aiDetectionResult.likelihood === 'very_high' ||
      integrityAnalysis.aiDetectionResult.likelihood === 'high'
    ) {
      improvements.unshift(
        'This content appears to be AI-generated. Focus on authentic, original writing.'
      );
      nextSteps.unshift(
        'Write about your own experiences and use your natural voice.'
      );

      // Override teacher comment for AI detection
      const teacherComment =
        age <= 8
          ? "This story looks like it was written by a computer. Let's practice writing your own stories using your imagination!"
          : 'This content appears to be AI-generated. Academic integrity requires authentic, original work. Please rewrite using only your own ideas and voice.';

      const encouragement =
        'Remember, the best stories come from your own imagination and experiences. Keep practicing authentic writing!';

      return {
        strengths: ['Technical writing quality'], // Minimal praise for AI content
        improvements: improvements.slice(0, 3),
        nextSteps: nextSteps.slice(0, 3),
        teacherComment,
        encouragement,
      };
    }

    // ENHANCED: Generate detailed, specific feedback for all categories
    // Analyze strengths with specific details
    Object.entries(educationalAssessment.categoryScores).forEach(
      ([category, score]) => {
        if (typeof score === 'number' && score >= 85) {
          strengths.push(this.getCategoryStrengthMessage(category, age));
        } else if (typeof score === 'number' && score >= 70) {
          // Good performance - still mention as strength
          strengths.push(this.getCategoryGoodMessage(category, age));
        } else if (typeof score === 'number' && score < 70) {
          improvements.push(this.getCategoryImprovementMessage(category, age));
        }
      }
    );

    // ENHANCED: Add specific vocabulary analysis
    if (educationalAssessment.categoryScores.vocabulary >= 80) {
      strengths.push(
        'Your vocabulary choices show maturity and creativity. You use words that paint vivid pictures for your readers.'
      );
    } else if (educationalAssessment.categoryScores.vocabulary < 60) {
      improvements.push(
        'Try using more descriptive and varied vocabulary. Replace simple words with more interesting alternatives.'
      );
      nextSteps.push(
        'Keep a vocabulary journal and try to use one new word in each story you write.'
      );
    }

    // ENHANCED: Add specific grammar feedback
    if (educationalAssessment.categoryScores.grammar >= 85) {
      strengths.push(
        'Your grammar and sentence structure are excellent! You show strong command of language rules.'
      );
    } else if (educationalAssessment.categoryScores.grammar < 70) {
      improvements.push(
        'Focus on sentence structure and grammar. Read your story aloud to catch errors.'
      );
      nextSteps.push(
        'Practice writing shorter sentences first, then gradually build complexity.'
      );
    }

    // ENHANCED: Add creativity-specific feedback
    if (educationalAssessment.categoryScores.creativity >= 80) {
      strengths.push(
        'Your imagination shines through brilliantly! You create unique scenarios and original ideas.'
      );
    } else if (educationalAssessment.categoryScores.creativity < 65) {
      improvements.push(
        'Let your imagination run wild! Try adding unexpected twists or magical elements to your stories.'
      );
      nextSteps.push(
        'Write about impossible things - what if animals could talk? What if you had superpowers?'
      );
    }

    // ENHANCED: Add character development feedback
    if (educationalAssessment.categoryScores.characterDevelopment >= 75) {
      strengths.push(
        'Your characters feel real and interesting. Readers can connect with them emotionally.'
      );
    } else if (educationalAssessment.categoryScores.characterDevelopment < 60) {
      improvements.push(
        'Develop your characters more deeply. Give them unique personalities, fears, and dreams.'
      );
      nextSteps.push(
        'Create character profiles before writing - what does your character love? What scares them?'
      );
    }

    // ENHANCED: Add plot development feedback
    if (educationalAssessment.categoryScores.plotDevelopment >= 75) {
      strengths.push(
        'Your story has an engaging plot with clear beginning, middle, and end. The events flow naturally.'
      );
    } else if (educationalAssessment.categoryScores.plotDevelopment < 60) {
      improvements.push(
        'Work on story structure. Make sure your story has a clear problem and solution.'
      );
      nextSteps.push(
        "Plan your story with: What happens first? What's the main problem? How is it solved?"
      );
    }

    // ENHANCED: Add descriptive writing feedback
    if (educationalAssessment.categoryScores.descriptiveWriting >= 75) {
      strengths.push(
        'You paint beautiful pictures with words! Your descriptions help readers visualize the story.'
      );
    } else if (educationalAssessment.categoryScores.descriptiveWriting < 60) {
      improvements.push(
        "Add more descriptive details. Help readers see, hear, and feel what's happening in your story."
      );
      nextSteps.push(
        'Use the five senses - what does your story world look, sound, smell, taste, and feel like?'
      );
    }

    // Ensure we have enough content
    if (strengths.length === 0) {
      strengths.push(
        'You completed your story and showed creativity in your writing!'
      );
      strengths.push(
        'Your effort and imagination are the foundation of good storytelling.'
      );
    }

    if (improvements.length === 0) {
      improvements.push(
        'Continue practicing to develop your unique writing voice.'
      );
      improvements.push(
        'Try experimenting with different story genres and styles.'
      );
    }

    if (nextSteps.length === 0) {
      nextSteps.push('Keep writing regularly to improve your skills.');
      nextSteps.push(
        'Read books in different genres to inspire your own writing.'
      );
      nextSteps.push(
        'Share your stories with family and friends for feedback.'
      );
    }

    // Generate comprehensive teacher comment
    const teacherComment = this.generateDetailedTeacherComment(
      educationalAssessment,
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

    // Generate specific next steps
    nextSteps.push(
      ...this.generateDetailedNextSteps(educationalAssessment, age)
    );

    return {
      strengths: strengths.slice(0, 6), // More strengths
      improvements: improvements.slice(0, 4), // More improvement areas
      nextSteps: nextSteps.slice(0, 5), // More next steps
      teacherComment,
      encouragement,
    };
  }

  private static getCategoryStrengthMessage(
    category: string,
    age: number
  ): string {
    const messages = {
      grammar:
        age <= 8
          ? 'Great job with your sentences!'
          : 'Excellent grammar and sentence structure!',
      vocabulary:
        age <= 8
          ? 'You use wonderful words!'
          : 'Impressive vocabulary choices!',
      creativity: 'Your imagination shines through!',
      structure: 'Well-organized story structure!',
      characterDevelopment: 'Your characters feel real and interesting!',
      plotDevelopment: 'Engaging and well-developed plot!',
      descriptiveWriting: 'Beautiful descriptive details!',
      sensoryDetails: 'Great use of sensory descriptions!',
      plotLogic: 'Your story makes logical sense!',
      causeEffect: 'Good understanding of cause and effect!',
      problemSolving: 'Creative problem-solving skills!',
      themeRecognition: 'Strong thematic elements!',
      ageAppropriateness: 'Perfect content for your age!',
    };

    return (
      messages[category as keyof typeof messages] || 'Great work in this area!'
    );
  }

  private static getCategoryImprovementMessage(
    category: string,
    age: number
  ): string {
    const messages = {
      grammar:
        age <= 8
          ? 'Practice writing complete sentences'
          : 'Focus on grammar and punctuation',
      vocabulary: 'Try using more varied and interesting words',
      creativity: 'Let your imagination run wild with unique ideas',
      structure:
        'Work on organizing your story with clear beginning, middle, and end',
      characterDevelopment:
        'Develop your characters by describing their feelings and motivations',
      plotDevelopment: 'Build more excitement and conflict in your story',
      descriptiveWriting: 'Add more details to help readers picture your story',
      sensoryDetails:
        'Include what characters see, hear, smell, taste, and feel',
      plotLogic: 'Make sure your story events make sense together',
      causeEffect: 'Show how one event leads to another',
      problemSolving: 'Include challenges for your characters to overcome',
      themeRecognition: 'Think about the message or lesson in your story',
      ageAppropriateness: 'Choose topics that match your age and interests',
    };

    return (
      messages[category as keyof typeof messages] ||
      'Focus on improving this area'
    );
  }

  private static generateTeacherComment(
    overallScore: number,
    strengths: string[],
    improvements: string[],
    age: number,
    isCollaborative: boolean
  ): string {
    const storyType = isCollaborative ? 'collaborative story' : 'story';

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
      return 'I love how original and creative your story is! Keep using your unique voice.';
    } else if (educationalScore >= 80) {
      return 'Your writing skills are really developing well! Keep practicing and stay creative.';
    } else {
      return age <= 8
        ? 'Every story you write helps you become a better writer! Keep using your imagination!'
        : "You're on the right track! Keep practicing and don't be afraid to let your creativity shine.";
    }
  }

  // NEW: Enhanced helper methods for detailed feedback
  private static getCategoryGoodMessage(category: string, age: number): string {
    const messages: { [key: string]: string } = {
      grammar:
        'Your grammar is generally good with room for minor improvements.',
      vocabulary: 'You use good vocabulary choices throughout your story.',
      creativity: 'You demonstrate creative thinking in your storytelling.',
      structure: 'Your story has good organization overall.',
      characterDevelopment:
        'Your characters are well-developed and interesting.',
      plotDevelopment: 'Your plot development is solid and engaging.',
      descriptiveWriting:
        'You include good descriptive details in your writing.',
      sensoryDetails: 'You incorporate sensory elements effectively.',
      plotLogic: 'Your story events generally make sense together.',
      causeEffect: 'You show understanding of how events connect.',
      problemSolving: 'Your characters face and overcome challenges well.',
      themeRecognition: 'You demonstrate good understanding of story themes.',
      ageAppropriateness: 'Your content is well-suited for your age level.',
    };

    return messages[category] || 'Good work in this area!';
  }

  private static generateDetailedTeacherComment(
    educationalAssessment: any,
    strengths: string[],
    improvements: string[],
    age: number,
    isCollaborative: boolean
  ): string {
    const storyType = isCollaborative ? 'collaborative story' : 'story';
    const overallScore = educationalAssessment.overallScore;

    // Create a more detailed, personalized comment
    let comment = '';

    if (overallScore >= 90) {
      comment = `Outstanding work on your ${storyType}! This is exceptional writing that demonstrates mastery across multiple areas. `;
    } else if (overallScore >= 80) {
      comment = `Excellent ${storyType}! You're showing strong writing skills and creativity. `;
    } else if (overallScore >= 70) {
      comment = `Good work on your ${storyType}! I can see your effort and developing skills. `;
    } else if (overallScore >= 60) {
      comment = `Nice effort on your ${storyType}! You have the foundation of good storytelling. `;
    } else {
      comment =
        age <= 8
          ? `Great job working on your ${storyType}! Every story you write helps you improve. `
          : `This ${storyType} shows your potential as a writer. `;
    }

    // Add specific strength highlights
    if (strengths.length > 0) {
      comment += `What I particularly enjoyed: ${strengths.slice(0, 2).join(' ')} `;
    }

    // Add improvement guidance
    if (improvements.length > 0) {
      comment += `To make your next story even better, focus on ${improvements.slice(0, 2).join(' and ')}. `;
    }

    // Add encouraging closing
    if (age <= 8) {
      comment += 'Keep writing and letting your imagination soar!';
    } else {
      comment +=
        'Continue developing your unique voice and storytelling style.';
    }

    return comment;
  }

  private static generateDetailedNextSteps(
    educationalAssessment: any,
    age: number
  ): string[] {
    const nextSteps: string[] = [];
    const scores = educationalAssessment.categoryScores;

    // Generate specific next steps based on assessment results
    if (scores.vocabulary < 70) {
      nextSteps.push(
        'Read diverse books to discover new vocabulary and keep a word journal'
      );
      nextSteps.push(
        'Replace simple words with more descriptive alternatives in your writing'
      );
    }

    if (scores.descriptiveWriting < 70) {
      nextSteps.push('Practice describing scenes using all five senses');
      nextSteps.push(
        'Write detailed character descriptions before starting your stories'
      );
    }

    if (scores.characterDevelopment < 70) {
      nextSteps.push('Create character backstories and personality profiles');
      nextSteps.push(
        'Give your characters specific goals, fears, and unique traits'
      );
    }

    if (scores.plotDevelopment < 70) {
      nextSteps.push('Plan your stories with clear conflicts and resolutions');
      nextSteps.push(
        'Try the three-act structure: setup, conflict, resolution'
      );
    }

    if (scores.creativity < 70) {
      nextSteps.push("Experiment with 'what if' scenarios to spark new ideas");
      nextSteps.push(
        'Try writing in different genres to explore various creative approaches'
      );
    }

    // Always include general improvement steps
    nextSteps.push(
      'Read your favorite books and analyze what makes them engaging'
    );
    nextSteps.push(
      'Share your stories with others for feedback and encouragement'
    );

    return nextSteps;
  }

  private static generateNextSteps(
    improvements: string[],
    age: number
  ): string[] {
    const steps: string[] = [];

    if (improvements.some((imp) => imp.includes('grammar'))) {
      steps.push(
        age <= 8
          ? 'Read your story out loud to check if it sounds right'
          : 'Practice writing simple sentences before trying complex ones'
      );
    }

    if (improvements.some((imp) => imp.includes('vocabulary'))) {
      steps.push(
        'Try learning one new interesting word each day and use it in your writing'
      );
    }

    if (improvements.some((imp) => imp.includes('creativity'))) {
      steps.push("Think about 'what if' questions to spark new story ideas");
    }

    if (improvements.some((imp) => imp.includes('structure'))) {
      steps.push(
        'Practice telling stories with a clear beginning, middle, and end'
      );
    }

    if (improvements.some((imp) => imp.includes('characters'))) {
      steps.push(
        'Give your characters names, feelings, and interesting personalities'
      );
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
    if (
      integrityAnalysis.integrityRisk === 'high' ||
      integrityAnalysis.integrityRisk === 'critical'
    ) {
      immediate.push(
        'Focus on writing completely original content using only your own ideas'
      );
      immediate.push(
        'Avoid copying text from any sources - books, websites, or AI tools'
      );
    }

    // Educational recommendations
    if (educationalAssessment.categoryScores.creativity < 70) {
      immediate.push('Try writing about your own experiences and dreams');
      practiceExercises.push(
        'Write a story about an ordinary object that becomes magical'
      );
    }

    if (educationalAssessment.categoryScores.descriptiveWriting < 70) {
      immediate.push(
        'Add more sensory details - what do characters see, hear, smell, feel?'
      );
      practiceExercises.push('Describe your bedroom using all five senses');
    }

    if (educationalAssessment.categoryScores.characterDevelopment < 70) {
      immediate.push('Give your characters more personality and emotions');
      practiceExercises.push(
        'Write about a character who is the opposite of you'
      );
    }

    if (educationalAssessment.categoryScores.plotDevelopment < 70) {
      immediate.push('Create more exciting conflicts and resolutions');
      practiceExercises.push(
        'Write a story where the main character faces three challenges'
      );
    }

    // Long-term development
    longTerm.push('Read diverse stories to expand your writing inspiration');
    longTerm.push('Keep a writing journal to practice daily');

    if (age >= 10) {
      longTerm.push(
        'Join a writing club or find writing buddies to share stories with'
      );
    }

    // Progress-based recommendations
    if (progressTracking?.scoreChange && progressTracking.scoreChange > 0) {
      immediate.push(
        'Great improvement! Continue with the same writing strategies'
      );
    }

    return {
      immediate: immediate.slice(0, 3),
      longTerm: longTerm.slice(0, 3),
      practiceExercises: practiceExercises.slice(0, 3),
    };
  }

  private static analyzeProgress(
    currentScores: any,
    previousAttempts: any[]
  ): any {
    if (!previousAttempts.length) return undefined;

    const lastAttempt = previousAttempts[previousAttempts.length - 1];
    const improvements: string[] = [];
    const areasImproved: string[] = [];

    let totalImprovement = 0;
    let categoriesImproved = 0;

    Object.entries(currentScores).forEach(([category, currentScore]) => {
      if (
        typeof currentScore === 'number' &&
        lastAttempt.categoryScores?.[category]
      ) {
        const previousScore = lastAttempt.categoryScores[category];
        const improvement = currentScore - previousScore;

        if (improvement > 5) {
          areasImproved.push(category);
          categoriesImproved++;
        }

        totalImprovement += improvement;
      }
    });

    if (categoriesImproved > 0) {
      improvements.push(
        `Improved in ${categoriesImproved} areas since last assessment`
      );
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

  private static generatePlagiarismEducationalResponse(
    violations: any[],
    score: number,
    metadata?: any
  ) {
    const recommendations: string[] = [];
    const ageGroup =
      metadata?.childAge <= 8
        ? 'young'
        : metadata?.childAge <= 12
          ? 'middle'
          : 'older';

    if (score < 50) {
      if (ageGroup === 'young') {
        recommendations.push(
          "This story has parts that look like they came from somewhere else. Let's write your own story using your imagination!"
        );
        recommendations.push(
          'Try writing about things you know - your pets, friends, or favorite games.'
        );
      } else {
        recommendations.push(
          'Several sections appear to be copied from other sources. Focus on creating original content.'
        );
        recommendations.push(
          'Use your own experiences and imagination to make the story uniquely yours.'
        );
      }
    } else if (score < 70) {
      recommendations.push(
        'Some parts of your story might be influenced by other sources. Try to write more in your own voice.'
      );
      recommendations.push(
        'Add personal details and unique ideas to make your story more original.'
      );
    } else {
      recommendations.push(
        'Great original writing! Keep using your own words and creative ideas.'
      );
    }

    // Category-specific feedback
    const violationTypes = violations.map((v) => v.type);
    if (violationTypes.includes('exact_match')) {
      recommendations.push(
        "Avoid copying exact phrases from books, movies, or websites you've read."
      );
    }
    if (violationTypes.includes('structure')) {
      recommendations.push(
        'Try varying your sentence lengths and paragraph structures to make your writing more natural.'
      );
    }

    const educationalFeedback = this.generatePlagiarismEducationalFeedback(
      score,
      violations,
      ageGroup
    );

    return { recommendations, educationalFeedback };
  }

  private static generatePlagiarismEducationalFeedback(
    score: number,
    violations: any[],
    ageGroup: string
  ): string {
    if (score >= 90) {
      return 'Excellent original writing! Your story shows creativity and authentic voice. Keep developing your unique writing style.';
    } else if (score >= 70) {
      return 'Good original content with room for improvement. Focus on making your voice even more unique and personal.';
    } else if (score >= 50) {
      return 'Your story shows some originality, but some parts seem borrowed from other sources. Practice writing more from your own imagination.';
    } else {
      if (ageGroup === 'young') {
        return "Let's work on writing your very own story! Think about your favorite things and create something that's all yours.";
      } else {
        return "This story contains significant copied content. Let's focus on developing your original writing skills and creative voice.";
      }
    }
  }

  // Assessment methods implementation
  private static async assessGrammar(
    content: string,
    ageGroup: string
  ): Promise<number> {
    if (!content || content.trim().length < 10) {
      throw new Error('Content too short for grammar assessment');
    }

    const sentences = content
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 5);

    if (sentences.length === 0) {
      throw new Error('No valid sentences found for grammar assessment');
    }

    let score = 85; // Start with a good baseline
    let errorCount = 0;

    // Age-appropriate grammar error detection
    const grammarRules = this.getGrammarRulesForAge(ageGroup);

    grammarRules.forEach((rule) => {
      const violations = content.match(rule.pattern);
      if (violations) {
        errorCount += violations.length;
        score -= violations.length * rule.penalty;
      }
    });

    // Sentence structure analysis
    const structureScore = this.analyzesentenceStructure(sentences, ageGroup);
    score = score * 0.7 + structureScore * 0.3;

    // Ensure minimum score based on effort and content length
    const minScore = ageGroup === '6-8' ? 60 : ageGroup === '9-12' ? 65 : 70;

    return Math.max(minScore, Math.min(100, Math.round(score)));
  }

  private static getGrammarRulesForAge(ageGroup: string) {
    const baseRules = [
      {
        pattern: /\bi is\b/gi,
        penalty: 8,
        description: 'Subject-verb disagreement',
      },
      {
        pattern: /\bme and \w+ (is|are|was|were)/gi,
        penalty: 6,
        description: 'Incorrect pronoun usage',
      },
      {
        pattern: /\bshould of\b/gi,
        penalty: 10,
        description: 'Should have vs should of',
      },
      {
        pattern: /\byour going\b/gi,
        penalty: 8,
        description: "You're vs your confusion",
      },
      {
        pattern: /\bits raining\b/gi,
        penalty: 5,
        description: 'Missing apostrophe in contractions',
      },
    ];

    if (ageGroup === '6-8') {
      return baseRules.filter((rule) => rule.penalty <= 8);
    } else if (ageGroup === '9-12') {
      return baseRules.concat([
        {
          pattern: /\bwho's\b.*\bcar/gi,
          penalty: 7,
          description: "Whose vs who's confusion",
        },
        {
          pattern: /\bthere car\b/gi,
          penalty: 8,
          description: 'Their vs there confusion',
        },
      ]);
    } else {
      return baseRules.concat([
        {
          pattern: /\bwho's\b.*\bcar/gi,
          penalty: 7,
          description: "Whose vs who's confusion",
        },
        {
          pattern: /\bthere car\b/gi,
          penalty: 8,
          description: 'Their vs there confusion',
        },
        {
          pattern: /\bwhom\b/gi,
          penalty: -5,
          description: 'Bonus for correct whom usage',
        },
      ]);
    }
  }

  private static analyzesentenceStructure(
    sentences: string[],
    ageGroup: string
  ): number {
    let score = 100;

    const simpleSentences = sentences.filter(
      (s) => !s.includes(',') && !s.includes('and')
    ).length;
    const complexSentences = sentences.filter(
      (s) => s.includes(',') || s.includes('because') || s.includes('although')
    ).length;

    const simpleRatio = simpleSentences / sentences.length;
    const complexRatio = complexSentences / sentences.length;

    const expectations = {
      '6-8': {
        simpleMin: 0.4,
        simpleMax: 0.8,
        complexMin: 0.1,
        complexMax: 0.4,
      },
      '9-12': {
        simpleMin: 0.2,
        simpleMax: 0.6,
        complexMin: 0.3,
        complexMax: 0.7,
      },
      '13+': {
        simpleMin: 0.1,
        simpleMax: 0.4,
        complexMin: 0.5,
        complexMax: 0.9,
      },
    };

    const expected = expectations[ageGroup as keyof typeof expectations];

    if (simpleRatio < expected.simpleMin || simpleRatio > expected.simpleMax) {
      score -= 15;
    }
    if (
      complexRatio < expected.complexMin ||
      complexRatio > expected.complexMax
    ) {
      score -= 15;
    }

    return Math.max(0, score);
  }

  private static async assessVocabulary(
    content: string,
    ageGroup: string
  ): Promise<number> {
    const words = content
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 2);
    const uniqueWords = new Set(words);

    let score = 100;

    // Vocabulary diversity (Type-Token Ratio)
    const diversity = uniqueWords.size / words.length;
    const expectedDiversity = {
      '6-8': { min: 0.4, max: 0.7 },
      '9-12': { min: 0.5, max: 0.8 },
      '13+': { min: 0.6, max: 0.9 },
    };

    const expected =
      expectedDiversity[ageGroup as keyof typeof expectedDiversity];
    if (diversity < expected.min) {
      score -= (expected.min - diversity) * 100;
    } else if (diversity > expected.max) {
      score -= (diversity - expected.max) * 50;
    }

    // Advanced vocabulary usage
    const advancedWords = this.identifyAdvancedVocabulary(words, ageGroup);
    const advancedRatio = advancedWords.length / words.length;

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

  private static identifyAdvancedVocabulary(
    words: string[],
    ageGroup: string
  ): string[] {
    const vocabularyLevels = {
      '6-8': ['beautiful', 'adventure', 'mysterious', 'dangerous', 'enormous'],
      '9-12': [
        'magnificent',
        'extraordinary',
        'catastrophic',
        'fascinating',
        'tremendous',
      ],
      '13+': [
        'exceptional',
        'unprecedented',
        'sophisticated',
        'revolutionary',
        'phenomenal',
      ],
    };

    const expectedLevel =
      vocabularyLevels[ageGroup as keyof typeof vocabularyLevels];
    return words.filter((word) => expectedLevel.includes(word));
  }

  private static identifyDescriptiveVocabulary(words: string[]): string[] {
    const descriptiveWords = [
      'bright',
      'dark',
      'colorful',
      'shiny',
      'dull',
      'vivid',
      'pale',
      'loud',
      'quiet',
      'silent',
      'noisy',
      'melodic',
      'harsh',
      'soft',
      'rough',
      'smooth',
      'bumpy',
      'silky',
      'coarse',
      'sweet',
      'sour',
      'bitter',
      'salty',
      'delicious',
      'awful',
      'fragrant',
      'stinky',
      'fresh',
      'musty',
      'aromatic',
    ];

    return words.filter((word) => descriptiveWords.includes(word));
  }

  private static async assessSpelling(content: string): Promise<number> {
    // Simple spelling check: returns 100 for now
    // You can implement a more sophisticated spelling checker here
    return 100;
  }

  private static async assessCreativity(
    userContent: string,
    fullStory: string
  ): Promise<number> {
    if (!userContent || userContent.trim().length < 20) {
      throw new Error('Content too short for creativity assessment');
    }

    let score = 80; // Start with good baseline for creative writing

    // Originality assessment
    const originalityScore = this.assessOriginality(userContent);
    score = score * 0.4 + originalityScore * 0.6;

    // Creative elements
    const creativeElements = this.identifyCreativeElements(fullStory);
    const creativityBonus = Math.min(25, creativeElements.length * 4);
    score += creativityBonus;

    // Imaginative scenarios
    const imaginationScore = this.assessImagination(fullStory);
    score = score * 0.8 + imaginationScore * 0.2;

    // Bonus for story length and complexity
    const wordCount = fullStory.split(/\s+/).length;
    if (wordCount > 100) score += 5;
    if (wordCount > 200) score += 5;
    if (wordCount > 300) score += 5;

    // Ensure minimum creativity score for any story attempt
    return Math.max(65, Math.min(100, Math.round(score)));
  }

  private static assessOriginality(content: string): number {
    const clichés = [
      'once upon a time',
      'happily ever after',
      'dark and stormy night',
      'suddenly',
      'all of a sudden',
      'the end',
    ];

    let score = 100;
    clichés.forEach((cliché) => {
      if (content.toLowerCase().includes(cliché)) {
        score -= 10;
      }
    });

    return Math.max(0, score);
  }

  private static identifyCreativeElements(story: string): string[] {
    const elements = [];
    const content = story.toLowerCase();

    if (/\b(magic|wizard|dragon|fairy|unicorn|spell)\b/.test(content)) {
      elements.push('fantasy');
    }

    if (
      /\b(space|alien|robot|future|time travel|underwater|floating)\b/.test(
        content
      )
    ) {
      elements.push('unique_setting');
    }

    if (
      /\b(talking animal|superhero|inventor|explorer|detective)\b/.test(content)
    ) {
      elements.push('interesting_characters');
    }

    if (/\b(surprise|twist|unexpected|reveal|secret|hidden)\b/.test(content)) {
      elements.push('plot_twist');
    }

    return elements;
  }

  private static assessImagination(story: string): number {
    let score = 70;

    if (
      /\b(invent|create|discover|solve|figure out)\b/.test(story.toLowerCase())
    ) {
      score += 15;
    }

    const uniqueDescriptions = story.match(
      /\b\w+(?:-\w+)*\s+(?:like|as)\s+\w+/g
    );
    if (uniqueDescriptions && uniqueDescriptions.length > 0) {
      score += Math.min(15, uniqueDescriptions.length * 3);
    }

    return Math.min(100, score);
  }

  private static async assessStructure(story: string): Promise<number> {
    const paragraphs = story
      .split(/\n\s*\n/)
      .filter((p) => p.trim().length > 20);
    let score = 100;

    const hasBeginning = this.hasStoryBeginning(story);
    const hasMiddle = paragraphs.length >= 2;
    const hasEnd = this.hasStoryEnding(story);

    if (!hasBeginning) score -= 25;
    if (!hasMiddle) score -= 25;
    if (!hasEnd) score -= 25;

    return Math.max(0, Math.round(score));
  }

  private static hasStoryBeginning(story: string): boolean {
    const firstSentence = story.split(/[.!?]/)[0].toLowerCase();
    const beginningPatterns = [
      /\b(one day|once|there was|in|at|when|long ago)\b/,
      /\b(my name is|i am|this is)\b/,
      /\b(it was|the)\b/,
    ];
    return beginningPatterns.some((pattern) => pattern.test(firstSentence));
  }

  private static hasStoryEnding(story: string): boolean {
    const lastSentences = story
      .split(/[.!?]/)
      .slice(-3)
      .join(' ')
      .toLowerCase();
    const endingPatterns = [
      /\b(the end|finally|in the end|at last|ever after)\b/,
      /\b(learned|realized|never forgot|remembered)\b/,
      /\b(happy|safe|home|peace)\b/,
    ];
    return endingPatterns.some((pattern) => pattern.test(lastSentences));
  }

  private static async assessCharacterDevelopment(
    story: string
  ): Promise<number> {
    let score = 100;
    const content = story.toLowerCase();

    const characters = this.identifyCharacters(story);
    if (characters.length === 0) score -= 30;
    else if (characters.length === 1) score -= 10;

    const hasPhysicalDescriptions =
      /\b(tall|short|brown hair|blue eyes|wore|dressed)\b/.test(content);
    const hasPersonalityTraits =
      /\b(kind|mean|brave|scared|funny|serious|smart|silly)\b/.test(content);
    const hasEmotions =
      /\b(happy|sad|angry|excited|worried|surprised|afraid)\b/.test(content);

    if (!hasPhysicalDescriptions) score -= 15;
    if (!hasPersonalityTraits) score -= 20;
    if (!hasEmotions) score -= 15;

    const hasCharacterGrowth = this.detectCharacterGrowth(story);
    if (hasCharacterGrowth) score += 10;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private static identifyCharacters(story: string): string[] {
    const characters: string[] = [];
    const words = story.split(/\s+/);

    words.forEach((word, index) => {
      if (/^[A-Z][a-z]+$/.test(word) && index > 0) {
        const prevWord = words[index - 1];
        if (!/[.!?]$/.test(prevWord)) {
          characters.push(word);
        }
      }
    });

    const content = story.toLowerCase();
    if (/\b(he|she|him|her|his|hers)\b/.test(content)) {
      characters.push('character');
    }
    if (
      /\b(mom|dad|mother|father|friend|teacher|brother|sister)\b/.test(content)
    ) {
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
    return growthPatterns.some((pattern) => pattern.test(story));
  }

  private static async assessPlotDevelopment(story: string): Promise<number> {
    let score = 100;
    const content = story.toLowerCase();

    const hasConflict = this.detectConflict(content);
    const hasResolution = this.detectResolution(content);
    const hasProgression = this.detectPlotProgression(story);
    const hasTension = this.detectTension(content);

    if (!hasConflict) score -= 25;
    if (!hasResolution) score -= 20;
    if (!hasProgression) score -= 25;
    if (!hasTension) score -= 15;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private static detectConflict(content: string): boolean {
    const conflictPatterns = [
      /\b(problem|trouble|difficult|challenge|struggle|fight|argue|disagree)\b/gi,
      /\b(lost|broken|missing|stolen|trapped|stuck|scared|worried)\b/gi,
      /\b(enemy|villain|monster|danger|threat|crisis)\b/gi,
    ];
    return conflictPatterns.some((pattern) => pattern.test(content));
  }

  private static detectResolution(content: string): boolean {
    const resolutionPatterns = [
      /\b(solved|fixed|found|saved|helped|won|succeeded|better|safe)\b/gi,
      /\b(finally|at last|in the end|eventually|after|then)\b/gi,
      /\b(happy|peaceful|calm|relieved|satisfied)\b/gi,
    ];
    return resolutionPatterns.some((pattern) => pattern.test(content));
  }

  private static detectPlotProgression(story: string): boolean {
    const paragraphs = story
      .split(/\n\s*\n/)
      .filter((p) => p.trim().length > 50);
    if (paragraphs.length < 2) return false;

    const timeMarkers = [
      'first',
      'then',
      'next',
      'after',
      'later',
      'finally',
      'meanwhile',
    ];
    const hasTimeProgression = timeMarkers.some((marker) =>
      story.toLowerCase().includes(marker)
    );

    const actionWords = story
      .toLowerCase()
      .match(/\b(ran|jumped|shouted|fought|escaped|chased)\b/g);
    const hasActionProgression = actionWords ? actionWords.length >= 2 : false;

    return hasTimeProgression || hasActionProgression;
  }

  private static detectTension(content: string): boolean {
    const tensionPatterns = [
      /\b(suddenly|unexpected|surprise|shock|gasp|scream)\b/gi,
      /\b(dangerous|scary|frightening|terrifying|mysterious)\b/gi,
      /\b(what if|will (?:he|she|i)|could (?:he|she|i))\b/gi,
    ];
    return tensionPatterns.some((pattern) => pattern.test(content));
  }

  private static async assessDescriptiveWriting(
    content: string
  ): Promise<number> {
    let score = 100;
    const words = content.split(/\W+/).filter((w) => w.length > 0);

    const adjectives = [
      'beautiful',
      'ugly',
      'bright',
      'dark',
      'colorful',
      'shiny',
      'dull',
      'big',
      'small',
      'huge',
      'tiny',
      'enormous',
      'gigantic',
      'miniature',
      'fast',
      'slow',
      'quick',
      'rapid',
      'swift',
      'sluggish',
      'loud',
      'quiet',
      'noisy',
      'silent',
      'deafening',
      'whispered',
    ];

    const descriptiveCount = words.filter((word) =>
      adjectives.includes(word.toLowerCase())
    ).length;
    const descriptiveRatio = descriptiveCount / words.length;

    if (descriptiveRatio < 0.03) {
      score -= 30;
    } else if (descriptiveRatio > 0.08) {
      score -= 10;
    } else {
      score += Math.min(20, descriptiveRatio * 500);
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private static async assessSensoryDetails(content: string): Promise<number> {
    let score = 100;
    const lowerContent = content.toLowerCase();

    const sensoryWords = {
      sight: [
        'saw',
        'looked',
        'watched',
        'bright',
        'dark',
        'colorful',
        'shiny',
        'sparkled',
      ],
      sound: [
        'heard',
        'listened',
        'loud',
        'quiet',
        'whispered',
        'shouted',
        'music',
        'noise',
      ],
      smell: [
        'smelled',
        'scent',
        'fragrant',
        'stinky',
        'fresh',
        'perfume',
        'aroma',
      ],
      taste: [
        'tasted',
        'sweet',
        'sour',
        'bitter',
        'salty',
        'delicious',
        'yummy',
        'flavor',
      ],
      touch: [
        'felt',
        'touched',
        'soft',
        'hard',
        'rough',
        'smooth',
        'warm',
        'cold',
        'bumpy',
      ],
    };

    const sensesUsed = Object.entries(sensoryWords).filter(([sense, words]) =>
      words.some((word) => lowerContent.includes(word))
    );

    const senseScore = (sensesUsed.length / 5) * 100;
    score = senseScore;

    const totalSensoryWords = Object.values(sensoryWords)
      .flat()
      .filter((word) => lowerContent.includes(word)).length;

    if (totalSensoryWords > 5) {
      score += Math.min(20, totalSensoryWords * 2);
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private static async assessPlotLogic(story: string): Promise<number> {
    let score = 100;

    const inconsistencies = this.detectLogicalInconsistencies(story);
    score -= inconsistencies.length * 10;

    const causeEffectScore = this.assessCauseEffectLogic(story);
    score = score * 0.7 + causeEffectScore * 0.3;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private static detectLogicalInconsistencies(story: string): string[] {
    const inconsistencies: string[] = [];
    const content = story.toLowerCase();

    if (
      content.includes('morning') &&
      content.includes('sunset') &&
      content.includes('same time')
    ) {
      inconsistencies.push('Time inconsistency detected');
    }

    if (content.includes('alone') && content.includes('they talked')) {
      inconsistencies.push('Character presence inconsistency');
    }

    return inconsistencies;
  }

  private static assessCauseEffectLogic(story: string): number {
    let score = 100;
    const causeEffectWords = [
      'because',
      'since',
      'so',
      'therefore',
      'as a result',
      'due to',
    ];
    const hasExplicitCausation = causeEffectWords.some((word) =>
      story.toLowerCase().includes(word)
    );

    if (hasExplicitCausation) {
      score += 20;
    }

    return Math.max(0, score);
  }

  private static async assessCauseEffect(story: string): Promise<number> {
    const causeEffectPairs = this.identifyCauseEffectPairs(story);
    const baseScore = Math.min(100, causeEffectPairs.length * 25);
    return baseScore;
  }

  private static identifyCauseEffectPairs(
    story: string
  ): Array<{ cause: string; effect: string }> {
    const pairs: Array<{ cause: string; effect: string }> = [];
    const sentences = story.split(/[.!?]+/).filter((s) => s.trim().length > 10);

    const patterns = [
      { cause: /rain/, effect: /wet|umbrella|inside/ },
      { cause: /hungry/, effect: /eat|food|kitchen/ },
      { cause: /tired/, effect: /sleep|rest|bed/ },
      { cause: /cold/, effect: /jacket|warm|fire/ },
      { cause: /dark/, effect: /light|flashlight|candle/ },
    ];

    sentences.forEach((sentence) => {
      patterns.forEach((pattern) => {
        if (
          pattern.cause.test(sentence.toLowerCase()) &&
          pattern.effect.test(sentence.toLowerCase())
        ) {
          pairs.push({
            cause: sentence.match(pattern.cause)?.[0] || '',
            effect: sentence.match(pattern.effect)?.[0] || '',
          });
        }
      });
    });

    return pairs;
  }

  private static async assessProblemSolving(story: string): Promise<number> {
    let score = 100;
    const content = story.toLowerCase();

    const problems = this.identifyProblems(content);
    if (problems.length === 0) score -= 40;

    const solutions = this.identifySolutions(content);
    if (solutions.length === 0) score -= 30;

    const problemSolutionRatio = Math.min(
      solutions.length / Math.max(problems.length, 1),
      1
    );
    score = score * problemSolutionRatio;

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
    problemPatterns.forEach((pattern) => {
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
    solutionPatterns.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) solutions.push(...matches);
    });

    return [...new Set(solutions)];
  }

  private static identifyCreativeSolutions(content: string): number {
    let creative = 0;

    if (/\b(invent|create|build|make|design)\b/.test(content)) creative++;
    if (/\b(clever|smart|brilliant|creative|unique)\b/.test(content))
      creative++;
    if (/\b(teamwork|together|help|cooperate)\b/.test(content)) creative++;
    if (/\b(think|brainstorm|imagine|wonder)\b/.test(content)) creative++;

    return creative;
  }

  private static async assessThemeRecognition(story: string): Promise<number> {
    const themes = this.identifyThemes(story);
    const baseScore = Math.min(100, themes.length * 30);
    return baseScore;
  }

  private static identifyThemes(story: string): string[] {
    const content = story.toLowerCase();
    const themes: string[] = [];

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

  private static async assessAgeAppropriateness(
    content: string,
    age: number
  ): Promise<number> {
    let score = 100;

    const inappropriateContent = this.checkInappropriateContent(content);
    score -= inappropriateContent * 20;

    const complexityScore = this.assessComplexityForAge(content, age);
    score = score * 0.6 + complexityScore * 0.4;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private static checkInappropriateContent(content: string): number {
    const inappropriatePatterns = [
      /\b(kill|death|murder|violence|blood|gun|weapon)\b/gi,
      /\b(hate|stupid|dumb|idiot)\b/gi,
      /\b(scary|terrifying|nightmare|horror)\b/gi,
    ];

    let violations = 0;
    inappropriatePatterns.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) violations += matches.length;
    });

    return violations;
  }

  private static calculateReadingLevel(content: string): string {
    const complexity = this.calculateTextComplexity(content);

    if (complexity < 0.3) return 'Beginner';
    if (complexity < 0.5) return 'Elementary';
    if (complexity < 0.7) return 'Intermediate';
    return 'Advanced';
  }

  private static calculateTextComplexity(content: string): number {
    const sentences = content
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 5);
    const words = content.split(/\W+/).filter((w) => w.length > 0);

    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord =
      words.reduce((sum, word) => sum + this.countSyllables(word), 0) /
      words.length;
    const complexWords =
      words.filter((word) => this.countSyllables(word) >= 3).length /
      words.length;

    // Combine metrics (0-1 scale)
    return avgWordsPerSentence / 20 + avgSyllablesPerWord / 3 + complexWords;
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

  private static assessComplexityForAge(content: string, age: number): number {
    const complexity = this.calculateTextComplexity(content);
    const expectedComplexity = this.getExpectedComplexityForAge(age);

    // Score based on how close to expected complexity
    const difference = Math.abs(complexity - expectedComplexity);
    return Math.max(0, 100 - difference * 100);
  }

  private static getExpectedComplexityForAge(age: number): number {
    if (age <= 8) return 0.3;
    if (age <= 12) return 0.5;
    return 0.7;
  }

  // Plagiarism detection helper methods
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
          severity:
            data.score > 95
              ? 'critical'
              : data.score > 80
                ? 'severe'
                : 'moderate',
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

    return { violations, deductions };
  }

  private static async analyzeSemantic(content: string, metadata?: any) {
    const violations: Array<any> = [];
    let deductions = 0;

    // Semantic chunking and analysis
    const chunks = this.createSemanticChunks(content);

    for (const chunk of chunks) {
      const semanticScore = await this.calculateSemanticOriginality(
        chunk,
        metadata
      );

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
    const sentences = content
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 20);
    const chunks: Array<{
      text: string;
      startIndex: number;
      endIndex: number;
    }> = [];

    // Create overlapping chunks for better detection
    for (let i = 0; i < sentences.length; i++) {
      const chunkSentences = sentences.slice(
        i,
        Math.min(i + 3, sentences.length)
      );
      const chunkText = chunkSentences.join('. ').trim();

      if (chunkText.length > 50) {
        const startIndex = content.indexOf(chunkSentences[0]);
        const endIndex = startIndex + chunkText.length;
        chunks.push({ text: chunkText, startIndex, endIndex });
      }
    }

    return chunks;
  }

  private static async calculateSemanticOriginality(
    chunk: { text: string },
    metadata?: any
  ): Promise<number> {
    // Advanced semantic analysis using multiple techniques

    // 1. Concept density analysis
    const conceptDensity = this.analyzeConceptDensity(chunk.text);

    // 2. Lexical diversity analysis
    const lexicalDiversity = this.calculateLexicalDiversity(chunk.text);

    // 3. Information entropy analysis
    const entropy = this.calculateInformationEntropy(chunk.text);

    // 4. Age-appropriate complexity analysis
    const complexityScore = this.analyzeComplexityForAge(
      chunk.text,
      metadata?.childAge
    );

    // Combine metrics for semantic originality score
    const semanticScore =
      conceptDensity * 0.3 +
      lexicalDiversity * 0.3 +
      entropy * 0.2 +
      complexityScore * 0.2;

    return Math.max(0, Math.min(100, semanticScore));
  }

  private static analyzeConceptDensity(text: string): number {
    const words = text
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3);
    const uniqueConcepts = new Set(words);

    // Higher concept density = more original
    const density = (uniqueConcepts.size / words.length) * 100;
    return Math.min(100, density * 2); // Boost for creative writing
  }

  private static calculateLexicalDiversity(text: string): number {
    const words = text
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 2);
    const uniqueWords = new Set(words);

    // Type-Token Ratio with adjustment for text length
    const ttr = uniqueWords.size / words.length;
    const adjustedTTR = ttr * Math.sqrt(words.length); // Adjust for length bias

    return Math.min(100, adjustedTTR * 100);
  }

  private static calculateInformationEntropy(text: string): number {
    const words = text
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 0);
    const frequency = new Map<string, number>();

    // Calculate word frequencies
    words.forEach((word) => {
      frequency.set(word, (frequency.get(word) || 0) + 1);
    });

    // Calculate entropy
    let entropy = 0;
    const totalWords = words.length;

    frequency.forEach((count) => {
      const probability = count / totalWords;
      entropy -= probability * Math.log2(probability);
    });

    // Normalize entropy (higher = more unpredictable = more original)
    return Math.min(100, (entropy / Math.log2(totalWords)) * 100);
  }

  private static analyzeComplexityForAge(
    text: string,
    age: number = 10
  ): number {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const words = text.split(/\W+/).filter((w) => w.length > 0);

    // Calculate various complexity metrics
    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord =
      words.reduce((sum, word) => sum + this.countSyllables(word), 0) /
      words.length;
    const complexWords = words.filter(
      (word) => this.countSyllables(word) >= 3
    ).length;

    // Age-appropriate expectations
    const expectedComplexity = age <= 8 ? 0.3 : age <= 12 ? 0.5 : 0.7;
    const actualComplexity =
      avgWordsPerSentence / 20 +
      avgSyllablesPerWord / 3 +
      complexWords / words.length;

    // Score based on how close to expected complexity
    const deviation = Math.abs(actualComplexity - expectedComplexity);
    return Math.max(0, 100 - deviation * 100);
  }

  // Additional helper methods for structural analysis
  private static analyzeStructuralPatterns(content: string, metadata?: any) {
    const violations: Array<any> = [];
    let deductions = 0;

    // Advanced structural analysis
    const structure = this.analyzeTextStructure(content);

    // Check for suspicious uniformity
    if (
      structure.sentenceLengthVariance < 3 &&
      structure.sentences.length > 8
    ) {
      violations.push({
        type: 'structure',
        severity: 'moderate',
        confidence: 80,
        source: 'structural_analysis',
        originalText: 'Sentence structure pattern',
        matchedText: `All sentences ${Math.round(structure.avgSentenceLength)} ± 2 words`,
        explanation:
          'Unnaturally uniform sentence lengths suggest potential copying',
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
    const sentences = content
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 5);
    const sentenceLengths = sentences.map((s) => s.trim().split(/\s+/).length);

    const avgSentenceLength =
      sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const variance =
      sentenceLengths.reduce(
        (acc, len) => acc + Math.pow(len - avgSentenceLength, 2),
        0
      ) / sentenceLengths.length;

    return {
      sentences,
      sentenceLengths,
      avgSentenceLength,
      sentenceLengthVariance: Math.sqrt(variance),
    };
  }

  private static analyzeParagraphStructures(content: string) {
    const paragraphs = content
      .split(/\n\s*\n/)
      .filter((p) => p.trim().length > 50);
    const structures = paragraphs.map((p) => this.getParagraphStructure(p));

    // Calculate similarity between paragraph structures
    let totalSimilarity = 0;
    let comparisons = 0;

    for (let i = 0; i < structures.length - 1; i++) {
      for (let j = i + 1; j < structures.length; j++) {
        totalSimilarity += this.calculateStructureSimilarity(
          structures[i],
          structures[j]
        );
        comparisons++;
      }
    }

    const repetitionScore =
      comparisons > 0 ? (totalSimilarity / comparisons) * 100 : 0;

    return { repetitionScore, structures };
  }

  private static getParagraphStructure(paragraph: string) {
    const sentences = paragraph
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 5);
    return {
      sentenceCount: sentences.length,
      avgSentenceLength:
        sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) /
        sentences.length,
      startsWithTransition:
        /^(however|furthermore|moreover|additionally|consequently)/i.test(
          paragraph.trim()
        ),
      endsWithConclusion:
        /(therefore|thus|in conclusion|finally).*[.!?]$/i.test(
          paragraph.trim()
        ),
    };
  }

  private static calculateStructureSimilarity(
    struct1: any,
    struct2: any
  ): number {
    let similarity = 0;

    // Compare sentence counts
    if (Math.abs(struct1.sentenceCount - struct2.sentenceCount) <= 1)
      similarity += 0.3;

    // Compare average sentence lengths
    if (Math.abs(struct1.avgSentenceLength - struct2.avgSentenceLength) <= 2)
      similarity += 0.3;

    // Compare transition usage
    if (struct1.startsWithTransition === struct2.startsWithTransition)
      similarity += 0.2;

    // Compare conclusion usage
    if (struct1.endsWithConclusion === struct2.endsWithConclusion)
      similarity += 0.2;

    return similarity;
  }

  private static analyzeLinguisticFingerprint(content: string, metadata?: any) {
    const violations: Array<any> = [];
    let deductions = 0;

    // Advanced linguistic analysis
    const fingerprint = this.createLinguisticFingerprint(content);
    const suspicionScore = this.analyzeFingerprintSuspicion(
      fingerprint,
      metadata
    );

    if (suspicionScore > 60) {
      violations.push({
        type: 'concept',
        severity: suspicionScore > 80 ? 'severe' : 'moderate',
        confidence: suspicionScore,
        source: 'linguistic_analysis',
        originalText: 'Writing style analysis',
        matchedText: fingerprint.summary,
        explanation:
          'Linguistic patterns suggest potential copying or AI generation',
        startIndex: 0,
        endIndex: content.length,
      });
      deductions += suspicionScore * 0.25;
    }

    return { violations, deductions };
  }

  private static createLinguisticFingerprint(content: string) {
    const words = content
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 0);
    const sentences = content
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 5);

    // Function word analysis
    const functionWords = [
      'the',
      'and',
      'of',
      'to',
      'a',
      'in',
      'for',
      'is',
      'on',
      'that',
      'by',
      'this',
      'with',
      'i',
      'you',
      'it',
      'not',
      'or',
      'be',
      'are',
    ];
    const functionWordFreq = functionWords.map(
      (word) => words.filter((w) => w === word).length / words.length
    );

    // Punctuation analysis
    const punctuationFreq = {
      comma: (content.match(/,/g) || []).length / content.length,
      semicolon: (content.match(/;/g) || []).length / content.length,
      colon: (content.match(/:/g) || []).length / content.length,
      exclamation: (content.match(/!/g) || []).length / content.length,
    };

    // Syntactic complexity
    const avgWordsPerSentence = words.length / sentences.length;
    const complexSentences =
      sentences.filter((s) => s.includes(',') && s.includes('and')).length /
      sentences.length;

    return {
      functionWordFreq,
      punctuationFreq,
      avgWordsPerSentence,
      complexSentences,
      summary: `AWL: ${avgWordsPerSentence.toFixed(1)}, Complex: ${(complexSentences * 100).toFixed(0)}%`,
    };
  }

  private static analyzeFingerprintSuspicion(
    fingerprint: any,
    metadata?: any
  ): number {
    let suspicion = 0;
    const age = metadata?.childAge || 10;

    // Check for age-inappropriate sophistication
    if (
      fingerprint.avgWordsPerSentence > (age <= 8 ? 8 : age <= 12 ? 12 : 16)
    ) {
      suspicion += 20;
    }

    // Check for unnatural punctuation patterns
    if (fingerprint.punctuationFreq.semicolon > 0.01 && age < 12) {
      suspicion += 25; // Young children rarely use semicolons
    }

    // Check for overly complex sentence structures
    if (
      fingerprint.complexSentences > (age <= 8 ? 0.2 : age <= 12 ? 0.4 : 0.6)
    ) {
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
      ageAppropriateness: this.analyzeAgeAppropriatenessForPlagiarism(
        content,
        metadata?.childAge
      ),
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
    const paragraphs = content
      .split(/\n\s*\n/)
      .filter((p) => p.trim().length > 50);
    if (paragraphs.length < 2) return 100;

    const personalityTraits = paragraphs.map((p) =>
      this.extractPersonalityTraits(p)
    );

    // Calculate consistency between paragraphs
    let totalConsistency = 0;
    let comparisons = 0;

    for (let i = 0; i < personalityTraits.length - 1; i++) {
      for (let j = i + 1; j < personalityTraits.length; j++) {
        totalConsistency += this.calculatePersonalityConsistency(
          personalityTraits[i],
          personalityTraits[j]
        );
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
    const formalWords = [
      'furthermore',
      'moreover',
      'consequently',
      'nevertheless',
      'therefore',
      'however',
    ];
    const informalWords = [
      'gonna',
      'wanna',
      'yeah',
      'okay',
      'cool',
      'awesome',
      'stuff',
    ];

    const formal = formalWords.filter((word) =>
      text.toLowerCase().includes(word)
    ).length;
    const informal = informalWords.filter((word) =>
      text.toLowerCase().includes(word)
    ).length;

    return formal > informal ? 0.8 : informal > formal ? 0.2 : 0.5;
  }

  private static calculateEmotionalTone(text: string): number {
    const positiveWords = [
      'happy',
      'excited',
      'amazing',
      'wonderful',
      'great',
      'love',
      'joy',
    ];
    const negativeWords = [
      'sad',
      'angry',
      'terrible',
      'awful',
      'hate',
      'fear',
      'worried',
    ];

    const positive = positiveWords.filter((word) =>
      text.toLowerCase().includes(word)
    ).length;
    const negative = negativeWords.filter((word) =>
      text.toLowerCase().includes(word)
    ).length;

    return positive > negative ? 0.7 : negative > positive ? 0.3 : 0.5;
  }

  private static calculateVocabularyLevel(text: string): number {
    const words = text.split(/\W+/).filter((w) => w.length > 3);
    const advancedWords = words.filter((word) => word.length > 7).length;
    return Math.min(1, (advancedWords / words.length) * 10);
  }

  private static calculateSentenceComplexity(text: string): number {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 5);
    const complexSentences = sentences.filter(
      (s) =>
        s.includes(',') &&
        (s.includes('because') || s.includes('although') || s.includes('while'))
    ).length;
    return complexSentences / sentences.length;
  }

  private static calculatePersonalityConsistency(
    traits1: any,
    traits2: any
  ): number {
    const differences = [
      Math.abs(traits1.formalityLevel - traits2.formalityLevel),
      Math.abs(traits1.emotionalTone - traits2.emotionalTone),
      Math.abs(traits1.vocabularyLevel - traits2.vocabularyLevel),
      Math.abs(traits1.sentenceComplexity - traits2.sentenceComplexity),
    ];

    const avgDifference =
      differences.reduce((a, b) => a + b, 0) / differences.length;
    return Math.max(0, 1 - avgDifference);
  }

  private static analyzeAgeAppropriatenessForPlagiarism(
    content: string,
    age: number = 10
  ): number {
    const expectations = this.getAgeExpectations(age);
    const actual = this.analyzeContentCharacteristics(content);

    // Calculate how well content matches age expectations
    const scores = [
      this.scoreMatch(
        actual.vocabularyComplexity,
        expectations.vocabularyComplexity
      ),
      this.scoreMatch(
        actual.sentenceComplexity,
        expectations.sentenceComplexity
      ),
      this.scoreMatch(
        actual.topicSophistication,
        expectations.topicSophistication
      ),
      this.scoreMatch(actual.grammarAccuracy, expectations.grammarAccuracy),
    ];

    return (scores.reduce((a, b) => a + b, 0) / scores.length) * 100;
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
      'philosophy',
      'psychology',
      'economics',
      'politics',
      'sociology',
      'quantum',
      'molecular',
      'theoretical',
      'existential',
      'metaphysical',
    ];

    const abstractConcepts = [
      'consciousness',
      'identity',
      'morality',
      'ethics',
      'justice',
      'freedom',
      'truth',
      'beauty',
      'meaning',
      'purpose',
    ];

    const words = content.toLowerCase().split(/\W+/);
    const sophisticatedCount = words.filter(
      (word) =>
        sophisticatedTopics.some((topic) => word.includes(topic)) ||
        abstractConcepts.some((concept) => word.includes(concept))
    ).length;

    return Math.min(1, (sophisticatedCount / words.length) * 50);
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
    commonErrors.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) errors += matches.length;
    });

    const sentences = content
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 5);
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

    const markerCounts = Object.entries(culturalMarkers).map(
      ([culture, markers]) => ({
        culture,
        count: markers.filter((marker) =>
          content.toLowerCase().includes(marker)
        ).length,
      })
    );

    // Check for cultural consistency
    const dominantCulture = markerCounts.reduce((a, b) =>
      a.count > b.count ? a : b
    );
    const totalMarkers = markerCounts.reduce(
      (sum, culture) => sum + culture.count,
      0
    );

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
      count: markers.filter((marker) => content.toLowerCase().includes(marker))
        .length,
    }));

    const totalTenseMarkers = tenseUsage.reduce(
      (sum, tense) => sum + tense.count,
      0
    );
    if (totalTenseMarkers === 0) return 100;

    // Check for dominant tense consistency
    const dominantTense = tenseUsage.reduce((a, b) =>
      a.count > b.count ? a : b
    );
    const consistency = dominantTense.count / totalTenseMarkers;

    return Math.max(60, consistency * 100); // Give benefit of doubt
  }

  private static calculateRiskLevel(
    score: number,
    violations: any[]
  ): 'low' | 'medium' | 'high' | 'critical' {
    const criticalViolations = violations.filter(
      (v) => v.severity === 'critical'
    ).length;
    const severeViolations = violations.filter(
      (v) => v.severity === 'severe'
    ).length;

    if (criticalViolations > 0 || score < 30) return 'critical';
    if (severeViolations > 1 || score < 50) return 'high';
    if (violations.length > 3 || score < 70) return 'medium';
    return 'low';
  }

  /**
   * Convert advanced assessment to legacy format for backward compatibility
   */
  static convertToLegacyFormat(assessmentResult: any) {
    return {
      grammarScore: assessmentResult.categoryScores.grammar,
      creativityScore: assessmentResult.categoryScores.creativity,
      vocabularyScore: assessmentResult.categoryScores.vocabulary,
      structureScore: assessmentResult.categoryScores.structure,
      characterDevelopmentScore:
        assessmentResult.categoryScores.characterDevelopment,
      plotDevelopmentScore: assessmentResult.categoryScores.plotDevelopment,
      overallScore: assessmentResult.overallScore,
      readingLevel: assessmentResult.categoryScores.readingLevel,
      feedback: assessmentResult.educationalFeedback.teacherComment,
      strengths: assessmentResult.educationalFeedback.strengths,
      improvements: assessmentResult.educationalFeedback.improvements,
      vocabularyUsed: [], // Legacy field - kept empty
      suggestedWords: [], // Legacy field - kept empty
      educationalInsights: assessmentResult.educationalFeedback.encouragement,

      // NEW: Advanced integrity analysis
      plagiarismScore: assessmentResult.integrityAnalysis.originalityScore,
      aiDetectionScore:
        assessmentResult.integrityAnalysis.aiDetectionResult.overallScore,
      integrityRisk: assessmentResult.integrityAnalysis.integrityRisk,
      integrityDetails: {
        plagiarism: assessmentResult.integrityAnalysis.plagiarismResult,
        aiDetection: assessmentResult.integrityAnalysis.aiDetectionResult,
      },
      recommendations: assessmentResult.recommendations,
      progressTracking: assessmentResult.progressTracking,
      integrityStatus: assessmentResult.integrityStatus,
    };
  }

  /**
   * Keep existing method for backward compatibility
   */
  static async generateDetailedAssessment(
    content: string,
    elements: any,
    stats: any
  ) {
    console.log(
      '🔄 Using legacy assessment method - consider upgrading to assessStory()'
    );

    // Use advanced assessment but return in old format
    const result = await this.performCompleteAssessment(content, {
      childAge: 10, // Default age
      isCollaborativeStory: false,
      expectedGenre:
        (elements?.genre as 'creative' | 'fantasy' | 'adventure' | 'mystery') ||
        'creative',
    });

    return this.convertToLegacyFormat(result);
  }

  /**
   * Quick plagiarism check without full assessment
   */
  static async checkPlagiarismOnly(content: string, childAge?: number) {
    const result = await this.checkPlagiarism(content, {
      childAge: childAge || 10,
      isCreativeWriting: true,
    });

    return {
      score: result.overallScore,
      riskLevel: result.riskLevel,
      violations: result.violations,
      suggestions: result.recommendations,
    };
  }

  /**
   * Quick AI detection without full assessment
   */
  static async checkAIContentOnly(content: string, childAge?: number) {
    const result = await AIDetector.detectAIContent(content, {
      childAge: childAge || 10,
      isCreativeWriting: true,
    });

    return {
      score: result.overallScore,
      likelihood: result.likelihood,
      confidence: result.confidence,
      indicators: result.indicators,
      suggestions: result.recommendations,
    };
  }

  /**
   * Get assessment statistics for admin dashboard
   */
  static async getAssessmentStats() {
    await connectToDatabase();

    const stats = await StorySession.aggregate([
      {
        $match: {
          assessment: { $exists: true },
          'assessment.overallScore': { $exists: true },
        },
      },
      {
        $group: {
          _id: null,
          totalAssessments: { $sum: 1 },
          averageScore: { $avg: '$assessment.overallScore' },
          highRiskCount: {
            $sum: {
              $cond: [
                { $in: ['$assessment.integrityRisk', ['high', 'critical']] },
                1,
                0,
              ],
            },
          },
          aiDetectedCount: {
            $sum: {
              $cond: [{ $lt: ['$assessment.aiDetectionScore', 70] }, 1, 0],
            },
          },
          plagiarismDetectedCount: {
            $sum: {
              $cond: [{ $lt: ['$assessment.plagiarismScore', 70] }, 1, 0],
            },
          },
        },
      },
    ]);

    return (
      stats[0] || {
        totalAssessments: 0,
        averageScore: 0,
        highRiskCount: 0,
        aiDetectedCount: 0,
        plagiarismDetectedCount: 0,
      }
    );
  }
}
