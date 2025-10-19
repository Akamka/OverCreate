import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

import PremiumBackground from '@/components/PremiumBackground';
import RouteAwareSmoothScroll from '@/components/utils/RouteAwareSmoothScroll';
import RouteTransitions from '@/components/transitions/RouteTransitions';
import { Inter } from 'next/font/google';
import { SITE_URL, alternatesFor, jsonLd } from '@/lib/seo';

<link rel="manifest" href="/manifest.webmanifest" />

const inter = Inter({ subsets: ['latin', 'cyrillic'], display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'OverCreate — Design × Code Studio', template: '%s | OverCreate' },
  description: 'Motion, graphics, web design and development.Design that moves your brand.',
  alternates: alternatesFor('/'),
  openGraph: { type: 'website', siteName: 'OverCreate', url: SITE_URL },
  twitter: { card: 'summary_large_image' },
  applicationName: 'OverCreate',
  themeColor: '#0A0A0F',
  viewport: { width: 'device-width', initialScale: 1, maximumScale: 5, viewportFit: 'cover' },
  icons: {
    icon: [{ url: '/favicon.ico' }, { url: '/icon-192.png', sizes: '192x192' }, { url: '/icon-512.png', sizes: '512x512' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/manifest.webmanifest',
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'OverCreate',
    url: SITE_URL,
    logo: `${SITE_URL}/transp-logo.svg`,
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

        <Script id="ld-org" type="application/ld+json" dangerouslySetInnerHTML={jsonLd(org)} />
        <Script id="ld-website" type="application/ld+json" dangerouslySetInnerHTML={jsonLd(website)} />
      </body>
    </html>
  );
}
