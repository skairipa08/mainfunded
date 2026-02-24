'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import {
  Heart, ArrowLeft, Loader2, Shield, Lock, MessageSquare,
  AlertTriangle, CheckCircle2, GraduationCap, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { getCampaign, createCheckout, getPaymentStatus } from '@/lib/api';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCurrency } from '@/lib/currency-context';
import { censorSurname } from '@/lib/privacy';

function CampaignDonateContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const campaignId = params.id as string;
  const { currency, currencySymbol, toUSD, presetAmounts, formatAmount } = useCurrency();

  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [donationAmount, setDonationAmount] = useState('');
  const [interval, setInterval] = useState<'one-time' | 'week' | 'month'>('one-time');
  const [platformTipPercent, setPlatformTipPercent] = useState(2);
  const [customTip, setCustomTip] = useState('');
  const [useCustomTip, setUseCustomTip] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [noteToStudent, setNoteToStudent] = useState('');
  const [donationError, setDonationError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Success state
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [donationComplete, setDonationComplete] = useState(false);

  // Check for payment return
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      checkPaymentStatus(sessionId);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadCampaign = async () => {
      try {
        const response = await getCampaign(campaignId);
        if (response.success) {
          setCampaign(response.data);
        }
      } catch {
        // handled by UI
      } finally {
        setLoading(false);
      }
    };
    loadCampaign();
  }, [campaignId]);

  const checkPaymentStatus = async (sessionId: string, attempts = 0) => {
    const maxAttempts = 8;
    const pollInterval = 2000;
    if (attempts >= maxAttempts) {
      setCheckingPayment(false);
      return;
    }
    setCheckingPayment(true);
    try {
      const response = await getPaymentStatus(sessionId);
      if (response.data?.payment_status === 'paid') {
        setCheckingPayment(false);
        setDonationComplete(true);
        // Refresh campaign data
        const campaignRes = await getCampaign(campaignId);
        if (campaignRes.success) setCampaign(campaignRes.data);
        return;
      }
      if (response.data?.status === 'expired') {
        setCheckingPayment(false);
        toast.error('Ödeme süresi doldu.');
        return;
      }
      setTimeout(() => checkPaymentStatus(sessionId, attempts + 1), pollInterval);
    } catch {
      if (attempts < maxAttempts - 1) {
        setTimeout(() => checkPaymentStatus(sessionId, attempts + 1), pollInterval);
      } else {
        setCheckingPayment(false);
      }
    }
  };

  // Computed values
  const amount = parseFloat(donationAmount) || 0;
  const effectiveTipPercent = useCustomTip
    ? Math.max(2, parseFloat(customTip) || 2)
    : Math.max(2, platformTipPercent);
  const tipAmount = parseFloat(((amount * effectiveTipPercent) / 100).toFixed(2));
  const totalCharge = parseFloat((amount + tipAmount).toFixed(2));

  const handleDonate = async () => {
    const minAmount = currency === 'TRY' ? 100 : 10;
    if (amount < minAmount) {
      setDonationError(`Lütfen en az ${minAmount} ${currencySymbol} tutarında bir bağış girin.`);
      return;
    }
    if (effectiveTipPercent < 2) {
      setDonationError('Platform desteği en az %2 olmalıdır.');
      return;
    }

    setDonationError(null);
    setProcessingPayment(true);

    try {
      const originUrl = window.location.origin;
      const response = await createCheckout({
        campaign_id: campaignId,
        amount: totalCharge, // TRY — server sends to iyzico
        donor_name: isAnonymous ? undefined : (donorName || session?.user?.name),
        donor_email: isAnonymous ? undefined : (donorEmail || session?.user?.email),
        anonymous: isAnonymous,
        origin_url: originUrl,
        note_to_student: noteToStudent.trim() || undefined,
        platform_tip_percent: effectiveTipPercent,
        platform_tip_amount: tipAmount,
        coverFees: false,
        interval: interval
      });

      if (response.data?.checkout_url || response.data?.url) {
        window.location.href = response.data.checkout_url || response.data.url;
      } else {
        setDonationError('Ödeme başlatılamadı, lütfen tekrar deneyin.');
        setProcessingPayment(false);
      }
    } catch (error: any) {
      setDonationError(error?.message || 'Ödeme işlemi başarısız, tekrar deneyin.');
      setProcessingPayment(false);
    }
  };

  // --------------- RENDER ---------------

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Kampanya bulunamadı</h2>
            <Button onClick={() => router.push('/browse')}>Kampanyalara Göz At</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const student = campaign.student || {};
  const studentName = censorSurname(student.name || campaign.studentName || 'Öğrenci');
  const progress = campaign.goal_amount > 0
    ? Math.min((campaign.raised_amount / campaign.goal_amount) * 100, 100)
    : 0;

  // ---- SUCCESS SCREEN ----
  if (donationComplete) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50 via-white to-white">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-4 py-16">
          <div className="max-w-lg mx-auto text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              Teşekkür Ederiz! 🎉
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed">
              <strong>{studentName}</strong> adlı öğrenciye yaptığınız bağış başarıyla tamamlandı.
              Desteğiniz bir hayali gerçeğe dönüştürmeye yardımcı oluyor.
            </p>

            <div className="bg-white border border-emerald-100 rounded-2xl p-6 text-left space-y-3 shadow-sm">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-emerald-600 shrink-0" />
                <span className="text-gray-700">Kampanya: <strong>{campaign.title}</strong></span>
              </div>
              {noteToStudent && (
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm text-gray-500">Notunuz:</span>
                    <p className="text-gray-700 text-sm italic">&ldquo;{noteToStudent}&rdquo;</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <p className="text-sm text-emerald-800">
                <Sparkles className="h-4 w-4 inline mr-1" />
                Bağışınız öğrenciye iletilecektir. Herhangi bir sorunuz için
                <a href="mailto:support@fund-ed.com" className="underline font-medium ml-1">support@fund-ed.com</a>
                adresinden bize ulaşabilirsiniz.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button onClick={() => router.push(`/campaign/${campaignId}`)} variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Kampanyaya Dön
              </Button>
              <Button onClick={() => router.push('/browse')} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                <Heart className="h-4 w-4" /> Diğer Kampanyalar
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ---- PAYMENT CHECKING OVERLAY ----
  if (checkingPayment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl p-8 text-center shadow-xl max-w-sm">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-medium">Ödemeniz doğrulanıyor…</p>
          <p className="text-gray-500 text-sm mt-1">Lütfen bekleyin</p>
        </div>
      </div>
    );
  }

  // ---- MAIN DONATION FORM ----
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-3xl mx-auto px-4 py-10">
          {/* Back */}
          <Button variant="ghost" size="sm" onClick={() => router.push(`/campaign/${campaignId}`)} className="mb-6 -ml-2 gap-2">
            <ArrowLeft className="h-4 w-4" /> Kampanyaya Dön
          </Button>

          {/* Header */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                {studentName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 truncate">{campaign.title}</h1>
                <p className="text-sm text-gray-500">{studentName} · {campaign.country || student.country || ''}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-gray-900">{formatAmount(campaign.raised_amount || 0)}</p>
                <p className="text-xs text-gray-500">/ {formatAmount(campaign.goal_amount || 0)} hedef</p>
              </div>
            </div>
            {/* Mini progress */}
            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Form */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
            {/* FREQUENCY SELECTOR */}
            <div>
              <Label className="text-base font-semibold text-gray-900 block mb-3">Bağış Sıklığı</Label>
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setInterval('one-time')}
                  className={`flex-1 py-2.5 px-3 text-sm font-medium rounded-lg transition-colors ${interval === 'one-time'
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-900/5'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                    }`}
                >
                  Tek Seferlik
                </button>
                <button
                  type="button"
                  onClick={() => setInterval('month')}
                  className={`flex-1 py-2.5 px-3 text-sm font-medium rounded-lg transition-colors ${interval === 'month'
                    ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                    }`}
                >
                  Aylık
                </button>
                <button
                  type="button"
                  onClick={() => setInterval('week')}
                  className={`flex-1 py-2.5 px-3 text-sm font-medium rounded-lg transition-colors ${interval === 'week'
                    ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                    }`}
                >
                  Haftalık
                </button>
              </div>
            </div>

            {/* AMOUNT */}
            <div>
              <Label htmlFor="amount" className="text-base font-semibold text-gray-900">Bağış Tutarı ({currencySymbol}) {interval !== 'one-time' ? `(${interval === 'month' ? 'Aylık' : 'Haftalık'})` : ''}</Label>
              <Input
                id="amount"
                type="number"
                min={currency === 'TRY' ? 100 : 10}
                step="0.01"
                placeholder="Tutar girin"
                value={donationAmount}
                onChange={(e) => { setDonationAmount(e.target.value); setDonationError(null); }}
                className="mt-2 h-12 text-lg"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {presetAmounts.map((a) => (
                  <button
                    key={a}
                    onClick={() => setDonationAmount(a.toString())}
                    className={`flex-1 min-w-[75px] py-2.5 px-1 text-sm font-medium border rounded-lg transition-colors ${donationAmount === a.toString()
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 hover:border-blue-300'
                      }`}
                  >
                    {currencySymbol}{a.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* PLATFORM SUPPORT (TIP) */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-gray-900 text-sm">FundEd&apos;e Platform Desteği</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Platform desteğiniz, FundEd&apos;in öğrenci doğrulama, güvenli ödeme altyapısı ve operasyon giderlerini karşılamasına yardımcı olur.
                Minimum oran <strong>%2</strong>&apos;dir.
              </p>

              {!useCustomTip ? (
                <div className="grid grid-cols-4 gap-2">
                  {[2, 5, 10, 15].map((p) => (
                    <button
                      key={p}
                      onClick={() => { setPlatformTipPercent(p); setUseCustomTip(false); }}
                      className={`py-2 text-sm font-medium border rounded-lg transition-colors ${platformTipPercent === p && !useCustomTip
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 hover:border-blue-300'
                        }`}
                    >
                      %{p}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">%</span>
                  <Input
                    type="number"
                    min="2"
                    step="1"
                    value={customTip}
                    onChange={(e) => setCustomTip(e.target.value)}
                    className="w-24 h-9"
                    placeholder="2"
                  />
                  <span className="text-xs text-gray-500">(min %2)</span>
                </div>
              )}

              <button
                onClick={() => {
                  setUseCustomTip(!useCustomTip);
                  if (!useCustomTip) setCustomTip(platformTipPercent.toString());
                }}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                {useCustomTip ? 'Hazır oranlardan seç' : 'Özel oran gir'}
              </button>

              {amount > 0 && (
                <div className="text-sm text-gray-700 bg-white rounded-lg px-3 py-2 border border-blue-100">
                  Öğrenciye: <strong>{currencySymbol}{amount.toFixed(2)}</strong>{currency === 'TRY' && <span className="text-xs text-gray-400"> (≈${Math.round(toUSD(amount))})</span>} · Platform desteği: <strong>{currencySymbol}{tipAmount.toFixed(2)}</strong> · Toplam: <strong>{currencySymbol}{totalCharge.toFixed(2)}</strong>{currency === 'TRY' && <span className="text-xs text-gray-400"> (≈${Math.round(toUSD(totalCharge))})</span>}
                </div>
              )}
            </div>

            {/* NOTE TO STUDENT */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                <Label htmlFor="note" className="text-sm font-semibold text-gray-900">Öğrenciye Not (İsteğe Bağlı)</Label>
              </div>
              <textarea
                id="note"
                rows={3}
                maxLength={500}
                value={noteToStudent}
                onChange={(e) => setNoteToStudent(e.target.value)}
                placeholder="Öğrenciye iletmek istediğiniz bir mesaj yazabilirsiniz…"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <div className="flex items-start gap-1.5 mt-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 leading-snug">
                  Lütfen notta telefon numarası, adres, TC kimlik gibi kişisel bilgiler paylaşmayın.
                  Kişisel bilgi içeren notlar filtrelenebilir.
                </p>
              </div>
              <p className="text-right text-[11px] text-gray-400 mt-0.5">{noteToStudent.length}/500</p>
            </div>

            {/* DONOR INFO */}
            {!session && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">Adınız</Label>
                  <Input id="name" type="text" placeholder="Ad Soyad" value={donorName} onChange={(e) => setDonorName(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="email">E-posta</Label>
                  <Input id="email" type="email" placeholder="ornek@email.com" value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} className="mt-1" />
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox id="anonymous" checked={isAnonymous} onCheckedChange={(c) => setIsAnonymous(c === true)} />
              <Label htmlFor="anonymous" className="text-sm">Anonim olarak bağış yap</Label>
            </div>

            {/* ERROR */}
            {donationError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {donationError}
              </div>
            )}

            {/* SUBMIT */}
            <Button
              className="w-full h-14 text-base font-semibold bg-blue-600 hover:bg-blue-700"
              onClick={handleDonate}
              disabled={processingPayment || amount <= 0}
            >
              {processingPayment ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> İşleniyor…</>
              ) : (
                <><Heart className="h-5 w-5 mr-2" /> {currencySymbol}{totalCharge > 0 ? totalCharge.toFixed(2) : '0'} Bağış Yap</>
              )}
            </Button>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 text-xs text-gray-400 pt-2">
              <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> Güvenli Ödeme</span>
              <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> iyzico Koruması</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function CampaignDonatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    }>
      <CampaignDonateContent />
    </Suspense>
  );
}
