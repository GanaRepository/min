// // lib/ai/providers/google-provider.ts (FIXED)
// import { AIProviderConfig, AIResponse } from './types';

// export class GoogleProvider implements AIProviderConfig {
//   name = 'Google';
//   model = 'gemini-1.5-flash';
//   estimatedCost = 0;

//   isAvailable(): boolean {
//     return !!process.env.GOOGLE_AI_API_KEY;
//   }

//   async generateResponse(prompt: string): Promise<AIResponse> {
//     if (!this.isAvailable()) {
//       throw new Error('Google AI API key not configured');
//     }

//     try {
//       // ✅ CORRECT Google AI API endpoint
//       const response = await fetch(
//         `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`,
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             contents: [
//               {
//                 parts: [
//                   {
//                     text: prompt,
//                   },
//                 ],
//               },
//             ],
//             generationConfig: {
//               maxOutputTokens: 150,
//               temperature: 0.8,
//             },
//           }),
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.text();
//         console.error('Google AI API Error Response:', errorData);
//         throw new Error(
//           `Google AI API error: ${response.status} - ${errorData}`
//         );
//       }

//       const data = await response.json();

//       if (
//         !data.candidates ||
//         !data.candidates[0] ||
//         !data.candidates[0].content
//       ) {
//         throw new Error('Invalid response format from Google AI');
//       }

//       return {
//         content: data.candidates[0].content.parts[0].text || '',
//         provider: this.name,
//         model: this.model,
//         tokensUsed: data.usageMetadata?.totalTokenCount,
//       };
//     } catch (error) {
//       console.error('Google AI API error:', error);
//       throw new Error(
//         `Google AI API failed: ${error instanceof Error ? error.message : 'Unknown error'}`
//       );
//     }
//   }
// }



// lib/ai/providers/google-provider.ts (FIXED)
import { AIProviderConfig, AIResponse } from './types';

export class GoogleProvider implements AIProviderConfig {
  name = 'Google';
  model = 'gemini-1.5-flash';
  estimatedCost = 0.000075; // Very cheap with billing enabled

  isAvailable(): boolean {
    return !!process.env.GOOGLE_AI_API_KEY;
  }

  async generateResponse(prompt: string): Promise<AIResponse> {
    if (!this.isAvailable()) {
      throw new Error('Google AI API key not configured');
    }

    try {
      // ✅ CORRECT Google AI API endpoint
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              maxOutputTokens: 4000,  // ✅ INCREASED FROM 150 TO 4000
              temperature: 0.3,       // ✅ LOWER FOR MORE CONSISTENT OUTPUT
              topP: 0.8,
              topK: 40,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH", 
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Google AI API Error Response:', errorData);
        throw new Error(
          `Google AI API error: ${response.status} - ${errorData}`
        );
      }

      const data = await response.json();

      if (
        !data.candidates ||
        !data.candidates[0] ||
        !data.candidates[0].content
      ) {
        console.error('Invalid Google AI response structure:', data);
        throw new Error('Invalid response format from Google AI');
      }

      const content = data.candidates[0].content.parts[0].text || '';
      
      // Log response length for debugging
      console.log(`📏 Google AI response length: ${content.length} chars`);
      
      return {
        content,
        provider: this.name,
        model: this.model,
        tokensUsed: data.usageMetadata?.totalTokenCount || 0,
      };
    } catch (error) {
      console.error('Google AI API error:', error);
      throw new Error(
        `Google AI API failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}