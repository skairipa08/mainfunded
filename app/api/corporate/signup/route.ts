import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db';
import { signupSchema } from '@/lib/corporate/validators';
import { createCompany, isTaxIdTaken } from '@/lib/corporate/company-repo';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const rl = withRateLimit(request, RATE_LIMITS.api);
  if (rl) return rl;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const input = parsed.data;

  const db = await getDb();
  const users = db.collection('users');

  const emailExists = await users.findOne({ email: input.contactEmail });
  if (emailExists) {
    return NextResponse.json({ success: false, error: 'EMAIL_TAKEN' }, { status: 409 });
  }

  if (await isTaxIdTaken(input.taxId)) {
    return NextResponse.json({ success: false, error: 'TAX_ID_TAKEN' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const userInsert = await users.insertOne({
    email: input.contactEmail,
    name: input.name,
    password: passwordHash,
    role: 'company_owner',
    accountType: 'company',
    provider: 'credentials',
    emailVerified: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const newUserId = userInsert.insertedId.toString();

  let company;
  try {
    company = await createCompany({
      name: input.name,
      legalName: input.legalName,
      taxId: input.taxId,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      websiteUrl: input.websiteUrl,
      logoUrl: input.logoUrl,
      ownerUserId: newUserId,
    });
  } catch (err) {
    // Compensation: delete the orphan User
    try {
      await users.deleteOne({ _id: new ObjectId(newUserId) });
    } catch (rollbackErr) {
      logger.error('[signup.orphan_user]', {
        userId: newUserId,
        original: String(err),
        rollback: String(rollbackErr),
      });
    }
    return NextResponse.json(
      { success: false, error: 'SIGNUP_FAILED' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: { companyId: company.id, status: company.status },
    meta: { timestamp: new Date().toISOString(), version: '1.0' },
  });
}
