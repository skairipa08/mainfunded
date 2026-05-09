import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

const ALLOWED_EVENT_TYPES = new Set(['view', 'click', 'donate_click', 'share']);

export async function POST(request: NextRequest) {
    try {
        const rateLimitResponse = withRateLimit(request, RATE_LIMITS.api);
        if (rateLimitResponse) {
            return new NextResponse(JSON.stringify({ error: 'Rate limit exceeded' }), {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
            });
        }

        const body = await request.json();
        const { campaignId, eventType } = body;

        if (
            typeof campaignId !== 'string' ||
            typeof eventType !== 'string' ||
            campaignId.length < 3 ||
            campaignId.length > 128 ||
            !ALLOWED_EVENT_TYPES.has(eventType)
        ) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // In a real database scenario, we would log this to an 'embed_analytics' or 'campaign_stats' table.
        // For now we simulate successful logging.

        return new NextResponse(JSON.stringify({ success: true }), {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    } catch (error) {
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
