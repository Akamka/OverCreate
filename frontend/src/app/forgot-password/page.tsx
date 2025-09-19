'use client';

import { useState } from 'react';
import { API_URL } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setSent(false); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSent(true);
    } catch {
      // намеренно не показываем, существует ли email
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Восстановление пароля</h1>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="email"
          required
          placeholder="Ваш email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        />
        <button className="w-full py-2 rounded-lg bg-black text-white disabled:opacity-50" disabled={loading}>
          {loading ? 'Отправляем…' : 'Отправить ссылку'}
        </button>
      </form>
      {sent && <div className="text-sm text-green-700">Если такой адрес существует, письмо отправлено.</div>}
      {err &&  <div className="text-sm text-red-600">{err}</div>}
    </div>
  );
}
