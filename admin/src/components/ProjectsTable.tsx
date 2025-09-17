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

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["ID", "Название", "Клиент", "Исполнитель", "Статус", "Прогресс", "Действия"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((p) => {
              const isEdit = editingId === p.id;
              return (
                <tr key={p.id} style={{ borderTop: "1px solid #e5e7eb", verticalAlign: "top" }}>
                  <td style={{ padding: 8 }}>{p.id}</td>

                  {/* Название + описание */}
                  <td style={{ padding: 8, minWidth: 240 }}>
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
                          style={{
                            width: "100%",
                            marginTop: 6,
                            padding: "6px 8px",
                            borderRadius: 8,
                            border: "1px solid #e5e7eb",
                          }}
                        />
                      </>
                    ) : (
                      <>
                        <div style={{ fontWeight: 600 }}>{p.title}</div>
                        {p.description && (
                          <div style={{ color: "#6b7280", marginTop: 4, whiteSpace: "pre-wrap" }}>{p.description}</div>
                        )}
                      </>
                    )}
                  </td>

                  {/* Клиент */}
                  <td style={{ padding: 8, minWidth: 220 }}>
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
                  <td style={{ padding: 8, minWidth: 220 }}>
                    {isEdit ? (
                      <select
                        value={draft.assignee_id ?? p.assignee_id ?? ""}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            assignee_id: e.target.value ? Number(e.target.value) : undefined,
                          }))
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
                  <td style={{ padding: 8, minWidth: 160 }}>
                    {isEdit ? (
                      <select
                        value={draft.status ?? p.status}
                        onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as Project["status"] }))}
                        style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid #e5e7eb" }}
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
                  <td style={{ padding: 8, minWidth: 170 }}>
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

                  {/* Действия */}
                  <td style={{ padding: 8, whiteSpace: "nowrap" }}>
                    {isEdit ? (
                      <>
                        <button
                          onClick={() => commitEdit(p.id)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 8,
                            background: "#111",
                            color: "#fff",
                            marginRight: 6,
                          }}
                        >
                          Сохранить
                        </button>
                        <button
                          onClick={cancelEdit}
                          style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #e5e7eb" }}
                        >
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
                <td colSpan={7} style={{ padding: 16, textAlign: "center", color: "#6b7280" }}>
                  Нет проектов
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!!pagination?.length && onNavigate && (
        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
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
