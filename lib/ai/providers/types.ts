// lib/ai/providers/types.ts
export interface AIProviderConfig {
  name: string;
  model: string;
  isAvailable: () => boolean;
  estimatedCost: number;
  generateResponse: (prompt: string) => Promise<AIResponse>;
}

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
  tokensUsed?: number;
}