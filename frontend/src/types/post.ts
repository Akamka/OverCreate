// /types/post.ts
export type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  body: string;
  published_at?: string | null;
  is_published?: boolean;             // ← правильное имя поля

  meta_title?: string | null;
  meta_description?: string | null;

  cta_text?: string | null;
  cta_url?: string | null;

  // keywords может прийти как строка из формы, либо как массив из БД
  keywords?: string[] | string | null;
};
