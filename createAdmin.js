// createAdmin.js
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Admin user details - Platform Manager (NOT a story creator)
const newAdmin = {
  email: 'mr.ganapathireddy@gmail.com',
  password: 'Ganapass@123',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  isActive: true,
  isVerified: true,

  // ADMIN DOESN'T CREATE STORIES - Remove story-related fields
  // Admin only manages the platform and views statistics

  // Admin-specific management fields
  adminLevel: 'super', // super, manager, moderator
  canCreateMentors: true,
  canAssignStudentsToMentors: true,
  canViewAllAnalytics: true,
  canManageCompetitions: true,
  canProcessPayments: true,
  canModerateContent: true,

  // Platform statistics that admin tracks (READ-ONLY)
  platformStats: {
    totalStudentsManaged: 0,
    totalMentorsManaged: 0,
    totalRevenueGenerated: 0,
    totalCompetitionsRun: 0,
    lastAnalyticsView: new Date(),
  },

  // Admin activity tracking
  adminActivity: {
    mentorsCreated: 0,
    studentsAssigned: 0,
    competitionsManaged: 0,
    reportsGenerated: 0,
    lastLogin: new Date(),
  },

  // Admin dashboard preferences
  preferences: {
    theme: 'dark',
    language: 'en',
    emailNotifications: true,
    dashboardLayout: 'advanced',
    showDetailedAnalytics: true,
    autoRefreshStats: true,
    defaultView: 'analytics', // analytics, users, mentors, competitions
  },

  // Admin permissions matrix
  permissions: {
    users: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      viewAnalytics: true,
    },
    mentors: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      assign: true,
      unassign: true,
    },
    students: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      assignToMentor: true,
      viewProgress: true,
    },
    competitions: {
      view: true,
      create: true,
      manage: true,
      judging: true,
      announceResults: true,
    },
    payments: {
      viewTransactions: true,
      processRefunds: true,
      viewRevenue: true,
      manageStripe: true,
    },
    content: {
      moderate: true,
      approve: true,
      reject: true,
      feature: true,
    },
  },

  // Security and access tracking
  securitySettings: {
    requireTwoFactor: false,
    sessionTimeout: 3600000, // 1 hour in milliseconds
    ipWhitelist: [], // Can restrict to specific IPs
    lastPasswordChange: new Date(),
  },

  // Admin doesn't have story/assessment tracking - those are for students
  // Admin only views aggregated statistics of all students

  createdAt: new Date(),
  updatedAt: new Date(),
};

// MongoDB connection URI
const uri = 'mongodb://ZenthoritDb:Abhi%40Zenthorit1@127.0.0.1:27017/ZenthoritDB?authSource=admin';
const dbName = 'ZenthoritDB';

async function createAdmin() {
  let client;
  try {
    client = await MongoClient.connect(uri);
    console.log('✅ Connected to MongoDB successfully');

    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    // Check if admin already exists
    const existingAdmin = await usersCollection.findOne({
      email: newAdmin.email,
    });

    if (existingAdmin) {
      console.log('⚠️  Admin with this email already exists');
      console.log('📋 Existing admin role:', existingAdmin.role);
      return;
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(newAdmin.password, 12);
    
    // Create admin document
    const adminDoc = {
      ...newAdmin,
      password: hashedPassword,
    };

    // Insert admin
    const result = await usersCollection.insertOne(adminDoc);
    
    console.log('\n🎉 PLATFORM ADMIN CREATED SUCCESSFULLY!');
    console.log('=' .repeat(60));
    console.log(`📧 Email: ${newAdmin.email}`);
    console.log(`🔑 Password: ${newAdmin.password}`);
    console.log(`🆔 Admin ID: ${result.insertedId}`);
    console.log(`👑 Role: Platform Administrator`);
    console.log('=' .repeat(60));

    console.log('\n👨‍💼 ADMIN RESPONSIBILITIES:');
    console.log('   📊 View student progress analytics');
    console.log('   👨‍🏫 Create and manage mentors');
    console.log('   👥 Assign students to mentors');
    console.log('   🏆 Run monthly competitions');
    console.log('   💰 Monitor revenue and payments');
    console.log('   📝 Moderate content and stories');
    console.log('   📈 Generate platform reports');

    console.log('\n🎯 ADMIN DASHBOARD FEATURES:');
    console.log('   • Student Analytics & Progress Tracking');
    console.log('   • Mentor Management & Assignment');
    console.log('   • Competition Management & Results');
    console.log('   • Revenue Analytics & Story Pack Sales');
    console.log('   • Content Moderation & Approval');
    console.log('   • Platform Usage Statistics');

    console.log('\n📊 WHAT ADMIN CAN VIEW:');
    console.log('   • Total students: 0 (will grow as students register)');
    console.log('   • Total mentors: 0 (admin will create mentors)');
    console.log('   • Stories created by all students');
    console.log('   • Revenue from story pack purchases');
    console.log('   • Competition participation rates');
    console.log('   • Student-mentor assignment status');

    console.log('\n🚀 LOGIN ACCESS:');
    console.log('   • Development: http://localhost:3000/admin/login');
    console.log('   • Production: https://yourdomain.com/admin/login');

    console.log('\n💡 NEXT STEPS:');
    console.log('   1. Login to admin dashboard');
    console.log('   2. Create mentor accounts');
    console.log('   3. Set up student registration');
    console.log('   4. Assign students to mentors');
    console.log('   5. Configure monthly competitions');
    console.log('   6. Set up Stripe for story pack sales');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Helper function to show platform hierarchy
function showPlatformStructure() {
  console.log('\n🏢 MINTOONS PLATFORM HIERARCHY:');
  console.log('');
  console.log('    👑 ADMIN (You)');
  console.log('    ├── 👨‍🏫 Mentor 1');
  console.log('    │   ├── 👧 Student A');
  console.log('    │   ├── 👦 Student B');
  console.log('    │   └── 👧 Student C');
  console.log('    ├── 👨‍🏫 Mentor 2');
  console.log('    │   ├── 👦 Student D');
  console.log('    │   └── 👧 Student E');
  console.log('    └── 📊 Platform Analytics');
  console.log('        ├── Student Progress');
  console.log('        ├── Revenue Tracking');
  console.log('        ├── Competition Results');
  console.log('        └── Usage Statistics');
  console.log('');
  console.log('🎯 ADMIN WORKFLOW:');
  console.log('   1. Create mentor accounts');
  console.log('   2. Students register themselves');
  console.log('   3. Admin assigns students to mentors');
  console.log('   4. Admin monitors progress & revenue');
  console.log('   5. Admin runs competitions & announces winners');
}

// Show structure first, then create admin
console.log('🚀 MINTOONS PLATFORM ADMIN CREATOR');
showPlatformStructure();
createAdmin();