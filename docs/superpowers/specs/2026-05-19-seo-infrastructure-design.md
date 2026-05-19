# SEO Infrastructure — Design Spec
**Date:** 2026-05-19  
**Branch:** feat/seo-infrastructure  
**Approach:** C — Full SEO Factory

---

## Context

FundEd is a Next.js 14 (App Router) bilingual (TR/EN) education crowdfunding platform. A strong SEO foundation already exists but has gaps and a critical bug.

**Existing (keep as-is):**
- `app/robots.ts` — robots.txt (needs one addition)
- `app/sitemap.ts` — dynamic sitemap (needs student pages + extensibility)
- `app/opengraph-image.tsx` — site-level default OG image
- `lib/seo/metadata.ts` — `buildAlternates()` helper
- `lib/seo/schemas.ts` — Organization, BreadcrumbList, FAQ, Article, Person, HowTo schemas
- `components/seo/JsonLd.tsx` — JSON-LD renderer

**Critical bug (fix):**
`app/[locale]/campaign/[id]/layout.tsx` and `page.tsx` both export `generateMetadata`. Next.js uses only the layout's (simpler) version, making page.tsx's richer metadata dead code. The layout also references `campaign.images[0]` (an old field) instead of `campaign.cover_image`.

---

## Architecture

### 1. Metadata Factory — `lib/seo/generate-metadata.ts` (NEW)

Central file exporting one function per page type. Each function:
- Calls `buildAlternates(locale, path)` for canonical + hreflang
- Truncates description to 160 chars
- Points OG image to the appropriate API route
- Returns a fully typed Next.js `Metadata` object

```ts
// Exported functions:
export function campaignMetadata(campaign: CampaignDoc, locale: string): Metadata
export function studentMetadata(student: { name: string; image?: string; fieldOfStudy?: string; university?: string; shortStory?: string; userId: string }, locale: string): Metadata
// Caller merges user.name + user.image with profile fields before passing
export function browseMetadata(filters: BrowseFilters, locale: string): Metadata
```

**campaignMetadata:**
- title: `${campaign.title} — FundEd`
- description: `campaign.story.slice(0, 157) + '...'`
- OG image: `/api/og/campaign/${campaign._id || campaign.slug}`
- Twitter card: `summary_large_image`
- type: `article`

**studentMetadata:**
- title: `${student.name} — ${student.major} | FundEd`
- description: `${student.careerGoal} · ${student.schoolName}`
- OG image: `/api/og/student/${student.id}`
- JSON-LD: Person + BreadcrumbList

**browseMetadata:**
- Locale-aware title/description
- Canonical with `?q=` stripped (query params excluded from canonical)

---

### 2. Campaign OG Image — `app/api/og/campaign/[id]/route.tsx` (NEW)

**Runtime:** Node.js (`runtime = 'nodejs'` — Edge Runtime does not support the MongoDB Node.js driver)  
**Size:** 1200×630  
**Cache:** `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  [Left 55% — gradient bg]    │  [Right 45% — photo]  │
│                               │                       │
│  🎓 fund-ed.com               │  Student photo        │
│                               │  full-height          │
│  Campaign Title               │  cover-fit            │
│  (2 lines max)                │                       │
│                               │  ✓ Verified           │
│  ████████░░░░  %64            │  badge (bottom)       │
│  ₺8.000 / ₺12.500             │                       │
│  342 bağışçı                  │                       │
└──────────────────────────────────────────────────────┘
```

**Data fetching:**
1. Call `fetchCampaignData(id)` from `app/[locale]/campaign/[id]/fetchCampaign.ts` — queries by `campaign_id` string field
2. Student photo: `campaign.student.picture` (Google OAuth avatar) → fallback `campaign.cover_image` → fallback gradient placeholder
3. Progress: `Math.round((campaign.raised_amount / campaign.goal_amount) * 100)`

**Error handling:** If campaign not found, return a branded default image (same as `app/opengraph-image.tsx` style).

---

### 3. Student OG Image — `app/api/og/student/[id]/route.tsx` (NEW)

