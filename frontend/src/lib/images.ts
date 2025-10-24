// src/lib/images.ts
// Нормализация ссылок для картинок/медиа

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/+$/, '');

/** Принудительно переводим http→https для нашего API-домена */
function forceHttpsForOvercreate(u: URL) {
  if (u.hostname === 'api.overcreate.co' && u.protocol !== 'https:') {
    u.protocol = 'https:';
  }
}

/** Если адрес с api.overcreate.co — возвращаем только путь,
 * чтобы браузер ходил на /storage/... через наш rewrite (без CORS) */
function stripOriginIfApiOvercreate(u: URL): string {
  if (u.hostname === 'api.overcreate.co') {
    return u.pathname + (u.search || '');
  }
  return u.toString();
}

/** Убираем лишний префикс /api/ перед /storage/ или /uploads/ */
function stripApiPrefixPath(path: string) {
  return path.replace(/^\/api\/(storage\/|uploads\/)/i, '/$1');
}

/** Если передали ссылку вида "/_next/image?url=..." — достаём исходный url */
function unwrapNextImageUrl(s: string): string {
  try {
    if (/^https?:\/\//i.test(s)) {
      const u = new URL(s);
      if (u.pathname.includes('/_next/image')) {
        const inner = u.searchParams.get('url');
        if (inner) return decodeURIComponent(inner);
      }
      return s;
    }
    if (s.startsWith('/_next/image')) {
      const idx = s.indexOf('?');
      if (idx >= 0) {
        const qs = new URLSearchParams(s.slice(idx + 1));
        const inner = qs.get('url');
        if (inner) return decodeURIComponent(inner);
      }
    }
  } catch {}
  return s;
}

export function safeImageSrc(
  src?: string | null,
  fallback: string = '/placeholder.svg'
): string {
  if (!src || typeof src !== 'string') return fallback;

  let s = src.trim().replace(/\\/g, '/');

  s = unwrapNextImageUrl(s);

  if (/^(data:|blob:)/i.test(s)) return s;

  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s);
      u.pathname = stripApiPrefixPath(u.pathname);
      forceHttpsForOvercreate(u);
      // ключ: убираем origin для нашего API-домена → вернётся /storage/...
      return stripOriginIfApiOvercreate(u);
    } catch {
      // упадём ниже
    }
  }

  if (s.startsWith('/')) {
    s = stripApiPrefixPath(s);
    return s;
  }

  s = s.replace(/^api\//i, '');     // "api/storage/..." -> "storage/..."
  s = stripApiPrefixPath('/' + s);

  if (API_BASE) return `${API_BASE}${s}`;
  return fallback;
}

/** Внешний ли URL (не /public) — для решения, пускать ли через оптимизатор Next */
export function isExternalUrl(u: string): boolean {
  return /^https?:\/\//i.test(u);
}
