'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Building2,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    User,
    Phone,
    Shield,
    BarChart3,
    FileText,
    Users,
    Zap,
    Crown,
    Rocket,
    Check,
    ChevronDown,
    Star,
    Globe,
    ArrowLeft,
    Tag,
    Loader2,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCorporateAuth, type RegisterData } from '@/lib/corporate/auth';

type TabType = 'login' | 'register' | 'pricing';
type SelectedTier = 'starter' | 'growth' | 'enterprise' | null;

const tiers = [
    {
        id: 'starter' as const,
        name: 'Starter',
        price: 99,
        icon: Rocket,
        color: 'from-slate-600 to-slate-800',
        borderColor: 'border-slate-300',
        accentColor: 'text-slate-700',
        bgAccent: 'bg-slate-50',
        buttonClass: 'bg-slate-800 hover:bg-slate-700 text-white',
        tagline: 'Küçük/orta firma için ideal başlangıç',
        features: [
            'Kurumsal Impact Dashboard',
            'Donation Trace View (temel)',
            'KPI Snapshot (temel metriks)',
            '3 ayda 1 Impact Summary (PDF)',
            'Temel CSV Export',
            '1 Kullanıcı',
            'Standart e-posta destek',
            'Aynı anda 10 kampanya',
        ],
    },
    {
        id: 'growth' as const,
        name: 'Growth / Pro',
        price: 199,
        icon: Zap,
        color: 'from-blue-600 to-indigo-700',
        borderColor: 'border-blue-400',
        accentColor: 'text-blue-700',
        bgAccent: 'bg-blue-50',
        buttonClass: 'bg-blue-700 hover:bg-blue-600 text-white',
        tagline: 'ESG/CSR odaklı ekipler için',
        popular: true,
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
    {
        id: 'enterprise' as const,
        name: 'Enterprise',
        price: 499,
        icon: Crown,
        color: 'from-amber-600 to-amber-800',
        borderColor: 'border-amber-400',
        accentColor: 'text-amber-700',
        bgAccent: 'bg-amber-50',
        buttonClass: 'bg-amber-700 hover:bg-amber-600 text-white',
        tagline: 'Büyük kurumlar & denetim ihtiyacı',
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
];

export default function CorporateGatewayPage() {
    const router = useRouter();
    const { login, register, isAuthenticated, isLoading } = useCorporateAuth();

    const [activeTab, setActiveTab] = useState<TabType>('login');
    const [selectedTier, setSelectedTier] = useState<SelectedTier>(null);

    // Login state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState('');

    // Register state
    const [regCompany, setRegCompany] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regFirstName, setRegFirstName] = useState('');
    const [regLastName, setRegLastName] = useState('');
    const [regPhone, setRegPhone] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
    const [showRegPassword, setShowRegPassword] = useState(false);
    const [regLoading, setRegLoading] = useState(false);
    const [regError, setRegError] = useState('');
    const [regSuccess, setRegSuccess] = useState(false);

    // Discount code state
    const [discountCode, setDiscountCode] = useState('');
    const [discountStatus, setDiscountStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
    const [discountPercent, setDiscountPercent] = useState(0);
    const [discountMessage, setDiscountMessage] = useState('');

    // Mock discount codes
    const DISCOUNT_CODES: Record<string, { percent: number; message: string }> = {
        'FUNDED10': { percent: 10, message: '%10 indirim uygulandı!' },
        'EGITIM20': { percent: 20, message: '%20 indirim uygulandı!' },
        'WELCOME25': { percent: 25, message: '%25 hoş geldin indirimi!' },
        'STARTUP30': { percent: 30, message: '%30 startup indirimi!' },
        'ENTERPRISE50': { percent: 50, message: '%50 özel kurumsal indirim!' },
    };

    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) return;

        setDiscountStatus('checking');
        // Simulate API check
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const code = discountCode.trim().toUpperCase();
        const found = DISCOUNT_CODES[code];

        if (found) {
            setDiscountStatus('valid');
            setDiscountPercent(found.percent);
            setDiscountMessage(found.message);
        } else {
            setDiscountStatus('invalid');
            setDiscountPercent(0);
            setDiscountMessage('Geçersiz indirim kodu.');
        }
    };

    const handleClearDiscount = () => {
        setDiscountCode('');
        setDiscountStatus('idle');
        setDiscountPercent(0);
        setDiscountMessage('');
    };

    const getDiscountedPrice = (price: number) => {
        if (discountStatus === 'valid' && discountPercent > 0) {
            return Math.round(price * (1 - discountPercent / 100));
        }
        return price;
    };

    // Redirect if already authenticated
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push('/corporate');
        }
    }, [isAuthenticated, isLoading, router]);

    // Handle pricing tier selection
    const handleSelectTier = (tierId: SelectedTier) => {
        setSelectedTier(tierId);
        setActiveTab('register');
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle login
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginLoading(true);
        setLoginError('');

        const result = await login(loginEmail, loginPassword);

        if (result.success) {
            router.push('/corporate');
        } else {
            setLoginError(result.error || 'Giriş başarısız.');
            setLoginLoading(false);
        }
    };

    // Handle register
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegLoading(true);
        setRegError('');

        if (regPassword !== regPasswordConfirm) {
            setRegError('Şifreler eşleşmiyor.');
            setRegLoading(false);
            return;
        }

        if (regPassword.length < 6) {
            setRegError('Şifre en az 6 karakter olmalıdır.');
            setRegLoading(false);
            return;
        }

        const data: RegisterData = {
            companyName: regCompany,
            email: regEmail,
            firstName: regFirstName,
            lastName: regLastName,
            phone: regPhone || undefined,
            password: regPassword,
            tier: selectedTier || 'pending',
        };

        const result = await register(data);

        if (result.success) {
            setRegSuccess(true);
            setTimeout(() => {
                router.push('/corporate');
            }, 1500);
        } else {
            setRegError(result.error || 'Kayıt başarısız.');
            setRegLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
                <div className="text-center">
                    <div className="h-10 w-10 animate-spin mx-auto border-4 border-slate-600 border-t-white rounded-full mb-4" />
                    <p className="text-slate-400 text-sm">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0f1e] relative overflow-hidden">
            {/* Ambient background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px]" />
                <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-indigo-900/15 rounded-full blur-[100px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-slate-800/10 rounded-full blur-[80px]" />
            </div>

            {/* Subtle grid pattern overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px',
                }}
            />

            {/* Top Navigation Bar */}
            <nav className="relative z-10 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-shadow">
                            <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight">FundEd</h1>
                            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-medium">Kurumsal Platform</p>
                        </div>
                    </Link>
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Ana Sayfaya Dön</span>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative z-10 text-center pt-12 pb-8 px-4">
                <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6">
                    <Globe className="h-3.5 w-3.5 text-blue-400" />
                    <span className="text-xs text-slate-300 font-medium">Kurumsal Eğitim Destek Platformu</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                    Eğitime Yatırım,
                    <br />
                    <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        Geleceğe Etki.
                    </span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
                    Kurumsal bağışlarınızı takip edin, ESG raporlarınızı oluşturun ve eğitim üzerindeki
                    etkinizi şeffaf verilerle görün.
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="relative z-10 max-w-md mx-auto px-4 mb-8">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-1.5 flex">
                    {[
                        { id: 'login' as TabType, label: 'Giriş Yap', icon: Lock },
                        { id: 'register' as TabType, label: 'Başvuru Yap', icon: User },
                        { id: 'pricing' as TabType, label: 'Paketler', icon: Star },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-white text-slate-900 shadow-lg shadow-white/10'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 pb-20">
                {/* =================== LOGIN TAB =================== */}
                {activeTab === 'login' && (
                    <div className="max-w-md mx-auto">
                        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                            <div className="text-center mb-8">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
                                    <Shield className="h-7 w-7 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-1">Kurumsal Giriş</h3>
                                <p className="text-sm text-slate-400">Kurumsal hesabınızla giriş yapın</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-5">
                                {loginError && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl text-sm">
                                        {loginError}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="login-email" className="text-slate-300 text-sm">
                                        Kurumsal E-posta
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                                        <Input
                                            id="login-email"
                                            type="email"
                                            placeholder="ornek@sirket.com"
                                            value={loginEmail}
                                            onChange={(e) => setLoginEmail(e.target.value)}
                                            className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:border-blue-500/50 focus:ring-blue-500/20"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="login-password" className="text-slate-300 text-sm">
                                        Şifre
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                                        <Input
                                            id="login-password"
                                            type={showLoginPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                            className="pl-11 pr-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:border-blue-500/50 focus:ring-blue-500/20"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                        >
                                            {showLoginPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all duration-300"
                                    disabled={loginLoading}
                                >
                                    {loginLoading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                                    ) : (
                                        <>
                                            Giriş Yap
                                            <ArrowRight className="ml-2 h-4.5 w-4.5" />
                                        </>
                                    )}
                                </Button>
                            </form>

                            <div className="mt-6 pt-6 border-t border-white/10">
                                <p className="text-center text-sm text-slate-500">
                                    Hesabınız yok mu?{' '}
                                    <button
                                        onClick={() => setActiveTab('register')}
                                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                                    >
                                        Başvuru Yapın
                                    </button>
                                    {' '}veya{' '}
                                    <button
                                        onClick={() => setActiveTab('pricing')}
                                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                                    >
                                        Paketleri İnceleyin
                                    </button>
                                </p>
                            </div>

                            {/* Demo */}
                            <div className="mt-5 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                                <p className="text-[11px] text-blue-400 font-medium mb-1.5 uppercase tracking-wider">Demo Bilgileri</p>
                                <p className="text-xs text-slate-400">E-posta: <span className="text-slate-300">admin@techventures.com</span></p>
                                <p className="text-xs text-slate-400">Şifre: <span className="text-slate-300">demo123</span></p>
                            </div>
                        </div>
                    </div>
                )}

                {/* =================== REGISTER TAB =================== */}
                {activeTab === 'register' && (
                    <div className="max-w-lg mx-auto">
                        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                            {regSuccess ? (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/25">
                                        <Check className="h-10 w-10 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Başvurunuz Alındı!</h3>
                                    <p className="text-slate-400 mb-4">
                                        {selectedTier
                                            ? 'Hesabınız aktifleştirildi. Kurumsal panele yönlendiriliyorsunuz...'
                                            : 'Başvurunuz incelenerek size dönüş yapılacaktır. Yönlendiriliyorsunuz...'
                                        }
                                    </p>
                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden w-48 mx-auto">
                                        <div className="h-full bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full animate-pulse w-full" />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="text-center mb-8">
                                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25">
                                            <Building2 className="h-7 w-7 text-white" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-white mb-1">
                                            {selectedTier
                                                ? `${tiers.find(t => t.id === selectedTier)?.name} Paketi — Kayıt`
                                                : 'Kurumsal Başvuru'
                                            }
                                        </h3>
                                        <p className="text-sm text-slate-400">
                                            {selectedTier
                                                ? 'Paket satın almak için bilgilerinizi girin'
                                                : 'Başvuru yaparak kurumsal erişim talebinde bulunun'
                                            }
                                        </p>
                                        {selectedTier && (
                                            <div className="mt-3 inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
                                                <span className="text-xs text-slate-300 font-medium">
                                                    Seçili Paket: <span className="text-blue-400 font-semibold">{tiers.find(t => t.id === selectedTier)?.name}</span>
                                                    {' — '}
                                                    {discountStatus === 'valid' && discountPercent > 0 ? (
                                                        <>
                                                            <span className="text-slate-500 line-through">${tiers.find(t => t.id === selectedTier)?.price}</span>
                                                            {' '}
                                                            <span className="text-emerald-400 font-bold">${getDiscountedPrice(tiers.find(t => t.id === selectedTier)?.price || 0)}/ay</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-white font-bold">${tiers.find(t => t.id === selectedTier)?.price}/ay</span>
                                                    )}
                                                </span>
                                                <button
                                                    onClick={() => { setSelectedTier(null); handleClearDiscount(); }}
                                                    className="text-slate-500 hover:text-slate-300 transition-colors"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <form onSubmit={handleRegister} className="space-y-5">
                                        {regError && (
                                            <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl text-sm">
                                                {regError}
                                            </div>
                                        )}

                                        {/* Company Name */}
                                        <div className="space-y-2">
                                            <Label htmlFor="reg-company" className="text-slate-300 text-sm">
                                                Şirket Adı <span className="text-red-400">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                                                <Input
                                                    id="reg-company"
                                                    type="text"
                                                    placeholder="Şirket A.Ş."
                                                    value={regCompany}
                                                    onChange={(e) => setRegCompany(e.target.value)}
                                                    className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:border-blue-500/50 focus:ring-blue-500/20"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Name fields */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="reg-firstname" className="text-slate-300 text-sm">
                                                    Ad <span className="text-red-400">*</span>
                                                </Label>
                                                <div className="relative">
                                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                                                    <Input
                                                        id="reg-firstname"
                                                        type="text"
                                                        placeholder="Adınız"
                                                        value={regFirstName}
                                                        onChange={(e) => setRegFirstName(e.target.value)}
                                                        className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:border-blue-500/50 focus:ring-blue-500/20"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="reg-lastname" className="text-slate-300 text-sm">
                                                    Soyad <span className="text-red-400">*</span>
                                                </Label>
                                                <Input
                                                    id="reg-lastname"
                                                    type="text"
                                                    placeholder="Soyadınız"
                                                    value={regLastName}
                                                    onChange={(e) => setRegLastName(e.target.value)}
                                                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:border-blue-500/50 focus:ring-blue-500/20"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-2">
                                            <Label htmlFor="reg-email" className="text-slate-300 text-sm">
                                                Kurumsal E-posta <span className="text-red-400">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                                                <Input
                                                    id="reg-email"
                                                    type="email"
                                                    placeholder="ornek@sirket.com"
                                                    value={regEmail}
                                                    onChange={(e) => setRegEmail(e.target.value)}
                                                    className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:border-blue-500/50 focus:ring-blue-500/20"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Phone (optional) */}
                                        <div className="space-y-2">
                                            <Label htmlFor="reg-phone" className="text-slate-300 text-sm">
                                                Telefon <span className="text-slate-600 text-xs font-normal">(opsiyonel)</span>
                                            </Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                                                <Input
                                                    id="reg-phone"
                                                    type="tel"
                                                    placeholder="+90 5XX XXX XX XX"
                                                    value={regPhone}
                                                    onChange={(e) => setRegPhone(e.target.value)}
                                                    className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:border-blue-500/50 focus:ring-blue-500/20"
                                                />
                                            </div>
                                        </div>

                                        {/* Password */}
                                        <div className="space-y-2">
                                            <Label htmlFor="reg-password" className="text-slate-300 text-sm">
                                                Şifre <span className="text-red-400">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                                                <Input
                                                    id="reg-password"
                                                    type={showRegPassword ? 'text' : 'password'}
                                                    placeholder="En az 6 karakter"
                                                    value={regPassword}
                                                    onChange={(e) => setRegPassword(e.target.value)}
                                                    className="pl-11 pr-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:border-blue-500/50 focus:ring-blue-500/20"
                                                    required
                                                    minLength={6}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowRegPassword(!showRegPassword)}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                                >
                                                    {showRegPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Password Confirm */}
                                        <div className="space-y-2">
                                            <Label htmlFor="reg-password-confirm" className="text-slate-300 text-sm">
                                                Şifre Tekrar <span className="text-red-400">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                                                <Input
                                                    id="reg-password-confirm"
                                                    type="password"
                                                    placeholder="Şifrenizi tekrar girin"
                                                    value={regPasswordConfirm}
                                                    onChange={(e) => setRegPasswordConfirm(e.target.value)}
                                                    className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:border-blue-500/50 focus:ring-blue-500/20"
                                                    required
                                                    minLength={6}
                                                />
                                            </div>
                                        </div>

                                        {/* If no tier selected, show option to pick */}
                                        {!selectedTier && (
                                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                                <p className="text-sm text-slate-300 mb-2">Paket seçimi yapmadınız.</p>
                                                <p className="text-xs text-slate-500 mb-3">
                                                    Direkt satın almak için bir paket seçebilir veya başvuru olarak devam edebilirsiniz.
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTab('pricing')}
                                                    className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors flex items-center gap-1"
                                                >
                                                    Paketleri İncele <ArrowRight className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        )}

                                        {/* ── Discount Code Section ── */}
                                        {selectedTier && (
                                            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 space-y-3">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Tag className="h-4 w-4 text-indigo-400" />
                                                    <Label className="text-sm font-medium text-slate-300">İndirim Kodu</Label>
                                                    <span className="text-[10px] text-slate-600 font-normal">(opsiyonel)</span>
                                                </div>

                                                <div className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <Input
                                                            type="text"
                                                            placeholder="Kodu girin..."
                                                            value={discountCode}
                                                            onChange={(e) => {
                                                                setDiscountCode(e.target.value.toUpperCase());
                                                                if (discountStatus !== 'idle') {
                                                                    setDiscountStatus('idle');
                                                                    setDiscountPercent(0);
                                                                    setDiscountMessage('');
                                                                }
                                                            }}
                                                            disabled={discountStatus === 'valid'}
                                                            className="h-11 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:border-indigo-500/50 focus:ring-indigo-500/20 uppercase tracking-wider text-sm font-mono disabled:opacity-60"
                                                        />
                                                        {discountStatus === 'valid' && (
                                                            <button
                                                                type="button"
                                                                onClick={handleClearDiscount}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        onClick={handleApplyDiscount}
                                                        disabled={discountStatus === 'checking' || discountStatus === 'valid' || !discountCode.trim()}
                                                        className="h-11 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium disabled:opacity-40 transition-all"
                                                    >
                                                        {discountStatus === 'checking' ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            'Uygula'
                                                        )}
                                                    </Button>
                                                </div>

                                                {/* Discount feedback */}
                                                {discountStatus === 'valid' && (
                                                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3.5 py-2.5">
                                                        <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                                                        <div className="flex-1">
                                                            <p className="text-sm text-emerald-300 font-medium">{discountMessage}</p>
                                                            <p className="text-xs text-emerald-400/70 mt-0.5">
                                                                <span className="line-through text-slate-500">${tiers.find(t => t.id === selectedTier)?.price}/ay</span>
                                                                {' → '}
                                                                <span className="text-emerald-300 font-bold">
                                                                    ${getDiscountedPrice(tiers.find(t => t.id === selectedTier)?.price || 0)}/ay
                                                                </span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {discountStatus === 'invalid' && (
                                                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3.5 py-2.5">
                                                        <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                                                        <p className="text-sm text-red-300">{discountMessage}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <Button
                                            type="submit"
                                            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 transition-all duration-300"
                                            disabled={regLoading}
                                        >
                                            {regLoading ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                                            ) : (
                                                <>
                                                    {selectedTier
                                                        ? discountStatus === 'valid'
                                                            ? `$${getDiscountedPrice(tiers.find(t => t.id === selectedTier)?.price || 0)}/ay — Satın Al & Kayıt Ol`
                                                            : 'Satın Al & Kayıt Ol'
                                                        : 'Başvuru Gönder'
                                                    }
                                                    <ArrowRight className="ml-2 h-4.5 w-4.5" />
                                                </>
                                            )}
                                        </Button>
                                    </form>

                                    <div className="mt-6 pt-6 border-t border-white/10">
                                        <p className="text-center text-sm text-slate-500">
                                            Zaten hesabınız var mı?{' '}
                                            <button
                                                onClick={() => setActiveTab('login')}
                                                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                                            >
                                                Giriş Yapın
                                            </button>
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* =================== PRICING TAB =================== */}
                {activeTab === 'pricing' && (
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">Kurumsal Paketler</h3>
                            <p className="text-slate-400 max-w-xl mx-auto">
                                İhtiyacınıza uygun paketi seçin. Her zaman yükseltme yapabilirsiniz.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                            {tiers.map((tier) => {
                                const Icon = tier.icon;
                                return (
                                    <div
                                        key={tier.id}
                                        className={`relative bg-white/[0.03] backdrop-blur-xl border rounded-3xl p-7 transition-all duration-300 hover:translate-y-[-4px] hover:shadow-2xl ${tier.popular
                                            ? 'border-blue-500/40 shadow-lg shadow-blue-500/10'
                                            : 'border-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        {/* Popular badge */}
                                        {tier.popular && (
                                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-semibold px-5 py-1.5 rounded-full shadow-lg shadow-blue-500/30">
                                                    En Popüler
                                                </div>
                                            </div>
                                        )}

                                        {/* Tier Header */}
                                        <div className="mb-6">
                                            <div className={`w-12 h-12 bg-gradient-to-br ${tier.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                                                <Icon className="h-6 w-6 text-white" />
                                            </div>
                                            <h4 className="text-xl font-bold text-white mb-1">{tier.name}</h4>
                                            <p className="text-sm text-slate-400">{tier.tagline}</p>
                                        </div>

                                        {/* Price */}
                                        <div className="mb-6 pb-6 border-b border-white/10">
                                            {discountStatus === 'valid' && discountPercent > 0 ? (
                                                <div>
                                                    <div className="flex items-baseline gap-2 mb-1">
                                                        <span className="text-4xl font-bold text-white">${getDiscountedPrice(tier.price)}</span>
                                                        <span className="text-slate-400 text-sm">/ay</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-slate-500 line-through">${tier.price}/ay</span>
                                                        <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                                                            -%{discountPercent}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-4xl font-bold text-white">${tier.price}</span>
                                                    <span className="text-slate-400 text-sm">/ay</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Features */}
                                        <ul className="space-y-3 mb-8">
                                            {tier.features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                                        <Check className="h-3 w-3 text-emerald-400" />
                                                    </div>
                                                    <span className="text-sm text-slate-300 leading-snug">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* CTA Button */}
                                        <Button
                                            onClick={() => handleSelectTier(tier.id)}
                                            className={`w-full h-12 rounded-xl font-medium transition-all duration-300 ${tier.popular
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25'
                                                : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                                                }`}
                                        >
                                            Satın Al
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Apply without package */}
                        <div className="mt-12 text-center">
                            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-xl mx-auto">
                                <h4 className="text-lg font-semibold text-white mb-2">Henüz karar veremediniz mi?</h4>
                                <p className="text-sm text-slate-400 mb-5">
                                    Paket seçmeden de başvuru yapabilirsiniz. Ekibimiz sizinle iletişime geçerek
                                    en uygun çözümü birlikte belirleyecektir.
                                </p>
                                <Button
                                    onClick={() => {
                                        setSelectedTier(null);
                                        setActiveTab('register');
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    variant="outline"
                                    className="h-11 rounded-xl border-white/20 text-slate-300 hover:bg-white/10 hover:text-white"
                                >
                                    Ücretsiz Başvuru Yap
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Feature Comparison - compact */}
                        <div className="mt-16 mb-8">
                            <h4 className="text-xl font-bold text-white text-center mb-8">Detaylı Karşılaştırma</h4>
                            <div className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="px-6 py-4 text-sm font-medium text-slate-400">Özellik</th>
                                                <th className="px-6 py-4 text-sm font-medium text-slate-300 text-center">Starter</th>
                                                <th className="px-6 py-4 text-sm font-medium text-blue-400 text-center">Growth</th>
                                                <th className="px-6 py-4 text-sm font-medium text-amber-400 text-center">Enterprise</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {[
                                                ['Impact Dashboard', '✓', '✓', '✓'],
                                                ['Donation Trace', 'Temel', 'Gelişmiş', 'Gelişmiş+'],
                                                ['Raporlama', '3 ayda 1', 'Aylık', 'Özel şablon'],
                                                ['Evidence Vault', '—', '✓', '✓'],
                                                ['Alert Sistemi', '—', '✓', '✓'],
                                                ['Audit Pack', '—', '—', '✓'],
                                                ['SSO / SAML', '—', '—', '✓'],
                                                ['API & Webhooks', '—', '—', '✓'],
                                                ['Rol Bazlı Yetki', '—', '—', '✓'],
                                                ['Kullanıcı', '1', '5', '20'],
                                                ['Kampanya Limiti', '10', '50', 'Sınırsız'],
                                                ['Export', 'Temel CSV', 'CSV + Audit Log', 'Tam Erişim'],
                                                ['Destek', 'E-posta', 'Öncelikli', 'Dedicated Manager'],
                                            ].map(([feature, starter, growth, enterprise], i) => (
                                                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-6 py-3 text-sm text-slate-300">{feature}</td>
                                                    <td className="px-6 py-3 text-sm text-slate-400 text-center">{starter}</td>
                                                    <td className="px-6 py-3 text-sm text-slate-300 text-center">{growth}</td>
                                                    <td className="px-6 py-3 text-sm text-slate-300 text-center">{enterprise}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 py-8 px-4">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-600">© 2026 FundEd. Tüm hakları saklıdır.</p>
                    <div className="flex items-center gap-6">
                        <Link href="/privacy" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                            Gizlilik Politikası
                        </Link>
                        <Link href="/terms" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                            Kullanım Koşulları
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
