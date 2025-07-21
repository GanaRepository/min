// lib/ai/providers/anthropic-provider.ts
import { AIProviderConfig, AIResponse } from './types';

export class AnthropicProvider implements AIProviderConfig {
  name = 'Anthropic';
  model = 'claude-3-5-haiku-20241022'; // Cheapest Claude model from your screenshot
  estimatedCost = 0.775; // Average of input ($0.25) and output ($1.25) per 1M tokens
  
  isAvailable(): boolean {
    return !!process.env.ANTHROPIC_API_KEY;
  }

  async generateResponse(prompt: string): Promise<AIResponse> {
    if (!this.isAvailable()) {
      throw new Error('Anthropic provider not available');
    }

    try {
      // Using the OpenAI-compatible endpoint for Anthropic Claude
      const response = await fetch('https://api.anthropic.com/v1/openai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model, // claude-3-5-haiku-20241022
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
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        content: data.choices[0]?.message?.content || '',
        provider: this.name,
        model: this.model,
        tokensUsed: data.usage?.total_tokens
      };
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw new Error(`Anthropic API failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}