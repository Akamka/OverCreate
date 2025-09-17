import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SERVICES, type ServiceSlug, type ServiceConfig } from '@/lib/services.config';

import ServiceHero from '@/components/services/ServiceHero';
import ServicePricing from '@/components/services/ServicePricing';
import ServiceProcess from '@/components/services/ServiceProcess';
import ServicePortfolio from '@/components/services/ServicePortfolio';
import ServiceCTA from '@/components/services/ServiceCTA';
import ServiceHighlights from '@/components/services/ServiceHighlights';
import ServiceFAQ from '@/components/services/ServiceFAQ';
import type { CSSVars } from '@/types/ui';

/* --- SSG: список страниц услуг --- */
export function generateStaticParams(): { slug: ServiceSlug }[] {
  return (Object.keys(SERVICES) as ServiceSlug[]).map((slug) => ({ slug }));
}

/* --- SEO на основе конфига услуги --- */
type PageProps = { params: { slug: ServiceSlug } };

export function generateMetadata({ params }: PageProps): Metadata {
  const cfg = SERVICES[params.slug];
  if (!cfg) return {};

  const title = `${cfg.title} — услуги OverCreate`;
  const description = cfg.desc;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/services/${params.slug}`,
      siteName: 'OverCreate',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

/* --- Страница услуги --- */
export default function ServicePage({ params }: PageProps) {
  const cfg: ServiceConfig | undefined = SERVICES[params.slug];
  if (!cfg) notFound();

  // Глобальные переменные акцента на странице
  const vars: CSSVars = { '--acc1': cfg.acc1.join(' '), '--acc2': cfg.acc2.join(' ') };

  return (
    <main className="relative" style={vars}>
      {/* HERO со встроенным ServiceTheme */}
      <ServiceHero
        slug={params.slug}
        title={cfg.title}
        desc={cfg.desc}
        acc1={cfg.acc1}
        acc2={cfg.acc2}
      />

      {/* Акцентные хайлайты — «что получаете» */}
      <ServiceHighlights accentFrom={cfg.acc1} accentTo={cfg.acc2} />

      {/* Стоимость */}
      <ServicePricing pricing={cfg.pricing} accentFrom={cfg.acc1} accentTo={cfg.acc2} />

      {/* Процесс */}
      <ServiceProcess accentFrom={cfg.acc1} accentTo={cfg.acc2} />

      {/* Портфолио */}
      <ServicePortfolio service={params.slug} accentFrom={cfg.acc1} accentTo={cfg.acc2} />

      {/* FAQ */}
      <ServiceFAQ accentFrom={cfg.acc1} accentTo={cfg.acc2} />

      {/* CTA — форма, окрашенная в акцент */}
      <ServiceCTA service={params.slug} accentFrom={cfg.acc1} accentTo={cfg.acc2} />
    </main>
  );
}
