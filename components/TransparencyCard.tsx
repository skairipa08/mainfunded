'use client';

import React from 'react';
import {
    PieChart,
    DollarSign,
    GraduationCap,
    Home,
    BookOpen,
    Laptop,
    Utensils,
    Activity,
    Shield,
    FileCheck,
    ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/lib/currency-context';

interface BreakdownItem {
    category: string;
    icon: React.ElementType;
    amount: number;
    percentage: number;
    color: string;
    description: string;
}

interface TransparencyCardProps {
    studentName: string;
    totalRaised: number;
    goalAmount: number;
    breakdown?: BreakdownItem[];
    lastUpdated: string;
    verificationStatus: 'verified' | 'pending' | 'unverified';
    documents?: { name: string; url: string }[];
    className?: string;
}

const defaultBreakdown: BreakdownItem[] = [
    {
        category: 'Harçlık',
        icon: GraduationCap,
        amount: 0,
        percentage: 0,
        color: 'bg-blue-500',
        description: 'Üniversite harç ve ücretleri',
    },
    {
        category: 'Barinma',
        icon: Home,
        amount: 0,
        percentage: 0,
        color: 'bg-purple-500',
        description: 'Yurt veya kira giderleri',
    },
    {
        category: 'Kitaplar',
        icon: BookOpen,
        amount: 0,
        percentage: 0,
        color: 'bg-green-500',
        description: 'Ders kitaplari ve materyaller',
    },
    {
        category: 'Teknoloji',
        icon: Laptop,
        amount: 0,
        percentage: 0,
        color: 'bg-orange-500',
        description: 'Laptop ve yazilim',
    },
    {
        category: 'Yasam',
        icon: Utensils,
        amount: 0,
        percentage: 0,
        color: 'bg-red-500',
        description: 'Yemek ve ulasim',
    },
    {
        category: 'Diger',
        icon: Activity,
        amount: 0,
        percentage: 0,
        color: 'bg-gray-500',
        description: 'Acil durumlar ve diger',
    },
];

export function TransparencyCard({
    studentName,
    totalRaised,
    goalAmount,
    breakdown = defaultBreakdown,
    lastUpdated,
    verificationStatus,
    documents,
    className,
}: TransparencyCardProps) {
    const { formatAmount } = useCurrency();

    const formatCurrencyLocal = (value: number) => {
        return formatAmount(value);
    };

    const getVerificationBadge = () => {
        switch (verificationStatus) {
            case 'verified':
                return (
                    <Badge className="bg-green-100 text-green-700 gap-1">
                        <Shield className="h-3 w-3" />
                        Doğrulanmış
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge className="bg-yellow-100 text-yellow-700 gap-1">
                        <Activity className="h-3 w-3" />
                        Doğrulama Bekliyor
                    </Badge>
                );
            default:
                return null;
        }
    };

    return (
        <div className={cn('bg-white rounded-xl shadow-sm border overflow-hidden', className)}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">Harcama Detayi</h3>
                    </div>
                    {getVerificationBadge()}
                </div>
                <p className="text-sm text-gray-600">
                    {studentName} için toplanan fonların nasıl kullanıldığını görün
                </p>
            </div>

            {/* Breakdown List */}
            <div className="p-4 space-y-4">
                {breakdown.map((item) => (
                    <div key={item.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={cn('p-1.5 rounded-lg', item.color.replace('bg-', 'bg-').replace('-500', '-100'))}>
                                    <item.icon className={cn('h-4 w-4', item.color.replace('bg-', 'text-'))} />
                                </div>
                                <div>
                                    <span className="font-medium text-gray-900">{item.category}</span>
                                    <p className="text-xs text-gray-500">{item.description}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="font-medium text-gray-900">{formatCurrencyLocal(item.amount)}</span>
                                <p className="text-xs text-gray-500">{item.percentage}%</p>
                            </div>
                        </div>
                        <Progress value={item.percentage} className={cn('h-2', item.color)} />
                    </div>
                ))}
            </div>

            {/* Total */}
            <div className="bg-gray-50 p-4 border-t">
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Toplam Butce</span>
                    <span className="text-xl font-bold text-gray-900">{formatCurrencyLocal(goalAmount)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    Son güncelleme: {new Date(lastUpdated).toLocaleDateString('tr-TR')}
                </p>
            </div>

            {/* Documents */}
            {documents && documents.length > 0 && (
                <div className="p-4 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Doğrulama Belgeleri</h4>
                    <div className="space-y-2">
                        {documents.map((doc) => (
                            <a
                                key={doc.name}
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                            >
                                <FileCheck className="h-4 w-4" />
                                {doc.name}
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

interface VerificationBadgeProps {
    status: 'verified' | 'student_verified' | 'institution_verified' | 'document_verified';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function VerificationBadge({ status, size = 'md', className }: VerificationBadgeProps) {
    const configs = {
        verified: {
            icon: Shield,
            label: 'Doğrulanmış',
            color: 'bg-green-100 text-green-700 border-green-200',
        },
        student_verified: {
            icon: GraduationCap,
            label: 'Öğrenci Doğrulanmış',
            color: 'bg-blue-100 text-blue-700 border-blue-200',
        },
        institution_verified: {
            icon: GraduationCap,
            label: 'Kurum Onayli',
            color: 'bg-purple-100 text-purple-700 border-purple-200',
        },
        document_verified: {
            icon: FileCheck,
            label: 'Belge Onayli',
            color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
        },
    };

    const config = configs[status];
    const Icon = config.icon;

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
        lg: 'text-base px-3 py-1.5',
    };

    const iconSizes = {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full border font-medium',
                config.color,
                sizeClasses[size],
                className
            )}
        >
            <Icon className={iconSizes[size]} />
            {config.label}
        </span>
    );
}
