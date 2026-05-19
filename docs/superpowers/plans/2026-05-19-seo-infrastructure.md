# SEO Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full SEO factory for FundEd — centralised metadata generation, campaign/student OG images with progress overlays, campaignSchema JSON-LD, Core Web Vitals tracking widget, and sitemap/robots improvements.

**Architecture:** A `lib/seo/generate-metadata.ts` factory provides typed `Metadata` objects for every page type, all pointing OG images at new `/api/og/*` Node.js routes. A `lib/vitals.ts` module stores/retrieves CWV metrics from MongoDB and is shared by the API route and the admin dashboard widget to avoid Vercel loopback issues.

**Tech Stack:** Next.js 14 App Router, TypeScript, MongoDB (via `lib/db.ts` getDb()), `next/og` ImageResponse, `web-vitals` (to install), Tailwind CSS.

---

## Chunk 1: Core SEO Foundation

### Task 1: Install web-vitals dependency

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install package**

```bash
npm install web-vitals
```

Expected output: added `web-vitals` to dependencies.

- [ ] **Step 2: Verify import resolves**

```bash
npx tsc --noEmit 2>&1 | head -5
```

Expected: no error about missing `web-vitals` module (other errors OK at this stage).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add web-vitals dependency"
```

---

### Task 2: Add campaignSchema to `lib/seo/schemas.ts`

**Files:**
- Modify: `lib/seo/schemas.ts`

Current file already has: Organization, WebSite, BreadcrumbList, FAQ, Article, HowTo, Person, EducationalOrg.

- [ ] **Step 1: Add the campaignSchema function**

Append to the bottom of `lib/seo/schemas.ts`:

```ts
/* ── CampaignPage (WebPage + DonateAction) ── */
export interface CampaignSchemaProps {
  title: string
  description: string
  url: string
  imageUrl?: string
  raisedAmount: number
  goalAmount: number
  studentName: string
}
export function campaignSchema({
  title,
  description,
  url,
  imageUrl,
  raisedAmount,
  goalAmount,
  studentName,
}: CampaignSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url,
    image: imageUrl,
    potentialAction: {
      '@type': 'DonateAction',
      name: `Support ${studentName}`,
      target: url,
      recipient: {
        '@type': 'Person',
        name: studentName,
      },
    },
    offers: {
      '@type': 'Offer',
      price: goalAmount - raisedAmount,
      priceCurrency: 'TRY',
      availability: raisedAmount >= goalAmount
        ? 'https://schema.org/SoldOut'
        : 'https://schema.org/InStock',
    },
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep "schemas.ts"
```

Expected: no errors on `schemas.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/seo/schemas.ts
git commit -m "feat(seo): add campaignSchema with WebPage + DonateAction"
```

---

### Task 3: Create `lib/seo/generate-metadata.ts`

**Files:**
- Create: `lib/seo/generate-metadata.ts`

This is the central factory. It calls `buildAlternates()` and returns fully-typed `Metadata` objects. Campaign metadata points OG image at `/api/og/campaign/[id]`.

- [ ] **Step 1: Create the factory file**

```ts
// lib/seo/generate-metadata.ts
import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/seo/metadata'
import type { CampaignData } from '@/app/[locale]/campaign/[id]/fetchCampaign'

const BASE = 'https://fund-ed.com'

function truncate(text: string, max = 157): string {
  if (!text) return ''
  return text.length <= max ? text : text.slice(0, max) + '...'
}

export function campaignMetadata(campaign: CampaignData, locale: string): Metadata {
  const title = `${campaign.title} — FundEd`
  const description = truncate(campaign.story)
  const ogImageUrl = `${BASE}/api/og/campaign/${campaign.campaign_id}`
  const path = `/campaign/${campaign.campaign_id}`

  return {
    title,
    description,
    alternates: buildAlternates(locale, path),
    openGraph: {
      title: campaign.title,
      description,
      type: 'article',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: campaign.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: campaign.title,
      description,
      images: [ogImageUrl],
    },
  }
}

export interface StudentSeoData {
  userId: string
  name: string
  image?: string | null
  fieldOfStudy?: string | null
  university?: string | null
  shortStory?: string | null
}

export function studentMetadata(student: StudentSeoData, locale: string): Metadata {
  const title = [
    student.name,
    student.fieldOfStudy,
    'FundEd',
  ].filter(Boolean).join(' — ')
  const description = truncate(
    [student.shortStory, student.university].filter(Boolean).join(' · ')
  ) || `${student.name} — FundEd öğrenci profili`
  const ogImageUrl = `${BASE}/api/og/student/${student.userId}`
  const path = `/student/${student.userId}`

  return {
    title,
    description,
    alternates: buildAlternates(locale, path),
    openGraph: {
      title: student.name,
      description,
      type: 'profile',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: student.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: student.name,
      description,
      images: [ogImageUrl],
    },
  }
}

export function browseMetadata(locale: string, searchQuery?: string): Metadata {
  const isTr = locale === 'tr'
  const title = isTr ? 'Kampanyaları Keşfet — FundEd' : 'Browse Campaigns — FundEd'
  const description = isTr
    ? 'Doğrulanmış öğrencilerin eğitim kampanyalarını keşfet ve destek ol.'
    : 'Discover and support verified students education campaigns on FundEd.'
  // Canonical strips search query params
  const path = '/browse'

  return {
    title,
    description,
    alternates: buildAlternates(locale, path),
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary', title, description },
    // Paginated or filtered pages should not be indexed separately
    robots: searchQuery ? { index: false, follow: true } : undefined,
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep "generate-metadata"
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/seo/generate-metadata.ts
git commit -m "feat(seo): add centralised metadata factory"
```

---

### Task 4: Update `app/robots.ts` — block student/panel

**Files:**
- Modify: `app/robots.ts`

- [ ] **Step 1: Add locale-prefixed panel paths to disallow**

Current disallow list:
```ts
disallow: ['/api/', '/admin/', '/student/dashboard/', '/account/', '/dashboard/', '/ops/', '/en/corporate/', '/tr/corporate/'],
```

Replace with:
```ts
disallow: [
  '/api/',
  '/admin/',
  '/student/dashboard/',
  '/account/',
  '/dashboard/',
  '/ops/',
  '/en/corporate/',
  '/tr/corporate/',
  '/en/student/panel/',
  '/tr/student/panel/',
],
```

- [ ] **Step 2: Verify robots.txt output locally**

Start the dev server (`npm run dev`) in a separate terminal, then:

```bash
# PowerShell:
Invoke-WebRequest http://localhost:3000/robots.txt | Select-Object -ExpandProperty Content
# Or Bash:
curl http://localhost:3000/robots.txt
```

Expected: output includes lines with `/en/student/panel/` and `/tr/student/panel/`.

- [ ] **Step 3: Commit**

```bash
git add app/robots.ts
git commit -m "fix(seo): block student panel routes in robots.txt"
```

---

## Chunk 2: OG Image API Routes

### Task 5: Create Campaign OG Image — `app/api/og/campaign/[id]/route.tsx`

**Files:**
- Create: `app/api/og/campaign/[id]/route.tsx`

Node.js runtime (not Edge — MongoDB driver requires TCP). Uses `fetchCampaignData` from the campaign page module to avoid duplicating DB logic.

- [ ] **Step 1: Create the route file**

```tsx
// app/api/og/campaign/[id]/route.tsx
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { fetchCampaignData } from '@/app/[locale]/campaign/[id]/fetchCampaign'

export const runtime = 'nodejs'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const campaign = await fetchCampaignData(params.id)

  if (!campaign) {
    // Branded fallback
    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px', height: '630px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e40af 0%, #4338ca 100%)',
          }}
        >
          <span style={{ color: 'white', fontSize: 48, fontWeight: 800 }}>FundEd</span>
        </div>
      ),
      { width: 1200, height: 630,
        headers: { 'Cache-Control': 'public, s-maxage=60' } }
    )
  }

  const pct = campaign.goal_amount > 0
    ? Math.min(100, Math.round((campaign.raised_amount / campaign.goal_amount) * 100))
    : 0
  const photoUrl = campaign.student?.picture || campaign.cover_image || null

  // Fetch photo as ArrayBuffer so ImageResponse can embed it
  let photoSrc: string | undefined
  if (photoUrl) {
    try {
      const res = await fetch(photoUrl)
      if (res.ok) {
        const buf = await res.arrayBuffer()
        const base64 = Buffer.from(buf).toString('base64')
        const mime = res.headers.get('content-type') || 'image/jpeg'
        photoSrc = `data:${mime};base64,${base64}`
      }
    } catch {
      // silently fall through — no photo
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px', height: '630px',
          display: 'flex', fontFamily: 'system-ui, sans-serif',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)',
        }}
      >
        {/* Left panel — 55% */}
        <div
          style={{
            width: '660px', height: '100%',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: '60px 56px',
          }}
        >
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <span style={{ fontSize: 16, color: 'rgba(199,210,254,0.7)', fontWeight: 600 }}>
              🎓 fund-ed.com
            </span>
          </div>

          {/* Campaign title */}
          <div
            style={{
              fontSize: 44, fontWeight: 800, color: '#ffffff',
              lineHeight: 1.15, marginBottom: 32, display: 'flex',
              flexWrap: 'wrap',
            }}
          >
            {campaign.title.slice(0, 72)}
          </div>

          {/* Progress bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            <div
              style={{
                width: '100%', height: 14, borderRadius: 7,
                background: 'rgba(255,255,255,0.15)', display: 'flex',
              }}
            >
              <div
                style={{
                  width: `${pct}%`, height: '100%', borderRadius: 7,
                  background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
                  display: 'flex',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(199,210,254,0.9)', fontSize: 20, fontWeight: 700 }}>
                %{pct} desteklendi
              </span>
              <span style={{ color: 'rgba(199,210,254,0.6)', fontSize: 18 }}>
                {campaign.donor_count} bağışçı
              </span>
            </div>
          </div>

          {/* Amounts */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 22, color: '#93c5fd', fontWeight: 700 }}>
              ₺{campaign.raised_amount.toLocaleString('tr-TR')}
            </span>
            <span style={{ fontSize: 16, color: 'rgba(199,210,254,0.5)' }}>
              / ₺{campaign.goal_amount.toLocaleString('tr-TR')} hedef
            </span>
          </div>
        </div>

        {/* Right panel — 45% photo */}
        <div
          style={{
            width: '540px', height: '100%',
            display: 'flex', position: 'relative', overflow: 'hidden',
          }}
        >
          {photoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoSrc}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'flex' }}
            />
          ) : (
            <div
              style={{
                width: '100%', height: '100%',
                background: 'linear-gradient(180deg, #4338ca 0%, #1e1b4b 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 80,
              }}
            >
              🎓
            </div>
          )}
          {/* Gradient overlay on left edge of photo */}
          <div
            style={{
              position: 'absolute', top: 0, left: 0,
              width: 100, height: '100%',
              background: 'linear-gradient(90deg, #1e3a8a, transparent)',
              display: 'flex',
            }}
          />
          {/* Verified badge */}
          {campaign.student?.verification_status === 'approved' && (
            <div
              style={{
                position: 'absolute', bottom: 24, right: 24,
                background: 'rgba(34,197,94,0.9)', borderRadius: 20,
                padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 14, color: 'white', fontWeight: 600,
              }}
            >
              ✓ Doğrulandı
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    }
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep "og/campaign"
```

Expected: no errors.

- [ ] **Step 3: Test the route manually with a real campaign_id**

Start the dev server (`npm run dev`) in a separate terminal, then find a real `campaign_id` from your DB and test:

```bash
# Find a campaign_id (run in MongoDB shell or check admin panel)
# Then test:
curl -I "http://localhost:3000/api/og/campaign/<your-campaign-id>"
```

Expected: `HTTP/1.1 200 OK` with `content-type: image/png`. If campaign not found, still expect `200 OK` (branded fallback image).

- [ ] **Step 4: Commit**

```bash
git add app/api/og/campaign/
git commit -m "feat(seo): add campaign OG image API route with progress bar"
```

---

### Task 6: Create Student OG Image — `app/api/og/student/[id]/route.tsx`

**Files:**
- Create: `app/api/og/student/[id]/route.tsx`

- [ ] **Step 1: Create the route file**

```tsx
// app/api/og/student/[id]/route.tsx
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'
import { ObjectId } from 'mongodb'

export const runtime = 'nodejs'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  let name = 'Student'
  let fieldOfStudy = ''
  let university = ''
  let photoSrc: string | undefined

  try {
    const db = await getDb()
    const [profile, user] = await Promise.all([
      db.collection('student_profiles').findOne(
        { user_id: params.id },
        { projection: { fieldOfStudy: 1, field_of_study: 1, university: 1 } }
      ),
      ObjectId.isValid(params.id)
        ? db.collection('users').findOne(
            { _id: new ObjectId(params.id) },
            { projection: { name: 1, image: 1 } }
          )
        : null,
    ])
    if (user?.name) name = user.name
    fieldOfStudy = profile?.fieldOfStudy || profile?.field_of_study || ''
    university = profile?.university || ''

    const photoUrl = user?.image || null
    if (photoUrl) {
      const res = await fetch(photoUrl)
      if (res.ok) {
        const buf = await res.arrayBuffer()
        const base64 = Buffer.from(buf).toString('base64')
        const mime = res.headers.get('content-type') || 'image/jpeg'
        photoSrc = `data:${mime};base64,${base64}`
      }
    }
  } catch {
    // return generic image below
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px', height: '630px',
          display: 'flex', fontFamily: 'system-ui, sans-serif',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)',
        }}
      >
        {/* Left panel */}
        <div
          style={{
            width: '660px', height: '100%',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: '60px 56px',
          }}
        >
          <div style={{ display: 'flex', marginBottom: 20 }}>
            <span style={{ fontSize: 16, color: 'rgba(199,210,254,0.7)', fontWeight: 600 }}>
              🎓 fund-ed.com
            </span>
          </div>
          <div
            style={{
              fontSize: 52, fontWeight: 800, color: '#ffffff',
              lineHeight: 1.1, marginBottom: 20, display: 'flex', flexWrap: 'wrap',
            }}
          >
            {name.slice(0, 40)}
          </div>
          {fieldOfStudy && (
            <div style={{ fontSize: 24, color: '#93c5fd', marginBottom: 8, display: 'flex' }}>
              {fieldOfStudy.slice(0, 60)}
            </div>
          )}
          {university && (
            <div style={{ fontSize: 18, color: 'rgba(199,210,254,0.6)', display: 'flex' }}>
              {university.slice(0, 60)}
            </div>
          )}
          <div
            style={{
              marginTop: 40, background: 'rgba(99,102,241,0.3)',
              borderRadius: 20, padding: '8px 20px', display: 'flex',
              alignItems: 'center', gap: 8, width: 'fit-content',
            }}
          >
            <span style={{ color: '#a5b4fc', fontSize: 16, fontWeight: 600 }}>
              ✓ Doğrulanmış Öğrenci
            </span>
          </div>
        </div>

        {/* Right panel — photo */}
        <div
          style={{
            width: '540px', height: '100%',
            display: 'flex', position: 'relative', overflow: 'hidden',
          }}
        >
          {photoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoSrc}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'flex' }}
            />
          ) : (
            <div
              style={{
                width: '100%', height: '100%',
                background: 'linear-gradient(180deg, #4338ca 0%, #1e1b4b 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 120,
              }}
            >
              👤
            </div>
          )}
          <div
            style={{
              position: 'absolute', top: 0, left: 0,
              width: 100, height: '100%',
              background: 'linear-gradient(90deg, #1e3a8a, transparent)',
              display: 'flex',
            }}
          />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    }
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep "og/student"
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/og/student/
git commit -m "feat(seo): add student OG image API route"
```

---

## Chunk 3: Page Integration

### Task 7: Fix campaign pages — remove duplicate generateMetadata

**Files:**
- Modify: `app/[locale]/campaign/[id]/layout.tsx`
- Modify: `app/[locale]/campaign/[id]/page.tsx`

Currently `layout.tsx` exports `generateMetadata` referencing the old `campaign.images[0]` field, shadowing the richer version in `page.tsx`. Next.js uses the layout's version, making the page's dead code.

- [ ] **Step 1: Remove `generateMetadata` from layout.tsx**

In `app/[locale]/campaign/[id]/layout.tsx`, delete everything between (and including) the `export async function generateMetadata` block and its closing `}`. Keep only the imports needed for the layout component and the `CampaignLayout` default export.

After the edit, `layout.tsx` should look like this:

```tsx
interface Props {
  params: { id: string };
  children: React.ReactNode;
}

