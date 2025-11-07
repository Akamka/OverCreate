// admin/src/pages/PostEdit.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { adminCreatePost, adminUpdatePost, adminListPosts } from "../lib/adminApi";

type Post = import("../types").Post;

/** Разбор id из hash: #/posts/new или #/posts/123 */
function parsePostIdFromHash(hash: string): string | null {
  // ожидаем вид #/posts/<id>
  const m = hash.match(/^#\/posts\/([^/?#]+)/i);
  return m ? decodeURIComponent(m[1]) : null;
}

/** Навигация обратно к списку */
function goToPosts(): void {
  window.location.hash = "/posts";
}

export default function PostEditPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);

  // читаем id из hash и подписываемся на изменения
  const [hashId, setHashId] = useState<string | null>(() => parsePostIdFromHash(window.location.hash));
  useEffect(() => {
    const onHash = () => setHashId(parsePostIdFromHash(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const isNew = useMemo(() => !hashId || hashId === "new", [hashId]);

  const [draft, setDraft] = useState<Partial<Post>>({
    title: "",
    slug: "",
    excerpt: "",
    body: "",
    meta_title: "",
    meta_description: "",
    keywords: [],
    cta_text: "Need help with design? Let’s talk.",
    cta_url: "/#contact",
    is_published: false,
  });

  // загрузка поста (без react-router)
  useEffect(() => {
    let aborted = false;

    async function load() {
      if (isNew) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setErr(null);
      try {
        // простая загрузка через список (если нет отдельного adminShowPost)
        const res = await adminListPosts({ page: 1, per_page: 200 });
        const item = (res.data ?? []).find((p) => String(p.id) === String(hashId));
        if (!item) throw new Error("Post not found");
        if (!aborted) setDraft(item);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Load failed";
        if (!aborted) setErr(msg);
      } finally {
        if (!aborted) setLoading(false);
      }
    }

    void load();
    return () => {
      aborted = true;
    };
  }, [hashId, isNew]);

  async function save() {
    setErr(null);
    try {
      setLoading(true);
      const payload: Partial<Post> = {
        ...draft,
        // нормализуем keywords
        keywords: (draft.keywords ?? []).map((s) => String(s).trim()).filter(Boolean),
      };

      if (isNew) {
        await adminCreatePost(payload);
      } else {
        await adminUpdatePost(Number(hashId), payload);
      }
      goToPosts();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Save failed";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h2>{isNew ? "Новый пост" : `Редактирование #${hashId}`}</h2>

      {err && (
        <div
          style={{
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            color: "#991b1b",
            padding: 12,
            borderRadius: 10,
          }}
        >
          Ошибка: {err}
        </div>
      )}

      {loading ? (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
          Загрузка…
        </div>
      ) : (
        <>
          <label>
            Заголовок
            <input
              value={draft.title ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              style={{ display: "block", width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e5e7eb" }}
            />
          </label>

          <label>
            Слаг (опционально)
            <input
              value={draft.slug ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))}
              style={{ display: "block", width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e5e7eb" }}
            />
          </label>

          <label>
            Краткое описание (excerpt)
            <textarea
              value={draft.excerpt ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))}
              rows={3}
              style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e5e7eb" }}
            />
          </label>

          <label>
            Тело (HTML)
            <textarea
              value={draft.body ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
              rows={16}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco",
              }}
            />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label>
              Meta title
              <input
                value={draft.meta_title ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, meta_title: e.target.value }))}
                style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
            </label>
            <label>
              Meta description
              <input
                value={draft.meta_description ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, meta_description: e.target.value }))}
                style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label>
              CTA text
              <input
                value={draft.cta_text ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, cta_text: e.target.value }))}
                style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
            </label>
            <label>
              CTA url
              <input
                value={draft.cta_url ?? "/#contact"}
                onChange={(e) => setDraft((d) => ({ ...d, cta_url: e.target.value }))}
                style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
            </label>
          </div>

          <label>
            Keywords (через запятую)
            <input
              value={(draft.keywords ?? []).join(", ")}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  keywords: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                }))
              }
              style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e5e7eb" }}
            />
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={!!draft.is_published}
              onChange={(e) => setDraft((d) => ({ ...d, is_published: e.target.checked }))}
            />
            Опубликовать
          </label>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => void save()}
              style={{ padding: "10px 14px", borderRadius: 10, background: "#111", color: "#fff" }}
            >
              Сохранить
            </button>
            <button
              onClick={goToPosts}
              style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff" }}
            >
              Отмена
            </button>
          </div>
        </>
      )}
    </div>
  );
}
