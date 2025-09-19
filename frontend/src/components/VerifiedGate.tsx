'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiGet, getToken } from '@/lib/api'; // ← используем общий клиент

type Me = { id: number; email: string; email_verified_at?: string | null };

export default function VerifiedGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const search = useSearchParams();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const token = getToken();
        if (!token) { router.replace('/login'); return; }

        // ВАЖНО: ходим в Laravel через apiGet (он подставит API_URL и Bearer)
        const me = await apiGet<Me>('/me');

        if (!me?.email_verified_at) {
          // Можем пробросить redirect-откуда, чтобы после верификации вернуть юзера
          const from = encodeURIComponent(location.pathname + location.search);
          router.replace(`/verify-email?from=${from}`);
          return;
        }

        if (!cancelled) setOk(true);
      } catch (e) {
        // Если токен невалиден/401 — на логин
        router.replace('/login');
      }
    })();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, search]); // зависимостей по токену нет — он читается внутри

  if (!ok) return null; // при желании можно отрисовать скелет/спиннер
  return <>{children}</>;
}
