import type {
  ContactSubmission,
  Paginated,
  User,
  Project,
  ContactStatus,
} from "./types";

/* ===================== Базовые настройки ===================== */

const BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8080";
const TOKEN_KEY = "oc_admin_token";

/* ===================== Token helpers ===================== */

export function getSavedToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
export function saveToken(t: string) {
  localStorage.setItem(TOKEN_KEY, t);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function requireToken(): string {
  const t = getSavedToken();
  if (!t) throw new Error("Admin token is missing");
  return t;
}

/* ===================== HTTP helper ===================== */

async function requestJson<T>(
  url: string,
  adminToken: string,
  init?: RequestInit
): Promise<T> {
  const full = url.startsWith("http") ? url : `${BASE}${url}`;
  const res = await fetch(full, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Admin-Token": adminToken,
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.status === 204
    ? (undefined as unknown as T)
    : ((await res.json()) as T);
}

/* ===================== Contacts (заявки) ===================== */

/** Список заявок (совместимо с абсолютным URL пагинации) */
export async function listContactSubmissions(
  adminToken: string,
  url?: string
): Promise<Paginated<ContactSubmission> | ContactSubmission[]> {
  const path = url ?? "/api/contact-submissions";
  return requestJson(path, adminToken);
}

/** --- «админские» функции с явным токеном --- */
export function adminUpdateContactStatus(
  adminToken: string,
  id: number,
  status: ContactStatus
) {
  return requestJson<ContactSubmission>(
    `/api/admin/contact-submissions/${id}`,
    adminToken,
    { method: "PATCH", body: JSON.stringify({ status }) }
  );
}

export function adminDeleteContact(adminToken: string, id: number) {
  return requestJson<void>(
    `/api/admin/contact-submissions/${id}`,
    adminToken,
    { method: "DELETE" }
  );
}

export function adminBulkDeleteContacts(adminToken: string, ids: number[]) {
  return requestJson<{ deleted: number }>(
    `/api/admin/contact-submissions`,
    adminToken,
    { method: "DELETE", body: JSON.stringify({ ids }) }
  );
}

/** --- Совместимые «шорткаты» без токена (как у тебя в Table) --- */
export function contactUpdateStatus(id: number, status: ContactStatus) {
  const t = requireToken();
  return adminUpdateContactStatus(t, id, status);
}

export function contactDelete(id: number) {
  const t = requireToken();
  return adminDeleteContact(t, id);
}

export async function contactBulkDelete(ids: number[]) {
  const t = requireToken();
  return adminBulkDeleteContacts(t, ids);
}

/** Массовая смена статуса — серверного эндпоинта нет, делаем через Promise.all */
export async function contactBulkUpdateStatus(
  ids: number[],
  status: ContactStatus
): Promise<ContactSubmission[]> {
  const t = requireToken();
  const out = await Promise.all(
    ids.map((id) => adminUpdateContactStatus(t, id, status))
  );
  return out;
}

/* ===================== Users ===================== */

export function adminListUsers(
  token: string,
  params?: { q?: string; role?: string; page?: number }
) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.role) qs.set("role", params.role);
  if (params?.page) qs.set("page", String(params.page));
  const s = qs.toString() ? `?${qs}` : "";
  return requestJson<Paginated<User>>(`/api/admin/users${s}`, token);
}

export function adminUpdateUserRole(
  token: string,
  id: number,
  role: User["role"]
) {
  return requestJson<User>(`/api/admin/users/${id}/role`, token, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export function adminListStaff(token: string) {
  return requestJson<User[]>(`/api/admin/staff`, token);
}

/* ===================== Projects ===================== */

export function adminListProjects(
  token: string,
  params?: {
    q?: string;
    status?: Project["status"];
    user_id?: number;
    assignee_id?: number;
    page?: number;
  }
) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.status) qs.set("status", params.status);
  if (params?.user_id) qs.set("user_id", String(params.user_id));
  if (params?.assignee_id) qs.set("assignee_id", String(params.assignee_id));
  if (params?.page) qs.set("page", String(params.page));
  const s = qs.toString() ? `?${qs}` : "";
  return requestJson<Paginated<Project>>(`/api/admin/projects${s}`, token);
}

export function adminCreateProject(token: string, data: Partial<Project>) {
  return requestJson<Project>(`/api/admin/projects`, token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function adminUpdateProject(
  token: string,
  id: number,
  data: Partial<Project>
) {
  return requestJson<Project>(`/api/admin/projects/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function adminDeleteProject(token: string, id: number) {
  return requestJson<void>(`/api/admin/projects/${id}`, token, {
    method: "DELETE",
  });
}

/* ===================== CSV helper ===================== */

export function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${(v ?? "").toString().replace(/"/g, '""')}"`;
  return [
    headers.map(esc).join(","),
    ...rows.map((r) => headers.map((h) => esc(r[h])).join(",")),
  ].join("\r\n");
}
