export type User = {
  id: number;
  name: string;
  email: string;
  role: 'client' | 'staff' | 'admin';
  created_at?: string;
  updated_at?: string;

  // 🔥 добавляем поле для статуса верификации
  email_verified_at?: string | null;
};
