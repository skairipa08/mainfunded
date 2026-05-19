import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fund-ed.com';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
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
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
