// lib/ai/providers/openai-provider.ts
import OpenAI from 'openai';
import { AIProviderConfig, AIResponse } from './types';

export class OpenAIProvider implements AIProviderConfig {
  name = 'OpenAI';
  model = 'gpt-4o-mini'; // Cheapest OpenAI model from your screenshot
  estimatedCost = 0.375; // Average of input and output costs
  
  private client: OpenAI | null = null;

  constructor() {
    if (this.isAvailable()) {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
  }

  isAvailable(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }

  async generateResponse(prompt: string): Promise<AIResponse> {
    if (!this.client) {
      throw new Error('OpenAI provider not available');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: this.model, // gpt-4o-mini
        messages: [
          {
            role: 'system',
            content: 'You are a creative writing assistant for children. Keep responses engaging, age-appropriate, and around 50-80 words. Encourage creativity while maintaining a fun, supportive tone.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.8,
      });

      return {
        content: response.choices[0]?.message?.content || '',
        provider: this.name,
        model: this.model,
        tokensUsed: response.usage?.total_tokens
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}