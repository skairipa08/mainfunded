'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { RiskScoreBadge } from './RiskScoreBadge'

const STATUS_OPTIONS = [
  { value: 'Pending', label: 'Bekleyen' },
  { value: 'Published', label: 'Yayında' },
  { value: 'Rejected', label: 'Reddedilen' },
  { value: 'Suspended', label: 'Askıya Alınan' },
]

export function AdminProjectsPanel() {
  const [projects, setProjects] = useState<any[]>([])
  const [status, setStatus] = useState('Pending')
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/projects?status=${status}`)
    const json = await res.json()
    setProjects(json.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [status])

  const handleVerify = async (id: string) => {
    if (!confirm('Projeyi onaylamak istiyor musunuz?')) return
    await fetch(`/api/admin/projects/${id}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve' }),
    })
    load()
  }

  const handleReject = async (id: string) => {
    const reason = prompt('Red sebebi:')
    if (!reason) return
    await fetch(`/api/admin/projects/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rejection_reason: reason }),
    })
    load()
  }

  const handleSuspend = async (id: string) => {
    if (!confirm('Projeyi askıya almak istiyor musunuz?')) return
    await fetch(`/api/admin/projects/${id}/suspend`, { method: 'POST' })
    load()
  }

  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_OPTIONS.map(s => (
          <Button
            key={s.value}
            variant={status === s.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatus(s.value)}
          >
            {s.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse bg-muted rounded-lg" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <p className="text-muted-foreground text-sm py-12 text-center">Bu durumda proje yok.</p>
      ) : (
        <div className="space-y-3">
          {projects.map((p: any) => (
            <div key={p.project_id} className="border rounded-lg p-4 flex items-center justify-between gap-4 bg-white dark:bg-gray-900">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Link
                    href={`/projects/${p.project_id}`}
                    className="font-medium text-sm hover:text-blue-600 truncate"
                  >
                    {p.title}
                  </Link>
                  {p.risk_score !== undefined && <RiskScoreBadge score={p.risk_score} />}
                </div>
                <p className="text-xs text-muted-foreground">
                  {p.school_name} · {p.type} · {p.school_level === 'high_school' ? 'Lise' : 'Üniversite'}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {status === 'Pending' && (
                  <>
                    <Button size="sm" onClick={() => handleVerify(p.project_id)}>Onayla</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReject(p.project_id)}>Reddet</Button>
                  </>
                )}
                {status === 'Published' && (
                  <>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/projects/${p.project_id}`} target="_blank">Görüntüle</Link>
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleSuspend(p.project_id)}>Askıya Al</Button>
                  </>
                )}
                {(status === 'Rejected' || status === 'Suspended') && (
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/projects/${p.project_id}`} target="_blank">Görüntüle</Link>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
