import type { ContactSubmission, Paginated } from "../types";

type Props = {
  items: ContactSubmission[];
  pagination?: Paginated<ContactSubmission>["links"];
  onNavigate?: (url: string) => void;
};

export default function ContactsTable({ items, pagination, onNavigate }: Props) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["ID","Имя","Email","Телефон","Страница","Тема","Сообщение","Дата"].map((h) =>
                <th key={h} style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb" }}>{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {items.map(x => (
              <tr key={x.id} style={{ borderTop: "1px solid #e5e7eb", verticalAlign: "top" }}>
                <td style={{ padding: 8 }}>{x.id}</td>
                <td style={{ padding: 8 }}>{x.first_name} {x.last_name}</td>
                <td style={{ padding: 8 }}>{x.email}</td>
                <td style={{ padding: 8 }}>{x.phone || ""}</td>
                <td style={{ padding: 8 }}>{x.page || ""}</td>
                <td style={{ padding: 8 }}>{x.subject || ""}</td>
                <td style={{ padding: 8, maxWidth: 420, whiteSpace: "pre-wrap" }}>{x.message}</td>
                <td style={{ padding: 8 }}>{new Date(x.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {!items.length && (
              <tr><td style={{ padding: 16, textAlign: "center", color: "#6b7280" }} colSpan={8}>Нет данных</td></tr>
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
                  padding: "6px 10px", borderRadius: 8, border: "1px solid #e5e7eb",
                  background: l.active ? "#e5e7eb" : "#fff"
                }}
                dangerouslySetInnerHTML={{ __html: l.label }}
              />
            ) : <span key={i} />
          )}
        </div>
      )}
    </div>
  );
}
