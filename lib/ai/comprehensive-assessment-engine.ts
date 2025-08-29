import { smartAIProvider } from './smart-provider-manager';
import { AdvancedAIDetector } from './advanced-ai-detector';

export interface ComprehensiveAssessment {
  overallScore: number;
  status: string;
  statusMessage: string;

  // Step 1-2: Integrity Analysis
  integrityAnalysis: {
    aiDetection: {
      humanLikeScore: number;
      aiLikelihood: string;
      confidenceLevel: number;
      analysis: string;
      riskLevel: string;
      indicators: string[];
    };
    plagiarismCheck: {
      originalityScore: number;
      riskLevel: string;
      violations: string[];
      status: string;
    };
    overallStatus: string; // "PASS" | "WARNING" | "FAIL"
    message: string;
    recommendation: string;
  };

  // Step 3-6: Educational Assessment
  coreWritingSkills: {
    grammar: { score: number; feedback: string };
    vocabulary: { score: number; feedback: string };
    creativity: { score: number; feedback: string };
    structure: { score: number; feedback: string };
  };

  storyDevelopment: {
    characterDevelopment: { score: number; feedback: string };
    plotDevelopment: { score: number; feedback: string };
    descriptiveWriting: { score: number; feedback: string };
  };

  // Step 7-10: Specialized Analysis
  advancedElements: {
    sensoryDetails: { score: number; feedback: string };
    plotLogic: { score: number; feedback: string };
    themeRecognition: { score: number; feedback: string };
    problemSolving: { score: number; feedback: string };
  };

  // Step 11-13: Age Analysis
  ageAnalysis: {
    ageAppropriateness: number;
    readingLevel: string;
    contentSuitability: string;
  };

  // Step 14-16: Comprehensive Feedback
  comprehensiveFeedback: {
    strengths: string[];
    areasForEnhancement: string[];
    nextSteps: string[];
    teacherAssessment: string;
  };

  // Additional Analysis
  detailedBreakdown: {
    riskFactors: {
      aiDetectionRisk: string;
      plagiarismRisk: string;
      overallRisk: string;
    };
    educationalRecommendations: {
      immediate: string[];
      longTerm: string[];
      practice: string[];
    };
  };

  finalSummary: string;
  overallRating: string;
  recognitionLevel: string;
}

