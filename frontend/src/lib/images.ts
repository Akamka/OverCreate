// src/lib/images.ts
// Нормализация ссылок для картинок/медиа

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/+$/, '');

/** Принудительно переводим http→https для нашего API-домена */
function forceHttpsForOvercreate(u: URL) {
  if (u.hostname === 'api.overcreate.co' && u.protocol !== 'https:') {
    u.protocol = 'https:';
  }
}

/** Убираем лишний префикс /api/ перед /storage/ или /uploads/ */
function stripApiPrefixPath(path: string) {
  return path.replace(/^\/api\/(storage\/|uploads\/)/i, '/$1');
}

/** Если передали ссылку вида "/_next/image?url=..." — достаём исходный url */
function unwrapNextImageUrl(s: string): string {
  try {
    // абсолютный
    if (/^https?:\/\//i.test(s)) {
      const u = new URL(s);
      if (u.pathname.includes('/_next/image')) {
        const inner = u.searchParams.get('url');
        if (inner) return decodeURIComponent(inner);
      }
      return s;
    }
    // относительный
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

  // trim + normalize slashes
  let s = src.trim().replace(/\\/g, '/');

  // Разворачиваем вложенный /_next/image
  s = unwrapNextImageUrl(s);

  // data/blob: как есть
  if (/^(data:|blob:)/i.test(s)) return s;

  // абсолютный URL?
  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s);
      u.pathname = stripApiPrefixPath(u.pathname);
      forceHttpsForOvercreate(u);
      return u.toString();
    } catch {
      // если парсинг не удался — ниже обработаем как относительный
    }
  }

  // путь из public/
  if (s.startsWith('/')) {
    s = stripApiPrefixPath(s);
    return s;
  }

  // относительный путь от API
  s = s.replace(/^api\//i, '');        // "api/storage/..." -> "storage/..."
  s = stripApiPrefixPath('/' + s);     // добавим слеш + уберём "/api/" если есть

  if (API_BASE) return `${API_BASE}${s}`;

  return fallback;
}

/** Внешний ли URL (не /public) — для решения, пускать ли через оптимизатор Next */
export function isExternalUrl(u: string): boolean {
  return /^https?:\/\//i.test(u);
}
