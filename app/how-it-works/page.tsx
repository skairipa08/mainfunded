'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import {
  Heart,
  Shield,
  Users,
  GraduationCap,
  Search,
  FileCheck,
  CreditCard,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Eye,
  Sparkles,
  Globe,
  Lock,
  TrendingUp,
  MessageSquare,
  Zap,
  Award,
  HandHeart,
  BookOpen,
  UserCheck,
  ClipboardCheck,
  Send,
  PieChart,
  HelpCircle,
} from 'lucide-react';

/* ──────────────────────────────────────── */

const mainSteps = [
  {
    step: '01',
    icon: Search,
    title: 'Öğrenci Keşfet',
    desc: 'Platform üzerindeki doğrulanmış öğrencileri inceleyin. Ülke, bölüm, ihtiyaç türüne göre filtreleyin. Her profilde öğrencinin hikayesini, ihtiyaç detayını ve doğrulama durumunu görebilirsiniz.',
    gradient: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    color: 'text-blue-600',
    highlights: ['Detaylı profil sayfaları', 'İhtiyaç kategorileri', 'Doğrulama rozetleri'],
  },
  {
    step: '02',
    icon: CreditCard,
    title: 'Güvenli Bağış Yap',
    desc: 'Dilediğiniz öğrenciye veya genel eğitim fonuna bağış yapın. Hızlı miktar butonları veya özel tutar girişiyle saniyeler içinde tamamlayın. 256-bit SSL ile şifrelenmiş güvenli altyapı.',
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    color: 'text-emerald-600',
    highlights: ['Hızlı ödeme', 'Anonim bağış seçeneği', 'SSL şifreli güvenlik'],
  },
  {
    step: '03',
    icon: Send,
    title: 'Fonlama & Aktarım',
    desc: 'Toplanan bağışlar doğrudan öğrencinin ihtiyacına yönelik aktarılır. Okul malzemeleri, burs ödemeleri veya dijital araçlar — her kuruş hedefe ulaşır.',
    gradient: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    color: 'text-amber-600',
    highlights: ['Doğrudan aktarım', 'İhtiyaca özel harcama', 'Aracısız sistem'],
  },
  {
    step: '04',
    icon: PieChart,
    title: 'Etki Takibi',
    desc: 'Bağışınızın yarattığı etkiyi somut veriler ve fotoğraflarla takip edin. Öğrenciden teşekkür mesajları, ilerleme raporları ve etki analizleri dashboard\'ınızda.',
    gradient: 'from-purple-500 to-pink-600',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    color: 'text-purple-600',
    highlights: ['Fotoğraflı raporlar', 'Etki metrikleri', 'Kişisel dashboard'],
  },
];

const verificationSteps = [
  {
    icon: BookOpen,
    title: 'Başvuru',
    desc: 'Öğrenci, kimlik, öğrenim belgesi ve ihtiyaç detayıyla başvurusunu gönderir.',
  },
  {
    icon: UserCheck,
    title: 'Kimlik Doğrulama',
    desc: 'Ekibimiz resmi belgeler ve kurumsal kaynaklarla kimliği doğrular.',
  },
  {
    icon: ClipboardCheck,
    title: 'İhtiyaç Analizi',
    desc: 'Öğrencinin maddi durumu ve eğitim ihtiyacı detaylı olarak değerlendirilir.',
  },
  {
    icon: Award,
    title: 'Onay & Yayın',
    desc: 'Doğrulanan öğrenci profillerine "Doğrulanmış" rozeti verilir ve platforma eklenir.',
  },
];

const faqs = [
  {
    q: 'Bağışım nereye gidiyor?',
    a: 'Bağışınız doğrudan seçtiğiniz öğrencinin ihtiyacına yönlendirilir. Genel fona yapılan bağışlar ise en acil ihtiyacı olan öğrencilere dağıtılır. Her işlem kaydedilir ve takip edilebilir.',
  },
  {
    q: 'Anonim bağış yapabilir miyim?',
    a: 'Evet! Bağış formunda adınızı ve e-postanızı boş bırakarak tamamen anonim bağış yapabilirsiniz.',
  },
  {
    q: 'Öğrenciler nasıl doğrulanıyor?',
    a: 'Her öğrenci başvurusu kimlik belgesi, öğrenim belgesi ve ihtiyaç beyanıyla yapılır. Ekibimiz tüm belgeleri doğrular ve uygunluğu onayladıktan sonra profil yayınlanır.',
  },
  {
    q: 'Bağışımın etkisini nasıl görebilirim?',
    a: 'Bağış sonrası kişisel dashboard\'ınızdan öğrencinin ilerlemesini, fotoğrafları ve etki raporlarını takip edebilirsiniz.',
  },
  {
    q: 'Kurumsal bağış yapabilir miyiz?',
    a: 'Evet! FundEd Kurumsal panelimiz ile şirketiniz adına bağış yapabilir, ESG raporlarınızı otomatik oluşturabilir ve ekibinizle birlikte etkiyi takip edebilirsiniz.',
  },
  {
    q: 'Minimum bağış tutarı nedir?',
    a: 'Minimum bağış tutarı $1\'dır. Her miktar bir fark yaratır — $10 bile bir öğrenciye 1 aylık defter ve kalem sağlayabilir.',
  },
];

