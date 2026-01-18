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

export default function DonatePage() {
  const router = useRouter();
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
    
    // Prevent double submission
    if (loading || submitted) {
      return;
    }

    // Validate form
    const newErrors: Record<string, string> = {};
    const amount = parseFloat(formData.amount);
    const amountValidation = validateAmount(amount);
    
    if (!amountValidation.valid) {
      newErrors.amount = amountValidation.error || 'Invalid amount';
    }

    if (formData.donorEmail && !validateEmail(formData.donorEmail)) {
      newErrors.donorEmail = 'Please enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors in the form');
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

      toast.success(`Donation of $${amount.toFixed(2)} submitted successfully!`);
      
      // Small delay to show success message
      setTimeout(() => {
        router.push(`/donor/dashboard?donation=${donation.id}`);
      }, 500);
    } catch (error) {
      console.error('Failed to process donation:', error);
      toast.error('Failed to process donation. Please try again.');
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
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Make a Donation</h1>
          <p className="text-gray-600 mb-8">
            Support verified students and education impact. FundEd does not take a percentage from donations.
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Donation Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">Donation Amount (USD) *</Label>
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
                    placeholder="Enter amount"
                    className={errors.amount ? 'border-red-500' : ''}
                  />
                  {errors.amount && (
                    <p className="text-sm text-red-600">{errors.amount}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target">Funding Target *</Label>
                  <Select
                    required
                    value={formData.target}
                    onValueChange={(value: 'Support a verified student' | 'General education fund') =>
                      setFormData({ ...formData, target: value })
                    }
                  >
                    <SelectTrigger id="target">
                      <SelectValue placeholder="Select funding target" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Support a verified student">
                        Support a verified student
                      </SelectItem>
                      <SelectItem value="General education fund">General education fund</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="donorName">Your Name (Optional)</Label>
                  <Input
                    id="donorName"
                    type="text"
                    value={formData.donorName}
                    onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                    placeholder="Enter your name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="donorEmail">Your Email (Optional)</Label>
                  <Input
                    id="donorEmail"
                    type="email"
                    value={formData.donorEmail}
                    onChange={(e) => {
                      setFormData({ ...formData, donorEmail: e.target.value });
                      if (errors.donorEmail) setErrors({ ...errors, donorEmail: '' });
                    }}
                    placeholder="Enter your email"
                    className={errors.donorEmail ? 'border-red-500' : ''}
                  />
                  {errors.donorEmail && (
                    <p className="text-sm text-red-600">{errors.donorEmail}</p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> This is a demo donation flow. No actual payment will be processed.
                    Your contribution will be recorded for demonstration purposes.
                  </p>
                </div>

                <Button type="submit" disabled={loading || submitted} className="w-full">
                  {loading ? 'Processing...' : 'Donate (Mock)'}
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
