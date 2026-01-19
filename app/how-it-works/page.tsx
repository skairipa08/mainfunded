'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useTranslation } from '@/lib/i18n';

export default function HowItWorksPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-12">{t('nav.howItWorks')}</h1>

          <section className="mb-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">{t('verification.title')}</h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                {t('home.howItWorks.step1Desc')}
              </p>
              <p className="leading-relaxed">
                {t('campaign.verified')} - {t('home.hero.subtitle')}
              </p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">{t('donation.title')}</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('home.stats.donors')}</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('home.howItWorks.step2Desc')}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('nav.campaigns')}</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('home.cta.description')}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('home.howItWorks.step3Title')}</h3>
                <p className="text-gray-700 leading-relaxed">
                  {t('home.howItWorks.step3Desc')}
                </p>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">{t('dashboard.recentActivity')}</h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                {t('home.hero.subtitle')}
              </p>
              <p className="leading-relaxed">
                {t('home.cta.description')}
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">{t('home.cta.title')}</h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                {t('home.howItWorks.step1Desc')}
              </p>
              <p className="leading-relaxed">
                {t('home.howItWorks.step2Desc')}
              </p>
              <p className="leading-relaxed">
                {t('home.howItWorks.step3Desc')}
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