export class ComprehensiveAssessmentEngine {
  static async performCompleteAssessment(
    storyContent: string,
    metadata: {
      childAge?: number;
      storyTitle?: string;
      expectedGenre?: string;
      isCollaborativeStory?: boolean;
    }
  ): Promise<ComprehensiveAssessment> {
    console.log('🎯 Starting AI-powered 16-step comprehensive assessment...');

    if (!storyContent || storyContent.trim().length < 50) {
      throw new Error(
        'Content too short for meaningful assessment (minimum 50 characters)'
      );
    }

    // STEP 1-2: CRITICAL - AI-Powered Integrity Analysis (FIXED)
    const integrityAnalysis = await this.performAIIntegrityAnalysis(
      storyContent,
      metadata
    );

    // CONDITIONAL ASSESSMENT: If AI detected, modify educational assessment approach
    const isLikelyAI = integrityAnalysis.overallStatus === 'FAIL';

    if (isLikelyAI) {
      console.log('🚨 AI content detected - adjusting assessment approach');
      return this.generateAIDetectedAssessment(
        storyContent,
        metadata,
        integrityAnalysis
      );
    }

    // CONTINUE WITH FULL ASSESSMENT if content appears human
    console.log(
      '✅ Content appears human - proceeding with full educational assessment'
    );

    // STEP 3-6: AI-Powered Educational Assessment
    const educationalAssessment = await this.performAIEducationalAssessment(
      storyContent,
      metadata
    );

    // STEP 7-10: AI-Powered Specialized Analysis
    const specializedAnalysis = await this.performAISpecializedAnalysis(
      storyContent,
      metadata
    );

    // STEP 11-13: AI-Powered Age Analysis
    const ageAnalysis = await this.performAIAgeAnalysis(
      storyContent,
      metadata.childAge || 10
    );

    // STEP 14-16: AI-Powered Comprehensive Feedback
    const comprehensiveFeedback = await this.generateAIComprehensiveFeedback(
      storyContent,
      educationalAssessment,
      specializedAnalysis,
      metadata
    );

    // Calculate overall score from all AI assessments
    const allScores = [
      educationalAssessment.grammar.score,
      educationalAssessment.vocabulary.score,
      educationalAssessment.creativity.score,
      educationalAssessment.structure.score,
      educationalAssessment.characterDevelopment.score,
      educationalAssessment.plotDevelopment.score,
      educationalAssessment.descriptiveWriting.score,
      specializedAnalysis.sensoryDetails.score,
      specializedAnalysis.plotLogic.score,
      specializedAnalysis.themeRecognition.score,
      specializedAnalysis.problemSolving.score,
    ];

    const overallScore = Math.round(
      allScores.reduce((sum, score) => sum + score, 0) / allScores.length
    );

    // AI-generated status determination
    const statusInfo = await this.generateAIStatusAndRecognition(
      overallScore,
      educationalAssessment,
      specializedAnalysis
    );

    // AI-generated final summary
    const finalSummary = await this.generateAIFinalSummary(
      overallScore,
      educationalAssessment,
      specializedAnalysis,
      integrityAnalysis
    );

    return {
      overallScore,
      status: statusInfo.status,
      statusMessage: statusInfo.statusMessage,
      integrityAnalysis,
      coreWritingSkills: {
        grammar: educationalAssessment.grammar,
        vocabulary: educationalAssessment.vocabulary,
        creativity: educationalAssessment.creativity,
        structure: educationalAssessment.structure,
      },
      storyDevelopment: {
        characterDevelopment: educationalAssessment.characterDevelopment,
        plotDevelopment: educationalAssessment.plotDevelopment,
        descriptiveWriting: educationalAssessment.descriptiveWriting,
      },
      advancedElements: specializedAnalysis,
      ageAnalysis,
      comprehensiveFeedback,
      detailedBreakdown: {
        riskFactors: {
          aiDetectionRisk: `${integrityAnalysis.aiDetection.aiLikelihood} - ${integrityAnalysis.aiDetection.riskLevel}`,
          plagiarismRisk: `${integrityAnalysis.plagiarismCheck.riskLevel} Risk`,
          overallRisk: `${integrityAnalysis.overallStatus} - Assessment completed with integrity verification`,
        },
        educationalRecommendations:
          await this.generateAIEducationalRecommendations(
            comprehensiveFeedback,
            educationalAssessment
          ),
      },
      finalSummary,
      overallRating: statusInfo.overallRating,
      recognitionLevel: statusInfo.recognitionLevel,
    };
  }

  // STEP 1-2: FIXED AI-POWERED INTEGRITY ANALYSIS
  private static async performAIIntegrityAnalysis(
    content: string,
    metadata: any
  ) {
    console.log('🔍 Steps 1-2: Advanced Integrity Analysis...');

    // Use the NEW Advanced AI Detector
    const aiDetectionResult = await AdvancedAIDetector.detectAIContent(
      content,
      {
        childAge: metadata.childAge || 10,
        expectedGenre: metadata.expectedGenre || 'creative',
        isCreativeWriting: true,
      }
    );

    // Perform plagiarism check
    const plagiarismResult = await this.performAdvancedPlagiarismCheck(
      content,
      metadata
    );

    // Determine overall integrity status based on BOTH AI detection and plagiarism
    let overallStatus: string;
    let message: string;
    let recommendation: string;

    // STRICT CRITERIA: High AI likelihood = FAIL
    if (
      aiDetectionResult.riskLevel === 'CRITICAL RISK' ||
      aiDetectionResult.humanLikeScore < 25
    ) {
      overallStatus = 'FAIL';
      message = 'Content appears to be AI-generated with high confidence';
      recommendation =
        'This work appears to be generated by AI. Please submit original writing that reflects your own thoughts and creativity.';
    } else if (
      aiDetectionResult.riskLevel === 'HIGH RISK' ||
      aiDetectionResult.humanLikeScore < 40
    ) {
      overallStatus = 'WARNING';
      message =
        'Content shows significant indicators of possible AI generation';
      recommendation =
        'Several patterns suggest possible AI assistance. Focus on developing your personal writing voice and authentic expression.';
    } else if (
      plagiarismResult.riskLevel === 'high' ||
      plagiarismResult.status === 'VIOLATION'
    ) {
      overallStatus = 'FAIL';
      message = 'Content contains significant plagiarism concerns';
      recommendation =
        'Focus on creating original content that reflects your unique ideas and perspectives.';
    } else if (
      aiDetectionResult.riskLevel === 'MEDIUM RISK' ||
      plagiarismResult.riskLevel === 'medium'
    ) {
      overallStatus = 'WARNING';
      message = 'Some integrity concerns detected requiring review';
      recommendation =
        'Continue developing authentic writing while being mindful of originality.';
    } else {
      overallStatus = 'PASS';
      message = 'Content appears to be authentic original work';
      recommendation =
        'Excellent work! Continue developing your unique creative voice and storytelling abilities.';
    }

    return {
      aiDetection: {
        humanLikeScore: aiDetectionResult.humanLikeScore,
        aiLikelihood: aiDetectionResult.aiLikelihood,
        confidenceLevel: aiDetectionResult.confidenceLevel,
        analysis: aiDetectionResult.analysis,
        riskLevel: aiDetectionResult.riskLevel,
        indicators: aiDetectionResult.indicators,
      },
      plagiarismCheck: {
        originalityScore: plagiarismResult.originalityScore,
        riskLevel: plagiarismResult.riskLevel,
        violations: plagiarismResult.violations,
        status: plagiarismResult.status,
      },
      overallStatus,
      message,
      recommendation,
    };
  }

