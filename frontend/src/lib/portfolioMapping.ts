// src/lib/portfolioMapping.ts
import type { Portfolio as ApiPortfolio } from '@/types/portfolio';
import { toMediaUrl } from '@/lib/mediaUrl';

/**
 * Минимальный тип, совместимый с ServicePortfolio.items.
 * НИЧЕГО не импортируем из компонентов, чтобы сборка не падала.
 */
export type MappedPortfolioItem = {
  id: number | string;
  title: string;
  cover_url?: string | null;
  excerpt?: string | null;
  coverFit?: 'cover' | 'contain';
};

/** Маппинг API → данные для карусели */
export function mapApiToServiceItems(list: ApiPortfolio[]): MappedPortfolioItem[] {
  return (list ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    cover_url: p.cover_url ? toMediaUrl(p.cover_url) : null,
    excerpt: p.excerpt ?? null,
    coverFit: 'cover',
  }));
}
