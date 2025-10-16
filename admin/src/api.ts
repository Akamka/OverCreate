// src/lib/adminApi.ts
import type { Paginated, PortfolioItem, ServiceSlug } from "../src/types";

/* ====== BASE из env (без localhost в проде) ====== */
const RAW_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  (import.meta.env.VITE_API_BASE as string | undefined) ??
  "http://127.0.0.1:8080";

// убираем хвосты
const BASE = RAW_BASE.replace(/\/+$/, "").replace(/\/api$/i, "");
const API  = `${BASE}/api`;

// helper: гарантирует, что НЕ будет /api/api/*
function joinApi(path: string) {
  const clean = path.replace(/^\/+/, "");
  const withoutApi = clean.startsWith("api/") ? clean.slice(4) : clean;
  return `${API}/${withoutApi}`;
}

/* ====== token ====== */
const ADMIN_TOKEN_ENV =
  (import.meta.env.VITE_ADMIN_TOKEN as string | undefined) ??
  (import.meta.env.VITE_DEFAULT_ADMIN_TOKEN as string | undefined);

export function getAdminToken(): string | undefined {
  return (
    ADMIN_TOKEN_ENV ||
    localStorage.getItem("ADMIN_TOKEN") ||
    localStorage.getItem("token") ||
    undefined
  );
}

export function requireAdminToken(): string {
  const t = getAdminToken();
  if (!t) {
    throw new Error(
      "Missing admin token. Set VITE_ADMIN_TOKEN или VITE_DEFAULT_ADMIN_TOKEN (либо localStorage.ADMIN_TOKEN)"
    );
  }
  return t;
}

/* ====== fetch-хелперы ====== */
export async function adminFetch<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = requireAdminToken();
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
  const token = requireAdminToken();
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

/* ====== Portfolio API ====== */

export type PortfolioCreatePayload = {
  title: string;
  service_type: ServiceSlug | string;
  slug?: string;
  cover?: File | null;
  gallery_files?: File[] | null;
  cover_url?: string | null;
  gallery?: string[] | null;
  client?: string | null;
  tags?: string | null;
  excerpt?: string | null;
  body?: string | null;
  is_published?: boolean;
  is_featured?: boolean;
  sort_order?: number;
  meta_title?: string | null;
  meta_description?: string | null;
};
export type PortfolioUpdatePayload = Partial<PortfolioCreatePayload>;

export async function adminListPortfolio(params: {
  page?: number;
  per_page?: number;
  service_type?: ServiceSlug | string;
  published?: boolean;
}): Promise<Paginated<PortfolioItem>> {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.per_page) q.set("per_page", String(params.per_page));
  if (params.service_type) q.set("service_type", String(params.service_type));
  if (typeof params.published === "boolean")
    q.set("published", params.published ? "1" : "0");
  // ВАЖНО: без /api в начале
  return adminFetch<Paginated<PortfolioItem>>(`portfolio?${q.toString()}`);
}

export async function adminCreatePortfolio(
  payload: PortfolioCreatePayload
): Promise<PortfolioItem> {
  const fd = new FormData();
  fd.set("title", payload.title);
  fd.set("service_type", String(payload.service_type));
  if (payload.slug) fd.set("slug", payload.slug);
  if (payload.cover) fd.set("cover", payload.cover);
  if (payload.cover_url) fd.set("cover_url", payload.cover_url);
  payload.gallery_files?.forEach((f) => fd.append("gallery_files[]", f));
  payload.gallery?.forEach((u) => fd.append("gallery[]", u));
  if (payload.client) fd.set("client", payload.client);
  if (payload.tags) fd.set("tags", payload.tags);
  if (payload.excerpt) fd.set("excerpt", payload.excerpt);
  if (payload.body) fd.set("body", payload.body);
  if (typeof payload.is_published === "boolean")
    fd.set("is_published", payload.is_published ? "1" : "0");
  if (typeof payload.is_featured === "boolean")
    fd.set("is_featured", payload.is_featured ? "1" : "0");
  if (typeof payload.sort_order === "number")
    fd.set("sort_order", String(payload.sort_order));
  if (payload.meta_title) fd.set("meta_title", payload.meta_title);
  if (payload.meta_description)
    fd.set("meta_description", payload.meta_description);

  return adminFetchForm<PortfolioItem>("admin/portfolio", fd, "POST");
}

export async function adminUpdatePortfolio(
  id: number,
  patch: PortfolioUpdatePayload
): Promise<PortfolioItem> {
  const fd = new FormData();
  if (patch.title) fd.set("title", patch.title);
  if (patch.service_type) fd.set("service_type", String(patch.service_type));
  if (patch.slug) fd.set("slug", patch.slug);
  if (patch.cover) fd.set("cover", patch.cover);
  if (patch.cover_url) fd.set("cover_url", patch.cover_url);
  patch.gallery_files?.forEach((f) => fd.append("gallery_files[]", f));
  patch.gallery?.forEach((u) => fd.append("gallery[]", u));
  if (patch.client) fd.set("client", patch.client);
  if (patch.tags) fd.set("tags", patch.tags);
  if (patch.excerpt) fd.set("excerpt", patch.excerpt);
  if (patch.body) fd.set("body", patch.body);
  if (typeof patch.is_published === "boolean")
    fd.set("is_published", patch.is_published ? "1" : "0");
  if (typeof patch.is_featured === "boolean")
    fd.set("is_featured", patch.is_featured ? "1" : "0");
  if (typeof patch.sort_order === "number")
    fd.set("sort_order", String(patch.sort_order));
  if (patch.meta_title) fd.set("meta_title", patch.meta_title);
  if (patch.meta_description) fd.set("meta_description", patch.meta_description);

  fd.set("_method", "PATCH");
  return adminFetchForm<PortfolioItem>(`admin/portfolio/${id}`, fd, "POST");
}

export async function adminDeletePortfolio(id: number): Promise<void> {
  await adminFetch<void>(`admin/portfolio/${id}`, { method: "DELETE" });
}
