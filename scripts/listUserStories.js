// scripts/listUserStories.js

const mongoose = require('mongoose');
const StorySession = require('../models/StorySession').default;

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/min';

async function main() {
  const userId = process.argv[2];
  if (!userId) {
    console.error('Usage: node scripts/listUserStories.js <userId>');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);

  const stories = await StorySession.find({ childId: userId }).sort({ createdAt: -1 });
  console.log(`Found ${stories.length} stories for user ${userId}`);
  stories.forEach((story, idx) => {
    console.log(`\n#${idx + 1}`);
    console.log(`ID: ${story._id}`);
    console.log(`Title: ${story.title}`);
    console.log(`Created At: ${story.createdAt}`);
    console.log(`Status: ${story.status}`);
  });

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
