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
