// Test creating a new assessment to verify AI detection works
require('dotenv').config();

const mongoose = require('mongoose');

async function testAssessment() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Import the comprehensive assessment engine
    const { ComprehensiveAssessmentEngine } = require('./lib/ai/comprehensive-assessment-engine.ts');

    // Obviously AI-generated content
    const testContent = `
In the ancient realm of Eldoria, where crystalline towers pierced the molten sky and forgotten whispers echoed through the searing corridors of time, there lived a young maiden named Seraphina. Her emerald eyes gleamed with the wisdom of countless ages, and her voice carried the melodic cadence of a thousand singing crystals.

The ancient prophecy had foretold of her arrival, written in the golden script upon the sacred scrolls that had been safeguarded by the enigmatic Order of the Twilight Guardians for millennia beyond count. As the crimson moon rose above the desolate wasteland, casting its eerie glow upon the crystalline spires, Seraphina knew that her destiny awaited.

With her heart pounding like the thunderous drums of war, she ventured forth into the treacherous labyrinth of shadows, where every step echoed with the haunting memories of bygone eras. The air itself seemed to pulse with an otherworldly energy, and the very stones beneath her feet whispered secrets of power that could reshape the fabric of reality itself.
`;

    console.log('🧪 Testing comprehensive assessment with AI content...');
    console.log('Content length:', testContent.length);

    const assessment = await ComprehensiveAssessmentEngine.performCompleteAssessment(
      testContent,
      {
        childAge: 10,
        isCollaborativeStory: false,
        storyTitle: 'Test AI Story',
        expectedGenre: 'fantasy',
      }
    );

    console.log('\n📊 Assessment Results:');
    console.log('Overall Score:', assessment.overallScore);
    console.log('Integrity Status:', assessment.integrityAnalysis.overallStatus);
    console.log('AI Detection:', JSON.stringify(assessment.integrityAnalysis.aiDetection, null, 2));
    console.log('Plagiarism Check:', JSON.stringify(assessment.integrityAnalysis.plagiarismCheck, null, 2));

    // Check if AI detection is working
    const aiLikelihood = assessment.integrityAnalysis.aiDetection.aiLikelihoodPercent || 
                        assessment.integrityAnalysis.aiDetection.confidenceLevel || 0;
    
    if (aiLikelihood > 70) {
      console.log('\n✅ AI Detection working correctly - detected high AI likelihood');
    } else {
      console.log('\n⚠️ AI Detection may have issues - low detection on obvious AI content');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

testAssessment();
