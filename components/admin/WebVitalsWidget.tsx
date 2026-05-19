// components/admin/WebVitalsWidget.tsx
import { getVitalsSummary } from '@/lib/vitals'

function rating(value: number, threshold: number): { label: string; color: string } {
  if (value === 0) return { label: 'No data', color: '#6b7280' }
  if (value <= threshold) return { label: 'Good', color: '#16a34a' }
  if (value <= threshold * 1.5) return { label: 'Needs Improvement', color: '#d97706' }
  return { label: 'Poor', color: '#dc2626' }
}

export async function WebVitalsWidget() {
  const summary = await getVitalsSummary()

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Core Web Vitals <span className="text-sm font-normal text-gray-400">(last 24h)</span>
      </h2>
      <div className="space-y-4">
        {summary.map((s) => {
          const display = s.unit === 'ms'
            ? `avg ${(s.avg / 1000).toFixed(2)}s · p75 ${(s.p75 / 1000).toFixed(2)}s`
            : `avg ${s.avg.toFixed(3)} · p75 ${s.p75.toFixed(3)}`
          const { label, color } = rating(s.avg, s.threshold)
          return (
            <div key={s.metric} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-10 font-mono text-sm font-bold text-gray-700">{s.metric}</span>
                <span className="text-sm text-gray-500">{display}</span>
              </div>
              <div className="flex items-center gap-2">
                {s.violations > 0 && (
                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                    {s.violations} violations
                  </span>
                )}
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{ color, backgroundColor: color + '15' }}
                >
                  {label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
