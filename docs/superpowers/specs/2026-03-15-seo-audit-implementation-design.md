# SEO Audit Implementation Design

**Date:** 2026-03-15
**Source:** SEO Audit Report — Global Education Funding Platform (ESG-Aligned), March 14 2026
**Approach:** Layered rollout (Layer 1 → Layer 2 → Layer 3)
**Project:** FundEd — Next.js 14 App Router, next-intl (tr/en), MongoDB, Tailwind CSS

---

## Context

The audit identified 25 keyword opportunities, 12 content gaps, and 8 quick wins. The platform already has: `app/sitemap.ts`, `app/robots.ts`, GA4, HTTPS, mobile-responsive Tailwind layout, hreflang routing via next-intl middleware. Missing: JSON-LD schema, canonical tags, optimized metadata for key pages, Core Web Vitals attributes, content pages, calculator tool.

**Out of scope for this spec:** 8 of the 12 content gaps from the audit (regional landing pages, donor guides, Annual Education Funding Report, Corporate ESG Partnerships page, student impact story template system). These are deferred to a future content sprint.

---

## Layer 1 — Technical SEO

### 1.1 JSON-LD Schema Components

**New file:** `components/seo/JsonLd.tsx`
A lightweight server component wrapper that renders `<script type="application/ld+json">` tags.

**Schema builders (all in `lib/seo/schemas.ts`):**

| Schema Type | Used On |
|---|---|
| `Organization` | `app/layout.tsx` (true root — outermost `<html>` shell) |
| `WebSite` + `SearchAction` | `app/layout.tsx` (true root) |
| `BreadcrumbList` | All new and modified pages in this spec (via `generateBreadcrumbs(locale, path)` helper) |
| `Person` + `EducationalOrganization` | `app/[locale]/campaign/[id]/page.tsx` |
| `FAQPage` | `how-it-works`, `transparency`, `fund-a-student` |
| `Article` | Blog post pages |
| `HowTo` | `education-funding-calculator` (4 tiers as steps — produces rich result) |

**Note on layout structure in this project:**
This project uses a non-standard but valid App Router layout split: `app/layout.tsx` is an empty passthrough (`return children` only, no `<html>` or `<body>`). The `<html lang={locale}>` and `<body>` are in `app/[locale]/layout.tsx`, which is the de facto HTML root. Therefore, `Organization` and `WebSite` schemas must be placed in `app/[locale]/layout.tsx` — not `app/layout.tsx` — so that the `<script>` tag lands inside `<body>`.

`app/[locale]/layout.tsx` already has `export const metadata` with `metadataBase: new URL('https://fund-ed.com')` plus sitewide OG, twitter, robots, keywords, and authors defaults. The broken `alternates: { canonical: '/' }` must be removed from this block. All other metadata fields in this export should be preserved. The `Organization` and `WebSite` schema `<JsonLd>` components are added to the JSX return of the locale layout (inside `<body>`, before `{children}`).

Implementation: Each schema builder is a pure function returning a typed object. `JsonLd` component takes the object and serializes it. Pages import and compose schemas as needed.

**`generateBreadcrumbs` helper:** Defined in `lib/seo/schemas.ts`. Accepts `(locale: string, crumbs: {name: string, url: string}[])` and returns a valid `BreadcrumbList` schema object. Used in all new and modified pages (not auto-generated globally — scope is limited to pages touched by this spec).

### 1.2 Canonical + Hreflang Tags

**Root layout canonical fix:**
`app/[locale]/layout.tsx` currently has a broken fallback `alternates: { canonical: '/' }` that causes every locale route (`/tr/`, `/en/`) to claim `https://fund-ed.com/` as its canonical. This fallback must be removed from the locale layout. All canonical/alternates are set at the individual page level.

All pages touched by this spec add `alternates` to their `generateMetadata` export via a shared `buildAlternates(locale, path)` helper in `lib/seo/metadata.ts`:

```ts
// lib/seo/metadata.ts
export function buildAlternates(locale: string, path: string) {
  const base = 'https://fund-ed.com'
  return {
    canonical: `${base}/${locale}${path}`,
    languages: {
      'tr': `${base}/tr${path}`,
      'en': `${base}/en${path}`,
      'x-default': `${base}/en${path}`, // English = global default for non-Turkish markets
    }
  }
}
```

