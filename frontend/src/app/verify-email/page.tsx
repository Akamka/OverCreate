'use client';

import { Suspense, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PremiumBackground from '@/components/PremiumBackground';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8080/api';
const ME_ENDPOINT = process.env.NEXT_PUBLIC_ME_ENDPOINT ?? '/me';

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem('token') || localStorage.getItem('token') || '';
}

type MeResponse = {
  id: number;
  name?: string | null;
  email?: string | null;
  email_verified_at?: string | null;
};

/** Внутренний клиентский компонент: тут используем useSearchParams */
function VerifyEmailInner() {
  const router = useRouter();
  const sp = useSearchParams();

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirectTo = useMemo(() => sp.get('redirect') || '/dashboard', [sp]);

  const accents: CSSProperties & { ['--acc1']?: string; ['--acc2']?: string; ['--acc3']?: string } = {
    '--acc1': '59 130 246',
    '--acc2': '168 85 247',
    '--acc3': '45 212 191',
  };

  const [autoPoll, setAutoPoll] = useState(true);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchMe(): Promise<MeResponse | null> {
    const token = getToken();
    if (!token) return null;
    try {
      const res = await fetch(`${API}${ME_ENDPOINT}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        cache: 'no-store',
      });
      if (!res.ok) return null;
      return (await res.json()) as MeResponse;
    } catch {
      return null;
    }
  }

  async function checkAndContinue() {
    setErr(null);
    const token = getToken();
    if (!token) {
      router.replace('/login?redirect=/verify-email');
      return;
    }
    const me = await fetchMe();
    if (me?.email_verified_at) {
      router.replace('/email-verified');
      return;
    }
    setErr('Email is not verified yet. Please click the link from the email and try again.');
  }

  async function resend() {
    setMsg(null);
    setErr(null);

    const token = getToken();
    if (!token) {
      router.replace('/login?redirect=/verify-email');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/email/verification-notification`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (res.ok) {
        setMsg('Verification email sent. Please check your inbox.');
      } else if (res.status === 429) {
        setErr('Too many requests. Please try again in a minute.');
      } else if (res.status === 401) {
        setErr('Session expired. Please sign in again.');
        router.replace('/login?redirect=/verify-email');
      } else {
        let detail = '';
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const j = await res.json().catch(() => null);
          detail = j?.message ? ` ${j.message}` : '';
        }
        setErr(`Failed to send email.${detail}`);
      }
    } catch (e) {
      setErr('Network error. Please try again.');
      console.error('[verify-email resend]', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!autoPoll) return;
    checkAndContinue(); // быстрый старт
    pollTimer.current = setInterval(checkAndContinue, 6000);
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
      pollTimer.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPoll]);

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
              Verify your email
            </h1>
            <p className="mt-1 text-sm text-white/70">
              We’ve sent a confirmation email. Click the link inside to verify your address.
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

          {/* content */}
          <div className="relative p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={resend}
                disabled={loading}
                className={[
                  'px-4 py-2 rounded-xl text-sm font-semibold text-black',
                  'bg-[linear-gradient(135deg,rgb(var(--acc1)),rgb(var(--acc2)))]',
                  'shadow-[0_12px_28px_-12px_rgb(59_130_246_/_0.55),0_1px_0_rgba(255,255,255,.25)_inset]',
                  'transition-transform duration-200 hover:-translate-y-[2px] active:translate-y-0',
                  'disabled:opacity-60 disabled:hover:translate-y-0',
                ].join(' ')}
              >
                {loading ? 'Sending…' : 'Resend email'}
              </button>

              <button
                onClick={checkAndContinue}
                className={[
                  'px-4 py-2 rounded-xl text-sm text-white/90',
                  'border border-white/12 bg-white/[.06] backdrop-blur',
                  'shadow-[0_8px_24px_-16px_rgba(0,0,0,.6)]',
                  'transition-transform duration-200 hover:-translate-y-[2px] active:translate-y-0',
                ].join(' ')}
              >
                I’ve verified, continue
              </button>

              <label className="ml-auto inline-flex items-center gap-2 text-xs text-white/70">
                <input
                  type="checkbox"
                  className="size-4 rounded border-white/20 bg-white/10"
                  checked={autoPoll}
                  onChange={(e) => setAutoPoll(e.target.checked)}
                />
                Auto-check every 6s
              </label>
            </div>

            {msg && (
              <div className="text-sm text-emerald-300/95 border border-emerald-300/30 bg-emerald-500/10 rounded-lg px-3 py-2">
                {msg}
              </div>
            )}
            {err && (
              <div className="text-sm text-rose-300/95 border border-rose-300/30 bg-rose-500/10 rounded-lg px-3 py-2">
                {err}
              </div>
            )}

            <div className="pt-1 text-sm text-white/75">
              Open your inbox, then click the verification link. After that, this page will
              automatically take you to the confirmation screen.
            </div>

            <div className="pt-1 text-sm text-white/60">
              If you already have access and don’t need verification anymore, you can go to{' '}
              <a href={redirectTo} className="underline hover:text-white">
                the dashboard
              </a>{' '}
              directly.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Страница: оборачиваем клиентский компонент в Suspense */
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailInner />
    </Suspense>
  );
}
