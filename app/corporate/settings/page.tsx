'use client';

import React, { useState, useRef } from 'react';
import {
    Building2,
    Users,
    Bell,
    Shield,
    Key,
    Mail,
    Save,
    Upload,
    X,
    Eye,
    EyeOff,
    Smartphone,
    Check,
    Copy,
    UserPlus,
    CreditCard,
    Crown,
    Zap,
    Rocket,
    Calendar,
    TrendingUp,
    AlertTriangle,
    ChevronRight,
    BarChart3,
    FileText,
    Download,
    RefreshCw,
    ArrowUpRight,
    CheckCircle,
    Clock,
    Receipt,
    Sparkles,
} from 'lucide-react';
import CorporateHeader from '@/components/corporate/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { mockCorporateAccount, mockCorporateUser } from '@/lib/corporate/mock-data';
import { useTranslation } from '@/lib/i18n/context';
import { useCorporateAuth } from '@/lib/corporate/auth';

// Subscription tier data
const subscriptionTiers = {
    starter: {
        name: 'Starter',
        price: 99,
        icon: Rocket,
        color: 'from-slate-500 to-slate-700',
        badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
        accentColor: 'text-slate-600',
        ringColor: 'ring-slate-200',
        seats: 1,
        campaigns: 10,
        reportFrequency: '3 ayda 1',
        features: [
            'Kurumsal Impact Dashboard',
            'Donation Trace View (temel)',
            'KPI Snapshot (temel)',
            '3 ayda 1 Impact Summary (PDF)',
            'Temel CSV Export',
            '1 Kullanıcı',
            'Standart e-posta destek',
            'Aynı anda 10 kampanya',
        ],
    },
    growth: {
        name: 'Growth / Pro',
        price: 199,
        icon: Zap,
        color: 'from-blue-500 to-indigo-600',
        badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
        accentColor: 'text-blue-600',
        ringColor: 'ring-blue-200',
        seats: 5,
        campaigns: 50,
        reportFrequency: 'Aylık',
        features: [
            'Starter paketindeki her şey +',
            'Aylık Impact Report (PDF)',
            'Before/After trend grafikleri',
            'Evidence Vault (gelişmiş)',
            'Custom Report Template',
            'Kampanya sapma & gecikme alertleri',
            'Gelişmiş CSV + Audit Log Export',
            '5 Kullanıcı',
            'Öncelikli destek (SLA-lite)',
            'Aynı anda 50 kampanya',
        ],
    },
    enterprise: {
        name: 'Enterprise',
        price: 499,
        icon: Crown,
        color: 'from-amber-500 to-amber-700',
        badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
        accentColor: 'text-amber-600',
        ringColor: 'ring-amber-200',
        seats: 20,
        campaigns: 999,
        reportFrequency: 'Aylık + Talep üzerine',
        features: [
            'Pro paketindeki her şey +',
            'Audit-Ready Pack (denetim paketi)',
            'SSO / SAML entegrasyonu',
            'Rol bazlı yetki (finance/ESG/admin)',
            'API & Webhooks erişimi',
            'Custom Verification Workflow',
            'Gelişmiş data retention & compliance',
            '20 Kullanıcı',
            'Dedicated success manager',
            'Aylık review call',
            'Sınırsız kampanya',
        ],
    },
    pending: {
        name: 'Beklemede',
        price: 0,
        icon: Clock,
        color: 'from-gray-400 to-gray-500',
        badgeColor: 'bg-gray-100 text-gray-600 border-gray-200',
        accentColor: 'text-gray-500',
        ringColor: 'ring-gray-200',
        seats: 0,
        campaigns: 0,
        reportFrequency: '-',
        features: ['Başvuru onayı bekleniyor'],
    },
};

// Mock billing history
const mockBillingHistory = [
    { id: 'inv_001', date: '2026-02-01', amount: 499, status: 'paid' as const, description: 'Enterprise — Şubat 2026' },
    { id: 'inv_002', date: '2026-01-01', amount: 499, status: 'paid' as const, description: 'Enterprise — Ocak 2026' },
    { id: 'inv_003', date: '2025-12-01', amount: 499, status: 'paid' as const, description: 'Enterprise — Aralık 2025' },
    { id: 'inv_004', date: '2025-11-01', amount: 199, status: 'paid' as const, description: 'Growth/Pro — Kasım 2025' },
    { id: 'inv_005', date: '2025-10-01', amount: 199, status: 'paid' as const, description: 'Growth/Pro — Ekim 2025' },
];