`x-default` points to the English locale — the globally-appropriate fallback for non-Turkish markets. Turkish is the default for the app router but English is the correct signal for international crawlers.

### 1.3 Metadata Overhaul — 5 Core Pages

| Page | File | Title (≤60 chars) | Meta Description (≤160 chars) |
|---|---|---|---|
| Homepage | `app/[locale]/page.tsx` | `Fund a Student's Education \| FundEd` | `Sponsor verified students globally on the first ESG-aligned education funding platform. Track real impact.` |
| How It Works | `app/[locale]/how-it-works/page.tsx` | `How Education Funding Works \| FundEd` | `See how FundEd connects donors with verified students. Transparent funding, verified outcomes, real impact.` |
| Fund a Student | `app/[locale]/fund-a-student/page.tsx` | `Fund a Student — Transparent Impact \| FundEd` | `Choose a verified student to fund. Every donation is tracked and impact-reported. Start with $25.` |
| Transparency | `app/[locale]/transparency/page.tsx` | `Verified & Transparent Education Funding \| FundEd` | `See exactly where every donation goes. FundEd publishes live fund tracking and verified student outcomes.` |
| About/Trust | `app/[locale]/who-we-are/page.tsx` | `About FundEd — ESG Education Platform \| FundEd` | `FundEd is the first ESG-aligned education crowdfunding platform with verified student outcomes.` |

Each page's `generateMetadata` is updated with the above values, locale-aware (TR variant uses Turkish copy).

**`'use client'` constraint — `how-it-works` and `transparency`:**
Both `app/[locale]/how-it-works/page.tsx` and `app/[locale]/transparency/page.tsx` are currently marked `'use client'`. In Next.js 14 App Router, `generateMetadata` is a server-only export and is incompatible with `'use client'` pages. The solution follows the same pattern already used in `app/[locale]/browse/`:
1. Rename existing client component to `HowItWorksClient.tsx` / `TransparencyClient.tsx`
2. Create a new server page file (`page.tsx`) that exports `generateMetadata` and renders `<HowItWorksClient />` / `<TransparencyClient />`

### 1.4 Core Web Vitals

- Add `priority` prop to above-the-fold `<Image>` components on Homepage and `/fund-a-student`
- Add explicit `width` and `height` to all `<Image>` components missing them on modified pages (prevents CLS)
- `app/[locale]/campaign/[id]/page.tsx`: Impact dashboard stats must render as HTML text nodes — verify they are not canvas/SVG-only; add SSR fallback text if needed
- Add `loading="lazy"` to below-fold images explicitly on modified pages

### 1.5 `app/robots.ts` + `app/sitemap.ts` Improvements

**Note:** Both files live at `app/robots.ts` and `app/sitemap.ts` (the Next.js App Router root), not under `app/[locale]/`.

**`app/robots.ts`:** The project serves corporate routes under locale-prefixed paths (e.g., `/en/corporate/`, `/tr/corporate/`). Add both `/en/corporate/` and `/tr/corporate/` to the disallow list — a bare `/corporate/` disallow would not match these paths since next-intl middleware serves all routes under locale prefixes.

**`app/sitemap.ts`:** Add new high-priority static routes. Entries do not include locale prefixes (consistent with how the existing file generates entries like `https://fund-ed.com/browse`). Both tr and en locales are served at the same path via next-intl middleware.

New entries to add (with `lastModified: new Date()` for consistency with existing file):
```ts
{ url: `${base}/fund-a-student`, lastModified: new Date(), priority: 0.9, changeFrequency: 'weekly' },
{ url: `${base}/transparency`, lastModified: new Date(), priority: 0.8, changeFrequency: 'weekly' },
{ url: `${base}/how-it-works`, lastModified: new Date(), priority: 0.8, changeFrequency: 'monthly' },
{ url: `${base}/who-we-are`, lastModified: new Date(), priority: 0.7, changeFrequency: 'monthly' },
{ url: `${base}/blog`, lastModified: new Date(), priority: 0.7, changeFrequency: 'weekly' },
{ url: `${base}/education-funding-calculator`, lastModified: new Date(), priority: 0.7, changeFrequency: 'monthly' },
{ url: `${base}/blog/alternatives-to-gofundme-for-education`, lastModified: new Date(), priority: 0.7, changeFrequency: 'monthly' },
{ url: `${base}/blog/scholarship-vs-crowdfunding-vs-sponsorship`, lastModified: new Date(), priority: 0.7, changeFrequency: 'monthly' },
{ url: `${base}/blog/esg-education-impact`, lastModified: new Date(), priority: 0.7, changeFrequency: 'monthly' },
```

