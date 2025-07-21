// lib/export/pdf-generator.ts
import jsPDF from 'jspdf';

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

export class PDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
    this.currentY = this.margin;
  }

  generateStoryPDF(story: StoryData): Blob {
    this.addHeader(story);
    this.addStoryInfo(story);
    this.addStoryContent(story);
    this.addFooter(story);
    
    return this.doc.output('blob');
  }

  private addHeader(story: StoryData) {
    // Title
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(story.title, this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 15;

    // Author
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`By ${story.authorName}`, this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 10;

    // Date
    this.doc.setFontSize(10);
    this.doc.setTextColor(128, 128, 128);
    const publishDate = new Date(story.publishedAt).toLocaleDateString();
    this.doc.text(`Published on ${publishDate}`, this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 20;

    // Line separator
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 15;
  }

  private addStoryInfo(story: StoryData) {
    this.doc.setFontSize(12);
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Story Elements:', this.margin, this.currentY);
    this.currentY += 8;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    
    const elements = [
      `Genre: ${story.elements.genre}`,
      `Character: ${story.elements.character}`,
      `Setting: ${story.elements.setting}`,
      `Theme: ${story.elements.theme}`,
      `Mood: ${story.elements.mood}`,
      `Tone: ${story.elements.tone}`
    ];

    // Display elements in two columns
    const columnWidth = (this.pageWidth - 3 * this.margin) / 2;
    elements.forEach((element, index) => {
      const x = index % 2 === 0 ? this.margin : this.margin + columnWidth + this.margin;
      const y = this.currentY + Math.floor(index / 2) * 6;
      this.doc.text(element, x, y);
    });

    this.currentY += Math.ceil(elements.length / 2) * 6 + 10;

    // Word count and scores
    this.doc.text(`Word Count: ${story.totalWords} words`, this.margin, this.currentY);
    
    if (story.scores) {
      this.currentY += 8;
      this.doc.text(`Scores: Grammar ${story.scores.grammar}% • Creativity ${story.scores.creativity}% • Overall ${story.scores.overall}%`, this.margin, this.currentY);
    }

    this.currentY += 15;

    // Line separator
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 15;
  }

  private addStoryContent(story: StoryData) {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);

    const maxWidth = this.pageWidth - 2 * this.margin;
    const lines = this.doc.splitTextToSize(story.content, maxWidth);

    lines.forEach((line: string) => {
      if (this.currentY > this.pageHeight - 30) {
        this.doc.addPage();
        this.currentY = this.margin;
      }
      
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += 6;
    });
  }

  private addFooter(story: StoryData) {
    const totalPages = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      
      // Footer line
      this.doc.setDrawColor(200, 200, 200);
      this.doc.line(this.margin, this.pageHeight - 20, this.pageWidth - this.margin, this.pageHeight - 20);
      
      // Footer text
      this.doc.setFontSize(8);
      this.doc.setTextColor(128, 128, 128);
      this.doc.text('Created with Mintoons', this.margin, this.pageHeight - 10);
      this.doc.text(`Page ${i} of ${totalPages}`, this.pageWidth - this.margin, this.pageHeight - 10, { align: 'right' });
    }
  }
}