import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  SERVICES,
  type ServiceSlug,
  type ServiceConfig,
} from '@/lib/services.config';

import {
  Target,
  FlaskConical,
  Lightbulb,
  Cog,
  Rocket,
  type LucideIcon,
} from 'lucide-react';

import ServiceHero from '@/components/services/ServiceHero';
import ServicePricing from '@/components/services/ServicePricing';
import ServiceProcess from '@/components/services/ServiceProcess';
import ServicePortfolio from '@/components/services/ServicePortfolio';
import ServiceCTA from '@/components/services/ServiceCTA';
import ServiceHighlights from '@/components/services/ServiceHighlights';
import ServiceFAQ from '@/components/services/ServiceFAQ';
import type { CSSVars } from '@/types/ui';

/* SSG for all services */
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

const PROC_ICONS: Record<string, LucideIcon> = {
  target: Target,
  flask: FlaskConical,
  lightbulb: Lightbulb,
  cog: Cog,
  rocket: Rocket,
};

/* Page */
export default function ServicePage({ params }: PageProps) {
  const cfg: ServiceConfig | undefined = SERVICES[params.slug];
  if (!cfg) notFound();

  // красим всю страницу акцентами услуги
  const vars: CSSVars = { '--acc1': cfg.acc1.join(' '), '--acc2': cfg.acc2.join(' ') };

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
        steps={cfg.process}                 // ← тут icon – строка из конфига
        title={cfg.sectionTitles?.processTitle ?? 'How we work'}
      />




      <ServicePortfolio service={params.slug} accentFrom={cfg.acc1} accentTo={cfg.acc2} />

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
