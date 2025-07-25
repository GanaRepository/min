// app/api/debug/ai/route.ts
import { NextResponse } from 'next/server';
import { smartAIProvider } from '@/lib/ai/smart-provider-manager';

export async function GET() {
  try {
    console.log('🔍 [DEBUG-API] AI diagnostics requested');
    
    const status = smartAIProvider.getDetailedStatus();
    
    // Test all available providers
    console.log('🧪 [DEBUG-API] Testing providers...');
    await smartAIProvider.testAllProviders();
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      diagnostics: status,
      quickFix: {
        message: "Check the server console for detailed logs with [AI-DIAGNOSTICS] prefix",
        envVarsNeeded: [
          "GOOGLE_AI_API_KEY (recommended - FREE)",
          "OPENAI_API_KEY (paid)",
          "ANTHROPIC_API_KEY (paid)"
        ],
        currentIssue: !status.activeProvider 
          ? "No AI providers configured - using template responses"
          : "AI provider configured and working"
      }
    });
    
  } catch (error) {
    console.error('❌ [DEBUG-API] Failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Test endpoint to try AI generation
export async function POST(request: Request) {
  try {
    const { prompt = 'Test: Generate a single sentence about a brave knight.' } = await request.json();
    
    console.log('🧪 [DEBUG-API] Testing AI generation...');
    console.log(`   📝 Test prompt: ${prompt}`);
    
    const response = await smartAIProvider.generateResponse(prompt);
    
    const isTemplate = response.includes('What an exciting') || 
                      response.includes('Fantastic writing') || 
                      response.includes('Welcome to your');
    
    return NextResponse.json({
      success: true,
      response: response,
      isTemplate: isTemplate,
      provider: smartAIProvider.getActiveProvider()?.name || 'None',
      message: isTemplate 
        ? "⚠️ This is a template response - AI providers are not working"
        : "✅ This is a live AI response - providers are working",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [DEBUG-API] Test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      isTemplate: true,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}