  // ADVANCED PLAGIARISM CHECK
  private static async performAdvancedPlagiarismCheck(
    content: string,
    metadata: any
  ) {
    const prompt = `Analyze this text for plagiarism from known sources:

TEXT: "${content}"
AUTHOR: ${metadata.childAge ? `Child, age ${metadata.childAge}` : 'Unknown'}
CONTEXT: Creative writing

Check for:
1. Exact matches from published works, websites, or common sources
2. Paraphrased content from popular books, movies, games
3. Common phrases that appear across multiple sources
4. Fantasy clichés that are overused from popular media

Be thorough in checking against:
- Popular fantasy literature (Harry Potter, Lord of the Rings, etc.)
- Common online writing prompts or examples
- Video game or movie descriptions
- Educational writing samples

Respond ONLY with JSON:
{
 "originalityScore": <0-100>,
 "riskLevel": "<low/medium/high/critical>",  
 "violations": ["<violation1>", "<violation2>"],
 "status": "<CLEAR/WARNING/VIOLATION>",
 "explanation": "<detailed explanation>"
}`;

    try {
      const response = await smartAIProvider.generateResponse(prompt);
      let cleanedResponse = response.replace(/```json|```/g, '').trim();

      // Fix common JSON parsing issues
      cleanedResponse = this.cleanJSONResponse(cleanedResponse);

      const analysis = JSON.parse(cleanedResponse);

      return {
        originalityScore: analysis.originalityScore || 85,
        riskLevel: analysis.riskLevel || 'low',
        violations: analysis.violations || [],
        status: analysis.status || 'CLEAR',
      };
    } catch (error) {
      console.error('Plagiarism check failed:', error);
      return {
        originalityScore: 80,
        riskLevel: 'medium',
        violations: ['Unable to complete comprehensive plagiarism check'],
        status: 'WARNING',
      };
    }
  }

