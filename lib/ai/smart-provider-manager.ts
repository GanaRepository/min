// lib/ai/smart-provider-manager.ts - Fixed Email Import
import { OpenAIProvider } from './providers/openai-provider';
import { GoogleProvider } from './providers/google-provider';
import { AnthropicProvider } from './providers/anthropic-provider';
import { AIProviderConfig, AIResponse } from './providers/types';
import nodemailer from 'nodemailer'; // Use nodemailer directly

interface FailureTracker {
  count: number;
  firstFailure: Date;
  lastFailure: Date;
  errors: string[];
  alertsSent: number;
  lastAlertSent?: Date;
  consecutiveFailures: number;
}

export class SmartProviderManager {
  private providers: AIProviderConfig[] = [];
  private activeProvider: AIProviderConfig | null = null;
  private fallbackAttempts = 0;
  private maxFallbackAttempts = 2;
  private initializationLogs: string[] = [];

  // NEW: Failure tracking and alerting
  private failureTracker: FailureTracker = {
    count: 0,
    firstFailure: new Date(),
    lastFailure: new Date(),
    errors: [],
    alertsSent: 0,
    consecutiveFailures: 0,
  };

  // Alert thresholds
  private readonly FAILURE_THRESHOLD = 5; // Alert after 5 consecutive failures
  private readonly ALERT_COOLDOWN = 30 * 60 * 1000; // 30 minutes between alerts
  private readonly CRITICAL_FAILURE_THRESHOLD = 20; // Emergency alert threshold
  private readonly MAX_ALERTS_PER_HOUR = 2; // Rate limiting

  constructor() {
    console.log('🚀 [AI-DIAGNOSTICS] SmartProviderManager initializing...');

    // Initialize providers in cost order (cheapest first)
    this.providers = [
      new GoogleProvider(), // 🥇 FREE - Gemini 1.5 Flash
      new OpenAIProvider(), // 🥈 $0.375/1M tokens - GPT-4o Mini
      new AnthropicProvider(), // 🥉 $0.775/1M tokens - Claude 3.5 Haiku
    ];

    this.logEnvironmentStatus();
    this.selectBestProvider();
    this.logInitializationSummary();

    // NEW: Check if we're starting in failure mode
    if (!this.activeProvider) {
      this.trackFailure('System initialization failed - No providers available', 'INITIALIZATION');
    }
  }

  private logEnvironmentStatus(): void {
    console.log('🔍 [AI-DIAGNOSTICS] Environment Variable Check:');

    const envChecks = [
      {
        key: 'GOOGLE_AI_API_KEY',
        value: process.env.GOOGLE_AI_API_KEY,
        provider: 'Google Gemini',
      },
      {
        key: 'OPENAI_API_KEY',
        value: process.env.OPENAI_API_KEY,
        provider: 'OpenAI GPT',
      },
      {
        key: 'ANTHROPIC_API_KEY',
        value: process.env.ANTHROPIC_API_KEY,
        provider: 'Anthropic Claude',
      },
      { key: 'NODE_ENV', value: process.env.NODE_ENV, provider: 'Environment' },
    ];

    envChecks.forEach(({ key, value, provider }) => {
      if (key === 'NODE_ENV') {
        console.log(`   ℹ️  ${key}: ${value || 'undefined'}`);
      } else if (value) {
        const maskedValue =
          value.substring(0, 8) + '...' + value.substring(value.length - 4);
        console.log(`   ✅ ${key}: ${maskedValue} (${provider} available)`);
        this.initializationLogs.push(`✅ ${provider}: API key configured`);
      } else {
        console.log(`   ❌ ${key}: NOT SET (${provider} unavailable)`);
        this.initializationLogs.push(`❌ ${provider}: Missing API key`);
      }
    });
  }

