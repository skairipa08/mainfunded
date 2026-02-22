'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
    Shield,
    Lock,
    Eye,
    Server,
    CreditCard,
    FileCheck,
    AlertTriangle,
    CheckCircle,
    Key,
    Database,
    Globe,
    Users,
} from 'lucide-react';

const securityFeatures = [
    {
        icon: Lock,
        title: 'SSL/TLS Sifreleme',
        description: 'Tum veri transferleri 256-bit SSL sertifikasi ile sifrelenir. Bilgileriniz uctan uca korunur.',
        color: 'blue',
    },
    {
        icon: Shield,
        title: 'HSTS Koruması',
        description: 'HTTP Strict Transport Security ile tüm bağlantılar güvenli HTTPS üzerinden zorlanır.',
        color: 'green',
    },
    {
        icon: Server,
        title: 'DDoS Korumasi',
        description: 'Gelismis DDoS korumasi ve rate limiting ile platformumuz kesintisiz calisir.',
        color: 'purple',
    },
    {
        icon: Eye,
        title: 'Gizlilik Politikasi',
        description: 'KVKK ve GDPR uyumlu gizlilik standartlarimiz ile verileriniz guvendedir.',
        color: 'indigo',
    },
    {
        icon: CreditCard,
        title: 'PCI DSS Uyumu',
        description: 'Odeme islemleri PCI DSS standartlarinda islem goren iyzico altyapisi ile yapilir.',
        color: 'pink',
    },
    {
        icon: Key,
        title: '2FA Destegi',
        description: 'İki faktörlü doğrulama ile hesabınızı ekstra koruma altına alın.',
        color: 'orange',
    },
    {
        icon: Database,
        title: 'Veri Yedekleme',
        description: 'Günlük otomatik yedeklemeler ile verileriniz her zaman korunur.',
        color: 'cyan',
    },
    {
        icon: FileCheck,
        title: 'Guvenlik Denetimleri',
        description: 'Duzenli guvenlik taramalari ve penetrasyon testleri ile sistemimiz surekli izlenir.',
        color: 'teal',
    },
];

const securityHeaders = [
    { header: 'Content-Security-Policy', description: 'XSS saldırılarına karşı koruma' },
    { header: 'X-Frame-Options', description: 'Clickjacking saldırılarını önleme' },
    { header: 'X-Content-Type-Options', description: 'MIME tipi karışıklığını önleme' },
    { header: 'Referrer-Policy', description: 'Referrer bilgisi kontrolü' },
    { header: 'Permissions-Policy', description: 'Tarayıcı özelliklerini kısıtlama' },
    { header: 'Strict-Transport-Security', description: 'HTTPS zorlaması' },
];

export default function SecurityPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />
            <main className="flex-grow">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <div className="bg-green-500/20 p-4 rounded-2xl">
                                <Shield className="h-12 w-12 text-green-400" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            Guvenliginiz Bizim Oncelligimiz
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            FundEd olarak, kullanicilarimizin ve ogrencilerin verilerini en yuksek guvenlik standartlariyla koruyoruz.
                        </p>
                    </div>
                </section>

                {/* Trust Banner */}
                <section className="bg-green-600 py-4">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-center gap-8 flex-wrap text-white">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5" />
                                <span className="font-medium">SSL Secured</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5" />
                                <span className="font-medium">KVKK Uyumlu</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5" />
                                <span className="font-medium">PCI DSS</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5" />
                                <span className="font-medium">GDPR Uyumlu</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Security Features Grid */}
                <section className="py-16 px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                            Guvenlik Onlemlerimiz
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {securityFeatures.map((feature, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-xl p-6 border shadow-sm hover:shadow-lg transition-shadow"
                                >
                                    <div className={`w-12 h-12 rounded-lg bg-${feature.color}-100 flex items-center justify-center mb-4`}>
                                        <feature.icon className={`h-6 w-6 text-${feature.color}-600`} />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                    <p className="text-sm text-gray-600">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Security Headers Section */}
                <section className="bg-gray-50 py-16 px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
                            Uygulanan Guvenlik Basliklari
                        </h2>
                        <div className="bg-white rounded-xl border overflow-hidden">
                            <div className="bg-gray-800 text-white p-4">
                                <code className="text-sm">HTTP Response Headers</code>
                            </div>
                            <div className="divide-y">
                                {securityHeaders.map((item, index) => (
                                    <div key={index} className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                                {item.header}
                                            </code>
                                        </div>
                                        <span className="text-sm text-gray-500">{item.description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* How We Protect You */}
                <section className="py-16 px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
                            Sizi Nasil Koruyoruz?
                        </h2>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-6 bg-blue-50 rounded-xl border border-blue-200">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Kimlik Dogrulama</h3>
                                    <p className="text-gray-600">
                                        Guclu sifre politikalari, iki faktorlu dogrulama (2FA) ve oturum yonetimi ile hesabiniz guvendedir.
                                        Tum sifreler bcrypt ile hashlenir ve asla duz metin olarak saklanmaz.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-6 bg-green-50 rounded-xl border border-green-200">
                                <div className="bg-green-100 p-3 rounded-lg">
                                    <Database className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Veri Sifreleme</h3>
                                    <p className="text-gray-600">
                                        Hassas veriler AES-256 sifreleme ile korunur. Veritabani baglantilari
                                        SSL/TLS ile sifrelenir. Yedeklemeler de sifrelenmis olarak saklanir.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-6 bg-purple-50 rounded-xl border border-purple-200">
                                <div className="bg-purple-100 p-3 rounded-lg">
                                    <Globe className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Ag Guvenligi</h3>
                                    <p className="text-gray-600">
                                        Rate limiting, DDoS korumasi, IP beyaz/kara liste, ve Web Application Firewall (WAF)
                                        ile kotu niyetli trafik engellenir.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-6 bg-orange-50 rounded-xl border border-orange-200">
                                <div className="bg-orange-100 p-3 rounded-lg">
                                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Surekli Izleme</h3>
                                    <p className="text-gray-600">
                                        7/24 guvenlik izleme, anormal aktivite tespiti, otomatik uyarilar ve
                                        detayli guvenlik loglar ile sistemimiz surekli gozlem altindadir.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Report Vulnerability */}
                <section className="bg-gray-900 text-white py-12 px-4">
                    <div className="max-w-2xl mx-auto text-center">
                        <AlertTriangle className="h-10 w-10 text-yellow-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-4">
                            Guvenlik Acigi mi Buldunuz?
                        </h2>
                        <p className="text-gray-300 mb-6">
                            Platformumuzda bir guvenlik acigi bulduysaniz, lutfen bize bildirin.
                            Sorumlu aciklama politikamiz kapsaminda size tesekkur edecegiz.
                        </p>
                        <a
                            href="mailto:security@fund-ed.com"
                            className="inline-block bg-yellow-500 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
                        >
                            security@fund-ed.com
                        </a>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
