// src/lib/images.ts
// Safe src normalizer for <Image /> + вложения (audio/video/links)

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/+$/, '');

/** Принудительно переводим http→https для нашего API-домена */
function forceHttpsForOvercreate(u: URL) {
  if (u.hostname === 'api.overcreate.co' && u.protocol !== 'https:') {
    u.protocol = 'https:';
  }
}

/** Убираем лишний префикс /api/ перед /storage/ или /uploads/ */
function stripApiPrefixPath(path: string) {
  // /api/storage/... -> /storage/...
  // /api/uploads/... -> /uploads/...
  return path.replace(/^\/api\/(storage\/|uploads\/)/i, '/$1');
}

export function safeImageSrc(
  src?: string | null,
  fallback: string = '/placeholder.svg'
): string {
  if (!src || typeof src !== 'string') return fallback;

  // trim + normalize slashes
  let s = src.trim().replace(/\\/g, '/');

  // data/blob: пропускаем как есть
  if (/^(data:|blob:)/i.test(s)) return s;

  // абсолютный URL?
  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s);
      // режем лишний /api/ в пути
      u.pathname = stripApiPrefixPath(u.pathname);
      // https для api.overcreate.co
      forceHttpsForOvercreate(u);
      return u.toString();
    } catch {
      // если парсинг не удался — попробуем как относительный ниже
    }
  }

  // путь из public/
  if (s.startsWith('/')) {
    s = stripApiPrefixPath(s);
    return s;
  }

  // относительный путь от API (например: "storage/...", "/storage/...", "api/storage/...")
  s = s.replace(/^api\//i, '');        // "api/storage/..." -> "storage/..."
  s = stripApiPrefixPath('/' + s);     // гарантируем ведущий слеш и режем "/api/" если есть

  if (API_BASE) return `${API_BASE}${s}`;

  return fallback;
}
