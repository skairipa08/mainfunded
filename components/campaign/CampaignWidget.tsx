"use client";

import React, { useEffect, useState } from 'react';
import { useCampaignProgress } from '@/hooks/useCampaignProgress';
import { Thermometer } from './Thermometer';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';

interface CampaignWidgetProps {
    campaignId: string;
    size?: 'sm' | 'md' | 'lg';
}

export function CampaignWidget({ campaignId, size = 'md' }: CampaignWidgetProps) {
    const { campaign, isLoading, isError } = useCampaignProgress(campaignId);
    const [showConfetti, setShowConfetti] = useState(false);
    const { width, height } = useWindowSize();
    // We use next-intl translation if available, but fallback gracefully if not in same module bounds.
    // Using a try-catch for hook just in case this is outside Next-Intl provider bounds, though it shouldn't be.
    const t = useTranslations('Campaign');

    const targetAmount = campaign?.target_amount || 0;
    const raisedAmount = campaign?.raised_amount || 0;

    // Handle edge case of 0 target to avoid division by zero
    const percentage = targetAmount > 0 ? Math.round((raisedAmount / targetAmount) * 100) : 0;

    // Calculate days left
    const daysLeft = campaign?.timeline ? Math.max(0, Math.ceil((new Date(campaign.timeline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;

    useEffect(() => {
        // Trigger confetti when we cleanly reach 100% or above and haven't shown it yet
        if (percentage >= 100 && !isLoading && !isError) {
            setShowConfetti(true);
            // Auto-hide confetti after 8 seconds
            const timer = setTimeout(() => setShowConfetti(false), 8000);
            return () => clearTimeout(timer);
        }
    }, [percentage, isLoading, isError]);

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
                <p>Could not load campaign data</p>
            </div>
        );
    }

    if (isLoading || !campaign) {
        return (
            <div className="flex flex-col items-center justify-center p-4 space-y-4">
                <Skeleton className="w-[150px] h-[300px] rounded-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="relative flex flex-col items-center justify-center w-full h-full p-4 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden font-sans">
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none z-50">
                    <Confetti width={width || 300} height={height || 400} recycle={false} numberOfPieces={200} gravity={0.15} />
                </div>
            )}

            <h3 className="text-center font-semibold text-gray-800 mb-4 line-clamp-2 max-w-[250px]">
                {campaign.title}
            </h3>

            <div className="flex flex-row items-center gap-6">
                <Thermometer percentage={percentage} size={size} />

                <div className="flex flex-col gap-4 text-center sm:text-left">
                    <div className="flex flex-col">
                        <span className="text-3xl font-bold text-gray-900">{percentage}%</span>
                        <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Funded</span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-lg font-semibold text-green-600">{formatCurrency(raisedAmount)}</span>
                        <span className="text-xs text-gray-500">raised of {formatCurrency(targetAmount)}</span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-lg font-semibold text-gray-700">{daysLeft}</span>
                        <span className="text-xs text-gray-500">days left</span>
                    </div>
                </div>
            </div>

            <a
                href={`/campaign/${campaign.campaign_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 w-full text-center py-2 px-4 bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-md transition-colors text-sm shadow-sm"
            >
                Donate Now
            </a>
        </div>
    );
}
