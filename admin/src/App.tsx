import TokenGate from "./components/TokenGate";
import ContactsPage from "./pages/Contacts";

export default function App() {
  return (
    <div style={{ minHeight: "100vh", background: "#f6f7fb", color: "#111" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "16px 24px" }}>
          <h1 style={{ margin: 0 }}>Админка — Заявки (CTA)</h1>
        </div>
      </header>
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px" }}>
        <TokenGate>
          <ContactsPage />
        </TokenGate>
      </main>
    </div>
  );
}
