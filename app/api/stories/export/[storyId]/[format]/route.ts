// app/api/stories/export/[storyId]/[format]/route.ts - Fixed for 13-Factor Assessment
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
import mongoose from 'mongoose';
import { StoryPDFGenerator } from '@/lib/export/pdf-generator';
import { StoryWordGenerator } from '@/lib/export/word-generator';

export async function GET(
  request: Request,
  { params }: { params: { storyId: string; format: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'child') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { storyId, format } = params;
    if (!['pdf', 'word'].includes(format)) {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }

    await connectToDatabase();

    // Find story
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

    // Build story text
    let storyContent = '';
    if (storySession.isUploadedForAssessment) {
      storyContent = storySession.content || '';
    } else {
      const turns = await Turn.find({ sessionId: actualSessionId }).sort({ turnNumber: 1 }).lean();
      const storyParts = [];
      if (storySession.aiOpening) storyParts.push(storySession.aiOpening);
      turns.forEach((turn) => {
        if (turn.childInput) storyParts.push(turn.childInput);
        if (turn.aiResponse) storyParts.push(turn.aiResponse);
      });
      storyContent = storyParts.join('\n\n');
    }

    // Prepare story + 13-factor assessment
    const storyData = {
      title: storySession.title,
      content: storyContent,
      totalWords: storySession.totalWords || storyContent.split(/\s+/).length,
      authorName: `${session.user.firstName} ${session.user.lastName}`,
      publishedAt: storySession.updatedAt.toISOString(),
      assessment: storySession.assessment, // already in 13-factor format
    };

    let fileBlob: Blob;
    let filename: string;
    let contentType: string;

    if (format === 'pdf') {
      const pdfGen = new StoryPDFGenerator();
      fileBlob = pdfGen.generateStoryPDF(storyData);
      filename = `${storySession.title}_assessment.pdf`;
      contentType = 'application/pdf';
    } else {
      const wordGen = new StoryWordGenerator();
      fileBlob = await wordGen.generateStoryDocument(storyData);
      filename = `${storySession.title}_assessment.docx`;
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
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export story' }, { status: 500 });
  }
}
