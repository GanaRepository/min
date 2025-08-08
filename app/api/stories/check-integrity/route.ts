// app/api/stories/check-integrity/route.ts - NEW FILE
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { AssessmentEngine } from '@/lib/ai/assessment-engine';
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

    const { content, checkType = 'both' } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
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

    let results: any = {};

    try {
      if (checkType === 'plagiarism' || checkType === 'both') {
        console.log('🔍 Running plagiarism check...');
        const plagiarismResult = await AssessmentEngine.checkPlagiarismOnly(content, childAge);
        results.plagiarism = {
          score: plagiarismResult.score,
          riskLevel: plagiarismResult.riskLevel,
          violations: plagiarismResult.violations?.slice(0, 5) || [], // Limit to top 5 violations
          suggestions: plagiarismResult.suggestions?.slice(0, 3) || [],
        };
      }

      if (checkType === 'ai' || checkType === 'both') {
        console.log('🤖 Running AI detection...');
        const aiResult = await AssessmentEngine.checkAIContentOnly(content, childAge);
        results.aiDetection = {
          score: aiResult.score,
          likelihood: aiResult.likelihood,
          confidence: aiResult.confidence,
          indicators: aiResult.indicators?.slice(0, 5) || [], // Limit to top 5 indicators
          suggestions: aiResult.suggestions?.slice(0, 3) || [],
        };
      }

      // Calculate overall integrity score
      let overallIntegrityScore = 100;
      let overallRisk = 'low';

      if (results.plagiarism && results.aiDetection) {
        overallIntegrityScore = Math.min(results.plagiarism.score, results.aiDetection.score);
        
        if (results.plagiarism.riskLevel === 'critical' || results.aiDetection.likelihood === 'very_high') {
          overallRisk = 'critical';
        } else if (results.plagiarism.riskLevel === 'high' || results.aiDetection.likelihood === 'high') {
          overallRisk = 'high';
        } else if (results.plagiarism.riskLevel === 'medium' || results.aiDetection.likelihood === 'medium') {
          overallRisk = 'medium';
        }
      } else if (results.plagiarism) {
        overallIntegrityScore = results.plagiarism.score;
        overallRisk = results.plagiarism.riskLevel;
      } else if (results.aiDetection) {
        overallIntegrityScore = results.aiDetection.score;
        overallRisk = results.aiDetection.likelihood === 'very_high' ? 'critical' : 
                     results.aiDetection.likelihood === 'high' ? 'high' :
                     results.aiDetection.likelihood === 'medium' ? 'medium' : 'low';
      }

      // Generate recommendations
      const recommendations = [];
      if (overallIntegrityScore < 70) {
        recommendations.push("Review your content to ensure it's completely original");
        recommendations.push("Write in your own words based on your experiences and imagination");
      }
      if (results.plagiarism?.riskLevel !== 'low') {
        recommendations.push("Avoid copying text from books, websites, or other sources");
      }
      if (results.aiDetection?.likelihood !== 'very_low' && results.aiDetection?.likelihood !== 'low') {
        recommendations.push("Make sure you're writing your own original content, not using AI tools");
      }

      console.log(`✅ Integrity check completed - Score: ${overallIntegrityScore}%, Risk: ${overallRisk}`);

      return NextResponse.json({
        success: true,
        results: {
          ...results,
          overall: {
            integrityScore: overallIntegrityScore,
            riskLevel: overallRisk,
            isOriginal: overallIntegrityScore >= 80 && overallRisk === 'low',
            recommendations,
          }
        },
        wordCount,
        checkType,
        message: overallIntegrityScore >= 80 && overallRisk === 'low' 
          ? 'Content appears to be original!'
          : 'Content may have integrity issues. Please review the suggestions.',
      });

    } catch (checkError) {
      console.error('❌ Integrity check failed:', checkError);
      
      return NextResponse.json({
        success: false,
        error: 'Integrity check temporarily unavailable',
        details: checkError instanceof Error ? checkError.message : 'Unknown error',
        wordCount,
        checkType,
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Integrity check endpoint error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process integrity check',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}