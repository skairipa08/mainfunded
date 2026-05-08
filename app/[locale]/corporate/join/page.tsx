import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { EmployeeJoinForm } from '@/components/corporate/EmployeeJoinForm';

export default async function CorporateJoinPage() {
  const session = await auth();
  if (!session) redirect('/login');
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-semibold mb-6">Şirket Eşleştirme Programına Katıl</h1>
      <p className="mb-6 text-gray-600">
        Şirketinizden aldığınız 8 karakterlik aktivasyon kodunu girerek, yapacağınız bağışların
        kurumsal eşleştirme programına dahil olmasını sağlayabilirsiniz.
      </p>
      <EmployeeJoinForm />
    </div>
  );
}
