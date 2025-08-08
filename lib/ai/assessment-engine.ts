// lib/ai/assessment-engine.ts - COMPLETE UPDATE
import { AdvancedPlagiarismDetector } from './advanced-plagiarism-detector';
import { AdvancedAIDetector } from './advanced-ai-detector';
import { UnifiedAssessmentEngine } from './unified-assessment-engine';
import StorySession from '@/models/StorySession';
import User from '@/models/User';
import { connectToDatabase } from '@/utils/db';

export class AssessmentEngine {
  /**
   * Main assessment method - now uses advanced detection with MongoDB
   */
  static async assessStory(
    storyContent: string,
    sessionId: string,
    userId: string
  ) {
    await connectToDatabase();

    // Get story session and user data
    const [storySession, user] = await Promise.all([
      StorySession.findById(sessionId),
      User.findById(userId)
    ]);

    if (!storySession) {
      throw new Error('Story session not found');
    }

    // Get previous assessments for progress tracking
    const previousSessions = await StorySession.find({
      childId: userId,
      assessment: { $exists: true },
      'assessment.overallScore': { $exists: true }
    }).sort({ createdAt: -1 }).limit(5);

    const previousAttempts = previousSessions.map(session => ({
      assessmentDate: session.completedAt || session.createdAt,
      overallScore: session.assessment?.overallScore || 0,
      categoryScores: {
        grammar: session.assessment?.grammarScore || 0,
        creativity: session.assessment?.creativityScore || 0,
        vocabulary: session.assessment?.vocabularyScore || 0,
        structure: session.assessment?.structureScore || 0,
        characterDevelopment: session.assessment?.characterDevelopmentScore || 0,
        plotDevelopment: session.assessment?.plotDevelopmentScore || 0,
      },
    }));

    // Use the new unified assessment engine
    // Only allow valid genres
    const allowedGenres = ['creative', 'fantasy', 'adventure', 'mystery'];
    const genre = allowedGenres.includes(storySession.elements?.genre) ? storySession.elements.genre : 'creative';
    const assessmentResult = await UnifiedAssessmentEngine.performCompleteAssessment(
      storyContent,
      {
        childAge: user?.age || 10,
        isCollaborativeStory: storySession.storyMode !== 'freeform',
        storyTitle: storySession.title,
        previousAttempts,
        // Accept string | undefined for expectedGenre
        expectedGenre: genre as 'fantasy' | 'creative' | 'adventure' | 'mystery' | undefined,
      }
    );

    return assessmentResult;
  }

  /**
   * Assess uploaded story directly
   */
  static async assessUploadedStory(
    storyContent: string,
    title: string,
    userId: string
  ) {
    await connectToDatabase();

    const user = await User.findById(userId);
    
    // Get previous assessments for progress tracking
    const previousSessions = await StorySession.find({
      childId: userId,
      assessment: { $exists: true },
      'assessment.overallScore': { $exists: true }
    }).sort({ createdAt: -1 }).limit(5);

    const previousAttempts = previousSessions.map(session => ({
      assessmentDate: session.completedAt || session.createdAt,
      overallScore: session.assessment?.overallScore || 0,
      categoryScores: {
        grammar: session.assessment?.grammarScore || 0,
        creativity: session.assessment?.creativityScore || 0,
        vocabulary: session.assessment?.vocabularyScore || 0,
        structure: session.assessment?.structureScore || 0,
        characterDevelopment: session.assessment?.characterDevelopmentScore || 0,
        plotDevelopment: session.assessment?.plotDevelopmentScore || 0,
      },
    }));

    // Use the new unified assessment engine
    const assessmentResult = await UnifiedAssessmentEngine.performCompleteAssessment(
      storyContent,
      {
        childAge: user?.age || 10,
        isCollaborativeStory: false, // Uploaded stories are not collaborative
        storyTitle: title,
        previousAttempts,
        expectedGenre: 'creative',
      }
    );

    return assessmentResult;
  }

