'use client';

import ProjectCard, { type Project } from '@/components/ProjectCard';

const projects: Project[] = [
  {
    id: 1,
    title: 'test 1',
    status: 'in_progress',
    assigneeName: 'Designer',
    start_at: '2025-09-15T09:00:00Z',
    due_at: '2025-09-28T18:00:00Z',
  },
  {
    id: 2,
    title: 'Лендинг',
    status: 'new',
    assigneeName: 'Dmytro',
    // без дедлайна
  },
];

export default function DashboardProjects() {
  return (
    <div className="grid gap-3">
      {projects.map((p) => (
        <ProjectCard
          key={p.id}
          project={p}
          onOpen={(id) => console.log('open project', id)}
        />
      ))}
    </div>
  );
}
