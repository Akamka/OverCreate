"use client";
import { useState } from "react";
import type { Project, User, Paginated } from "../types";

type Props = {
  items: Project[];
  staff: User[];
  clients: User[];
  pagination?: Paginated<Project>["links"];
  onNavigate?: (url: string) => void;
  onUpdate?: (id: number, patch: Partial<Project>) => void;
  onDelete?: (id: number) => void;
};

function fmtDateShort(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function ProjectsTable({
  items,
  staff,
  clients,
  pagination,
  onNavigate,
  onUpdate,
  onDelete,
}: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Partial<Project>>({});

  function startEdit(p: Project) {
    setEditingId(p.id);
    setDraft({
      title: p.title,
      description: p.description ?? "",
      status: p.status,
      progress: p.progress,
      assignee_id: p.assignee_id ?? undefined,
      user_id: p.user_id,
      start_at: p.start_at ?? null,
      due_at: p.due_at ?? null,
    });
  }
  function cancelEdit() {
    setEditingId(null);
    setDraft({});
  }
  function commitEdit(id: number) {
    if (!onUpdate) return;
    onUpdate(id, draft);
    setEditingId(null);
    setDraft({});
  }

  // общие стили
  const th: React.CSSProperties = { textAlign: "left", padding: "6px 8px", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap", fontSize: 13 };
  const td: React.CSSProperties = { padding: "6px 8px", fontSize: 13, verticalAlign: "top", borderTop: "1px solid #eef2f7" };

  // «узкий» режим — чуть скрываем колонки если совсем мало места
  const isNarrow = typeof window !== "undefined" && window.innerWidth < 1280;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 12,
        width: "100%",           // тянем контейнер
        maxWidth: "none",
        margin: 0,
        justifySelf: "stretch",
      }}
    >
      <div style={{ overflowX: "hidden" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed", // фиксированные ширины
            fontSize: 13,
          }}
        >
          <colgroup>
            <col style={{ width: 56 }} />      {/* ID */}
            <col style={{ width: 300 }} />     {/* Название */}
            <col style={{ width: 180 }} />     {/* Клиент */}
            <col style={{ width: 180 }} />     {/* Исполнитель */}
            <col style={{ width: 130 }} />     {/* Статус */}
            <col style={{ width: 110 }} />     {/* Прогресс */}
            {!isNarrow && <col style={{ width: 150 }} />} {/* Старт */}
            {!isNarrow && <col style={{ width: 150 }} />} {/* Дедлайн */}
            <col style={{ width: 140 }} />     {/* Действия */}
          </colgroup>

          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th style={th}>ID</th>
              <th style={th}>Название</th>
              <th style={th}>Клиент</th>
              <th style={th}>Исполнитель</th>
              <th style={th}>Статус</th>
              <th style={th}>Прогресс</th>
              {!isNarrow && <th style={th}>Старт</th>}
              {!isNarrow && <th style={th}>Дедлайн</th>}
              <th style={th}>Действия</th>
            </tr>
          </thead>

          <tbody>
            {items.map((p) => {
              const isEdit = editingId === p.id;
              return (
                <tr key={p.id}>
                  <td style={td}>{p.id}</td>

                  {/* Название + мини-описание (внутри фиксированной ячейки — обрезка) */}
                  <td style={{ ...td, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {isEdit ? (
                      <>
                        <input
                          value={String(draft.title ?? "")}
                          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                          style={{ width: "100%", padding: "6px 8px", borderRadius: 8, border: "1px solid #e5e7eb" }}
                        />
                        <textarea
                          value={String(draft.description ?? "")}
                          onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                          rows={2}
                          style={{ width: "100%", marginTop: 6, padding: "6px 8px", borderRadius: 8, border: "1px solid #e5e7eb" }}
                        />
                      </>
                    ) : (
                      <>
                        <div style={{ fontWeight: 600 }}>{p.title}</div>
                        {p.description && (
                          <div
                            title={p.description ?? undefined}
                            style={{ color: "#6b7280", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                          >
                            {p.description}
                          </div>
                    )}
                      </>
                    )}
                  </td>

                  {/* Клиент */}
                  <td style={td}>
                    {isEdit ? (
                      <select
                        value={draft.user_id ?? p.user_id}
                        onChange={(e) => setDraft((d) => ({ ...d, user_id: Number(e.target.value) }))}
                        style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid #e5e7eb", width: "100%" }}
                      >
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} — {c.email}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <>{p.user?.name ?? p.user_id}</>
                    )}
                  </td>

                  {/* Исполнитель */}
                  <td style={td}>
                    {isEdit ? (
                      <select
                        value={draft.assignee_id ?? p.assignee_id ?? ""}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, assignee_id: e.target.value ? Number(e.target.value) : undefined }))
                        }
                        style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid #e5e7eb", width: "100%" }}
                      >
                        <option value="">— не назначен —</option>
                        {staff.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.role})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <>{p.assignee?.name ?? "—"}</>
                    )}
                  </td>

                  {/* Статус */}
                  <td style={td}>
                    {isEdit ? (
                      <select
                        value={draft.status ?? p.status}
                        onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as Project["status"] }))}
                        style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid #e5e7eb", width: "100%" }}
                      >
                        <option value="new">new</option>
                        <option value="in_progress">in_progress</option>
                        <option value="paused">paused</option>
                        <option value="done">done</option>
                      </select>
                    ) : (
                      <>{p.status}</>
                    )}
                  </td>

                  {/* Прогресс */}
                  <td style={td}>
                    {isEdit ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={draft.progress ?? p.progress}
                          onChange={(e) => setDraft((d) => ({ ...d, progress: Number(e.target.value) }))}
                          style={{ width: 120 }}
                        />
                        <span style={{ fontSize: 12, color: "#6b7280" }}>{draft.progress ?? p.progress}%</span>
                      </div>
                    ) : (
                      <>{p.progress}%</>
                    )}
                  </td>

                  {/* Старт / Дедлайн (только если не очень узко) */}
                  {!isNarrow && <td style={td}>{isEdit ? (
                    <input
                      type="datetime-local"
                      value={(draft.start_at ?? p.start_at ?? "").replace("Z", "")}
                      onChange={(e) => setDraft((d) => ({ ...d, start_at: e.target.value || null }))}
                      style={{ width: "100%", padding: "6px 8px", borderRadius: 8, border: "1px solid #e5e7eb" }}
                    />
                  ) : (
                    fmtDateShort(p.start_at)
                  )}</td>}

                  {!isNarrow && <td style={td}>{isEdit ? (
                    <input
                      type="datetime-local"
                      value={(draft.due_at ?? p.due_at ?? "").replace("Z", "")}
                      onChange={(e) => setDraft((d) => ({ ...d, due_at: e.target.value || null }))}
                      style={{ width: "100%", padding: "6px 8px", borderRadius: 8, border: "1px solid #e5e7eb" }}
                    />
                  ) : (
                    fmtDateShort(p.due_at)
                  )}</td>}

                  {/* Действия */}
                  <td style={{ ...td, whiteSpace: "nowrap" }}>
                    {isEdit ? (
                      <>
                        <button
                          onClick={() => commitEdit(p.id)}
                          style={{ padding: "6px 10px", borderRadius: 8, background: "#111", color: "#fff", marginRight: 6 }}
                        >
                          Сохранить
                        </button>
                        <button onClick={cancelEdit} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #e5e7eb" }}>
                          Отмена
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(p)}
                          style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #e5e7eb", marginRight: 6 }}
                        >
                          Редакт.
                        </button>
                        <button
                          onClick={() => onDelete?.(p.id)}
                          style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ef4444", color: "#ef4444" }}
                        >
                          Удалить
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}

            {!items.length && (
              <tr>
                <td colSpan={isNarrow ? 7 : 9} style={{ padding: 12, textAlign: "center", color: "#6b7280" }}>
                  Нет проектов
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!!pagination?.length && onNavigate && (
        <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {pagination.map((l, i) =>
            l.url ? (
              <button
                key={i}
                onClick={() => onNavigate(l.url!)}
                disabled={l.active}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  background: l.active ? "#e5e7eb" : "#fff",
                  fontSize: 12,
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
  );
}
