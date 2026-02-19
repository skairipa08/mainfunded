'use client';

import { useEffect, useState, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { FileText, RefreshCw, Filter, Search } from 'lucide-react';

interface AuditLog {
  _id: string;
  action: string;
  actor_id: string;
  actor_email: string;
  target_id?: string;
  target_type?: string;
  target_details?: Record<string, unknown>;
  severity: 'info' | 'warning' | 'critical';
  ip_address?: string;
  timestamp: string;
}

const ACTION_LABELS: Record<string, string> = {
  'student.verified': 'Öğrenci Doğrulandı',
  'student.rejected': 'Öğrenci Reddedildi',
  'campaign.status_changed': 'Kampanya Durumu Değişti',
  'user.role_changed': 'Kullanıcı Rolü Değişti',
  'payout.processed': 'Ödeme İşlendi',
  'login.failed': 'Başarısız Giriş',
};

const SEVERITY_STYLES: Record<string, string> = {
  info: 'bg-blue-100 text-blue-800',
  warning: 'bg-yellow-100 text-yellow-800',
  critical: 'bg-red-100 text-red-800',
};

const SEVERITY_LABELS: Record<string, string> = {
  info: 'Bilgi',
  warning: 'Uyarı',
  critical: 'Kritik',
};

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [actionFilter, setActionFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (actionFilter) params.set('action', actionFilter);
      if (severityFilter) params.set('severity', severityFilter);
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      if (!res.ok) throw new Error('Denetim kayıtları yüklenemedi');
      const data = await res.json();
      setLogs(data.data ?? []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Hata oluştu';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [actionFilter, severityFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-red-600 font-medium mb-4">{error}</p>
        <Button onClick={fetchLogs}><RefreshCw className="h-4 w-4 mr-2" /> Yeniden Dene</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <FileText className="h-8 w-8 text-gray-600" />
        <h2 className="text-3xl font-bold text-gray-900">Denetim Kayıtları</h2>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtreler</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">İşlem Türü</label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="">Tümü</option>
              {Object.entries(ACTION_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Önem Derecesi</label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <option value="">Tümü</option>
              <option value="info">Bilgi</option>
              <option value="warning">Uyarı</option>
              <option value="critical">Kritik</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Başlangıç</label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Bitiş</label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateTo(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <span className="text-sm text-gray-500">{loading ? '...' : `${logs.length} kayıt`}</span>
          <Button variant="ghost" size="sm" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-48 ml-auto" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">Bu filtrede kayıt bulunamadı</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {logs.map((log) => (
              <div key={log._id} className="px-4 py-3 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Badge className={SEVERITY_STYLES[log.severity] ?? SEVERITY_STYLES.info}>
                      {SEVERITY_LABELS[log.severity] ?? log.severity}
                    </Badge>
                    <span className="text-sm font-medium text-gray-900">
                      {ACTION_LABELS[log.action] ?? log.action}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span title={log.actor_email}>{log.actor_email}</span>
                    {log.ip_address && <span className="font-mono">{log.ip_address}</span>}
                    <span>{new Date(log.timestamp).toLocaleString('tr-TR')}</span>
                  </div>
                </div>
                {log.target_details && Object.keys(log.target_details).length > 0 && (
                  <div className="mt-1 text-xs text-gray-500 pl-16">
                    {Object.entries(log.target_details).map(([key, val]) => (
                      <span key={key} className="mr-3">
                        <strong>{key}:</strong> {String(val)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
