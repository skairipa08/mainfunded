'use client';

import React, { useState } from 'react';
import {
    Share2,
    Facebook,
    Twitter,
    Linkedin,
    Link2,
    MessageCircle,
    Check,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/lib/currency-context';

interface SocialShareProps {
    url: string;
    title: string;
    description?: string;
    image?: string;
    hashtags?: string[];
    className?: string;
    compact?: boolean;
}

export function SocialShare({
    url,
    title,
    description = '',
    image,
    hashtags = ['FundEd', 'EğitimeDestek'],
    className,
    compact = false,
}: SocialShareProps) {
    const [copied, setCopied] = useState(false);
    const [showDialog, setShowDialog] = useState(false);

    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const hashtagString = hashtags.join(',');

    const shareLinks = [
        {
            name: 'WhatsApp',
            icon: MessageCircle,
            color: 'bg-green-500 hover:bg-green-600',
            url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
        },
        {
            name: 'Facebook',
            icon: Facebook,
            color: 'bg-blue-600 hover:bg-blue-700',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        },
        {
            name: 'Twitter',
            icon: Twitter,
            color: 'bg-sky-500 hover:bg-sky-600',
            url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=${hashtagString}`,
        },
        {
            name: 'LinkedIn',
            icon: Linkedin,
            color: 'bg-blue-700 hover:bg-blue-800',
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        },
    ];

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleShare = (shareUrl: string) => {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    };

    if (compact) {
        return (
            <div className={cn('flex items-center gap-2', className)}>
                {shareLinks.map((link) => (
                    <Button
                        key={link.name}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleShare(link.url)}
                        title={link.name}
                    >
                        <link.icon className="h-4 w-4" />
                    </Button>
                ))}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={copyToClipboard}
                    title="Linki Kopyala"
                >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Link2 className="h-4 w-4" />}
                </Button>
            </div>
        );
    }

    return (
        <>
            <Button
                variant="outline"
                className={cn('gap-2', className)}
                onClick={() => setShowDialog(true)}
            >
                <Share2 className="h-4 w-4" />
                Paylas
            </Button>

            {showDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowDialog(false)} />
                    <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg">Kampanyayi Paylas</h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowDialog(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            Bu kampanyayi sosyal medyada paylasarak daha fazla kisiye ulasmasini saglayin.
                        </p>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {shareLinks.map((link) => (
                                <Button
                                    key={link.name}
                                    className={cn('gap-2 text-white', link.color)}
                                    onClick={() => handleShare(link.url)}
                                >
                                    <link.icon className="h-4 w-4" />
                                    {link.name}
                                </Button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={url}
                                readOnly
                                className="flex-1 px-3 py-2 text-sm border rounded-lg bg-gray-50"
                            />
                            <Button variant="outline" onClick={copyToClipboard}>
                                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Link2 className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Instagram Story Share Card Generator
export function ShareCard({
    studentName,
    goal,
    raised,
    university,
    className,
}: {
    studentName: string;
    goal: number;
    raised: number;
    university: string;
    className?: string;
}) {
    const progress = Math.round((raised / goal) * 100);
    const { formatAmount } = useCurrency();

    return (
        <div
            className={cn(
                'bg-gradient-to-br from-blue-600 to-purple-700 p-6 rounded-2xl text-white w-80',
                className
            )}
        >
            <div className="text-center mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-2xl">🎓</span>
                </div>
                <h3 className="font-bold text-lg">{studentName}</h3>
                <p className="text-white/80 text-sm">{university}</p>
            </div>

            <div className="bg-white/20 rounded-xl p-4 mb-4">
                <div className="flex justify-between text-sm mb-2">
                    <span>İlerleme</span>
                    <span className="font-bold">{progress}%</span>
                </div>
                <div className="h-3 bg-white/30 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-white rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs mt-2 text-white/70">
                    <span>{formatAmount(raised)}</span>
                    <span>{formatAmount(goal)}</span>
                </div>
            </div>

            <div className="text-center">
                <p className="text-sm text-white/90 mb-2">Eğitim hayallerine destek ol!</p>
                <div className="bg-white text-blue-600 font-bold py-2 px-4 rounded-lg text-sm">
                    funded.com
                </div>
            </div>
        </div>
    );
}
