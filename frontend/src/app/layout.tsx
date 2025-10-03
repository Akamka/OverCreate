// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

import PremiumBackground from '@/components/PremiumBackground';
import RouteAwareSmoothScroll from '@/components/utils/RouteAwareSmoothScroll';
import RouteTransitions from '@/components/transitions/RouteTransitions';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin', 'cyrillic'], display: 'swap' });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'OverCreate — студия дизайна', template: '%s | OverCreate' },
  description: 'Моушн, графика, веб-дизайн и разработка. Дизайн, который двигает бренд.',
  openGraph: { type: 'website', siteName: 'OverCreate' },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="h-full">
      <body className={`${inter.className} h-full bg-[#0A0A0F] text-neutral-50 antialiased`}>
        {/* Статичный фон (НЕ анимируем, чтобы не «мелькал») */}
        <PremiumBackground />

        {/* Плавный скролл там, где не мешает */}
        <RouteAwareSmoothScroll />

        {/* Только входная анимация новой страницы */}
        <RouteTransitions>
          {children}
        </RouteTransitions>
      </body>
    </html>
  );
}
