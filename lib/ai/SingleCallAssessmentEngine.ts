import { smartAIProvider } from './smart-provider-manager';
import { jsonrepair } from 'jsonrepair';

const schema = {
  coreLanguageSkills: {
    grammarSentenceClarity: '4-5 lines of feedback',
    vocabularyWordChoice: '4-5 lines of feedback',
    spellingPunctuation: '4-5 lines of feedback',
  },
  storytellingSkills: {
    plotPacing: '4-5 lines of feedback',
    characterDevelopment: '4-5 lines of feedback',
    settingWorldBuilding: '4-5 lines of feedback',
    dialogueExpression: '4-5 lines of feedback',
    themeMessage: '4-5 lines of feedback',
  },
  creativeExpressiveSkills: {
    creativityOriginality: '4-5 lines of feedback',
    descriptivePowerEmotionalImpact: '4-5 lines of feedback',
  },
  authenticityGrowth: {
    ageAppropriatenessAuthorship: '4-5 lines of feedback',
    strengthsAreasToImprove: '4-5 lines of feedback',
    practiceExercises: '4-5 lines of feedback',
  },
};

export class SingleCallAssessmentEngine {
  static async performAssessment(
    storyContent: string,
    metadata: {
      childAge?: number;
      storyTitle?: string;
    }
  ): Promise<any> {
    console.log('🎯 Starting Pure AI 13-Factor Teacher Assessment...');

    if (!storyContent || storyContent.trim().length < 50) {
      throw new Error('Content too short for meaningful assessment');
    }

    const prompt = `
You are a kind, supportive English teacher.
Read the story below and evaluate it across 13 important factors.
For each factor, write 4-5 lines of helpful feedback as if speaking to a child.
Do not give numbers, percentages, or grades.
Always include ALL 13 factors.
Return ONLY valid JSON in the exact schema provided.

Schema:
${JSON.stringify(schema, null, 2)}

Story:
"""
${storyContent}
"""

Child Age: ${metadata.childAge || 'Unknown'}
Story Title: ${metadata.storyTitle || 'Untitled'}
`;

    try {
      const response = await smartAIProvider.generateResponse(prompt);
      const parsed = this.parseJSON(response);
      const completed = this.ensureCompleteStructure(parsed);
      console.log('✅ Teacher assessment completed successfully');
      return completed;
    } catch (error) {
      console.error('❌ Teacher assessment failed:', error);
      throw new Error(
        `Assessment failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  // ---------- JSON Parser ----------
  private static parseJSON(response: string): any {
    try {
      let jsonStr = response.trim();
      jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      const start = jsonStr.indexOf('{');
      const end = jsonStr.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        jsonStr = jsonStr.substring(start, end + 1);
      }
      jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');
      try {
        return JSON.parse(jsonStr);
      } catch {
        const repaired = jsonrepair(jsonStr);
        return JSON.parse(repaired);
      }
    } catch (error) {
      console.error('❌ JSON parsing failed:', error);
      console.error('Raw response:', response);
      throw new Error('Invalid JSON response from AI');
    }
  }

  // ---------- Ensure All 13 Factors ----------
  private static ensureCompleteStructure(partial: any): any {
    const defaultText = 'No feedback provided.';

    function deepFill(obj: any, template: any): any {
      const out: any = {};
      for (const key in template) {
        if (typeof template[key] === 'string') {
          out[key] = obj?.[key] || defaultText;
        } else {
          out[key] = deepFill(obj?.[key] || {}, template[key]);
        }
      }
      return out;
    }

    return deepFill(partial, schema);
  }
}
