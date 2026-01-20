import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/authz';
import { getDb } from '@/lib/db';
import CreateCampaignForm from './form-wrapper';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function checkAccess() {
  const user = await getSessionUser();

  if (!user) {
    const currentPath = '/campaigns/new';
    redirect(`/login?callbackUrl=${encodeURIComponent(currentPath)}`);
  }

  // Admin can always create campaigns
  if (user.role === 'admin') {
    return { allowed: true, user, verificationStatus: 'admin', tier: 3 };
  }

  const db = await getDb();

  // Check new tiered verification system first
  const verification = await db.collection('verifications').findOne(
    { user_id: user.id, status: 'APPROVED' },
    { projection: { _id: 0, tier_approved: 1, status: 1 } }
  );

  if (verification && verification.tier_approved !== undefined && verification.tier_approved >= 1) {
    return { allowed: true, user, verificationStatus: 'verified', tier: verification.tier_approved };
  }

  // Fallback: Check legacy student_profiles for backwards compatibility
  const studentProfile = await db.collection('student_profiles').findOne(
    { user_id: user.id },
    { projection: { _id: 0, verificationStatus: 1, verification_status: 1 } }
  );

  if (studentProfile) {
    const verificationStatus = studentProfile.verificationStatus || studentProfile.verification_status;
    if (verificationStatus === 'verified') {
      return { allowed: true, user, verificationStatus: 'verified', tier: 1 };
    }
  }

  // Not verified - redirect to verification page
  redirect('/verify?message=' + encodeURIComponent('Verification required to create a campaign. You need Tier 1 or higher.'));
}

export default async function CreateCampaignPage() {
  const access = await checkAccess();

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CreateCampaignForm user={access.user} />
    </Suspense>
  );
}
