'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  CreditCard,
  Trash2,
  Check,
  ExternalLink,
  ArrowLeft,
  Shield,
} from 'lucide-react';
import Link from 'next/link';

interface PayoutMethod {
  type: 'iyzico' | 'paypal' | 'wise' | 'papara';
  details: Record<string, string>;
  is_default: boolean;
  created_at: string;
  verified: boolean;
}

export default function PayoutMethodsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [methods, setMethods] = useState<PayoutMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('papara');

  // Form fields
  const [paypalEmail, setPaypalEmail] = useState('');
  const [wiseEmail, setWiseEmail] = useState('');
  const [paparaNumber, setPaparaNumber] = useState('');

  const fetchMethods = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/student/payout-method');
      if (!res.ok) throw new Error('Ödeme yöntemleri yüklenemedi');
      const data = await res.json();
      setMethods(data.data ?? []);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authStatus === 'loading') return;
    if (!session) {
      router.replace('/login');
      return;
    }
    fetchMethods();
  }, [session, authStatus, router, fetchMethods]);

  const handleSaveMethod = async (type: string, details: Record<string, string>) => {
    setSaving(true);
    try {
      const res = await fetch('/api/student/payout-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, details }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error ?? 'Kayıt başarısız');
      }
      toast.success('Ödeme yöntemi kaydedildi');
      await fetchMethods();
      // Reset fields
      setPaypalEmail('');
      setWiseEmail('');
      setPaparaNumber('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const hasMethod = (type: string) => methods.some((m) => m.type === type);

  if (authStatus === 'loading') {
    return <PageSkeleton />;
  }
  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/student/dashboard">
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Ödeme Yöntemleri</h1>
        </div>

        {/* Saved Methods */}
        {loading ? (
          <div className="space-y-3 mb-8">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4">
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-60" />
              </div>
            ))}
          </div>
        ) : methods.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Kayıtlı Yöntemler</h2>
            <div className="space-y-3">
              {methods.map((m, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MethodIcon type={m.type} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 capitalize">{m.type}</span>
                        {m.is_default && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">Varsayılan</Badge>
                        )}
                        {m.verified && (
                          <Badge className="bg-green-100 text-green-800 text-xs"><Check className="h-3 w-3 mr-0.5" /> Doğrulandı</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {Object.values(m.details).join(' · ')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Add / Update Method */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {methods.length > 0 ? 'Yeni Yöntem Ekle' : 'Ödeme Yöntemi Ekle'}
            </h2>

            <div className="grid grid-cols-3 gap-2 mb-6">
              {['paypal', 'wise', 'papara'].map((key) => (
                <Button
                  key={key}
                  variant={activeTab === key ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => setActiveTab(key)}
                >
                  {key === 'paypal' && 'PayPal'}
                  {key === 'wise' && 'Wise'}
                  {key === 'papara' && 'Papara'}
                </Button>
              ))}
            </div>

            {activeTab === 'paypal' && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                  <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">PayPal</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      PayPal hesabınıza ödeme alın. Dünya genelinde kullanılabilir.
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PayPal E-posta</label>
                  <Input
                    type="email"
                    placeholder="ornek@email.com"
                    value={paypalEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaypalEmail(e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => handleSaveMethod('paypal', { email: paypalEmail })}
                  disabled={saving || !paypalEmail}
                  className="w-full"
                >
                  {saving ? 'Kaydediliyor...' : hasMethod('paypal') ? 'PayPal Güncelle' : 'PayPal Ekle'}
                </Button>
              </div>
            )}

            {activeTab === 'wise' && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Wise (TransferWise)</p>
                    <p className="text-sm text-green-700 mt-1">
                      Düşük komisyonlarla uluslararası para transferi. 50+ para biriminde ödeme alın.
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Wise E-posta</label>
                  <Input
                    type="email"
                    placeholder="ornek@email.com"
                    value={wiseEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWiseEmail(e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => handleSaveMethod('wise', { email: wiseEmail })}
                  disabled={saving || !wiseEmail}
                  className="w-full"
                >
                  {saving ? 'Kaydediliyor...' : hasMethod('wise') ? 'Wise Güncelle' : 'Wise Ekle'}
                </Button>
              </div>
            )}

            {activeTab === 'papara' && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                  <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-purple-900">Papara</p>
                    <p className="text-sm text-purple-700 mt-1">
                      Türkiye&apos;de popüler dijital cüzdan. Papara numaranızla anında ödeme alın.
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Papara Numarası</label>
                  <Input
                    type="text"
                    placeholder="10 haneli Papara numarası"
                    value={paparaNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaparaNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                  />
                  <p className="text-xs text-gray-500 mt-1">{paparaNumber.length}/10 hane</p>
                </div>
                <Button
                  onClick={() => handleSaveMethod('papara', { papara_number: paparaNumber })}
                  disabled={saving || paparaNumber.length !== 10}
                  className="w-full"
                >
                  {saving ? 'Kaydediliyor...' : hasMethod('papara') ? 'Papara Güncelle' : 'Papara Ekle'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MethodIcon({ type }: { type: string }) {
  const cls = 'h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold';
  switch (type) {
    case 'iyzico':
      return <div className={`${cls} bg-indigo-600`}>iy</div>;
    case 'paypal':
      return <div className={`${cls} bg-blue-500`}>P</div>;
    case 'wise':
      return <div className={`${cls} bg-green-500`}>W</div>;
    case 'papara':
      return <div className={`${cls} bg-purple-600`}>Pa</div>;
    default:
      return <div className={`${cls} bg-gray-400`}>?</div>;
  }
}

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-56 mb-8" />
        <div className="space-y-3 mb-8">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4">
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-60" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <Skeleton className="h-6 w-48 mb-6" />
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}
