import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const bodySchema = z
  .object({
    campaignIds: z.array(z.string().min(1)).min(1).max(200),
  })
  .strict();

/**
 * POST /api/campaigns/sponsors
 * Body: { campaignIds: string[] }
 * Response: { success, data: { [campaignId]: Array<{id, name, logoUrl}> } }
 *
 * Public — sponsor info is shown on every campaign card.
 */
export async function POST(request: NextRequest) {
  const rl = withRateLimit(request, RATE_LIMITS.api);
  if (rl) return rl;
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }
    const { campaignIds } = parsed.data;

    const txs = await prisma.matchingTransaction.findMany({
      where: { campaignId: { in: campaignIds }, status: 'APPROVED' },
      select: {
        campaignId: true,
        company: { select: { id: true, name: true, logoUrl: true } },
      },
    });

    // Build map: campaignId -> deduped sponsor list
    const map: Record<string, Array<{ id: string; name: string; logoUrl: string | null }>> = {};
    for (const id of campaignIds) map[id] = [];
    const seen = new Set<string>();
    for (const t of txs) {
      const key = `${t.campaignId}:${t.company.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      map[t.campaignId].push(t.company);
    }

    return NextResponse.json({
      success: true,
      data: map,
      meta: { timestamp: new Date().toISOString(), version: '1.0' },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error' },
      { status: 500 }
    );
  }
}
