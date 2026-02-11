'use client';

import React from 'react';
import {
    GraduationCap,
    Briefcase,
    TrendingUp,
    Users,
    Linkedin,
    Award,
    Calendar,
    MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { censorSurname } from '@/lib/privacy';
import { useTranslation } from '@/lib/i18n/context';

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
}

interface AlumniTrackingProps {
    alumni: AlumniProfile[];
    className?: string;
}

export function AlumniTracking({ alumni, className }: AlumniTrackingProps) {
    return (
        <div className={cn('space-y-6', className)}>
            {alumni.map((person) => (
                <AlumniCard key={person.id} profile={person} />
            ))}
        </div>
    );
}

function AlumniCard({ profile }: { profile: AlumniProfile }) {
    const { t } = useTranslation();
    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border-b">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">
                        {profile.avatar ? (
                            <img src={profile.avatar} alt={censorSurname(profile.name)} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            profile.name.split(' ').map(n => n[0]).join('')
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{censorSurname(profile.name)}</h3>
                            <Badge className="bg-green-100 text-green-700">{t('pages.alumni.card.alumniBadge')}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{profile.currentRole}</p>
                        <p className="text-sm text-gray-500">{profile.company}</p>
                    </div>
                    {profile.linkedIn && (
                        <Button variant="ghost" size="icon" asChild>
                            <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer">
                                <Linkedin className="h-5 w-5 text-blue-600" />
                            </a>
                        </Button>
                    )}
                </div>
            </div>

            {/* Details */}
            <div className="p-4 grid grid-cols-2 gap-4 border-b">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <GraduationCap className="h-4 w-4 text-indigo-500" />
                    <span>{profile.university}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Award className="h-4 w-4 text-indigo-500" />
                    <span>{profile.degree}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-indigo-500" />
                    <span>{t('pages.alumni.stats.graduatedStudent')}: {profile.graduationYear}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-indigo-500" />
                    <span>{profile.location}</span>
                </div>
            </div>

            {/* Story */}
            {profile.story && (
                <div className="p-4 border-b">
                    <p className="text-gray-600 text-sm italic">&ldquo;{profile.story}&rdquo;</p>
                </div>
            )}

            {/* Impact */}
            <div className="p-4 bg-gray-50 flex items-center justify-between">
                <div className="text-center">
                    <p className="text-sm text-gray-500">{t('pages.alumni.card.totalReceived')}</p>
                    <p className="font-bold text-indigo-600">${profile.totalReceived.toLocaleString()}</p>
                </div>
                {profile.givingBack && profile.givingBack > 0 && (
                    <div className="text-center">
                        <p className="text-sm text-gray-500">{t('pages.alumni.card.totalGivenBack')}</p>
                        <p className="font-bold text-green-600">${profile.givingBack.toLocaleString()}</p>
                    </div>
                )}
                <Button variant="outline" size="sm">
                    {t('pages.alumni.card.readStory')}
                </Button>
            </div>
        </div>
    );
}

// Alumni Stats Component
export function AlumniStats({ className }: { className?: string }) {
    const { t } = useTranslation();
    const stats = [
        { icon: GraduationCap, label: t('pages.alumni.stats.graduatedStudent'), value: '0', color: 'text-indigo-600' },
        { icon: Briefcase, label: t('pages.alumni.stats.employmentRate'), value: '%0', color: 'text-green-600' },
        { icon: TrendingUp, label: t('pages.alumni.stats.averageSalary'), value: '$0', color: 'text-blue-600' },
        { icon: Users, label: t('pages.alumni.stats.givingBack'), value: '0', color: 'text-purple-600' },
    ];

    return (
        <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
            {stats.map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border text-center">
                    <stat.icon className={cn('h-8 w-8 mx-auto mb-2', stat.color)} />
                    <p className={cn('text-2xl font-bold', stat.color)}>{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
            ))}
        </div>
    );
}
