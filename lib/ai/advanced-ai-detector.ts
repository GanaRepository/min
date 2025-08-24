import { smartAIProvider } from './smart-provider-manager';

export interface AIDetectionResult {
  humanLikeScore: number; // 0-100 
  aiLikelihood: string; // "Very High (95%)" etc
  confidenceLevel: number; // 0-100
  analysis: string;
  riskLevel: string; // "CRITICAL RISK" etc
  indicators: string[];
  detectionMethod: string;
}

export class AdvancedAIDetector {
  
  static async detectAIContent(
    content: string,
    options: {
      childAge?: number;
      expectedGenre?: string;
      isCreativeWriting?: boolean;
    } = {}
  ): Promise<AIDetectionResult> {

    console.log('🔍 Starting multi-layered AI detection analysis...');

    // MULTI-LAYERED DETECTION APPROACH
    const detectionResults = await Promise.all([
      this.performPatternAnalysis(content, options),
      this.performLinguisticAnalysis(content, options), 
      this.performAIProviderAnalysis(content, options),
      this.performStatisticalAnalysis(content, options)
    ]);

    // Combine results with weighted scoring
    const finalScore = this.combineDetectionResults(detectionResults);
    
    console.log(`🤖 AI Detection completed: ${finalScore.aiLikelihood} (${finalScore.humanLikeScore}% human-like)`);
    
    return finalScore;
  }