  private selectBestProvider(): void {
    console.log('🔄 [AI-DIAGNOSTICS] Testing provider availability...');

    for (const provider of this.providers) {
      const isAvailable = provider.isAvailable();
      const status = isAvailable ? '✅ AVAILABLE' : '❌ UNAVAILABLE';

      console.log(`   ${status} ${provider.name} (${provider.model})`);

      if (isAvailable && !this.activeProvider) {
        this.activeProvider = provider;
        const costInfo =
          provider.estimatedCost === 0
            ? 'FREE'
            : `$${provider.estimatedCost}/1M tokens`;

        console.log(`🎯 [AI-DIAGNOSTICS] Selected Provider: ${provider.name}`);
        console.log(`   📊 Model: ${provider.model}`);
        console.log(`   💰 Cost: ${costInfo}`);

        this.initializationLogs.push(
          `🎯 Active: ${provider.name} (${provider.model}) - ${costInfo}`
        );
      }
    }

    if (!this.activeProvider) {
      console.error('❌ [AI-DIAGNOSTICS] CRITICAL: No AI providers available!');
      console.error('   📋 All providers failed availability check');
      console.error('   🔧 System will use TEMPLATE RESPONSES only');

      this.initializationLogs.push(
        '❌ CRITICAL: No providers available - TEMPLATE MODE ACTIVE'
      );
    }
  }

  private logInitializationSummary(): void {
    console.log('📋 [AI-DIAGNOSTICS] Initialization Summary:');
    this.initializationLogs.forEach((log) => console.log(`   ${log}`));

    if (this.activeProvider) {
      console.log('🟢 [AI-DIAGNOSTICS] STATUS: AI System Ready');
    } else {
      console.log('🔴 [AI-DIAGNOSTICS] STATUS: Fallback Mode - Templates Only');
      console.log(
        '🛠️  [AI-DIAGNOSTICS] Fix: Add at least one API key to environment variables'
      );
    }
    console.log('═══════════════════════════════════════════════════════════');
  }

  // NEW: Create email transporter using your existing config
  private createEmailTransporter() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // NEW: Track failures and trigger alerts
  private async trackFailure(errorMessage: string, failureType: 'API_CALL' | 'INITIALIZATION' | 'PROVIDER_SWITCH' = 'API_CALL'): Promise<void> {
    this.failureTracker.count++;
    this.failureTracker.consecutiveFailures++;
    this.failureTracker.lastFailure = new Date();
    this.failureTracker.errors.push(`[${new Date().toISOString()}] ${failureType}: ${errorMessage}`);

    // Keep only last 20 errors to prevent memory bloat
    if (this.failureTracker.errors.length > 20) {
      this.failureTracker.errors = this.failureTracker.errors.slice(-20);
    }

    console.warn(`⚠️ [AI-FAILURE-TRACKER] Failure #${this.failureTracker.consecutiveFailures}: ${errorMessage}`);

    // Check if we should send an alert
    await this.checkAndSendAlert(failureType);
  }

  // NEW: Reset failure count on successful API call
  private resetFailureTracker(): void {
    if (this.failureTracker.consecutiveFailures > 0) {
      console.log(`✅ [AI-FAILURE-TRACKER] Resetting failure count after ${this.failureTracker.consecutiveFailures} consecutive failures`);
      this.failureTracker.consecutiveFailures = 0;
    }
  }

  // NEW: Check if alert should be sent and send it
  private async checkAndSendAlert(failureType: string): Promise<void> {
    const now = new Date();
    const shouldSendAlert = this.shouldSendAlert(now);

    if (shouldSendAlert) {
      console.error(`🚨 [AI-ALERT] Sending admin alert for ${this.failureTracker.consecutiveFailures} consecutive failures`);
      
      try {
        await this.sendAdminAlert(failureType);
        this.failureTracker.alertsSent++;
        this.failureTracker.lastAlertSent = now;
        
        console.log(`📧 [AI-ALERT] Admin alert sent successfully (Alert #${this.failureTracker.alertsSent})`);
      } catch (emailError) {
        console.error(`❌ [AI-ALERT] Failed to send admin alert:`, emailError);
      }
    }
  }

