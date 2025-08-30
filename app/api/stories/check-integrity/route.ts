// app/api/stories/check-integrity/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { SingleCallAssessmentEngine } from '@/lib/ai/SingleCallAssessmentEngine';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { content } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 10) {
      return NextResponse.json(
        { error: 'Content must be at least 10 words for integrity check' },
        { status: 400 }
      );
    }

    const user = await User.findById(session.user.id);
    const childAge = user?.age || 10;

    console.log('⚡ Running integrity + 13-factor assessment...');

    // ✅ Single call to 13-factor assessment
    const assessment = await SingleCallAssessmentEngine.performAssessment(
      content,
      {
        childAge,
        storyTitle: 'Integrity Check',
      }
    );

    // Pull plagiarism + AI detection info from integrityAnalysis (if present)
    const plagiarism = assessment.integrityAnalysis?.plagiarismCheck || {};
    const ai = assessment.integrityAnalysis?.aiDetection || {};

    const results: any = {
      plagiarism: {
        score: plagiarism.originalityScore ?? 100,
        riskLevel: plagiarism.riskLevel ?? 'low',
        violations: plagiarism.violations?.slice(0, 5) || [],
      },
      ai: {
        humanLikeScore: ai.humanLikeScore ?? 100,
        aiLikelihood: ai.aiLikelihood ?? 'low',
        confidenceLevel: ai.confidenceLevel ?? 'low',
        riskLevel: ai.riskLevel ?? 'low',
        indicators: ai.indicators?.slice(0, 5) || [],
      },
    };

    // 🔎 Calculate overall integrity
    let overallIntegrityScore = Math.min(
      results.plagiarism.score,
      results.ai.humanLikeScore
    );
    let overallRisk = 'low';

    if (results.plagiarism.riskLevel === 'critical' || results.ai.aiLikelihood === 'very_high') {
      overallRisk = 'critical';
    } else if (results.plagiarism.riskLevel === 'high' || results.ai.aiLikelihood === 'high') {
      overallRisk = 'high';
    } else if (results.plagiarism.riskLevel === 'medium' || results.ai.aiLikelihood === 'medium') {
      overallRisk = 'medium';
    }

    // 📘 Recommendations
    const recommendations: string[] = [];
    if (overallIntegrityScore < 70) {
      recommendations.push("Review your content to ensure it's completely original");
      recommendations.push('Write in your own words based on your experiences and imagination');
    }
    if (results.plagiarism?.riskLevel !== 'low') {
      recommendations.push('Avoid copying text from books, websites, or other sources');
    }
    if (results.ai?.aiLikelihood && results.ai.aiLikelihood !== 'very_low' && results.ai.aiLikelihood !== 'low') {
      recommendations.push("Make sure you're writing your own original content, not using AI tools");
    }

    console.log(`✅ Integrity check completed - Score: ${overallIntegrityScore}%, Risk: ${overallRisk}`);

    return NextResponse.json({
      success: true,
      assessmentVersion: '1.0-13-factor',
      results: {
        ...results,
        overall: {
          integrityScore: overallIntegrityScore,
          riskLevel: overallRisk,
          isOriginal: overallIntegrityScore >= 80 && overallRisk === 'low',
          recommendations,
        },
      },
      wordCount,
      message:
        overallIntegrityScore >= 80 && overallRisk === 'low'
          ? 'Content appears to be original!'
          : 'Content may have integrity issues. Please review the suggestions.',
    });
  } catch (error) {
    console.error('❌ Integrity check error:', error);
    return NextResponse.json(
      {
        error: 'Integrity check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
