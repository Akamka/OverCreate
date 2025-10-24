// app/api/media/portfolio/[id]/cover/route.ts
import type { NextRequest } from "next/server";

/**
 * Прокси-роут для стабильной раздачи обложек портфолио.
 * Нужна переменная окружения:
 *   API_BASE="https://api.overcreate.co"  // серверная
 */

export const revalidate = 0;            // без ISR кэша на уровне роута
export const dynamic = "force-dynamic"; // не статизировать

const API_BASE = process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE;

function toAbs(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (!API_BASE) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

// 👇 ключевое изменение — params: Promise<...> и await
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!API_BASE) {
    return new Response("API_BASE is not configured", { status: 500 });
  }

  const { id } = await ctx.params;

  // 1) Берём метаданные проекта
  const metaRes = await fetch(`${API_BASE}/api/portfolio/${id}`, {
    cache: "no-store",
    // headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
  });

  if (!metaRes.ok) {
    return new Response("Portfolio item not found", { status: 404 });
  }

  const json = await metaRes.json().catch(() => ({}));
  const item = json?.data ?? json;

  const coverSrc: string | undefined =
    item?.cover_url ?? item?.coverUrl ?? item?.cover ?? undefined;

  if (!coverSrc && item?.cover_key) {
    // Если приходит ключ — здесь можно собрать URL получения файла по ключу
    // coverSrc = `${API_BASE}/api/media/by-key/${encodeURIComponent(item.cover_key)}`;
  }

  if (!coverSrc) {
    return new Response("Cover not configured", { status: 404 });
  }

  const abs = toAbs(String(coverSrc));

  // 2) Тянем файл и проксируем поток наружу
  const imgRes = await fetch(abs, { cache: "no-store" });
  if (!imgRes.ok || !imgRes.body) {
    return new Response("Cover fetch failed", { status: 404 });
  }

  const contentType = imgRes.headers.get("content-type") ?? "image/jpeg";
  const etag = imgRes.headers.get("etag") ?? undefined;
  const lastMod = imgRes.headers.get("last-modified") ?? undefined;

  const headers = new Headers();
  headers.set("Content-Type", contentType);
  headers.set(
    "Cache-Control",
    // браузер — сразу; CDN — сутки; SWR — неделя
    "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800"
  );
  if (etag) headers.set("ETag", etag.replaceAll('"', ""));
  if (lastMod) headers.set("Last-Modified", lastMod);

  return new Response(imgRes.body, { status: 200, headers });
}
