'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import {
    PartyPopper,
    Target,
    TrendingUp,
    Award,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SocialShare } from './SocialShare';

interface MilestoneCardProps {
    type: 'first_donation' | 'halfway' | 'goal_reached' | 'fully_funded';
    studentName: string;
    amount?: number;
    goal?: number;
    donorName?: string;
    className?: string;
}

const milestoneConfig = {
    first_donation: {
        icon: TrendingUp,
        title: 'Ilk Bagis!',
        color: 'from-green-500 to-emerald-600',
        emoji: '🎉',
    },
    halfway: {
        icon: Target,
        title: 'Yari Yolda!',
        color: 'from-blue-500 to-indigo-600',
        emoji: '🚀',
    },
    goal_reached: {
        icon: Award,
        title: 'Hedef Asildi!',
        color: 'from-purple-500 to-pink-600',
        emoji: '🏆',
    },
    fully_funded: {
        icon: PartyPopper,
        title: 'Tam Finansman!',
        color: 'from-amber-500 to-orange-600',
        emoji: '✨',
    },
};

export function MilestoneCard({
    type,
    studentName,
    amount,
    goal,
    donorName,
    className,
}: MilestoneCardProps) {
    const config = milestoneConfig[type];
    const Icon = config.icon;

    return (
        <div
            className={cn(
                `bg-gradient-to-br ${config.color} p-6 rounded-2xl text-white shadow-xl`,
                className
            )}
        >
            <div className="text-center">
                <div className="text-5xl mb-3">{config.emoji}</div>
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon className="h-6 w-6" />
                    <h3 className="text-2xl font-bold">{config.title}</h3>
                </div>
                <p className="text-white/90 mb-4">{studentName}</p>

                {amount && (
                    <div className="bg-white/20 rounded-xl p-4 mb-4">
                        <p className="text-3xl font-bold">${amount.toLocaleString()}</p>
                        {goal && (
                            <p className="text-sm text-white/70">
                                / ${goal.toLocaleString()} hedefe ulasti
                            </p>
                        )}
                    </div>
                )}

                {donorName && (
                    <p className="text-sm text-white/80">
                        {donorName} tarafindan desteklendi
                    </p>
                )}
            </div>
        </div>
    );
}

interface MilestoneCelebrationProps {
    open: boolean;
    onClose: () => void;
    type: MilestoneCardProps['type'];
    studentName: string;
    amount?: number;
    goal?: number;
    shareUrl?: string;
}

// Simple confetti implementation
function SimpleConfetti({ active }: { active: boolean }) {
    const [particles, setParticles] = useState<Array<{ id: number; left: number; delay: number; color: string }>>([]);

    useEffect(() => {
        if (active) {
            const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
            const newParticles = Array.from({ length: 50 }, (_, i) => ({
                id: i,
                left: Math.random() * 100,
                delay: Math.random() * 2,
                color: colors[Math.floor(Math.random() * colors.length)],
            }));
            setParticles(newParticles);
        } else {
            setParticles([]);
        }
    }, [active]);

    if (!active) return null;

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="absolute w-3 h-3 rounded-full animate-confetti"
                    style={{
                        left: `${particle.left}%`,
                        backgroundColor: particle.color,
                        animationDelay: `${particle.delay}s`,
                    }}
                />
            ))}
            <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(400px) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
      `}</style>
        </div>
    );
}

export function MilestoneCelebration({
    open,
    onClose,
    type,
    studentName,
    amount,
    goal,
    shareUrl = '',
}: MilestoneCelebrationProps) {
    const config = milestoneConfig[type];

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative z-10 max-w-md w-full">
                <SimpleConfetti active={open} />
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-12 right-0 text-white hover:bg-white/20"
                    onClick={onClose}
                >
                    <X className="h-6 w-6" />
                </Button>
                <MilestoneCard
                    type={type}
                    studentName={studentName}
                    amount={amount}
                    goal={goal}
                />
                <div className="mt-4 flex gap-2">
                    <Button
                        variant="outline"
                        className="flex-1 bg-white"
                        onClick={onClose}
                    >
                        Kapat
                    </Button>
                    {shareUrl && (
                        <SocialShare
                            url={shareUrl}
                            title={`${studentName} icin ${config.title}! 🎓`}
                            className="flex-1"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
