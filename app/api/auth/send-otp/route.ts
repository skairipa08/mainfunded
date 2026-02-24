import { NextRequest, NextResponse } from 'next/server';
import { generateOTP, storeOTP } from '@/lib/auth-utils';
import { z } from 'zod';

const phoneSchema = z.object({
  phone: z.string().min(10, 'Invalid phone number').max(15, 'Invalid phone number'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = phoneSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid phone number' },
        { status: 400 }
      );
    }

    const { phone } = parsed.data;
    const otp = generateOTP();

    // Store OTP in database
    await storeOTP(phone, otp);

    // In production, integrate with SMS service (Twilio, etc.)
    // For development/demo, we log the OTP
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[OTP] Code for ${phone}: ${otp}`);
    }

    // TODO: In production, send SMS here
    // await sendSMS(phone, `Your FundEd verification code is: ${otp}`);

    return NextResponse.json({
      success: true,
      message: 'Verification code sent',
      // Only include OTP in development for testing
      ...(process.env.NODE_ENV !== 'production' && { otp }),
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code.' },
      { status: 500 }
    );
  }
}
