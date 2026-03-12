import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { campaignId, eventType } = body;

        if (!campaignId || !eventType) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // In a real database scenario, we would log this to an 'embed_analytics' or 'campaign_stats' table.
        // For now we simulate successful logging.
        console.log(`[Embed Analytics] Event: ${eventType} | Campaign: ${campaignId}`);

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
