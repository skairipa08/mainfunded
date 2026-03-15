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
