import type { Metadata } from 'next'
import './globals.css'
import SmoothScroll from '@/components/SmoothScroll'
import PremiumBackground from '@/components/PremiumBackground'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin','cyrillic'], display: 'swap' })
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'OverCreate — студия дизайна', template: '%s | OverCreate' },
  description: 'Моушн, графика, веб-дизайн и разработка. Дизайн, который двигает бренд.',
  openGraph: { type: 'website', siteName: 'OverCreate' },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${inter.className} bg-[#0A0A0F] text-neutral-50 antialiased`}>
        {/* новый премиальный фон */}
        <PremiumBackground />
        <SmoothScroll />
        {children}
      </body>
    </html>
  )
}
