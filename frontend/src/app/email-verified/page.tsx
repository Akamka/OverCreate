'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type CSSProperties } from 'react';
import PremiumBackground from '@/components/PremiumBackground';


const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8080/api';
const ME_ENDPOINT = process.env.NEXT_PUBLIC_ME_ENDPOINT ?? '/me';


function getToken(): string {
  if (typeof window === 'undefined') return '';
  return (
    sessionStorage.getItem('token') ||
    localStorage.getItem('token') ||
    ''
  );
}

type MeResponse = {
  id: number;
  email_verified_at?: string | null;
};

export default function EmailVerifiedPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const redirectTo = sp.get('redirect') || '/dashboard';

  const [verified, setVerified] = useState<boolean | null>(null);

  const accents: CSSProperties & { ['--acc1']?: string; ['--acc2']?: string; ['--acc3']?: string } = {
    '--acc1': '59 130 246',
    '--acc2': '168 85 247',
    '--acc3': '45 212 191',
  };

  useEffect(() => {
    // Опционально: перепроверим статус — чтобы страница не показывалась “ложно-позитивно”
    const token = getToken();
    if (!token) {
      setVerified(null);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${API}${ME_ENDPOINT}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
          cache: 'no-store',
        });
        if (!res.ok) {
          setVerified(null);
          return;
        }
        const me = (await res.json()) as MeResponse;
        setVerified(Boolean(me.email_verified_at));
      } catch {
        setVerified(null);
      }
    })();
  }, []);

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
              Email verified
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Your email is confirmed. You can now access your dashboard and projects.
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

          <div className="relative p-6 space-y-4">
            {verified === false && (
              <div className="text-sm text-amber-200 border border-amber-300/30 bg-amber-500/10 rounded-lg px-3 py-2">
                We couldn’t confirm your verification yet. If you just clicked the link, wait a few seconds and try again.
              </div>
            )}

            <div className="flex items-center gap-3">
              <a
                href={redirectTo}
                className={[
                  'px-4 py-2 rounded-xl text-sm font-semibold text-black',
                  'bg-[linear-gradient(135deg,rgb(var(--acc1)),rgb(var(--acc2)))]',
                  'shadow-[0_12px_28px_-12px_rgb(59_130_246_/_0.55),0_1px_0_rgba(255,255,255,.25)_inset]',
                  'transition-transform duration-200 hover:-translate-y-[2px] active:translate-y-0',
                ].join(' ')}
              >
                Go to dashboard
              </a>

              <button
                onClick={() => router.replace('/verify-email')}
                className={[
                  'px-4 py-2 rounded-xl text-sm text-white/90',
                  'border border-white/12 bg-white/[.06] backdrop-blur',
                  'shadow-[0_8px_24px_-16px_rgba(0,0,0,.6)]',
                  'transition-transform duration-200 hover:-translate-y-[2px] active:translate-y-0',
                ].join(' ')}
              >
                Didn’t receive an email?
              </button>
            </div>

            <div className="pt-1 text-sm text-white/75">
              Tip: if you don’t see the email, check the spam folder or try resending from the previous page.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
