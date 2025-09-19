// Базовый URL бэка, например: http://127.0.0.1:8080
const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:8080';

// Храним токен админки в .env админ-фронта или в localStorage
// Вариант 1 (рекомендуется в DEV): VITE_ADMIN_TOKEN в .env
const ADMIN_TOKEN_ENV = import.meta.env.VITE_ADMIN_TOKEN as string | undefined;

// Вариант 2 (ручной ввод в UI и сохранение в localStorage):
export function getAdminToken(): string | undefined {
  return ADMIN_TOKEN_ENV || localStorage.getItem('ADMIN_TOKEN') || undefined;
}

export async function adminFetch<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Admin-Token': token ?? '',
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(()=>'');
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
