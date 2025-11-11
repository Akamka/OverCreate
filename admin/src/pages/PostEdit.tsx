// admin/src/pages/PostEdit.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  adminCreatePost,
  adminUpdatePost,
  adminShowPost,
} from "../lib/adminApi";

type Post = import("../types").Post;

/** Разбор id из hash: #/posts/new или #/posts/123 */
function parsePostIdFromHash(hash: string): string | null {
  const m = hash.match(/^#\/posts\/([^/?#]+)/i);
  return m ? decodeURIComponent(m[1]) : null;
}

/** Навигация обратно к списку */
function goToPosts(): void {
  window.location.hash = "/posts";
}

/** Примитивный slugify с транслитерацией кириллицы */
function slugify(input: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
    з: "z", и: "i", й: "j", к: "k", л: "l", м: "m", н: "n", о: "o",
    п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c",
    ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
    є: "e", і: "i", ї: "i", ґ: "g",
  };
  const s = input
    .toLowerCase()
    .split("")
    .map((ch) => (map[ch] ?? ch))
    .join("")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "post";
}

/** Оценка времени чтения (как на фронте) */
function computeReadTime(html: string): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} мин`;
}

/** Утилиты для keywords */
function parseKeywords(input: string): string[] {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
function keywordsToString(kw?: string[] | null): string {
  return (kw ?? []).join(", ");
}

const THEME_TAGS = [
  { label: "service-web", value: "service-web" },
  { label: "service-motion", value: "service-motion" },
  { label: "service-graphic", value: "service-graphic" },
  { label: "service-dev", value: "service-dev" },
  { label: "service-printing", value: "service-printing" },
  // альтернативная нотация:
  { label: "theme:web", value: "theme:web" },
  { label: "theme:motion", value: "theme:motion" },
  { label: "theme:graphic", value: "theme:graphic" },
  { label: "theme:dev", value: "theme:dev" },
  { label: "theme:printing", value: "theme:printing" },
];

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
    cover_url: "",
    body: "",
    meta_title: "",
    meta_description: "",
    keywords: [],
    cta_text: "Need help with design? Let’s talk.",
    cta_url: "/#contact",
    is_published: false,
  });

  // авто-генерация slug при вводе title (только если slug ещё пустой/совпадает с автосгенерированным)
  useEffect(() => {
    const title = draft.title?.trim() || "";
    if (!title) return;
    if (!draft.slug || draft.slug === slugify(draft.slug)) {
      setDraft((d) => {
        if (d.slug && d.slug !== slugify(d.slug)) return d; // пользователь правит вручную
        return { ...d, slug: slugify(title) };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.title]);

  // загрузка поста по id
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
        const item = await adminShowPost(Number(hashId));
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

      if (!payload.slug || !payload.slug.trim()) {
        payload.slug = slugify(payload.title ?? "");
      }

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

  const keywordsStr = useMemo(() => keywordsToString(draft.keywords), [draft.keywords]);
  const readTime = useMemo(() => computeReadTime(draft.body ?? ""), [draft.body]);

  function addKeyword(tag: string) {
    setDraft((d) => {
      const set = new Set([...(d.keywords ?? [])]);
      set.add(tag);
      return { ...d, keywords: Array.from(set) };
    });
  }
  function removeKeyword(tag: string) {
    setDraft((d) => ({ ...d, keywords: (d.keywords ?? []).filter((t) => t !== tag) }));
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
          {/* Основные поля */}
          <label>
            Заголовок
            <input
              value={draft.title ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              style={{ display: "block", width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e5e7eb" }}
            />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12 }}>
            <label>
              Слаг (опционально)
              <input
                value={draft.slug ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value.replace(/\s+/g, "-") }))}
                placeholder="post-slug"
                style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
            </label>
            <button
              type="button"
              onClick={() => setDraft((d) => ({ ...d, slug: slugify(d.title ?? "") }))}
              style={{
                alignSelf: "end",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                background: "#fff",
                height: 40,
              }}
              title="Сгенерировать из заголовка"
            >
              Сгенерировать
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label>
              Обложка (cover_url)
              <input
                value={draft.cover_url ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, cover_url: e.target.value }))}
                placeholder="https://…"
                style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
            </label>
            <label>
              Краткое описание (excerpt)
              <input
                value={draft.excerpt ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))}
                placeholder="О чём эта заметка"
                style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
            </label>
          </div>

          <label>
            Тело (HTML)
            <textarea
              value={draft.body ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
              rows={18}
              spellCheck={false}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco",
              }}
            />
          </label>

          {/* Метаданные / CTA */}
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
                placeholder="/#contact или https://…"
                style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
            </label>
          </div>

          {/* Ключевые слова и темы */}
          <label>
            Keywords (через запятую)
            <input
              value={keywordsStr}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  keywords: parseKeywords(e.target.value),
                }))
              }
              placeholder="UX, Motion, A/B, service-web"
              style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e5e7eb" }}
            />
          </label>

          {!!(draft.keywords && draft.keywords.length) && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {draft.keywords!.map((k) => (
                <span
                  key={k}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 8px",
                    borderRadius: 999,
                    background: "#f1f5f9",
                    border: "1px solid #e5e7eb",
                    fontSize: 12,
                  }}
                >
                  {k}
                  <button
                    type="button"
                    onClick={() => removeKeyword(k)}
                    style={{
                      background: "transparent",
                      border: 0,
                      cursor: "pointer",
                      color: "#64748b",
                      fontSize: 14,
                      lineHeight: 1,
                    }}
                    title="Удалить тег"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <div style={{ marginTop: 4, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ alignSelf: "center", fontSize: 12, color: "#64748b" }}>
              Быстрая тема:
            </span>
            {THEME_TAGS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => addKeyword(t.value)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  fontSize: 12,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Флаги/инфо */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr auto",
              gap: 12,
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={!!draft.is_published}
                onChange={(e) => setDraft((d) => ({ ...d, is_published: e.target.checked }))}
              />
              Опубликовать
            </label>

            <div style={{ color: "#64748b", fontSize: 12 }}>
              Примерное время чтения: <b>{readTime}</b>
            </div>

            {draft.published_at && (
              <div style={{ color: "#64748b", fontSize: 12 }}>
                Опубликовано: {String(draft.published_at).slice(0, 10)}
              </div>
            )}
          </div>

          {/* Действия */}
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
