'use client';

import Link from 'next/link';

export type Project = {
  id: number;
  title: string;
  description?: string | null;
  status: 'new' | 'in_progress' | 'paused' | 'done' | string;
  progress?: number | null;
  start_at?: string | null;
  due_at?: string | null;
  assignee?: { name?: string | null } | null;
  // для моков:
  assigneeName?: string | null;
};

function toDate(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isFinite(d.getTime()) ? d : null;
}
function fmtDate(iso?: string | null) {
  const d = toDate(iso);
  return d
    ? d.toLocaleDateString('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit' })
    : '—';
}
function daysLeft(iso?: string | null) {
  const d = toDate(iso);
  if (!d) return undefined;
  return Math.max(0, Math.ceil((d.getTime() - Date.now()) / 86_400_000));
}

function StatusChip({ s }: { s: Project['status'] }) {
  const map: Record<string, { text: string; dot: string; bg: string }> = {
    new: { text: 'Новый', dot: 'bg-sky-400', bg: 'bg-sky-400/10 text-sky-200' },
    in_progress: { text: 'В работе', dot: 'bg-amber-400', bg: 'bg-amber-400/10 text-amber-200' },
    paused: { text: 'На паузе', dot: 'bg-zinc-400', bg: 'bg-zinc-400/10 text-zinc-200' },
    done: { text: 'Готово', dot: 'bg-emerald-400', bg: 'bg-emerald-400/10 text-emerald-200' },
  };
  const v = map[s] || { text: s, dot: 'bg-violet-400', bg: 'bg-violet-400/10 text-violet-200' };
  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs ${v.bg}`}>
      <span className={`h-2 w-2 rounded-full ${v.dot}`} />
      {v.text}
    </span>
  );
}

export default function ProjectCard({ project }: { project: Project }) {
  const p = project;
  const safeProgress = Math.max(0, Math.min(100, Number(p.progress ?? 0)));
  const left = daysLeft(p.due_at);
  const overdue = typeof left === 'number' && left === 0 && !!p.due_at;

  return (
    <Link
      href={`/projects/${p.id}`}
      className="group relative block rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 md:p-5
                 shadow-[0_10px_40px_-15px_rgba(0,0,0,.6)] ring-1 ring-white/10 hover:ring-white/20 hover:shadow-[0_16px_60px_-15px_rgba(0,0,0,.7)] transition"
    >
      {/* мягкая подсветка при hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition
                      bg-gradient-to-r from-fuchsia-500/10 via-indigo-500/10 to-cyan-500/10" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold text-white/95 truncate">{p.title}</div>
          {!!p.description && (
            <div className="text-sm text-white/60 line-clamp-2 mt-1">{p.description}</div>
          )}
        </div>
        <StatusChip s={p.status} />
      </div>

      {/* прогресс */}
      <div className="mt-3">
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 via-indigo-400 to-cyan-400 transition-[width]"
            style={{ width: `${safeProgress}%` }}
          />
        </div>
      </div>

      {/* датки */}
      <div className="mt-3 grid grid-cols-2 gap-3 text-[13px]">
        <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-2">
          <div className="text-white/50">Старт</div>
          <div className="font-medium text-white/90">{fmtDate(p.start_at)}</div>
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-2">
          <div className="text-white/50">Дедлайн</div>
          <div className={`font-medium ${overdue ? 'text-rose-300' : 'text-white/90'}`}>
            {fmtDate(p.due_at)}
          </div>
        </div>
      </div>

      {/* исполнитель */}
      <div className="mt-2 text-xs text-white/60">
        Исполнитель:{' '}
        <span className="font-medium text-white/90">
          {p.assignee?.name ?? p.assigneeName ?? '—'}
        </span>
      </div>
    </Link>
  );
}
