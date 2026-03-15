# SEO Audit Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the full SEO audit recommendations for FundEd — technical schema/metadata infrastructure, content pages, and a calculator tool — across 3 layered chunks.

**Architecture:** Layer 1 builds shared SEO utilities (`lib/seo/`) and fixes the locale layout. Layer 2 adds server wrappers to existing `'use client'` pages and creates new content pages. Layer 3 adds the calculator, ESG article, internal links, and 404 improvements.

**Tech Stack:** Next.js 14 App Router, TypeScript, next-intl (tr/en), Tailwind CSS, MongoDB

---

## Chunk 1: Technical SEO Infrastructure

### Task 1: `lib/seo/metadata.ts` — buildAlternates helper

**Files:**
- Create: `lib/seo/metadata.ts`

- [ ] **Step 1: Create the file**

```ts
// lib/seo/metadata.ts

const BASE = 'https://fund-ed.com'

/**
 * Generates canonical + hreflang alternates for every page.
 * x-default → English (global/international default).
 * Call with the locale from params and the path WITHOUT locale prefix.
 * Example: buildAlternates('tr', '/how-it-works')
 * For the homepage, pass '/' (not '') to produce a canonical with a trailing slash:
 * Example: buildAlternates('en', '/')
 */
export function buildAlternates(locale: string, path: string) {
  return {
    canonical: `${BASE}/${locale}${path}`,
    languages: {
      tr: `${BASE}/tr${path}`,
      en: `${BASE}/en${path}`,
      'x-default': `${BASE}/en${path}`,
    },
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors from `lib/seo/metadata.ts`

- [ ] **Step 3: Commit**

```bash
git add lib/seo/metadata.ts
git commit -m "feat(seo): add buildAlternates helper for canonical + hreflang"
```

---

### Task 2: `lib/seo/schemas.ts` — JSON-LD schema builders

**Files:**
- Create: `lib/seo/schemas.ts`

- [ ] **Step 1: Create the file**

```ts
// lib/seo/schemas.ts

const BASE = 'https://fund-ed.com'
const BRAND = 'FundEd'

/* ── Organization (sitewide) ── */
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND,
    url: BASE,
    logo: `${BASE}/logo.png`,
    sameAs: [],
    description:
      'FundEd is the first ESG-aligned education crowdfunding platform with verified student outcomes.',
  }
}

/* ── WebSite + SearchAction (sitewide) ── */
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRAND,
    url: BASE,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE}/browse?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/* ── BreadcrumbList ── */
export interface Crumb {
  name: string
  url: string
}
export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  }
}

/* ── FAQPage ── */
export interface FaqItem {
  question: string
  answer: string
}
export function faqSchema(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}

/* ── Article ── */
export function articleSchema({
  title,
  description,
  url,
  imageUrl,
  datePublished,
  dateModified,
}: {
  title: string
  description: string
  url: string
  imageUrl?: string
  datePublished: string
  dateModified?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    image: imageUrl || `${BASE}/og-image.png`,
    datePublished,
    dateModified: dateModified || datePublished,
    author: { '@type': 'Organization', name: BRAND },
    publisher: {
      '@type': 'Organization',
      name: BRAND,
      logo: { '@type': 'ImageObject', url: `${BASE}/logo.png` },
    },
  }
}

