export type ContactSubmission = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  page?: string | null;
  subject?: string | null;
  message: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  ip?: string | null;
  created_at: string;
  updated_at?: string;
};

export type PaginationLink = { url: string | null; label: string; active: boolean };
export type Paginated<T> = {
  data: T[];
  links: PaginationLink[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
};


export type User = {
  id: number;
  name: string;
  email: string;
  role: 'client' | 'staff' | 'admin';
  created_at?: string;
  updated_at?: string;
};

export type Project = {
  id: number;
  title: string;
  description?: string | null;
  status: 'new' | 'in_progress' | 'paused' | 'done';
  progress: number; // 0..100
  user_id: number;
  assignee_id?: number | null;
  user?: Pick<User, 'id' | 'name' | 'email'>;
  assignee?: Pick<User, 'id' | 'name' | 'email'> | null;
  created_at?: string;
  updated_at?: string;
};
