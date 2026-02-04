'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { BADGES, type Badge as BadgeType } from '@/lib/gamification';

interface BadgeDisplayProps {
    badgeIds: string[];
    maxDisplay?: number;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function BadgeDisplay({
    badgeIds,
    maxDisplay = 5,
    size = 'md',
    className,
}: BadgeDisplayProps) {
    const earnedBadges = badgeIds
        .map((id) => BADGES.find((b) => b.id === id))
        .filter((b): b is BadgeType => b !== undefined);

    const displayBadges = earnedBadges.slice(0, maxDisplay);
    const remainingCount = earnedBadges.length - maxDisplay;

    const sizeClasses = {
        sm: 'text-xs px-1.5 py-0.5',
        md: 'text-sm px-2 py-1',
        lg: 'text-base px-3 py-1.5',
    };

    const iconSizes = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
    };

    return (
        <div className={cn('flex flex-wrap gap-1', className)}>
            {displayBadges.map((badge) => (
                <span
                    key={badge.id}
                    className={cn(
                        'rounded-full flex items-center gap-1 cursor-help transition-transform hover:scale-105',
                        badge.color,
                        sizeClasses[size]
                    )}
                    title={badge.description}
                >
                    <span className={iconSizes[size]}>{badge.icon}</span>
                    <span>{badge.name}</span>
                </span>
            ))}
            {remainingCount > 0 && (
                <span
                    className={cn(
                        'rounded-full bg-gray-100 text-gray-600 cursor-help',
                        sizeClasses[size]
                    )}
                    title={`${remainingCount} daha fazla rozet`}
                >
                    +{remainingCount}
                </span>
            )}
        </div>
    );
}

interface BadgeGridProps {
    earnedBadgeIds: string[];
    showAll?: boolean;
    className?: string;
}

export function BadgeGrid({
    earnedBadgeIds,
    showAll = false,
    className,
}: BadgeGridProps) {
    const badgesToShow = showAll ? BADGES : BADGES.filter((b) => earnedBadgeIds.includes(b.id));

    return (
        <div className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4', className)}>
            {badgesToShow.map((badge) => {
                const isEarned = earnedBadgeIds.includes(badge.id);
                return (
                    <div
                        key={badge.id}
                        className={cn(
                            'p-4 rounded-xl text-center transition-all',
                            isEarned
                                ? 'bg-white shadow-md border-2 border-blue-200'
                                : 'bg-gray-100 opacity-50'
                        )}
                    >
                        <div className={cn(
                            'w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-4xl',
                            isEarned ? badge.color : 'bg-gray-200'
                        )}>
                            {isEarned ? badge.icon : '🔒'}
                        </div>
                        <h4 className={cn(
                            'font-semibold',
                            isEarned ? 'text-gray-900' : 'text-gray-500'
                        )}>
                            {badge.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                    </div>
                );
            })}
        </div>
    );
}

interface ProgressToBadgeProps {
    badgeId: string;
    currentValue: number;
    className?: string;
}

export function ProgressToBadge({
    badgeId,
    currentValue,
    className,
}: ProgressToBadgeProps) {
    const badge = BADGES.find((b) => b.id === badgeId);
    if (!badge) return null;

    const targetValue = badge.requirement.value;
    const progress = Math.min((currentValue / targetValue) * 100, 100);
    const isComplete = currentValue >= targetValue;

    return (
        <div className={cn('bg-white rounded-xl p-4 shadow-sm border', className)}>
            <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center text-2xl',
                    isComplete ? badge.color : 'bg-gray-100'
                )}>
                    {isComplete ? badge.icon : '🎯'}
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900">{badge.name}</h4>
                    <p className="text-xs text-gray-500">{badge.description}</p>
                </div>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Ilerleme</span>
                    <span className="font-medium text-gray-900">
                        {currentValue} / {targetValue}
                    </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={cn(
                            'h-full rounded-full transition-all',
                            isComplete ? 'bg-green-500' : 'bg-blue-500'
                        )}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
