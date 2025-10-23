// src/app/test-portfolio/page.tsx (Next 13+ App Router)
// Если у тебя Pages Router — сделай pages/test-portfolio.tsx и убери `export const revalidate = ...`

import ServicePortfolio from '@/components/services/ServicePortfolio';
import { fetchPortfolioByService } from '@/lib/api';
import { mapApiToServiceItems } from '@/lib/portfolioMapping';

export const revalidate = 30; // ISR, можно убрать

export default async function TestPortfolioPage() {
  // 1) попробуем без фильтра по сервису — возьмём все опубликованные
  //    если нужно отфильтровать — замени на fetchPortfolioByService('motion', 1, 12)
  const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE || 'https://api.overcreate.co'}/api/portfolio`);
  url.searchParams.set('published', '1');
  url.searchParams.set('per_page', '12');
  // url.searchParams.set('service_type', 'motion'); // включи, если хочешь проверить конкретный сервис

  const res = await fetch(url.toString(), { next: { revalidate: 30 } });
  if (!res.ok) {
    return <div style={{ padding: 24, color: 'tomato' }}>API error: {res.status}</div>;
  }
  const data = await res.json(); // ожидаем структуру { data: [...] }
  const items = mapApiToServiceItems(data?.data ?? []);

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
