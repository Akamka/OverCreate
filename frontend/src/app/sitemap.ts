// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { SERVICES } from '@/lib/services.config';
import { API_URL } from '@/lib/api';

type PostForSitemap = {
  slug?: string;
  published_at?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
};

type PaginatedPosts = {
  data?: PostForSitemap[];
  current_page?: number;
  last_page?: number;
  meta?: { current_page?: number; last_page?: number };
};

function normalizeDate(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}

async function fetchPublishedPostsForSitemap(): Promise<PostForSitemap[]> {
  const perPage = 100;
  const maxPages = 10;
  let page = 1;
  let lastPage = 1;
  const items: PostForSitemap[] = [];

  while (page <= lastPage && page <= maxPages) {
    const res = await fetch(`${API_URL}/posts?page=${page}&per_page=${perPage}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) break;

    const json = (await res.json()) as PaginatedPosts;
    const chunk = Array.isArray(json.data) ? json.data : [];
    items.push(...chunk);

    lastPage = Number(json.last_page ?? json.meta?.last_page ?? page) || page;
    page += 1;
  }

  return items;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const base: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/insights`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${SITE_URL}/services`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const services: MetadataRoute.Sitemap = Object.keys(SERVICES).map((slug) => ({
    url: `${SITE_URL}/services/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  let insights: MetadataRoute.Sitemap = [];
  try {
    const posts = await fetchPublishedPostsForSitemap();
    insights = posts
      .filter((p) => typeof p.slug === 'string' && p.slug.trim().length > 0)
      .map((p) => ({
        url: `${SITE_URL}/insights/${p.slug}`,
        lastModified:
          normalizeDate(p.updated_at) ??
          normalizeDate(p.published_at) ??
          normalizeDate(p.created_at) ??
          now,
        changeFrequency: 'monthly',
        priority: 0.7,
      }));
  } catch {
    insights = [];
  }

  return [...base, ...services, ...insights];
}
