"use client";
import { useMemo, useState } from "react";
import type {
  ContactSubmission,
  Paginated,
  PaginationLink,
  ContactStatus,
} from "../types";
import {
  adminDeleteContact,
  adminUpdateContactStatus,
  adminBulkDeleteContacts,
} from "../lib/adminApi";

type Props = {
  items: ContactSubmission[];
  pagination?: PaginationLink[] | Paginated<ContactSubmission>["links"];
  onNavigate?: (url?: string) => Promise<void> | void;
  onChangeLocal?: (next: ContactSubmission[]) => void;
};

export default function ContactsTable({
  items,
  pagination,
  onNavigate,
  onChangeLocal,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const allChecked = useMemo(
    () => !!items.length && items.every((i) => selected.has(i.id)),
    [items, selected]
  );

  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleAll() {
    setSelected(() =>
      allChecked ? new Set<number>() : new Set(items.map((x) => x.id))
    );
  }

  async function doDeleteOne(id: number) {
    if (!confirm(`Удалить заявку #${id}?`)) return;
    setBusy(true);
    try {
      await adminDeleteContact(id);
      const next = items.filter((x) => x.id !== id);
      setSelected((s) => {
        const ns = new Set(s);
        ns.delete(id);
        return ns;
      });
      onChangeLocal?.(next);
    } finally {
      setBusy(false);
    }
  }

  async function doUpdateOne(id: number, status: ContactStatus) {
    setBusy(true);
    try {
      const upd = await adminUpdateContactStatus(id, status);
      const next = items.map((x) => (x.id === id ? upd : x));
      onChangeLocal?.(next);
    } finally {
      setBusy(false);
    }
  }

  async function doBulkDelete() {
    const ids = Array.from(selected.values());
    if (!ids.length) return;
    if (!confirm(`Удалить выбранные (${ids.length})?`)) return;
    setBusy(true);
    try {
      await adminBulkDeleteContacts(ids);
      const next = items.filter((x) => !selected.has(x.id));
      setSelected(new Set());
      onChangeLocal?.(next);
    } finally {
      setBusy(false);
    }
  }

  const thBase: React.CSSProperties = {
    textAlign: "left",
    padding: "6px 8px",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
    fontSize: 13,
  };
  const tdBase: React.CSSProperties = {
    padding: "6px 8px",
    fontSize: 13,
    verticalAlign: "top",
    borderTop: "1px solid #eef2f7",
  };
  const ellipsis: React.CSSProperties = {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  function Ellip({
    children,
    title,
  }: {
    children: React.ReactNode;
    title?: string;
  }) {
    return (
      <div style={ellipsis} title={title ?? String(children ?? "")}>
        {children}
      </div>
    );
  }

  const narrow = typeof window !== "undefined" && window.innerWidth < 1360;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 12,
        width: "100%",
        maxWidth: "none",
        margin: 0,
        justifySelf: "stretch",
      }}
    >
      {/* верхняя панель */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <button
          onClick={toggleAll}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            fontSize: 13,
          }}
        >
          {allChecked ? "Снять все" : "Выбрать все"}
        </button>
        <span style={{ color: "#6b7280", fontSize: 12 }}>
          Выбрано: {selected.size}
        </span>
        <div style={{ flex: 1 }} />
        <button
          onClick={doBulkDelete}
          disabled={busy || selected.size === 0}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #ef4444",
            color: "#ef4444",
            fontSize: 13,
          }}
        >
          Удалить выбранные
        </button>
      </div>

      {/* таблица */}
      <div style={{ overflowX: "hidden" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
            fontSize: 13,
          }}
        >
          <colgroup>
            <col style={{ width: 34 }} />
            <col style={{ width: 54 }} />
            <col style={{ width: 190 }} />
            <col style={{ width: 220 }} />
            <col style={{ width: 130 }} />
            {!narrow && <col style={{ width: 150 }} />}
            {!narrow && <col style={{ width: 140 }} />}
            <col style={{ width: 280 }} />
            <col style={{ width: 150 }} />
            <col style={{ width: 160 }} />
            <col style={{ width: 120 }} />
          </colgroup>

          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th style={thBase}></th>
              <th style={thBase}>ID</th>
              <th style={thBase}>Имя</th>
              <th style={thBase}>Email</th>
              <th style={thBase}>Телефон</th>
              {!narrow && <th style={thBase}>Страница</th>}
              {!narrow && <th style={thBase}>Тема</th>}
              <th style={thBase}>Сообщение</th>
              <th style={thBase}>Дата</th>
              <th style={thBase}>Статус</th>
              <th style={thBase}>Действия</th>
            </tr>
          </thead>

          <tbody>
            {items.map((x) => (
              <tr key={x.id}>
                <td style={{ ...tdBase }}>
                  <input
                    type="checkbox"
                    checked={selected.has(x.id)}
                    onChange={() => toggleOne(x.id)}
                  />
                </td>
                <td style={tdBase}>{x.id}</td>
                <td style={tdBase}>
                  <Ellip title={`${x.first_name} ${x.last_name}`}>
                    {x.first_name} {x.last_name}
                  </Ellip>
                </td>
                <td style={tdBase}>
                  <Ellip title={x.email}>{x.email}</Ellip>
                </td>
                <td style={tdBase}>
                  <Ellip title={x.phone || "—"}>{x.phone || "—"}</Ellip>
                </td>
                {!narrow && (
                  <td style={tdBase}>
                    <Ellip title={x.page || "—"}>{x.page || "—"}</Ellip>
                  </td>
                )}
                {!narrow && (
                  <td style={tdBase}>
                    <Ellip title={x.subject || "—"}>{x.subject || "—"}</Ellip>
                  </td>
                )}
                <td style={{ ...tdBase, whiteSpace: "normal" }}>
                  <div
                    title={x.message}
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {x.message}
                  </div>
                </td>
                <td style={tdBase}>
                  <Ellip title={new Date(x.created_at).toLocaleString()}>
                    {new Date(x.created_at).toLocaleDateString()}
                  </Ellip>
                </td>
                <td style={tdBase}>
                  <select
                    value={x.status}
                    onChange={(e) =>
                      doUpdateOne(x.id, e.target.value as ContactStatus)
                    }
                    disabled={busy}
                    style={{
                      padding: "4px 6px",
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                      fontSize: 12,
                      width: "100%",
                    }}
                  >
                    <option value="new">new</option>
                    <option value="in_review">in_review</option>
                    <option value="done">done</option>
                    <option value="spam">spam</option>
                    <option value="archived">archived</option>
                  </select>
                </td>
                <td style={tdBase}>
                  <button
                    onClick={() => doDeleteOne(x.id)}
                    disabled={busy}
                    style={{
                      padding: "4px 8px",
                      borderRadius: 8,
                      border: "1px solid #ef4444",
                      color: "#ef4444",
                      fontSize: 12,
                      width: "100%",
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
                  colSpan={11}
                  style={{
                    padding: 12,
                    textAlign: "center",
                    color: "#6b7280",
                    fontSize: 13,
                  }}
                >
                  Нет заявок
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