  // METHOD 1: PATTERN ANALYSIS - Look for AI-specific patterns
  private static async performPatternAnalysis(content: string, options: any) {
    let aiScore = 0;
    const indicators: string[] = [];

    // ChatGPT/OpenAI specific patterns that appear frequently
    const chatgptPatterns = [
      // Common ChatGPT dramatic openings
      /(?:the|a|an)\s+(?:chapel|moonlight|shadows|darkness|whispers?|crystal|eye|chamber|tower|forest)\s+(?:stood|lay|touched|curled|pulsed|flared|loomed)/gi,
      
      // ChatGPT character action patterns
      /(?:her|his|their)\s+(?:hand|fingers?|vision|breath|skin|heart)\s+(?:trembled?|shook|blurred|stole|burned|raced)/gi,
      
      // ChatGPT dramatic transitions
      /(?:in that instant|at that moment|in the darkness|through the shadows|with a final|for one heartbeat)/gi,
      
      // ChatGPT realization patterns
      /(?:she|he|it)\s+(?:realized|understood|knew|discovered)\s*:/gi,
      
      // ChatGPT descriptive adjectives (overused)
      /(?:brilliant|searing|molten|ancient|forgotten|endless|thunderous|crystalline|blazing|writhed)/gi,
      
      // ChatGPT sentence starters
      /^(?:the|a|an)\s+\w+\s+(?:stood|lay|rose|fell|trembled|pulsed|echoed)/gi,
      
      // ChatGPT character movement patterns
      /^(?:\w+|she|he)\s+(?:traced|pressed|clutched|forced|staggered|gasped)/gi,
      
      // ChatGPT dramatic sound/action patterns
      /\w+\s+(?:roared|thundered|whispered|screamed|howled|blazed|surged|spilled)/gi,
      
      // ChatGPT mystical element patterns
      /(?:symbols|light|darkness|power|voice|energy|magic)\s+(?:blazed|seared|pressed|surged|spilled|raced|pulsed)/gi,
    ];

    let totalMatches = 0;
    chatgptPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        totalMatches += matches.length;
        aiScore += matches.length * 12; // Heavy penalty for ChatGPT patterns
        indicators.push(`ChatGPT pattern detected: "${matches[0].toLowerCase()}" (${matches.length} occurrences)`);
      }
    });

    // If many patterns detected, very suspicious
    if (totalMatches > 8) {
      aiScore += 25;
      indicators.push(`High concentration of AI patterns: ${totalMatches} total matches`);
    }

    // Perfect prose indicators (very suspicious for child writing)
    if (options.childAge && options.childAge <= 12) {
      const sophisticatedWords = content.match(/\b(?:crystalline|molten|searing|writhed|trembling|pulsed|thunderous|endless|brilliant|ancient|forgotten|veins|amber|streaked|deafening)\b/gi);
      if (sophisticatedWords && sophisticatedWords.length > 6) {
        aiScore += 30;
        indicators.push(`Exceptionally sophisticated vocabulary for age ${options.childAge}: ${sophisticatedWords.length} advanced words`);
      }

      // Perfect punctuation (very suspicious for children)
      const complexPunctuation = content.match(/[—;:]/g);
      if (complexPunctuation && complexPunctuation.length > 4) {
        aiScore += 25;
        indicators.push(`Advanced punctuation usage highly unusual for child writing: ${complexPunctuation.length} instances`);
      }

      // Perfect sentence structure variety (suspicious)
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 5);
      if (sentences.length > 5) {
        const avgLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
        if (avgLength > 18 && options.childAge <= 10) {
          aiScore += 20;
          indicators.push(`Average sentence length (${avgLength.toFixed(1)} words) too sophisticated for age ${options.childAge}`);
        }
      }
    }

    // Check for lack of natural imperfections (AI rarely makes mistakes)
    const naturalErrors = content.match(/\b(?:gonna|wanna|kinda|sorta|alot|definately)\b/gi);
    const informalElements = content.match(/[.]{2,}|[!]{2,}|[?]{2,}|\b(?:um|uh|like|you know)\b/gi);
    
    if (!naturalErrors && !informalElements && content.length > 500) {
      aiScore += 15;
      indicators.push('Unusually perfect writing with no natural errors or informal elements');
    }

    return { aiScore, indicators, method: 'pattern_analysis' };
  }

  // METHOD 2: LINGUISTIC ANALYSIS - Analyze writing style
  private static async performLinguisticAnalysis(content: string, options: any) {
    let aiScore = 0;
    const indicators: string[] = [];

    // Sentence length consistency (AI tends to be more uniform)
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 5);
    if (sentences.length >= 6) {
      const lengths = sentences.map(s => s.trim().split(/\s+/).length);
      const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
      const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
      
      // Very low variance is highly suspicious for creative writing
      if (variance < 6 && avgLength > 15) {
        aiScore += 30;
        indicators.push(`Suspiciously uniform sentence lengths (variance: ${variance.toFixed(1)}, avg: ${avgLength.toFixed(1)})`);
      }
    }

    // Paragraph structure analysis
    const paragraphs = content.split(/\n/).filter(p => p.trim().length > 50);
    if (paragraphs.length >= 4) {
      // Check for repetitive paragraph openings (AI does this)
      const openings = paragraphs.map(p => {
        const words = p.trim().split(' ').slice(0, 4);
        return words.join(' ').toLowerCase();
      });
      
      const uniqueOpenings = new Set(openings);
      if (uniqueOpenings.size < openings.length * 0.6) {
        aiScore += 25;
        indicators.push(`Repetitive paragraph structure patterns detected (${uniqueOpenings.size}/${openings.length} unique)`);
      }

      // Check paragraph length consistency
      const paragraphLengths = paragraphs.map(p => p.split(/\s+/).length);
      const paragraphAvg = paragraphLengths.reduce((a, b) => a + b, 0) / paragraphLengths.length;
      const paragraphVariance = paragraphLengths.reduce((sum, len) => sum + Math.pow(len - paragraphAvg, 2), 0) / paragraphLengths.length;
      
      if (paragraphVariance < 50 && paragraphAvg > 40) {
        aiScore += 20;
        indicators.push(`Uniform paragraph lengths suggest AI generation`);
      }
    }

    // Vocabulary complexity vs age analysis
    if (options.childAge && options.childAge <= 12) {
      const words = content.split(/\s+/).filter(w => w.length > 0);
      const longWords = words.filter(w => w.replace(/[^a-zA-Z]/g, '').length > 8);
      const veryLongWords = words.filter(w => w.replace(/[^a-zA-Z]/g, '').length > 12);
      
      const complexityRatio = longWords.length / words.length;
      const veryComplexRatio = veryLongWords.length / words.length;
      
      if (complexityRatio > 0.15 || veryComplexRatio > 0.03) {
        aiScore += 35;
        indicators.push(`Vocabulary complexity (${(complexityRatio*100).toFixed(1)}% long words) exceptionally high for age ${options.childAge}`);
      }
    }

    // Check for AI-typical connectors and transitions
    const aiConnectors = content.match(/\b(?:furthermore|moreover|consequently|nevertheless|nonetheless|thus|hence|therefore|indeed|in fact|as such)\b/gi);
    if (aiConnectors && aiConnectors.length > 2) {
      aiScore += 20;
      indicators.push(`Formal connectors unusual for creative writing: ${aiConnectors.length} instances`);
    }

    return { aiScore, indicators, method: 'linguistic_analysis' };
  }

  // METHOD 3: AI PROVIDER ANALYSIS - Use AI to detect AI
  private static async performAIProviderAnalysis(content: string, options: any) {
    const prompt = `You are an expert AI content detector. Analyze this text to determine if it was written by AI (ChatGPT, Claude, or similar).

TEXT TO ANALYZE: "${content}"
CLAIMED AUTHOR: ${options.childAge ? `Child, age ${options.childAge}` : 'Unknown age'}
CONTEXT: ${options.isCreativeWriting ? 'Creative writing assignment' : 'General writing'}

CRITICAL ANALYSIS POINTS:
1. Is this vocabulary/sophistication appropriate for claimed age?
2. Are there AI-typical phrases, patterns, or structures?
3. Is the writing unnaturally perfect/polished?
4. Does it lack authentic human quirks, errors, or natural speech?
5. Are there ChatGPT-style dramatic descriptions or formulaic patterns?

RED FLAGS FOR AI CONTENT:
- Perfect grammar with zero natural errors
- Sophisticated vocabulary far exceeding age level
- AI-common phrases like "searing light," "molten gold," "ancient whispers"
- Uniform sentence/paragraph structure
- Dramatic openings typical of AI fantasy writing
- Lack of authentic personal voice or age-appropriate imperfections

BE STRICT: If a 10-year-old supposedly wrote sophisticated fantasy prose with perfect grammar, that's highly suspicious.

Respond ONLY with JSON:
{
  "aiLikelihood": <0-100 number representing percentage AI likelihood>,
  "confidence": <0-100 confidence in assessment>,
  "reasoning": "<detailed explanation of specific evidence>",
  "specificIndicators": ["<indicator1>", "<indicator2>", "<indicator3>"],
  "recommendation": "<HUMAN/SUSPICIOUS/LIKELY_AI/DEFINITELY_AI>",
  "ageAppropriate": <true/false - is sophistication appropriate for claimed age?>
}`;

    try {
      const response = await smartAIProvider.generateResponse(prompt);
      let analysis;
      
      try {
        analysis = JSON.parse(response.replace(/```json|```/g, '').trim());
      } catch {
        // If JSON parsing fails, extract values manually
        const aiMatch = response.match(/aiLikelihood['":\s]*(\d+)/i);
        const confMatch = response.match(/confidence['":\s]*(\d+)/i);
        
        analysis = {
          aiLikelihood: aiMatch ? parseInt(aiMatch[1]) : 70,
          confidence: confMatch ? parseInt(confMatch[1]) : 75,
          reasoning: "AI provider analysis completed with manual parsing",
          specificIndicators: ["Advanced analysis performed"],
          recommendation: "SUSPICIOUS",
          ageAppropriate: false
        };
      }
      
      return { 
        aiScore: analysis.aiLikelihood || 70, 
        indicators: analysis.specificIndicators || [], 
        reasoning: analysis.reasoning || '',
        confidence: analysis.confidence || 75,
        method: 'ai_provider_analysis',
        recommendation: analysis.recommendation || 'SUSPICIOUS',
        ageAppropriate: analysis.ageAppropriate
      };
    } catch (error) {
      console.error('AI provider analysis failed:', error);
      return this.performFallbackAnalysis(content, options);
    }
  }

  // METHOD 4: STATISTICAL ANALYSIS - Mathematical content analysis
  private static async performStatisticalAnalysis(content: string, options: any) {
    let aiScore = 0;
    const indicators: string[] = [];

    // Word frequency analysis for AI-common terms
    const words = content.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const wordFreq = new Map<string, number>();
    words.forEach(word => {
      const cleanWord = word.replace(/[^a-z]/g, '');
      if (cleanWord.length > 0) {
        wordFreq.set(cleanWord, (wordFreq.get(cleanWord) || 0) + 1);
      }
    });

    // Check for AI-common words (ChatGPT loves these)
    const aiCommonWords = [
      'ancient', 'forgotten', 'whisper', 'shadow', 'crystal', 'searing', 
      'molten', 'brilliant', 'endless', 'trembling', 'pulsed', 'thunderous',
      'blazing', 'writhed', 'amber', 'veins', 'streaked', 'deafening',
      'crystalline', 'shimmering', 'ethereal', 'mystical', 'arcane'
    ];
    
    let aiWordCount = 0;
    const foundAiWords: string[] = [];
    aiCommonWords.forEach(word => {
      if (wordFreq.has(word)) {
        const count = wordFreq.get(word)!;
        aiWordCount += count;
        foundAiWords.push(`${word}(${count})`);
      }
    });

    if (aiWordCount > 8) {
      aiScore += 35;
      indicators.push(`High concentration of AI-typical vocabulary: ${aiWordCount} instances [${foundAiWords.join(', ')}]`);
    } else if (aiWordCount > 5) {
      aiScore += 20;
      indicators.push(`Moderate use of AI-common words: ${aiWordCount} instances`);
    }

    // Readability analysis vs claimed age
    if (options.childAge && options.childAge <= 12) {
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 5);
      const avgWordsPerSentence = words.length / sentences.length;
      
      if (avgWordsPerSentence > 22) {
        aiScore += 30;
        indicators.push(`Sentence complexity (${avgWordsPerSentence.toFixed(1)} avg words) far exceeds age ${options.childAge} capability`);
      } else if (avgWordsPerSentence > 18 && options.childAge <= 10) {
        aiScore += 20;
        indicators.push(`Sentence length above typical range for age ${options.childAge}`);
      }

      // Check syllable complexity
      const syllableCount = this.estimateSyllables(content);
      const avgSyllablesPerWord = syllableCount / words.length;
      
      if (avgSyllablesPerWord > 1.8 && options.childAge <= 10) {
        aiScore += 15;
        indicators.push(`High syllable complexity (${avgSyllablesPerWord.toFixed(2)} per word) for claimed age`);
      }
    }

    // Punctuation sophistication analysis
    const advancedPunctuation = content.match(/[—;:""'']/g);
    if (advancedPunctuation && advancedPunctuation.length > 3 && options.childAge && options.childAge <= 10) {
      aiScore += 20;
      indicators.push(`Advanced punctuation (${advancedPunctuation.length} instances) unusual for age ${options.childAge}`);
    }

    return { aiScore, indicators, method: 'statistical_analysis' };
  }

  // Estimate syllable count for readability analysis
  private static estimateSyllables(text: string): number {
    return text.toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .reduce((total, word) => {
        if (word.length <= 1) return total + 1;
        return total + Math.max(1, 
          word.replace(/[aeiou]+/g, 'a')
              .replace(/a$/, '')
              .length
        );
      }, 0);
  }

  // COMBINE ALL DETECTION RESULTS
  private static combineDetectionResults(results: any[]): AIDetectionResult {
    console.log('🔬 Combining detection results from all methods...');
    
    // Weight different methods based on reliability
    const weights = {
      pattern_analysis: 0.30,      // High weight - patterns are very telling
      linguistic_analysis: 0.25,   // Good weight - linguistic analysis is reliable  
      ai_provider_analysis: 0.35,  // Highest weight - AI detecting AI is most accurate
      statistical_analysis: 0.10   // Lower weight - statistical analysis is supplementary
    };

    let totalScore = 0;
    let allIndicators: string[] = [];
    let confidence = 0;
    let hasProviderAnalysis = false;
    
    results.forEach(result => {
      const weight = weights[result.method as keyof typeof weights] || 0.25;
      totalScore += (result.aiScore * weight);
      allIndicators.push(...(result.indicators || []));
      
      if (result.confidence) confidence = Math.max(confidence, result.confidence);
      if (result.method === 'ai_provider_analysis') {
        hasProviderAnalysis = true;
        // Give extra weight to AI provider analysis if it's very confident
        if (result.confidence > 85 && result.aiScore > 70) {
          totalScore += result.aiScore * 0.1; // Bonus weight
        }
      }
    });

    // Normalize to 0-100 scale and ensure reasonable bounds
    totalScore = Math.min(100, Math.max(0, totalScore));
    
    // Calculate human-like score (inverse of AI score)
    const humanLikeScore = Math.max(0, 100 - totalScore);
    
    // Determine likelihood and risk level with strict thresholds
    let aiLikelihood: string;
    let riskLevel: string;
    
    if (totalScore >= 85) {
      aiLikelihood = `Very High (${Math.round(totalScore)}%)`;
      riskLevel = 'CRITICAL RISK';
    } else if (totalScore >= 70) {
      aiLikelihood = `High (${Math.round(totalScore)}%)`;
      riskLevel = 'HIGH RISK';
    } else if (totalScore >= 50) {
      aiLikelihood = `Medium (${Math.round(totalScore)}%)`;
      riskLevel = 'MEDIUM RISK';
    } else if (totalScore >= 25) {
      aiLikelihood = `Low (${Math.round(totalScore)}%)`;
      riskLevel = 'LOW RISK';
    } else {
      aiLikelihood = `Very Low (${Math.round(totalScore)}%)`;
      riskLevel = 'VERY LOW RISK';
    }

    // Generate analysis based on score and indicators
    let analysis: string;
    if (totalScore >= 80) {
      analysis = `Strong evidence suggests this content was generated by AI. Multiple detection methods identified patterns consistent with ChatGPT or similar models, including sophisticated vocabulary, uniform structures, and AI-typical descriptive phrases. The writing quality far exceeds natural expectations for the claimed author profile.`;
    } else if (totalScore >= 60) {
      analysis = `Significant indicators suggest likely AI generation. Content displays several characteristics typical of AI-generated text, including advanced language patterns and structural consistency that warrant careful review.`;
    } else if (totalScore >= 40) {
      analysis = `Mixed indicators detected with some elements suggesting possible AI assistance. Content shows both human-like and AI-typical characteristics requiring additional evaluation.`;
    } else {
      analysis = `Content appears primarily human-written with natural variability and authentic creative elements. Few AI indicators detected, suggesting genuine human authorship.`;
    }

    // Ensure reasonable confidence level
    if (confidence === 0) {
      confidence = hasProviderAnalysis ? 
        Math.min(95, 70 + (Math.abs(50 - totalScore) * 0.5)) : 
        Math.min(85, 60 + (Math.abs(50 - totalScore) * 0.4));
    }

    const result = {
      humanLikeScore: Math.round(humanLikeScore),
      aiLikelihood,
      confidenceLevel: Math.round(confidence),
      analysis,
      riskLevel,
      indicators: allIndicators.length > 0 ? 
        [...new Set(allIndicators)].slice(0, 6) : // Remove duplicates and limit
        ['Comprehensive multi-method analysis completed'],
      detectionMethod: 'Advanced Multi-Layered AI Detection System'
    };

    console.log(`🎯 Final AI Detection: ${result.aiLikelihood} (Human-like: ${result.humanLikeScore}%)`);
    console.log(`🔍 Risk Level: ${result.riskLevel}`);
    console.log(`📊 Indicators: ${result.indicators.length} detected`);

    return result;
  }

  // Fallback analysis when AI service fails
  private static performFallbackAnalysis(content: string, options: any) {
    console.log('⚠️ Performing fallback AI detection analysis...');
    
    // Start with moderate suspicion when AI service fails
    let aiScore = 50;
    const indicators: string[] = [];

    // Check for ChatGPT-common words
    const chatgptWords = ['ancient', 'forgotten', 'searing', 'molten', 'crystalline', 'writhed', 'thunderous'];
    let chatgptWordCount = 0;
    chatgptWords.forEach(word => {
      if (new RegExp('\\b' + word + '\\b', 'gi').test(content)) {
        chatgptWordCount++;
      }
    });

    if (chatgptWordCount > 4) {
      aiScore += 25;
      indicators.push(`High use of ChatGPT-common words: ${chatgptWordCount} detected`);
    }

    // Age vs sophistication check (most important fallback check)
    if (options.childAge && options.childAge <= 10) {
      // Check for advanced vocabulary
      const sophisticatedPattern = /\b(?:nevertheless|furthermore|consequently|crystalline|molten|searing|writhed|thunderous|deafening|blazing)\b/gi;
      const sophisticatedMatches = content.match(sophisticatedPattern);
      
      if (sophisticatedMatches && sophisticatedMatches.length > 3) {
        aiScore += 30;
        indicators.push(`Advanced vocabulary highly unusual for age ${options.childAge}: ${sophisticatedMatches.length} instances`);
      }

      // Check sentence complexity
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 5);
      const avgWordsPerSentence = content.split(/\s+/).length / sentences.length;
      
      if (avgWordsPerSentence > 20) {
        aiScore += 20;
        indicators.push(`Sentence complexity exceeds age ${options.childAge} expectations`);
      }
    }

    // Check for perfect prose (no natural errors)
    if (!/\b(?:um|uh|like|you know|kinda|sorta|alot|definately)\b/i.test(content) && 
        !/[.]{2,}|[!]{2,}|[?]{2,}/i.test(content) && 
        content.length > 300) {
      aiScore += 15;
      indicators.push('Unusually perfect writing with no natural errors or informal elements');
    }

    return {
      aiScore,
      indicators,
      reasoning: 'Fallback heuristic analysis due to AI service unavailability',
      confidence: 70,
      method: 'fallback_analysis',
      recommendation: aiScore > 65 ? 'LIKELY_AI' : 'SUSPICIOUS'
    };
  }
}