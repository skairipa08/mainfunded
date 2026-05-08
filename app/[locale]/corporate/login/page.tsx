import { LoginForm } from '@/components/corporate/LoginForm';
import { useTranslations } from 'next-intl';

export default function CorporateLoginPage() {
  const t = useTranslations('corporate.login');
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-semibold mb-6">{t('title')}</h1>
      <LoginForm />
    </div>
  );
}
