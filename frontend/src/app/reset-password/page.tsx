'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { API_URL, setToken } from '@/lib/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const search = useSearchParams();

  const token = search.get('token') || '';
  const email = search.get('email') || '';

  const [password, setPassword] = useState('');
  const [password_confirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const canSubmit = useMemo(
    () => token && email && password.length >= 6 && password === password_confirmation,
    [token, email, password, password_confirmation]
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ token, email, password, password_confirmation }),
      });
      if (!res.ok) throw new Error(await res.text());
      setOk(true);
      // На твоём API логин отдельно; можно сразу отправить на /login
      router.replace('/login?reset=1');
    } catch (e) {
      setErr((e as Error).message || 'Не удалось сбросить пароль');
    } finally {
      setLoading(false);
    }
  }

  if (!token || !email) {
    return (
      <div className="max-w-md mx-auto p-6">
        Неверная ссылка. Попросите отправить письмо ещё раз.
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Новый пароль</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border rounded-lg px-3 py-2" value={email} disabled />
        <input
          type="password"
          placeholder="Пароль (мин. 6)"
          className="w-full border rounded-lg px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        <input
          type="password"
          placeholder="Повторите пароль"
          className="w-full border rounded-lg px-3 py-2"
          value={password_confirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          minLength={6}
          required
        />
        {err && <div className="text-sm text-red-600">{err}</div>}
        <button className="w-full py-2 rounded-lg bg-black text-white disabled:opacity-50" disabled={!canSubmit || loading}>
          {loading ? 'Сохраняем…' : 'Сохранить пароль'}
        </button>
      </form>
    </div>
  );
}
