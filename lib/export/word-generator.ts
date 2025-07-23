// lib/export/word-generator.ts
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from 'docx';

interface StoryData {
  title: string;
  content: string;
  totalWords: number;
  authorName: string;
  publishedAt: string;
  elements: {
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
}

export class WordGenerator {
  generateStoryDocument(story: StoryData): Promise<Blob> {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Title
            new Paragraph({
              children: [
                new TextRun({
                  text: story.title,
                  bold: true,
                  size: 32,
                }),
              ],
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
            }),

            // Author
            new Paragraph({
              children: [
                new TextRun({
                  text: `By ${story.authorName}`,
                  size: 24,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),

            // Publication date
            new Paragraph({
              children: [
                new TextRun({
                  text: `Published on ${new Date(story.publishedAt).toLocaleDateString()}`,
                  size: 20,
                  color: '666666',
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),

            // Story Elements
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Story Elements',
                  bold: true,
                  size: 24,
                }),
              ],
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 },
            }),

            // Elements list
            new Paragraph({
              children: [
                new TextRun({
                  text: `Genre: ${story.elements.genre} | Character: ${story.elements.character} | Setting: ${story.elements.setting}`,
                  size: 20,
                }),
              ],
              spacing: { after: 100 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Theme: ${story.elements.theme} | Mood: ${story.elements.mood} | Tone: ${story.elements.tone}`,
                  size: 20,
                }),
              ],
              spacing: { after: 200 },
            }),

            // Story stats
            new Paragraph({
              children: [
                new TextRun({
                  text: `Word Count: ${story.totalWords} words`,
                  size: 20,
                  bold: true,
                }),
              ],
              spacing: { after: story.scores ? 100 : 400 },
            }),

            // Scores (if available)
            ...(story.scores
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `Assessment Scores: Grammar ${story.scores.grammar}% • Creativity ${story.scores.creativity}% • Overall ${story.scores.overall}%`,
                        size: 20,
                        color: '0066CC',
                      }),
                    ],
                    spacing: { after: 400 },
                  }),
                ]
              : []),

            // Story content
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Story',
                  bold: true,
                  size: 24,
                }),
              ],
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 },
            }),

            // Split content into paragraphs
            ...story.content.split('\n\n').map(
              (paragraph) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: paragraph.trim(),
                      size: 22,
                    }),
                  ],
                  spacing: { after: 200 },
                  alignment: AlignmentType.JUSTIFIED,
                })
            ),

            // Footer
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Created with Mintoons - Where Young Writers Create Amazing Stories',
                  size: 18,
                  color: '666666',
                  italics: true,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 600 },
            }),
          ],
        },
      ],
    });

    return Packer.toBlob(doc);
  }
}
