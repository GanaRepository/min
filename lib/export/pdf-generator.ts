// lib/export/pdf-generator.ts - FIXED STRUCTURE AND FORMATTING
import jsPDF from 'jspdf';

interface StoryData {
  title: string;
  content: string;
  totalWords: number;
  authorName: string;
  publishedAt: string;
  elements?: {
    genre: string;
    character: string;
    setting: string;
    theme: string;
    mood: string;
    tone: string;
  };
  scores?: {
    grammar: number;
    creativity: number;
    overall: number;
  };
  assessment?: {
    overallScore?: number;
    integrityAnalysis?: {
      overallStatus: string;
      aiDetection?: {
        humanLikeScore: number;
        aiLikelihood: string;
        riskLevel: string;
      };
      plagiarismCheck?: {
        originalityScore: number;
        riskLevel: string;
      };
    };
    coreWritingSkills?: {
      grammar?: { score: number; feedback: string };
      vocabulary?: { score: number; feedback: string };
      creativity?: { score: number; feedback: string };
      structure?: { score: number; feedback: string };
    };
    storyDevelopment?: {
      characterDevelopment?: { score: number; feedback: string };
      plotDevelopment?: { score: number; feedback: string };
      descriptiveWriting?: { score: number; feedback: string };
    };
    advancedElements?: {
      sensoryDetails?: { score: number; feedback: string };
      plotLogic?: { score: number; feedback: string };
      themeRecognition?: { score: number; feedback: string };
      problemSolving?: { score: number; feedback: string };
    };
    comprehensiveFeedback?: {
      strengths?: string[];
      areasForEnhancement?: string[];
      nextSteps?: string[];
      teacherAssessment?: string;
    };
    ageAnalysis?: {
      ageAppropriateness: number;
      readingLevel: string;
      contentSuitability: string;
    };
  };
}

export class PDFGenerator {
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

  generateStoryPDF(story: StoryData): Blob {
    // Page 1: Cover and Story Info
    this.addCoverPage(story);

    // Assessment Section (if available)
    if (story.assessment) {
      this.doc.addPage();
      this.currentY = this.margin;
      this.addComprehensiveAssessment(story.assessment);
    }

    // Story Content Section
    this.doc.addPage();
    this.currentY = this.margin;
    this.addStoryContent(story);

    // Add footers to all pages
    this.addFooters();

    return this.doc.output('blob');
  }

  private addCoverPage(story: StoryData) {
    // Title (Large)
    this.doc.setFontSize(28);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(story.title, this.pageWidth / 2, 40, { align: 'center' });

    // Author
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`By ${story.authorName}`, this.pageWidth / 2, 60, {
      align: 'center',
    });

    // Date
    this.doc.setFontSize(12);
    this.doc.setTextColor(100, 100, 100);
    const publishDate = new Date(story.publishedAt).toLocaleDateString();
    this.doc.text(`Published on ${publishDate}`, this.pageWidth / 2, 75, {
      align: 'center',
    });

