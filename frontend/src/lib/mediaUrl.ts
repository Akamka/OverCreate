// src/lib/mediaUrl.ts
/**
 * Делает абсолютный URL для картинки из API:
 * - оставляет https://... как есть
 * - склеивает относительные пути с базой API
 * - нормализует BASE (без /api и без хвостовых слэшей)
 */
const RAW_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  'https://api.overcreate.co';

// убираем хвост /api, чтобы BASE указывал на корень домена (нужно для /storage и /api/media)
const BASE = RAW_BASE.replace(/\/+$/, '').replace(/\/api$/i, '');

export function toMediaUrl(u?: string | null): string | undefined {
  if (!u) return undefined;
  // уже абсолютный URL
  if (/^https?:\/\//i.test(u)) return u;

  // нормализуем относительные варианты
  if (u.startsWith('//')) return `https:${u}`;
  if (u.startsWith('/'))  return `${BASE}${u}`;
  return `${BASE}/${u}`;
}
