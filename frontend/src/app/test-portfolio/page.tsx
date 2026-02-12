// app/test-portfolio/page.tsx
import type { Metadata } from 'next';
import ServicePortfolio from '@/components/services/ServicePortfolio';
import { mapApiToServiceItems } from '@/lib/portfolioMapping';

// Делаем страницу динамической, чтобы Next не пытался её экспортировать статически
export const dynamic = 'force-dynamic'; // internal test route
export const metadata: Metadata = {
  title: 'Internal Test Portfolio',
  robots: { index: false, follow: false },
};

async function loadItems() {
  try {
    const BASE =
      process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') ||
      process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, '') ||
      'https://api.overcreate.co';

    const url = new URL(`${BASE}/api/portfolio`);
    url.searchParams.set('published', '1');
    url.searchParams.set('per_page', '12');
    // при необходимости можно зафиксировать сервис:
    // url.searchParams.set('service_type', 'motion');

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return mapApiToServiceItems(json?.data ?? []);
  } catch {
    return [];
  }
}

export default async function TestPortfolioPage() {
  const items = await loadItems();

  return (
    <main className="py-10">
      <ServicePortfolio
        title="Portfolio (smoke test)"
        subtitle={`Loaded ${items.length} items`}
        items={items}           // тип совместим структурно, импорт типов не нужен
        accentFrom={[255, 80, 180]}
        accentTo={[120, 140, 255]}
      />
    </main>
  );
}
