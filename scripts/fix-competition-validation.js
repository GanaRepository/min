// scripts/fix-competition-validation.js
// One-time script to fix existing competitions with validation issues

const mongoose = require('mongoose');
const path = require('path');

// Simple connection function
async function connectToMongoDB() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://ZenthoritDb:Abhi%40Zenthorit1@127.0.0.1:27017/ZenthoritDB?authSource=admin';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    return false;
  }
}

async function fixCompetitionValidation() {
  try {
    console.log('🔧 Starting competition validation fix...');

    // Connect to MongoDB
    const connected = await connectToMongoDB();
    if (!connected) {
      console.error('❌ Cannot proceed without database connection');
      return;
    }

    // Find all competitions directly from the collection
    const competitions = await mongoose.connection.db.collection('competitions').find({}).toArray();
    console.log(`📊 Found ${competitions.length} competitions to check`);

    if (competitions.length === 0) {
      console.log('ℹ️ No competitions found in database');
      return;
    }

    let fixedCount = 0;
    let errorCount = 0;

    for (const comp of competitions) {
      try {
        console.log(`\n🔍 Checking competition: ${comp.month || 'Unknown'} ${comp.year || 'Unknown'}`);

        let needsUpdate = false;
        const updates = {};

        // Check for missing required fields and add reasonable defaults
        if (!comp.submissionEnd) {
          console.log('  ❌ Missing submissionEnd - adding default');
          const year = comp.year || 2024;
          const monthIndex = comp.month === 'January' ? 0 : new Date().getMonth();
          updates.submissionEnd = new Date(year, monthIndex, 28);
          needsUpdate = true;
        }

        if (!comp.judgingEnd) {
          console.log('  ❌ Missing judgingEnd - adding default');
          const year = comp.year || 2024;
          const monthIndex = comp.month === 'January' ? 0 : new Date().getMonth();
          updates.judgingEnd = new Date(year, monthIndex, 30);
          needsUpdate = true;
        }

        if (!comp.submissionStart) {
          console.log('  ❌ Missing submissionStart - adding default');
          const year = comp.year || 2024;
          const monthIndex = comp.month === 'January' ? 0 : new Date().getMonth();
          updates.submissionStart = new Date(year, monthIndex, 1);
          needsUpdate = true;
        }

        if (!comp.judgingStart) {
          console.log('  ❌ Missing judgingStart - adding default');
          const year = comp.year || 2024;
          const monthIndex = comp.month === 'January' ? 0 : new Date().getMonth();
          updates.judgingStart = new Date(year, monthIndex, 29);
          needsUpdate = true;
        }

        if (!comp.resultsDate) {
          console.log('  ❌ Missing resultsDate - adding default');
          const year = comp.year || 2024;
          const monthIndex = comp.month === 'January' ? 0 : new Date().getMonth();
          updates.resultsDate = new Date(year, monthIndex, 31);
          needsUpdate = true;
        }

        // Remove fields that don't exist in the schema (if any)
        const unsetFields = {};
        if (comp.entries !== undefined) {
          console.log('  🗑️ Removing deprecated entries field');
          unsetFields.entries = "";
        }

        if (needsUpdate || Object.keys(unsetFields).length > 0) {
          const updateQuery = {};
          if (Object.keys(updates).length > 0) {
            updateQuery.$set = updates;
          }
          if (Object.keys(unsetFields).length > 0) {
            updateQuery.$unset = unsetFields;
          }

          await mongoose.connection.db.collection('competitions').updateOne(
            { _id: comp._id },
            updateQuery
          );

          console.log(`  ✅ Fixed competition: ${comp.month || 'Unknown'} ${comp.year || 'Unknown'}`);
          fixedCount++;
        } else {
          console.log(`  ✅ Competition is valid: ${comp.month || 'Unknown'} ${comp.year || 'Unknown'}`);
        }

      } catch (error) {
        console.error(`  ❌ Error fixing competition ${comp.month || 'Unknown'} ${comp.year || 'Unknown'}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n🎉 Migration complete!`);
    console.log(`   ✅ Fixed: ${fixedCount} competitions`);
    console.log(`   ❌ Errors: ${errorCount} competitions`);
    console.log(`   📊 Total: ${competitions.length} competitions checked`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Check if this script is being run directly
if (require.main === module) {
  console.log('🚀 Running competition validation fix...');
  fixCompetitionValidation();
}

module.exports = { fixCompetitionValidation };

module.exports = { fixCompetitionValidation };
