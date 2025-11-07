// admin/src/App.tsx
import { useEffect, useState } from "react";
import TokenGate from "./components/TokenGate";
import ContactsPage from "./pages/Contacts";
import UsersPage from "./pages/Users";
import ProjectsPage from "./pages/Projects";
import PortfolioPage from "./pages/Portfolio";

// ↓ добавили "posts"
type Tab = "contacts" | "users" | "projects" | "portfolio" | "posts";

// Лёгкий роутер для раздела Постов: #/posts → список, #/posts/:id или #/posts/new → редактор
import PostsPage from "./pages/Posts";
import PostEditPage from "./pages/PostEdit";

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

// определяем активную вкладку из location.hash
function detectTabFromHash(): Tab {
  const raw = (location.hash || "").replace(/^#\/?/, ""); // убрали # и возможный первый /
  if (raw.startsWith("posts")) return "posts";            // поддержка /posts, /posts/new, /posts/123
  if (raw === "users") return "users";
  if (raw === "projects") return "projects";
  if (raw === "portfolio") return "portfolio";
  return "contacts";
}

// выясняем, открыть ли редактор поста
function isPostEditRoute(hash: string): boolean {
  return /^#\/?posts\/.+/i.test(hash); // #/posts/<что-то>
}

export default function App() {
  const [tab, setTab] = useState<Tab>(detectTabFromHash());

  // ← добавили: тикер для любых изменений хэша, чтобы форсить ререндер в пределах таба "posts"
  const [hashTick, setHashTick] = useState(0);

  useEffect(() => {
    const onHash = () => {
      setTab(detectTabFromHash());
      setHashTick((t) => t + 1); // форсим перерисовку при #/posts → #/posts/new
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const renderPosts = () => {
    // если хэш вида #/posts/new или #/posts/123 — показываем редактор
    return isPostEditRoute(location.hash) ? <PostEditPage /> : <PostsPage />;
  };

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
            <NavButton to="contacts"  label="Заявки"       active={tab === "contacts"} />
            <NavButton to="users"     label="Пользователи" active={tab === "users"} />
            <NavButton to="projects"  label="Проекты"      active={tab === "projects"} />
            <NavButton to="portfolio" label="Портфолио"    active={tab === "portfolio"} />
            <NavButton to="posts"     label="Посты"        active={tab === "posts"} />
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: 24 }}>
        <TokenGate>
          {tab === "contacts"  && <ContactsPage />}
          {tab === "users"     && <UsersPage />}
          {tab === "projects"  && <ProjectsPage />}
          {tab === "portfolio" && <PortfolioPage />}
          {tab === "posts"     && <div key={hashTick}>{renderPosts()}</div>}
        </TokenGate>
      </main>
    </div>
  );
}
