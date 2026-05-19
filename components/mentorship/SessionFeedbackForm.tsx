'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface SessionFeedbackFormProps {
  sessionId: string;
  mentorUserId: string;
}

interface FeedbackState {
  rating: number;
  goalClarity: number;
  communication: number;
  helpfulness: number;
  comment: string;
}

const initialState: FeedbackState = {
  rating: 5,
  goalClarity: 5,
  communication: 5,
  helpfulness: 5,
  comment: '',
};

export function SessionFeedbackForm({ sessionId, mentorUserId }: SessionFeedbackFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FeedbackState>(initialState);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/mentorship/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          mentor_user_id: mentorUserId,
          rating: form.rating,
          goal_clarity: form.goalClarity,
          communication: form.communication,
          helpfulness: form.helpfulness,
          comment: form.comment,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error?.message || 'Geri bildirim gönderilemedi.');
      }

      toast.success('Geri bildiriminiz başarıyla gönderildi.');
      setForm(initialState);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border p-4">
      <div>
        <h3 className="text-lg font-semibold">Seans Geri Bildirimi</h3>
        <p className="text-sm text-muted-foreground">Mentorluk kalitesini artırmak için geri bildiriminiz önemli.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="rating">Genel Puan (1-5)</Label>
          <Input id="rating" type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm((prev) => ({ ...prev, rating: Number(e.target.value) }))} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="goalClarity">Hedef Netliği (1-5)</Label>
          <Input id="goalClarity" type="number" min={1} max={5} value={form.goalClarity} onChange={(e) => setForm((prev) => ({ ...prev, goalClarity: Number(e.target.value) }))} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="communication">İletişim (1-5)</Label>
          <Input id="communication" type="number" min={1} max={5} value={form.communication} onChange={(e) => setForm((prev) => ({ ...prev, communication: Number(e.target.value) }))} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="helpfulness">Faydalılık (1-5)</Label>
          <Input id="helpfulness" type="number" min={1} max={5} value={form.helpfulness} onChange={(e) => setForm((prev) => ({ ...prev, helpfulness: Number(e.target.value) }))} required />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="comment">Yorum</Label>
        <Textarea
          id="comment"
          rows={4}
          value={form.comment}
          onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))}
          placeholder="Mentorluk seansı size nasıl katkı sağladı?"
          minLength={10}
          maxLength={800}
        />
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Gönderiliyor...' : 'Geri Bildirimi Gönder'}
      </Button>
    </form>
  );
}
