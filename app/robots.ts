import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fund-ed.com';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/admin/', '/student/dashboard/', '/account/', '/dashboard/', '/ops/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
