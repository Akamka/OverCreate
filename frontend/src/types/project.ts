import type { User } from './user';

export type Project = {
  id: number;
  title: string;
  description?: string | null;
  status: 'new' | 'in_progress' | 'review' | 'done' | 'cancelled' | string;
  progress: number;

  assignee?: Pick<User, 'id' | 'name'> | null;
  client?: Pick<User, 'id' | 'name'> | null;

  /** дата старта проекта (ISO), может быть null/не задана */
  start_at?: string | null;

  /** дедлайн проекта (ISO), может быть null/не задана */
  due_at?: string | null;
};
