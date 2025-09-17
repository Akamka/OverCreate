export type Role = 'client' | 'staff' | 'admin';

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
};
