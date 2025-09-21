"use client";
import { useCallback, useEffect, useState } from "react";
import type { PortfolioItem, Paginated, ServiceSlug } from "../types";
import {
  adminListPortfolio,
  adminCreatePortfolio,
  adminUpdatePortfolio,
  adminDeletePortfolio,
  type PortfolioCreatePayload,
} from "../lib/adminApi";

const SERVICES: ServiceSlug[] = ["motion", "graphic", "web", "dev", "printing"];

/* ---------- helpers ---------- */
function isAllowed(file: File, accept?: string) {
  if (!accept) return true;
  const tokens = accept.split(",").map((t) => t.trim());
  return tokens.some((t) => {
    if (t.endsWith("/*")) {
      const prefix = t.slice(0, t.length - 1); // "image/"
      return file.type.startsWith(prefix);
    }
    return file.type === t;
  });
}

/* ---------- маленький drop-компонент с accept ---------- */
function FileDrop(props: {
  multiple?: boolean;
  accept?: string;
  onFiles: (files: File[]) => void;
  onReject?: (rejected: File[]) => void;
  children?: React.ReactNode;
}) {
  const { multiple, accept, onFiles, onReject, children } = props;
  const [over, setOver] = useState(false);

  function handle(files: File[]) {
    const ok: File[] = [];
    const bad: File[] = [];
    files.forEach((f) => (isAllowed(f, accept) ? ok.push(f) : bad.push(f)));
    if (ok.length) onFiles(ok);
    if (bad.length) onReject?.(bad);
  }

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        handle(Array.from(e.dataTransfer.files || []));
      }}
      style={{
        display: "grid",
        placeItems: "center",
        padding: 16,
        borderRadius: 12,
        border: "1px dashed #cbd5e1",
        background: over ? "#f1f5f9" : "#fff",
        cursor: "pointer",
      }}
      title={accept ? `Разрешено: ${accept}` : undefined}
    >
      <input
        type="file"
        hidden
        multiple={multiple}
        accept={accept}
        onChange={(e) => handle(Array.from(e.target.files || []))}
      />
      {children ?? (
        <div style={{ fontSize: 13, color: "#475569" }}>
          Перетащи сюда {multiple ? "файлы" : "файл"} или нажми для выбора
        </div>
      )}
    </label>
  );
}

