// app/services/[slug]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Script from 'next/script';

import { SERVICES, type ServiceSlug, type ServiceConfig } from '@/lib/services.config';
import { fetchPortfolioByService, type Portfolio } from '@/lib/api';
import { SITE_URL, alternatesFor, jsonLd } from '@/lib/seo';
import { toMediaUrl } from '@/lib/mediaUrl';

import BackToHome from '@/components/ui/BackToHome';
import ServiceHero from '@/components/services/ServiceHero';
import ServicePricing from '@/components/services/ServicePricing';
import ServiceProcess from '@/components/services/ServiceProcess';
import ServicePortfolio from '@/components/services/ServicePortfolio';
import ServiceCTA from '@/components/services/ServiceCTA';
import ServiceHighlights from '@/components/services/ServiceHighlights';
import ServiceFAQ from '@/components/services/ServiceFAQ';

// Используем ISR, чтобы страница переcобиралась и подтягивала новые работы.
// Если хочешь абсолютную динамику — раскомментируй две строки ниже и закомментируй export const revalidate/fetchCache.
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'default-no-store';
export const revalidate = 30;
export const fetchCache = 'default-cache';

type CSSVarMap = Record<`--${string}`, string>;
type StyleWithVars = React.CSSProperties & CSSVarMap;

export function generateStaticParams(): Array<{ slug: ServiceSlug }> {
  return (Object.keys(SERVICES) as ServiceSlug[]).map((slug) => ({ slug }));
}

type RouteParams = { slug: string };
type PageProps = { params: RouteParams | Promise<RouteParams> };

async function readSlug(params: PageProps['params']): Promise<ServiceSlug | null> {
  const resolved = await params;
  const normalized = (resolved?.slug ?? '').toLowerCase().trim();
  if (!normalized) return null;
  if (normalized in SERVICES) return normalized as ServiceSlug;
  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slug = await readSlug(params);
  if (!slug) return {};
  const cfg = SERVICES[slug];
  if (!cfg) return {};
  const title = `${cfg.title} — OverCreate Services`;
  const description = cfg.desc;
  const path = `/services/${slug}`;

  return {
    title,
    description,
    alternates: alternatesFor(path),
    openGraph: { title, description, url: path, type: 'website', siteName: 'OverCreate' },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: true, follow: true },
  };
}

/* ====================== helpers (типобезопасные) ====================== */

// То, что реально приходит от API: у Portfolio могут быть медиа-поля.
type PortfolioWithMedia = Portfolio & {
  cover_url?: string | null;
  preview_url?: string | null;
  thumbnail_url?: string | null;
  gallery?: unknown;
};

function strOrNull(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v : null;
}

function galleryStrings(g: unknown): string[] {
  if (!Array.isArray(g)) return [];
  return g.filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
}

/** Нормализуем в абсолютный URL (или undefined). */
function normalize(u?: string | null): string | undefined {
  const s = strOrNull(u);
  return s ? toMediaUrl(s) : undefined;
}

/** Выбор обложки: cover → preview → thumbnail → первая КАРТИНКА из gallery (видео игнорируем). */
function pickCoverSrc(p: PortfolioWithMedia): string | undefined {
  const byField =
    normalize(p.cover_url) ??
    normalize(p.preview_url) ??
    normalize(p.thumbnail_url);

  if (byField) return byField;

  const firstImageFromGallery = galleryStrings(p.gallery).find(
    (url) => !/\.(mp4|webm|mov|avi)$/i.test(url)
  );

  return normalize(firstImageFromGallery ?? null);
}

/* ============================== page ================================ */

