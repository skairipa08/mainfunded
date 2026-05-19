// components/analytics/WebVitalsTracker.tsx
'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const THRESHOLDS = { LCP: 2500, CLS: 0.1, INP: 200 }

export function WebVitalsTracker() {
  const path = usePathname()

  useEffect(() => {
    // Dynamically import to avoid SSR issues
    import('web-vitals').then(({ onLCP, onCLS, onINP }) => {
      const report = (metric: { name: string; value: number }) => {
        const threshold = THRESHOLDS[metric.name as keyof typeof THRESHOLDS]
        if (threshold === undefined) return
        if (metric.value <= threshold) return  // only send violations
        fetch('/api/vitals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            metric: metric.name,
            value: metric.value,
            path,
            timestamp: Date.now(),
          }),
          keepalive: true,
        }).catch(() => {})
      }

      onLCP(report)
      onCLS(report)
      onINP(report)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
