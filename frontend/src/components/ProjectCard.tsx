'use client';

import { useMemo } from 'react';

export type Project = {
  id: number;
  title: string;
  status: 'new' | 'in_progress' | 'done' | string;
  assigneeName?: string;
  start_at?: string; // ISO
  due_at?: string;   // ISO
};

export default function ProjectCard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: (id: number) => void;
}) {
  // мемоизируем даты, чтобы не было лишних пересчётов
  const start = useMemo(
    () => (project.start_at ? new Date(project.start_at) : undefined),
    [project.start_at]
  );
  const due = useMemo(
    () => (project.due_at ? new Date(project.due_at) : undefined),
    [project.due_at]
  );
  const overdue = !!(due && due.getTime() < Date.now());

  return (
    <button
      type="button"
      onClick={() => onOpen(project.id)}
      className="w-full text-left rounded-2xl border bg-white/80 hover:bg-white transition shadow-sm p-4 flex flex-col gap-2"
    >
      <div className="flex items-center gap-2">
        <h3 className="font-medium text-gray-900 flex-1 truncate">
          {project.title}
        </h3>
        <span className={`text-xs px-2 py-0.5 rounded-full ${chip(project.status)}`}>
          {label(project.status)}
        </span>
      </div>

      {project.assigneeName && (
        <div className="text-sm text-gray-600">
          Исполнитель: <span className="font-medium">{project.assigneeName}</span>
        </div>
      )}

      {(start || due) && (
        <div className="mt-1 text-sm">
          <span className="text-gray-500">📅 Дедлайн: </span>
          <span className="font-medium">
            {start ? formatDate(start) : '—'} —{' '}
            <span className={overdue ? 'text-red-600' : 'text-emerald-700'}>
              {due ? formatDate(due) : 'не задан'}
            </span>
          </span>
          {overdue && (
            <span className="ml-2 text-xs px-2 py-0.5 rounded bg-red-100 text-red-700">
              просрочен
            </span>
          )}
        </div>
      )}
    </button>
  );
}

function formatDate(d: Date) {
  return d.toLocaleDateString('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit' });
}
function chip(s: string) {
  if (s === 'new') return 'bg-blue-100 text-blue-700';
  if (s === 'in_progress') return 'bg-amber-100 text-amber-700';
  if (s === 'done') return 'bg-emerald-100 text-emerald-700';
  return 'bg-gray-100 text-gray-700';
}
function label(s: string) {
  if (s === 'new') return 'new';
  if (s === 'in_progress') return 'в работе';
  if (s === 'done') return 'готово';
  return s;
}
