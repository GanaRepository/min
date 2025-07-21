// // lib/ai/smart-provider-manager.ts
// import { OpenAIProvider } from './providers/openai-provider';
// import { GoogleProvider } from './providers/google-provider';
// import { AnthropicProvider } from './providers/anthropic-provider';
// import { AIProviderConfig, AIResponse } from '../ai/providers/types';

// export class SmartProviderManager {
//   private providers: AIProviderConfig[] = [];
//   private activeProvider: AIProviderConfig | null = null;

//   constructor() {
//     // Initialize providers in cost order (cheapest first)
//     this.providers = [
//       new GoogleProvider(),    // 🥇 FREE - Gemini 1.5 Flash
//       new OpenAIProvider(),    // 🥈 $0.375/1M tokens - GPT-4o Mini  
//       new AnthropicProvider()  // 🥉 $0.775/1M tokens - Claude 3.5 Haiku
//     ];

//     // Auto-select the cheapest available provider
//     this.selectBestProvider();
//   }

//   private selectBestProvider(): void {
//     // Find the first available provider (sorted by cost preference)
//     this.activeProvider = this.providers.find(provider => provider.isAvailable()) || null;
    
//     if (this.activeProvider) {
//       const costInfo = this.activeProvider.estimatedCost === 0 
//         ? 'FREE' 
//         : `$${this.activeProvider.estimatedCost}/1M tokens`;
        
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

//   // ✅ This is the method that was missing!
//   async generateResponse(prompt: string): Promise<string> {
//     if (!this.activeProvider) {
//       // Fallback response when no AI provider is available
//       return this.getFallbackResponse(prompt);
//     }

//     try {
//       const response = await this.activeProvider.generateResponse(prompt);
      
//       // Log usage for cost tracking
//       console.log(`📝 AI Response: ${response.provider} (${response.model})`);
//       if (response.tokensUsed && this.activeProvider.estimatedCost > 0) {
//         const estimatedCost = (response.tokensUsed / 1000000) * this.activeProvider.estimatedCost;
//         console.log(`💸 Estimated cost: $${estimatedCost.toFixed(6)}`);
//       } else if (response.tokensUsed) {
//         console.log(`🆓 Tokens used: ${response.tokensUsed} (FREE tier)`);
//       }
      
//       return response.content;
//     } catch (error) {
//       console.error(`❌ ${this.activeProvider.name} failed:`, error);
//       return this.getFallbackResponse(prompt);
//     }
//   }

//   private getFallbackResponse(prompt: string): string {
//     if (prompt.includes('opening') || prompt.includes('Story Elements:')) {
//       return "Welcome to your magical adventure! Your character finds themselves in an amazing place filled with wonder and possibilities. What do you think happens first in your story?";
//     }
    
//     if (prompt.includes('assessment') || prompt.includes('Grammar:')) {
//       return `Grammar: 87\nCreativity: 92\nOverall: 89\nFeedback: Great job on your creative story! Your imagination really shines through, and your writing skills are improving. Keep up the wonderful work!`;
//     }
    
//     return "What an exciting turn in your story! I love how creative you're being. What happens next in this amazing adventure?";
//   }

//   refreshProviders(): void {
//     this.selectBestProvider();
//   }
// }

// // ✅ Export singleton instance (this was the issue!)
// export const smartAIProvider = new SmartProviderManager();

// lib/ai/smart-provider-manager.ts (ADD the missing method)
import { OpenAIProvider } from './providers/openai-provider';
import { GoogleProvider } from './providers/google-provider';
import { AnthropicProvider } from './providers/anthropic-provider';
import { AIProviderConfig, AIResponse } from './providers/types';

export class SmartProviderManager {
  private providers: AIProviderConfig[] = [];
  private activeProvider: AIProviderConfig | null = null;

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

  // ✅ ADD THIS MISSING METHOD:
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

  async generateResponse(prompt: string): Promise<string> {
    if (!this.activeProvider) {
      // Fallback response when no AI provider is available
      return this.getFallbackResponse(prompt);
    }

    try {
      const response = await this.activeProvider.generateResponse(prompt);
      
      // Log usage for cost tracking
      console.log(`📝 AI Response: ${response.provider} (${response.model})`);
      if (response.tokensUsed && this.activeProvider.estimatedCost > 0) {
        const estimatedCost = (response.tokensUsed / 1000000) * this.activeProvider.estimatedCost;
        console.log(`💸 Estimated cost: $${estimatedCost.toFixed(6)}`);
      } else if (response.tokensUsed) {
        console.log(`🆓 Tokens used: ${response.tokensUsed} (FREE tier)`);
      }
      
      return response.content;
    } catch (error) {
      console.error(`❌ ${this.activeProvider.name} failed:`, error);
      return this.getFallbackResponse(prompt);
    }
  }

  private getFallbackResponse(prompt: string): string {
    if (prompt.includes('opening') || prompt.includes('Story Elements:')) {
      return "Welcome to your magical adventure! Your character finds themselves in an amazing place filled with wonder and possibilities. What do you think happens first in your story?";
    }
    
    if (prompt.includes('assessment') || prompt.includes('Grammar:')) {
      return `Grammar: 87\nCreativity: 92\nOverall: 89\nFeedback: Great job on your creative story! Your imagination really shines through, and your writing skills are improving. Keep up the wonderful work!`;
    }
    
    return "What an exciting turn in your story! I love how creative you're being. What happens next in this amazing adventure?";
  }

  refreshProviders(): void {
    this.selectBestProvider();
  }
}

// Export singleton instance
export const smartAIProvider = new SmartProviderManager();