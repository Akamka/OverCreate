"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSavedToken, adminListUsers, adminUpdateUserRole } from "../api";
import type { User, Paginated } from "../types";

const ROLES: Array<User["role"]> = ["client", "staff", "admin"];

// Базовый URL бэкенда (как в админке). Без any:
const API_BASE =
  (import.meta as unknown as { env: { VITE_API_BASE?: string } }).env
    ?.VITE_API_BASE ?? "http://127.0.0.1:8080";

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
      setItems((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, role: updated.role } : x))
      );
      setEditingId(null);
    } catch (e) {
      setErr((e as Error).message || "Update failed");
    } finally {
      setLoading(false);
    }
  }

  // 🗑 Удаление пользователя (с оптимистичным UI)
  async function removeUser(u: User) {
    if (!token) {
      setErr("Нет X-Admin-Token");
      return;
    }
    if (
      !confirm(
        `Удалить пользователя #${u.id} (${u.email})?\nЭто действие необратимо.`
      )
    )
      return;

    const prev = items;
    setItems((p) => p.filter((x) => x.id !== u.id)); // оптимистично

    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${u.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "X-Admin-Token": token,
        },
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
      }
      // успех — элемент уже удалён
    } catch (e) {
      setItems(prev); // откат
      setErr((e as Error).message || "Delete failed");
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
          style={{
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            minWidth: 280,
          }}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "" | User["role"])}
          style={{
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
          }}
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
          style={{
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
          }}
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
          Ошибка: {err}. Проверь <code>X-Admin-Token</code> и эндпоинт{" "}
          <code>/api/admin/users</code>.
        </div>
      )}

      {/* Таблица */}
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
            <table
              style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}
            >
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["ID", "Имя", "Email", "Роль", "Статус", "Действия"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: 8,
                          borderBottom: "1px solid #e5e7eb",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {items.map((u) => {
                  const isEdit = editingId === u.id;
                  const verified = Boolean(u.email_verified_at);
                  return (
                    <tr
                      key={u.id}
                      style={{
                        borderTop: "1px solid #e5e7eb",
                        verticalAlign: "top",
                      }}
                    >
                      <td style={{ padding: 8 }}>{u.id}</td>
                      <td style={{ padding: 8, minWidth: 200 }}>{u.name}</td>
                      <td style={{ padding: 8, minWidth: 240 }}>{u.email}</td>

                      {/* Роль */}
                      <td style={{ padding: 8, minWidth: 140 }}>
                        {isEdit ? (
                          <select
                            value={draftRole}
                            onChange={(e) =>
                              setDraftRole(e.target.value as User["role"])
                            }
                            style={{
                              padding: "6px 8px",
                              borderRadius: 8,
                              border: "1px solid #e5e7eb",
                            }}
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

                      {/* Статус верификации */}
                      <td style={{ padding: 8, minWidth: 140 }}>
                        {verified ? (
                          <span
                            style={{
                              fontSize: 12,
                              padding: "2px 10px",
                              borderRadius: 999,
                              background: "#dcfce7",
                              color: "#166534",
                              display: "inline-block",
                            }}
                            title={
                              u.email_verified_at
                                ? `Verified at: ${u.email_verified_at}`
                                : ""
                            }
                          >
                            ✅ Verified
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: 12,
                              padding: "2px 10px",
                              borderRadius: 999,
                              background: "#fee2e2",
                              color: "#991b1b",
                              display: "inline-block",
                            }}
                          >
                            ⛔ Not verified
                          </span>
                        )}
                      </td>

                      {/* Действия */}
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
                              style={{
                                padding: "6px 10px",
                                borderRadius: 8,
                                border: "1px solid #e5e7eb",
                              }}
                            >
                              Отмена
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(u)}
                              style={{
                                padding: "6px 10px",
                                borderRadius: 8,
                                border: "1px solid #e5e7eb",
                                marginRight: 6,
                              }}
                            >
                              Редакт.
                            </button>

                            {/* 🗑 Кнопка удаления */}
                            <button
                              onClick={() => removeUser(u)}
                              style={{
                                padding: "6px 10px",
                                borderRadius: 8,
                                border: "1px solid #ef4444",
                                color: "#b91c1c",
                                background: "#fff",
                              }}
                              title="Удалить пользователя"
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
                    <td
                      colSpan={6}
                      style={{
                        padding: 16,
                        textAlign: "center",
                        color: "#6b7280",
                      }}
                    >
                      Нет данных
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Пагинация */}
          {!!links?.length && (
            <div
              style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}
            >
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