  // NEW: Determine if alert should be sent
  private shouldSendAlert(now: Date): boolean {
    // Don't send alert if below threshold
    if (this.failureTracker.consecutiveFailures < this.FAILURE_THRESHOLD) {
      return false;
    }

    // Always send critical alerts
    if (this.failureTracker.consecutiveFailures >= this.CRITICAL_FAILURE_THRESHOLD) {
      console.error(`🆘 [AI-ALERT] CRITICAL THRESHOLD REACHED: ${this.failureTracker.consecutiveFailures} failures`);
      return true;
    }

    // Check cooldown period
    if (this.failureTracker.lastAlertSent) {
      const timeSinceLastAlert = now.getTime() - this.failureTracker.lastAlertSent.getTime();
      if (timeSinceLastAlert < this.ALERT_COOLDOWN) {
        console.log(`⏰ [AI-ALERT] Skipping alert - cooldown period (${Math.round(timeSinceLastAlert / 1000)}s remaining)`);
        return false;
      }
    }

    // Check rate limiting (max alerts per hour)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    if (this.failureTracker.lastAlertSent && this.failureTracker.lastAlertSent > oneHourAgo) {
      if (this.failureTracker.alertsSent >= this.MAX_ALERTS_PER_HOUR) {
        console.log(`🚫 [AI-ALERT] Rate limit reached - max ${this.MAX_ALERTS_PER_HOUR} alerts per hour`);
        return false;
      }
    } else {
      // Reset hourly counter
      this.failureTracker.alertsSent = 0;
    }

