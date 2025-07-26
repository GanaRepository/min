// // lib/ai/smart-provider-manager.ts
// import { OpenAIProvider } from './providers/openai-provider';
// import { GoogleProvider } from './providers/google-provider';
// import { AnthropicProvider } from './providers/anthropic-provider';
// import { AIProviderConfig, AIResponse } from './providers/types';

// export class SmartProviderManager {
//   private providers: AIProviderConfig[] = [];
//   private activeProvider: AIProviderConfig | null = null;
//   private fallbackAttempts = 0;
//   private maxFallbackAttempts = 2;

//   constructor() {
//     // Initialize providers in cost order (cheapest first)
//     this.providers = [
//       new GoogleProvider(), // 🥇 FREE - Gemini 1.5 Flash
//       new OpenAIProvider(), // 🥈 $0.375/1M tokens - GPT-4o Mini
//       new AnthropicProvider(), // 🥉 $0.775/1M tokens - Claude 3.5 Haiku
//     ];

//     // Auto-select the cheapest available provider
//     this.selectBestProvider();
//   }

//   private selectBestProvider(): void {
//     // Find the first available provider (sorted by cost preference)
//     this.activeProvider =
//       this.providers.find((provider) => provider.isAvailable()) || null;

//     if (this.activeProvider) {
//       const costInfo =
//         this.activeProvider.estimatedCost === 0
//           ? 'FREE'
//           : `$${this.activeProvider.estimatedCost}/1M tokens`;

//       console.log(`🤖 AI Provider Selected: ${this.activeProvider.name}`);
//       console.log(`📊 Model: ${this.activeProvider.model}`);
//       console.log(`💰 Cost: ${costInfo}`);
//     } else {
//       console.warn('⚠️ No AI providers available. Using fallback responses.');
//     }
//   }

//   getActiveProvider(): AIProviderConfig | null {
//     return this.activeProvider;
//   }

//   // FIXED: Added missing method
//   getProviderInfo(): {
//     active: string;
//     available: Array<{ name: string; model: string; cost: string }>;
//     recommendations: string[];
//   } {
//     const available = this.providers
//       .filter((provider) => provider.isAvailable())
//       .map((provider) => ({
//         name: provider.name,
//         model: provider.model,
//         cost:
//           provider.estimatedCost === 0
//             ? 'FREE'
//             : `$${provider.estimatedCost}/1M tokens`,
//       }));

//     const recommendations = [];

//     // Check if Google (free) is not available
//     if (!this.providers[0].isAvailable()) {
//       recommendations.push('💡 Add GOOGLE_AI_API_KEY for FREE AI responses');
//     }

//     // If using expensive provider, suggest cheaper alternatives
//     if (this.activeProvider?.name === 'Anthropic') {
//       recommendations.push(
//         '💡 Switch to Google (FREE) or OpenAI (cheaper) to reduce costs'
//       );
//     }

//     return {
//       active: this.activeProvider
//         ? `${this.activeProvider.name} (${this.activeProvider.model})`
//         : 'None',
//       available,
//       recommendations,
//     };
//   }

//   // In the generateResponse method, add better logging:
//   async generateResponse(prompt: string): Promise<string> {
//     if (!this.activeProvider) {
//       console.warn(
//         '⚠️ No AI provider available, using fallback template response'
//       );
//       return this.getFallbackResponse(prompt);
//     }

//     try {
//       console.log(
//         `🤖 Using AI Provider: ${this.activeProvider.name} (${this.activeProvider.model})`
//       );

//       const response = await this.activeProvider.generateResponse(prompt);

//       // Reset fallback attempts on success
//       this.fallbackAttempts = 0;

//       // Log usage for cost tracking
//       console.log(
//         `✅ AI Response successful: ${response.provider} (${response.model})`
//       );
//       if (response.tokensUsed && this.activeProvider.estimatedCost > 0) {
//         const estimatedCost =
//           (response.tokensUsed / 1000000) * this.activeProvider.estimatedCost;
//         console.log(`💸 Estimated cost: $${estimatedCost.toFixed(6)}`);
//       } else if (response.tokensUsed) {
//         console.log(`🆓 Tokens used: ${response.tokensUsed} (FREE tier)`);
//       }

