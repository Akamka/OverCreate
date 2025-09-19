'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8080/api';

function getToken(): string {
  // сначала sessionStorage (вход «на одну вкладку»), потом localStorage («запомнить меня»)
  return (
    (typeof window !== 'undefined' && sessionStorage.getItem('token')) ||
    (typeof window !== 'undefined' && localStorage.getItem('token')) ||
    ''
  );
}

export default function VerifyEmailPage() {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function resend() {
    setMsg(null);
    setErr(null);

    const token = getToken();
    if (!token) {
      router.replace('/login?redirect=/verify-email');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/email/verification-notification`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (res.ok) {
        setMsg('Письмо отправлено. Проверьте почту.');
        return;
      }

      // аккуратно разбираем типичные ошибки, НО не выводим HTML тела
      if (res.status === 401) {
        setErr('Сессия истекла. Войдите снова.');
        router.replace('/login?redirect=/verify-email');
        return;
      }
      if (res.status === 429) {
        setErr('Слишком часто. Попробуйте через минуту.');
        return;
      }

      // попробуем прочитать JSON сообщение, но не показываем сырое HTML
      let detail = '';
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const j = await res.json().catch(() => null);
        detail = j?.message ? ` ${j.message}` : '';
      }
      setErr(`Не удалось отправить письмо.${detail}`);
    } catch (e) {
      setErr('Сеть недоступна. Попробуйте ещё раз.');
      console.error('[verify-email resend]', e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Подтвердите e-mail</h1>
      <p className="text-sm text-gray-600">
        Мы отправили письмо с подтверждением. Перейдите по ссылке из письма.
      </p>

      <button
        onClick={resend}
        disabled={loading}
        className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50"
      >
        {loading ? 'Отправляем…' : 'Отправить письмо ещё раз'}
      </button>

      {msg && <div className="text-green-600 text-sm">{msg}</div>}
      {err && <div className="text-red-600 text-sm">{err}</div>}
    </div>
  );
}
