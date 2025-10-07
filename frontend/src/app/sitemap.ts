// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { SERVICES } from '@/lib/services.config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const base: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/services`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  ];

  const services: MetadataRoute.Sitemap = Object.keys(SERVICES).map((slug) => ({
    url: `${SITE_URL}/services/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // при желании — подтянуть портфолио:
  // const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8080';
  // const res = await fetch(`${apiBase}/api/portfolio?per_page=100&is_published=1`, { next: { revalidate: 3600 }});
  // const json = res.ok ? await res.json() : { data: [] };
  // const portfolio: MetadataRoute.Sitemap = (json.data ?? []).map((p: any) => ({
  //   url: `${SITE_URL}/portfolio/${p.id}`,
  //   lastModified: p.updated_at ? new Date(p.updated_at) : now,
  //   changeFrequency: 'yearly',
  //   priority: 0.6,
  // }));

  return [...base, ...services /*, ...portfolio*/];
}