    // Decorative line
    this.doc.setDrawColor(150, 150, 150);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, 90, this.pageWidth - this.margin, 90);

    // Story Information Section
    this.currentY = 110;
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('Story Information', this.margin, this.currentY);
    this.currentY += 20;

    // Word count (prominent)
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(
      `Word Count: ${story.totalWords} words`,
      this.margin,
      this.currentY
    );
    this.currentY += 15;

    // Story elements (if available)
    if (story.elements) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');

      const elements = [
        `Genre: ${story.elements.genre}`,
        `Character: ${story.elements.character}`,
        `Setting: ${story.elements.setting}`,
        `Theme: ${story.elements.theme}`,
        `Mood: ${story.elements.mood}`,
        `Tone: ${story.elements.tone}`,
      ];

      // Two-column layout for elements
      elements.forEach((element, index) => {
        const x = index % 2 === 0 ? this.margin : this.margin + 90;
        if (index % 2 === 0 && index > 0) this.currentY += 8;
        this.doc.text(element, x, this.currentY);
      });
      if (elements.length % 2 !== 0) this.currentY += 8;
    }

    // Basic scores (if no assessment available)
    if (story.scores && !story.assessment) {
      this.currentY += 15;
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Quick Scores', this.margin, this.currentY);
      this.currentY += 10;

      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(
        `Grammar: ${story.scores.grammar}%`,
        this.margin,
        this.currentY
      );
      this.doc.text(
        `Creativity: ${story.scores.creativity}%`,
        this.margin + 60,
        this.currentY
      );
      this.currentY += 8;
      this.doc.text(
        `Overall: ${story.scores.overall}%`,
        this.margin,
        this.currentY
      );
    }
  }

  private addComprehensiveAssessment(assessment: any) {
    // Assessment Results Header
    this.doc.setFontSize(22);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 50, 120);
    this.doc.text('Assessment Results', this.margin, this.currentY);
    this.currentY += 20;

    // Overall Score (prominent)
    if (assessment.overallScore) {
      this.doc.setFontSize(16);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(
        `Overall Score: ${assessment.overallScore}%`,
        this.margin,
        this.currentY
      );
      this.currentY += 15;
    }

    // Content Integrity
    if (assessment.integrityAnalysis) {
      this.addSection('Content Integrity', () => {
        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'normal');

        if (assessment.integrityAnalysis.overallStatus) {
          this.doc.text(
            `Status: ${assessment.integrityAnalysis.overallStatus}`,
            this.margin + 5,
            this.currentY
          );
          this.currentY += 6;
        }

        if (assessment.integrityAnalysis.aiDetection) {
          this.doc.text(
            `AI Detection: ${assessment.integrityAnalysis.aiDetection.aiLikelihood} (${assessment.integrityAnalysis.aiDetection.humanLikeScore}% human-like)`,
            this.margin + 5,
            this.currentY
          );
          this.currentY += 6;
        }

        if (assessment.integrityAnalysis.plagiarismCheck) {
          this.doc.text(
            `Originality: ${assessment.integrityAnalysis.plagiarismCheck.originalityScore}% (${assessment.integrityAnalysis.plagiarismCheck.riskLevel} risk)`,
            this.margin + 5,
            this.currentY
          );
          this.currentY += 6;
        }
      });
    }

    // Core Writing Skills
    if (assessment.coreWritingSkills) {
      this.addSection('Core Writing Skills', () => {
        const skills = [
          { name: 'Grammar', data: assessment.coreWritingSkills.grammar },
          { name: 'Vocabulary', data: assessment.coreWritingSkills.vocabulary },
          { name: 'Creativity', data: assessment.coreWritingSkills.creativity },
          { name: 'Structure', data: assessment.coreWritingSkills.structure },
        ];

        skills.forEach((skill) => {
          if (skill.data) {
            this.doc.setFont('helvetica', 'bold');
            this.doc.setFontSize(11);
            this.doc.text(
              `${skill.name}: ${skill.data.score}%`,
              this.margin + 5,
              this.currentY
            );
            this.currentY += 6;

            if (skill.data.feedback) {
              this.doc.setFont('helvetica', 'normal');
              this.doc.setFontSize(10);
              const feedback = this.doc.splitTextToSize(
                skill.data.feedback,
                this.pageWidth - 2 * this.margin - 10
              );
              feedback.forEach((line: string) => {
                this.checkPageBreak(6);
                this.doc.text(line, this.margin + 10, this.currentY);
                this.currentY += 5;
              });
              this.currentY += 3;
            }
          }
        });
      });
    }

    // Story Development
    if (assessment.storyDevelopment) {
      this.addSection('Story Development', () => {
        const elements = [
          {
            name: 'Character Development',
            data: assessment.storyDevelopment.characterDevelopment,
          },
          {
            name: 'Plot Development',
            data: assessment.storyDevelopment.plotDevelopment,
          },
          {
            name: 'Descriptive Writing',
            data: assessment.storyDevelopment.descriptiveWriting,
          },
        ];

        elements.forEach((element) => {
          if (element.data) {
            this.doc.setFont('helvetica', 'bold');
            this.doc.setFontSize(11);
            this.doc.text(
              `${element.name}: ${element.data.score}%`,
              this.margin + 5,
              this.currentY
            );
            this.currentY += 6;

            if (element.data.feedback) {
              this.doc.setFont('helvetica', 'normal');
              this.doc.setFontSize(10);
              const feedback = this.doc.splitTextToSize(
                element.data.feedback,
                this.pageWidth - 2 * this.margin - 10
              );
              feedback.forEach((line: string) => {
                this.checkPageBreak(6);
                this.doc.text(line, this.margin + 10, this.currentY);
                this.currentY += 5;
              });
              this.currentY += 3;
            }
          }
        });
      });
    }

    // Detailed Feedback
    if (assessment.comprehensiveFeedback) {
      this.addSection('Detailed Feedback', () => {
        // Strengths
        if (assessment.comprehensiveFeedback.strengths?.length > 0) {
          this.doc.setFont('helvetica', 'bold');
          this.doc.setFontSize(11);
          this.doc.text('Strengths:', this.margin + 5, this.currentY);
          this.currentY += 6;

          this.doc.setFont('helvetica', 'normal');
          this.doc.setFontSize(10);
          assessment.comprehensiveFeedback.strengths.forEach(
            (strength: string) => {
              const lines = this.doc.splitTextToSize(
                `• ${strength}`,
                this.pageWidth - 2 * this.margin - 10
              );
              lines.forEach((line: string) => {
                this.checkPageBreak(5);
                this.doc.text(line, this.margin + 10, this.currentY);
                this.currentY += 5;
              });
            }
          );
          this.currentY += 5;
        }

        // Areas for Enhancement
        if (assessment.comprehensiveFeedback.areasForEnhancement?.length > 0) {
          this.doc.setFont('helvetica', 'bold');
          this.doc.setFontSize(11);
          this.doc.text('Areas to Improve:', this.margin + 5, this.currentY);
          this.currentY += 6;

          this.doc.setFont('helvetica', 'normal');
          this.doc.setFontSize(10);
          assessment.comprehensiveFeedback.areasForEnhancement.forEach(
            (area: string) => {
              const lines = this.doc.splitTextToSize(
                `• ${area}`,
                this.pageWidth - 2 * this.margin - 10
              );
              lines.forEach((line: string) => {
                this.checkPageBreak(5);
                this.doc.text(line, this.margin + 10, this.currentY);
                this.currentY += 5;
              });
            }
          );
          this.currentY += 5;
        }

        // Teacher Assessment
        if (assessment.comprehensiveFeedback.teacherAssessment) {
          this.doc.setFont('helvetica', 'bold');
          this.doc.setFontSize(11);
          this.doc.text(
            "Teacher's Assessment:",
            this.margin + 5,
            this.currentY
          );
          this.currentY += 6;

          this.doc.setFont('helvetica', 'normal');
          this.doc.setFontSize(10);
          const lines = this.doc.splitTextToSize(
            assessment.comprehensiveFeedback.teacherAssessment,
            this.pageWidth - 2 * this.margin - 10
          );
          lines.forEach((line: string) => {
            this.checkPageBreak(5);
            this.doc.text(line, this.margin + 10, this.currentY);
            this.currentY += 5;
          });
          this.currentY += 8;
        }
      });
    }

    // Age Analysis
    if (assessment.ageAnalysis) {
      this.addSection('Age Analysis', () => {
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');

        this.doc.text(
          `Age Appropriateness: ${assessment.ageAnalysis.ageAppropriateness}%`,
          this.margin + 5,
          this.currentY
        );
        this.currentY += 6;
        this.doc.text(
          `Reading Level: ${assessment.ageAnalysis.readingLevel}`,
          this.margin + 5,
          this.currentY
        );
        this.currentY += 6;
        this.doc.text(
          `Content Suitability: ${assessment.ageAnalysis.contentSuitability}`,
          this.margin + 5,
          this.currentY
        );
        this.currentY += 6;
      });
    }
  }

  private addSection(title: string, contentFn: () => void) {
    this.checkPageBreak(30);

    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 12;

    contentFn();

    this.currentY += 8;
  }

  private addStoryContent(story: StoryData) {
    // Story Content Header
    this.doc.setFontSize(22);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 50, 120);
    this.doc.text('Story Content', this.margin, this.currentY);
    this.currentY += 20;

    // Story text
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);

    const maxWidth = this.pageWidth - 2 * this.margin;
    const lines = this.doc.splitTextToSize(story.content, maxWidth);

    lines.forEach((line: string) => {
      this.checkPageBreak(7);
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += 6;
    });
  }

  private checkPageBreak(requiredSpace: number) {
    if (this.currentY + requiredSpace > this.pageHeight - this.FOOTER_HEIGHT) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  private addFooters() {
    const totalPages = this.doc.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);

      const footerY = this.pageHeight - 15;

      // Footer line
      this.doc.setDrawColor(200, 200, 200);
      this.doc.setLineWidth(0.3);
      this.doc.line(
        this.margin,
        footerY - 5,
        this.pageWidth - this.margin,
        footerY - 5
      );

      // Footer text
      this.doc.setFontSize(9);
      this.doc.setTextColor(120, 120, 120);
      this.doc.setFont('helvetica', 'normal');

      this.doc.text('Created with Mintoons', this.margin, footerY);
      this.doc.text(
        `Page ${i} of ${totalPages}`,
        this.pageWidth - this.margin,
        footerY,
        { align: 'right' }
      );
    }
  }
}
