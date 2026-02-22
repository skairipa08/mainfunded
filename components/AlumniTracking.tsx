'use client';

import React, { useState } from 'react';
import {
    GraduationCap,
    Briefcase,
    TrendingUp,
    Users,
    Linkedin,
    Award,
    Calendar,
    MapPin,
    Heart,
    Star,
    Sparkles,
    ArrowRight,
    Quote,
    Globe,
    ChevronDown,
    ChevronUp,
    BookOpen,
    Rocket,
    HandHeart,
    Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { censorSurname } from '@/lib/privacy';
import { useTranslation } from '@/lib/i18n/context';
import { useCurrency } from '@/lib/currency-context';

export interface AlumniProfile {
    id: string;
    name: string;
    avatar?: string;
    graduationYear: number;
    university: string;
    degree: string;
    currentRole: string;
    company: string;
    location: string;
    linkedIn?: string;
    story?: string;
    totalReceived: number;
    givingBack?: number;
    dream?: string;
    now?: string;
    emoji?: string;
}

interface AlumniTrackingProps {
    alumni: AlumniProfile[];
    className?: string;
}

export function AlumniTracking({ alumni, className }: AlumniTrackingProps) {
    return (
        <div className={cn('space-y-8', className)}>
            {alumni.map((person, index) => (
                <AlumniCard key={person.id} profile={person} index={index} />
            ))}
        </div>
    );
}

function AlumniCard({ profile, index }: { profile: AlumniProfile; index: number }) {
    const { t } = useTranslation();
    const { formatAmount } = useCurrency();
    const [expanded, setExpanded] = useState(false);

    const gradients = [
        'from-violet-600 via-purple-600 to-indigo-600',
        'from-rose-600 via-pink-600 to-fuchsia-600',
        'from-amber-500 via-orange-500 to-red-500',
        'from-emerald-600 via-teal-600 to-cyan-600',
        'from-blue-600 via-indigo-600 to-violet-600',
    ];
    const gradient = gradients[index % gradients.length];

    const bgGradients = [
        'from-violet-50 to-indigo-50',
        'from-rose-50 to-pink-50',
        'from-amber-50 to-orange-50',
        'from-emerald-50 to-teal-50',
        'from-blue-50 to-indigo-50',
    ];
    const bgGradient = bgGradients[index % bgGradients.length];

    return (
        <div className="group relative">
            {/* Glow effect */}
            <div className={cn(
                'absolute -inset-0.5 bg-gradient-to-r rounded-2xl opacity-0 group-hover:opacity-20 blur-lg transition-all duration-500',
                gradient
            )} />

            <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500">
                {/* Colored top accent */}
                <div className={cn('h-1.5 bg-gradient-to-r', gradient)} />

                {/* Header with large avatar area */}
                <div className={cn('bg-gradient-to-br p-6 pb-4', bgGradient)}>
                    <div className="flex items-start gap-5">
                        {/* Avatar */}
                        <div className="relative">
                            <div className={cn(
                                'w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg bg-gradient-to-br',
                                gradient
                            )}>
                                {profile.avatar ? (
                                    <img src={profile.avatar} alt={censorSurname(profile.name)} className="w-full h-full rounded-2xl object-cover" />
                                ) : (
                                    <span>{profile.emoji || profile.name.split(' ').map(n => n[0]).join('')}</span>
                                )}
                            </div>
                            {/* Success sparkle */}
                            <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1 shadow-md">
                                <Star className="h-3 w-3 text-white fill-white" />
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-gray-900 text-lg">{censorSurname(profile.name)}</h3>
                                <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 shadow-sm">
                                    <GraduationCap className="h-3 w-3 mr-1" />
                                    {t('pages.alumni.card.alumniBadge')}
                                </Badge>
                            </div>
                            <p className="text-gray-700 font-medium mt-1">{profile.currentRole}</p>
                            <p className="text-gray-500 text-sm">{profile.company}</p>

                            {/* Location & Year */}
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> {profile.location}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> {profile.graduationYear}
                                </span>
                            </div>
                        </div>

                        {profile.linkedIn && (
                            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-blue-50" asChild>
                                <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer">
                                    <Linkedin className="h-5 w-5 text-blue-600" />
                                </a>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Dream → Now Transformation */}
                {profile.dream && profile.now && (
                    <div className="mx-6 my-4 relative">
                        <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-3">
                            <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                                    {t('pages.alumni.card.theirDream')}
                                </p>
                                <p className="text-sm text-gray-600 font-medium">{profile.dream}</p>
                            </div>
                            <div className={cn('flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r text-white shadow-md', gradient)}>
                                <ArrowRight className="h-4 w-4" />
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 text-center border border-green-100">
                                <p className="text-[10px] uppercase tracking-wider text-green-500 font-semibold mb-1">
                                    {t('pages.alumni.card.theirNow')}
                                </p>
                                <p className="text-sm text-green-700 font-semibold">{profile.now}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Education info */}
                <div className="px-6 pb-3">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                            <GraduationCap className="h-4 w-4 text-indigo-400" />
                            {profile.university}
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="flex items-center gap-1.5">
                            <Award className="h-4 w-4 text-indigo-400" />
                            {profile.degree}
                        </span>
                    </div>
                </div>

                {/* Story - Emotional quote */}
                {profile.story && (
                    <div className="mx-6 mb-4">
                        <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100">
                            <Quote className="absolute top-3 left-3 h-6 w-6 text-gray-200" />
                            <p className={cn(
                                'text-gray-600 text-sm leading-relaxed pl-6 italic transition-all duration-300',
                                !expanded && 'line-clamp-3'
                            )}>
                                {profile.story}
                            </p>
                            {profile.story.length > 150 && (
                                <button
                                    onClick={() => setExpanded(!expanded)}
                                    className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 mt-2 ml-6 font-medium transition-colors"
                                >
                                    {expanded ? (
                                        <>Daha Az <ChevronUp className="h-3 w-3" /></>
                                    ) : (
                                        <>{t('pages.alumni.card.readStory')} <ChevronDown className="h-3 w-3" /></>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Impact Footer */}
                <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-t flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{t('pages.alumni.card.totalReceived')}</p>
                            <p className="font-bold text-indigo-600 text-lg">{formatAmount(profile.totalReceived)}</p>
                        </div>
                        {profile.givingBack && profile.givingBack > 0 && (
                            <div className="text-center">
                                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{t('pages.alumni.card.totalGivenBack')}</p>
                                <div className="flex items-center gap-1">
                                    <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                                    <p className="font-bold text-rose-600 text-lg">{formatAmount(profile.givingBack)}</p>
                                </div>
                            </div>
                        )}
                    </div>
                    {profile.givingBack && profile.givingBack > 0 && (
                        <Badge className="bg-rose-50 text-rose-600 border-rose-200 text-xs">
                            <Heart className="h-3 w-3 mr-1 fill-rose-500" />
                            {t('pages.alumni.stats.givingBack')}
                        </Badge>
                    )}
                </div>
            </div>
        </div>
    );
}

// Journey Timeline Component
export function AlumniJourney({ className }: { className?: string }) {
    const { t } = useTranslation();

    const steps = [
        { icon: Star, title: t('pages.alumni.journeyStep1'), desc: t('pages.alumni.journeyStep1Desc'), color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50' },
        { icon: HandHeart, title: t('pages.alumni.journeyStep2'), desc: t('pages.alumni.journeyStep2Desc'), color: 'from-rose-400 to-pink-500', bg: 'bg-rose-50' },
        { icon: BookOpen, title: t('pages.alumni.journeyStep3'), desc: t('pages.alumni.journeyStep3Desc'), color: 'from-blue-400 to-indigo-500', bg: 'bg-blue-50' },
        { icon: GraduationCap, title: t('pages.alumni.journeyStep4'), desc: t('pages.alumni.journeyStep4Desc'), color: 'from-violet-400 to-purple-500', bg: 'bg-violet-50' },
        { icon: Rocket, title: t('pages.alumni.journeyStep5'), desc: t('pages.alumni.journeyStep5Desc'), color: 'from-emerald-400 to-green-500', bg: 'bg-emerald-50' },
        { icon: Heart, title: t('pages.alumni.journeyStep6'), desc: t('pages.alumni.journeyStep6Desc'), color: 'from-red-400 to-rose-500', bg: 'bg-red-50' },
    ];

    return (
        <div className={cn('', className)}>
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900">{t('pages.alumni.journeyTitle')}</h2>
                <p className="text-gray-500 mt-2">{t('pages.alumni.journeyDesc')}</p>
            </div>

            {/* Desktop Timeline */}
            <div className="hidden md:block relative">
                {/* Connection line */}
                <div className="absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-300 via-purple-300 to-rose-300" />

                <div className="grid grid-cols-6 gap-2 relative">
                    {steps.map((step, i) => (
                        <div key={i} className="flex flex-col items-center text-center group">
                            <div className={cn(
                                'w-24 h-24 rounded-2xl flex items-center justify-center bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:shadow-xl relative z-10',
                                step.color
                            )}>
                                <step.icon className="h-10 w-10" />
                            </div>
                            <h4 className="font-bold text-gray-800 mt-4 text-sm">{step.title}</h4>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed px-1">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile Timeline */}
            <div className="md:hidden space-y-4">
                {steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-4">
                        <div className="relative flex flex-col items-center">
                            <div className={cn(
                                'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br text-white shadow-md',
                                step.color
                            )}>
                                <step.icon className="h-6 w-6" />
                            </div>
                            {i < steps.length - 1 && (
                                <div className="w-0.5 h-8 bg-gradient-to-b from-gray-200 to-gray-100 mt-2" />
                            )}
                        </div>
                        <div className="pt-1">
                            <h4 className="font-bold text-gray-800 text-sm">{step.title}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Emotional Letter Component
export function AlumniLetter({ className }: { className?: string }) {
    const { t } = useTranslation();

    return (
        <div className={cn('relative', className)}>
            {/* Paper texture background */}
            <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl p-8 md:p-12 shadow-xl border border-amber-100 overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 opacity-10">
                    <Heart className="h-32 w-32 text-rose-500" />
                </div>
                <div className="absolute bottom-4 left-4 opacity-10">
                    <Sparkles className="h-24 w-24 text-amber-500" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="bg-gradient-to-r from-rose-400 to-pink-500 rounded-full p-2 shadow-md">
                            <Quote className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">{t('pages.alumni.letterTitle')}</h3>
                    </div>

                    <p className="text-gray-700 leading-loose text-lg italic font-serif">
                        &ldquo;{t('pages.alumni.letterContent')}&rdquo;
                    </p>

                    <div className="mt-8 flex items-center gap-3">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
                    </div>

                    <p className="text-right text-sm text-gray-500 mt-4 italic">
                        — {t('pages.alumni.letterSignature')}
                    </p>
                </div>
            </div>
        </div>
    );
}

// Alumni Stats Component - Emotional version
export function AlumniStats({ className }: { className?: string }) {
    const { t } = useTranslation();

    const stats = [
        {
            icon: GraduationCap,
            label: t('pages.alumni.stats.graduatedStudent'),
            value: '0',
            color: 'from-indigo-500 to-purple-600',
            bgColor: 'bg-indigo-50',
            textColor: 'text-indigo-600',
            emoji: '🎓'
        },
        {
            icon: Heart,
            label: t('pages.alumni.stats.livesChanged'),
            value: '0',
            color: 'from-rose-500 to-pink-600',
            bgColor: 'bg-rose-50',
            textColor: 'text-rose-600',
            emoji: '💜'
        },
        {
            icon: Globe,
            label: t('pages.alumni.stats.countriesReached'),
            value: '0',
            color: 'from-emerald-500 to-teal-600',
            bgColor: 'bg-emerald-50',
            textColor: 'text-emerald-600',
            emoji: '🌍'
        },
        {
            icon: Sparkles,
            label: t('pages.alumni.stats.dreamsRealized'),
            value: '0',
            color: 'from-amber-500 to-orange-600',
            bgColor: 'bg-amber-50',
            textColor: 'text-amber-600',
            emoji: '✨'
        },
    ];

    return (
        <div className={cn('', className)}>
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">{t('pages.alumni.impactTitle')}</h2>
                <p className="text-gray-500 mt-2">{t('pages.alumni.impactDesc')}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="group relative"
                    >
                        <div className={cn(
                            'absolute -inset-0.5 bg-gradient-to-r rounded-2xl opacity-0 group-hover:opacity-30 blur transition-all duration-300',
                            stat.color
                        )} />
                        <div className="relative bg-white rounded-2xl p-5 shadow-md border border-gray-100 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="text-3xl mb-2">{stat.emoji}</div>
                            <p className={cn('text-3xl md:text-4xl font-black', stat.textColor)}>{stat.value}</p>
                            <p className="text-xs text-gray-500 mt-2 font-medium uppercase tracking-wider">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