export default function CampaignLayout({ children }: Props) {
  return children;
}
```

Remove all unused imports (`Metadata`, `getDb`, `ObjectId`, `useTranslation`) after the metadata function is gone.

- [ ] **Step 2: Update page.tsx to use the factory**

In `app/[locale]/campaign/[id]/page.tsx`, replace the existing `generateMetadata` function with:

```ts
import { campaignMetadata } from '@/lib/seo/generate-metadata'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const campaign = await fetchCampaignData(params.id)
  if (!campaign) return { title: 'Campaign Not Found — FundEd' }
  return campaignMetadata(campaign, params.locale)
}
```

- [ ] **Step 3: Add campaignSchema to the JSON-LD array in page.tsx**

In the page component body, find the `const schemas = [` array. Add `campaignSchema` alongside existing schemas:

```ts
import { personSchema, educationalOrgSchema, breadcrumbSchema, campaignSchema } from '@/lib/seo/schemas'

const schemas = [
  campaignSchema({
    title: campaign.title,
    description: campaign.story?.substring(0, 200) || '',
    url: `https://fund-ed.com/${params.locale}/campaign/${campaign.campaign_id}`,
    imageUrl: `https://fund-ed.com/api/og/campaign/${campaign.campaign_id}`,
    raisedAmount: campaign.raised_amount,
    goalAmount: campaign.goal_amount,
    studentName: campaign.student?.name || campaign.title,
  }),
  personSchema({
    name: campaign.student?.name || campaign.title,
    description: campaign.story?.substring(0, 200) || '',
    imageUrl: campaign.cover_image,
    url: `https://fund-ed.com/${params.locale}/campaign/${campaign.campaign_id}`,
  }),
  educationalOrgSchema(),
  breadcrumbSchema(isTr
    ? [
        { name: 'Ana Sayfa', url: `https://fund-ed.com/tr` },
        { name: 'Kampanyalar', url: `https://fund-ed.com/tr/browse` },
        { name: campaign.title, url: `https://fund-ed.com/tr/campaign/${campaign.campaign_id}` },
      ]
    : [
        { name: 'Home', url: `https://fund-ed.com/en` },
        { name: 'Browse', url: `https://fund-ed.com/en/browse` },
        { name: campaign.title, url: `https://fund-ed.com/en/campaign/${campaign.campaign_id}` },
      ]
  ),
]
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep "campaign"
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/campaign/[id]/layout.tsx" "app/[locale]/campaign/[id]/page.tsx"
git commit -m "fix(seo): remove duplicate generateMetadata, use factory + campaignSchema"
```

---

### Task 8: Update `app/[locale]/student/[id]/page.tsx` — real DB + metadata

**Files:**
- Modify: `app/[locale]/student/[id]/page.tsx`

Currently uses mock data for `id === '1'` only. Add real DB query and SEO metadata.

- [ ] **Step 1: Replace mock function with real DB query**

At the top of `page.tsx`, replace ALL existing imports with:

```ts
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getDb } from '@/lib/db'
import { ObjectId } from 'mongodb'
import { applyPrivacySettings, ViewerRole } from '@/lib/student-privacy'
import { ProfileHeader } from '@/components/student-passport/ProfileHeader'
import { VerificationBadges } from '@/components/student-passport/VerificationBadges'
import { Timeline } from '@/components/student-passport/Timeline'
import { MessageForm } from '@/components/student-passport/MessageForm'
import { JsonLd } from '@/components/seo/JsonLd'
import { personSchema, breadcrumbSchema } from '@/lib/seo/schemas'
import { studentMetadata, type StudentSeoData } from '@/lib/seo/generate-metadata'
```

Replace the mock `getStudentProfile` function with:

```ts
async function getStudentProfile(id: string) {
  try {
    const db = await getDb()
    const [profile, user, verifications] = await Promise.all([
      db.collection('student_profiles').findOne({ user_id: id }),
      ObjectId.isValid(id)
        ? db.collection('users').findOne(
            { _id: new ObjectId(id) },
            { projection: { name: 1, image: 1 } }
          )
        : null,
      db.collection('verifications')
        .find({ user_id: id, status: 'approved' }, { projection: { type: 1, status: 1 } })
        .toArray(),
    ])
    if (!user) return null

    // Map real DB field names to the shape ProfileHeader expects
    const mappedProfile = {
      ...(profile || {}),
      photoUrl: user.image || null,
      schoolName: profile?.university || null,
      major: profile?.fieldOfStudy || profile?.field_of_study || null,
      shortStory: profile?.shortStory || null,
      // age, grade, careerGoal, hobbies, gpa may be absent — ProfileHeader renders them conditionally
    }
    const settings = {
      ageVisibility: profile?.ageVisibility || 'EVERYONE',
      gpaVisibility: profile?.gpaVisibility || 'DONORS_ONLY',
      storyVisibility: profile?.storyVisibility || 'EVERYONE',
    }
    return {
      profile: mappedProfile,
      settings,
      user,
      verifications: verifications.map((v: any) => ({ type: v.type, status: 'APPROVED' })),
      achievements: [], // achievements collection not yet in DB; renders empty Timeline
    }
  } catch {
    return null
  }
}
```

- [ ] **Step 2: Add generateMetadata export**

Add before the default export:

```ts
export async function generateMetadata(
  { params }: { params: { id: string; locale: string } }
): Promise<Metadata> {
  const data = await getStudentProfile(params.id)
  if (!data) return { title: 'Öğrenci Bulunamadı — FundEd' }
  const seoData: StudentSeoData = {
    userId: params.id,
    name: data.user.name || 'Öğrenci',
    image: data.user.image,
    fieldOfStudy: data.profile.fieldOfStudy || data.profile.field_of_study,
    university: data.profile.university,
    shortStory: data.profile.shortStory,
  }
  return studentMetadata(seoData, params.locale)
}
```

- [ ] **Step 3: Replace the page component body with real-data version**

Replace the entire `StudentProfilePage` default export with:

```tsx
export default async function StudentProfilePage({
  params,
}: { params: { id: string; locale: string } }) {
  const data = await getStudentProfile(params.id)
  if (!data) return notFound()

  const { profile, settings, user, verifications, achievements } = data
  const isTr = params.locale === 'tr'
  const studentUrl = `https://fund-ed.com/${params.locale}/student/${params.id}`

  const viewerRole: ViewerRole = 'EVERYONE'
  const safeProfile = applyPrivacySettings(profile, settings, viewerRole)

  const schemas = [
    personSchema({
      name: user.name || 'Öğrenci',
      description: safeProfile.shortStory || '',
      imageUrl: user.image,
      url: studentUrl,
    }),
    breadcrumbSchema(isTr
      ? [
          { name: 'Ana Sayfa', url: 'https://fund-ed.com/tr' },
          { name: 'Öğrenci Profili', url: studentUrl },
        ]
      : [
          { name: 'Home', url: 'https://fund-ed.com/en' },
          { name: 'Student Profile', url: studentUrl },
        ]
    ),
  ]

  return (
    <>
      {schemas.map((s, i) => <JsonLd key={i} schema={s} />)}
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <ProfileHeader profile={safeProfile} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Timeline achievements={achievements} />
            </div>
            <div className="space-y-6">
              <VerificationBadges verifications={verifications} />
              <MessageForm studentId={params.id} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep "student/\[id\]"
```

Expected: no type errors.

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/student/[id]/page.tsx"
git commit -m "feat(seo): real DB query + generateMetadata + JSON-LD on student profile page"
```

---

## Chunk 4: Core Web Vitals

### Task 9: Create `lib/vitals.ts` — shared CWV data layer

**Files:**
- Create: `lib/vitals.ts`

This module is shared by the API route and the admin widget. Server-only.

- [ ] **Step 1: Create the vitals module**

```ts
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "vitals.ts"
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/vitals.ts
git commit -m "feat(vitals): add shared CWV data layer"
```

---

### Task 10: Create `app/api/vitals/route.ts`

**Files:**
- Create: `app/api/vitals/route.ts`

- [ ] **Step 1: Create the API route**

```ts
// app/api/vitals/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { saveVital, getVitalsSummary, type VitalRecord } from '@/lib/vitals'
import { auth } from '@/auth'  // NextAuth v5 — project uses export const { auth } = NextAuth(...) from auth.ts

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as VitalRecord
    if (!body.metric || typeof body.value !== 'number') {
      return NextResponse.json({ error: 'invalid' }, { status: 400 })
    }
    await saveVital(body)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await auth()
    if ((session?.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }
    const summary = await getVitalsSummary()
    return NextResponse.json(summary)
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}
```

**Note:** This project uses NextAuth v5 (`next-auth@^5.0.0-beta`). Auth is exported from the root `auth.ts` file as `export const { auth } = NextAuth(...)`. Do NOT use `getServerSession` or `authOptions` — these are NextAuth v4 APIs that do not exist in this project.

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "api/vitals"
```

Expected: no errors. If `authOptions` import path is wrong, fix it.

- [ ] **Step 3: Commit**

```bash
git add app/api/vitals/
git commit -m "feat(vitals): add CWV collection API route"
```

---

### Task 11: Create `components/analytics/WebVitalsTracker.tsx`

**Files:**
- Create: `components/analytics/WebVitalsTracker.tsx`
- Modify: `app/[locale]/layout.tsx` (add tracker)

- [ ] **Step 1: Create the client component**

```tsx
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
        if (metric.value <= threshold) return  // only send violations + near-misses (80% of threshold)
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
  }, [])  // run once on mount; path captured via closure for the initial page

  return null
}
```

- [ ] **Step 2: Add tracker to `app/[locale]/layout.tsx`**

In `app/[locale]/layout.tsx`, find the imports section and add:

```ts
import { WebVitalsTracker } from '@/components/analytics/WebVitalsTracker'
```

Then inside the returned JSX (within the `<body>` or root element), add:

```tsx
<WebVitalsTracker />
```

Place it immediately before the closing `</body>` tag or at the end of the root layout element.

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "WebVitals"
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/analytics/WebVitalsTracker.tsx "app/[locale]/layout.tsx"
git commit -m "feat(vitals): add client-side CWV tracker to root layout"
```

