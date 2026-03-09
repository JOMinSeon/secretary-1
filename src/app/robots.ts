import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://axai.co.kr';

    return {
        rules: {
            userAgent: '*',
            allow: ['/', '/pricing', '/login', '/signup'],
            disallow: [
                '/dashboard/',
                '/settings/',
                '/api/',
                '/checkout/',
                '/test-ai/',
                '/reports/',
                '/receipts/',
                '/expenses/'
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
