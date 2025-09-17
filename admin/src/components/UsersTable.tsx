import type { User, Paginated } from "../types";

type Props = {
  items: User[];
  pagination?: Paginated<User>["links"];
  onNavigate?: (url: string) => void;
  onChangeRole?: (id: number, role: User['role']) => void;
};

export default function UsersTable({ items, pagination, onNavigate, onChangeRole }: Props) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["ID","Имя","Email","Роль","Действия"].map(h =>
                <th key={h} style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb" }}>{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {items.map(u => (
              <tr key={u.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td style={{ padding: 8 }}>{u.id}</td>
                <td style={{ padding: 8 }}>{u.name}</td>
                <td style={{ padding: 8 }}>{u.email}</td>
                <td style={{ padding: 8 }}>
                  <select
                    value={u.role}
                    onChange={(e) => onChangeRole?.(u.id, e.target.value as User['role'])}
                    style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid #e5e7eb" }}
                  >
                    <option value="client">client</option>
                    <option value="staff">staff</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td style={{ padding: 8, color: "#6b7280" }}>—</td>
              </tr>
            ))}
            {!items.length && (
              <tr><td colSpan={5} style={{ padding: 16, textAlign: "center", color: "#6b7280" }}>Нет данных</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {!!pagination?.length && onNavigate && (
        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {pagination.map((l, i) =>
            l.url ? (
              <button key={i} onClick={() => onNavigate(l.url!)} disabled={l.active}
                style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #e5e7eb",
                         background: l.active ? "#e5e7eb" : "#fff" }}
                dangerouslySetInnerHTML={{ __html: l.label }}
              />
            ) : <span key={i} />
          )}
        </div>
      )}
    </div>
  );
}
