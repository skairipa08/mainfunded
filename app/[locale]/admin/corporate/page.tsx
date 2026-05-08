import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AdminCompanyList } from '@/components/corporate/AdminCompanyList';

export default async function AdminCorporatePage() {
  const session = await auth();
  if (!session) redirect('/login');
  if ((session.user as any)?.role !== 'admin') redirect('/');
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-semibold mb-6">Şirket Onay Kuyruğu</h1>
      <AdminCompanyList />
    </div>
  );
}
