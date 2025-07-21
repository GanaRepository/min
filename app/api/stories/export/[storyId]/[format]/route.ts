// app/api/stories/export/[storyId]/[format]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import PublishedStory from '@/models/PublishedStory';
import { PDFGenerator } from '@/lib/export/pdf-generator';
import { WordGenerator } from '@/lib/export/word-generator';

interface PublishedStoryType {
  _id: string;
  title: string;
  content: string;
  totalWords: number;
  grammarScore: number;
  creativityScore: number;
  overallScore: number;
  publishedAt: Date;
}

export async function GET(
  request: Request,
  { params }: { params: { storyId: string; format: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    const { storyId, format } = params;

    if (!['pdf', 'word'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Use "pdf" or "word".' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get the story with proper typing
    const story = await PublishedStory.findOne({
      _id: storyId,
      childId: session.user.id
    }).lean() as PublishedStoryType | null;

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // Prepare story data
    const storyData = {
      title: story.title,
      content: story.content,
      totalWords: story.totalWords,
      authorName: `${session.user.firstName} ${session.user.lastName}`,
      publishedAt: story.publishedAt.toISOString(),
      elements: {
        genre: 'Fantasy', // These should be stored in the story
        character: 'Explorer',
        setting: 'Forest',
        theme: 'Adventure',
        mood: 'Exciting',
        tone: 'Brave'
      },
      scores: {
        grammar: story.grammarScore,
        creativity: story.creativityScore,
        overall: story.overallScore
      }
    };

    let fileBlob: Blob;
    let filename: string;
    let contentType: string;

    if (format === 'pdf') {
      const pdfGenerator = new PDFGenerator();
      fileBlob = pdfGenerator.generateStoryPDF(storyData);
      filename = `${story.title}.pdf`;
      contentType = 'application/pdf';
    } else {
      const wordGenerator = new WordGenerator();
      fileBlob = await wordGenerator.generateStoryDocument(storyData);
      filename = `${story.title}.docx`;
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    // Convert blob to buffer for NextJS response
    const buffer = Buffer.from(await fileBlob.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error exporting story:', error);
    return NextResponse.json(
      { error: 'Failed to export story' },
      { status: 500 }
    );
  }
}