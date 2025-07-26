'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Save,
  Users,
  Mail,
  Shield,
  Globe,
  Database,
  Bell,
  Key,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PlatformSettings {
  general: {
    platformName: string;
    platformDescription: string;
    supportEmail: string;
    maxStoriesPerUser: number;
    maxApiCallsPerStory: number;
    allowUserRegistration: boolean;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpSecure: boolean;
    fromEmail: string;
    fromName: string;
  };
  security: {
    requireEmailVerification: boolean;
    passwordMinLength: number;
    sessionTimeout: number;
    maxLoginAttempts: number;
    enableTwoFactor: boolean;
  };
  content: {
    allowAdultContent: boolean;
    moderationEnabled: boolean;
    autoModerationLevel: 'low' | 'medium' | 'high';
    wordLimit: number;
  };
  notifications: {
    emailNotifications: boolean;
    adminAlerts: boolean;
    weeklyReports: boolean;
    systemMaintenance: boolean;
  };
}

export default function AdminSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showDangerZone, setShowDangerZone] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'admin') {
      router.push('/admin/login');
      return;
    }

    fetchSettings();
  }, [session, status, router]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();

      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (
    section: keyof PlatformSettings,
    field: string,
    value: any
  ) => {
    if (!settings) return;

    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value,
      },
    });
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'content', name: 'Content', icon: Database },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'danger', name: 'Danger Zone', icon: AlertTriangle },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Loading settings...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <Settings className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-400 mb-2">
          Settings Unavailable
        </h3>
        <p className="text-gray-500">Unable to load platform settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Platform Settings
          </h1>
          <p className="text-gray-400">
            Configure platform behavior and preferences
          </p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-xl p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800 rounded-xl p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-medium text-white mb-6">
                  General Settings
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      value={settings.general.platformName}
                      onChange={(e) =>
                        updateSettings(
                          'general',
                          'platformName',
                          e.target.value
                        )
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Platform Description
                    </label>
                    <textarea
                      value={settings.general.platformDescription}
                      onChange={(e) =>
                        updateSettings(
                          'general',
                          'platformDescription',
                          e.target.value
                        )
                      }
                      rows={3}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={settings.general.supportEmail}
                      onChange={(e) =>
                        updateSettings(
                          'general',
                          'supportEmail',
                          e.target.value
                        )
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Max Stories per User
                      </label>
                      <input
                        type="number"
                        value={settings.general.maxStoriesPerUser}
                        onChange={(e) =>
                          updateSettings(
                            'general',
                            'maxStoriesPerUser',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Max API Calls per Story
                      </label>
                      <input
                        type="number"
                        value={settings.general.maxApiCallsPerStory}
                        onChange={(e) =>
                          updateSettings(
                            'general',
                            'maxApiCallsPerStory',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="allowRegistration"
                      checked={settings.general.allowUserRegistration}
                      onChange={(e) =>
                        updateSettings(
                          'general',
                          'allowUserRegistration',
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="allowRegistration"
                      className="ml-2 text-sm text-gray-300"
                    >
                      Allow user registration
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-medium text-white mb-6">
                  Security Settings
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireEmailVerification"
                      checked={settings.security.requireEmailVerification}
                      onChange={(e) =>
                        updateSettings(
                          'security',
                          'requireEmailVerification',
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="requireEmailVerification"
                      className="ml-2 text-sm text-gray-300"
                    >
                      Require email verification for new accounts
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Password Minimum Length
                      </label>
                      <input
                        type="number"
                        value={settings.security.passwordMinLength}
                        onChange={(e) =>
                          updateSettings(
                            'security',
                            'passwordMinLength',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <input
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) =>
                          updateSettings(
                            'security',
                            'sessionTimeout',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) =>
                        updateSettings(
                          'security',
                          'maxLoginAttempts',
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableTwoFactor"
                      checked={settings.security.enableTwoFactor}
                      onChange={(e) =>
                        updateSettings(
                          'security',
                          'enableTwoFactor',
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="enableTwoFactor"
                      className="ml-2 text-sm text-gray-300"
                    >
                      Enable two-factor authentication
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Content Settings */}
            {activeTab === 'content' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-medium text-white mb-6">
                  Content Settings
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="allowAdultContent"
                      checked={settings.content.allowAdultContent}
                      onChange={(e) =>
                        updateSettings(
                          'content',
                          'allowAdultContent',
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="allowAdultContent"
                      className="ml-2 text-sm text-gray-300"
                    >
                      Allow adult content
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="moderationEnabled"
                      checked={settings.content.moderationEnabled}
                      onChange={(e) =>
                        updateSettings(
                          'content',
                          'moderationEnabled',
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="moderationEnabled"
                      className="ml-2 text-sm text-gray-300"
                    >
                      Enable content moderation
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Auto-Moderation Level
                    </label>
                    <select
                      value={settings.content.autoModerationLevel}
                      onChange={(e) =>
                        updateSettings(
                          'content',
                          'autoModerationLevel',
                          e.target.value
                        )
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Word Limit per Story
                    </label>
                    <input
                      type="number"
                      value={settings.content.wordLimit}
                      onChange={(e) =>
                        updateSettings(
                          'content',
                          'wordLimit',
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-medium text-white mb-6">
                  Notification Settings
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) =>
                        updateSettings(
                          'notifications',
                          'emailNotifications',
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="emailNotifications"
                      className="ml-2 text-sm text-gray-300"
                    >
                      Enable email notifications
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="adminAlerts"
                      checked={settings.notifications.adminAlerts}
                      onChange={(e) =>
                        updateSettings(
                          'notifications',
                          'adminAlerts',
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="adminAlerts"
                      className="ml-2 text-sm text-gray-300"
                    >
                      Send admin alerts for critical issues
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="weeklyReports"
                      checked={settings.notifications.weeklyReports}
                      onChange={(e) =>
                        updateSettings(
                          'notifications',
                          'weeklyReports',
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="weeklyReports"
                      className="ml-2 text-sm text-gray-300"
                    >
                      Send weekly activity reports
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="systemMaintenance"
                      checked={settings.notifications.systemMaintenance}
                      onChange={(e) =>
                        updateSettings(
                          'notifications',
                          'systemMaintenance',
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="systemMaintenance"
                      className="ml-2 text-sm text-gray-300"
                    >
                      Notify users about system maintenance
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Danger Zone */}
            {activeTab === 'danger' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-medium text-red-400 mb-6">
                  Danger Zone
                </h2>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-6 h-6 text-red-400 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-red-400 mb-2">
                        Destructive Actions
                      </h3>
                      <p className="text-gray-300 mb-4">
                        These actions are irreversible and can cause permanent
                        data loss. Please proceed with extreme caution.
                      </p>

                      <div className="space-y-3">
                        <button
                          onClick={() => setShowDangerZone(!showDangerZone)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                        >
                          <Key className="w-4 h-4" />
                          <span>
                            {showDangerZone ? 'Hide' : 'Show'} Danger Zone
                          </span>
                        </button>

                        {showDangerZone && (
                          <div className="space-y-3 pt-4 border-t border-red-500/30">
                            <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2">
                              <Trash2 className="w-4 h-4" />
                              <span>Clear All User Data</span>
                            </button>
                            <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2">
                              <Database className="w-4 h-4" />
                              <span>Reset Database</span>
                            </button>
                            <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2">
                              <AlertTriangle className="w-4 h-4" />
                              <span>Factory Reset Platform</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
