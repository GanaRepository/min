// lib/export/pdf-generator.ts - Updated for 42-Factor Assessment

import jsPDF from 'jspdf';

interface ComprehensiveStoryData {
  title: string;
  content: string;
  totalWords: number;
  authorName: string;
  publishedAt: string;
  assessment?: {
    overallScore?: number;
    status?: string;
    statusMessage?: string;
    allFactors?: {
      // Core Writing Mechanics (1-6)
      grammarSyntax?: { score: number; analysis: string };
      vocabularyRange?: { score: number; analysis: string };
      spellingPunctuation?: { score: number; analysis: string };
      sentenceStructure?: { score: number; analysis: string };
      tenseConsistency?: { score: number; analysis: string };
      voiceTone?: { score: number; analysis: string };
      
      // Story Elements (7-12)
      plotDevelopmentPacing?: { score: number; analysis: string };
      characterDevelopment?: { score: number; analysis: string };
      settingWorldBuilding?: { score: number; analysis: string };
      dialogueQuality?: { score: number; analysis: string };
      themeRecognition?: { score: number; analysis: string };
      conflictResolution?: { score: number; analysis: string };
      
      // Creative Skills (13-18)
      originalityCreativity?: { score: number; analysis: string };
      imageryDescriptiveWriting?: { score: number; analysis: string };
      sensoryDetailsUsage?: { score: number; analysis: string };
      metaphorFigurativeLanguage?: { score: number; analysis: string };
      emotionalDepth?: { score: number; analysis: string };
      showVsTellBalance?: { score: number; analysis: string };
      
      // Structure & Organization (19-23)
      storyArcCompletion?: { score: number; analysis: string };
      paragraphOrganization?: { score: number; analysis: string };
      transitionsBetweenIdeas?: { score: number; analysis: string };
      openingClosingEffectiveness?: { score: number; analysis: string };
      logicalFlow?: { score: number; analysis: string };
      
      // Advanced Elements (24-28)
      foreshadowing?: { score: number; analysis: string };
      symbolismRecognition?: { score: number; analysis: string };
      pointOfViewConsistency?: { score: number; analysis: string };
      moodAtmosphereCreation?: { score: number; analysis: string };
      culturalSensitivity?: { score: number; analysis: string };
      
      // AI Detection (29-32)
      writingPatternAnalysis?: { score: number; analysis: string };
      authenticityMarkers?: { score: number; analysis: string };
      ageAppropriateLanguage?: { score: number; analysis: string };
      personalVoiceRecognition?: { score: number; analysis: string };
      
      // Educational Feedback (33-42)
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

export class ComprehensivePDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;
  private readonly FOOTER_HEIGHT = 25;

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
    this.currentY = this.margin;
  }

  generateStoryPDF(story: ComprehensiveStoryData): Blob {
    // Page 1: Cover Page
    this.addCoverPage(story);

    // Page 2-N: Comprehensive 42-Factor Assessment
    if (story.assessment?.allFactors) {
      this.doc.addPage();
      this.currentY = this.margin;
      this.addComprehensive42FactorAssessment(story.assessment);
    }

    // Final Page: Story Content
    this.doc.addPage();
    this.currentY = this.margin;
    this.addStoryContent(story);

    this.addFooters();
    return this.doc.output('blob');
  }

  private addCoverPage(story: ComprehensiveStoryData) {
    // Title
    this.doc.setFontSize(28);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(story.title, this.pageWidth / 2, 40, { align: 'center' });

    // Author
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`By ${story.authorName}`, this.pageWidth / 2, 60, { align: 'center' });

    // Overall Score (if available)
    if (story.assessment?.overallScore) {
      this.doc.setFontSize(20);
      this.doc.setFont('helvetica', 'bold');
      const [r, g, b] = this.getScoreColor(story.assessment.overallScore);
      this.doc.setTextColor(r, g, b);
      this.doc.text(
        `Overall Score: ${story.assessment.overallScore}%`,
        this.pageWidth / 2,
        85,
        { align: 'center' }
      );
    }

    // Word Count
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(`Word Count: ${story.totalWords} words`, this.pageWidth / 2, 110, {
      align: 'center',
    });

    // AI Detection Result (if available)
    if (story.assessment?.aiDetectionResult) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      const resultColor = story.assessment.aiDetectionResult.result === 'Human-written' ? [0, 100, 0] : [200, 0, 0];
      this.doc.setTextColor(resultColor[0], resultColor[1], resultColor[2]);
      this.doc.text(
        `Authenticity: ${story.assessment.aiDetectionResult.result}`,
        this.pageWidth / 2,
        130,
        { align: 'center' }
      );
    }
  }

  private addComprehensive42FactorAssessment(assessment: any) {
    // Assessment Header
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 50, 120);
    this.doc.text('Comprehensive 42-Factor Assessment', this.margin, this.currentY);
    this.currentY += 20;

    // Core Writing Mechanics (Factors 1-6)
    this.addFactorSection('Core Writing Mechanics (Factors 1-6)', [
      { name: '1. Grammar & Syntax', data: assessment.allFactors.grammarSyntax },
      { name: '2. Vocabulary Range', data: assessment.allFactors.vocabularyRange },
      { name: '3. Spelling & Punctuation', data: assessment.allFactors.spellingPunctuation },
      { name: '4. Sentence Structure', data: assessment.allFactors.sentenceStructure },
      { name: '5. Tense Consistency', data: assessment.allFactors.tenseConsistency },
      { name: '6. Voice & Tone', data: assessment.allFactors.voiceTone },
    ]);

    // Story Elements (Factors 7-12)
    this.addFactorSection('Story Elements (Factors 7-12)', [
      { name: '7. Plot Development & Pacing', data: assessment.allFactors.plotDevelopmentPacing },
      { name: '8. Character Development', data: assessment.allFactors.characterDevelopment },
      { name: '9. Setting & World-building', data: assessment.allFactors.settingWorldBuilding },
      { name: '10. Dialogue Quality', data: assessment.allFactors.dialogueQuality },
      { name: '11. Theme Recognition', data: assessment.allFactors.themeRecognition },
      { name: '12. Conflict Resolution', data: assessment.allFactors.conflictResolution },
    ]);

    // Creative & Literary Skills (Factors 13-18)
    this.addFactorSection('Creative & Literary Skills (Factors 13-18)', [
      { name: '13. Originality & Creativity', data: assessment.allFactors.originalityCreativity },
      { name: '14. Imagery & Descriptive Writing', data: assessment.allFactors.imageryDescriptiveWriting },
      { name: '15. Sensory Details Usage', data: assessment.allFactors.sensoryDetailsUsage },
      { name: '16. Metaphor & Figurative Language', data: assessment.allFactors.metaphorFigurativeLanguage },
      { name: '17. Emotional Depth', data: assessment.allFactors.emotionalDepth },
      { name: '18. Show vs Tell Balance', data: assessment.allFactors.showVsTellBalance },
    ]);

    // Structure & Organization (Factors 19-23)
    this.addFactorSection('Structure & Organization (Factors 19-23)', [
      { name: '19. Story Arc Completion', data: assessment.allFactors.storyArcCompletion },
      { name: '20. Paragraph Organization', data: assessment.allFactors.paragraphOrganization },
      { name: '21. Transitions Between Ideas', data: assessment.allFactors.transitionsBetweenIdeas },
      { name: '22. Opening & Closing Effectiveness', data: assessment.allFactors.openingClosingEffectiveness },
      { name: '23. Logical Flow', data: assessment.allFactors.logicalFlow },
    ]);

    // Advanced Elements (Factors 24-28)
    this.addFactorSection('Advanced Elements (Factors 24-28)', [
      { name: '24. Foreshadowing', data: assessment.allFactors.foreshadowing },
      { name: '25. Symbolism Recognition', data: assessment.allFactors.symbolismRecognition },
      { name: '26. Point of View Consistency', data: assessment.allFactors.pointOfViewConsistency },
      { name: '27. Mood & Atmosphere Creation', data: assessment.allFactors.moodAtmosphereCreation },
      { name: '28. Cultural Sensitivity', data: assessment.allFactors.culturalSensitivity },
    ]);

    // AI Detection Analysis (Factors 29-32)
    this.addFactorSection('AI Detection Analysis (Factors 29-32)', [
      { name: '29. Writing Pattern Analysis', data: assessment.allFactors.writingPatternAnalysis },
      { name: '30. Authenticity Markers', data: assessment.allFactors.authenticityMarkers },
      { name: '31. Age-Appropriate Language', data: assessment.allFactors.ageAppropriateLanguage },
      { name: '32. Personal Voice Recognition', data: assessment.allFactors.personalVoiceRecognition },
    ]);

    // Educational Feedback (Factors 33-42)
    this.addEducationalFeedbackSection('Educational Feedback (Factors 33-42)', assessment.allFactors);
  }

  private addFactorSection(sectionTitle: string, factors: Array<{name: string, data: any}>) {
    this.checkPageBreak(30);
    
    // Section Header
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 80, 140);
    this.doc.text(sectionTitle, this.margin, this.currentY);
    this.currentY += 15;

    factors.forEach((factor) => {
      if (factor.data?.score !== undefined && factor.data?.analysis) {
        this.checkPageBreak(25);
        
        // Factor name and score
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(0, 0, 0);
        this.doc.text(
          `${factor.name}: ${factor.data.score}%`,
          this.margin + 5,
          this.currentY
        );
        this.currentY += 8;

        // Analysis
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        const analysisLines = this.doc.splitTextToSize(
          factor.data.analysis,
          this.pageWidth - 2 * this.margin - 15
        );
        
        analysisLines.forEach((line: string) => {
          this.checkPageBreak(6);
          this.doc.text(line, this.margin + 10, this.currentY);
          this.currentY += 5;
        });
        this.currentY += 5;
      }
    });
    this.currentY += 5;
  }

  private addEducationalFeedbackSection(sectionTitle: string, factors: any) {
    this.checkPageBreak(40);
    
    // Section Header
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 80, 140);
    this.doc.text(sectionTitle, this.margin, this.currentY);
    this.currentY += 15;

    const educationalFactors = [
      { name: '33. Strengths Identification', data: factors.strengthsIdentification },
      { name: '34. Areas for Improvement', data: factors.areasForImprovement },
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
        this.checkPageBreak(20);
        
        // Factor name
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(0, 0, 0);
        this.doc.text(factor.name, this.margin + 5, this.currentY);
        this.currentY += 8;

        // Analysis
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        const analysisLines = this.doc.splitTextToSize(
          factor.data.analysis,
          this.pageWidth - 2 * this.margin - 15
        );
        
        analysisLines.forEach((line: string) => {
          this.checkPageBreak(6);
          this.doc.text(line, this.margin + 10, this.currentY);
          this.currentY += 5;
        });
        this.currentY += 8;
      }
    });
  }

  private addStoryContent(story: ComprehensiveStoryData) {
    // Story Content Header
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 50, 120);
    this.doc.text('Story Content', this.margin, this.currentY);
    this.currentY += 20;

    // Story text
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);

    const paragraphs = story.content.split('\n\n');
    paragraphs.forEach((paragraph) => {
      const lines = this.doc.splitTextToSize(paragraph.trim(), this.pageWidth - 2 * this.margin);
      lines.forEach((line: string) => {
        this.checkPageBreak(6);
        this.doc.text(line, this.margin, this.currentY);
        this.currentY += 6;
      });
      this.currentY += 4; // Extra space between paragraphs
    });
  }

  private checkPageBreak(requiredSpace: number) {
    if (this.currentY + requiredSpace > this.pageHeight - this.FOOTER_HEIGHT) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  private getScoreColor(score: number): [number, number, number] {
    if (score >= 90) return [0, 150, 0]; // Green
    if (score >= 80) return [100, 150, 0]; // Yellow-green
    if (score >= 70) return [200, 150, 0]; // Orange
    if (score >= 60) return [200, 100, 0]; // Red-orange
    return [200, 0, 0]; // Red
  }

  private addFooters() {
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(
        `42-Factor Comprehensive Assessment - Page ${i} of ${pageCount}`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: 'center' }
      );
    }
  }
}