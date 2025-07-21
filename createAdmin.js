// createAdmin.js
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Admin user details - use exactly what you'll use to log in
const newAdmin = {
  email: 'mintoonsadmin@example.com', // Make sure this matches what you enter in the login form
  password: 'Admin@123',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  isActive: true,
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

    // Delete any existing admins
    const deleteResult = await usersCollection.deleteMany({ role: 'admin' });
    console.log(`Removed ${deleteResult.deletedCount} existing admin accounts`);

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
      console.log('Admin document:', {
        id: verifyAdmin._id,
        email: verifyAdmin.email,
        role: verifyAdmin.role,
      });
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the function
createAdmin();
