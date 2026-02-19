import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/authz';
import type { AuditAction, AuditSeverity } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const db = await getDb();
    const { searchParams } = new URL(request.url);

    const action = searchParams.get('action') as AuditAction | null;
    const severity = searchParams.get('severity') as AuditSeverity | null;
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    const query: Record<string, unknown> = {};

    if (action) query.action = action;
    if (severity) query.severity = severity;
    if (dateFrom || dateTo) {
      const ts: Record<string, string> = {};
      if (dateFrom) ts.$gte = dateFrom;
      if (dateTo) ts.$lte = dateTo;
      query.timestamp = ts;
    }

    const logs = await db.collection('audit_logs')
      .find(query, { projection: { _id: 0 } })
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ success: true, data: logs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: { code: 'ERROR', message } }, { status });
  }
}
