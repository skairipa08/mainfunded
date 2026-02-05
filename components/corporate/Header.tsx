'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, Search, ChevronDown, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useCorporateAuth } from '@/lib/corporate/auth';

interface HeaderProps {
    title: string;
    subtitle?: string;
}

export default function CorporateHeader({ title, subtitle }: HeaderProps) {
    const { user } = useCorporateAuth();

    const initials = user
        ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
        : 'KP';

    const displayName = user
        ? `${user.firstName} ${user.lastName}`
        : 'Kurumsal Kullanıcı';

    const handleDownload = () => {
        const companyName = user?.companyName || 'Şirket';
        const reportWindow = window.open('', '_blank');
        if (reportWindow) {
            reportWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>ESG Raporu - FundEd</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                        h1 { color: #059669; border-bottom: 2px solid #059669; padding-bottom: 10px; }
                        h2 { color: #374151; margin-top: 30px; }
                        .stat { display: inline-block; margin: 10px 20px 10px 0; padding: 20px; background: #F0FDF4; border-radius: 8px; }
                        .stat-value { font-size: 24px; font-weight: bold; color: #059669; }
                        .stat-label { font-size: 12px; color: #6B7280; }
                        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center; color: #9CA3AF; font-size: 12px; }
                        @media print { body { padding: 20px; } }
                    </style>
                </head>
                <body>
                    <h1>🌱 ESG Performans Raporu</h1>
                    <p>${companyName} - Rapor Dönemi: Ocak 2026 - Şubat 2026</p>
                    
                    <h2>Etki Özeti</h2>
                    <div class="stat"><div class="stat-value">24</div><div class="stat-label">Desteklenen Öğrenci</div></div>
                    <div class="stat"><div class="stat-value">8</div><div class="stat-label">Mezun Sayısı</div></div>
                    <div class="stat"><div class="stat-value">%92</div><div class="stat-label">İstihdam Oranı</div></div>
                    
                    <h2>BM SDG Uyumu</h2>
                    <ul>
                        <li>SDG 1 - Yoksulluğa Son: 🟢 Yüksek Etki</li>
                        <li>SDG 4 - Nitelikli Eğitim: 🟢 Yüksek Etki</li>
                        <li>SDG 5 - Cinsiyet Eşitliği: 🔵 Orta Etki</li>
                        <li>SDG 10 - Eşitsizliklerin Azaltılması: 🟢 Yüksek Etki</li>
                    </ul>
                    
                    <div class="footer">
                        <p>Bu rapor FundEd platformu tarafından otomatik oluşturulmuştur.</p>
                        <p>Oluşturma Tarihi: ${new Date().toLocaleDateString('tr-TR')}</p>
                    </div>
                </body>
                </html>
            `);
            reportWindow.document.close();
            reportWindow.print();
        }
    };

    return (
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Title */}
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h1>
                    {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-2 md:gap-4">
                    {/* Search - hidden on mobile */}
                    <div className="relative hidden lg:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="search"
                            placeholder="Ara..."
                            className="pl-10 w-64 bg-gray-50 border-gray-200"
                        />
                    </div>

                    {/* Notifications */}
                    <Link href="/corporate/notifications">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5 text-gray-600" />
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                2
                            </span>
                        </Button>
                    </Link>

                    {/* Language Switcher */}
                    <LanguageSwitcher variant="minimal" />

                    {/* Download Report */}
                    <Button variant="ghost" size="icon" onClick={handleDownload} title="ESG Raporu İndir">
                        <Download className="h-5 w-5 text-gray-600" />
                    </Button>

                    {/* User Dropdown - simplified on mobile */}
                    <Link href="/corporate/settings">
                        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 md:px-3 py-2 rounded-lg transition-colors">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                {initials}
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm font-medium text-gray-900">{displayName}</p>
                                <p className="text-xs text-gray-500">{user?.tier === 'enterprise' ? 'Enterprise' : user?.tier === 'growth' ? 'Growth' : user?.tier === 'starter' ? 'Starter' : 'Admin'}</p>
                            </div>
                            <ChevronDown className="h-4 w-4 text-gray-400 hidden md:block" />
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    );
}
