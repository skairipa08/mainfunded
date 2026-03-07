'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Shield, Users, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useTranslation } from "@/lib/i18n/context";

export default function OnboardingPage() {
    const { t } = useTranslation();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const msg = params.get('message');
    if (msg) {
      setMessage(decodeURIComponent(msg));
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') return;

    // If not authenticated, redirect to login with return path
    if (!session) {
      const currentPath = window.location.pathname + window.location.search;
      router.replace(`/login?callbackUrl=${encodeURIComponent(currentPath)}`);
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const steps = [
    {
      icon: Shield,
      title: 'Get Verified',
      description: 'Submit your student profile with verification documents. Our admin team will review and verify your status.',
    },
    {
      icon: Users,
      title: 'Create Campaign',
      description: 'Once verified, create a campaign to share your educational goals and funding needs.',
    },
    {
      icon: Heart,
      title: 'Receive Support',
      description: 'Share your campaign and receive donations from supporters who believe in your journey.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('app.page.welcome_to_funded')}</h1>
            <p className="text-xl text-gray-600 mb-8">
              {t('app.page.funded_connects_verified_stude')}</p>

            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                {t('app.page.how_it_works')}</h2>
              <div className="space-y-6">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                          <Icon className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {index + 1}. {step.title}
                        </h3>
                        <p className="text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {message && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">{message}</p>
              </div>
            )}

            <div className="border-t border-gray-200 pt-8 mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t('app.page.verification_process')}</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <p className="text-gray-700 mb-4">
                  {t('app.page.all_students_must_be_verified_')}</p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{t('app.page.submit_your_student_profile_wi')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{t('app.page.upload_verification_documents_')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{t('app.page.our_admin_team_reviews_your_su')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{t('app.page.once_verified_you_can_create_a')}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-8 mt-8">
              <div className="flex gap-4">
                <Button
                  onClick={() => router.push('/dashboard')}
                  size="lg"
                  className="flex-1"
                >
                  {t('app.page.go_to_dashboard')}<ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/')}
                  size="lg"
                >
                  {t('app.page.browse_campaigns')}</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
