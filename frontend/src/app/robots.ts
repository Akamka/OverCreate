// app/robots.ts
import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/login',
          '/register',
          '/api/',          // внутренние
          '/broadcasting/', // внутренние
          '/projects/',     // личный кабинет
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
