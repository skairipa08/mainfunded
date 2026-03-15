# SEO Audit Implementation Design

**Date:** 2026-03-15
**Source:** SEO Audit Report — Global Education Funding Platform (ESG-Aligned), March 14 2026
**Approach:** Layered rollout (Layer 1 → Layer 2 → Layer 3)
**Project:** FundEd — Next.js 14 App Router, next-intl (tr/en), MongoDB, Tailwind CSS

---

## Context

The audit identified 25 keyword opportunities, 12 content gaps, and 8 quick wins. The platform already has: sitemap.ts, robots.ts, GA4, HTTPS, mobile-responsive Tailwind layout, hreflang routing via next-intl middleware. Missing: JSON-LD schema, canonical tags, optimized metadata for key pages, Core Web Vitals attributes, content pages, calculator tool.

---

## Layer 1 — Technical SEO

### 1.1 JSON-LD Schema Components

**New file:** `components/seo/JsonLd.tsx`
A lightweight wrapper that renders `<script type="application/ld+json">` tags server-side.

**Schema builders (all in `lib/seo/schemas.ts`):**

| Schema Type | Used On |
|---|---|
| `Organization` | Root layout (sitewide) |
| `WebSite` + `SearchAction` | Root layout (sitewide) |
| `BreadcrumbList` | Every page via per-page metadata |
| `Person` | Student profile pages |
| `EducationalOrganization` | Campaign/student pages |
| `FAQPage` | how-it-works, transparency, fund-a-student |
| `Article` | Blog post pages |
| `WebApplication` | Education Funding Calculator |

Implementation: Each schema builder is a pure function returning a typed object. `JsonLd` component takes the object and serializes it. Pages import and compose schemas as needed.

### 1.2 Canonical + Hreflang Tags

All pages add `alternates` to their `generateMetadata` export:

```ts
alternates: {
  canonical: `https://fund-ed.com/${locale}/[path]`,
  languages: {
    'tr': `https://fund-ed.com/tr/[path]`,
    'en': `https://fund-ed.com/en/[path]`,
    'x-default': `https://fund-ed.com/tr/[path]`,
  }
}
```

Root layout provides the default pattern. Individual `generateMetadata` functions in each page file override the path. A shared `buildAlternates(locale, path)` helper in `lib/seo/metadata.ts` keeps this DRY.

### 1.3 Metadata Overhaul — 5 Core Pages

| Page | Title (≤60 chars) | Meta Description (≤160 chars) |
|---|---|---|
| Homepage | `Fund a Student's Education \| FundEd` | `Sponsor verified students globally on the first ESG-aligned education funding platform. Track real impact.` |
| How It Works | `How Education Funding Works \| FundEd` | `See how FundEd connects donors with verified students. Transparent funding, verified outcomes, real impact.` |
| Fund a Student | `Fund a Student — Transparent Impact \| FundEd` | `Choose a verified student to fund. Every donation is tracked and impact-reported. Start with $25.` |
| Transparency | `Verified & Transparent Education Funding \| FundEd` | `See exactly where every donation goes. FundEd publishes live fund tracking and verified student outcomes.` |
| About/Trust | `About FundEd — ESG Education Platform \| FundEd` | `FundEd is the first ESG-aligned education crowdfunding platform with verified student outcomes.` |

Each page's `generateMetadata` is updated with the above values, locale-aware (TR variant uses Turkish copy).

### 1.4 Core Web Vitals

- Add `priority` prop to above-the-fold `<Image>` components on Homepage and `/fund-a-student`
- Add explicit `width` and `height` to all `<Image>` components missing them (prevents CLS)
- Impact dashboard stats: verify they render as HTML text nodes (not canvas/SVG-only) — add SSR fallback text if needed
- Add `loading="lazy"` to below-fold images explicitly

### 1.5 robots.ts + sitemap.ts Improvements

**robots.ts:** Add `/corporate/` to disallow list (already has /admin/, /api/, etc.).

**sitemap.ts:** Add new high-priority static routes:

