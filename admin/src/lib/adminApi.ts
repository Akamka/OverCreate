import type {
  Paginated,
  PortfolioItem,
  ServiceSlug,
  ContactSubmission,
  Project,
  User,
  ContactStatus,
  Post,
} from "../types";

/* ================= BASE ================= */

const { VITE_API_BASE_URL, VITE_API_BASE } = import.meta.env;

export const API_BASE: string =
  (VITE_API_BASE_URL && VITE_API_BASE_URL.trim()) ||
  (VITE_API_BASE && VITE_API_BASE.trim()) ||
  "http://127.0.0.1:8080";

/* ========== TOKEN: только в памяти (без env и без localStorage) ========== */

let ADMIN_TOKEN_RUNTIME: string | undefined;

export function getSavedToken(): string | undefined {
  return ADMIN_TOKEN_RUNTIME;
}
export function saveAdminToken(t: string): void {
  ADMIN_TOKEN_RUNTIME = t?.trim() || undefined;
}
export function clearAdminToken(): void {
  ADMIN_TOKEN_RUNTIME = undefined;
}

/** Лёгкая проверка токена на бэке (true — валиден, false — нет). */
export async function checkAdminToken(token: string): Promise<boolean> {
  // Проверяем токен тем же путём, что и все админ-вызовы
  const prev = getSavedToken();
  let ok = false;

  try {
    saveAdminToken(token); // временно подставляем
    // лёгкий вызов в админке; можно заменить на /api/admin/ping если есть
    await adminFetch<unknown>("/api/admin/users?per_page=1");
    ok = true;
  } catch {
    ok = false;
  } finally {
    // возвращаем прежнее состояние
    clearAdminToken();
    if (prev) saveAdminToken(prev);
  }

  return ok;
}


function requireToken(): string {
  const t = getSavedToken();
  if (!t) {
    throw new Error("Missing admin token. Введите токен для доступа в админку.");
  }
  return t;
}

/* ================= низкоуровневый fetch ================= */

async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = requireToken();

  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Admin-Token": token,
    ...(init.headers as Record<string, string> | undefined),
  };
  // Если тело не FormData — ставим JSON Content-Type (если не задан)
  if (!(init.body instanceof FormData) && !("Content-Type" in headers)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 401 || res.status === 403) {
      clearAdminToken(); // сбрасываем токен при неавторизованности
    }
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

async function adminFetchForm<T>(
  path: string,
  form: FormData,
  method: "POST" | "PUT" | "PATCH" = "POST"
): Promise<T> {
  const token = requireToken();

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { Accept: "application/json", "X-Admin-Token": token }, // Content-Type для FormData выставит браузер
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 401 || res.status === 403) {
      clearAdminToken();
    }
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/* ================= helpers ================= */

export function toCSV(rows: ReadonlyArray<Record<string, unknown>>): string {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]) as string[];

  const esc = (v: unknown): string => {
    const s = v == null ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const head = keys.join(";");
  const body = rows
    .map((r) => keys.map((k) => esc(r[k as keyof typeof r])).join(";"))
    .join("\n");

  return `${head}\n${body}`;
}

/* ================= PORTFOLIO ================= */

export type PortfolioCreatePayload = {
  title: string;
  service_type: ServiceSlug | string;
  slug?: string;

  // изображения/галерея
  cover?: File | null;
  gallery_files?: File[] | null;
  cover_url?: string | null;
  gallery?: string[] | null;

  // видео (YouTube)
  video_url?: string | null;

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

  // список берём с публичного /api/portfolio (админ-роута для index нет)
  return adminFetch<Paginated<PortfolioItem>>(`/api/portfolio?${q.toString()}`);
}

export async function adminCreatePortfolio(
  payload: PortfolioCreatePayload
): Promise<PortfolioItem> {
  const fd = new FormData();
  fd.set("title", payload.title);
  fd.set("service_type", String(payload.service_type));
  if (payload.slug) fd.set("slug", payload.slug);

  // видео: если есть — шлём video_url и НЕ отправляем галерею
  if (payload.video_url) {
    fd.set("video_url", payload.video_url);
  }

  // обложку можно присылать всегда (и с видео тоже — для превью)
  if (payload.cover) fd.set("cover", payload.cover);
  if (payload.cover_url) fd.set("cover_url", payload.cover_url);

  // галерею отправляем только если нет видео
  if (!payload.video_url) {
    if (payload.gallery_files?.length)
      payload.gallery_files.forEach((f) => fd.append("gallery_files[]", f));
    if (payload.gallery?.length)
      payload.gallery.forEach((u) => fd.append("gallery[]", u));
  }

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
  if (payload.meta_description) fd.set("meta_description", payload.meta_description);

  return adminFetchForm<PortfolioItem>("/api/admin/portfolio", fd, "POST");
}

