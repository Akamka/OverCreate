'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState, useEffect, type CSSProperties } from 'react';
import PremiumBackground from '@/components/PremiumBackground';
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
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const accents: CSSProperties & { ['--acc1']?: string; ['--acc2']?: string; ['--acc3']?: string } =
    { '--acc1': '59 130 246', '--acc2': '168 85 247', '--acc3': '45 212 191' };

  const redirectTo = useMemo(() => search.get('redirect') || '/dashboard', [search]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

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

      setToken(json.token, remember);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('token', json.token);
        if (remember) localStorage.setItem('token', json.token);
      }

      const goTo = json.user.email_verified_at ? redirectTo : '/verify-email';
      try {
        await router.push(goTo);
        router.refresh();
      } catch {
        window.location.assign(goTo);
      }
    } catch (e) {
      const msg = (e as Error).message || '';
      setErr(/422|invalid|credentials/i.test(msg) ? 'Invalid email or password.' : 'Sign-in failed. Please try again.');
      console.error('[login]', e);
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = email.trim().length > 3 && password.length >= 1 && !loading;

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Enter' && canSubmit) {
        (document.getElementById('login-form') as HTMLFormElement | null)?.requestSubmit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canSubmit]);

  return (
    <div className="relative min-h-[100dvh] text-white" style={accents}>
      <PremiumBackground />

      <div className="relative z-10 flex items-center justify-center px-5 py-10">
        <div
          className={[
            'w-full max-w-[520px] rounded-3xl border border-white/12 bg-white/[.035] backdrop-blur-xl',
            'shadow-[0_10px_40px_-15px_rgba(0,0,0,.6)] overflow-hidden',
          ].join(' ')}
        >
          {/* header */}
          <div className="relative px-6 pt-6 pb-4 border-b border-white/10">
            <h1
              className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, rgb(var(--acc1)), rgb(var(--acc2)))' }}
            >
              Sign in
            </h1>
            <p className="mt-1 text-sm text-white/70">Welcome back! Please enter your details.</p>

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
          <form id="login-form" onSubmit={submit} className="relative p-6 space-y-4" autoComplete="off">
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-white/65">Email</span>
              <input
                className="w-full rounded-xl border border-white/12 bg-white/[.06] px-3 py-2.5 text-white placeholder-white/50
                           outline-none focus:ring-2 focus:ring-white/30 focus:border-white/20 transition
                           shadow-[inset_0_0_0_1px_rgba(255,255,255,.04)]"
                type="email"
                name="username"
                autoComplete="username"
                inputMode="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-white/65">Password</span>
              <div className="relative">
                <input
                  className="w-full rounded-xl border border-white/12 bg-white/[.06] px-3 py-2.5 pr-12 text-white placeholder-white/50
                             outline-none focus:ring-2 focus:ring-white/30 focus:border-white/20 transition"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}

                  // 👇 полностью глушим всплывашки менеджеров паролей
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
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs border border-white/10 bg-white/[.06] hover:bg-white/[.1] transition"
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 text-white/80">
                <input
                  type="checkbox"
                  className="size-4 rounded border-white/20 bg-white/10"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me (shared session across tabs)
              </label>

              <a
                href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}${
                  redirectTo ? `${email ? '&' : '?'}redirect=${encodeURIComponent(redirectTo)}` : ''
                }`}
                className="underline text-white/80 hover:text-white"
              >
                Forgot password?
              </a>
            </div>

            {err && (
              <div className="text-sm text-rose-300/95 border border-rose-300/30 bg-rose-500/10 rounded-lg px-3 py-2">
                {err}
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
              {loading ? 'Signing in…' : 'Sign in'}
            </button>

            <div className="pt-1 text-sm text-white/70">
              Don&apos;t have an account?{' '}
              <a href="/register" className="underline hover:text-white">
                Create one
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
