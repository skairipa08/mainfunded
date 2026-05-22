'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { projectCreateSchema } from '@/lib/validators/project'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { z } from 'zod'

type FormData = z.infer<typeof projectCreateSchema>

const STEPS = ['Temel Bilgiler', 'Ekip & Okul', 'Bütçe & Çıktı', 'Dosyalar & Gönder']

const DOMAINS = ['mühendislik', 'sağlık', 'yapay zeka', 'sürdürülebilirlik', 'sosyal etki', 'biyoteknoloji', 'eğitim', 'çevre']

const TYPE_LABELS: Record<string, string> = {
  club: 'Kulüp', team: 'Ekip', research: 'Araştırma',
  competition: 'Yarışma', social: 'Sosyal', event: 'Etkinlik', conference: 'Konferans',
}

export function ProjectWizard() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<FormData>({
    resolver: zodResolver(projectCreateSchema),
    defaultValues: {
      files: [],
      domain: [],
      expected_outputs: [''],
      timeline: [{ week: 1, task: '' }],
      budget_items: [{ name: '', amount: 0, category: '' }],
    },
  })

  const saveAsDraft = async (data: Partial<FormData>) => {
    const payload = { ...form.getValues(), ...data }
    if (savedId) {
      await fetch(`/api/projects/${savedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } else {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (json.data?.project_id) setSavedId(json.data.project_id)
      else if (json.error) throw new Error(typeof json.error === 'string' ? json.error : 'Kaydedilemedi')
    }
  }

  const handleNext = async () => {
    setError(null)
    try {
      await saveAsDraft(form.getValues())
      setStep(s => s + 1)
    } catch (e: any) {
      setError(e.message)
    }
  }

  const handleSubmit = async () => {
    if (!savedId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${savedId}/submit`, { method: 'POST' })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error?.message || 'Gönderilemedi')
      }
      router.push(`/projects/${savedId}?submitted=1`)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const domains = form.watch('domain') || []
  const toggleDomain = (d: string) => {
    const current = form.getValues('domain') || []
    if (current.includes(d)) form.setValue('domain', current.filter(x => x !== d))
    else if (current.length < 5) form.setValue('domain', [...current, d])
  }

  return (
    <div className="bg-white dark:bg-gray-900 border rounded-xl p-6 shadow-sm">
      {/* Progress indicators */}
      <div className="flex gap-2 mb-6">
        {STEPS.map((s, i) => (
          <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${i <= step ? 'bg-blue-600' : 'bg-muted'}`} />
        ))}
      </div>
      <p className="text-sm font-medium text-muted-foreground mb-6">
        Adım {step + 1} / {STEPS.length} — {STEPS[step]}
      </p>

      {/* Step 0: Basic Info */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Proje Adı *</label>
            <Input {...form.register('title')} placeholder="Projenizin adı" />
            {form.formState.errors.title && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Açıklama *</label>
            <Textarea {...form.register('description')} placeholder="Projenizi detaylıca açıklayın (min. 20 karakter)" rows={5} />
            {form.formState.errors.description && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.description.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Proje Tipi *</label>
            <Select onValueChange={v => form.setValue('type', v as any)}>
              <SelectTrigger><SelectValue placeholder="Tip seçin" /></SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Alan(lar) * (en fazla 5)</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {DOMAINS.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDomain(d)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    domains.includes(d)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-gray-800 text-foreground border-border hover:border-blue-400'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Tanıtım Videosu (isteğe bağlı)</label>
            <Input {...form.register('video_url')} placeholder="https://youtube.com/..." />
          </div>
        </div>
      )}

      {/* Step 1: Team & School */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Okul Adı *</label>
              <Input {...form.register('school_name')} placeholder="İstanbul Teknik Üniversitesi" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Okul Email *</label>
              <Input {...form.register('school_email')} placeholder="proje@itu.edu.tr" type="email" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Okul Seviyesi *</label>
              <Select onValueChange={v => form.setValue('school_level', v as any)}>
                <SelectTrigger><SelectValue placeholder="Seviye" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high_school">Lise</SelectItem>
                  <SelectItem value="university">Üniversite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Kulüp / Ekip Adı</label>
              <Input {...form.register('club_name')} placeholder="Robotik Kulübü" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Şehir</label>
            <Input {...form.register('city')} placeholder="İstanbul" />
          </div>
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3">Danışman Hoca (öğrenci projeleri için zorunlu)</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Danışman Adı</label>
                <Input {...form.register('advisor_name')} placeholder="Prof. Dr. Ad Soyad" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Danışman Email</label>
                <Input {...form.register('advisor_email')} placeholder="hoca@university.edu.tr" type="email" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Budget & Outputs */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-1 block">Hedef Bütçe (₺) *</label>
            <Input
              type="number"
              {...form.register('target_budget', { valueAsNumber: true })}
              placeholder="50000"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Bütçe Kalemleri * (min. 3 tavsiye edilir)</label>
            <BudgetItemsField form={form} />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Beklenen Çıktılar *</label>
            <OutputsField form={form} />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Zaman Çizelgesi * (haftalık aşamalar)</label>
            <TimelineField form={form} />
          </div>
        </div>
      )}

      {/* Step 3: Files & Submit */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">Dosya Yükleme</p>
            <p>Proje belgelerinizi (proje planı, bütçe tablosu, okul yazısı vb.) Cloudinary üzerinden yükleyin ve URL&apos;leri girin.</p>
          </div>
          <FilesField form={form} />
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Başvurunuzu gönderdikten sonra danışman hocanıza onay maili gönderilecek.
              Admin incelemesinden sonra projeniz yayınlanacak.
            </p>
            <Button onClick={handleSubmit} disabled={loading || !savedId} className="w-full">
              {loading ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
            </Button>
            {!savedId && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Göndermek için önce önceki adımları kaydedin.
              </p>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6 pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
        >
          Geri
        </Button>
        {step < STEPS.length - 1 && (
          <Button onClick={handleNext} disabled={loading}>
            {loading ? 'Kaydediliyor...' : 'İleri'}
          </Button>
        )}
      </div>
    </div>
  )
}

function BudgetItemsField({ form }: { form: any }) {
  const items = form.watch('budget_items') || []
  return (
    <div className="space-y-2">
      {items.map((_: any, i: number) => (
        <div key={i} className="grid grid-cols-3 gap-2">
          <Input {...form.register(`budget_items.${i}.name`)} placeholder="Kalem adı" />
          <Input {...form.register(`budget_items.${i}.amount`, { valueAsNumber: true })} placeholder="Tutar" type="number" />
          <Input {...form.register(`budget_items.${i}.category`)} placeholder="Kategori" />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => form.setValue('budget_items', [...items, { name: '', amount: 0, category: '' }])}
      >
        + Kalem Ekle
      </Button>
    </div>
  )
}

function OutputsField({ form }: { form: any }) {
  const outputs = form.watch('expected_outputs') || []
  return (
    <div className="space-y-2">
      {outputs.map((_: any, i: number) => (
        <Input key={i} {...form.register(`expected_outputs.${i}`)} placeholder={`Çıktı ${i + 1}`} />
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => form.setValue('expected_outputs', [...outputs, ''])}
      >
        + Çıktı Ekle
      </Button>
    </div>
  )
}

function TimelineField({ form }: { form: any }) {
  const items = form.watch('timeline') || []
  return (
    <div className="space-y-2">
      {items.map((_: any, i: number) => (
        <div key={i} className="grid grid-cols-4 gap-2">
          <Input
            {...form.register(`timeline.${i}.week`, { valueAsNumber: true })}
            placeholder="Hafta"
            type="number"
            className="col-span-1"
          />
          <Input
            {...form.register(`timeline.${i}.task`)}
            placeholder="Görev / aşama açıklaması"
            className="col-span-3"
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => form.setValue('timeline', [...items, { week: items.length + 1, task: '' }])}
      >
        + Aşama Ekle
      </Button>
    </div>
  )
}

function FilesField({ form }: { form: any }) {
  const files = form.watch('files') || []
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium block">Dosya URL&apos;leri (Cloudinary)</label>
      {files.map((_: any, i: number) => (
        <Input key={i} {...form.register(`files.${i}`)} placeholder="https://res.cloudinary.com/..." />
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => form.setValue('files', [...files, ''])}
      >
        + Dosya Ekle
      </Button>
    </div>
  )
}
