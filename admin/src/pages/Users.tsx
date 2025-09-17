"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSavedToken, adminListUsers, adminUpdateUserRole } from "../api";
import type { User, Paginated } from "../types";

const ROLES: Array<User["role"]> = ["client", "staff", "admin"];

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [items, setItems] = useState<User[]>([]);
  const [links, setLinks] = useState<Paginated<User>["links"] | undefined>();

  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"" | User["role"]>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftRole, setDraftRole] = useState<User["role"]>("client");

  const token = useMemo(() => getSavedToken(), []);

  const load = useCallback(
    async (pageUrl?: string) => {
      if (!token) return;
      setLoading(true);
      setErr(null);

      try {
        let page: number | undefined;
        if (pageUrl) {
          const u = new URL(pageUrl);
          page = Number(u.searchParams.get("page") || "1");
        }

        const data = await adminListUsers(token, {
          q: query.trim() || undefined,
          role: role || undefined,
          page,
        });

        setItems(data.data || []);
        setLinks(data.links);
      } catch (e) {
        setErr((e as Error).message || "Request failed");
        setItems([]);
        setLinks(undefined);
      } finally {
        setLoading(false);
      }
    },
    [token, query, role]
  );

  useEffect(() => {
    load();
  }, [load]);

  async function startEdit(u: User) {
    setEditingId(u.id);
    setDraftRole(u.role);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(u: User) {
    if (!token) return;
    try {
      setLoading(true);
      const updated = await adminUpdateUserRole(token, u.id, draftRole);
      setItems((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: updated.role } : x)));
      setEditingId(null);
    } catch (e) {
      setErr((e as Error).message || "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {/* Панель фильтров */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск (имя/email)"
          style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #e5e7eb", minWidth: 280 }}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "" | User["role"])}
          style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #e5e7eb" }}
        >
          <option value="">Все роли</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button
          onClick={() => load()}
          style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #e5e7eb" }}
        >
          Обновить
        </button>
      </div>

      {/* Ошибка */}
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
          Ошибка: {err}. Проверь <code>X-Admin-Token</code> и эндпоинт <code>/api/admin/users</code>.
        </div>
      )}

      {/* Таблица */}
      {loading ? (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
          Загрузка…
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["ID", "Имя", "Email", "Роль", "Действия"].map((h) => (
                    <th
                      key={h}
                      style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((u) => {
                  const isEdit = editingId === u.id;
                  return (
                    <tr key={u.id} style={{ borderTop: "1px solid #e5e7eb", verticalAlign: "top" }}>
                      <td style={{ padding: 8 }}>{u.id}</td>
                      <td style={{ padding: 8, minWidth: 200 }}>{u.name}</td>
                      <td style={{ padding: 8, minWidth: 240 }}>{u.email}</td>
                      <td style={{ padding: 8, minWidth: 140 }}>
                        {isEdit ? (
                          <select
                            value={draftRole}
                            onChange={(e) => setDraftRole(e.target.value as User["role"])}
                            style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid #e5e7eb" }}
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        ) : (
                          u.role
                        )}
                      </td>
                      <td style={{ padding: 8, whiteSpace: "nowrap" }}>
                        {isEdit ? (
                          <>
                            <button
                              onClick={() => saveEdit(u)}
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
                          <button
                            onClick={() => startEdit(u)}
                            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #e5e7eb" }}
                          >
                            Редакт.
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {!items.length && (
                  <tr>
                    <td colSpan={5} style={{ padding: 16, textAlign: "center", color: "#6b7280" }}>
                      Нет данных
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Пагинация */}
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
    </div>
  );
}
