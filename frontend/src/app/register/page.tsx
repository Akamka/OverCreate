'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080/api';

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
        // постараемся вытащить текст ошибки от API
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }

      const json = await res.json() as { token: string; user: { id: number; name: string } };
      // сохраняем токен и в личный кабинет
      localStorage.setItem('token', json.token);
      router.replace('/dashboard');
    } catch (err) {
      const msg = (err as Error).message;
      setError(msg.includes('email') ? 'Email уже занят' : 'Не удалось зарегистрироваться');
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
        />
        <input
          className="w-full border rounded-lg px-3 py-2"
          type="password"
          placeholder="Пароль"
          required
          minLength={6}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <input
          className="w-full border rounded-lg px-3 py-2"
          type="password"
          placeholder="Повторите пароль"
          required
          minLength={6}
          value={form.password_confirmation}
          onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
        />

        {error && (
          <div className="text-sm text-red-600">{error}</div>
        )}

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
