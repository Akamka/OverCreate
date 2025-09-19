'use client';
import { useState } from 'react';

function getToken() {
  // если у тебя есть общий хелпер setToken/getToken — используй его
  return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
}

export default function VerifyEmailPage() {
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function resend() {
    setMsg(null); setErr(null);
    const token = getToken();
    const res = await fetch('/api/email/verification-notification', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setMsg('Письмо отправлено. Проверьте почту.');
    else setErr('Не удалось отправить письмо. Попробуйте позже.');
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Подтвердите e-mail</h1>
      <p className="text-sm text-gray-600">
        Мы отправили письмо с подтверждением. Перейдите по ссылке из письма, чтобы получить доступ к кабинету.
      </p>
      <button onClick={resend} className="px-4 py-2 rounded-xl bg-black text-white">
        Отправить письмо ещё раз
      </button>
      {msg && <div className="text-green-600 text-sm">{msg}</div>}
      {err && <div className="text-red-600 text-sm">{err}</div>}
    </div>
  );
}
