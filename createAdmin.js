// createAdmin.js
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Admin user details - now includes ALL required fields from your schema
const newAdmin = {
  email: 'mr.ganapathireddy@gmail.com',
  password: 'Ganapass@123',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  isActive: true,

  // Required field that was missing
  isVerified: true, // Set to true for admin

  // Required subscription fields with defaults
  subscriptionTier: 'PREMIUM', // Give admin premium access
  subscriptionStatus: 'active',

  // Required writing statistics with defaults
  totalStoriesCreated: 0,
  storiesCreatedThisMonth: 0,
  totalWordsWritten: 0,
  writingStreak: 0,
  totalTimeWriting: 0,

  // Required preferences object with all required nested fields
  preferences: {
    theme: 'dark',
    language: 'en',
    emailNotifications: true,
    soundEffects: true,
    autoSave: true,
  },

  createdAt: new Date(),
  updatedAt: new Date(),
};

// MongoDB connection URI
const uri =
  'mongodb://ZenthoritDb:Abhi%40Zenthorit1@127.0.0.1:27017/ZenthoritDB?authSource=admin';
const dbName = 'ZenthoritDB';

async function createAdmin() {
  let client;
  try {
    // Connect to MongoDB
    client = await MongoClient.connect(uri);
    console.log('Connected to MongoDB successfully');

    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    // Check if admin already exists
    const existingAdmin = await usersCollection.findOne({
      email: newAdmin.email,
    });

    if (existingAdmin) {
      console.log('Admin with this email already exists');
      console.log('Existing admin ID:', existingAdmin._id);
      return;
    }

    // Hash password with 10 rounds
    const hashedPassword = await bcrypt.hash(newAdmin.password, 10);
    console.log('Password hashed successfully');

    // Create the new admin document with hashed password
    const adminDoc = {
      ...newAdmin,
      password: hashedPassword,
    };

    // Insert the new admin
    const result = await usersCollection.insertOne(adminDoc);
    console.log(`New admin created with ID: ${result.insertedId}`);
    console.log(`Email: ${newAdmin.email}`);
    console.log(
      `Password: ${newAdmin.password} (plain text, not stored in DB)`
    );
    console.log('Admin user created successfully!');

    // Verify the new admin exists
    const verifyAdmin = await usersCollection.findOne({
      email: newAdmin.email,
    });
    console.log('Verification - admin exists:', !!verifyAdmin);
    if (verifyAdmin) {
      console.log('Admin document created:', {
        id: verifyAdmin._id,
        email: verifyAdmin.email,
        role: verifyAdmin.role,
        isVerified: verifyAdmin.isVerified,
        subscriptionTier: verifyAdmin.subscriptionTier,
        hasPreferences: !!verifyAdmin.preferences,
      });
    }
  } catch (error) {
    console.error('Error creating admin user:', error);

    // More detailed error logging
    if (error.code === 11000) {
      console.error(
        'Duplicate key error - user with this email already exists'
      );
    }
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the function
createAdmin();
