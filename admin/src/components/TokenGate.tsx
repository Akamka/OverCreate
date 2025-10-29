import { useEffect, useState } from "react";
import {
  getSavedToken,
  saveAdminToken,
  clearAdminToken,
  checkAdminToken,
} from "../lib/adminApi";

export default function TokenGate({ children }: { children: React.ReactNode }) {
  const [hasToken, setHasToken] = useState(false);
  const [val, setVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    // При загрузке страницы токена нет (он только в памяти), но оставим проверку на случай внутренней навигации
    setHasToken(!!getSavedToken());
  }, []);

  const handleLogin = async () => {
    const t = val.trim();
    if (!t) return;
    setLoading(true);
    setErr(null);
    const ok = await checkAdminToken(t);
    setLoading(false);

    if (!ok) {
      setErr("Неверный токен или нет доступа.");
      return;
    }
    // валидный токен — сохраняем в рантайм и пускаем
    saveAdminToken(t);
    setHasToken(true);
    setVal("");
  };

  if (!hasToken) {
    return (
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 24 }}>
        <h2 style={{ marginTop: 0 }}>Вход по админ-токену</h2>
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="X-Admin-Token"
          type="password"
          autoFocus
          disabled={loading}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #d1d5db" }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleLogin();
            }
          }}
        />
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            marginTop: 12,
            width: "100%",
            padding: "10px 12px",
            borderRadius: 12,
            background: loading ? "#6b7280" : "#111",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Проверка..." : "Войти"}
        </button>
        {err && (
          <div style={{ marginTop: 8, color: "#b91c1c", fontSize: 14 }}>
            {err}
          </div>
        )}
        <p style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
          Токен не сохраняется в браузере и будет запрошен при каждом заходе.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 12, color: "#6b7280", fontSize: 14 }}>
        Токен применён.{" "}
        <button
          onClick={() => {
            clearAdminToken();
            setHasToken(false);
            setVal("");
            setErr(null);
          }}
          style={{ textDecoration: "underline" }}
        >
          Сменить
        </button>
      </div>
      {children}
    </div>
  );
}
