// frontend/src/lib/api.ts

export type Paginated<T> = {
  data: T[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  // для Laravel pagination через links/meta тоже пригодится
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

const BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8080';
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || `${BASE}/api`) as string;

/* ---------- токен и заголовки ---------- */

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  // приоритет — sessionStorage (у каждой вкладки своё)
  return sessionStorage.getItem('token') || localStorage.getItem('token');
}

export function setToken(token: string, remember = false) {
  if (typeof window === 'undefined') return;
  if (remember) {
    localStorage.setItem('token', token);
  } else {
    sessionStorage.setItem('token', token);
    // чтобы другие вкладки не “подхватили” общий токен
    localStorage.removeItem('token');
  }
}

export function clearToken() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('token');
  localStorage.removeItem('token');
}

function authHeader(): Record<string, string> {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

/* ---------- универсальные запросы ---------- */

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Accept: 'application/json', ...authHeader() },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export async function apiSend<T>(path: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...authHeader(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

/* ---------- примеры публичных запросов ---------- */

export async function fetchPortfolioByService(
  service: string,
  page = 1,
  perPage = 12,
  { revalidate = 60 }: { revalidate?: number } = {}
) {
  const url = new URL(`${BASE}/api/portfolio`);
  url.searchParams.set('service_type', service);
  url.searchParams.set('is_published', '1');
  url.searchParams.set('page', String(page));
  url.searchParams.set('per_page', String(perPage));

  const res = await fetch(url.toString(), { next: { revalidate } });
  if (!res.ok) throw new Error('Failed to load portfolio');
  return (await res.json()) as Paginated<Portfolio>;
}
