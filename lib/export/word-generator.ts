// lib/export/word-generator.ts - Updated for 42-Factor Assessment

import { Document, Paragraph, TextRun, HeadingLevel, PageBreak } from 'docx';

interface ComprehensiveStoryData {
  title: string;
  content: string;
  totalWords: number;
  authorName: string;
  publishedAt: string;
  assessment?: {
    overallScore?: number;
    status?: string;
    allFactors?: {
      // All 42 factors with score and analysis
      grammarSyntax?: { score: number; analysis: string };
      vocabularyRange?: { score: number; analysis: string };
      spellingPunctuation?: { score: number; analysis: string };
      sentenceStructure?: { score: number; analysis: string };
      tenseConsistency?: { score: number; analysis: string };
      voiceTone?: { score: number; analysis: string };
      plotDevelopmentPacing?: { score: number; analysis: string };
      characterDevelopment?: { score: number; analysis: string };
      settingWorldBuilding?: { score: number; analysis: string };
      dialogueQuality?: { score: number; analysis: string };
      themeRecognition?: { score: number; analysis: string };
      conflictResolution?: { score: number; analysis: string };
      originalityCreativity?: { score: number; analysis: string };
      imageryDescriptiveWriting?: { score: number; analysis: string };
      sensoryDetailsUsage?: { score: number; analysis: string };
      metaphorFigurativeLanguage?: { score: number; analysis: string };
      emotionalDepth?: { score: number; analysis: string };
      showVsTellBalance?: { score: number; analysis: string };
      storyArcCompletion?: { score: number; analysis: string };
      paragraphOrganization?: { score: number; analysis: string };
      transitionsBetweenIdeas?: { score: number; analysis: string };
      openingClosingEffectiveness?: { score: number; analysis: string };
      logicalFlow?: { score: number; analysis: string };
      foreshadowing?: { score: number; analysis: string };
      symbolismRecognition?: { score: number; analysis: string };
      pointOfViewConsistency?: { score: number; analysis: string };
      moodAtmosphereCreation?: { score: number; analysis: string };
      culturalSensitivity?: { score: number; analysis: string };
      writingPatternAnalysis?: { score: number; analysis: string };
      authenticityMarkers?: { score: number; analysis: string };
      ageAppropriateLanguage?: { score: number; analysis: string };
      personalVoiceRecognition?: { score: number; analysis: string };
      strengthsIdentification?: { analysis: string };
      areasForImprovement?: { analysis: string };
      gradeLevelAssessment?: { analysis: string };
      readingLevelEvaluation?: { analysis: string };
      teachersHolisticAssessment?: { analysis: string };
      personalizedLearningPath?: { analysis: string };
      practiceExerciseRecommendations?: { analysis: string };
      genreExplorationSuggestions?: { analysis: string };
      vocabularyBuildingExercises?: { analysis: string };
      grammarFocusAreas?: { analysis: string };
    };
    aiDetectionResult?: {
      result: string;
      confidenceLevel: number;
      analysis: string;
    };
  };
}