export async function adminUpdatePortfolio(
  id: number,
  patch: PortfolioUpdatePayload
): Promise<PortfolioItem> {
  const fd = new FormData();

  if (patch.title) fd.set("title", patch.title);
  if (patch.service_type) fd.set("service_type", String(patch.service_type));
  if (patch.slug) fd.set("slug", patch.slug);

  // video_url: если ключ присутствует — изменяем/очищаем ("" = очистка)
  if (typeof patch.video_url !== "undefined") {
    fd.set("video_url", patch.video_url ?? "");
  }

  // обложку можно отправлять всегда
  if (patch.cover) fd.set("cover", patch.cover);
  if (patch.cover_url) fd.set("cover_url", patch.cover_url);

  // галерею отправляем только если video_url не присылается ИЛИ присылается как пустая строка
  const willChangeVideo =
    typeof patch.video_url !== "undefined" && !!(patch.video_url && patch.video_url.trim());

  if (!willChangeVideo) {
    if (patch.gallery_files?.length)
      patch.gallery_files.forEach((f) => fd.append("gallery_files[]", f));
    if (patch.gallery?.length)
      patch.gallery.forEach((u) => fd.append("gallery[]", u));
  }

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
  return adminFetchForm<PortfolioItem>(`/api/admin/portfolio/${id}`, fd, "POST");
}

export async function adminDeletePortfolio(id: number): Promise<void> {
  await adminFetch<void>(`/api/admin/portfolio/${id}`, { method: "DELETE" });
}

/* ======== CONTACT SUBMISSIONS ======== */

// список (публичный роут, без /admin, поэтому токен не нужен)
// Оставляем текущую реализацию через adminFetch, чтобы не менять остальную логику
export async function listContactSubmissions(
  _tokenOrUndefined?: string,
  pageUrl?: string
): Promise<Paginated<ContactSubmission>> {
  if (pageUrl) {
    const u = new URL(pageUrl);
    return adminFetch<Paginated<ContactSubmission>>(u.pathname + u.search);
  }
  return adminFetch<Paginated<ContactSubmission>>(`/api/contact-submissions`);
}

// обновление статуса — админ-роут
export async function adminUpdateContactStatus(
  id: number,
  status: ContactStatus
): Promise<ContactSubmission> {
  return adminFetch<ContactSubmission>(`/api/admin/contact-submissions/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// удаление — админ-роут
export async function adminDeleteContact(id: number): Promise<void> {
  await adminFetch<void>(`/api/admin/contact-submissions/${id}`, {
    method: "DELETE",
  });
}

// массовое удаление — простая обёртка
export async function adminBulkDeleteContacts(ids: number[]): Promise<void> {
  for (const id of ids) {
    // eslint-disable-next-line no-await-in-loop
    await adminDeleteContact(id);
  }
}

/* ================= USERS ================= */

export async function adminListUsers(
  _token: string,
  params: { q?: string; role?: User["role"]; page?: number; per_page?: number }
): Promise<Paginated<User>> {
  const q = new URLSearchParams();
  if (params.q) q.set("q", params.q);
  if (params.role) q.set("role", params.role);
  if (params.page) q.set("page", String(params.page));
  if (params.per_page) q.set("per_page", String(params.per_page));
  return adminFetch<Paginated<User>>(`/api/admin/users?${q.toString()}`);
}

export async function adminUpdateUserRole(
  _token: string,
  id: number,
  role: User["role"]
): Promise<User> {
  return adminFetch<User>(`/api/admin/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export async function adminDeleteUser(_token: string, id: number): Promise<void> {
  await adminFetch<void>(`/api/admin/users/${id}`, { method: "DELETE" });
}

export async function adminListStaff(_token: string): Promise<User[]> {
  const res = await adminListUsers(_token, { role: "staff", page: 1 });
  return res.data ?? [];
}

/* ================= PROJECTS ================= */

export async function adminListProjects(
  _token: string,
  params: { q?: string; page?: number; per_page?: number }
): Promise<Paginated<Project>> {
  const q = new URLSearchParams();
  if (params.q) q.set("q", params.q);
  if (params.page) q.set("page", String(params.page));
  if (params.per_page) q.set("per_page", String(params.per_page));
  return adminFetch<Paginated<Project>>(`/api/admin/projects?${q.toString()}`);
}

export async function adminCreateProject(
  _token: string,
  patch: Partial<Project>
): Promise<Project> {
  return adminFetch<Project>(`/api/admin/projects`, {
    method: "POST",
    body: JSON.stringify(patch),
  });
}

export async function adminUpdateProject(
  _token: string,
  id: number,
  patch: Partial<Project>
): Promise<Project> {
  return adminFetch<Project>(`/api/admin/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function adminDeleteProject(_token: string, id: number): Promise<void> {
  await adminFetch<void>(`/api/admin/projects/${id}`, { method: "DELETE" });
}





/* ================= POSTS (BLOG) ================= */


export async function adminListPosts(params: {
  page?: number; per_page?: number; q?: string;
}): Promise<Paginated<Post>> {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.per_page) q.set("per_page", String(params.per_page));
  if (params.q) q.set("q", params.q);
  return adminFetch<Paginated<Post>>(`/api/admin/posts?${q.toString()}`);
}

export async function adminShowPost(id: number): Promise<Post> {
  return adminFetch<Post>(`/api/admin/posts/${id}`);
}

export async function adminCreatePost(payload: Partial<Post>): Promise<Post> {
  return adminFetch<Post>(`/api/admin/posts`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function adminUpdatePost(id: number, patch: Partial<Post>): Promise<Post> {
  return adminFetch<Post>(`/api/admin/posts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function adminDeletePost(id: number): Promise<void> {
  await adminFetch<void>(`/api/admin/posts/${id}`, { method: "DELETE" });
}
