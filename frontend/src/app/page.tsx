import type { Metadata } from 'next';
import type { Portfolio } from '@/types/portfolio'
import HomeClient from '@/components/HomeClient'
import { alternatesFor } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'OverCreate - Design x Code Studio',
  description:
    'OverCreate is a design and development studio. We build motion design, brand graphics, web design, and full-stack products.',
  alternates: alternatesFor('/'),
  openGraph: {
    title: 'OverCreate - Design x Code Studio',
    description:
      'Motion, graphics, web design, and development with measurable business outcomes.',
    url: '/',
    type: 'website',
    siteName: 'OverCreate',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OverCreate - Design x Code Studio',
    description:
      'Motion, graphics, web design, and development with measurable business outcomes.',
  },
};

async function getPortfolio(): Promise<Portfolio[]>{
  const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'
  const res  = await fetch(`${base}/api/portfolio?per_page=12&is_published=1`, { cache: 'no-store' })
  if(!res.ok) return []
  const json = await res.json()
  return json?.data ?? []
}

export default async function Page(){
  const items = await getPortfolio()
  return <HomeClient items={items}/>
}
