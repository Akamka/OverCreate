import type { ContactSubmission, Paginated } from "./types";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const TOKEN_KEY = "oc_admin_token";

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

async function getJson<T>(url: string, adminToken: string): Promise<T> {
  const full = url.startsWith("http") ? url : `${BASE}${url}`;
  const res = await fetch(full, {
    headers: { Accept: "application/json", "X-Admin-Token": adminToken },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export async function listContactSubmissions(
  adminToken: string,
  url?: string
): Promise<Paginated<ContactSubmission> | ContactSubmission[]> {
  return getJson<Paginated<ContactSubmission> | ContactSubmission[]>(
    url ?? "/api/contact-submissions",
    adminToken
  );
}

export function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = (v ?? "").toString().replace(/"/g, '""');
    return `"${s}"`;
  };
  return [
    headers.map(esc).join(","),
    ...rows.map((r) => headers.map((h) => esc(r[h])).join(",")),
  ].join("\r\n");
}
