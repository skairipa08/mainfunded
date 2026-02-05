'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    GraduationCap,
    MapPin,
    Calendar,
    DollarSign,
    MessageSquare,
    Clock,
    CheckCircle,
    Star,
    Send,
} from 'lucide-react';
import CorporateHeader from '@/components/corporate/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { mockStudents } from '@/lib/corporate/mock-data';
import { useTranslation } from '@/lib/i18n/context';

export default function StudentDetailPage() {
    const { t } = useTranslation();
    const params = useParams();
    const router = useRouter();
    const [message, setMessage] = useState('');

    const student = mockStudents.find((s) => s.id === params.id);

    if (!student) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('corporate.studentDetail.notFound')}</h2>
                    <Button onClick={() => router.back()}>{t('common.back')}</Button>
                </div>
            </div>
        );
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getUpdateIcon = (type: string) => {
        switch (type) {
            case 'progress':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'thank_you':
                return <Star className="h-5 w-5 text-yellow-500" />;
            case 'milestone':
                return <Star className="h-5 w-5 text-blue-600" />;
            default:
                return <Clock className="h-5 w-5 text-gray-400" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active':
                return t('corporate.students.active');
            case 'graduated':
                return t('corporate.students.graduated');
            case 'dropped':
                return t('corporate.students.dropped');
            default:
                return status;
        }
    };

    const progressPercent = (student.total_donated / student.goal_amount) * 100;

    return (
        <div className="min-h-screen">
            <CorporateHeader
                title={t('corporate.studentDetail.title')}
                subtitle={student.name}
            />

            <div className="p-6">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t('common.back')}
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Student Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="text-center">
                                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <GraduationCap className="h-12 w-12 text-blue-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">{student.name}</h2>
                                <Badge className={
                                    student.status === 'active'
                                        ? 'bg-green-100 text-green-700 mt-2'
                                        : student.status === 'graduated'
                                            ? 'bg-blue-100 text-blue-700 mt-2'
                                            : 'bg-red-100 text-red-700 mt-2'
                                }>
                                    {getStatusText(student.status)}
                                </Badge>
                            </div>

                            <div className="mt-6 space-y-4">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <GraduationCap className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="font-medium">{student.university}</p>
                                        <p className="text-sm text-gray-400">{student.faculty} - {student.department}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                    <span>{student.country}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                    <span>{t('corporate.studentDetail.targetGraduation')}: {student.target_year}</span>
                                </div>
                            </div>

                            {/* Funding Progress */}
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-gray-500">{t('corporate.studentDetail.donationProgress')}</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {Math.round(progressPercent)}%
                                    </span>
                                </div>
                                <Progress value={progressPercent} className="h-3" />
                                <div className="flex justify-between mt-2">
                                    <span className="text-lg font-bold text-blue-600">
                                        {formatCurrency(student.total_donated)}
                                    </span>
                                    <span className="text-gray-500">
                                        / {formatCurrency(student.goal_amount)}
                                    </span>
                                </div>
                            </div>

                            {/* Quick Donate */}
                            <Button className="w-full mt-6">
                                <DollarSign className="h-4 w-4 mr-2" />
                                {t('corporate.studentDetail.donate')}
                            </Button>
                        </div>

                        {/* Send Message */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                {t('corporate.studentDetail.sendMessage')}
                            </h3>
                            <Textarea
                                placeholder={t('corporate.studentDetail.messagePlaceholder')}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={4}
                            />
                            <Button className="w-full mt-3" disabled={!message.trim()}>
                                <Send className="h-4 w-4 mr-2" />
                                {t('corporate.studentDetail.send')}
                            </Button>
                        </div>
                    </div>

                    {/* Timeline & History */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Updates Timeline */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">
                                {t('corporate.studentDetail.studentUpdates')}
                            </h3>
                            {student.updates.length > 0 ? (
                                <div className="space-y-6">
                                    {student.updates.map((update, index) => (
                                        <div key={update.id} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="bg-blue-50 p-2 rounded-full">
                                                    {getUpdateIcon(update.type)}
                                                </div>
                                                {index < student.updates.length - 1 && (
                                                    <div className="w-0.5 h-full bg-gray-200 mt-2" />
                                                )}
                                            </div>
                                            <div className="flex-1 pb-6">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-medium text-gray-900">{update.title}</h4>
                                                    <span className="text-sm text-gray-400">
                                                        {formatDate(update.date)}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600">{update.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    {t('corporate.studentDetail.noUpdates')}
                                </div>
                            )}
                        </div>

                        {/* Donation History */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">
                                {t('corporate.studentDetail.donationHistory')}
                            </h3>
                            <div className="space-y-4">
                                {student.donation_history.map((donation) => (
                                    <div
                                        key={donation.id}
                                        className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-100 p-2 rounded-full">
                                                <DollarSign className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{donation.donor_name}</p>
                                                <p className="text-sm text-gray-400">{formatDate(donation.date)}</p>
                                            </div>
                                        </div>
                                        <span className="font-semibold text-green-600">
                                            +{formatCurrency(donation.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
