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
    alternates: alternatesFor(path), // только canonical
    openGraph: { title, description, url: path, type: 'website', siteName: 'OverCreate' },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: true, follow: true },
  };
}

function normalizeCoverUrl(u?: string | null): string | undefined {
  if (!u) return undefined;
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  const base = process.env.NEXT_PUBLIC_API_BASE ?? 'http://127.0.0.1:8080';
  return `${base}${u}`;
}

export default async function ServicePage({ params }: PageProps) {
  const cfg: ServiceConfig | undefined = SERVICES[params.slug];
  if (!cfg) notFound();

  const vars: StyleWithVars = {
    '--acc1': cfg.acc1.join(' '),
    '--acc2': cfg.acc2.join(' '),
  };

  // portfolio
  let apiItems: Portfolio[] = [];
  try {
    const { data } = await fetchPortfolioByService(params.slug, 1, 9, { revalidate: 3600 });
    apiItems = data ?? [];
  } catch {
    apiItems = [];
  }

  const items = apiItems.map((p) => ({
    id: p.id,
    title: p.title,
    cover_url: normalizeCoverUrl(p.cover_url),
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
{/* TODO */}
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
