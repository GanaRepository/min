// app/api/stories/export/[storyId]/[format]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession'; // ADDED: Missing import
import Turn from '@/models/Turn'; // ADDED: Missing import
import mongoose from 'mongoose'; // ADDED: Missing import
import { PDFGenerator } from '@/lib/export/pdf-generator';
import { WordGenerator } from '@/lib/export/word-generator';

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

    // FIXED: Get story from StorySession instead of PublishedStory
    let storySession = null;
    let actualSessionId = null;

    if (mongoose.Types.ObjectId.isValid(storyId)) {
      storySession = await StorySession.findOne({
        _id: storyId,
        childId: session.user.id,
        status: 'completed',
      });
      actualSessionId = storyId;
    } else if (!isNaN(Number(storyId))) {
      storySession = await StorySession.findOne({
        storyNumber: Number(storyId),
        childId: session.user.id,
        status: 'completed',
      });
      actualSessionId = storySession?._id?.toString();
    }

    if (!storySession || !actualSessionId) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Get turns and rebuild content
    const turns = await Turn.find({ sessionId: actualSessionId })
      .sort({ turnNumber: 1 })
      .lean();

    const storyParts = [];
    if (storySession.aiOpening) {
      storyParts.push(storySession.aiOpening);
    }
    turns.forEach(turn => {
      if (turn.childInput) storyParts.push(turn.childInput);
      if (turn.aiResponse) storyParts.push(turn.aiResponse);
    });

    // Prepare story data for export
    const storyData = {
      title: storySession.title,
      content: storyParts.join('\n\n'),
      totalWords: storySession.totalWords,
      authorName: `${session.user.firstName} ${session.user.lastName}`,
      publishedAt: storySession.updatedAt.toISOString(),
      elements: storySession.elements,
      scores: {
        grammar: storySession.assessment?.grammarScore || storySession.grammarScore || 0,
        creativity: storySession.assessment?.creativityScore || storySession.creativityScore || 0,
        overall: storySession.assessment?.overallScore || storySession.overallScore || 0,
      },
    };

    // Rest of export logic remains the same...
    let fileBlob: Blob;
    let filename: string;
    let contentType: string;

    if (format === 'pdf') {
      const pdfGenerator = new PDFGenerator();
      fileBlob = pdfGenerator.generateStoryPDF(storyData);
      filename = `${storySession.title}.pdf`;
      contentType = 'application/pdf';
    } else {
      const wordGenerator = new WordGenerator();
      fileBlob = await wordGenerator.generateStoryDocument(storyData);
      filename = `${storySession.title}.docx`;
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

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