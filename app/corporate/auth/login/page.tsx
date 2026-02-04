'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export default function CorporateLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Demo login - in production, call API
        if (email === 'admin@techventures.com' && password === 'demo123') {
            setTimeout(() => {
                router.push('/corporate');
            }, 1000);
        } else {
            setIsLoading(false);
            setError('Gecersiz e-posta veya sifre');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center bg-blue-600 p-4 rounded-2xl mb-4">
                        <Building2 className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">FundEd Kurumsal</h1>
                    <p className="text-gray-400">Kurumsal bagisci panelinize giris yapin</p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <Label htmlFor="email">E-posta</Label>
                            <div className="relative mt-1">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="ornek@sirket.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="password">Sifre</Label>
                            <div className="relative mt-1">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                    checked={rememberMe}
                                    onCheckedChange={(checked) => setRememberMe(!!checked)}
                                />
                                <span className="text-sm text-gray-600">Beni hatirla</span>
                            </label>
                            <Link href="#" className="text-sm text-blue-600 hover:underline">
                                Sifremi unuttum
                            </Link>
                        </div>

                        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                            ) : (
                                <>
                                    Giris Yap
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-center text-sm text-gray-500">
                            Kurumsal hesabiniz yok mu?{' '}
                            <Link href="/contact" className="text-blue-600 hover:underline">
                                Iletisime gecin
                            </Link>
                        </p>
                    </div>

                    {/* Demo Credentials */}
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-700 font-medium mb-1">Demo Giris Bilgileri:</p>
                        <p className="text-xs text-blue-600">E-posta: admin@techventures.com</p>
                        <p className="text-xs text-blue-600">Sifre: demo123</p>
                    </div>
                </div>

                {/* Back Link */}
                <div className="text-center mt-6">
                    <Link href="/" className="text-gray-400 hover:text-white text-sm">
                        ← Ana Sayfaya Don
                    </Link>
                </div>
            </div>
        </div>
    );
}
