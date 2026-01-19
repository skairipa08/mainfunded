'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createDonation } from '@/lib/mockDb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { validateAmount, sanitizeInput, validateEmail } from '@/lib/validation';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n';

export default function DonatePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    amount: '',
    target: 'Support a verified student' as 'Support a verified student' | 'General education fund',
    donorName: '',
    donorEmail: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading || submitted) {
      return;
    }

    const newErrors: Record<string, string> = {};
    const amount = parseFloat(formData.amount);
    const amountValidation = validateAmount(amount);

    if (!amountValidation.valid) {
      newErrors.amount = amountValidation.error || t('common.error');
    }

    if (formData.donorEmail && !validateEmail(formData.donorEmail)) {
      newErrors.donorEmail = t('common.error');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error(t('common.error'));
      return;
    }

    setLoading(true);
    setSubmitted(true);

    try {
      const donation = createDonation({
        amount,
        target: formData.target,
        donorName: formData.donorName ? sanitizeInput(formData.donorName) : undefined,
        donorEmail: formData.donorEmail ? formData.donorEmail.trim().toLowerCase() : undefined,
      });

      toast.success(t('donation.success'));

      setTimeout(() => {
        router.push(`/donor/dashboard?donation=${donation.id}`);
      }, 500);
    } catch (error) {
      console.error('Failed to process donation:', error);
      toast.error(t('donation.error'));
      setSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">{t('donation.title')}</h1>
          <p className="text-gray-600 mb-8">
            {t('home.hero.subtitle')}
          </p>

          <Card>
            <CardHeader>
              <CardTitle>{t('donation.amount')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">{t('donation.amount')} (USD) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={formData.amount}
                    onChange={(e) => {
                      setFormData({ ...formData, amount: e.target.value });
                      if (errors.amount) setErrors({ ...errors, amount: '' });
                    }}
                    placeholder={t('donation.customAmount')}
                    className={errors.amount ? 'border-red-500' : ''}
                  />
                  {errors.amount && (
                    <p className="text-sm text-red-600">{errors.amount}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target">{t('campaign.category')} *</Label>
                  <Select
                    required
                    value={formData.target}
                    onValueChange={(value: 'Support a verified student' | 'General education fund') =>
                      setFormData({ ...formData, target: value })
                    }
                  >
                    <SelectTrigger id="target">
                      <SelectValue placeholder={t('campaign.category')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Support a verified student">
                        {t('campaign.verified')}
                      </SelectItem>
                      <SelectItem value="General education fund">{t('nav.campaigns')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="donorName">{t('verification.form.firstName')} ({t('donation.anonymous')})</Label>
                  <Input
                    id="donorName"
                    type="text"
                    value={formData.donorName}
                    onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                    placeholder={t('verification.form.firstName')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="donorEmail">Email ({t('donation.anonymous')})</Label>
                  <Input
                    id="donorEmail"
                    type="email"
                    value={formData.donorEmail}
                    onChange={(e) => {
                      setFormData({ ...formData, donorEmail: e.target.value });
                      if (errors.donorEmail) setErrors({ ...errors, donorEmail: '' });
                    }}
                    placeholder="Email"
                    className={errors.donorEmail ? 'border-red-500' : ''}
                  />
                  {errors.donorEmail && (
                    <p className="text-sm text-red-600">{errors.donorEmail}</p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> {t('donation.message')}
                  </p>
                </div>

                <Button type="submit" disabled={loading || submitted} className="w-full">
                  {loading ? t('donation.processing') : t('campaign.donate')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
