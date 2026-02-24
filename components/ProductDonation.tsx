'use client';

import React, { useState } from 'react';
import {
    Package,
    Laptop,
    BookOpen,
    Smartphone,
    Headphones,
    ShoppingBag,
    MapPin,
    Check,
    Truck,
    Gift,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/lib/currency-context';

interface ProductItem {
    id: string;
    name: string;
    category: string;
    icon: React.ElementType;
    description: string;
    estimatedValue: number;
    inNeed: number;
}

const productCategories = [
    { id: 'electronics', name: 'Elektronik', icon: Laptop },
    { id: 'books', name: 'Kitaplar', icon: BookOpen },
    { id: 'supplies', name: 'Kirtasiye', icon: ShoppingBag },
    { id: 'other', name: 'Diger', icon: Package },
];

const neededProducts: ProductItem[] = [
    {
        id: '1',
        name: 'Laptop',
        category: 'electronics',
        icon: Laptop,
        description: 'Öğrenciler için temel bilgisayar ihtiyacı',
        estimatedValue: 800,
        inNeed: 15,
    },
    {
        id: '2',
        name: 'Tablet',
        category: 'electronics',
        icon: Smartphone,
        description: 'Ders takibi ve notlar için',
        estimatedValue: 300,
        inNeed: 8,
    },
    {
        id: '3',
        name: 'Kulaklik',
        category: 'electronics',
        icon: Headphones,
        description: 'Online dersler için kaliteli kulaklık',
        estimatedValue: 50,
        inNeed: 25,
    },
    {
        id: '4',
        name: 'Ders Kitaplari',
        category: 'books',
        icon: BookOpen,
        description: 'Üniversite ders kitapları',
        estimatedValue: 150,
        inNeed: 40,
    },
    {
        id: '5',
        name: 'Kirtasiye Seti',
        category: 'supplies',
        icon: ShoppingBag,
        description: 'Defter, kalem ve diger kirtasiye',
        estimatedValue: 30,
        inNeed: 50,
    },
];

interface ProductDonationFormProps {
    studentName?: string;
    studentId?: string;
    className?: string;
    onSubmit?: (data: ProductDonationData) => void;
}

interface ProductDonationData {
    productId: string;
    productName: string;
    quantity: number;
    condition: 'new' | 'like_new' | 'good';
    donorName: string;
    donorEmail: string;
    donorPhone: string;
    deliveryMethod: 'ship' | 'pickup' | 'drop_off';
    address?: string;
    message?: string;
}

export function ProductDonationForm({
    studentName,
    studentId,
    className,
    onSubmit,
}: ProductDonationFormProps) {
    const { formatAmount } = useCurrency();
    const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [condition, setCondition] = useState<'new' | 'like_new' | 'good'>('new');
    const [deliveryMethod, setDeliveryMethod] = useState<'ship' | 'pickup' | 'drop_off'>('ship');
    const [donorName, setDonorName] = useState('');
    const [donorEmail, setDonorEmail] = useState('');
    const [donorPhone, setDonorPhone] = useState('');
    const [address, setAddress] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedProduct && onSubmit) {
            onSubmit({
                productId: selectedProduct.id,
                productName: selectedProduct.name,
                quantity,
                condition,
                donorName,
                donorEmail,
                donorPhone,
                deliveryMethod,
                address: deliveryMethod !== 'drop_off' ? address : undefined,
                message,
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                        <Gift className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Urun Bağışi</h3>
                        <p className="text-sm text-gray-600">
                            {studentName ? `${studentName} icin` : 'Öğrencilere'} ihtiyac duydugu urunleri bağışın
                        </p>
                    </div>
                </div>
            </div>

            {/* Product Selection */}
            <div>
                <Label className="mb-3 block">Bağışlamak Istediginiz Urun</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {neededProducts.map((product) => (
                        <button
                            key={product.id}
                            type="button"
                            onClick={() => setSelectedProduct(product)}
                            className={cn(
                                'p-4 rounded-xl border-2 text-left transition-all',
                                selectedProduct?.id === product.id
                                    ? 'border-orange-500 bg-orange-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            )}
                        >
                            <product.icon className="h-6 w-6 text-orange-600 mb-2" />
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.inNeed} öğrenci bekliyor</p>
                        </button>
                    ))}
                </div>
            </div>

            {selectedProduct && (
                <>
                    {/* Quantity & Condition */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="quantity">Adet</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min={1}
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>Durum</Label>
                            <div className="flex gap-2 mt-1">
                                {[
                                    { value: 'new', label: 'Sifir' },
                                    { value: 'like_new', label: 'Cok Iyi' },
                                    { value: 'good', label: 'Iyi' },
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setCondition(opt.value as any)}
                                        className={cn(
                                            'flex-1 py-2 rounded-lg border text-sm',
                                            condition === opt.value
                                                ? 'border-orange-500 bg-orange-50 text-orange-700'
                                                : 'border-gray-200'
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Delivery Method */}
                    <div>
                        <Label className="mb-3 block">Teslimat Yontemi</Label>
                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => setDeliveryMethod('ship')}
                                className={cn(
                                    'w-full p-4 rounded-xl border-2 flex items-center gap-3 text-left',
                                    deliveryMethod === 'ship'
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-gray-200'
                                )}
                            >
                                <Truck className="h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="font-medium">Kargo ile Gönder</p>
                                    <p className="text-xs text-gray-500">Adresinizden alinir</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setDeliveryMethod('pickup')}
                                className={cn(
                                    'w-full p-4 rounded-xl border-2 flex items-center gap-3 text-left',
                                    deliveryMethod === 'pickup'
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-gray-200'
                                )}
                            >
                                <Package className="h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="font-medium">Adresimden Alin</p>
                                    <p className="text-xs text-gray-500">Kurye adresinize gelir</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setDeliveryMethod('drop_off')}
                                className={cn(
                                    'w-full p-4 rounded-xl border-2 flex items-center gap-3 text-left',
                                    deliveryMethod === 'drop_off'
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-gray-200'
                                )}
                            >
                                <MapPin className="h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="font-medium">Teslim Noktasina Birakin</p>
                                    <p className="text-xs text-gray-500">En yakin FundEd noktasi</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Address (if needed) */}
                    {deliveryMethod !== 'drop_off' && (
                        <div>
                            <Label htmlFor="address">Adres</Label>
                            <textarea
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Kargo/kurye için adresiniz"
                                rows={2}
                                className="mt-1 w-full px-3 py-2 border rounded-lg resize-none"
                            />
                        </div>
                    )}

                    {/* Donor Info */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="donorName">Adiniz *</Label>
                            <Input
                                id="donorName"
                                required
                                value={donorName}
                                onChange={(e) => setDonorName(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="donorEmail">E-posta *</Label>
                                <Input
                                    id="donorEmail"
                                    type="email"
                                    required
                                    value={donorEmail}
                                    onChange={(e) => setDonorEmail(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="donorPhone">Telefon *</Label>
                                <Input
                                    id="donorPhone"
                                    type="tel"
                                    required
                                    value={donorPhone}
                                    onChange={(e) => setDonorPhone(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Bağış Ozeti</h4>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Urun</span>
                                <span className="font-medium">{selectedProduct.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Adet</span>
                                <span className="font-medium">{quantity}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tahmini Deger</span>
                                <span className="font-medium text-green-600">
                                    ~{formatAmount(selectedProduct.estimatedValue * quantity)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full gap-2 bg-orange-600 hover:bg-orange-700">
                        <Gift className="h-5 w-5" />
                        Urun Bağışi Yap
                    </Button>
                </>
            )}
        </form>
    );
}

// Needed Products List Component
export function NeededProductsList({ className }: { className?: string }) {
    return (
        <div className={cn('space-y-4', className)}>
            <h3 className="font-semibold text-gray-900">Ihtiyac Duyulan Urunler</h3>
            {neededProducts.map((product) => (
                <div
                    key={product.id}
                    className="bg-white rounded-xl p-4 shadow-sm border flex items-center gap-4"
                >
                    <div className="bg-orange-100 p-3 rounded-lg">
                        <product.icon className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                        <p className="text-sm text-gray-500">{product.description}</p>
                    </div>
                    <div className="text-right">
                        <Badge className="bg-orange-100 text-orange-700">
                            {product.inNeed} bekliyor
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">~${product.estimatedValue}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
