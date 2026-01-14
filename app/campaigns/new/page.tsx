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
    return { allowed: true, user, verificationStatus: 'admin' };
  }

  // Check student profile
  const db = await getDb();
  const studentProfile = await db.collection('student_profiles').findOne(
    { user_id: user.id },
    { projection: { _id: 0, verificationStatus: 1, verification_status: 1 } }
  );

  if (!studentProfile) {
    redirect('/onboarding?message=' + encodeURIComponent('Create a student profile to start a campaign'));
  }

  const verificationStatus = studentProfile.verificationStatus || studentProfile.verification_status;

  if (verificationStatus !== 'verified') {
    redirect('/onboarding?message=' + encodeURIComponent('Verify your student profile to start a campaign'));
  }

  return { allowed: true, user, verificationStatus: 'verified' };
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
