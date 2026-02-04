'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
    Sparkles,
    Moon,
    Smartphone,
    Bell,
    Globe,
    Volume2,
    CreditCard,
    Bitcoin,
    FileText,
    Target,
    Heart,
    Trophy,
    Medal,
    UserPlus,
    Users,
    Activity,
    GraduationCap,
    Briefcase,
    Calendar,
    BookOpen,
    Building2,
    Wallet,
    Link,
    Layout,
    Mail,
    MessageSquare,
    BarChart3,
    FlaskConical,
    Search,
    Database,
    Map,
    FileBarChart,
    Shield,
    CheckCircle,
    Circle,
    Clock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FeatureSuggestion {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    category: string;
    status: 'planned' | 'in-progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
}

const suggestions: FeatureSuggestion[] = [
    // Kullanıcı Deneyimi (UX)
    { id: 'ux-1', title: 'Dark Mode', description: 'Karanlık tema desteği', icon: Moon, category: 'UX', status: 'planned', priority: 'medium' },
    { id: 'ux-2', title: 'PWA (Progressive Web App)', description: 'Mobilde uygulama gibi çalışsın', icon: Smartphone, category: 'UX', status: 'planned', priority: 'high' },
    { id: 'ux-3', title: 'Push Notifications', description: 'Bağış alındığında bildirim', icon: Bell, category: 'UX', status: 'planned', priority: 'medium' },
    { id: 'ux-4', title: 'Çok Dilli Destek Genişletme', description: 'Arapça, Almanca, Fransızca', icon: Globe, category: 'UX', status: 'planned', priority: 'low' },
    { id: 'ux-5', title: 'Sesli Okuma', description: 'Görme engelliler için erişilebilirlik', icon: Volume2, category: 'UX', status: 'planned', priority: 'low' },

    // Bağış & Finans
    { id: 'fin-1', title: 'Abonelik Bağış', description: 'Aylık düzenli bağış sistemi', icon: CreditCard, category: 'Finans', status: 'planned', priority: 'high' },
    { id: 'fin-2', title: 'Kripto Para Bağışı', description: 'Bitcoin, Ethereum desteği', icon: Bitcoin, category: 'Finans', status: 'planned', priority: 'low' },
    { id: 'fin-3', title: 'Bağış Makbuzu Otomatik Oluşturma', description: 'PDF vergi makbuzu', icon: FileText, category: 'Finans', status: 'planned', priority: 'high' },
    { id: 'fin-4', title: 'Hedef Bazlı Kampanyalar', description: 'Milestone\'lar ile ilerleme', icon: Target, category: 'Finans', status: 'planned', priority: 'medium' },
    { id: 'fin-5', title: 'Matching Donations', description: 'Kurumsal eşleştirmeli bağış', icon: Heart, category: 'Finans', status: 'planned', priority: 'medium' },

    // Sosyal Özellikler
    { id: 'social-1', title: 'Bağışçı Sıralaması', description: 'Leaderboard sistemi', icon: Trophy, category: 'Sosyal', status: 'planned', priority: 'medium' },
    { id: 'social-2', title: 'Rozetler ve Başarılar', description: 'Gamification özellikleri', icon: Medal, category: 'Sosyal', status: 'planned', priority: 'medium' },
    { id: 'social-3', title: 'Referans Sistemi', description: 'Arkadaş davet et, puan kazan', icon: UserPlus, category: 'Sosyal', status: 'planned', priority: 'low' },
    { id: 'social-4', title: 'Topluluk Forumu', description: 'Bağışçılar arası iletişim', icon: Users, category: 'Sosyal', status: 'planned', priority: 'low' },
    { id: 'social-5', title: 'Canlı Bağış Akışı', description: 'Gerçek zamanlı bağış gösterimi', icon: Activity, category: 'Sosyal', status: 'planned', priority: 'high' },

    // Öğrenci Özellikleri
    { id: 'student-1', title: 'Mentorluk Eşleştirme', description: 'Alumni ve öğrenci eşleştirmesi', icon: GraduationCap, category: 'Öğrenci', status: 'planned', priority: 'high' },
    { id: 'student-2', title: 'Kariyer Desteği', description: 'CV hazırlama, mülakat ipuçları', icon: Briefcase, category: 'Öğrenci', status: 'planned', priority: 'medium' },
    { id: 'student-3', title: 'Burs Takvimi', description: 'Yaklaşan burs başvuru tarihleri', icon: Calendar, category: 'Öğrenci', status: 'planned', priority: 'medium' },
    { id: 'student-4', title: 'Staj Fırsatları', description: 'Sponsor şirketlerden staj ilanları', icon: Briefcase, category: 'Öğrenci', status: 'planned', priority: 'medium' },
    { id: 'student-5', title: 'E-Öğrenme Entegrasyonu', description: 'Udemy, Coursera kuponları', icon: BookOpen, category: 'Öğrenci', status: 'planned', priority: 'low' },

    // Kurumsal Özellikler
    { id: 'corp-1', title: 'Çalışan Bağış Programı', description: 'Payroll deduction sistemi', icon: Building2, category: 'Kurumsal', status: 'planned', priority: 'medium' },
    { id: 'corp-2', title: 'Kurumsal Dashboard Genişletme', description: 'Daha detaylı analitikler', icon: BarChart3, category: 'Kurumsal', status: 'planned', priority: 'high' },
    { id: 'corp-3', title: 'API Entegrasyonu', description: 'Kurumsal sistemlerle bağlantı', icon: Link, category: 'Kurumsal', status: 'planned', priority: 'low' },
    { id: 'corp-4', title: 'Özel Landing Page', description: 'Her sponsora özel sayfa', icon: Layout, category: 'Kurumsal', status: 'planned', priority: 'medium' },

    // Teknik İyileştirmeler
    { id: 'tech-1', title: 'Email Bildirimleri', description: 'Resend/SendGrid ile gerçek email', icon: Mail, category: 'Teknik', status: 'completed', priority: 'high' },
    { id: 'tech-2', title: 'SMS Doğrulama', description: 'Twilio ile telefon doğrulama', icon: MessageSquare, category: 'Teknik', status: 'completed', priority: 'high' },
    { id: 'tech-3', title: 'Analytics Dashboard', description: 'Site trafiği ve dönüşüm analizi', icon: BarChart3, category: 'Teknik', status: 'completed', priority: 'high' },
    { id: 'tech-4', title: 'A/B Testing', description: 'Farklı tasarımları test etme', icon: FlaskConical, category: 'Teknik', status: 'completed', priority: 'medium' },
    { id: 'tech-5', title: 'Arama Motoru', description: 'Kampanya ve öğrenci arama', icon: Search, category: 'Teknik', status: 'completed', priority: 'high' },

    // Güven & Şeffaflık
    { id: 'trust-1', title: 'Blockchain Bağış Takibi', description: 'Bağışların şeffaf izlenmesi', icon: Database, category: 'Güven', status: 'planned', priority: 'low' },
    { id: 'trust-2', title: 'Canlı Etki Haritası', description: 'Coğrafi bağış dağılımı', icon: Map, category: 'Güven', status: 'planned', priority: 'medium' },
    { id: 'trust-3', title: 'Yıllık Etki Raporu', description: 'Otomatik oluşturulan rapor', icon: FileBarChart, category: 'Güven', status: 'planned', priority: 'medium' },
    { id: 'trust-4', title: 'Bağımsız Denetim Raporları', description: 'Güvenilirlik için', icon: Shield, category: 'Güven', status: 'planned', priority: 'low' },
];

