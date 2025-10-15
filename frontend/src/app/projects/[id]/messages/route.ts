import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const API = process.env.BACKEND_API_URL!; // https://api.overcreate.co

function fwdHeaders(req: NextRequest) {
  const h = new Headers();
  const ct = req.headers.get('content-type');
  const au = req.headers.get('authorization');
  const ck = req.headers.get('cookie');
  if (ct) h.set('content-type', ct);
  if (au) h.set('authorization', au);
  if (ck) h.set('cookie', ck);
  return h;
}

async function proxy(req: NextRequest, path: string) {
  if (!API) return new Response('API not configured', { status: 503 });

  const src = new URL(req.url);
  const target = `${API}${path}${src.search}`;

  const init: RequestInit = {
    method: req.method,
    headers: fwdHeaders(req),
    body: (req.method === 'GET' || req.method === 'HEAD') ? undefined : await req.arrayBuffer(),
    cache: 'no-store',
  };

  const r = await fetch(target, init);

  const out = new Headers();
  const ct = r.headers.get('content-type'); if (ct) out.set('content-type', ct);
  const sc = r.headers.get('set-cookie');  if (sc) out.set('set-cookie', sc);

  return new Response(await r.arrayBuffer(), { status: r.status, headers: out });
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return proxy(req, `/projects/${id}/messages`);
}
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return proxy(req, `/projects/${id}/messages`);
}
