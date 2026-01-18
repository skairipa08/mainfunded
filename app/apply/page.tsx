'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { createStudentApplication } from '@/lib/mockDb';
import { validateEmail, sanitizeInput } from '@/lib/validation';
import { toast } from 'sonner';

export default function ApplyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    country: '',
    educationLevel: '',
    needSummary: '',
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    if (!formData.educationLevel) {
      newErrors.educationLevel = 'Education level is required';
    }

    if (!formData.needSummary.trim()) {
      newErrors.needSummary = 'Need summary is required';
    } else if (formData.needSummary.trim().length < 10) {
      newErrors.needSummary = 'Need summary must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (loading || submitted) {
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    setSubmitted(true);

    try {
      const application = createStudentApplication({
        fullName: sanitizeInput(formData.fullName),
        email: formData.email.trim().toLowerCase(),
        country: sanitizeInput(formData.country),
        educationLevel: formData.educationLevel,
        needSummary: sanitizeInput(formData.needSummary),
      });

      toast.success('Application submitted successfully!');
      
      // Small delay to show success message
      setTimeout(() => {
        router.push(`/student/status?id=${application.id}`);
      }, 500);
    } catch (error) {
      console.error('Failed to submit application:', error);
      toast.error('Failed to submit application. Please try again.');
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
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Student Application</h1>
          <p className="text-gray-600 mb-8">
            Apply for verified education funding. We verify students before funding to ensure accountability and transparency.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => {
                  setFormData({ ...formData, fullName: e.target.value });
                  if (errors.fullName) setErrors({ ...errors, fullName: '' });
                }}
                placeholder="Enter your full name"
                className={errors.fullName ? 'border-red-500' : ''}
              />
              {errors.fullName && (
                <p className="text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                placeholder="Enter your email address"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                type="text"
                required
                value={formData.country}
                onChange={(e) => {
                  setFormData({ ...formData, country: e.target.value });
                  if (errors.country) setErrors({ ...errors, country: '' });
                }}
                placeholder="Enter your country"
                className={errors.country ? 'border-red-500' : ''}
              />
              {errors.country && (
                <p className="text-sm text-red-600">{errors.country}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="educationLevel">Education Level *</Label>
              <Select
                required
                value={formData.educationLevel}
                onValueChange={(value) => {
                  setFormData({ ...formData, educationLevel: value });
                  if (errors.educationLevel) setErrors({ ...errors, educationLevel: '' });
                }}
              >
                <SelectTrigger id="educationLevel" className={errors.educationLevel ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High School">High School</SelectItem>
                  <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                  <SelectItem value="Graduate">Graduate</SelectItem>
                  <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                  <SelectItem value="Vocational">Vocational</SelectItem>
                </SelectContent>
              </Select>
              {errors.educationLevel && (
                <p className="text-sm text-red-600">{errors.educationLevel}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="needSummary">Need Summary *</Label>
              <Textarea
                id="needSummary"
                required
                value={formData.needSummary}
                onChange={(e) => {
                  setFormData({ ...formData, needSummary: e.target.value });
                  if (errors.needSummary) setErrors({ ...errors, needSummary: '' });
                }}
                placeholder="Describe your educational need and how funding would help"
                rows={6}
                className={errors.needSummary ? 'border-red-500' : ''}
              />
              {errors.needSummary && (
                <p className="text-sm text-red-600">{errors.needSummary}</p>
              )}
            </div>

            <Button type="submit" disabled={loading || submitted} className="w-full">
              {loading ? 'Submitting...' : 'Submit Application'}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
