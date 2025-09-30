export type ContactStatus = 'new' | 'in_review' | 'done' | 'spam' | 'archived';

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
  status: ContactStatus;         // <— добавили
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
  email_verified_at: string | null;
  created_at?: string;
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

/* ---------- Portfolio ---------- */
export type ServiceSlug = 'motion' | 'graphic' | 'web' | 'dev' | 'printing';

export type PortfolioItem = {
  id: number;
  title: string;
  slug: string;
  service_type: ServiceSlug | string;
  cover_url?: string | null;
  gallery?: string[] | null;
  client?: string | null;
  tags?: string | null;
  excerpt?: string | null;
  body?: string | null;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
  meta_title?: string | null;
  meta_description?: string | null;
  created_at: string;
  updated_at?: string;
};
