'use client';

import { getTierBadgeInfo } from '@/lib/verification/tiers';
import type { VerificationTier } from '@/types/verification';

interface VerificationBadgeProps {
    tier: VerificationTier;
    verifiedAt?: string;
    checks?: string[];
    size?: 'sm' | 'md' | 'lg';
    showTooltip?: boolean;
}

export default function VerificationBadge({
    tier,
    verifiedAt,
    checks = [],
    size = 'md',
    showTooltip = true,
}: VerificationBadgeProps) {
    const badge = getTierBadgeInfo(tier);

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-2 text-base',
    };

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    const renderIcon = () => {
        switch (badge.icon) {
            case 'mail':
                return (
                    <svg className={iconSizes[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                );
            case 'shield-check':
                return (
                    <svg className={iconSizes[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                );
            case 'verified':
                return (
                    <svg className={iconSizes[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                );
            case 'building':
                return (
                    <svg className={iconSizes[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                );
            default:
                return (
                    <svg className={iconSizes[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                );
        }
    };

    return (
        <div className="relative inline-block group">
            <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${badge.color} ${sizeClasses[size]}`}>
                {renderIcon()}
                <span>{badge.label}</span>
            </span>

            {showTooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 min-w-[180px] shadow-lg">
                        <div className="font-medium mb-1">Tier {tier} Verification</div>
                        {verifiedAt && (
                            <div className="text-gray-300 mb-1">
                                Verified on: {new Date(verifiedAt).toLocaleDateString()}
                            </div>
                        )}
                        {checks.length > 0 && (
                            <div className="mt-1 pt-1 border-t border-gray-700">
                                <div className="text-gray-400 text-[10px] uppercase mb-1">Verified:</div>
                                <ul className="space-y-0.5">
                                    {checks.map((check, i) => (
                                        <li key={i} className="flex items-center gap-1">
                                            <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="capitalize">{check.replace(/_/g, ' ')}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                            <div className="border-4 border-transparent border-t-gray-900"></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Compact version for cards
export function VerificationBadgeCompact({ tier }: { tier: VerificationTier }) {
    const badge = getTierBadgeInfo(tier);

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${badge.color}`}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Tier {tier}
        </span>
    );
}
