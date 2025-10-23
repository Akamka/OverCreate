// src/lib/portfolioMapping.ts
import type { Portfolio as ApiPortfolio } from '@/types/portfolio';
import type { ServicePortfolioItem } from '@/components/services/ServicePortfolio';
import { toMediaUrl } from '@/lib/mediaUrl';

export function mapApiToServiceItems(list: ApiPortfolio[]): ServicePortfolioItem[] {
  return (list || []).map((p) => ({
    id: p.id,
    title: p.title,
    cover_url: toMediaUrl(p.cover_url || ''), // на всякий случай нормализуем
    excerpt: p.excerpt ?? null,
    coverFit: 'cover', // можешь сменить на contain, если нужно
  }));
}