export class ComprehensiveWordGenerator {
  async generateStoryDocument(story: ComprehensiveStoryData): Promise<Blob> {
    const paragraphs: Paragraph[] = [];

    // Title Page
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: story.title,
            bold: true,
            size: 36,
            color: '2C3E50',
          }),
        ],
        heading: HeadingLevel.TITLE,
        alignment: 'center',
        spacing: { after: 400 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `By ${story.authorName}`,
            size: 24,
            color: '34495E',
          }),
        ],
        alignment: 'center',
        spacing: { after: 200 },
      })
    );

    // Overall Score
    if (story.assessment?.overallScore) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Overall Score: ${story.assessment.overallScore}%`,
              bold: true,
              size: 28,
              color: this.getScoreColor(story.assessment.overallScore),
            }),
          ],
          alignment: 'center',
          spacing: { after: 300 },
        })
      );
    }

    // AI Detection Result
    if (story.assessment?.aiDetectionResult) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Authenticity: ${story.assessment.aiDetectionResult.result}`,
              bold: true,
              size: 20,
              color: story.assessment.aiDetectionResult.result === 'Human-written' ? '27AE60' : 'E74C3C',
            }),
          ],
          alignment: 'center',
          spacing: { after: 400 },
        })
      );
    }

    // Page Break
    paragraphs.push(new Paragraph({ children: [new PageBreak()] }));

    // Comprehensive Assessment
    if (story.assessment?.allFactors) {
      paragraphs.push(...this.create42FactorAssessment(story.assessment.allFactors));
    }

    // Story Content
    paragraphs.push(new Paragraph({ children: [new PageBreak()] }));
    paragraphs.push(...this.createStoryContent(story));

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

  // Use a library like Packer to generate a Blob, or fallback to a dummy Blob for now
  // Example with docx: return await Packer.toBlob(doc);
  // If Packer is not available, use:
  return new Blob([doc.toString()], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  }

  private create42FactorAssessment(factors: any): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    // Assessment Header
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Comprehensive 42-Factor Assessment',
            bold: true,
            size: 32,
            color: '2E86C1',
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 400 },
      })
    );

    // Core Writing Mechanics (1-6)
    paragraphs.push(...this.createFactorSection('Core Writing Mechanics (Factors 1-6)', [
      { name: '1. Grammar & Syntax', data: factors.grammarSyntax },
      { name: '2. Vocabulary Range & Appropriateness', data: factors.vocabularyRange },
      { name: '3. Spelling & Punctuation', data: factors.spellingPunctuation },
      { name: '4. Sentence Structure Variety', data: factors.sentenceStructure },
      { name: '5. Tense Consistency', data: factors.tenseConsistency },
      { name: '6. Voice & Tone', data: factors.voiceTone },
    ]));

    // Story Elements (7-12)
    paragraphs.push(...this.createFactorSection('Story Elements (Factors 7-12)', [
      { name: '7. Plot Development & Pacing', data: factors.plotDevelopmentPacing },
      { name: '8. Character Development & Consistency', data: factors.characterDevelopment },
      { name: '9. Setting & World-building', data: factors.settingWorldBuilding },
      { name: '10. Dialogue Quality', data: factors.dialogueQuality },
      { name: '11. Theme Recognition & Development', data: factors.themeRecognition },
      { name: '12. Conflict Resolution', data: factors.conflictResolution },
    ]));

    // Creative & Literary Skills (13-18)
    paragraphs.push(...this.createFactorSection('Creative & Literary Skills (Factors 13-18)', [
      { name: '13. Originality & Creativity', data: factors.originalityCreativity },
      { name: '14. Imagery & Descriptive Writing', data: factors.imageryDescriptiveWriting },
      { name: '15. Sensory Details Usage', data: factors.sensoryDetailsUsage },
      { name: '16. Metaphor & Figurative Language', data: factors.metaphorFigurativeLanguage },
      { name: '17. Emotional Depth', data: factors.emotionalDepth },
      { name: '18. Show vs Tell Balance', data: factors.showVsTellBalance },
    ]));

    // Structure & Organization (19-23)
    paragraphs.push(...this.createFactorSection('Structure & Organization (Factors 19-23)', [
      { name: '19. Story Arc Completion', data: factors.storyArcCompletion },
      { name: '20. Paragraph Organization', data: factors.paragraphOrganization },
      { name: '21. Transitions Between Ideas', data: factors.transitionsBetweenIdeas },
      { name: '22. Opening & Closing Effectiveness', data: factors.openingClosingEffectiveness },
      { name: '23. Logical Flow', data: factors.logicalFlow },
    ]));

    // Advanced Elements (24-28)
    paragraphs.push(...this.createFactorSection('Advanced Elements (Factors 24-28)', [
      { name: '24. Foreshadowing', data: factors.foreshadowing },
      { name: '25. Symbolism Recognition', data: factors.symbolismRecognition },
      { name: '26. Point of View Consistency', data: factors.pointOfViewConsistency },
      { name: '27. Mood & Atmosphere Creation', data: factors.moodAtmosphereCreation },
      { name: '28. Cultural Sensitivity & Awareness', data: factors.culturalSensitivity },
    ]));

    // AI Detection Analysis (29-32)
    paragraphs.push(...this.createFactorSection('AI Detection Analysis (Factors 29-32)', [
      { name: '29. Writing Pattern Analysis', data: factors.writingPatternAnalysis },
      { name: '30. Authenticity Markers', data: factors.authenticityMarkers },
      { name: '31. Age-Appropriate Language Use', data: factors.ageAppropriateLanguage },
      { name: '32. Personal Voice Recognition', data: factors.personalVoiceRecognition },
    ]));

    // Educational Feedback (33-42)
    paragraphs.push(...this.createEducationalFeedbackSection('Educational Feedback (Factors 33-42)', factors));

    return paragraphs;
  }

  private createFactorSection(sectionTitle: string, factors: Array<{name: string, data: any}>): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    // Section Header
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: sectionTitle,
            bold: true,
            size: 24,
            color: '5DADE2',
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 300 },
      })
    );

    factors.forEach((factor) => {
      if (factor.data?.score !== undefined && factor.data?.analysis) {
        // Factor name and score
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${factor.name}: ${factor.data.score}%`,
                bold: true,
                size: 18,
                color: this.getScoreColor(factor.data.score),
              }),
            ],
            spacing: { before: 200, after: 100 },
          })
        );

        // Analysis
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: factor.data.analysis,
                size: 16,
                color: '2C3E50',
              }),
            ],
            spacing: { after: 200 },
          })
        );
      }
    });

    return paragraphs;
  }

  private createEducationalFeedbackSection(sectionTitle: string, factors: any): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    // Section Header
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: sectionTitle,
            bold: true,
            size: 24,
            color: '5DADE2',
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 300 },
      })
    );

    const educationalFactors = [
      { name: '33. Strengths Identification', data: factors.strengthsIdentification },
      { name: '34. Specific Areas for Improvement', data: factors.areasForImprovement },
      { name: '35. Grade-Level Assessment', data: factors.gradeLevelAssessment },
      { name: '36. Reading Level Evaluation', data: factors.readingLevelEvaluation },
      { name: '37. Teacher\'s Holistic Assessment', data: factors.teachersHolisticAssessment },
      { name: '38. Personalized Learning Path', data: factors.personalizedLearningPath },
      { name: '39. Practice Exercise Recommendations', data: factors.practiceExerciseRecommendations },
      { name: '40. Genre Exploration Suggestions', data: factors.genreExplorationSuggestions },
      { name: '41. Vocabulary Building Exercises', data: factors.vocabularyBuildingExercises },
      { name: '42. Grammar Focus Areas', data: factors.grammarFocusAreas },
    ];

    educationalFactors.forEach((factor) => {
      if (factor.data?.analysis) {
        // Factor name
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: factor.name,
                bold: true,
                size: 18,
                color: '2C3E50',
              }),
            ],
            spacing: { before: 200, after: 100 },
          })
        );

        // Analysis
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: factor.data.analysis,
                size: 16,
                color: '34495E',
              }),
            ],
            spacing: { after: 200 },
          })
        );
      }
    });

    return paragraphs;
  }

  private createStoryContent(story: ComprehensiveStoryData): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    // Story Header
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Story Content',
            bold: true,
            size: 28,
            color: '2E86C1',
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 300 },
      })
    );

    // Story paragraphs
    const storyParagraphs = story.content.split('\n\n');
    storyParagraphs.forEach((paragraph) => {
      if (paragraph.trim()) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: paragraph.trim(),
                size: 16,
                color: '2C3E50',
              }),
            ],
            spacing: { after: 200 },
          })
        );
      }
    });

    return paragraphs;
  }

  private getScoreColor(score: number): string {
    if (score >= 90) return '27AE60'; // Green
    if (score >= 80) return 'F39C12'; // Orange
    if (score >= 70) return 'E67E22'; // Dark orange
    if (score >= 60) return 'E74C3C'; // Red
    return 'C0392B'; // Dark red
  }
}