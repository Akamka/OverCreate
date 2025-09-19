'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { API_URL, setToken } from '@/lib/api';

type LoginResponse = {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: 'client' | 'staff' | 'admin';
    email_verified_at: string | null;
  };
};

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // “Запомнить меня” — кладём токен в localStorage (иначе — в sessionStorage)
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const redirectTo = useMemo(
    () => search.get('redirect') || '/dashboard',
    [search]
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
          const j = await res.json();
          msg = j?.message || msg;
        } catch {}
        throw new Error(msg);
      }

      const json = (await res.json()) as LoginResponse;

      // сохраняем токен (и в sessionStorage, и — при remember — в localStorage)
      setToken(json.token, remember);
      // на всякий случай — моментально в sessionStorage текущей вкладки
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('token', json.token);
        if (remember) localStorage.setItem('token', json.token);
      }

      // куда вести: если email не подтверждён — на verify
      const goTo = json.user.email_verified_at ? redirectTo : '/verify-email';

      // надёжный навигатор
      try {
        await router.push(goTo);
        router.refresh();
      } catch {
        // fallback, если что-то не так с роутером
        window.location.assign(goTo);
      }
    } catch (e) {
      const msg = (e as Error).message || '';
      setErr(
        /422|invalid|credentials/i.test(msg)
          ? 'Неверный e-mail или пароль'
          : 'Не удалось войти. Попробуйте ещё раз.'
      );
      console.error('[login]', e);
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = email.trim().length > 3 && password.length >= 1 && !loading;

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Вход</h1>

      <form onSubmit={submit} className="space-y-3">
        <input
          className="w-full border rounded-lg px-3 py-2"
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <input
          className="w-full border rounded-lg px-3 py-2"
          type="password"
          placeholder="Пароль"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-gray-700">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Запомнить меня (общая сессия для всех вкладок)
          </label>

          <a
            href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}${
              redirectTo ? `${email ? '&' : '?'}redirect=${encodeURIComponent(redirectTo)}` : ''
            }`}
            className="underline opacity-80 hover:opacity-100"
          >
            Забыли пароль?
          </a>
        </div>

        {err && <div className="text-sm text-red-600">{err}</div>}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-2 rounded-lg bg-black text-white disabled:opacity-50"
        >
          {loading ? 'Входим…' : 'Войти'}
        </button>
      </form>

      <div className="mt-3 text-sm text-gray-600">
        Нет аккаунта? <a href="/register" className="underline">Зарегистрироваться</a>
      </div>
    </div>
  );
}
