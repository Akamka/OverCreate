// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';

import PremiumBackground from '@/components/PremiumBackground';
import RouteAwareSmoothScroll from '@/components/utils/RouteAwareSmoothScroll';
import RouteTransitions from '@/components/transitions/RouteTransitions';
import { Inter } from 'next/font/google';
import { SITE_URL, alternatesFor, jsonLd } from '@/lib/seo';

import CookieBanner from '@/components/CookieBanner';

const inter = Inter({ subsets: ['latin', 'cyrillic'], display: 'swap' });

/** ⬇️ В Next 15 viewport вынесен отдельно */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#0A0A0F',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'OverCreate — Design × Code Studio', template: '%s | OverCreate' },
  description: 'Motion, graphics, web design and development. Design that moves your brand.',
  alternates: alternatesFor('/'),
  openGraph: { type: 'website', siteName: 'OverCreate', url: SITE_URL },
  twitter: { card: 'summary_large_image' },
  applicationName: 'OverCreate',
  /** ⛔️ НЕ указываем тут viewport/themeColor — они вынесены выше */

  /** Иконки — только реальные файлы из /public */
  icons: {
    icon: [
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-512.png', sizes: '512x512', type: 'image/png' },
      // /favicon.ico лежит в public и будет запрошен браузером сам по себе,
      // добавлять его сюда не обязательно (иногда даёт 500 в dev).
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [{ rel: 'mask-icon', url: '/transp-logo.png', color: '#0A0A0F' }],
  },

  /** Один манифест — тот, что ниже */
  manifest: '/site.webmanifest',
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'OverCreate',
    url: SITE_URL,
    logo: `${SITE_URL}/transp-logo.png`,
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'OverCreate',
    url: SITE_URL,
    inLanguage: 'en',
  };

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-[#0A0A0F] text-neutral-50 antialiased`}>
        <PremiumBackground />
        <RouteAwareSmoothScroll />
        <RouteTransitions>{children}</RouteTransitions>

        <CookieBanner />

        {/* Structured Data */}
        <Script id="ld-org" type="application/ld+json" dangerouslySetInnerHTML={jsonLd(org)} />
        <Script id="ld-website" type="application/ld+json" dangerouslySetInnerHTML={jsonLd(website)} />
      </body>
    </html>
  );
}