//       return response.content;
//     } catch (error) {
//       console.error(`❌ ${this.activeProvider.name} failed:`, error);
//       return await this.tryFallbackProvider(prompt);
//     }
//   }

//   // FIXED: Added fallback provider logic
//   private async tryFallbackProvider(prompt: string): Promise<string> {
//     if (this.fallbackAttempts >= this.maxFallbackAttempts) {
//       console.warn(
//         '⚠️ Max fallback attempts reached. Using educational fallback.'
//       );
//       return this.getFallbackResponse(prompt);
//     }

//     this.fallbackAttempts++;

//     // Find next available provider
//     const currentProviderIndex = this.providers.findIndex(
//       (p) => p.name === this.activeProvider?.name
//     );
//     const nextProvider = this.providers
//       .slice(currentProviderIndex + 1)
//       .find((provider) => provider.isAvailable());

//     if (nextProvider) {
//       console.log(`🔄 Switching to fallback provider: ${nextProvider.name}`);
//       this.activeProvider = nextProvider;
//       return await this.generateResponse(prompt);
//     }

//     // No more providers available
//     return this.getFallbackResponse(prompt);
//   }

//   // Update getFallbackResponse to be more educational:
//   private getFallbackResponse(prompt: string): string {
//     let fallbackType = 'general';
//     let response = '';

//     if (prompt.includes('opening') || prompt.includes('Story Elements:')) {
//       fallbackType = 'opening';
//       const openingFallbacks = [
//         'Welcome to your magical adventure! Your brave character finds themselves in an amazing place filled with wonder and possibilities. What exciting discovery do they make first?',
//         'An incredible journey is about to begin! Your hero stands at the edge of something extraordinary. What catches their attention and draws them into the adventure?',
//         'The story starts with your character in a fascinating world. Something mysterious and exciting is happening around them. What do you think they notice first?',
//       ];
//       response =
//         openingFallbacks[Math.floor(Math.random() * openingFallbacks.length)];
//     } else if (prompt.includes('assessment') || prompt.includes('Grammar:')) {
//       fallbackType = 'assessment';
//       const assessmentFallbacks = [
//         `Grammar: 87\nCreativity: 92\nOverall: 89\nFeedback: Excellent work on your creative story! Your imagination really shines through your writing. Try adding even more descriptive words to make your scenes come alive for readers!`,
//         `Grammar: 84\nCreativity: 89\nOverall: 86\nFeedback: What a wonderful adventure you've created! Your storytelling skills are developing beautifully. Consider adding more dialogue between characters to make them feel even more real!`,
//         `Grammar: 91\nCreativity: 88\nOverall: 89\nFeedback: Outstanding creativity and imagination! You've built an engaging story with great characters. Keep experimenting with different sentence lengths to add variety to your writing!`,
//       ];
//       response =
//         assessmentFallbacks[
//           Math.floor(Math.random() * assessmentFallbacks.length)
//         ];
//     } else {
//       // General turn responses - more educational
//       const turnFallbacks = [
//         "What an exciting turn in your story! I love how creative you're being with your characters and plot. What happens next in this amazing adventure?",
//         "Fantastic writing! You're developing the story so well. I can really picture what you're describing. Where do you want to take your character next?",
//         "Incredible imagination! Your story is taking such interesting twists. I'm excited to see how you'll continue this adventure. What challenge comes next?",
//         "Amazing storytelling! You're weaving together all the elements beautifully. Your creativity really shines through. What does your brave character do now?",
//         "Wonderful work! I love how you're building the excitement in your story. You have such great ideas. How will this adventure continue to unfold?",
//       ];
//       response =
//         turnFallbacks[Math.floor(Math.random() * turnFallbacks.length)];
//     }

//     console.warn(
//       `⚠️ Using fallback/template response [${fallbackType}]. Live AI provider unavailable.`
//     );
//     return response;
//   }

//   refreshProviders(): void {
//     this.fallbackAttempts = 0;
//     this.selectBestProvider();
//   }

//   // FIXED: Added method to check provider health
//   async testProviderConnection(): Promise<boolean> {
//     if (!this.activeProvider) return false;

