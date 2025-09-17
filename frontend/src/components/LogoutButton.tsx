'use client';

import { useRouter } from 'next/navigation';
import { apiSend, clearToken } from '@/lib/api';
import { useState } from 'react';

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onLogout() {
    setLoading(true);
    try {
      // можем игнорировать ошибку — токен всё равно почистим
      await apiSend('/auth/logout', 'POST');
    } catch {
      /* noop */
    } finally {
      clearToken();
      router.replace('/login');
    }
  }

  return (
    <button
      onClick={onLogout}
      disabled={loading}
      className={className ?? 'px-3 py-2 rounded-lg border'}
    >
      {loading ? 'Выходим…' : 'Выйти'}
    </button>
  );
}
