'use client'
import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { ESGMetrics } from '@/types/projects'

const COLORS = ['#2563eb', '#16a34a', '#d97706', '#7c3aed', '#dc2626', '#0891b2']

export function ESGImpactPanel() {
  const [metrics, setMetrics] = useState<ESGMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/projects/esg')
      .then(r => r.json())
      .then(j => { setMetrics(j.data); setLoading(false) })
  }, [])

  if (loading) return <div className="h-48 animate-pulse bg-muted rounded-xl" />
  if (!metrics) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Desteklenen Proje', value: metrics.total_projects_supported },
          { label: 'Ulaşılan Öğrenci', value: metrics.total_students_reached },
          { label: 'Aktif Proje', value: metrics.active_projects },
          { label: 'Toplam Destek (₺)', value: metrics.total_amount_donated.toLocaleString('tr-TR') },
        ].map(stat => (
          <div key={stat.label} className="border rounded-xl p-4 text-center bg-white dark:bg-gray-900">
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {metrics.completion_ratio !== undefined && (
        <div className="border rounded-xl p-4 bg-white dark:bg-gray-900">
          <p className="text-sm font-medium mb-2">Tamamlanma Oranı</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-muted rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.round(metrics.completion_ratio * 100)}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-green-600">
              %{Math.round(metrics.completion_ratio * 100)}
            </span>
          </div>
        </div>
      )}

      {metrics.domain_breakdown.length > 0 && (
        <div className="border rounded-xl p-4 bg-white dark:bg-gray-900">
          <h3 className="font-medium mb-3 text-sm">Alan Dağılımı</h3>
          <div className="flex items-center gap-6 flex-wrap">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={metrics.domain_breakdown}
                  dataKey="count"
                  nameKey="domain"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                >
                  {metrics.domain_breakdown.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any, name: any) => [v, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5">
              {metrics.domain_breakdown.map((d: any, i: number) => (
                <div key={d.domain} className="flex items-center gap-2 text-xs">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="capitalize">{d.domain}</span>
                  <span className="text-muted-foreground ml-1">({d.count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