  // GENERATE ASSESSMENT FOR AI-DETECTED CONTENT
  private static async generateAIDetectedAssessment(
    content: string,
    metadata: any,
    integrityAnalysis: any
  ): Promise<ComprehensiveAssessment> {
    console.log('🚨 Generating assessment for AI-detected content');

    // For AI-detected content, still use AI to generate all feedback and scores, but with a prompt that acknowledges the detection
    const aiDetectedPrompt = `
The following creative writing submission has been flagged as likely AI-generated. Please provide a full educational assessment, but note in your feedback that the content appears to be AI-generated and encourage authentic, original work. Be constructive and specific.

CONTENT: "${content}"
WRITER AGE: ${metadata.childAge || 10}
GENRE: ${metadata.expectedGenre || 'creative'}

Respond ONLY with this JSON:
{
  "overallScore": <0-100>,
  "coreWritingSkills": {
    "grammar": {"score": <0-100>, "feedback": "<feedback>"},
    "vocabulary": {"score": <0-100>, "feedback": "<feedback>"},
    "creativity": {"score": <0-100>, "feedback": "<feedback>"},
    "structure": {"score": <0-100>, "feedback": "<feedback>"}
  },
  "storyDevelopment": {
    "characterDevelopment": {"score": <0-100>, "feedback": "<feedback>"},
    "plotDevelopment": {"score": <0-100>, "feedback": "<feedback>"},
    "descriptiveWriting": {"score": <0-100>, "feedback": "<feedback>"}
  },
  "advancedElements": {
    "sensoryDetails": {"score": <0-100>, "feedback": "<feedback>"},
    "plotLogic": {"score": <0-100>, "feedback": "<feedback>"},
    "themeRecognition": {"score": <0-100>, "feedback": "<feedback>"},
    "problemSolving": {"score": <0-100>, "feedback": "<feedback>"}
  },
  "ageAnalysis": {
    "ageAppropriateness": <0-100>,
    "readingLevel": "<level>",
    "contentSuitability": "<suitability>"
  },
  "comprehensiveFeedback": {
    "strengths": ["<strength1>", "<strength2>", "<strength3>", "<strength4>", "<strength5>"],
    "areasForEnhancement": ["<area1>", "<area2>", "<area3>"],
    "nextSteps": ["<step1>", "<step2>", "<step3>", "<step4>"],
    "teacherAssessment": "<detailed teacher feedback that acknowledges the AI-detected status and encourages authentic work>"
  },
  "finalSummary": "<summary>",
  "overallRating": "<grade>",
  "recognitionLevel": "<recognition>"
}
`;

    try {
      const response = await smartAIProvider.generateResponse(aiDetectedPrompt);
      let cleanedResponse = response.replace(/```json|```/g, '').trim();
      cleanedResponse = this.cleanJSONResponse(cleanedResponse);
      const aiResult = JSON.parse(cleanedResponse);

      return {
        overallScore: aiResult.overallScore,
        status: 'AI CONTENT DETECTED',
        statusMessage: 'Content appears to be AI-generated rather than original student work',
        integrityAnalysis,
        coreWritingSkills: aiResult.coreWritingSkills,
        storyDevelopment: aiResult.storyDevelopment,
        advancedElements: aiResult.advancedElements,
        ageAnalysis: aiResult.ageAnalysis,
        comprehensiveFeedback: aiResult.comprehensiveFeedback,
        detailedBreakdown: {
          riskFactors: {
            aiDetectionRisk: integrityAnalysis.aiDetection.aiLikelihood,
            plagiarismRisk: integrityAnalysis.plagiarismCheck.riskLevel,
            overallRisk: 'High - AI content detected',
          },
          educationalRecommendations: await this.generateAIEducationalRecommendations(
            aiResult.comprehensiveFeedback,
            aiResult.coreWritingSkills
          ),
        },
        finalSummary: aiResult.finalSummary,
        overallRating: aiResult.overallRating,
        recognitionLevel: aiResult.recognitionLevel,
      };
    } catch (error) {
      console.error('AI-detected assessment failed:', error);
      throw new Error('AI assessment unavailable. Please try again later.');
    }
  }

  // STEP 3-6: AI-POWERED EDUCATIONAL ASSESSMENT (same as before but with context)
  private static async performAIEducationalAssessment(
    content: string,
    metadata: any
  ) {
    console.log('📚 Steps 3-6: Educational Content Assessment...');

    const educationalPrompt = `
Analyze this creative writing for educational assessment:

CONTENT: "${content}"
WRITER AGE: ${metadata.childAge || 10}
GENRE: ${metadata.expectedGenre || 'creative'}

IMPORTANT CONTEXT: This content has passed AI detection and appears to be human-written.

Evaluate each category (0-100) with specific feedback based on actual content:

CORE WRITING SKILLS:
1. GRAMMAR & STRUCTURE: Sentence variety, punctuation, syntax, literary techniques
2. VOCABULARY: Word choice sophistication, descriptive language, age-appropriateness  
3. CREATIVITY: Original ideas, imaginative elements, unique concepts
4. STRUCTURE: Organization, flow, narrative progression

STORY DEVELOPMENT:
5. CHARACTER DEVELOPMENT: Character depth, motivation, growth, authenticity
6. PLOT DEVELOPMENT: Story progression, pacing, conflict, resolution
7. DESCRIPTIVE WRITING: Imagery, sensory details, atmospheric creation

Award appropriate scores based on actual quality. Provide specific, detailed feedback referencing actual elements from the story.

Respond ONLY with this JSON:
{
 "grammar": {"score": <0-100>, "feedback": "<specific detailed feedback>"},
 "vocabulary": {"score": <0-100>, "feedback": "<specific detailed feedback>"},
 "creativity": {"score": <0-100>, "feedback": "<specific detailed feedback>"},
 "structure": {"score": <0-100>, "feedback": "<specific detailed feedback>"},
 "characterDevelopment": {"score": <0-100>, "feedback": "<specific detailed feedback>"},
 "plotDevelopment": {"score": <0-100>, "feedback": "<specific detailed feedback>"},
 "descriptiveWriting": {"score": <0-100>, "feedback": "<specific detailed feedback>"}
}`;

    try {
      const response =
        await smartAIProvider.generateResponse(educationalPrompt);
      let cleanedResponse = response.replace(/```json|```/g, '').trim();
      cleanedResponse = this.cleanJSONResponse(cleanedResponse);
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Educational assessment failed:', error);
      return this.getFallbackEducationalAssessment(content, metadata);
    }
  }

