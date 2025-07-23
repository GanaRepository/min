// app/api/stories/pending-elements/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Use the same in-memory store as store-pending-elements
// In production, this should be Redis or database
const pendingElements = new Map<string, { elements: any; timestamp: number }>();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    const stored = pendingElements.get(token);

    if (!stored) {
      return NextResponse.json(
        { error: 'Token not found or expired' },
        { status: 404 }
      );
    }

    // Check if expired
    if (Date.now() > stored.timestamp) {
      pendingElements.delete(token);
      return NextResponse.json({ error: 'Token expired' }, { status: 410 });
    }

    console.log(
      `📦 Retrieved pending elements with token: ${token.substring(0, 8)}...`
    );

    // Clean up after use
    pendingElements.delete(token);

    return NextResponse.json({
      success: true,
      elements: stored.elements,
    });
  } catch (error) {
    console.error('Error retrieving pending elements:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve elements' },
      { status: 500 }
    );
  }
}
