// src/lib/images.ts
// Safe src normalizer for <Image /> + вложения (audio/video/a)

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/+$/, '');

/** приведение схемы к https для нашего API-домена */
function forceHttpsForOvercreate(u: URL) {
  if (u.hostname === 'api.overcreate.co' && u.protocol !== 'https:') {
    u.protocol = 'https:';
  }
}

/** убираем лишний /api/ перед /storage/ */
function stripApiPrefixPath(path: string) {
  // /api/storage/... -> /storage/...
  return path.replace(/^\/api\/(storage\/|uploads\/)/i, '/$1');
}

export function safeImageSrc(
  src?: string | null,
  fallback: string = '/placeholder.svg'
): string {
  if (!src || typeof src !== 'string') return fallback;

  // trim + convert backslashes
  let s = src.trim().replace(/\\/g, '/');

  // data/blob: пропускаем как есть
  if (/^(data:|blob:)/i.test(s)) return s;

  // абсолютный URL?
  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s);

      // если путь начинается с /api/storage -> режем /api
      u.pathname = stripApiPrefixPath(u.pathname);

      // https для нашего домена
      forceHttpsForOvercreate(u);

      return u.toString();
    } catch {
      // если что-то не так с URL — свалимся ниже
    }
  }

  // путь из public/
  if (s.startsWith('/')) {
    s = stripApiPrefixPath(s);
    return s;
  }

  // относительный путь от API (storage/..., /storage/..., api/storage/...)
  s = s.replace(/^api\//i, ''); // api/storage/... -> storage/...
  s = stripApiPrefixPath('/' + s); // гарантируем ведущий слеш и режем /api/ если был
  if (API_BASE) {
    return `${API_BASE}${s}`;
  }

  return fallback;
}