const categories = ['Tümü', 'UX', 'Finans', 'Sosyal', 'Öğrenci', 'Kurumsal', 'Teknik', 'Güven'];

export default function SuggestionsPage() {
    const [selectedCategory, setSelectedCategory] = useState('Tümü');
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

    const filteredSuggestions = suggestions.filter(s => {
        if (selectedCategory !== 'Tümü' && s.category !== selectedCategory) return false;
        if (selectedStatus && s.status !== selectedStatus) return false;
        return true;
    });

    const stats = {
        total: suggestions.length,
        completed: suggestions.filter(s => s.status === 'completed').length,
        inProgress: suggestions.filter(s => s.status === 'in-progress').length,
        planned: suggestions.filter(s => s.status === 'planned').length,
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'in-progress': return <Clock className="h-4 w-4 text-yellow-600" />;
            default: return <Circle className="h-4 w-4 text-gray-400" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed': return 'Tamamlandı';
            case 'in-progress': return 'Devam Ediyor';
            default: return 'Planlandı';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-700';
            case 'medium': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow">
                {/* Hero */}
                <section className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 text-white py-16 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <div className="bg-white/20 p-3 rounded-xl">
                                <Sparkles className="h-10 w-10" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Gelecek Özellikler
                        </h1>
                        <p className="text-xl text-purple-100 max-w-2xl mx-auto">
                            FundEd platformunda eklenmesi planlanan özellikler ve yol haritamız
                        </p>
                    </div>
                </section>

                {/* Stats */}
                <section className="py-8 px-4 bg-white border-b">
                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-gray-50 rounded-xl">
                                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                                <p className="text-sm text-gray-500">Toplam Öneri</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-xl cursor-pointer hover:bg-green-100 transition-colors"
                                onClick={() => setSelectedStatus(selectedStatus === 'completed' ? null : 'completed')}>
                                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                                <p className="text-sm text-green-700">Tamamlandı</p>
                            </div>
                            <div className="text-center p-4 bg-yellow-50 rounded-xl cursor-pointer hover:bg-yellow-100 transition-colors"
                                onClick={() => setSelectedStatus(selectedStatus === 'in-progress' ? null : 'in-progress')}>
                                <p className="text-3xl font-bold text-yellow-600">{stats.inProgress}</p>
                                <p className="text-sm text-yellow-700">Devam Ediyor</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => setSelectedStatus(selectedStatus === 'planned' ? null : 'planned')}>
                                <p className="text-3xl font-bold text-gray-600">{stats.planned}</p>
                                <p className="text-sm text-gray-500">Planlandı</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Filters */}
                <section className="py-4 px-4 bg-white border-b sticky top-0 z-10">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Suggestions Grid */}
                <section className="py-8 px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-4">
                            {filteredSuggestions.map(suggestion => (
                                <div
                                    key={suggestion.id}
                                    className={`bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition-shadow ${suggestion.status === 'completed' ? 'border-green-200 bg-green-50/50' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-lg ${suggestion.status === 'completed' ? 'bg-green-100' : 'bg-purple-100'
                                            }`}>
                                            <suggestion.icon className={`h-5 w-5 ${suggestion.status === 'completed' ? 'text-green-600' : 'text-purple-600'
                                                }`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-gray-900">{suggestion.title}</h3>
                                                {getStatusIcon(suggestion.status)}
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {suggestion.category}
                                                </Badge>
                                                <Badge className={`text-xs ${getPriorityColor(suggestion.priority)}`}>
                                                    {suggestion.priority === 'high' ? 'Yüksek' : suggestion.priority === 'medium' ? 'Orta' : 'Düşük'}
                                                </Badge>
                                                <span className="text-xs text-gray-400">
                                                    {getStatusLabel(suggestion.status)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredSuggestions.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                Bu kategoride henüz öneri bulunmuyor.
                            </div>
                        )}
                    </div>
                </section>

                {/* CTA */}
                <section className="py-12 px-4 bg-purple-600 text-white">
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="text-2xl font-bold mb-4">Öneriniz mi Var?</h2>
                        <p className="text-purple-100 mb-6">
                            Platformumuzu geliştirmek için fikirlerinizi bekliyoruz!
                        </p>
                        <a
                            href="mailto:suggestions@fund-ed.com"
                            className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
                        >
                            Öneri Gönder
                        </a>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
