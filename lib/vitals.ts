// lib/vitals.ts
import { getDb } from '@/lib/db'

export interface VitalRecord {
  metric: string   // 'LCP' | 'CLS' | 'INP'
  value: number
  path: string
  timestamp: number
}

export interface VitalSummary {
  metric: string
  avg: number
  p75: number
  violations: number
  threshold: number
  unit: string
}

const THRESHOLDS: Record<string, { threshold: number; unit: string }> = {
  LCP: { threshold: 2500, unit: 'ms' },
  CLS: { threshold: 0.1,  unit: '' },
  INP: { threshold: 200,  unit: 'ms' },
}

export async function saveVital(record: VitalRecord): Promise<void> {
  const db = await getDb()
  await db.collection('vitals').insertOne({
    ...record,
    createdAt: new Date(),
  })
}

export async function getVitalsSummary(): Promise<VitalSummary[]> {
  const db = await getDb()
  const since = Date.now() - 24 * 60 * 60 * 1000

  const results = await Promise.all(
    Object.keys(THRESHOLDS).map(async (metric) => {
      const docs = await db
        .collection('vitals')
        .find({ metric, timestamp: { $gte: since } })
        .sort({ timestamp: -1 })
        .limit(500)
        .toArray()

      if (docs.length === 0) {
        return {
          metric,
          avg: 0,
          p75: 0,
          violations: 0,
          ...THRESHOLDS[metric],
        }
      }

      const values = docs.map((d) => d.value).sort((a, b) => a - b)
      const avg = Math.round(values.reduce((s, v) => s + v, 0) / values.length * 100) / 100
      const p75 = values[Math.floor(values.length * 0.75)]
      const { threshold, unit } = THRESHOLDS[metric]
      const violations = values.filter((v) => v > threshold).length

      return { metric, avg, p75, violations, threshold, unit }
    })
  )

  return results
}
