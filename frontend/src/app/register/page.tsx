'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

// тот же базовый URL, что и в других местах
const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080/api';

type RegisterResponse = {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string | null;
  };
  mustVerify?: boolean;
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
          const data = await res.json();
          msg = data?.message || msg;
        } catch {
          const txt = await res.text();
          if (txt) msg = txt;
        }
        throw new Error(msg);
      }

      const json = (await res.json()) as RegisterResponse;

      // сохраняем токен (можно заменить на ваш setToken, если используете общий хелпер)
      localStorage.setItem('token', json.token);

      // нужно ли подтверждение e-mail?
      const needsVerify =
        json.mustVerify === true ||
        json.user?.email_verified_at == null;

      router.replace(needsVerify ? '/verify-email' : '/dashboard');
    } catch (err) {
      const msg = (err as Error).message || '';
      setError(
        /email.*(taken|exists|unique)/i.test(msg)
          ? 'Email уже занят'
          : 'Не удалось зарегистрироваться'
      );
      console.error('[register]', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Регистрация</h1>

      <form onSubmit={submit} className="space-y-3">
        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Имя"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="w-full border rounded-lg px-3 py-2"
          type="email"
          placeholder="Email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          autoComplete="email"
        />
        <input
          className="w-full border rounded-lg px-3 py-2"
          type="password"
          placeholder="Пароль"
          required
          minLength={6}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          autoComplete="new-password"
        />
        <input
          className="w-full border rounded-lg px-3 py-2"
          type="password"
          placeholder="Повторите пароль"
          required
          minLength={6}
          value={form.password_confirmation}
          onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
          autoComplete="new-password"
        />

        {error && <div className="text-sm text-red-600">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg bg-black text-white disabled:opacity-50"
        >
          {loading ? 'Отправка…' : 'Создать аккаунт'}
        </button>
      </form>

      <div className="mt-3 text-sm text-gray-600">
        Уже есть аккаунт?{' '}
        <a href="/login" className="underline">Войти</a>
      </div>
    </div>
  );
}
