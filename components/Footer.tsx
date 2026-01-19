'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap, Heart } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">FundEd</span>
            </div>
            <p className="text-gray-400 text-sm">
              {t('home.hero.subtitle')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">{t('nav.browse')}</h3>
            <ul className="space-y-2">
              <li><Link href="/browse" className="text-gray-400 hover:text-white transition-colors">{t('nav.browse')}</Link></li>
              <li><Link href="/campaigns/new" className="text-gray-400 hover:text-white transition-colors">{t('campaign.createCampaign')}</Link></li>
              <li><Link href="/login" className="text-gray-400 hover:text-white transition-colors">{t('common.login')}</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('footer.about')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('footer.contact')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('nav.howItWorks')}</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.terms')}</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">{t('footer.privacy')}</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">{t('footer.terms')}</Link></li>
              <li><Link href="/disclaimer" className="text-gray-400 hover:text-white transition-colors">{t('footer.about')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            {t('footer.copyright')}
          </p>
          <p className="text-gray-400 text-sm flex items-center mt-4 md:mt-0">
            Made with <Heart className="h-4 w-4 text-red-500 mx-1" /> {t('home.hero.subtitle')}
          </p>
        </div>
      </div>
    </footer>
  );
}
