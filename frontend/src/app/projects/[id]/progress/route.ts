import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const API = process.env.BACKEND_API_URL; // = https://api.overcreate.co

function forwardHeaders(req: NextRequest) {
  const h = new Headers();
  const ctype = req.headers.get('content-type');
  const auth  = req.headers.get('authorization');
  const cookie = req.headers.get('cookie');
  if (ctype) h.set('content-type', ctype);
  if (auth)  h.set('authorization', auth);
  if (cookie) h.set('cookie', cookie);
  return h;
}

async function proxy(req: NextRequest, path: string) {
  if (!API) return new Response('API not configured', { status: 503 });

  const srcUrl = new URL(req.url);
  const target = `${API}${path}${srcUrl.search}`;

  const init: RequestInit = {
    method: req.method,
    headers: forwardHeaders(req),
    body: (req.method === 'GET' || req.method === 'HEAD') ? undefined : await req.arrayBuffer(),
    cache: 'no-store',
  };

  const r = await fetch(target, init);

  const outHeaders = new Headers();
  const ct = r.headers.get('content-type'); if (ct) outHeaders.set('content-type', ct);
  const sc = r.headers.get('set-cookie');  if (sc) outHeaders.set('set-cookie', sc);

  return new Response(await r.arrayBuffer(), { status: r.status, headers: outHeaders });
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return proxy(req, `/projects/${params.id}/progress`);
}
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return proxy(req, `/projects/${params.id}/progress`);
}
