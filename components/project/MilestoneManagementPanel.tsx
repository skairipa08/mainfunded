'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import type { Milestone } from '@/types/projects'

const STATUS_LABELS: Record<string, string> = {
  Locked: 'Kilitli',
  EvidenceRequired: 'Kanıt Bekleniyor',
  UnlockRequested: 'Onay Bekleniyor',
  Approved: 'Onaylandı',
  Paid: 'Ödendi',
}

interface EvidenceForm { files: string; note: string }

export function MilestoneManagementPanel({ projectId }: { projectId: string }) {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [evidenceForms, setEvidenceForms] = useState<Record<string, EvidenceForm>>({})
  const [messages, setMessages] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch(`/api/projects/${projectId}/milestones`)
      .then(r => r.json())
      .then(j => { setMilestones(j.data || []); setLoading(false) })
  }, [projectId])

  const setForm = (id: string, field: keyof EvidenceForm, value: string) => {
    setEvidenceForms(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }

  const uploadEvidence = async (milestoneId: string) => {
    const f = evidenceForms[milestoneId]
    if (!f?.files || !f?.note) {
      setMessages(prev => ({ ...prev, [milestoneId]: 'Dosya URL ve not gerekli' }))
      return
    }
    setSubmitting(milestoneId)
    const res = await fetch(`/api/projects/${projectId}/milestones/${milestoneId}/evidence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        evidence_files: f.files.split('\n').map(s => s.trim()).filter(Boolean),
        evidence_note: f.note,
      }),
    })
    const json = await res.json()
    setSubmitting(null)
    setMessages(prev => ({
      ...prev,
      [milestoneId]: res.ok ? 'Kanıt yüklendi.' : json.error?.message || 'Hata oluştu',
    }))
  }

  const requestUnlock = async (milestoneId: string) => {
    setSubmitting(milestoneId)
    const res = await fetch(`/api/projects/${projectId}/milestones/${milestoneId}/request`, { method: 'POST' })
    const json = await res.json()
    setSubmitting(null)
    if (res.ok) {
      const updated = await fetch(`/api/projects/${projectId}/milestones`).then(r => r.json())
      setMilestones(updated.data || [])
      setMessages(prev => ({ ...prev, [milestoneId]: 'Kilit açma talebi gönderildi.' }))
    } else {
      setMessages(prev => ({ ...prev, [milestoneId]: json.error?.message || 'Hata oluştu' }))
    }
  }

  if (loading) return <div className="h-32 animate-pulse bg-muted rounded-xl" />

  return (
    <div className="space-y-4">
      {milestones.map(ms => (
        <div key={ms.milestone_id} className="border rounded-xl p-5 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="font-semibold">{ms.title}</span>
              <span className="ml-2 text-xs text-muted-foreground">(%{ms.percentage} ödeme)</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium">
              {STATUS_LABELS[ms.status] ?? ms.status}
            </span>
          </div>

          {ms.description && (
            <p className="text-sm text-muted-foreground mb-3">{ms.description}</p>
          )}

          {ms.status === 'EvidenceRequired' && (
            <div className="space-y-2 border-t pt-3">
              <p className="text-sm font-medium">Kanıt Yükle</p>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Dosya URL&apos;leri (her satıra bir tane, Cloudinary)
                </label>
                <Textarea
                  rows={3}
                  placeholder="https://res.cloudinary.com/..."
                  value={evidenceForms[ms.milestone_id]?.files ?? ''}
                  onChange={e => setForm(ms.milestone_id, 'files', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Açıklama notu (min. 10 karakter)</label>
                <Textarea
                  rows={2}
                  placeholder="Kanıt hakkında açıklama..."
                  value={evidenceForms[ms.milestone_id]?.note ?? ''}
                  onChange={e => setForm(ms.milestone_id, 'note', e.target.value)}
                />
              </div>
              <Button
                size="sm"
                onClick={() => uploadEvidence(ms.milestone_id)}
                disabled={submitting === ms.milestone_id}
              >
                {submitting === ms.milestone_id ? 'Yükleniyor...' : 'Kanıt Gönder'}
              </Button>
            </div>
          )}

          {ms.status === 'EvidenceRequired' && ms.evidence_files && ms.evidence_files.length > 0 && (
            <div className="border-t pt-3 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => requestUnlock(ms.milestone_id)}
                disabled={submitting === ms.milestone_id}
              >
                {submitting === ms.milestone_id ? 'Gönderiliyor...' : 'Kilit Açma Talebi Gönder'}
              </Button>
            </div>
          )}

          {ms.status === 'UnlockRequested' && (
            <div className="border-t pt-3 mt-3 text-sm text-blue-600 dark:text-blue-400">
              Admin inceliyor — sonuç bekleniyor.
            </div>
          )}

          {ms.status === 'Approved' && (
            <div className="border-t pt-3 mt-3 text-sm text-green-600 dark:text-green-400">
              Onaylandı. Ödeme işleme alındı.
            </div>
          )}

          {ms.status === 'Paid' && (
            <div className="border-t pt-3 mt-3 text-sm text-emerald-600 dark:text-emerald-400">
              ✓ Ödeme tamamlandı.
            </div>
          )}

          {messages[ms.milestone_id] && (
            <p className="text-xs mt-2 text-muted-foreground">{messages[ms.milestone_id]}</p>
          )}
        </div>
      ))}
    </div>
  )
}