export default async function ServicePage({ params }: PageProps) {
  const slug = await readSlug(params);
  const cfg: ServiceConfig | undefined = slug ? SERVICES[slug] : undefined;
  if (!cfg) notFound();
  const serviceSlug = slug as ServiceSlug;

  const vars: StyleWithVars = {
    '--acc1': cfg.acc1.join(' '),
    '--acc2': cfg.acc2.join(' '),
  };

  // portfolio
  let apiItems: PortfolioWithMedia[] = [];
  try {
    // Короткий revalidate держим и на fetch-уровне (если в helper поддерживается),
    // чтобы новые работы попадали без долгой задержки.
    const { data } = await fetchPortfolioByService(serviceSlug, 1, 9, { revalidate: 30 });
    apiItems = (data ?? []) as PortfolioWithMedia[];
  } catch {
    apiItems = [];
  }

  // Мэппим в формат, который ждёт карусель
  const items = apiItems.map((p) => ({
    id: p.id,
    title: p.title,
    cover_url: pickCoverSrc(p), // абсолютный URL (R2/CDN), без локальных /storage/ путей
    excerpt: p.excerpt ?? undefined,
    href: `/portfolio/${p.id}`,
  }));

  // JSON-LD: Service + FAQ (если есть)
  const ldService: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: cfg.title,
    description: cfg.desc,
    provider: { '@type': 'Organization', name: 'OverCreate', url: SITE_URL },
    areaServed: ['US', 'EU'],
    url: `${SITE_URL}/services/${slug}`,
    offers:
      cfg.pricing?.map((p) => ({
        '@type': 'Offer',
        name: p.name,
        price: p.price.replace(/[^\d.]/g, '') || undefined,
        priceCurrency: 'USD',
        url: `${SITE_URL}/services/${slug}#pricing`,
        availability: 'http://schema.org/InStock',
      })) ?? undefined,
  };

  const ldFAQ: Record<string, unknown> | null =
    cfg.faq && cfg.faq.length
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: cfg.faq.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }
      : null;

  return (
    <main key={`service-${slug}`} className="relative" style={vars}>
      {/* JSON-LD */}
      <Script id="ld-service" type="application/ld+json" dangerouslySetInnerHTML={jsonLd(ldService)} />
      {ldFAQ ? (
        <Script id="ld-faq" type="application/ld+json" dangerouslySetInnerHTML={jsonLd(ldFAQ)} />
      ) : null}

      <BackToHome />

      <ServiceHero
        key={`hero-${slug}-${cfg.acc1.join('_')}-${cfg.acc2.join('_')}`}
        slug={serviceSlug}
        title={cfg.title}
        desc={cfg.desc}
        acc1={cfg.acc1}
        acc2={cfg.acc2}
      />

      <ServiceHighlights
        accentFrom={cfg.acc1}
        accentTo={cfg.acc2}
        items={cfg.highlights}
        title={cfg.sectionTitles?.highlightsTitle ?? 'What you get'}
        subtitle={cfg.sectionTitles?.highlightsSubtitle ?? 'Value that compounds'}
      />

      <ServicePricing
        pricing={cfg.pricing}
        accentFrom={cfg.acc1}
        accentTo={cfg.acc2}
        title={cfg.sectionTitles?.pricingTitle ?? 'Pricing'}
        subtitle={cfg.sectionTitles?.pricingSubtitle ?? 'Transparent packages for your goals'}
      />

      <ServiceProcess
        accentFrom={cfg.acc1}
        accentTo={cfg.acc2}
        steps={cfg.process}
        title={cfg.sectionTitles?.processTitle ?? 'How we work'}
      />

      <ServicePortfolio
        title="Portfolio"
        subtitle="Selected work"
        items={items}
        accentFrom={cfg.acc1}
        accentTo={cfg.acc2}
      />

      <ServiceFAQ
        accentFrom={cfg.acc1}
        accentTo={cfg.acc2}
        items={cfg.faq}
        title={cfg.sectionTitles?.faqTitle ?? 'Frequently asked questions'}
      />

      <ServiceCTA service={serviceSlug} accentFrom={cfg.acc1} accentTo={cfg.acc2} />
    </main>
  );
}