Simpler variant of the campaign OG image:
- Student photo (full right half)
- Student name + major + school (left)
- "Verified Student" badge
- Same Node.js Runtime, 1200×630, 1h cache

**Data fetching:** Direct MongoDB query on `student_profiles` collection by `user_id` field + `users` collection for name/photo:
```ts
const profile = await db.collection('student_profiles').findOne({ user_id: params.id })
const user    = await db.collection('users').findOne({ _id: new ObjectId(params.id) })
// Available fields: profile.fieldOfStudy, profile.university, user.name, user.image
```

---

### 4. JSON-LD — `lib/seo/schemas.ts` (UPDATE)

Add `campaignSchema`:

```ts
export function campaignSchema({
  title, description, url, imageUrl,
  raisedAmount, goalAmount, studentName, endDate
}: CampaignSchemaProps)
```

Primary type is `WebPage` with a `potentialAction` of type `DonateAction` (standalone `DonateAction` as root type is rejected by Google Rich Results validator):
```json
{
  "@type": "WebPage",
  "potentialAction": {
    "@type": "DonateAction",
    "recipient": { "@type": "Person", "name": "..." }
  }
}
```

---

### 5. Campaign Pages Fix

**`app/[locale]/campaign/[id]/layout.tsx`** — Remove `generateMetadata` export entirely. Keep only the layout wrapper component.

**`app/[locale]/campaign/[id]/page.tsx`** — Replace inline `generateMetadata` with:
```ts
import { campaignMetadata } from '@/lib/seo/generate-metadata'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const campaign = await fetchCampaignData(params.id)
  if (!campaign) return { title: 'Campaign Not Found — FundEd' }
  return campaignMetadata(campaign, params.locale)
}
```

Add `campaignSchema` to the JSON-LD array alongside existing Person + Breadcrumb schemas.

---

### 6. Student Profile Page — `app/[locale]/student/[id]/page.tsx` (UPDATE)

Replace mock `getStudentProfile` with real MongoDB query:
```ts
async function getStudentProfile(id: string) {
  const db = await getDb()
  const profile = await db.collection('student_profiles').findOne({ user_id: id })
  const user    = await db.collection('users').findOne({ _id: new ObjectId(id) })
  if (!user) return null
  return { profile, user }
}
// Available: user.name, user.image, profile.fieldOfStudy, profile.university, profile.shortStory
```

Add `generateMetadata`:
```ts
import { studentMetadata } from '@/lib/seo/generate-metadata'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const student = await getStudentProfile(params.id)
  if (!student) return { title: 'Student Not Found — FundEd' }
  return studentMetadata(student.profile, params.locale)
}
```

Add JSON-LD at render:
```tsx
<JsonLd schema={personSchema({ name, description, imageUrl, url })} />
<JsonLd schema={breadcrumbSchema([...])} />
```

---

### 7. Core Web Vitals

**No email alerts.** Dashboard display only.

#### `components/analytics/WebVitalsTracker.tsx` (NEW)
Client component (`'use client'`). Imported once in `app/[locale]/layout.tsx`.

**Dependency:** `npm install web-vitals` (not currently installed).

```ts
import { onLCP, onCLS, onINP } from 'web-vitals'
// Note: onFID removed — FID was retired from Core Web Vitals in 2024, web-vitals v4 no longer exports it
```

Thresholds (Google "needs improvement" boundaries):
- LCP > 2500ms
- CLS > 0.1
- INP > 200ms

When a threshold is exceeded, POST to `/api/vitals` with `{ metric, value, path, timestamp }`.

#### `app/api/vitals/route.ts` (NEW)
- `POST` — stores metric in MongoDB `vitals` collection (upsert: keep last 100 per metric per day)
- `GET` — returns last 24h summary grouped by metric: `{ metric, avg, p75, violations }[]`

Access to GET is restricted to `role === 'ADMIN'` (check session via existing auth).