  // STEP 7-10: AI-POWERED SPECIALIZED ANALYSIS (same as before)
  private static async performAISpecializedAnalysis(
    content: string,
    metadata: any
  ) {
    console.log('🔍 Steps 7-10: Specialized Analysis...');

    const specializedPrompt = `
Analyze this creative writing for advanced elements:

CONTENT: "${content}"

Evaluate these specialized aspects (0-100) with detailed feedback:

1. SENSORY DETAILS: Use of five senses, tactile/visual/auditory descriptions, immersive quality
2. PLOT LOGIC: Internal consistency, cause-and-effect relationships, believability within genre
3. THEME RECOGNITION: Depth of themes, meaningful messages, symbolic elements
4. PROBLEM SOLVING: Creative solutions, character agency, conflict resolution

Provide detailed, specific feedback referencing actual elements from the story.

Respond ONLY with this JSON:
{
 "sensoryDetails": {"score": <0-100>, "feedback": "<detailed feedback>"},
 "plotLogic": {"score": <0-100>, "feedback": "<detailed feedback>"},
 "themeRecognition": {"score": <0-100>, "feedback": "<detailed feedback>"},
 "problemSolving": {"score": <0-100>, "feedback": "<detailed feedback>"}
}`;

    try {
      const response =
        await smartAIProvider.generateResponse(specializedPrompt);
      let cleanedResponse = response.replace(/```json|```/g, '').trim();
      cleanedResponse = this.cleanJSONResponse(cleanedResponse);
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Specialized analysis failed:', error);
      return this.getFallbackSpecializedAnalysis(content);
    }
  }

  // STEP 11-13: AI-POWERED AGE ANALYSIS
  private static async performAIAgeAnalysis(content: string, age: number) {
    console.log('👶 Steps 11-13: Age Appropriateness Analysis...');

    const prompt = `
Analyze this creative writing for age appropriateness:

CONTENT: "${content}"
WRITER AGE: ${age}

Evaluate:
1. Age Appropriateness (0-100): How well the complexity matches the writer's age
2. Reading Level: Classify the reading level of this content
3. Content Suitability: Assess thematic and content appropriateness

Consider vocabulary complexity, sentence structure, themes, and concepts for the specified age.

Respond ONLY with this JSON:
{
 "ageAppropriateness": <0-100>,
 "readingLevel": "<Elementary/Advanced Elementary/Middle Grade/Advanced Middle Grade/Young Adult>", 
 "contentSuitability": "<Appropriate/Appropriate with mild themes/Appropriate with intense imagery/May need guidance>"
}`;

    try {
      const response = await smartAIProvider.generateResponse(prompt);
      return JSON.parse(response.replace(/```json|```/g, '').trim());
    } catch (error) {
      console.error('Age analysis failed:', error);
      return {
        ageAppropriateness: Math.max(60, 100 - (age <= 10 ? 15 : 5)),
        readingLevel:
          age <= 8 ? 'Elementary' : age <= 12 ? 'Middle Grade' : 'Young Adult',
        contentSuitability: 'Appropriate with some complex themes',
      };
    }
  }

