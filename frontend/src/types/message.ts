import type { User } from './user';

export type Message = {
  id: number;
  body: string;
  created_at: string;
  sender: Pick<User, 'id' | 'name'>;
};
