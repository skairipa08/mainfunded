'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  users: { total: number; admins: number };
  verifications: { pending: number; verified: number; rejected: number };
  campaigns: { total: number; published: number; completed: number };
  donations: { total_amount: number; total_count: number };
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        } else {
          throw new Error(data.error?.message || 'Failed to fetch stats');
        }
      } catch (err: any) {
        setError(err.message || 'Error loading statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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

  if (!stats) {
    return null;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Users Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.users.total}</p>
          <p className="text-sm text-gray-500 mt-1">{stats.users.admins} admins</p>
        </div>

        {/* Verifications Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Verifications</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.verifications.pending}</p>
          <p className="text-sm text-gray-500 mt-1">
            {stats.verifications.verified} verified, {stats.verifications.rejected} rejected
          </p>
        </div>

        {/* Campaigns Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Campaigns</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.campaigns.total}</p>
          <p className="text-sm text-gray-500 mt-1">
            {stats.campaigns.published} published, {stats.campaigns.completed} completed
          </p>
        </div>

        {/* Donations Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Donations</h3>
          <p className="text-3xl font-bold text-green-600">
            ${stats.donations.total_amount.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">{stats.donations.total_count} donations</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex gap-4">
          <Link
            href="/admin/students"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Review Pending Students
          </Link>
          <Link
            href="/admin/campaigns"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            View All Campaigns
          </Link>
        </div>
      </div>
    </div>
  );
}
