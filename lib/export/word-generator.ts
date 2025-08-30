// lib/export/word-generator.ts - Fixed for 13-Factor Assessment
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
} from 'docx';

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

export class StoryWordGenerator {
  async generateStoryDocument(story: StoryDataWith13Factor): Promise<Blob> {
    const paragraphs: Paragraph[] = [];

    // Cover Page
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: story.title, bold: true, size: 36 })],
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        children: [new TextRun({ text: `By ${story.authorName}`, size: 24 })],
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `Word Count: ${story.totalWords}`, size: 20 }),
        ],
        alignment: AlignmentType.CENTER,
      })
    );

    if (story.assessment?.assessmentDate) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Assessed on: ${story.assessment.assessmentDate}`,
              size: 18,
              color: '666666',
            }),
          ],
          alignment: AlignmentType.CENTER,
        })
      );
    }

    paragraphs.push(new Paragraph({ children: [new PageBreak()] }));

    // Assessment
    if (story.assessment) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '13-Factor Teacher Assessment',
              bold: true,
              size: 28,
            }),
          ],
          heading: HeadingLevel.HEADING_1,
        })
      );

      const categories = [
        {
          title: 'Core Language Skills',
          items: story.assessment.coreLanguageSkills,
        },
        {
          title: 'Storytelling Skills',
          items: story.assessment.storytellingSkills,
        },
        {
          title: 'Creative & Expressive Skills',
          items: story.assessment.creativeExpressiveSkills,
        },
        {
          title: 'Authenticity & Growth',
          items: story.assessment.authenticityGrowth,
        },
      ];

      categories.forEach((cat) => {
        if (!cat.items) return;
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: cat.title,
                bold: true,
                size: 24,
                color: '2980B9',
              }),
            ],
            heading: HeadingLevel.HEADING_2,
          })
        );

        Object.entries(cat.items).forEach(([label, feedback]) => {
          if (feedback) {
            paragraphs.push(
              new Paragraph({
                children: [new TextRun({ text: label, bold: true, size: 18 })],
              }),
              new Paragraph({
                children: [new TextRun({ text: feedback, size: 16 })],
              })
            );
          }
        });
      });

      paragraphs.push(new Paragraph({ children: [new PageBreak()] }));
    }

    // Story Content
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Story Content', bold: true, size: 28 }),
        ],
        heading: HeadingLevel.HEADING_1,
      })
    );

    story.content.split('\n\n').forEach((p) => {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: p, size: 20 })],
          alignment: AlignmentType.JUSTIFIED,
        })
      );
    });

    const doc = new Document({ sections: [{ children: paragraphs }] });
    return Packer.toBlob(doc);
  }
}
