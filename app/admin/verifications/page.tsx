'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface VerificationItem {
    verification_id: string;
    user_id: string;
    status: string;
    first_name: string;
    last_name: string;
    institution_name: string;
    submitted_at: string;
    risk_score: number;
    assigned_to?: string;
    tier_requested?: number;
    tier_approved?: number;
}

interface QueueResponse {
    items: VerificationItem[];
    total: number;
    page: number;
    totalPages: number;
}

const STATUS_COLORS: Record<string, string> = {
    PENDING_REVIEW: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    NEEDS_MORE_INFO: 'bg-orange-100 text-orange-800',
    UNDER_INVESTIGATION: 'bg-purple-100 text-purple-800',
    SUSPENDED: 'bg-gray-100 text-gray-800',
    DRAFT: 'bg-gray-100 text-gray-600',
};

const TIER_COLORS: Record<number, string> = {
    0: 'bg-blue-100 text-blue-800',
    1: 'bg-emerald-100 text-emerald-800',
    2: 'bg-purple-100 text-purple-800',
    3: 'bg-amber-100 text-amber-800',
};

export default function VerificationQueuePage() {
    const [data, setData] = useState<QueueResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('PENDING_REVIEW');
    const [tierFilter, setTierFilter] = useState<string>('');
    const [minRiskScore, setMinRiskScore] = useState<string>('');
    const [page, setPage] = useState(1);

    const fetchQueue = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            if (statusFilter) params.set('status', statusFilter);
            params.set('page', page.toString());
            params.set('limit', '20');

            const response = await fetch(`/api/admin/verifications?${params}`);

            if (!response.ok) {
                throw new Error('Failed to fetch verification queue');
            }

            const result = await response.json();
            setData(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, minRiskScore, tierFilter]);

    useEffect(() => {
        fetchQueue();
    }, [fetchQueue]);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Verification Queue</h2>
                <button
                    onClick={fetchQueue}
                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6 space-y-4">
                {/* Status filters */}
                <div>
                    <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Status</label>
                    <div className="flex gap-2 flex-wrap">
                        {['PENDING_REVIEW', 'NEEDS_MORE_INFO', 'UNDER_INVESTIGATION', 'APPROVED', 'REJECTED', 'ALL'].map((status) => (
                            <button
                                key={status}
                                onClick={() => { setStatusFilter(status === 'ALL' ? '' : status); setPage(1); }}
                                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${(status === 'ALL' && !statusFilter) || statusFilter === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {status.replace(/_/g, ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tier filters */}
                <div>
                    <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Tier Requested</label>
                    <div className="flex gap-2 flex-wrap">
                        {['', '0', '1', '2', '3'].map((tier) => (
                            <button
                                key={tier || 'all'}
                                onClick={() => { setTierFilter(tier); setPage(1); }}
                                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${tierFilter === tier
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {tier === '' ? 'All Tiers' : `Tier ${tier}`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Risk score filter */}
                <div>
                    <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Min Risk Score</label>
                    <div className="flex gap-2">
                        {['', '25', '50', '75'].map((score) => (
                            <button
                                key={score || 'any'}
                                onClick={() => { setMinRiskScore(score); setPage(1); }}
                                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${minRiskScore === score
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {score === '' ? 'Any' : `≥${score}`}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            )}

            {/* Table */}
            {!loading && data && (
                <>
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Institution</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data.items.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            No verifications found
                                        </td>
                                    </tr>
                                ) : (
                                    data.items.map((item) => (
                                        <tr key={item.verification_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {item.first_name} {item.last_name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{item.institution_name || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[item.status] || 'bg-gray-100 text-gray-800'}`}>
                                                    {item.status.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`text-sm font-medium ${item.risk_score >= 50 ? 'text-red-600' :
                                                    item.risk_score >= 25 ? 'text-yellow-600' : 'text-green-600'
                                                    }`}>
                                                    {item.risk_score || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(item.submitted_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <Link
                                                    href={`/admin/verifications/${item.verification_id}`}
                                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    Review
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {data.totalPages > 1 && (
                        <div className="flex justify-between items-center mt-4">
                            <p className="text-sm text-gray-500">
                                Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, data.total)} of {data.total}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-3 py-1 text-sm bg-gray-100 rounded disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="px-3 py-1 text-sm">
                                    Page {page} of {data.totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                                    disabled={page === data.totalPages}
                                    className="px-3 py-1 text-sm bg-gray-100 rounded disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
