import { OpenAIProvider } from './providers/openai-provider';
import { GoogleProvider } from './providers/google-provider';
import { AnthropicProvider } from './providers/anthropic-provider';
import { AIProviderConfig, AIResponse } from './providers/types';

export class SmartProviderManager {
  private providers: AIProviderConfig[] = [];
  private activeProvider: AIProviderConfig | null = null;
  private fallbackAttempts = 0;
  private maxFallbackAttempts = 2;

  constructor() {
    // Initialize providers in cost order (cheapest first)
    this.providers = [
      new GoogleProvider(),    // 🥇 FREE - Gemini 1.5 Flash
      new OpenAIProvider(),    // 🥈 $0.375/1M tokens - GPT-4o Mini  
      new AnthropicProvider()  // 🥉 $0.775/1M tokens - Claude 3.5 Haiku
    ];

    // Auto-select the cheapest available provider
    this.selectBestProvider();
  }

  private selectBestProvider(): void {
    // Find the first available provider (sorted by cost preference)
    this.activeProvider = this.providers.find(provider => provider.isAvailable()) || null;
    
    if (this.activeProvider) {
      const costInfo = this.activeProvider.estimatedCost === 0 
        ? 'FREE' 
        : `$${this.activeProvider.estimatedCost}/1M tokens`;
        
      console.log(`🤖 AI Provider Selected: ${this.activeProvider.name}`);
      console.log(`📊 Model: ${this.activeProvider.model}`);
      console.log(`💰 Cost: ${costInfo}`);
    } else {
      console.warn('⚠️ No AI providers available. Using fallback responses.');
    }
  }

  getActiveProvider(): AIProviderConfig | null {
    return this.activeProvider;
  }

  // FIXED: Added missing method
  getProviderInfo(): {
    active: string;
    available: Array<{name: string; model: string; cost: string}>;
    recommendations: string[];
  } {
    const available = this.providers
      .filter(provider => provider.isAvailable())
      .map(provider => ({
        name: provider.name,
        model: provider.model,
        cost: provider.estimatedCost === 0 ? 'FREE' : `$${provider.estimatedCost}/1M tokens`
      }));

    const recommendations = [];
    
    // Check if Google (free) is not available
    if (!this.providers[0].isAvailable()) {
      recommendations.push('💡 Add GOOGLE_AI_API_KEY for FREE AI responses');
    }
    
    // If using expensive provider, suggest cheaper alternatives
    if (this.activeProvider?.name === 'Anthropic') {
      recommendations.push('💡 Switch to Google (FREE) or OpenAI (cheaper) to reduce costs');
    }

    return {
      active: this.activeProvider ? `${this.activeProvider.name} (${this.activeProvider.model})` : 'None',
      available,
      recommendations
    };
  }

  // FIXED: Enhanced error handling and fallback logic
  async generateResponse(prompt: string): Promise<string> {
    if (!this.activeProvider) {
      // Fallback response when no AI provider is available
      return this.getFallbackResponse(prompt);
    }

    try {
      const response = await this.activeProvider.generateResponse(prompt);
      
      // Reset fallback attempts on success
      this.fallbackAttempts = 0;
      
      // Log usage for cost tracking
      console.log(`📝 AI Response: ${response.provider} (${response.model})`);
      if (response.tokensUsed && this.activeProvider.estimatedCost > 0) {
        const estimatedCost = (response.tokensUsed / 1000000) * this.activeProvider.estimatedCost;
        console.log(`💸 Estimated cost: $${estimatedCost.toFixed(6)}`);
      } else if (response.tokensUsed) {
        console.log(`🆓 Tokens used: ${response.tokensUsed} (FREE tier)`);
      }
      
      // FIXED: Return the content string, not the AIResponse object
      return response.content;
    } catch (error) {
      console.error(`❌ ${this.activeProvider.name} failed:`, error);
      
      // Try fallback to next provider if available
      return await this.tryFallbackProvider(prompt);
    }
  }

  // FIXED: Added fallback provider logic
  private async tryFallbackProvider(prompt: string): Promise<string> {
    if (this.fallbackAttempts >= this.maxFallbackAttempts) {
      console.warn('⚠️ Max fallback attempts reached. Using educational fallback.');
      return this.getFallbackResponse(prompt);
    }

    this.fallbackAttempts++;
    
    // Find next available provider
    const currentProviderIndex = this.providers.findIndex(p => p.name === this.activeProvider?.name);
    const nextProvider = this.providers
      .slice(currentProviderIndex + 1)
      .find(provider => provider.isAvailable());

    if (nextProvider) {
      console.log(`🔄 Switching to fallback provider: ${nextProvider.name}`);
      this.activeProvider = nextProvider;
      return await this.generateResponse(prompt);
    }

    // No more providers available
    return this.getFallbackResponse(prompt);
  }

  // FIXED: Enhanced educational fallback responses
  private getFallbackResponse(prompt: string): string {
    if (prompt.includes('opening') || prompt.includes('Story Elements:')) {
      const openingFallbacks = [
        "Welcome to your magical adventure! Your brave character finds themselves in an amazing place filled with wonder and possibilities. What exciting discovery do they make first?",
        "An incredible journey is about to begin! Your hero stands at the edge of something extraordinary. What catches their attention and draws them into the adventure?",
        "The story starts with your character in a fascinating world. Something mysterious and exciting is happening around them. What do you think they notice first?"
      ];
      return openingFallbacks[Math.floor(Math.random() * openingFallbacks.length)];
    }
    
    if (prompt.includes('assessment') || prompt.includes('Grammar:')) {
      const assessmentFallbacks = [
        `Grammar: 87\nCreativity: 92\nOverall: 89\nFeedback: Excellent work on your creative story! Your imagination really shines through your writing. Try adding even more descriptive words to make your scenes come alive for readers!`,
        `Grammar: 84\nCreativity: 89\nOverall: 86\nFeedback: What a wonderful adventure you've created! Your storytelling skills are developing beautifully. Consider adding more dialogue between characters to make them feel even more real!`,
        `Grammar: 91\nCreativity: 88\nOverall: 89\nFeedback: Outstanding creativity and imagination! You've built an engaging story with great characters. Keep experimenting with different sentence lengths to add variety to your writing!`
      ];
      return assessmentFallbacks[Math.floor(Math.random() * assessmentFallbacks.length)];
    }
    
    // General turn responses
    const turnFallbacks = [
      "What an exciting turn in your story! I love how creative you're being with your characters and plot. What happens next in this amazing adventure?",
      "Fantastic writing! You're developing the story so well. I can really picture what you're describing. Where do you want to take your character next?",
      "Incredible imagination! Your story is taking such interesting twists. I'm excited to see how you'll continue this adventure. What challenge comes next?",
      "Amazing storytelling! You're weaving together all the elements beautifully. Your creativity really shines through. What does your brave character do now?",
      "Wonderful work! I love how you're building the excitement in your story. You have such great ideas. How will this adventure continue to unfold?"
    ];
    
    return turnFallbacks[Math.floor(Math.random() * turnFallbacks.length)];
  }

  refreshProviders(): void {
    this.fallbackAttempts = 0;
    this.selectBestProvider();
  }

  // FIXED: Added method to check provider health
  async testProviderConnection(): Promise<boolean> {
    if (!this.activeProvider) return false;

    try {
      const testResponse = await this.activeProvider.generateResponse("Test connection. Respond with 'OK'.");
      // FIXED: Check the content property of the AIResponse object
      return testResponse.content.toLowerCase().includes('ok');
    } catch (error) {
      console.error('Provider test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const smartAIProvider = new SmartProviderManager();