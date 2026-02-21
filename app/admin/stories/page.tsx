'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { useCurrency } from '@/lib/currency-context';

interface Story {
    story_id: string;
    user_name: string;
    user_email: string;
    title: string;
    quote: string;
    university: string;
    field: string;
    funded_amount: number;
    status: 'pending' | 'approved' | 'rejected';
    admin_note?: string;
    created_at: string;
    reviewed_at?: string;
}

const statusConfig = {
    pending: { label: 'Bekliyor', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    approved: { label: 'Onaylandı', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    rejected: { label: 'Reddedildi', color: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function AdminStoriesPage() {
    const { formatAmount } = useCurrency();
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [expandedStory, setExpandedStory] = useState<string | null>(null);

    const fetchStories = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/stories?status=${filter}`);
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setStories(data.data?.stories || []);
                }
            }
        } catch (err) {
            toast.error('Hikayeler yüklenemedi');
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchStories();
    }, [fetchStories]);

    const handleAction = async (storyId: string, status: 'approved' | 'rejected') => {
        setActionLoading(storyId);
        try {
            const res = await fetch(`/api/admin/stories/${storyId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success(status === 'approved' ? 'Hikaye onaylandı' : 'Hikaye reddedildi');
                fetchStories();
            } else {
                toast.error(data.error?.message || 'İşlem başarısız');
            }
        } catch {
            toast.error('Bir hata oluştu');
        } finally {
            setActionLoading(null);
        }
    };

    const tabs = [
        { key: 'pending', label: 'Bekleyenler', icon: Clock },
        { key: 'approved', label: 'Onaylananlar', icon: CheckCircle },
        { key: 'rejected', label: 'Reddedilenler', icon: XCircle },
        { key: 'all', label: 'Tümü', icon: Eye },
    ];

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="h-7 w-7 text-pink-600" />
                <h2 className="text-3xl font-bold text-gray-900">Başarı Hikayeleri</h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === tab.key
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Stories List */}
            {loading ? (
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
                            <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
                            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                            <div className="h-4 bg-gray-200 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : stories.length === 0 ? (
                <div className="bg-white rounded-lg border p-12 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Bu kategoride hikaye bulunamadı.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {stories.map((story) => {
                        const config = statusConfig[story.status];
                        const StatusIcon = config.icon;
                        const isExpanded = expandedStory === story.story_id;

                        return (
                            <div
                                key={story.story_id}
                                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                            >
                                {/* Header */}
                                <div
                                    className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => setExpandedStory(isExpanded ? null : story.story_id)}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-semibold text-gray-900 truncate">{story.title}</h3>
                                                <Badge className={config.color}>
                                                    <StatusIcon className="h-3 w-3 mr-1" />
                                                    {config.label}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {story.user_name} · {story.university} · {story.field}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(story.created_at).toLocaleDateString('tr-TR', {
                                                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {isExpanded ? '▲' : '▼'}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100 p-5 bg-gray-50">
                                        <div className="mb-4">
                                            <p className="text-sm font-medium text-gray-500 mb-1">Hikaye:</p>
                                            <p className="text-gray-800 bg-white rounded-lg p-4 border italic">
                                                &ldquo;{story.quote}&rdquo;
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                                            <div>
                                                <p className="text-gray-500">İsim</p>
                                                <p className="font-medium">{story.user_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">E-posta</p>
                                                <p className="font-medium">{story.user_email}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Üniversite</p>
                                                <p className="font-medium">{story.university}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Toplanan</p>
                                                <p className="font-medium text-green-600">
                                                    {formatAmount(story.funded_amount)}
                                                </p>
                                            </div>
                                        </div>

                                        {story.admin_note && (
                                            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                <p className="text-xs font-medium text-blue-600 mb-1">Admin Notu:</p>
                                                <p className="text-sm text-blue-800">{story.admin_note}</p>
                                            </div>
                                        )}

                                        {story.status === 'pending' && (
                                            <div className="flex gap-3 pt-2">
                                                <Button
                                                    onClick={() => handleAction(story.story_id, 'approved')}
                                                    disabled={actionLoading === story.story_id}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    {actionLoading === story.story_id ? 'İşleniyor...' : 'Onayla'}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleAction(story.story_id, 'rejected')}
                                                    disabled={actionLoading === story.story_id}
                                                    className="border-red-300 text-red-600 hover:bg-red-50"
                                                >
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                    Reddet
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