#### `components/admin/WebVitalsWidget.tsx` (NEW)
Server component. Does **NOT** self-fetch `/api/vitals` (server→server loopback fails on Vercel). Instead calls a shared utility function directly:

```ts
import { getVitalsSummary } from '@/lib/vitals'
// lib/vitals.ts exports: async function getVitalsSummary(): Promise<VitalSummary[]>
// VitalSummary: { metric: string, avg: number, p75: number, violations: number }
```

Renders a summary card:
```
Core Web Vitals (last 24h)
LCP  avg 1.8s  ✅ Good
CLS  avg 0.05  ✅ Good
INP  avg 245ms ⚠️ Needs Improvement
```

Color coding: green (good), amber (needs improvement), red (poor).  
Placed in `app/[locale]/admin/analytics/page.tsx` (CREATE this page — does not currently exist).

---

### 8. Sitemap — `app/sitemap.ts` (UPDATE)

Add student public profiles. The `student_profiles` collection has no `profileVisible` flag — include all profiles that have a corresponding `users` record. Use `user_id` as the URL identifier:
```ts
const students = await db.collection('student_profiles')
  .find({}, { projection: { user_id: 1, updatedAt: 1 } })
  .limit(2000)
  .toArray()
// URL: /student/${student.user_id}
```

Refactor into helper functions for extensibility:
```ts
async function campaignEntries(db): Promise<SitemapEntry[]>
async function studentEntries(db): Promise<SitemapEntry[]>
// async function schoolEntries(db): Promise<SitemapEntry[]>  ← ready when needed
```

Student entries: `priority: 0.5`, `changeFreq: 'weekly'`.

---

### 9. Robots — `app/robots.ts` (UPDATE)

Add to disallow list (locale-prefixed only, consistent with existing pattern):
```ts
'/en/student/panel/',
'/tr/student/panel/',
```

---

## File Change Summary

| File | Action | Purpose |
|------|--------|---------|
| `lib/seo/generate-metadata.ts` | CREATE | Metadata factory for all page types |
| `lib/seo/schemas.ts` | UPDATE | Add `campaignSchema` |
| `app/api/og/campaign/[id]/route.tsx` | CREATE | Node.js OG image with photo + progress bar |
| `app/api/og/student/[id]/route.tsx` | CREATE | Node.js OG image for student profiles |
| `lib/vitals.ts` | CREATE | Shared DB query for CWV summary (used by widget + API) |
| `app/api/vitals/route.ts` | CREATE | CWV metric collection + retrieval |
| `app/[locale]/campaign/[id]/layout.tsx` | UPDATE | Remove duplicate `generateMetadata` |
| `app/[locale]/campaign/[id]/page.tsx` | UPDATE | Use factory + add campaignSchema |
| `app/[locale]/student/[id]/page.tsx` | UPDATE | Real DB query + generateMetadata + JSON-LD |
| `components/analytics/WebVitalsTracker.tsx` | CREATE | Client-side CWV measurement |
| `components/admin/WebVitalsWidget.tsx` | CREATE | Admin CWV dashboard widget |
| `app/[locale]/layout.tsx` | UPDATE | Import WebVitalsTracker |
| `app/[locale]/admin/analytics/page.tsx` | UPDATE | Add WebVitalsWidget |
| `app/sitemap.ts` | UPDATE | Student pages + helper refactor |
| `app/robots.ts` | UPDATE | Block student/panel |

---

## Checklist

- [ ] OG image Facebook Sharing Debugger'da görünüyor
- [ ] JSON-LD Google Rich Results Test'te geçiyor (campaign + student)
- [ ] Sitemap.xml tüm kampanya ve öğrenci URL'lerini içeriyor
- [ ] Robots.txt admin + panel sayfalarını engelliyor
- [ ] Kanonik URL sayfalama/filtre için doğru (q= param yok)
- [ ] Core Web Vitals widget admin analytics sayfasında görünüyor
- [ ] Campaign layout.tsx'te duplicate generateMetadata kaldırıldı
- [ ] OG image kampanya için doğru URL'i kullanıyor (/api/og/campaign/[id])
