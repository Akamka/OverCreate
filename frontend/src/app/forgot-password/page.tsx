'use client';

import { useState, type CSSProperties } from 'react';
import PremiumBackground from '@/components/PremiumBackground';
import { API_URL } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // same accent palette as dashboard/project/auth
  const accents: CSSProperties & { ['--acc1']?: string; ['--acc2']?: string; ['--acc3']?: string } =
    {
      '--acc1': '59 130 246',   // blue-500
      '--acc2': '168 85 247',   // purple-500
      '--acc3': '45 212 191',   // teal-400
    };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSent(false);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email }),
      });

      // Security best-practice: always show a generic success message
      if (!res.ok) {
        try {
          const txt = await res.text();
          console.warn('[forgot-password]', res.status, txt);
        } catch {}
      }
      setSent(true);
    } catch (e) {
      console.warn('[forgot-password] request failed', e);
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = /\S+@\S+\.\S+/.test(email) && !loading;

  return (
    <div className="relative min-h-[100dvh] text-white" style={accents}>
      <PremiumBackground />

      <div className="relative z-10 flex items-center justify-center px-5 py-10">
        <div
          className={[
            'w-full max-w-[560px] rounded-3xl border border-white/12 bg-white/[.035] backdrop-blur-xl',
            'shadow-[0_10px_40px_-15px_rgba(0,0,0,.6)] overflow-hidden',
          ].join(' ')}
        >
          {/* header */}
          <div className="relative px-6 pt-6 pb-4 border-b border-white/10">
            <h1
              className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, rgb(var(--acc1)), rgb(var(--acc2)))' }}
            >
              Reset password
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Enter your e-mail and we’ll send a reset link if the account exists.
            </p>

            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                background:
                  'radial-gradient(70% 60% at 10% -10%, rgb(var(--acc1) / .10), transparent 60%), radial-gradient(70% 60% at 110% 110%, rgb(var(--acc2) / .10), transparent 60%)',
                filter: 'blur(60px)',
              }}
            />
          </div>

          {/* form */}
          <form onSubmit={submit} className="relative p-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-white/65">
                Email
              </span>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/12 bg-white/[.06] px-3 py-2.5 text-white placeholder-white/50
                           outline-none focus:ring-2 focus:ring-white/30 focus:border-white/20 transition"
                autoComplete="email"
              />
            </label>

            <button
              type="submit"
              disabled={!canSubmit}
              className={[
                'w-full py-2.5 rounded-xl text-sm font-semibold text-black',
                'bg-[linear-gradient(135deg,rgb(var(--acc1)),rgb(var(--acc2)))]',
                'shadow-[0_12px_28px_-12px_rgb(59_130_246_/_0.55),0_1px_0_rgba(255,255,255,.25)_inset]',
                'transition-transform duration-200 hover:-translate-y-[2px] active:translate-y-0',
                'disabled:opacity-60 disabled:hover:translate-y-0',
              ].join(' ')}
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>

            {sent && (
              <div className="text-sm text-emerald-300/95 border border-emerald-300/30 bg-emerald-500/10 rounded-lg px-3 py-2">
                If that address exists, we’ve sent an email with further instructions.
              </div>
            )}

            {err && (
              <div className="text-sm text-rose-300/95 border border-rose-300/30 bg-rose-500/10 rounded-lg px-3 py-2">
                {err}
              </div>
            )}

            <div className="pt-1 text-sm text-white/75">
              Remember the password?{' '}
              <a href="/login" className="underline hover:text-white">
                Sign in
              </a>
              <span className="mx-2 opacity-40">•</span>
              <a href="/register" className="underline hover:text-white">
                Create account
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
