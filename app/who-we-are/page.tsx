'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useTranslation } from '@/lib/i18n';

export default function WhoWeArePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-12">{t('nav.aboutUs')}</h1>

          <section className="mb-12">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              {t('home.hero.subtitle')}
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">{t('home.howItWorks.title')}</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              {t('home.howItWorks.step1Desc')}
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">{t('home.cta.title')}</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('nav.students')}</h3>
                <p className="text-gray-700 leading-relaxed">
                  {t('home.howItWorks.step1Desc')}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('home.stats.donors')}</h3>
                <p className="text-gray-700 leading-relaxed">
                  {t('home.howItWorks.step2Desc')}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('nav.campaigns')}</h3>
                <p className="text-gray-700 leading-relaxed">
                  {t('home.howItWorks.step3Desc')}
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">{t('home.featured.title')}</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              {t('home.cta.description')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">{t('campaign.verified')}</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {t('home.hero.subtitle')}
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