  /**
   * Convert advanced assessment to legacy format for backward compatibility
   */
  static convertToLegacyFormat(assessmentResult: any) {
    return {
      grammarScore: assessmentResult.categoryScores.grammar,
      creativityScore: assessmentResult.categoryScores.creativity,
      vocabularyScore: assessmentResult.categoryScores.vocabulary,
      structureScore: assessmentResult.categoryScores.structure,
      characterDevelopmentScore: assessmentResult.categoryScores.characterDevelopment,
      plotDevelopmentScore: assessmentResult.categoryScores.plotDevelopment,
      overallScore: assessmentResult.overallScore,
      readingLevel: assessmentResult.categoryScores.readingLevel,
      feedback: assessmentResult.educationalFeedback.teacherComment,
      strengths: assessmentResult.educationalFeedback.strengths,
      improvements: assessmentResult.educationalFeedback.improvements,
      vocabularyUsed: [], // Legacy field - kept empty
      suggestedWords: [], // Legacy field - kept empty
      educationalInsights: assessmentResult.educationalFeedback.encouragement,
      
      // NEW: Advanced integrity analysis
      plagiarismScore: assessmentResult.integrityAnalysis.originalityScore,
      aiDetectionScore: assessmentResult.integrityAnalysis.aiDetectionResult.overallScore,
      integrityRisk: assessmentResult.integrityAnalysis.integrityRisk,
      integrityDetails: {
        plagiarism: assessmentResult.integrityAnalysis.plagiarismResult,
        aiDetection: assessmentResult.integrityAnalysis.aiDetectionResult,
      },
      recommendations: assessmentResult.recommendations,
      progressTracking: assessmentResult.progressTracking,
    };
  }

  // Keep existing method for backward compatibility
  static async generateDetailedAssessment(content: string, elements: any, stats: any) {
    console.log('🔄 Using legacy assessment method - consider upgrading to assessStory()');
    
    // Use advanced assessment but return in old format
    const result = await UnifiedAssessmentEngine.performCompleteAssessment(content, {
      childAge: 10, // Default age
      isCollaborativeStory: false,
      expectedGenre: elements?.genre || 'creative',
    });

    return this.convertToLegacyFormat(result);
  }

  /**
   * Quick plagiarism check without full assessment
   */
  static async checkPlagiarismOnly(content: string, childAge?: number) {
    const result = await AdvancedPlagiarismDetector.checkPlagiarism(content, {
      childAge: childAge || 10,
      isCreativeWriting: true,
    });

    return {
      score: result.overallScore,
      riskLevel: result.riskLevel,
      violations: result.violations,
      suggestions: result.recommendations,
    };
  }

  /**
   * Quick AI detection without full assessment
   */
  static async checkAIContentOnly(content: string, childAge?: number) {
    const result = await AdvancedAIDetector.detectAIContent(content, {
      childAge: childAge || 10,
      isCreativeWriting: true,
    });

    return {
      score: result.overallScore,
      likelihood: result.likelihood,
      confidence: result.confidence,
      indicators: result.indicators,
      suggestions: result.recommendations,
    };
  }

  /**
   * Get assessment statistics for admin dashboard
   */
  static async getAssessmentStats() {
    await connectToDatabase();

    const stats = await StorySession.aggregate([
      {
        $match: {
          assessment: { $exists: true },
          'assessment.overallScore': { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          totalAssessments: { $sum: 1 },
          averageScore: { $avg: '$assessment.overallScore' },
          highRiskCount: {
            $sum: {
              $cond: [
                { $in: ['$assessment.integrityRisk', ['high', 'critical']] },
                1,
                0
              ]
            }
          },
          aiDetectedCount: {
            $sum: {
              $cond: [
                { $lt: ['$assessment.aiDetectionScore', 70] },
                1,
                0
              ]
            }
          },
          plagiarismDetectedCount: {
            $sum: {
              $cond: [
                { $lt: ['$assessment.plagiarismScore', 70] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    return stats[0] || {
      totalAssessments: 0,
      averageScore: 0,
      highRiskCount: 0,
      aiDetectedCount: 0,
      plagiarismDetectedCount: 0,
    };
  }
}