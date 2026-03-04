import { NextRequest, NextResponse } from 'next/server';
import { createUserWithEmail, findUserByEmail, generateOTP, storeEmailOTP, type AccountType } from '@/lib/auth-utils';
import { sendEmail, renderOtpEmail, renderWelcomeEmail } from '@/lib/email';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  accountType: z.enum(['student', 'donor', 'mentor', 'parent', 'teacher', 'school']).default('student'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { email, password, name, accountType } = parsed.data;

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi zaten kayıtlı. / This email is already registered.' },
        { status: 409 }
      );
    }

    // Create user
    const user = await createUserWithEmail(email, password, name, accountType as AccountType);

    // Generate and send email verification OTP
    const otp = generateOTP();
    await storeEmailOTP(email, otp);

    const otpHtml = renderOtpEmail({
      userName: name,
      otpCode: otp,
      purpose: 'hesap doğrulama',
    });

    sendEmail({
      to: email,
      subject: `🔐 FundEd Doğrulama Kodu: ${otp}`,
      html: otpHtml,
    }).catch((err) => console.error('[Register] OTP email error:', err));

    // Send welcome email
    const welcomeHtml = renderWelcomeEmail({
      userName: name,
      userEmail: email,
      accountType,
    });

    sendEmail({
      to: email,
      subject: '🎉 FundEd\'e Hoş Geldiniz!',
      html: welcomeHtml,
    }).catch((err) => console.error('[Register] Welcome email error:', err));

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully. Please verify your email.',
        requiresVerification: true,
        user: { id: user._id, email: user.email, name: user.name, accountType: user.accountType },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration.' },
      { status: 500 }
    );
  }
}

