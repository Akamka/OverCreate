// app/api/media/portfolio/[id]/cover/route.ts
import { NextRequest } from "next/server";

/**
 * Прокси-роут для стабильной раздачи обложек портфолио.
 * По ID тянем JSON проекта с твоего API, берем cover_url/cover_key,
 * затем скачиваем файл и отдаём его с правильными cache-заголовками.
 *
 * Требуется переменная окружения:
 *   API_BASE="https://api.overcreate.co"            // приватная, только на сервере
 *   (если у тебя уже есть NEXT_PUBLIC_API_BASE — можно вместо неё,
 *    но лучше отдельную непубличную API_BASE)
 */

const API_BASE = process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE;

function toAbs(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (!API_BASE) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

export async function GET(
  _req: NextRequest,
  ctx: { params: { id: string } }
) {
  if (!API_BASE) {
    return new Response("API_BASE is not configured", { status: 500 });
  }

  const id = ctx.params.id;

  // 1) Берём метаданные одного проекта
  const metaRes = await fetch(`${API_BASE}/api/portfolio/${id}`, {
    // важен no-store, чтобы всегда видеть актуальный cover_url
    cache: "no-store",
    // если API требует авторизацию — добавь заголовок здесь:
    // headers: { Authorization: `Bearer ${process.env.API_TOKEN}` }
  });

  if (!metaRes.ok) {
    return new Response("Portfolio item not found", { status: 404 });
  }

  const json = await metaRes.json().catch(() => ({}));
  // Ожидаем одно из полей (адаптируй под свой ответ):
  //  - data.cover_url (относительная или абсолютная)
  //  - cover_url
  //  - cover_key (тогда должен быть эндпоинт, который по ключу даст файл)
  const item = json?.data ?? json;

  const coverSrc: string | undefined =
    item?.cover_url ??
    item?.coverUrl ??
    item?.cover ??
    undefined;

  if (!coverSrc && item?.cover_key) {
    // Если вместо URL приходит ключ — опционально подставь свой роут получения файла по ключу
    // coverSrc = `${API_BASE}/api/media/by-key/${encodeURIComponent(item.cover_key)}`;
  }

  if (!coverSrc) {
    return new Response("Cover not configured", { status: 404 });
  }

  const abs = toAbs(String(coverSrc));

  // 2) Тянем сам файл и проксируем поток наружу
  const imgRes = await fetch(abs, { cache: "no-store" });
  if (!imgRes.ok || !imgRes.body) {
    return new Response("Cover fetch failed", { status: 404 });
  }

  // Пробрасываем тип и часть заголовков, но свой Cache-Control
  const contentType = imgRes.headers.get("content-type") ?? "image/jpeg";
  const etag = imgRes.headers.get("etag") ?? undefined;
  const lastMod = imgRes.headers.get("last-modified") ?? undefined;

  const headers = new Headers();
  headers.set("Content-Type", contentType);
  headers.set(
    // браузеру — сразу; CDN — 1 день; SWR — неделя
    "Cache-Control",
    "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800"
  );
  if (etag) headers.set("ETag", etag.replaceAll('"', ""));
  if (lastMod) headers.set("Last-Modified", lastMod);

  return new Response(imgRes.body, { status: 200, headers });
}