---

## Layer 2 — Content Pages

### 2.1 `/fund-a-student` — New Landing Page

**File:** `app/[locale]/fund-a-student/page.tsx`
**Target keyword:** `fund a student`, `sponsor a student education` (High opportunity, Transactional)

**Structure:**
- Server component (no `'use client'`) to allow `generateMetadata`
- Single `<h1>`: "Fund a Student's Education with Verified Impact Tracking"
- Hero sub-copy with `education funding platform` and `impact tracking` in first 100 words
- Impact stats bar (students funded, donors, countries) — rendered as HTML text for crawlability
- Student profile grid (reuses existing campaign card components, fetches published campaigns server-side)
- How-it-works mini-section (3 steps with icons)
- Trust badges / verification callout
- FAQ section (5 Qs) → FAQPage schema
- CTA footer
- BreadcrumbList schema: Home → Fund a Student

**Metadata:** Title + description from table above. Canonical + alternates via `buildAlternates`. OG image: `/og-image.png` (existing).

### 2.2 `/how-it-works` — Upgrade

**Files:**
- Rename `app/[locale]/how-it-works/page.tsx` → `app/[locale]/how-it-works/HowItWorksClient.tsx`
- Create new `app/[locale]/how-it-works/page.tsx` (server wrapper)

Changes to server page:
- Export `generateMetadata` with optimized title/description + `buildAlternates`
- Render `<HowItWorksClient />`
- Add `JsonLd` with `FAQPage` schema (5 questions about the process)
- Add `JsonLd` with `BreadcrumbList` schema: Home → How It Works

Changes to client component:
- Ensure H1 is "How Education Funding Works" (check existing H1 text)
- Ensure H2 structure targets `how to fund a student's education`
- Add internal links: → `/fund-a-student`, → `/transparency`, → `/browse`

### 2.3 `/transparency` — Enhancement

**Files:**
- Rename `app/[locale]/transparency/page.tsx` → `app/[locale]/transparency/TransparencyClient.tsx`
- Create new `app/[locale]/transparency/page.tsx` (server wrapper)

Changes to server page:
- Export `generateMetadata` targeting `transparent education donation`, `verified student funding` + `buildAlternates`
- Add `JsonLd` with `FAQPage` schema (5 questions about trust/verification)
- Add `JsonLd` with `BreadcrumbList` schema: Home → Transparency

Changes to client component:
- Add a "How Verification Works" section (3-step process: application → review → funding)
- Add internal links: → `/fund-a-student`, → `/how-it-works`

### 2.4 `/who-we-are` — Metadata Update

**File:** `app/[locale]/who-we-are/page.tsx` (edit existing)

`app/[locale]/who-we-are/page.tsx` is confirmed `'use client'`. Apply the server-wrapper split pattern (same as how-it-works and transparency):
1. Rename existing file to `WhoWeAreClient.tsx`
2. Create new server `page.tsx` that exports `generateMetadata` + `JsonLd` schemas + renders `<WhoWeAreClient />`

Changes to server page:
- Export `generateMetadata` with optimized title/description from table + `buildAlternates`
- Add `JsonLd` with `BreadcrumbList` schema: Home → About

### 2.5 Blog Infrastructure + 2 Posts

**New files:**
- `app/[locale]/blog/page.tsx` — Blog index listing all posts with title, keyword, date
- `app/[locale]/blog/alternatives-to-gofundme-for-education/page.tsx`
- `app/[locale]/blog/scholarship-vs-crowdfunding-vs-sponsorship/page.tsx`

**Locale strategy:** Blog posts are authored in English only. The `hreflang` alternates for the `/tr` locale will point canonical to the `/en` version (via `buildAlternates` with the same path). This avoids thin/duplicate content on the Turkish index for content not yet translated.

