// app/api/stories/store-pending-elements/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// In-memory store for pending elements (use Redis in production)
const pendingElements = new Map<string, { elements: any; timestamp: number }>();

// Clean up expired tokens every hour
setInterval(() => {
  const now = Date.now();
  // FIXED: Use forEach instead of for...of to avoid TypeScript iteration error
  pendingElements.forEach((data, token) => {
    if (now > data.timestamp) {
      pendingElements.delete(token);
    }
  });
}, 60 * 60 * 1000); // 1 hour

export async function POST(request: Request) {
  try {
    const { elements } = await request.json();

    // Validate elements
    const requiredElements = ['genre', 'character', 'setting', 'theme', 'mood', 'tone'];
    for (const element of requiredElements) {
      if (!elements[element]) {
        return NextResponse.json(
          { error: `Missing required element: ${element}` },
          { status: 400 }
        );
      }
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Store elements with expiration (30 minutes)
    pendingElements.set(token, {
      elements,
      timestamp: Date.now() + (30 * 60 * 1000) // 30 minutes
    });

    console.log(`📦 Stored pending elements with token: ${token.substring(0, 8)}...`);

    return NextResponse.json({
      success: true,
      token
    });

  } catch (error) {
    console.error('Error storing pending elements:', error);
    return NextResponse.json(
      { error: 'Failed to store elements' },
      { status: 500 }
    );
  }
}