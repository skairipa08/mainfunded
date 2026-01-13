import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    
    return NextResponse.json({
      status: "healthy",
      database: "healthy",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: "degraded",
      database: "unhealthy",
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}
