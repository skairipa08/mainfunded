'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

const DOMAINS = [
  'mühendislik', 'sağlık', 'yapay zeka', 'sürdürülebilirlik', 'sosyal etki', 'biyoteknoloji',
]

const TYPES = [
  { value: 'club', label: 'Kulüp' },
  { value: 'team', label: 'Ekip' },
  { value: 'research', label: 'Araştırma' },
  { value: 'competition', label: 'Yarışma' },
  { value: 'social', label: 'Sosyal' },
  { value: 'event', label: 'Etkinlik' },
  { value: 'conference', label: 'Konferans' },
]

export function ProjectFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all' || !value) params.delete(key)
    else params.set(key, value)
    params.set('page', '1')
    router.push(`/projects?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <Input
        placeholder="Proje ara..."
        className="w-48"
        defaultValue={searchParams.get('search') || ''}
        onChange={e => update('search', e.target.value)}
      />
      <Select
        onValueChange={v => update('type', v)}
        defaultValue={searchParams.get('type') || 'all'}
      >
        <SelectTrigger className="w-36"><SelectValue placeholder="Tip" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tüm Tipler</SelectItem>
          {TYPES.map(t => (
            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        onValueChange={v => update('domain', v)}
        defaultValue={searchParams.get('domain') || 'all'}
      >
        <SelectTrigger className="w-40"><SelectValue placeholder="Alan" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tüm Alanlar</SelectItem>
          {DOMAINS.map(d => (
            <SelectItem key={d} value={d}>{d}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        onValueChange={v => update('school_level', v)}
        defaultValue={searchParams.get('school_level') || 'all'}
      >
        <SelectTrigger className="w-36"><SelectValue placeholder="Seviye" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tümü</SelectItem>
          <SelectItem value="high_school">Lise</SelectItem>
          <SelectItem value="university">Üniversite</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
