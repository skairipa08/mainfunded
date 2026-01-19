'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useTranslation } from '@/lib/i18n';

export default function MissionVisionPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-12">Mission & Vision</h1>

          <section className="mb-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {t('home.hero.subtitle')}
            </p>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Vision</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {t('home.cta.description')}
            </p>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">{t('home.howItWorks.title')}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                <h3 className="font-semibold mb-2">{t('home.howItWorks.step1Title')}</h3>
                <p className="text-gray-600 text-sm">{t('home.howItWorks.step1Desc')}</p>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                <h3 className="font-semibold mb-2">{t('home.howItWorks.step2Title')}</h3>
                <p className="text-gray-600 text-sm">{t('home.howItWorks.step2Desc')}</p>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                <h3 className="font-semibold mb-2">{t('home.howItWorks.step3Title')}</h3>
                <p className="text-gray-600 text-sm">{t('home.howItWorks.step3Desc')}</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">{t('home.cta.title')}</h2>
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
