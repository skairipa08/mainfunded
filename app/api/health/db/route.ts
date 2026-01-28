import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    const startTime = Date.now();

    try {
        const db = await getDb();

        // Ping the database
        await db.command({ ping: 1 });

        const latency = Date.now() - startTime;

        return NextResponse.json({
            ok: true,
            latency_ms: latency,
            db: process.env.DB_NAME || 'funded_db',
        });
    } catch (error: any) {
        const latency = Date.now() - startTime;

        // Determine reason (no secrets)
        let reason = 'Connection failed';

        if (error.message?.includes('MONGO_URL') || error.message?.includes('Mongo URI')) {
            reason = 'MONGO_URL not set in environment';
        } else if (error.message?.includes('ENOTFOUND') || error.message?.includes('getaddrinfo')) {
            reason = 'DNS resolution failed - check host in connection string';
        } else if (error.message?.includes('ETIMEDOUT') || error.message?.includes('timed out')) {
            reason = 'Connection timed out - check Atlas Network Access IP whitelist';
        } else if (error.message?.includes('Authentication failed') || error.code === 18) {
            reason = 'Authentication failed - check username/password';
        } else if (error.name === 'MongoServerSelectionError') {
            reason = 'Server selection failed - check Atlas Network Access IP whitelist';
        }

        console.error('[Health/DB] Check failed:', {
            reason,
            errorName: error.name,
            message: error.message,
        });

        return NextResponse.json({
            ok: false,
            reason,
            latency_ms: latency,
        }, { status: 503 });
    }
}
