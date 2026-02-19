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
    ];

    const sitemap: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1 : 0.8,
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
