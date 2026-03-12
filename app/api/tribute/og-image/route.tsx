/**
 * GET /api/tribute/og-image?donor=...&honoree=...&occasion=...&campaign=...&emoji=...
 *
 * Generates a shareable Open Graph card for tribute donations using Next.js ImageResponse.
 * 1200×630 px — perfect for Twitter/X, Facebook, WhatsApp link previews.
 */
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const donor   = searchParams.get('donor')   ?? 'Bağışçı';
  const honoree = searchParams.get('honoree') ?? 'Sevdikleriniz';
  const campaign= searchParams.get('campaign')?? '';
  const occasion= searchParams.get('occasion')?? 'Özel Bir Kişi İçin';
  const emoji   = searchParams.get('emoji')   ?? '💙';

  // Truncate long strings for safety
  const safeDonor   = donor.slice(0, 60);
  const safeHonoree = honoree.slice(0, 60);
  const safeCampaign= campaign.slice(0, 80);
  const safeOccasion= occasion.slice(0, 40);

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #4338ca 50%, #6d28d9 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -120,
            left: -60,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            display: 'flex',
          }}
        />

        {/* Top label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '40px 60px 0',
          }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 20,
              padding: '6px 16px',
              fontSize: 14,
              color: 'rgba(255,255,255,0.87)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            🎁 Tribute Bağış · FundEd
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 60px',
            gap: 16,
          }}
        >
          {/* Emoji + occasion */}
          <div style={{ fontSize: 52, lineHeight: 1, display: 'flex' }}>{emoji}</div>

          <div
            style={{
              fontSize: 18,
              color: 'rgba(255,255,255,0.7)',
              letterSpacing: 1,
              textTransform: 'uppercase',
              display: 'flex',
            }}
          >
            {safeOccasion}
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: 48,
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.15,
              display: 'flex',
              flexWrap: 'wrap',
            }}
          >
            {safeHonoree} adına
          </div>

          <div
            style={{
              fontSize: 28,
              color: 'rgba(255,255,255,0.75)',
              display: 'flex',
            }}
          >
            bir öğrencinin eğitim hayaline destek olundu
          </div>

          {/* Campaign pill */}
          {safeCampaign && (
            <div
              style={{
                display: 'flex',
                marginTop: 8,
              }}
            >
              <div
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 12,
                  padding: '8px 20px',
                  fontSize: 16,
                  color: 'rgba(255,255,255,0.85)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                🎓 {safeCampaign}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 60px 40px',
          }}
        >
          <div
            style={{
              fontSize: 16,
              color: 'rgba(255,255,255,0.55)',
              display: 'flex',
            }}
          >
            {safeDonor} tarafından bağışlandı
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.9)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            💙 fund-ed.com
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
