import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://funded.edu';

    // Static routes
    const staticRoutes = [
        '',
        '/campaigns',
        '/login',
        '/about',
        '/contact',
        '/faq',
        '/terms',
        '/privacy',
    ];

    const sitemap: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1 : 0.8,
    }));

    return sitemap;
}
