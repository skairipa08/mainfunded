'use client';

import React, { useState } from 'react';
import {
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    CreditCard,
    Users,
    Target,
    Sparkles,
} from 'lucide-react';
import CorporateHeader from '@/components/corporate/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { mockCampaigns, mockStudents } from '@/lib/corporate/mock-data';

interface CartItem {
    id: string;
    type: 'campaign' | 'student';
    name: string;
    amount: number;
}

export default function CampaignsPage() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [autoDonateMode, setAutoDonateMode] = useState(false);
    const [autoDonateAmount, setAutoDonateAmount] = useState('');
    const [showCart, setShowCart] = useState(false);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const addToCart = (id: string, type: 'campaign' | 'student', name: string, defaultAmount = 100) => {
        const existing = cart.find(item => item.id === id);
        if (existing) {
            setCart(cart.map(item =>
                item.id === id ? { ...item, amount: item.amount + defaultAmount } : item
            ));
        } else {
            setCart([...cart, { id, type, name, amount: defaultAmount }]);
        }
    };

    const updateCartAmount = (id: string, amount: number) => {
        if (amount <= 0) {
            removeFromCart(id);
        } else {
            setCart(cart.map(item =>
                item.id === id ? { ...item, amount } : item
            ));
        }
    };

    const removeFromCart = (id: string) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.amount, 0);

    const handleAutoDonate = () => {
        const budget = parseInt(autoDonateAmount);
        if (budget > 0) {
            // Simulate auto-distribution based on need
            const activeStudents = mockStudents.filter(s => s.status === 'active');
            const perStudent = Math.floor(budget / activeStudents.length);
            const newCart = activeStudents.map(student => ({
                id: student.id,
                type: 'student' as const,
                name: student.name,
                amount: perStudent,
            }));
            setCart(newCart);
            setAutoDonateMode(false);
        }
    };

    return (
        <div className="min-h-screen">
            <CorporateHeader
                title="Kampanyalar ve Bagis"
                subtitle="Kampanyalara goz atin ve toplu bagis yapin"
            />

            <div className="p-6">
                {/* Top Actions */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <Button
                        variant={autoDonateMode ? 'default' : 'outline'}
                        onClick={() => setAutoDonateMode(!autoDonateMode)}
                        className="flex items-center gap-2"
                    >
                        <Sparkles className="h-4 w-4" />
                        Otomatik Bagis
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setShowCart(!showCart)}
                        className="flex items-center gap-2 relative"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        Sepet
                        {cart.length > 0 && (
                            <Badge className="ml-2 bg-blue-600">{cart.length}</Badge>
                        )}
                    </Button>
                </div>

                {/* Auto Donate Panel */}
                {autoDonateMode && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border border-blue-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-blue-600" />
                            Otomatik Bagis Sistemi
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Butce belirleyin, sistem en cok ihtiyaci olan ogrencilere otomatik dagitsin.
                        </p>
                        <div className="flex gap-3">
                            <Input
                                type="number"
                                placeholder="Butce (USD)"
                                value={autoDonateAmount}
                                onChange={(e) => setAutoDonateAmount(e.target.value)}
                                className="w-48"
                            />
                            <Button onClick={handleAutoDonate}>
                                Dagit
                            </Button>
                        </div>
                    </div>
                )}

                {/* Cart Panel */}
                {showCart && cart.length > 0 && (
                    <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Bagis Sepeti
                        </h3>
                        <div className="space-y-3 mb-4">
                            {cart.map((item) => (
                                <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <div>
                                        <p className="font-medium text-gray-900">{item.name}</p>
                                        <Badge variant="outline" className="text-xs">
                                            {item.type === 'campaign' ? 'Kampanya' : 'Ogrenci'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => updateCartAmount(item.id, item.amount - 50)}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="w-20 text-center font-medium">
                                            {formatCurrency(item.amount)}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => updateCartAmount(item.id, item.amount + 50)}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-500"
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t">
                            <div>
                                <p className="text-gray-500">Toplam</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(cartTotal)}</p>
                            </div>
                            <Button size="lg" className="gap-2">
                                <CreditCard className="h-5 w-5" />
                                Odeme Yap
                            </Button>
                        </div>
                    </div>
                )}

                {/* Campaigns Grid */}
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Aktif Kampanyalar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {mockCampaigns.map((campaign) => (
                        <div
                            key={campaign.id}
                            className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
                        >
                            <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <Target className="h-16 w-16 text-white/50" />
                            </div>
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-gray-900">{campaign.title}</h4>
                                    <Badge className={
                                        campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                                            campaign.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                    }>
                                        {campaign.status === 'active' ? 'Aktif' : campaign.status === 'completed' ? 'Tamamlandi' : 'Durduruldu'}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-500 mb-3">{campaign.description}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                    <span className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        {campaign.student_count} ogrenci
                                    </span>
                                </div>
                                <Progress
                                    value={(campaign.raised_amount / campaign.goal_amount) * 100}
                                    className="h-2 mb-2"
                                />
                                <div className="flex justify-between text-sm mb-4">
                                    <span className="font-medium text-gray-900">
                                        {formatCurrency(campaign.raised_amount)}
                                    </span>
                                    <span className="text-gray-500">
                                        {formatCurrency(campaign.goal_amount)}
                                    </span>
                                </div>
                                <Button
                                    className="w-full"
                                    variant={campaign.status === 'active' ? 'default' : 'outline'}
                                    disabled={campaign.status !== 'active'}
                                    onClick={() => addToCart(campaign.id, 'campaign', campaign.title, 500)}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Sepete Ekle
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Individual Students */}
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Bireysel Ogrenciler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {mockStudents.filter(s => s.status === 'active').map((student) => (
                        <div
                            key={student.id}
                            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Users className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{student.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{student.department}</p>
                                </div>
                            </div>
                            <Progress
                                value={(student.total_donated / student.goal_amount) * 100}
                                className="h-1.5 mb-2"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mb-3">
                                <span>{formatCurrency(student.total_donated)}</span>
                                <span>{formatCurrency(student.goal_amount)}</span>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                onClick={() => addToCart(student.id, 'student', student.name, 100)}
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                Ekle
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
