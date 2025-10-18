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

const BASE = (process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8080').replace(/\/+$/, '');
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || `${BASE}/api`) as string;

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
  // пустое тело/не JSON
  return undefined as unknown as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Accept: 'application/json', ...authHeader() },
    cache: 'no-store',
  });
  return handleResponse<T>(res);
}

/**
 * JSON-запрос с возможностью передавать доп. заголовки (напр. X-Socket-Id).
 */
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

/**
 * multipart/form-data с авторизацией и доп. заголовками (напр. X-Socket-Id).
 */
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
  const url = new URL(`${BASE}/api/portfolio`);
  url.searchParams.set('service_type', service);
  url.searchParams.set('published', '1');
  url.searchParams.set('page', String(page));
  url.searchParams.set('per_page', String(perPage));

  const res = await fetch(url.toString(), { next: { revalidate } });
  if (!res.ok) throw new Error('Failed to load portfolio');
  return (await res.json()) as Paginated<Portfolio>;
}

import type { Portfolio as PortfolioItem } from '@/types/portfolio';
export async function fetchPortfolioItem(id: number) {
  return apiGet<PortfolioItem>(`/portfolio/${id}`);
}
