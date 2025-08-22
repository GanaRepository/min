// debug-usage.js - Debug script to test usage counting
const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://root:QfGJkHnOSq37yvNJ@cluster0.jzsaot6.mongodb.net/mintoons?retryWrites=true&w=majority';

async function debugUsage() {
  console.log('🔍 Starting usage debugging...');
  
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('mintoons');
    
    // Get all child users
    const users = await db.collection('users').find({ role: 'child' }).toArray();
    console.log(`📊 Found ${users.length} child users`);
    
    // Check for a specific user (you can replace with actual user ID)
    const targetUser = users[0]; // Just use the first user for testing
    if (!targetUser) {
      console.log('❌ No child users found');
      return;
    }
    
    console.log(`🔍 Debugging user: ${targetUser.firstName} (${targetUser._id})`);
    
    // Get current month dates
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    console.log(`📅 Current month start: ${currentMonthStart.toISOString()}`);
    
    // Count all stories for this user this month
    const allStories = await db.collection('storysessions').find({
      childId: new ObjectId(targetUser._id),
      createdAt: { $gte: currentMonthStart }
    }).toArray();
    
    console.log(`📚 Total stories this month: ${allStories.length}`);
    
    // Analyze each story
    allStories.forEach((story, index) => {
      console.log(`\n📖 Story ${index + 1}:`);
      console.log(`  - Title: ${story.title}`);
      console.log(`  - Created: ${story.createdAt}`);
      console.log(`  - isUploadedForAssessment: ${story.isUploadedForAssessment}`);
      console.log(`  - competitionEntries: ${JSON.stringify(story.competitionEntries || [])}`);
      console.log(`  - storyType: ${story.storyType}`);
      console.log(`  - assessmentAttempts: ${story.assessmentAttempts || 0}`);
    });
    
    // Count freestyle stories (the same logic as the API)
    const freestyleStories = await db.collection('storysessions').find({
      childId: new ObjectId(targetUser._id),
      createdAt: { $gte: currentMonthStart },
      isUploadedForAssessment: { $ne: true },
      $or: [
        { competitionEntries: { $exists: false } },
        { competitionEntries: { $size: 0 } }
      ]
    }).toArray();
    
    console.log(`\n✅ Freestyle stories count: ${freestyleStories.length}`);
    
    // Count assessment requests
    const assessmentStories = await db.collection('storysessions').find({
      childId: new ObjectId(targetUser._id),
      createdAt: { $gte: currentMonthStart },
      $or: [
        { isUploadedForAssessment: true },
        { assessment: { $exists: true } }
      ]
    }).toArray();
    
    console.log(`✅ Assessment stories count: ${assessmentStories.length}`);
    
    // Count competition entries
    const competitionStories = await db.collection('storysessions').find({
      childId: new ObjectId(targetUser._id),
      createdAt: { $gte: currentMonthStart },
      competitionEntries: { $exists: true, $ne: [] }
    }).toArray();
    
    console.log(`✅ Competition stories count: ${competitionStories.length}`);
    
    await client.close();
    console.log('\n🎉 Debugging complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugUsage();
