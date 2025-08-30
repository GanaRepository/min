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
    console.log('Starting Pure AI Three-Part Assessment...');

    if (!storyContent || storyContent.trim().length < 50) {
      throw new Error('Content too short for meaningful assessment');
    }

    try {
      const [part1, part2, part3] = await Promise.all([
        this.assessCoreFundamentals(storyContent, metadata),
        this.assessStoryElements(storyContent, metadata),
        this.assessAdvancedElements(storyContent, metadata)
      ]);

      const combinedAssessment = this.combineAssessments(part1, part2, part3);
      console.log('Pure AI assessment completed successfully');
      return combinedAssessment;

    } catch (error) {
      console.error('Pure AI assessment failed:', error);
      throw new Error(`Assessment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Part 1: Core Writing Fundamentals + AI Detection (Factors 1-6, 29-32)
  private static async assessCoreFundamentals(storyContent: string, metadata: any): Promise<any> {
    const prompt = `You are an expert writing teacher. Analyze this story comprehensively across ALL 42 factors.

CRITICAL INSTRUCTION: Provide complete detailed analysis for ALL factors regardless of content concerns, AI detection results, or any other issues. Even if you detect AI usage, plagiarism, or inappropriate content, still analyze all writing aspects thoroughly. Students deserve complete educational feedback.

STORY: """
${storyContent}
"""

STUDENT AGE: ${metadata.childAge || 'Unknown'}
STORY TITLE: ${metadata.storyTitle || 'Untitled'}

Analyze ALL 42 factors and return ONLY valid JSON with complete analysis for every factor:

{
  "overallScore": [0-100],
  "status": "[Approved/Flagged/Review]",
  "statusMessage": "[brief message]",
  "coreWritingMechanics": {
    "grammarSyntax": {"score": [0-100], "analysis": "[detailed analysis]"},
    "vocabularyRange": {"score": [0-100], "analysis": "[detailed analysis]"},
    "spellingPunctuation": {"score": [0-100], "analysis": "[detailed analysis]"},
    "sentenceStructure": {"score": [0-100], "analysis": "[detailed analysis]"},
    "tenseConsistency": {"score": [0-100], "analysis": "[detailed analysis]"},
    "voiceTone": {"score": [0-100], "analysis": "[detailed analysis]"}
  },
  "storyElements": {
    "plotDevelopmentPacing": {"score": [0-100], "analysis": "[detailed analysis]"},
    "characterDevelopment": {"score": [0-100], "analysis": "[detailed analysis]"},
    "settingWorldBuilding": {"score": [0-100], "analysis": "[detailed analysis]"},
    "dialogueQuality": {"score": [0-100], "analysis": "[detailed analysis]"},
    "themeRecognition": {"score": [0-100], "analysis": "[detailed analysis]"},
    "conflictResolution": {"score": [0-100], "analysis": "[detailed analysis]"}
  },
  "creativeSkills": {
    "originalityCreativity": {"score": [0-100], "analysis": "[detailed analysis]"},
    "imageryDescriptiveWriting": {"score": [0-100], "analysis": "[detailed analysis]"},
    "sensoryDetailsUsage": {"score": [0-100], "analysis": "[detailed analysis]"},
    "metaphorFigurativeLanguage": {"score": [0-100], "analysis": "[detailed analysis]"},
    "emotionalDepth": {"score": [0-100], "analysis": "[detailed analysis]"},
    "showVsTellBalance": {"score": [0-100], "analysis": "[detailed analysis]"}
  },
  "structureOrganization": {
    "storyArcCompletion": {"score": [0-100], "analysis": "[detailed analysis]"},
    "paragraphOrganization": {"score": [0-100], "analysis": "[detailed analysis]"},
    "transitionsBetweenIdeas": {"score": [0-100], "analysis": "[detailed analysis]"},
    "openingClosingEffectiveness": {"score": [0-100], "analysis": "[detailed analysis]"},
    "logicalFlow": {"score": [0-100], "analysis": "[detailed analysis]"}
  },
  "advancedElements": {
    "foreshadowing": {"score": [0-100], "analysis": "[detailed analysis]"},
    "symbolismRecognition": {"score": [0-100], "analysis": "[detailed analysis]"},
    "pointOfViewConsistency": {"score": [0-100], "analysis": "[detailed analysis]"},
    "moodAtmosphereCreation": {"score": [0-100], "analysis": "[detailed analysis]"},
    "culturalSensitivity": {"score": [0-100], "analysis": "[detailed analysis]"}
  },
  "aiDetectionAnalysis": {
    "writingPatternAnalysis": {"score": [0-100], "analysis": "[detailed analysis]"},
    "authenticityMarkers": {"score": [0-100], "analysis": "[detailed analysis]"},
    "ageAppropriateLanguage": {"score": [0-100], "analysis": "[detailed analysis]"},
    "personalVoiceRecognition": {"score": [0-100], "analysis": "[detailed analysis]"},
    "overallResult": "[Human-written/AI-generated/Mixed/Uncertain]",
    "confidenceLevel": [0.0-1.0]
  },
  "educationalFeedback": {
    "strengthsIdentification": {"analysis": "[detailed strengths list]"},
    "areasForImprovement": {"analysis": "[detailed improvement areas]"},
    "gradeLevelAssessment": {"analysis": "[detailed grade level analysis]"},
    "readingLevelEvaluation": {"analysis": "[detailed reading level analysis]"},
    "teachersHolisticAssessment": {"analysis": "[detailed teacher assessment]"},
    "personalizedLearningPath": {"analysis": "[detailed learning recommendations]"},
    "practiceExerciseRecommendations": {"analysis": "[detailed practice exercises]"},
    "genreExplorationSuggestions": {"analysis": "[detailed genre suggestions]"},
    "vocabularyBuildingExercises": {"analysis": "[detailed vocabulary exercises]"},
    "grammarFocusAreas": {"analysis": "[detailed grammar focus areas]"}
  },
  "overallAssessment": "[A+ through F with justification]",
  "finalSummary": "[comprehensive summary of all findings]"
}

REMEMBER: Complete analysis for ALL 42 factors regardless of status determination. Educational value comes from comprehensive feedback, not from withholding analysis based on content concerns.`;

    const response = await smartAIProvider.generateResponse(prompt);
    return this.parseJSON(response);
  }

  // Part 2: Story Elements & Structure (Factors 7-12, 19-23)
  private static async assessStoryElements(storyContent: string, metadata: any): Promise<any> {
    const prompt = `You are an expert story analyst. Analyze this story's elements and structure.

STORY: """
${storyContent}
"""

STUDENT AGE: ${metadata.childAge || 'Unknown'}

Provide detailed analysis for each factor. Return ONLY valid JSON:

{
  "plotDevelopmentPacing": {
    "score": [your score out of 100],
    "analysis": "[detailed analysis of plot structure, pacing, story progression]"
  },
  "characterDevelopment": {
    "score": [your score out of 100],
    "analysis": "[assessment of character creation, consistency, growth, believability]"
  },
  "settingWorldBuilding": {
    "score": [your score out of 100],
    "analysis": "[evaluation of setting description, world-building, atmosphere creation]"
  },
  "dialogueQuality": {
    "score": [your score out of 100],
    "analysis": "[analysis of dialogue naturalness, character voice, effectiveness]"
  },
  "themeRecognition": {
    "score": [your score out of 100],
    "analysis": "[identification and development of themes, deeper meanings]"
  },
  "conflictResolution": {
    "score": [your score out of 100],
    "analysis": "[assessment of conflict establishment and resolution effectiveness]"
  },
  "storyArcCompletion": {
    "score": [your score out of 100],
    "analysis": "[evaluation of beginning, middle, end structure and completeness]"
  },
  "paragraphOrganization": {
    "score": [your score out of 100],
    "analysis": "[assessment of paragraph structure, logical organization]"
  },
  "transitionsBetweenIdeas": {
    "score": [your score out of 100],
    "analysis": "[analysis of smooth transitions, flow between concepts]"
  },
  "openingClosingEffectiveness": {
    "score": [your score out of 100],
    "analysis": "[evaluation of story opening and ending impact, memorability]"
  },
  "logicalFlow": {
    "score": [your score out of 100],
    "analysis": "[assessment of story logic, sequence, coherence]"
  }
}`;

    const response = await smartAIProvider.generateResponse(prompt);
    return this.parseJSON(response);
  }

  // Part 3: Advanced Elements & Educational Feedback (Factors 13-18, 24-28, 33-42)
  private static async assessAdvancedElements(storyContent: string, metadata: any): Promise<any> {
    const prompt = `You are an expert creative writing instructor. Analyze this story's advanced elements and provide educational feedback.

STORY: """
${storyContent}
"""

STUDENT AGE: ${metadata.childAge || 'Unknown'}

Provide detailed analysis for each factor. Return ONLY valid JSON:

{
  "originalityCreativity": {
    "score": [your score out of 100],
    "analysis": "[assessment of originality, creative thinking, unique elements]"
  },
  "imageryDescriptiveWriting": {
    "score": [your score out of 100],
    "analysis": "[evaluation of visual imagery, descriptive language, scene painting]"
  },
  "sensoryDetailsUsage": {
    "score": [your score out of 100],
    "analysis": "[analysis of five senses usage, sensory immersion]"
  },
  "metaphorFigurativeLanguage": {
    "score": [your score out of 100],
    "analysis": "[assessment of metaphors, similes, figurative language effectiveness]"
  },
  "emotionalDepth": {
    "score": [your score out of 100],
    "analysis": "[evaluation of emotional resonance, feeling conveyance, depth]"
  },
  "showVsTellBalance": {
    "score": [your score out of 100],
    "analysis": "[analysis of showing vs telling technique, scene vs summary]"
  },
  "foreshadowing": {
    "score": [your score out of 100],
    "analysis": "[assessment of foreshadowing techniques, setup and payoff]"
  },
  "symbolismRecognition": {
    "score": [your score out of 100],
    "analysis": "[identification and use of symbols, deeper meanings]"
  },
  "pointOfViewConsistency": {
    "score": [your score out of 100],
    "analysis": "[evaluation of POV maintenance, narrative perspective consistency]"
  },
  "moodAtmosphereCreation": {
    "score": [your score out of 100],
    "analysis": "[assessment of mood establishment, atmospheric writing]"
  },
  "culturalSensitivity": {
    "score": [your score out of 100],
    "analysis": "[evaluation of cultural awareness, sensitivity, inclusivity]"
  },
  "strengthsIdentification": {
    "analysis": "[list of specific story strengths and what the writer does well]"
  },
  "areasForImprovement": {
    "analysis": "[specific areas needing development and improvement suggestions]"
  },
  "gradeLevelAssessment": {
    "analysis": "[assessment of writing level compared to grade expectations]"
  },
  "readingLevelEvaluation": {
    "analysis": "[evaluation of text complexity and reading level]"
  },
  "teachersHolisticAssessment": {
    "analysis": "[overall teacher assessment of the work and student potential]"
  },
  "personalizedLearningPath": {
    "analysis": "[customized learning recommendations for this specific student]"
  },
  "practiceExerciseRecommendations": {
    "analysis": "[specific writing exercises to help improve identified weaknesses]"
  },
  "genreExplorationSuggestions": {
    "analysis": "[genre recommendations based on student's demonstrated interests/skills]"
  },
  "vocabularyBuildingExercises": {
    "analysis": "[targeted vocabulary development activities]"
  },
  "grammarFocusAreas": {
    "analysis": "[specific grammar areas to focus on for improvement]"
  },
  "overallAssessment": "[A+/A/B+/B/C+/C/D+/D/F with brief justification]",
  "finalSummary": "[comprehensive summary of assessment and student potential]"
}`;

    const response = await smartAIProvider.generateResponse(prompt);
    return this.parseJSON(response);
  }

  private static parseJSON(response: string): any {
    try {
      let jsonStr = response.trim();
      // Remove markdown code blocks
      jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      // Find JSON boundaries
      const start = jsonStr.indexOf('{');
      const end = jsonStr.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        jsonStr = jsonStr.substring(start, end + 1);
      }
      // Clean up common JSON issues
      jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1'); // Remove trailing commas
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('JSON parsing failed:', error);
      console.error('Raw response:', response);
      let message = 'Unknown error';
      if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
        message = (error as any).message;
      }
      throw new Error(`Invalid JSON response from AI: ${message}`);
    }
  }

  private static combineAssessments(part1: any, part2: any, part3: any): any {
    // Calculate overall score from all individual scores
    function extractScore(item: unknown): number | undefined {
      if (typeof item === 'object' && item !== null && 'score' in item) {
        const score = (item as any).score;
        if (typeof score === 'number') return score;
      }
      return undefined;
    }

    const allScores = [
      ...Object.values(part1).map(extractScore).filter((score): score is number => typeof score === 'number'),
      ...Object.values(part2).map(extractScore).filter((score): score is number => typeof score === 'number'),
      ...Object.values(part3).map(extractScore).filter((score): score is number => typeof score === 'number')
    ];

    const overallScore = allScores.length > 0 ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length : 0;

    return {
      overallScore: Math.round(overallScore),
      status: overallScore >= 70 ? "Approved" : "Needs Improvement",
      statusMessage: part3.finalSummary || "Assessment completed",

      // Core Writing Mechanics (1-6)
      coreWritingSkills: {
        grammar: part1.grammarSyntax,
        vocabulary: part1.vocabularyRange,
        spelling: part1.spellingPunctuation,
        sentenceStructure: part1.sentenceStructure,
        tenseConsistency: part1.tenseConsistency,
        voiceTone: part1.voiceTone
      },

      // Story Elements (7-12)
      storyDevelopment: {
        plotDevelopment: part2.plotDevelopmentPacing,
        characterDevelopment: part2.characterDevelopment,
        settingWorldBuilding: part2.settingWorldBuilding,
        dialogueQuality: part2.dialogueQuality,
        themeRecognition: part2.themeRecognition,
        conflictResolution: part2.conflictResolution
      },

      // Creative & Literary Skills (13-18)
      creativeSkills: {
        originalityCreativity: part3.originalityCreativity,
        imageryDescriptiveWriting: part3.imageryDescriptiveWriting,
        sensoryDetailsUsage: part3.sensoryDetailsUsage,
        metaphorFigurativeLanguage: part3.metaphorFigurativeLanguage,
        emotionalDepth: part3.emotionalDepth,
        showVsTellBalance: part3.showVsTellBalance
      },

      // Structure & Organization (19-23)
      structureOrganization: {
        storyArcCompletion: part2.storyArcCompletion,
        paragraphOrganization: part2.paragraphOrganization,
        transitionsBetweenIdeas: part2.transitionsBetweenIdeas,
        openingClosingEffectiveness: part2.openingClosingEffectiveness,
        logicalFlow: part2.logicalFlow
      },

      // Advanced Elements (24-28)
      advancedElements: {
        foreshadowing: part3.foreshadowing,
        symbolismRecognition: part3.symbolismRecognition,
        pointOfViewConsistency: part3.pointOfViewConsistency,
        moodAtmosphereCreation: part3.moodAtmosphereCreation,
        culturalSensitivity: part3.culturalSensitivity
      },

      // AI Detection Analysis (29-32)
      integrityAnalysis: {
        aiDetection: {
          writingPatterns: part1.writingPatterns,
          authenticityMarkers: part1.authenticityMarkers,
          ageAppropriateLanguage: part1.ageAppropriateLanguage,
          personalVoiceRecognition: part1.personalVoiceRecognition,
          result: part1.aiDetectionResult,
          confidenceLevel: part1.confidenceLevel
        }
      },

      // Educational Feedback (33-42)
      educationalFeedback: {
        strengths: part3.strengthsIdentification,
        areasForImprovement: part3.areasForImprovement,
        gradeLevelAssessment: part3.gradeLevelAssessment,
        readingLevelEvaluation: part3.readingLevelEvaluation,
        teachersHolisticAssessment: part3.teachersHolisticAssessment,
        personalizedLearningPath: part3.personalizedLearningPath,
        practiceExerciseRecommendations: part3.practiceExerciseRecommendations,
        genreExplorationSuggestions: part3.genreExplorationSuggestions,
        vocabularyBuildingExercises: part3.vocabularyBuildingExercises,
        grammarFocusAreas: part3.grammarFocusAreas
      },

      overallAssessment: part3.overallAssessment,
      finalSummary: part3.finalSummary
    };
  }
}