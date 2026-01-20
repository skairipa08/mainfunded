'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Document {
    doc_id: string;
    document_type: string;
    file_name: string;
    is_verified: boolean;
    view_url: string;
}

interface VerificationDetail {
    verification_id: string;
    user_id: string;
    status: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    country: string;
    city?: string;
    institution_name: string;
    institution_country: string;
    degree_program: string;
    degree_level: string;
    enrollment_year: number;
    expected_graduation: number;
    is_full_time: boolean;
    financial_need_statement?: string;
    risk_score: number;
    risk_flags: string[];
    documents: Document[];
    events: any[];
    notes: any[];
    created_at: string;
    submitted_at?: string;
    __v: number;
}

const ACTIONS = [
    { action: 'APPROVE', label: 'Approve', color: 'bg-green-600 hover:bg-green-700', requiresReason: false },
    { action: 'REJECT', label: 'Reject', color: 'bg-red-600 hover:bg-red-700', requiresReason: true },
    { action: 'NEEDS_MORE_INFO', label: 'Request Info', color: 'bg-orange-600 hover:bg-orange-700', requiresReason: true },
    { action: 'INVESTIGATE', label: 'Investigate', color: 'bg-purple-600 hover:bg-purple-700', requiresReason: true },
    { action: 'SUSPEND', label: 'Suspend', color: 'bg-gray-600 hover:bg-gray-700', requiresReason: true },
];

export default function VerificationDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [data, setData] = useState<VerificationDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [showActionModal, setShowActionModal] = useState<string | null>(null);
    const [actionReason, setActionReason] = useState('');
    const [actionMessage, setActionMessage] = useState('');

    const fetchDetail = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/verifications/${id}`);
            if (!response.ok) throw new Error('Failed to fetch');
            const result = await response.json();
            setData(result.verification);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) fetchDetail();
    }, [id, fetchDetail]);

    const handleAction = async (action: string) => {
        if (!data) return;

        setActionLoading(true);
        try {
            const response = await fetch(`/api/admin/verifications/${id}/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    reason: actionReason,
                    message: actionMessage,
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Action failed');
            }

            setShowActionModal(null);
            setActionReason('');
            setActionMessage('');
            fetchDetail();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">{error || 'Verification not found'}</p>
                <Link href="/admin/verifications" className="text-blue-600 mt-2 inline-block">← Back to queue</Link>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <Link href="/admin/verifications" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
                        ← Back to Queue
                    </Link>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {data.first_name} {data.last_name}
                    </h2>
                    <p className="text-gray-500">{data.institution_name}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${data.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        data.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            data.status === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                        }`}>
                        {data.status.replace(/_/g, ' ')}
                    </span>
                    {data.risk_score >= 25 && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${data.risk_score >= 50 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            Risk: {data.risk_score}
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Info */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                        <dl className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <dt className="text-gray-500">Full Name</dt>
                                <dd className="font-medium">{data.first_name} {data.last_name}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Date of Birth</dt>
                                <dd className="font-medium">{data.date_of_birth}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Country</dt>
                                <dd className="font-medium">{data.country}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">City</dt>
                                <dd className="font-medium">{data.city || '-'}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Academic Info */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Academic Information</h3>
                        <dl className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <dt className="text-gray-500">Institution</dt>
                                <dd className="font-medium">{data.institution_name}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Country</dt>
                                <dd className="font-medium">{data.institution_country}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Program</dt>
                                <dd className="font-medium">{data.degree_program}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Degree Level</dt>
                                <dd className="font-medium capitalize">{data.degree_level}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Enrollment Year</dt>
                                <dd className="font-medium">{data.enrollment_year}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Expected Graduation</dt>
                                <dd className="font-medium">{data.expected_graduation}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Full Time</dt>
                                <dd className="font-medium">{data.is_full_time ? 'Yes' : 'No'}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Documents */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Documents ({data.documents?.length || 0})</h3>
                        {!data.documents || data.documents.length === 0 ? (
                            <p className="text-gray-500">No documents uploaded</p>
                        ) : (
                            <div className="space-y-2">
                                {data.documents.map((doc) => (
                                    <div key={doc.doc_id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                        <div>
                                            <span className="font-medium">{doc.document_type.replace(/_/g, ' ')}</span>
                                            <span className="text-sm text-gray-500 ml-2">{doc.file_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {doc.is_verified && (
                                                <span className="text-green-600 text-sm">✓ Verified</span>
                                            )}
                                            <a
                                                href={doc.view_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline text-sm"
                                            >
                                                View
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Financial Need */}
                    {data.financial_need_statement && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-4">Financial Need Statement</h3>
                            <p className="text-gray-700 whitespace-pre-wrap">{data.financial_need_statement}</p>
                        </div>
                    )}
                </div>

                {/* Sidebar - Actions */}
                <div className="space-y-6">
                    {/* Actions */}
                    {['PENDING_REVIEW', 'NEEDS_MORE_INFO', 'UNDER_INVESTIGATION'].includes(data.status) && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-4">Actions</h3>
                            <div className="space-y-2">
                                {ACTIONS.map((act) => (
                                    <button
                                        key={act.action}
                                        onClick={() => act.requiresReason ? setShowActionModal(act.action) : handleAction(act.action)}
                                        disabled={actionLoading}
                                        className={`w-full py-2 px-4 rounded text-white text-sm font-medium ${act.color} disabled:opacity-50`}
                                    >
                                        {act.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Risk Flags */}
                    {data.risk_flags && data.risk_flags.length > 0 && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-4 text-red-600">⚠️ Risk Flags</h3>
                            <ul className="space-y-1">
                                {data.risk_flags.map((flag, i) => (
                                    <li key={i} className="text-sm text-red-700 bg-red-50 px-2 py-1 rounded">
                                        {flag.replace(/_/g, ' ')}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Timeline</h3>
                        <div className="text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Created</span>
                                <span>{new Date(data.created_at).toLocaleDateString()}</span>
                            </div>
                            {data.submitted_at && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Submitted</span>
                                    <span>{new Date(data.submitted_at).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Modal */}
            {showActionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">
                            {showActionModal.replace(/_/g, ' ')} Verification
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason (required)
                                </label>
                                <textarea
                                    value={actionReason}
                                    onChange={(e) => setActionReason(e.target.value)}
                                    rows={3}
                                    className="w-full border rounded-md p-2 text-sm"
                                    placeholder="Enter reason for this action..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Message to student (optional)
                                </label>
                                <textarea
                                    value={actionMessage}
                                    onChange={(e) => setActionMessage(e.target.value)}
                                    rows={2}
                                    className="w-full border rounded-md p-2 text-sm"
                                    placeholder="This will be included in the email..."
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => { setShowActionModal(null); setActionReason(''); setActionMessage(''); }}
                                    className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleAction(showActionModal)}
                                    disabled={!actionReason || actionLoading}
                                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {actionLoading ? 'Processing...' : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
