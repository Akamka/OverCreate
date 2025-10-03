'use client';

import Link from 'next/link';

export type Project = {
  id: number;
  title: string;
  status?: 'new' | 'in_progress' | 'paused' | 'done' | string;
  description?: string | null;
  progress?: number;
  assigneeName?: string;
  assignee?: { name?: string | null } | null;
  start_at?: string;
  due_at?: string;
};

const STATUS_TEXT: Record<string, string> = {
  new: 'Новый',
  in_progress: 'В работе',
  paused: 'Пауза',
  done: 'Готово',
};
const STATUS_STYLES: Record<string, string> = {
  new: 'bg-sky-100/80 text-sky-800',
  in_progress: 'bg-amber-100/80 text-amber-900',
  paused: 'bg-zinc-200/70 text-zinc-800',
  done: 'bg-emerald-100/80 text-emerald-900',
};

function Progress({ v = 0 }: { v?: number }) {
  const value = Math.max(0, Math.min(100, v));
  return (
    <div className="h-2 w-full rounded-full bg-white/10 ring-1 ring-white/10 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-fuchsia-400 to-violet-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export default function DashboardProjects({ projects }: { projects: Project[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => (
        <Link
          key={p.id}
          href={`/projects/${p.id}`}
          className="group rounded-2xl border border-white/15 bg-white/5 backdrop-blur p-5 hover:border-white/25 hover:bg-white/10 transition"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-medium truncate">{p.title}</div>
              {p.description && (
                <div className="text-xs text-white/70 mt-0.5 line-clamp-2">{p.description}</div>
              )}
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                STATUS_STYLES[p.status ?? 'new'] ?? STATUS_STYLES.new
              }`}
            >
              {STATUS_TEXT[p.status ?? 'new'] ?? p.status}
            </span>
          </div>

          <div className="mt-3">
            <Progress v={p.progress ?? 0} />
          </div>

          <div className="mt-2 text-xs text-white/70">
            Исполнитель:{' '}
            <span className="text-white/90 font-medium">
              {p.assignee?.name ?? p.assigneeName ?? '—'}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
