import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        positive: boolean;
    };
    className?: string;
}

export default function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    className,
}: StatCardProps) {
    return (
        <div className={cn('bg-white rounded-xl p-6 shadow-sm border border-gray-100', className)}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                    {subtitle && (
                        <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
                    )}
                    {trend && (
                        <div className="flex items-center gap-1 mt-2">
                            <span
                                className={cn(
                                    'text-sm font-medium',
                                    trend.positive ? 'text-green-600' : 'text-red-600'
                                )}
                            >
                                {trend.positive ? '+' : ''}{trend.value}%
                            </span>
                            <span className="text-gray-400 text-sm">gecen aya gore</span>
                        </div>
                    )}
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                    <Icon className="h-6 w-6 text-blue-600" />
                </div>
            </div>
        </div>
    );
}
