"use client";
import { useEffect, useMemo, useState } from "react";
import { listContactSubmissions, getSavedToken, toCSV } from "../api";
import type { ContactSubmission, Paginated } from "../types";
import ContactsTable from "../components/ContactsTable";

export default function ContactsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ContactSubmission[]>([]);
  const [links, setLinks] = useState<Paginated<ContactSubmission>["links"] | undefined>();
  const [query, setQuery] = useState("");

  async function load(url?: string) {
    const token = getSavedToken();
    if (!token) return;
    setLoading(true);
    try {
      const data = await listContactSubmissions(token, url);
      if (Array.isArray(data)) {
        setItems(data);
        setLinks(undefined);
      } else {
        setItems(data.data || []);
        setLinks(data.links);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(x =>
      `${x.first_name} ${x.last_name}`.toLowerCase().includes(q) ||
      (x.email || "").toLowerCase().includes(q) ||
      (x.phone || "").toLowerCase().includes(q) ||
      (x.message || "").toLowerCase().includes(q)
    );
  }, [items, query]);

  function exportCSV() {
    const csv = toCSV(filtered.map(x => ({
      id: x.id,
      name: `${x.first_name} ${x.last_name}`,
      email: x.email,
      phone: x.phone || "",
      page: x.page || "",
      subject: x.subject || "",
      message: x.message,
      created_at: x.created_at,
    })));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `contact_submissions.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          placeholder="Поиск (имя, email, телефон, сообщение)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #e5e7eb", minWidth: 280 }}
        />
        <button onClick={() => load()} style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #e5e7eb" }}>
          Обновить
        </button>
        <button onClick={exportCSV} style={{ padding: "8px 10px", borderRadius: 10, background: "#111", color: "#fff" }}>
          Экспорт CSV
        </button>
      </div>

      {loading ? (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
          Загрузка…
        </div>
      ) : (
        <ContactsTable items={filtered} pagination={links} onNavigate={load} />
      )}
    </div>
  );
}