/* ---------- модалка создания/редактирования ---------- */
function EditModal(props: {
  open: boolean;
  initial?: Partial<PortfolioItem>;
  onClose: () => void;
  onSave: (data: PortfolioCreatePayload) => Promise<void>;
}) {
  const { open, initial, onClose, onSave } = props;

  const [title, setTitle] = useState<string>(initial?.title || "");
  const [service, setService] = useState<ServiceSlug | string>(
    (initial?.service_type as ServiceSlug) || "motion"
  );
  const [excerpt, setExcerpt] = useState<string>(initial?.excerpt || "");
  const [tags, setTags] = useState<string>(initial?.tags || "");
  const [sort, setSort] = useState<number>(initial?.sort_order ?? 0);
  const [published, setPublished] = useState<boolean>(
    initial?.is_published ?? true
  );

  const [cover, setCover] = useState<File | null>(null);  // новая обложка
  const [gallery, setGallery] = useState<File[]>([]);     // новые файлы
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(initial?.title || "");
      setService((initial?.service_type as ServiceSlug) || "motion");
      setExcerpt(initial?.excerpt || "");
      setTags(initial?.tags || "");
      setSort(initial?.sort_order ?? 0);
      setPublished(initial?.is_published ?? true);
      setCover(null);
      setGallery([]);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial?.id]);

  if (!open) return null;

  const canSave = title.trim().length > 1;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.35)",
        display: "grid",
        placeItems: "center",
        padding: 16,
        zIndex: 50,
      }}
    >
      <div
        style={{
          width: "min(860px,100%)",
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 16,
        }}
      >
        <h3 style={{ marginTop: 0 }}>
          {initial?.id ? `Редактировать #${initial.id}` : "Добавить работу"}
        </h3>

        {!!error && (
          <div
            style={{
              background: "#fee2e2",
              border: "1px solid #fca5a5",
              color: "#991b1b",
              padding: 10,
              borderRadius: 10,
              marginBottom: 10,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "grid", gap: 10 }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Заголовок"
            style={{
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
            }}
          />

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              style={{
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
              }}
            >
              {SERVICES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
              />{" "}
              Публикация
            </label>

            <input
              type="number"
              value={sort}
              onChange={(e) => setSort(Number(e.target.value))}
              placeholder="Порядок"
              style={{
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                width: 120,
              }}
            />
          </div>

          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            placeholder="Короткое описание"
            style={{
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
            }}
          />

          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Теги (через запятую)"
            style={{
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
            }}
          />

          {/* ----- Обложка (только image/*) ----- */}
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontWeight: 600 }}>Обложка</div>

            {/* текущее превью при редактировании */}
            {initial?.cover_url && !cover && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <img
                  src={initial.cover_url}
                  alt="cover"
                  style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb" }}
                />
                <span style={{ fontSize: 12, color: "#64748b" }}>Текущая обложка</span>
              </div>
            )}

            <FileDrop
              accept="image/*"
              multiple={false}
              onFiles={(files) => setCover(files[0] || null)}
              onReject={(rej) =>
                setError(
                  `Обложка должна быть изображением (image/*). Отклонено: ${rej
                    .map((f) => `${f.name} [${f.type || "unknown"}]`)
                    .join(", ")}`
                )
              }
            >
              <div style={{ fontSize: 13, color: "#475569" }}>
                Перетащи сюда <b>картинку</b> или нажми для выбора (video запрещено)
              </div>
            </FileDrop>

            {cover && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 12, color: "#475569" }}>{cover.name}</div>
                <button
                  onClick={() => setCover(null)}
                  style={{ padding: "4px 8px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff" }}
                >
                  Убрать
                </button>
              </div>
            )}
          </div>

          {/* ----- Галерея (image/*,video/*) — много файлов сразу ----- */}
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontWeight: 600 }}>Галерея</div>
            <FileDrop
              multiple
              accept="image/*,video/*"
              onFiles={(files) => setGallery(files)}
              onReject={(rej) =>
                setError(
                  `Галерея: неподдерживаемые типы — ${rej
                    .map((f) => `${f.name} [${f.type || "unknown"}]`)
                    .join(", ")}`
                )
              }
            />
            {!!gallery.length && (
              <div style={{ fontSize: 12, color: "#475569" }}>
                {gallery.length} файл(ов) выбрано
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            marginTop: 14,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
            }}
          >
            Отмена
          </button>
          <button
            disabled={!canSave || saving}
            onClick={async () => {
              setSaving(true);
              setError(null);
              try {
                await onSave({
                  title: title.trim(),
                  service_type: service,
                  excerpt: excerpt.trim() || undefined,
                  tags: tags.trim() || undefined,
                  sort_order: sort,
                  is_published: published,
                  cover,                               // заменит обложку, если задано
                  gallery_files: gallery.length ? gallery : null, // добавит/перезапишет галерею
                });
                onClose();
              } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                setError(msg || "Save failed");
                console.error("Save portfolio failed:", e);
              } finally {
                setSaving(false);
              }
            }}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              background: "#111",
              color: "#fff",
              opacity: canSave ? 1 : 0.6,
            }}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- страница ---------- */
