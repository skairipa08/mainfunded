'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useCurrency } from '@/lib/currency-context';

interface Campaign {
  campaign_id: string;
  title: string;
  status: string;
  goal_amount: number;
  raised_amount: number;
  created_at: string;
  student?: {
    name: string;
    email: string;
  };
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', bg: 'bg-gray-100', text: 'text-gray-800' },
  { value: 'published', label: 'Published', bg: 'bg-blue-100', text: 'text-blue-800' },
  { value: 'paused', label: 'Paused', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  { value: 'completed', label: 'Completed', bg: 'bg-green-100', text: 'text-green-800' },
  { value: 'cancelled', label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-800' },
];

export default function AdminCampaignsPage() {
  const { data: session } = useSession();
  const { formatAmount } = useCurrency();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/admin/campaigns', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }
      const data = await response.json();
      if (data.success) {
        setCampaigns(data.data || []);
      } else {
        throw new Error(data.error?.message || 'Failed to fetch campaigns');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleStatusChange = async (campaignId: string, newStatus: string) => {
    setUpdatingId(campaignId);
    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to update status');
      }

      // Update local state
      setCampaigns(prev =>
        prev.map(c => c.campaign_id === campaignId ? { ...c, status: newStatus } : c)
      );

      toast.success(`Campaign ${newStatus === 'published' ? 'published' : `status changed to ${newStatus}`}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update campaign status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyle = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
      >
        {statusStyle.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Campaigns</h2>

      {campaigns.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No campaigns found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Goal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Raised
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaigns.map((campaign) => {
                const progress = campaign.goal_amount > 0
                  ? (campaign.raised_amount / campaign.goal_amount) * 100
                  : 0;
                const isUpdating = updatingId === campaign.campaign_id;

                return (
                  <tr key={campaign.campaign_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{campaign.title}</div>
                      <div className="text-xs text-gray-400 font-mono">{campaign.campaign_id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {campaign.student?.name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(campaign.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatAmount(campaign.goal_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatAmount(campaign.raised_amount)}
                      <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {/* Quick Publish Button */}
                        {campaign.status !== 'published' && (
                          <button
                            onClick={() => handleStatusChange(campaign.campaign_id, 'published')}
                            disabled={isUpdating}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUpdating ? 'Updating...' : 'Publish'}
                          </button>
                        )}

                        {/* Quick Pause/Unpublish Button */}
                        {campaign.status === 'published' && (
                          <button
                            onClick={() => handleStatusChange(campaign.campaign_id, 'paused')}
                            disabled={isUpdating}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUpdating ? 'Updating...' : 'Pause'}
                          </button>
                        )}

                        {/* Status Dropdown */}
                        <select
                          value={campaign.status}
                          onChange={(e) => handleStatusChange(campaign.campaign_id, e.target.value)}
                          disabled={isUpdating}
                          className="text-xs border border-gray-300 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