/* ── HowTo (for calculator) ── */
export interface HowToStep {
  name: string
  text: string
}
export function howToSchema({
  name,
  description,
  steps,
}: {
  name: string
  description: string
  steps: HowToStep[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((s) => ({
      '@type': 'HowToStep',
      name: s.name,
      text: s.text,
    })),
  }
}

/* ── Person (student profile) ── */
export function personSchema({
  name,
  description,
  imageUrl,
  url,
}: {
  name: string
  description: string
  imageUrl?: string
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    description,
    image: imageUrl,
    url,
  }
}

/* ── EducationalOrganization ── */
export function educationalOrgSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: BRAND,
    url: BASE,
    description:
      'ESG-aligned education crowdfunding connecting donors with verified students globally.',
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add lib/seo/schemas.ts
git commit -m "feat(seo): add JSON-LD schema builder functions"
```

---

### Task 3: `components/seo/JsonLd.tsx`

**Files:**
- Create: `components/seo/JsonLd.tsx`

- [ ] **Step 1: Create the file**

```tsx
// components/seo/JsonLd.tsx
// Server component — renders a <script type="application/ld+json"> tag.
// Pass any schema object from lib/seo/schemas.ts.

interface Props {
  schema: Record<string, unknown> | Record<string, unknown>[]
}

export function JsonLd({ schema }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add components/seo/JsonLd.tsx
git commit -m "feat(seo): add JsonLd server component"
```

---

### Task 4: Fix `app/[locale]/layout.tsx` — remove broken canonical, add sitewide schemas

**Files:**
- Modify: `app/[locale]/layout.tsx`

- [ ] **Step 1: Remove broken canonical from metadata export**

In `app/[locale]/layout.tsx`, find and delete this exact block (text-based, do not use line numbers):
```ts
  alternates: {
    canonical: '/',
  },
```
Remove those three lines. The `keywords` property immediately follows and must remain. The full `metadata` export after the change should look like:

```ts
export const metadata: Metadata = {
  metadataBase: new URL('https://fund-ed.com'),
  title: {
    default: 'FundEd - Eğitim Kitle Fonlama Platformu',
    template: '%s | FundEd',
  },
  description: 'Doğrulanmış öğrencilere bağış yaparak eğitim hayallerini gerçeğe dönüştürün. FundEd, güvenli ve şeffaf bir kitle fonlama platformudur.',
  openGraph: {
    siteName: 'FundEd',
    locale: 'tr_TR',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'FundEd' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  keywords: ['eğitim', 'bağış', 'kitle fonlama', 'öğrenci', 'fon', 'sosyal sorumluluk', 'burs', 'eğitimde fırsat eşitliği'],
  authors: [{ name: 'FundEd Ekibi' }],
  creator: 'FundEd',
  publisher: 'FundEd',
}
```

- [ ] **Step 2: Add Organization + WebSite JSON-LD to layout JSX**

Add imports at the top of the file:
```ts
import { JsonLd } from '@/components/seo/JsonLd'
import { organizationSchema, websiteSchema } from '@/lib/seo/schemas'
```

In the JSX return, insert the two `<JsonLd>` lines immediately after `<body className={inter.className}>` and before `<GoogleAnalytics>`. The `<NextIntlClientProvider>` wrapper, the `<script>` tag for `history.scrollRestoration`, `<ErrorBoundary>`, `<Providers>`, `<Toaster>`, and `<AiAssistantLoader>` are all untouched. Only the two new lines are inserted:

```tsx
<body className={inter.className}>
  <JsonLd schema={organizationSchema()} />
  <JsonLd schema={websiteSchema()} />
  <GoogleAnalytics gaId="G-NRN6MW6SDF" />
  <NextIntlClientProvider messages={messages}>
    {/* everything inside NextIntlClientProvider unchanged */}
  </NextIntlClientProvider>
</body>
```

- [ ] **Step 3: Verify build compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/layout.tsx
git commit -m "fix(seo): remove broken canonical fallback, add Organization+WebSite schema"
```

---

### Task 5: Update `app/robots.ts` and `app/sitemap.ts`

**Files:**
- Modify: `app/robots.ts`
- Modify: `app/sitemap.ts`

- [ ] **Step 1: Update robots.ts — add locale-prefixed corporate disallow**

Replace the `disallow` array:
```ts
disallow: [
  '/api/', '/admin/', '/student/dashboard/', '/account/',
  '/dashboard/', '/ops/', '/en/corporate/', '/tr/corporate/',
],
```

- [ ] **Step 2: Update sitemap.ts — add new routes and replace mapping logic**

This step replaces both the `staticRoutes` array AND the `.map()` call that follows it. The existing `.map()` uses a simple formula (`priority: route === '' ? 1 : 0.8`) — replace it entirely with the lookup-map approach below.

Replace the `staticRoutes` array and the sitemap mapping block with:

```ts
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
  // SEO audit additions
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

const changeFreqMap: Record<string, 'daily' | 'weekly' | 'monthly'> = {
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

const sitemap: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
  url: `${baseUrl}${route}`,
  lastModified: new Date(),
  changeFrequency: changeFreqMap[route] ?? 'weekly',
  priority: priorityMap[route] ?? 0.8,
}))
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add app/robots.ts app/sitemap.ts
git commit -m "feat(seo): update robots disallow for corporate routes, add new pages to sitemap"
```

---

## Chunk 2: Server Wrappers + Homepage + Campaign Schema

### Task 6: Homepage metadata update

**Files:**
- Modify: `app/[locale]/page.tsx`

The current `generateMetadata` (lines 9-29) has generic titles. Replace with audit-specified copy + `buildAlternates`.

- [ ] **Step 1: Add import at top of file**

```ts
import { buildAlternates } from '@/lib/seo/metadata'
```

- [ ] **Step 2: Replace generateMetadata function**

Only `generateMetadata` is replaced. The `export default` function (the page component) is NOT modified.

```ts
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const isTr = locale === 'tr'
  return {
    title: isTr
      ? 'Bir Öğrenciyi Destekle | FundEd'
      : "Fund a Student's Education | FundEd",
    description: isTr
      ? 'Doğrulanmış öğrencileri küresel çapta destekleyin. ESG uyumlu ilk eğitim fonlama platformu. Gerçek etkiyi takip edin.'
      : 'Sponsor verified students globally on the first ESG-aligned education funding platform. Track real impact.',
    openGraph: {
      title: isTr
        ? 'Bir Öğrenciyi Destekle | FundEd'
        : "Fund a Student's Education | FundEd",
      description: isTr
        ? 'Doğrulanmış öğrencileri küresel çapta destekleyin. ESG uyumlu ilk eğitim fonlama platformu.'
        : 'Sponsor verified students globally on the first ESG-aligned education funding platform.',
      images: ['/og-image.png'],
      locale: isTr ? 'tr_TR' : 'en_US',
    },
    alternates: buildAlternates(locale, '/'),
  }
}
```

- [ ] **Step 3: Verify build**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/page.tsx
git commit -m "feat(seo): update homepage metadata with audit keywords and hreflang"
```

---

### Task 7: how-it-works — server wrapper

**Files:**
- Rename: `app/[locale]/how-it-works/page.tsx` → `app/[locale]/how-it-works/HowItWorksClient.tsx`
- Create: `app/[locale]/how-it-works/page.tsx`

- [ ] **Step 1: Rename existing file**

The original `page.tsx` already has `'use client'` at the top — `git mv` preserves it correctly. The client components read locale via next-intl hooks (`useLocale()`) or `usePathname()` — no locale prop needed on the client render call.

```bash
git mv "app/[locale]/how-it-works/page.tsx" "app/[locale]/how-it-works/HowItWorksClient.tsx"
```

- [ ] **Step 2: Create new server page**

```tsx
// app/[locale]/how-it-works/page.tsx
import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/seo/metadata'
import { JsonLd } from '@/components/seo/JsonLd'
import { faqSchema, breadcrumbSchema } from '@/lib/seo/schemas'
import HowItWorksClient from './HowItWorksClient'

interface Props {
  params: { locale: string }
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isTr = locale === 'tr'
  return {
    title: isTr
      ? 'Eğitim Fonlaması Nasıl Çalışır | FundEd'
      : 'How Education Funding Works | FundEd',
    description: isTr
      ? 'FundEd, bağışçıları doğrulanmış öğrencilerle buluşturur. Şeffaf fonlama, doğrulanmış sonuçlar, gerçek etki.'
      : 'See how FundEd connects donors with verified students. Transparent funding, verified outcomes, real impact.',
    alternates: buildAlternates(locale, '/how-it-works'),
  }
}

const faqEn = [
  { question: 'Where does my donation go?', answer: 'Your donation goes directly to the student you choose. General fund donations are distributed to students with the most urgent needs. Every transaction is recorded and trackable.' },
  { question: 'Can I donate anonymously?', answer: 'Yes! Leave your name and email blank on the donation form to donate completely anonymously.' },
  { question: 'How are students verified?', answer: 'Every student application is submitted with ID, enrollment document, and a needs statement. Our team verifies all documents before the profile is published.' },
  { question: 'How can I see the impact of my donation?', answer: 'After donating, track the student\'s progress, photos, and impact reports from your personal dashboard.' },
  { question: 'Can companies donate?', answer: 'Yes! With FundEd Corporate, your company can donate, auto-generate ESG reports, and manage impact as a team.' },
]

const faqTr = [
  { question: 'Bağışım nereye gidiyor?', answer: 'Bağışınız doğrudan seçtiğiniz öğrencinin ihtiyacına yönlendirilir. Genel fona yapılan bağışlar en acil ihtiyacı olan öğrencilere dağıtılır. Her işlem kaydedilir ve takip edilebilir.' },
  { question: 'Anonim bağış yapabilir miyim?', answer: 'Evet! Bağış formunda adınızı ve e-postanızı boş bırakarak tamamen anonim bağış yapabilirsiniz.' },
  { question: 'Öğrenciler nasıl doğrulanıyor?', answer: 'Her öğrenci başvurusu kimlik belgesi, öğrenim belgesi ve ihtiyaç beyanıyla yapılır. Ekibimiz tüm belgeleri doğrular.' },
  { question: 'Bağışımın etkisini nasıl görebilirim?', answer: 'Bağış sonrası kişisel dashboard\'ınızdan öğrencinin ilerlemesini, fotoğrafları ve etki raporlarını takip edebilirsiniz.' },
  { question: 'Kurumsal bağış yapabilir miyiz?', answer: 'Evet! FundEd Kurumsal panelimiz ile şirketiniz adına bağış yapabilir, ESG raporlarınızı otomatik oluşturabilirsiniz.' },
]

export default function HowItWorksPage({ params: { locale } }: Props) {
  const isTr = locale === 'tr'
  const faqs = isTr ? faqTr : faqEn
  const breadcrumbs = isTr
    ? [{ name: 'Ana Sayfa', url: 'https://fund-ed.com/tr' }, { name: 'Nasıl Çalışır', url: 'https://fund-ed.com/tr/how-it-works' }]
    : [{ name: 'Home', url: 'https://fund-ed.com/en' }, { name: 'How It Works', url: 'https://fund-ed.com/en/how-it-works' }]

  return (
    <>
      <JsonLd schema={faqSchema(faqs)} />
      <JsonLd schema={breadcrumbSchema(breadcrumbs)} />
      <HowItWorksClient />
    </>
  )
}
```

- [ ] **Step 3: Delete original page.tsx (now replaced)**

```bash
# The original content is now in HowItWorksClient.tsx
# page.tsx was overwritten in step 2 — nothing to delete
```

- [ ] **Step 4: Verify build**

```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/how-it-works/"
git commit -m "feat(seo): add server wrapper + metadata + FAQ schema to how-it-works"
```

---

### Task 8: transparency — server wrapper

**Files:**
- Rename: `app/[locale]/transparency/page.tsx` → `app/[locale]/transparency/TransparencyClient.tsx`
- Create: `app/[locale]/transparency/page.tsx`

- [ ] **Step 1: Copy existing page to client file**

The original `page.tsx` already has `'use client'` at the top — `git mv` preserves it correctly.

```bash
git mv "app/[locale]/transparency/page.tsx" "app/[locale]/transparency/TransparencyClient.tsx"
```

- [ ] **Step 2: Create new server page**

```tsx
// app/[locale]/transparency/page.tsx
import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/seo/metadata'
import { JsonLd } from '@/components/seo/JsonLd'
import { faqSchema, breadcrumbSchema } from '@/lib/seo/schemas'
import TransparencyClient from './TransparencyClient'

interface Props {
  params: { locale: string }
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isTr = locale === 'tr'
  return {
    title: isTr
      ? 'Doğrulanmış ve Şeffaf Eğitim Fonlaması | FundEd'
      : 'Verified & Transparent Education Funding | FundEd',
    description: isTr
      ? 'Her bağışın tam olarak nereye gittiğini görün. FundEd canlı fon takibi ve doğrulanmış öğrenci sonuçları yayınlar.'
      : 'See exactly where every donation goes. FundEd publishes live fund tracking and verified student outcomes.',
    alternates: buildAlternates(locale, '/transparency'),
  }
}

const faqEn = [
  { question: 'How does FundEd verify students?', answer: 'Every student submits ID, enrollment documents, and a needs statement. Our team verifies all documents before any profile is published on the platform.' },
  { question: 'How is my donation tracked?', answer: 'Every donation is assigned a transaction ID and linked to a specific student or fund. You can view the complete audit trail from your donor dashboard.' },
  { question: 'What percentage goes to students?', answer: 'The vast majority of every donation reaches the student directly. A small platform fee covers operations and verification costs — displayed transparently on every donation page.' },
  { question: 'Can I see how past donations were spent?', answer: 'Yes. Every completed campaign shows a breakdown of how funds were used, with receipts and student progress updates.' },
  { question: 'Is FundEd ESG-compliant?', answer: 'Yes. FundEd provides impact reports aligned with ESG (Environmental, Social, Governance) frameworks, including SDG 4 (Quality Education) tracking for corporate donors.' },
]

const faqTr = [
  { question: 'FundEd öğrencileri nasıl doğruluyor?', answer: 'Her öğrenci kimlik, öğrenim belgesi ve ihtiyaç beyanı ile başvurur. Ekibimiz tüm belgeleri doğrular, profil ancak onaylandıktan sonra yayınlanır.' },
  { question: 'Bağışım nasıl takip edilir?', answer: 'Her bağışa bir işlem kimliği atanır ve belirli bir öğrenci veya fona bağlanır. Bağışçı dashboard\'ınızdan tam denetim izini görüntüleyebilirsiniz.' },
  { question: 'Bağışımın yüzde kaçı öğrenciye ulaşır?', answer: 'Her bağışın büyük çoğunluğu doğrudan öğrenciye ulaşır. Küçük bir platform ücreti, operasyon ve doğrulama maliyetlerini karşılar — her bağış sayfasında şeffaf biçimde gösterilir.' },
  { question: 'Geçmiş bağışların nasıl kullanıldığını görebilir miyim?', answer: 'Evet. Tamamlanan her kampanya, fonların nasıl kullanıldığını, makbuzları ve öğrenci ilerleme güncellemelerini gösterir.' },
  { question: 'FundEd ESG uyumlu mu?', answer: 'Evet. FundEd, kurumsal bağışçılar için SDG 4 (Kaliteli Eğitim) takibi dahil ESG çerçevelerine uygun etki raporları sunar.' },
]

export default function TransparencyPage({ params: { locale } }: Props) {
  const isTr = locale === 'tr'
  const faqs = isTr ? faqTr : faqEn
  const breadcrumbs = isTr
    ? [{ name: 'Ana Sayfa', url: 'https://fund-ed.com/tr' }, { name: 'Şeffaflık', url: 'https://fund-ed.com/tr/transparency' }]
    : [{ name: 'Home', url: 'https://fund-ed.com/en' }, { name: 'Transparency', url: 'https://fund-ed.com/en/transparency' }]

  return (
    <>
      <JsonLd schema={faqSchema(faqs)} />
      <JsonLd schema={breadcrumbSchema(breadcrumbs)} />
      <TransparencyClient />
    </>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add "app/[locale]/transparency/"
git commit -m "feat(seo): add server wrapper + metadata + FAQ schema to transparency"
```

---

### Task 9: who-we-are — server wrapper

**Files:**
- Rename: `app/[locale]/who-we-are/page.tsx` → `app/[locale]/who-we-are/WhoWeAreClient.tsx`
- Create: `app/[locale]/who-we-are/page.tsx`

- [ ] **Step 1: Copy to client file**

The original `page.tsx` already has `'use client'` at the top — `git mv` preserves it correctly.

```bash
git mv "app/[locale]/who-we-are/page.tsx" "app/[locale]/who-we-are/WhoWeAreClient.tsx"
```

- [ ] **Step 2: Create server wrapper**

```tsx
// app/[locale]/who-we-are/page.tsx
import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/seo/metadata'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbSchema } from '@/lib/seo/schemas'
import WhoWeAreClient from './WhoWeAreClient'

interface Props {
  params: { locale: string }
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isTr = locale === 'tr'
  return {
    title: isTr
      ? 'FundEd Hakkında — ESG Eğitim Platformu | FundEd'
      : 'About FundEd — ESG Education Platform | FundEd',
    description: isTr
      ? 'FundEd, doğrulanmış öğrenci sonuçlarına sahip ilk ESG uyumlu eğitim kitle fonlama platformudur.'
      : 'FundEd is the first ESG-aligned education crowdfunding platform with verified student outcomes.',
    alternates: buildAlternates(locale, '/who-we-are'),
  }
}

export default function WhoWeArePage({ params: { locale } }: Props) {
  const isTr = locale === 'tr'
  const breadcrumbs = isTr
    ? [{ name: 'Ana Sayfa', url: 'https://fund-ed.com/tr' }, { name: 'Hakkımızda', url: 'https://fund-ed.com/tr/who-we-are' }]
    : [{ name: 'Home', url: 'https://fund-ed.com/en' }, { name: 'About', url: 'https://fund-ed.com/en/who-we-are' }]

  return (
    <>
      <JsonLd schema={breadcrumbSchema(breadcrumbs)} />
      <WhoWeAreClient />
    </>
  )
}
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add "app/[locale]/who-we-are/"
git commit -m "feat(seo): add server wrapper + metadata + BreadcrumbList to who-we-are"
```

---

### Task 10: campaign/[id] — schema + alternates

**Files:**
- Modify: `app/[locale]/campaign/[id]/page.tsx`

- [ ] **Step 1: Add imports**

At the top of `app/[locale]/campaign/[id]/page.tsx` add:
```ts
import { buildAlternates } from '@/lib/seo/metadata'
import { JsonLd } from '@/components/seo/JsonLd'
import { personSchema, educationalOrgSchema, breadcrumbSchema } from '@/lib/seo/schemas'
```

- [ ] **Step 2: Update generateMetadata to add alternates**

The existing `generateMetadata` is at lines 13-39. Add `alternates` to the return (add `locale` to the Props destructure first):

```ts
interface Props {
  params: { id: string; locale: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const campaign = await fetchCampaignData(params.id)
  if (!campaign) return { title: 'Campaign Not Found — FundEd' }

  const description = campaign.story
    ? campaign.story.substring(0, 160) + (campaign.story.length > 160 ? '...' : '')
    : `Support ${campaign.student?.name}'s education on FundEd`

  return {
    title: `${campaign.title} — FundEd`,
    description,
    openGraph: {
      title: campaign.title,
      description,
      type: 'article',
      images: campaign.cover_image ? [{ url: campaign.cover_image, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: campaign.title,
      description,
      images: campaign.cover_image ? [campaign.cover_image] : [],
    },
    alternates: buildAlternates(params.locale, '/campaign/' + params.id),
  }
}
```

- [ ] **Step 3: Add JsonLd to page component**

The existing default export calls `notFound()` when `!campaign` — this guard MUST be preserved. Add the schema logic immediately after the notFound guard, then wrap the existing return:

```tsx
export default async function CampaignDetailPage({ params }: Props) {
  const campaign = await fetchCampaignData(params.id)

  // Preserve existing notFound guard — do NOT remove this
  // `return` after notFound() satisfies TypeScript narrowing (notFound throws internally)
  if (!campaign) {
    return notFound()
  }

  const isTr = params.locale === 'tr'

  const schemas = [
    personSchema({
      name: campaign.student?.name || campaign.title,
      description: campaign.story?.substring(0, 200) || '',
      imageUrl: campaign.cover_image,
      url: `https://fund-ed.com/${params.locale}/campaign/${params.id}`,
    }),
    educationalOrgSchema(),
    breadcrumbSchema(isTr
      ? [
          { name: 'Ana Sayfa', url: `https://fund-ed.com/tr` },
          { name: 'Kampanyalar', url: `https://fund-ed.com/tr/browse` },
          { name: campaign.title, url: `https://fund-ed.com/tr/campaign/${params.id}` },
        ]
      : [
          { name: 'Home', url: `https://fund-ed.com/en` },
          { name: 'Browse', url: `https://fund-ed.com/en/browse` },
          { name: campaign.title, url: `https://fund-ed.com/en/campaign/${params.id}` },
        ]
    ),
  ]

  return (
    <>
      {schemas.map((s, i) => <JsonLd key={i} schema={s} />)}
      {/* existing JSX unchanged below */}
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/campaign/"
git commit -m "feat(seo): add Person+EducationalOrg schema and hreflang to campaign pages"
```

---

## Chunk 3: New Pages

### Task 11: /fund-a-student landing page

**Files:**
- Create: `app/[locale]/fund-a-student/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
// app/[locale]/fund-a-student/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { buildAlternates } from '@/lib/seo/metadata'
import { JsonLd } from '@/components/seo/JsonLd'
import { faqSchema, breadcrumbSchema } from '@/lib/seo/schemas'
import { getDb } from '@/lib/db'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface Props {
  params: { locale: string }
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isTr = locale === 'tr'
  return {
    title: isTr
      ? 'Bir Öğrenciyi Destekle — Şeffaf Etki | FundEd'
      : 'Fund a Student — Transparent Impact | FundEd',
    description: isTr
      ? 'Desteklemek istediğiniz doğrulanmış bir öğrenci seçin. Her bağış takip edilir ve etki olarak raporlanır. $25 ile başlayın.'
      : 'Choose a verified student to fund. Every donation is tracked and impact-reported. Start with $25.',
    alternates: buildAlternates(locale, '/fund-a-student'),
    openGraph: {
      images: ['/og-image.png'],
    },
  }
}

async function getFeaturedCampaigns() {
  try {
    const db = await getDb()
    return db.collection('campaigns')
      .find({ status: { $in: ['active', 'published'] } })
      .sort({ created_at: -1 })
      .limit(6)
      .toArray()
  } catch {
    return []
  }
}

const faqEn = [
  { question: 'How do I fund a student?', answer: 'Browse verified student profiles, choose one that resonates with you, and donate any amount. You\'ll receive progress updates directly to your email.' },
  { question: 'Is my donation tax-deductible?', answer: 'Depending on your country, donations may be tax-deductible. We provide a donation receipt for all transactions. Consult your local tax authority for eligibility.' },
  { question: 'How are students selected?', answer: 'Students apply with verified ID, enrollment documents, and a detailed needs assessment. Only verified students appear on the platform.' },
  { question: 'Can I fund a student monthly?', answer: 'Yes. You can set up recurring monthly donations to support a student throughout their academic year.' },
  { question: 'What happens if a campaign reaches its goal?', answer: 'Once fully funded, the student receives the funds directly for their specified educational needs. You\'ll be notified and receive a final impact report.' },
]

const faqTr = [
  { question: 'Bir öğrenciyi nasıl desteklerim?', answer: 'Doğrulanmış öğrenci profillerine göz atın, size uygun olanı seçin ve istediğiniz miktarda bağış yapın. İlerleme güncellemelerini doğrudan e-postanıza alacaksınız.' },
  { question: 'Bağışım vergiden düşülebilir mi?', answer: 'Ülkenize bağlı olarak bağışlar vergiden düşülebilir. Tüm işlemler için bağış makbuzu sağlıyoruz. Uygunluk için yerel vergi otoritenize danışın.' },
  { question: 'Öğrenciler nasıl seçiliyor?', answer: 'Öğrenciler doğrulanmış kimlik, öğrenim belgesi ve ayrıntılı ihtiyaç değerlendirmesiyle başvurur. Yalnızca doğrulanmış öğrenciler platformda yer alır.' },
  { question: 'Aylık düzenli bağış yapabilir miyim?', answer: 'Evet. Bir öğrenciyi akademik yıl boyunca desteklemek için aylık yinelenen bağış kurabilirsiniz.' },
  { question: 'Bir kampanya hedefine ulaşırsa ne olur?', answer: 'Tamamen fonlandığında, öğrenci belirlenen eğitim ihtiyaçları için doğrudan fonu alır. Bildirim alırsınız ve son bir etki raporu gönderilir.' },
]

export default async function FundAStudentPage({ params: { locale } }: Props) {
  const isTr = locale === 'tr'
  const campaigns = await getFeaturedCampaigns()
  const faqs = isTr ? faqTr : faqEn
  const breadcrumbs = isTr
    ? [{ name: 'Ana Sayfa', url: 'https://fund-ed.com/tr' }, { name: 'Öğrenci Destekle', url: 'https://fund-ed.com/tr/fund-a-student' }]
    : [{ name: 'Home', url: 'https://fund-ed.com/en' }, { name: 'Fund a Student', url: 'https://fund-ed.com/en/fund-a-student' }]

  return (
    <>
      <JsonLd schema={faqSchema(faqs)} />
      <JsonLd schema={breadcrumbSchema(breadcrumbs)} />
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow">

          {/* HERO */}
          <section className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 py-24 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
                {isTr
                  ? 'Doğrulanmış Etki Takibiyle Bir Öğrencinin Eğitimini Destekle'
                  : "Fund a Student's Education with Verified Impact Tracking"}
              </h1>
              <p className="text-lg text-emerald-100 max-w-2xl mx-auto mb-8">
                {isTr
                  ? 'FundEd, bağışçıları doğrulanmış öğrencilerle buluşturan ilk ESG uyumlu eğitim fonlama platformudur. Her bağış takip edilir.'
                  : 'FundEd is the first ESG-aligned education funding platform connecting donors with verified students. Every donation is tracked.'}
              </p>
              <Link
                href={`/${locale}/browse`}
                className="inline-block bg-white text-emerald-700 font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-emerald-50 transition-colors"
              >
                {isTr ? 'Öğrencileri Keşfet' : 'Browse Students'}
              </Link>
            </div>
          </section>

          {/* IMPACT STATS — HTML text for crawlability */}
          <section className="py-16 bg-emerald-50">
            <div className="max-w-5xl mx-auto px-4 grid grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-4xl font-bold text-emerald-700">{campaigns.length}+</p>
                <p className="text-slate-600 mt-2">{isTr ? 'Aktif Kampanya' : 'Active Campaigns'}</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-emerald-700">100%</p>
                <p className="text-slate-600 mt-2">{isTr ? 'Doğrulanmış Öğrenci' : 'Verified Students'}</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-emerald-700">ESG</p>
                <p className="text-slate-600 mt-2">{isTr ? 'Uyumlu Raporlama' : 'Aligned Reporting'}</p>
              </div>
            </div>
          </section>

          {/* STUDENT GRID */}
          {campaigns.length > 0 && (
            <section className="py-20 px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
                  {isTr ? 'Desteklenmeyi Bekleyen Öğrenciler' : 'Students Waiting to Be Funded'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {campaigns.map((c: any) => (
                    <Link
                      key={c._id?.toString()}
                      href={`/${locale}/campaign/${c.campaign_id || c._id}`}
                      className="block bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-shadow p-6"
                    >
                      <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">{c.title}</h3>
                      <p className="text-sm text-slate-500 line-clamp-3">{c.story?.substring(0, 120)}</p>
                    </Link>
                  ))}
                </div>
                <div className="text-center mt-10">
                  <Link href={`/${locale}/browse`} className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
                    {isTr ? 'Tüm Öğrencileri Gör' : 'See All Students'}
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* HOW IT WORKS MINI */}
          <section className="py-20 bg-slate-50 px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
                {isTr ? 'Nasıl Çalışır' : 'How It Works'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { step: '01', en: 'Browse verified students', tr: 'Doğrulanmış öğrencilere göz at' },
                  { step: '02', en: 'Donate securely', tr: 'Güvenli bağış yap' },
                  { step: '03', en: 'Track real impact', tr: 'Gerçek etkiyi takip et' },
                ].map((s) => (
                  <div key={s.step} className="text-center">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <span className="font-bold text-emerald-700">{s.step}</span>
                    </div>
                    <p className="font-semibold text-slate-800">{isTr ? s.tr : s.en}</p>
                  </div>
                ))}
              </div>
              <div className="text-center mt-10 flex flex-wrap justify-center gap-4">
                <Link href={`/${locale}/how-it-works`} className="text-emerald-600 underline underline-offset-4 font-medium">
                  {isTr ? 'Detaylı Rehberi Oku' : 'Read the full guide'}
                </Link>
                <Link href={`/${locale}/transparency`} className="text-emerald-600 underline underline-offset-4 font-medium">
                  {isTr ? 'Şeffaflık Politikamız' : 'Our Transparency Policy'}
                </Link>
                <Link href={`/${locale}/education-funding-calculator`} className="text-emerald-600 underline underline-offset-4 font-medium">
                  {isTr ? 'Etki Hesaplayıcı' : 'Impact Calculator'}
                </Link>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-20 px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
                {isTr ? 'Sık Sorulan Sorular' : 'Frequently Asked Questions'}
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <details key={i} className="bg-slate-50 rounded-xl border border-slate-100 p-6">
                    <summary className="font-semibold text-slate-800 cursor-pointer">{faq.question}</summary>
                    <p className="mt-3 text-slate-500 leading-relaxed">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

        </main>
        <Footer />
      </div>
    </>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add "app/[locale]/fund-a-student/"
git commit -m "feat: add /fund-a-student landing page with FAQ schema and bilingual content"
```

---

### Task 12: Blog index page

**Files:**
- Create: `app/[locale]/blog/page.tsx`

- [ ] **Step 1: Create the blog index**

```tsx
// app/[locale]/blog/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { buildAlternates } from '@/lib/seo/metadata'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbSchema } from '@/lib/seo/schemas'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface Props {
  params: { locale: string }
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isTr = locale === 'tr'
  return {
    title: isTr ? 'Eğitim Fonlama Blogu | FundEd' : 'Education Funding Blog | FundEd',
    description: isTr
      ? 'Eğitim fonlaması, ESG yatırımı ve şeffaf bağış hakkında rehberler ve karşılaştırmalar.'
      : 'Guides and comparisons on education funding, ESG investing, and transparent donations.',
    alternates: buildAlternates(locale, '/blog'),
  }
}

const posts = [
  {
    slug: 'alternatives-to-gofundme-for-education',
    en: { title: 'Best Alternatives to GoFundMe for Education Funding', description: 'An honest comparison of 7 platforms for funding education — and why transparency matters.' },
    tr: { title: 'Eğitim Fonlaması İçin GoFundMe Alternatifleri', description: '7 platformun dürüst karşılaştırması — ve şeffaflığın neden önemli olduğu.' },
    date: '2026-03-15',
  },
  {
    slug: 'scholarship-vs-crowdfunding-vs-sponsorship',
    en: { title: 'Scholarship vs. Crowdfunding vs. Sponsorship: Which Is Best?', description: 'A clear comparison of three models for funding a student\'s education.' },
    tr: { title: 'Burs, Kitle Fonlaması, Sponsorluk: Hangisi Daha İyi?', description: 'Bir öğrencinin eğitimini finanse etmenin üç modelinin net karşılaştırması.' },
    date: '2026-03-15',
  },
  {
    slug: 'esg-education-impact',
    en: { title: 'What Is ESG-Aligned Giving in Education?', description: 'How education donations fit into ESG frameworks and why it matters for donors and corporates.' },
    tr: { title: 'Eğitimde ESG Uyumlu Bağış Nedir?', description: 'Eğitim bağışları ESG çerçevelerine nasıl uyar ve bu neden önemlidir.' },
    date: '2026-03-15',
  },
]

export default function BlogPage({ params: { locale } }: Props) {
  const isTr = locale === 'tr'
  const crumbs = isTr
    ? [{ name: 'Ana Sayfa', url: 'https://fund-ed.com/tr' }, { name: 'Blog', url: 'https://fund-ed.com/tr/blog' }]
    : [{ name: 'Home', url: 'https://fund-ed.com/en' }, { name: 'Blog', url: 'https://fund-ed.com/en/blog' }]

  return (
    <>
      <JsonLd schema={breadcrumbSchema(crumbs)} />
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow max-w-4xl mx-auto px-4 py-20 w-full">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {isTr ? 'Eğitim Fonlama Blogu' : 'Education Funding Blog'}
          </h1>
          <p className="text-lg text-slate-500 mb-12">
            {isTr
              ? 'Eğitim fonlaması, ESG ve şeffaf bağış hakkında rehberler.'
              : 'Guides on education funding, ESG investing, and transparent donations.'}
          </p>
          <div className="space-y-8">
            {posts.map((post) => {
              const content = isTr ? post.tr : post.en
              return (
                <Link
                  key={post.slug}
                  href={`/${locale}/blog/${post.slug}`}
                  className="block bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-lg transition-shadow"
                >
                  <p className="text-sm text-slate-400 mb-2">{post.date}</p>
                  <h2 className="text-xl font-bold text-slate-900 mb-3">{content.title}</h2>
                  <p className="text-slate-500">{content.description}</p>
                </Link>
              )
            })}
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add "app/[locale]/blog/page.tsx"
git commit -m "feat: add blog index page with bilingual post listing"
```

---

### Task 13: Blog post — Alternatives to GoFundMe

**Files:**
- Create: `app/[locale]/blog/alternatives-to-gofundme-for-education/page.tsx`

- [ ] **Step 1: Create the post**

```tsx
// app/[locale]/blog/alternatives-to-gofundme-for-education/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { buildAlternates } from '@/lib/seo/metadata'
import { JsonLd } from '@/components/seo/JsonLd'
import { articleSchema, breadcrumbSchema } from '@/lib/seo/schemas'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface Props { params: { locale: string } }

const DATE = '2026-03-15'
const SLUG = '/blog/alternatives-to-gofundme-for-education'

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isTr = locale === 'tr'
  return {
    title: isTr
      ? 'Eğitim için GoFundMe Alternatifleri (2026) | FundEd'
      : 'Best Alternatives to GoFundMe for Education (2026) | FundEd',
    description: isTr
      ? 'Eğitim fonlaması için GoFundMe yerine hangi platformları kullanmalısınız? 7 platformun dürüst karşılaştırması.'
      : 'Which platforms should you use instead of GoFundMe for education? An honest comparison of 7 platforms.',
    alternates: buildAlternates(locale, SLUG),
  }
}

export default function BlogPostAlternatives({ params: { locale } }: Props) {
  const isTr = locale === 'tr'
  const base = `https://fund-ed.com/${locale}`
  const crumbs = [
    { name: isTr ? 'Ana Sayfa' : 'Home', url: `https://fund-ed.com/${locale}` },
    { name: 'Blog', url: `${base}/blog` },
    { name: isTr ? 'GoFundMe Alternatifleri' : 'GoFundMe Alternatives', url: `${base}${SLUG}` },
  ]
  const schema = articleSchema({
    title: isTr ? 'Eğitim için GoFundMe Alternatifleri (2026)' : 'Best Alternatives to GoFundMe for Education (2026)',
    description: isTr ? '7 platformun dürüst karşılaştırması.' : 'An honest comparison of 7 platforms.',
    url: `https://fund-ed.com/${locale}${SLUG}`,
    datePublished: DATE,
  })

  return (
    <>
      <JsonLd schema={schema} />
      <JsonLd schema={breadcrumbSchema(crumbs)} />
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow max-w-3xl mx-auto px-4 py-20 w-full prose prose-slate">
          {isTr ? (
            <>
              <h1>Eğitim Fonlaması İçin En İyi GoFundMe Alternatifleri (2026)</h1>
              <p className="lead">GoFundMe, genel kitle fonlaması için iyi bilinse de eğitim odaklı platformlar — özellikle doğrulama ve etki takibi sunanlar — çok daha iyi bir seçenek sunabilir. İşte 7 platformun dürüst karşılaştırması.</p>

              <h2>Platform Karşılaştırma Tablosu</h2>
              <table>
                <thead><tr><th>Platform</th><th>Odak</th><th>Doğrulama</th><th>ESG/Etki</th><th>Kapsam</th></tr></thead>
                <tbody>
                  <tr><td><strong>FundEd</strong></td><td>Eğitim</td><td>✅ Tam doğrulama</td><td>✅ ESG raporları</td><td>Global</td></tr>
                  <tr><td>GoFundMe</td><td>Genel</td><td>❌ Yok</td><td>❌ Yok</td><td>Global</td></tr>
                  <tr><td>DonorsChoose</td><td>Sınıf projeleri</td><td>✅ Öğretmen odaklı</td><td>⚠️ Temel</td><td>Sadece ABD</td></tr>
                  <tr><td>Kiva</td><td>Mikro kredi</td><td>✅ Ortak doğrulama</td><td>⚠️ Geri ödeme odaklı</td><td>Global</td></tr>
                  <tr><td>GlobalGiving</td><td>Kar amacı gütmeyenler</td><td>✅ Kurum bazlı</td><td>✅ İlerleme raporları</td><td>Global</td></tr>
                  <tr><td>JustGiving</td><td>Hayır kurumu/bireysel</td><td>❌ Minimal</td><td>❌ Yok</td><td>Büyük ölçüde İngiltere</td></tr>
                  <tr><td>ScholarshipOwl</td><td>Burslar</td><td>✅ Burs odaklı</td><td>❌ Yok</td><td>ABD ağırlıklı</td></tr>
                </tbody>
              </table>

              <h2>1. FundEd — En İyi ESG Uyumlu Eğitim Fonlama</h2>
              <p>FundEd, eğitim fonlamasına odaklanan, tam öğrenci doğrulaması, canlı etki takibi ve ESG raporlaması sunan bir platformdur. Küresel olarak çalışır ve bireysel ile kurumsal bağışçıları destekler.</p>
              <p><strong>Avantajlar:</strong> Doğrulanmış öğrenciler, ESG uyumlu raporlama, şeffaf fon takibi, global erişim.</p>
              <p><strong>Dezavantajlar:</strong> GoFundMe kadar geniş marka tanınırlığına sahip değil (henüz).</p>

              <h2>2. GoFundMe — Genel Amaçlı, Eğitim Odaklı Değil</h2>
              <p>GoFundMe, genel bağış toplama için en büyük platformdur. Ancak öğrenci doğrulaması yoktur, fonların nasıl kullanıldığının takibi yapılamaz ve ESG raporlaması mevcut değildir. Eğitim bağışçıları için şeffaflık eksikliği önemli bir dezavantajdır.</p>

              <h2>3. DonorsChoose — ABD Sınıfları İçin Harika</h2>
              <p>DonorsChoose, ABD'deki öğretmenlerin sınıf projeleri için kaynak toplamasına olanak tanır. Mükemmel bir doğrulama sürecine sahiptir ancak ABD dışındaki öğrencileri veya genel eğitim ihtiyaçlarını desteklemez.</p>

              <h2>Hangi Platformu Seçmelisiniz?</h2>
              <p>Eğitime özel, doğrulanmış ve etkisi ölçülebilir bir bağış yapmak istiyorsanız: <Link href={`/${locale}/fund-a-student`}>FundEd</Link>'i tercih edin. Sadece ABD'deki sınıf materyalleri için: DonorsChoose ideal. Mikro kredi + eğitim karışımı için: Kiva değerlendirilebilir.</p>

              <h2>Şeffaflık Neden Önemli?</h2>
              <p>GoFundMe gibi genel platformlarda bağışınızın gerçekten eğitime gittiğini doğrulamanın yolu yoktur. <Link href={`/${locale}/transparency`}>Şeffaflık sayfamızda</Link> FundEd'in her bağışı nasıl izlediğini görebilirsiniz.</p>

              <h2>Sonuç</h2>
              <p>Eğitim odaklı, güvenli ve etkisi doğrulanmış bir bağış platformu arıyorsanız, FundEd en iyi seçenektir. <Link href={`/${locale}/how-it-works`}>Nasıl çalıştığını öğrenin</Link> ve bugün bir öğrencinin eğitimine katkıda bulunun.</p>
            </>
          ) : (
            <>
              <h1>Best Alternatives to GoFundMe for Education Funding (2026)</h1>
              <p className="lead">While GoFundMe is well-known for general crowdfunding, education-focused platforms — especially those offering verification and impact tracking — can be far better choices. Here's an honest comparison of 7 platforms.</p>

              <h2>Platform Comparison Table</h2>
              <table>
                <thead><tr><th>Platform</th><th>Focus</th><th>Verification</th><th>ESG/Impact</th><th>Scope</th></tr></thead>
                <tbody>
                  <tr><td><strong>FundEd</strong></td><td>Education</td><td>✅ Full verification</td><td>✅ ESG reports</td><td>Global</td></tr>
                  <tr><td>GoFundMe</td><td>General</td><td>❌ None</td><td>❌ None</td><td>Global</td></tr>
                  <tr><td>DonorsChoose</td><td>Classroom projects</td><td>✅ Teacher-focused</td><td>⚠️ Basic</td><td>US only</td></tr>
                  <tr><td>Kiva</td><td>Microloans</td><td>✅ Partner-verified</td><td>⚠️ Repayment-focused</td><td>Global</td></tr>
                  <tr><td>GlobalGiving</td><td>Nonprofits</td><td>✅ Org-level</td><td>✅ Progress reports</td><td>Global</td></tr>
                  <tr><td>JustGiving</td><td>Charity/personal</td><td>❌ Minimal</td><td>❌ None</td><td>Mostly UK</td></tr>
                  <tr><td>ScholarshipOwl</td><td>Scholarships</td><td>✅ Scholarship-focused</td><td>❌ None</td><td>US-heavy</td></tr>
                </tbody>
              </table>

              <h2>1. FundEd — Best ESG-Aligned Education Platform</h2>
              <p>FundEd is purpose-built for education funding, offering full student verification, live impact tracking, and ESG reporting. It operates globally and supports individual and corporate donors.</p>
              <p><strong>Pros:</strong> Verified students, ESG-compliant reporting, transparent fund tracking, global reach.</p>
              <p><strong>Cons:</strong> Doesn't have GoFundMe's brand recognition (yet).</p>

              <h2>2. GoFundMe — General Purpose, Not Education-Focused</h2>
              <p>GoFundMe is the largest general fundraising platform. However, it has no student verification, no tracking of how funds are used, and no ESG reporting. The lack of transparency is a significant drawback for education donors.</p>

              <h2>3. DonorsChoose — Great for US Classrooms</h2>
              <p>DonorsChoose lets US teachers raise funds for classroom projects. It has an excellent verification process but doesn't support students outside the US or general educational needs.</p>

              <h2>Which Platform Should You Choose?</h2>
              <p>For verified, impact-tracked education donations: choose <Link href={`/${locale}/fund-a-student`}>FundEd</Link>. For US classroom supplies only: DonorsChoose is ideal. For microloans with an education component: Kiva is worth considering.</p>

              <h2>Why Transparency Matters</h2>
              <p>On general platforms like GoFundMe, there's no way to verify your donation actually went to education. See <Link href={`/${locale}/transparency`}>our transparency page</Link> for how FundEd tracks every donation.</p>

              <h2>Conclusion</h2>
              <p>If you want an education-focused, secure, and impact-verified donation platform, FundEd is the best choice. <Link href={`/${locale}/how-it-works`}>See how it works</Link> and start funding a student's education today.</p>
            </>
          )}

          <div className="not-prose mt-10 border-t border-slate-100 pt-8">
            <p className="font-semibold text-slate-700 mb-4">{isTr ? 'İlgili Makaleler' : 'Related Articles'}</p>
            <div className="flex flex-col gap-2">
              <Link href={`/${locale}/blog/scholarship-vs-crowdfunding-vs-sponsorship`} className="text-emerald-600 underline underline-offset-4">
                {isTr ? 'Burs, Kitle Fonlaması, Sponsorluk: Hangisi Daha İyi?' : 'Scholarship vs. Crowdfunding vs. Sponsorship: Which Is Best?'}
              </Link>
              <Link href={`/${locale}/blog/esg-education-impact`} className="text-emerald-600 underline underline-offset-4">
                {isTr ? 'ESG Uyumlu Eğitim Bağışı Nedir?' : 'What Is ESG-Aligned Giving in Education?'}
              </Link>
            </div>
          </div>
          <div className="not-prose mt-8 p-6 bg-emerald-50 rounded-2xl">
            <p className="font-semibold text-slate-900 mb-2">{isTr ? 'Hemen başlayın' : 'Get started now'}</p>
            <Link href={`/${locale}/fund-a-student`} className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors">
              {isTr ? 'Bir öğrenciyi destekle →' : 'Fund a student →'}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add "app/[locale]/blog/alternatives-to-gofundme-for-education/"
git commit -m "feat: add bilingual blog post — alternatives to GoFundMe for education"
```

---

### Task 14: Blog post — Scholarship vs. Crowdfunding vs. Sponsorship

**Files:**
- Create: `app/[locale]/blog/scholarship-vs-crowdfunding-vs-sponsorship/page.tsx`

- [ ] **Step 1: Create the post**

```tsx
// app/[locale]/blog/scholarship-vs-crowdfunding-vs-sponsorship/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { buildAlternates } from '@/lib/seo/metadata'
import { JsonLd } from '@/components/seo/JsonLd'
import { articleSchema, breadcrumbSchema } from '@/lib/seo/schemas'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface Props { params: { locale: string } }

const DATE = '2026-03-15'
const SLUG = '/blog/scholarship-vs-crowdfunding-vs-sponsorship'

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isTr = locale === 'tr'
  return {
    title: isTr
      ? 'Burs, Kitle Fonlaması, Sponsorluk: Fark Ne? | FundEd'
      : 'Scholarship vs. Crowdfunding vs. Sponsorship: What\'s the Difference? | FundEd',
    description: isTr
      ? 'Öğrenci eğitimini desteklemenin üç yolu karşılaştırıldı. Hangisi sizin için doğru?'
      : 'Three ways to fund a student\'s education compared. Which is right for you?',
    alternates: buildAlternates(locale, SLUG),
  }
}

export default function BlogPostScholarship({ params: { locale } }: Props) {
  const isTr = locale === 'tr'
  const base = `https://fund-ed.com/${locale}`
  const crumbs = [
    { name: isTr ? 'Ana Sayfa' : 'Home', url: `https://fund-ed.com/${locale}` },
    { name: 'Blog', url: `${base}/blog` },
    { name: isTr ? 'Burs vs Kitle Fonlaması' : 'Scholarship vs Crowdfunding', url: `${base}${SLUG}` },
  ]
  const schema = articleSchema({
    title: isTr ? 'Burs, Kitle Fonlaması, Sponsorluk: Fark Ne?' : 'Scholarship vs. Crowdfunding vs. Sponsorship',
    description: isTr ? 'Üç modelin karşılaştırması.' : 'Three models compared.',
    url: `https://fund-ed.com/${locale}${SLUG}`,
    datePublished: DATE,
  })

  return (
    <>
      <JsonLd schema={schema} />
      <JsonLd schema={breadcrumbSchema(crumbs)} />
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow max-w-3xl mx-auto px-4 py-20 w-full prose prose-slate">
          {isTr ? (
            <>
              <h1>Burs, Kitle Fonlaması ve Sponsorluk: Bir Öğrencinin Eğitimini Desteklemek İçin En İyi Yol Hangisi?</h1>
              <p className="lead">Bir öğrencinin eğitimini desteklemenin birden fazla yolu vardır. Burs, kitle fonlaması ve sponsorluk — her birinin avantajları ve sınırlılıkları farklıdır.</p>

              <h2>Karşılaştırma Tablosu</h2>
              <table>
                <thead><tr><th>Model</th><th>Kim Başvurabilir</th><th>Süreç</th><th>Etki Takibi</th><th>Esneklik</th></tr></thead>
                <tbody>
                  <tr><td><strong>Kitle Fonlaması (FundEd)</strong></td><td>Herhangi bir öğrenci</td><td>Hızlı başvuru</td><td>✅ Gerçek zamanlı</td><td>✅ Yüksek</td></tr>
                  <tr><td>Burs</td><td>Kriterlere uyanlar</td><td>Uzun başvuru</td><td>❌ Genellikle yok</td><td>❌ Düşük</td></tr>
                  <tr><td>Sponsorluk</td><td>Kurumsal ilişkiler gerektirir</td><td>Müzakere bazlı</td><td>⚠️ Değişken</td><td>⚠️ Orta</td></tr>
                </tbody>
              </table>

              <h2>Burs</h2>
              <p>Burslar, belirli kriterleri karşılayan öğrencilere (akademik başarı, mali durum, demografik) verilen hibe fonlardır. Avantajı, geri ödeme gerektirmemesidir. Dezavantajı ise rekabetçi olması, başvuru sürecinin uzun sürmesi ve çoğu zaman etki takibinin yapılmamasıdır.</p>

              <h2>Kitle Fonlaması</h2>
              <p>FundEd gibi kitle fonlama platformları, öğrencilerin doğrudan bağışçılarla bağlantı kurmasını sağlar. Süreç daha hızlıdır, herhangi bir öğrenci başvurabilir ve bağışçılar fonların nasıl kullanıldığını gerçek zamanlı takip edebilir. <Link href={`/${locale}/fund-a-student`}>Bir öğrenciyi desteklemek</Link> için ideal bir modeldir.</p>

              <h2>Sponsorluk</h2>
              <p>Kurumsal sponsorluk, bir şirketin belirli bir öğrenciyi veya programı doğrudan finanse etmesini içerir. ESG hedefleri için güçlü olabilir ancak bireysel bağışçılar için pratik değildir ve kurumsal ilişkiler gerektirir.</p>

              <h2>Sonuç</h2>
              <p>Hızlı etki, şeffaflık ve esneklik istiyorsanız kitle fonlaması — özellikle <Link href={`/${locale}/fund-a-student`}>FundEd</Link> — en iyi seçenektir. <Link href={`/${locale}/education-funding-calculator`}>Etki hesaplayıcımızla</Link> bağışınızın ne kadar fark yaratabileceğini görün.</p>
            </>
          ) : (
            <>
              <h1>Scholarship vs. Crowdfunding vs. Sponsorship: Which Is Best for Funding a Student's Education?</h1>
              <p className="lead">There are multiple ways to support a student's education. Scholarships, crowdfunding, and sponsorship each have different advantages and limitations.</p>

              <h2>Comparison Table</h2>
              <table>
                <thead><tr><th>Model</th><th>Who Can Apply</th><th>Process</th><th>Impact Tracking</th><th>Flexibility</th></tr></thead>
                <tbody>
                  <tr><td><strong>Crowdfunding (FundEd)</strong></td><td>Any student</td><td>Fast application</td><td>✅ Real-time</td><td>✅ High</td></tr>
                  <tr><td>Scholarship</td><td>Criteria-based</td><td>Long application</td><td>❌ Usually none</td><td>❌ Low</td></tr>
                  <tr><td>Sponsorship</td><td>Requires corporate relationships</td><td>Negotiation-based</td><td>⚠️ Variable</td><td>⚠️ Medium</td></tr>
                </tbody>
              </table>

              <h2>Scholarships</h2>
              <p>Scholarships are grants given to students meeting specific criteria (academic merit, financial need, demographics). The advantage is no repayment required. The disadvantages are high competition, long application processes, and usually no impact tracking.</p>

              <h2>Crowdfunding</h2>
              <p>Crowdfunding platforms like FundEd allow students to connect directly with donors. The process is faster, any student can apply, and donors can track how funds are used in real time. It's the ideal model for <Link href={`/${locale}/fund-a-student`}>funding a student</Link>.</p>

              <h2>Sponsorship</h2>
              <p>Corporate sponsorship involves a company directly funding a specific student or program. It can be powerful for ESG goals but isn't practical for individual donors and requires corporate relationships.</p>

              <h2>Conclusion</h2>
              <p>If you want speed, transparency, and flexibility, crowdfunding — especially <Link href={`/${locale}/fund-a-student`}>FundEd</Link> — is the best choice. Use our <Link href={`/${locale}/education-funding-calculator`}>impact calculator</Link> to see how much difference your donation can make.</p>
            </>
          )}

          <div className="not-prose mt-10 border-t border-slate-100 pt-8">
            <p className="font-semibold text-slate-700 mb-4">{isTr ? 'İlgili Makaleler' : 'Related Articles'}</p>
            <div className="flex flex-col gap-2">
              <Link href={`/${locale}/blog/alternatives-to-gofundme-for-education`} className="text-emerald-600 underline underline-offset-4">
                {isTr ? 'Eğitim için GoFundMe Alternatifleri (2026)' : 'Best Alternatives to GoFundMe for Education (2026)'}
              </Link>
              <Link href={`/${locale}/blog/esg-education-impact`} className="text-emerald-600 underline underline-offset-4">
                {isTr ? 'ESG Uyumlu Eğitim Bağışı Nedir?' : 'What Is ESG-Aligned Giving in Education?'}
              </Link>
            </div>
          </div>
          <div className="not-prose mt-8 p-6 bg-emerald-50 rounded-2xl">
            <Link href={`/${locale}/fund-a-student`} className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors">
              {isTr ? 'Bir öğrenciyi destekle →' : 'Fund a student →'}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add "app/[locale]/blog/scholarship-vs-crowdfunding-vs-sponsorship/"
git commit -m "feat: add bilingual blog post — scholarship vs crowdfunding vs sponsorship"
```

---

## Chunk 4: Calculator + ESG Article + 404 + Internal Links

### Task 15: ESG education impact blog post

**Files:**
- Create: `app/[locale]/blog/esg-education-impact/page.tsx`

- [ ] **Step 1: Create the post**

```tsx
// app/[locale]/blog/esg-education-impact/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { buildAlternates } from '@/lib/seo/metadata'
import { JsonLd } from '@/components/seo/JsonLd'
import { articleSchema, breadcrumbSchema } from '@/lib/seo/schemas'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface Props { params: { locale: string } }

const DATE = '2026-03-15'
const SLUG = '/blog/esg-education-impact'

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isTr = locale === 'tr'
  return {
    title: isTr
      ? 'ESG Uyumlu Eğitim Bağışı Nedir? | FundEd'
      : 'What Is ESG-Aligned Giving in Education? | FundEd',
    description: isTr
      ? 'Eğitim bağışları ESG çerçevelerine nasıl uyar, SDG 4 nedir ve kurumsal bağışçılar neden eğitimi tercih ediyor.'
      : 'How education donations fit into ESG frameworks, what SDG 4 means, and why corporate donors choose education.',
    alternates: buildAlternates(locale, SLUG),
  }
}

export default function BlogPostEsg({ params: { locale } }: Props) {
  const isTr = locale === 'tr'
  const base = `https://fund-ed.com/${locale}`
  const crumbs = [
    { name: isTr ? 'Ana Sayfa' : 'Home', url: `https://fund-ed.com/${locale}` },
    { name: 'Blog', url: `${base}/blog` },
    { name: isTr ? 'ESG Eğitim Etkisi' : 'ESG Education Impact', url: `${base}${SLUG}` },
  ]
  const schema = articleSchema({
    title: isTr ? 'ESG Uyumlu Eğitim Bağışı Nedir?' : 'What Is ESG-Aligned Giving in Education?',
    description: isTr ? 'Eğitim bağışları ve ESG çerçeveleri.' : 'Education donations and ESG frameworks.',
    url: `https://fund-ed.com/${locale}${SLUG}`,
    datePublished: DATE,
  })

  return (
    <>
      <JsonLd schema={schema} />
      <JsonLd schema={breadcrumbSchema(crumbs)} />
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow max-w-3xl mx-auto px-4 py-20 w-full prose prose-slate">
          {isTr ? (
            <>
              <h1>ESG Uyumlu Eğitim Bağışı Nedir?</h1>
              <p className="lead">ESG (Çevre, Sosyal, Yönetişim) yatırımı artık bireysel bağışçılar ve kurumsal bağışçılar için standart bir çerçeve haline geliyor. Eğitim bağışları, özellikle "Sosyal" bileşen açısından güçlü bir ESG yatırımıdır. Bu makalede ESG'nin ne olduğunu, eğitimin neden güçlü bir sosyal yatırım aracı olduğunu ve FundEd'in bu çerçeveyle nasıl hizalandığını inceleyeceğiz.</p>

              <h2>ESG Nedir?</h2>
              <p>ESG, bir yatırımın veya bağışın üç boyutta değerlendirildiği bir çerçevedir: <strong>Çevresel (Environmental)</strong> etki, <strong>Sosyal (Social)</strong> etki ve <strong>Yönetişim (Governance)</strong> kalitesi. Bu çerçeve, kurumsal yatırım dünyasında başladı; ancak artık bireysel bağışçılar, vakıflar ve sivil toplum kuruluşları da ESG ilkelerini benimsemektedir.</p>
              <p>Dünya genelinde ESG uyumlu yatırım pazarının 2035 yılına kadar 191 trilyon dolara ulaşması beklenmektedir. Bu büyüme, "iyi hissetmek" için değil, somut ve ölçülebilir etkiyi tercih eden bilinçli bağışçı ve yatırımcıların talebini yansıtmaktadır.</p>

              <h2>Eğitim Neden Güçlü Bir ESG Yatırımıdır?</h2>
              <p>Eğitim, BM'nin Sürdürülebilir Kalkınma Hedefleri'nden (SDG) 4. hedefe — "Kaliteli Eğitim" — doğrudan katkıda bulunur. Bunun yanı sıra eğitim yatırımının çok boyutlu etkileri vardır:</p>
              <ul>
                <li><strong>SDG 1 — Yoksulluğun Sona Erdirilmesi:</strong> Eğitimli bireyler daha yüksek gelir elde etme kapasitesine sahip olur.</li>
                <li><strong>SDG 5 — Cinsiyet Eşitliği:</strong> Kız çocuklarının eğitime erişimi toplumsal cinsiyet uçurumunu kapatır.</li>
                <li><strong>SDG 8 — İnsana Yakışır İş ve Ekonomik Büyüme:</strong> Nitelikli iş gücü oluşturarak yerel ekonomileri güçlendirir.</li>
                <li><strong>SDG 10 — Eşitsizliklerin Azaltılması:</strong> Dezavantajlı öğrencilere erişim sağlamak, yapısal eşitsizlikleri giderir.</li>
              </ul>
              <p>Bu çok boyutlu etki, eğitim bağışlarını ESG portföyünde diğer sosyal yatırımlardan ayıran kritik özelliğidir.</p>

              <h2>ESG Raporlamasında Eğitim Metrikler</h2>
              <p>Kurumsal bağışçılar için en önemli soru şudur: "Bu yatırımın etkisini nasıl belgeliyoruz?" FundEd, her bağış için ölçülebilir çıktılar sağlar:</p>
              <ul>
                <li>Desteklenen öğrenci sayısı ve profilleri</li>
                <li>Tamamlanan eğitim süresi (gün/hafta/dönem)</li>
                <li>Karşılanan spesifik ihtiyaçlar (kitap, yemek, okul malzemeleri)</li>
                <li>SDG 4 hizalaması ve ilerleme raporu</li>
                <li>Doğrulanmış öğrenci sonuçları (sınıf geçme, devam oranı)</li>
              </ul>

              <h2>FundEd ESG Raporlamasını Nasıl Sağlar?</h2>
              <p>FundEd Kurumsal, şirketlerin her bağış için otomatik ESG raporları almasını sağlar. Raporlar SDG hizalamasını, etki metriklerini ve doğrulanmış öğrenci sonuçlarını içerir. <Link href={`/${locale}/transparency`}>Şeffaflık sayfamızda</Link> metodolojimizi ve doğrulama sürecimizi ayrıntılı olarak inceleyebilirsiniz.</p>
              <p>Bireysel bağışçılar da kişisel dashboard üzerinden her bağışlarının izini takip edebilir. Bu şeffaflık, FundEd'i genel kitle fonlama platformlarından temelden ayırmaktadır.</p>

              <h2>Bireysel Bağışçılar Nasıl ESG Uyumlu Bağış Yapabilir?</h2>
              <p>FundEd üzerinde <Link href={`/${locale}/fund-a-student`}>doğrulanmış bir öğrenciyi destekleyerek</Link> ESG "S" (Sosyal) bileşenine doğrudan katkıda bulunursunuz. Süreç şu şekilde işler:</p>
              <ol>
                <li>Doğrulanmış öğrenci profillerinden size uygun olanı seçin</li>
                <li>Güvenli ödeme ile bağışınızı tamamlayın</li>
                <li>Dashboard üzerinden öğrencinin ilerlemesini ve etki raporlarını takip edin</li>
                <li>Yıllık ESG özet raporunuzu indirin (Kurumsal üyelerde otomatik)</li>
              </ol>
              <p>Her bağış takip edilir ve raporlanır. <Link href={`/${locale}/education-funding-calculator`}>Etki hesaplayıcımızla</Link> bağışınızın somut etkisini önceden görün — $25 bağış 3 ders kitabına, $100 bağış ise 20 tam eğitim gününe karşılık gelmektedir. <Link href={`/${locale}/how-it-works`}>Nasıl çalıştığını</Link> öğrenerek bugün başlayın.</p>
            </>
          ) : (
            <>
              <h1>What Is ESG-Aligned Giving in Education?</h1>
              <p className="lead">ESG (Environmental, Social, Governance) investing is becoming standard for individual and corporate donors. Education donations, particularly for the "Social" component, represent a powerful ESG investment. In this article we examine what ESG is, why education is a strong social investment vehicle, and how FundEd aligns with this framework.</p>

              <h2>What Is ESG?</h2>
              <p>ESG is a framework for evaluating an investment or donation across three dimensions: <strong>Environmental</strong> impact, <strong>Social</strong> impact, and <strong>Governance</strong> quality. The framework originated in institutional investing but is now embraced by individual donors, foundations, and nonprofits as well.</p>
              <p>The global ESG-aligned investment market is expected to reach $191 trillion by 2035. This growth reflects the demand from conscious donors and investors who prefer concrete, measurable impact over vague "doing good" narratives.</p>

              <h2>Why Education Is a Strong ESG Investment</h2>
              <p>Education directly contributes to UN Sustainable Development Goal 4 — "Quality Education." Beyond SDG 4, education investments have multi-dimensional impact:</p>
              <ul>
                <li><strong>SDG 1 — No Poverty:</strong> Educated individuals have higher lifetime earning potential.</li>
                <li><strong>SDG 5 — Gender Equality:</strong> Girls' access to education closes gender gaps systematically.</li>
                <li><strong>SDG 8 — Decent Work and Economic Growth:</strong> A skilled workforce strengthens local economies.</li>
                <li><strong>SDG 10 — Reduced Inequalities:</strong> Funding disadvantaged students directly addresses structural inequality.</li>
              </ul>
              <p>This multi-dimensional impact is what distinguishes education donations from other social investments in an ESG portfolio.</p>

              <h2>ESG Metrics in Education Reporting</h2>
              <p>For corporate donors, the critical question is: "How do we document this investment's impact?" FundEd provides measurable outputs for every donation:</p>
              <ul>
                <li>Number of students supported and their verified profiles</li>
                <li>Education duration completed (days/weeks/semesters)</li>
                <li>Specific needs met (textbooks, meals, school supplies)</li>
                <li>SDG 4 alignment and progress reporting</li>
                <li>Verified student outcomes (grade completion, attendance rate)</li>
              </ul>

              <h2>How FundEd Provides ESG Reporting</h2>
              <p>FundEd Corporate allows companies to receive automatic ESG reports for every donation. Reports include SDG alignment, impact metrics, and verified student outcomes. See <Link href={`/${locale}/transparency`}>our transparency page</Link> for our methodology and verification process in detail.</p>
              <p>Individual donors can also track every donation's audit trail from their personal dashboard. This transparency is what fundamentally distinguishes FundEd from general crowdfunding platforms.</p>

              <h2>How Individual Donors Can Give in an ESG-Aligned Way</h2>
              <p>By <Link href={`/${locale}/fund-a-student`}>supporting a verified student on FundEd</Link>, you directly contribute to the ESG "S" (Social) component. Here's how the process works:</p>
              <ol>
                <li>Browse verified student profiles and choose one that resonates with you</li>
                <li>Complete your donation through secure payment</li>
                <li>Track the student's progress and impact reports from your dashboard</li>
                <li>Download your annual ESG summary report (automatic for Corporate members)</li>
              </ol>
              <p>Every donation is tracked and reported. Use our <Link href={`/${locale}/education-funding-calculator`}>impact calculator</Link> to see the concrete impact of your donation before you give — a $25 donation provides 3 textbooks, and a $100 donation covers 20 full days of education. <Link href={`/${locale}/how-it-works`}>Learn how it works</Link> and start today.</p>
            </>
          )}

          <div className="not-prose mt-10 border-t border-slate-100 pt-8">
            <p className="font-semibold text-slate-700 mb-4">{isTr ? 'İlgili Makaleler' : 'Related Articles'}</p>
            <div className="flex flex-col gap-2">
              <Link href={`/${locale}/blog/alternatives-to-gofundme-for-education`} className="text-emerald-600 underline underline-offset-4">
                {isTr ? 'Eğitim için GoFundMe Alternatifleri (2026)' : 'Best Alternatives to GoFundMe for Education (2026)'}
              </Link>
              <Link href={`/${locale}/blog/scholarship-vs-crowdfunding-vs-sponsorship`} className="text-emerald-600 underline underline-offset-4">
                {isTr ? 'Burs, Kitle Fonlaması, Sponsorluk: Hangisi Daha İyi?' : 'Scholarship vs. Crowdfunding vs. Sponsorship: Which Is Best?'}
              </Link>
            </div>
          </div>
          <div className="not-prose mt-8 p-6 bg-emerald-50 rounded-2xl">
            <Link href={`/${locale}/fund-a-student`} className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors">
              {isTr ? 'ESG uyumlu bağış yap →' : 'Make an ESG-aligned donation →'}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add "app/[locale]/blog/esg-education-impact/"
git commit -m "feat: add bilingual ESG education impact blog post"
```

---

### Task 16: Education Funding Calculator

**Files:**
- Create: `app/[locale]/education-funding-calculator/CalculatorClient.tsx`
- Create: `app/[locale]/education-funding-calculator/page.tsx`

- [ ] **Step 1: Create CalculatorClient.tsx**

```tsx
// app/[locale]/education-funding-calculator/CalculatorClient.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'

const IMPACT_TIERS = [
  { amount: 25,  books: 3,  meals: 10,  days: 5,   label: '$25' },
  { amount: 50,  books: 6,  meals: 20,  days: 10,  label: '$50' },
  { amount: 100, books: 12, meals: 40,  days: 20,  label: '$100' },
  { amount: 500, books: 60, meals: 200, days: 100, label: '$500' },
]

interface Props {
  locale: string
}

export default function CalculatorClient({ locale }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const isTr = locale === 'tr'
  const tier = IMPACT_TIERS.find((t) => t.amount === selected)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {IMPACT_TIERS.map((t) => (
          <button
            key={t.amount}
            onClick={() => setSelected(t.amount)}
            className={`rounded-2xl border-2 p-6 text-center font-bold text-2xl transition-all ${
              selected === t.amount
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700 scale-105 shadow-lg'
                : 'border-slate-200 text-slate-700 hover:border-emerald-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tier && (
        <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-100 text-center space-y-4 animate-in fade-in duration-300">
          <p className="text-lg font-semibold text-slate-700">
            {isTr ? `${tier.label} bağışınızla:` : `With a ${tier.label} donation:`}
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-3xl font-bold text-emerald-700">{tier.books}</p>
              <p className="text-sm text-slate-500">{isTr ? 'ders kitabı' : 'textbooks'}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-3xl font-bold text-emerald-700">{tier.meals}</p>
              <p className="text-sm text-slate-500">{isTr ? 'okul öğünü' : 'school meals'}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-3xl font-bold text-emerald-700">{tier.days}</p>
              <p className="text-sm text-slate-500">{isTr ? 'eğitim günü' : 'days of education'}</p>
            </div>
          </div>
          <Link
            href={`/${locale}/fund-a-student`}
            className="inline-block mt-4 bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            {isTr ? 'Şimdi Bir Öğrenciyi Destekle →' : 'Fund a Student Now →'}
          </Link>
        </div>
      )}

      {!tier && (
        <div className="text-center text-slate-400 py-8">
          {isTr ? 'Bağış tutarını seçin' : 'Select a donation amount above'}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create server page**

```tsx
// app/[locale]/education-funding-calculator/page.tsx
import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/seo/metadata'
import { JsonLd } from '@/components/seo/JsonLd'
import { howToSchema, breadcrumbSchema } from '@/lib/seo/schemas'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CalculatorClient from './CalculatorClient'

interface Props { params: { locale: string } }

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isTr = locale === 'tr'
  return {
    title: isTr
      ? 'Eğitim Fonlama Etki Hesaplayıcı | FundEd'
      : 'Education Funding Impact Calculator | FundEd',
    description: isTr
      ? '$25, $50, $100 veya $500 bağışınızın bir öğrencinin eğitimine katkısını hesaplayın.'
      : 'Calculate what your $25, $50, $100 or $500 donation achieves for a student\'s education.',
    alternates: buildAlternates(locale, '/education-funding-calculator'),
  }
}

export default function CalculatorPage({ params: { locale } }: Props) {
  const isTr = locale === 'tr'
  const crumbs = isTr
    ? [{ name: 'Ana Sayfa', url: 'https://fund-ed.com/tr' }, { name: 'Etki Hesaplayıcı', url: 'https://fund-ed.com/tr/education-funding-calculator' }]
    : [{ name: 'Home', url: 'https://fund-ed.com/en' }, { name: 'Impact Calculator', url: 'https://fund-ed.com/en/education-funding-calculator' }]

  const schema = howToSchema({
    name: isTr ? 'Eğitim Bağışı Etkisini Hesapla' : 'Calculate Your Education Donation Impact',
    description: isTr
      ? 'Farklı bağış tutarlarının bir öğrencinin eğitimine katkısını görün.'
      : 'See what different donation amounts achieve for a student\'s education.',
    steps: isTr ? [
      { name: '$25 Bağış', text: '3 ders kitabı, 10 okul öğünü veya 5 eğitim günü sağlar.' },
      { name: '$50 Bağış', text: '6 ders kitabı, 20 okul öğünü veya 10 eğitim günü sağlar.' },
      { name: '$100 Bağış', text: '12 ders kitabı, 40 okul öğünü veya 20 eğitim günü sağlar.' },
      { name: '$500 Bağış', text: '60 ders kitabı, 200 okul öğünü veya 100 eğitim günü sağlar.' },
    ] : [
      { name: 'Donate $25', text: 'Provides 3 textbooks, 10 school meals, or 5 days of education.' },
      { name: 'Donate $50', text: 'Provides 6 textbooks, 20 school meals, or 10 days of education.' },
      { name: 'Donate $100', text: 'Provides 12 textbooks, 40 school meals, or 20 days of education.' },
      { name: 'Donate $500', text: 'Provides 60 textbooks, 200 school meals, or 100 days of education.' },
    ],
  })

  return (
    <>
      <JsonLd schema={schema} />
      <JsonLd schema={breadcrumbSchema(crumbs)} />
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow py-20 px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              {isTr ? 'Eğitim Fonlama Etki Hesaplayıcı' : 'Education Funding Impact Calculator'}
            </h1>
            <p className="text-lg text-slate-500">
              {isTr
                ? 'Bağış tutarını seçin ve bir öğrencinin eğitimine katkınızı görün.'
                : 'Select a donation amount to see what it achieves for a student\'s education.'}
            </p>
          </div>
          <CalculatorClient locale={locale} />
        </main>
        <Footer />
      </div>
    </>
  )
}
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add "app/[locale]/education-funding-calculator/"
git commit -m "feat: add bilingual education funding impact calculator with HowTo schema"
```

---

### Task 17: 404 enhancement

**Files:**
- Modify: `app/not-found.tsx`

Current file is a bare `'use client'` page with inline styles and no navigation. Replace the content inside `<body>` with a helpful 404.

- [ ] **Step 1: Replace the file content**

```tsx
// app/not-found.tsx
'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#f8fafc' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '6rem', fontWeight: 900, color: '#e2e8f0', lineHeight: 1 }}>404</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: '1rem 0 0.5rem' }}>Page not found</h1>
          <p style={{ color: '#64748b', marginBottom: '2rem', maxWidth: '400px' }}>
            The page you were looking for doesn&apos;t exist. Help a student while you&apos;re here.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', marginBottom: '2rem' }}>
            <Link href="/en/fund-a-student" style={{ background: '#059669', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', textDecoration: 'none', fontWeight: 600 }}>
              Fund a Student →
            </Link>
            <Link href="/en/browse" style={{ background: '#fff', color: '#1e293b', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', textDecoration: 'none', fontWeight: 600, border: '1px solid #e2e8f0' }}>
              Browse Campaigns
            </Link>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/en/how-it-works" style={{ color: '#059669', textDecoration: 'underline' }}>How It Works</Link>
            <Link href="/en/transparency" style={{ color: '#059669', textDecoration: 'underline' }}>Transparency</Link>
            <Link href="/en" style={{ color: '#059669', textDecoration: 'underline' }}>Home</Link>
          </div>
        </div>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add app/not-found.tsx
git commit -m "feat(seo): enhance 404 page with Fund a Student CTA and navigation links"
```

---

### Task 18: Final build verification

- [ ] **Step 1: Run full TypeScript check**

```bash
npx tsc --noEmit 2>&1
```
Expected: 0 errors

- [ ] **Step 2: Run Next.js build**

```bash
npm run build 2>&1 | tail -40
```
Expected: Build completes successfully, all routes listed

- [ ] **Step 3: Verify sitemap includes new routes**

```bash
# Start dev server and check sitemap
npm run dev &
sleep 5
curl http://localhost:3000/sitemap.xml 2>/dev/null | grep -E "fund-a-student|blog|calculator" | head -20
```
Expected: New routes appear in sitemap output

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: verify SEO implementation complete — all 3 layers done"
```
