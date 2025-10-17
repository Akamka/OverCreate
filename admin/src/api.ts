// admin/src/api.ts
// Единый API-хелпер для admin-панели
export * from "./lib/adminApi";

const RAW_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  (import.meta.env.VITE_API_BASE as string | undefined) ??
  "http://127.0.0.1:8080";

const BASE = RAW_BASE.replace(/\/+$/, "").replace(/\/api$/i, "");
const API  = `${BASE}/api`;

// чтоб не получалось /api/api/*
function joinApi(path: string) {
  const clean = path.replace(/^\/+/, "");
  const withoutApi = clean.startsWith("api/") ? clean.slice(4) : clean;
  return `${API}/${withoutApi}`;
}

const ADMIN_TOKEN =
  (import.meta.env.VITE_ADMIN_TOKEN as string | undefined) ??
  (import.meta.env.VITE_DEFAULT_ADMIN_TOKEN as string | undefined) ??
  localStorage.getItem("ADMIN_TOKEN") ??
  localStorage.getItem("token") ??
  "";

function requireToken() {
  if (!ADMIN_TOKEN) {
    throw new Error(
      "Missing admin token: VITE_ADMIN_TOKEN / VITE_DEFAULT_ADMIN_TOKEN или localStorage.ADMIN_TOKEN"
    );
  }
  return ADMIN_TOKEN;
}

export async function adminFetch<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = requireToken();
  const url = joinApi(path);
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Admin-Token": token,
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status} at ${url}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function adminFetchForm<T = unknown>(
  path: string,
  form: FormData,
  method: "POST" | "PUT" | "PATCH" = "POST"
): Promise<T> {
  const token = requireToken();
  const url = joinApi(path);
  const res = await fetch(url, {
    method,
    headers: { Accept: "application/json", "X-Admin-Token": token },
    body: form,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status} at ${url}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/* ==== Готовые вызовы для разделов админки ==== */

// Users
export const listUsers = (qs: string) => adminFetch(`admin/users?${qs}`);

// Projects
export const listProjects = (qs: string) => adminFetch(`admin/projects?${qs}`);

// Contact submissions (заявки)
export const listContactSubmissions = (qs: string) =>
  adminFetch(`admin/contact-submissions?${qs}`);
