import { SignupForm } from '@/components/corporate/SignupForm';
import { useTranslations } from 'next-intl';

export default function CorporateSignupPage() {
  const t = useTranslations('corporate.signup');
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-semibold mb-6">{t('title')}</h1>
      <SignupForm />
    </div>
  );
}
