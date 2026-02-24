import { NextRequest, NextResponse } from 'next/server';
import { searchKnowledge, getFallbackResponse } from '@/lib/ai-assistant/knowledge-base';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query: string = body.query || '';

    if (!query.trim()) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    const { entry, related } = searchKnowledge(query);

    if (!entry) {
      return NextResponse.json({
        success: true,
        data: {
          answer: getFallbackResponse(),
          followUp: null,
          relatedQuestions: related.map((r) => r.question),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        answer: entry.answer,
        followUp: entry.followUp ?? null,
        relatedQuestions: related.map((r) => r.question),
      },
    });
  } catch (error) {
    console.error('[Assistant FAQ] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
