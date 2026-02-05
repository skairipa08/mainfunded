export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import { handleRouteError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';

    // Get all paid donations for this user
    const donations = await db.collection('donations')
      .find(
        { donor_id: user.id, payment_status: { $in: ['paid', 'completed'] } },
        { projection: { _id: 0 } }
      )
      .sort({ created_at: -1 })
      .toArray();

    // Enrich with campaign data
    const campaignIds = [...new Set(donations.map(d => d.campaign_id))];
    const campaigns = await db.collection('campaigns')
      .find(
        { campaign_id: { $in: campaignIds } },
        { projection: { _id: 0, campaign_id: 1, title: 1 } }
      )
      .toArray();
    const campaignMap = new Map(campaigns.map(c => [c.campaign_id, c]));

    const enriched = donations.map(d => ({
      donation_id: d.donation_id || '',
      campaign_title: campaignMap.get(d.campaign_id)?.title || d.campaign_id,
      amount: d.amount || 0,
      currency: d.currency || 'USD',
      date: d.created_at || '',
      status: d.payment_status || d.status || 'paid',
      donor_name: d.donor_name || user.name || '',
      donor_email: d.donor_email || user.email || '',
    }));

    if (format === 'csv') {
      const headers = ['Bagis ID', 'Kampanya', 'Tutar', 'Para Birimi', 'Tarih', 'Durum', 'Bagisci Adi', 'E-posta'];
      const rows = enriched.map(d => [
        d.donation_id,
        `"${d.campaign_title.replace(/"/g, '""')}"`,
        d.amount.toString(),
        d.currency,
        d.date,
        d.status,
        `"${d.donor_name.replace(/"/g, '""')}"`,
        d.donor_email,
      ]);

      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="bagislarim_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    if (format === 'json') {
      return new NextResponse(JSON.stringify(enriched, null, 2), {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': `attachment; filename="bagislarim_${new Date().toISOString().split('T')[0]}.json"`,
        },
      });
    }

    // Default: return JSON data for client-side PDF/Excel generation
    return NextResponse.json({ success: true, data: enriched });
  } catch (error) {
    return handleRouteError(error);
  }
}