/* ──────────────────────────────────────── */

export default function HowItWorksPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow">

        {/* ═══════════════════════════
            HERO
           ═══════════════════════════ */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-white/5 rounded-full blur-[60px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[80px]" />
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '36px 36px',
            }} />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 mb-8">
                <Zap className="h-4 w-4 text-yellow-300" />
                <span className="text-sm text-white/90 font-medium">Basit, Şeffaf, Etkili</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                FundEd Nasıl
                <br />
                <span className="bg-gradient-to-r from-yellow-200 via-amber-200 to-orange-200 bg-clip-text text-transparent">
                  Çalışır?
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-blue-100/80 leading-relaxed max-w-2xl mx-auto">
                Bağışçıları ve öğrencileri 4 basit adımda buluşturuyoruz.
                Her adım şeffaf, her kuruş izlenebilir.
              </p>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 80" fill="none" className="w-full">
              <path d="M0 80L60 69.3C120 59 240 37 360 32C480 27 600 37 720 42.7C840 48 960 48 1080 42.7C1200 37 1320 27 1380 21.3L1440 16V80H0Z" fill="white" />
            </svg>
          </div>
        </section>

        {/* ═══════════════════════════
            MAIN 4 STEPS
           ═══════════════════════════ */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-16">
              {mainSteps.map((item, i) => {
                const Icon = item.icon;
                const isEven = i % 2 === 0;
                return (
                  <div
                    key={i}
                    className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-10 lg:gap-16`}
                  >
                    {/* Visual Card */}
                    <div className="lg:w-5/12 w-full">
                      <div className={`${item.bg} border ${item.border} rounded-3xl p-10 sm:p-12 relative overflow-hidden group`}>
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-5`} />
                        </div>
                        <div className="relative z-10 text-center">
                          <div className="text-[80px] sm:text-[100px] font-black text-slate-900/[0.04] absolute top-2 right-4 leading-none select-none">
                            {item.step}
                          </div>
                          <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                            <Icon className="h-10 w-10 text-white" />
                          </div>
                          <div className="flex items-center justify-center gap-2 mb-3">
                            <span className={`text-xs font-bold ${item.color} uppercase tracking-widest`}>Adım {item.step}</span>
                          </div>
                          <h3 className="text-2xl font-bold text-slate-900">{item.title}</h3>
                        </div>
                      </div>
                    </div>

                    {/* Text Content */}
                    <div className="lg:w-7/12 w-full">
                      <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">{item.title}</h3>
                      <p className="text-lg text-slate-500 leading-relaxed mb-6">{item.desc}</p>
                      <div className="space-y-3">
                        {item.highlights.map((h, j) => (
                          <div key={j} className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full ${item.bg} flex items-center justify-center flex-shrink-0`}>
                              <CheckCircle className={`h-4 w-4 ${item.color}`} />
                            </div>
                            <span className="text-slate-700 font-medium">{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════
            VERIFICATION PROCESS
           ═══════════════════════════ */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full mb-4">
                Doğrulama Süreci
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Öğrenci Nasıl Doğrulanır?
              </h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                Platform üzerindeki her öğrenci titiz bir doğrulama sürecinden geçer.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              {/* Connection line (desktop) */}
              <div className="hidden lg:block absolute top-[52px] left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-emerald-200 via-teal-200 to-green-200 z-0" />

              {verificationSteps.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="relative z-10 text-center group">
                    <div className="w-[68px] h-[68px] mx-auto mb-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-shadow duration-300">
                      <span className="text-xs font-bold text-emerald-500 tracking-widest mb-2 block">{String(i + 1).padStart(2, '0')}</span>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════
            TRUST BADGES
           ═══════════════════════════ */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-4">
                Güvenlik & Güvence
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Neden FundEd?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Shield, title: '%100 Şeffaf', desc: 'Her bağış kaydı ve harcama detayı açık erişimde. Gizli maliyet yok.', color: 'text-blue-600', bg: 'bg-blue-50' },
                { icon: Lock, title: 'Güvenli Altyapı', desc: '256-bit SSL şifreleme, PCI uyumlu ödeme sistemi.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { icon: Eye, title: 'Etki Görünürlüğü', desc: 'Bağışınızın yarattığı farkı fotoğraf ve verilerle takip edin.', color: 'text-purple-600', bg: 'bg-purple-50' },
                { icon: HandHeart, title: 'Doğrudan Etki', desc: 'Aracı komisyonu minimum — bağışınızın çoğu doğrudan öğrenciye ulaşır.', color: 'text-rose-600', bg: 'bg-rose-50' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="bg-white rounded-2xl p-7 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group text-center">
                    <div className={`${item.bg} w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`h-8 w-8 ${item.color}`} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════
            WHO CAN USE
           ═══════════════════════════ */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-amber-600 bg-amber-50 px-4 py-1.5 rounded-full mb-4">
                Kimin İçin?
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                FundEd Herkes İçin
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Heart,
                  title: 'Bağışçılar',
                  desc: 'Bireysel veya düzenli bağış yaparak öğrencilerin hayatını değiştirin. Dashboard\'ınızdan etkiyi takip edin.',
                  features: ['Hızlı & kolay bağış', 'Etki raporları', 'Anonim seçenek', 'Vergi makbuzu'],
                  gradient: 'from-blue-500 to-indigo-600',
                  bg: 'bg-blue-50',
                },
                {
                  icon: GraduationCap,
                  title: 'Öğrenciler',
                  desc: 'Eğitim ihtiyaçlarınız için başvurun. Doğrulama sonrası profiliniz platforma eklenir ve bağışçılarla buluşursunuz.',
                  features: ['Kolay başvuru süreci', 'Gizlilik garantisi', 'Doğrudan destek', 'Mentör erişimi'],
                  gradient: 'from-emerald-500 to-teal-600',
                  bg: 'bg-emerald-50',
                },
                {
                  icon: Globe,
                  title: 'Kurumlar',
                  desc: 'Şirketiniz adına ESG uyumlu bağış yapın. Kurumsal panel ile ekibinizle birlikte etkiyi yönetin.',
                  features: ['Kurumsal dashboard', 'ESG raporlama', 'Çoklu kullanıcı', 'API erişimi'],
                  gradient: 'from-amber-500 to-orange-600',
                  bg: 'bg-amber-50',
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                    <div className={`w-14 h-14 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                    <p className="text-slate-500 leading-relaxed mb-6">{item.desc}</p>
                    <div className="space-y-2.5">
                      {item.features.map((f, j) => (
                        <div key={j} className="flex items-center gap-2.5">
                          <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          <span className="text-sm text-slate-600">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════
            FAQ
           ═══════════════════════════ */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full mb-4">
                SSS
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Sıkça Sorulan Sorular
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  <summary className="flex items-center justify-between cursor-pointer p-6 select-none">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0 group-open:bg-indigo-100 transition-colors">
                        <HelpCircle className="h-5 w-5 text-indigo-500" />
                      </div>
                      <h3 className="text-base font-semibold text-slate-800">{faq.q}</h3>
                    </div>
                    <div className="ml-4 flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 group-open:bg-indigo-500 flex items-center justify-center transition-colors duration-300">
                      <svg className="w-3 h-3 text-slate-500 group-open:text-white group-open:rotate-180 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </summary>
                  <div className="px-6 pb-6 pt-0">
                    <div className="pl-[52px]">
                      <p className="text-slate-500 leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════
            CTA
           ═══════════════════════════ */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400 rounded-full blur-[80px]" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-400 rounded-full blur-[80px]" />
              </div>

              <div className="relative z-10">
                <Sparkles className="h-10 w-10 text-amber-400 mx-auto mb-6" />
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5">
                  Eğitime Katkınızı Bugün Başlatın
                </h2>
                <p className="text-slate-400 max-w-xl mx-auto mb-10 text-lg leading-relaxed">
                  Küçük büyük her bağış bir çocuğun geleceğini aydınlatır.
                  İlk adımı şimdi atın.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    onClick={() => router.push('/donate')}
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white h-14 px-10 rounded-2xl text-lg font-semibold shadow-xl shadow-blue-500/25"
                  >
                    <Heart className="mr-2 h-5 w-5" />
                    Bağış Yap
                  </Button>
                  <Button
                    onClick={() => router.push('/browse')}
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 h-14 px-10 rounded-2xl text-lg backdrop-blur-sm"
                  >
                    Öğrencileri Keşfet
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
