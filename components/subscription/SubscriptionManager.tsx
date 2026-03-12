'use client';

import React, { useState, useCallback } from 'react';
import useSWR from 'swr';
import {
  RefreshCcw,
  Calendar,
  CreditCard,
  Pause,
  Play,
  XCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Ban,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// ── Fetcher ───────────────────────────────────────────────
const fetcher = (url: string) => fetch(url).then((r) => r.json());

// ── Status helpers ────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active: {
    label: 'Aktif',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  paused: {
    label: 'Duraklatıldı',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: <Pause className="h-3.5 w-3.5" />,
  },
  cancelled: {
    label: 'İptal Edildi',
    color: 'bg-gray-100 text-gray-600 border-gray-200',
    icon: <Ban className="h-3.5 w-3.5" />,
  },
  past_due: {
    label: 'Ödeme Başarısız',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
  expired: {
    label: 'Süresi Doldu',
    color: 'bg-gray-100 text-gray-500 border-gray-200',
    icon: <Clock className="h-3.5 w-3.5" />,
  },
};

const INTERVAL_LABELS: Record<string, string> = {
  monthly: 'Aylık',
  quarterly: '3 Aylık',
  yearly: 'Yıllık',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatCurrency(amount: number, currency = 'TRY') {
  const sym = currency === 'TRY' ? '₺' : '$';
  return `${sym}${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;
}

// ── Types ─────────────────────────────────────────────────
interface Subscription {
  _id: string;
  subscription_id: string;
  campaign_id: string;
  campaign_title?: string;
  amount: number;
  currency: string;
  billing_interval: string;
  status: string;
  next_billing_date: string;
  created_at: string;
  cancelled_at?: string;
  total_donated: number;
  payment_count: number;
  retry_count: number;
}

interface Payment {
  _id: string;
  payment_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

// ── Subscription Card ─────────────────────────────────────
function SubscriptionCard({
  sub,
  onAction,
}: {
  sub: Subscription;
  onAction: () => void;
}) {
  const [showPayments, setShowPayments] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const status = STATUS_CONFIG[sub.status] || STATUS_CONFIG.active;
  const isActive = sub.status === 'active';
  const isPaused = sub.status === 'paused';

  // Load payment history
  const togglePayments = async () => {
    if (showPayments) {
      setShowPayments(false);
      return;
    }
    setLoadingPayments(true);
    try {
      const res = await fetch(`/api/subscriptions/${sub.subscription_id}`);
      const data = await res.json();
      if (data.success) {
        setPayments(data.data?.payments || []);
      }
    } catch {
      toast.error('Ödeme geçmişi yüklenemedi.');
    } finally {
      setLoadingPayments(false);
      setShowPayments(true);
    }
  };

  // Run action (pause / resume / cancel)
  const handleAction = async (action: 'pause' | 'resume' | 'cancel') => {
    if (action === 'cancel' && confirmAction !== 'cancel') {
      setConfirmAction('cancel');
      return;
    }

    setActionLoading(action);
    try {
      const res = await fetch(`/api/subscriptions/${sub.subscription_id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          action === 'cancel'
            ? 'Abonelik iptal edildi.'
            : action === 'pause'
            ? 'Abonelik duraklatıldı.'
            : 'Abonelik devam ettirildi.'
        );
        onAction();
      } else {
        toast.error(data.error?.message || 'İşlem başarısız oldu.');
      }
    } catch {
      toast.error('Bir hata oluştu, tekrar deneyin.');
    } finally {
      setActionLoading(null);
      setConfirmAction(null);
    }
  };

  return (
    <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate text-lg">
              {sub.campaign_title || 'Kampanya'}
            </h3>
            <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <CreditCard className="h-3.5 w-3.5" />
                {formatCurrency(sub.amount, sub.currency)} / {INTERVAL_LABELS[sub.billing_interval] || sub.billing_interval}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(sub.created_at)}
              </span>
            </div>
          </div>
          <Badge className={`${status.color} border flex items-center gap-1 px-2.5 py-1`}>
            {status.icon}
            {status.label}
          </Badge>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-4 bg-gray-50 rounded-xl p-3">
          <div className="text-center">
            <p className="text-xs text-gray-500">Toplam Bağış</p>
            <p className="font-semibold text-gray-900">{formatCurrency(sub.total_donated, sub.currency)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Ödeme Sayısı</p>
            <p className="font-semibold text-gray-900">{sub.payment_count}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">
              {isActive || isPaused ? 'Sonraki Çekim' : 'Durum'}
            </p>
            <p className="font-semibold text-gray-900">
              {isActive || isPaused
                ? formatDate(sub.next_billing_date)
                : status.label}
            </p>
          </div>
        </div>

        {/* Past due warning */}
        {sub.status === 'past_due' && (
          <div className="mt-3 bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">
              Ödemeniz başarısız oldu. Tekrar deneme {sub.retry_count}/5.
              Kart bilgilerinizi kontrol edin.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          {isActive && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => handleAction('pause')}
                disabled={!!actionLoading}
              >
                {actionLoading === 'pause' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Pause className="h-3.5 w-3.5" />
                )}
                Duraklat
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                onClick={() => handleAction('cancel')}
                disabled={!!actionLoading}
              >
                {actionLoading === 'cancel' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" />
                )}
                {confirmAction === 'cancel' ? 'Emin misiniz?' : 'İptal Et'}
              </Button>
            </>
          )}
          {isPaused && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                onClick={() => handleAction('resume')}
                disabled={!!actionLoading}
              >
                {actionLoading === 'resume' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Play className="h-3.5 w-3.5" />
                )}
                Devam Ettir
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                onClick={() => handleAction('cancel')}
                disabled={!!actionLoading}
              >
                {actionLoading === 'cancel' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" />
                )}
                {confirmAction === 'cancel' ? 'Emin misiniz?' : 'İptal Et'}
              </Button>
            </>
          )}

          {/* Payment history toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 ml-auto text-gray-500"
            onClick={togglePayments}
          >
            {loadingPayments ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : showPayments ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
            Ödeme Geçmişi
          </Button>
        </div>

        {/* Cancel confirm row */}
        {confirmAction === 'cancel' && (
          <div className="mt-3 bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-700">
            Aboneliği iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleAction('cancel')}
                disabled={!!actionLoading}
              >
                {actionLoading === 'cancel' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                ) : null}
                Evet, İptal Et
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfirmAction(null)}
              >
                Vazgeç
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Payment History */}
      {showPayments && (
        <div className="border-t bg-gray-50 p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Ödeme Geçmişi</h4>
          {payments.length === 0 ? (
            <p className="text-sm text-gray-500">Henüz ödeme kaydı yok.</p>
          ) : (
            <div className="space-y-2">
              {payments.map((p) => (
                <div
                  key={p.payment_id}
                  className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border text-sm"
                >
                  <div className="flex items-center gap-2">
                    {p.status === 'success' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-gray-700">{formatDate(p.created_at)}</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(p.amount, p.currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────
export function SubscriptionManager() {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data, error, isLoading, mutate } = useSWR(
    `/api/subscriptions/my?status=${statusFilter === 'all' ? '' : statusFilter}&limit=50`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const subscriptions: Subscription[] = data?.data?.subscriptions || [];
  const pagination = data?.data?.pagination;

  const handleRefresh = useCallback(() => {
    mutate();
  }, [mutate]);

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-3" />
        <p className="text-gray-600">Abonelikler yüklenirken hata oluştu.</p>
        <Button variant="outline" className="mt-3" onClick={handleRefresh}>
          Tekrar Dene
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Aboneliklerim</h2>
          <p className="text-sm text-gray-500 mt-1">
            Tekrarlı bağışlarınızı yönetin
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleRefresh}>
          <RefreshCcw className="h-3.5 w-3.5" />
          Yenile
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: 'all', label: 'Tümü' },
          { value: 'active', label: 'Aktif' },
          { value: 'paused', label: 'Duraklatılmış' },
          { value: 'cancelled', label: 'İptal Edilmiş' },
          { value: 'past_due', label: 'Ödeme Başarısız' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              statusFilter === f.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 hover:border-blue-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {subscriptions.length === 0 ? (
        <div className="text-center py-16 bg-white border rounded-2xl">
          <RefreshCcw className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {statusFilter === 'all'
              ? 'Henüz aboneliğiniz yok'
              : 'Bu durumda abonelik bulunamadı'}
          </h3>
          <p className="text-sm text-gray-500">
            Bir kampanyaya tekrarlı bağış yaparak destek olmaya başlayın.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((sub) => (
            <SubscriptionCard
              key={sub.subscription_id}
              sub={sub}
              onAction={handleRefresh}
            />
          ))}
        </div>
      )}

      {/* Pagination info */}
      {pagination && pagination.total > pagination.limit && (
        <p className="text-center text-sm text-gray-500">
          {pagination.total} abonelikten {subscriptions.length} tanesi gösteriliyor
        </p>
      )}
    </div>
  );
}

export default SubscriptionManager;
