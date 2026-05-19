import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { requireApprovedCompanyOwner } from '@/lib/authz';
import { findRuleByCompany } from '@/lib/corporate/matching-rule-repo';
import { getDashboardStats, getTrend } from '@/lib/corporate/dashboard-data';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const runtime = 'nodejs';

function errResponse(err: any) {
  const message = err?.message || 'Server error';
  const status = err?.statusCode || (message === 'Unauthorized' ? 401 : 500);
  return NextResponse.json({ success: false, error: message }, { status });
}

/** GET /api/corporate/esg/report?year=2026 — Annual ESG PDF report */
export async function GET(request: NextRequest) {
  const rl = withRateLimit(request, RATE_LIMITS.api);
  if (rl) return rl;
  try {
    const { company } = await requireApprovedCompanyOwner();
    const url = new URL(request.url);
    const year = parseInt(url.searchParams.get('year') ?? `${new Date().getFullYear()}`, 10);

    const rule = await findRuleByCompany(company.id);
    const [stats, trend] = await Promise.all([
      getDashboardStats(company.id, rule),
      getTrend(company.id, 12),
    ]);

    const yearTrend = trend.filter((p) => p.periodKey.startsWith(`${year}-`));
    const yearTotal = yearTrend.reduce((acc, p) => acc + p.matched, 0);

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    let y = 60;

    doc.setFontSize(20);
    doc.text(`${company.name} — ESG Annual Report`, 40, y);
    y += 28;
    doc.setFontSize(11);
    doc.setTextColor(120);
    doc.text(`Year: ${year}    Generated: ${new Date().toISOString().slice(0, 10)}`, 40, y);
    y += 30;
    doc.setTextColor(0);

    doc.setFontSize(14);
    doc.text('Summary', 40, y);
    y += 20;
    doc.setFontSize(11);
    const summaryRows = [
      ['Total matched (year)', `${yearTotal.toLocaleString('tr-TR')} TRY`],
      ['Total matched (all time)', `${stats.totalMatchedAllTime.toLocaleString('tr-TR')} TRY`],
      ['Approved transactions', `${stats.approvedTxCount}`],
      ['Pending transactions', `${stats.pendingTxCount}`],
      ['Rejected transactions', `${stats.rejectedTxCount}`],
      ['Distinct campaigns supported', `${stats.affectedStudents}`],
      ['Monthly budget', `${stats.monthlyBudget.toLocaleString('tr-TR')} TRY`],
    ];
    for (const [label, value] of summaryRows) {
      doc.text(label, 40, y);
      doc.text(value, W - 40, y, { align: 'right' });
      y += 16;
    }

    y += 16;
    doc.setFontSize(14);
    doc.text('Monthly trend', 40, y);
    y += 18;
    doc.setFontSize(10);
    if (yearTrend.length === 0) {
      doc.text('No data for this year.', 40, y);
    } else {
      const max = Math.max(...yearTrend.map((p) => p.matched), 1);
      const chartTop = y;
      const chartHeight = 120;
      const chartBottom = chartTop + chartHeight;
      const colWidth = (W - 80) / yearTrend.length;
      yearTrend.forEach((p, i) => {
        const h = (p.matched / max) * chartHeight;
        const x = 40 + i * colWidth;
        doc.setFillColor(60, 130, 220);
        doc.rect(x + 2, chartBottom - h, colWidth - 4, h, 'F');
      });
      y = chartBottom + 14;
      yearTrend.forEach((p, i) => {
        const x = 40 + i * colWidth + colWidth / 2;
        doc.text(p.periodKey.split('-')[1], x, y, { align: 'center' });
      });
      y += 14;
    }

    y += 24;
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(
      'This report is generated automatically based on approved corporate matching transactions on the FundEd platform.',
      40,
      y,
      { maxWidth: W - 80 }
    );

    const pdf = Buffer.from(doc.output('arraybuffer'));
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="esg-${company.name.replace(/\s+/g, '-')}-${year}.pdf"`,
      },
    });
  } catch (err) {
    return errResponse(err);
  }
}
