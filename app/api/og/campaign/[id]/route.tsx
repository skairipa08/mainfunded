// app/api/og/campaign/[id]/route.tsx
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { fetchCampaignData } from '@/app/[locale]/campaign/[id]/fetchCampaign'

export const runtime = 'nodejs'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const campaign = await fetchCampaignData(params.id)

  if (!campaign) {
    // Branded fallback
    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px', height: '630px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e40af 0%, #4338ca 100%)',
          }}
        >
          <span style={{ color: 'white', fontSize: 48, fontWeight: 800 }}>FundEd</span>
        </div>
      ),
      { width: 1200, height: 630,
        headers: { 'Cache-Control': 'public, s-maxage=60' } }
    )
  }

  const pct = campaign.goal_amount > 0
    ? Math.min(100, Math.round((campaign.raised_amount / campaign.goal_amount) * 100))
    : 0
  const photoUrl = campaign.student?.picture || campaign.cover_image || null

  // Fetch photo as ArrayBuffer so ImageResponse can embed it
  let photoSrc: string | undefined
  if (photoUrl) {
    try {
      const res = await fetch(photoUrl)
      if (res.ok) {
        const buf = await res.arrayBuffer()
        const base64 = Buffer.from(buf).toString('base64')
        const mime = res.headers.get('content-type') || 'image/jpeg'
        photoSrc = `data:${mime};base64,${base64}`
      }
    } catch {
      // silently fall through — no photo
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px', height: '630px',
          display: 'flex', fontFamily: 'system-ui, sans-serif',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)',
        }}
      >
        {/* Left panel — 55% */}
        <div
          style={{
            width: '660px', height: '100%',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: '60px 56px',
          }}
        >
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <span style={{ fontSize: 16, color: 'rgba(199,210,254,0.7)', fontWeight: 600 }}>
              🎓 fund-ed.com
            </span>
          </div>

          {/* Campaign title */}
          <div
            style={{
              fontSize: 44, fontWeight: 800, color: '#ffffff',
              lineHeight: 1.15, marginBottom: 32, display: 'flex',
              flexWrap: 'wrap',
            }}
          >
            {campaign.title.slice(0, 72)}
          </div>

          {/* Progress bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            <div
              style={{
                width: '100%', height: 14, borderRadius: 7,
                background: 'rgba(255,255,255,0.15)', display: 'flex',
              }}
            >
              <div
                style={{
                  width: `${pct}%`, height: '100%', borderRadius: 7,
                  background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
                  display: 'flex',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(199,210,254,0.9)', fontSize: 20, fontWeight: 700 }}>
                %{pct} desteklendi
              </span>
              <span style={{ color: 'rgba(199,210,254,0.6)', fontSize: 18 }}>
                {campaign.donor_count} bağışçı
              </span>
            </div>
          </div>

          {/* Amounts */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 22, color: '#93c5fd', fontWeight: 700 }}>
              ₺{campaign.raised_amount.toLocaleString('tr-TR')}
            </span>
            <span style={{ fontSize: 16, color: 'rgba(199,210,254,0.5)' }}>
              / ₺{campaign.goal_amount.toLocaleString('tr-TR')} hedef
            </span>
          </div>
        </div>

        {/* Right panel — 45% photo */}
        <div
          style={{
            width: '540px', height: '100%',
            display: 'flex', position: 'relative', overflow: 'hidden',
          }}
        >
          {photoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoSrc}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'flex' }}
            />
          ) : (
            <div
              style={{
                width: '100%', height: '100%',
                background: 'linear-gradient(180deg, #4338ca 0%, #1e1b4b 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 80,
              }}
            >
              🎓
            </div>
          )}
          {/* Gradient overlay on left edge of photo */}
          <div
            style={{
              position: 'absolute', top: 0, left: 0,
              width: 100, height: '100%',
              background: 'linear-gradient(90deg, #1e3a8a, transparent)',
              display: 'flex',
            }}
          />
          {/* Verified badge */}
          {campaign.student?.verification_status === 'approved' && (
            <div
              style={{
                position: 'absolute', bottom: 24, right: 24,
                background: 'rgba(34,197,94,0.9)', borderRadius: 20,
                padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 14, color: 'white', fontWeight: 600,
              }}
            >
              ✓ Doğrulandı
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    }
  )
}
