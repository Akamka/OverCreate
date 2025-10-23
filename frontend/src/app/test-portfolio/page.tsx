// app/test-portfolio/page.tsx
import ServicePortfolio from '@/components/services/ServicePortfolio';
import { mapApiToServiceItems } from '@/lib/portfolioMapping';

// Делаем страницу динамической, чтобы Next её не экспортировал статически
export const dynamic = 'force-dynamic'; // альтернативно: export const revalidate = 0;

async function loadItems() {
  try {
    const BASE =
      process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') ||
      process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, '') ||
      'https://api.overcreate.co';

    const url = new URL(`${BASE}/api/portfolio`);
    url.searchParams.set('published', '1');
    url.searchParams.set('per_page', '12');
    // при желании можно включить конкретный сервис:
    // url.searchParams.set('service_type', 'motion');

    // no-store, чтобы точно ушёл запрос на сервере
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
        items={items}
        accentFrom={[255, 80, 180]}
        accentTo={[120, 140, 255]}
      />
    </main>
  );
}
