'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslation } from "@/lib/i18n/context";
import { Progress } from '../ui/progress';
import { Heart } from 'lucide-react';
import { useCurrency } from '@/lib/currency-context';

interface EmbedWidgetProps {
    campaign: any;
    locale: string;
    theme?: 'light' | 'dark';
}

export default function EmbedWidget({ campaign, locale, theme = 'light' }: EmbedWidgetProps) {
    const { t } = useTranslation();
    const { formatAmount } = useCurrency();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Report view on mount
        fetch('/api/embed-analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaignId: campaign.campaign_id, eventType: 'view' })
        }).catch(console.error);
    }, [campaign.campaign_id]);

    const handleDonateClick = () => {
        fetch('/api/embed-analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaignId: campaign.campaign_id, eventType: 'click' })
        }).catch(console.error);

        // Redirect parent window to donation page
        window.open(`${window.location.origin}/${locale}/campaign/${campaign.campaign_id}`, '_blank');
    };

    const progress = campaign.goal_amount > 0
        ? Math.min((campaign.raised_amount / campaign.goal_amount) * 100, 100)
        : 0;

    const student = campaign.student || {};
    const isDark = theme === 'dark';

    if (!mounted) return null; // Avoid hydration mismatch for theme specific renders

    return (
        <div
            className={`w-full h-full min-h-full font-sans overflow-hidden flex flex-col transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'}`}
            style={{ margin: 0, padding: 0 }}
        >
            <div className="relative h-48 w-full overflow-hidden bg-gray-100 flex-shrink-0">
                {campaign.cover_image ? (
                    <Image
                        src={campaign.cover_image}
                        alt={campaign.title || 'Campaign'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 600px) 100vw, 600px"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                        <span className="text-white text-lg font-bold opacity-75">FundEd</span>
                    </div>
                )}
                <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm">
                    FUNDED
                </div>
            </div>

            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-lg leading-tight line-clamp-2 mb-1">{campaign.title}</h3>
                {student.name && (
                    <p className={`text-sm mb-4 font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {student.name}
                    </p>
                )}

                <div className="mt-auto space-y-3 pt-2">
                    <div>
                        <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-bold">
                                {t('campaignCard.raised', { amount: formatAmount(campaign.raised_amount || 0) })}
                            </span>
                            <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                                {t('campaignCard.goal', { amount: formatAmount(campaign.goal_amount || 0) })}
                            </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>

                    <button
                        onClick={handleDonateClick}
                        className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Heart className="h-4 w-4" fill="currentColor" />
                        {t('components.campaigncard.ba_yap') || 'Bağış Yap'}
                    </button>
                </div>
            </div>
        </div>
    );
}
