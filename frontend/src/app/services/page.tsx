import type { Metadata } from 'next';
import Link from 'next/link';
import { SERVICES } from '@/lib/services.config';
import { alternatesFor } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Services - OverCreate',
  description:
    'Explore OverCreate studio services: Motion Design, Graphic Design, Web Design, Development, and Digital Printing.',
  alternates: alternatesFor('/services'),
  openGraph: {
    title: 'Services - OverCreate',
    description:
      'Explore OverCreate studio services: Motion Design, Graphic Design, Web Design, Development, and Digital Printing.',
    url: '/services',
    type: 'website',
    siteName: 'OverCreate',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Services - OverCreate',
    description:
      'Explore OverCreate studio services: Motion Design, Graphic Design, Web Design, Development, and Digital Printing.',
  },
};

export default function ServicesIndexPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-20 text-white">
      <header>
        <h1 className="text-4xl font-semibold tracking-tight">OverCreate Services</h1>
        <p className="mt-4 max-w-3xl text-white/75">
          We help brands grow through design and engineering. Choose a service page below to see
          scope, process, pricing, and examples.
        </p>
      </header>

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        {Object.entries(SERVICES).map(([slug, service]) => (
          <article key={slug} className="rounded-2xl border border-white/15 bg-white/[0.04] p-5">
            <h2 className="text-2xl font-semibold">{service.title}</h2>
            <p className="mt-2 text-white/75">{service.desc}</p>
            <Link
              href={`/services/${slug}`}
              className="mt-4 inline-block rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
            >
              Open service page
            </Link>
          </article>
        ))}
      </section>

      <section className="mt-10 text-white/70">
        <p>
          Looking for articles and case notes? Visit{' '}
          <Link href="/insights" className="underline">
            Insights
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
