import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailOTP, markEmailVerified } from '@/lib/auth-utils';
import { z } from 'zod';

const verifySchema = z.object({
    email: z.string().email('Geçersiz e-posta adresi'),
    code: z.string().length(6, 'Doğrulama kodu 6 haneli olmalıdır'),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = verifySchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.errors[0]?.message || 'Geçersiz giriş' },
                { status: 400 }
            );
        }

        const { email, code } = parsed.data;

        // Verify OTP
        const isValid = await verifyEmailOTP(email, code);

        if (!isValid) {
            return NextResponse.json(
                { error: 'Geçersiz veya süresi dolmuş doğrulama kodu.' },
                { status: 400 }
            );
        }

        // Mark email as verified
        await markEmailVerified(email);

        return NextResponse.json({
            success: true,
            message: 'E-posta adresiniz başarıyla doğrulandı.',
            verified: true,
        });
    } catch (error) {
        console.error('Verify email error:', error);
        return NextResponse.json(
            { error: 'Doğrulama işlemi sırasında bir hata oluştu.' },
            { status: 500 }
        );
    }
}
