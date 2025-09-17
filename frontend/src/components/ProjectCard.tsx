'use client';

import Link from 'next/link';
import ProgressBar from './ui/ProgressBar';
import type { Project } from '@/types/project';

export default function ProjectCard({ p }: { p: Project }) {
  return (
    <div className="rounded-2xl p-5 bg-white shadow hover:shadow-lg transition">
      <h3 className="font-semibold text-lg mb-2">{p.title}</h3>
      {p.description && <p className="text-sm text-gray-600 line-clamp-2 mb-3">{p.description}</p>}
      <ProgressBar value={p.progress} />
      <div className="text-xs text-gray-500 mt-2">
        Статус: {p.status} • Исполнитель: {p.assignee?.name ?? '—'}
      </div>
      <Link href={`/projects/${p.id}`} className="inline-block mt-4 px-4 py-2 rounded-xl bg-black text-white">
        Открыть
      </Link>
    </div>
  );
}
