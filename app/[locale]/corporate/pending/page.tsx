import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { PendingBanner } from '@/components/corporate/PendingBanner';

export default async function PendingPage() {
  const session = await auth();
  if (!session) redirect('/corporate/login');
  const status = (session.user as any)?.companyStatus;
  if (status !== 'PENDING') redirect('/corporate/settings/matching-rule');
  return (
    <div className="container mx-auto py-12">
      <PendingBanner />
    </div>
  );
}
