// src/lib/images.ts
// Safe src normalizer for <Image />

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/+$/, '');

export function safeImageSrc(
  src?: string | null,
  fallback: string = '/placeholder.svg'
): string {
  if (!src || typeof src !== 'string') return fallback;

  // trim + convert backslashes
  const s = src.trim().replace(/\\/g, '/');

  // absolute?
  if (/^(https?:|data:|blob:)/i.test(s)) return s;

  // asset from public/
  if (s.startsWith('/')) return s;

  // relative from API
  if (API_BASE) return `${API_BASE}/${s.replace(/^\/+/, '')}`;

  // fallback
  return fallback;
}
