'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GraduationCap, Heart } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

const sponsors = [
  { name: 'Nexus Technologies', logo: '/sponsors/sponsor1.png' },
  { name: 'Apex Capital', logo: '/sponsors/sponsor2.png' },
  { name: 'EduVantage', logo: '/sponsors/sponsor3.png' },
  { name: 'HealthCore', logo: '/sponsors/sponsor4.png' },
];

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Sponsors Section with Sliding Animation */}
      <div className="bg-gray-800 py-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-4">
          <h3 className="text-center text-lg font-semibold text-gray-300 mb-6">
            Sponsorlarimiz
          </h3>
        </div>
        <div className="relative">
          <div className="flex animate-scroll">
            {/* Duplicate sponsors for seamless loop */}
            {[...sponsors, ...sponsors, ...sponsors].map((sponsor, index) => (
              <div
                key={index}
                className="flex-shrink-0 mx-8 flex flex-col items-center"
              >
                <div className="w-24 h-24 bg-white rounded-lg p-2 flex items-center justify-center">
                  <Image
                    src={sponsor.logo}
                    alt={sponsor.name}
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
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
                <li><Link href="/education-equality" className="text-gray-400 hover:text-white transition-colors">Eğitimde Eşitlik Bağışları</Link></li>
                <li><Link href="/campaigns/new" className="text-gray-400 hover:text-white transition-colors">{t('campaign.createCampaign')}</Link></li>
                <li><Link href="/login" className="text-gray-400 hover:text-white transition-colors">{t('common.login')}</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold mb-4">{t('footer.contact')}</h3>
              <ul className="space-y-2">
                <li><Link href="/who-we-are" className="text-gray-400 hover:text-white transition-colors">{t('footer.about')}</Link></li>
                <li><Link href="/mission-vision" className="text-gray-400 hover:text-white transition-colors">{t('footer.contact')}</Link></li>
                <li><Link href="/how-it-works" className="text-gray-400 hover:text-white transition-colors">{t('nav.howItWorks')}</Link></li>
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

            {/* Kurumsal */}
            <div>
              <h3 className="font-semibold mb-4">Kurumsal</h3>
              <ul className="space-y-2">
                <li><Link href="/corporate" className="text-gray-400 hover:text-white transition-colors">Kurumsal Dashboard</Link></li>
                <li><Link href="/institution/dashboard" className="text-gray-400 hover:text-white transition-colors">Kurum Paneli</Link></li>
                <li><Link href="/ops/applications" className="text-gray-400 hover:text-white transition-colors">Admin Panel</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              {t('footer.copyright')}
            </p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <Link href="/sponsors" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                Tum Sponsorlarimiz →
              </Link>
              <p className="text-gray-400 text-sm flex items-center">
                Made with <Heart className="h-4 w-4 text-red-500 mx-1" /> {t('home.hero.subtitle')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for scrolling animation */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.33%);
          }
        }
        .animate-scroll {
          animation: scroll 15s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </footer>
  );
}
