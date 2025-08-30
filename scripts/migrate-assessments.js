// scripts/migrate-assessments.js
// Run this once to fix existing stories with broken assessments

const mongoose = require('mongoose');
const StorySession = require('../models/StorySession');

async function migrateAssessments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find stories with empty 13-factor assessment objects
    const stories = await StorySession.find({
      'assessment.coreLanguageSkills': { $exists: true },
      $or: [
        {
          'assessment.coreLanguageSkills.grammarSentenceClarity': {
            $exists: false,
          },
        },
        { 'assessment.coreLanguageSkills.grammarSentenceClarity': null },
        { 'assessment.coreLanguageSkills.grammarSentenceClarity': '' },
      ],
    });

    console.log(`Found ${stories.length} stories with broken assessments`);

    for (const story of stories) {
      console.log(`Marking story ${story._id} for re-assessment...`);

      // Remove broken assessment to trigger new generation
      await StorySession.findByIdAndUpdate(story._id, {
        $unset: {
          'assessment.coreLanguageSkills': 1,
          'assessment.storytellingSkills': 1,
          'assessment.creativeExpressiveSkills': 1,
          'assessment.authenticityGrowth': 1,
        },
      });
    }

    console.log(
      'Migration completed. Stories will generate new assessments when accessed.'
    );
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run migration
migrateAssessments();
