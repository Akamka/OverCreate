'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useMemo, type CSSProperties } from 'react';
import PremiumBackground from '@/components/PremiumBackground';
import { API_URL } from '@/lib/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const search = useSearchParams();

  const token = search.get('token') || '';
  const email = search.get('email') || '';

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => Boolean(token) && Boolean(email) && password.length >= 6 && password === passwordConfirmation && !loading,
    [token, email, password, passwordConfirmation, loading]
  );

  const accents: CSSProperties & { ['--acc1']?: string; ['--acc2']?: string; ['--acc3']?: string } =
    { '--acc1': '59 130 246', '--acc2': '168 85 247', '--acc3': '45 212 191' };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          token,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(txt || `HTTP ${res.status}`);
      }

      router.replace('/login?reset=1');
    } catch (e) {
      setErr((e as Error).message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!token || !email) {
    return (
      <div className="min-h-[100dvh] grid place-items-center text-white" style={accents}>
        <PremiumBackground />
        <div className="relative z-10 w-full max-w-[560px] rounded-3xl border border-white/12 bg-white/[.035] backdrop-blur-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,.6)] p-6">
          <h1
            className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(135deg, rgb(var(--acc1)), rgb(var(--acc2)))' }}
          >
            Invalid link
          </h1>
          <p className="mt-2 text-white/80">
            The reset URL is missing or expired. Please request a new email and try again.
          </p>
          <a href="/forgot-password" className="mt-4 inline-block underline text-white">
            Request new link
          </a>
        </div>
      </div>
    );
  }

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
          <div className="relative px-6 pt-6 pb-4 border-b border-white/10">
            <h1
              className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, rgb(var(--acc1)), rgb(var(--acc2)))' }}
            >
              Set a new password
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Choose a strong password (at least 6 characters).
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
          <form onSubmit={submit} autoComplete="off" className="relative p-6 space-y-4">
            {/* honeypots */}
            <input
              type="text"
              name="fake-username"
              autoComplete="username"
              tabIndex={-1}
              aria-hidden="true"
              style={{ position: 'absolute', left: -9999, width: 0, height: 0, opacity: 0 }}
            />
            <input
              type="password"
              name="fake-password"
              autoComplete="new-password"
              tabIndex={-1}
              aria-hidden="true"
              style={{ position: 'absolute', left: -9999, width: 0, height: 0, opacity: 0 }}
            />

            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-white/65">
                Email
              </span>
              <input
                value={email}
                readOnly
                name="email"
                autoComplete="username"
                className="w-full rounded-xl border border-white/12 bg-white/[.06] px-3 py-2.5 text-white/90 outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-white/65">
                New password
              </span>
              <input
                type="password"
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-white/12 bg-white/[.06] px-3 py-2.5 text-white placeholder-white/50
                           outline-none focus:ring-2 focus:ring-white/30 focus:border-white/20 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required

                // disable managers
                name="new-password"
                autoComplete="new-password"
                readOnly
                onFocus={(e) => e.currentTarget.removeAttribute('readonly')}
                onMouseDown={(e) => {
                  const el = e.currentTarget;
                  if (el.hasAttribute('readonly')) {
                    el.removeAttribute('readonly');
                    requestAnimationFrame(() => el.focus());
                  }
                }}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                data-lpignore="true"
                data-1p-ignore
                data-bwignore="true"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-white/65">
                Confirm password
              </span>
              <input
                type="password"
                placeholder="Repeat the password"
                className="w-full rounded-xl border border-white/12 bg-white/[.06] px-3 py-2.5 text-white placeholder-white/50
                           outline-none focus:ring-2 focus:ring-white/30 focus:border-white/20 transition"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                minLength={6}
                required

                // disable managers
                name="confirm-password"
                autoComplete="new-password"
                readOnly
                onFocus={(e) => e.currentTarget.removeAttribute('readonly')}
                onMouseDown={(e) => {
                  const el = e.currentTarget;
                  if (el.hasAttribute('readonly')) {
                    el.removeAttribute('readonly');
                    requestAnimationFrame(() => el.focus());
                  }
                }}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                data-lpignore="true"
                data-1p-ignore
                data-bwignore="true"
              />
            </label>

            {err && (
              <div className="text-sm text-rose-300/95 border border-rose-300/30 bg-rose-500/10 rounded-lg px-3 py-2">
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-black
                         bg-[linear-gradient(135deg,rgb(var(--acc1)),rgb(var(--acc2)))]
                         shadow-[0_12px_28px_-12px_rgb(59_130_246_/_0.55),0_1px_0_rgba(255,255,255,.25)_inset]
                         transition-transform duration-200 hover:-translate-y-[2px] active:translate-y-0
                         disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading ? 'Saving…' : 'Save new password'}
            </button>

            <div className="pt-1 text-sm text-white/75">
              Back to <a href="/login" className="underline hover:text-white">Sign in</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