---

### Task 12: Create `components/admin/WebVitalsWidget.tsx` + add to existing admin analytics page

**Files:**
- Create: `components/admin/WebVitalsWidget.tsx`
- Modify: `app/[locale]/admin/analytics/page.tsx` (already exists — a client component with mock analytics data)

**Important:** `app/[locale]/admin/analytics/page.tsx` already exists and contains an analytics dashboard with mock data. Do NOT replace it. Add `WebVitalsWidget` as a new section to the existing page.

The widget is a Server Component — it calls `getVitalsSummary()` directly (no HTTP self-fetch).

- [ ] **Step 1: Create the widget**

```tsx
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
```

- [ ] **Step 2a: Move existing client code to a new client component file**

Read `app/[locale]/admin/analytics/page.tsx`. It starts with `'use client'` and exports a single default component `AdminAnalyticsPage`.

Copy the **entire file contents** into a new file `components/admin/AnalyticsDashboardClient.tsx`, then make two edits to that copy:
- Keep `'use client'` at the top
- Rename `export default function AdminAnalyticsPage` → `export function AnalyticsDashboardClient`

- [ ] **Step 2b: Replace page.tsx with a Server Component wrapper**

Overwrite `app/[locale]/admin/analytics/page.tsx` entirely with:

```tsx
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
```

