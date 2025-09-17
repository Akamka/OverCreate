import type { User } from './user';

export type Project = {
  id: number;
  title: string;
  description?: string | null;
  status: 'new' | 'in_progress' | 'review' | 'done' | 'cancelled' | string;
  progress: number;
  assignee?: Pick<User, 'id' | 'name'> | null;
  client?: Pick<User, 'id' | 'name'> | null;
};
