'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    Bell,
    CheckCircle,
    Star,
    Target,
    MessageSquare,
    Archive,
    Settings,
    Video,
    FileText,
} from 'lucide-react';
import CorporateHeader from '@/components/corporate/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { mockNotifications } from '@/lib/corporate/mock-data';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/context';

type NotificationType = 'all' | 'update' | 'thank_you' | 'campaign' | 'milestone';

export default function NotificationsPage() {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState(mockNotifications);
    const [filter, setFilter] = useState<NotificationType>('all');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const filteredNotifications = notifications.filter(
        (n) => filter === 'all' || n.type === filter
    );

    const unreadCount = notifications.filter((n) => !n.read).length;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 1) return t('corporate.notifications.justNow');
        if (diffHours < 24) return `${diffHours} ${t('corporate.notifications.hoursAgo')}`;
        if (diffDays < 7) return `${diffDays} ${t('corporate.notifications.daysAgo')}`;
        return date.toLocaleDateString('tr-TR');
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'update':
                return <MessageSquare className="h-5 w-5 text-blue-600" />;
            case 'thank_you':
                return <Star className="h-5 w-5 text-yellow-500" />;
            case 'campaign':
                return <Target className="h-5 w-5 text-purple-600" />;
            case 'milestone':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            default:
                return <Bell className="h-5 w-5 text-gray-400" />;
        }
    };

    const markAsRead = (id: string) => {
        setNotifications(
            notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map((n) => ({ ...n, read: true })));
    };

    const archiveSelected = () => {
        setNotifications(
            notifications.filter((n) => !selectedIds.includes(n.id))
        );
        setSelectedIds([]);
    };

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const filterTabs = [
        { key: 'all', label: t('corporate.notifications.all'), count: notifications.length },
        { key: 'update', label: t('corporate.notifications.updates'), count: notifications.filter((n) => n.type === 'update').length },
        { key: 'thank_you', label: t('corporate.notifications.thankYous'), count: notifications.filter((n) => n.type === 'thank_you').length },
        { key: 'campaign', label: t('corporate.notifications.campaignsTab'), count: notifications.filter((n) => n.type === 'campaign').length },
        { key: 'milestone', label: t('corporate.notifications.milestones'), count: notifications.filter((n) => n.type === 'milestone').length },
    ];

    return (
        <div className="min-h-screen">
            <CorporateHeader
                title={t('corporate.notifications.title')}
                subtitle={`${unreadCount} ${t('corporate.notifications.unreadNotifications')}`}
            />

            <div className="p-6">
                <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-100 mb-6">
                    <div className="flex flex-wrap gap-2">
                        {filterTabs.map((tab) => (
                            <Button
                                key={tab.key}
                                variant={filter === tab.key ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setFilter(tab.key as NotificationType)}
                                className="gap-2"
                            >
                                {tab.label}
                                <Badge variant="outline" className="ml-1">{tab.count}</Badge>
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {selectedIds.length > 0 && (
                            <>
                                <span className="text-sm text-gray-500">{selectedIds.length} {t('corporate.notifications.selected')}</span>
                                <Button variant="outline" size="sm" onClick={archiveSelected}>
                                    <Archive className="h-4 w-4 mr-1" />
                                    {t('corporate.notifications.archive')}
                                </Button>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" onClick={markAllAsRead}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {t('corporate.notifications.markAllRead')}
                        </Button>
                        <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4 mr-1" />
                            {t('corporate.notifications.preferences')}
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={cn('p-4 hover:bg-gray-50 transition-colors cursor-pointer', !notification.read && 'bg-blue-50/50')}
                                onClick={() => markAsRead(notification.id)}
                            >
                                <div className="flex items-start gap-4">
                                    <Checkbox checked={selectedIds.includes(notification.id)} onCheckedChange={() => toggleSelect(notification.id)} onClick={(e) => e.stopPropagation()} />
                                    <div className="bg-gray-100 p-2 rounded-full">{getNotificationIcon(notification.type)}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className={cn('font-medium text-gray-900', !notification.read && 'font-semibold')}>{notification.title}</h4>
                                            {!notification.read && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
                                        </div>
                                        <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-400">{formatDate(notification.date)}</span>
                                            {notification.type === 'thank_you' && (
                                                <Button variant="outline" size="sm" className="h-6 text-xs">
                                                    <Video className="h-3 w-3 mr-1" />
                                                    {t('corporate.notifications.watchVideo')}
                                                </Button>
                                            )}
                                            {notification.student_id && (
                                                <Link href={`/corporate/students/${notification.student_id}`}>
                                                    <Button variant="outline" size="sm" className="h-6 text-xs">
                                                        <FileText className="h-3 w-3 mr-1" />
                                                        {t('corporate.notifications.studentDetail')}
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center">
                            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('corporate.notifications.noNotifications')}</h3>
                            <p className="text-gray-500">{t('corporate.notifications.noNotificationsInCategory')}</p>
                        </div>
                    )}
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mt-6 border border-blue-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('corporate.notifications.emailNotifications')}</h3>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <Checkbox defaultChecked />
                            <span className="text-gray-700">{t('corporate.notifications.studentUpdatesEmail')}</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <Checkbox defaultChecked />
                            <span className="text-gray-700">{t('corporate.notifications.thankYouMessagesEmail')}</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <Checkbox defaultChecked />
                            <span className="text-gray-700">{t('corporate.notifications.newCampaignSuggestionsEmail')}</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <Checkbox />
                            <span className="text-gray-700">{t('corporate.notifications.weeklySummaryEmail')}</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