```ts
{ url: '/fund-a-student', priority: 0.9, changeFrequency: 'weekly' },
{ url: '/transparency', priority: 0.8, changeFrequency: 'weekly' },
{ url: '/how-it-works', priority: 0.8, changeFrequency: 'monthly' },
{ url: '/blog', priority: 0.7, changeFrequency: 'weekly' },
{ url: '/education-funding-calculator', priority: 0.7, changeFrequency: 'monthly' },
{ url: '/blog/alternatives-to-gofundme-for-education', priority: 0.7, changeFrequency: 'monthly' },
{ url: '/blog/scholarship-vs-crowdfunding-vs-sponsorship', priority: 0.7, changeFrequency: 'monthly' },
{ url: '/blog/esg-education-impact', priority: 0.7, changeFrequency: 'monthly' },
```

---

## Layer 2 — Content Pages

### 2.1 `/fund-a-student` — New Landing Page

**File:** `app/[locale]/fund-a-student/page.tsx`
**Target keyword:** `fund a student`, `sponsor a student education` (High opportunity, Transactional)

**Structure:**
- Single `<h1>`: "Fund a Student's Education with Verified Impact Tracking"
- Hero sub-copy with `education funding platform` and `impact tracking` in first 100 words
- Impact stats bar (students funded, donors, countries)
- Student profile grid (reuses existing campaign card components, fetches published campaigns)
- How-it-works mini-section (3 steps with icons)
- Trust badges / verification callout
- FAQ section (5 Qs) → FAQPage schema
- CTA footer

**Metadata:** Title + description from table above. OG image: `/og-image.png` (existing).

### 2.2 `/how-it-works` — Upgrade

**File:** `app/[locale]/how-it-works/page.tsx` (already exists — edit only)

Changes:
- Update `generateMetadata` with optimized title/description
- Add canonical + hreflang alternates
- Ensure H1 is "How Education Funding Works" (or locale equivalent)
- Add H2 structure targeting `how to fund a student's education`
- Add FAQ schema (5 questions about the process)
- Add internal links: → `/fund-a-student`, → `/transparency`, → `/browse`

### 2.3 `/transparency` — Enhancement

**File:** `app/[locale]/transparency/page.tsx` (already exists — edit only)

Changes:
- Update `generateMetadata` targeting `transparent education donation`, `verified student funding`
- Add canonical + hreflang alternates
- Add a "How Verification Works" section (3-step process: application → review → funding)
- Add FAQ schema (5 questions about trust/verification)
- Add internal links: → `/fund-a-student`, → `/how-it-works`

### 2.4 Blog Infrastructure + 2 Posts

**New files:**
- `app/[locale]/blog/page.tsx` — Blog index listing all posts with title, keyword, date
- `app/[locale]/blog/alternatives-to-gofundme-for-education/page.tsx`
- `app/[locale]/blog/scholarship-vs-crowdfunding-vs-sponsorship/page.tsx`

**Blog index:** Static list of posts (no CMS). Each post entry has title, slug, description, keyword, date.

**Post: Alternatives to GoFundMe for Education**
~1,500 words. Comparison table of 5-7 platforms (GoFundMe, DonorsChoose, Kiva, JustGiving, FundEd). Target featured snippet via comparison table. Article schema. Metadata targets `alternatives to GoFundMe for education`.

**Post: Scholarship vs. Crowdfunding vs. Sponsorship**
~1,200 words. Comparison table of 3 models. Target featured snippet. Article schema. Metadata targets `scholarship funding platform`.

Both posts include:
- `generateMetadata` with title, description, canonical, alternates
- `Article` JSON-LD schema
- Internal links to `/fund-a-student`, `/how-it-works`, `/transparency`

---

## Layer 3 — Calculator + ESG Hub + Internal Linking

### 3.1 Education Funding Impact Calculator

**File:** `app/[locale]/education-funding-calculator/page.tsx`
**Target keyword:** `education funding calculator` (Medium opportunity)

**Implementation:** Client component. Static config object defines impact per tier:

```ts
const IMPACT_TIERS = {
  25:  { books: 3, meals: 10, days: 5,  label: '$25' },
  50:  { books: 6, meals: 20, days: 10, label: '$50' },
  100: { books: 12, meals: 40, days: 20, label: '$100' },
  500: { books: 60, meals: 200, days: 100, label: '$500' },
}
```

UI: 4 clickable tier cards. On selection, animated counter reveals impact breakdown. "Fund a Student Now" CTA links to `/fund-a-student`. No API calls — fully static/SSG.

Schema: `WebApplication` JSON-LD.

### 3.2 ESG Content Hub — First Article

**File:** `app/[locale]/blog/esg-education-impact/page.tsx`
**Target keyword:** `ESG education impact` (High opportunity, Informational/Commercial)

~1,500 words. Covers: what ESG-aligned giving means, why education is an ESG investment, how FundEd tracks impact, SDG alignment. Article schema. Internal links to `/fund-a-student`, `/transparency`, `/education-funding-calculator`.

### 3.3 Internal Linking Pass

A targeted pass through these files to add 3–5 cross-links each, following hub-and-spoke:

- `app/[locale]/page.tsx` (Homepage) → `/fund-a-student`, `/how-it-works`, `/transparency`, `/blog`
- `app/[locale]/fund-a-student/page.tsx` → `/transparency`, `/how-it-works`, `/education-funding-calculator`
- `app/[locale]/transparency/page.tsx` → `/fund-a-student`, `/how-it-works`
- `app/[locale]/how-it-works/page.tsx` → `/fund-a-student`, `/transparency`, `/browse`
- Blog posts → each other + `/fund-a-student`

### 3.4 Custom 404 Enhancement

**File:** `app/[locale]/not-found.tsx` (already exists — edit only)

Add:
- Search bar / link to `/browse`
- Quick links: Browse Campaigns, Fund a Student, How It Works
- Donation CTA: "Help a student while you're here →"
- Keep existing design language (Tailwind classes matching site theme)

---

## File Change Summary

### New Files
| File | Purpose |
|---|---|
| `components/seo/JsonLd.tsx` | JSON-LD script renderer |
| `lib/seo/schemas.ts` | Schema builder functions |
| `lib/seo/metadata.ts` | `buildAlternates()` helper |
| `app/[locale]/fund-a-student/page.tsx` | Fund a Student landing page |
| `app/[locale]/blog/page.tsx` | Blog index |
| `app/[locale]/blog/alternatives-to-gofundme-for-education/page.tsx` | Comparison blog post |
| `app/[locale]/blog/scholarship-vs-crowdfunding-vs-sponsorship/page.tsx` | Comparison blog post |
| `app/[locale]/blog/esg-education-impact/page.tsx` | ESG hub article |
| `app/[locale]/education-funding-calculator/page.tsx` | Calculator tool |

### Modified Files
| File | Changes |
|---|---|
| `app/[locale]/layout.tsx` | Add Organization + WebSite schemas, update root metadata |
| `app/[locale]/page.tsx` | Optimized metadata, internal links, priority image, H1 |
| `app/[locale]/how-it-works/page.tsx` | Metadata, FAQ schema, H2 structure, internal links |
| `app/[locale]/transparency/page.tsx` | Metadata, FAQ schema, verification section, internal links |
| `app/[locale]/sitemap.ts` | Add new routes with priority |
| `app/[locale]/robots.ts` | Add `/corporate/` to disallow |
| `app/not-found.tsx` or `app/[locale]/not-found.tsx` | Enhanced 404 with CTAs |

---

## Success Criteria

- All 5 core pages have `<60 char` title tags and `<160 char` meta descriptions
- JSON-LD validates in Google's Rich Results Test for: Organization, WebSite, FAQPage, Article, Person (student profile), WebApplication (calculator)
- Every page has self-referencing canonical + tr/en hreflang alternates
- `/fund-a-student`, `/blog/*`, `/education-funding-calculator` are crawlable and in sitemap
- No JS-only-rendered content on impact stats (SSR verified)
- 404 page has navigation CTAs
- Internal linking: Homepage and `/fund-a-student` each have 4+ outbound internal links
