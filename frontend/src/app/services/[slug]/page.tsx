// app/services/[slug]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SERVICES, type ServiceSlug, type ServiceConfig } from '@/lib/services.config';
import { fetchPortfolioByService, type Portfolio } from '@/lib/api';
import ServiceHero from '@/components/services/ServiceHero';
import ServicePricing from '@/components/services/ServicePricing';
import ServiceProcess from '@/components/services/ServiceProcess';
import ServicePortfolio from '@/components/services/ServicePortfolio';
import ServiceCTA from '@/components/services/ServiceCTA';
import ServiceHighlights from '@/components/services/ServiceHighlights';
import ServiceFAQ from '@/components/services/ServiceFAQ';
import BackToHome from '@/components/ui/BackToHome';
import { SITE_URL, alternatesFor, jsonLd } from '@/lib/seo';
import Script from 'next/script';
import { toMediaUrl } from '@/lib/mediaUrl';

//* Если захотите вернуть ISR вместо полной динамики, раскомментируйте верхние строки и закомментируйте эти:
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'default-no-store';
export const revalidate = 30;
export const fetchCache = 'default-cache';

type CSSVarMap = Record<`--${string}`, string>;
type StyleWithVars = React.CSSProperties & CSSVarMap;

export function generateStaticParams(): Array<{ slug: ServiceSlug }> {
  return (Object.keys(SERVICES) as ServiceSlug[]).map((slug) => ({ slug }));
}

type PageProps = { params: { slug: ServiceSlug } };

export function generateMetadata({ params }: PageProps): Metadata {
  const cfg = SERVICES[params.slug];
  if (!cfg) return {};
  const title = `${cfg.title} — OverCreate Services`;
  const description = cfg.desc;
  const path = `/services/${params.slug}`;

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
  return g.filter((x): x is string => typeof x === 'string' && !!x.trim());
}

/** Нормализуем в абсолютный URL (или undefined). */
function normalize(u?: string | null): string | undefined {
  const s = strOrNull(u);
  return s ? toMediaUrl(s) : undefined;
}

/** Выбор обложки: cover → preview → thumbnail → первая картинка из gallery. */
function pickCoverSrc(p: PortfolioWithMedia): string | undefined {
  const byField =
    normalize(p.cover_url) ??
    normalize(p.preview_url) ??
    normalize(p.thumbnail_url);

  if (byField) return byField;

  const firstFromGallery = galleryStrings(p.gallery).find(Boolean);
  return normalize(firstFromGallery ?? null);
}

/* ============================== page ================================ */

export default async function ServicePage({ params }: PageProps) {
  const cfg: ServiceConfig | undefined = SERVICES[params.slug];
  if (!cfg) notFound();

  const vars: StyleWithVars = {
    '--acc1': cfg.acc1.join(' '),
    '--acc2': cfg.acc2.join(' '),
  };

  // portfolio
  let apiItems: PortfolioWithMedia[] = [];
  try {
    // короткий revalidate «на будущее», если вернёте ISR
    const { data } = await fetchPortfolioByService(params.slug, 1, 9, { revalidate: 15 });
    apiItems = (data ?? []) as PortfolioWithMedia[];
  } catch {
    apiItems = [];
  }

  // Мэппим в формат, который ждёт карусель
  const items = apiItems.map((p) => ({
    id: p.id,
    title: p.title,
    cover_url: pickCoverSrc(p), // ← БЕЗ /api/media/…/cover, берём реальный URL
    excerpt: p.excerpt ?? undefined,
    href: `/portfolio/${p.id}`,
  }));

  // JSON-LD: Service + FAQ (если есть)
  const ldService = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: cfg.title,
    description: cfg.desc,
    provider: { '@type': 'Organization', name: 'OverCreate', url: SITE_URL },
    areaServed: ['US', 'EU'],
    url: `${SITE_URL}/services/${params.slug}`,
    offers:
      cfg.pricing?.map((p) => ({
        '@type': 'Offer',
        name: p.name,
        price: p.price.replace(/[^\d.]/g, '') || undefined,
        priceCurrency: 'USD',
        url: `${SITE_URL}/services/${params.slug}#pricing`,
        availability: 'http://schema.org/InStock',
      })) ?? undefined,
  };

  const ldFAQ =
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
    <main key={`service-${params.slug}`} className="relative" style={vars}>
      {/* JSON-LD */}
      <Script id="ld-service" type="application/ld+json" dangerouslySetInnerHTML={jsonLd(ldService)} />
      {ldFAQ ? (
        <Script id="ld-faq" type="application/ld+json" dangerouslySetInnerHTML={jsonLd(ldFAQ)} />
      ) : null}

      <BackToHome />

      <ServiceHero
        key={`hero-${params.slug}-${cfg.acc1.join('_')}-${cfg.acc2.join('_')}`}
        slug={params.slug}
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

      <ServiceCTA service={params.slug} accentFrom={cfg.acc1} accentTo={cfg.acc2} />
    </main>
  );
}