**Blog index:** Static list of posts (no CMS). Each post entry: title, slug, description, keyword, date.

**Post: Alternatives to GoFundMe for Education**
~1,500 words. Comparison table of 5-7 platforms (GoFundMe, DonorsChoose, Kiva, JustGiving, FundEd). Target featured snippet via comparison table. Article schema. BreadcrumbList: Home → Blog → Alternatives to GoFundMe. Metadata targets `alternatives to GoFundMe for education`. Internal links to `/fund-a-student`, `/how-it-works`, `/transparency`.

**Post: Scholarship vs. Crowdfunding vs. Sponsorship**
~1,200 words. Comparison table of 3 models. Target featured snippet. Article schema. BreadcrumbList: Home → Blog → Scholarship vs Crowdfunding. Metadata targets `scholarship funding platform`. Internal links to `/fund-a-student`, `/education-funding-calculator`.

### 2.6 `app/[locale]/campaign/[id]/page.tsx` — Schema + Alternates

**File:** `app/[locale]/campaign/[id]/page.tsx` (already has `generateMetadata` — extend only)

This is the highest-value dynamic page for long-tail search. Changes:
- Add `buildAlternates(locale, '/campaign/' + id)` to `generateMetadata`
- Add `Person` schema (student name, image, description from campaign data)
- Add `EducationalOrganization` schema (FundEd as the org)
- Add `BreadcrumbList`: Home → Browse → [Campaign Title]
- No structural changes to the UI — server component already, schema only

---

## Layer 3 — Calculator + ESG Hub + Internal Linking

### 3.1 Education Funding Impact Calculator

**File:** `app/[locale]/education-funding-calculator/page.tsx`
**Target keyword:** `education funding calculator` (Medium opportunity)

**Server page** exports `generateMetadata` + `JsonLd` (HowTo schema). Renders `<CalculatorClient />`.

**`CalculatorClient.tsx`:** Client component with static config:

```ts
const IMPACT_TIERS = {
  25:  { books: 3,  meals: 10,  days: 5,   label: '$25' },
  50:  { books: 6,  meals: 20,  days: 10,  label: '$50' },
  100: { books: 12, meals: 40,  days: 20,  label: '$100' },
  500: { books: 60, meals: 200, days: 100, label: '$500' },
}
```

UI: 4 clickable tier cards. On selection, animated counter reveals impact breakdown. "Fund a Student Now" CTA links to `/fund-a-student`. No API calls — fully static/SSG.

**Schema:** `HowTo` — 4 steps (one per tier), each describing what the donation achieves. This is eligible for Google's HowTo rich result and is more appropriate than `WebApplication` for a static informational tool.

### 3.2 ESG Content Hub — First Article

**File:** `app/[locale]/blog/esg-education-impact/page.tsx`
**Target keyword:** `ESG education impact` (High opportunity, Informational/Commercial)

~1,500 words. Covers: what ESG-aligned giving means, why education is an ESG investment, how FundEd tracks impact, SDG alignment. Article schema. BreadcrumbList: Home → Blog → ESG Education Impact. Internal links to `/fund-a-student`, `/transparency`, `/education-funding-calculator`. English only (same locale strategy as other blog posts).

### 3.3 Internal Linking Pass

A targeted pass through these files adding 3–5 cross-links each, following hub-and-spoke:

- `app/[locale]/page.tsx` (Homepage) → `/fund-a-student`, `/how-it-works`, `/transparency`, `/blog`
- `app/[locale]/fund-a-student/page.tsx` → `/transparency`, `/how-it-works`, `/education-funding-calculator`
- `app/[locale]/transparency/TransparencyClient.tsx` → `/fund-a-student`, `/how-it-works`
- `app/[locale]/how-it-works/HowItWorksClient.tsx` → `/fund-a-student`, `/transparency`, `/browse`
- Blog posts → each other + `/fund-a-student`

### 3.4 Custom 404 Enhancement

**File:** `app/not-found.tsx` (confirmed to exist at root level; renders its own `<html><body>` wrapper as required by Next.js App Router for root-level not-found pages)