  // STEP 14-16: AI-POWERED COMPREHENSIVE FEEDBACK
  private static async generateAIComprehensiveFeedback(
    content: string,
    educational: any,
    specialized: any,
    metadata: any
  ) {
    console.log('💬 Steps 14-16: Comprehensive Feedback Generation...');

    const feedbackPrompt = `
Generate comprehensive educational feedback for this creative writing:

STORY CONTENT: "${content}"
WRITER AGE: ${metadata.childAge || 10}
EDUCATIONAL SCORES: Grammar(${educational.grammar.score}), Vocabulary(${educational.vocabulary.score}), Creativity(${educational.creativity.score})

Create detailed, specific feedback based on the actual story content:

1. STRENGTHS: 5 specific, detailed strengths with examples from the text
2. AREAS FOR ENHANCEMENT: 3 specific improvement areas with actionable advice  
3. NEXT STEPS: 4 concrete, actionable steps for continued development
4. TEACHER ASSESSMENT: Professional paragraph assessment (150+ words) as if written by an experienced creative writing teacher

Be specific, encouraging, and reference actual elements from the story.

Respond ONLY with this JSON:
{
 "strengths": [
   "<detailed strength 1 with specific story reference>",
   "<detailed strength 2 with specific story reference>", 
   "<detailed strength 3 with specific story reference>",
   "<detailed strength 4 with specific story reference>",
   "<detailed strength 5 with specific story reference>"
 ],
 "areasForEnhancement": [
   "<specific improvement area 1 with actionable advice>",
   "<specific improvement area 2 with actionable advice>",
   "<specific improvement area 3 with actionable advice>"
 ],
 "nextSteps": [
   "<actionable development step 1>",
   "<actionable development step 2>", 
   "<actionable development step 3>",
   "<actionable development step 4>"
 ],
 "teacherAssessment": "<comprehensive 150+ word professional teacher assessment>"
}`;

    try {
      const response = await smartAIProvider.generateResponse(feedbackPrompt);
      let cleanedResponse = response.replace(/```json|```/g, '').trim();
      cleanedResponse = this.cleanJSONResponse(cleanedResponse);
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Feedback generation failed:', error);
      return this.getFallbackComprehensiveFeedback();
    }
  }

  // AI-POWERED STATUS AND RECOGNITION
  private static async generateAIStatusAndRecognition(
    overallScore: number,
    educational: any,
    specialized: any
  ) {
    const prompt = `
Based on this creative writing assessment data, generate appropriate status:

OVERALL SCORE: ${overallScore}/100
KEY SCORES: Grammar(${educational.grammar.score}), Creativity(${educational.creativity.score}), Vocabulary(${educational.vocabulary.score})

Determine appropriate status based on score ranges:
- 90-100: EXCEPTIONAL WORK / A+ / Advanced Creative Writer
- 80-89: EXCELLENT WORK / A / Skilled Creative Writer  
- 70-79: GOOD WORK / B / Developing Creative Writer
- 60-69: DEVELOPING WORK / C / Emerging Creative Writer
- Below 60: NEEDS IMPROVEMENT / D / Beginning Writer

Respond ONLY with this JSON:
{
 "status": "<STATUS DESIGNATION>",
 "statusMessage": "<brief professional message>",
 "overallRating": "<letter grade> (<score>/100)",
 "recognitionLevel": "<skill level designation>"
}`;

    try {
      const response = await smartAIProvider.generateResponse(prompt);
      return JSON.parse(response.replace(/```json|```/g, '').trim());
    } catch (error) {
      console.error('Status generation failed:', error);
      if (overallScore >= 90) {
        return {
          status: 'EXCEPTIONAL WORK',
          statusMessage: 'Outstanding creative writing',
          overallRating: `A+ (${overallScore}/100)`,
          recognitionLevel: 'Advanced Creative Writer',
        };
      } else if (overallScore >= 80) {
        return {
          status: 'EXCELLENT WORK',
          statusMessage: 'Strong creative writing',
          overallRating: `A (${overallScore}/100)`,
          recognitionLevel: 'Skilled Creative Writer',
        };
      } else if (overallScore >= 70) {
        return {
          status: 'GOOD WORK',
          statusMessage: 'Solid creative writing',
          overallRating: `B (${overallScore}/100)`,
          recognitionLevel: 'Developing Creative Writer',
        };
      } else {
        return {
          status: 'DEVELOPING WORK',
          statusMessage: 'Creative writing with room for improvement',
          overallRating: `C (${overallScore}/100)`,
          recognitionLevel: 'Emerging Creative Writer',
        };
      }
    }
  }

