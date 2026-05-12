'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  BellRing,
  CalendarDays,
  CreditCard,
  Sparkles,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { ReminderInstruction, ReminderRule } from '@/types/notifications';
import {
  ensureBrowserNotificationsEnabled,
  showBrowserNotificationPreview,
} from '@/lib/browser-notifications';

type NotificationPreferencesDto = {
  reminderDay?: number;
  reminderRules?: ReminderRule[];
};

type BrowserPermissionState = NotificationPermission | 'unsupported';

export default function ReminderCenterPage() {
  const { status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [browserPermission, setBrowserPermission] = useState<BrowserPermissionState>('unsupported');

  const [reminderDay, setReminderDay] = useState(10);
  const [monthlyInstruction, setMonthlyInstruction] = useState<ReminderInstruction>('notify_only');

  const [specialDate, setSpecialDate] = useState('');
  const [specialTitle, setSpecialTitle] = useState('');
  const [specialInstruction, setSpecialInstruction] = useState<ReminderInstruction>('notify_only');

  const [rules, setRules] = useState<ReminderRule[]>([]);

  const refreshBrowserPermission = React.useCallback(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setBrowserPermission('unsupported');
      return;
    }
    setBrowserPermission(Notification.permission);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/calendar/reminders');
      return;
    }

    if (status === 'authenticated') {
      refreshBrowserPermission();
      void fetchReminderData();
    }
  }, [status, router, refreshBrowserPermission]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const handlePermissionRefresh = () => {
      refreshBrowserPermission();
    };

    window.addEventListener('focus', handlePermissionRefresh);
    document.addEventListener('visibilitychange', handlePermissionRefresh);

    return () => {
      window.removeEventListener('focus', handlePermissionRefresh);
      document.removeEventListener('visibilitychange', handlePermissionRefresh);
    };
  }, [status, refreshBrowserPermission]);

  const monthlyRule = useMemo(
    () => rules.find((rule) => rule.type === 'monthly' && rule.enabled),
    [rules]
  );

  const specialRules = useMemo(
    () => rules.filter((rule) => rule.type === 'special_day' && rule.enabled),
    [rules]
  );

  async function fetchReminderData() {
    setLoading(true);
    setError(null);

    try {
      const [prefRes, rulesRes] = await Promise.all([
        fetch('/api/notifications/preferences'),
        fetch('/api/notifications/reminder-rules'),
      ]);

      if (!prefRes.ok || !rulesRes.ok) {
        const prefErr = prefRes.ok ? '' : await prefRes.text();
        const rulesErr = rulesRes.ok ? '' : await rulesRes.text();
        throw new Error(prefErr || rulesErr || 'Hatırlatıcı verileri alınamadı');
      }

      const prefJson = (await prefRes.json()) as { preferences?: NotificationPreferencesDto };
      const rulesJson = (await rulesRes.json()) as { rules?: ReminderRule[] };

      const day = prefJson.preferences?.reminderDay;
      setReminderDay(typeof day === 'number' ? Math.min(28, Math.max(1, Math.trunc(day))) : 10);

      const incomingRules = Array.isArray(rulesJson.rules) ? rulesJson.rules : [];
      setRules(incomingRules);

      const incomingMonthly = incomingRules.find((rule) => rule.type === 'monthly');
      setMonthlyInstruction(incomingMonthly?.instruction ?? 'notify_only');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Hatırlatıcı verileri yüklenirken sorun oluştu.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function saveMonthlyRule() {
    setSaving(true);
    setFeedback(null);
    setError(null);

    try {
      const browserNotification = await ensureBrowserNotificationsEnabled();
      setBrowserPermission(browserNotification.permission);
      const clampedDay = Math.min(28, Math.max(1, Math.trunc(reminderDay)));
      const res = await fetch('/api/notifications/reminder-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'monthly-primary',
          type: 'monthly',
          title: `Her ayın ${clampedDay}. günü`,
          dayOfMonth: clampedDay,
          instruction: monthlyInstruction,
          enabled: true,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Aylık talimat kaydedilemedi');
      }

      const json = (await res.json()) as { rules?: ReminderRule[] };
      setRules(Array.isArray(json.rules) ? json.rules : []);

      if (browserNotification.permission === 'granted') {
        showBrowserNotificationPreview(
          'FundEd aylık hatırlatıcı aktif ✅',
          `Her ayın ${clampedDay}. günü için tarayıcı bildirimi etkinleştirildi.`
        );
      }

      const browserMessage = !browserNotification.supported
        ? ' (Tarayıcı bildirimi desteklenmiyor)'
        : browserNotification.permission === 'granted'
          ? ' Tarayıcı bildirimi açıldı.'
          : browserNotification.permission === 'denied'
            ? ' Tarayıcı bildirim izni reddedildi.'
            : ' Tarayıcı bildirimi için izin verilmedi.';

      setFeedback(`Aylık bağış hatırlatıcı talimatı kaydedildi.${browserMessage}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Aylık talimat ayarlanırken sorun oluştu.';
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function addSpecialDayRule() {
    if (!specialDate || !specialTitle.trim()) {
      setError('Özel gün tarihi ve başlığı zorunludur.');
      return;
    }

    setSaving(true);
    setFeedback(null);
    setError(null);

    try {
      const browserNotification = await ensureBrowserNotificationsEnabled();
      setBrowserPermission(browserNotification.permission);
      const pickedDate = new Date(specialDate);
      const monthDay = `${String(pickedDate.getMonth() + 1).padStart(2, '0')}-${String(pickedDate.getDate()).padStart(2, '0')}`;

      const res = await fetch('/api/notifications/reminder-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `special-${monthDay}`,
          type: 'special_day',
          title: specialTitle.trim(),
          specialDayTitle: specialTitle.trim(),
          specialDayDate: specialDate,
          monthDay,
          instruction: specialInstruction,
          enabled: true,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Özel gün talimatı kaydedilemedi');
      }

      const json = (await res.json()) as { rules?: ReminderRule[] };
      setRules(Array.isArray(json.rules) ? json.rules : []);

      if (browserNotification.permission === 'granted') {
        showBrowserNotificationPreview(
          `${specialTitle.trim()} hatırlatıcısı aktif ✨`,
          specialInstruction === 'auto_payment_instruction'
            ? 'Özel gün için otomatik ödeme talimatı önerisi etkinleştirildi.'
            : 'Özel gün için tarayıcı bildirim hatırlatıcısı etkinleştirildi.'
        );
      }

      const browserMessage = !browserNotification.supported
        ? ' (Tarayıcı bildirimi desteklenmiyor)'
        : browserNotification.permission === 'granted'
          ? ' Tarayıcı bildirimi açıldı.'
          : browserNotification.permission === 'denied'
            ? ' Tarayıcı bildirim izni reddedildi.'
            : ' Tarayıcı bildirimi için izin verilmedi.';

      setFeedback(`${specialTitle.trim()} için hatırlatıcı talimatı eklendi.${browserMessage}`);
      setSpecialTitle('');
      setSpecialDate('');
      setSpecialInstruction('notify_only');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Özel gün talimatı eklenirken sorun oluştu.';
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function removeRule(ruleId: string) {
    setSaving(true);
    setFeedback(null);
    setError(null);

    try {
      const res = await fetch('/api/notifications/reminder-rules', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleId }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Talimat silinemedi');
      }

      const json = (await res.json()) as { rules?: ReminderRule[] };
      setRules(Array.isArray(json.rules) ? json.rules : []);
      setFeedback('Talimat kaldırıldı.');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Talimat silinirken sorun oluştu.';
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function requestBrowserPermissionAgain() {
    setError(null);
    const result = await ensureBrowserNotificationsEnabled();
    setBrowserPermission(result.permission);

    if (result.permission === 'granted') {
      showBrowserNotificationPreview(
        'FundEd bildirimleri açık 🔔',
        'Tarayıcı bildirim izni başarıyla etkinleştirildi.'
      );
      setFeedback('Tarayıcı bildirimleri açık. Hatırlatıcılar artık browser bildirimi olarak gelebilir.');
      return;
    }

    if (result.permission === 'denied') {
      setError('Bildirim izni tarayıcı tarafından engellenmiş. Adres çubuğundaki kilit simgesinden izin verin.');
      return;
    }

    if (result.permission === 'unsupported') {
      setError('Bu tarayıcı bildirim API desteği sunmuyor.');
      return;
    }

    setError('Bildirim izni henüz verilmedi.');
  }

  const browserPermissionText =
    browserPermission === 'granted'
      ? 'Açık'
      : browserPermission === 'denied'
        ? 'Engellendi'
        : browserPermission === 'default'
          ? 'Sorulmadı'
          : 'Desteklenmiyor';

  const browserPermissionClass =
    browserPermission === 'granted'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : browserPermission === 'denied'
        ? 'bg-red-100 text-red-700 border-red-200'
        : browserPermission === 'default'
          ? 'bg-amber-100 text-amber-700 border-amber-200'
          : 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 p-6 text-white">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-blue-100 mb-2">Hatırlatıcı Merkezi</p>
                <h1 className="text-2xl sm:text-3xl font-extrabold">Bağış Talimatlarını Akıllı Yönetin</h1>
                <p className="text-sm text-blue-100 mt-2 max-w-2xl">
                  Özel günlerde hatırlatıcı kurun, aylık düzeni belirleyin ve otomatik ödeme talimatı seçeneğiyle düzenli desteği planlayın.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/15 rounded-lg p-3 min-w-[120px]">
                  <p className="text-xs text-blue-100">Aktif Talimat</p>
                  <p className="text-2xl font-bold">{rules.filter((rule) => rule.enabled).length}</p>
                </div>
                <div className="bg-white/15 rounded-lg p-3 min-w-[120px]">
                  <p className="text-xs text-blue-100">Özel Gün Kuralı</p>
                  <p className="text-2xl font-bold">{specialRules.length}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {(feedback || error) && (
          <Card className={error ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}>
            <CardContent className="pt-6">
              {feedback && <p className="text-sm text-emerald-700">{feedback}</p>}
              {error && <p className="text-sm text-red-700">{error}</p>}
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500">Hatırlatıcı merkezi yükleniyor...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BellRing className="h-5 w-5 text-purple-600" />
                    Aylık Bağış Talimatı
                  </CardTitle>
                  <CardDescription>
                    Her ay otomatik hatırlatma günü belirleyin ve talimat davranışını seçin.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ayın Kaçıncı Günü</label>
                      <Input
                        type="number"
                        min={1}
                        max={28}
                        value={reminderDay}
                        onChange={(e) => setReminderDay(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Talimat Türü</label>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                        value={monthlyInstruction}
                        onChange={(e) => setMonthlyInstruction(e.target.value as ReminderInstruction)}
                      >
                        <option value="notify_only">Sadece Hatırlat</option>
                        <option value="auto_payment_instruction">Otomatik Ödeme Talimatı Öner</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">
                      Mevcut Durum: {monthlyRule ? `Her ayın ${monthlyRule.dayOfMonth}. günü` : 'Henüz aylık kural yok'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Talimat: {monthlyRule?.instruction === 'auto_payment_instruction' ? 'Otomatik ödeme talimatı önerisi' : 'Sadece hatırlatma bildirimi'}
                    </p>
                  </div>

                  <Button onClick={saveMonthlyRule} disabled={saving}>
                    Aylık Talimatı Kaydet
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    Özel Gün Hatırlatıcı Talimatı
                  </CardTitle>
                  <CardDescription>
                    Kurban Bayramı, Ramazan Bayramı gibi özel günler için yıllık tekrar eden kural tanımlayın.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Özel Gün Tarihi</label>
                      <Input type="date" value={specialDate} onChange={(e) => setSpecialDate(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Talimat Türü</label>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                        value={specialInstruction}
                        onChange={(e) => setSpecialInstruction(e.target.value as ReminderInstruction)}
                      >
                        <option value="notify_only">Sadece Hatırlat</option>
                        <option value="auto_payment_instruction">Otomatik Ödeme Talimatı Öner</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Özel Gün Başlığı</label>
                    <Input
                      value={specialTitle}
                      onChange={(e) => setSpecialTitle(e.target.value)}
                      placeholder="Örn: Kurban Bayramı"
                    />
                  </div>

                  <Button onClick={addSpecialDayRule} disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-white">
                    Özel Gün Talimatını Ekle
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-blue-600" />
                    Aktif Talimatlar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {rules.length === 0 ? (
                    <p className="text-sm text-gray-500">Henüz kayıtlı hatırlatıcı talimatı bulunmuyor.</p>
                  ) : (
                    rules.map((rule) => (
                      <div key={rule.id} className="rounded-lg border border-gray-200 p-4 bg-white flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{rule.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {rule.type === 'special_day' ? `Özel Gün (${rule.monthDay})` : `Aylık (${rule.dayOfMonth}. gün)`} ·{' '}
                            {rule.instruction === 'auto_payment_instruction' ? 'Otomatik ödeme talimatı önerisi' : 'Sadece bildirim'}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => removeRule(rule.id)} disabled={saving}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Sil
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BellRing className="h-4 w-4 text-blue-600" />
                    Tarayıcı Bildirim Durumu
                  </CardTitle>
                  <CardDescription>
                    Popup yalnızca kullanıcı buton etkileşiminde görünür. Mevcut izin durumunu buradan canlı takip edin.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${browserPermissionClass}`}>
                    İzin Durumu: {browserPermissionText}
                  </div>
                  <div className="text-xs text-blue-900 space-y-1">
                    <p>• “Engellendi” ise tarayıcı site izinlerinden “Bildirimler → İzin ver” seçin.</p>
                    <p>• “Sorulmadı” ise aşağıdaki buton izin popup’ını yeniden tetikler.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={requestBrowserPermissionAgain}>
                    Bildirim İzni İste / Yenile
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-purple-600" />
                    Otomatik Ödeme Talimatı
                  </CardTitle>
                  <CardDescription>
                    Bu seçenek bağış anında düzenli ödeme modelini önerir ve kullanıcıyı abonelik/tekrarlı bağış akışına yönlendirir.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-purple-900">
                  <p>• Hatırlatma geldiğinde tekrarlı destek davranışını güçlendirir.</p>
                  <p>• Özellikle bayram ve özel gün kampanyalarında dönüşümü artırır.</p>
                  <p>• İstenirse tek tıkla normal “sadece hatırlat” moduna dönülebilir.</p>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 bg-emerald-50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Güvenli Ayar Saklama
                  </CardTitle>
                  <CardDescription>
                    Talimatlarınız kullanıcı hesabınıza bağlı olarak güvenli şekilde saklanır.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-emerald-900 space-y-2">
                  <p>• Kimlik doğrulaması olmayan kullanıcılar ayar kaydedemez.</p>
                  <p>• Yalnızca gönderilen alanlar güncellenir, diğer tercihler korunur.</p>
                  <p>• Aynı ay için tekrarlı hatırlatma üretimi engellenir.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
