import { NextResponse } from 'next/server';

// Basic rate limiter (in-memory for demo, should be Redis in production)
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_MESSAGES_PER_WINDOW = 3;

// Basic moderation list
const BAD_WORDS = ['spam', 'scam', 'hate', 'stupid', 'idiot', 'fake'];

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const body = await req.json();
        const { message } = body;

        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
        }

        // 1. Rate Limiting (using IP as simple identifier for demo)
        const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
        const currentCount = rateLimitMap.get(ip) || 0;

        if (currentCount >= MAX_MESSAGES_PER_WINDOW) {
            return NextResponse.json({ error: 'rate_limit', message: 'Too many requests' }, { status: 429 });
        }

        // Update rate limit
        rateLimitMap.set(ip, currentCount + 1);
        // Rough cleanup timeout
        setTimeout(() => {
            const count = rateLimitMap.get(ip) || 0;
            if (count > 0) rateLimitMap.set(ip, count - 1);
        }, RATE_LIMIT_WINDOW_MS);

        // 2. Moderation Check
        const lowerMessage = message.toLowerCase();
        const containsBadWord = BAD_WORDS.some(word => lowerMessage.includes(word));

        if (containsBadWord) {
            return NextResponse.json({ error: 'moderation', message: 'Inappropriate content detected' }, { status: 400 });
        }

        // 3. Save Message to DB (Simulated)
        // await prisma.studentMessage.create({ ... })

        return NextResponse.json({ success: true, messageId: 'msg-' + Date.now() });

    } catch (error) {
        console.error('Messaging API Error:', error);
        return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }
}
