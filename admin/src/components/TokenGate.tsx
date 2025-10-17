import { useEffect, useState } from "react";
import { getSavedToken, saveAdminToken, clearAdminToken } from "../lib/adminApi";

export default function TokenGate({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [val, setVal] = useState("");

  useEffect(() => {
    const saved = getSavedToken();
    if (saved) setToken(saved);
    const def = import.meta.env.VITE_DEFAULT_ADMIN_TOKEN as string | undefined;
    if (!saved && def) setVal(def);
  }, []);

  if (!token) {
    return (
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 24 }}>
        <h2 style={{ marginTop: 0 }}>Вход по админ-токену</h2>
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="X-Admin-Token"
          style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #d1d5db" }}
        />
        <button
          onClick={() => { if (val.trim()) { saveAdminToken(val.trim()); setToken(val.trim()); } }}
          style={{ marginTop: 12, width: "100%", padding: "10px 12px", borderRadius: 12, background: "#111", color: "#fff" }}
        >
          Войти
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 12, color: "#6b7280", fontSize: 14 }}>
        Токен применён.{" "}
        <button
          onClick={() => { clearAdminToken(); setToken(null); }}
          style={{ textDecoration: "underline" }}
        >
          Сменить
        </button>
      </div>
      {children}
    </div>
  );
}
