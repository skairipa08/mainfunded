'use client';

import React, { useState } from 'react';
import {
    Calendar,
    CreditCard,
    RefreshCcw,
    Gift,
    Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface DonationFormProps {
    studentName?: string;
    studentId?: string;
    campaignId?: string;
    goalAmount?: number;
    raisedAmount?: number;
    matchingEnabled?: boolean;
    matchingMultiplier?: number;
    matchingPartner?: string;
    className?: string;
    onSubmit?: (data: DonationData) => void;
}

interface DonationData {
    amount: number;
    isRecurring: boolean;
    frequency?: 'monthly' | 'quarterly' | 'yearly';
    isAnonymous: boolean;
    donorName?: string;
    donorEmail: string;
    message?: string;
    useMatching: boolean;
}

const PRESET_AMOUNTS = [25, 50, 100, 250, 500, 1000];

export function DonationForm({
    studentName,
    studentId,
    campaignId,
    goalAmount,
    raisedAmount,
    matchingEnabled = false,
    matchingMultiplier = 2,
    matchingPartner,
    className,
    onSubmit,
}: DonationFormProps) {
    const [donationType, setDonationType] = useState<'one-time' | 'recurring'>('one-time');
    const [amount, setAmount] = useState<number>(100);
    const [customAmount, setCustomAmount] = useState('');
    const [frequency, setFrequency] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [useMatching, setUseMatching] = useState(matchingEnabled);
    const [donorName, setDonorName] = useState('');
    const [donorEmail, setDonorEmail] = useState('');
    const [message, setMessage] = useState('');

    const effectiveAmount = customAmount ? parseFloat(customAmount) : amount;
    const matchedAmount = useMatching ? effectiveAmount * matchingMultiplier : effectiveAmount;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit({
                amount: effectiveAmount,
                isRecurring: donationType === 'recurring',
                frequency: donationType === 'recurring' ? frequency : undefined,
                isAnonymous,
                donorName: isAnonymous ? undefined : donorName,
                donorEmail,
                message,
                useMatching,
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
            {/* Donation Type Toggle */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={() => setDonationType('one-time')}
                    className={cn(
                        'p-4 rounded-xl border-2 text-center transition-all',
                        donationType === 'one-time'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                    )}
                >
                    <CreditCard className="h-6 w-6 mx-auto mb-2" />
                    <p className="font-medium">Tek Seferlik</p>
                    <p className="text-xs text-gray-500">Bir defalik bagis</p>
                </button>
                <button
                    type="button"
                    onClick={() => setDonationType('recurring')}
                    className={cn(
                        'p-4 rounded-xl border-2 text-center transition-all relative overflow-hidden',
                        donationType === 'recurring'
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-gray-300'
                    )}
                >
                    <span className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                        Onerilen
                    </span>
                    <RefreshCcw className="h-6 w-6 mx-auto mb-2" />
                    <p className="font-medium">Aylik Bagis</p>
                    <p className="text-xs text-gray-500">Duzenli destek</p>
                </button>
            </div>

            {/* Recurring Frequency */}
            {donationType === 'recurring' && (
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                    <Label className="text-purple-700 mb-3 block">Bagis Sikligi</Label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="frequency"
                                value="monthly"
                                checked={frequency === 'monthly'}
                                onChange={() => setFrequency('monthly')}
                                className="accent-purple-600"
                            />
                            <span>Aylik</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="frequency"
                                value="quarterly"
                                checked={frequency === 'quarterly'}
                                onChange={() => setFrequency('quarterly')}
                                className="accent-purple-600"
                            />
                            <span>3 Ayda Bir</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="frequency"
                                value="yearly"
                                checked={frequency === 'yearly'}
                                onChange={() => setFrequency('yearly')}
                                className="accent-purple-600"
                            />
                            <span>Yillik</span>
                        </label>
                    </div>
                </div>
            )}

            {/* Preset Amounts */}
            <div>
                <Label className="mb-3 block">Bagis Tutari</Label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                    {PRESET_AMOUNTS.map((preset) => (
                        <button
                            key={preset}
                            type="button"
                            onClick={() => {
                                setAmount(preset);
                                setCustomAmount('');
                            }}
                            className={cn(
                                'py-3 rounded-lg border-2 font-medium transition-all',
                                amount === preset && !customAmount
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-gray-300'
                            )}
                        >
                            ${preset}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input
                        type="number"
                        placeholder="Ozel tutar"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="pl-7"
                    />
                </div>
            </div>

            {/* Matching Gift */}
            {matchingEnabled && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-start gap-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                            <Gift className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-green-800">Matching Gift</h4>
                                <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                                    {matchingMultiplier}x
                                </span>
                            </div>
                            <p className="text-sm text-green-700 mb-3">
                                {matchingPartner || 'Kurumsal sponsor'} bagisinizi {matchingMultiplier} katina cikariyor!
                            </p>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                    checked={useMatching}
                                    onCheckedChange={(checked) => setUseMatching(!!checked)}
                                />
                                <span className="text-green-700">Matching programina katil</span>
                            </label>
                        </div>
                    </div>
                    {useMatching && (
                        <div className="mt-3 pt-3 border-t border-green-200 text-center">
                            <p className="text-sm text-green-600">Toplam etki:</p>
                            <p className="text-2xl font-bold text-green-800">
                                ${matchedAmount.toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Donor Info */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Checkbox
                        checked={isAnonymous}
                        onCheckedChange={(checked) => setIsAnonymous(!!checked)}
                    />
                    <span>Anonim olarak bagis yap</span>
                </div>

                {!isAnonymous && (
                    <div>
                        <Label htmlFor="donorName">Adiniz (opsiyonel)</Label>
                        <Input
                            id="donorName"
                            value={donorName}
                            onChange={(e) => setDonorName(e.target.value)}
                            placeholder="Adiniz Soyadiniz"
                            className="mt-1"
                        />
                    </div>
                )}

                <div>
                    <Label htmlFor="donorEmail">E-posta *</Label>
                    <Input
                        id="donorEmail"
                        type="email"
                        required
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        placeholder="ornek@email.com"
                        className="mt-1"
                    />
                </div>

                <div>
                    <Label htmlFor="message">Mesaj (opsiyonel)</Label>
                    <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ogrenciye bir mesaj birakin..."
                        rows={3}
                        className="mt-1 w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                    <span className="text-gray-600">Bagis Tutari</span>
                    <span className="font-medium">${effectiveAmount.toLocaleString()}</span>
                </div>
                {useMatching && (
                    <div className="flex justify-between text-green-600">
                        <span>Matching Bonus</span>
                        <span>+${((matchingMultiplier - 1) * effectiveAmount).toLocaleString()}</span>
                    </div>
                )}
                {donationType === 'recurring' && (
                    <div className="flex justify-between text-purple-600">
                        <span>Siklik</span>
                        <span>
                            {frequency === 'monthly' ? 'Her Ay' : frequency === 'quarterly' ? '3 Ayda Bir' : 'Yillik'}
                        </span>
                    </div>
                )}
                <div className="pt-2 border-t flex justify-between text-lg font-bold">
                    <span>Toplam Etki</span>
                    <span className="text-blue-600">${matchedAmount.toLocaleString()}</span>
                </div>
            </div>

            {/* Submit */}
            <Button type="submit" size="lg" className="w-full gap-2">
                <Heart className="h-5 w-5" />
                {donationType === 'recurring' ? 'Aylik Bagis Baslat' : 'Bagis Yap'}
            </Button>

            <p className="text-xs text-gray-500 text-center">
                Odemeniz guvenli bir sekilde Stripe uzerinden islenecektir.
            </p>
        </form>
    );
}
