'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { API_URL, setToken } from '@/lib/api';

type LoginResponse = {
  token: string;
  user: { id: number; name: string; email: string; role: 'client' | 'staff' | 'admin' };
};

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // “Запомнить меня” = сохранить в localStorage. По умолчанию — false (т.е. sessionStorage, своя сессия на вкладку)
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const redirectTo = search.get('redirect') || '/dashboard';

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
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const json = (await res.json()) as LoginResponse;

      // ⬇️ ВАЖНО: кладём токен через setToken (sessionStorage по умолчанию)
      setToken(json.token, remember);

      router.replace(redirectTo);
    } catch (e) {
      const msg = (e as Error).message;
      setErr(msg.includes('422') ? 'Неверный логин или пароль' : 'Не удалось войти');
      console.error('[login]', e);
    } finally {
      setLoading(false);
    }
  }

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
        />
        <input
          className="w-full border rounded-lg px-3 py-2"
          type="password"
          placeholder="Пароль"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          Запомнить меня (общая сессия для всех вкладок)
        </label>

        {err && <div className="text-sm text-red-600">{err}</div>}

        <button
          type="submit"
          disabled={loading}
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
