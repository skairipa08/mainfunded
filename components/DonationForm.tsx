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
import { useTranslation } from '@/lib/i18n/context';
import { useCurrency } from '@/lib/currency-context';

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
    amount: number; // always in USD
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
    const { t } = useTranslation();
    const { currency, currencySymbol, formatAmount, toUSD, presetAmounts } = useCurrency();
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
    const effectiveAmountUSD = currency === 'TRY' ? toUSD(effectiveAmount) : effectiveAmount;
    const matchedAmount = useMatching ? effectiveAmount * matchingMultiplier : effectiveAmount;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const minAmount = currency === 'TRY' ? 100 : 10;
        if (effectiveAmount < minAmount) {
            alert(t?.('donationForm.errorMinAmount', { amount: `${currencySymbol}${minAmount}` }) || `Lütfen en az ${minAmount} ${currencySymbol} tutarında bir bağış girin.`);
            return;
        }

        if (onSubmit) {
            onSubmit({
                amount: effectiveAmountUSD,
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
                    <p className="font-medium">{t('donationForm.oneTime')}</p>
                    <p className="text-xs text-gray-500">{t('donationForm.oneTimeDesc')}</p>
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
                        {t('donationForm.recommended')}
                    </span>
                    <RefreshCcw className="h-6 w-6 mx-auto mb-2" />
                    <p className="font-medium">{t('donationForm.recurring')}</p>
                    <p className="text-xs text-gray-500">{t('donationForm.recurringDesc')}</p>
                </button>
            </div>

            {/* Recurring Frequency */}
            {donationType === 'recurring' && (
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                    <Label className="text-purple-700 mb-3 block">{t('donationForm.frequency')}</Label>
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
                            <span>{t('donationForm.monthly')}</span>
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
                            <span>{t('donationForm.quarterly')}</span>
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
                            <span>{t('donationForm.yearly')}</span>
                        </label>
                    </div>
                </div>
            )}

            {/* Preset Amounts */}
            <div>
                <Label className="mb-3 block">{t('donationForm.amount')}</Label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                    {presetAmounts.map((preset, idx) => (
                        <button
                            key={preset}
                            type="button"
                            onClick={() => {
                                setAmount(preset);
                                setCustomAmount('');
                            }}
                            className={cn(
                                'py-3 px-2 rounded-lg border-2 font-medium transition-all flex flex-col items-center justify-center',
                                amount === preset && !customAmount
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-gray-300'
                            )}
                        >
                            <span>{currencySymbol}{preset.toLocaleString()}</span>
                            {currency === 'TRY' && (
                                <span className="text-[10px] text-gray-400 font-normal mt-0.5">
                                    (${Math.round(toUSD(preset)).toLocaleString('en-US')})
                                </span>
                            )}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{currencySymbol}</span>
                    <Input
                        type="number"
                        placeholder={t('donationForm.customAmount')}
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="pl-7"
                    />
                    {currency === 'TRY' && customAmount && parseFloat(customAmount) > 0 && (
                        <p className="text-xs text-gray-400 mt-1 text-right">
                            ≈ ${Math.round(toUSD(parseFloat(customAmount))).toLocaleString('en-US')} USD
                        </p>
                    )}
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
                                <h4 className="font-semibold text-green-800">{t('donationForm.matchingGift')}</h4>
                                <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                                    {matchingMultiplier}x
                                </span>
                            </div>
                            <p className="text-sm text-green-700 mb-3">
                                {t('donationForm.matchingDesc', {
                                    partner: matchingPartner || 'Corporate sponsor',
                                    multiplier: String(matchingMultiplier),
                                })}
                            </p>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                    checked={useMatching}
                                    onCheckedChange={(checked) => setUseMatching(!!checked)}
                                />
                                <span className="text-green-700">{t('donationForm.joinMatching')}</span>
                            </label>
                        </div>
                    </div>
                    {useMatching && (
                        <div className="mt-3 pt-3 border-t border-green-200 text-center">
                            <p className="text-sm text-green-600">{t('donationForm.totalImpact')}:</p>
                            <p className="text-2xl font-bold text-green-800">
                                {currencySymbol}{matchedAmount.toLocaleString()}
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
                    <span>{t('donationForm.donateAnonymously')}</span>
                </div>

                {!isAnonymous && (
                    <div>
                        <Label htmlFor="donorName">{t('donationForm.yourName')}</Label>
                        <Input
                            id="donorName"
                            value={donorName}
                            onChange={(e) => setDonorName(e.target.value)}
                            placeholder={t('donationForm.namePlaceholder')}
                            className="mt-1"
                        />
                    </div>
                )}

                <div>
                    <Label htmlFor="donorEmail">{t('donationForm.email')}</Label>
                    <Input
                        id="donorEmail"
                        type="email"
                        required
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        placeholder={t('donationForm.emailPlaceholder')}
                        className="mt-1"
                    />
                </div>

                <div>
                    <Label htmlFor="message">{t('donationForm.message')}</Label>
                    <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t('donationForm.messagePlaceholder')}
                        rows={3}
                        className="mt-1 w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                    <span className="text-gray-600">{t('donationForm.summaryAmount')}</span>
                    <span className="font-medium">{currencySymbol}{effectiveAmount.toLocaleString()}</span>
                </div>
                {useMatching && (
                    <div className="flex justify-between text-green-600">
                        <span>{t('donationForm.matchingBonus')}</span>
                        <span>+{currencySymbol}{((matchingMultiplier - 1) * effectiveAmount).toLocaleString()}</span>
                    </div>
                )}
                {donationType === 'recurring' && (
                    <div className="flex justify-between text-purple-600">
                        <span>{t('donationForm.frequencySummary')}</span>
                        <span>
                            {frequency === 'monthly' ? t('donationForm.everyMonth') : frequency === 'quarterly' ? t('donationForm.every3Months') : t('donationForm.yearly')}
                        </span>
                    </div>
                )}
                <div className="pt-2 border-t flex justify-between text-lg font-bold">
                    <span>{t('donationForm.totalImpact')}</span>
                    <span className="text-blue-600">{currencySymbol}{matchedAmount.toLocaleString()}</span>
                </div>
            </div>

            {/* Submit */}
            <Button type="submit" size="lg" className="w-full gap-2">
                <Heart className="h-5 w-5" />
                {donationType === 'recurring' ? t('donationForm.submitRecurring') : t('donationForm.submitOneTime')}
            </Button>

            <p className="text-xs text-gray-500 text-center">
                {t('donationForm.securePayment')}
            </p>
        </form>
    );
}
