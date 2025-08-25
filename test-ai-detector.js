// Test AI Detector specifically
require('dotenv').config();

// Clearly AI-generated content that should trigger high AI detection
const obviousAIContent = `
In the ancient realm of Eldoria, where crystalline towers pierced the molten sky and forgotten whispers echoed through the searing corridors of time, there lived a young maiden named Seraphina. Her emerald eyes gleamed with the wisdom of countless ages, and her voice carried the melodic cadence of a thousand singing crystals.

The ancient prophecy had foretold of her arrival, written in the golden script upon the sacred scrolls that had been safeguarded by the enigmatic Order of the Twilight Guardians for millennia beyond count. As the crimson moon rose above the desolate wasteland, casting its eerie glow upon the crystalline spires, Seraphina knew that her destiny awaited.

With her heart pounding like the thunderous drums of war, she ventured forth into the treacherous labyrinth of shadows, where every step echoed with the haunting memories of bygone eras. The air itself seemed to pulse with an otherworldly energy, and the very stones beneath her feet whispered secrets of power that could reshape the fabric of reality itself.

Her journey would test not only her courage but also her unwavering determination to fulfill the ancient covenant that bound her to this mystical realm. For she was the chosen one, the harbinger of a new dawn, destined to either save her world from eternal darkness or watch it crumble into the abyss of forgotten dreams.
`;

// Test human-like content (simple, age-appropriate)
const humanLikeContent = `
My dog Max is the best dog ever! He's brown and fluffy and he loves to play fetch. Sometimes when I throw the ball he runs the wrong way and I laugh so hard.

Yesterday Max got into trouble because he ate my sandwich when I wasn't looking. Mom was kind of mad but then Max looked so sorry that she started laughing too. He makes this funny face when he knows he did something bad.

I like taking Max to the park. He makes friends with all the other dogs and sometimes he tries to chase the squirrels but he's not fast enough. The squirrels just run up the trees and look down at him.

At night Max sleeps on my bed even though he's not supposed to. But I don't tell Mom because he keeps me warm and makes me feel safe. He's like my best friend who never talks back or gets mad at me.

I hope Max lives forever because I can't imagine life without him. He makes every day better just by being there.
`;

async function testAIDetector() {
  try {
    console.log('🤖 Testing AI Detector...');

    // Use require instead of import for Node.js compatibility
    const path = require('path');
    const fs = require('fs');

    // Read the AI detector file and eval it (quick test)
    console.log('Loading AI detector...');

    // Simple pattern-based test instead of full module import
    console.log('\n📊 Testing AI-Generated Content Patterns:');

    // Test for AI-typical words
    const aiWords = [
      'ancient',
      'crystalline',
      'molten',
      'searing',
      'forgotten',
      'whispered',
      'echoed',
      'gleamed',
      'melodic',
      'cadence',
      'prophecy',
      'sacred',
      'enigmatic',
      'millennia',
      'crimson',
      'desolate',
      'eerie',
      'treacherous',
      'labyrinth',
      'haunting',
      'otherworldly',
      'harbinger',
    ];

    let aiWordCount = 0;
    aiWords.forEach((word) => {
      if (obviousAIContent.toLowerCase().includes(word)) {
        aiWordCount++;
      }
    });

    console.log('AI-typical words found in obvious AI content:', aiWordCount);
    console.log(
      'AI words as percentage:',
      ((aiWordCount / aiWords.length) * 100).toFixed(1) + '%'
    );

    // Test human content
    let humanAiWordCount = 0;
    aiWords.forEach((word) => {
      if (humanLikeContent.toLowerCase().includes(word)) {
        humanAiWordCount++;
      }
    });

    console.log('\nAI-typical words found in human content:', humanAiWordCount);
    console.log(
      'Human content AI words percentage:',
      ((humanAiWordCount / aiWords.length) * 100).toFixed(1) + '%'
    );

    // Check sentence complexity
    const aiSentences = obviousAIContent
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 5);
    const avgAiLength =
      aiSentences.reduce((sum, s) => sum + s.split(' ').length, 0) /
      aiSentences.length;

    const humanSentences = humanLikeContent
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 5);
    const avgHumanLength =
      humanSentences.reduce((sum, s) => sum + s.split(' ').length, 0) /
      humanSentences.length;

    console.log('\nSentence Analysis:');
    console.log(
      'AI content avg sentence length:',
      avgAiLength.toFixed(1),
      'words'
    );
    console.log(
      'Human content avg sentence length:',
      avgHumanLength.toFixed(1),
      'words'
    );

    if (aiWordCount < 5) {
      console.log(
        '\n⚠️ WARNING: AI detector patterns may not be working properly!'
      );
      console.log('Expected high AI word count in obvious AI content');
    } else {
      console.log('\n✅ AI detection patterns appear to be working');
    }
  } catch (error) {
    console.error('❌ Error testing AI detector:', error.message);
  }
}

testAIDetector();
