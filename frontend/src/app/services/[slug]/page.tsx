// src/app/services/[slug]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SERVICES, type ServiceSlug, type ServiceConfig } from '@/lib/services.config';

import ServiceHero from '@/components/services/ServiceHero';
import ServicePricing from '@/components/services/ServicePricing';
import ServiceProcess from '@/components/services/ServiceProcess';
import ServicePortfolio from '@/components/services/ServicePortfolio';
import ServiceCTA from '@/components/services/ServiceCTA';

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

  return (
    <main className="relative">
      {/* HERO (шапка услуги) */}
     <ServiceHero
  slug={params.slug}
  title={cfg.title}
  desc={cfg.desc}
  acc1={cfg.acc1}       // ← добавить
  acc2={cfg.acc2}       // ← добавить
/>


      {/* СТОИМОСТЬ */}
      <ServicePricing
        pricing={cfg.pricing}
        accentFrom={cfg.acc1}
        accentTo={cfg.acc2}
      />

      {/* ПРОЦЕСС */}
      <ServiceProcess
        accentFrom={cfg.acc1}
        accentTo={cfg.acc2}
      />

      {/* ПОРТФОЛИО ПО ЭТОЙ УСЛУГЕ */}
      <ServicePortfolio
        service={params.slug}
        accentFrom={cfg.acc1}
        accentTo={cfg.acc2}
      />

      {/* CTA / КОНТАКТЫ */}
      <ServiceCTA
        accentFrom={cfg.acc1}
        accentTo={cfg.acc2}
      />
    </main>
  );
}