export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [links, setLinks] = useState<Paginated<PortfolioItem>["links"]>();
  const [service, setService] = useState<"" | ServiceSlug>("");
  const [published, setPublished] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<PortfolioItem | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  const load = useCallback(
    async (pageUrl?: string) => {
      setLoading(true);
      setPageError(null);
      try {
        let page: number | undefined;
        if (pageUrl) {
          const u = new URL(pageUrl);
          page = Number(u.searchParams.get("page") || "1");
        }
        const data = await adminListPortfolio({
          page,
          per_page: 20,
          service_type: service || undefined,
          published,
        });
        setItems(data.data || []);
        setLinks(data.links);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setPageError(msg || "Load failed");
        setItems([]);
        setLinks(undefined);
      } finally {
        setLoading(false);
      }
    },
    [service, published]
  );

  useEffect(() => {
    load();
  }, [load]);

  async function onCreate(d: PortfolioCreatePayload) {
    const made = await adminCreatePortfolio(d);
    setItems((prev) => [made, ...prev]);
  }
  async function onUpdate(id: number, d: PortfolioCreatePayload) {
    const upd = await adminUpdatePortfolio(id, d);
    setItems((prev) => prev.map((x) => (x.id === id ? upd : x)));
  }
  async function onDelete(id: number) {
    if (!confirm(`Удалить работу #${id}?`)) return;
    await adminDeletePortfolio(id);
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <select
          value={service}
          onChange={(e) => setService(e.target.value as "" | ServiceSlug)}
          style={{
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
          }}
        >
          <option value="">Все сервисы</option>
          {SERVICES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />{" "}
          Только опубликованные
        </label>

        <button
          onClick={() => load()}
          style={{
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
          }}
        >
          Фильтр
        </button>
        <button
          onClick={() => {
            setEdit(null);
            setOpen(true);
          }}
          style={{
            padding: "8px 10px",
            borderRadius: 10,
            background: "#111",
            color: "#fff",
          }}
        >
          + Добавить
        </button>
      </div>

      {!!pageError && (
        <div
          style={{
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            color: "#991b1b",
            padding: 10,
            borderRadius: 10,
          }}
        >
          {pageError}
        </div>
      )}

      {loading ? (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 16,
          }}
        >
          Загрузка…
        </div>
      ) : (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: 16,
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["ID", "Заголовок", "Сервис", "Порядок", "Публ.", "Обложка", "Действия"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: 8,
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} style={{ borderTop: "1px solid #e5e7eb", verticalAlign: "top" }}>
                    <td style={{ padding: 8 }}>{it.id}</td>
                    <td style={{ padding: 8, minWidth: 220 }}>
                      <div style={{ fontWeight: 600 }}>{it.title}</div>
                      {it.excerpt && (
                        <div style={{ color: "#64748b", marginTop: 4 }}>{it.excerpt}</div>
                      )}
                    </td>
                    <td style={{ padding: 8 }}>{it.service_type}</td>
                    <td style={{ padding: 8, minWidth: 100 }}>{it.sort_order}</td>
                    <td style={{ padding: 8 }}>{it.is_published ? "✅" : "⛔"}</td>
                    <td style={{ padding: 8 }}>
                      {it.cover_url ? (
                        <a href={it.cover_url} target="_blank" rel="noreferrer">
                          cover
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td style={{ padding: 8, whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => {
                          setEdit(it);
                          setOpen(true);
                        }}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 8,
                          border: "1px solid #e5e7eb",
                          marginRight: 6,
                        }}
                      >
                        Редакт.
                      </button>
                      <button
                        onClick={() => onDelete(it.id)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 8,
                          border: "1px solid #ef4444",
                          color: "#ef4444",
                        }}
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
                {!items.length && (
                  <tr>
                    <td
                      colSpan={7}
                      style={{ padding: 16, textAlign: "center", color: "#6b7280" }}
                    >
                      Нет работ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {!!links?.length && (
            <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {links.map((l, i) =>
                l.url ? (
                  <button
                    key={i}
                    onClick={() => load(l.url!)}
                    disabled={l.active}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                      background: l.active ? "#e5e7eb" : "#fff",
                    }}
                    dangerouslySetInnerHTML={{ __html: l.label }}
                  />
                ) : (
                  <span key={i} />
                )
              )}
            </div>
          )}
        </div>
      )}

      <EditModal
        open={open}
        initial={edit ?? undefined}
        onClose={() => setOpen(false)}
        onSave={async (d) => {
          if (edit) await onUpdate(edit.id, d);
          else await onCreate(d);
        }}
      />
    </div>
  );
}
