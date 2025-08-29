import { smartAIProvider } from './smart-provider-manager';

export class SingleCallAssessmentEngine {
  static async performCompleteAssessment(
    storyContent: string,
    metadata: {
      childAge?: number;
      storyTitle?: string;
      expectedGenre?: string;
      isCollaborativeStory?: boolean;
    }
  ): Promise<any> {
    console.log('Starting BULLETPROOF AI assessment...');

    if (!storyContent || storyContent.trim().length < 50) {
      throw new Error('Content too short for meaningful assessment (minimum 50 characters)');
    }

    // Single, unbiased prompt
    const prompt = this.buildAssessmentPrompt(storyContent, metadata);
    let lastError = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`Assessment attempt ${attempt}/2`);
        const response = await smartAIProvider.generateResponse(prompt);
        console.log('Raw AI response:', response);
        // Extract and validate JSON
        const assessment = this.extractAndValidateJSON(response);
        console.log('Parsed assessment JSON:', assessment);
        // Transform to expected format
        const transformed = this.transformAssessment(assessment);
        console.log('Transformed assessment:', transformed);
        // Validate transformed assessment
        if (!transformed || !transformed.coreWritingSkills || !transformed.coreWritingSkills.grammar) {
          throw new Error('Transformed assessment is invalid or incomplete.');
        }
        return transformed;
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        lastError = error;
      }
    }
    let errorMsg = '';
    if (lastError) {
      if (typeof lastError === 'object' && lastError !== null && 'message' in lastError) {
        errorMsg = (lastError as any).message;
      } else {
        errorMsg = String(lastError);
      }
    }
    throw new Error('AI assessment failed. Please try again later. ' + errorMsg);
  }

  // New prompt builder: no hardcoded values, just structure and instructions
  private static buildAssessmentPrompt(storyContent: string, metadata: any): string {
    return `You are an expert story assessment engine. Read the following story and return a JSON object with your detailed analysis. DO NOT include any explanations, comments, or extra text. Return ONLY valid JSON. Use double quotes for all keys and string values. No trailing commas. Ensure all brackets and braces are properly closed.

STORY: """
${storyContent}
"""
AGE: ${metadata.childAge || 10}
TITLE: ${metadata.storyTitle || ''}
GENRE: ${metadata.expectedGenre || ''}
COLLABORATIVE: ${metadata.isCollaborativeStory ? 'true' : 'false'}

The JSON object must have this structure (do NOT include any example values, just use your own analysis):
{
  "overallScore": number,
  "status": string,
  "statusMessage": string,
  "integrityAnalysis": {
    "aiDetection": {
      "humanLikeScore": number,
      "aiLikelihood": string,
      "confidenceLevel": number,
      "analysis": string,
      "riskLevel": string,
      "indicators": array
    },
    "plagiarismCheck": {
      "originalityScore": number,
      "riskLevel": string,
      "violations": array,
      "status": string
    },
    "overallStatus": string,
    "message": string,
    "recommendation": string
  },
  "coreWritingSkills": {
    "grammar": {"score": number, "feedback": string},
    "vocabulary": {"score": number, "feedback": string},
    "creativity": {"score": number, "feedback": string},
    "structure": {"score": number, "feedback": string}
  },
  "storyDevelopment": {
    "characterDevelopment": {"score": number, "feedback": string},
    "plotDevelopment": {"score": number, "feedback": string},
    "descriptiveWriting": {"score": number, "feedback": string}
  },
  "advancedElements": {
    "sensoryDetails": {"score": number, "feedback": string},
    "plotLogic": {"score": number, "feedback": string},
    "themeRecognition": {"score": number, "feedback": string},
    "problemSolving": {"score": number, "feedback": string}
  },
  "ageAnalysis": {
    "ageAppropriateness": number,
    "readingLevel": string,
    "contentSuitability": string
  },
  "comprehensiveFeedback": {
    "strengths": array,
    "areasForEnhancement": array,
    "nextSteps": array,
    "teacherAssessment": string
  },
  "educationalRecommendations": {
    "immediate": array,
    "longTerm": array,
    "practice": array
  },
  "overallRating": string,
  "recognitionLevel": string,
  "finalSummary": string
}

Return ONLY the JSON object with your analysis for the story above.`;
  }

  private static extractAndValidateJSON(response: string): any {
    let jsonStr = response.trim();
    try {
      // Log the raw response for debugging
      console.log('Raw AI response:', jsonStr);

      // Remove markdown code blocks and language tags
      jsonStr = jsonStr.replace(/```json[\s\S]*?({[\s\S]*?})[\s\S]*?```/g, '$1');
      jsonStr = jsonStr.replace(/```[a-z]*\s*/gi, '').replace(/```\s*$/g, '');

      // Find JSON boundaries
      const start = jsonStr.indexOf('{');
      const end = jsonStr.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        jsonStr = jsonStr.substring(start, end + 1);
      }

      // Remove trailing commas (common AI error)
      jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');

      // Replace single quotes with double quotes (if any)
      jsonStr = jsonStr.replace(/'/g, '"');

      // Attempt to auto-correct missing brackets or commas
      const bracketMismatch = (jsonStr.match(/\{/g)?.length || 0) - (jsonStr.match(/\}/g)?.length || 0);
      if (bracketMismatch > 0) {
        jsonStr += '}'.repeat(bracketMismatch); // Add missing closing brackets
      }

      // Validate JSON structure
      if (!jsonStr.startsWith('{') || !jsonStr.endsWith('}')) {
        throw new Error('Invalid JSON structure detected.');
      }

      // Try to parse - will throw if invalid
      const parsed = JSON.parse(jsonStr);

      // Log the cleaned JSON for debugging
      console.log('Cleaned JSON:', jsonStr);

      return parsed;
    } catch (error) {
      console.error('Failed to parse JSON response:', jsonStr);
      console.error('Parsing error:', error);

      // Return a minimal error object for fallback
      return {
        error: 'Invalid JSON response',
        details: (error as Error).message,
      };
    }
  }

  private static transformAssessment(assessment: any): any {
    // Return the full structure, but use only AI values, null for missing (including nested fields)
    return {
      overallScore: assessment.overallScore ?? null,
      status: assessment.status ?? null,
      statusMessage: assessment.statusMessage ?? null,
      integrityAnalysis: assessment.integrityAnalysis ? {
        aiDetection: assessment.integrityAnalysis.aiDetection ? {
          humanLikeScore: assessment.integrityAnalysis.aiDetection.humanLikeScore ?? null,
          aiLikelihood: assessment.integrityAnalysis.aiDetection.aiLikelihood ?? null,
          confidenceLevel: assessment.integrityAnalysis.aiDetection.confidenceLevel ?? null,
          analysis: assessment.integrityAnalysis.aiDetection.analysis ?? null,
          riskLevel: assessment.integrityAnalysis.aiDetection.riskLevel ?? null,
          indicators: assessment.integrityAnalysis.aiDetection.indicators ?? null
        } : null,
        plagiarismCheck: assessment.integrityAnalysis.plagiarismCheck ? {
          originalityScore: assessment.integrityAnalysis.plagiarismCheck.originalityScore ?? null,
          riskLevel: assessment.integrityAnalysis.plagiarismCheck.riskLevel ?? null,
          violations: assessment.integrityAnalysis.plagiarismCheck.violations ?? null,
          status: assessment.integrityAnalysis.plagiarismCheck.status ?? null
        } : null,
        overallStatus: assessment.integrityAnalysis.overallStatus ?? null,
        message: assessment.integrityAnalysis.message ?? null,
        recommendation: assessment.integrityAnalysis.recommendation ?? null
      } : null,
      coreWritingSkills: assessment.coreWritingSkills ? {
        grammar: assessment.coreWritingSkills.grammar ?? null,
        vocabulary: assessment.coreWritingSkills.vocabulary ?? null,
        creativity: assessment.coreWritingSkills.creativity ?? null,
        structure: assessment.coreWritingSkills.structure ?? null
      } : null,
      storyDevelopment: assessment.storyDevelopment ? {
        characterDevelopment: assessment.storyDevelopment.characterDevelopment ?? null,
        plotDevelopment: assessment.storyDevelopment.plotDevelopment ?? null,
        descriptiveWriting: assessment.storyDevelopment.descriptiveWriting ?? null
      } : null,
      advancedElements: assessment.advancedElements ? {
        sensoryDetails: assessment.advancedElements.sensoryDetails ?? null,
        plotLogic: assessment.advancedElements.plotLogic ?? null,
        themeRecognition: assessment.advancedElements.themeRecognition ?? null,
        problemSolving: assessment.advancedElements.problemSolving ?? null
      } : null,
      ageAnalysis: assessment.ageAnalysis ? {
        ageAppropriateness: assessment.ageAnalysis.ageAppropriateness ?? null,
        readingLevel: assessment.ageAnalysis.readingLevel ?? null,
        contentSuitability: assessment.ageAnalysis.contentSuitability ?? null
      } : null,
      comprehensiveFeedback: assessment.comprehensiveFeedback ? {
        strengths: assessment.comprehensiveFeedback.strengths ?? null,
        areasForEnhancement: assessment.comprehensiveFeedback.areasForEnhancement ?? null,
        nextSteps: assessment.comprehensiveFeedback.nextSteps ?? null,
        teacherAssessment: assessment.comprehensiveFeedback.teacherAssessment ?? null
      } : null,
      detailedBreakdown: assessment.detailedBreakdown ? {
        riskFactors: assessment.detailedBreakdown.riskFactors ? {
          aiDetectionRisk: assessment.detailedBreakdown.riskFactors.aiDetectionRisk ?? null,
          plagiarismRisk: assessment.detailedBreakdown.riskFactors.plagiarismRisk ?? null,
          overallRisk: assessment.detailedBreakdown.riskFactors.overallRisk ?? null
        } : null,
        educationalRecommendations: assessment.detailedBreakdown.educationalRecommendations ? {
          immediate: assessment.detailedBreakdown.educationalRecommendations.immediate ?? null,
          longTerm: assessment.detailedBreakdown.educationalRecommendations.longTerm ?? null,
          practice: assessment.detailedBreakdown.educationalRecommendations.practice ?? null
        } : null
      } : null,
      finalSummary: assessment.finalSummary ?? null,
      overallRating: assessment.overallRating ?? null,
      recognitionLevel: assessment.recognitionLevel ?? null
    };
  }

  // Removed createMinimalAssessment. No fallback, only AI or error.
}