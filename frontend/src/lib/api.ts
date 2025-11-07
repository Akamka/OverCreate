// frontend/src/lib/api.ts

export type Paginated<T> = {
  data: T[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  links?: { url: string | null; label: string; active: boolean }[];
  meta?: { current_page: number; last_page: number; per_page: number; total: number };
};

export type Portfolio = {
  id: number;
  title: string;
  service_type: string;
  cover_url?: string | null;
  excerpt?: string | null;
  is_published: boolean;
  created_at?: string;
};

/** Корень бэкенда (БЕЗ /api). */
const BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV !== 'production' ? 'http://127.0.0.1:8080' : 'https://api.overcreate.co')
).replace(/\/+$/, '');

/** Корень API (С /api). */
export const API_URL = `${BASE}/api` as const;

/* ---------- токен ---------- */

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('token') || localStorage.getItem('token');
}

export function setToken(token: string, remember = true) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('token', token);
  if (remember) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

export function clearToken() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('token');
  localStorage.removeItem('token');
}

/** Заголовок авторизации */
export function authHeader(): Record<string, string> {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

/* ---------- универсальные запросы ---------- */

export interface HttpError extends Error {
  status?: number;
  data?: unknown;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const msg = `HTTP ${res.status}`;
    const contentType = res.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const json = (await res.json().catch(() => undefined)) as unknown;
      const serverMsg =
        json && typeof json === 'object' && 'message' in (json as Record<string, unknown>)
          ? String((json as Record<string, unknown>).message)
          : undefined;
      const err: HttpError = new Error(serverMsg || msg);
      err.status = res.status;
      err.data = json;
      throw err;
    }

    const text = await res.text().catch(() => '');
    const err: HttpError = new Error(text || msg);
    err.status = res.status;
    throw err;
  }

  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    return (await res.json()) as T;
  }
  return undefined as unknown as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Accept: 'application/json', ...authHeader() },
    cache: 'no-store',
  });
  return handleResponse<T>(res);
}

export async function apiSend<T>(
  path: string,
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  body?: unknown,
  extraHeaders?: Record<string, string>
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...authHeader(),
      ...(extraHeaders ?? {}),
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

export async function apiSendForm<T>(
  path: string,
  form: FormData,
  method: 'POST' | 'PUT' | 'PATCH' = 'POST',
  extraHeaders?: Record<string, string>
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...authHeader(),
      ...(extraHeaders ?? {}),
    },
    body: form,
  });
  return handleResponse<T>(res);
}

/* ---------- публичные запросы ---------- */

export async function fetchPortfolioByService(
  service: string,
  page = 1,
  perPage = 12,
  { revalidate = 60 }: { revalidate?: number } = {}
) {
  // ЯВНЫЙ абсолютный URL — никаких rewrites
  const url = `${BASE}/api/portfolio?service_type=${encodeURIComponent(service)}&published=1&page=${page}&per_page=${perPage}`;
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) throw new Error('Failed to load portfolio');
  return (await res.json()) as Paginated<Portfolio>;
}

import type { Portfolio as PortfolioItem } from '@/types/portfolio';
export async function fetchPortfolioItem(id: number) {
  return apiGet<PortfolioItem>(`/portfolio/${id}`);
}

/* ----------- blog public ----------- */
import type { Post } from '@/types/post';

export async function fetchPosts(
  page = 1,
  perPage = 10,
  opts: { revalidate?: number } = {}
) {
  try {
    // Используем абсолютный URL к API, а не относительный
    const url = new URL(`${API_URL}/posts`);
    url.searchParams.set('page', String(page));
    url.searchParams.set('per_page', String(perPage));

    console.log('>>> fetchPosts URL:', url.toString()); // для проверки

    const res = await fetch(url.toString(), {
      next: { revalidate: opts.revalidate ?? 120 },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.warn('fetchPosts non-OK:', res.status, text.slice(0, 200));
      return {
        data: [],
        meta: { current_page: page, last_page: 1, per_page: perPage, total: 0 },
      } as Paginated<Post>;
    }

    return (await res.json()) as Paginated<Post>;
  } catch (e) {
    console.error('fetchPosts failed:', e);
    return {
      data: [],
      meta: { current_page: page, last_page: 1, per_page: perPage, total: 0 },
    } as Paginated<Post>;
  }
}


/** Один пост по slug (публичный). */
export async function fetchPostBySlug(
  slug: string,
  opts: { revalidate?: number } = {}
) {
  // строим полный URL явно, а не через new URL('/…', API_URL),
  // чтобы не потерять /api
  const url = `${BASE}/api/posts/${encodeURIComponent(slug)}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: opts.revalidate ?? 300 },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.warn('fetchPostBySlug non-OK:', res.status, url, text.slice(0, 200));
      return null;
    }

    return (await res.json()) as Post;
  } catch (e) {
    console.error('fetchPostBySlug failed:', e);
    return null;
  }
}
