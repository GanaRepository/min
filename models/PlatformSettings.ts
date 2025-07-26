import mongoose from 'mongoose';

const PlatformSettingsSchema = new mongoose.Schema({
  general: {
    platformName: { type: String, required: true, default: 'Mintoons' },
    platformDescription: { type: String, required: true },
    supportEmail: { type: String, required: true },
    maxStoriesPerUser: { type: Number, default: 10 },
    maxApiCallsPerStory: { type: Number, default: 7 },
    allowUserRegistration: { type: Boolean, default: true },
  },
  email: {
    smtpHost: String,
    smtpPort: { type: Number, default: 587 },
    smtpUser: String,
    smtpSecure: { type: Boolean, default: true },
    fromEmail: String,
    fromName: String,
  },
  security: {
    requireEmailVerification: { type: Boolean, default: true },
    passwordMinLength: { type: Number, default: 8 },
    sessionTimeout: { type: Number, default: 1440 }, // minutes
    maxLoginAttempts: { type: Number, default: 5 },
    enableTwoFactor: { type: Boolean, default: false },
  },
  content: {
    allowAdultContent: { type: Boolean, default: false },
    moderationEnabled: { type: Boolean, default: true },
    autoModerationLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    wordLimit: { type: Number, default: 5000 },
  },
  notifications: {
    emailNotifications: { type: Boolean, default: true },
    adminAlerts: { type: Boolean, default: true },
    weeklyReports: { type: Boolean, default: true },
    systemMaintenance: { type: Boolean, default: true },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

export default mongoose.models.PlatformSettings ||
  mongoose.model('PlatformSettings', PlatformSettingsSchema);
