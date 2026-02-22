import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/authz';
import type { PayoutMethodType } from '@/types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAPARA_RE = /^\d{10}$/;
const IYZICO_SUBMERCHANT_RE = /^[a-zA-Z0-9]+$/;

function sanitize(input: string): string {
  return input.replace(/[<>"'&]/g, '').trim();
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  return `${local.slice(0, 2)}***@${domain}`;
}

function maskPapara(num: string): string {
  return `${num.slice(0, 2)}***${num.slice(-2)}`;
}

function maskIyzico(id: string): string {
  return `${id.slice(0, 4)}...${id.slice(-4)}`;
}

function validatePayoutMethod(type: PayoutMethodType, body: Record<string, unknown>): string | null {
  switch (type) {
    case 'iyzico': {
      const accountId = String(body.iyzicoSubMerchantKey ?? '');
      if (!IYZICO_SUBMERCHANT_RE.test(accountId)) return 'Geçerli bir iyzico alt bayi anahtarı giriniz';
      return null;
    }
    case 'paypal': {
      const email = String(body.paypalEmail ?? '');
      if (!EMAIL_RE.test(email)) return 'Geçerli bir PayPal e-posta adresi giriniz';
      return null;
    }
    case 'wise': {
      const email = String(body.wiseEmail ?? '');
      if (!EMAIL_RE.test(email)) return 'Geçerli bir Wise e-posta adresi giriniz';
      const currency = body.wiseCurrency;
      if (!['USD', 'EUR', 'GBP'].includes(String(currency))) return 'Para birimi USD, EUR veya GBP olmalıdır';
      return null;
    }
    case 'papara': {
      const num = String(body.paparaAccountNumber ?? '');
      if (!PAPARA_RE.test(num)) return 'Papara hesap numarası 10 haneli olmalıdır';
      return null;
    }
    default:
      return 'Geçersiz ödeme yöntemi';
  }
}

// GET — return masked payout methods for user
export async function GET() {
  try {
    const user = await requireUser();
    const db = await getDb();

    // Get the base user record to check for iyzico sub-merchant accounts
    const baseUser = await db.collection('users').findOne({ id: user.id });

    const profile = await db.collection('student_profiles').findOne(
      { user_id: user.id },
      { projection: { _id: 0, payoutMethods: 1 } },
    );

    // Filter out old payout methods from the profile array
    const legacyMethods = (profile?.payoutMethods ?? []).filter((m: any) => m.type !== 'iyzico');

    const methods: Record<string, unknown>[] = legacyMethods.map((m: Record<string, unknown>) => {
      const masked: Record<string, unknown> = {
        type: m.type,
        isVerified: m.isVerified,
        addedAt: m.addedAt,
        lastPayoutAt: m.lastPayoutAt ?? null,
        isDefault: m.isDefault ?? false,
      };

      switch (m.type) {
        case 'paypal':
          masked.paypalEmail = maskEmail(String(m.paypalEmail ?? ''));
          break;
        case 'wise':
          masked.wiseEmail = maskEmail(String(m.wiseEmail ?? ''));
          masked.wiseCurrency = m.wiseCurrency;
          break;
        case 'papara':
          masked.paparaAccountNumber = maskPapara(String(m.paparaAccountNumber ?? ''));
          break;
      }

      return masked;
    });

    // Dynamically inject the iyzico account native to the base user collection
    if (baseUser?.iyzico_submerchant_key) {
      methods.push({
        type: 'iyzico',
        isVerified: baseUser.iyzico_onboarding_complete || false,
        addedAt: baseUser.created_at || new Date().toISOString(),
        lastPayoutAt: null,
        isDefault: true,
        iyzicoSubMerchantKey: maskIyzico(baseUser.iyzico_submerchant_key),
        iyzicoSubMerchantStatus: baseUser.iyzico_onboarding_complete ? 'active' : 'pending',
        details: {
          id: maskIyzico(baseUser.iyzico_submerchant_key)
        }
      });
    }

    return NextResponse.json({ success: true, data: methods });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: { code: 'ERROR', message } }, { status });
  }
}

// POST — add or update a payout method
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const db = await getDb();
    const body = await request.json();

    const type = body.type as PayoutMethodType;
    if (!['paypal', 'wise', 'papara'].includes(type)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Geçersiz ödeme yöntemi' } },
        { status: 400 },
      );
    }

    const validationErr = validatePayoutMethod(type, body);
    if (validationErr) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: validationErr } },
        { status: 400 },
      );
    }

    const method: Record<string, unknown> = {
      type,
      isVerified: true,
      addedAt: new Date().toISOString(),
      isDefault: body.isDefault ?? false,
    };

    switch (type) {
      case 'paypal':
        method.paypalEmail = sanitize(String(body.paypalEmail));
        break;
      case 'wise':
        method.wiseEmail = sanitize(String(body.wiseEmail));
        method.wiseCurrency = body.wiseCurrency;
        break;
      case 'papara':
        method.paparaAccountNumber = sanitize(String(body.paparaAccountNumber));
        if (body.paparaPhoneNumber) {
          method.paparaPhoneNumber = sanitize(String(body.paparaPhoneNumber));
        }
        break;
    }

    // If setting as default, unset others
    if (method.isDefault) {
      await db.collection('student_profiles').updateOne(
        { user_id: user.id },
        { $set: { 'payoutMethods.$[].isDefault': false } },
      );
    }

    // Remove existing method of same type, then push new one
    await db.collection('student_profiles').updateOne(
      { user_id: user.id },
      { $pull: { payoutMethods: { type } } as any },
    );

    await db.collection('student_profiles').updateOne(
      { user_id: user.id },
      { $push: { payoutMethods: method } as any },
    );

    return NextResponse.json({ success: true, message: 'Ödeme yöntemi kaydedildi' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: { code: 'ERROR', message } }, { status });
  }
}
