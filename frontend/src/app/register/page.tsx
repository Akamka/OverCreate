'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo, useEffect, type CSSProperties } from 'react';
import PremiumBackground from '@/components/PremiumBackground';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080/api';

type RegisterResponse = {
  token: string;
  user: { id: number; name: string; email: string; email_verified_at?: string | null };
  mustVerify?: boolean;
};

export const metadata = {
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: undefined as unknown as undefined },
};

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [showPwd1, setShowPwd1] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accents: CSSProperties & { ['--acc1']?: string; ['--acc2']?: string; ['--acc3']?: string } =
    {
      '--acc1': '59 130 246',
      '--acc2': '168 85 247',
      '--acc3': '45 212 191',
    };

  const passwordsMatch = useMemo(
    () => form.password.length >= 6 && form.password === form.password_confirmation,
    [form.password, form.password_confirmation]
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
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

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', json.token);
        sessionStorage.setItem('token', json.token);
      }

      const needsVerify = json.mustVerify === true || json.user?.email_verified_at == null;
      router.replace(needsVerify ? '/verify-email' : '/dashboard');
    } catch (err) {
      const msg = (err as Error).message || '';
      setError(/email.*(taken|exists|unique)/i.test(msg) ? 'This email is already taken.' : 'Registration failed. Please try again.');
      console.error('[register]', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Enter') {
        const formEl = document.getElementById('register-form') as HTMLFormElement | null;
        formEl?.requestSubmit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const canSubmit =
    form.name.trim().length > 1 &&
    /\S+@\S+\.\S+/.test(form.email) &&
    passwordsMatch &&
    !loading;

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
              Create account
            </h1>
            <p className="mt-1 text-sm text-white/70">Join OverCreate to track your projects.</p>

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
          <form id="register-form" onSubmit={submit} className="relative p-6 space-y-4" autoComplete="off">
            {/* honeypots to trap autofill */}
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
                Name
              </span>
              <input
                className="w-full rounded-xl border border-white/12 bg-white/[.06] px-3 py-2.5 text-white placeholder-white/50
                           outline-none focus:ring-2 focus:ring-white/30 focus:border-white/20 transition"
                placeholder="John Doe"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                name="name"
                autoComplete="name"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-white/65">
                Email
              </span>
              <input
                className="w-full rounded-xl border border-white/12 bg-white/[.06] px-3 py-2.5 text-white placeholder-white/50
                           outline-none focus:ring-2 focus:ring-white/30 focus:border-white/20 transition"
                type="email"
                placeholder="you@example.com"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                name="email"
                autoComplete="email username"
                inputMode="email"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-white/65">
                Password
              </span>
              <div className="relative">
                <input
                  className="w-full rounded-xl border border-white/12 bg-white/[.06] px-3 py-2.5 pr-12 text-white placeholder-white/50
                             outline-none focus:ring-2 focus:ring-white/30 focus:border-white/20 transition"
                  type={showPwd1 ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}

                  // disable password managers
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
                <button
                  type="button"
                  onClick={() => setShowPwd1((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs border border-white/10 bg-white/[.06] hover:bg-white/[.1] transition"
                  aria-label={showPwd1 ? 'Hide password' : 'Show password'}
                >
                  {showPwd1 ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-white/65">
                Confirm password
              </span>
              <div className="relative">
                <input
                  className="w-full rounded-xl border border-white/12 bg-white/[.06] px-3 py-2.5 pr-12 text-white placeholder-white/50
                             outline-none focus:ring-2 focus:ring-white/30 focus:border-white/20 transition"
                  type={showPwd2 ? 'text' : 'password'}
                  placeholder="Repeat the password"
                  required
                  minLength={6}
                  value={form.password_confirmation}
                  onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}

                  // disable password managers
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
                <button
                  type="button"
                  onClick={() => setShowPwd2((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs border border-white/10 bg-white/[.06] hover:bg-white/[.1] transition"
                  aria-label={showPwd2 ? 'Hide password' : 'Show password'}
                >
                  {showPwd2 ? 'Hide' : 'Show'}
                </button>
              </div>
              {form.password_confirmation && !passwordsMatch && (
                <div className="mt-1 text-xs text-rose-300/95">
                  Passwords must match and be at least 6 characters long.
                </div>
              )}
            </label>

            {error && (
              <div className="text-sm text-rose-300/95 border border-rose-300/30 bg-rose-500/10 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

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
              {loading ? 'Creating…' : 'Create account'}
            </button>

            <div className="pt-1 text-sm text-white/70">
              Already have an account?{' '}
              <a href="/login" className="underline hover:text-white">
                Sign in
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
