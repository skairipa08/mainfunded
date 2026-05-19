import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getOgImpactTranslations } from '@/lib/og-impact-translations';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const studentName = searchParams.get('studentName') || 'a Student';
        const lang = searchParams.get('lang') || 'en';

        const t = getOgImpactTranslations(lang);

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#111827', // dark background
                        backgroundImage: 'radial-gradient(circle at 50% 120%, rgba(99,102,241,0.3) 0%, rgba(17,24,39,1) 70%)',
                        fontFamily: 'sans-serif',
                        color: 'white',
                        padding: '40px',
                    }}
                >
                    {/* Logo / Brand */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 40,
                            left: 40,
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: 32,
                            fontWeight: 800,
                            letterSpacing: '-1px',
                        }}
                    >
                        <span style={{ color: '#4f46e5', marginRight: 8 }}>✦</span>
                        FundEd
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            background: '#4f46e5',
                            padding: '8px 20px',
                            borderRadius: '20px',
                            fontSize: 20,
                            fontWeight: 600,
                            letterSpacing: '2px',
                            marginBottom: 30,
                        }}
                    >
                        {t.badge}
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                        }}
                    >
                        <div
                            style={{
                                fontSize: 72,
                                fontWeight: 900,
                                letterSpacing: '-2px',
                                background: 'linear-gradient(to right, #a5b4fc, #818cf8)',
                                backgroundClip: 'text',
                                color: 'transparent',
                                marginBottom: 20,
                            }}
                        >
                            {t.impact}
                        </div>

                        <div
                            style={{
                                fontSize: 36,
                                fontWeight: 500,
                                color: '#d1d5db',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}
                        >
                            {t.supporter} <span style={{ color: '#fff', fontWeight: 700 }}>{studentName}</span>
                        </div>

                        <div
                            style={{
                                fontSize: 28,
                                fontWeight: 400,
                                color: '#9ca3af',
                                marginTop: 40,
                            }}
                        >
                            {t.thanks}
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (e: any) {
        console.error(e);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
