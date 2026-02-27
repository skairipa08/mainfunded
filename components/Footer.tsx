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

              </ul>
            </div>
          </div>

          {/* Social Media */}
          <div className="border-t border-gray-800 mt-8 pt-8 flex justify-center gap-6">
            <a
              href="https://www.instagram.com/fundedofficiall?igsh=NThsdjM2OXIydmE0&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="bg-gray-800 hover:bg-pink-600 p-3 rounded-full transition-colors"
            >
              <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            <a
              href="https://x.com/fundedofficiall?s=11"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="bg-gray-800 hover:bg-black p-3 rounded-full transition-colors"
            >
              <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://www.tiktok.com/@fundedofficiall?_r=1&_t=ZS-946dDbV8QSK"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="bg-gray-800 hover:bg-gray-950 p-3 rounded-full transition-colors"
            >
              <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/company/funded-global/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="bg-gray-800 hover:bg-blue-700 p-3 rounded-full transition-colors"
            >
              <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
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
