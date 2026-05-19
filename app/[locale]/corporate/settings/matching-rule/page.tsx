import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { MatchingRuleForm } from '@/components/corporate/MatchingRuleForm';
import { ActivationCodePanel } from '@/components/corporate/ActivationCodePanel';

export default async function MatchingRuleSettingsPage() {
  const session = await auth();
  if (!session) redirect('/corporate/login');
  const status = (session.user as any)?.companyStatus;
  if (status === 'PENDING') redirect('/corporate/pending');
  if (status !== 'APPROVED') redirect('/corporate/login');
  return (
    <div className="container mx-auto py-12 space-y-12">
      <section>
        <h1 className="text-3xl font-semibold mb-6">Eşleştirme Kuralı</h1>
        <MatchingRuleForm />
      </section>
      <ActivationCodePanel />
    </div>
  );
}
