import { sendEmail } from '@/lib/email'
import { getDb } from '@/lib/db'
import type { DeliveryType } from '@/types/rewards'
import { DELIVERY_LABELS } from '@/types/rewards'

interface DeliveryParams {
  claimId: string
  donorEmail: string
  donorFirstName: string
  campaignTitle: string
  rewardTitle: string
  rewardDescription: string
  deliveryType: DeliveryType
  amountTl: number
  transactionId: string
  donationDate: string
}

export async function dispatchDelivery(params: DeliveryParams): Promise<void> {
  switch (params.deliveryType) {
    case 'thank_you_email':
      await sendThankYouEmail(params)
      await markDelivered(params.claimId)
      break
    case 'handwritten_scan':
      await sendThankYouEmail(params, 'El yazısı taramanız (PDF) hazırlandıktan sonra ayrıca gönderilecektir.')
      console.log('[DeliveryEngine] handwritten_scan queued for manual PDF generation:', params.claimId)
      // Remains 'pending' until PDF is manually uploaded and markDelivered() is called externally
      break
    case 'digital_certificate':
      await generateAndSendCertificate(params)
      // Status stays 'processing' — updated to 'delivered' when PDF generation completes
      await markProcessing(params.claimId)
      break
    case 'impact_report':
      await sendThankYouEmail(params, 'Etki raporunuz ve fotoğraf seti kampanya tamamlandığında e-posta ile gönderilecektir.')
      console.log('[DeliveryEngine] impact_report ESG payload:', {
        claimId: params.claimId,
        campaignTitle: params.campaignTitle,
        amountTl: params.amountTl,
        donorEmail: params.donorEmail,
      })
      await markProcessing(params.claimId)
      break
    case 'scholarship_certificate':
      await generateAndSendCertificate(params, 'scholarship')
      // Status stays 'processing' until signed PDF is delivered
      await markProcessing(params.claimId)
      break
    default:
      await sendThankYouEmail(params)
      await markDelivered(params.claimId)
  }
}

async function markDelivered(claimId: string): Promise<void> {
  try {
    const db = await getDb()
    await db.collection('reward_claims').updateOne(
      { claim_id: claimId },
      { $set: { status: 'delivered', delivered_at: new Date().toISOString() } }
    )
  } catch (err: any) {
    console.error('[DeliveryEngine] Failed to mark claim as delivered:', claimId, err.message)
  }
}

async function markProcessing(claimId: string): Promise<void> {
  try {
    const db = await getDb()
    await db.collection('reward_claims').updateOne(
      { claim_id: claimId },
      { $set: { status: 'processing' } }
    )
  } catch (err: any) {
    console.error('[DeliveryEngine] Failed to mark claim as processing:', claimId, err.message)
  }
}

