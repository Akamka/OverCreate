// lib/insights.ts
export type Insight = {
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  date: string;       // ISO
  readTime: string;   // "6 мин"
  tags: string[];
  theme?: "service-web" | "service-motion" | "service-graphic" | "service-dev" | "service-printing";
  content?: string;   // MD/MDX/HTML
  draft?: boolean;
};

const BASE = process.env.BACKEND_URL!;          // напр. https://api.example.com
const PUB_KEY = process.env.PUBLIC_API_KEY;     // если чтение публичное — можно без токена

function authHeaders(isWrite = false) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = isWrite ? process.env.ADMIN_TOKEN : PUB_KEY || process.env.ADMIN_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

// ===== ЧТЕНИЕ (используется страницами) =====
export async function getAllInsights(): Promise<Insight[]> {
  const res = await fetch(`${BASE}/insights`, {
    method: "GET",
    headers: authHeaders(false),
    // кэшируем по тегу — чтобы потом админка могла дернуть revalidateTag("insights")
    next: { tags: ["insights"] },
  });
  if (!res.ok) throw new Error("Failed to load insights");
  const data: Insight[] = await res.json();
  return data.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getInsight(slug: string): Promise<Insight | null> {
  const res = await fetch(`${BASE}/insights/${encodeURIComponent(slug)}`, {
    method: "GET",
    headers: authHeaders(false),
    next: { tags: ["insights", `insight:${slug}`] },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load insight");
  return (await res.json()) as Insight;
}

// ===== ЗАПИСЬ (использует админка/серверные actions) =====
export async function createInsight(payload: Insight) {
  const res = await fetch(`${BASE}/insights`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as Insight;
}

export async function updateInsight(slug: string, patch: Partial<Insight>) {
  const res = await fetch(`${BASE}/insights/${encodeURIComponent(slug)}`, {
    method: "PATCH",
    headers: authHeaders(true),
    body: JSON.stringify(patch),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as Insight;
}

export async function deleteInsight(slug: string) {
  const res = await fetch(`${BASE}/insights/${encodeURIComponent(slug)}`, {
    method: "DELETE",
    headers: authHeaders(true),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  return true;
}
