import { useEffect, useState } from "react";
import TokenGate from "./components/TokenGate";
import ContactsPage from "./pages/Contacts";
import UsersPage from "./pages/Users";
import ProjectsPage from "./pages/Projects";

type Tab = "contacts" | "users" | "projects";

function NavButton({ to, label, active }: { to: Tab; label: string; active: boolean }) {
  return (
    <a
      href={`#${to}`}
      style={{
        padding: "8px 12px",
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        background: active ? "#111" : "#fff",
        color: active ? "#fff" : "#111",
        textDecoration: "none",
      }}
    >
      {label}
    </a>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>("contacts");

  useEffect(() => {
    const read = () => {
      const h = (location.hash.replace("#", "") as Tab) || "contacts";
      setTab(h);
    };
    window.addEventListener("hashchange", read);
    read();
    return () => window.removeEventListener("hashchange", read);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f6f7fb", color: "#111" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #e5e7eb" }}>
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            justifyContent: "space-between",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 18 }}>Админка</h1>
          <nav style={{ display: "flex", gap: 8 }}>
            <NavButton to="contacts" label="Заявки" active={tab === "contacts"} />
            <NavButton to="users" label="Пользователи" active={tab === "users"} />
            <NavButton to="projects" label="Проекты" active={tab === "projects"} />
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: 24 }}>
        <TokenGate>
          {tab === "contacts" && <ContactsPage />}
          {tab === "users" && <UsersPage />}
          {tab === "projects" && <ProjectsPage />}
        </TokenGate>
      </main>
    </div>
  );
}