async function sendThankYouEmail(params: DeliveryParams, additionalNote?: string): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  // Use /tr locale prefix — the donor detail page lives at /[locale]/donor/rewards/[claimId]
  const rewardUrl = `${appUrl}/tr/donor/rewards/${params.claimId}`
  const deliveryLabel = DELIVERY_LABELS[params.deliveryType]

  const deliveryIconMap: Record<DeliveryType, string> = {
    thank_you_email: '✉️',
    handwritten_scan: '✍️',
    digital_certificate: '🏆',
    impact_report: '📊',
    scholarship_certificate: '🎓',
  }
  const deliveryIcon = deliveryIconMap[params.deliveryType]

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ödülün hazır — FundEd</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f0f4ff; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.12); }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding: 40px 48px; text-align: center; }
    .logo { font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
    .logo span { color: #818cf8; }
    .tagline { color: #94a3b8; font-size: 13px; margin-top: 6px; letter-spacing: 1px; text-transform: uppercase; }
    .body { padding: 48px; }
    .greeting { font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
    .intro { color: #64748b; font-size: 15px; line-height: 1.6; margin-bottom: 32px; }
    .reward-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 32px; margin-bottom: 32px; position: relative; overflow: hidden; }
    .reward-box::before { content: ''; position: absolute; top: -40px; right: -40px; width: 120px; height: 120px; background: rgba(255,255,255,0.08); border-radius: 50%; }
    .reward-box::after { content: ''; position: absolute; bottom: -60px; left: -20px; width: 160px; height: 160px; background: rgba(255,255,255,0.05); border-radius: 50%; }
    .reward-badge { display: inline-block; background: rgba(255,255,255,0.2); color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; padding: 5px 12px; border-radius: 20px; margin-bottom: 14px; }
    .reward-icon { font-size: 36px; margin-bottom: 10px; display: block; }
    .reward-title { font-size: 22px; font-weight: 800; color: #ffffff; margin-bottom: 10px; }
    .reward-description { color: rgba(255,255,255,0.85); font-size: 14px; line-height: 1.6; margin-bottom: 16px; }
    .delivery-tag { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.15); color: #ffffff; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.25); }
    .note-box { background: #fef9c3; border: 1px solid #fde68a; border-radius: 10px; padding: 14px 18px; font-size: 13px; color: #92400e; line-height: 1.5; margin-bottom: 28px; }
    .cta-wrapper { text-align: center; margin-bottom: 40px; }
    .cta-btn { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: #ffffff; text-decoration: none; font-weight: 800; font-size: 16px; padding: 16px 40px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 8px 24px rgba(249,115,22,0.35); }
    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 36px; border-radius: 12px; overflow: hidden; }
    .meta-table th { background: #f8fafc; color: #94a3b8; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; text-align: left; padding: 12px 16px; }
    .meta-table td { padding: 12px 16px; font-size: 14px; color: #334155; border-bottom: 1px solid #f1f5f9; }
    .meta-table tr:last-child td { border-bottom: none; }
    .meta-table tr:nth-child(even) td { background: #f8fafc; }
    .amount-cell { font-weight: 800; color: #059669; font-size: 16px; }
    .footer { background: #f8fafc; padding: 28px 48px; border-top: 1px solid #e2e8f0; }
    .footer-text { color: #94a3b8; font-size: 12px; line-height: 1.6; text-align: center; }
    .footer-link { color: #6366f1; text-decoration: none; font-weight: 600; }
    .divider { height: 1px; background: linear-gradient(90deg, transparent, #e2e8f0, transparent); margin: 28px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">Fund<span>Ed</span></div>
      <div class="tagline">Eğitim Bağış Platformu</div>
    </div>

    <div class="body">
      <h1 class="greeting">Merhaba, ${escapeForHtml(params.donorFirstName)}! 🎉</h1>
      <p class="intro">
        <strong>${escapeForHtml(params.campaignTitle)}</strong> kampanyasına yaptığın
        <strong>₺${params.amountTl.toLocaleString('tr-TR')}</strong> bağış onaylandı.
        Seçtiğin ödül kademesi aşağıda — FundEd tarafından otomatik olarak gönderildi.
      </p>

      <div class="reward-box">
        <div class="reward-badge">⚡ Ödülün Hazır</div>
        <span class="reward-icon">${deliveryIcon}</span>
        <div class="reward-title">${escapeForHtml(params.rewardTitle)}</div>
        <div class="reward-description">${escapeForHtml(params.rewardDescription)}</div>
        <div class="delivery-tag">${deliveryIcon} ${escapeForHtml(deliveryLabel)}</div>
      </div>

      ${additionalNote ? `<div class="note-box">📌 ${escapeForHtml(additionalNote)}</div>` : ''}

      <div class="cta-wrapper">
        <a href="${rewardUrl}" class="cta-btn">Ödülünü Görüntüle →</a>
      </div>

      <div class="divider"></div>

      <table class="meta-table">
        <thead>
          <tr><th colspan="2">İşlem Detayları</th></tr>
        </thead>
        <tbody>
          <tr><td>Kampanya</td><td>${escapeForHtml(params.campaignTitle)}</td></tr>
          <tr><td>Bağış Tutarı</td><td class="amount-cell">₺${params.amountTl.toLocaleString('tr-TR')}</td></tr>
          <tr><td>Tarih</td><td>${escapeForHtml(params.donationDate)}</td></tr>
          <tr><td>İşlem No</td><td style="font-family:monospace;font-size:12px">${escapeForHtml(params.transactionId)}</td></tr>
          <tr><td>Ödül Kademesi</td><td><strong>${escapeForHtml(params.rewardTitle)}</strong></td></tr>
        </tbody>
      </table>
    </div>

    <div class="footer">
      <p class="footer-text">
        Sorularınız için <a href="mailto:destek@funded.app" class="footer-link">destek@funded.app</a> adresine yazabilirsiniz.<br />
        © 2026 FundEd · Eğitim Bağış Platformu
      </p>
    </div>
  </div>
</body>
</html>`

  await sendEmail({
    to: params.donorEmail,
    subject: `Bağışın alındı — ${params.rewardTitle} ödülün hazır`,
    html,
    from: 'FundEd <noreply@funded.app>',
  })
}

// TODO: Replace with Puppeteer PDF generation + Cloudinary upload in production.
async function generateAndSendCertificate(
  params: DeliveryParams,
  type: 'standard' | 'scholarship' = 'standard'
): Promise<void> {
  console.log(`[DeliveryEngine] generateAndSendCertificate (${type}) — PDF generation placeholder:`, {
    claimId: params.claimId,
    donorFirstName: params.donorFirstName,
    campaignTitle: params.campaignTitle,
    rewardTitle: params.rewardTitle,
    amountTl: params.amountTl,
  })
  await sendThankYouEmail(
    params,
    type === 'scholarship'
      ? 'İmzalı burs sertifikanız (PDF) kampanya sahibi tarafından onaylandıktan sonra ayrıca gönderilecektir.'
      : 'Dijital sertifikanız (PDF) hazırlandıktan sonra ayrıca gönderilecektir.'
  )
}

function escapeForHtml(str: string): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
