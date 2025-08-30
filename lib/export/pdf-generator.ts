// lib/export/pdf-generator.ts - Fixed for 13-Factor Assessment
import jsPDF from 'jspdf';

interface StoryDataWith13Factor {
  title: string;
  content: string;
  totalWords: number;
  authorName: string;
  publishedAt: string;
  assessment?: {
    coreLanguageSkills?: {
      grammarSentenceClarity?: string;
      vocabularyWordChoice?: string;
      spellingPunctuation?: string;
    };
    storytellingSkills?: {
      plotPacing?: string;
      characterDevelopment?: string;
      settingWorldBuilding?: string;
      dialogueExpression?: string;
      themeMessage?: string;
    };
    creativeExpressiveSkills?: {
      creativityOriginality?: string;
      descriptivePowerEmotionalImpact?: string;
    };
    authenticityGrowth?: {
      ageAppropriatenessAuthorship?: string;
      strengthsAreasToImprove?: string;
      practiceExercises?: string;
    };
    assessmentDate?: string;
  };
}

export class StoryPDFGenerator {
  private doc: jsPDF;
  private margin = 20;
  private currentY: number;

  constructor() {
    this.doc = new jsPDF();
    this.currentY = this.margin;
  }

  generateStoryPDF(story: StoryDataWith13Factor): Blob {
    this.addCover(story);

    if (story.assessment) {
      this.doc.addPage();
      this.currentY = this.margin;
      this.add13FactorAssessment(story.assessment);
    }

    this.doc.addPage();
    this.currentY = this.margin;
    this.addStoryContent(story);

    return this.doc.output('blob');
  }

  private addCover(story: StoryDataWith13Factor) {
    this.doc.setFontSize(24).setFont('helvetica', 'bold');
    this.doc.text(story.title, 105, 40, { align: 'center' });

    this.doc.setFontSize(14).setFont('helvetica', 'normal');
    this.doc.text(`By ${story.authorName}`, 105, 55, { align: 'center' });

    this.doc.text(`Word Count: ${story.totalWords}`, 105, 70, {
      align: 'center',
    });

    if (story.assessment?.assessmentDate) {
      this.doc.setFontSize(12);
      this.doc.text(
        `Assessed on: ${story.assessment.assessmentDate}`,
        105,
        85,
        { align: 'center' }
      );
    }
  }

  private add13FactorAssessment(
    assessment: StoryDataWith13Factor['assessment']
  ) {
    this.doc.setFontSize(18).setFont('helvetica', 'bold');
    this.doc.text('13-Factor Teacher Assessment', this.margin, this.currentY);
    this.currentY += 10;

    const categories = [
      { title: 'Core Language Skills', items: assessment?.coreLanguageSkills },
      { title: 'Storytelling Skills', items: assessment?.storytellingSkills },
      {
        title: 'Creative & Expressive Skills',
        items: assessment?.creativeExpressiveSkills,
      },
      { title: 'Authenticity & Growth', items: assessment?.authenticityGrowth },
    ];

    this.doc.setFontSize(12).setFont('helvetica', 'normal');
    categories.forEach((cat) => {
      if (!cat.items) return;
      this.currentY += 8;
      this.doc
        .setFont('helvetica', 'bold')
        .text(cat.title, this.margin, this.currentY);
      this.currentY += 6;

      Object.entries(cat.items).forEach(([label, feedback]) => {
        if (feedback) {
          this.doc.setFont('helvetica', 'normal');
          const wrapped = this.doc.splitTextToSize(
            `${label}: ${feedback}`,
            170
          );
          wrapped.forEach((line: any) => {
            this.currentY += 5;
            this.doc.text(line, this.margin + 5, this.currentY);
          });
        }
      });
    });
  }

  private addStoryContent(story: StoryDataWith13Factor) {
    this.doc.setFontSize(18).setFont('helvetica', 'bold');
    this.doc.text('Story Content', this.margin, this.currentY);
    this.currentY += 10;

    this.doc.setFontSize(11).setFont('helvetica', 'normal');
    const paragraphs = story.content.split('\n\n');
    paragraphs.forEach((p) => {
      const wrapped = this.doc.splitTextToSize(p, 170);
      wrapped.forEach((line: any) => {
        this.currentY += 6;
        this.doc.text(line, this.margin, this.currentY);
      });
      this.currentY += 4;
    });
  }
}
