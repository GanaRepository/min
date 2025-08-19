// components/DownloadStoryButtons.tsx
import React from 'react';
import { WordGenerator } from '@/lib/export/word-generator';
import { PDFGenerator } from '@/lib/export/pdf-generator';

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

interface Props {
  story: StoryData;
}

export const DownloadStoryButtons: React.FC<Props> = ({ story }) => {
  const handleDownloadWord = async () => {
    const generator = new WordGenerator();
    const blob = await generator.generateStoryDocument(story);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${story.title}.docx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    const generator = new PDFGenerator();
    const blob = generator.generateStoryPDF(story);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${story.title}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={handleDownloadWord}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-semibold shadow-md transition-all"
      >
        Word
      </button>
      <button
        onClick={handleDownloadPDF}
        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-lg font-semibold shadow-md transition-all"
      >
        PDF
      </button>
    </div>
  );
};