export default function SettingsPage() {
    const { t } = useTranslation();
    const { user } = useCorporateAuth();
    const [companyName, setCompanyName] = useState(mockCorporateAccount.company_name);
    const [userName, setUserName] = useState(mockCorporateUser.name);
    const [userEmail, setUserEmail] = useState(mockCorporateUser.email);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    // Logo upload state
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Modal states
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showBillingHistory, setShowBillingHistory] = useState(false);

    // Form states
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('viewer');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [qrCodeCopied, setQrCodeCopied] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelConfirmText, setCancelConfirmText] = useState('');

    // Get current tier info
    const currentTierKey = (user?.tier || 'enterprise') as keyof typeof subscriptionTiers;
    const currentTier = subscriptionTiers[currentTierKey];
    const TierIcon = currentTier.icon;

    // Mock usage data
    const usageData = {
        seatsUsed: 3,
        seatsTotal: currentTier.seats,
        campaignsActive: 2,
        campaignsTotal: currentTier.campaigns,
        reportsGenerated: 4,
        reportsLimit: currentTierKey === 'enterprise' ? 999 : currentTierKey === 'growth' ? 12 : 4,
        storageUsed: 1.2, // GB
        storageTotal: currentTierKey === 'enterprise' ? 50 : currentTierKey === 'growth' ? 10 : 2,
    };

    const teamMembers = [
        { name: 'Ahmet Yilmaz', email: 'admin@techventures.com', role: 'payment_admin' },
        { name: 'Zeynep Kara', email: 'zeynep@techventures.com', role: 'editor' },
        { name: 'Mehmet Demir', email: 'mehmet@techventures.com', role: 'viewer' },
    ];

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'payment_admin':
                return <Badge className="bg-purple-100 text-purple-700">{t('corporate.settings.paymentAdmin')}</Badge>;
            case 'editor':
                return <Badge className="bg-blue-100 text-blue-700">{t('corporate.settings.editor')}</Badge>;
            case 'viewer':
                return <Badge className="bg-gray-100 text-gray-700">{t('corporate.settings.viewer')}</Badge>;
            default:
                return null;
        }
    };

    // Logo upload handler
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert(t('corporate.settings.fileSizeError'));
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Invite handler
    const handleInvite = () => {
        if (!inviteEmail) {
            alert(t('corporate.settings.enterEmail'));
            return;
        }
        alert(`${inviteEmail} ${t('corporate.settings.inviteSent')} ${inviteRole}`);
        setShowInviteModal(false);
        setInviteEmail('');
    };

    // Password change handler
    const handlePasswordChange = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert(t('corporate.settings.fillAllFields'));
            return;
        }
        if (newPassword !== confirmPassword) {
            alert(t('corporate.settings.passwordsNotMatch'));
            return;
        }
        if (newPassword.length < 8) {
            alert(t('corporate.settings.passwordMinLength'));
            return;
        }
        alert(t('corporate.settings.passwordChanged'));
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    // 2FA handler
    const handle2FAEnable = () => {
        setTwoFactorEnabled(true);
        setShow2FAModal(false);
        alert(t('corporate.settings.twoFAEnabled'));
    };

    const copySecretKey = () => {
        navigator.clipboard.writeText('JBSWY3DPEHPK3PXP');
        setQrCodeCopied(true);
        setTimeout(() => setQrCodeCopied(false), 2000);
    };

    return (
        <div className="min-h-screen">
            <CorporateHeader
                title={t('corporate.settings.title')}
                subtitle={t('corporate.settings.subtitle')}
            />

            <div className="p-6 max-w-4xl">
                {/* Company Settings */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        {t('corporate.settings.companyInfo')}
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-6">
                            <div
                                className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <Building2 className="h-10 w-10 text-blue-600" />
                                )}
                            </div>
                            <div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleLogoUpload}
                                    accept="image/png,image/jpeg"
                                    className="hidden"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    {t('corporate.settings.uploadLogo')}
                                </Button>
                                <p className="text-xs text-gray-500 mt-1">{t('corporate.settings.logoFormat')}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>{t('corporate.settings.companyName')}</Label>
                                <Input
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label>{t('corporate.settings.subscription')}</Label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Badge className="bg-purple-100 text-purple-700 text-sm py-1">
                                        Enterprise
                                    </Badge>
                                    <span className="text-sm text-gray-500">{t('corporate.settings.allFeaturesActive')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════ */}
                {/* SUBSCRIPTION MANAGEMENT SECTION */}
                {/* ═══════════════════════════════════════════════════════ */}

                {/* Active Subscription Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
                    {/* Gradient Header */}
                    <div className={`bg-gradient-to-r ${currentTier.color} p-6 text-white relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-20 -translate-x-20" />
                        <div className="relative z-10">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                        <TierIcon className="h-7 w-7 text-white" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-bold">{currentTier.name}</h3>
                                            <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                                                Aktif
                                            </span>
                                        </div>
                                        <p className="text-white/80 text-sm mt-1">
                                            Kurumsal abonelik planınız
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold">${currentTier.price}</div>
                                    <div className="text-white/70 text-sm">/ay</div>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-6 text-sm text-white/80">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4" />
                                    <span>Sonraki ödeme: 1 Mart 2026</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <CreditCard className="h-4 w-4" />
                                    <span>•••• 4242</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <RefreshCw className="h-4 w-4" />
                                    <span>Otomatik yenileme aktif</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Usage Overview */}
                    <div className="p-6">
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Kullanım Durumu</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Seats */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <Users className="h-4 w-4 text-blue-500" />
                                    <span className="text-xs font-medium text-gray-400">Koltuk</span>
                                </div>
                                <div className="flex items-end gap-1">
                                    <span className="text-2xl font-bold text-gray-900">{usageData.seatsUsed}</span>
                                    <span className="text-sm text-gray-400 mb-0.5">/ {usageData.seatsTotal === 20 ? '20' : usageData.seatsTotal}</span>
                                </div>
                                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min((usageData.seatsUsed / usageData.seatsTotal) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Campaigns */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <BarChart3 className="h-4 w-4 text-emerald-500" />
                                    <span className="text-xs font-medium text-gray-400">Kampanya</span>
                                </div>
                                <div className="flex items-end gap-1">
                                    <span className="text-2xl font-bold text-gray-900">{usageData.campaignsActive}</span>
                                    <span className="text-sm text-gray-400 mb-0.5">/ {usageData.campaignsTotal >= 999 ? '∞' : usageData.campaignsTotal}</span>
                                </div>
                                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min((usageData.campaignsActive / usageData.campaignsTotal) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Reports */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <FileText className="h-4 w-4 text-purple-500" />
                                    <span className="text-xs font-medium text-gray-400">Rapor</span>
                                </div>
                                <div className="flex items-end gap-1">
                                    <span className="text-2xl font-bold text-gray-900">{usageData.reportsGenerated}</span>
                                    <span className="text-sm text-gray-400 mb-0.5">/ {usageData.reportsLimit >= 999 ? '∞' : usageData.reportsLimit}</span>
                                </div>
                                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-purple-500 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min((usageData.reportsGenerated / usageData.reportsLimit) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Storage */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <Download className="h-4 w-4 text-orange-500" />
                                    <span className="text-xs font-medium text-gray-400">Depolama</span>
                                </div>
                                <div className="flex items-end gap-1">
                                    <span className="text-2xl font-bold text-gray-900">{usageData.storageUsed}</span>
                                    <span className="text-sm text-gray-400 mb-0.5">/ {usageData.storageTotal} GB</span>
                                </div>
                                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-orange-500 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min((usageData.storageUsed / usageData.storageTotal) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Plan Features */}
                    <div className="px-6 pb-6">
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Dahil Özellikler</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {currentTier.features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                    <CheckCircle className={`h-4 w-4 flex-shrink-0 ${currentTier.accentColor}`} />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="px-6 pb-6 flex flex-wrap gap-3">
                        {currentTierKey !== 'enterprise' && (
                            <Button
                                onClick={() => setShowUpgradeModal(true)}
                                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
                            >
                                <ArrowUpRight className="h-4 w-4" />
                                Planı Yükselt
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => setShowBillingHistory(!showBillingHistory)}
                        >
                            <Receipt className="h-4 w-4" />
                            Fatura Geçmişi
                        </Button>
                        <Button
                            variant="outline"
                            className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            onClick={() => setShowCancelModal(true)}
                        >
                            <X className="h-4 w-4" />
                            Aboneliği İptal Et
                        </Button>
                    </div>

                    {/* Billing History (Expandable) */}
                    {showBillingHistory && (
                        <div className="border-t border-gray-100 px-6 py-4">
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Fatura Geçmişi</h4>
                            <div className="space-y-3">
                                {mockBillingHistory.map((invoice) => (
                                    <div
                                        key={invoice.id}
                                        className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                                                <Receipt className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">{invoice.description}</p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(invoice.date).toLocaleDateString('tr-TR', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge
                                                className={
                                                    invoice.status === 'paid'
                                                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                                        : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                }
                                            >
                                                {invoice.status === 'paid' ? 'Ödendi' : 'Beklemede'}
                                            </Badge>
                                            <span className="font-semibold text-gray-900">${invoice.amount}</span>
                                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 text-center">
                                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 gap-1">
                                    Tüm faturaları görüntüle
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Subscription Quick Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Billing Cycle */}
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Fatura Dönemi</p>
                                <p className="font-semibold text-gray-900">Aylık</p>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500">
                            Sonraki yenileme: <span className="font-medium text-gray-700">1 Mart 2026</span>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                                <CreditCard className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Ödeme Yöntemi</p>
                                <p className="font-semibold text-gray-900">Visa •••• 4242</p>
                            </div>
                        </div>
                        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
                            Kartı Değiştir →
                        </button>
                    </div>

                    {/* Total Spent */}
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Toplam Harcama</p>
                                <p className="font-semibold text-gray-900">$2.395</p>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500">
                            Üyelik başlangıcı: <span className="font-medium text-gray-700">Ekim 2025</span>
                        </div>
                    </div>
                </div>

                {/* Compare & Upgrade Notice (only for non-enterprise) */}
                {currentTierKey !== 'enterprise' && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-100 mb-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Sparkles className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">Daha fazla özellik mi istiyorsunuz?</h4>
                                <p className="text-sm text-gray-600 mb-3">
                                    {currentTierKey === 'starter'
                                        ? 'Growth/Pro planına yükselterek aylık raporlar, gelişmiş kanıt yönetimi ve 5 kullanıcı hakkı elde edin.'
                                        : 'Enterprise planına yükselterek denetim paketi, SSO, API erişimi ve sınırsız kampanya hakkı elde edin.'
                                    }
                                </p>
                                <Button
                                    onClick={() => setShowUpgradeModal(true)}
                                    size="sm"
                                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <ArrowUpRight className="h-4 w-4" />
                                    Planları Karşılaştır
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════ */}
                {/* END SUBSCRIPTION MANAGEMENT SECTION */}
                {/* ═══════════════════════════════════════════════════════ */}

                {/* Profile Settings */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {t('corporate.settings.profileSettings')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>{t('corporate.settings.fullName')}</Label>
                            <Input
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>{t('corporate.settings.email')}</Label>
                            <Input
                                type="email"
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                    </div>
                </div>

                {/* Team Members */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            {t('corporate.settings.teamMembers')}
                        </h3>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowInviteModal(true)}
                        >
                            <UserPlus className="h-4 w-4 mr-2" />
                            {t('corporate.settings.inviteMember')}
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {teamMembers.map((member) => (
                            <div
                                key={member.email}
                                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                                        {member.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{member.name}</p>
                                        <p className="text-sm text-gray-500">{member.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {getRoleBadge(member.role)}
                                    <Select defaultValue={member.role}>
                                        <SelectTrigger className="w-36">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="viewer">{t('corporate.settings.viewer')}</SelectItem>
                                            <SelectItem value="editor">{t('corporate.settings.editor')}</SelectItem>
                                            <SelectItem value="payment_admin">{t('corporate.settings.paymentAdmin')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        {t('corporate.settings.security')}
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <Key className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="font-medium text-gray-900">{t('corporate.settings.changePassword')}</p>
                                    <p className="text-sm text-gray-500">{t('corporate.settings.lastChanged')}</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowPasswordModal(true)}
                            >
                                {t('corporate.settings.change')}
                            </Button>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                                <Smartphone className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="font-medium text-gray-900">{t('corporate.settings.twoFactorAuth')}</p>
                                    <p className="text-sm text-gray-500">{t('corporate.settings.extraSecurity')}</p>
                                </div>
                            </div>
                            <Button
                                variant={twoFactorEnabled ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => twoFactorEnabled ? setTwoFactorEnabled(false) : setShow2FAModal(true)}
                            >
                                {twoFactorEnabled ? (
                                    <>
                                        <Check className="h-4 w-4 mr-1" />
                                        {t('corporate.settings.active')}
                                    </>
                                ) : t('corporate.settings.enable')}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Notification Preferences */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        {t('corporate.settings.notificationPrefs')}
                    </h3>
                    <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <Checkbox defaultChecked />
                            <div>
                                <p className="font-medium text-gray-900">{t('corporate.settings.studentUpdates')}</p>
                                <p className="text-sm text-gray-500">{t('corporate.settings.studentUpdatesDesc')}</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <Checkbox defaultChecked />
                            <div>
                                <p className="font-medium text-gray-900">{t('corporate.settings.thankYouMessages')}</p>
                                <p className="text-sm text-gray-500">{t('corporate.settings.thankYouMessagesDesc')}</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <Checkbox defaultChecked />
                            <div>
                                <p className="font-medium text-gray-900">{t('corporate.settings.newCampaigns')}</p>
                                <p className="text-sm text-gray-500">{t('corporate.settings.newCampaignsDesc')}</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <Checkbox />
                            <div>
                                <p className="font-medium text-gray-900">{t('corporate.settings.monthlySummary')}</p>
                                <p className="text-sm text-gray-500">{t('corporate.settings.monthlySummaryDesc')}</p>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button size="lg" className="gap-2">
                        <Save className="h-5 w-5" />
                        {t('corporate.settings.saveChanges')}
                    </Button>
                </div>
            </div>

            {/* Invite Member Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowInviteModal(false)} />
                    <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Mail className="h-5 w-5 text-blue-600" />
                                {t('corporate.settings.inviteMember')}
                            </h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowInviteModal(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            {t('corporate.settings.inviteDesc')}
                        </p>
                        <div className="space-y-4">
                            <div>
                                <Label>{t('corporate.settings.emailAddress')}</Label>
                                <Input
                                    type="email"
                                    placeholder={t('corporate.settings.emailPlaceholder')}
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label>{t('corporate.settings.role')}</Label>
                                <Select value={inviteRole} onValueChange={setInviteRole}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="viewer">{t('corporate.settings.viewerDesc')}</SelectItem>
                                        <SelectItem value="editor">{t('corporate.settings.editorDesc')}</SelectItem>
                                        <SelectItem value="payment_admin">{t('corporate.settings.paymentAdminDesc')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button variant="outline" className="flex-1" onClick={() => setShowInviteModal(false)}>
                                {t('corporate.settings.cancel')}
                            </Button>
                            <Button className="flex-1 gap-2" onClick={handleInvite}>
                                <Mail className="h-4 w-4" />
                                {t('corporate.settings.sendInvite')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowPasswordModal(false)} />
                    <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Key className="h-5 w-5 text-blue-600" />
                                {t('corporate.settings.changePassword')}
                            </h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowPasswordModal(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <Label>{t('corporate.settings.currentPassword')}</Label>
                                <div className="relative mt-1">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <Label>{t('corporate.settings.newPassword')}</Label>
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="mt-1"
                                />
                                <p className="text-xs text-gray-500 mt-1">{t('corporate.settings.minChars')}</p>
                            </div>
                            <div>
                                <Label>{t('corporate.settings.confirmPassword')}</Label>
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button variant="outline" className="flex-1" onClick={() => setShowPasswordModal(false)}>
                                {t('corporate.settings.cancel')}
                            </Button>
                            <Button className="flex-1" onClick={handlePasswordChange}>
                                {t('corporate.settings.changePasswordBtn')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* 2FA Setup Modal */}
            {show2FAModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShow2FAModal(false)} />
                    <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Smartphone className="h-5 w-5 text-blue-600" />
                                {t('corporate.settings.twoFASetup')}
                            </h3>
                            <Button variant="ghost" size="icon" onClick={() => setShow2FAModal(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="text-center mb-6">
                            <div className="w-48 h-48 bg-gray-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                                <div className="text-center">
                                    <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-xs text-gray-500">{t('corporate.settings.qrCode')}</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                {t('corporate.settings.scanQR')}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <Label className="text-xs text-gray-500">{t('corporate.settings.secretKey')}</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <code className="flex-1 bg-white px-3 py-2 rounded border text-sm font-mono">
                                    JBSWY3DPEHPK3PXP
                                </code>
                                <Button variant="outline" size="icon" onClick={copySecretKey}>
                                    {qrCodeCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setShow2FAModal(false)}>
                                {t('corporate.settings.cancel')}
                            </Button>
                            <Button className="flex-1" onClick={handle2FAEnable}>
                                {t('corporate.settings.enable')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════ Upgrade Plan Modal ═══════ */}
            {showUpgradeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowUpgradeModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-blue-600" />
                                    Planı Yükselt
                                </h3>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Mevcut planınız: <span className="font-semibold">{currentTier.name}</span>
                                </p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setShowUpgradeModal(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Plan Comparison */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {Object.entries(subscriptionTiers)
                                    .filter(([key]) => key !== 'pending')
                                    .map(([key, tier]) => {
                                        const isCurrentPlan = key === currentTierKey;
                                        const isUpgrade = ['starter', 'growth', 'enterprise'].indexOf(key) > ['starter', 'growth', 'enterprise'].indexOf(currentTierKey);
                                        const PlanIcon = tier.icon;
                                        return (
                                            <div
                                                key={key}
                                                className={`relative rounded-xl border-2 p-5 transition-all ${
                                                    isCurrentPlan
                                                        ? `${tier.ringColor} ring-2 border-transparent bg-gray-50`
                                                        : isUpgrade
                                                        ? 'border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer'
                                                        : 'border-gray-100 opacity-60'
                                                }`}
                                            >
                                                {isCurrentPlan && (
                                                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded-full">
                                                        Mevcut Plan
                                                    </div>
                                                )}
                                                {key === 'growth' && !isCurrentPlan && (
                                                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-emerald-500 text-white text-xs font-semibold rounded-full">
                                                        Popüler
                                                    </div>
                                                )}
                                                <div className="text-center mb-4">
                                                    <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-3`}>
                                                        <PlanIcon className="h-6 w-6 text-white" />
                                                    </div>
                                                    <h4 className="font-bold text-gray-900">{tier.name}</h4>
                                                    <div className="mt-2">
                                                        <span className="text-3xl font-bold text-gray-900">${tier.price}</span>
                                                        <span className="text-gray-500 text-sm">/ay</span>
                                                    </div>
                                                </div>

                                                <ul className="space-y-2 mb-5">
                                                    {tier.features.slice(0, 6).map((feature, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                                                            <Check className={`h-3.5 w-3.5 flex-shrink-0 mt-0.5 ${tier.accentColor}`} />
                                                            <span>{feature}</span>
                                                        </li>
                                                    ))}
                                                    {tier.features.length > 6 && (
                                                        <li className="text-xs text-gray-400 pl-5">
                                                            +{tier.features.length - 6} daha fazla özellik
                                                        </li>
                                                    )}
                                                </ul>

                                                {isCurrentPlan ? (
                                                    <Button disabled className="w-full" variant="outline">
                                                        Mevcut Planınız
                                                    </Button>
                                                ) : isUpgrade ? (
                                                    <Button
                                                        className={`w-full gap-2 bg-gradient-to-r ${tier.color} text-white hover:opacity-90`}
                                                        onClick={() => {
                                                            alert(`${tier.name} planına yükseltme talebi gönderildi!`);
                                                            setShowUpgradeModal(false);
                                                        }}
                                                    >
                                                        <ArrowUpRight className="h-4 w-4" />
                                                        Yükselt
                                                    </Button>
                                                ) : (
                                                    <Button disabled className="w-full" variant="outline">
                                                        Düşürme
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>

                            {/* Upgrade Info */}
                            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                                <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-medium mb-1">Yükseltme Bilgileri</p>
                                    <ul className="list-disc list-inside space-y-1 text-blue-700 text-xs">
                                        <li>Plan yükseltmeleri anında devreye girer.</li>
                                        <li>Mevcut dönem için kalan süre oranlanarak fark hesaplanır.</li>
                                        <li>Tüm verileriniz ve ayarlarınız korunur.</li>
                                        <li>30 gün içinde eski plana geri dönebilirsiniz.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════ Cancel Subscription Modal ═══════ */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCancelModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                Aboneliği İptal Et
                            </h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowCancelModal(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
                            <p className="text-sm text-red-800 font-medium mb-2">
                                Dikkat! Aboneliğinizi iptal ederseniz:
                            </p>
                            <ul className="text-xs text-red-700 space-y-1.5 list-disc list-inside">
                                <li>Mevcut fatura döneminizin sonunda erişiminiz kapanır.</li>
                                <li>Tüm kampanyalarınız ve raporlarınız dondurulur.</li>
                                <li>Ekip üyelerinizin erişimi kaldırılır.</li>
                                <li>Verileriniz 30 gün boyunca saklanır, ardından silinir.</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm text-gray-700">İptal nedeniniz nedir?</Label>
                                <Select value={cancelReason} onValueChange={setCancelReason}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Lütfen bir neden seçin..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="too_expensive">Çok pahalı</SelectItem>
                                        <SelectItem value="not_using">Yeterince kullanmıyoruz</SelectItem>
                                        <SelectItem value="missing_features">İstediğimiz özellikler eksik</SelectItem>
                                        <SelectItem value="switching">Başka bir platform tercih ediyoruz</SelectItem>
                                        <SelectItem value="temporary">Geçici olarak duraklatmak istiyoruz</SelectItem>
                                        <SelectItem value="other">Diğer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="text-sm text-gray-700">
                                    Onaylamak için <span className="font-mono font-bold text-red-600">&quot;İPTAL ET&quot;</span> yazın
                                </Label>
                                <Input
                                    value={cancelConfirmText}
                                    onChange={(e) => setCancelConfirmText(e.target.value)}
                                    placeholder="İPTAL ET"
                                    className="mt-1 border-red-200 focus:border-red-400 focus:ring-red-200"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setCancelReason('');
                                    setCancelConfirmText('');
                                }}
                            >
                                Vazgeç
                            </Button>
                            <Button
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                disabled={cancelConfirmText !== 'İPTAL ET' || !cancelReason}
                                onClick={() => {
                                    alert('Abonelik iptal talebi gönderildi. Dönem sonuna kadar erişiminiz devam edecektir.');
                                    setShowCancelModal(false);
                                    setCancelReason('');
                                    setCancelConfirmText('');
                                }}
                            >
                                Aboneliği İptal Et
                            </Button>
                        </div>

                        {cancelReason === 'too_expensive' && (
                            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
                                <p className="text-sm text-blue-800 font-medium flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    Özel teklif!
                                </p>
                                <p className="text-xs text-blue-700 mt-1">
                                    Sizi kaybetmek istemeyiz! Sonraki 3 ay %30 indirimli devam edebilirsiniz.
                                </p>
                                <Button
                                    size="sm"
                                    className="mt-3 bg-blue-600 hover:bg-blue-700 text-white gap-1"
                                    onClick={() => {
                                        alert('%30 indirim uygulandı! Sonraki 3 ay indirimli fiyattan devam edeceksiniz.');
                                        setShowCancelModal(false);
                                        setCancelReason('');
                                        setCancelConfirmText('');
                                    }}
                                >
                                    <Check className="h-3 w-3" />
                                    İndirimi Kabul Et
                                </Button>
                            </div>
                        )}

                        {cancelReason === 'temporary' && (
                            <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-4">
                                <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Aboneliği duraklatın!
                                </p>
                                <p className="text-xs text-amber-700 mt-1">
                                    İptal yerine aboneliğinizi 3 aya kadar duraklatabilirsiniz. Verileriniz korunur.
                                </p>
                                <Button
                                    size="sm"
                                    className="mt-3 bg-amber-600 hover:bg-amber-700 text-white gap-1"
                                    onClick={() => {
                                        alert('Abonelik 3 ay süreyle duraklatıldı.');
                                        setShowCancelModal(false);
                                        setCancelReason('');
                                        setCancelConfirmText('');
                                    }}
                                >
                                    <Clock className="h-3 w-3" />
                                    Duraklat
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