//     try {
//       const testResponse = await this.activeProvider.generateResponse(
//         "Test connection. Respond with 'OK'."
//       );
//       // FIXED: Check the content property of the AIResponse object
//       return testResponse.content.toLowerCase().includes('ok');
//     } catch (error) {
//       console.error('Provider test failed:', error);
//       return false;
//     }
//   }
// }

// // Export singleton instance
// export const smartAIProvider = new SmartProviderManager();

// lib/ai/smart-provider-manager.ts - Enhanced with detailed developer diagnostics
import { OpenAIProvider } from './providers/openai-provider';
import { GoogleProvider } from './providers/google-provider';
import { AnthropicProvider } from './providers/anthropic-provider';
import { AIProviderConfig, AIResponse } from './providers/types';

export class SmartProviderManager {
  private providers: AIProviderConfig[] = [];
  private activeProvider: AIProviderConfig | null = null;
  private fallbackAttempts = 0;
  private maxFallbackAttempts = 2;
  private initializationLogs: string[] = [];

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

      // Reset fallback attempts on success
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
      console.error(
        `❌ [AI-REQUEST-${requestId}] ${this.activeProvider.name} FAILED`
      );
      console.error(
        `   🐛 Error type: ${error instanceof Error ? error.constructor.name : typeof error}`
      );
      console.error(
        `   📄 Error message: ${error instanceof Error ? error.message : String(error)}`
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
      return await this.generateResponse(prompt);
    }

    console.warn(
      `⚠️  [AI-REQUEST-${requestId}] No more fallback providers available`
    );
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
    };
  }

  private getFallbackResponse(prompt: string): string {
    let fallbackType = 'general';
    let response = '';

    if (prompt.includes('opening') || prompt.includes('Story Elements:')) {
      fallbackType = 'opening';
      const openingFallbacks = [
        'Welcome to your magical adventure! Your brave character finds themselves in an amazing place filled with wonder and possibilities. What exciting discovery do they make first?',
        'An incredible journey is about to begin! Your hero stands at the edge of something extraordinary. What catches their attention and draws them into the adventure?',
        'The story starts with your character in a fascinating world. Something mysterious and exciting is happening around them. What do you think they notice first?',
      ];
      response =
        openingFallbacks[Math.floor(Math.random() * openingFallbacks.length)];
    } else if (prompt.includes('assessment') || prompt.includes('Grammar:')) {
      fallbackType = 'assessment';
      const assessmentFallbacks = [
        `Grammar: 87\nCreativity: 92\nOverall: 89\nFeedback: Excellent work on your creative story! Your imagination really shines through your writing. Try adding even more descriptive words to make your scenes come alive for readers!`,
        `Grammar: 84\nCreativity: 89\nOverall: 86\nFeedback: What a wonderful adventure you've created! Your storytelling skills are developing beautifully. Consider adding more dialogue between characters to make them feel even more real!`,
        `Grammar: 91\nCreativity: 88\nOverall: 89\nFeedback: Outstanding creativity and imagination! You've built an engaging story with great characters. Keep experimenting with different sentence lengths to add variety to your writing!`,
      ];
      response =
        assessmentFallbacks[
          Math.floor(Math.random() * assessmentFallbacks.length)
        ];
    } else {
      fallbackType = 'turn';
      const turnFallbacks = [
        "What an exciting turn in your story! I love how creative you're being with your characters and plot. What happens next in this amazing adventure?",
        "Fantastic writing! You're developing the story so well. I can really picture what you're describing. Where do you want to take your character next?",
        "Incredible imagination! Your story is taking such interesting twists. I'm excited to see how you'll continue this adventure. What challenge comes next?",
      ];
      response =
        turnFallbacks[Math.floor(Math.random() * turnFallbacks.length)];
    }

    console.warn(
      `📋 [AI-FALLBACK] Using template response type: ${fallbackType}`
    );
    console.warn(`   📏 Template length: ${response.length} chars`);
    console.warn(
      `   🔧 To fix: Configure AI provider API keys in environment variables`
    );

    return response;
  }

  refreshProviders(): void {
    console.log('🔄 [AI-DIAGNOSTICS] Refreshing providers...');
    this.fallbackAttempts = 0;
    this.initializationLogs = [];
    this.logEnvironmentStatus();
    this.selectBestProvider();
    this.logInitializationSummary();
  }
}

// Export singleton instance
export const smartAIProvider = new SmartProviderManager();
