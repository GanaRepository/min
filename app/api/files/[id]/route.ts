import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { downloadFile, getFileInfo } from '@/utils/gridfs';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const fileId = params.id;

    // Get file info first
    const fileInfo = await getFileInfo(fileId);
    if (!fileInfo) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Get file stream
    const fileStream = await downloadFile(fileId);

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of fileStream) {
      if (typeof chunk === 'string') {
        chunks.push(Buffer.from(chunk));
      } else {
        chunks.push(chunk);
      }
    }
    const buffer = Buffer.concat(chunks);

    // Return file with proper headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': fileInfo.contentType,
        'Content-Length': fileInfo.size.toString(),
        'Content-Disposition': `attachment; filename="${fileInfo.filename}"`,
      },
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    );
  }
}
