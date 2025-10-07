// src/lib/seo.ts
export const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/+$/, '') || 'http://localhost:3000';

export function absUrl(path = '/') {
  const p = path.startsWith('/') ? path : `/${path}`;
  return new URL(p, SITE_URL).toString();
}

export function alternatesFor(pathname: string) {
  return { canonical: absUrl(pathname) };
}

export function jsonLd<T extends object>(data: T) {
  return { __html: JSON.stringify(data) };
}
