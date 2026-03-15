import { MetadataRoute } from 'next';
import { getDb } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fund-ed.com';

    // Static routes
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
    ];

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
    }));

    // Dynamic: published campaigns
    try {
        const db = await getDb();
        const campaigns = await db.collection('campaigns')
            .find({ status: 'published' }, { projection: { campaign_id: 1, updated_at: 1 } })
            .limit(5000)
            .toArray();

        for (const c of campaigns) {
            sitemap.push({
                url: `${baseUrl}/campaign/${c.campaign_id}`,
                lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
                changeFrequency: 'daily',
                priority: 0.7,
            });
        }
    } catch {
        // DB unavailable — return static routes only
    }

    return sitemap;
}
