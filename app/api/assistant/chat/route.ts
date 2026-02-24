import { NextRequest, NextResponse } from 'next/server';
import {
  processUserMessage,
  generateWelcomeResponse,
  generateProactiveResponse,
  getKnowledgeById,
} from '@/lib/ai-assistant/chat-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, text, currentStep } = body as {
      action: 'welcome' | 'proactive' | 'chat' | 'knowledge';
      text?: string;
      currentStep?: string;
      knowledgeId?: string;
    };

    let result;

    switch (action) {
      case 'welcome':
        result = generateWelcomeResponse();
        break;

      case 'proactive':
        result = generateProactiveResponse();
        break;

      case 'knowledge':
        result = getKnowledgeById(body.knowledgeId ?? '');
        break;

      case 'chat':
      default:
        if (!text) {
          return NextResponse.json(
            { error: 'text is required for chat action' },
            { status: 400 },
          );
        }
        result = processUserMessage(text, currentStep as any);
        break;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[assistant/chat] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
