import type { NextRequest } from 'next/server';

export const runtime = 'nodejs'; // не edge
const API = process.env.BACKEND_API_URL!; // напр. https://api.overcreate.co

function fwdHeaders(req: NextRequest) {
  const h = new Headers();
  // пробрасываем всё, что важно для авторизации
  const ct = req.headers.get('content-type');
  const au = req.headers.get('authorization');
  const ck = req.headers.get('cookie');
  const xr = req.headers.get('x-xsrf-token');
  if (ct) h.set('content-type', ct);
  if (au) h.set('authorization', au);
  if (ck) h.set('cookie', ck);
  if (xr) h.set('x-xsrf-token', xr);
  // многие бэки хотят явно JSON
  h.set('accept', 'application/json');
  return h;
}

export async function POST(req: NextRequest) {
  if (!API) return new Response('API not configured', { status: 503 });

  // строго проксируем на бэкендовый /broadcasting/auth
  const target = `${API}/broadcasting/auth`;

  const r = await fetch(target, {
    method: 'POST',
    headers: fwdHeaders(req),
    body: await req.arrayBuffer(),
    // прокси-роут не кэшируем
    cache: 'no-store',
    // если авторизация через куки Sanctum — иногда полезно:
    // credentials: 'include'  // (Next route сам по себе на том же домене, так что не обяз.)
  });

  const out = new Headers();
  const ct = r.headers.get('content-type'); if (ct) out.set('content-type', ct);
  const sc = r.headers.get('set-cookie');  if (sc) out.set('set-cookie', sc);

  const buf = await r.arrayBuffer();
  return new Response(buf, { status: r.status, headers: out });
}

// любые другие методы нам не нужны
export function GET()  { return new Response('Method Not Allowed', { status: 405 }); }
export function PUT()  { return new Response('Method Not Allowed', { status: 405 }); }
export function PATCH(){ return new Response('Method Not Allowed', { status: 405 }); }
export function DELETE(){return new Response('Method Not Allowed', { status: 405 }); }