**Why:** A file with `'use client'` at the top cannot export a Server Component as its default. Extracting the client code to its own file resolves this.

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep -E "WebVitalsWidget|admin/analytics"
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/admin/WebVitalsWidget.tsx components/admin/AnalyticsDashboardClient.tsx "app/[locale]/admin/analytics/"
git commit -m "feat(vitals): add WebVitalsWidget to admin analytics page"
```

---

## Chunk 5: Sitemap + Final Polish

### Task 13: Update `app/sitemap.ts` — add student pages + helper refactor

**Files:**
- Modify: `app/sitemap.ts`

- [ ] **Step 1: Refactor into helper functions and add student entries**

Replace the entire `app/sitemap.ts` with:

```ts
import { MetadataRoute } from 'next'
import { getDb } from '@/lib/db'

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://fund-ed.com'

async function campaignEntries(db: Awaited<ReturnType<typeof getDb>>): Promise<MetadataRoute.Sitemap> {
  const campaigns = await db
    .collection('campaigns')
    .find(
      { status: { $in: ['published', 'active'] } },
      { projection: { campaign_id: 1, updated_at: 1 } }
    )
    .limit(5000)
    .toArray()

  return campaigns.map((c) => ({
    url: `${BASE}/campaign/${c.campaign_id}`,
    lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))
}

async function studentEntries(db: Awaited<ReturnType<typeof getDb>>): Promise<MetadataRoute.Sitemap> {
  const students = await db
    .collection('student_profiles')
    .find({}, { projection: { user_id: 1, updatedAt: 1 } })
    .limit(2000)
    .toArray()

  return students.map((s) => ({
    url: `${BASE}/student/${s.user_id}`,
    lastModified: s.updatedAt ? new Date(s.updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))
}

// async function schoolEntries(db): Promise<MetadataRoute.Sitemap> { ... }  ← add when school pages ship

const staticRoutes = [
  '',
  '/campaigns',
  '/browse',
  '/login',
  '/how-it-works',
  '/terms',
  '/privacy',
  '/who-we-are',
  '/mission-vision',
  '/fund-a-student',
  '/transparency',
  '/blog',
  '/education-funding-calculator',
  '/blog/alternatives-to-gofundme-for-education',
  '/blog/scholarship-vs-crowdfunding-vs-sponsorship',
  '/blog/esg-education-impact',
]

const priorityMap: Record<string, number> = {
  '': 1,
  '/fund-a-student': 0.9,
  '/transparency': 0.8,
  '/how-it-works': 0.8,
  '/who-we-are': 0.7,
  '/blog': 0.7,
  '/education-funding-calculator': 0.7,
  '/blog/alternatives-to-gofundme-for-education': 0.7,
  '/blog/scholarship-vs-crowdfunding-vs-sponsorship': 0.7,
  '/blog/esg-education-impact': 0.7,
}

const changeFreqMap: Record<string, MetadataRoute.Sitemap[0]['changeFrequency']> = {
  '': 'daily',
  '/blog': 'weekly',
  '/fund-a-student': 'weekly',
  '/transparency': 'weekly',
  '/how-it-works': 'monthly',
  '/who-we-are': 'monthly',
  '/education-funding-calculator': 'monthly',
  '/blog/alternatives-to-gofundme-for-education': 'monthly',
  '/blog/scholarship-vs-crowdfunding-vs-sponsorship': 'monthly',
  '/blog/esg-education-impact': 'monthly',
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const static_: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${BASE}${route}`,
    lastModified: new Date(),
    changeFrequency: changeFreqMap[route] ?? 'weekly',
    priority: priorityMap[route] ?? 0.8,
  }))

  try {
    const db = await getDb()
    const [campaigns, students] = await Promise.all([
      campaignEntries(db),
      studentEntries(db),
    ])
    return [...static_, ...campaigns, ...students]
  } catch {
    return static_
  }
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "sitemap"
```

Expected: no errors.

- [ ] **Step 3: Verify sitemap endpoint returns XML**

```bash
curl -s http://localhost:3000/sitemap.xml | head -20
```

Expected: `<?xml ...>` with `<url>` entries.

- [ ] **Step 4: Verify non-prefixed URLs redirect correctly**

The sitemap generates URLs without locale prefix (e.g. `https://fund-ed.com/campaign/id`). The existing `app/sitemap.ts` already does this for campaigns, so middleware presumably redirects non-prefixed URLs to the correct locale. Verify this matches the existing `middleware.ts` setup — if non-prefixed URLs 404, the campaign and student sitemap URLs need to be updated to use `/en/campaign/id` format to match the actual route structure.

- [ ] **Step 5: Commit**

```bash
git add app/sitemap.ts
git commit -m "feat(seo): add student pages to sitemap, refactor into helper functions"
```

---

### Task 14: Final verification

- [ ] **Step 1: Full TypeScript compile check**

```bash
npx tsc --noEmit 2>&1
```

Expected: 0 errors. Fix any type errors before proceeding.

- [ ] **Step 2: Check OG image routes are accessible**

Replace `REAL_CAMPAIGN_ID` / `REAL_USER_ID` with actual IDs from your DB:

```bash
# PowerShell:
Invoke-WebRequest "http://localhost:3000/api/og/campaign/REAL_CAMPAIGN_ID" | Select-Object StatusCode, ContentType
Invoke-WebRequest "http://localhost:3000/api/og/student/REAL_USER_ID" | Select-Object StatusCode, ContentType
# Bash:
curl -I "http://localhost:3000/api/og/campaign/REAL_CAMPAIGN_ID"
curl -I "http://localhost:3000/api/og/student/REAL_USER_ID"
```

Expected: `StatusCode 200`, `ContentType: image/png`.

- [ ] **Step 3: Verify robots.txt**

```bash
# PowerShell:
Invoke-WebRequest http://localhost:3000/robots.txt | Select-Object -ExpandProperty Content
# Bash:
curl http://localhost:3000/robots.txt
```

Expected: output includes `/en/student/panel/` and `/tr/student/panel/`.

- [ ] **Step 4: Verify sitemap includes student entries**

```bash
# PowerShell:
(Invoke-WebRequest http://localhost:3000/sitemap.xml).Content | Select-String "/student/"
# Bash:
curl -s http://localhost:3000/sitemap.xml | grep "/student/" | head -5
```

Expected: student profile URLs present (will be empty if `student_profiles` collection is empty in dev).

- [ ] **Step 5: Run existing tests**

```bash
npm test 2>&1 | tail -20
```

Expected: all previously passing tests still pass.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat(seo): complete SEO infrastructure — factory, OG images, CWV, sitemap"
```

---

## Checklist (from spec)

- [ ] OG image Facebook Sharing Debugger'da görünüyor
- [ ] JSON-LD Google Rich Results Test'te geçiyor (campaign + student)
- [ ] Sitemap.xml tüm kampanya ve öğrenci URL'lerini içeriyor
- [ ] Robots.txt admin + panel sayfalarını engelliyor
- [ ] Kanonik URL sayfalama/filtre için doğru (q= param yok)
- [ ] Core Web Vitals widget admin analytics sayfasında görünüyor
- [ ] Campaign layout.tsx'te duplicate generateMetadata kaldırıldı
- [ ] OG image kampanya için doğru URL'i kullanıyor (/api/og/campaign/[id])
