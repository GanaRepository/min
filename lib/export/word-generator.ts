// lib/export/word-generator.ts - FIXED STRUCTURE AND FORMATTING
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
} from 'docx';

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

export class WordGenerator {
  generateStoryDocument(story: StoryData): Promise<Blob> {
    const sections: Paragraph[] = [];

    // Cover Page
    sections.push(...this.createCoverPage(story));

    // Assessment Section (if available)
    if (story.assessment) {
      sections.push(new Paragraph({ children: [], pageBreakBefore: true }));
      sections.push(...this.createAssessmentSection(story.assessment));
    }

    // Story Content Section
    sections.push(new Paragraph({ children: [], pageBreakBefore: true }));
    sections.push(...this.createStoryContent(story));

    // Footer
    sections.push(
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
        spacing: { before: 800 },
      })
    );

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: sections,
        },
      ],
    });

    return Packer.toBlob(doc);
  }

  private createCoverPage(story: StoryData): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    // Title (Large and Centered)
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: story.title,
            bold: true,
            size: 40,
            color: '2C3E50',
          }),
        ],
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 400 },
      })
    );

    // Author
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `By ${story.authorName}`,
            size: 24,
            color: '34495E',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );

    // Publication date
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Published on ${new Date(story.publishedAt).toLocaleDateString()}`,
            size: 20,
            color: '7F8C8D',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
      })
    );

    // Story Information Section
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Story Information',
            bold: true,
            size: 28,
            color: '2E86C1',
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 300 },
      })
    );

    // Word count (prominent)
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Word Count: ${story.totalWords} words`,
            size: 22,
            bold: true,
            color: '2C3E50',
          }),
        ],
        spacing: { after: 300 },
      })
    );

    // Story elements (if available)
    if (story.elements) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Story Elements:',
              bold: true,
              size: 18,
              color: '2C3E50',
            }),
          ],
          spacing: { before: 200, after: 200 },
        })
      );

      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Genre: ${story.elements.genre} • Character: ${story.elements.character} • Setting: ${story.elements.setting}`,
              size: 16,
              color: '34495E',
            }),
          ],
          spacing: { after: 150 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Theme: ${story.elements.theme} • Mood: ${story.elements.mood} • Tone: ${story.elements.tone}`,
              size: 16,
              color: '34495E',
            }),
          ],
          spacing: { after: 400 },
        })
      );
    }

    // Basic scores (if no assessment available)
    if (story.scores && !story.assessment) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Quick Assessment Scores',
              bold: true,
              size: 18,
              color: '2C3E50',
            }),
          ],
          spacing: { before: 300, after: 200 },
        })
      );

      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Grammar: ${story.scores.grammar}% • Creativity: ${story.scores.creativity}% • Overall: ${story.scores.overall}%`,
              size: 16,
              color: this.getScoreColor(story.scores.overall),
            }),
          ],
          spacing: { after: 200 },
        })
      );
    }

    return paragraphs;
  }

  private createAssessmentSection(assessment: any): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    // Assessment Results Header
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Assessment Results',
            bold: true,
            size: 32,
            color: '2E86C1',
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 400 },
      })
    );

    // Overall Score (prominent)
    if (assessment.overallScore) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Overall Score: ${assessment.overallScore}%`,
              bold: true,
              size: 28,
              color: this.getScoreColor(assessment.overallScore),
            }),
          ],
          spacing: { after: 400 },
        })
      );
    }

    // Content Integrity
    if (assessment.integrityAnalysis) {
      paragraphs.push(
        ...this.createSection('Content Integrity', () => {
          const sectionParagraphs: Paragraph[] = [];

          if (assessment.integrityAnalysis.overallStatus) {
            sectionParagraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Status: ${assessment.integrityAnalysis.overallStatus}`,
                    size: 18,
                    color: '2C3E50',
                  }),
                ],
                spacing: { after: 150 },
              })
            );
          }

          if (assessment.integrityAnalysis.aiDetection) {
            sectionParagraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `AI Detection: ${assessment.integrityAnalysis.aiDetection.aiLikelihood} (${assessment.integrityAnalysis.aiDetection.humanLikeScore}% human-like)`,
                    size: 18,
                    color: '2C3E50',
                  }),
                ],
                spacing: { after: 150 },
              })
            );
          }

          if (assessment.integrityAnalysis.plagiarismCheck) {
            sectionParagraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Originality: ${assessment.integrityAnalysis.plagiarismCheck.originalityScore}% (${assessment.integrityAnalysis.plagiarismCheck.riskLevel} risk)`,
                    size: 18,
                    color: '2C3E50',
                  }),
                ],
                spacing: { after: 150 },
              })
            );
          }

          return sectionParagraphs;
        })
      );
    }

    // Core Writing Skills
    if (assessment.coreWritingSkills) {
      paragraphs.push(
        ...this.createSection('Core Writing Skills', () => {
          const sectionParagraphs: Paragraph[] = [];
          const skills = [
            { name: 'Grammar', data: assessment.coreWritingSkills.grammar },
            {
              name: 'Vocabulary',
              data: assessment.coreWritingSkills.vocabulary,
            },
            {
              name: 'Creativity',
              data: assessment.coreWritingSkills.creativity,
            },
            { name: 'Structure', data: assessment.coreWritingSkills.structure },
          ];

          skills.forEach((skill) => {
            if (skill.data) {
              sectionParagraphs.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${skill.name}: ${skill.data.score}%`,
                      bold: true,
                      size: 20,
                      color: this.getScoreColor(skill.data.score),
                    }),
                  ],
                  spacing: { after: 150 },
                })
              );

              if (skill.data.feedback) {
                sectionParagraphs.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: skill.data.feedback,
                        size: 16,
                        color: '555555',
                      }),
                    ],
                    spacing: { after: 250 },
                  })
                );
              }
            }
          });

          return sectionParagraphs;
        })
      );
    }

    // Story Development
    if (assessment.storyDevelopment) {
      paragraphs.push(
        ...this.createSection('Story Development', () => {
          const sectionParagraphs: Paragraph[] = [];
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
              sectionParagraphs.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${element.name}: ${element.data.score}%`,
                      bold: true,
                      size: 20,
                      color: this.getScoreColor(element.data.score),
                    }),
                  ],
                  spacing: { after: 150 },
                })
              );

              if (element.data.feedback) {
                sectionParagraphs.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: element.data.feedback,
                        size: 16,
                        color: '555555',
                      }),
                    ],
                    spacing: { after: 250 },
                  })
                );
              }
            }
          });

          return sectionParagraphs;
        })
      );
    }

    // Advanced Elements
    if (assessment.advancedElements) {
      paragraphs.push(
        ...this.createSection('Advanced Elements', () => {
          const sectionParagraphs: Paragraph[] = [];
          const elements = [
            {
              name: 'Sensory Details',
              data: assessment.advancedElements.sensoryDetails,
            },
            { name: 'Plot Logic', data: assessment.advancedElements.plotLogic },
            {
              name: 'Theme Recognition',
              data: assessment.advancedElements.themeRecognition,
            },
            {
              name: 'Problem Solving',
              data: assessment.advancedElements.problemSolving,
            },
          ];

          elements.forEach((element) => {
            if (element.data) {
              sectionParagraphs.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${element.name}: ${element.data.score}%`,
                      bold: true,
                      size: 20,
                      color: this.getScoreColor(element.data.score),
                    }),
                  ],
                  spacing: { after: 150 },
                })
              );

              if (element.data.feedback) {
                sectionParagraphs.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: element.data.feedback,
                        size: 16,
                        color: '555555',
                      }),
                    ],
                    spacing: { after: 250 },
                  })
                );
              }
            }
          });

          return sectionParagraphs;
        })
      );
    }

    // Comprehensive Feedback
    if (assessment.comprehensiveFeedback) {
      paragraphs.push(
        ...this.createSection('Detailed Feedback', () => {
          const sectionParagraphs: Paragraph[] = [];

          // Strengths
          if (assessment.comprehensiveFeedback.strengths?.length > 0) {
            sectionParagraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Your Strengths:',
                    bold: true,
                    size: 20,
                    color: '27AE60',
                  }),
                ],
                spacing: { before: 200, after: 200 },
              })
            );

            assessment.comprehensiveFeedback.strengths.forEach(
              (strength: string) => {
                sectionParagraphs.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `• ${strength}`,
                        size: 16,
                        color: '2C3E50',
                      }),
                    ],
                    spacing: { after: 150 },
                  })
                );
              }
            );
          }

          // Areas for Enhancement
          if (
            assessment.comprehensiveFeedback.areasForEnhancement?.length > 0
          ) {
            sectionParagraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Areas to Improve:',
                    bold: true,
                    size: 20,
                    color: 'E67E22',
                  }),
                ],
                spacing: { before: 300, after: 200 },
              })
            );

            assessment.comprehensiveFeedback.areasForEnhancement.forEach(
              (area: string) => {
                sectionParagraphs.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `• ${area}`,
                        size: 16,
                        color: '2C3E50',
                      }),
                    ],
                    spacing: { after: 150 },
                  })
                );
              }
            );
          }

          // Next Steps
          if (assessment.comprehensiveFeedback.nextSteps?.length > 0) {
            sectionParagraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Next Steps:',
                    bold: true,
                    size: 20,
                    color: '8E44AD',
                  }),
                ],
                spacing: { before: 300, after: 200 },
              })
            );

            assessment.comprehensiveFeedback.nextSteps.forEach(
              (step: string) => {
                sectionParagraphs.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `• ${step}`,
                        size: 16,
                        color: '2C3E50',
                      }),
                    ],
                    spacing: { after: 150 },
                  })
                );
              }
            );
          }

          // Teacher Assessment
          if (assessment.comprehensiveFeedback.teacherAssessment) {
            sectionParagraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Teacher's Assessment:",
                    bold: true,
                    size: 20,
                    color: '3498DB',
                  }),
                ],
                spacing: { before: 300, after: 200 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: assessment.comprehensiveFeedback.teacherAssessment,
                    size: 16,
                    color: '2C3E50',
                  }),
                ],
                spacing: { after: 400 },
              })
            );
          }

          return sectionParagraphs;
        })
      );
    }

    // Age Analysis
    if (assessment.ageAnalysis) {
      paragraphs.push(
        ...this.createSection('Age Analysis', () => {
          return [
            new Paragraph({
              children: [
                new TextRun({
                  text: `Age Appropriateness: ${assessment.ageAnalysis.ageAppropriateness}%`,
                  size: 16,
                  color: '2C3E50',
                }),
              ],
              spacing: { after: 150 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Reading Level: ${assessment.ageAnalysis.readingLevel}`,
                  size: 16,
                  color: '2C3E50',
                }),
              ],
              spacing: { after: 150 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Content Suitability: ${assessment.ageAnalysis.contentSuitability}`,
                  size: 16,
                  color: '2C3E50',
                }),
              ],
              spacing: { after: 150 },
            }),
          ];
        })
      );
    }

    return paragraphs;
  }

  private createSection(
    title: string,
    contentFn: () => Paragraph[]
  ): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    // Section header
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: title,
            bold: true,
            size: 24,
            color: '2C3E50',
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 300 },
      })
    );

    // Section content
    paragraphs.push(...contentFn());

    return paragraphs;
  }

  private createStoryContent(story: StoryData): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    // Story content header
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Story Content',
            bold: true,
            size: 32,
            color: '2E86C1',
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 400 },
      })
    );

    // Split content into paragraphs and add them
    const contentParagraphs = story.content
      .split('\n\n')
      .filter((p) => p.trim());

    contentParagraphs.forEach((paragraph) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: paragraph.trim(),
              size: 20,
              color: '2C3E50',
            }),
          ],
          spacing: { after: 300 },
          alignment: AlignmentType.JUSTIFIED,
        })
      );
    });

    return paragraphs;
  }

  private getScoreColor(score: number): string {
    if (score >= 85) return '27AE60'; // Green
    if (score >= 70) return '3498DB'; // Blue
    if (score >= 60) return 'F39C12'; // Orange
    return 'E74C3C'; // Red
  }
}