The file is already `'use client'` and wraps itself in `<html><body>`. No server-wrapper split is needed — `next/link` `<Link>` components work fine in client components. The change is purely additive (new JSX elements inside the existing `<body>`):

Add:
- Link to `/browse` (Browse Campaigns)
- Quick links: Fund a Student, How It Works, Transparency
- Donation CTA: "Help a student while you're here →" linking to `/fund-a-student`
- Keep existing design language (Tailwind classes matching site theme)

---

## File Change Summary

### New Files

| File | Purpose |
|---|---|
| `components/seo/JsonLd.tsx` | JSON-LD script renderer (server component) |
| `lib/seo/schemas.ts` | Schema builder functions + `generateBreadcrumbs` helper |
| `lib/seo/metadata.ts` | `buildAlternates(locale, path)` helper |
| `app/[locale]/fund-a-student/page.tsx` | Fund a Student landing page (server) |
| `app/[locale]/how-it-works/HowItWorksClient.tsx` | Renamed from current page.tsx |
| `app/[locale]/transparency/TransparencyClient.tsx` | Renamed from current page.tsx |
| `app/[locale]/blog/page.tsx` | Blog index |
| `app/[locale]/blog/alternatives-to-gofundme-for-education/page.tsx` | Comparison blog post |
| `app/[locale]/blog/scholarship-vs-crowdfunding-vs-sponsorship/page.tsx` | Comparison blog post |
| `app/[locale]/blog/esg-education-impact/page.tsx` | ESG hub article |
| `app/[locale]/education-funding-calculator/page.tsx` | Calculator server wrapper |
| `app/[locale]/education-funding-calculator/CalculatorClient.tsx` | Calculator client component |
| `app/[locale]/who-we-are/WhoWeAreClient.tsx` | Renamed from current who-we-are page.tsx |

### Modified Files

| File | Changes |
|---|---|
| `app/[locale]/layout.tsx` | Add Organization + WebSite schemas; remove broken `alternates: { canonical: '/' }` fallback; preserve all other metadata fields |
| `app/[locale]/page.tsx` | Optimized metadata + `buildAlternates`, internal links, priority image, H1 check |
| `app/[locale]/how-it-works/page.tsx` | Replace with server wrapper exporting `generateMetadata` + schemas |
| `app/[locale]/transparency/page.tsx` | Replace with server wrapper exporting `generateMetadata` + schemas |
| `app/[locale]/who-we-are/page.tsx` | Replace with server wrapper; rename old file to WhoWeAreClient.tsx; add `generateMetadata` + `buildAlternates` + BreadcrumbList |
| `app/[locale]/campaign/[id]/page.tsx` | Add `buildAlternates`, Person schema, EducationalOrganization schema, BreadcrumbList |
| `app/sitemap.ts` | Add new routes with priority (root-level file, not under `[locale]`) |
| `app/robots.ts` | Add `/corporate/` to disallow (root-level file, not under `[locale]`) |
| `app/not-found.tsx` (or `app/[locale]/not-found.tsx`) | Enhanced 404 with CTAs |

---

## Success Criteria

- All 5 core pages (Homepage, How It Works, Fund a Student, Transparency, About/Trust) have `<60 char` title tags and `<160 char` meta descriptions
- JSON-LD validates in Google's Rich Results Test for: Organization and WebSite (root layout), FAQPage (fund-a-student, how-it-works, transparency), Article (blog posts), HowTo (calculator), BreadcrumbList (all pages above), Person + EducationalOrganization (campaign/[id] pages)
- Every page touched by this spec has self-referencing canonical + tr/en hreflang alternates with `x-default` pointing to `/en`
- `/fund-a-student`, `/blog/*`, `/education-funding-calculator`, `/who-we-are` are present in `app/sitemap.ts` with appropriate priority
- `app/[locale]/layout.tsx` no longer has a fallback `alternates: { canonical: '/' }`
- `how-it-works` and `transparency` use server-wrapper pattern — `generateMetadata` exports work without build errors
- Blog posts render English content only; Turkish hreflang alternates point to English canonical
- 404 page has navigation CTAs (Browse, Fund a Student, How It Works)
- Homepage and `/fund-a-student` each have 4+ outbound internal links
- Impact stats on campaign pages render as crawlable HTML text nodes (not canvas/SVG-only)
