import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'FundEd - Empowering Education Through Community';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    background: 'linear-gradient(135deg, #1e40af 0%, #4338ca 50%, #6d28d9 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Decorative circles */}
                <div style={{
                    position: 'absolute', top: -80, right: -80,
                    width: 400, height: 400, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)', display: 'flex',
                }} />
                <div style={{
                    position: 'absolute', bottom: -100, left: -60,
                    width: 350, height: 350, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.04)', display: 'flex',
                }} />
                <div style={{
                    position: 'absolute', top: 120, right: 200,
                    width: 180, height: 180, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.03)', display: 'flex',
                }} />

                {/* Content */}
                <div style={{
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    padding: '80px 100px', width: '100%', height: '100%',
                    position: 'relative', zIndex: 1,
                }}>
                    {/* Logo / Brand */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: 14,
                            background: 'rgba(255,255,255,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 28,
                        }}>
                            🎓
                        </div>
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 22, fontWeight: 600 }}>
                            fund-ed.com
                        </span>
                    </div>

                    {/* Title */}
                    <div style={{
                        fontSize: 72, fontWeight: 800, color: 'white',
                        lineHeight: 1.1, marginBottom: 24, display: 'flex',
                    }}>
                        FundEd
                    </div>

                    {/* Subtitle */}
                    <div style={{
                        fontSize: 28, color: 'rgba(199,210,254,0.9)',
                        fontWeight: 500, lineHeight: 1.4, maxWidth: 600, display: 'flex',
                    }}>
                        Empowering Education Through Community
                    </div>

                    {/* Bottom stats bar */}
                    <div style={{
                        display: 'flex', gap: 48, marginTop: 48,
                        borderTop: '1px solid rgba(255,255,255,0.15)',
                        paddingTop: 32,
                    }}>
                        {[
                            { label: 'Verified Students', icon: '👨‍🎓' },
                            { label: 'Active Campaigns', icon: '📚' },
                            { label: 'Global Donors', icon: '🌍' },
                        ].map((item) => (
                            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: 20 }}>{item.icon}</span>
                                <span style={{ color: 'rgba(199,210,254,0.7)', fontSize: 16, fontWeight: 500 }}>
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ),
        { ...size }
    );
}
