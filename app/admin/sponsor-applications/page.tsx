'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Building2, User, Mail, Phone, MessageSquare, Clock, CheckCircle, XCircle, Eye, Trash2, Search } from 'lucide-react';

interface SponsorApplication {
  _id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  message: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  notes: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending: { label: 'Beklemede', color: 'text-yellow-800', bg: 'bg-yellow-100', icon: <Clock className="h-3.5 w-3.5" /> },
  reviewed: { label: 'Incelendi', color: 'text-blue-800', bg: 'bg-blue-100', icon: <Eye className="h-3.5 w-3.5" /> },
  approved: { label: 'Onaylandi', color: 'text-green-800', bg: 'bg-green-100', icon: <CheckCircle className="h-3.5 w-3.5" /> },
  rejected: { label: 'Reddedildi', color: 'text-red-800', bg: 'bg-red-100', icon: <XCircle className="h-3.5 w-3.5" /> },
};

export default function AdminSponsorApplicationsPage() {
  const [applications, setApplications] = useState<SponsorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState<SponsorApplication | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('status', filter);
      params.set('page', pagination.page.toString());
      params.set('limit', '20');

      const res = await fetch(`/api/admin/sponsor-applications?${params}`);
      const data = await res.json();

      if (data.success) {
        setApplications(data.data.applications);
        setPagination((prev) => ({
          ...prev,
          total: data.data.pagination.total,
          totalPages: data.data.pagination.totalPages,
        }));
      }
    } catch (error) {
      console.error('Basvurular yuklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, pagination.page]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/sponsor-applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });

      if (res.ok) {
        await fetchApplications();
        if (selectedApp?._id === id) {
          setSelectedApp((prev) => (prev ? { ...prev, status: status as any, notes } : null));
        }
      }
    } catch (error) {
      console.error('Durum guncellenirken hata:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteApplication = async (id: string) => {
    if (!confirm('Bu basvuruyu silmek istediginizden emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/sponsor-applications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setApplications((prev) => prev.filter((a) => a._id !== id));
        if (selectedApp?._id === id) setSelectedApp(null);
      }
    } catch (error) {
      console.error('Başvuru silinirken hata:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pendingCount = applications.filter((a) => a.status === 'pending').length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sponsor Basvurulari</h1>
        <p className="text-gray-500 mt-1">Sponsor olmak isteyen sirketlerin basvurularini yonetin</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(statusConfig).map(([key, cfg]) => {
          const count = filter === 'all'
            ? applications.filter((a) => a.status === key).length
            : key === filter
            ? applications.length
            : 0;
          return (
            <button
              key={key}
              onClick={() => { setFilter(key === filter ? 'all' : key); setPagination((p) => ({ ...p, page: 1 })); }}
              className={`p-4 rounded-xl border-2 transition-all ${
                filter === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                {cfg.icon}
                {cfg.label}
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-2">{count}</div>
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => { setFilter('all'); setPagination((p) => ({ ...p, page: 1 })); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Tumu ({pagination.total})
        </button>
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => { setFilter(key); setPagination((p) => ({ ...p, page: 1 })); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Application List */}
        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Henüz başvuru bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => {
                const sc = statusConfig[app.status] || statusConfig.pending;
                return (
                  <div
                    key={app._id}
                    onClick={() => { setSelectedApp(app); setNotes(app.notes || ''); }}
                    className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedApp?._id === app._id ? 'border-blue-500 shadow-md' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-gray-900">{app.companyName}</h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.color}`}>
                            {sc.icon}
                            {sc.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" /> {app.contactName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" /> {app.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" /> {app.phone}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-2">{formatDate(app.createdAt)}</div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteApplication(app._id); }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <button
                    onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50"
                  >
                    Önceki
                  </button>
                  <span className="text-sm text-gray-500">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPagination((p) => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50"
                  >
                    Sonraki
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedApp && (
          <div className="w-96 bg-white rounded-xl border border-gray-200 p-6 h-fit sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Başvuru Detayı</h2>
              <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Sirket / Kurum</div>
                <div className="flex items-center gap-2 text-gray-900 font-medium">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  {selectedApp.companyName}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Yetkili Kisi</div>
                <div className="flex items-center gap-2 text-gray-900">
                  <User className="h-4 w-4 text-gray-500" />
                  {selectedApp.contactName}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">E-posta</div>
                <a href={`mailto:${selectedApp.email}`} className="flex items-center gap-2 text-blue-600 hover:underline">
                  <Mail className="h-4 w-4" />
                  {selectedApp.email}
                </a>
              </div>

              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Telefon</div>
                <a href={`tel:${selectedApp.phone}`} className="flex items-center gap-2 text-blue-600 hover:underline">
                  <Phone className="h-4 w-4" />
                  {selectedApp.phone}
                </a>
              </div>

              {selectedApp.message && (
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Mesaj</div>
                  <div className="flex items-start gap-2 text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">
                    <MessageSquare className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    {selectedApp.message}
                  </div>
                </div>
              )}

              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Başvuru Tarihi</div>
                <div className="text-gray-700 text-sm">{formatDate(selectedApp.createdAt)}</div>
              </div>

              {/* Admin Notes */}
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Admin Notlari</div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Bu başvuru hakkında notlarınız..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg resize-none text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Status Actions */}
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">Durumu Guncelle</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateStatus(selectedApp._id, 'reviewed')}
                    disabled={updatingId === selectedApp._id}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" /> Incelendi
                  </button>
                  <button
                    onClick={() => updateStatus(selectedApp._id, 'approved')}
                    disabled={updatingId === selectedApp._id}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle className="h-3.5 w-3.5" /> Onayla
                  </button>
                  <button
                    onClick={() => updateStatus(selectedApp._id, 'rejected')}
                    disabled={updatingId === selectedApp._id}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Reddet
                  </button>
                  <button
                    onClick={() => updateStatus(selectedApp._id, 'pending')}
                    disabled={updatingId === selectedApp._id}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-yellow-50 text-yellow-700 hover:bg-yellow-100 disabled:opacity-50 transition-colors"
                  >
                    <Clock className="h-3.5 w-3.5" /> Beklet
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
