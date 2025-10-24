// app/api/media/portfolio/[id]/cover/route.ts
import type { NextRequest } from "next/server";

export const revalidate = 0;            // не кэшируем на ISR-уровне
export const dynamic = "force-dynamic"; // всегда динамический

const API_BASE = process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE;

/**
 * Самый простой и стабильный путь:
 * напрямую проксируем файл с /api/portfolio/:id/cover на бекенде.
 * Без дополнительного запроса метаданных.
 */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!API_BASE) {
    return new Response("API_BASE is not configured", { status: 500 });
  }

  const { id } = await ctx.params;

  // 1) Пробуем «правильный» эндпоинт cover на твоём API
  const src = `${API_BASE.replace(/\/$/, "")}/api/portfolio/${encodeURIComponent(
    id
  )}/cover`;

  const upstream = await fetch(src, {
    cache: "no-store",
    // Если нужен токен:
    // headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
  });

  if (!upstream.ok || !upstream.body) {
    // Для отладки вернём статус и текст
    return new Response(
      `Cover fetch failed: ${upstream.status} ${upstream.statusText}`,
      { status: 404 }
    );
  }

  const headers = new Headers();
  headers.set("Content-Type", upstream.headers.get("content-type") ?? "image/jpeg");
  headers.set(
    "Cache-Control",
    "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800"
  );
  const etag = upstream.headers.get("etag");
  const lastMod = upstream.headers.get("last-modified");
  if (etag) headers.set("ETag", etag.replaceAll('"', ""));
  if (lastMod) headers.set("Last-Modified", lastMod);

  return new Response(upstream.body, { status: 200, headers });
}
