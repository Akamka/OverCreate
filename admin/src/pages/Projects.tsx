"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getSavedToken,
  adminListProjects,
  adminListStaff,
  adminCreateProject,
  adminUpdateProject,
  adminDeleteProject,
  adminListUsers,
} from "../api";
import type { User, Project, Paginated } from "../types";
import ProjectsTable from "../components/ProjectsTable";

/* ---------- Вспомогательное модальное окно создания ---------- */
function CreateProjectModal({
  open,
  onClose,
  staff,
  clients,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  staff: User[];
  clients: User[];
  onCreate: (data: Partial<Project>) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Project["status"]>("new");
  const [progress, setProgress] = useState(0);
  const [userId, setUserId] = useState<number | "">("");
  const [assigneeId, setAssigneeId] = useState<number | "">("");
  const [saving, setSaving] = useState(false);
  const canSave = title.trim().length > 0 && typeof userId === "number";

  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setStatus("new");
      setProgress(0);
      setUserId("");
      setAssigneeId("");
      setSaving(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.35)",
        display: "grid",
        placeItems: "center",
        padding: 16,
        zIndex: 50,
      }}
    >
      <div
        style={{
          width: "min(680px, 100%)",
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 16,
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>Создать проект</h3>

        <div style={{ display: "grid", gap: 10 }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название"
            style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #e5e7eb" }}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание"
            rows={3}
            style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #e5e7eb" }}
          />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Project["status"])}
              style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #e5e7eb" }}
            >
              <option value="new">new</option>
              <option value="in_progress">in_progress</option>
              <option value="paused">paused</option>
              <option value="done">done</option>
            </select>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="range"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
              />
              <span style={{ fontSize: 12, color: "#6b7280" }}>{progress}%</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value ? Number(e.target.value) : "")}
              style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #e5e7eb", minWidth: 240 }}
            >
              <option value="">— выберите клиента —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.email}
                </option>
              ))}
            </select>

            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value ? Number(e.target.value) : "")}
              style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #e5e7eb", minWidth: 240 }}
            >
              <option value="">— исполнитель (необязательно) —</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 14 }}>
          <button onClick={onClose} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #e5e7eb" }}>
            Отмена
          </button>
          <button
            disabled={!canSave || saving}
            onClick={async () => {
              if (!canSave) return;
              try {
                setSaving(true);
                await onCreate({
                  title: title.trim(),
                  description: description.trim(),
                  status,
                  progress,
                  user_id: userId as number,
                  assignee_id: (assigneeId || undefined) as number | undefined,
                });
                onClose();
              } finally {
                setSaving(false);
              }
            }}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              background: "#111",
              color: "#fff",
              opacity: canSave ? 1 : 0.6,
            }}
          >
            Создать
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Страница ---------------------------- */

export default function ProjectsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Project[]>([]);
  const [links, setLinks] = useState<Paginated<Project>["links"] | undefined>();
  const [staff, setStaff] = useState<User[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [q, setQ] = useState("");
  const [openCreate, setOpenCreate] = useState(false);

  const token = useMemo(() => getSavedToken(), []);

  const load = useCallback(
    async (pageUrl?: string) => {
      if (!token) return;
      setLoading(true);
      try {
        let page: number | undefined;
        if (pageUrl) {
          const p = new URL(pageUrl);
          page = Number(p.searchParams.get("page") || "1");
        }
        const data = await adminListProjects(token, { q, page });
        setItems(data.data || []);
        setLinks(data.links);

        if (!staff.length) setStaff(await adminListStaff(token));
        if (!clients.length) {
          const list = await adminListUsers(token, { role: "client", page: 1 });
          setClients(list.data || []);
        }
      } finally {
        setLoading(false);
      }
    },
    [token, q, staff.length, clients.length]
  );

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(data: Partial<Project>) {
    if (!token) return;
    const p = await adminCreateProject(token, data);
    setItems((prev) => [p, ...prev]);
  }

  async function handleUpdate(id: number, patch: Partial<Project>) {
    if (!token) return;
    const upd = await adminUpdateProject(token, id, patch);
    setItems((prev) => prev.map((x) => (x.id === id ? upd : x)));
  }

  async function handleDelete(id: number) {
    if (!token) return;
    await adminDeleteProject(token, id);
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск по названию/описанию"
          style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #e5e7eb", minWidth: 260 }}
        />
        <button
          onClick={() => load()}
          style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #e5e7eb" }}
        >
          Фильтр
        </button>
        <button
          onClick={() => setOpenCreate(true)}
          style={{ padding: "8px 10px", borderRadius: 10, background: "#111", color: "#fff" }}
        >
          + Создать
        </button>
      </div>

      {loading ? (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
          Загрузка…
        </div>
      ) : (
        <ProjectsTable
          items={items}
          staff={staff}
          clients={clients}
          pagination={links}
          onNavigate={load}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}

      <CreateProjectModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        staff={staff}
        clients={clients}
        onCreate={handleCreate}
      />
    </div>
  );
}