  // AI-POWERED FINAL SUMMARY
  private static async generateAIFinalSummary(
    overallScore: number,
    educational: any,
    specialized: any,
    integrity: any
  ) {
    const prompt = `
Create a professional final assessment summary:

OVERALL SCORE: ${overallScore}/100
INTEGRITY STATUS: ${integrity.overallStatus}
CONTENT TYPE: ${integrity.overallStatus === 'PASS' ? 'Authentic student work' : 'Flagged content'}

Write 2-3 sentences highlighting key points and overall assessment.

Respond with just the summary text, no JSON.`;

    try {
      const response = await smartAIProvider.generateResponse(prompt);
      return response.trim();
    } catch (error) {
      console.error('Summary generation failed:', error);
      return integrity.overallStatus === 'PASS'
        ? `This story demonstrates solid creative writing ability with authentic expression and developing technical skills. The work shows genuine creativity and age-appropriate storytelling elements.`
        : `This submission requires attention to ensure authentic student work is being submitted. Focus on developing genuine creative writing skills through personal expression.`;
    }
  }

  // AI-POWERED EDUCATIONAL RECOMMENDATIONS
  private static async generateAIEducationalRecommendations(
    feedback: any,
    educational: any
  ) {
    const prompt = `
Based on assessment feedback, generate educational recommendations:

AREAS FOR IMPROVEMENT: ${feedback.areasForEnhancement?.join(', ') || 'General development'}
NEXT STEPS: ${feedback.nextSteps?.join(', ') || 'Continue practicing'}

Create three categories:
1. IMMEDIATE: 3 things to focus on right now
2. LONG-TERM: 3 developmental goals  
3. PRACTICE: 3 specific exercises

Respond ONLY with this JSON:
{
 "immediate": ["<immediate focus 1>", "<immediate focus 2>", "<immediate focus 3>"],
 "longTerm": ["<long-term goal 1>", "<long-term goal 2>", "<long-term goal 3>"],
 "practice": ["<practice exercise 1>", "<practice exercise 2>", "<practice exercise 3>"]
}`;

    try {
      const response = await smartAIProvider.generateResponse(prompt);
      return JSON.parse(response.replace(/```json|```/g, '').trim());
    } catch (error) {
      console.error('Educational recommendations failed:', error);
      return {
        immediate: [
          'Focus on expressing personal ideas clearly',
          'Practice age-appropriate vocabulary',
          'Develop authentic voice',
        ],
        longTerm: [
          'Build consistent writing practice',
          'Read widely in preferred genres',
          'Seek feedback from teachers',
        ],
        practice: [
          'Daily journaling exercises',
          'Character development activities',
          'Setting description practice',
        ],
      };
    }
  }

  // FALLBACK METHODS
  private static getFallbackEducationalAssessment(
    content: string,
    metadata: any
  ) {
    throw new Error('AI educational assessment unavailable. Please try again later.');
  }

  private static getFallbackSpecializedAnalysis(content: string) {
    throw new Error('AI specialized analysis unavailable. Please try again later.');
  }

  private static getFallbackComprehensiveFeedback() {
    throw new Error('AI comprehensive feedback unavailable. Please try again later.');
  }

  private static cleanJSONResponse(jsonString: string): string {
    // Fix common JSON parsing issues
    let cleaned = jsonString;

    // Remove any trailing commas before closing braces or brackets
    cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');

    // Fix unescaped quotes within string values
    cleaned = cleaned.replace(
      /"([^"]*)"(\s*:\s*)"([^"]*)"/g,
      (match, key, separator, value) => {
        // Escape any unescaped quotes in the value
        const escapedValue = value.replace(/"/g, '\\"');
        return `"${key}"${separator}"${escapedValue}"`;
      }
    );

    // Fix unterminated strings by adding closing quotes if missing
    const lines = cleaned.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.includes(':') && line.includes('"')) {
        const colonIndex = line.indexOf(':');
        const afterColon = line.substring(colonIndex + 1).trim();
        if (
          afterColon.startsWith('"') &&
          !afterColon.endsWith('"') &&
          !afterColon.endsWith('",')
        ) {
          // Add closing quote
          lines[i] = line + '"';
        }
      }
    }
    cleaned = lines.join('\n');

    return cleaned;
  }
}
