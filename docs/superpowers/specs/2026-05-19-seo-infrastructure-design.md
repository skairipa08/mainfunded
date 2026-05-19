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
export function studentMetadata(student: StudentDoc, locale: string): Metadata
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

**Runtime:** Edge (`export const runtime = 'edge'`)  
**Size:** 1200×630  
**Cache:** `Cache-Control: public, max-age=3600`

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
1. Fetch campaign by `id` (ObjectId or slug) from MongoDB via `getDb()`
2. Fetch student photo from `campaign.cover_image` (Cloudinary URL) with `fetch()`
3. If photo fetch fails, use a branded gradient placeholder

**Error handling:** If campaign not found, return a branded default image (same as `app/opengraph-image.tsx` style).

---

### 3. Student OG Image — `app/api/og/student/[id]/route.tsx` (NEW)

Simpler variant of the campaign OG image:
- Student photo (full right half)
- Student name + major + school (left)
- "Verified Student" badge
- Same Edge Runtime, 1200×630, 1h cache

---

### 4. JSON-LD — `lib/seo/schemas.ts` (UPDATE)

Add `campaignSchema`:

```ts
export function campaignSchema({
  title, description, url, imageUrl,
  raisedAmount, goalAmount, studentName, endDate
}: CampaignSchemaProps)
```

Uses `schema.org/DonateAction` as the primary type with `recipient` (Person) and `beneficiaryProgram` (EducationalOccupationalProgram).

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

Replace mock DB function with real Prisma/MongoDB query (reuse existing student service if available, otherwise add direct DB call).

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

```ts
import { onLCP, onCLS, onINP, onFID } from 'web-vitals'
```

Thresholds (Google "needs improvement" boundaries):
- LCP > 2500ms
- CLS > 0.1
- INP > 200ms
- FID > 100ms

When a threshold is exceeded, POST to `/api/vitals` with `{ metric, value, path, timestamp }`.

#### `app/api/vitals/route.ts` (NEW)
- `POST` — stores metric in MongoDB `vitals` collection (upsert: keep last 100 per metric per day)
- `GET` — returns last 24h summary grouped by metric: `{ metric, avg, p75, violations }[]`

Access to GET is restricted to `role === 'ADMIN'` (check session via existing auth).

#### `components/admin/WebVitalsWidget.tsx` (NEW)
Server component. Fetches GET `/api/vitals`. Renders a summary card:

```
Core Web Vitals (last 24h)
LCP  avg 1.8s  ✅ Good
CLS  avg 0.05  ✅ Good
INP  avg 245ms ⚠️ Needs Improvement
FID  avg 45ms  ✅ Good
```

Color coding: green (good), amber (needs improvement), red (poor).  
Placed in `app/[locale]/admin/analytics/page.tsx`.

---

### 8. Sitemap — `app/sitemap.ts` (UPDATE)

Add student public profiles:
```ts
const students = await db.collection('student_profiles')
  .find({ 'privacySettings.profileVisible': true }, { projection: { id: 1, updatedAt: 1 } })
  .limit(2000)
  .toArray()
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

Add to disallow list:
```ts
'/student/panel/',
'/en/student/panel/',
'/tr/student/panel/',
```

---

## File Change Summary

| File | Action | Purpose |
|------|--------|---------|
| `lib/seo/generate-metadata.ts` | CREATE | Metadata factory for all page types |
| `lib/seo/schemas.ts` | UPDATE | Add `campaignSchema` |
| `app/api/og/campaign/[id]/route.tsx` | CREATE | Edge OG image with photo + progress bar |
| `app/api/og/student/[id]/route.tsx` | CREATE | Edge OG image for student profiles |
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
