// Next.js: берём base URL из NEXT_PUBLIC_*
export const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL?.trim()) ||
  (process.env.NEXT_PUBLIC_API_BASE?.trim()) ||
  "https://api.overcreate.co";

// Делает абсолютным любой относительный url из бэка (/storage/...)
export function toMediaUrl(u?: string | null): string {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `${API_BASE}${u.startsWith("/") ? "" : "/"}${u}`;
}
