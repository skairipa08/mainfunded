'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createDonation } from '@/lib/mockDb';
import { validateAmount, sanitizeInput, validateEmail } from '@/lib/validation';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n';
import {
  Heart,
  Shield,
  Lock,
  User,
  Mail,
  DollarSign,
  ArrowRight,
  CheckCircle,
  Sparkles,
  GraduationCap,
  Globe,
  TrendingUp,
  Gift,
} from 'lucide-react';

function DonatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    target: 'Support a verified student' as 'Support a verified student' | 'General education fund',
    donorName: '',
    donorEmail: '',
  });

  // Read URL params
  useEffect(() => {
    const amountParam = searchParams.get('amount');
    const campaignParam = searchParams.get('campaign');
    if (amountParam) {
      setFormData(prev => ({ ...prev, amount: amountParam }));
      const num = parseInt(amountParam);
      if ([10, 25, 50, 100, 250, 500].includes(num)) {
        setSelectedQuickAmount(num);
      }
    }
    if (campaignParam === 'education-equality') {
      setFormData(prev => ({ ...prev, target: 'General education fund' }));
    }
  }, [searchParams]);

  const handleQuickAmount = (amount: number) => {
    setSelectedQuickAmount(amount);
    setFormData({ ...formData, amount: amount.toString() });
    if (errors.amount) setErrors({ ...errors, amount: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading || submitted) {
      return;
    }

    const newErrors: Record<string, string> = {};
    const amount = parseFloat(formData.amount);
    const amountValidation = validateAmount(amount);

    if (!amountValidation.valid) {
      newErrors.amount = amountValidation.error || t('common.error');
    }

    if (formData.donorEmail && !validateEmail(formData.donorEmail)) {
      newErrors.donorEmail = t('donation.invalidEmail');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error(t('common.error'));
      return;
    }

    setLoading(true);
    setSubmitted(true);

    try {
      const donation = createDonation({
        amount,
        target: formData.target,
        donorName: formData.donorName ? sanitizeInput(formData.donorName) : undefined,
        donorEmail: formData.donorEmail ? formData.donorEmail.trim().toLowerCase() : undefined,
      });

      toast.success(t('donation.success'));

      setTimeout(() => {
        router.push(`/donor/dashboard?donation=${donation.id}`);
      }, 500);
    } catch (error) {
      console.error('Failed to process donation:', error);
      toast.error(t('donation.error'));
      setSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [10, 25, 50, 100, 250, 500];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      <main className="flex-grow">

        {/* Hero Banner */}
        <section className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }} />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 mb-6">
                <Heart className="h-4 w-4 text-pink-300" />
                <span className="text-sm text-white/90 font-medium">{t('donation.heroBadge')}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
                {t('donation.title')}
              </h1>
              <p className="text-lg text-blue-100/80 leading-relaxed max-w-xl mx-auto">
                {t('donation.heroSubtitle')}
              </p>
            </div>
          </div>

          {/* Wave separator */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 80L60 74.7C120 69 240 59 360 53.3C480 48 600 48 720 53.3C840 59 960 69 1080 69.3C1200 69 1320 59 1380 53.3L1440 48V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="#f8fafc" />
            </svg>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* ─── LEFT: Donation Form ─── */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">

                {/* Quick Amount Selection */}
                <div className="p-6 sm:p-8 border-b border-slate-100">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">{t('donation.amount')}</h2>
                      <p className="text-sm text-slate-400">{t('donation.amountSubtitle')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 mb-5">
                    {quickAmounts.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => handleQuickAmount(amount)}
                        className={`relative py-3.5 rounded-xl font-bold text-base transition-all duration-200 border-2 ${
                          selectedQuickAmount === amount
                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30 scale-[1.02]'
                            : 'bg-slate-50 text-slate-700 border-slate-100 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-lg">$</span>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="1"
                      max="1000000"
                      required
                      value={formData.amount}
                      onChange={(e) => {
                        setFormData({ ...formData, amount: e.target.value });
                        setSelectedQuickAmount(null);
                        if (errors.amount) setErrors({ ...errors, amount: '' });
                      }}
                      placeholder={t('donation.customPlaceholder')}
                      className={`pl-9 h-14 text-lg font-medium rounded-xl border-2 bg-slate-50 focus:bg-white transition-colors ${
                        errors.amount ? 'border-red-400 focus:border-red-500' : 'border-slate-100 focus:border-blue-500'
                      }`}
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-sm text-red-500 mt-2 flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-red-500 rounded-full" />
                      {errors.amount}
                    </p>
                  )}
                </div>

                {/* Form Fields */}
                <form onSubmit={handleSubmit}>
                  <div className="p-6 sm:p-8 space-y-6">

                    {/* Category */}
                    <div className="space-y-2">
                      <Label htmlFor="target" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Gift className="h-4 w-4 text-slate-400" />
                        {t('donation.category')}
                      </Label>
                      <Select
                        required
                        value={formData.target}
                        onValueChange={(value: 'Support a verified student' | 'General education fund') =>
                          setFormData({ ...formData, target: value })
                        }
                      >
                        <SelectTrigger id="target" className="h-12 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 transition-colors">
                          <SelectValue placeholder={t('donation.categoryPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Support a verified student">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-blue-500" />
                              <span>{t('donation.verifiedStudent')}</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="General education fund">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-emerald-500" />
                              <span>{t('donation.generalFund')}</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-100" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-3 text-xs text-slate-400 uppercase tracking-wider font-medium">{t('donation.optionalInfo')}</span>
                      </div>
                    </div>

                    {/* Donor Name */}
                    <div className="space-y-2">
                      <Label htmlFor="donorName" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        {t('donation.yourName')}
                        <span className="text-xs font-normal text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{t('donation.anonymousNote')}</span>
                      </Label>
                      <Input
                        id="donorName"
                        type="text"
                        value={formData.donorName}
                        onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                        placeholder={t('donation.namePlaceholder')}
                        className="h-12 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 transition-colors"
                      />
                    </div>

                    {/* Donor Email */}
                    <div className="space-y-2">
                      <Label htmlFor="donorEmail" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400" />
                        {t('donation.email')}
                        <span className="text-xs font-normal text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{t('donation.receiptNote')}</span>
                      </Label>
                      <Input
                        id="donorEmail"
                        type="email"
                        value={formData.donorEmail}
                        onChange={(e) => {
                          setFormData({ ...formData, donorEmail: e.target.value });
                          if (errors.donorEmail) setErrors({ ...errors, donorEmail: '' });
                        }}
                        placeholder={t('donation.emailPlaceholder')}
                        className={`h-12 rounded-xl border-2 bg-slate-50 focus:bg-white transition-colors ${
                          errors.donorEmail ? 'border-red-400 focus:border-red-500' : 'border-slate-100 focus:border-blue-500'
                        }`}
                      />
                      {errors.donorEmail && (
                        <p className="text-sm text-red-500 flex items-center gap-1.5">
                          <span className="w-1 h-1 bg-red-500 rounded-full" />
                          {errors.donorEmail}
                        </p>
                      )}
                    </div>

                    {/* Info box */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Shield className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-900 mb-1">{t('donation.secureTitle')}</p>
                          <p className="text-sm text-blue-700/70 leading-relaxed">
                            {t('donation.secureDesc')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="p-6 sm:p-8 bg-slate-50/50 border-t border-slate-100">
                    <Button
                      type="submit"
                      disabled={loading || submitted || !formData.amount}
                      className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-semibold text-lg shadow-xl shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:shadow-none"
                    >
                      {loading ? (
                        <div className="flex items-center gap-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                          {t('donation.processing')}
                        </div>
                      ) : submitted ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          {t('donation.completed')}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Heart className="h-5 w-5" />
                          {formData.amount ? `$${parseFloat(formData.amount).toLocaleString()} ${t('donation.submitDonateWithAmount')}` : t('donation.submitDonate')}
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      )}
                    </Button>
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <Lock className="h-3.5 w-3.5 text-slate-400" />
                      <p className="text-xs text-slate-400">{t('donation.securePayment')}</p>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* ─── RIGHT: Sidebar Info ─── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Impact Card */}
              <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 p-6 sm:p-7">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{t('donation.impactTitle')}</h3>
                </div>

                <div className="space-y-4">
                  {[
                    { amount: '$10', desc: t('donation.impact10'), icon: '📝' },
                    { amount: '$25', desc: t('donation.impact25'), icon: '🎒' },
                    { amount: '$50', desc: t('donation.impact50'), icon: '📚' },
                    { amount: '$100', desc: t('donation.impact100'), icon: '💻' },
                    { amount: '$250', desc: t('donation.impact250'), icon: '🎓' },
                    { amount: '$500', desc: t('donation.impact500'), icon: '🏫' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group cursor-default"
                    >
                      <div className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">{item.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-slate-900">{item.amount}</span>
                          <span className="text-xs text-slate-400">{t('donation.impactWith')}</span>
                        </div>
                        <p className="text-sm text-slate-500 leading-snug">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 p-6 sm:p-7">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5">{t('donation.trustTitle')}</h3>
                <div className="space-y-4">
                  {[
                    { icon: Shield, label: t('donation.trustVerified'), desc: t('donation.trustVerifiedDesc') },
                    { icon: TrendingUp, label: t('donation.trustTracking'), desc: t('donation.trustTrackingDesc') },
                    { icon: Lock, label: t('donation.trustSecure'), desc: t('donation.trustSecureDesc') },
                    { icon: CheckCircle, label: t('donation.trustTransparent'), desc: t('donation.trustTransparentDesc') },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="h-4.5 w-4.5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                          <p className="text-xs text-slate-400">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Education Equality CTA */}
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 sm:p-7 text-white shadow-lg shadow-orange-500/20">
                <Globe className="h-8 w-8 text-white/80 mb-3" />
                <h3 className="text-lg font-bold mb-2">{t('donation.equalityCampaign')}</h3>
                <p className="text-sm text-white/70 leading-relaxed mb-5">
                  {t('donation.equalityDesc')}
                </p>
                <Button
                  onClick={() => router.push('/education-equality')}
                  className="w-full bg-white text-orange-600 hover:bg-white/90 font-semibold rounded-xl h-11"
                >
                  {t('donation.viewCampaign')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function DonatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin mx-auto border-4 border-slate-200 border-t-blue-600 rounded-full mb-4" />
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    }>
      <DonatePageContent />
    </Suspense>
  );
}
