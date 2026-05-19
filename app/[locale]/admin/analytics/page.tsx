// app/[locale]/admin/analytics/page.tsx
// Server Component — wraps client dashboard + server-rendered CWV widget
import { Suspense } from 'react'
import { AnalyticsDashboardClient } from '@/components/admin/AnalyticsDashboardClient'
import { WebVitalsWidget } from '@/components/admin/WebVitalsWidget'

export default function AdminAnalyticsPage() {
  return (
    <>
      <AnalyticsDashboardClient />
      <div className="mx-auto max-w-7xl px-4 pb-8">
        <Suspense fallback={<div className="h-32 animate-pulse rounded-xl bg-gray-100" />}>
          <WebVitalsWidget />
        </Suspense>
      </div>
    </>
  )
}
