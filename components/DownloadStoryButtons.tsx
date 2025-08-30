// components/DownloadStoryButtons.tsx
import React from 'react';
import { Download } from 'lucide-react';

export interface DownloadStoryButtonsProps {
  storyId: string;
  storyTitle: string;
}

export function DownloadStoryButtons({
  storyId,
  storyTitle,
}: DownloadStoryButtonsProps) {
  return (
    <div className="flex gap-3">
      <a
        href={`/api/stories/export/${storyId}/pdf`}
        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        download={`${storyTitle}_assessment.pdf`}
      >
        <Download className="h-4 w-4 mr-2" />
        Download PDF
      </a>
      <a
        href={`/api/stories/export/${storyId}/word`}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        download={`${storyTitle}_assessment.docx`}
      >
        <Download className="h-4 w-4 mr-2" />
        Download Word
      </a>
    </div>
  );
}
