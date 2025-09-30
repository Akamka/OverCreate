// app/services/[slug]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  SERVICES,
  type ServiceSlug,
  type ServiceConfig,
} from '@/lib/services.config';

import ServiceHero from '@/components/services/ServiceHero';
import ServicePricing from '@/components/services/ServicePricing';
import ServiceProcess from '@/components/services/ServiceProcess';
import ServicePortfolio from '@/components/services/ServicePortfolio'; // ← обычное портфолио
import ServiceCTA from '@/components/services/ServiceCTA';
import ServiceHighlights from '@/components/services/ServiceHighlights';
import ServiceFAQ from '@/components/services/ServiceFAQ';

import { fetchPortfolioByService, type Portfolio } from '@/lib/api';

// типы для css vars
type CSSVarMap = Record<`--${string}`, string>;
type StyleWithVars = React.CSSProperties & CSSVarMap;

/* SSG */
export function generateStaticParams(): Array<{ slug: ServiceSlug }> {
  return (Object.keys(SERVICES) as ServiceSlug[]).map((slug) => ({ slug }));
}

/* SEO */
type PageProps = { params: { slug: ServiceSlug } };

export function generateMetadata({ params }: PageProps): Metadata {
  const cfg = SERVICES[params.slug];
  if (!cfg) return {};
  const title = `${cfg.title} — OverCreate Services`;
  const description = cfg.desc;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/services/${params.slug}`,
      type: 'website',
      siteName: 'OverCreate',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

function normalizeCoverUrl(u?: string | null): string | undefined {
  if (!u) return undefined;
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  const base = process.env.NEXT_PUBLIC_API_BASE ?? 'http://127.0.0.1:8080';
  return `${base}${u}`;
}

/* PAGE */
export default async function ServicePage({ params }: PageProps) {
  const cfg: ServiceConfig | undefined = SERVICES[params.slug];
  if (!cfg) notFound();

  // акцентные переменные странице
  const vars: StyleWithVars = {
    '--acc1': cfg.acc1.join(' '),
    '--acc2': cfg.acc2.join(' '),
  };

  // 1) грузим портфолио
  let apiItems: Portfolio[] = [];
  try {
    const { data } = await fetchPortfolioByService(params.slug, 1, 9, {
      revalidate: 0,
    });
    apiItems = data ?? [];
  } catch {
    apiItems = [];
  }

  // 2) приводим к формату карточек ServicePortfolio
  const items = apiItems.map((p) => ({
    id: p.id,
    title: p.title,
    cover_url: normalizeCoverUrl(p.cover_url),
    excerpt: p.excerpt ?? undefined,
    href: `/portfolio/${p.id}`,
  }));

  return (
    <main key={`service-${params.slug}`} className="relative" style={vars}>
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
        subtitle={
          cfg.sectionTitles?.highlightsSubtitle ?? 'Value that compounds'
        }
      />

      <ServicePricing
        pricing={cfg.pricing}
        accentFrom={cfg.acc1}
        accentTo={cfg.acc2}
        title={cfg.sectionTitles?.pricingTitle ?? 'Pricing'}
        subtitle={
          cfg.sectionTitles?.pricingSubtitle ?? 'Transparent packages for your goals'
        }
      />

      <ServiceProcess
        accentFrom={cfg.acc1}
        accentTo={cfg.acc2}
        steps={cfg.process}
        title={cfg.sectionTitles?.processTitle ?? 'How we work'}
      />

      {/* ⬇⬇ обычная секция портфолио */}
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
