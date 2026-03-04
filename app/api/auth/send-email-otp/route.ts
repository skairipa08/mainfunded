import { NextRequest, NextResponse } from 'next/server';
import { generateOTP, storeEmailOTP, findUserByEmail } from '@/lib/auth-utils';
import { sendEmail, renderOtpEmail } from '@/lib/email';
import { z } from 'zod';

const emailSchema = z.object({
    email: z.string().email('Geçersiz e-posta adresi'),
    purpose: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = emailSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.errors[0]?.message || 'Geçersiz giriş' },
                { status: 400 }
            );
        }

        const { email, purpose } = parsed.data;

        // Generate OTP
        const otp = generateOTP();

        // Store OTP in database
        await storeEmailOTP(email, otp);

        // Find user name if they exist
        const user = await findUserByEmail(email);
        const userName = user?.name || undefined;

        // Send OTP via email using Resend
        const emailHtml = renderOtpEmail({
            userName,
            otpCode: otp,
            purpose: purpose || 'hesap doğrulama',
        });

        const sent = await sendEmail({
            to: email,
            subject: `🔐 FundEd Doğrulama Kodu: ${otp}`,
            html: emailHtml,
        });

        // In development, also log the OTP
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[Email OTP] Code for ${email}: ${otp}`);
        }

        return NextResponse.json({
            success: true,
            message: 'Doğrulama kodu e-posta adresinize gönderildi.',
            emailSent: sent,
            // Only include OTP in development for testing
            ...(process.env.NODE_ENV !== 'production' && { otp }),
        });
    } catch (error) {
        console.error('Send email OTP error:', error);
        return NextResponse.json(
            { error: 'Doğrulama kodu gönderilemedi.' },
            { status: 500 }
        );
    }
}