    return true;
  }

  // NEW: Send alert email using nodemailer directly (matching your mailer style)
  private async sendAdminAlert(failureType: string): Promise<void> {
    const subject = this.failureTracker.consecutiveFailures >= this.CRITICAL_FAILURE_THRESHOLD
      ? `🆘 CRITICAL: AI System Complete Failure (${this.failureTracker.consecutiveFailures} failures)`
      : `⚠️ AI System Alert: ${this.failureTracker.consecutiveFailures} Consecutive API Failures`;

    const statusSummary = this.generateStatusSummary();
    const recentErrors = this.failureTracker.errors.slice(-5).join('\n');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: ${this.failureTracker.consecutiveFailures >= this.CRITICAL_FAILURE_THRESHOLD ? '#dc3545' : '#fd7e14'}; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .alert-box { background: #f8f9fa; border-left: 4px solid #dc3545; padding: 15px; margin: 15px 0; }
          .status-box { background: #e9ecef; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .error-log { background: #f1f3f4; padding: 10px; font-family: monospace; font-size: 12px; margin: 10px 0; }
          .action-items { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; margin: 15px 0; }
          .footer { background: #6c757d; color: white; padding: 15px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${this.failureTracker.consecutiveFailures >= this.CRITICAL_FAILURE_THRESHOLD ? '🆘 CRITICAL AI SYSTEM FAILURE' : '⚠️ AI SYSTEM ALERT'}</h1>
          <p>Consecutive Failures: ${this.failureTracker.consecutiveFailures}</p>
        </div>
        
        <div class="content">
          <div class="alert-box">
            <h3>🚨 Alert Summary</h3>
            <ul>
              <li><strong>Failure Type:</strong> ${failureType}</li>
              <li><strong>Consecutive Failures:</strong> ${this.failureTracker.consecutiveFailures}</li>
              <li><strong>Total Failures:</strong> ${this.failureTracker.count}</li>
              <li><strong>First Failure:</strong> ${this.failureTracker.firstFailure.toLocaleString()}</li>
              <li><strong>Last Failure:</strong> ${this.failureTracker.lastFailure.toLocaleString()}</li>
              <li><strong>Current Status:</strong> ${this.activeProvider ? `Using ${this.activeProvider.name}` : 'ALL PROVIDERS FAILED - Template Mode'}</li>
            </ul>
          </div>

          <div class="status-box">
            <h3>📊 System Status</h3>
            <pre>${statusSummary}</pre>
          </div>

          <div class="error-log">
            <h3>🐛 Recent Errors (Last 5)</h3>
            <pre>${recentErrors}</pre>
          </div>

          <div class="action-items">
            <h3>🔧 Immediate Actions Required</h3>
            <ol>
              <li><strong>Check API Keys:</strong> Verify all provider API keys are valid and have sufficient quota</li>
              <li><strong>Check Network:</strong> Ensure server can reach AI provider endpoints</li>
              <li><strong>Check Quotas:</strong> Verify API usage limits haven't been exceeded</li>
              <li><strong>Monitor Users:</strong> Students are currently receiving template responses only</li>
              ${this.failureTracker.consecutiveFailures >= this.CRITICAL_FAILURE_THRESHOLD ? 
                '<li><strong>URGENT:</strong> System is completely down - immediate intervention required</li>' : 
                '<li><strong>Status:</strong> System may auto-recover if provider issues resolve</li>'
              }
            </ol>
          </div>

          <div class="status-box">
            <h3>🔍 Provider Details</h3>
            ${this.providers.map(provider => `
              <p><strong>${provider.name}</strong>: ${provider.isAvailable() ? '✅ Available' : '❌ Unavailable'} (${provider.model})</p>
            `).join('')}
          </div>
        </div>

        <div class="footer">
          <p>This alert was generated automatically by the AI System Monitor</p>
          <p>Time: ${new Date().toISOString()} | Alert #${this.failureTracker.alertsSent + 1}</p>
        </div>
      </body>
      </html>
    `;

    const textContent = `
AI SYSTEM ALERT - ${this.failureTracker.consecutiveFailures} Consecutive Failures

SUMMARY:
- Failure Type: ${failureType}
- Consecutive Failures: ${this.failureTracker.consecutiveFailures}
- Current Status: ${this.activeProvider ? `Using ${this.activeProvider.name}` : 'ALL PROVIDERS FAILED'}
- Last Failure: ${this.failureTracker.lastFailure.toLocaleString()}

RECENT ERRORS:
${recentErrors}

SYSTEM STATUS:
${statusSummary}

IMMEDIATE ACTIONS REQUIRED:
1. Check API keys and quotas
2. Verify network connectivity
3. Monitor user impact (students getting templates)
${this.failureTracker.consecutiveFailures >= this.CRITICAL_FAILURE_THRESHOLD ? '4. URGENT: Complete system intervention required' : ''}

This is an automated alert from the AI System Monitor.
    `;

    // Use nodemailer directly with your email config
    const transporter = this.createEmailTransporter();
    
    const mailOptions = {
      from: `"Mintoons AI System" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'admin@yourdomain.com',
      subject,
      html: htmlContent,
      text: textContent,
    };

    await transporter.sendMail(mailOptions);
  }

  // NEW: Generate detailed status summary
  private generateStatusSummary(): string {
    const providerStatus = this.providers.map(p => 
      `${p.name}: ${p.isAvailable() ? 'Available' : 'Unavailable'} (${p.model})`
    ).join('\n');

    const envStatus = [
      `GOOGLE_AI_API_KEY: ${process.env.GOOGLE_AI_API_KEY ? 'Set' : 'Missing'}`,
      `OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? 'Set' : 'Missing'}`,
      `ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? 'Set' : 'Missing'}`,
      `NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`,
    ].join('\n');

    return `PROVIDERS:
${providerStatus}

ENVIRONMENT:
${envStatus}

ACTIVE PROVIDER: ${this.activeProvider ? this.activeProvider.name : 'None'}
FAILURE TRACKING:
- Total Failures: ${this.failureTracker.count}
- Consecutive Failures: ${this.failureTracker.consecutiveFailures}
- Alerts Sent: ${this.failureTracker.alertsSent}`;
  }

  getActiveProvider(): AIProviderConfig | null {
    return this.activeProvider;
  }

  // Get provider information for UI components
  getProviderInfo(): {
    active: string;
    available: Array<{ name: string; model: string; cost: string }>;
    recommendations: string[];
    lastError?: string;
    diagnostic: string;
  } {
    const available = this.providers
      .filter((provider) => provider.isAvailable())
      .map((provider) => ({
        name: provider.name,
        model: provider.model,
        cost:
          provider.estimatedCost === 0
            ? 'FREE'
            : `${provider.estimatedCost}/1M tokens`,
      }));

    const recommendations = [];

    // Check if Google (free) is not available
    if (!this.providers[0].isAvailable()) {
      recommendations.push('💡 Add GOOGLE_AI_API_KEY for FREE AI responses');
    }

    // If using expensive provider, suggest cheaper alternatives
    if (this.activeProvider?.name === 'Anthropic') {
      recommendations.push(
        '💡 Switch to Google (FREE) or OpenAI (cheaper) to reduce costs'
      );
    }

    // If no providers available, suggest setup
    if (!this.activeProvider) {
      recommendations.push(
        '🚨 Add at least one AI provider API key to enable live responses'
      );
    }

    return {
      active: this.activeProvider
        ? `${this.activeProvider.name} (${this.activeProvider.model})`
        : 'None - Using Templates',
      available,
      recommendations,
      lastError: this.getDiagnosticReason(),
      diagnostic: this.getDiagnosticReason(),
    };
  }

  // Test provider connection
  async testProviderConnection(): Promise<boolean> {
    if (!this.activeProvider) return false;

    try {
      const testResponse = await this.activeProvider.generateResponse(
        "Test connection. Respond with 'OK'."
      );
      return testResponse.content.toLowerCase().includes('ok');
    } catch (error) {
      console.error('Provider test failed:', error);
      return false;
    }
  }

  async generateResponse(prompt: string): Promise<string> {
    const requestId = Math.random().toString(36).substring(2, 8);

    console.log(`🤖 [AI-REQUEST-${requestId}] Starting generation...`);
    console.log(`   📝 Prompt length: ${prompt.length} chars`);

    if (!this.activeProvider) {
      console.warn(`⚠️  [AI-REQUEST-${requestId}] NO PROVIDER AVAILABLE`);
      console.warn(`   🔄 Reason: ${this.getDiagnosticReason()}`);
      console.warn(`   📋 Action: Using educational template response`);

      // Track failure
      await this.trackFailure('No provider available', 'API_CALL');

      const fallbackResponse = this.getFallbackResponse(prompt);

      console.log(
        `📤 [AI-REQUEST-${requestId}] Template response generated (${fallbackResponse.length} chars)`
      );
      return fallbackResponse;
    }

    try {
      console.log(
        `🚀 [AI-REQUEST-${requestId}] Calling ${this.activeProvider.name} API...`
      );
      console.log(`   🔧 Model: ${this.activeProvider.model}`);
      console.log(
        `   💰 Cost: ${this.activeProvider.estimatedCost === 0 ? 'FREE' : '$' + this.activeProvider.estimatedCost + '/1M tokens'}`
      );

      const startTime = Date.now();
      const response = await this.activeProvider.generateResponse(prompt);
      const duration = Date.now() - startTime;

      // SUCCESS: Reset failure tracker and fallback attempts
      this.resetFailureTracker();
      this.fallbackAttempts = 0;

      console.log(`✅ [AI-REQUEST-${requestId}] SUCCESS in ${duration}ms`);
      console.log(
        `   📊 Provider: ${response.provider} (${response.model || 'unknown model'})`
      );
      console.log(`   📏 Response length: ${response.content.length} chars`);

      if (response.tokensUsed) {
        console.log(`   🎯 Tokens used: ${response.tokensUsed}`);
        if (this.activeProvider.estimatedCost > 0) {
          const estimatedCost =
            (response.tokensUsed / 1000000) * this.activeProvider.estimatedCost;
          console.log(`   💸 Estimated cost: $${estimatedCost.toFixed(6)}`);
        }
      }

      return response.content;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(
        `❌ [AI-REQUEST-${requestId}] ${this.activeProvider.name} FAILED`
      );
      console.error(
        `   🐛 Error type: ${error instanceof Error ? error.constructor.name : typeof error}`
      );
      console.error(
        `   📄 Error message: ${errorMessage}`
      );

      if (error instanceof Error && error.stack) {
        console.error(
          `   📚 Stack trace: ${error.stack.split('\n')[1]?.trim() || 'N/A'}`
        );
      }

      // Try to identify specific error types
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          console.error(
            `   🔑 Issue: API Key problem - check if key is valid and has quota`
          );
        } else if (
          error.message.includes('rate limit') ||
          error.message.includes('quota')
        ) {
          console.error(`   ⏰ Issue: Rate limit or quota exceeded`);
        } else if (
          error.message.includes('network') ||
          error.message.includes('ENOTFOUND')
        ) {
          console.error(`   🌐 Issue: Network connectivity problem`);
        } else if (error.message.includes('timeout')) {
          console.error(`   ⏱️  Issue: Request timeout`);
        } else {
          console.error(`   ❓ Issue: Unknown error - check provider status`);
        }
      }

      // Track failure
      await this.trackFailure(`${this.activeProvider.name}: ${errorMessage}`, 'API_CALL');

      return await this.tryFallbackProvider(prompt, requestId, error);
    }
  }

  private async tryFallbackProvider(
    prompt: string,
    requestId: string,
    originalError: any
  ): Promise<string> {
    this.fallbackAttempts++;

    console.log(
      `🔄 [AI-REQUEST-${requestId}] Attempting fallback (${this.fallbackAttempts}/${this.maxFallbackAttempts})`
    );

    if (this.fallbackAttempts >= this.maxFallbackAttempts) {
      console.warn(
        `⚠️  [AI-REQUEST-${requestId}] Max fallback attempts reached`
      );
      console.warn(`   📋 All AI providers exhausted, using template response`);

      await this.trackFailure('All fallback attempts exhausted', 'PROVIDER_SWITCH');

      const fallbackResponse = this.getFallbackResponse(prompt);
      console.log(
        `📤 [AI-REQUEST-${requestId}] Template response generated (${fallbackResponse.length} chars)`
      );
      return fallbackResponse;
    }

    // Find next available provider
    const currentProviderIndex = this.providers.findIndex(
      (p) => p.name === this.activeProvider?.name
    );

    const nextProvider = this.providers
      .slice(currentProviderIndex + 1)
      .find((provider) => provider.isAvailable());

    if (nextProvider) {
      console.log(
        `🔄 [AI-REQUEST-${requestId}] Switching to fallback provider: ${nextProvider.name}`
      );
      this.activeProvider = nextProvider;
      
      // Track provider switch
      await this.trackFailure(`Switched to ${nextProvider.name} after failure`, 'PROVIDER_SWITCH');
      
      return await this.generateResponse(prompt);
    }

    console.warn(
      `⚠️  [AI-REQUEST-${requestId}] No more fallback providers available`
    );
    
    await this.trackFailure('No more fallback providers available', 'PROVIDER_SWITCH');
    
    const fallbackResponse = this.getFallbackResponse(prompt);
    console.log(
      `📤 [AI-REQUEST-${requestId}] Template response generated (${fallbackResponse.length} chars)`
    );
    return fallbackResponse;
  }

  private getDiagnosticReason(): string {
    const missingKeys = [];
    if (!process.env.GOOGLE_AI_API_KEY) missingKeys.push('GOOGLE_AI_API_KEY');
    if (!process.env.OPENAI_API_KEY) missingKeys.push('OPENAI_API_KEY');
    if (!process.env.ANTHROPIC_API_KEY) missingKeys.push('ANTHROPIC_API_KEY');

    if (missingKeys.length === 3) {
      return 'No AI provider API keys configured';
    } else if (missingKeys.length > 0) {
      return `Some providers missing keys: ${missingKeys.join(', ')}`;
    } else {
      return 'All API keys present but providers failed to initialize';
    }
  }

  // Enhanced debugging method
  async testAllProviders(): Promise<void> {
    console.log('🧪 [AI-DIAGNOSTICS] Testing all providers...');

    for (const provider of this.providers) {
      if (!provider.isAvailable()) {
        console.log(`   ⏭️  Skipping ${provider.name}: Not available`);
        continue;
      }

      try {
        console.log(`   🔬 Testing ${provider.name}...`);
        const startTime = Date.now();

        const response = await provider.generateResponse(
          'Test: Say "Hello from ' + provider.name + '"'
        );
        const duration = Date.now() - startTime;

        console.log(`   ✅ ${provider.name}: SUCCESS in ${duration}ms`);
        console.log(
          `      📝 Response: ${response.content.substring(0, 50)}...`
        );
      } catch (error) {
        console.error(`   ❌ ${provider.name}: FAILED`);
        console.error(
          `      🐛 Error: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  }

  // Get detailed status for debugging
  getDetailedStatus(): any {
    return {
      timestamp: new Date().toISOString(),
      activeProvider: this.activeProvider
        ? {
            name: this.activeProvider.name,
            model: this.activeProvider.model,
            cost: this.activeProvider.estimatedCost,
          }
        : null,
      availableProviders: this.providers.map((p) => ({
        name: p.name,
        model: p.model,
        available: p.isAvailable(),
        cost: p.estimatedCost,
      })),
      environment: {
        hasGoogleKey: !!process.env.GOOGLE_AI_API_KEY,
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
        hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
        nodeEnv: process.env.NODE_ENV,
      },
      fallbackAttempts: this.fallbackAttempts,
      initializationLogs: this.initializationLogs,
      failureStats: this.getFailureStats(),
    };
  }

  // NEW: Get failure statistics for monitoring
  getFailureStats(): {
    consecutiveFailures: number;
    totalFailures: number;
    alertsSent: number;
    lastFailure?: Date;
    lastAlert?: Date;
    systemHealth: 'healthy' | 'degraded' | 'critical';
  } {
    let systemHealth: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (this.failureTracker.consecutiveFailures >= this.CRITICAL_FAILURE_THRESHOLD) {
      systemHealth = 'critical';
    } else if (this.failureTracker.consecutiveFailures >= this.FAILURE_THRESHOLD) {
      systemHealth = 'degraded';
    }

    return {
      consecutiveFailures: this.failureTracker.consecutiveFailures,
      totalFailures: this.failureTracker.count,
      alertsSent: this.failureTracker.alertsSent,
      lastFailure: this.failureTracker.count > 0 ? this.failureTracker.lastFailure : undefined,
      lastAlert: this.failureTracker.lastAlertSent,
      systemHealth,
    };
  }

  // NEW: Manual alert trigger for testing
  async triggerTestAlert(): Promise<void> {
    console.log('🧪 [AI-ALERT] Triggering test alert...');
    await this.sendAdminAlert('MANUAL_TEST');
    console.log('✅ [AI-ALERT] Test alert sent');
  }

  private getFallbackResponse(prompt: string): string {
    let fallbackType = 'general';
    let response = '';

    if (prompt.includes('opening') || prompt.includes('Story Elements:')) {
      fallbackType = 'opening';
      const openingFallbacks = [
        'Welcome to your magical adventure! Your brave character finds themselves in an amazing place filled with wonder and possibilities. What exciting discovery do they make first?',
        'An incredible journey is about to begin! Your hero stands at the edge of something extraordinary. What catches their attention and draws them into the adventure?',
        'The adventure starts now! Your character is ready for whatever challenges await. What mysterious thing appears before them?',
        'Once upon a time, in a world full of magic and mystery, your brave character begins their quest. What amazing sight greets them?',
        'Your story begins with endless possibilities! The main character is about to discover something that will change everything. What do they find?'
      ];
      response = openingFallbacks[Math.floor(Math.random() * openingFallbacks.length)];
    } else if (prompt.includes('assessment') || prompt.includes('feedback') || prompt.includes('Grammar:')) {
      fallbackType = 'assessment';
      const assessmentFallbacks = [
        'What an exciting story! Your creativity and imagination really shine through. Keep up the fantastic work!',
        'Excellent storytelling! You\'ve created such an engaging adventure. Your writing skills are developing beautifully.',
        'Wonderful work! Your story has great characters and an exciting plot. Keep exploring your creative ideas!',
        'Amazing writing! You\'ve woven together all the story elements perfectly. Your imagination knows no bounds!',
        'Fantastic storytelling! Your adventure is full of excitement and wonder. Continue developing your unique voice!'
      ];
      response = assessmentFallbacks[Math.floor(Math.random() * assessmentFallbacks.length)];
    } else {
      // Regular turn responses
      fallbackType = 'turn';
      const turnFallbacks = [
        'What an exciting development! Your character shows such bravery and creativity. What challenge comes next?',
        'Amazing storytelling! You\'re weaving together all the elements beautifully. Your creativity really shines through. What does your brave character do now?',
        'Wonderful work! I love how you\'re building the excitement in your story. You have such great ideas. How will this adventure continue to unfold?',
        'Fantastic writing! Your story is full of surprises and adventure. Your character is so brave and clever. What happens next in this thrilling tale?',
        'Excellent imagination! You\'re creating such a vivid and exciting world. Your storytelling skills are really impressive. Where does the adventure lead next?'
      ];
      response = turnFallbacks[Math.floor(Math.random() * turnFallbacks.length)];
    }

    console.log(`📋 [AI-FALLBACK] Using template response type: ${fallbackType}`);
    console.log(`   📏 Template length: ${response.length} chars`);
    console.log(`   🔧 To fix: Configure AI provider API keys in environment variables`);

    return response;
  }

  refreshProviders(): void {
    this.fallbackAttempts = 0;
    this.selectBestProvider();
  }
}

// Export singleton instance
export const smartAIProvider = new SmartProviderManager();